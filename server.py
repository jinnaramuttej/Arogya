import http.server
import socketserver
import webbrowser
import os

# Ensure we are in the correct directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting local server at http://localhost:{PORT}")
print("Minimize this window, but DO NOT CLOSE IT.")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Open browser automatically
        webbrowser.open(f"http://localhost:{PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error: {e}")
    input("Press Enter to exit...")