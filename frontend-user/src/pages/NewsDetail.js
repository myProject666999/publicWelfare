import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Empty, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { newsApi } from '../services/api';
import dayjs from 'dayjs';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    try {
      const res = await newsApi.getNewsDetail(id);
      setNews(res.data);
    } catch (error) {
      console.error('Fetch news detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return <Empty description="资讯不存在" />;
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
        <h1 style={{ marginBottom: 16 }}>{news.title}</h1>
        
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          {news.type && <Tag color="blue">{news.type}</Tag>}
          <span style={{ color: '#999' }}>
            {dayjs(news.created_at).format('YYYY-MM-DD HH:mm')}
          </span>
          <span style={{ color: '#999' }}>
            <EyeOutlined style={{ marginRight: 4 }} />
            {news.view_count || 0} 阅读
          </span>
          {news.author && (
            <span style={{ color: '#999' }}>作者: {news.author}</span>
          )}
        </div>

        {news.image && (
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <img
              src={news.image}
              alt={news.title}
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
            />
          </div>
        )}

        <Divider />

        <div
          style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}
          dangerouslySetInnerHTML={{ __html: news.content?.replace(/\n/g, '<br/>') }}
        />
      </Card>
    </div>
  );
};

export default NewsDetail;
