import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Drawer, Form, Input, Select, Table, Typography } from 'antd';
import PageSpin from '../components/PageSpin';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useMessageApi } from '../context/MessageContext';
import './Style.scss';

import {
  fetchUsers,
  createUser,
  deleteUser,
  updateUser,
} from '../store/slice/usersSlice';
import { getUserColumns } from '../common/Helper';

const { Option } = Select;
const { Title, Text } = Typography;

const User = ({ userdetails = {} }) => {
  const dispatch = useDispatch();
  const [drawer, setDrawer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [form] = Form.useForm();
  const { users, loading, error } = useSelector((state) => state.usersReducer);
  const messageApi = useMessageApi();

  // Create user
  const handleCreateUser = (values) => {
    const selectedUser = users.find((u) => u.id === values.manager_id);
    const payload = {
      ...values,
      password: 'admin123',
      manager_id: values.manager_id || null,
      manager_name: selectedUser?.name || null,
    };

    dispatch(createUser({ currentUser: userdetails, user: payload }))
      .unwrap()
      .then(() => {
        messageApi.success('✅ User created successfully');
        closeDrawer();
      })
      .catch((err) => {
        messageApi.error(`❌ Failed to create user: ${err}`);
      });
  };

  // Update user
  const handleUpdateUser = (values) => {
    const selectedUser = users.find((u) => u.id === values.manager_id);
    const payload = {
      ...values,
      manager_id: values.manager_id || null,
      manager_name: selectedUser?.name || null,
    };

    dispatch(
      updateUser({ currentUser: userdetails, id: userId, user: payload })
    )
      .unwrap()
      .then(() => {
        messageApi.success('✅ User updated successfully');
        closeDrawer();
      })
      .catch((err) => {
        messageApi.error(`❌ Failed to update user: ${err}`);
      });
  };

  // Open create form
  const openCreateDrawer = () => {
    form.resetFields();
    setIsEditMode(false);
    setDrawer(true);
  };

  // Open update form
  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setUserId(record.id);
    setIsEditMode(true);
    setDrawer(true);
  };

  const closeDrawer = () => {
    setDrawer(false);
    setUserId(null);
    form.resetFields();
    setIsEditMode(false);
  };

  const fetchManagerOptions = () => {
    return users
      .filter((user) => user.role === 'manager')
      .map((manager) => (
        <Option key={manager.id} value={manager.id}>
          {manager.name}
        </Option>
      ));
  };

  useEffect(() => {
    dispatch(fetchUsers({ currentUser: userdetails }));
  }, [dispatch, userdetails]);

  if (loading) return <PageSpin />;

  if (!users || users.length === 0) {
    return (
      <div className="user-container user-center">
        📭 No user data available
      </div>
    );
  }

  return (
    <div className="user-container">
      <div className="user-header">
        <Title level={4} className="user-title">
          👥 User Management
        </Title>
        {error && (
          <Text type="danger" className="user-error">
            ⚠️ {error}
          </Text>
        )}

        <Button
          icon={<PlusCircleOutlined />}
          type="primary"
          className="user-add-btn"
          onClick={openCreateDrawer}
        >
          Add User
        </Button>
      </div>

      <Table
        className="user-table"
        columns={getUserColumns(
          userdetails,
          dispatch,
          deleteUser,
          handleEdit,
          messageApi
        )}
        dataSource={users}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: true }}
      />

      <Drawer
        title={isEditMode ? '✏️ Edit User' : '🆕 Create User'}
        open={drawer}
        onClose={closeDrawer}
        className="user-drawer"
      >
        <Form
          form={form}
          onFinish={isEditMode ? handleUpdateUser : handleCreateUser}
          layout="vertical"
        >
          {/* Hidden id for edit mode */}
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter the user name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please enter the role' }]}
          >
            <Select placeholder="Select role" style={{ width: '100%' }}>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'employee' && (
                <Form.Item
                  name="manager_id"
                  label="Report To"
                  rules={[
                    { required: true, message: 'Please select a manager' },
                  ]}
                >
                  <Select
                    placeholder="Select manager"
                    style={{ width: '100%' }}
                  >
                    {fetchManagerOptions()}
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default User;
