/* eslint-env browser */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
let Scraper = () => {
  const maxNumEndlessLoops = 3;
  let numEndlessLoops = 0;
  let originalSend;
  let isRunning = false;
  let timeoutId;
  let pg = -1;
  let has_next_page = true;
  let numResults = -1;
  let numResultsPrev = -1;
  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  const intercept = (urlmatch, callback) => {
    let send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener(
        'readystatechange',
        function () {
          if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
            callback(this);
          }
        },
        false,
      );
      send.apply(this, arguments);
    };
  };
  const output = (response) => {
    if (response.responseText.contains('has_next_page')) {
      const json = JSON.parse(response.responseText);
      if (
        json &&
        json.data &&
        json.data.marketplace_search &&
        json.data.marketplace_search.feed_units &&
        json.data.marketplace_search.feed_units.page_info
      ) {
        const endCursorStr =
          json.data.marketplace_search.feed_units.page_info.end_cursor;
        const endCursor = JSON.parse(endCursorStr);
        pg = endCursor.pg;
        has_next_page =
          json.data.marketplace_search.feed_units.page_info.has_next_page;
        numResults = document.querySelectorAll('.x3ct3a4').length;
        /* console.log(`numResults: ${numResults}, pg: ${pg}, has_next_page: ${has_next_page}`); */
        if (numResults === numResultsPrev && numResults > -1 && pg > -1) {
          numEndlessLoops++;
          console.log(`numEndlessLoops: ${numEndlessLoops}`);
          if (numEndlessLoops >= maxNumEndlessLoops) {
            console.log('in endless loop');
            stop();
            return;
          }
        }
        numResultsPrev = numResults;
      }
    }
  };
  const startTimer = () => {
    if (isRunning) {
      timeoutId = setTimeout(() => {
        doPostTimeout();
      }, getRandomIntInclusive(1001, 2999));
    }
  };
  const doPostTimeout = () => {
    console.log(
      `doPostTimeout() numResults: ${numResults}, pg: ${pg}, has_next_page: ${has_next_page}`,
    );
    if (!isRunning) {
      console.log('isRunning set to false, goodbye');
      return;
    }
    if (!has_next_page) {
      console.log('has_next_page is false, goodbye');
      return;
    }
    if (
      window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 2
    ) {
      console.log('at the bottom, goodbye');
      return;
    }
    console.log('not at the bottom, scrolling...');
    window.scrollTo(0, document.body.scrollHeight);
    startTimer();
  };
  const start = () => {
    console.log('starting');
    if (!originalSend) {
      originalSend = XMLHttpRequest.prototype.send;
    } else {
      console.log('originalSend has already been set. leaving it alone.');
    }
    isRunning = true;
    intercept('graphql', output);
    startTimer();
  };
  const stop = () => {
    console.log('stopping');
    isRunning = false;
    clearTimeout(timeoutId);
    XMLHttpRequest.prototype.send = originalSend;
  };
  return Object({ start, stop });
};
let scraper = Scraper();
scraper.start();
