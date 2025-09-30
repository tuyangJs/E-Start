import ThemeSettings from './categories/ThemeSettings';
import Section from './Section';
import AboutPag from '@/page/about';
import { SectionItem, SettingCategory, SettingIndexItem } from './types';
import GesTouchSettings from  './categories/Touch';
import { ControlOutlined, HddOutlined, InfoCircleOutlined, SkinOutlined } from '@ant-design/icons';
import Touchicon from '@/assets/fluent-mdl2--touch.svg?react';
import GesStorage from './categories/storage';
import Assistant from './categories/assistant';
export interface RenderOptionsProps {
    SectionItem: SectionItem[]
}
export const RenderOptions: React.FC<RenderOptionsProps> = ({ SectionItem }) => (
    <>
        {SectionItem.map((item) =>
            <Section
                {...item}
            />)
        }
    </>
)
export const SearchFor = (SectionItem: SectionItem[], title: string, key: string) => {
    const result: SettingIndexItem[] = [];
    for (let index = 0; index < SectionItem.length; index++) {
        const element = SectionItem[index];
        const _result: SettingIndexItem = {
            category: key,
            categoryLabel: title,
            key: element.key,
            title: element.title + (element?.description ? ` - ${element.description}` : ''),
        }
        result.push(_result)
    }
    return result;
}
export const categories: SettingCategory[] = [
    {
        key: 'theme',
        label: '个性化',
        metadata: ThemeSettings,
        component: () => <RenderOptions SectionItem={ThemeSettings()} />,
        icon:<SkinOutlined />
    },
    {
        key: 'touch',
        label: '触控',
        metadata: GesTouchSettings,
        component: () => <RenderOptions SectionItem={GesTouchSettings()} />,
        icon: <Touchicon />
    },
    {
        key: 'storage',
        label: '存储',
        metadata: GesStorage,
        component: () => <RenderOptions SectionItem={GesStorage()} />,
        icon: <HddOutlined />
    },
    {
        key: 'assistant',
        label: '辅助功能',
        metadata: Assistant,
        component: () => <RenderOptions SectionItem={Assistant()} />,
        icon: <ControlOutlined />
    },
    {
        key: "about",
        label: "关于",
        icon:<InfoCircleOutlined />,
        metadata: () => [
            {
                key: "a",
                title: "项目名称",
                control: <></>
            },
            {
                key: "b",
                title: "发布者",
                description: "Tuyang",
                control: <></>
            },
            {
                key: "c",
                title: "应用简介",
                control: <></>
            },
            {
                key: "d",
                title: "",
                description: "程序版本",
                control: <></>
            }
        ],
        component: () => <AboutPag />
    }
];