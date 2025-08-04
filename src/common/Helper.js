import {
  DeleteOutlined,
  DownOutlined,
  EditFilled,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Tooltip, Popover, Space } from 'antd';
import dayjs from 'dayjs';

export const getTaskColumns = (
  userdetails,
  dispatch,
  deleteTask,
  updateTask,
  messageApi
) => {
  const statusColors = {
    Completed: '#52c41a',
    'In Progress': '#1890ff',
    Pending: '#fa8c16',
  };

  const baseColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: (
        <>
          Status{' '}
          <Popover content="Update task status" trigger="hover">
            <QuestionCircleFilled style={{ color: '#1890ff' }} />
          </Popover>
        </>
      ),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const menuItems = Object.keys(statusColors).map((key) => ({
          key,
          label: key,
          onClick: () => {
            dispatch(
              updateTask({
                currentUser: userdetails,
                id: record.id,
                task: { ...record, status: key },
              })
            )
              .unwrap()
              .then(() => messageApi.success(`Status updated to "${key}"`))
              .catch(() => messageApi.error('Failed to update status'));
          },
        }));

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            disabled={!['admin', 'manager'].includes(userdetails.role)}
          >
            <Button
              size="small"
              type="primary"
              style={{
                color: statusColors[status],
                backgroundColor: `${statusColors[status]}20`,
                borderColor: statusColors[status],
                borderRadius: '4px',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {status} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  if (userdetails.role === 'admin') {
    baseColumns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete Task"
          description="Are you sure you want to delete this task?"
          onConfirm={() => {
            dispatch(deleteTask({ currentUser: userdetails, id: record.id }))
              .unwrap()
              .then(() => messageApi.success(`Task deleted successfully`))
              .catch(() => messageApi.error('Failed to delete task'));
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="text" size="small">
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    });
  }

  return baseColumns;
};

export const getUserColumns = (
  userdetails,
  dispatch,
  deleteUser,
  handleUpdate,
  messageApi
) => {
  const baseColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => {
        const role = text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
        return <span>{role || '—'}</span>;
      },
    },
    {
      title: 'Manager',
      dataIndex: 'manager_name',
      key: 'manager_name',
      render: (text) => text || '—',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space align="right">
          <Button type="text" size="small" onClick={() => handleUpdate(record)}>
            <EditFilled />
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => {
              dispatch(deleteUser({ currentUser: userdetails, id: record.id }))
                .unwrap()
                .then(() => messageApi.success(`User deleted successfully`))
                .catch(() => messageApi.error('Failed to delete user'));
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="text" size="small">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return baseColumns;
};
