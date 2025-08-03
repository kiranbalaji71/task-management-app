import axios from 'axios';
import dayjs from 'dayjs';

const apiInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

const api = {
  // Authentication API
  login: async (payload) => {
    const { data } = await apiInstance.get(
      `/users?email=${payload.email}&password=${payload.password}`
    );

    if (data.length > 0) {
      return { status: 200, message: 'Login successful', data: data[0] };
    }
    return { status: 400, message: 'Invalid email or password' };
  },

  // Tasks API

  getTasks: async (currentUser) => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        apiInstance.get('/tasks'),
        apiInstance.get('/users'),
      ]);

      const data = tasksRes.data;
      const users = usersRes.data;

      if (!Array.isArray(data) || !Array.isArray(users)) {
        return {
          status: 400,
          message: 'Invalid data format',
          data: [],
        };
      }

      let filteredData = [];
      const role = currentUser.role?.toLowerCase();
      const normalizeId = (value) => {
        if (!value) return '';
        if (typeof value === 'string' && value.includes('/')) {
          return value.split('/').pop();
        }
        return String(value);
      };

      const currentUserId = normalizeId(currentUser.id);

      if (role === 'admin') {
        filteredData = data;
      } else if (role === 'manager') {
        const employeeIds = users
          .filter((u) => normalizeId(u.manager_id) === currentUserId)
          .map((u) => normalizeId(u.id));

        filteredData = data.filter((task) =>
          employeeIds.includes(normalizeId(task.assigned_id))
        );
      } else if (role === 'employee') {
        filteredData = data.filter(
          (task) => normalizeId(task.assigned_id) === currentUserId
        );
      }

      const sortedData = [...filteredData].sort((a, b) => {
        const dateA = dayjs(a.due_date).isValid()
          ? dayjs(a.due_date).valueOf()
          : Infinity;
        const dateB = dayjs(b.due_date).isValid()
          ? dayjs(b.due_date).valueOf()
          : Infinity;
        return dateA - dateB;
      });

      return {
        status: 200,
        message: 'Tasks fetched successfully',
        data: sortedData,
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        status: 400,
        message: 'Failed to fetch tasks',
        data: [],
      };
    }
  },
  createTask: async (currentUser, task) => {
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return {
        status: 403,
        message: 'Access denied: Only admins and managers can create tasks',
      };
    }

    try {
      const { data } = await apiInstance.post('/tasks', task);
      return {
        status: 201,
        message: 'Task created successfully',
        data,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to create task',
      };
    }
  },

  updateTask: async (currentUser, id, task) => {
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return {
        status: 403,
        message: 'Access denied: Only admins and managers can update tasks',
      };
    }

    try {
      // Check if task exists
      const { data: foundTasks } = await apiInstance.get(`/tasks?id=${id}`);
      if (!foundTasks || foundTasks.length === 0) {
        return {
          status: 404,
          message: `Task with ID ${id} not found`,
        };
      }

      const taskId = foundTasks[0].id;
      const { data: updatedTask } = await apiInstance.put(
        `/tasks/${taskId}`,
        task
      );

      return {
        status: 200,
        message: 'Task updated successfully',
        data: updatedTask,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: 404,
          message: `Task with ID ${id} not found`,
        };
      }
      return {
        status: 400,
        message: 'Failed to update task',
      };
    }
  },

  deleteTask: async (currentUser, id) => {
    if (currentUser.role !== 'admin') {
      return {
        status: 403,
        message: 'Access denied: Only admins can delete tasks',
      };
    }

    try {
      const { data: foundTasks } = await apiInstance.get(`/tasks?id=${id}`);
      if (!foundTasks || foundTasks.length === 0) {
        return {
          status: 404,
          message: `Task with ID ${id} not found`,
        };
      }

      const taskId = foundTasks[0].id;
      console.log('Actual Task ID:', taskId, typeof taskId);
      await apiInstance.delete(`/tasks/${taskId}`);
      return {
        status: 200,
        message: 'Task deleted successfully',
        id,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: 404,
          message: `Task with ID ${id} not found`,
        };
      }
      return {
        status: 400,
        message: 'Failed to delete task',
      };
    }
  },

  getUserOptions: async () => {
    try {
      const { data } = await apiInstance.get('/users');
      if (!Array.isArray(data)) return [];

      const formattedData = data.map(({ id, name }) => ({ id, name }));
      return {
        status: 200,
        message: 'Users fetched successfully',
        data: formattedData,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {
        status: 400,
        message: 'Failed to fetch users',
      };
    }
  },

  // Dashboard API
  getDashboardData: async (currentUser) => {
    let users = [];
    let tasks = [];
    let teamMembers = [];

    if (currentUser.role === 'admin') {
      const [tasksRes, usersRes] = await Promise.all([
        apiInstance.get('/tasks'),
        apiInstance.get('/users'),
      ]);
      tasks = tasksRes.data;
      users = usersRes.data;

      teamMembers = [];
    }

    if (currentUser.role === 'manager') {
      const employeesRes = await apiInstance.get(
        `/users?manager_id=${currentUser.id}`
      );
      const employees = employeesRes.data.filter((u) => u.role === 'employee');

      users = [currentUser, ...employees];

      teamMembers = [currentUser, ...employees].map((u) => ({
        name: u.name,
        role: u.role,
      }));

      const managerTasksRes = await apiInstance.get(
        `/tasks?assigned_id=${currentUser.id}`
      );
      tasks = managerTasksRes.data;

      for (let emp of employees) {
        const empTasksRes = await apiInstance.get(
          `/tasks?assigned_id=${emp.id}`
        );
        tasks = [...tasks, ...empTasksRes.data];
      }
    }

    if (currentUser.role === 'employee') {
      users = [currentUser];

      const myTasksRes = await apiInstance.get(
        `/tasks?assigned_id=${currentUser.id}`
      );
      tasks = myTasksRes.data;

      const myManagerRes = await apiInstance.get(
        `/users?id=${currentUser.manager_id}`
      );
      const myManager = myManagerRes.data[0];

      const myTeamRes = await apiInstance.get(
        `/users?manager_id=${currentUser.manager_id}`
      );
      const myTeam = myTeamRes.data.filter((u) => u.role === 'employee');

      teamMembers = [myManager, ...myTeam]
        .filter((u) => u.role === 'manager' || u.role === 'employee')
        .map((u) => ({
          name: u.name,
          role: u.role,
        }));
    }

    const tasksByStatus = tasks.reduce((acc, task) => {
      const status = task.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const taskStatusChartData = Object.entries(tasksByStatus).map(
      ([status, count]) => ({ status, count })
    );

    const calendarTasks = tasks
      .filter((t) => ['Pending', 'In Progress'].includes(t.status))
      .map((t) => ({
        date: t.due_date,
        title: t.title,
        status: t.status,
        assignedTo: t.assigned_to,
      }));

    return {
      status: 200,
      message: 'Dashboard data fetched successfully',
      data: {
        total_tasks: tasks.length,
        status: taskStatusChartData,
        tasks: calendarTasks,
        team_members: teamMembers,
        total_users: users.length,
        total_managers: users.filter((u) => u.role === 'manager').length,
        total_employees: users.filter((u) => u.role === 'employee').length,
      },
    };
  },
  // Users API
  getUsers: async (currentUser) => {
    if (currentUser.role !== 'admin') {
      return { status: 403, message: 'Access denied' };
    }
    const { data } = await apiInstance.get('/users');
    return { status: 200, data };
  },

  createUser: async (currentUser, newUser) => {
    if (currentUser.role !== 'admin') {
      return { status: 403, message: 'Access denied' };
    }
    const { data } = await apiInstance.post('/users', newUser);
    return { status: 201, message: 'User created successfully', data };
  },

  updateUser: async (currentUser, id, updatedUser) => {
    if (currentUser.role !== 'admin') {
      return { status: 403, message: 'Access denied' };
    }
    const { data } = await apiInstance.put(`/users/${id}`, updatedUser);
    return { status: 200, message: 'User updated successfully', data };
  },

  deleteUser: async (currentUser, id) => {
    if (currentUser.role !== 'admin') {
      return { status: 403, message: 'Access denied' };
    }
    try {
      const { data: foundUsers } = await apiInstance.get(`/users?id=${id}`);
      if (!foundUsers || foundUsers.length === 0) {
        return {
          status: 404,
          message: `User with ID ${id} not found`,
        };
      }

      const userId = foundUsers[0].id;
      await apiInstance.delete(`/users/${userId}`);
      return {
        status: 200,
        message: 'User deleted successfully',
        id,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: 404,
          message: `User with ID ${id} not found`,
        };
      }
      return {
        status: 400,
        message: 'Failed to delete User',
      };
    }
  },
};

export default api;
