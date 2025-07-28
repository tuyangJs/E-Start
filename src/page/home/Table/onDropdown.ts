import { invoke } from "@tauri-apps/api/core";
import { MessageInstance } from "antd/es/message/interface";

interface onDropdownType {
    key: string;
    path: string;
    eFiles: string;
    messageApi: MessageInstance
    Tabs: string
    openAddstart: (e: string) => void
    removeFavorite: (categoryId: string, path: string) => void
}
export const onDropdown = async (e: onDropdownType) => {
    const { key, path, eFiles, messageApi, openAddstart, Tabs,removeFavorite } = e;
    switch (key) {
        case "open":
            const err: number = await invoke('open_exe', { exePath: eFiles, args: [path] })
            if (err === 0) {
                messageApi.open({ type: 'success', content: '打开成功' });
            }
            if (err === 1) {
                messageApi.open({ type: 'error', content: '打开失败！' });
            }
            break;
        case "openDir":
            await invoke('reveal_file', { filePath: path })
            break;
        case "copy":
            try {
                await navigator.clipboard.writeText(path);
                messageApi.open({ type: 'success', content: '复制路径成功' });
            } catch (err) {
                messageApi.open({ type: 'error', content: '复制路径失败' });
            }
            break;

        case "star":
            //添加收藏
            openAddstart(path)
            break;
        case "remove":
            removeFavorite(Tabs, path)
            break
        default:
            break;
    }
}