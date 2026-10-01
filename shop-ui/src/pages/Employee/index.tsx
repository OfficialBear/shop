import TableToolbar from '@/components/TableToolbar';
import { useTablePage } from '@/hooks/useTablePage';
import { SearchParams } from '@/pages/Employee/type';
import {
  batchDeleteEmployees,
  getPage,
  updateEmployeeStatus,
} from '@/services/employee';
import type { Employee } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import type { TableProps } from 'antd';
import { Form, Modal, Pagination, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import CreateForm from './components/CreateForm';
import SearchForm from './components/SearchForm';
import UpdateForm from './components/UpdateForm';

const columns = (
  onStatusChange: (status: number, id: number) => void,
  onEdit: (record: Employee) => void,
): TableProps<Employee>['columns'] => [
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

const EmployeePage: React.FC = () => {
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
  } = useTablePage<Employee, SearchParams>({ fetch: getPage, form });

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const onEdit = (record: Employee) => {
    setEditingEmployee(record);
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
        try {
          await batchDeleteEmployees(ids);
          message.success('删除成功');
          await reload();
        } catch {
          // 错误提示由全局请求层统一处理
        }
      },
    });
  };

  const handleStatusChange = async (status: number, id: number) => {
    try {
      await updateEmployeeStatus(status, id);
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
        onBatchDelete={handleDelete}
        canBatchDelete={access.canDeleteFoo}
      />

      <Table<Employee>
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
        onChange={changePage}
      />
      <CreateForm
        modalVisible={createModalVisible}
        reloadData={reload}
        hideModal={() => setCreateModalVisible(false)}
      />
      <UpdateForm
        modalVisible={updateModalVisible}
        editingEmployee={editingEmployee}
        reloadData={reload}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default EmployeePage;
