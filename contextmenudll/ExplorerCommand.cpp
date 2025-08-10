#include <windows.h>
#include <shobjidl_core.h>
#include <shlwapi.h>
#include <string>
#include <strsafe.h>  // 添加用于字符串操作

#pragma comment(lib, "shlwapi.lib")

// 全局句柄 & CLSID
HINSTANCE g_hModule = NULL;
static const CLSID CLSID_YimaContextMenu = 
    {0x56F70501,0x4289,0x40B4,{0xBB,0xA6,0xC1,0xEF,0xE2,0x71,0x38,0xAD}};

// ======== DllMain ========
BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID) {
    if (reason == DLL_PROCESS_ATTACH) {
        g_hModule = hModule;
        wchar_t buf[256];
        swprintf_s(buf, L"YiMaContextMenu: DLL loaded in PID=%d", GetCurrentProcessId());
        OutputDebugStringW(buf);
    }
    return TRUE;
}

// ======== IExplorerCommand 实现 ========
class ExplorerCommandVerb : public IExplorerCommand {
public:
    // IUnknown
    STDMETHODIMP QueryInterface(REFIID riid, void** ppv) override {
        if (riid == IID_IUnknown || riid == IID_IExplorerCommand) {
            *ppv = static_cast<IExplorerCommand*>(this);
            AddRef();
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    STDMETHODIMP_(ULONG) AddRef() override { return 2; } // 简化计数
    STDMETHODIMP_(ULONG) Release() override { return 1; }

    // IExplorerCommand
    STDMETHODIMP GetTitle(IShellItemArray*, LPWSTR* ppszName) override {
         OutputDebugStringW(L"YiMaContextMenu: GetTitle called");
        *ppszName = (LPWSTR)CoTaskMemAlloc((wcslen(L"收藏到易码助手") + 1) * sizeof(wchar_t));
        if (*ppszName) {
            wcscpy_s(*ppszName, wcslen(L"收藏到易码助手") + 1, L"收藏到易码助手");
        }
        OutputDebugStringW(L"GetTitle called");
        return S_OK;
    }
    
    STDMETHODIMP GetIcon(IShellItemArray*, LPWSTR* ppszIcon) override {
        const wchar_t* path = L"E-Manager.exe,0";
        *ppszIcon = (LPWSTR)CoTaskMemAlloc((wcslen(path) + 1) * sizeof(wchar_t));
        if (*ppszIcon) {
            wcscpy_s(*ppszIcon, wcslen(path) + 1, path);
        }
        return S_OK;
    }
    
    // 添加缺失的方法实现
    STDMETHODIMP GetToolTip(IShellItemArray*, LPWSTR* ppszInfotip) override {
        *ppszInfotip = nullptr; // 不需要工具提示
        return E_NOTIMPL;
    }
    
    STDMETHODIMP GetCanonicalName(GUID* pguidCommandName) override {
        *pguidCommandName = CLSID_YimaContextMenu; // 使用我们的CLSID作为规范名称
        return S_OK;
    }
    
    STDMETHODIMP GetState(IShellItemArray*, BOOL, EXPCMDSTATE* pCmdState) override { 
        *pCmdState = ECS_ENABLED; 
        return S_OK; 
    }
    
    STDMETHODIMP GetFlags(EXPCMDFLAGS* pFlags) override { 
        *pFlags = ECF_DEFAULT; 
        return S_OK; 
    }
    
    STDMETHODIMP EnumSubCommands(IEnumExplorerCommand** ppEnum) override { 
        *ppEnum = nullptr; 
        return E_NOTIMPL; 
    }
    
    STDMETHODIMP Invoke(IShellItemArray* psiItemArray, IBindCtx*) override {
        DWORD count;
        if (FAILED(psiItemArray->GetCount(&count))) {
            return E_FAIL;
        }
        
        for (DWORD i = 0; i < count; ++i) {
            IShellItem* item = nullptr;
            if (SUCCEEDED(psiItemArray->GetItemAt(i, &item))) {
                LPWSTR filePath = nullptr;
                if (SUCCEEDED(item->GetDisplayName(SIGDN_FILESYSPATH, &filePath))) {
                    // 启动主程序
                    ShellExecuteW(nullptr, L"open", 
                        L"E-Manager.exe", 
                        filePath, nullptr, SW_SHOW);
                    CoTaskMemFree(filePath);
                }
                item->Release();
            }
        }
        return S_OK;
    }
};

// ======== 类工厂 ========
class ClassFactory : public IClassFactory {
public:
    STDMETHODIMP QueryInterface(REFIID riid, void** ppv) override {
        if (riid == IID_IClassFactory || riid == IID_IUnknown) {
            *ppv = static_cast<IClassFactory*>(this);
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    STDMETHODIMP_(ULONG) AddRef() override { return 1; }
    STDMETHODIMP_(ULONG) Release() override { return 1; }
    
    STDMETHODIMP CreateInstance(IUnknown* pUnkOuter, REFIID riid, void** ppv) override {
        if (pUnkOuter) return CLASS_E_NOAGGREGATION;
        auto cmd = new ExplorerCommandVerb();
        HRESULT hr = cmd->QueryInterface(riid, ppv);
        cmd->Release();
        return hr;
    }
    STDMETHODIMP LockServer(BOOL) override { return S_OK; }
};

// ======== DLL 导出函数 ========
STDAPI DllGetClassObject(REFCLSID rclsid, REFIID riid, void** ppv) {
    wchar_t msg[256];
    StringFromGUID2(rclsid, msg, 256);
    OutputDebugStringW(L"YiMaContextMenu: DllGetClassObject called for CLSID: ");
    OutputDebugStringW(msg);
    
    if (rclsid == CLSID_YimaContextMenu) {
        OutputDebugStringW(L"YiMaContextMenu: Creating factory");
        // ... 原有代码 ...
    }
    return CLASS_E_CLASSNOTAVAILABLE;
}


STDAPI DllCanUnloadNow() { 
    return S_OK; // 永久驻留
}