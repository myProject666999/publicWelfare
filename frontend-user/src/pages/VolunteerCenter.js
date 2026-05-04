import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Modal, message, Tabs, Form, Input, InputNumber, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { volunteerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const VolunteerCenter = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [volunteerInfo, setVolunteerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, infoRes] = await Promise.all([
        volunteerApi.getRegistrations(),
        volunteerApi.getInfo(),
      ]);
      setRegistrations(regRes.data || []);
      setVolunteerInfo(infoRes.data);
      if (infoRes.data) {
        form.setFieldsValue({
          real_name: infoRes.data.real_name,
          phone: infoRes.data.phone,
          id_card: infoRes.data.id_card,
          age: infoRes.data.age,
          gender: infoRes.data.gender,
          skills: infoRes.data.skills,
          experience: infoRes.data.experience,
        });
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = (registration) => {
    Modal.confirm({
      title: '确认取消报名',
      content: `确定要取消活动 "${registration.activity?.title}" 的报名吗？`,
      onOk: async () => {
        try {
          await volunteerApi.cancelRegistration(registration.id);
          message.success('已取消报名');
          fetchData();
        } catch (error) {
          console.error('Cancel registration error:', error);
        }
      },
    });
  };

  const handleUpdateInfo = async (values) => {
    setInfoLoading(true);
    try {
      await volunteerApi.updateInfo(values);
      message.success('更新成功');
      updateUser({ ...values });
      fetchData();
    } catch (error) {
      console.error('Update info error:', error);
    } finally {
      setInfoLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="green">已报名</Tag>;
      case 2:
        return <Tag color="gray">已取消</Tag>;
      default:
        return null;
    }
  };

  const registrationColumns = [
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
      title: '开始时间',
      dataIndex: ['activity', 'start_time'],
      key: 'start_time',
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
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
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) =>
        record.status === 1 ? (
          <Button type="link" danger onClick={() => handleCancelRegistration(record)}>
            取消报名
          </Button>
        ) : null,
    },
  ];

  const tabItems = [
    {
      key: 'registrations',
      label: '我的报名',
      children: (
        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={registrations}
              columns={registrationColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'info',
      label: '个人信息',
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateInfo}
            style={{ maxWidth: 500 }}
          >
            <Form.Item label="真实姓名" name="real_name">
              <Input placeholder="请输入真实姓名" />
            </Form.Item>

            <Form.Item label="手机号" name="phone">
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item label="身份证号" name="id_card">
              <Input placeholder="请输入身份证号" />
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
                placeholder="请描述您的技能特长"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item label="服务经验" name="experience">
              <TextArea
                rows={3}
                placeholder="请描述您的志愿服务经验"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={infoLoading} size="large">
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>志愿者中心</h1>
      <Tabs items={tabItems} defaultActiveKey="registrations" />
    </div>
  );
};

export default VolunteerCenter;
