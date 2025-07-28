/**
 * 模糊搜索函数
 * @param keyword 搜索关键词
 * @param items 待搜索的字符串数组
 * @returns 匹配的字符串数组
 */
export function fuzzySearch(keyword: string, items: string[]): string[] {
  // 空关键词返回所有项
  if (!keyword.trim()) return items;

  // 分割关键词为多个搜索项（支持空格分隔的多关键词）
  const searchTerms = keyword.toLowerCase().split(/\s+/);
  // 过滤出包含所有搜索项的项
  return items.filter(item => {
    const lowerItem = item.toLowerCase().split('\\').pop() || item.toLowerCase();
    return searchTerms.every(term => lowerItem.includes(term));
  });
}