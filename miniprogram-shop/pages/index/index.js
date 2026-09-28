import { getCategoryList } from '@/service/api/category';

Page({
  data: {
    categories: [],
    activeIndex: 0,
    scrollIntoView: '',
    sidebarIntoView: '',
    keyword: '',
    cart: {},
    categoryCount: {},
    totalCount: 0,
    totalPrice: '0.00',
    contentBottomHeight: 0
  },

  // 非渲染数据挂在 this 上，避免不必要的 setData
  categoryTops: [],
  scrollTimer: null,
  contentScrollTop: 0,

  async onLoad() {
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

  /**
   * 步进器变化（TDesign t-stepper 统一处理加减）
   */
  onStepperChange(e) {
    const id = e.currentTarget.dataset.id;
    const value = e.detail.value;
    const cart = { ...this.data.cart };

    if (value > 0) {
      cart[id] = value;
    } else {
      delete cart[id];
    }
    this.updateCart(cart);
  },

  /**
   * 更新购物车，同时计算分类角标和总价
   */
  updateCart(cart) {
    const { categories } = this.data;
    const categoryCount = {};
    let totalCount = 0;
    let totalPrice = 0;

    categories.forEach(category => {
      let count = 0;
      category.dishes.forEach(dish => {
        const num = cart[dish.id] || 0;
        if (num > 0) {
          count += num;
          totalCount += num;
          totalPrice += dish.price * num;
        }
      });
      if (count > 0) categoryCount[category.id] = count;
    });

    this.setData({
      cart,
      categoryCount,
      totalCount,
      totalPrice: totalPrice.toFixed(2)
    });
  },

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
        dishes: category.dishes.filter(dish =>
          dish.name.includes(keyword)
        )
      }))
      .filter(category => category.dishes.length > 0);

    this.applyCategories(filtered);
  }
});