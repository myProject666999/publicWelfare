import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const { TabPane } = Tabs;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      infoForm.setFieldsValue({
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, infoForm]);

  const handleInfoSubmit = async (values) => {
    setInfoLoading(true);
    try {
      const res = await authApi.updateInfo(values);
      if (res.data) {
        updateUser(res.data);
      }
      message.success('信息更新成功');
    } catch (error) {
      console.error('Update info error:', error);
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Change password error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>个人中心</h2>
      
      <Card>
        <Tabs defaultActiveKey="info">
          <TabPane tab="个人信息" key="info">
            <Form
              form={infoForm}
              layout="vertical"
              onFinish={handleInfoSubmit}
              style={{ maxWidth: 500 }}
            >
              <Form.Item name="username" label="用户名">
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item name="phone" label="联系电话">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={infoLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="修改密码" key="password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="old_password"
                label="原密码"
                rules={[{ required: true, message: '请输入原密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                name="confirm_password"
                label="确认新密码"
                rules={[
                  { required: true, message: '请再次输入新密码' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
