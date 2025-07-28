import Close from "@/assets/closed.svg?react";
import Mins from '@/assets/min.svg?react';
import Maximize from '@/assets/maximize.svg?react';
import Minimize from '@/assets/minimize.svg?react';
import { ButtonProps } from "antd";


export const TitleButton = (isMaximized: boolean) => {

    return [
        {
            icon: <Mins />,
            shape: "round",
            type: "text",
            onClick: e => {
                const appWindow = window.appWindow
                // @ts-ignore
                e.target?.blur()
                appWindow.minimize()
            }
        },
        {
            icon: isMaximized ? <Minimize />: <Maximize />,
            shape: "round",
            type: "text",
            onClick: e => {
                const appWindow = window.appWindow
                // @ts-ignore
                e.target?.blur()
                appWindow.isMaximized().then((result) => {
                    if (result) {
                        appWindow.unmaximize()
                    } else {
                        appWindow.maximize()
                    }
                })
            }
        },
        {
            color: "danger",
            shape: "round",
            icon: <Close />,
            onClick: e => {
                const appWindow = window.appWindow
                // @ts-ignore
                e.target?.blur()
                appWindow.close()
            }
        }
    ] as ButtonProps[]
}