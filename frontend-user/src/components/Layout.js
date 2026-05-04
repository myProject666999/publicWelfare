import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, HeartOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, token } = useAuth();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/news')) return 'news';
    if (path.startsWith('/activities')) return 'activities';
    if (path === '/profile') return 'profile';
    if (path === '/favorites') return 'favorites';
    if (path === '/messages') return 'messages';
    if (path === '/volunteer-apply') return 'volunteer';
    if (path === '/volunteer-center') return 'volunteer-center';
    if (path === '/my-applications') return 'applications';
    return 'home';
  };

  const menuItems = [
    { key: 'home', label: '首页', onClick: () => navigate('/') },
    { key: 'news', label: '公告资讯', onClick: () => navigate('/news') },
    { key: 'activities', label: '活动列表', onClick: () => navigate('/activities') },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/favorites'),
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: '留言板',
      onClick: () => navigate('/messages'),
    },
    {
      key: 'applications',
      label: '我的申请',
      onClick: () => navigate('/my-applications'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  const volunteerMenuItem = role === 'volunteer' 
    ? { key: 'volunteer-center', label: '志愿者中心', onClick: () => navigate('/volunteer-center') }
    : { key: 'volunteer-apply', label: '申请志愿者', onClick: () => navigate('/volunteer-apply') };

  const loggedInMenuItems = [
    ...menuItems,
    volunteerMenuItem,
  ];

  return (
    <Layout className="layout-container">
      <Header>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          公益志愿服务管理系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={token ? loggedInMenuItems : menuItems}
          style={{ flex: 1, justifyContent: 'flex-end', minWidth: 0 }}
        />
        {token ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: 'white', marginLeft: 16 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || user?.real_name || '用户'}</span>
              {role === 'volunteer' && <span style={{ color: '#52c41a' }}>[志愿者]</span>}
            </Space>
          </Dropdown>
        ) : (
          <Space style={{ marginLeft: 16 }}>
            <Button type="text" style={{ color: 'white' }} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 24 }}>
        <div className="site-layout-content">{children}</div>
      </Content>
      <Footer>公益志愿服务管理系统 ©{new Date().getFullYear()} Created with React & Golang</Footer>
    </Layout>
  );
};

export default MainLayout;
