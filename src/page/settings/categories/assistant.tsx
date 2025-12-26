import { AppMainStore, TentativeStore } from "@/mod/store";
import { SectionItem } from "../types";
import { Button, Dropdown, Switch } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAsyncEffect } from "ahooks";
import { extractDirectoryPath } from "@/mod/extractDirectoryPath";
import { GetFileinfo } from "@/mod/FileGet";
import { remove } from "@tauri-apps/plugin-fs";
import { createAndClickLink } from "@/mod/createAndClickLink";
const Themeitems: { label: string; key: string }[] = [
    {
        label: '跟随系统',
        key: '1',
    },
    {
        label: '浅色主题',
        key: '2',
    },
    {
        label: '深色主题',
        key: '3',
    },
];

const GesPage = () => {
    const { eFiles } = AppMainStore()
    const [AutoStart, setAutoStart] = useState(true);
    const [ETheme, setETheme] = useState("1");
    const [Istatus, setIstatus] = useState(false);
    const inipath = extractDirectoryPath(eFiles) + '\\E-Manager\\code.ini';
    const libCodePath = extractDirectoryPath(eFiles) + '\\lib\\E-Manager_Code.fne';
    const { messageApi } = TentativeStore()
    const iniDataList = [
        {
            key: 'Auto Start',
            setData: setAutoStart,
            data: AutoStart ? 'true' : 'false',
        },
        {
            key: 'Theme',
            setData: setETheme,
            data: ETheme,
        }
    ]
    useAsyncEffect(async () => {
        try {
            const Fileinfo = await GetFileinfo(libCodePath);
            setIstatus(!Fileinfo.isFile);
            for (let i = 0; i < iniDataList.length; i++) {
                const element = iniDataList[i];
                const ini_cif = await invoke<any>('read_ini_file', {
                    path: inipath,
                    section: "Config",
                    key: element.key,
                });
                element.setData(ini_cif)
            }

        } catch (error) {
            console.error(error);
        }
    }, [])
    const sevdata = async () => {
        try {
            for (let i = 0; i < iniDataList.length; i++) {
                const element = iniDataList[i];
                await invoke('write_ini_file', {
                    path: inipath,
                    section: "Config",
                    key: element.key,
                    value: element.data,
                })
            }
        } catch (error) {
            console.error(error);
        }

    }
    useAsyncEffect(sevdata, [AutoStart, ETheme])
    const selected = async () => {
        if (Istatus) {
            //安装支持库
            messageApi.open({
                type: 'info',
                content: "将打开浏览器下载支持库文件，请将支持库文件解压到IDE `lib` 文件夹中",

            })
            setTimeout(() => {
                createAndClickLink("https://wwuk.lanzouo.com/iE6lq38bnrdg")
            }, 1500);
        } else {
            //卸载支持库
            try {
                await remove(libCodePath);
                const Fileinfo = await GetFileinfo(libCodePath);
                setIstatus(!Fileinfo.isFile);
                if (!Fileinfo.isFile) {
                    messageApi.success("支持库卸载成功");
                } else {
                    messageApi.error("支持库卸载失败，请检查文件是否被占用");
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    return [{
        key: 'assistant-intfne',
        title: '安装支持库',
        description: '安装易码支持库，可以开启辅助功能。',
        control:
            <Button type="primary"
                onClick={selected}
            >
                {Istatus ? '安装支持库' : '卸载支持库'}
            </Button>
        ,
    },
    {
        key: 'assistant-aotu-start',
        title: '跟随易IDE启动',
        description: '当易IDE启动时且没有创建项目时，自动启动易码助手',
        control:
            <Switch
                disabled={Istatus}
                checked={AutoStart}
                onChange={setAutoStart}
            />,
    },
    {
        key: 'assistant-eTheme',
        title: '易IDE窗口主题',
        description: '修改后需要重启易IDE生效，可以让部分区域适应当前主题，并让代码区域滚动条更美观。',
        control:
            <Dropdown.Button
                disabled={Istatus}
                icon={<DownOutlined />}
                menu={{
                    items: Themeitems,
                    onClick: (e) => setETheme(e.key)
                }}
            >
                {Themeitems[parseInt(ETheme) - 1]?.label}
            </Dropdown.Button>,
    },
    ] as SectionItem[];

};
export default GesPage;