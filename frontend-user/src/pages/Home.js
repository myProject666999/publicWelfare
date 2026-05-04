import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Carousel, Button, Spin, Empty, Tag } from 'antd';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { bannerApi, newsApi, activityApi } from '../services/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bannersRes, newsRes, activitiesRes] = await Promise.all([
        bannerApi.getBanners(),
        newsApi.getNewsList({ page: 1, page_size: 4 }),
        activityApi.getActivities({ page: 1, page_size: 8 }),
      ]);
      setBanners(bannersRes.data || []);
      setNewsList(newsRes.data?.list || []);
      setActivities(activitiesRes.data?.list || []);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
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
      {banners.length > 0 && (
        <div className="banner-carousel" style={{ marginBottom: 32 }}>
          <Carousel autoplay>
            {banners.map((banner) => (
              <div key={banner.id}>
                <img
                  src={banner.image || 'https://picsum.photos/1200/300'}
                  alt={banner.title}
                  style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>最新公告</h2>
          <Button type="link" onClick={() => navigate('/news')}>
            查看更多 <RightOutlined />
          </Button>
        </div>
        {newsList.length > 0 ? (
          <Row gutter={[16, 16]}>
            {newsList.map((news) => (
              <Col xs={24} sm={12} lg={6} key={news.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <img
                      alt={news.title}
                      src={news.image || 'https://picsum.photos/400/200'}
                      style={{ height: 150, objectFit: 'cover' }}
                    />
                  }
                  onClick={() => navigate(`/news/${news.id}`)}
                >
                  <Meta
                    title={news.title}
                    description={
                      <div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          {dayjs(news.created_at).format('YYYY-MM-DD')}
                        </div>
                        <div style={{ marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {news.type && <Tag color="blue">{news.type}</Tag>}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无公告" />
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>热门活动</h2>
          <Button type="link" onClick={() => navigate('/activities')}>
            查看更多 <RightOutlined />
          </Button>
        </div>
        {activities.length > 0 ? (
          <Row gutter={[16, 16]}>
            {activities.map((activity) => (
              <Col xs={24} sm={12} lg={6} key={activity.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <img
                      alt={activity.title}
                      src={activity.image || 'https://picsum.photos/400/200'}
                      style={{ height: 150, objectFit: 'cover' }}
                    />
                  }
                  onClick={() => navigate(`/activities/${activity.id}`)}
                >
                  <Meta
                    title={
                      <div>
                        {activity.title}
                        {getStatusTag(activity.status)}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          <span style={{ fontSize: 12 }}>{activity.location || '待定'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          <span style={{ fontSize: 12 }}>
                            {activity.start_time ? dayjs(activity.start_time).format('MM-DD') : '待定'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <UserOutlined style={{ marginRight: 4 }} />
                          <span style={{ fontSize: 12 }}>
                            {activity.current_people}/{activity.max_people || '不限'}人
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
          <Empty description="暂无活动" />
        )}
      </div>
    </div>
  );
};

export default Home;
