import { HeadlessBrowser, HeadlessBrowserResults } from '../HeadlessBrowser';

export default (): HeadlessBrowser => {
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

  return { getHtmlPageCraigslist, getHtmlPageFacebook };
};
