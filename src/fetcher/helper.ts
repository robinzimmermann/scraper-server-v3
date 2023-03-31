import { getRandomInt } from '../utils/utils';

export const getRandWaitTime = (
  minWaitTimeBetweenRequests: number,
  maxRandomExtraTimeBetweenRequests: number,
  debugUseShortRandomWaitTime = false,
): number => {
  const result = !debugUseShortRandomWaitTime
    ? minWaitTimeBetweenRequests +
      getRandomInt(maxRandomExtraTimeBetweenRequests)
    : getRandomInt(10);
  return result;
};
