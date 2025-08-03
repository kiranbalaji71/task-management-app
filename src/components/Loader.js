import { Spin } from 'antd';

const Loader = ({ tip = 'Loading...' }) => {
  return (
    <div style={styles.overlay}>
      <Spin size="large" tip={tip} />
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
};

export default Loader;
