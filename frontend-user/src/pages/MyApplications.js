import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';
import dayjs from 'dayjs';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getUserApplications();
      setApplications(res.data || []);
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待审核</Tag>;
      case 1:
        return <Tag color="green">已通过</Tag>;
      case 2:
        return <Tag color="red">已拒绝</Tag>;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: ['activity', 'title'],
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/activities/${record.activity_id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '活动地点',
      dataIndex: ['activity', 'location'],
      key: 'location',
    },
    {
      title: '申请理由',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => text || '-',
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>我的申请</h1>
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyApplications;
