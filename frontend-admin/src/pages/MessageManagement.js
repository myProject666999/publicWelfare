import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { ReloadOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { messageApi } from '../services/api';

const { TextArea } = Input;

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyForm] = Form.useForm();

  useEffect(() => {
    fetchMessages();
  }, [pagination.current, pagination.pageSize]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await messageApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });
      setMessages(res.data.list || res.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || (res.data ? res.data.length : 0),
      }));
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedMessage(record);
    setDetailModalVisible(true);
  };

  const handleReply = (record) => {
    setSelectedMessage(record);
    replyForm.resetFields();
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async (values) => {
    try {
      await messageApi.reply(selectedMessage.id, { reply: values.reply });
      message.success('回复成功');
      setReplyModalVisible(false);
      fetchMessages();
    } catch (error) {
      console.error('Reply error:', error);
    }
  };

  const getStatusTag = (isReplied) => (
    <Tag color={isReplied ? 'green' : 'orange'}>
      {isReplied ? '已回复' : '待回复'}
    </Tag>
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '留言用户',
      dataIndex: 'username',
      key: 'username',
      render: (_, record) => record.user?.username || '匿名',
    },
    {
      title: '主题',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_replied',
      key: 'is_replied',
      render: (isReplied) => getStatusTag(isReplied),
    },
    {
      title: '留言时间',
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {!record.is_replied && (
            <Button type="link" icon={<MessageOutlined />} onClick={() => handleReply(record)}>
              回复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>留言管理</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchMessages}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={messages}
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
        title="留言详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedMessage && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="留言用户">
              {selectedMessage.user?.username || '匿名'}
            </Descriptions.Item>
            <Descriptions.Item label="主题">
              {selectedMessage.subject || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="留言内容">
              {selectedMessage.content || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedMessage.is_replied)}
            </Descriptions.Item>
            {selectedMessage.reply && (
              <Descriptions.Item label="回复内容">
                {selectedMessage.reply}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="留言时间">
              {selectedMessage.created_at ? dayjs(selectedMessage.created_at).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="回复留言"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedMessage && (
          <div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              <strong>原留言：</strong>{selectedMessage.content}
            </p>
            <Form
              form={replyForm}
              layout="vertical"
              onFinish={handleReplySubmit}
            >
              <Form.Item
                name="reply"
                label="回复内容"
                rules={[{ required: true, message: '请输入回复内容' }]}
              >
                <TextArea rows={4} placeholder="请输入回复内容" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    发送
                  </Button>
                  <Button onClick={() => setReplyModalVisible(false)}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessageManagement;
