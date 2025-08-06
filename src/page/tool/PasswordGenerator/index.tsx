import { useState } from 'react';
import { 
  Card, 
  Slider, 
  InputNumber, 
  Checkbox, 
  Button, 
  Input, 
  Row, 
  Col, 
  Space,
  Typography,
  message 
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = '';
    let generatedPassword = '';
    
    if (options.lowercase) charset += lowercase;
    if (options.uppercase) charset += uppercase;
    if (options.numbers) charset += numbers;
    if (options.symbols) charset += symbols;
    
    if (charset.length === 0) {
      message.warning('请至少选择一种字符类型');
      return;
    }
    
    // 使用更现代的密码生成方法
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      generatedPassword += charset[values[i] % charset.length];
    }
    
    setPassword(generatedPassword);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    message.success('密码已复制到剪贴板');
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card 
      title="密码生成器" 
      style={{ 
        maxWidth: 500,
        margin: '40px auto',
        borderRadius: 8
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 密码长度控制 */}
        <div>
          <Typography.Text strong>密码长度: {length}</Typography.Text>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Slider 
                min={6}
                max={32}
                value={length}
                onChange={(value) => setLength(value)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col>
              <InputNumber 
                min={6}
                max={32}
                value={length}
                onChange={(value) => value && setLength(value)}
                style={{ width: 70 }}
              />
            </Col>
          </Row>
        </div>
        
        {/* 字符类型选项 */}
        <div>
          <Typography.Text strong>字符类型</Typography.Text>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Checkbox 
                checked={options.uppercase}
                onChange={() => handleOptionChange('uppercase')}
              >
                大写字母 (A-Z)
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox 
                checked={options.lowercase}
                onChange={() => handleOptionChange('lowercase')}
              >
                小写字母 (a-z)
              </Checkbox>
            </Col>
            <Col span={12} style={{ marginTop: 8 }}>
              <Checkbox 
                checked={options.numbers}
                onChange={() => handleOptionChange('numbers')}
              >
                数字 (0-9)
              </Checkbox>
            </Col>
            <Col span={12} style={{ marginTop: 8 }}>
              <Checkbox 
                checked={options.symbols}
                onChange={() => handleOptionChange('symbols')}
              >
                特殊符号 (!@#$)
              </Checkbox>
            </Col>
          </Row>
        </div>
        
        {/* 生成按钮 */}
        <Button 
          type="primary" 
          onClick={generatePassword}
          block
          size="large"
          style={{ marginTop: 16 }}
        >
          生成密码
        </Button>
        
        {/* 密码显示区域 - 使用 Space.Compact 替代 Input.Group */}
        <Space.Compact block style={{ marginTop: 16 }}>
          <Input
            value={password}
            placeholder="点击上方按钮生成密码"
            readOnly
            className='no-menu'
          />
          <Button 
            icon={<CopyOutlined />} 
            onClick={copyToClipboard}
            disabled={!password}
          />
        </Space.Compact>
      </Space>
    </Card>
  );
};

export default PasswordGenerator;