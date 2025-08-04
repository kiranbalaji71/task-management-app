import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';

const ApiStatusBar = ({ isApiOnline }) => {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    let timer;
    if (isApiOnline) {
      setShowBar(true);
      timer = setTimeout(() => {
        setShowBar(false);
      }, 3000);
    } else {
      setShowBar(true);
    }
    return () => clearTimeout(timer);
  }, [isApiOnline]);

  if (!showBar) return null;

  return (
    <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 2000 }}>
      <Alert
        message={
          isApiOnline
            ? '✅ API Connected'
            : '❌ API Unavailable - Please run `npm run server` to start the mock API server'
        }
        type={isApiOnline ? 'success' : 'error'}
        banner
        closable={false}
        icon
        style={{ textAlign: 'center', fontWeight: 500 }}
      />
    </div>
  );
};

export default ApiStatusBar;
