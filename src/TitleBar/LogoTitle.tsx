import { EnvironmentOutlined } from "@ant-design/icons";
import { invoke } from "@tauri-apps/api/core";
import { Flex, Skeleton, Tooltip, Button } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";
import Logo from "./Logo";
import { FC, useState } from "react";
import LogoSvg from "@/assets/logo.svg?react";
import { useMsStoreApp } from "@/mod/useMsStoreApp";
import { AppMainStore } from "@/mod/store";
/* 左侧 Logo + 标题 */
export interface LogoTitleProps {
    loading: boolean
    style: React.CSSProperties
}
export const LogoTile: FC<LogoTitleProps> = ({ loading,style }) => {
    const [hoverHeader, setHoverHeader] = useState(false);
    // 当 loading 完成后才启用 MS Store 请求
    const { eFiles } = AppMainStore()
    const { info, loading: Tileload } = useMsStoreApp(
        '9N2RQBRN2TRF', 'US', 'zh-CN', 'zh-CN', 'Windows.Desktop', !loading
    );


    const Maintitle = info?.ProductTitle || '易语言项目管理器';

    return (
        <AnimatePresence mode="wait">
            <Flex
                className='ant-segmented ant-segmented-shape-round liquid-glass'
                align='center'
                gap={6}
                style={{
                    display: 'flex',
                    paddingInline: 8,
                    height: 32,
                    zIndex: 1,
                    ...style
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

