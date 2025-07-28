import { FolderOpenOutlined, FolderOutlined, HeartOutlined, LinkOutlined, } from "@ant-design/icons";
import { GetFileinfo } from "@/mod/FileGet";
import { Dropdown, MenuProps, Tooltip, Typography } from "antd";
const getitems: () => MenuProps['items'] = () => (
    [
        {
            key: 'open',
            label: "打开项目",
            icon: <FolderOutlined />
        },
        {
            key: 'star',
            label: "收藏项目",
            icon: <HeartOutlined />
        },
        {
            type: 'divider',
        },
        {
            key: 'openDir',
            label: "打开项目目录",
            icon: <FolderOpenOutlined />
        },
        {
            key: 'copy',
            label: "复制项目路径",
            icon: <LinkOutlined />
        }
    ])

export type TableListItem = {
    type?: string;
    key: number;
    name: React.ReactNode;
    containers: number;
    creator: string;
    status: string;
    createdAt?: number;
    updatedAt?: number;
    size: number;
    path: string
};
const { Text, Link } = Typography;
export const RenderingList = async (
    data: string[],
    onDropdown: (key: string, path: string) => Promise<void>,
    tabs: string
) => {
    const tableListDataSource: TableListItem[] = [];
    const fileItems = data?.map(path => {
        return {
            path,
            name: path.split('\\').pop() || path
        };
    });

    for (let i = 0; i < fileItems.length; i += 1) {
        const item = fileItems[i];
        const Fileinfo = await GetFileinfo(item.path);
        const items = getitems();
        // 确保只操作有 label 的 MenuItemType 类型
        if (tabs !== 'tab1' && items) {
            const starItem = items.find(it => it && typeof it !== 'string' && 'key' in it && it.key === 'star');
            if (starItem && !('type' in starItem)) { // 排除 divider
                starItem.label = "取消收藏";
                starItem.key = "remove"
            }
        }
        tableListDataSource.push({
            key: i,
            name: (
                <Dropdown menu={{ items, onClick: e => onDropdown(e.key, item.path) }} trigger={['contextMenu']}>
                    <Tooltip
                        placement="bottomRight"
                        color={"orange"}
                        title={!Fileinfo?.isFile && <Text type="danger">文件丢失</Text>}
                    >
                        {Fileinfo?.isFile ? (
                            <Link
                                onDoubleClick={() => onDropdown('open', item.path)}
                                style={{
                                    userSelect: "none"
                                }}
                            >{item.name}</Link>
                        ) : (
                            <Text type='secondary'>{item.name}</Text>
                        )}
                    </Tooltip>
                </Dropdown>
            ),
            containers: Math.floor(Math.random() * 20),
            creator: '',
            status: Fileinfo.isFile ? 'running' : 'close',
            createdAt: Fileinfo.isFile ? Fileinfo?.birthtime?.getTime() : undefined,
            updatedAt: Fileinfo.isFile ? Fileinfo?.mtime?.getTime() : undefined,
            size: Fileinfo.size,
            path: item.path
        });
    }

    return tableListDataSource;
};