"""
Launch Patchright (anti-detect) Chromium with a separate remote-debugging-port.
Then Chrome DevTools MCP can connect to the same browser.

Usage: python browse_with_cdp.py [url]
"""

import sys
import subprocess
import time
import json
import urllib.request

URL = sys.argv[1] if len(sys.argv) > 1 else "https://jabko.ua/"
CDP_PORT = 9222

# Find Patchright's bundled Chromium
from patchright._impl._driver import compute_driver_executable
driver_exec = compute_driver_executable()
# Patchright stores browsers alongside the driver
import pathlib
driver_dir = pathlib.Path(driver_exec).parent
# Try common locations for the patchright chromium
import glob

possible = glob.glob(str(driver_dir / ".." / "driver" / "package" / ".local-browsers" / "chromium-*" / "chrome-win" / "chrome.exe"))
if not possible:
    possible = glob.glob(str(driver_dir / ".." / ".local-browsers" / "chromium-*" / "chrome-win" / "chrome.exe"))
if not possible:
    # Search in patchright package location
    import patchright
    pr_dir = pathlib.Path(patchright.__file__).parent
    possible = glob.glob(str(pr_dir / "driver" / "package" / ".local-browsers" / "chromium-*" / "chrome-win" / "chrome.exe"))

if possible:
    chrome_path = possible[0]
    print(f"Found Patchright Chromium: {chrome_path}")
else:
    print("Could not find Patchright's bundled Chromium. Searching more broadly...")
    import os
    for root, dirs, files in os.walk(str(pathlib.Path(driver_exec).parent.parent)):
        if "chrome.exe" in files and "chromium" in root.lower():
            chrome_path = os.path.join(root, "chrome.exe")
            print(f"Found: {chrome_path}")
            break
    else:
        print("ERROR: Cannot find Patchright chromium binary.")
        print(f"Driver dir: {driver_dir}")
        sys.exit(1)

# Launch Chromium directly with remote debugging
args = [
    chrome_path,
    f"--remote-debugging-port={CDP_PORT}",
    "--window-size=1400,900",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    URL,
]

print(f"\nLaunching Chromium with CDP on port {CDP_PORT}...")
proc = subprocess.Popen(args)

# Wait for CDP to be ready
for i in range(30):
    time.sleep(1)
    try:
        resp = urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version")
        data = json.loads(resp.read())
        print(f"\nCDP ready!")
        print(f"  Browser: {data.get('Browser', 'unknown')}")
        print(f"  WebSocket: {data.get('webSocketDebuggerUrl', 'N/A')}")
        print(f"\n  Chrome DevTools MCP can now connect to port {CDP_PORT}")
        print(f"  Press Enter to close the browser...")
        break
    except Exception:
        if i % 5 == 4:
            print(f"  Waiting for CDP... ({i+1}s)")
else:
    print("ERROR: CDP did not start in 30s")
    proc.kill()
    sys.exit(1)

input()
proc.kill()
