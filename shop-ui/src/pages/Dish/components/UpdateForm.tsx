import ImageUpload from '@/components/Upload';
import { useCategoryOptions } from '@/hooks/categoryOptions';
import { getDishById, updateDish } from '@/services/dish';
import type { Dish } from '@/types';
import { Button, Form, Input, message, Modal, Select, Space, Spin } from 'antd';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { DishFormValues, FlavorFormItem } from '../type';
import DishFlavorList from './DishFlavorList';

interface UpdateFormProps {
  modalVisible: boolean;
  editingDish: Dish | null;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const UpdateForm: React.FC<PropsWithChildren<UpdateFormProps>> = (props) => {
  const { modalVisible, editingDish, hideModal, reloadData } = props;
  const [form] = Form.useForm();
  const { options, loading } = useCategoryOptions(1);
  const reqIdRef = useRef(0);
  const [loadingWithFlavor, setLoadingWithFlavor] = useState(false);

  useEffect(() => {
    if (!modalVisible || !editingDish) return;

    const myId = ++reqIdRef.current;
    form.resetFields();
    setLoadingWithFlavor(true);

    const load = async () => {
      try {
        const dish = await getDishById(editingDish.id);
        if (myId !== reqIdRef.current) return;

        const flavors: FlavorFormItem[] = (dish.flavors ?? []).map((f) => ({
          name: f.name,
          value: f.value ? f.value.split(',') : [],
        }));

        form.setFieldsValue({
          name: dish.name,
          categoryId: String(dish.categoryId),
          price: dish.price,
          image: dish.image,
          description: dish.description,
          flavors,
        });
      } catch {
        if (myId === reqIdRef.current) {
          message.error('菜品及口味数据加载失败');
        }
      } finally {
        if (myId === reqIdRef.current) {
          setLoadingWithFlavor(false);
        }
      }
    };

    load();
  }, [modalVisible, editingDish, form]);

  const handleSubmit = async (values: DishFormValues) => {
    if (!editingDish) return;
    try {
      // 表单 flavors[].value: string[] → 后端 "a,b,c"
      const flavors = (values.flavors ?? [])
        .filter((f): f is { name: string; value: string[] } =>
          Boolean(f.name && f.value?.length),
        )
        .map((f) => ({ name: f.name, value: f.value.join(',') }));

      await updateDish({ ...values, id: editingDish.id, flavors });
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
          <Form.Item<DishFormValues>
            label="菜品名称"
            name="name"
            rules={[{ required: true, message: '请输入菜品名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<DishFormValues>
            label="菜品分类"
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
          <Form.Item<DishFormValues> label="菜品价格" name="price">
            <Input />
          </Form.Item>
          <Form.Item<DishFormValues> label="菜品图片" name="image">
            <ImageUpload />
          </Form.Item>
          <Form.Item label="口味配置" wrapperCol={{ span: 24 }}>
            <DishFlavorList />
          </Form.Item>
          <Form.Item<DishFormValues>
            label="菜品描述"
            name="description"
            rules={[{ required: false, message: '菜品描述，最长200字!' }]}
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
