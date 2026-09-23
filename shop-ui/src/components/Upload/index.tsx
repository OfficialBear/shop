import { uploadFile } from '@/services/upload';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { GetProp, UploadProps } from 'antd';
import { Flex, message, Typography, Upload } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface ImageUploadProps {
  value?: string; // 受控：Form.Item 注入当前 url
  onChange?: (url: string) => void; // 受控：回写 url 给 Form
  maxSize?: number; // MB，默认 2
}

const beforeUpload = (file: FileType, maxSize = 2) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 文件!');
    return Upload.LIST_IGNORE;
  }
  const isLtSize = file.size / 1024 / 1024 < maxSize;
  if (!isLtSize) {
    message.error(`图片必须小于 ${maxSize}MB!`);
    return Upload.LIST_IGNORE;
  }
  return true;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 2,
}) => {
  const [loading, setLoading] = useState(false);

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      const url = await uploadFile(file as File); // 后端传 OSS，返回 url
      onChange?.(url); // 写回表单
      onSuccess?.(url);
    } catch (e) {
      message.error('上传失败，请重试');
      onError?.(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  );

  return (
    <Flex align="flex-start" gap={12}>
      <Upload
        name="file"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={(file) => beforeUpload(file, maxSize)}
        customRequest={customRequest}
        accept="image/jpeg,image/png"
      >
        {value ? (
          <img
            draggable={false}
            src={value}
            alt="image"
            style={{ width: '100%' }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      <div style={{ paddingTop: 4, lineHeight: '20px' }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          图片大小不能超过 2M;
        </Text>
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          仅能上传 PNG、JPG、JPEG 类型图片;
        </Text>
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          建议上传 200x200 或 300x300 尺寸的图片.
        </Text>
      </div>
    </Flex>
  );
};

export default ImageUpload;
