import { getCategoryList } from '@/service/api/category';
import { getDishDetail } from '@/service/api/dish';

Page({
  data: {
    categories: [],
    activeIndex: 0,
    scrollIntoView: '',
    sidebarIntoView: '',
    keyword: '',
    tableNo: '',
    // 购物车（按行存储，支持同一菜品不同规格各占一行）
    cartLines: [],
    // 派生：dishId -> 该菜品总数量（控制按钮/步进器与角标）
    countByDish: {},
    categoryCount: {},
    totalCount: 0,
    totalPrice: '0.00',
    contentBottomHeight: 0,
    // 规格弹层
    specVisible: false,
    specDish: {},
    specGroups: [],
    specSelections: [],
    specComplete: false,
    // 购物车弹层
    cartVisible: false
  },

  // 非渲染数据挂在 this 上，避免不必要的 setData
  categoryTops: [],
  scrollTimer: null,
  contentScrollTop: 0,
  // 当前菜单的菜品索引：dishId -> dish
  dishMap: {},
  // 口味缓存：dishId -> 规格组
  flavorCache: {},

  async onLoad(options) {
    this.setData({ tableNo: (options && options.tableNo) || '' });
    await this.loadMenu();
  },

  async loadMenu() {
    try {
      const categories = await getCategoryList();
      this.applyCategories(categories);
    } catch (e) {
      console.error('菜单加载失败', e);
    }
  },

  /**
   * 应用新的分类列表：重置高亮与滚动位置，再重算各分类偏移量
   * （避免列表变更时右栏仍处于滚动状态导致偏移量计算错误）
   */
  applyCategories(categories) {
    // 重建菜品索引，供操作区按 id 定位菜品
    const dishMap = {};
    (categories || []).forEach(category => {
      (category.items || []).forEach(dish => {
        dishMap[dish.id] = dish;
      });
    });
    this.dishMap = dishMap;

    const first = categories && categories[0];
    this.setData(
      { categories, activeIndex: 0, scrollIntoView: '', sidebarIntoView: '' },
      () => {
        // 把右栏滚回顶部；先清空再设置，确保与旧值相同也能触发
        if (first) {
          this.setData({
            scrollIntoView: `category-${first.id}`,
            sidebarIntoView: `cat-${first.id}`
          });
        }
        this.contentScrollTop = 0;
        // 等待渲染完成后计算各分类位置
        setTimeout(() => this.calcCategoryTops(), 300);
      }
    );
  },

  /**
   * 计算每个分类区块相对滚动容器顶部的偏移量
   */
  calcCategoryTops() {
    const query = wx.createSelectorQuery();
    query.selectAll('.category-section').boundingClientRect();
    query.select('.content').boundingClientRect();
    query.select('.content').scrollOffset();
    query.exec((res) => {
      const sections = res[0];
      const content = res[1];
      const offset = res[2];
      if (!sections || !sections.length || !content) return;

      // 加上当前滚动位移：boundingClientRect 得到的是相对视口的位置，
      // 只有再叠加 scrollTop 才是相对内容顶部的真实偏移量。
      const scrollTop = offset ? offset.scrollTop : this.contentScrollTop || 0;
      this.categoryTops = sections.map(item => item.top - content.top + scrollTop);

      // 底部占位：让最后一个分类的顶部也能滚到容器顶部，
      // 否则内容不足时最后几个分类永远无法被高亮/定位到。
      const lastHeight = sections[sections.length - 1].height;
      const bottom = Math.max(0, content.height - lastHeight);
      if (bottom !== this.data.contentBottomHeight) {
        this.setData({ contentBottomHeight: bottom });
      }
    });
  },

  /**
   * 点击左侧分类 → 右侧滚动
   */
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.categories[index];

    // 先清空再设置，确保重复点击同一分类也能触发滚动
    this.setData({ scrollIntoView: '' }, () => {
      this.setData({
        activeIndex: index,
        scrollIntoView: `category-${category.id}`,
        sidebarIntoView: `cat-${category.id}`
      });
    });
  },

  /**
   * 右侧滚动 → 高亮左侧分类
   */
  onContentScroll(e) {
    // 记录最新滚动位置（供 trailing 更新使用）
    this.contentScrollTop = e.detail.scrollTop;

    // 节流：leading 立即响应；同时安排一次 trailing 更新，
    // 避免滚动停止时最后一个 scroll 事件被节流丢弃，导致最后一项无法高亮。
    if (this.scrollTimer) return;
    this.updateActiveCategory(this.contentScrollTop);
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null;
      this.updateActiveCategory(this.contentScrollTop);
    }, 80);
  },

  /**
   * 滚动到最底部兜底：直接高亮最后一个分类
   */
  onContentScrollToLower() {
    this.highlightCategory(this.data.categories.length - 1);
  },

  /**
   * 根据滚动位置计算并高亮对应分类
   */
  updateActiveCategory(scrollTop) {
    const tops = this.categoryTops;
    const total = this.data.categories.length;
    if (!tops.length || !total) return;

    const last = Math.min(tops.length, total) - 1;
    let index = 0;
    for (let i = 0; i <= last; i++) {
      if (scrollTop >= tops[i] - 10) {
        index = i;
      } else {
        break;
      }
    }
    this.highlightCategory(index);
  },

  /**
   * 高亮指定分类，并让左侧菜单滚动到该项
   */
  highlightCategory(index) {
    if (index < 0 || index === this.data.activeIndex) return;
    const category = this.data.categories[index];
    this.setData({
      activeIndex: index,
      sidebarIntoView: category ? `cat-${category.id}` : ''
    });
  },

  /* ==================== 购物车 ==================== */

  /**
   * 无口味菜品：点击 + 直接加购
   */
  onAddDish(e) {
    const id = e.currentTarget.dataset.id;
    const dish = this.dishMap[id];
    if (!dish) return;
    this.addToCart(dish, []);
  },

  /**
   * 无口味菜品：步进器加减
   */
  onStepperChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setLineQuantity(`dish-${id}`, e.detail.value);
  },

  /**
   * 有口味菜品：打开规格弹层
   */
  onOpenSpec(e) {
    const id = e.currentTarget.dataset.id;
    const dish = this.dishMap[id];
    if (!dish) return;

    const cached = this.flavorCache[dish.id];
    if (cached) {
      this.showSpec(dish, cached);
      return;
    }
    getDishDetail(dish.id)
      .then((vo) => {
        const groups = this.buildSpecGroups((vo && vo.flavors) || []);
        this.flavorCache[dish.id] = groups;
        this.showSpec(dish, groups);
      })
      .catch(() => {
        // 请求层已提示错误
      });
  },

  /**
   * 将后端口味数据转换为弹层需要的规格组
   */
  buildSpecGroups(flavors) {
    return flavors.map(flavor => {
      let values = [];
      try {
        values = JSON.parse(flavor.value || '[]');
      } catch (e) {
        values = [];
      }
      return {
        name: flavor.name,
        options: values.map(v => ({ label: v, value: v }))
      };
    });
  },

  showSpec(dish, groups) {
    this.setData({
      specVisible: true,
      specDish: dish,
      specGroups: groups,
      specSelections: groups.map(() => ''),
      specComplete: groups.length === 0
    });
  },

  onSpecVisibleChange(e) {
    this.setData({ specVisible: e.detail.visible });
  },

  onCloseSpec() {
    this.setData({ specVisible: false });
  },

  /**
   * 规格选择变化：按组索引记录所选值
   */
  onSpecOptionChange(e) {
    const index = e.currentTarget.dataset.index;
    const selections = this.data.specSelections.slice();
    selections[index] = e.detail.value;
    this.setData({
      specSelections: selections,
      specComplete: this.data.specGroups.every((g, i) => !!selections[i])
    });
  },

  /**
   * 确认规格 → 加入购物车
   */
  onSpecConfirm() {
    if (!this.data.specComplete) return;
    const dish = this.data.specDish;
    const spec = this.data.specGroups.map((g, i) => ({
      name: g.name,
      value: this.data.specSelections[i]
    }));
    this.addToCart(dish, spec);
    this.setData({ specVisible: false });
  },

  /**
   * 加入购物车：同菜同规格合并数量，不同规格各占一行
   */
  addToCart(dish, spec) {
    const specKey = spec.map(s => `${s.name}:${s.value}`).join('|');
    const lineId = spec.length ? `dish-${dish.id}#${specKey}` : `dish-${dish.id}`;
    const lines = this.data.cartLines.slice();
    const index = lines.findIndex(line => line.lineId === lineId);

    if (index >= 0) {
      lines[index] = { ...lines[index], quantity: lines[index].quantity + 1 };
    } else {
      lines.push({
        lineId,
        dishId: dish.id,
        type: dish.type,
        categoryId: dish.categoryId,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        spec,
        specText: spec.map(s => `${s.name}:${s.value}`).join(' / '),
        quantity: 1
      });
    }
    this.commitCart(lines);
  },

  /**
   * 设置某一行数量，<=0 删除该行
   */
  setLineQuantity(lineId, value) {
    const lines = this.data.cartLines.slice();
    const index = lines.findIndex(line => line.lineId === lineId);
    if (index < 0) return;

    if (value > 0) {
      lines[index] = { ...lines[index], quantity: value };
    } else {
      lines.splice(index, 1);
    }
    this.commitCart(lines);
  },

  /**
   * 购物车弹层：行加减
   */
  onLineChange(e) {
    this.setLineQuantity(e.currentTarget.dataset.lineId, e.detail.value);
  },

  /**
   * 提交购物车：重算派生数据
   */
  commitCart(lines) {
    const countByDish = {};
    const categoryCount = {};
    let totalCount = 0;
    let totalPrice = 0;

    lines.forEach(line => {
      countByDish[line.dishId] = (countByDish[line.dishId] || 0) + line.quantity;
      categoryCount[line.categoryId] = (categoryCount[line.categoryId] || 0) + line.quantity;
      totalCount += line.quantity;
      totalPrice += Number(line.price) * line.quantity;
    });

    this.setData({
      cartLines: lines,
      countByDish,
      categoryCount,
      totalCount,
      totalPrice: totalPrice.toFixed(2)
    });
  },

  onOpenCart() {
    if (!this.data.cartLines.length) return;
    this.setData({ cartVisible: true });
  },

  onCartVisibleChange(e) {
    this.setData({ cartVisible: e.detail.visible });
  },

  onCloseCart() {
    this.setData({ cartVisible: false });
  },

  onClearCart() {
    this.commitCart([]);
  },

  onCheckout() {
    if (!this.data.totalCount) return;
    const items = this.data.cartLines.map(line => ({
      type: line.type || 1,
      id: line.dishId,
      number: line.quantity,
      dishFlavor: (line.specText || '').slice(0, 50),
      // 以下仅用于结算页展示，提交时后端以 id 重新计价
      name: line.name,
      price: line.price,
      image: line.image,
      specText: line.specText || ''
    }));
    // 结算数据交给确认订单页，避免页面间传参过长
    wx.setStorageSync('pending_order', {
      tableNo: this.data.tableNo || '',
      remark: '',
      items,
      totalPrice: this.data.totalPrice
    });
    wx.navigateTo({
      url: '/pages/order/confirm/index',
      fail: () => wx.showToast({ title: '打开结算页失败', icon: 'none' })
    });
  },

  /* ==================== 搜索 ==================== */

  /**
   * 搜索框输入
   */
  onSearchChange(e) {
    this.setData({ keyword: e.detail.value });
  },

  /**
   * 提交搜索
   */
  onSearchSubmit(e) {
    const keyword = e.detail.value;
    if (!keyword) {
      this.loadMenu();
      return;
    }
    this.filterMenu(keyword);
  },

  /**
   * 清空搜索
   */
  onSearchClear() {
    this.setData({ keyword: '' });
    this.loadMenu();
  },

  /**
   * 按关键词过滤菜品
   */
  filterMenu(keyword) {
    const { categories } = this.data;
    const filtered = categories
      .map(category => ({
        ...category,
        items: category.items.filter(dish =>
          dish.name.includes(keyword)
        )
      }))
      .filter(category => category.items.length > 0);

    this.applyCategories(filtered);
  }
});
