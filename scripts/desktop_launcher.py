"""
Argus Franchise Operating System - Native Desktop Launcher
Starts the embedded Node.js standalone server and wraps it in a native Windows WebView2 window.
"""

import os
import sys
import time
import zipfile
import shutil
import subprocess
import urllib.request
import atexit
import webview

SPLASH_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Argus Franchise Operating System</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #293033;
            color: #FFFFFF;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            user-select: none;
            overflow: hidden;
        }
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 40px;
            max-width: 480px;
        }
        .badge {
            background-color: #FF6600;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            padding: 5px 14px;
            border-radius: 9999px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 18px;
            box-shadow: 0 2px 8px rgba(255, 102, 0, 0.4);
        }
        .title {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #FFFFFF;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 13px;
            color: #94A3B8;
            margin-bottom: 28px;
        }
        .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(255, 102, 0, 0.2);
            border-top: 3px solid #FF6600;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 18px;
        }
        .status {
            font-size: 12px;
            color: #CBD5E1;
            font-weight: 500;
            min-height: 18px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">Argus CNC Systems</span>
        <h1 class="title">Franchise Operating System</h1>
        <p class="subtitle">Industrial Sales, Quotations, Invoicing & Operations</p>
        <div class="spinner"></div>
        <div class="status" id="status-text">Starting server and connecting to cloud database...</div>
    </div>
    <script>
        var attempts = 0;
        function checkServer() {
            attempts++;
            fetch('http://localhost:3000', { mode: 'no-cors' })
                .then(function() {
                    document.getElementById('status-text').innerText = 'Ready! Opening Portal...';
                    setTimeout(function() {
                        window.location.replace('http://localhost:3000');
                    }, 300);
                })
                .catch(function() {
                    if (attempts > 60) {
                        document.getElementById('status-text').innerText = 'Taking longer than expected... please check internet connection.';
                    }
                    setTimeout(checkServer, 500);
                });
        }
        setTimeout(checkServer, 1000);
    </script>
</body>
</html>"""

node_process = None

def get_bundle_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cleanup_server():
    global node_process
    if node_process:
        try:
            node_process.terminate()
            node_process.wait(timeout=3)
        except Exception:
            try:
                node_process.kill()
            except Exception:
                pass
        node_process = None

atexit.register(cleanup_server)

def setup_app_environment():
    bundle_dir = get_bundle_dir()
    local_app_data = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
    target_dir = os.path.join(local_app_data, 'ArgusFranchiseOS')
    os.makedirs(target_dir, exist_ok=True)

    # 1. Locate node.exe
    node_exe = os.path.join(bundle_dir, 'node.exe')
    if not os.path.exists(node_exe):
        node_exe = os.path.join(bundle_dir, 'dist_build', 'node.exe')
    if not os.path.exists(node_exe):
        # Fallback to system node
        node_exe = shutil.which('node') or 'node'
    else:
        target_node = os.path.join(target_dir, 'node.exe')
        if not os.path.exists(target_node) or os.path.getsize(target_node) != os.path.getsize(node_exe):
            shutil.copy2(node_exe, target_node)
        node_exe = target_node

    # 2. Extract app_bundle.zip if not already extracted or if updated
    zip_path = os.path.join(bundle_dir, 'app_bundle.zip')
    if not os.path.exists(zip_path):
        zip_path = os.path.join(bundle_dir, 'dist_build', 'app_bundle.zip')
    
    server_js = os.path.join(target_dir, 'server.js')
    
    if os.path.exists(zip_path):
        zip_mtime = os.path.getmtime(zip_path)
        marker_file = os.path.join(target_dir, '.bundle_version')
        should_extract = True
        
        if os.path.exists(marker_file) and os.path.exists(server_js):
            try:
                with open(marker_file, 'r') as f:
                    if f.read().strip() == str(zip_mtime):
                        should_extract = False
            except Exception:
                should_extract = True
        
        if should_extract:
            print("Extracting application bundle...")
            with zipfile.ZipFile(zip_path, 'r') as z:
                z.extractall(target_dir)
            with open(marker_file, 'w') as f:
                f.write(str(zip_mtime))
    elif not os.path.exists(server_js):
        # If running from source directory in dev
        src_standalone = os.path.join(bundle_dir, '.next', 'standalone')
        if os.path.exists(src_standalone):
            target_dir = src_standalone

    return node_exe, target_dir

def start_node_server(node_exe, target_dir):
    global node_process
    server_script = os.path.join(target_dir, 'server.js')
    
    env = os.environ.copy()
    env['PORT'] = '3000'
    env['HOSTNAME'] = '0.0.0.0'
    env['NODE_ENV'] = 'production'
    # Environment variables (MONGODB_URI, GOOGLE_CLIENT_ID, etc.) are loaded directly
    # from the unpacked .env.local and .env files inside target_dir by Next.js.

    creationflags = 0
    if sys.platform == 'win32':
        creationflags = 0x08000000  # CREATE_NO_WINDOW: eliminates console popup

    node_process = subprocess.Popen(
        [node_exe, server_script],
        cwd=target_dir,
        env=env,
        creationflags=creationflags,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    print("Node server launched.")

def main():
    node_exe, target_dir = setup_app_environment()
    start_node_server(node_exe, target_dir)

    bundle_dir = get_bundle_dir()
    icon_path = os.path.join(bundle_dir, 'favicon.ico')
    if not os.path.exists(icon_path):
        icon_path = os.path.join(bundle_dir, 'public', 'favicon.ico')
    if not os.path.exists(icon_path):
        icon_path = None

    window = webview.create_window(
        title='Argus Franchise Operating System',
        html=SPLASH_HTML,
        width=1366,
        height=860,
        min_size=(1024, 700),
    )

    try:
        # Keep authentication and app navigation inside the desktop window
        webview.settings['OPEN_EXTERNAL_LINKS_IN_BROWSER'] = False
        webview.start(gui='edgechromium', debug=False)
    finally:
        cleanup_server()

if __name__ == '__main__':
    main()
