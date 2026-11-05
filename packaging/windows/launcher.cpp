#include <webview/webview.h>
#include <windows.h>
#include <shlwapi.h>
#include <string>
#include "embedded_html.h"

int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
  wchar_t base[MAX_PATH];
  if (!GetEnvironmentVariableW(L"LOCALAPPDATA", base, MAX_PATH)) {
    MessageBoxW(nullptr, L"Cannot locate the PIXPHYSO data directory.", L"PIXPHYSO", MB_OK | MB_ICONERROR);
    return 1;
  }
  std::wstring dir = std::wstring(base) + L"\\PIXPHYSO";
  CreateDirectoryW(dir.c_str(), nullptr);
  std::wstring profile = dir + L"\\WebViewData";
  SetEnvironmentVariableW(L"WEBVIEW2_USER_DATA_FOLDER", profile.c_str());
  webview_t window = webview_create(0, nullptr);
  if (!window) {
    MessageBoxW(nullptr,
      L"PIXPHYSO needs the Microsoft Edge WebView2 Runtime. Please install the WebView2 Runtime and try again.",
      L"PIXPHYSO", MB_OK | MB_ICONERROR);
    return 1;
  }
  webview_set_title(window, "PIXPHYSO");
  webview_set_size(window, 1280, 800, WEBVIEW_HINT_NONE);
  webview_set_size(window, 640, 480, WEBVIEW_HINT_MIN);
  // A stable per-user file origin permits persistent IndexedDB, unlike about:blank.
  std::wstring path = dir + L"\\index.html";
  HANDLE file = CreateFileW(path.c_str(), GENERIC_WRITE, FILE_SHARE_READ, nullptr, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
  DWORD written = 0;
  bool ok = file != INVALID_HANDLE_VALUE && WriteFile(file, embedded_html, embedded_html_len, &written, nullptr) && written == embedded_html_len;
  if (file != INVALID_HANDLE_VALUE) CloseHandle(file);
  wchar_t url[4096]; DWORD length = 4096;
  if (!ok || FAILED(UrlCreateFromPathW(path.c_str(), url, &length, 0))) {
    MessageBoxW(nullptr, L"Cannot create the PIXPHYSO data directory or interface file.", L"PIXPHYSO", MB_OK | MB_ICONERROR);
    webview_destroy(window); return 1;
  }
  int needed = WideCharToMultiByte(CP_UTF8, 0, url, -1, nullptr, 0, nullptr, nullptr);
  std::string utf8(needed, '\0');
  WideCharToMultiByte(CP_UTF8, 0, url, -1, &utf8[0], needed, nullptr, nullptr);
  if (webview_navigate(window, utf8.c_str()) != WEBVIEW_ERROR_OK) {
    MessageBoxW(nullptr, L"Failed to load the PIXPHYSO interface.", L"PIXPHYSO", MB_OK | MB_ICONERROR);
    webview_destroy(window); return 1;
  }
  webview_run(window);
  webview_destroy(window);
  return 0;
}
