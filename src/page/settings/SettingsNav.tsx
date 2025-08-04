import React from 'react';
import { Menu } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
interface Props { categories:ItemType<MenuItemType>[]; activeKey: string; onSelect: (k: string) => void; }
const SettingsNav: React.FC<Props> = ({ categories, activeKey, onSelect }) => (
  <Menu mode="vertical" selectedKeys={[activeKey]} onClick={({ key }) => onSelect(key)} items={categories} style={{ border: 'none' }} />
);
export default SettingsNav;
