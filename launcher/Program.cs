using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

var root = FindSiteRoot();
ClosePreviousLauncherInstances();

const int DefaultLauncherPort = 9527;
var requestedPort = GetPortArg(args) ?? DefaultLauncherPort;
var port = FindFreePort(requestedPort);
var url = $"http://127.0.0.1:{port}/";
var launchUrl = $"{url}?launcher=1&t={DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(url);
builder.Logging.ClearProviders();

var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
    context.Response.Headers["Cache-Control"] = "no-store";

    if (HttpMethods.IsOptions(context.Request.Method))
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    await next();
});

app.MapPost("/api/save-avatar", async context =>
{
    try
    {
        using var doc = await JsonDocument.ParseAsync(context.Request.Body);
        if (!doc.RootElement.TryGetProperty("image", out var imageElement) || imageElement.ValueKind != JsonValueKind.String)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Missing image data");
            return;
        }

        var image = imageElement.GetString() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(image))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Missing image data");
            return;
        }

        var base64 = image;
        var prefixIndex = image.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
        if (prefixIndex >= 0)
        {
            base64 = image[(prefixIndex + "base64,".Length)..];
        }

        var avatarPath = Path.Combine(root, "assets", "avatar.png");
        Directory.CreateDirectory(Path.GetDirectoryName(avatarPath)!);
        await File.WriteAllBytesAsync(avatarPath, Convert.FromBase64String(base64));

        context.Response.ContentType = "text/plain; charset=utf-8";
        await context.Response.WriteAsync("OK");
    }
    catch
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "text/plain; charset=utf-8";
        await context.Response.WriteAsync("Failed to save avatar");
    }
});

app.MapMethods("/{**path}", new[] { HttpMethods.Get, HttpMethods.Head }, async context =>
{
    var relativePath = context.Request.Path.Value ?? "/";
    relativePath = Uri.UnescapeDataString(relativePath);
    if (relativePath == "/")
    {
        relativePath = "/index.html";
    }

    var filePath = Path.GetFullPath(Path.Combine(root, "." + relativePath));
    if (!IsInsideRoot(root, filePath))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsync("Forbidden");
        return;
    }

    if (!File.Exists(filePath))
    {
        var notFoundPath = Path.Combine(root, "404.html");
        if (File.Exists(notFoundPath))
        {
            await ServeFile(context, notFoundPath, StatusCodes.Status404NotFound);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("Not found");
        return;
    }

    await ServeFile(context, filePath, StatusCodes.Status200OK);
});

await app.StartAsync();
OpenBrowser(launchUrl);
Console.WriteLine($"Sakura_Love is running at {launchUrl}");
await app.WaitForShutdownAsync();

static int? GetPortArg(string[] args)
{
    for (var i = 0; i < args.Length - 1; i++)
    {
        if (args[i].Equals("--port", StringComparison.OrdinalIgnoreCase) && int.TryParse(args[i + 1], out var port))
        {
            return port;
        }
    }

    return null;
}

static string FindSiteRoot()
{
    var projectRootNearLauncher = GetProjectRootNearLauncher();
    var candidates = new[]
    {
        projectRootNearLauncher,
        GetExecutableDirectory(),
        AppContext.BaseDirectory,
        Directory.GetCurrentDirectory()
    }.Where(path => !string.IsNullOrWhiteSpace(path))
     .Distinct(StringComparer.OrdinalIgnoreCase);

    foreach (var startDirectory in candidates)
    {
        var current = new DirectoryInfo(startDirectory);
        for (var depth = 0; depth < 10 && current is not null; depth++, current = current.Parent)
        {
            if (HasSiteFiles(current.FullName))
            {
                return current.FullName;
            }
        }
    }

    foreach (var startDirectory in candidates)
    {
        var current = new DirectoryInfo(startDirectory);
        for (var depth = 0; depth < 10 && current is not null; depth++, current = current.Parent)
        {
            if (File.Exists(Path.Combine(current.FullName, "index.html")))
            {
                return current.FullName;
            }
        }
    }

    return AppContext.BaseDirectory;
}

