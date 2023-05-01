import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';

import { logger } from '../utils/logger/logger';
import { getAorAn, isValueInEnum } from '../utils/utils';

/**
 * The nearly match, but don't quite, Javascript types.
 * In this enum, and object is an object, and an array is an array.
 */
export enum ElementType {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  object = 'object',
  array = 'array',
}

export const dbInfoColor = chalk.grey;

export const DbLogger = (
  prefix: string,
): {
  error: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  verbose: (message: string) => void;
  debug: (message: string) => void;
  silly: (message: string) => void;
} => {
  const log = (level: typeof logger.info, message: string): void => {
    level(dbInfoColor(`${prefix} ${message}`));
  };

  const error = (message: string): void => {
    log(logger.error, message);
  };

  const warn = (message: string): void => {
    log(logger.warn, message);
  };

  const info = (message: string): void => {
    log(logger.info, message);
  };

  const debug = (message: string): void => {
    log(logger.debug, message);
  };

  const verbose = (message: string): void => {
    log(logger.verbose, message);
  };

  const silly = (message: string): void => {
    log(logger.silly, message);
  };

  return { error, warn, info, verbose, debug, silly };
};

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
    return err(errors);
  } else {
    return ok(true);
  }
};

export const propIsCorrectType2 = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
  elementType: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];
  const prop = <keyof T>propName;
  if (typeof parent[prop] !== elementType) {
    errors.push(
      `${chalk.bold(parentStrForError)} has ${getAorAn(propName.toString())} ${chalk.bold(
        propName,
      )} element that is not ${getAorAn(elementType)} ${chalk.bold(elementType)}`,
    );
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

export const propIsCorrectType1 = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
  elementType: ElementType,
): Result<boolean, string[]> => {
  const errors: string[] = [];
  const pushError = (): void => {
    errors.push(
      `${chalk.bold(parentStrForError)} has ${getAorAn(propName.toString())} ${chalk.bold(
        propName,
      )} element that is not ${getAorAn(elementType)} ${chalk.bold(elementType)}`,
    );
  };
  const prop = <keyof T>propName;
  const element = parent[prop];
  switch (elementType) {
    case ElementType.array:
      if (!Array.isArray(element)) {
        pushError();
      }
      break;
    default:
      if (typeof element !== elementType) {
        pushError();
      }
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

export const arrayHasElements = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];

  const prop = <keyof T>propName;
  const element = parent[prop] as [];

  if (element.length === 0) {
    errors.push(`${chalk.bold(parentStrForError)} has ${chalk.bold(propName)} with no elements`);
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

export const arrayHasValidEnumElements = <T, E extends { [name: string]: unknown }>(
  parent: T,
  parentStrForError: string,
  propName: string,
  theEnum: E,
): Result<boolean, string[]> => {
  const errors: string[] = [];

  const prop = <keyof T>propName;
  const arr = parent[prop] as [];

  arr.forEach((element) => {
    if (!isValueInEnum(element, theEnum)) {
      errors.push(
        `${chalk.bold(parentStrForError)} has ${chalk.bold(
          propName,
        )} which contains an invalid value: ${chalk.bold(element)}`,
      );
    }
  });

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

/**
 *
 * Checks if a string has more than zero length
 */
export const propHasChars = <T>(
  parent: T,
  parentStrForError: string,
  propName: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];
  const pushError = (): void => {
    errors.push(`${chalk.bold(parentStrForError)} has a ${chalk.bold(propName)} with no value`);
  };
  const prop = <keyof T>propName;
  const element = parent[prop] as string;

  if (element.length === 0) {
    pushError();
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};
