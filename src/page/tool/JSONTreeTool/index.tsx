// JsonViewer.tsx
import React, { useState } from 'react';
import { Tree, Typography, Row, Col, message, Button, Space, Input, theme, Empty, Alert } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { translateJsonError } from './translateJsonError';

const { Title, Text } = Typography;

// 构建树数据，与之前一致
const buildTreeData = (value: any, path = ''): any[] => {
    if (Array.isArray(value)) {
        return value.map((item, index) => {
            const currentPath = `${path}[${index}]`;
            return {
                title: `[${index}]`,
                key: currentPath,
                children: buildTreeData(item, currentPath),
                isLeaf: typeof item !== 'object' || item === null,
            };
        });
    } else if (typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([key, val]) => {
            const currentPath = path ? `${path}.${key}` : key;
            return {
                title: key,
                key: currentPath,
                children: buildTreeData(val, currentPath),
                isLeaf: typeof val !== 'object' || val === null,
            };
        });
    }
    return [];
};



export const JsonViewer: React.FC = () => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<any>(null);
    const { token } = theme.useToken();
    const [parseError, setParseError] = useState<string | null>(null);

    const parseJSON = () => {
        setParseError(null);
        try {
            const parsed = JSON.parse(jsonInput);
            setTreeData(buildTreeData(parsed));
            setSelectedKey('');
            setSelectedValue(null);
            message.success('解析成功');
        } catch (e: any) {
            const errorMessage = e.message || 'JSON 解析失败，请检查格式';
            const translated = translateJsonError(errorMessage);
            setParseError(translated);
            alert(`解析错误: ${translated}`);
            console.error('JSON 解析失败:', errorMessage);
        }
    }


    const formatJSON = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonInput(JSON.stringify(parsed, null, 2));
            message.success('格式化成功');
        } catch (e: any) {
            const errorMessage = e.message || '格式化失败，请检查格式';
            alert(`格式化失败: ${translateJsonError(errorMessage)}`);
            message.error(`格式化失败: ${errorMessage}`);
            console.error('格式化失败:', errorMessage);
        }
    };

    const minifyJSON = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonInput(JSON.stringify(parsed));
            message.success('压缩成功');
        } catch (e: any) {
            const errorMessage = e.message || '压缩失败，请检查格式';
            alert(`压缩失败: ${translateJsonError(errorMessage)}`);
            message.error(`压缩失败: ${errorMessage}`);
            console.error('压缩失败:', errorMessage);
        }
    };
    function getValueByPath(data: any, path: string) {
        if (!path) return undefined;
        const regex = /(\w+)|\[(\d+)\]/g;
        let match;
        let current = data;

        while ((match = regex.exec(path)) !== null) {
            // match[1] 是属性名，match[2] 是数组索引
            if (match[1] !== undefined) {
                current = current?.[match[1]];
            } else if (match[2] !== undefined) {
                current = current?.[Number(match[2])];
            }
            if (current === undefined) break;
        }

        return current;
    }

    const handleSelect = (keys: React.Key[]) => {
        if (!keys.length) return;
        const keyPath = keys[0] as string;
        setSelectedKey(keyPath);
        try {
            const parsed = JSON.parse(jsonInput);
            const value = getValueByPath(parsed, keyPath);
            setSelectedValue(value);
        } catch {
            setSelectedValue(undefined);
            message.warning('无法提取节点值');
        }
    };


    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
            .then(() => message.success(`${label} 已复制`))
            .catch(() => message.error(`${label} 复制失败`));
    };

    const highlightJson = (code: string) =>
        Prism.highlight(code, Prism.languages.json, 'json');

    return (
        <Row gutter={24} style={{ width: '100%' }}>
            <Col span={12}>
                <Title level={4}>JSON 输入</Title>
                <Editor
                    value={jsonInput}
                    onValueChange={setJsonInput}
                    highlight={highlightJson}
                    padding={10}
                    style={{
                        fontFamily: token.fontFamily,
                        fontSize: token.fontSize,
                        backgroundColor: token.colorBgContainer,
                        color: token.colorText,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: token.borderRadius,
                        minHeight: 400,
                        height: "calc(100vh - 160px)",
                        overflow: 'auto',
                        outline: 'none',
                        caretColor: token.colorPrimary,
                    }}
                />
                <Space style={{ marginTop: 12 }}>
                    <Button type="primary" onClick={parseJSON}>解析 JSON</Button>
                    <Button onClick={formatJSON}>格式化 JSON</Button>
                    <Button onClick={minifyJSON}>压缩 JSON</Button>
                </Space>
            </Col>

            <Col span={12}>
                {parseError && (
                    <Alert
                        message="解析错误"
                        description={parseError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setParseError(null)}
                        style={{ marginBottom: 12 }}
                    />
                )}
                <Title level={4}>结构树 & 节点值</Title>
                {treeData.length > 0 ? (
                    <Tree
                        treeData={treeData}
                        onSelect={handleSelect}
                        defaultExpandAll
                        style={{ overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                        showLine
                    />
                ) : (
                    <Empty description="暂无数据，请先点击“解析 JSON”" style={{ marginTop: 48 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}

                {selectedKey ? (
                    <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
                        <Row gutter={8} align="middle">
                            <Col flex="80px"><strong>路径:</strong></Col>
                            <Col flex="auto">
                                <Input value={selectedKey} readOnly />
                            </Col>
                            <Col>
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={() => handleCopy(selectedKey, '路径')}
                                >
                                    复制
                                </Button>
                            </Col>
                        </Row>

                        <Row gutter={8} align="middle">
                            <Col flex="120px">
                                <strong>键值:
                                    <Text code type="warning">{Array.isArray(selectedValue)
                                        ?
                                        'array'
                                        :
                                        typeof selectedValue
                                    }
                                    </Text>
                                </strong>
                            </Col>
                            <Col flex="auto">
                                <Input
                                    readOnly
                                    style={{ fontFamily: 'monospace' }}
                                    value={
                                        typeof selectedValue === 'string'
                                            ? selectedValue
                                            : JSON.stringify(selectedValue, null, 2)
                                    }
                                />
                            </Col>
                            <Col>
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={() => {
                                        const valText =
                                            typeof selectedValue === 'string'
                                                ? selectedValue
                                                : JSON.stringify(selectedValue, null, 2);
                                        handleCopy(valText, "键值");
                                    }}
                                >
                                    复制
                                </Button>
                            </Col>
                        </Row>
                    </Space>
                ) : null}
            </Col>
        </Row>
    );
};
