import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./home";
import LinkPage from "@/page/linkLite";
import About from "@/page/about";
import { ToolPage } from "./tool";
import { AnimatePresence, motion } from "framer-motion";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import { useEffect, useRef } from "react";

const springElastic = {
  type: "spring",
  stiffness: 160,
  damping: 13.9,
  mass: 0.8,
  bounce: 0.4,
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
export interface RouteWrapperProps {
  children: React.ReactNode
  themeDack: boolean;
}
const RouteWrapper = ({ children, themeDack }: RouteWrapperProps) => {
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
        height: "100vh",
        position: "relative",
      }}
      ref={scrollRef}
    >
      <div style={{ paddingInline: 12, paddingTop: 50 }}>{children}</div>
    </MacScrollbar>
  );
};
export interface PageRouterProps {
  themeDack: boolean;
}

export default function PageRouter({ themeDack }: PageRouterProps) {
  const location = useLocation();

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
        <RouteWrapper themeDack={themeDack}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/nav" element={<LinkPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/tool" element={<ToolPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </RouteWrapper>
      </motion.div>
    </AnimatePresence>
  );
}
