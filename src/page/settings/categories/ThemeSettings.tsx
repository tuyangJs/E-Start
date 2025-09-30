import { ColorPicker, Radio } from 'antd';
import { AppSetStore } from '@/mod/store';
import { SectionItem } from '../types';
import FontAutoComplete from './com/FontAutoComplete';
import { useDebounceFn } from 'ahooks';
import { CheckboxGroupProps } from 'antd/es/checkbox';

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
const options: CheckboxGroupProps<string>['options'] = [
  { label: '跟随系统', value: 'system' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
];

const GestureSettings = () => {
  const { primaryColor, SetAppSet, theme, fontFamily } = AppSetStore();

  const FontonChange = (fontName: string) => {
    SetAppSet({ fontFamily: fontName });
  };

  // 防抖版设置主题色
  const { run: debounceSetColor } = useDebounceFn(
    (color: string) => {
      SetAppSet({ primaryColor: color });
    },
    { wait: 300 } // 可调，比如 300ms
  );

  return [
    {
      key: 'color-picker',
      title: '主题色',
      description: '修改后根据主题色自动搭配其它色阶',
      control: (
        <ColorPicker
          defaultValue={primaryColor}
          disabledAlpha
          showText
          presets={[
            {
              label: '推荐颜色',
              colors: colorPresets,
            },
          ]}
          onChange={(color) => {
            debounceSetColor(color.toHexString());
          }}
        />
      ),
    },
    {
      key: "themeMode",
      title: "主题模式",
      description: "设置应用的整体主题风格",
      control: (
        <Radio.Group
          block
          options={options}
          defaultValue={theme}
          onChange={e => SetAppSet({ theme: e.target.value })}
          optionType="button" />
      )
    },
    {
      key: 'fonts',
      title: '字体设置',
      description: '修改程序界面文案字体',
      control: (
        <FontAutoComplete defaultValue={fontFamily} onChange={FontonChange} />
      ),
    },
  ] as SectionItem[];
};

export default GestureSettings;
