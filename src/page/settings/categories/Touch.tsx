import { AppSetStore } from "@/mod/store";
import { SectionItem } from "../types";
import { Switch } from "antd";

const GesTouchSettings = () => {
    const { TouchTitleBtn,TouchOverlay, SetAppSet } = AppSetStore()
    return [{
        key: 'Touch-TitleBtn',
        title: '标题栏按钮自动收缩',
        description: '开启后标题栏右侧按钮将自动收缩，鼠标悬浮自动展开按钮',
        control:
            <Switch
                checked={TouchTitleBtn}
                onChange={(e) => {
                    SetAppSet({ TouchTitleBtn: e });
                }}
            />,
    },
    {
        key: 'Touch-TitleBtn-Overlay',
        title:"标题栏拖动区覆盖操作区",
        description:"操作区为包含按钮的区域，开启后操作区在不影响按钮功能的情况下，可以长按拖动窗口和右键呼出窗口菜单",
        control:
            <Switch
                checked={TouchOverlay}
                onChange={(e) => {
                    SetAppSet({ TouchOverlay: e });
                }}
            />,
    }

    ] as SectionItem[];

};
export default GesTouchSettings;