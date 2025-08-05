import React, { useMemo } from 'react';
import { AutoComplete, Input, Flex, Typography, theme } from 'antd';
import { categories, SearchFor } from './RenderOptions';
import { SettingIndexItem } from './types';

const { Title, Paragraph } = Typography;

interface SearchBoxProps {
    value: string;
    onChange: (val: string) => void;
    style?: React.CSSProperties;
    onSelectItem: (categoryKey: string, itemKey: string) => void;
}

interface HighlightTextProps {
    text: string;
    term: string;
    color: string;
}

interface OptionItemProps {
    item: SettingIndexItem;
    term: string;
    color: string;
}

// 高亮文本组件
const HighlightText: React.FC<HighlightTextProps> = ({ text, term, color }) => {
    if (!text) return null;

    return (
        <>
            {text.split(new RegExp(`(${term})`, 'gi')).map((part, idx) =>
                part.toLowerCase() === term.toLowerCase() ? (
                    <span key={idx} style={{ color }}>{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};

// 选项项组件
const OptionItem: React.FC<OptionItemProps> = ({ item, term, color }) => {
    const [titleText, descriptionText] = item.title?.split(" - ") || [item.title, ''];

    return (
        <div style={{ padding: 4 }}>
            <Title level={5} style={{ margin: 0 }}>
                <HighlightText text={titleText} term={term} color={color} />
            </Title>
            {descriptionText && (
                <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                        whiteSpace: 'normal',
                        wordWrap: 'break-word'
                    }}
                >
                    <HighlightText text={descriptionText} term={term} color={color} />
                </Paragraph>
            )}
        </div>
    );
};

// 分组标题组件
const GroupTitle: React.FC<{ title: string }> = ({ title }) => (
    <Flex align="center" justify="space-between">
        <strong>{title}</strong>
    </Flex>
);

// 获取设置数据
const getSettingsData = (): SettingIndexItem[] => {
    const data: SettingIndexItem[] = [];

    categories.forEach(category => {
        const metadata = category.metadata();
        data.push(...SearchFor(metadata, category.label, category.key));
    });

    return data;
};

// 主搜索组件
const SearchBox: React.FC<SearchBoxProps> = ({
    value,
    onChange,
    onSelectItem,
    style
}) => {
    const settingsData = getSettingsData();
    const { token } = theme.useToken();

    const options = useMemo(() => {
        const term = value.trim().toLowerCase();
        if (!term) return [];

        // 分组搜索结果
        const groupedResults = settingsData.reduce<Record<string, SettingIndexItem[]>>(
            (groups, item) => {
                if (item.title.toLowerCase().includes(term)) {
                    const group = groups[item.categoryLabel] || [];
                    return { ...groups, [item.categoryLabel]: [...group, item] };
                }
                return groups;
            },
            {}
        );

        // 转换为AutoComplete需要的格式
        return Object.entries(groupedResults).map(([category, items]) => ({
            label: <GroupTitle title={category} />,
            options: items.map(item => ({
                value: `${item.category}/${item.key}`,
                label: <OptionItem item={item} term={term} color={token.colorPrimary} />,
            }))
        }));
    }, [value, settingsData, token.colorPrimary]);

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