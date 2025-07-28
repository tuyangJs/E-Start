import windowIcon from "@/assets/window.svg?react";
import dllIcon from "@/assets/dll.svg?react";
import cmdIcon from "@/assets/cmd.svg?react";
import modsIcon from "@/assets/mods.svg?react";
import openIcon from "@/assets/open.svg?react";
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";
export interface openBtnType {
    label: string;
    doc: string;
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    file?:  string[];
    onClick?: (e: any) => void;
}

export const openBtn: openBtnType[] = [
    {
        label: "打开项目",
        doc: "从本地打开一个易语言项目",
        icon: openIcon,
        onClick: (e) => {
            open({
                multiple: false,
                directory: false,
                filters: [
                    { name: "易语言项目", extensions: ["e"] }
                ],
                title: "选择易语言项目文件"
            }).then(file => {
                if (file) {
                   invoke('open_exe', { exePath: e, args: [file] })
                }
            });

        },
    },
    {
        label: "窗口程序",
        doc: "以窗口为主体的程序，最终编译出来EXE可执行文件。",
        icon: windowIcon,
        file:["Window","Window_main"]
    },
    {
        label: "动态链接库",
        doc: "Windows动态链接库项目，最终编译出来DLL可执行文件。",
        icon: dllIcon,
        file:["Dll"]
    },
    {
        label: "控制台程序",
        doc: "启动后是一个终端窗口，最终编译出来EXE可执行文件。",
        icon: cmdIcon,
        file:["Cmd"]
    },
    {
        label: "易语言模块",
        doc: "一个可被其他项目引用的模块，最终编译EC模块文件。",
        icon: modsIcon,
        file:["Mods"]
    },
];
