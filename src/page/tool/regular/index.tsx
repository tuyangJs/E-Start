// RegexTester.tsx
import React, { useState } from 'react';
import {
  Input,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Checkbox,
  Radio,
  Row,
  Col
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { regexPresets } from './regexPresets';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

export const RegexTester: React.FC = () => {
  // 模式：match=匹配, replace=替换
  const [mode, setMode] = useState<'match' | 'replace'>('match');

  // 公共状态：文本与正则
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');

  // Flags
  const [extractMode, setExtractMode] = useState(true);
  const [globalFlag, setGlobalFlag] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [multiline, setMultiline] = useState(false);

  // 匹配结果
  const [matches, setMatches] = useState<string[]>([]);

  // 替换相关
  const [replaceValue, setReplaceValue] = useState('');
  const [replacedText, setReplacedText] = useState('');

  // 构造 RegExp
  const buildRegex = () => {
    let p = extractMode ? pattern.replace(/^\^/, '').replace(/\$$/, '') : pattern;
    let flags = '';
    if (globalFlag) flags += 'g';
    if (ignoreCase) flags += 'i';
    if (multiline) flags += 'm';
    return new RegExp(p, flags);
  };

  // 点击“匹配”
  const handleMatch = () => {
    try {
      const regex = buildRegex();
      const res = extractMode ? (text.match(regex) || []) : (regex.test(text) ? [text] : []);
      setMatches(res);
    } catch {
      message.error('正则有误，请检查语法');
      setMatches([]);
    }
  };

  // 点击“替换”
  const handleReplace = () => {
    try {
      const regex = buildRegex();
      const res = text.replace(regex, replaceValue);
      setReplacedText(res);
    } catch {
      message.error('替换有误，请检查正则或替换字符串');
      setReplacedText('');
    }
  };

  // 复制
  const copyToClipboard = (content: string, successMsg: string) => {
    if (!content) {
      message.warning('无内容可复制');
      return;
    }
    navigator.clipboard.writeText(content)
      .then(() => message.success(successMsg))
      .catch(() => message.error('复制失败'));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={4}>正则表达式测试工具</Title>

      {/* 模式切换 */}
      <Radio.Group value={mode} onChange={e => setMode(e.target.value)}>
        <Radio.Button value="match">匹配模式</Radio.Button>
        <Radio.Button value="replace">替换模式</Radio.Button>
      </Radio.Group>

      {/* 预设规则 */}
      <Select
        placeholder="选择常用规则"

        onChange={val => setPattern(val)}
        allowClear
      >
        {regexPresets.map(p => (
          <Option key={p.name} value={p.pattern}>
            {p.name} — {p.description}
          </Option>
        ))}
      </Select>

      {/* 模式开关 */}
      <Row gutter={16}>
        <Col>
          <Checkbox
            checked={extractMode}
            onChange={e => setExtractMode(e.target.checked)}
          >
            提取子串模式
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={globalFlag}
            onChange={e => setGlobalFlag(e.target.checked)}
          >
            全局匹配 (g)
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={ignoreCase}
            onChange={e => setIgnoreCase(e.target.checked)}
          >
            忽略大小写 (i)
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={multiline}
            onChange={e => setMultiline(e.target.checked)}
          >
            多行模式 (m)
          </Checkbox>
        </Col>
      </Row>

      {/* 正则与输入 */}
      <Input
        value={pattern}
        onChange={e => setPattern(e.target.value)}
        placeholder="请输入正则表达式（不带 / /）"
      />
      <TextArea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="在此输入测试文本"
      />

      {/* 根据模式显示不同操作 */}
      {mode === 'match' ? (
        <>
          <Space>
            <Button type="primary" onClick={handleMatch}>匹配</Button>
          </Space>
          <Divider  style={{ margin: 0 }}>
            <Space>
              匹配结果
               <Button
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(matches.join('\n'), '匹配结果已复制')}
              disabled={matches.length === 0}
            />
            </Space>
          </Divider>
          <TextArea
            rows={4}
            value={matches.join('\n')}
            readOnly
            placeholder="匹配项会显示在这里"
          />
        </>
      ) : (
        <>
          <TextArea
            rows={2}
            value={replaceValue}
            onChange={e => setReplaceValue(e.target.value)}
            placeholder="替换为… (可用 $1, $2 等分组引用)"
          />
          <Space>
            <Button type="primary" onClick={handleReplace}>替换</Button>

          </Space>
          <Divider orientation="left">
            <Space>
              替换结果
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(replacedText, '替换结果已复制')}
              >
                复制替换结果
              </Button>
            </Space>

          </Divider>
          <TextArea
            rows={4}
            value={replacedText}
            readOnly
            placeholder="替换后的文本会显示在这里"
          />
        </>
      )}
    </Space>
  );
};
