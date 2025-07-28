import React from 'react';
import { Card, Tabs, Collapse, Descriptions, Tag, Typography, Spin, Input } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { HttpResponse } from './httpTypes';
import { formatResponseSize } from './httpUtils';
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text } = Typography;

interface ResponseViewProps {
    response: HttpResponse | null;
    loading: boolean;
    error: string | null;
}
const { TextArea } = Input
const ResponseView: React.FC<ResponseViewProps> = ({ response, loading, error }) => {
    const renderHeaders = () => {
        if (!response || !response.headers) return null;

        return Object.entries(response.headers).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
                {value}
            </Descriptions.Item>
        ));
    };

    const renderBody = () => {
        if (!response) return null;

        const contentType = response.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
            return (
                <TextArea
                    rows={8}
                    value={JSON.stringify(response.body, null, 2)}

                    placeholder="结果在此显示"

                />
            );
        }

        if (contentType.includes('text/') || contentType.includes('application/xml')) {
            return (
                <TextArea
                    rows={8}
                    value={typeof response.body === 'string' ? response.body : String(response.body)}

                    placeholder="结果在此显示"
                />
            );
        }

        if (contentType.includes('image/')) {
            return <img src={URL.createObjectURL(response.body)} alt="Response" style={{ maxWidth: '100%' }} />;
        }

        return (
            <div>
                <p>Binary content ({formatResponseSize(response.size)})</p>
                <p>Content-Type: {contentType}</p>
            </div>
        );
    };

    return (
        <Card title="响应结果" bordered={false} style={{ marginTop: 16 }}>
            {loading && <Spin tip="Sending request..." size="large" />}

            {error && (
                <div style={{ color: '#ff4d4f' }}>
                    <Text strong>Error:</Text> {error}
                </div>
            )}

            {response && !loading && (
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Body" key="1">
                        {renderBody()}
                    </TabPane>
                    <TabPane tab="Headers" key="2">
                        <Collapse
                            bordered={false}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                        >
                            <Panel header="响应请求头" key="1">
                                <Descriptions bordered column={1} size="small">
                                    {renderHeaders()}
                                </Descriptions>
                            </Panel>
                            <Panel header="响应信息" key="2">
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="状态">
                                        <Tag color={response.status >= 400 ? '#ff4d4f' : '#52c41a'}>
                                            {response.status} {response.statusText}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="耗时">
                                        {response.time} ms
                                    </Descriptions.Item>
                                    <Descriptions.Item label="流量">
                                        {formatResponseSize(response.size)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Panel>
                        </Collapse>
                    </TabPane>
                    <TabPane tab="Cookies" key="3">
                        <p>Cookie将在此处显示</p>
                    </TabPane>
                </Tabs>
            )}
        </Card>
    );
};

export default ResponseView;