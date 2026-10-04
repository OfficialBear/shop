/**
 * 开发期 mock：数据统计报表接口。
 *
 * 仅开发环境生效，生产构建不包含。确认效果后可直接删除本文件，
 * 或在 `.umirc.ts` 中设置 `mock: false` 关闭。
 *
 * 路径需带 `/api` 前缀（axios baseURL 为 `/api`）。
 */

interface MockRequest {
  query: Record<string, string | undefined>;
}

interface MockResponse {
  send: (body: unknown) => void;
}

interface TurnoverPoint {
  day: string;
  value: number;
}

interface UserPoint {
  day: string;
  value: number;
  category: string;
}

interface TopSalesPoint {
  name: string;
  value: number;
}

const pad = (value: number): string => String(value).padStart(2, '0');

const format = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) {
    return null;
  }
  return new Date(y, m - 1, d);
};

/**
 * 生成 [begin, end] 的连续日期（含端点）；缺省为最近 7 天。
 */
const buildDays = (beginStr?: string, endStr?: string): string[] => {
  const end = parseDate(endStr) ?? new Date();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const begin =
    parseDate(beginStr) ??
    new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - 6);
  const beginDay = new Date(
    begin.getFullYear(),
    begin.getMonth(),
    begin.getDate(),
  );

  const days: string[] = [];
  const cursor = new Date(beginDay);
  while (cursor <= endDay) {
    days.push(format(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

/**
 * 稳定伪随机：同一天返回同值，切换时间范围时数据不会跳变。
 */
const seed = (text: string): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

/**
 * 营业额：周末适当抬高，让折线更有形态。
 */
const turnoverOf = (day: string): number => {
  const weekday = parseDate(day)?.getDay() ?? 0;
  const weekendBoost = weekday === 0 || weekday === 6 ? 900 : 0;
  return 600 + (seed(`turnover-${day}`) % 2200) + weekendBoost;
};

/**
 * 每日新增用户。
 */
const newUsersOf = (day: string): number => seed(`new-${day}`) % 14;

export default {
  'GET /api/admin/report/turnoverStatistics': (
    req: MockRequest,
    res: MockResponse,
  ) => {
    const days = buildDays(req.query.begin, req.query.end);
    const data: TurnoverPoint[] = days.map((day) => ({
      day,
      value: turnoverOf(day),
    }));
    res.send({ code: 1, msg: '成功', data });
  },

  'GET /api/admin/report/userStatistics': (
    req: MockRequest,
    res: MockResponse,
  ) => {
    const days = buildDays(req.query.begin, req.query.end);
    // 初始存量，使「总用户」量级明显高于「新增」，体现双 Y 轴的意义
    let runningTotal = 126;
    const data: UserPoint[] = [];
    days.forEach((day) => {
      const newUsers = newUsersOf(day);
      runningTotal += newUsers;
      data.push({ day, value: newUsers, category: 'new' });
      data.push({ day, value: runningTotal, category: 'all' });
    });
    res.send({ code: 1, msg: '成功', data });
  },

  'GET /api/admin/report/top10': (req: MockRequest, res: MockResponse) => {
    const names = [
      '宫保鸡丁',
      '鱼香肉丝',
      '麻婆豆腐',
      '回锅肉',
      '水煮鱼',
      '酸辣土豆丝',
      '北京烤鸭',
      '小笼包',
      '兰州拉面',
      '麻辣香锅',
    ];
    // 依据日期区间生成稳定且随时段变化的销量
    const rangeKey = `${req.query.begin ?? ''}~${req.query.end ?? ''}`;
    const data: TopSalesPoint[] = names
      .map((name) => ({
        name,
        value: 20 + (seed(`top-${name}-${rangeKey}`) % 180),
      }))
      .sort((a, b) => b.value - a.value);
    res.send({ code: 1, msg: '成功', data });
  },
};
