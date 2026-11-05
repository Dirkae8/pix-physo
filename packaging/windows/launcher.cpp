#include <webview/webview.h>
#include <windows.h>
#include <string>
#include "embedded_html.h"

int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
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
  const std::string html(reinterpret_cast<const char *>(embedded_html), embedded_html_len);
  if (webview_set_html(window, html.c_str()) != WEBVIEW_ERROR_OK) {
    MessageBoxW(nullptr, L"Failed to load the PIXPHYSO interface.", L"PIXPHYSO", MB_OK | MB_ICONERROR);
    webview_destroy(window);
    return 1;
  }
  webview_run(window);
  webview_destroy(window);
  return 0;
}
