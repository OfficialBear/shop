import { UserInfo } from '@/services/user/auth';

export default (initialState: { currentUser: UserInfo }) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access

  // 从 initialState 中解构用户信息
  const { currentUser } = initialState || {};
  // 如果用户未登录，所有权限为 false
  if (!currentUser) {
    return {
      canReadFoo: false,
      canUpdateFoo: false,
      canDeleteFoo: false,
    };
  }

  const { role, permissions } = currentUser;

  return {
    // 静态权限：直接返回布尔值
    canReadFoo: true,
    // 根据角色判断
    canUpdateFoo: role === 'admin',
    // 根据权限列表判断
    canDeleteFoo: permissions.includes('foo:delete'),
    // 动态权限：返回一个函数，接收参数进行判断
    canEditItem: (item: any) => item.ownerId === currentUser.id,
  };
};
