import TableToolbar from '@/components/TableToolbar';
import { useTablePage } from '@/hooks/useTablePage';
import { SearchParams } from '@/pages/Category/type';
import {
  deleteCategory,
  getPage,
  updateCategoryStatus,
} from '@/services/category';
import type { Category } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import type { TableProps } from 'antd';
import { Form, Modal, Pagination, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import CreateForm from './components/CreateForm';
import SearchForm from './components/SearchForm';
import UpdateForm from './components/UpdateForm';

const columns = (
  onStatusChange: (status: number, id: number) => void,
  onEdit: (record: Category) => void,
  handleDelete: (id: number) => void,
): TableProps<Category>['columns'] => [
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: '分类类型',
    dataIndex: 'type',
    key: 'type',
    render: (_, record) => <>{record.type === 1 ? '菜品' : '套餐'}</>,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => <>{record.status === 0 ? '禁用' : '启用'}</>,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a onClick={() => onEdit(record)}>修改</a>
        <a style={{ color: '#f5222d' }} onClick={() => handleDelete(record.id)}>
          删除
        </a>
        <a
          onClick={() => {
            onStatusChange(record.status === 0 ? 1 : 0, record.id);
          }}
        >
          {record.status === 0 ? '启用' : '禁用'}
        </a>
      </Space>
    ),
  },
];

const CategoryPage: React.FC = () => {
  const [form] = Form.useForm<SearchParams>();
  const { data, total, loading, pagination, search, reset, changePage, reload } =
    useTablePage<Category, SearchParams>({ fetch: getPage, form });

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  return (
    <PageContainer ghost>
      <SearchForm form={form} handleSearch={search} handleReset={reset} />
      <TableToolbar onCreate={() => setCreateModalVisible(true)} />

      <Table<Category>
        rowKey="id"
        columns={columns(handleStatusChange, onEdit, handleDelete)}
        dataSource={data}
        pagination={false}
        loading={loading}
      />
      <br />
      <Pagination
        align="end"
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={total}
        showSizeChanger
        showQuickJumper
        onChange={changePage}
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
