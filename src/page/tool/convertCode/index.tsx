import React, { useState } from 'react';
import { Input, Select, Button, Space, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

type ConversionType =
    | 'chinese-to-unicode'
    | 'unicode-to-chinese'
    | 'ascii-to-unicode'
    | 'unicode-to-ascii'
    | 'url-encode'
    | 'url-decode';
const autoSize = {
    minRows: 5,
    maxRows: 8
}
export const ConvertCode: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');
    const [type, setType] = useState<ConversionType>('chinese-to-unicode');

    // 转换函数
    const toUnicode = (str: string) =>
        str
            .split('')
            .map((char) => {
                const code = char.charCodeAt(0).toString(16).padStart(4, '0');
                return `\\u${code}`;
            })
            .join('');

    const fromUnicode = (str: string) =>
        str.replace(/\\u[0-9a-fA-F]{4}/g, (match) =>
            String.fromCharCode(parseInt(match.replace('\\u', ''), 16)),
        );

    const asciiToUnicode = (str: string) =>
        str
            .split('')
            .map((char) => `\\u${char.charCodeAt(0).toString(16)}`)
            .join('');

    const unicodeToAscii = fromUnicode;

    const handleConvert = () => {
        let result = '';
        switch (type) {
            case 'chinese-to-unicode':
                result = toUnicode(inputValue);
                break;
            case 'unicode-to-chinese':
                result = fromUnicode(inputValue);
                break;
            case 'ascii-to-unicode':
                result = asciiToUnicode(inputValue);
                break;
            case 'unicode-to-ascii':
                result = unicodeToAscii(inputValue);
                break;
            case 'url-encode':
                result = encodeURIComponent(inputValue);
                break;
            case 'url-decode':
                result = decodeURIComponent(inputValue);
                break;
            default:
                result = inputValue;
        }
        setOutputValue(result);
    };

    const handleSwap = () => {
        setInputValue(outputValue);
        setOutputValue(inputValue);
    };

    const handleCopy = () => {
        if (!outputValue) {
            message.warning('没有可复制的内容');
            return;
        }
        navigator.clipboard
            .writeText(outputValue)
            .then(() => message.success('复制成功'))
            .catch(() => message.error('复制失败'));
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">

            <Select value={type} onChange={(val) => setType(val)} style={{ width: 240 }}>
                <Option value="chinese-to-unicode">中文 → Unicode</Option>
                <Option value="unicode-to-chinese">Unicode → 中文</Option>
                <Option value="ascii-to-unicode">ASCII → Unicode</Option>
                <Option value="unicode-to-ascii">Unicode → ASCII</Option>
                <Option value="url-encode">URL 编码</Option>
                <Option value="url-decode">URL 解码</Option>
            </Select>

            <TextArea
                rows={4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入要转换的内容"
                autoSize={autoSize}
            />

            <Space>
                <Button type="primary" onClick={handleConvert}>
                    转换
                </Button>
                <Button onClick={handleSwap}>交换输入输出</Button>
                <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    disabled={!outputValue}
                >
                    复制
                </Button>
            </Space>


            <TextArea
                className='no-menu'
                rows={4}
                value={outputValue}
                autoSize={autoSize}
                placeholder="转换结果" />
        </Space>
    );
};
