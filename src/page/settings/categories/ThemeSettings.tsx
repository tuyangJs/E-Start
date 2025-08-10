
// src/components/settings/categories/GestureSettings.tsx
import { ColorPicker } from 'antd';
import { AppSetStore } from '@/mod/store';

import { SectionItem } from '../types';
import FontAutoComplete from './com/FontAutoComplete';
const colorPresets = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#722ed1',
  '#eb2f96',
  '#f5222d',
  '#faad14',
  '#2f54eb',
];

const GestureSettings = () => {
  const { primaryColor, SetAppSet, fontFamily } = AppSetStore()
  const FontonChange =(fontName: string) => {
    SetAppSet({ fontFamily: fontName });
  }

  return [{
    key: 'color-picker',
    title: '主题色',
    description: '修改后根据主题色自动搭配其它色阶',
    control: <ColorPicker
      value={primaryColor}
      disabledAlpha
      showText
      presets={[
        {
          label: '推荐颜色',
          colors: colorPresets,
        },
      ]}
      onChange={(color) => {
        SetAppSet({ primaryColor: color.toHexString() });
      }}
    />
  }
    ,
  {
    key: 'fonts',
    title: '字体设置',
    description: "修改程序界面文案字体",
    control: <FontAutoComplete defaultValue={fontFamily}  onChange={FontonChange}/>
    ,
  }

  ] as SectionItem[];

};
export default GestureSettings;
