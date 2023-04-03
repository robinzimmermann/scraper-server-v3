// copied from puppeteer.Protocol.Network.Cookie
export type HeadlessBrowserCookie = {
  /**
   * Cookie name.
   */
  name: string;
  /**
   * Cookie value.
   */
  value: string;
  /**
   * Cookie domain.
   */
  domain: string;
  /**
   * Cookie path.
   */
  path: string;
  /**
   * Cookie expiration date as the number of seconds since the UNIX epoch.
   */
  expires: number;
  /**
   * Cookie size.
   */
  size: number;
  /**
   * True if cookie is http-only.
   */
  httpOnly: boolean;
  /**
   * True if cookie is secure.
   */
  secure: boolean;
  /**
   * True in case of session cookie.
   */
  session: boolean;
  /**
   * Cookie SameSite type.
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
  /**
   * Cookie Priority
   */
  priority: 'Low' | 'Medium' | 'High';
  /**
   * True if cookie is SameParty.
   */
  sameParty: boolean;
  /**
   * Cookie source scheme type.
   */
  sourceScheme: 'Unset' | 'NonSecure' | 'Secure';
  /**
   * Cookie source port. Valid values are {-1, [1, 65535]}, -1 indicates an unspecified port.
   * An unspecified port value allows protocol clients to emulate legacy cookie scope for the port.
   * This is a temporary ability and it will be removed in the future.
   */
  sourcePort: number;
  /**
   * Cookie partition key. The site of the top-level URL the browser was visiting at the start
   * of the reqwest to the endpoint that set the cookie.
   */
  partitionKey?: string;
  /**
   * True if cookie partition key is opaque.
   */
  partitionKeyOpaque?: boolean;
};

export type HeadlessBrowserResults = {
  html: string | Buffer;
  cookies?: HeadlessBrowserCookie[];
  json?: unknown;
};

export interface HeadlessBrowserInstance<T> {
  getBrowser: () => Promise<T>;

  launch: () => Promise<void>;

  unlaunch: () => Promise<void>;

  getHtmlPageCraigslist: (
    url: string,
    nextPageJavascript?: string,
  ) => Promise<HeadlessBrowserResults>;

  getHtmlPageFacebook: (
    url: string,
    searchTerm: string,
  ) => Promise<HeadlessBrowserResults>;
}
