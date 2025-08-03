import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistor, store } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { ErrorBoundary } from 'react-error-boundary';
import Layout from './Layout/Layout';
import ErrorFallback from './Layout/ErrorFallBack';
import './index.css';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <ErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Layout />
        </ErrorBoundary>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
