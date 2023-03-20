// import express from 'express';
import chalk from 'chalk';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// console.log(`__filename=${__filename}`);
// const __dirname = path.dirname(__filename) + '/public';
// console.log(`__dirname=${__dirname}`);
// const __rootname = process.env.STATIC_HOME || '.';
// const __rootname = path.dirname(fileURLToPath(import.meta.url)) + '/public';
// console.log(`__rootname=${__rootname}`);
//
import app from './app';
import { logger } from './utils/logger/logger';
// import { dotenvExists } from './utils/common/checkDotEnv';
import { port } from './globals';

// if (!dotenvExists('.env')) {
//   logger.error('exiting');
//   process.exit(1);
// }
// console.log('the dotenv file exists');
// console.log(`process.env.PORT=${process.env.PORT}`);
// console.log(`port=${port}`);
// console.log(`static_home=${static_home}`);
// export const shome = process.env.STATIC_HOME;

// app.use(express.static(path.join(__dirname, 'public')));

// export const __rootname = path.dirname(
//   fileURLToPath(import.meta.url + '/../..'),
// );
// console.log(`__rootname=${__rootname}`);

// const port = process.env.PORT || 5008;
// const port = app.get('port');
// console.log('da port is', port);
app.listen(port, () => {
  logger.info(
    `App is running at ${chalk.bold(
      `http://localhost:${port}`,
    )} in ${chalk.bold(app.get('env'))} mode`,
  );
});

// export { __rootname };
