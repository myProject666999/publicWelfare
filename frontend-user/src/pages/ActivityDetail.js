import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Empty, Tag, Descriptions, Divider, Modal, message } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, UserOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { activityApi, favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
    checkFavorite();
  }, [id]);

  const fetchActivityDetail = async () => {
    setLoading(true);
    try {
      const res = await activityApi.getActivityDetail(id);
      setActivity(res.data);
    } catch (error) {
      console.error('Fetch activity detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!token) return;
    try {
      const res = await favoriteApi.getFavorites();
      const favorites = res.data || [];
      const isFav = favorites.some(fav => fav.activity_id === Number(id));
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const handleFavorite = async () => {
    if (!token) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const res = await favoriteApi.getFavorites();
        const favorite = (res.data || []).find(fav => fav.activity_id === Number(id));
        if (favorite) {
          await favoriteApi.removeFavorite(favorite.id);
          message.success('已取消收藏');
          setIsFavorite(false);
        }
      } else {
        await favoriteApi.addFavorite({ activity_id: Number(id) });
        message.success('收藏成功');
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Favorite error:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleApply = () => {
    if (!token) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    if (activity.status !== 1) {
      message.warning('该活动不可申请');
      return;
    }
    Modal.confirm({
      title: '确认申请',
      content: '确定要申请参加这个活动吗？',
      onOk: async () => {
        try {
          await activityApi.applyActivity({ activity_id: Number(id) });
          message.success('申请成功，请等待审核');
        } catch (error) {
          console.error('Apply error:', error);
        }
      },
    });
  };

  const handleRegister = () => {
    if (!token) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    if (role !== 'volunteer') {
      message.warning('只有志愿者可以报名活动，请先申请成为志愿者');
      navigate('/volunteer-apply');
      return;
    }
    if (activity.status !== 1) {
      message.warning('该活动不可报名');
      return;
    }
    if (activity.max_people > 0 && activity.current_people >= activity.max_people) {
      message.warning('活动名额已满');
      return;
    }
    Modal.confirm({
      title: '确认报名',
      content: '确定要报名参加这个活动吗？',
      onOk: async () => {
        try {
          await activityApi.registerActivity({ activity_id: Number(id) });
          message.success('报名成功');
          fetchActivityDetail();
        } catch (error) {
          console.error('Register error:', error);
        }
      },
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return '未开始';
      case 1:
        return '进行中';
      case 2:
        return '已结束';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return 'orange';
      case 1:
        return 'green';
      case 2:
        return 'gray';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return <Empty description="活动不存在" />;
  }

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <img
              src={activity.image || 'https://picsum.photos/600/400'}
              alt={activity.title}
              style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h1 style={{ margin: 0, marginRight: 12 }}>{activity.title}</h1>
              <Tag color={getStatusColor(activity.status)}>
                {getStatusText(activity.status)}
              </Tag>
            </div>

            <Descriptions column={1}>
              <Descriptions.Item label={
                <span><EnvironmentOutlined style={{ marginRight: 4 }} /> 活动地点</span>
              }>
                {activity.location || '待定'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span><CalendarOutlined style={{ marginRight: 4 }} /> 开始时间</span>
              }>
                {activity.start_time ? dayjs(activity.start_time).format('YYYY-MM-DD HH:mm') : '待定'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span><CalendarOutlined style={{ marginRight: 4 }} /> 结束时间</span>
              }>
                {activity.end_time ? dayjs(activity.end_time).format('YYYY-MM-DD HH:mm') : '待定'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span><UserOutlined style={{ marginRight: 4 }} /> 参与人数</span>
              }>
                {activity.current_people || 0} / {activity.max_people || '不限'} 人
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                size="large"
                onClick={handleApply}
                disabled={activity.status !== 1}
              >
                申请参加
              </Button>
              {role === 'volunteer' && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleRegister}
                  disabled={activity.status !== 1 || (activity.max_people > 0 && activity.current_people >= activity.max_people)}
                >
                  志愿者报名
                </Button>
              )}
              <Button
                size="large"
                icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleFavorite}
                loading={favoriteLoading}
              >
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <h3 style={{ marginBottom: 16 }}>活动介绍</h3>
          <div
            style={{ fontSize: 15, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}
          >
            {activity.description || '暂无活动介绍'}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityDetail;
