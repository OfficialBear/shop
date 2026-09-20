import { SearchParams } from '@/pages/Employee/type';
import {
  deleteUser,
  getUserList,
  updateUserStatus,
} from '@/services/user/user';
import type { User } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import type { TableProps } from 'antd';
import {
  Button,
  Col,
  Form,
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
  onEdit: (record: User) => void,
): TableProps<User>['columns'] => [
  {
    title: '员工姓名',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: '账号',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    render: (_, record) => <>{record.sex === '0' ? '女' : '男'}</>,
  },
  {
    title: '账号状态',
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

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const EmployeePage: React.FC = () => {
  // ========== 1. 基础状态 ==========
  const [form] = Form.useForm<SearchParams>();
  const access = useAccess();

  // ========== 2. 数据状态 ==========
  const [data, setData] = useState<User[]>([]);
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
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ========== 5. 表格选择状态 ==========
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ========== 6. 数据加载 ==========
  const loadData = async () => {
    setLoading(true);

    try {
      const result = await getUserList({
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

  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  // ========== 9. 增删改相关事件 ==========

  const onEdit = (record: User) => {
    setEditingUser(record);
    setUpdateModalVisible(true);
  };

  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('至少选择一条数据');
      return;
    }
    const ids = selectedRowKeys.map(Number);
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除该员工吗？',
      onOk: async () => {
        await deleteUser(ids);
        await loadData();
      },
    });
  };

  const handleStatusChange = async (status: number, id: number) => {
    await updateUserStatus(status, id);

    // 修改成功后重新查询
    await loadData();
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
                    handleDelete();
                  }}
                >
                  批量删除
                </Button>
              </Access>
            </Space>
          </Col>
        </Row>
      </div>

      <Table<User>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns(handleStatusChange, onEdit)}
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
        onSuccess={() => loadData()}
        onCancel={() => setCreateModalVisible(false)}
      />
      <UpdateForm
        modalVisible={updateModalVisible}
        editingUser={editingUser}
        onSuccess={() => loadData()}
        onCancel={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default EmployeePage;
