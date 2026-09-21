import { SearchParams } from '@/pages/Category/type';
import {
  deleteCategory,
  getPage,
  updateCategoryStatus,
} from '@/services/category';
import type { Category } from '@/types';
import { PageContainer } from '@ant-design/pro-components';
import type { TableProps } from 'antd';
import {
  Button,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Space,
  Table,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
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
  // ========== 1. 基础状态 ==========
  const [form] = Form.useForm<SearchParams>();

  // ========== 2. 数据状态 ==========
  const [data, setData] = useState<Category[]>([]);
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ========== 5. 表格选择状态 ==========

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

  // ========== 9. 增删改相关事件 ==========

  const onEdit = (record: Category) => {
    setEditingCategory(record);
    setUpdateModalVisible(true);
  };

  const handleStatusChange = async (status: number, id: number) => {
    try {
      await updateCategoryStatus(status, id);
      message.success('状态修改成功');
      // 修改成功后重新查询
      await loadData();
    } catch (error) {
      message.error('状态修改失败');
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
          await loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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
            </Space>
          </Col>
        </Row>
      </div>

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
        onChange={handlePageChange}
      />
      <CreateForm
        modalVisible={createModalVisible}
        reloadData={() => loadData()}
        hideModal={() => setCreateModalVisible(false)}
      />
      <UpdateForm
        modalVisible={updateModalVisible}
        editingCategory={editingCategory}
        reloadData={() => loadData()}
        hideModal={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default CategoryPage;
