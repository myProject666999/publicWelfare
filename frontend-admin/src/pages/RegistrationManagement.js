import React, { useEffect, useState } from 'react';
import { Table, Button, message, Space, Tag, Select } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { registrationApi } from '../services/api';

const { Option } = Select;

const RegistrationManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await registrationApi.getList(params);
      setRegistrations(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch registrations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
      cancelled: { color: 'default', text: '已取消' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '活动名称',
      dataIndex: 'activity_title',
      key: 'activity_title',
      render: (_, record) => record.activity?.title || record.activity_title || '-',
    },
    {
      title: '报名用户',
      dataIndex: 'username',
      key: 'username',
      render: (_, record) => record.user?.username || record.username || '-',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      render: (_, record) => record.real_name || record.user?.real_name || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (_, record) => record.phone || record.user?.phone || '-',
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '报名时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>报名管理</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type={statusFilter === 'all' ? 'primary' : 'default'} 
            onClick={() => setStatusFilter('all')}
          >
            全部
          </Button>
          <Button 
            type={statusFilter === 'pending' ? 'primary' : 'default'} 
            onClick={() => setStatusFilter('pending')}
          >
            待审核
          </Button>
          <Button 
            type={statusFilter === 'approved' ? 'primary' : 'default'} 
            onClick={() => setStatusFilter('approved')}
          >
            已通过
          </Button>
          <Button 
            type={statusFilter === 'rejected' ? 'primary' : 'default'} 
            onClick={() => setStatusFilter('rejected')}
          >
            已拒绝
          </Button>
          <Button 
            type={statusFilter === 'cancelled' ? 'primary' : 'default'} 
            onClick={() => setStatusFilter('cancelled')}
          >
            已取消
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRegistrations}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={registrations}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
          },
        }}
      />
    </div>
  );
};

export default RegistrationManagement;
