import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spin, Empty, Modal, message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, CalendarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { favoriteApi } from '../services/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getFavorites();
      setFavorites(res.data || []);
    } catch (error) {
      console.error('Fetch favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (favorite) => {
    Modal.confirm({
      title: '确认取消收藏',
      content: `确定要取消收藏活动 "${favorite.activity?.title}" 吗？`,
      onOk: async () => {
        try {
          await favoriteApi.removeFavorite(favorite.id);
          message.success('已取消收藏');
          fetchFavorites();
        } catch (error) {
          console.error('Remove favorite error:', error);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="orange">未开始</Tag>;
      case 1:
        return <Tag color="green">进行中</Tag>;
      case 2:
        return <Tag color="gray">已结束</Tag>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>我的收藏</h1>
      
      {favorites.length > 0 ? (
        <Row gutter={[16, 16]}>
          {favorites.map((favorite) => (
            <Col xs={24} sm={12} lg={8} key={favorite.id}>
              <Card
                hoverable
                className="card-hover"
                cover={
                  <img
                    alt={favorite.activity?.title}
                    src={favorite.activity?.image || 'https://picsum.photos/400/250'}
                    style={{ height: 200, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/activities/${favorite.activity_id}`)}
                  />
                }
                actions={[
                  <Button
                    type="text"
                    onClick={() => navigate(`/activities/${favorite.activity_id}`)}
                  >
                    查看详情
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(favorite)}
                  >
                    取消收藏
                  </Button>,
                ]}
              >
                <Meta
                  title={
                    <div>
                      {favorite.activity?.title}
                      {getStatusTag(favorite.activity?.status)}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>{favorite.activity?.location || '待定'}</span>
                      </div>
                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>
                          {favorite.activity?.start_time ? dayjs(favorite.activity.start_time).format('YYYY-MM-DD') : '待定'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>
                          {favorite.activity?.current_people || 0}/{favorite.activity?.max_people || '不限'}人
                        </span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="暂无收藏的活动"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/activities')}>
            去浏览活动
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default Favorites;
