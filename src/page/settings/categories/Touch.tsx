import { AppSetStore } from "@/mod/store";
import { SectionItem } from "../types";
import { Switch } from "antd";

const GesTouchSettings = () => {
    const { TouchTitleBtn, SetAppSet } = AppSetStore()
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
    }

    ] as SectionItem[];

};
export default GesTouchSettings;