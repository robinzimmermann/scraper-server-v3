import {
  HeadlessBrowserInstance,
  HeadlessBrowserResults,
} from '../HeadlessBrowserInstance';

export default (): HeadlessBrowserInstance<T> => {
  const launch = async (): Promise<T> => {
    // do nothing
  };

  const unlaunch = async (): Promise<void> => {
    // do nothing
  };

  const getHtmlPageCraigslist = async (
    _url: string,
    _nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve, _reject) => {
      resolve({ html: '<html></html>' } as HeadlessBrowserResults);
    });
  };

  const getHtmlPageFacebook = async (
    _url: string,
    _searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve, _reject) => {
      resolve({ html: '<html></html>' } as HeadlessBrowserResults);
    });
  };

  return { launch, unlaunch, getHtmlPageCraigslist, getHtmlPageFacebook };
};
