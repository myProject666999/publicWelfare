import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  PictureOutlined,
  NotificationOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider, Header, Content, Footer } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '系统首页',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/users'),
    },
    {
      key: 'volunteer-group',
      icon: <TeamOutlined />,
      label: '志愿者管理',
      children: [
        {
          key: '/volunteers',
          icon: <TeamOutlined />,
          label: '志愿者列表',
          onClick: () => navigate('/volunteers'),
        },
        {
          key: '/volunteer-applications',
          icon: <UserAddOutlined />,
          label: '申请审核',
          onClick: () => navigate('/volunteer-applications'),
        },
      ],
    },
    {
      key: 'activity-group',
      icon: <CalendarOutlined />,
      label: '活动管理',
      children: [
        {
          key: '/activities',
          icon: <FileTextOutlined />,
          label: '活动列表',
          onClick: () => navigate('/activities'),
        },
        {
          key: '/activity-applications',
          icon: <CheckCircleOutlined />,
          label: '活动申请审核',
          onClick: () => navigate('/activity-applications'),
        },
        {
          key: '/registrations',
          icon: <UserOutlined />,
          label: '报名管理',
          onClick: () => navigate('/registrations'),
        },
      ],
    },
    {
      key: '/banners',
      icon: <PictureOutlined />,
      label: '轮播图管理',
      onClick: () => navigate('/banners'),
    },
    {
      key: '/news',
      icon: <NotificationOutlined />,
      label: '新闻资讯管理',
      onClick: () => navigate('/news'),
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: '留言管理',
      onClick: () => navigate('/messages'),
    },
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/' || path === '') return ['/dashboard'];
    return [path];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path === '/volunteers' || path === '/volunteer-applications') {
      return ['volunteer-group'];
    }
    if (path === '/activities' || path === '/activity-applications' || path === '/registrations') {
      return ['activity-group'];
    }
    return [];
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout();
        message.success('已退出登录');
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <span style={{ color: 'white', fontSize: collapsed ? 12 : 16, fontWeight: 'bold' }}>
            {collapsed ? '公益后台' : '公益志愿服务管理系统'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <span>{user?.username || '管理员'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 24px 0',
            padding: 24,
            background: '#fff',
            minHeight: 280,
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          公益志愿服务管理系统 ©{new Date().getFullYear()} Created with React & Golang
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
