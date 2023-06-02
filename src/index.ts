import fs from 'fs';
import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import listEndpoints from 'express-list-endpoints';

import app from './app';
import { logger } from './utils/logger/logger';
import { port, cacheDir } from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
import HBrowserInstance from './api/hbrowser/puppeteerDriver';
import { restColorGet, restColorPut, restColorPost, restColorDelete } from './globals';

const startBrowser = fetcher.defaultOptions.debugFetchSearchResultsFromFiles ? false : true;

const hbrowser = HBrowserInstance();

let maxLength = 0;

const endpointComparator = (e1: listEndpoints.Endpoint, e2: listEndpoints.Endpoint): number => {
  const pathCompare = e1.path.localeCompare(e2.path);
  if (pathCompare !== 0) {
    return pathCompare;
  }
  const methodToSortScore = (method: string): number => {
    switch (method) {
      case 'GET':
        return 1;
      case 'POST':
        return 2;
      case 'PUT':
        return 3;
      case 'DELETE':
        return 4;
      default:
        return 0;
    }
  };
  const e1Method = methodToSortScore(e1.methods[0]);
  const e2Method = methodToSortScore(e2.methods[0]);

  return e1Method - e2Method;
};

const getEndpoint = (method: string, path: string): string => {
  let methodFgColor = chalk.gray;
  switch (method) {
    case 'GET':
      methodFgColor = chalk.hex(restColorGet);
      break;
    case 'POST':
      methodFgColor = chalk.hex(restColorPost);
      break;
    case 'PUT':
      methodFgColor = chalk.hex(restColorPut);
      break;
    case 'DELETE':
      methodFgColor = chalk.hex(restColorDelete);
      break;
  }
  const first = methodFgColor(method.padEnd(maxLength));
  // The following regex looks for :token in the path. There may be 0, 1, or many
  return `${first} ${path
    .replace('/api/v3', chalk.dim('/api/v3'))
    .replace(/(:(.*?))((?:\/|$))/g, `${methodFgColor('$1')}$3`)}`;
};

const printEndpoints = (): void => {
  const endpoints: listEndpoints.Endpoint[] = [];
  listEndpoints(app)
    .filter(
      (appEndPoint) =>
        !appEndPoint.path.startsWith('/api/v1') && !appEndPoint.path.startsWith('/api/v2'),
    )
    .forEach((appEndpoint) => {
      appEndpoint.methods.forEach((method) => {
        endpoints.push({
          path: appEndpoint.path,
          methods: [method],
          middlewares: appEndpoint.middlewares,
        });
      });
    });
  // logger.silly(JSON.stringify(endpoints, null, 2));
  maxLength = endpoints
    .map((ep) => ep.methods[0])
    .reduce((acc, item) => Math.max(acc, item.length), 0);

  endpoints.sort(endpointComparator).forEach((ep) => {
    logger.silly(getEndpoint(ep.methods[0], ep.path));
  });
};
const startServer = async (): Promise<void> => {
  return new Promise((resolve) => {
    const server = app.listen(port, '0.0.0.0', async () => {
      logger.info(
        `server is starting at ${chalk.bold(`http://localhost:${port}`)} in ${chalk.bold(
          app.get('env'),
        )} mode...`,
      );

      if (!fs.existsSync(cacheDir)) {
        logger.warn(`The cache directory does not exist, creating it: ${cacheDir}`);
        fs.mkdirSync(cacheDir);
      }

      const dbResult = initAllDbs();

      if (dbResult.isErr()) {
        logger.error('initializing went pear-shaped, shutting down');
        return;
      }

      resolve();
    });

    // Configure the websocket server
    const wsServer = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit('connection', socket, request);
      });
    });

    wsServer.on('connection', function connection(websocketConnection, connectionRequest) {
      logger.info(
        `got a websocket connection from ${connectionRequest.socket.remoteAddress} (${connectionRequest.socket.remoteFamily})`,
      );
      websocketConnection.send('welcome!');
      // The path the client connected to is connectionRequest.url
      websocketConnection.on('message', (message) => {
        logger.verbose(`message: ${message} (path: ${connectionRequest.url})`);
        websocketConnection.send(`And I say to you: ${message}`);
      });
    });
  });
};

if (startBrowser) {
  const stopServer = async (): Promise<void> => {
    await hbrowser.unlaunch();
    process.exit(1);
  };

  // When Ctrl-C is pressed
  process.on('SIGINT', async (_code) => {
    stopServer();
  });

  // When node restarts due to code change
  process.on('SIGUSR2', async (_code) => {
    stopServer();
  });
}

if (startBrowser) {
  await Promise.all([hbrowser.launch(), startServer()]);
} else {
  await Promise.all([startServer()]);
}

fetcher.init(hbrowser);

logger.info(chalk.green.bold('server ready'));

printEndpoints();
