import type { SearchParams } from '@/pages/Employee/type';
import {
  batchDeleteEmployees,
  getPage,
  updateEmployeeStatus,
} from '@/services/employee';
import type { Employee } from '@/types';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const EmployeePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const reload = async () => {
    await actionRef.current?.reload();
  };

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
          setSelectedRowKeys([]);
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

  const columns: ProColumns<Employee>[] = [
    {
      title: '员工姓名',
      dataIndex: 'name',
    },
    {
      title: '账号',
      dataIndex: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      valueEnum: { 1: '男', 0: '女' },
    },
    {
      title: '账号状态',
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
      <ProTable<Employee, SearchParams>
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
            <Button onClick={handleDelete}>批量删除</Button>
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
        editingEmployee={editingEmployee}
        reloadData={reload}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default EmployeePage;
