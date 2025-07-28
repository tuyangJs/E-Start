import React, { useState, useMemo } from 'react';
import {
    Form, Input, Select, Button, Row, Col,
    Tabs, Upload, Switch, Card,
    Radio
} from 'antd';
import {
    UploadOutlined, PlusOutlined, DeleteOutlined,
    SendOutlined
} from '@ant-design/icons';
import {
    HttpMethod, BodyType, ProxyType,

    RequestBody, ProxyConfig
} from './httpTypes';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface RequestFormProps {
    onSubmit: (values: any) => void;
    loading: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, loading }) => {
    const [form] = Form.useForm();
    const [bodyType, setBodyType] = useState<BodyType>('none');
    const [proxyType, setProxyType] = useState<ProxyType>('none');

    const initialValues = useMemo(() => ({
        url: 'https://jsonplaceholder.typicode.com/posts',
        method: 'GET' as HttpMethod,
        params: [],
        headers: [],
        cookies: [],
        body: {
            type: 'none',
            json: '{}',
            formData: [],
            urlEncoded: [{ key: '', value: '', enabled: true }],
            graphQL: { query: '', variables: '{}' },
            binary: null,
            xml: '<root>\n</root>',
            raw: '',
            msgpack: null,
        } as RequestBody,
        proxy: {
            type: 'none',
            host: '',
            port: 8080,
            username: '',
            password: '',
        } as ProxyConfig,
        useTauri: true,
    }), []);

    const bodyTypes = [
        { value: 'none', label: '无' },
        { value: 'json', label: 'JSON' },
        { value: 'form-data', label: '表单数据' },
        { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
        { value: 'GraphQL', label: 'GraphQL' },
        { value: 'binary', label: '二进制' },
        { value: 'xml', label: 'XML' },
        { value: 'raw', label: '原始数据' },
        { value: 'msgpack', label: 'MessagePack' },
    ];

    const proxyTypes = [
        { value: 'none', label: '无代理' },
        { value: 'http', label: 'HTTP 代理' },
        { value: 'socks5', label: 'SOCKS5 代理' },
    ];

    const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

    const renderKeyValueFields = (
        name: string[]
    ) => (
        <Form.List name={name}>
            {(fields, { add, remove }) => (
                <div>
                    {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                            <Col span={2}>
                                <Form.Item name={[name, 'enabled']} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'key']}
                                    rules={[{ required: true, message: '请填写key名称' }]}
                                >
                                    <Input placeholder="Key名称" />
                                </Form.Item>
                            </Col>
                            <Col span={14}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'value']}
                                    rules={[{ required: true, message: '请填写key值' }]}
                                >
                                    <Input placeholder="key值" />
                                </Form.Item>
                            </Col>
                            <Col span={1}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                />
                            </Col>
                        </Row>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => add({ key: '', value: '', enabled: true })}
                        block
                        icon={<PlusOutlined />}
                    >
                        增加数据
                    </Button>
                </div>
            )}
        </Form.List>
    );

    const renderFormDataFields = () => (
        <Form.List name={['body', 'formData']}>
            {(fields, { add, remove }) => (
                <div>
                    {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                            <Col span={1}>
                                <Form.Item name={[name, 'enabled']} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'key']}
                                    rules={[{ required: true, message: 'Key is required' }]}
                                >
                                    <Input placeholder="Key" />
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'type']}
                                    initialValue="text"
                                >
                                    <Select>
                                        <Select.Option value="text">Text</Select.Option>
                                        <Select.Option value="file">File</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prev, current) =>
                                        prev.body?.formData?.[name]?.type !== current.body?.formData?.[name]?.type
                                    }
                                >
                                    {({ getFieldValue }) => {
                                        const type = getFieldValue(['body', 'formData', name, 'type']);
                                        return type === 'file' ? (
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                valuePropName="file"
                                                getValueFromEvent={e => e.file}
                                            >
                                                <Upload maxCount={1}
                                                    beforeUpload={() => {
                                                        // 直接使用文件对象，不进行上传
                                                        return false;
                                                    }}
                                                >
                                                    <Button icon={<UploadOutlined />}>Select File</Button>
                                                </Upload>
                                            </Form.Item>
                                        ) : (
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                rules={[{ required: true, message: 'Value is required' }]}
                                            >
                                                <Input placeholder="Value" />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </Col>
                            <Col span={1}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                />
                            </Col>
                        </Row>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => add({ key: '', value: '', type: 'text', enabled: true })}
                        block
                        icon={<PlusOutlined />}
                    >
                        增加数据
                    </Button>
                </div>
            )}
        </Form.List>
    );

    const renderBodyContent = () => {
        switch (bodyType) {
            case 'json':
                return (
                    <Form.Item name={['body', 'json']}>
                        <TextArea rows={8} placeholder="JSON data" />
                    </Form.Item>
                );

            case 'form-data':
                return renderFormDataFields();

            case 'x-www-form-urlencoded':
                return renderKeyValueFields(['body', 'urlEncoded']);

            case 'GraphQL':
                return (
                    <>
                        <Form.Item
                            name={['body', 'graphQL', 'query']}
                            label="Query"
                        >
                            <TextArea rows={6} placeholder="GraphQL query" />
                        </Form.Item>
                        <Form.Item
                            name={['body', 'graphQL', 'variables']}
                            label="Variables"
                        >
                            <TextArea rows={4} placeholder="JSON variables" />
                        </Form.Item>
                    </>
                );

            case 'binary':
                return (
                    <Form.Item name={['body', 'binary']}>
                        <Upload maxCount={1}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                );

            case 'xml':
                return (
                    <Form.Item name={['body', 'xml']}>
                        <TextArea rows={8} placeholder="XML data" />
                    </Form.Item>
                );

            case 'raw':
                return (
                    <Form.Item name={['body', 'raw']}>
                        <TextArea rows={8} placeholder="Raw text" />
                    </Form.Item>
                );

            case 'msgpack':
                return (
                    <Form.Item name={['body', 'msgpack']}>
                        <Upload maxCount={1}>
                            <Button icon={<UploadOutlined />}>Select MessagePack File</Button>
                        </Upload>
                    </Form.Item>
                );

            case 'none':
            default:
                return <p>This request does not have a body</p>;
        }
    };

    return (
        <Card >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={onSubmit}

            >
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item
                            label="URL"
                            name="url"
                            rules={[{ required: true, message: 'URL is required' }]}
                        >
                            <Input placeholder="https://example.com/api" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            label="请求方法"
                            name="method"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                {methods.map(method => (
                                    <Select.Option key={method} value={method}>
                                        {method}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SendOutlined />}
                                loading={loading}
                            >
                                发送
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="参数" key="1">
                        {renderKeyValueFields(['params'])}
                    </TabPane>
                    <TabPane tab="请求头" key="2">
                        {renderKeyValueFields(['headers'])}
                    </TabPane>
                    <TabPane tab="Cookies" key="3">
                        {renderKeyValueFields(['cookies'])}
                    </TabPane>
                    <TabPane tab="请求体" key="4">
                        <Form.Item
                            name={['body', 'type']}
                            label="请求体类型"
                        >
                            <Select onChange={(value: BodyType) => setBodyType(value)}>
                                {bodyTypes.map(type => (
                                    <Select.Option key={type.value} value={type.value}>
                                        {type.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {renderBodyContent()}
                    </TabPane>
                    <TabPane tab="代理" key="5">
                        <Form.Item
                            name={['proxy', 'type']}
                            label="代理类型"
                        >
                            <Select onChange={(value: ProxyType) => setProxyType(value)}>
                                {proxyTypes.map(type => (
                                    <Select.Option key={type.value} value={type.value}>
                                        {type.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {proxyType !== 'none' && (
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['proxy', 'host']}
                                        label="Host"
                                        rules={[{ required: true, message: 'Host is required' }]}
                                    >
                                        <Input placeholder="proxy.example.com" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['proxy', 'port']}
                                        label="Port"
                                        rules={[{ required: true, message: 'Port is required' }]}
                                        initialValue={8080}
                                    >
                                        <Input type="number" min={1} max={65535} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['proxy', 'username']}
                                        label="Username"
                                    >
                                        <Input placeholder="Username" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['proxy', 'password']}
                                        label="Password"
                                    >
                                        <Input.Password placeholder="Password" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </TabPane>
                    <TabPane tab="请求模式" key="6">
                        <Form.Item
                            name="useTauri"
                        >
                            <Radio.Group>
                                <Radio value={false}>浏览器</Radio>
                                <Radio value={true}>程序</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </Form>
        </Card>
    );
};

export default RequestForm;