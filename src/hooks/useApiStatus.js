// hooks/useApiStatus.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useApiStatus(apiUrl, interval = 10000) {
  const [isApiOnline, setIsApiOnline] = useState(true);

  useEffect(() => {
    let timer;
    const checkApi = async () => {
      try {
        await axios.get(apiUrl, { timeout: 3000 });
        setIsApiOnline(true);
      } catch (error) {
        setIsApiOnline(false);
      }
    };

    checkApi();
    timer = setInterval(checkApi, interval);

    return () => clearInterval(timer);
  }, [apiUrl, interval]);

  return isApiOnline;
}
