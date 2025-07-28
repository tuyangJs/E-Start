export const textVariants = {
  initial: () => ({ 
    y: 50,
    opacity: 0,
    scale: 0.8,
  }),
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut" // 使用预设值
    }
  },
  exit: () => ({
    y: -50,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: "easeInOut" // 使用预设值
    }
  })
};