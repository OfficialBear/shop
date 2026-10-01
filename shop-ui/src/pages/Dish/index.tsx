import TableToolbar from '@/components/TableToolbar';
import { useTablePage } from '@/hooks/useTablePage';
import { SearchParams } from '@/pages/Dish/type';
import { batchDeleteDishes, getPage, updateDishStatus } from '@/services/dish';
import type { Dish } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import type { TableProps } from 'antd';
import { Form, Image, Modal, Pagination, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import CreateForm from './components/CreateForm';
import SearchForm from './components/SearchForm';
import UpdateForm from './components/UpdateForm';

const columns = (
  onStatusChange: (status: number, id: number) => void,
  onEdit: (record: Dish) => void,
  handleDelete: (ids: number[]) => void,
): TableProps<Dish>['columns'] => [
  {
    title: '菜品名称',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
    render: (_, record) => <Image width={100} src={record.image} />,
  },
  {
    title: '菜品分类',
    dataIndex: 'categoryName',
    key: 'categoryName',
  },
  {
    title: '售价',
    dataIndex: 'price',
    key: 'price',
    render: (_, record) => <>{`¥ ${record.price}`}</>,
  },
  {
    title: '售卖状态',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => <>{record.status === 0 ? '停售' : '启售'}</>,
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
        <a
          style={{ color: '#f5222d' }}
          onClick={() => handleDelete([record.id])}
        >
          删除
        </a>
        <a
          onClick={() => {
            onStatusChange(record.status === 0 ? 1 : 0, record.id);
          }}
        >
          {record.status === 0 ? '启售' : '停售'}
        </a>
      </Space>
    ),
  },
];

const DishPage: React.FC = () => {
  const [form] = Form.useForm<SearchParams>();
  const access = useAccess();
  const {
    data,
    total,
    loading,
    pagination,
    rowSelection,
    selectedRowKeys,
    search,
    reset,
    changePage,
    reload,
  } = useTablePage<Dish, SearchParams>({ fetch: getPage, form });

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const onEdit = (record: Dish) => {
    setEditingDish(record);
    setUpdateModalVisible(true);
  };

  const handleDelete = (ids: number[]) => {
    if (ids.length === 0) {
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除该菜品吗？',
      onOk: async () => {
        try {
          await batchDeleteDishes(ids);
          message.success('删除成功');
          await reload();
        } catch {
          // 错误提示由全局请求层统一处理
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('至少选择一条数据');
      return;
    }
    handleDelete(selectedRowKeys.map(Number));
  };

  const handleStatusChange = async (status: number, id: number) => {
    try {
      await updateDishStatus(status, id);
      message.success('状态修改成功');
      await reload();
    } catch {
      // 错误提示由全局请求层统一处理
    }
  };

  return (
    <PageContainer ghost>
      <SearchForm form={form} handleSearch={search} handleReset={reset} />
      <TableToolbar
        onCreate={() => setCreateModalVisible(true)}
        onBatchDelete={handleBatchDelete}
        canBatchDelete={access.canDeleteFoo}
      />

      <Table<Dish>
        rowKey="id"
        rowSelection={rowSelection}
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
        editingDish={editingDish}
        reloadData={reload}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default DishPage;
