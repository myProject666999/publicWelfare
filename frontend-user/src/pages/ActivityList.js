import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Spin, Empty, Tag, Select, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { activityApi } from '../services/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const ActivityList = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [pagination.current, statusFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (statusFilter !== '') {
        params.status = statusFilter;
      }
      const res = await activityApi.getActivities(params);
      setActivities(res.data?.list || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('Fetch activities error:', error);
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

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>活动列表</h1>
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ color: '#666' }}>状态筛选:</span>
        <Select
          placeholder="全部状态"
          allowClear
          style={{ width: 200 }}
          onChange={handleStatusChange}
          value={statusFilter === '' ? undefined : statusFilter}
          options={[
            { value: 0, label: '未开始' },
            { value: 1, label: '进行中' },
            { value: 2, label: '已结束' },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : activities.length > 0 ? (
        <Row gutter={[16, 16]}>
          {activities.map((activity) => (
            <Col xs={24} sm={12} lg={8} key={activity.id}>
              <Card
                hoverable
                className="card-hover"
                cover={
                  <img
                    alt={activity.title}
                    src={activity.image || 'https://picsum.photos/400/250'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Button
                    type="link"
                    onClick={() => navigate(`/activities/${activity.id}`)}
                  >
                    查看详情
                  </Button>,
                ]}
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
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>{activity.location || '待定'}</span>
                      </div>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>
                          {activity.start_time ? dayjs(activity.start_time).format('YYYY-MM-DD') : '待定'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserOutlined style={{ marginRight: 4, color: '#999' }} />
                        <span style={{ fontSize: 13 }}>
                          {activity.current_people || 0}/{activity.max_people || '不限'}人
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

export default ActivityList;
