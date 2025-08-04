import React, { useEffect, useState } from 'react';
import { Avatar, Tooltip } from 'antd';
import { motion } from 'framer-motion';
export interface AuthorGtype {
    url?: string
    avatarUrl: string
    name: string
    description?: string
}
const AvatarG: AuthorGtype[] = [
    {
        avatarUrl: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2587495862&spec=640',
        name: '小七',
        description: '贡献项目名称'
    }
]
export const AuthorT: React.FC = () => {


    return (
        <>
            <Avatar.Group >
                {AvatarG?.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }} // Start slightly below
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            type: "spring", // Use spring for elastic effect
                            stiffness: 150, // Controls speed of the bounce
                            damping: 25, // Controls how smooth the bounce is
                            duration: 0.36, // Controls the overall duration
                            delay: (index + 0.5) + 0.1,
                        }}
                    >
                        <Tooltip title={`${item.name} - ${item?.description}`} placement="top" >
                            <a href={item?.url} target="_blank">
                                <Avatar src={item.avatarUrl} style={{ backgroundColor: '#e86e3d' }} >
                                    {item.name}
                                </Avatar>
                            </a>
                        </Tooltip>
                    </motion.div>
                ))}

            </Avatar.Group>

        </>
    );
}

