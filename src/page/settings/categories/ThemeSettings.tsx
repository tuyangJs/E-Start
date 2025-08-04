
// src/components/settings/categories/GestureSettings.tsx
import { Cascader, ColorPicker } from 'antd';
import { AppSetStore } from '@/mod/store';
import { SectionItem } from '../types';
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
const Fontsoptions = [
  { label: '默认字体', value: 'defaul' },
  { label: '思源黑体', value: 'SourceHanSans' },
  { label: 'HarmonyOS Sans', value: 'HarmonyOS_Sans_SC' },
]

const GestureSettings = () => {
  const { primaryColor, SetAppSet, fontFamily } = AppSetStore()
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
    control: <Cascader
      options={Fontsoptions}
      value={[fontFamily]}
      onChange={e => SetAppSet({ fontFamily: e[0] })}
      placeholder="请选择字体"
    />
    ,
  }

  ] as SectionItem[];

};
export default GestureSettings;
