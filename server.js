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

const serveFile = (res, filePath) => {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      sendText(res, 404, "Not found");
      return;
    }

    if (stats.isDirectory()) {
      serveFile(res, path.join(filePath, "index.html"));
      return;
    }

    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    fs.createReadStream(filePath).pipe(res);
  });
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || host}`).pathname);
  } catch (error) {
    sendText(res, 400, "Bad request");
    return;
  }

  const filePath = path.resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
  if (!isInsideRoot(filePath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  serveFile(res, filePath);
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
