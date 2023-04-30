import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';
import { logger } from '../utils/logger/logger';
import { getAorAn } from '../utils/utils';

/**
 * mutates!
 *
 * @param mainErrors
 * @param localResult
 */
export const appendErrors = (
  mainErrors: string[],
  localResult: Result<boolean, string[]>,
): void => {
  if (!localResult.isErr()) {
    return;
  }

  localResult.mapErr((messages: string[]) => messages.forEach((msg) => mainErrors.push(msg)));
};

export const propIsPresent = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];
  const prop = <keyof T>propName;
  if (parent[prop] === undefined) {
    errors.push(`${chalk.bold(parentStrForError)} has no element ${chalk.bold(propName)}`);
  }

  if (errors.length > 0) {
    logger.verbose(`a) errors=${errors.join('| ')}`);
    return err(errors);
  } else {
    return ok(true);
  }
};

export const propIsCorrectType = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
  eType: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];
  const prop = <keyof T>propName;
  if (typeof parent[prop] !== eType) {
    errors.push(
      `${chalk.bold(parentStrForError)} has ${getAorAn(propName.toString())} ${chalk.bold(
        propName,
      )} element that is not ${getAorAn(eType)} ${chalk.bold(eType)}`,
    );
  }

  if (errors.length > 0) {
    logger.verbose(`b) errors=${errors.join('| ')}`);
    return err(errors);
  } else {
    return ok(true);
  }
};
