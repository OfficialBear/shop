import Stepper from '@/components/Stepper';
import { getListByCategoryId } from '@/services/dish';
import type { Dish, SetmealDish } from '@/types';
import type { TableProps } from 'antd';
import { Button, Col, Empty, Modal, Row, Table, Transfer } from 'antd';
import React, { useEffect, useState } from 'react';

interface DishSelectProps {
  value?: SetmealDish[];
  onChange?: (v: SetmealDish[]) => void;
  disabled?: boolean;
}

const AddDish: React.FC<DishSelectProps> = ({
  value = [],
  onChange,
  disabled,
}) => {
  // ========== 2. 数据状态 ==========
  const [data, setData] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>([]);

  // ========== 4. 弹窗状态 ==========
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // ========== 6. 数据加载 ==========
  const loadData = async () => {
    setLoading(true);

    try {
      const list = await getListByCategoryId();
      const dishes = list ?? [];
      setData(dishes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = () => {
    setTempKeys(value.map((v) => String(v.dishId)).filter(Boolean));
    setModalVisible(true);
  };

  const handleOk = () => {
    const next: SetmealDish[] = tempKeys.map((key) => {
      const dishId = Number(key);
      const existing = value.find((v) => v.dishId === dishId);
      if (existing) return existing;
      const dish = data.find((d) => d.id === dishId);
      return { dishId, name: dish?.name, price: dish?.price, copies: 1 };
    });

    onChange?.(next);
    setModalVisible(false);
  };

  // 改份数
  const handleCopiesChange = (dishId: number, copies: number) => {
    onChange?.(value.map((v) => (v.dishId === dishId ? { ...v, copies } : v)));
  };

  const handleRemove = (dishId: number) => {
    onChange?.(value.filter((v) => v.dishId !== dishId));
  };

  const columns: TableProps<SetmealDish>['columns'] = [
    {
      title: '菜品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '原价',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => <>{`¥ ${record.price}`}</>,
    },
    {
      title: '份数',
      dataIndex: 'copies',
      key: 'copies',
      render: (_, record) => (
        <Stepper
          value={record.copies}
          onChange={(v) => handleCopiesChange(record.dishId, v)}
          disabled={disabled}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <a
          style={{ color: '#f5222d' }}
          onClick={() => handleRemove(record.dishId)}
        >
          删除
        </a>
      ),
    },
  ];

  return (
    <>
      <div>
        <Row gutter={32}>
          <Col span={24}>
            <Button
              type="primary"
              onClick={() => handleOpen()}
              disabled={disabled}
              loading={loading}
            >
              添加菜品
            </Button>
          </Col>
        </Row>
      </div>

      <div>
        {value.length ? (
          <Table<SetmealDish>
            rowKey="dishId"
            columns={columns}
            dataSource={value}
            loading={loading}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂未选择菜品"
          />
        )}
      </div>
      <Modal
        title="选择菜品"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleOk}
        width={760}
        destroyOnHidden
      >
        <Transfer
          dataSource={data}
          rowKey={(record) => String(record.id)}
          targetKeys={tempKeys}
          onChange={(keys) => setTempKeys(keys as string[])}
          render={(item) => item.name}
          titles={['可选菜品', '已选菜品']}
          showSearch
          listStyle={{ width: 320, height: 380 }}
          filterOption={(input, item) =>
            item.name.toLowerCase().includes(input.toLowerCase())
          }
          locale={{
            itemUnit: '项',
            itemsUnit: '项',
            searchPlaceholder: '搜索菜品',
          }}
        />
      </Modal>
    </>
  );
};

export default AddDish;
