/**
 * 开发期 mock：管理端订单接口。
 *
 * 仅开发环境生效，生产构建不包含。后端补齐 `/admin/order/*` 后可删除本文件。
 * 路径需带 `/api` 前缀（axios baseURL 为 `/api`）。
 */

interface MockRequest {
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
}

interface MockResponse {
  send: (body: unknown) => void;
}

interface MockOrderItem {
  id: number;
  name: string;
  image?: string;
  orderId: number;
  number: number;
  amount: number;
  dishFlavor?: string;
}

interface MockOrder {
  id: number;
  number: string;
  status: number;
  amount: number;
  remark?: string;
  orderTime: string;
  tableNo: string;
  payMethod: number;
  items: MockOrderItem[];
}

const DISHES = [
  '宫保鸡丁',
  '鱼香肉丝',
  '麻婆豆腐',
  '回锅肉',
  '水煮鱼',
  '酸辣土豆丝',
  '北京烤鸭',
  '小笼包',
];

const pad = (value: number): string => String(value).padStart(2, '0');

const formatDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;

const ORDER_COUNT = 26;

const ORDERS: MockOrder[] = Array.from({ length: ORDER_COUNT }, (_, index) => {
  const id = index + 1;
  const itemCount = (index % 3) + 1;
  const items: MockOrderItem[] = Array.from({ length: itemCount }, (_, j) => ({
    id: id * 10 + j,
    name: DISHES[(index + j) % DISHES.length],
    orderId: id,
    number: (j % 3) + 1,
    amount: 18 + ((index * 7 + j * 5) % 60),
  }));
  const amount = items.reduce(
    (sum, item) => sum + item.amount * item.number,
    0,
  );
  const orderTime = new Date(Date.now() - id * 37 * 60 * 1000);
  return {
    id,
    number: `NO.${String(20260000 + id)}`,
    status: (index % 6) + 1,
    amount,
    remark: index % 4 === 0 ? '不要辣' : '',
    orderTime: formatDateTime(orderTime),
    tableNo: `A${(index % 8) + 1}`,
    payMethod: (index % 2) + 1,
    items,
  };
});

export default {
  'GET /api/admin/order/page': (req: MockRequest, res: MockResponse) => {
    const { pageNum = '1', pageSize = '10', number, status } = req.query;
    let list = ORDERS;
    if (number) {
      list = list.filter((order) => order.number.includes(number));
    }
    if (status) {
      list = list.filter((order) => String(order.status) === String(status));
    }
    const pn = Number(pageNum) || 1;
    const ps = Number(pageSize) || 10;
    const start = (pn - 1) * ps;
    res.send({
      code: 1,
      msg: '成功',
      data: {
        records: list.slice(start, start + ps),
        total: list.length,
        pageNum: pn,
        pageSize: ps,
      },
    });
  },

  'GET /api/admin/order/detail/:id': (req: MockRequest, res: MockResponse) => {
    const id = Number(req.params.id);
    const order = ORDERS.find((item) => item.id === id) ?? null;
    res.send({ code: 1, msg: '成功', data: order });
  },
};
