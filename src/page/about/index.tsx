import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import { version as antdVersion } from 'antd';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { useMsStoreApp } from '@/mod/useMsStoreApp';



function getWebViewVersion() {
    const ua = navigator.userAgent;
    const edgeMatch = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    return edgeMatch ? edgeMatch[1] : 'Unknown';
}

const AboutCard: React.FC = () => {
    const { info, loading: loadingStore } = useMsStoreApp(
        '9N2RQBRN2TRF',
        'US',
        'zh-CN',
        'zh-CN',
        'Windows.Desktop',
        true

    );
    console.log(info);
    
    const [expanded, setExpanded] = useState(false);
    const [appVersion, setAppVersion] = useState<string>('—');
    const [buildTs, setBuildTs] = useState<string>('—');
    const [loadingMeta, setLoadingMeta] = useState(true);

    useEffect(() => {
        // 并行拉取本地版本和构建时间戳
        Promise.all([
            getVersion().catch(() => '0.0.0'),
            invoke<string>('build_timestamp').catch(() => '—'),
        ])
            .then(([ver, ts]) => {
                setAppVersion(ver);
                setBuildTs(ts);
            })
            .finally(() => {
                setLoadingMeta(false);
            });
    }, []);

    if (loadingMeta || loadingStore) {
        return <Spin tip="加载中…" style={{ width: '100%', padding: 48 }} />;
    }
    const items: DescriptionsProps['items'] = [
        {
            key: 'name',
            label: '项目名称',
            children: info?.ProductTitle || '易语言项目管理器',
            span: 4,
        },
        {
            key: 'store-pub',
            label: '发布者',
            children: info?.Publisher || 'Tuyang',
            span: 4,
        },

        {
            key: 'store-desc',
            label: '应用简介',
            children: <Typography.Paragraph
                ellipsis={{
                    rows: 4,
                    expandable: 'collapsible',
                    expanded,
                    onExpand: (_, info) => setExpanded(info.expanded),
                }}
                style={{ whiteSpace: 'pre-wrap' }}
            >{info?.Description}
            </Typography.Paragraph>,
            span: 4,
        },

        {
            key: 'store-link',
            label: '商店地址',
            children: (
                <a href="https://apps.microsoft.com/detail/9N2RQBRN2TRF" target="_blank" rel="noreferrer">
                    https://apps.microsoft.com/detail/9N2RQBRN2TRF
                </a>
            ),
            span: 4,
        },
        {
            key: 'version',
            label: '程序版本',
            children: `v${appVersion}`,
            span: 2,
        },
        {
            key: 'build',
            label: '构建号',
            children: buildTs,
            span: 2,
        },
        {
            key: 'webview',
            label: 'WebView 版本',
            children: getWebViewVersion(),
            span: 2,
        },
        {
            key: 'antd',
            label: 'Ant Design 版本',
            children: antdVersion,
            span: 2,
        },

    ];


    return (
        <Card styles={{ body: { padding: 0 } }} variant="borderless" >
            <Descriptions bordered items={items} column={4} />
        </Card>
    );
};

export default AboutCard;
