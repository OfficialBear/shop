/**
 * 订单明细项
 */
export interface OrderItem {
  id: number;
  name: string;
  image?: string;
  orderId?: number;
  dishId?: number;
  setmealId?: number;
  dishFlavor?: string;
  number: number;
  amount: number;
}

/**
 * 订单
 */
export interface Order {
  id: number;
  number: string;
  /** 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消 */
  status: number;
  amount: number;
  remark?: string;
  orderTime?: string;
  checkoutTime?: string;
  payStatus?: number;
  payMethod?: number;
  tableNo?: string;
  items: OrderItem[];
}
