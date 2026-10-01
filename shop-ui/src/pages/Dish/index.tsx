import { useCategoryOptions } from '@/hooks/categoryOptions';
import type { SearchParams } from '@/pages/Dish/type';
import { batchDeleteDishes, getPage, updateDishStatus } from '@/services/dish';
import type { Dish } from '@/types';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Image, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const DishPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const { options: categoryOptions, loading: categoryLoading } =
    useCategoryOptions(1);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const reload = async () => {
    await actionRef.current?.reload();
  };

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
          setSelectedRowKeys([]);
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

  const columns: ProColumns<Dish>[] = [
    {
      title: '菜品名称',
      dataIndex: 'name',
    },
    {
      title: '图片',
      dataIndex: 'image',
      search: false,
      render: (_, record) => <Image width={100} src={record.image} />,
    },
    {
      title: '菜品分类',
      dataIndex: 'categoryId',
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        options: categoryOptions,
        loading: categoryLoading,
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      title: '菜品分类',
      dataIndex: 'categoryName',
      search: false,
    },
    {
      title: '售价',
      dataIndex: 'price',
      search: false,
      render: (_, record) => <>{`¥ ${record.price}`}</>,
    },
    {
      title: '售卖状态',
      dataIndex: 'status',
      valueEnum: { 1: '启售', 0: '停售' },
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
          onClick={() => handleDelete([record.id])}
        >
          删除
        </a>,
        <a
          key="status"
          onClick={() =>
            handleStatusChange(record.status === 0 ? 1 : 0, record.id)
          }
        >
          {record.status === 0 ? '启售' : '停售'}
        </a>,
      ],
    },
  ];

  return (
    <PageContainer ghost>
      <ProTable<Dish, SearchParams>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ labelWidth: 'auto' }}
        options={false}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
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
          <Access key="batch-delete" accessible={access.canDeleteFoo}>
            <Button onClick={handleBatchDelete}>批量删除</Button>
          </Access>,
        ]}
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
