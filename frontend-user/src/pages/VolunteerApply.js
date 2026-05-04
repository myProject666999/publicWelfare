import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, message, List, Tag, Spin } from 'antd';
import { volunteerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const VolunteerApply = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const res = await volunteerApi.getApplication();
      setApplications(res.data || []);
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await volunteerApi.applyVolunteer(values);
      message.success('申请提交成功，请等待审核');
      form.resetFields();
      fetchApplications();
    } catch (error) {
      console.error('Apply volunteer error:', error);
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

  const hasPendingApplication = applications.some(app => app.status === 0);
  const hasApprovedApplication = role === 'volunteer';

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>志愿者申请</h1>

      {hasApprovedApplication ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Tag color="green" style={{ fontSize: 18, padding: '8px 24px' }}>
              您已成为志愿者
            </Tag>
            <p style={{ marginTop: 20, color: '#666' }}>
              您已通过志愿者申请，可以前往志愿者中心报名参加活动
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card title="我的申请记录" style={{ marginBottom: 24 }}>
            {applicationsLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin />
              </div>
            ) : applications.length > 0 ? (
              <List
                dataSource={applications}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span>{item.real_name}</span>
                          {getStatusTag(item.status)}
                        </div>
                      }
                      description={
                        <div style={{ color: '#999' }}>
                          申请时间：{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                          {item.reason && <span style={{ marginLeft: 16 }}>申请理由：{item.reason}</span>}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无申请记录
              </div>
            )}
          </Card>

          {hasPendingApplication ? (
            <Card>
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                您有一个待审核的申请，请等待管理员审核
              </div>
            </Card>
          ) : (
            <Card title="填写申请信息">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
              >
                <Form.Item
                  label="真实姓名"
                  name="real_name"
                  rules={[{ required: true, message: '请输入真实姓名!' }]}
                >
                  <Input placeholder="请输入真实姓名" />
                </Form.Item>

                <Form.Item
                  label="手机号"
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号!' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>

                <Form.Item label="身份证号" name="id_card">
                  <Input placeholder="请输入身份证号 (选填)" />
                </Form.Item>

                <Form.Item label="年龄" name="age">
                  <InputNumber
                    min={1}
                    max={120}
                    placeholder="请输入年龄"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item label="性别" name="gender">
                  <Select placeholder="请选择性别">
                    <Option value="男">男</Option>
                    <Option value="女">女</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="技能特长" name="skills">
                  <TextArea
                    rows={3}
                    placeholder="请描述您的技能特长 (选填)"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>

                <Form.Item label="申请理由" name="reason">
                  <TextArea
                    rows={4}
                    placeholder="请描述您想成为志愿者的理由"
                    showCount
                    maxLength={500}
                    rules={[{ required: true, message: '请输入申请理由!' }]}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    提交申请
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default VolunteerApply;
