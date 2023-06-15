import express, { Express, Request, Response } from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import chalk from 'chalk';
import tinycolor from 'tinycolor2';

import * as globals from '../globals';

// import { logger } from '../utils/logger/logger';

const ignoreRequestsForLogging = (req: Request, _res: Response): boolean => {
  if (
    req.path.endsWith('/progress') ||
    req.path.startsWith('/favicon') ||
    req.path.startsWith('/vendor') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js')
    // req.path.endsWith('/isAlive')
  ) {
    return true;
  }

  return false;
};

const timestampOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
} as Intl.DateTimeFormatOptions;
const timestampFormat = new Intl.DateTimeFormat('en-US', timestampOptions);

morgan.token('timestamp', (_req: Request, _res: Response, _args) => {
  return timestampFormat.format(new Date());
});

morgan.token('statusColor', (_req: Request, res: Response, _args) => {
  // get the status code if response written
  const status = (typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent)
    ? res.statusCode
    : undefined;

  // get status color
  const color =
    status === undefined
      ? 0
      : status >= 500
      ? 31 // red
      : status >= 400
      ? 33 // yellow
      : status >= 300
      ? 36 // cyan
      : status >= 200
      ? 32 // green
      : 0; // no color

  return '\x1b[' + color + 'm' + status + '\x1b[0m';
});

morgan.token('methodImmediate', (req: Request, _res: Response, _args) => {
  const darkenAmount = 35;
  let color: string;
  switch (req.method) {
    case 'GET':
      color = tinycolor(globals.restColorGet).darken(darkenAmount).toString();
      break;
    case 'POST':
      color = tinycolor(globals.restColorPost).darken(darkenAmount).toString();
      break;
    case 'PUT':
      color = tinycolor(globals.restColorPut).darken(darkenAmount).toString();
      break;
    case 'DELETE':
      color = tinycolor(globals.restColorDelete).darken(darkenAmount).toString();
      break;
    default:
      // color = tinycolor('#FFFF00').darken(darkenAmount).toString();
      color = tinycolor('#6f6f6f').darken(20).toString();
  }
  return chalk.bold.hex(color)(`${req.method}`);
});

morgan.token('method', (req: Request, _res: Response, _args) => {
  let color = '#FFFF00';
  switch (req.method) {
    case 'GET':
      color = globals.restColorGet;
      break;
    case 'POST':
      color = globals.restColorPost;
      break;
    case 'PUT':
      color = globals.restColorPut;
      break;
    case 'DELETE':
      color = globals.restColorDelete;
      break;
    default:
      color = '#6f6f6f';
  }
  return chalk.bold.hex(color)(`${req.method}`);
});

const configureExpressApp = (app: Express): void => {
  // app.set('port', process.env.PORT);
  // app.set('static_home', process.env.STATIC_HOME);
  // console.log('port:', process.env.PORT);
  // console.log('home:', process.env.STATIC_HOME);

  // Log requests first
  // app.use((req, _res, next): void => {
  //   logger.debug(`${req.method} ${req.url}`);
  //   next();
  // });

  // app.use(morgan('combined'));
  app.use(
    morgan(`:timestamp [\x1b[34mdebug  \x1b[0m] :methodImmediate ${chalk.dim(':url')}`, {
      skip: ignoreRequestsForLogging,
      immediate: true,
    }),
  );

  app.use(
    morgan(
      ':timestamp [\x1b[34mdebug  \x1b[0m] :method :url :statusColor :response-time ms :res[content-length]',
      { skip: ignoreRequestsForLogging },
    ),
  );

  app.use(helmet());
  app.use(cors());
  // app.use(morgan('dev'));
  app.use(express.json());

  // const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // app.use('/static',
  //   express.static( path.join(__dirname, '../../public'), { maxAge: 31557600000 }),
  // );

  // app.use(
  //   express.static(
  //     '/Users/rozimmermann/doc/2021.10.18_Craigslist-scraper/express-api-starter-ts/src/public',
  //   ),
  // );
};

export { configureExpressApp };
