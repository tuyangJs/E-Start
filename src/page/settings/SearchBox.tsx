import React, { useMemo } from 'react';
import { AutoComplete, Input, Flex, Typography, theme } from 'antd';
import { categories, SearchFor } from './RenderOptions';
import { SettingIndexItem } from './types';
const { Text, Title } = Typography;
interface SearchBoxProps {
    value: string;
    onChange: (val: string) => void;
    style?: React.CSSProperties;
    onSelectItem: (categoryKey: string, itemKey: string) => void;
}

// 新增分组标题组件
const Titles: React.FC<{ title: string }> = ({ title }) => (
    <Flex align="center" justify="space-between">
        <strong>{title}</strong>
    </Flex>
);

const highlight = (text: string, term: string, color: string) =>
    text.split(new RegExp(`(${term})`, 'gi')).map((part, idx) =>
        part.toLowerCase() === term.toLowerCase()
            ?
            <span key={idx}
                style={{ color }}>
                {part}
            </span>
            :
            part
    );

const settingsData = () => {
    const data: SettingIndexItem[] = [];
    for (let index = 0; index < categories.length; index++) {
        const element = categories[index];
        const metadata = element.metadata();
        data.push(...SearchFor(metadata, element.label, element.key));
    }
    return data;
};

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onSelectItem, style }) => {
    const SettingsData = settingsData();
    const config = theme.useToken();
    const options = useMemo(() => {
        const term = value.trim().toLowerCase();
        if (!term) return [];

        // 分组逻辑
        const groupedResults: Record<string, SettingIndexItem[]> = {};

        SettingsData.filter(item => item.title.toLowerCase().includes(term))
            .forEach(item => {
                if (!groupedResults[item.categoryLabel]) {
                    groupedResults[item.categoryLabel] = [];
                }
                groupedResults[item.categoryLabel].push(item);
            });
        // 转换为分组选项
        return Object.entries(groupedResults).map(([category, items]) => ({
            label: <Titles title={category} />,
            options: items.map(item => {
                const arr = item.title?.split(" - ")
                const titleText = arr[0]
                const descriptionText = arr?.[1]
                return {
                    value: `${item.category}/${item.key}`,
                    label: (
                        <div style={{ padding: 4 }}>
                            <Title level={5} style={{ margin: 0 }}>
                                {highlight(titleText, term, config.token.colorPrimary)}
                            </Title>
                            {descriptionText && <Text >
                                {highlight(descriptionText, term, config.token.colorPrimary)}
                            </Text>}
                        </div>
                    )
                }
            }
            )
        }));
    }, [value]);

    return (
        <AutoComplete
            value={value}
            options={options}
            onSearch={onChange}
            style={{ width: '100%', ...style }}
            placeholder="搜索设置"
            onSelect={(val: string) => {
                const [cat, key] = val.split('/');
                onSelectItem(cat, key);
            }}
            filterOption={false}
            popupMatchSelectWidth={386}
        >
            <Input.Search
                variant="filled"
                allowClear
                
            />
        </AutoComplete>
    );
};

export default SearchBox;