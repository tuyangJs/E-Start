import { create } from "zustand";
import { persist } from "zustand/middleware";

// 原有的 AppMainType 保持不变
export interface AppMainType {
    navigation: string
    eFiles: string;
    setNav: (e: AppMainType['navigation']) => void
    setAppMain: (e: Partial<Omit<AppMainType,
        "navigation">>) => void;
}
export interface TentativeType {
    licenseStatus: string
    setTentative: (e: Partial<Omit<TentativeType,
        "setTentative">>) => void;
}
export const TentativeStore = create<TentativeType>((set) => ({
    licenseStatus: '正在验证许可证...',
    setTentative: (e) => set((state) => ({
        ...state,
        ...e,
    })),
})
)

export const AppMainStore = create<AppMainType>()(
    persist(
        (set) => ({
            navigation: 'home',
            eFiles: '',
            setNav: e => set(() => ({ navigation: e })),
            setAppMain: (e) => set((state) => ({
                ...state,
                ...e,
            })),
        }),
        {
            name: 'Start-local-AppMain',
        }
    )
)
export interface starType {
    id: string;
    name: string;
}

/**
 * 单个收藏项，包含所属标签 id 和收藏内容路径
 */
export interface StarDataItem {
    id: string;
    path: string;
}

export interface AppDataType {
    /** 所有分类标签 */
    star: starType[];
    /** 收藏列表，每个项对应一个 { id: 标签id, path: 收藏路径 } */
    starData: StarDataItem[];
    /** 更新全局数据，可更新 star 和 starData */
    setAppData: (e: Partial<AppDataType>) => void;
}

export const AppDataStore = create<AppDataType>()(
    persist(
        (set) => (
            {
                star: [{
                    id: "Type1",
                    name: "⭐收藏",
                },
                {
                    id: "Type2",
                    name: "🌍公司项目",
                }
                    ,
                {
                    id: "Type3",
                    name: "📘个人项目",
                }
                ],
                starData: [],
                setAppData: (e) =>
                    set((state) => ({
                        ...state,
                        ...e,
                    })),
            }
        ),
        {
            name: 'Start-local-AppDatas',
        }
    )
);