import ChangePasswordModal from '@/components/ChangePasswordModal';
import { logout } from '@/services/auth';
import {
  DownOutlined,
  LockOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown } from 'antd';
import React, { useState } from 'react';

interface UserMenuProps {
  username?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 忽略登出接口异常：本地仍要回到登录页
    }
    window.location.replace('/login');
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'changePassword') {
      setPasswordOpen(true);
    } else if (key === 'logout') {
      void handleLogout();
    }
  };

  const menuItems: MenuProps['items'] = [
    { key: 'changePassword', icon: <LockOutlined />, label: '修改密码' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  return (
    <>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        placement="bottomRight"
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: '0 8px',
            cursor: 'pointer',
          }}
        >
          <Avatar size="small" icon={<UserOutlined />} />
          {username ? <span>{username}</span> : null}
          <DownOutlined style={{ fontSize: 10 }} />
        </span>
      </Dropdown>
      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => {
          void handleLogout();
        }}
      />
    </>
  );
};

export default UserMenu;
