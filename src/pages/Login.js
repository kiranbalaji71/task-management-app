import { Form, Input, Button, Card, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoginDetails, setUserRole } from '../store/slice/loginSlice';
import { useNavigate } from 'react-router-dom';
import { baseUrlRoute } from '../common/Constants';
import { lazy, Suspense, useEffect } from 'react';
import { useMessageApi } from '../context/MessageContext';
import './Style.scss';

const Loader = lazy(() => import('../components/Loader'));

const Login = ({ handleThemeChange }) => {
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.loginReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messageApi = useMessageApi();

  const onFinish = async (values) => {
    try {
      const result = await dispatch(fetchLoginDetails(values)).unwrap();

      if (result.status !== 200) {
        form.setFields([
          {
            name: 'password',
            errors: [result.message],
          },
        ]);
        return;
      }
      const { role, id: userId, name: userName } = result.data;
      messageApi.success(result.message || 'Login successful');
      dispatch(setUserRole({ role, userId, userName }));
      navigate(`${baseUrlRoute}/dashboard`, { replace: true });
    } catch (err) {
      form.setFields([
        {
          name: 'password',
          errors: [err || 'Login failed'],
        },
      ]);
    }
  };

  useEffect(() => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    handleThemeChange(theme);
  }, []);
  return (
    <>
      {loading && (
        <Suspense fallback={<div>Loading...</div>}>
          <Loader />
        </Suspense>
      )}

      <div className="login-container">
        <Card
          className="login-card"
          title={
            <div className="login-title-wrapper">
              <div className="login-title">🔐 Task Management Login</div>
              <Typography.Text className="login-subtitle" type="secondary">
                ✍️ Sign in to manage your tasks efficiently
              </Typography.Text>
            </div>
          }
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ email: '', password: '' }}
          >
            <Form.Item
              name="email"
              label="📧 Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="🔑 Password"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                onChange={(e) => {
                  const valueWithoutSpaces = e.target.value.replace(/\s/g, '');
                  if (valueWithoutSpaces !== e.target.value) {
                    form.setFieldsValue({ password: valueWithoutSpaces });
                  }
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                🚀 Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Login;
