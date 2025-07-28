import { invoke } from "@tauri-apps/api/core";
import { stat } from "@tauri-apps/plugin-fs";
import { fuzzySearch } from "./fuzzySearch";

/**
 * 文件二进制信息。
 */
export interface TableListPagination {
    /**
     * 指示该路径是否为文件。
     * - `true`：是文件。
     * - `false`：是目录。
     */
    isFile: boolean;

    /**
     * 文件的大小，单位为字节。
     */
    size: number;

    /**
     * 文件的最后修改时间。
     * 可能为 `null`，表示该信息不可用。
     */
    mtime?: Date | null;

    /**
     * 文件的创建时间。
     * 可能为 `null`，表示该信息不可用。
     */
    birthtime?: Date | null;
}
/**
 * 获取文件二进制信息。
 */
export const GetFileinfo = async (filePath: string) => {
    const json: TableListPagination = {
        isFile: false,
        size: 0,
        mtime: new Date(),
        birthtime: new Date(),
    }
    try {
        const info = await stat(filePath);
        json.size = info.size;
        json.isFile = info.isFile;
        json.mtime = info.mtime;
        json.birthtime = info.birthtime;
    } catch (error) {
        // console.error('读取文件信息失败:', error);
    }
    return json;
}
/**
 * 获取易语言最近文件列表
 * params 如果为空则返回所有文件否则根据值搜索文件
 */
export const requestFile = async (params?: string, paths?: string[]): Promise<string[]> => {
    paths = paths || await invoke('get_epl_recent_files') as string[];
    if (!params) return paths;
    const keyword = params.toLowerCase();
    return fuzzySearch(keyword, paths)
};
/**
 * 处理路径，返回上级目录
 * @param path 路径
 * @returns 
 */
export function getParentPath(path: string): string {
    // 去掉结尾的斜杠（防止最后是 / 或 \）
    path = path.replace(/[\\\/]+$/, '');

    // 查找最后一个 / 或 \
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

    if (lastSlashIndex === -1) return path; // 没有上级目录

    return path.slice(0, lastSlashIndex);
}
/**
 *   将字节数（bytes）格式化为更易读的字符串（例如 KB、MB、GB 等）
 *
 * 参数：
 *   @param bytes    {number} 字节数
 *   @param decimals {number} 可选，小数位数（默认保留2位）
 */
export function formatBytes(bytes: number, decimals = 2): string {
    // 如果字节数为 0，直接返回 "0 B"
    if (bytes === 0) return '0 B';

    const k = 1024;  // 单位换算基数（1 KB = 1024 B）
    const dm = decimals < 0 ? 0 : decimals;  // 小数位数不能为负
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];  // 支持的单位列表

    // 计算应使用的单位下标
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // 换算为对应单位的数值
    const size = bytes / Math.pow(k, i);

    // 返回格式化字符串
    return `${size.toFixed(dm)} ${sizes[i]}`;
}
