import React from 'react';
import { Typography, Flex, Space, Card } from 'antd';
import type { SectionItem } from './types';
const { Title, Text } = Typography;
const Section: React.FC<SectionItem> = ({ title, description, control }) => (
        <Card variant="borderless" styles={{body: { padding: 16 }}}>
            <Flex justify="space-between" align="middle">
                <Space direction="vertical" align="start">
                    <Title level={5} style={{ margin: 0 }}>{title}</Title>
                    {description && <Text type="secondary">{description}</Text>}
                </Space>
                <span>{control}</span>
            </Flex>
        </Card>
);
export default Section;