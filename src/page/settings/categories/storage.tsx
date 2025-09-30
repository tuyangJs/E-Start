import { AppSetStore } from "@/mod/store";
import { SectionItem } from "../types";
import { Switch } from "antd";

const GesStorage = () => {
    const { routedata, SetAppSet } = AppSetStore()
    return [{
        key: 'route-data',
        title: '保存页面状态',
        description: '下次启动时恢复上次打开的页面',
        control:
            <Switch
                checked={routedata}
                onChange={(e) => {
                    SetAppSet({ routedata: e });
                }}
            />,
    }
    ] as SectionItem[];

};
export default GesStorage;