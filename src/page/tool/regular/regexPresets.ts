// regexPresets.ts

export interface RegexPreset {
  /** 规则名称 */
  name: string;
  /** 正则模式（字符串形式，不包含两端的 / ） */
  pattern: string;
  /** 规则说明 */
  description: string;
}

export const regexPresets: RegexPreset[] = [
  {
    name: '中国大陆手机号码',
    pattern: `^1[3-9]\\d{9}$`,
    description: '匹配中国大陆 11 位手机号，13x-19x 开头'
  },
  {
    name: 'QQ 号',
    pattern: `^[1-9][0-9]{4,}$`,
    description: '匹配 QQ 号，5 位及以上，且不能以 0 开头'
  },
  {
    name: '邮箱地址',
    pattern: `^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$`,
    description: '常见邮箱格式'
  },
  {
    name: '固定电话号码',
    pattern: `^(?:\\d{3,4}-)?\\d{7,8}$`,
    description: '区号可选，7 或 8 位号码'
  },
  {
    name: '身份证号码（15 或 18 位）',
    pattern: `^\\d{15}(?:\\d{2}[0-9Xx])?$`,
    description: '匹配 15 位或 18 位身份证号，最后一位可为 X'
  },
  {
    name: '中国邮政编码',
    pattern: `^[1-9]\\d{5}(?!\\d)$`,
    description: '6 位数字，第一位不为 0'
  },
  {
    name: 'IPv4 地址',
    pattern: `^(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)){3}$`,
    description: '有效的 IPv4 地址'
  },
  {
    name: 'URL 地址',
    pattern: `^(https?|ftp):\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!$&'()*+,;=.]+$`,
    description: '支持 http、https、ftp 协议'
  },
  {
    name: '中文字符',
    pattern: `[\\u4e00-\\u9fa5]`,
    description: '匹配任意中文字符'
  },
  {
    name: '日期（YYYY-MM-DD）',
    pattern: `^\\d{4}-\\d{1,2}-\\d{1,2}$`,
    description: '简单的日期格式校验'
  }
];
