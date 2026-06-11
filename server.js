const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = __dirname;
const portArgIndex = process.argv.indexOf("--port");
const port = Number(process.env.PORT || (portArgIndex > -1 && process.argv[portArgIndex + 1]) || 8000);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".webp": "image/webp",
  ".moc3": "application/octet-stream",
  ".zip": "application/zip"
};

const sendText = (res, status, text) => {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(text);
};

const isInsideRoot = (filePath) => {
  const normalizedRoot = path.resolve(root).toLowerCase();
  const normalizedPath = path.resolve(filePath).toLowerCase();
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(normalizedRoot + path.sep);
};

const serveFile = (req, res, filePath, statusCode = 200) => {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      const notFoundPath = path.join(root, "404.html");
      if (path.resolve(filePath) === path.resolve(notFoundPath)) {
        sendText(res, 404, "Not found");
        return;
      }
      serveFile(req, res, notFoundPath, 404);
      return;
    }

    if (stats.isDirectory()) {
      serveFile(req, res, path.join(filePath, "index.html"));
      return;
    }

    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    const isAudio = contentType.startsWith("audio/");
    const range = isAudio ? req.headers.range : null;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416, {
          "Content-Range": `bytes */${stats.size}`,
          "Access-Control-Allow-Origin": "*"
        });
        res.end();
        return;
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stats.size - 1;
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stats.size) {
        res.writeHead(416, {
          "Content-Range": `bytes */${stats.size}`,
          "Access-Control-Allow-Origin": "*"
        });
        res.end();
        return;
      }

      const safeEnd = Math.min(end, stats.size - 1);
      res.writeHead(206, {
        "Content-Type": contentType,
        "Content-Length": safeEnd - start + 1,
        "Content-Range": `bytes ${start}-${safeEnd}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      });
      fs.createReadStream(filePath, { start, end: safeEnd }).pipe(res);
      return;
    }

    res.writeHead(statusCode, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Accept-Ranges": isAudio ? "bytes" : "none",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    fs.createReadStream(filePath).pipe(res);
  });
};

const parseBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

// ─── HTTP Server ───
const server = http.createServer(async (req, res) => {
  let pathname;
  let requestUrl;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host || host}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch (error) {
    sendText(res, 400, "Bad request");
    return;
  }

  // API: save avatar
  if (req.method === "POST" && pathname === "/api/save-avatar") {
    try {
      const body = await parseBody(req);
      const { image } = JSON.parse(body.toString("utf-8"));
      if (!image || typeof image !== "string") { sendText(res, 400, "Missing image data"); return; }
      const base64 = image.replace(/^data:image\/\w+;base64,/, "");
      const avatarPath = path.join(root, "assets", "avatar.png");
      fs.mkdirSync(path.dirname(avatarPath), { recursive: true });
      fs.writeFileSync(avatarPath, Buffer.from(base64, "base64"));
      sendText(res, 200, "OK");
    } catch (err) {
      console.error("Save avatar error:", err);
      sendText(res, 500, "Failed to save avatar");
    }
    return;
  }

  const filePath = path.resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
  if (!isInsideRoot(filePath)) { sendText(res, 403, "Forbidden"); return; }
  serveFile(req, res, filePath);
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}/`;
  console.log(`Sakura_Love is running at ${url}`);

  if (process.argv.includes("--open")) {
    const opener = process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
    spawn(opener[0], opener[1], { detached: true, stdio: "ignore", windowsHide: true }).unref();
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: node server.js --port 8080`);
    process.exit(1);
  }
  throw error;
});