static string? GetProjectRootNearLauncher()
{
    var executableDirectory = new DirectoryInfo(GetExecutableDirectory());
    if (!executableDirectory.Name.Equals("publish", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    var launcherDirectory = executableDirectory.Parent;
    var projectDirectory = launcherDirectory?.Parent;
    if (launcherDirectory is null
        || projectDirectory is null
        || !launcherDirectory.Name.Equals("launcher", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    return HasSiteFiles(projectDirectory.FullName) ? projectDirectory.FullName : null;
}

static string GetExecutableDirectory()
{
    var processPath = Environment.ProcessPath;
    return string.IsNullOrWhiteSpace(processPath)
        ? AppContext.BaseDirectory
        : Path.GetDirectoryName(processPath) ?? AppContext.BaseDirectory;
}

static bool HasSiteFiles(string directory)
{
    return File.Exists(Path.Combine(directory, "index.html"))
        && File.Exists(Path.Combine(directory, "styles.css"))
        && File.Exists(Path.Combine(directory, "script.js"));
}

static void ClosePreviousLauncherInstances()
{
    var currentProcess = Process.GetCurrentProcess();
    var currentId = currentProcess.Id;
    var currentName = currentProcess.ProcessName;
    var currentPath = Environment.ProcessPath;

    foreach (var process in Process.GetProcessesByName(currentName))
    {
        if (process.Id == currentId)
        {
            continue;
        }

        try
        {
            var otherPath = process.MainModule?.FileName;
            if (!string.IsNullOrWhiteSpace(currentPath)
                && !string.IsNullOrWhiteSpace(otherPath)
                && string.Equals(Path.GetFullPath(otherPath), Path.GetFullPath(currentPath), StringComparison.OrdinalIgnoreCase))
            {
                process.Kill(entireProcessTree: true);
                process.WaitForExit(3000);
            }
        }
        catch
        {
            // Ignore processes we cannot inspect or stop.
        }
    }
}

static int FindFreePort(int preferredPort)
{
    for (var port = preferredPort; port < preferredPort + 100; port++)
    {
        if (IsPortFree(port))
        {
            return port;
        }
    }

    return 0;
}

static bool IsPortFree(int port)
{
    try
    {
        var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        listener.Stop();
        return true;
    }
    catch
    {
        return false;
    }
}

static bool IsInsideRoot(string root, string filePath)
{
    var normalizedRoot = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
    var normalizedPath = Path.GetFullPath(filePath);
    return normalizedPath.Equals(normalizedRoot, StringComparison.OrdinalIgnoreCase)
        || normalizedPath.StartsWith(normalizedRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
}

static async Task ServeFile(HttpContext context, string filePath, int statusCode)
{
    var fileInfo = new FileInfo(filePath);
    var contentType = GetContentType(filePath);
    var isAudio = contentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase);
    var rangeHeader = isAudio ? context.Request.Headers.Range.ToString() : string.Empty;

    context.Response.Headers["Accept-Ranges"] = isAudio ? "bytes" : "none";
    context.Response.ContentType = contentType;

    if (isAudio && TryParseRange(rangeHeader, fileInfo.Length, out var start, out var end))
    {
        context.Response.StatusCode = StatusCodes.Status206PartialContent;
        context.Response.ContentLength = end - start + 1;
        context.Response.Headers["Content-Range"] = $"bytes {start}-{end}/{fileInfo.Length}";

        await using var stream = File.OpenRead(filePath);
        stream.Seek(start, SeekOrigin.Begin);
        await CopyRangeAsync(stream, context.Response.Body, end - start + 1);
        return;
    }

    context.Response.StatusCode = statusCode;
    context.Response.ContentLength = fileInfo.Length;
    if (HttpMethods.IsHead(context.Request.Method))
    {
        return;
    }

    await using var fileStream = File.OpenRead(filePath);
    await fileStream.CopyToAsync(context.Response.Body);
}

static bool TryParseRange(string rangeHeader, long fileLength, out long start, out long end)
{
    start = 0;
    end = fileLength - 1;

    if (string.IsNullOrWhiteSpace(rangeHeader) || !rangeHeader.StartsWith("bytes=", StringComparison.OrdinalIgnoreCase))
    {
        return false;
    }

    var range = rangeHeader["bytes=".Length..];
    var parts = range.Split('-', 2);
    if (parts.Length != 2)
    {
        return false;
    }

    if (!string.IsNullOrWhiteSpace(parts[0]) && long.TryParse(parts[0], out var parsedStart))
    {
        start = parsedStart;
    }

    if (!string.IsNullOrWhiteSpace(parts[1]) && long.TryParse(parts[1], out var parsedEnd))
    {
        end = parsedEnd;
    }

    if (start < 0 || end < start || start >= fileLength)
    {
        return false;
    }

    if (end >= fileLength)
    {
        end = fileLength - 1;
    }

    return true;
}

static async Task CopyRangeAsync(Stream source, Stream destination, long bytesToCopy)
{
    var buffer = new byte[64 * 1024];
    var remaining = bytesToCopy;

    while (remaining > 0)
    {
        var read = await source.ReadAsync(buffer.AsMemory(0, (int)Math.Min(buffer.Length, remaining)));
        if (read <= 0)
        {
            break;
        }

        await destination.WriteAsync(buffer.AsMemory(0, read));
        remaining -= read;
    }
}

static string GetContentType(string filePath) => Path.GetExtension(filePath).ToLowerInvariant() switch
{
    ".html" => "text/html; charset=utf-8",
    ".css" => "text/css; charset=utf-8",
    ".js" => "application/javascript; charset=utf-8",
    ".json" => "application/json; charset=utf-8",
    ".png" => "image/png",
    ".jpg" => "image/jpeg",
    ".jpeg" => "image/jpeg",
    ".gif" => "image/gif",
    ".svg" => "image/svg+xml",
    ".ico" => "image/x-icon",
    ".mp3" => "audio/mpeg",
    ".wav" => "audio/wav",
    ".moc3" => "application/octet-stream",
    ".zip" => "application/zip",
    _ => "application/octet-stream"
};

static void OpenBrowser(string url)
{
    try
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
    }
    catch
    {
        // Ignore browser launch failures; the user can still copy the URL.
    }
}
