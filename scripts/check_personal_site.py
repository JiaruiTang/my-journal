"""Read-only deployment guard: the personal website root must remain unpublished."""
import sys
import urllib.error
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, file, code, message, headers, new_url):
        return None


url = "https://jiaruitang.github.io/"
request = urllib.request.Request(url, headers={
    "User-Agent": "My-Journal-root-visibility-check",
    "Cache-Control": "no-cache",
})
try:
    with urllib.request.build_opener(NoRedirect).open(request, timeout=15) as response:
        status = response.status
except urllib.error.HTTPError as error:
    status = error.code
except urllib.error.URLError as error:
    sys.exit(f"Could not verify personal-site visibility: {error.reason}")
if status != 404:
    sys.exit(f"Personal-site root returned HTTP {status}; required HTTP 404: {url}")
print(f"PASS: personal-site root remains HTTP 404: {url}")
