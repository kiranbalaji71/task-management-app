import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { baseUrlRoute } from '../common/Constants';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    resetErrorBoundary();
    navigate(`${baseUrlRoute}/login`);
  };

  const extractFileLocation = (stack = '') => {
    const match = stack.match(/\(([^)]+)\)/);
    return match ? match[1] : 'Unknown source';
  };

  const fileLocation = extractFileLocation(error?.stack);

  return (
    <Result
      status="500"
      title="Something went wrong"
      subTitle={
        <>
          <pre
            style={{
              textAlign: 'left',
              margin: '16px auto',
              padding: '12px',
              border: '1px solid #bdbdbd',
              backgroundColor: '#f5f5f5',
              color: '#333',
              borderRadius: '4px',
              fontSize: '14px',
              maxWidth: '80%',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            <strong>Error:</strong> {error?.message}
            {'\n'}
            <strong>Source:</strong> {fileLocation}
          </pre>
        </>
      }
      extra={
        <Button
          type="primary"
          size="large"
          onClick={handleGoBack}
          style={{ width: 154 }}
        >
          Go Back
        </Button>
      }
    />
  );
};

export default ErrorFallback;
