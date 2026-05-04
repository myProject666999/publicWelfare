import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { volunteerApi } from '../services/api';

const { Option } = Select;

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, [pagination.current, pagination.pageSize]);

  const fetchVolunteers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await volunteerApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...params,
      });
      setVolunteers(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch volunteers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchVolunteers(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchVolunteers();
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await volunteerApi.getById(id);
      setSelectedVolunteer(res.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Fetch volunteer detail error:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await volunteerApi.updateStatus(id, { status });
      message.success('状态更新成功');
      fetchVolunteers();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (_, record) => record.user?.username || '-',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '志愿者类型',
      dataIndex: 'volunteer_type',
      key: 'volunteer_type',
    },
    {
      title: '服务时长(小时)',
      dataIndex: 'service_hours',
      key: 'service_hours',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '停用'}
        </Tag>
      ),
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
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 80 }}
          >
            <Option value={1}>正常</Option>
            <Option value={0}>停用</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>志愿者管理</h2>
      
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="real_name" label="真实姓名">
            <Input placeholder="请输入姓名" allowClear />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={volunteers}
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
        title="志愿者详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedVolunteer && (
          <div>
            <p><strong>用户ID：</strong>{selectedVolunteer.user_id}</p>
            <p><strong>真实姓名：</strong>{selectedVolunteer.real_name}</p>
            <p><strong>手机号：</strong>{selectedVolunteer.phone}</p>
            <p><strong>邮箱：</strong>{selectedVolunteer.email || '-'}</p>
            <p><strong>身份证号：</strong>{selectedVolunteer.id_card || '-'}</p>
            <p><strong>志愿者类型：</strong>{selectedVolunteer.volunteer_type || '-'}</p>
            <p><strong>服务时长：</strong>{selectedVolunteer.service_hours || 0} 小时</p>
            <p><strong>技能特长：</strong>{selectedVolunteer.skills || '-'}</p>
            <p><strong>个人简介：</strong>{selectedVolunteer.introduction || '-'}</p>
            <p><strong>申请时间：</strong>{selectedVolunteer.created_at ? dayjs(selectedVolunteer.created_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VolunteerManagement;
