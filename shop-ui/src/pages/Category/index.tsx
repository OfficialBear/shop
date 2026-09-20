
import { PageContainer } from '@ant-design/pro-components';

import { Space, Table, Pagination } from 'antd';
import type { TableProps } from 'antd';

interface DataType {
  id: number;
  username: string;
  name: string;
  phone: string;
  sex: string;
  idNumber: string;
  status: number;
  createTime: string;
  updateTime: string;
}

const columns: TableProps<DataType>['columns'] = [
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
    title: '账号状态',
    dataIndex: 'status',
    key: 'status',
    render:(_, record) => (
      <>
      {record.status === 0?'禁用':'启用'}
      </>
    ),
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
        <a>修改</a>
        <a>Invite {record.name}</a>
      </Space>
    ),
  },
];

const data: DataType[] = [];

const CategoryPage: React.FC = () => {
  
  return (
    <PageContainer ghost>
      <Table <DataType> columns={columns} dataSource={data} />
      <Pagination defaultCurrent={6} total={500} />
    </PageContainer>
  );
};

export default CategoryPage;