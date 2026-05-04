import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { activityApplicationApi } from '../services/api';

const ActivityApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await activityApplicationApi.getList(params);
      setApplications(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await activityApplicationApi.approve(id);
      message.success('审核通过成功');
      fetchApplications();
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await activityApplicationApi.reject(id);
      message.success('审核拒绝成功');
      fetchApplications();
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedApplication(record);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
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
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => record.activity?.title || record.title || '-',
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => record.activity?.type || record.type || '-',
    },
    {
      title: '发起人',
      dataIndex: 'username',
      key: 'username',
      render: (_, record) => record.user?.username || '-',
    },
    {
      title: '招募人数',
      dataIndex: 'max_participants',
      key: 'max_participants',
      render: (_, record) => record.activity?.max_participants || record.max_participants || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确定通过该申请吗？"
                onConfirm={() => handleApprove(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" icon={<CheckOutlined />} style={{ color: '#52c41a' }}>
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定拒绝该申请吗？"
                onConfirm={() => handleReject(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<CloseOutlined />}>
                  拒绝
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>活动申请审核</h2>
      
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
          <Button icon={<ReloadOutlined />} onClick={fetchApplications}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={applications}
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

      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedApplication && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="活动名称">
              {selectedActivity?.title || selectedApplication.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="活动类型">
              {selectedApplication.type || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="发起人">
              {selectedApplication.user?.username || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {selectedApplication.start_date ? dayjs(selectedApplication.start_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {selectedApplication.end_date ? dayjs(selectedApplication.end_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="招募人数">
              {selectedApplication.max_participants || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="活动地点">
              {selectedApplication.location || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="活动描述">
              {selectedApplication.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedApplication.status)}
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {selectedApplication.created_at ? dayjs(selectedApplication.created_at).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ActivityApplicationManagement;
