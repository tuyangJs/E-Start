

export function translateJsonError(msg: string): string {
  if (/Expected property name or '}'/.test(msg)) {
    return '预期属性名或结束符号 }，请检查是否缺少引号、逗号或多余符号';
  }
  if (/Unexpected token/.test(msg)) {
    return '检测到非法字符，可能是语法错误或缺失引号/逗号';
  }
  if (/Unexpected string/.test(msg)) {
    return '意外的字符串，可能缺少逗号或冒号';
  }
  if (/Unexpected number/.test(msg)) {
    return '数字格式不合法，可能多了前导零或缺少引号';
  }
  if (/Unexpected end of JSON input/.test(msg)) {
    return 'JSON 结构不完整，可能缺少右括号/右花括号';
  }
  if (/Unexpected end of input/.test(msg)) {
    return '输入不完整，缺少元素或结构未闭合';
  }
  if (/Unexpected token u in JSON at position/.test(msg)) {
    return 'undefined 不是合法的 JSON 值';
  }
  if (/Bad control character in string literal in JSON at position (\d+)/.test(msg)) {
    const match = msg.match(/position (\d+)/);
    return `在位置 ${match?.[1]} 的字符串中出现了非法控制字符（如换行、退格等应使用转义）`;
  }
  if (/Unexpected token }/.test(msg)) {
    return '多余的右花括号 }，请检查结构是否多写';
  }
  return `解析失败：${msg}`;
}

