// AddStarModal.tsx
import React, { useState } from 'react';
import { Modal, Radio, message } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { AppDataStore } from '@/mod/store';
import { upStar } from './upStar';

interface Props {
  visible: boolean;
  onClose: () => void;
  path: string | string[] | undefined;
}

export const AddStarModal: React.FC<Props> = ({ onClose, visible, path }) => {
  const { star, starData, setAppData } = AppDataStore();
  const [selectedId, setSelectedId] = useState<string>(star[0]?.id || '');

  // 提交收藏
  const handleOk = async () => {
    if (!path) return;
    const newData = upStar({ starData, selectedId, paths: path })
    if (newData) {
      setAppData({ starData: newData });
      message.success('收藏成功');
      onClose();
    } else {
      message.error('收藏失败');
    }
  };

  return (
    <Modal
      title="请选择要收藏到的分类"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      width={400}
    >
      <Radio.Group
        onChange={(e: RadioChangeEvent) => setSelectedId(e.target.value)}
        value={selectedId}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {star.map(item => (
          <Radio key={item.id} value={item.id}>
            {item.name}
          </Radio>
        ))}
      </Radio.Group>
    </Modal>
  );
};
