import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Flex, Typography } from 'antd';
import { tab1, tab2, tab3 } from './LinkData';
import { AnimatePresence, motion } from 'framer-motion';
import { createAndClickLink } from '@/mod/createAndClickLink';
import { useNavigate, useLocation } from 'react-router-dom';
import { setTheme } from '@tauri-apps/api/app';
const tabList = [
    {
        key: 'tab1',
        tab: '社区',
    },
    {
        key: 'tab2',
        tab: '资源',
    },
    {
        key: 'tab3',
        tab: '设计',
    },
];
const LinkData = { tab1, tab2, tab3 }
const getLinkData = (key: string) => {
    return LinkData[key as keyof typeof LinkData];
}
const { Meta } = Card;
const { Paragraph } = Typography;
const springConfig = {
    stiffness: 450,    // 刚度 - 值越大动画越"硬"
    damping: 40,       // 阻尼 - 值越大弹性越小
    mass: 0.3,         // 质量 - 影响动画的"重量感"
};
const MainAnimation = {
    initial: {
        width: 0,
        filter: "blur(5px)",

    },
    animate: {
        width: "100%",
        height: "100%",
        filter: "blur(0px)",
    },
    exit: {
        width: 0,
        filter: "blur(5px)",
    },
    transition: springConfig
};
const CardMotion = {
    initial: {
        filter: "blur(5px)",
        opacity: 0,
        x: 200,
    },
    animate: {
        filter: "blur(0px)",
        opacity: 1,
        x: 0
    },
    exit: {
        filter: "blur(5px)",
        transform: "scale(0.2)",
        opacity: 0,
    }
}
const App: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    // 当 URL 改变时更新状态
    useEffect(() => {
        const newData = queryParams.get('key') || 'tab1';
        setActiveTabKey(newData);
    }, [location.search]);
    const updateUrlParams = (key: string) => {
        const params = new URLSearchParams();
        params.set('key', key);

        navigate({
            pathname: location.pathname,
            search: params.toString()
        }, { replace: true });
    };
    return (
        <>
            <AnimatePresence>
                {/* Filelist 容器 - 添加弹性宽度动画 */}
                <motion.div
                    {...MainAnimation}
                >
                    <Card
                        style={{ width: '100%', minHeight: '100%' }}
                        tabList={tabList}
                        activeTabKey={activeTabKey}
                        onTabChange={updateUrlParams}
                        className='link-card'
                        tabBarExtraContent={<Button disabled>编辑</Button>}
                    >
                        <Flex gap={8} wrap>
                            {

                                getLinkData(activeTabKey).map((item, index) => (
                                    <motion.div
                                        key={activeTabKey + index}
                                        transition={{
                                            type: "spring", // Use spring for elastic effect
                                            stiffness: 290,    // 刚度 - 值越大动画越"硬"
                                            damping: 30,       // 阻尼 - 值越大弹性越小
                                            mass: 0.3,
                                            delay: index * 0.1,
                                        }}
                                        {...CardMotion}
                                    >
                                        <Card
                                            style={{ width: 300 }}
                                            key={index}
                                            hoverable
                                            onClick={() =>
                                                createAndClickLink(item?.url)
                                            }
                                        >
                                            <Meta
                                                avatar={<Avatar src={item.avatar} />}
                                                title={item.title}
                                                description={

                                                    <Paragraph
                                                        ellipsis={{
                                                            rows: 2,
                                                        }}
                                                        type='secondary'
                                                    >
                                                        {
                                                            item.description}
                                                    </Paragraph>
                                                }
                                            />
                                        </Card>
                                    </motion.div>

                                ))

                            }

                        </Flex>

                    </Card>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default App;