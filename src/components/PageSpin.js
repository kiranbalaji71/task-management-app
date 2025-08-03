import { Spin } from 'antd';

const PageSpin = ({ tip = 'Loading...' }) => {
  return (
    <div style={styles.overlay}>
      <Spin size="large" tip={tip} />
    </div>
  );
};

const styles = {
  overlay: {
    width: '100%',
    height: '100%',
    background: 'rgba(183, 209, 230, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
};

export default PageSpin;
