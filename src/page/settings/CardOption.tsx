import React from 'react';
import { Card, Radio, Space } from 'antd';
import type { CardOptionGroup } from './types';
const CardOption: React.FC<CardOptionGroup> = ({ key, title, options, selectedKey, onChange }) => (
  <div data-item-key={key} style={{ marginBottom: 24 }}>
    {title && <h3>{title}</h3>}
    <Radio.Group value={selectedKey} onChange={e => onChange(e.target.value)}>
      <Space>
        {options.map(opt => (
          <Card key={opt.key} hoverable style={{ width: 200, textAlign: 'center' }}>
            <Radio value={opt.key} style={{ display: 'block' }}>
              <div>{opt.title}</div>
              {opt.description && <div style={{ color: '#888' }}>{opt.description}</div>}
            </Radio>
          </Card>
        ))}
      </Space>
    </Radio.Group>
  </div>
);
export default CardOption;