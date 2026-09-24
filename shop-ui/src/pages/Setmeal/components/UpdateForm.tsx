import ImageUpload from '@/components/Upload';
import { useCategoryOptions } from '@/hooks/categoryOptions';
import { getSetmealById, updateSetmeal } from '@/services/setmeal';
import type { Setmeal } from '@/types';
import { Button, Form, Input, message, Modal, Select, Space, Spin } from 'antd';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import AddDish from './AddDish';

interface UpdateFormProps {
  modalVisible: boolean;
  editingSetmeal: Setmeal | null;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const UpdateForm: React.FC<PropsWithChildren<UpdateFormProps>> = (props) => {
  const { modalVisible, editingSetmeal, hideModal, reloadData } = props;
  const [form] = Form.useForm();
  const { options, loading } = useCategoryOptions(2);
  const reqIdRef = useRef(0);
  const [loadingWithFlavor, setLoadingWithFlavor] = useState(false);

  useEffect(() => {
    if (!modalVisible || !editingSetmeal) return;

    const myId = ++reqIdRef.current;
    form.resetFields();
    setLoadingWithFlavor(true);

    const load = async () => {
      try {
        const setmeal = await getSetmealById(editingSetmeal.id);
        console.log('setmeal',setmeal);
        if (myId !== reqIdRef.current) return;

        form.setFieldsValue({
          name: setmeal.name,
          categoryId: String(setmeal.categoryId),
          price: setmeal.price,
          image: setmeal.image,
          description: setmeal.description,
          setmealDishes: setmeal.setmealDishes
        });
      } catch {
        if (myId === reqIdRef.current) {
          message.error('套餐及口味数据加载失败');
        }
      } finally {
        if (myId === reqIdRef.current) {
          setLoadingWithFlavor(false);
        }
      }
    };

    load();
  }, [modalVisible, editingSetmeal, form]);

  const handleSubmit = async (values: Setmeal) => {
    if (!editingSetmeal) return;
    try {
      await updateSetmeal({ ...values, id: editingSetmeal.id });
      message.success('修改成功');
      await reloadData();
      hideModal();
    } catch (error) {
      message.error('修改失败');
    }
  };

  return (
    <Modal
      destroyOnHidden
      title="修改"
      width={600}
      open={modalVisible}
      onCancel={() => hideModal()}
      footer={null}
    >
      <Spin spinning={loadingWithFlavor}>
        <Form
          form={form}
          name="basic"
          labelCol={{ flex: '100px' }}
          wrapperCol={{ flex: 1 }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item<Setmeal>
            label="套餐名称"
            name="name"
            rules={[{ required: true, message: '请输入套餐名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<Setmeal>
            label="套餐分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择!' }]}
          >
            <Select
              placeholder="请选择"
              allowClear
              loading={loading}
              options={options}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item<Setmeal> label="套餐价格" name="price">
            <Input addonAfter="元"/>
          </Form.Item>
          <Form.Item<Setmeal> label="套餐菜品" name="setmealDishes">
            <AddDish />
          </Form.Item>
          <Form.Item<Setmeal> label="套餐图片" name="image">
            <ImageUpload />
          </Form.Item>
          <Form.Item<Setmeal>
            label="套餐描述"
            name="description"
            rules={[{ required: false, message: '套餐描述，最长200字!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => form.submit()}
              disabled={loadingWithFlavor}
            >
              确定
            </Button>
            <Button onClick={() => hideModal()}>取消</Button>
          </Space>
        </div>
      </Spin>
    </Modal>
  );
};

export default UpdateForm;
