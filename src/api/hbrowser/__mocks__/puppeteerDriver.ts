import { HBrowserInstance, HeadlessBrowserResults } from '../HBrowser';

export default (): HBrowserInstance => {
  const launch = async (): Promise<void> => {
    // do nothing
  };

  const unlaunch = async (): Promise<void> => {
    // do nothing
  };

  const getHtmlPageCraigslist = (
    _url: string,
    _nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve) => {
      resolve(<HeadlessBrowserResults>{
        html: '<html><body><h1>mock getHtmlPageCraigslist()</h1></body></html>',
      });
    });
  };

  const getHtmlPageFacebook = (
    _url: string,
    _searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve) => {
      resolve(<HeadlessBrowserResults>{
        html: '<html><body><h1>mock getHtmlPageFacebook()</h1></body></html>',
      });
    });
  };

  return { launch, unlaunch, getHtmlPageCraigslist, getHtmlPageFacebook };
};
