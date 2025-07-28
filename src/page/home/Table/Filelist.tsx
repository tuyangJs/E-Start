import { ProTable } from '@ant-design/pro-components';
import { Button, Input, message, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { requestFile } from '@/mod/FileGet';
import { useRequest } from 'ahooks';
import { RenderingList, TableListItem } from './RenderingList';
import { AppDataStore, AppMainStore } from '@/mod/store';
import { LeftOutlined, RightOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { columns } from './columns';
import { Timeout } from 'ahooks/lib/useRequest/src/types';
import { TabAdmin } from './addTab';
import { AddStarModal } from './addstart';
import { onDropdown } from './onDropdown';
import { AnimatePresence, motion } from 'framer-motion';
import { open } from '@tauri-apps/plugin-dialog';
import { upStar } from './upStar';

let timeoutId: Timeout
interface Props {
    setExpandFile: React.Dispatch<React.SetStateAction<boolean>>
    expandFile: boolean
}
const App: React.FC<Props> = ({ setExpandFile, expandFile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [Tabs, setTabs] = useState<string>("tab1");
    const [messageApi, contextHolder] = message.useMessage();
    const { star, starData, setAppData } = AppDataStore()
    const [sovalue, setSovalue] = useState<string>("");
    const { eFiles } = AppMainStore()
    const columnsData = columns(expandFile)
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [isFocused, setIsFocused] = useState(false);  // 控制 focus 状态
    const [isHovered, setIsHovered] = useState(false);  // 控制 hover 状态
    const isExpanded = isFocused || isHovered;
    const onmenu = async (key: string, path: string) => {
        onDropdown({
            key, path,
            eFiles,
            messageApi,
            Tabs,
            openAddstart,
            removeFavorite
        })
    }
    const request = async (value: any) => {
        const name = value.target.value
        const tabs = value.Tabs || Tabs
        let paths: string[] = []
        if (tabs === 'tab1') {
            paths = await requestFile(name)
        } else {
            //取当前分类下的文件列表
            paths = starData
                .filter(item => item.id === tabs)
                .map(item => item.path);
            paths = await requestFile(name,paths)
        }
        //渲染文件列表
        const tableListDataSource = await RenderingList(paths, onmenu, tabs)

        return tableListDataSource
    }
    const { data, run, loading } = useRequest(request, {
        debounceWait: 500,
        manual: true
    });
    useEffect(() => {

        run({
            target: { value: sovalue },
            tabs: Tabs
        })
        clearInterval(timeoutId);
        timeoutId = setInterval(() => {
            request({
                target: { value: sovalue },
                tabs: Tabs
            })
        }, 5000)
        return () => {
            clearInterval(timeoutId);
        }
    }, [Tabs, sovalue, expandFile, starData]);
    function removeFavorite(categoryId: string, path: string) {
        const { starData, setAppData } = AppDataStore.getState();
        // 过滤掉要删除的那一项
        const newStarData = starData.filter(
            item => !(item.id === categoryId && item.path === path)
        );
        setAppData({ starData: newStarData });
    }
    const openAddstart = (path: string) => {
        setCurrentPath(path);
        setModalOpen(true);
    };

    const tabitems = [
        {
            key: "tab1",
            label: "最近项目"
        },
        ...star.map(item => ({
            key: item.id,
            label: item.name
        }))
    ]
    function getLabelByKey(key: string): string | undefined {
        const tab = tabitems.find(item => item.key === key);
        return tab?.label;
    }
    const upTabdata = () => {
        open({
            directory: false,
            multiple: true,
            filters: [
                { name: "易语言项目", extensions: ["e"] }
            ],
            title: "选择易语言项目文件"
        }).then(file => {
            if (file) {
                const newData = upStar({ starData, selectedId: Tabs, paths: file })
                if (newData) {
                    setAppData({ starData: newData });
                    message.success('收藏成功');
                } else {
                    message.error('收藏失败');
                }
            }
        });
    }

    const actions = () => [
        <motion.div
            key="a"
            initial={{ width: 86 }}
            animate={{ width: isExpanded ? 200 : 86 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
            style={{ overflow: 'hidden' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Input.Search
                value={sovalue}
                onChange={e => setSovalue(e.target.value)}
                placeholder="搜索项目名称"
                variant="filled"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    width: '100%',
                    borderRadius: 4,
                }}
            />
        </motion.div>

        ,
        // 如果 tab !== 'tab1'，就插入这个按钮，否则展开个空数组
        ...(Tabs !== 'tab1'
            ? [
                <Button
                    key="d"
                    type="default"
                    onClick={upTabdata}
                >
                    添加项目
                </Button>
            ]
            : []),

        <Tooltip title="展开表格" placement="bottom" key="c">
            <Button
                type="text"
                shape="circle"
                onClick={() => setExpandFile(!expandFile)}
                icon={expandFile ? <LeftOutlined /> : <RightOutlined />}
            />
        </Tooltip>,
    ];

    const Motion = {
        initial: {
            filter: "blur(5px)",
            opacity: 0,
            x: 50,
        },
        animate: {
            filter: "blur(0px)",
            opacity: 1,
            x: 0
        },
        exit: {
            filter: "blur(5px)",
            transform: "scale(0.4)",
            opacity: 0,
        }
    }
    return (
        <>
            <ProTable<TableListItem>
                style={{ width: '100%', height: '100%' }}
                size='small'
                loading={loading}
                //找到标题
                headerTitle={
                    <AnimatePresence mode="wait">
                        <motion.div style={{ display: "inline-block" }} >
                            {Array.from(getLabelByKey(Tabs) || "").map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 0.3,
                                        ease: "easeOut",
                                    }}
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </motion.span>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                }
                columns={columnsData}
                dataSource={data}
                rowKey="key"
                pagination={{
                    showQuickJumper: true,
                    pageSize: 8,
                }}
                options={false}
                search={false}
                dateFormatter={(value, valueType) => {
                    console.log('====>', value, valueType);
                    return value.format('YYYY-MM-DD HH:mm:ss');
                }}
                toolbar={{
                    multipleLine: true,
                    tabs: {
                        onChange: setTabs,
                        defaultActiveKey: Tabs,
                        items: tabitems,
                    },
                    actions:
                        [<AnimatePresence mode="sync">
                            {actions().map((action) => (
                                <motion.div
                                    layout
                                    key={action.key}
                                    transition={{
                                        type: "spring", // Use spring for elastic effect
                                        stiffness: 200,    // 刚度 - 值越大动画越"硬"
                                        damping: 18,       // 阻尼 - 值越大弹性越小
                                        mass: 0.3,
                                        delay: 0,
                                    }}
                                    {...Motion}
                                >
                                    {action}
                                </motion.div>
                            ))}
                        </AnimatePresence>],
                    filter: [
                        <Tooltip title="管理分类" placement="bottom" key="q">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<UnorderedListOutlined />}
                                onClick={() => setIsModalOpen(true)}
                            />
                        </Tooltip>

                    ],

                }

                }
            />
            {contextHolder}
            <TabAdmin isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            <AddStarModal
                visible={modalOpen}
                onClose={() => setModalOpen(false)}
                path={currentPath}
            />
        </>

    );
};
export default App