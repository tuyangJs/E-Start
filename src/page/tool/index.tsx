import React from 'react';
import { Tabs, TabsProps } from 'antd';
import { ConvertCode } from './convertCode';
import { RegexTester } from './regular';
import { CryptoTool } from './des';
import { JsonViewer } from './JSONTreeTool';
import { QRCodeGenerator } from './QRCode.tsx';
import HttpRequestTool from './http';
import PasswordGenerator from './PasswordGenerator';
import Moment from './moment';
const items: TabsProps['items'] = [
    {
        key: '0',
        label: 'HTTP客户端',
        children: <HttpRequestTool />,
    },
    {
        key: '1',
        label: '编码转换',
        children: <ConvertCode />,
    },
    {
        key: '2',
        label: '正则表达式',
        children: <RegexTester />,
    },
    {
        key: '3',
        label: '加解密',
        children: <CryptoTool />,
    },
    {
        key: '4',
        label: 'json解析',
        children: <JsonViewer />,

    },
    {
        key: '5',
        label: 'QR码生成',
        children: <QRCodeGenerator />,
    },
    {
        key: '6',
        label: '时间戳转换',
        children: <Moment />,

    },
    {
        key: '7',
        label: '密码生成',
        children: <PasswordGenerator />,

    }
];
export const ToolPage: React.FC = () => (
    <Tabs
        defaultActiveKey="0"
        centered
        tabPosition="left"
        items={items}
        tabBarStyle={{ position: "relative" }}
    />

);
