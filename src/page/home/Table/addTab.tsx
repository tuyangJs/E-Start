import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Input, Modal, Button, Flex, Tag, InputRef } from 'antd';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusOutlined, CloseOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { AppDataStore, starType } from '@/mod/store';

interface DraggableTagProps {
  tag: starType;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const DraggableTag: React.FC<DraggableTagProps> = ({ tag, onRemove, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(tag.name);
  const editInputRef = useRef<InputRef>(null);
  const { attributes, listeners, transform, transition, setNodeRef } = useSortable({ id: tag.id });

  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editing]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(tag.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditConfirm = () => {
    if (editValue.trim()) {
      onEdit(tag.id, editValue);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditConfirm();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(tag.name);
    }
  };

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: 8,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {editing ? (
        <Input
          ref={editInputRef}
          value={editValue}
          onChange={handleEditChange}
          onBlur={handleEditConfirm}
          onKeyDown={handleKeyDown}
          size="small"
          style={{ width: 100 }}
        />
      ) : (
        <Tag
          closable
          onClose={handleRemove}
          closeIcon={<CloseOutlined />}
          style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'default'
          }}
        >
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', marginRight: 6, display: 'inline-flex', alignItems: 'center' }}
          >
            <HolderOutlined style={{ fontSize: 14 }} />
          </span>
          <span style={{ marginRight: 4 }}>{tag.name}</span>
          <EditOutlined onClick={handleEditClick} style={{ fontSize: 12, cursor: 'pointer' }} />
        </Tag>
      )}
    </div>
  );
};

export const TabAdmin: React.FC<{ isModalOpen: boolean; setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isModalOpen, setIsModalOpen }) => {
  const { star, starData, setAppData } = AppDataStore();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // 使用 Modal.useModal 保持主题联动
  const [modal, contextHolder] = Modal.useModal();

  // 更新 store：若提供 newStarData 则同时更新 starData，否则只更新 star
  const updateStore = (newStars: starType[], newStarData?: typeof starData) => {
    setAppData({
      star: newStars,
      ...(newStarData ? { starData: newStarData } : {})
    });
  };

  const handleOk = useCallback(() => setIsModalOpen(false), [setIsModalOpen]);
  const handleCancel = useCallback(() => setIsModalOpen(false), [setIsModalOpen]);

  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = star.findIndex(item => item.id === active.id as string);
      const newIndex = star.findIndex(item => item.id === over.id as string);
      const newStars = arrayMove(star, oldIndex, newIndex);
      updateStore(newStars);
    }
  };

  const showInput = () => setInputVisible(true);

  useEffect(() => {
    if (inputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputVisible]);

  const handleInputConfirm = () => {
    if (inputValue.trim()) {
      updateStore([...star, { id: Date.now().toString(), name: inputValue }]);
    }
    setInputValue('');
    setInputVisible(false);
  };

  const handleRemoveTag = (id: string) => {
    modal.confirm({
      title: '删除分类',
      content: '此操作会同时删除该分类下所有收藏，是否确认？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const newStars = star.filter(tag => tag.id !== id);
        const newStarData = starData.filter(item => item.id !== id);
        updateStore(newStars, newStarData);
      }
    });
  };

  const handleEditTag = (id: string, newText: string) => {
    updateStore(star.map(tag => (tag.id === id ? { ...tag, name: newText } : tag)));
  };

  return (
    <>
      {contextHolder}
      <Modal title="管理您的分类标签" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={500}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 12 }}>
            拖拽手柄可重新排序标签，点击×删除标签（会清空该分类下所有收藏），点击编辑图标修改名称
          </p>

          <DndContext sensors={[sensor]} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={star.map(tag => tag.id)} strategy={horizontalListSortingStrategy}>
              <Flex wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
                {star.map(tag => (
                  <DraggableTag key={tag.id} tag={tag} onRemove={handleRemoveTag} onEdit={handleEditTag} />
                ))}
              </Flex>
            </SortableContext>
          </DndContext>

          {inputVisible ? (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
              placeholder="输入标签名称"
              size="small"
              style={{ width: 150 }}
            />
          ) : (
            <Button type="dashed" icon={<PlusOutlined />} onClick={showInput}>
              添加标签
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};
