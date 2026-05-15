import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const TIMER_KEY = 'flash_sale_end_time';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export function useFlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState<string>('00 : 00 : 00');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initializeTimer = async () => {
      try {
        let endTimeStr = await SecureStore.getItemAsync(TIMER_KEY);
        let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

        const now = Date.now();
        // If there's no end time, or the timer already expired, reset it
        if (!endTime || now >= endTime) {
          endTime = now + TWENTY_FOUR_HOURS;
          await SecureStore.setItemAsync(TIMER_KEY, endTime.toString());
        }

        const updateTimer = () => {
          const currentNow = Date.now();
          const distance = endTime - currentNow;

          if (distance <= 0) {
            setTimeLeft('00 : 00 : 00');
            clearInterval(interval);
            // In a real app, we might trigger a refetch of flash sales here
            // and restart the timer. For now, it stays at 00:00:00 until
            // the component unmounts and remounts.
          } else {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            const ss = String(seconds).padStart(2, '0');

            setTimeLeft(`${hh} : ${mm} : ${ss}`);
          }
        };

        updateTimer();
        interval = setInterval(updateTimer, 1000);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize flash sale timer:', error);
        // Fallback gracefully
        setIsReady(true);
      }
    };

    initializeTimer();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return { timeLeft, isReady };
}
