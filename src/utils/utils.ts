// import { logger } from './logger/logger';

import { logger } from './logger/logger';

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

/**
 * Modifies the array in place
 */
export const moveItemInArray = <T>(
  workArray: T[],
  fromIndex: number,
  toIndex: number,
): T[] => {
  if (toIndex === fromIndex) {
    return workArray;
  }
  const target = workArray[fromIndex];
  const increment = toIndex < fromIndex ? -1 : 1;

  for (let k = fromIndex; k !== toIndex; k += increment) {
    workArray[k] = workArray[k + increment];
  }
  workArray[toIndex] = target;
  return workArray;
};

/**
 * Return a unique list of combined arrays. Immutable, won't modify the parameters.
 */
export const mergeArrays = <T>(array1: T[], array2: T[]): T[] => {
  const newArray = [...array1];
  for (let i = 0; i < array2.length; i++) {
    if (newArray.indexOf(array2[i]) === -1) {
      newArray.push(array2[i]);
    }
  }
  return newArray;
};

/**
 * from https://stackoverflow.com/a/58550111/1360592
 */
export const isNumeric = (num: unknown): boolean =>
  (typeof num === 'number' || (typeof num === 'string' && num.trim() !== '')) &&
  !isNaN(num as number);
/**
 * Return `true` if the two arrays have the same values, in the same order.
 * From: https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/
 */
export const compareArrays = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length && a.every((element, index) => element === b[index]);

/**
 * Return the difference of the second array compared to the first.
 *
 * @param originalArr the array deemed "correct"
 * @param comparisonArr the array being compared which may have differences to the originalArr
 */
export const differenceArrays = <T>(
  originalArr: T[],
  comparisonArr: T[],
): T[] => {
  const remove = new Set(originalArr);
  logger.debug(`differenceArrays()`);
  logger.debug(`  originalArr=${originalArr}`);
  logger.debug(`  comparisonArr=${comparisonArr}`);
  logger.debug(`  result=${comparisonArr.filter((k) => !remove.has(k))}`);

  return comparisonArr.filter((k) => !remove.has(k));
};

//  differenceArrays = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));

// array_diff = (a, b) => {
//   const remove = new Set(a);
//   console.log('set:', remove);
//   return b.filter((k) => !remove.has(k));
//   // return Array.from(remove);
// };
