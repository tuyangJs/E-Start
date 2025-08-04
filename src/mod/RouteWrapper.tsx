import { MacScrollbar } from "mac-scrollbar";
import { useEffect, useRef } from "react";

export interface RouteWrapperProps {
    children: React.ReactNode
    themeDack: boolean;
    style?: React.CSSProperties
    height?: number | string
}
export const RouteWrapper = ({ children, themeDack, style, height }: RouteWrapperProps) => {
    const scrollRef = useRef<any>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [children]);

    return (
        <MacScrollbar
            skin={themeDack ? "dark" : "light"}
            className="scroll-container content"
            suppressScrollX
            style={{
                zIndex: 0,
                width: "100%",
                height: height || "100vh",
                position: "relative",
            }}
            ref={scrollRef}
        >
            <div style={style}>{children}</div>
        </MacScrollbar>
    );
};