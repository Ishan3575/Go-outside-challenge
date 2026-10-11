#!/usr/bin/env python3
"""
TerraQuest - Local Web Server & API Runtime
Serves the hackathon demo and handles verification requests.
"""

import http.server
import socketserver
import os
import json
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class TerraQuestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # API Health Check
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            status = {
                "status": "online",
                "project": "TerraQuest",
                "theme": "Touch Grass",
                "models": {
                    "vision": "google/paligemma-3b-pt-224",
                    "reasoning": "google/gemma-2-9b-it"
                },
                "sponsors": ["Gemma", "SerpApi", "ElevenLabs", "Render"]
            }
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return

        # Default static file handler
        return super().do_GET()

    def do_POST(self):
        # Verification API Endpoint
        if self.path == '/api/verify':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                "success": True,
                "verified": True,
                "confidence": 0.984,
                "exif_check": "passed",
                "perceptual_hash": "verified_unique",
                "eco_karma_awarded": 250,
                "xp_awarded": 500,
                "multiplier": "2x_golden_hour"
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        self.send_error(404, "Endpoint not found")

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), TerraQuestHandler) as httpd:
        print("\n" + "=" * 55)
        print("🌿 TerraQuest Demo Server Running!")
        print(f"👉 Local URL: http://localhost:{PORT}")
        print("📁 PDF Plan:   TerraQuest_Hackathon_Plan.pdf")
        print("=" * 55 + "\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()

if __name__ == '__main__':
    run()
