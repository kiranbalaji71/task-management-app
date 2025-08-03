import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  Divider,
  Calendar,
  Button,
  Tooltip,
  Progress,
  Avatar,
} from 'antd';
import api from '../utils/api';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import PageSpin from '../components/PageSpin';
import { useMessageApi } from '../context/MessageContext';
import './Style.scss';

const { Text } = Typography;

const Dashboard = ({ userdetails = {} }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const messageApi = useMessageApi();

  const fetchDashboardData = async (user) => {
    try {
      setLoading(true);
      const response = await api.getDashboardData(user);
      if (response.status === 200) {
        setDashboardData(response.data);
      } else {
        messageApi.error(
          response.message || 'Failed to fetch dashboard data 🙅‍♂️'
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      messageApi.error('Error fetching dashboard data ⚠️');
    } finally {
      setLoading(false);
    }
  };

  const dateCellRender = (current, tasks) => {
    const tasksForDate = tasks.filter((task) =>
      dayjs(task.date).isSame(current, 'day')
    );

    if (!tasksForDate.length) {
      return (
        <Tag color="default" className="dashboard-no-task-tag">
          No tasks
        </Tag>
      );
    }

    return (
      <div className="dashboard-task-list">
        {tasksForDate.slice(0, 2).map((item, idx) => {
          const color =
            item.status === 'Pending'
              ? 'orange'
              : item.status === 'In Progress'
              ? 'blue'
              : 'green';

          return (
            <Tooltip
              key={idx}
              title={`${item.title} (${item.status}) - Assigned to: ${item.assignedTo}`}
            >
              <Tag color={color} className="dashboard-task-tag">
                {item.title.length > 6
                  ? item.title.slice(0, 6) + '...'
                  : item.title}
              </Tag>
            </Tooltip>
          );
        })}

        {tasksForDate.length > 2 && (
          <Text className="dashboard-more-tasks">
            +{tasksForDate.length - 2} more
          </Text>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (Object.keys(userdetails).length > 0) {
      fetchDashboardData(userdetails);
    }
  }, [userdetails]);

  if (loading) {
    return <PageSpin />;
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container dashboard-center">
        📭 No dashboard data available
      </div>
    );
  }

  const {
    total_tasks,
    status,
    tasks,
    team_members,
    total_users,
    total_managers,
    total_employees,
  } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-section-title">👥 Team Overview</div>
      <Row gutter={[16, 16]}>
        {[
          { title: '📋 Total Tasks', value: total_tasks },
          userdetails.role === 'admin' && {
            title: '👤 Total Users',
            value: total_users,
          },
          userdetails.role === 'admin' && {
            title: '🧑‍💼 Total Managers',
            value: total_managers,
          },
          (userdetails.role === 'admin' || userdetails.role === 'manager') && {
            title:
              userdetails.role === 'admin'
                ? '🧑‍💻 Total Employees'
                : '🛠️ Crew Members',
            value: total_employees,
          },
        ]
          .filter(Boolean)
          .map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.title}>
              <Card>
                <Statistic title={item.title} value={item.value} />
              </Card>
            </Col>
          ))}

        {userdetails.role !== 'admin' && (
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={userdetails.role === 'manager' ? 12 : 18}
          >
            <Card>
              {team_members.length > 0 ? (
                <div className="dashboard-team-members">
                  <Statistic
                    title="👨‍👩‍👦 Total Team Members"
                    value={team_members.length}
                  />
                  <Avatar.Group
                    maxCount={5}
                    size="large"
                    maxStyle={{
                      color: '#f56a00',
                      backgroundColor: '#fde3cf',
                      cursor: 'pointer',
                    }}
                  >
                    {team_members.map((member, index) => (
                      <Tooltip
                        key={index}
                        title={`${member.name} (${member.role})`}
                        placement="top"
                      >
                        <Avatar
                          style={{
                            backgroundColor:
                              member.role === 'manager' ? '#1890ff' : '#52c41a',
                          }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              ) : (
                <Typography.Text type="secondary">
                  🙅 No team members
                </Typography.Text>
              )}
            </Card>
          </Col>
        )}
      </Row>

      <Divider />

      <div className="dashboard-section-title">📊 Task Status Overview</div>
      <Row gutter={[16, 16]}>
        {status.map((item) => {
          const statusColor =
            item.status === 'Completed'
              ? '#52c41a'
              : item.status === 'In Progress'
              ? '#1890ff'
              : '#fa8c16';

          const percent =
            total_tasks > 0 ? Math.round((item.count / total_tasks) * 100) : 0;

          return (
            <Col xs={24} sm={12} md={8} key={item.status}>
              <Card className="dashboard-status-card">
                <Progress
                  type="dashboard"
                  percent={percent}
                  size={120}
                  strokeColor={statusColor}
                />
                <div className="dashboard-status-title">
                  {item.status === 'Completed' && '✅ '}
                  {item.status === 'In Progress' && '⚙️ '}
                  {item.status === 'Pending' && '⏳ '}
                  {item.status}
                </div>
                <div className="dashboard-status-count">
                  {item.count} / {total_tasks} tasks
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Divider />

      <div className="dashboard-section-title">📅 Upcoming Tasks</div>
      <Calendar
        fullscreen={false}
        mode="month"
        cellRender={(current, info) =>
          info.type === 'date'
            ? dateCellRender(current, tasks)
            : info.originNode
        }
        headerRender={({ value, onChange }) => {
          const month = value.format('MMMM');
          const year = value.format('YYYY');
          return (
            <div className="dashboard-calendar-header">
              <Button
                icon={<LeftOutlined />}
                onClick={() => onChange(value.clone().subtract(1, 'month'))}
              />
              <Text strong className="dashboard-calendar-title">
                {month} {year}
              </Text>
              <Button
                icon={<RightOutlined />}
                onClick={() => onChange(value.clone().add(1, 'month'))}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default Dashboard;
