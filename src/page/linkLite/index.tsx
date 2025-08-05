import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Button, Card, Typography } from 'antd';
import { tab1, tab2, tab3 } from './LinkData';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { createAndClickLink } from '@/mod/createAndClickLink';
import { useNavigate, useLocation } from 'react-router-dom';

const tabList = [
    { key: 'tab1', tab: '社区' },
    { key: 'tab2', tab: '资源' },
    { key: 'tab3', tab: '设计' },
];
const LinkData = { tab1, tab2, tab3 };
const getLinkData = (key: string) => LinkData[key as keyof typeof LinkData];
const { Meta } = Card;
const { Paragraph } = Typography;

// 弹簧配置
import type { AnimationGeneratorType } from "framer-motion";
const springConfig = { type: "spring" as AnimationGeneratorType, stiffness: 300, damping: 20, bounce: 0.1 };

// 创建可悬浮卡片组件
const HoverableCard = ({ item }: { item: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const collapsedHeight = 140;

    return (
        <motion.div
            layout
            transition={springConfig}
            style={{
                position: 'relative',
                height: collapsedHeight,
                width: 316
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 静态卡片，用于保持布局 */}
            <motion.div
                animate={{ opacity: isHovered ? 0 : 1}}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
            >
                <Card hoverable style={{ overflow: 'hidden' }}>
                    <Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={item.title}
                        description={
                            <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ margin: 0, lineHeight: 1.5 }}>
                                {item.description}
                            </Paragraph>
                        }
                    />
                </Card>
            </motion.div>
            {/* 悬浮卡片层 */}
            <motion.div
                initial={{ opacity: 0, y: 0, scale: 1}}
                animate={isHovered ? { opacity: 1, y: -8, scale: 1.02 } : { opacity: 0, y: 0, scale: 1}}
                transition={springConfig}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    pointerEvents: isHovered ? 'auto' : 'none',
                }}
            >
                <Card hoverable onClick={() => createAndClickLink(item.url)} style={{ overflow: 'visible' }}>
                    <Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={item.title}
                        description={
                            <Paragraph type="secondary" style={{ margin: 0, lineHeight: 1.5 }}>
                                {item.description}
                            </Paragraph>
                        }
                    />
                </Card>
            </motion.div>
        </motion.div>
    );
};

const App: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState('tab1');
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { search, pathname } = useLocation();

    // 处理URL参数变化
    useEffect(() => {
        const params = new URLSearchParams(search);
        setActiveTabKey(params.get('key') || 'tab1');
    }, [search]);

    const updateUrlParams = (key: string) => {
        navigate({ pathname, search: `?key=${key}` }, { replace: true });
    };

    return (
        <motion.div
            ref={containerRef}
            style={{ overflow: 'visible' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                style={{ width: '100%', overflow: 'visible' }}
                tabList={tabList}
                activeTabKey={activeTabKey}
                onTabChange={updateUrlParams}
                tabBarExtraContent={<Button disabled>编辑</Button>}
            >
                <LayoutGroup>
                    <motion.div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                        layout
                        transition={springConfig}
                    >
                        <AnimatePresence mode="popLayout">
                            {getLinkData(activeTabKey).map((item, idx) => (
                                <motion.div
                                    key={`${activeTabKey}-${idx}`}
                                    layout
                                    layoutId={`card-${activeTabKey}-${idx}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        transition: {
                                            ...springConfig,
                                            delay: idx * 0.05
                                        }
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={springConfig}
                                >
                                    <HoverableCard item={item} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </LayoutGroup>
            </Card>
        </motion.div>
    );
};

export default App;