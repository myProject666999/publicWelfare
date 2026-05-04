import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { activityApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const ActivityManagement = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [pagination.current, pagination.pageSize]);

  const fetchActivities = async (params = {}) => {
    setLoading(true);
    try {
      const res = await activityApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...params,
      });
      setActivities(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchActivities(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchActivities();
  };

  const handleAdd = () => {
    setIsEdit(false);
    setEditingActivity(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setEditingActivity(record);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      registration_deadline: record.registration_deadline ? dayjs(record.registration_deadline) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await activityApi.delete(id);
      message.success('删除成功');
      fetchActivities();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await activityApi.updateStatus(id, { status });
      message.success('状态更新成功');
      fetchActivities();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedActivity(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
        registration_deadline: values.registration_deadline ? values.registration_deadline.format('YYYY-MM-DD') : null,
      };
      
      if (isEdit) {
        await activityApi.update(editingActivity.id, submitData);
        message.success('更新成功');
      } else {
        await activityApi.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchActivities();
    } catch (error) {
      console.error('Submit error:', error);
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
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '招募人数',
      dataIndex: 'max_participants',
      key: 'max_participants',
    },
    {
      title: '已报名',
      dataIndex: 'participants_count',
      key: 'participants_count',
      render: (count, record) => `${count || 0}/${record.max_participants || '-'}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 90 }}
          >
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <Popconfirm
            title="确定要删除该活动吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>活动管理</h2>
      
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="title" label="活动名称">
            <Input placeholder="请输入活动名称" allowClear />
          </Form.Item>
          <Form.Item name="type" label="活动类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              <Option value="环保">环保</Option>
              <Option value="助学">助学</Option>
              <Option value="敬老">敬老</Option>
              <Option value="助残">助残</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增活动
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={activities}
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
        title={isEdit ? '编辑活动' : '新增活动'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="title" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
            <Input placeholder="请输入活动名称" />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true, message: '请选择活动类型' }]}>
            <Select placeholder="请选择活动类型">
              <Option value="环保">环保</Option>
              <Option value="助学">助学</Option>
              <Option value="敬老">敬老</Option>
              <Option value="助残">助残</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="结束日期" rules={[{ required: true, message: '请选择结束日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="max_participants" label="招募人数" rules={[{ required: true, message: '请输入招募人数' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入招募人数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="registration_deadline" label="报名截止日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="活动地点">
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          <Form.Item name="description" label="活动描述">
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
          <Form.Item name="requirements" label="志愿者要求">
            <TextArea rows={3} placeholder="请输入志愿者要求" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="活动详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedActivity && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="活动名称">
              {selectedActivity.title}
            </Descriptions.Item>
            <Descriptions.Item label="活动类型">
              {selectedActivity.type}
            </Descriptions.Item>
            <Descriptions.Item label="活动地点">
              {selectedActivity.location || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {selectedActivity.start_date ? dayjs(selectedActivity.start_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {selectedActivity.end_date ? dayjs(selectedActivity.end_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="招募人数">
              {selectedActivity.max_participants || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="已报名人数">
              {selectedActivity.participants_count || 0}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedActivity.status)}
            </Descriptions.Item>
            <Descriptions.Item label="活动描述">
              {selectedActivity.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="志愿者要求">
              {selectedActivity.requirements || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ActivityManagement;
