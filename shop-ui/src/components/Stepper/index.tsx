import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import React from 'react';

interface CopiesStepperProps {
  value?: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const Stepper: React.FC<CopiesStepperProps> = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  disabled,
}) => (
  <Space.Compact>
    <Button
      icon={<MinusOutlined />}
      size="small"
      disabled={disabled || value <= min}
      onClick={() => onChange?.(value - 1)}
    />
    <Input
      value={value}
      readOnly
      size="small"
      style={{
        width: 48,
        textAlign: 'center',
        pointerEvents: 'none',
        background: '#fff',
      }}
    />
    <Button
      icon={<PlusOutlined />}
      size="small"
      disabled={disabled || value >= max}
      onClick={() => onChange?.(value + 1)}
    />
  </Space.Compact>
);

export default Stepper;
