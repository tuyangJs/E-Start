/**
 * 从文件路径中提取目录部分
 * @param filePath 完整的文件路径
 * @returns 目录路径
 */
export function extractDirectoryPath(filePath: string): string {
  if (!filePath || filePath.trim().length === 0) {
    throw new Error('文件路径不能为空');
  }
  
  // 规范化路径 - 替换多个连续反斜杠为单个反斜杠
  const normalizedPath = filePath.replace(/\\+/g, '\\');
  
  // 移除末尾的反斜杠（如果存在）
  const trimmedPath = normalizedPath.replace(/\\+$/, '');
  
  // 找到最后一个反斜杠的位置
  const lastBackslashIndex = trimmedPath.lastIndexOf('\\');
  
  // 如果没有找到反斜杠，说明只有文件名没有路径
  if (lastBackslashIndex === -1) {
    return '.';
  }
  
  // 提取目录部分
  const directory = trimmedPath.substring(0, lastBackslashIndex);
  
  return directory;
}
