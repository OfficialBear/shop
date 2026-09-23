import { SearchParams } from '@/pages/Dish/type';
import { batchDeleteDishes, getPage, updateDishStatus } from '@/services/dish';
import type { Dish } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import type { TableProps } from 'antd';
import {
  Button,
  Col,
  Form,
  Image,
  message,
  Modal,
  Pagination,
  Row,
  Space,
  Table,
} from 'antd';
import React, { useEffect, useState } from 'react';
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
    render: (_, record) => (
      <Image
        width={100}
        src={record.image}
      />
    ),
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

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const DishPage: React.FC = () => {
  // ========== 1. 基础状态 ==========
  const [form] = Form.useForm<SearchParams>();
  const access = useAccess();

  // ========== 2. 数据状态 ==========
  const [data, setData] = useState<Dish[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ========== 3. 查询状态 ==========
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
  });

  // ========== 4. 弹窗状态 ==========
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // ========== 5. 表格选择状态 ==========
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ========== 6. 数据加载 ==========
  const loadData = async () => {
    setLoading(true);

    try {
      const result = await getPage({
        ...searchParams,
        ...pagination,
      });
      setData(result.records);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams, pagination.pageNum, pagination.pageSize]);

  // ========== 7. 查询相关事件 ==========
  const handleSearch = (values: SearchParams) => {
    setSearchParams(values);
    setPagination((prev) => ({
      ...prev,
      pageNum: 1,
    }));
  };

  const handleReset = () => {
    form.resetFields();

    setSearchParams({});

    setPagination((prev) => ({
      ...prev,
      pageNum: 1,
    }));
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination({
      pageNum,
      pageSize,
    });
  };

  // ========== 8. 表格选择相关 ==========
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<Dish> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  // ========== 9. 增删改相关事件 ==========

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
          await loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleStatusChange = async (status: number, id: number) => {
    try {
      await updateDishStatus(status, id);
      message.success('状态修改成功');
      // 修改成功后重新查询
      await loadData();
    } catch (error) {
      message.error('状态修改失败');
    }
  };

  return (
    <PageContainer ghost>
      <SearchForm
        form={form}
        handleSearch={handleSearch}
        handleReset={handleReset}
      />
      <div>
        <Row gutter={32}>
          <Col span={24}>
            <Space>
              <Button
                type="primary"
                onClick={() => setCreateModalVisible(true)}
              >
                新增
              </Button>
              <Access accessible={access.canDeleteFoo}>
                <Button
                  onClick={() => {
                    if (selectedRowKeys.length === 0) {
                      message.warning('至少选择一条数据');
                      return;
                    }
                    const ids = selectedRowKeys.map(Number);
                    handleDelete(ids);
                    setSelectedRowKeys([]);
                  }}
                >
                  批量删除
                </Button>
              </Access>
            </Space>
          </Col>
        </Row>
      </div>

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
        onChange={handlePageChange}
      />
      <CreateForm
        modalVisible={createModalVisible}
        reloadData={() => loadData()}
        hideModal={() => setCreateModalVisible(false)}
      />
      <UpdateForm
        modalVisible={updateModalVisible}
        editingDish={editingDish}
        reloadData={() => loadData()}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default DishPage;
