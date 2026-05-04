import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { newsApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const NewsManagement = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [pagination.current, pagination.pageSize]);

  const fetchNews = async (params = {}) => {
    setLoading(true);
    try {
      const res = await newsApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...params,
      });
      setNewsList(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch news error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchNews(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchNews();
  };

  const handleAdd = () => {
    setIsEdit(false);
    setEditingNews(null);
    form.resetFields();
    form.setFieldsValue({
      type: '公告',
      is_top: false,
      status: 1,
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setEditingNews(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await newsApi.delete(id);
      message.success('删除成功');
      fetchNews();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedNews(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        is_top: values.is_top ? 1 : 0,
        status: values.status,
      };
      
      if (isEdit) {
        await newsApi.update(editingNews.id, submitData);
        message.success('更新成功');
      } else {
        await newsApi.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchNews();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const getTypeTag = (type) => {
    const colorMap = {
      '公告': 'blue',
      '新闻': 'green',
      '资讯': 'orange',
    };
    return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getTypeTag(type),
    },
    {
      title: '是否置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      width: 100,
      render: (isTop) => (
        <Tag color={isTop ? 'red' : 'default'}>
          {isTop ? '置顶' : '普通'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该新闻吗？"
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
      <h2 style={{ marginBottom: 24 }}>新闻资讯管理</h2>
      
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入标题" allowClear />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 120 }}>
              <Option value="公告">公告</Option>
              <Option value="新闻">新闻</Option>
              <Option value="资讯">资讯</Option>
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
                新增
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={newsList}
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
        title={isEdit ? '编辑新闻' : '新增新闻'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Option value="公告">公告</Option>
              <Option value="新闻">新闻</Option>
              <Option value="资讯">资讯</Option>
            </Select>
          </Form.Item>
          <Form.Item name="cover_image" label="封面图片">
            <Input placeholder="请输入封面图片URL（可选）" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <TextArea rows={2} placeholder="请输入摘要（可选）" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={8} placeholder="请输入内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_top" label="是否置顶" valuePropName="checked">
                <Select>
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Option value={1}>发布</Option>
                  <Option value={0}>草稿</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
        title="新闻详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedNews && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="标题" span={2}>
                {selectedNews.title}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {getTypeTag(selectedNews.type)}
              </Descriptions.Item>
              <Descriptions.Item label="是否置顶">
                {selectedNews.is_top ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedNews.status === 1 ? '发布' : '草稿'}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {selectedNews.created_at ? dayjs(selectedNews.created_at).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
            <h4>内容</h4>
            <div style={{ whiteSpace: 'pre-wrap', padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              {selectedNews.content || '-'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsManagement;
