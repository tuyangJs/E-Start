import { motion } from 'framer-motion';
import { Typography } from 'antd';

const { Text } = Typography;

// 定义父容器的 variants，用于控制子元素的错落入场和离场
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,   // 每个字母延迟 0.04s 依次入场
            when: "beforeChildren" as const
        }
    },
    exit: { opacity: 0 }
};

// 定义单个字母的 variants
const letterVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.8,
        rotate: -10
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,  // 显式指定类型
            damping: 12,
            stiffness: 200
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 }
    }
};

export function AnimatedTitle({ title }: { title: string }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ display: 'flex', overflow: 'hidden' }}
        >
            <Text
                strong
                style={{
                    margin: 0,
                    maxWidth: 'calc(100vw - 222px)'
                }}
                ellipsis={true}
            >
                {Array.from(title).map((char, idx) => (
                    <motion.span
                        key={`${char}-${idx}`}
                        variants={letterVariants}
                        style={{ display: 'inline-block', whiteSpace: 'pre' }}
                    >
                        {char}
                    </motion.span>
                ))}
            </Text>
        </motion.div>
    );
}