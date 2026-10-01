import { history } from '@umijs/max';
import React, { useEffect } from 'react';

/**
 * 无权限访问受保护路由时，重定向到登录页。
 */
const UnAccessible: React.FC = () => {
  useEffect(() => {
    history.replace('/login');
  }, []);

  return null;
};

export default UnAccessible;
