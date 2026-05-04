import React, { useEffect, useState } from 'react';
import { Card, List, Button, Form, Input, Modal, message, Tag, Empty, Spin } from 'antd';
import { MessageOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { messageApi } from '../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await messageApi.getMessages();
      setMessages(res.data || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await messageApi.createMessage(values);
      message.success('留言成功');
      form.resetFields();
      fetchMessages();
    } catch (error) {
      console.error('Create message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (msg) => {
    setSelectedMessage(msg);
    setModalVisible(true);
  };

  const getStatusTag = (status) => {
    if (status === 1) {
      return <Tag icon={<CheckCircleOutlined />} color="green">已回复</Tag>;
    }
    return <Tag icon={<ClockCircleOutlined />} color="orange">待回复</Tag>;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>留言板</h1>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="发布留言">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="content"
                rules={[{ required: true, message: '请输入留言内容!' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="请输入您想咨询的问题或建议..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  提交留言
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="我的留言记录">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : messages.length > 0 ? (
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item
                    actions={[
                      <Button type="link" onClick={() => handleViewDetail(msg)}>
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<MessageOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>
                            {msg.content?.substring(0, 30)}
                            {msg.content?.length > 30 && '...'}
                          </span>
                          {getStatusTag(msg.status)}
                        </div>
                      }
                      description={
                        <div style={{ color: '#999' }}>
                          {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}
                          {msg.reply && (
                            <span style={{ marginLeft: 16, color: '#52c41a' }}>
                              管理员已回复
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无留言记录" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="留言详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedMessage && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>您的留言：</h4>
              <div
                style={{
                  padding: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedMessage.content}
              </div>
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                留言时间：{dayjs(selectedMessage.created_at).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>

            {selectedMessage.reply ? (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8, color: '#1890ff' }}>管理员回复：</h4>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedMessage.reply}
                </div>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  回复时间：{selectedMessage.replied_at ? dayjs(selectedMessage.replied_at).format('YYYY-MM-DD HH:mm') : '-'}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                管理员尚未回复，请耐心等待
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
