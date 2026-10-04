import { history } from '@umijs/max';
import React, { useEffect } from 'react';

/**
 * 无权限访问受保护路由时，重定向到登录页，并保留原目标地址，
 * 便于登录成功后跳回（避免丢失 redirect 参数）。
 */
const UnAccessible: React.FC = () => {
  useEffect(() => {
    const current = `${window.location.pathname}${window.location.search}`;
    if (current.startsWith('/login')) {
      history.replace('/login');
      return;
    }
    history.replace(`/login?redirect=${encodeURIComponent(current)}`);
  }, []);

  return null;
};

export default UnAccessible;
