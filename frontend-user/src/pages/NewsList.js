import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Spin, Empty, Tag, Input, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/api';
import dayjs from 'dayjs';

const { Meta } = Card;
const { Search } = Input;

const NewsList = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchNews();
  }, [pagination.current, typeFilter]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (typeFilter) {
        params.type = typeFilter;
      }
      const res = await newsApi.getNewsList(params);
      setNewsList(res.data?.list || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('Fetch news error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>公告资讯</h1>
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索标题"
          allowClear
          enterButton="搜索"
          size="large"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Select
          placeholder="筛选类型"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={handleTypeChange}
          options={[
            { value: '公告', label: '公告' },
            { value: '新闻', label: '新闻' },
            { value: '活动', label: '活动' },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : newsList.length > 0 ? (
        <Row gutter={[16, 16]}>
          {newsList.map((news) => (
            <Col xs={24} sm={12} lg={8} key={news.id}>
              <Card
                hoverable
                className="card-hover"
                cover={
                  <img
                    alt={news.title}
                    src={news.image || 'https://picsum.photos/400/250'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
                onClick={() => navigate(`/news/${news.id}`)}
              >
                <Meta
                  title={news.title}
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        {news.type && <Tag color="blue">{news.type}</Tag>}
                        <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
                          {dayjs(news.created_at).format('YYYY-MM-DD')}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {news.content?.substring(0, 100)}
                      </div>
                      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                        阅读量: {news.view_count || 0}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无公告资讯" />
      )}

      {pagination.total > 0 && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </div>
      )}
    </div>
  );
};

export default NewsList;
