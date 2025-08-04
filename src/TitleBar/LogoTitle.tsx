import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { invoke } from "@tauri-apps/api/core";
import { Flex, Skeleton, Tooltip, Button, Space } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";
import Logo from "./Logo";
import { FC, useState } from "react";
import LogoSvg from "@/assets/logo.svg?react";
import { useMsStoreApp } from "@/mod/useMsStoreApp";
import { AppMainStore } from "@/mod/store";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "./useNavigationState";
/* 左侧 Logo + 标题 */
export interface LogoTitleProps {
    loading: boolean
}
export const LogoTile: FC<LogoTitleProps> = ({ loading }) => {
    const [hoverHeader, setHoverHeader] = useState(false);
    // 当 loading 完成后才启用 MS Store 请求
    const { eFiles } = AppMainStore()
    const { info, loading: Tileload } = useMsStoreApp(
        '9N2RQBRN2TRF', 'US', 'zh-CN', 'zh-CN', 'Windows.Desktop', !loading
    );

    const navigate = useNavigate();
    const { canGoBack } = useNavigationState();
    const Maintitle = info?.ProductTitle || '易语言项目管理器';

    return (
        <AnimatePresence mode="wait">
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
                <motion.div layout style={{ display: 'flex', alignItems: 'center' }}>
                    <AnimatePresence initial={false}>
                        {canGoBack && (
                            <motion.div
                                key="back-button"
                                className="no-drag"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: 'flex', alignItems: 'center', zIndex: 11 }}
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
                </motion.div>
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
                        <AnimatedTitle title={Maintitle} />
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
                            className="no-drag"
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
    )
}

