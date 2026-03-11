
# Required packages:
# pip install aiohttp watchdog
# Usage:
# python server.py
#   Starts a live-reload web server serving the current directory at http://127.0.0.1:8000
#
# python server.py --host 0.0.0.0 --port 8000
#   S
import os
import asyncio
import argparse
from aiohttp import web, WSMsgType
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

ROOT = os.getcwd()
clients = set()

RELOAD_JS = """
<script>
(function(){
  if (window.__LIVE_SERVER__) return;
  window.__LIVE_SERVER__ = true;
  const ws = new WebSocket(`ws://${location.host}/__ws`);
  ws.onmessage = () => location.reload();
})();
</script>
"""

# -------- File watcher --------
class Watcher(FileSystemEventHandler):
    def on_any_event(self, event):
        asyncio.run(send_reload())

async def send_reload():
    for ws in list(clients):
        await ws.send_str("reload")

# -------- WebSocket --------
async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    clients.add(ws)

    async for msg in ws:
        if msg.type == WSMsgType.ERROR:
            break

    clients.discard(ws)
    return ws

# -------- HTTP handler --------
async def file_handler(request):
    path = request.match_info.get("path", "")
    file_path = os.path.join(ROOT, path)

    if os.path.isdir(file_path):
        file_path = os.path.join(file_path, "index.html")

    if not os.path.exists(file_path):
        return web.Response(status=404)

    if file_path.endswith(".html"):
        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()

        if "__LIVE_SERVER__" not in html:
            html = html.replace("</body>", RELOAD_JS + "\n</body>")

        return web.Response(text=html, content_type="text/html")

    return web.FileResponse(file_path)

# -------- Main --------
parser = argparse.ArgumentParser(description="Simple Live Server")
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=8000)
args = parser.parse_args()

app = web.Application()
app.router.add_get("/__ws", websocket_handler)
app.router.add_get("/{path:.*}", file_handler)

observer = Observer()
observer.schedule(Watcher(), ROOT, recursive=True)
observer.start()

print(f"Live server running at http://{args.host}:{args.port}")
web.run_app(app, host=args.host, port=args.port)
