import React from "react";
import ReactDOM from "react-dom/client";
import App from "./page/App";
import { attachConsole } from '@tauri-apps/plugin-log';

document.addEventListener('keydown', function (e) {
  if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault(); // 禁止刷新
  }
});

document.addEventListener('contextmenu', function (e) {
  const target = e.target as HTMLElement;

  // 1. 如果页面有选中文本，放行，允许右键菜单
  const selection = window.getSelection?.();
  if (selection) {
    const selectedText = selection.toString();
    console.log('selectedText', selectedText);
    
    if (selectedText !== '') {
      // 只有当选中的文本非空时，允许右键菜单
      return;
    }
  }

  // 2. 如果 className 中包含 no-menu，阻止右键菜单
  if (target?.classList?.contains('no-menu')) {
    e.preventDefault();
    return;
  }

  // 3. 允许 input 和 textarea 元素右键，前提是 input 没有被禁用
  const tag = target?.tagName?.toLowerCase();
  if (tag === 'input' && !(target as HTMLInputElement).disabled) {
    return;
  }
  if (tag === 'textarea') {
    return;
  }

  // 其它情况统一禁用右键菜单
  e.preventDefault();
});

// 启用 TargetKind::Webview 后，这个函数将把日志打印到浏览器控制台
const detach = await attachConsole();
// 将浏览器控制台与日志流分离
detach();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
