import React, { useState, useMemo } from 'react';
import { Card, Flex, Layout, Space, theme, Typography } from 'antd';
import SettingsNav from './SettingsNav';
import SearchBox from './SearchBox';
import { RouteWrapper } from '@/mod/RouteWrapper';
import { categories } from './RenderOptions';
import { AnimatePresence, motion } from 'framer-motion';

const springElastic = {
  type: 'spring',
  stiffness: 160,
  damping: 13.9,
  mass: 0.8,
  bounce: 0.4,
} as const;

const variants = {
  initial: { x: '160%', filter: 'blur(10px)', },
  animate: {
    x: '0%',
    filter: 'blur(0px)',
    transition: springElastic,
  },
  exit: {
    x: '-160%',
    filter: 'blur(10px)',
    transition: springElastic,
  },
};

const { Sider } = Layout;
const { Title } = Typography;

const SettingsPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const [searchTerm, setSearchTerm] = useState('');

  const current = useMemo(
    () => categories.find(c => c.key === activeKey)!,
    [activeKey]
  );
  const ActiveComponent = current.component;

  const handleSelect = (cat: string, key: string) => {
    setActiveKey(cat);
    setTimeout(() => {
      const el = document.querySelector(`[data-item-key=\"${key}\"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const config = theme.useToken().token;

  return (
    <Flex gap={22} style={{ flex: 1, minWidth: 0 }}>
      <Card
        style={{
          height: 'calc(100vh - 62px)',
          boxShadow: config?.boxShadowSecondary,
          zIndex: 1,
         // background: config.colorBgLayout,
        }}
        styles={{ body: { paddingInline: 8, paddingBlock: 12 } }}
        className="liquid-glass"
      >
        <Sider width={220}>
          <Space direction="vertical" style={{ width: '100%' }} size={18}>
            <Title level={5} style={{ margin: 0 }}>
              设置
            </Title>
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              onSelectItem={handleSelect}
            />
            <SettingsNav
              categories={categories.map(c => ({ key: c.key, label: c.label,icon:c.icon }))}
              activeKey={activeKey}
              onSelect={setActiveKey}
            />
          </Space>
        </Sider>
      </Card>

      {/* 绝对定位容器，使动画叠加不影响布局 */}
      <div style={{ position: 'relative', flex: 1, minWidth: 0, height: 'calc(100vh - 62px)' }}>
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeKey}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <RouteWrapper themeDack={false} height="100%">
              <Flex vertical gap={18} style={{ width: '100%', height: '100%' }}>
                <ActiveComponent />
              </Flex>
            </RouteWrapper>
          </motion.div>
        </AnimatePresence>
      </div>
    </Flex>
  );
};

export default SettingsPage;