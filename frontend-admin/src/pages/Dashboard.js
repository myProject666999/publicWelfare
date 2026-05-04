import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { userApi, volunteerApi, activityApi, newsApi } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    volunteerCount: 0,
    activityCount: 0,
    newsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [userRes, volunteerRes, activityRes, newsRes] = await Promise.all([
        userApi.getList({ page: 1, page_size: 1 }),
        volunteerApi.getList({ page: 1, page_size: 1 }),
        activityApi.getList({ page: 1, page_size: 1 }),
        newsApi.getList({ page: 1, page_size: 1 }),
      ]);
      
      setStats({
        userCount: userRes.data.total || 0,
        volunteerCount: volunteerRes.data.total || 0,
        activityCount: activityRes.data.total || 0,
        newsCount: newsRes.data.total || 0,
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统首页</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.userCount}
              prefix={<UserOutlined />}
              loading={loading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="志愿者总数"
              value={stats.volunteerCount}
              prefix={<TeamOutlined />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活动总数"
              value={stats.activityCount}
              prefix={<CalendarOutlined />}
              loading={loading}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="新闻资讯总数"
              value={stats.newsCount}
              prefix={<NotificationOutlined />}
              loading={loading}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="系统说明">
            <ul style={{ paddingLeft: 20 }}>
              <li>用户管理：管理系统注册用户</li>
              <li>志愿者管理：管理已成为志愿者的用户</li>
              <li>志愿者申请审核：审核用户提交的志愿者申请</li>
              <li>活动管理：创建和管理公益活动</li>
              <li>活动申请审核：审核用户创建活动的申请</li>
              <li>报名管理：查看用户对活动的报名情况</li>
              <li>轮播图管理：管理首页轮播图</li>
              <li>新闻资讯管理：发布和管理公告资讯</li>
              <li>留言管理：查看和回复用户留言</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="操作提示">
            <ul style={{ paddingLeft: 20 }}>
              <li>点击左侧菜单进入相应管理页面</li>
              <li>点击顶部折叠按钮可收起/展开侧边栏</li>
              <li>点击右上角头像可进入个人中心或退出登录</li>
              <li>用户默认账号：admin / 123456</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
