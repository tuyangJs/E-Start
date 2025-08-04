import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export const useNavigationState = () => {
  const location = useLocation();
  const historyStack = useRef<string[]>([]);
  const currentIndex = useRef<number>(-1);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const path = location.pathname + location.search;
    const index = historyStack.current.indexOf(path);

    if (index === -1) {
      historyStack.current = historyStack.current.slice(0, currentIndex.current + 1);
      historyStack.current.push(path);
      currentIndex.current++;
    } else {
      currentIndex.current = index;
    }

    setCanGoBack(currentIndex.current > 0);
    setCanGoForward(currentIndex.current < historyStack.current.length - 1);
  }, [location]);

  return { canGoBack, canGoForward };
};
