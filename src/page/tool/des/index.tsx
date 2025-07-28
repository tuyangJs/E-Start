// CryptoTool.tsx
import React, { useState } from 'react';
import {
    Input,
    Select,
    Button,
    Space,
    Typography,
    Divider,
    message,
    Switch,
    Row,
    Col,
    Upload
} from 'antd';
import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

type Mode = 'encode' | 'decode' | 'encrypt' | 'decrypt';
type Method =
    | 'base64'
    | 'hex'
    | 'md5'
    | 'sha1'
    | 'sha256'
    | 'aes'
    | 'des'
    | 'tripledes'
    | 'rc4'
    | 'rabbit';

export const CryptoTool: React.FC = () => {
    const [method, setMethod] = useState<Method>('base64');
    const [mode, setMode] = useState<Mode>('encode');
    const [inputValue, setInputValue] = useState('');   // 文本输入
    const [outputValue, setOutputValue] = useState(''); // 文本/图片 Base64 输出
    const [key, setKey] = useState('');
    const [iv, setIv] = useState('');
    const [withPrefix, setWithPrefix] = useState(false);

    const needsKey = ['aes', 'des', 'tripledes', 'rc4', 'rabbit'].includes(method);

    // Base64 图片上传处理（仅在 Base64 & encode 模式下展示）
    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            let dataUrl = (e.target?.result as string) || '';
            if (!withPrefix) {
                // 去掉 data:image/...;base64, 部分
                const idx = dataUrl.indexOf(',');
                if (idx > -1) dataUrl = dataUrl.slice(idx + 1);
            }
            setOutputValue(dataUrl);
            message.success(`图片 ${file.name} 已转换`);
        };
        reader.onerror = () => message.error('读取图片失败');
        reader.readAsDataURL(file);
        return false; // 阻止 Upload 自动上传
    };

    // 在 CryptoTool.tsx 中，找到 handleProcess 并替换为下面这段：

    const handleProcess = () => {
        // Base64 文本编解码
        if (method === 'base64') {
            if (!inputValue) {
                message.warning('请输入要处理的文本');
                return;
            }
            try {
                if (mode === 'encode') {
                    // 文本 → Base64
                    const wordArray = CryptoJS.enc.Utf8.parse(inputValue);
                    const base64 = CryptoJS.enc.Base64.stringify(wordArray);
                    setOutputValue(base64);
                } else {
                    // Base64 → 文本 或 Hex
                    const wordArray = CryptoJS.enc.Base64.parse(inputValue);
                    try {
                        // 先尝试转 UTF-8
                        const utf8 = CryptoJS.enc.Utf8.stringify(wordArray);
                        setOutputValue(utf8);
                    } catch {
                        // 转 UTF-8 失败，则以 Hex 形式输出
                        const hex = CryptoJS.enc.Hex.stringify(wordArray);
                        setOutputValue(hex);
                        message.warning('Base64 解码后不是有效 UTF-8 文本，已以 Hex 格式输出');
                    }
                }
            } catch (e) {
                console.error(e);
                message.error('Base64 处理失败，请检查输入是否为合法的 Base64 字符串');
            }
            return;
        }

        // 其余编码/哈希/加密逻辑保持不变
        let result = '';
        try {
            switch (method) {
                case 'hex':
                    result = mode === 'encode'
                        ? CryptoJS.enc.Utf8.parse(inputValue).toString(CryptoJS.enc.Hex)
                        : CryptoJS.enc.Hex.parse(inputValue).toString(CryptoJS.enc.Utf8);
                    break;
                // … 其他 md5、sha1、aes 等分支 …
                default:
                    result = inputValue;
            }
            setOutputValue(result);
        } catch (e) {
            console.error(e);
            message.error('处理失败，请检查输入与参数');
        }
    };


    // 复制结果
    const handleCopy = () => {
        if (!outputValue) {
            message.warning('没有可复制内容');
            return;
        }
        navigator.clipboard
            .writeText(outputValue)
            .then(() => message.success('复制成功'))
            .catch(() => message.error('复制失败'));
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 方法选择 & 编/解密切换 */}
            <Row gutter={16} align="middle" justify='center'>
                <Col>
                    <Select
                        value={method}
                        onChange={v => {
                            setMethod(v);
                            setOutputValue('');
                        }}
                        style={{ width: 180 }}
                    >
                        <Option value="base64">Base64 编解码</Option>
                        <Option value="hex">Hex 编解码</Option>
                        <Option value="md5">MD5 哈希</Option>
                        <Option value="sha1">SHA-1 哈希</Option>
                        <Option value="sha256">SHA-256 哈希</Option>
                        <Option value="aes">AES 加/解密</Option>
                        <Option value="des">DES 加/解密</Option>
                        <Option value="tripledes">3DES 加/解密</Option>
                        <Option value="rc4">RC4 加/解密</Option>
                        <Option value="rabbit">Rabbit 加/解密</Option>
                    </Select>
                </Col>
                {!(method === 'md5' || method === 'sha1' || method === 'sha256') && (
                    <Col>
                        <Switch
                            checkedChildren="编码/加密"
                            unCheckedChildren="解码/解密"
                            checked={mode === 'encode' || mode === 'encrypt'}
                            onChange={checked => {
                                const isTextMode = ['base64', 'hex'].includes(method);
                                const newMode = checked
                                    ? isTextMode
                                        ? 'encode'
                                        : 'encrypt'
                                    : isTextMode
                                        ? 'decode'
                                        : 'decrypt';
                                setMode(newMode as Mode);
                                setOutputValue('');
                            }}
                        />
                    </Col>
                )}
            </Row>

            {/* Base64 图片上传 & 前缀开关（仅 Base64 & encode） */}
            {method === 'base64' && mode === 'encode' && (
                <Row align="middle" gutter={16} >
                    <Col>
                    <span>图片编码：</span>
                        <Switch
                            checkedChildren="带 Data URI"
                            unCheckedChildren="仅 Base64"
                            checked={withPrefix}
                            onChange={setWithPrefix}
                        />
                    </Col>
                    <Col>
                        <Upload
                            beforeUpload={handleImageUpload}
                            showUploadList={false}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>上传图片</Button>
                        </Upload>
                    </Col>
                </Row>
            )}

            {/* 密钥/IV */}
            {needsKey && (
                <Space>
                    <Input
                        style={{ width: 200 }}
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        placeholder="密钥"
                    />
                    <Input
                        style={{ width: 200 }}
                        value={iv}
                        onChange={e => setIv(e.target.value)}
                        placeholder="IV（可选）"
                    />
                </Space>
            )}

            {/* 文本输入区（始终显示） */}
            <TextArea
                rows={4}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="请输入文本"
            />
            <Button type="primary" onClick={handleProcess}>执行</Button>

            {/* 输出结果 */}
            <Divider>
                结果
                <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    disabled={!outputValue}
                    style={{ marginLeft: 10 }}
                />
            </Divider>
                <TextArea
                    rows={4}
                    value={outputValue}
                    readOnly
                    placeholder="结果在此显示"
                />
        </Space>
    );
};
