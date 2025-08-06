import React, { useState, useRef } from 'react';
import { Input, Button, Space, Select, message, QRCode, Row, Col, ColorPicker, Upload, Switch, Divider, Segmented } from 'antd';
import { CopyOutlined, CloseOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';


const { TextArea } = Input;
const { Option } = Select;

// 预定义配色方案
const colorPresets = [
    { name: '经典黑白', fg: '#000000', bg: '#ffffff' },
    { name: '深蓝金', fg: '#1890ff', bg: '#ffffff' },
    { name: '翡翠绿', fg: '#52c41a', bg: '#ffffff' },
    { name: '活力橙', fg: '#fa8c16', bg: '#ffffff' },
    { name: '优雅紫', fg: '#722ed1', bg: '#ffffff' },
    { name: '逆色白黑', fg: '#ffffff', bg: '#000000' },
    { name: '蓝底白字', fg: '#ffffff', bg: '#1890ff' },
    { name: '绿底白字', fg: '#ffffff', bg: '#52c41a' },
];

export const QRCodeGenerator: React.FC = () => {
    const [text, setText] = useState('');
    const [size, setSize] = useState(200);
    const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [icon, setIcon] = useState<string | null>(null);
    const [iconSize, setIconSize] = useState(40);
    const [showIcon, setShowIcon] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);
    const [renderType, setRenderType] = useState<"Png" | "Svg">('Png');

    const handleCopy = () => {
        if (!text) {
            message.warning('请输入内容后复制');
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => message.success('内容已复制'))
            .catch(() => message.error('复制失败'));
    };

    const handleClear = () => setText('');
    function doDownload(url: string, fileName: string) {
        const a = document.createElement('a');
        a.download = fileName;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    const handleDownload = () => {
        const container = qrRef.current;
        if (!container) {
            message.error('二维码未生成');
            return;
        }
        let downloadUrl: string;
        let filename: string;
        if (renderType === 'Png') {
            // PNG 格式：从 canvas 获取 base64 数据
            const canvas = container.querySelector<HTMLCanvasElement>('canvas');
            if (!canvas) {
                message.error('二维码画布未找到');
                return;
            }
            downloadUrl = canvas.toDataURL('image/png');
            filename = 'qrcode.png';

        } else {
            // SVG 格式：序列化 SVG 并生成 Blob URL
            const svg = container.querySelector<SVGSVGElement>('svg');
            if (!svg) {
                message.error('二维码 SVG 未找到');
                return;
            }
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            downloadUrl = URL.createObjectURL(blob);
            filename = 'qrcode.svg';
        }

        // 触发浏览器下载
        doDownload(downloadUrl, filename);
    };


    return (
        <div style={{ maxWidth: 1200, margin: 'auto', padding: 24 }}>
            <Row gutter={24}>
                {/* 左侧二维码显示区域 */}
                <Col xs={24} md={12}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div
                            ref={qrRef}
                            style={{
                                display: 'inline-block',
                                background: bgColor,
                                padding: 16,
                                borderRadius: 12,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            {text ? (
                                <QRCode
                                    value={text}
                                    size={size}
                                    errorLevel={errorLevel}
                                    type={renderType === 'Png' ? 'canvas' : 'svg'}
                                    color={fgColor}
                                    bgColor={bgColor}
                                    // 添加图标相关属性
                                    {...(showIcon && icon ? {
                                        icon,
                                        iconSize
                                    } : {})}

                                />
                            ) : (
                                <div
                                    style={{
                                        width: 200,
                                        height: 200,
                                        lineHeight: `200px`,
                                        border: '1px dashed #ccc',
                                        color: '#999',
                                        borderRadius: 8,
                                        userSelect: 'none',
                                    }}
                                >
                                    请输入内容生成二维码
                                </div>
                            )}
                        </div>

                    </div>
                    <Segmented
                        options={['Png', 'Svg']}
                        style={{ marginBottom: 16 }}
                        shape="round"
                        value={renderType}
                        onChange={setRenderType} />
                    <TextArea
                        rows={4}
                        placeholder="请输入需要生成二维码的内容"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        allowClear
                        style={{ marginBottom: 16 }}
                    />

                    <Space wrap style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
                        <Button onClick={handleClear} icon={<CloseOutlined />}>清空</Button>
                        <Button type="primary" onClick={handleCopy} icon={<CopyOutlined />}>复制内容</Button>
                        <Button onClick={handleDownload} icon={<DownloadOutlined />}>下载二维码</Button>
                    </Space>
                </Col>

                {/* 右侧配置区域 */}
                <Col xs={24} md={12}>
                    <Divider orientation="left">二维码配置</Divider>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ width: 80 }}>尺寸:</label>
                                <Input
                                    type="number"
                                    min={64}
                                    max={512}
                                    value={size}
                                    onChange={e => setSize(Number(e.target.value))}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ width: 80 }}>纠错等级:</label>
                                <Select
                                    value={errorLevel}
                                    onChange={v => setErrorLevel(v)}
                                    style={{ flex: 1 }}
                                >
                                    <Option value="L">L（7%）</Option>
                                    <Option value="M">M（15%）</Option>
                                    <Option value="Q">Q（25%）</Option>
                                    <Option value="H">H（30%）</Option>
                                </Select>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ width: 80 }}>前景色:</label>
                                <ColorPicker
                                    value={fgColor}
                                    onChangeComplete={color => setFgColor(color.toHexString())}
                                    placement="bottomLeft"
                                    style={{ flex: 1 }}
                                    // 在ColorPicker中添加预设颜色
                                    presets={[
                                        {
                                            label: '推荐颜色',
                                            colors: colorPresets.map(preset => preset.fg),
                                        },
                                    ]}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ width: 80 }}>背景色:</label>
                                <ColorPicker
                                    value={bgColor}
                                    onChangeComplete={color => setBgColor(color.toHexString())}
                                    placement="bottomLeft"
                                    style={{ flex: 1 }}
                                    // 在ColorPicker中添加预设颜色
                                    presets={[
                                        {
                                            label: '推荐颜色',
                                            colors: colorPresets.map(preset => preset.bg),
                                        },
                                    ]}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ width: 80 }}>显示图标:</label>
                                <Switch
                                    checked={showIcon}
                                    onChange={setShowIcon}
                                    style={{ marginLeft: 8 }}
                                />
                            </div>
                        </Col>
                        {showIcon && (
                            <>
                                <Col xs={24} sm={12}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <label style={{ width: 80 }}>图标尺寸:</label>
                                        <Input
                                            type="number"
                                            min={20}
                                            max={100}
                                            value={iconSize}
                                            onChange={e => setIconSize(Number(e.target.value))}
                                        />
                                    </div>
                                </Col>
                                <Col xs={24}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <label style={{ width: 80 }}>图标上传:</label>
                                        <Upload
                                            beforeUpload={(file) => {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setIcon(e.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                                return false;
                                            }}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined />}>选择图标</Button>
                                        </Upload>
                                        {icon && (
                                            <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center' }}>
                                                <img src={icon} alt="预览" style={{ width: 40, height: 40 }} />
                                                <Button
                                                    type="text"
                                                    icon={<CloseOutlined />}
                                                    onClick={() => setIcon(null)}
                                                    style={{ color: 'red' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );
};