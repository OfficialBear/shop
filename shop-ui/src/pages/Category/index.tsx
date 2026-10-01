import type { SearchParams } from '@/pages/Category/type';
import {
  deleteCategory,
  getPage,
  updateCategoryStatus,
} from '@/services/category';
import type { Category } from '@/types';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const CategoryPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const reload = async () => {
    await actionRef.current?.reload();
  };

  const onEdit = (record: Category) => {
    setEditingCategory(record);
    setUpdateModalVisible(true);
  };

  const handleStatusChange = async (status: number, id: number) => {
    try {
      await updateCategoryStatus(status, id);
      message.success('状态修改成功');
      await reload();
    } catch {
      // 错误提示由全局请求层统一处理
    }
  };

  const handleDelete = (id: number) => {
    if (!id) {
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除该分类吗？',
      onOk: async () => {
        try {
          await deleteCategory(id);
          message.success('删除成功');
          await reload();
        } catch {
          // 错误提示由全局请求层统一处理
        }
      },
    });
  };

  const columns: ProColumns<Category>[] = [
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '分类类型',
      dataIndex: 'type',
      valueEnum: { 1: '菜品', 2: '套餐' },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: { 1: '启用', 0: '禁用' },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      search: false,
      render: (_, record) => [
        <a key="edit" onClick={() => onEdit(record)}>
          修改
        </a>,
        <a
          key="delete"
          style={{ color: '#f5222d' }}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </a>,
        <a
          key="status"
          onClick={() =>
            handleStatusChange(record.status === 0 ? 1 : 0, record.id)
          }
        >
          {record.status === 0 ? '启用' : '禁用'}
        </a>,
      ],
    },
  ];

  return (
    <PageContainer ghost>
      <ProTable<Category, SearchParams>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ labelWidth: 'auto' }}
        options={false}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          try {
            const res = await getPage({
              ...(rest as SearchParams),
              pageNum: current ?? 1,
              pageSize: pageSize ?? 10,
            });
            return { data: res.records, total: res.total, success: true };
          } catch {
            return { data: [], total: 0, success: false };
          }
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => setCreateModalVisible(true)}
          >
            新增
          </Button>,
        ]}
      />

      <CreateForm
        modalVisible={createModalVisible}
        reloadData={reload}
        hideModal={() => setCreateModalVisible(false)}
      />
      <UpdateForm
        modalVisible={updateModalVisible}
        editingCategory={editingCategory}
        reloadData={reload}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default CategoryPage;
