import { Card, Divider, Flex, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Filelist from "./Table/Filelist";
import { motion, AnimatePresence } from "framer-motion";
import { openBtn } from "./openBtn";
import { AppMainStore } from "@/mod/store";
import { saveEFiles } from "./File";
import { use } from "framer-motion/client";
import { useLocation, useNavigate } from "react-router-dom";
import { AddStarModal } from "./Table/addstart";

export interface props { }

const { Text, Paragraph } = Typography;
const BtnStyle: React.CSSProperties = {
    width: 320,
    height: 86,

};
const CardBodySy: React.CSSProperties = {
    whiteSpace: "normal",
    textAlign: "initial",
    padding: 12
}

// 定义弹性动画参数
const springConfig = {
    stiffness: 200,    // 刚度 - 值越大动画越"硬"
    damping: 30,       // 阻尼 - 值越大弹性越小
    mass: 0.3,         // 质量 - 影响动画的"重量感"
};

// 定义按钮组动画参数
const buttonGroupAnimation = {
    initial: {
        width: 0,
        filter: "blur(5px)",
        x: 100

    },
    animate: {
        width: 320,
        x: 0,
        filter: "blur(0px)",
    },
    exit: {
        width: 0,
        x: 100,
        filter: "blur(5px)",
    },
    transition: springConfig
};

const Content: React.FC<props> = () => {
    const [modal, contextHolder] = Modal.useModal();
    const { confirm } = modal;
    const [expandFile, setExpandFile] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState<string[]>();
    const { eFiles } = AppMainStore()
    const location = useLocation();
    const navigate = useNavigate();

    //解析路由eFiles参数
    const searchParams = new URLSearchParams(location.search);
    const eFilesParam = searchParams.get('eFiles');
    useEffect(() => {
        if (eFilesParam) {
            try {
                const parsedEFiles: string[] = JSON.parse(eFilesParam);
                setIsModalOpen(parsedEFiles.length > 0);
                setCurrentPath(parsedEFiles);
            } catch (error) {

            }
        }
    }, [eFilesParam]);
    const ModalonClose = () => {
         setIsModalOpen(false)
         navigate('/'); // 关闭模态框后重定向到主页
         setCurrentPath(undefined); // 清除当前路径状态
    }
    return (
        <>
            <AddStarModal onClose={ModalonClose} visible={isModalOpen} path={currentPath} />
            <Flex
                justify="space-between"
                gap={expandFile ? 0 : 32}
                style={{
                    position: "relative",
                }}>

                <AnimatePresence>
                    {/* Filelist 容器 - 添加弹性宽度动画 */}
                    <motion.div
                        key="filelist-container"
                        initial={false}
                        animate={{
                            width: expandFile ? "100%" : "calc(100% - 352px)",
                        }}
                        transition={springConfig}
                        style={{
                            flex: 1,
                            minWidth: 300,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Filelist setExpandFile={setExpandFile} expandFile={expandFile} />
                    </motion.div>

                    {/* 右侧按钮组 - 添加弹性进入/退出动画 */}

                    {!expandFile ? (
                        <motion.div
                            key="button-group"
                            {...buttonGroupAnimation}
                        >
                            <Flex
                                vertical
                                align="flex-end"
                                justify="space-between"
                                gap={16}
                                style={{
                                    height: "100%",
                                    width: 320,
                                }}
                            >
                                {openBtn.map((item, index) => (
                                    <div key={index}>
                                        {index === 1 && (
                                            <Divider key={"d-" + index}>
                                                创建项目
                                            </Divider>
                                        )}
                                        <Card
                                            style={BtnStyle}
                                            styles={{ body: CardBodySy }}
                                            hoverable
                                            onClick={() => {
                                                typeof item.onClick === "function" ? item.onClick(eFiles) :
                                                    saveEFiles(item?.file || [], confirm, eFiles)
                                            }}
                                        >
                                            <Flex
                                                style={{ width: "100%" }}
                                                gap={12}
                                                align="center"
                                            >
                                                <span>
                                                    <item.icon width={48} height={48} />
                                                </span>
                                                <Flex vertical align="flex-start">
                                                    <Text strong>{item.label}</Text>
                                                    <Paragraph
                                                        ellipsis={{ rows: 2, expandable: true }}
                                                        type="secondary"
                                                    >
                                                        {item.doc}
                                                    </Paragraph>
                                                </Flex>
                                            </Flex>
                                        </Card>
                                    </div>
                                ))}
                            </Flex>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="button-placeholder"
                            style={{ width: 0, height: 480 }}
                        />
                    )}
                </AnimatePresence>
                {contextHolder}
            </Flex>
        </>
    );
};

export default Content;