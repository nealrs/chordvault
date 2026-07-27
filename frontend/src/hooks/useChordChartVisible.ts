import { useState, useCallback } from 'react';
import { getStoredChordChartVisible, setStoredChordChartVisible } from '../lib/storage';

export function useChordChartVisible() {
  const [visible, setVisible] = useState(getStoredChordChartVisible);

  const toggle = useCallback(() => {
    setVisible((prev) => {
      const next = !prev;
      setStoredChordChartVisible(next);
      return next;
    });
  }, []);

  return { visible, toggle };
}
