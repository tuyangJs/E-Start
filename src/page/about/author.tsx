import React, { useState } from 'react';
import { Avatar, Tooltip } from 'antd';
import { motion } from 'framer-motion';

export interface AuthorGtype {
  url?: string;
  avatarUrl: string;
  name: string;
  description?: string;
}

const AvatarG: AuthorGtype[] = [
  {
    avatarUrl: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2587495862&spec=640',
    name: '小七',
    description: '贡献项目名称',
  },
  {
    avatarUrl: 'https://q2.qlogo.cn/headimg_dl?dst_uin=3413272735&spec=640',
    url: 'https://bbs.125.la/?715988',
    name: '阿筱',
    description: '贡献资金',
  },
  // 可以继续添加更多作者
];

export const AuthorT: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // 用 CSS 变量 --avatar-offset 来控制 overlap/spacing
      animate={{ '--avatar-offset': hovered ? '12px' : '-6px' } as any}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {AvatarG.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: index * 0.15,
          }}
          style={{
            // 第一项不偏移，后续项通过 CSS 变量实现重叠/展开
            marginLeft: index === 0 ? 0 : 'var(--avatar-offset)',
          }}
        >
          <Tooltip title={`${item.name} – ${item.description}`} placement="top">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Avatar
                src={item.avatarUrl}
                style={{
                  backgroundColor: '#e86e3d',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
            
              />
            </a>
          </Tooltip>
        </motion.div>
      ))}
    </motion.div>
  );
};
