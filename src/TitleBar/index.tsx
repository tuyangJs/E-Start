import React, { useEffect, useState } from 'react';
import { ArrowLeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import {
    Button, Divider, Flex, Segmented,
    ThemeConfig
} from 'antd';
import { theme } from "antd";

import { restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '@/mod/PageTitle';
import { useAsyncEffect, useRequest } from 'ahooks';
import { AnimatePresence, motion } from 'framer-motion';
import { TitleButton } from './TitleButton';
import { Navigation } from './Navigation';
import { LogoTile } from './LogoTitle';
import { AppSetStore } from '@/mod/store';
import { useNavigationState } from './useNavigationState';

const config = theme.getDesignToken()
interface Props {
    themeDack: boolean;
    Themeconfig: ThemeConfig;
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
const App: React.FC<Props> = ({ themeDack, loading }) => {
    const navigate = useNavigate();
    const { TouchTitleBtn, TouchOverlay } = AppSetStore()
    const [isMaximized, setisMaximized] = useState(false)
    const [hoverBtn, setHoverBtn] = useState(!TouchTitleBtn);
    const FULL_BTN_COUNT = TitleButton(isMaximized).length;
    const BUTTON_SIZE = 32; // 单个按钮估算宽度（含 padding/margin）
    const FULL_WIDTH = FULL_BTN_COUNT * BUTTON_SIZE + (FULL_BTN_COUNT - 1) * 4;
    const COLLAPSED_WIDTH = BUTTON_SIZE; // 只留一个占位符
    const { canGoBack } = useNavigationState();
    useEffect(() => {
        setHoverBtn(!TouchTitleBtn);
    }, [TouchTitleBtn])
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


    return (

        <Flex
            className="drag-region header_s"
            gap={0}
            justify='space-between'
        >
            <style>
                {!TouchOverlay && `.no-drag { -webkit-app-region: no-drag;}`}
            </style>
            <motion.div
                style={{ display: 'flex', alignItems: 'center', width: 'auto', zIndex: 1 }}>
                <AnimatePresence initial={false}>
                    {canGoBack && (
                        <motion.div
                            key="back-button"
                            className="no-drag"
                            initial={{ opacity: 0, width: 0, marginRight: 0 }}
                            animate={{ opacity: 1, width: 'auto', marginRight: 8 }}
                            exit={{ opacity: 0, width: 0, marginRight: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Button
                                type="text"
                                shape="circle"
                                size="small"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}

                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <LogoTile loading={loading} />
            </motion.div >

            {/* 中间导航 Segmented */}
            {
                !loading &&
                <Flex justify='center' style={{ width: '100%', position: "absolute" }} >
                    <Navigation style={{ boxShadow: config?.boxShadowSecondary }} />
                </Flex>
            }

            {/* 右侧主题切换 + 窗口控制 */}
            <Flex
                align='center'
                gap='small'
                justify='flex-end'
                style={{ height: "100%" }}>
                <Segmented
                    className='no-drag vague'
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
                    onMouseLeave={() => setHoverBtn(!TouchTitleBtn)}
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
                        {(hoverBtn)
                            ? // 展开：渲染所有按钮
                            TitleButton(isMaximized).map((item, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Divider type='vertical' style={{ margin: '0 4px' }} />}
                                    <Button
                                        className='no-drag titlebar ant-segmented-item-label'
                                        variant="text"
                                        size='small'
                                        {...item}
                                    />
                                </React.Fragment>
                            ))
                            : // 折叠：只渲染第一个按钮占位
                            <Button
                                className='no-drag titlebar ant-segmented-item-label'
                                variant="text"
                                size='small'
                                {...TitleButton(isMaximized)[2]}
                                style={{ pointerEvents: 'none', opacity: 0.6 }}
                            />
                        }
                    </motion.div>
                </Flex>
            </Flex>
        </Flex >

    );
};

export default App;
