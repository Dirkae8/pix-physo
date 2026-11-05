#define UNICODE
#define _UNICODE
#include <windows.h>
#include <shellapi.h>
#include <wchar.h>
#include "embedded_html.h"

int WINAPI wWinMain(HINSTANCE h, HINSTANCE prev, PWSTR cmd, int show) {
  (void)h; (void)prev; (void)cmd; (void)show;
  wchar_t temp[MAX_PATH], file[MAX_PATH], url[MAX_PATH + 16], params[MAX_PATH + 80], edge[MAX_PATH], base[MAX_PATH];
  if (!GetTempPathW(MAX_PATH, temp) || swprintf(file, MAX_PATH, L"%lsPIXPHYSO-standalone.html", temp) < 0) return 1;
  HANDLE f = CreateFileW(file, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (f == INVALID_HANDLE_VALUE) { MessageBoxW(NULL, L"Cannot create PIXPHYSO HTML in the temporary folder.", L"PIXPHYSO", MB_OK | MB_ICONERROR); return 1; }
  DWORD written = 0;
  BOOL ok = WriteFile(f, embedded_html, embedded_html_len, &written, NULL); CloseHandle(f);
  if (!ok || written != embedded_html_len) { MessageBoxW(NULL, L"Cannot write PIXPHYSO HTML.", L"PIXPHYSO", MB_OK | MB_ICONERROR); return 1; }
  swprintf(url, MAX_PATH + 16, L"file:///%ls", file);
  for (wchar_t *p = url; *p; ++p) if (*p == L'\\') *p = L'/';
  swprintf(params, MAX_PATH + 80, L"--app=\"%ls\" --window-size=1480,900", url);
  const wchar_t *vars[] = {L"ProgramFiles(x86)", L"ProgramFiles", L"LOCALAPPDATA"};
  for (int i = 0; i < 3; ++i) {
    if (!GetEnvironmentVariableW(vars[i], base, MAX_PATH)) continue;
    if (swprintf(edge, MAX_PATH, L"%ls\\Microsoft\\Edge\\Application\\msedge.exe", base) < 0) continue;
    if (GetFileAttributesW(edge) == INVALID_FILE_ATTRIBUTES) continue;
    if ((INT_PTR)ShellExecuteW(NULL, L"open", edge, params, NULL, SW_SHOWNORMAL) > 32) return 0;
  }
  if ((INT_PTR)ShellExecuteW(NULL, L"open", file, NULL, NULL, SW_SHOWNORMAL) <= 32) {
    MessageBoxW(NULL, L"Install Microsoft Edge or another modern browser to open PIXPHYSO.", L"PIXPHYSO", MB_OK | MB_ICONERROR); return 1;
  }
  return 0;
}
