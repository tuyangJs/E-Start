import { StarDataItem } from "@/mod/store";

export interface handleOkType {
    starData: StarDataItem[];
    selectedId: string;
    paths: string[] | string; // 允许单个字符串或字符串数组
}

export const upStar = (e: handleOkType) => {
    // 确保 starData 有默认值
    const { starData = [], selectedId } = e;
    
    // 确保 paths 是数组格式
    let paths: string[] = [];
    
    if (Array.isArray(e.paths)) {
        paths = e.paths;
    } else if (typeof e.paths === 'string') {
        paths = [e.paths];
    }
    
    // 如果没有有效的路径，直接返回原始数据
    if (!paths || paths.length === 0) {
        return starData;
    }
    
    // 过滤掉已存在的路径
    const newEntries: StarDataItem[] = paths
        .filter(path => 
            !starData.some(item => 
                item.path === path && item.id === selectedId
            )
        )
        .map(path => ({ id: selectedId, path }));
    
    // 如果有新的有效条目，则返回更新后的列表
    if (newEntries.length > 0) {
        return [...starData, ...newEntries];
    }
    
    // 如果没有新的有效条目，返回原始数据
    return starData;
};