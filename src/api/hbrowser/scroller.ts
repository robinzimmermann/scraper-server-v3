/* eslint-disable no-console */
import * as Puppeteer from 'puppeteer';

export const scrollToBottomOfPage = async (
  page: Puppeteer.Page,
  size: number,
  delay: number,
  pgNum: number,
): Promise<void> => {
  await page.evaluate(
    (
      pixelsToScroll: number,
      delayAfterStep: number,
      pg: number,
    ): Promise<void> => {
      const initialOffsetHeight = document.body.offsetHeight;
      const offsetYTarget = initialOffsetHeight - window.innerHeight;
      console.log(
        `-[${pg}]- initialOffsetHeight: ${initialOffsetHeight}, window.innerHeight: ${window.innerHeight}, offsetYTarget: ${offsetYTarget}`,
      );

      const isPageScrolledToBottom = (): boolean => {
        return window.scrollY + window.innerHeight >= initialOffsetHeight - 2;
      };

      const scrollFn = (resolve: () => void): void => {
        const intervalId = setInterval(() => {
          const distanceToScroll = Math.min(
            offsetYTarget - window.scrollY,
            pixelsToScroll,
          );
          console.log(
            `-[${pg}]- 1 scrollY: ${
              window.scrollY
            }, offsetYTarget: ${offsetYTarget}, dist to go: ${
              offsetYTarget - window.scrollY
            }, distanceToScroll: ${distanceToScroll}`,
          );
          window.scrollBy(0, distanceToScroll);
          console.log(
            `-[${pg}]- 2 scrollY: ${
              window.scrollY
            }, offsetYTarget: ${offsetYTarget}, dist to go: ${
              offsetYTarget - window.scrollY
            }`,
          );
          if (isPageScrolledToBottom()) {
            console.log(`-[${pg}]- reached the target`);
            clearInterval(intervalId);
            resolve();
          }
        }, delayAfterStep);
      };
      return new Promise(scrollFn);
    },
    size,
    delay,
    pgNum,
  );
};

// export const scrollPage = (
//   scrollDirection: 'top' | 'bottom',
// ): ((
//   page: Puppeteer.Page,
//   {
//     size,
//     delay,
//     stepsLimit,
//   }?: { size?: number; delay?: number; stepsLimit?: number },
// ) => Promise<number>) => {
//   return async (
//     page: Puppeteer.Page,
//     { size = 250, delay = 100, stepsLimit = null as number } = {},
//   ) => {
//     const lastScrollPosition = await page.evaluate(
//       async (pixelsToScroll, delayAfterStep, limit, direction) => {
//         const getElementScrollHeight = (element: HTMLElement): number => {
//           if (!element) return 0;
//           const { scrollHeight, offsetHeight, clientHeight } = element;
//           return Math.max(scrollHeight, offsetHeight, clientHeight);
//         };

//         const initialScrollPosition = window.pageYOffset;
//         const availableScrollHeight = getElementScrollHeight(document.body);
//         let lastPosition = direction === 'bottom' ? 0 : initialScrollPosition;

//         const scrollFn = (resolve: (num: number) => void): void => {
//           const intervalId = setInterval(() => {
//             window.scrollBy(
//               0,
//               direction === 'bottom' ? pixelsToScroll : -pixelsToScroll,
//             );
//             lastPosition +=
//               direction === 'bottom' ? pixelsToScroll : -pixelsToScroll;

//             if (
//               (direction === 'bottom' &&
//                 lastPosition >= availableScrollHeight) ||
//               (direction === 'bottom' &&
//                 limit !== null &&
//                 lastPosition >= pixelsToScroll * limit) ||
//               (direction === 'top' && lastPosition <= 0) ||
//               (direction === 'top' &&
//                 limit !== null &&
//                 lastPosition <= initialScrollPosition - pixelsToScroll * limit)
//             ) {
//               clearInterval(intervalId);
//               resolve(lastPosition);
//             }
//           }, delayAfterStep);
//         };

//         return new Promise(scrollFn);
//       },
//       size,
//       delay,
//       stepsLimit,
//       scrollDirection,
//     );

//     return lastScrollPosition;
//   };
// };
