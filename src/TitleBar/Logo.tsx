import React from 'react';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { TentativeStore } from '@/mod/store';

interface Props {
    loading: boolean;
    Logosvg: React.FC<React.SVGProps<SVGSVGElement>>;

}
const App: React.FC<Props> = ({ loading, Logosvg }) => {
    const { Themeconfig } = TentativeStore()
    return (
        <LayoutGroup>
            {/* 全屏加载动画 */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: -6,
                            left: -8,
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: '#1a1f26',
                            zIndex: 99999,
                            borderRadius: '0%', // 初始非圆形
                            overflow: 'hidden', // 保证 clipPath 起作用
                        }}
                        initial={{
                            opacity: 1,
                            clipPath: 'circle(100% at 50% 50%)'
                        }}
                        exit={{
                            clipPath: 'circle(0% at 0% 0%)',
                            opacity: 0,
                            transition: {
                                clipPath: { duration: 0.6, ease: 'easeInOut' },
                                opacity: { duration: 0.5, ease: "easeInOut" },
                            },
                        }}
                    >
                        <motion.div
                            layoutId="logo"
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            style={{ color: Themeconfig?.token?.colorPrimary }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                        >
                            <Logosvg width={128} height={128} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 正常头部 */}
            {!loading && (
                <motion.div
                    className="logo"
                    style={{ color: Themeconfig?.token?.colorPrimary }}
                    layoutId="logo">
                    <Logosvg className="logo" />
                </motion.div>
            )}
        </LayoutGroup>
    );
};

export default App;
