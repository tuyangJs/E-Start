import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Drawer, Spin, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import { version as antdVersion } from 'antd';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { useMsStoreApp } from '@/mod/useMsStoreApp';
import { THIRD_PARTY_LICENSES } from './THIRD_PARTY_LICENSES';
import { AuthorT } from './author';



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
    const [showDrawer, setShowDrawer] = useState(false);
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
            key: 'contributor',
            label: '贡献者',
            children: <AuthorT />,
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
            key: "user-cms",
            label: "用户交流群",
            children: (
                <a href="
tencent://groupwpa/?subcmd=all&param=7B2267726F757055696E223A22373033363233373433222C2274696D655374616D70223A313735343034393133343830372C22617574684B6579223A22664633556E636D306D31535470632F7469664E7A456B7A6768562B67535968587263616B6A6E4437475778624D56714D6D4F6D53323039504F5348775A617567222C2261757468223A22227D&jump_from=" >
                    703623743
                </a>
            ),
            span: 2,
        },
        {
            key: "LICENSES",
            label: "开源软件声明",
            children: (
               <Typography.Text>
               第三方软件声明
               <Typography.Link onClick={() => setShowDrawer(true)}>点击查看</Typography.Link>
               </Typography.Text>
            ),
            span: 2,
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
        }
    ];


    return (
        <Card styles={{ body: { padding: 0 } }} variant="borderless" >
            <Descriptions bordered items={items} column={4} />
            <Drawer
                title="开源软件许可证声明"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={() => setShowDrawer(false)}
                open={showDrawer}
            >
                <THIRD_PARTY_LICENSES />
            </Drawer>
        </Card>
    );
};

export default AboutCard;
