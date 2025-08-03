import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '../store/slice/tasksSlice';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Table,
  Typography,
} from 'antd';
import PageSpin from '../components/PageSpin';
import { PlusCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useMessageApi } from '../context/MessageContext';
import dayjs from 'dayjs';
import './Style.scss';
import { getTaskColumns } from '../common/Helper';

const { Option } = Select;
const { Title, Text } = Typography;

const Task = ({ userdetails = {} }) => {
  const dispatch = useDispatch();
  const [drawer, setDrawer] = useState(false);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const { tasks, loading, error } = useSelector((state) => state.tasksReducer);
  const messageApi = useMessageApi();

  const handleCreateTask = async (values) => {
    const selectedUser = users.find((u) => u.id === values.assigned_id);
    const payload = {
      ...values,
      assigned_to: selectedUser?.name || '',
      due_date: values.due_date.format('YYYY-MM-DD'),
      status: 'Pending',
    };
    try {
      await dispatch(
        createTask({ currentUser: userdetails, task: payload })
      ).unwrap();
      setDrawer(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create task:', error);
      messageApi.error('Failed to create task ❌');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.getUserOptions();
      if (response.status !== 200) {
        messageApi.error(response.message || 'Failed to fetch users 🙅‍♂️');
        return;
      }
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      messageApi.error('Failed to fetch users ⚠️');
    }
  };

  useEffect(() => {
    dispatch(fetchTasks({ currentUser: userdetails }));
    fetchUsers();
  }, [dispatch, userdetails]);

  if (loading) return <PageSpin />;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-container task-center">
        📭 No task data available
      </div>
    );
  }

  return (
    <div className="task-container">
      <div className="task-header">
        <Title level={4} className="task-title">
          📋 Tasks
        </Title>
        {error && (
          <Text type="danger" className="task-error">
            ⚠️ {error}
          </Text>
        )}
        {(userdetails.role === 'admin' || userdetails.role === 'manager') && (
          <Button
            icon={<PlusCircleOutlined />}
            type="primary"
            className="task-add-btn"
            onClick={() => setDrawer(true)}
          >
            Add Task
          </Button>
        )}
      </div>

      <Table
        className="task-table"
        columns={getTaskColumns(
          userdetails,
          dispatch,
          deleteTask,
          updateTask,
          messageApi
        )}
        dataSource={tasks}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: true }}
      />

      <Drawer
        title="🆕 Create Task"
        open={drawer}
        onClose={() => setDrawer(false)}
        className="task-drawer"
      >
        <Form form={form} onFinish={handleCreateTask} layout="vertical">
          <Form.Item
            label="📝 Title"
            name="title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>
          <Form.Item
            label="📖 Description"
            name="description"
            rules={[
              { required: true, message: 'Please enter task description' },
            ]}
          >
            <Input.TextArea placeholder="Enter task description" />
          </Form.Item>
          <Form.Item
            label="👤 Assign To"
            name="assigned_id"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder="Select user"
              onChange={(id) => {
                const selectedUser = users.find((u) => u.id === id);
                form.setFieldsValue({ assigned_to: selectedUser?.name || '' });
              }}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="📅 Due Date"
            name="due_date"
            rules={[{ required: true, message: 'Please select a due date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              🚀 Create Task
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Task;
