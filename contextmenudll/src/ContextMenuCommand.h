#pragma once
#include <ShObjIdl.h>
#include <atlbase.h>
#include <atlcom.h>
#include <shellapi.h>

// 需要添加以下头文件以解决std::wstring和EXPCMDEXECOPT未定义的问题
#include <string>
#include <windows.h>
#include <shlobj.h>

// {56F70501-4289-40B4-BBA6-C1EFE27138AD}
static const CLSID CLSID_ContextMenuCommand =
{ 0x56F70501, 0x4289, 0x40B4, { 0xBB, 0xA6, 0xC1, 0xEF, 0xE2, 0x71, 0x38, 0xAD } };

class ATL_NO_VTABLE CContextMenuCommand :
    public CComObjectRootEx<CComSingleThreadModel>,
    public CComCoClass<CContextMenuCommand, &CLSID_ContextMenuCommand>,
    public IExplorerCommand,
    public IInitializeCommand
{
public:
    CContextMenuCommand() {}
    DECLARE_NO_REGISTRY()

    BEGIN_COM_MAP(CContextMenuCommand)
        COM_INTERFACE_ENTRY(IExplorerCommand)
        COM_INTERFACE_ENTRY(IInitializeCommand)
    END_COM_MAP()

    // IInitializeCommand
    IFACEMETHODIMP Initialize(
        /* [in] */ PCWSTR /*pszCommandName*/,
        /* [in] */ IPropertyBag *ppb) override
    {
        CComVariant varPath;
        if (SUCCEEDED(ppb->Read(L"System.ItemPathDisplay", &varPath, nullptr)) &&
            varPath.vt == VT_BSTR) {
            m_filePath = varPath.bstrVal;
        }
        return S_OK;
    }

    // IExplorerCommand
    IFACEMETHODIMP GetTitle(EXPCMDEXECOPT, PWSTR *ppszName) override
    {
        return SHStrDupW(L"收藏到易码助手", ppszName);
    }
    IFACEMETHODIMP GetIcon(EXPCMDEXECOPT, PWSTR *ppszIcon) override
    {
        return SHStrDupW(L"%ProgramFiles%\\EProjectManager\\E-Manager.exe,0", ppszIcon);
    }
    IFACEMETHODIMP GetToolTip(EXPCMDEXECOPT, PWSTR *ppszInfo) override
    {
        return SHStrDupW(L"使用易码助手收藏选中文件", ppszInfo);
    }
    IFACEMETHODIMP GetCanonicalName(PWSTR *ppszName) override
    {
        return SHStrDupW(L"Tuyang.EManager.OpenWith", ppszName);
    }
    IFACEMETHODIMP GetState(EXPCMDEXECOPT, ECI_STATE *pState) override
    {
        *pState = ECI_ENABLED;
        return S_OK;
    }
    IFACEMETHODIMP Invoke(IBindCtx* /*pbc*/) override
    {
        if (m_filePath.empty())
            return E_FAIL;
        std::wstring params = L"\"" + m_filePath + L"\"";
        SHELLEXECUTEINFOW sei = { sizeof(sei) };
        sei.fMask        = SEE_MASK_NOASYNC;
        sei.hwnd         = nullptr;
        sei.lpVerb       = L"open";
        sei.lpFile       = L"C:\\Program Files\\EProjectManager\\E-Manager.exe";
        sei.lpParameters = params.c_str();
        sei.nShow        = SW_SHOWNORMAL;
        return ShellExecuteExW(&sei)
             ? S_OK
             : HRESULT_FROM_WIN32(GetLastError());
    }
    IFACEMETHODIMP GetFlags(EXPCMDFLAGS *pFlags) override
    {
        *pFlags = ECF_DEFAULT;
        return S_OK;
    }

private:
    std::wstring m_filePath;
};
