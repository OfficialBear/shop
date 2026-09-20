// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

import { getCurrentUser, UserInfo } from '@/services/user/auth';

export async function getInitialState(): Promise<UserInfo | {}> {
  try {
    const userInfo = await getCurrentUser();
    return { currentUser: userInfo };
  } catch (error) {
    return {};
  }
}

export const layout = () => {
  return {
    logo: undefined,
    menu: {
      locale: false,
    },
  };
};
