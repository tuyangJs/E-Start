import { Segmented } from "antd";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export interface NavigationProps {
    style: React.CSSProperties;
}
export const NavigationItem = [
    { value: '/', label: '首页' },
    { value: '/nav', label: '快捷导航' },
    { value: '/tool', label: '工具' },
    { value: '/set', label: '设置' },
]
/**
 * 根据 value 获取对应的 label
 * @param value 路由路径
 * @returns 对应的中文标题（找不到则返回 undefined）
 */
export function getLabelByValue(value: string): string | undefined {
    return NavigationItem.find(item => item.value === value)?.label;
}
export const Navigation: FC<NavigationProps> = ({ style }) => {
    const navigate = useNavigate();
    const location = useLocation();
 
    return (
        <Segmented
            className='ant-segmented ant-segmented-shape-round vague'
            style={style}
            shape="round"
            value={location.pathname}
            options={NavigationItem}
            onChange={(value) => navigate(value as string)}
        />
    )
}