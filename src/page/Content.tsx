import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./home";
import LinkPage from "@/page/linkLite";
import SettingsPage from "@/page/settings";
import { ToolPage } from "./tool";
import { AnimatePresence, motion } from "framer-motion";
import "mac-scrollbar/dist/mac-scrollbar.css";
import { useEffect } from "react";
import { useMsStoreApp } from "@/mod/useMsStoreApp";
import { getLabelByValue } from "@/TitleBar/Navigation";
import { RouteWrapper } from "@/mod/RouteWrapper";
import ErrorPage from "@/404";

const springElastic = {
  type: "spring",
  mass: 0.8,
  bounce: 0.6,
  stiffness: 300,
  damping: 19,

} as const;

const variants = {
  initial: { x: "100%", filter: "blur(10px)" },
  animate: {
    x: "0%",
    filter: "blur(0px)",
    transition: springElastic,
  },
  exit: {
    x: "-100%",
    filter: "blur(10px)",
    transition: springElastic,
  },
};

export interface PageRouterProps {
  themeDack: boolean;
}
export default function PageRouter({ themeDack }: PageRouterProps) {
  const location = useLocation();
  const { info } = useMsStoreApp(
    '9N2RQBRN2TRF', 'US', 'zh-CN', 'zh-CN', 'Windows.Desktop', true
  );
  useEffect(() => {
    document.title = `${(info?.ProductTitle || '易语言项目管理器')} - ${getLabelByValue(location.pathname)}`
  }, [location, info]);
  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: "absolute",
          width: "100%",
          height: "100vh",
          top: 0,
          left: 0,
        }}
      >
        <RouteWrapper themeDack={themeDack} style={{ paddingInline: 12, paddingTop: 50 }}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/nav" element={<LinkPage />} />
            <Route path="/set" element={<SettingsPage />} />
            <Route path="/tool" element={<ToolPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </RouteWrapper>
      </motion.div>
    </AnimatePresence>
  );
}
