// import { logger } from './logger/logger';

export const isValueInEnum = <T extends { [name: string]: unknown }>(
  value: string,
  theEnum: T,
): boolean => {
  return Object.values(theEnum).includes(value);
};

export const getDateTimestamp = (): string => {
  const timestampOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  } as Intl.DateTimeFormatOptions;
  const timestampFormat = new Intl.DateTimeFormat('en-US', timestampOptions);
  const result = timestampFormat
    .format(new Date())
    .replace(',', '')
    .replaceAll('/', '-');
  return result;
};

/**
 * @param max upperbound number, non inclusive
 * @returns number between `0` and `max`, but not inclusive of `max`
 */
export const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max));
};

/**
 * @param min lowerbound number, inclusive
 * @param max upperbound number, inclusive
 * @returns random number between `min` and `max`, inclusive of both
 */
export const getRandomIntInclusive = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Wait for the given time. This is useful to pause between reqwests to the server.
 * Although the time will be waited, it will wake up regularly to give an update
 * on progress.
 *
 * @param timeToWaitMills is how long to wait
 *
 * @param progressCallback optionally get a callback with progress every few milliseconds until the time is up
 *
 * @returns the time waited, in milliseconds
 */
export const waitWithProgress = (
  timeToWaitMills: number,
  progressCallback?: (millisThisTick: number, totalMillisSoFar: number) => void,
): Promise<number> => {
  return new Promise((resolve) => {
    const progressUpdateIntervalMillis = 50;
    let progressMillis = 0;

    const mainTimer = setTimeout(() => {
      mainTimeExpired();
    }, timeToWaitMills);

    let tickTimer: NodeJS.Timeout;

    const mainTimeExpired = (): void => {
      clearInterval(tickTimer);
      clearInterval(mainTimer);
      if (progressCallback) {
        progressCallback(progressUpdateIntervalMillis, timeToWaitMills);
      }
      resolve(timeToWaitMills);
    };

    const tick = (): void => {
      tickTimer = setTimeout(() => {
        progressMillis += progressUpdateIntervalMillis;
        if (progressCallback) {
          progressCallback(progressUpdateIntervalMillis, progressMillis);
        }
        if (progressMillis >= timeToWaitMills) {
          mainTimeExpired();
        } else {
          tick();
        }
      }, progressUpdateIntervalMillis);
    };

    tick();
  });
};
