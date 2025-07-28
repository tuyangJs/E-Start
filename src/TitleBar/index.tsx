import React, { useEffect, useState } from 'react';
import { EnvironmentOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import {
    Button, Divider, Flex, Segmented,
    Skeleton, ThemeConfig, Tooltip
} from 'antd';
import { AliasToken } from 'antd/es/theme/internal';
import LogoSvg from "@/assets/logo.svg?react";
import { restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';

import usePageTitle from '@/mod/PageTitle';
import { useAsyncEffect, useRequest } from 'ahooks';
import { invoke } from '@tauri-apps/api/core';
import { useLocation, useNavigate } from "react-router-dom";
import Logo from './Logo';
import { useMsStoreApp } from '@/mod/useMsStoreApp';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedTitle } from './AnimatedTitle';
import { TitleButton } from './TitleButton';


interface Props {
    config: AliasToken;
    themeDack: boolean;
    Themeconfig: ThemeConfig;
    eFiles: string;
    loading: boolean;
}

let WinS = true;
if (WinS) {
    WinS = false;
    restoreStateCurrent(StateFlags.ALL);
}


const upWindowTitle = async (PageTitle: string) => {
    const appWindow = window.appWindow;
    if (typeof PageTitle === "string") {
        await appWindow.setTitle(PageTitle);
    }
};
let times: any = null
const App: React.FC<Props> = ({ config, themeDack, eFiles, loading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMaximized, setisMaximized] = useState(false)
    const [hoverHeader, setHoverHeader] = useState(false);
    const [hoverBtn, setHoverBtn] = useState(false);
    const FULL_BTN_COUNT = TitleButton(isMaximized).length;
    const BUTTON_SIZE = 32; // 单个按钮估算宽度（含 padding/margin）
    const FULL_WIDTH = FULL_BTN_COUNT * BUTTON_SIZE + (FULL_BTN_COUNT - 1) * 4;
    const COLLAPSED_WIDTH = BUTTON_SIZE; // 只留一个占位符
    useEffect(() => {
        const appWindow = window.appWindow
        const fetchWindowData = async () => {
            const isMaximized = await appWindow.isMaximized();
            setisMaximized(isMaximized)
        };
        fetchWindowData();
        // 监听窗口大小变化
        clearTimeout(times);
        times = setTimeout(() => {
            appWindow.onResized(async () => {
                const isMaximized = await appWindow.isMaximized()
                setisMaximized(isMaximized)
            });
        }, 500);
    }, []);
    // 当 loading 完成后才启用 MS Store 请求
    const { info, loading: Tileload } = useMsStoreApp(
        '9N2RQBRN2TRF', 'US', 'zh-CN', 'zh-CN', 'Windows.Desktop', !loading
    );



    const PageTitle = usePageTitle();
    const { run } = useRequest(upWindowTitle, {
        debounceWait: 1000,
        manual: true,
    });
    useAsyncEffect(async () => {
        run(PageTitle)
    }, [PageTitle])
    async function changeTheme() {
        const appWindow = window.appWindow;
        appWindow.setTheme(themeDack ? 'light' : 'dark');
    }

    document.title = info?.ProductTitle || '易语言项目管理器';

    return (

        <Flex
            className="drag-region header_s"
            gap="small"
            justify='space-between'
            data-tauri-drag-region

        >
            <AnimatePresence mode="wait">
                {/* 左侧 Logo + 标题 */}
                <Flex
                    className='ant-segmented ant-segmented-shape-round vague'
                    align='center'
                    gap={6}
                    style={{
                        display: 'flex',
                        paddingInline: 8,
                        height: 32,
                        zIndex: 9999
                    }}
                    onMouseEnter={() => setHoverHeader(true)}
                    onMouseLeave={() => setHoverHeader(false)}
                >
                    <Logo loading={loading} Logosvg={LogoSvg} />

                    {(Tileload || loading) ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Skeleton paragraph={false} round title={{ width: 125 }} active />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="title"
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', maxWidth: 'calc(100vw - 222px)' }}
                        >
                            <AnimatedTitle title={document.title} />
                        </motion.div>
                    )}

                    {/* 这里：只有 hoverHeader 为 true 时才渲染按钮，并加动画 */}
                    {/* 只有 hoverHeader 为 true 时才展开宽度，带动画 */}
                    <motion.div
                        key="open-btn-wrapper"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: hoverHeader ? 24 : 0,
                            opacity: hoverHeader ? 1 : 0,
                            transition: { duration: 0.3 }
                        }}
                        style={{
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Tooltip title="打开易IDE目录">
                            <Button
                                size='small'
                                type="text"
                                shape="circle"
                                icon={<EnvironmentOutlined />}
                                onClick={() => invoke('reveal_file', { filePath: eFiles })}
                            />
                        </Tooltip>
                    </motion.div>

                </Flex>
            </AnimatePresence>
            {/* 中间导航 Segmented */}
            <Flex justify='center' style={{ width: '100%', position: "absolute" }}>
                <Segmented
                    className='ant-segmented ant-segmented-shape-round vague'
                    style={{ boxShadow: config?.boxShadowSecondary }}
                    shape="round"
                    value={location.pathname}
                    options={[
                        { value: '/', label: '首页' },
                        { value: '/nav', label: '快捷导航' },
                        { value: '/tool', label: '工具' },
                        { value: '/about', label: '关于' },
                    ]}
                    onChange={(value) => navigate(value as string)}
                />
            </Flex>

            {/* 右侧主题切换 + 窗口控制 */}
            <Flex
                align='center'
                gap='small'
                justify='flex-end'
                style={{ width: "100%", height: 32 }}>
                <Segmented
                    className='vague'
                    shape="round"
                    style={{ boxShadow: config?.boxShadowSecondary }}
                    block
                    value={themeDack ? 'Moon' : 'Sun'}
                    options={[
                        { value: 'Moon', icon: <MoonOutlined /> },
                        { value: 'Sun', icon: <SunOutlined /> },
                    ]}
                    onChange={changeTheme}
                />

                <Flex
                    className='ant-segmented ant-segmented-shape-round vague'
                    align='center'
                    onMouseEnter={() => setHoverBtn(true)}
                    onMouseLeave={() => setHoverBtn(false)}
                    style={{
                            boxShadow: config?.boxShadowSecondary
                    }}
                >
                    <motion.div
                        layout
                        animate={{
                            width: hoverBtn ? FULL_WIDTH : COLLAPSED_WIDTH,
                            opacity: 1,
                            transition: { duration: 0.25, ease: "easeInOut" }
                        }}
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {hoverBtn
                            ? // 展开：渲染所有按钮
                            TitleButton(isMaximized).map((item, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Divider type='vertical' style={{ margin: '0 4px' }} />}
                                    <Button
                                        className='titlebar ant-segmented-item-label'
                                        variant="text"
                                        size='small'
                                        {...item}
                                    />
                                </React.Fragment>
                            ))
                            : // 折叠：只渲染第一个按钮占位
                            <Button
                                className='titlebar ant-segmented-item-label'
                                variant="text"
                                size='small'
                                {...TitleButton(isMaximized)[2]}
                                style={{ pointerEvents: 'none', opacity: 0.6 }}
                            />
                        }
                    </motion.div>
                </Flex>
            </Flex>
        </Flex>

    );
};

export default App;
