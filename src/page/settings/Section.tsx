import React from 'react';
import { Typography, Flex, Space, Card, Button, Tooltip } from 'antd';
import type { SectionItem } from './types';
import { QuestionCircleOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;
const Section: React.FC<SectionItem> = ({ title, description, control, tip }) => (
    <Card variant="borderless" styles={{ body: { padding: 16, textAlign: 'start' } }}>
        <Flex justify="space-between" align="center" gap={22}>
            <Space direction="vertical" align="start" >
                <Title
                    level={5}
                    style={{ margin: 0 }}
                >
                    {title}
                    {tip &&
                        <Tooltip title={tip}>
                            <Button 
                            type="text" 
                            size="small" 
                            shape="circle" 
                            style={{ marginLeft: 4 }}
                            icon={<QuestionCircleOutlined />} />
                        </Tooltip>
                    }
                </Title>
                {description && <Paragraph type="secondary">{description}</Paragraph>}
            </Space>
            <span>{control}</span>
        </Flex>
    </Card>
);
export default Section;