import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';

import { logger } from '../utils/logger/logger';
import { enumToValues, getAorAn, isValueInEnum } from '../utils/utils';
import { Search } from './models/dbSearches';

/**
 * The nearly match, but don't quite, Javascript types.
 * In this enum, and object is an object, and an array is an array.
 */
export enum PropertyType {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  object = 'object',
  array = 'array',
  enum = 'enum',
}

export enum PropertyPresence {
  mandatory = 'mandatory',
  optional = 'optinal',
}

interface CheckPropOptions<E extends { [name: string]: unknown }> {
  propCanBeEmpty?: boolean;
  arrayElementsExpectedType?: PropertyType;
  arrayElementsExpectedEnum?: E;
  arrayElementsExpectedEnumName?: string;
  expectedEnum?: E;
  expectedEnumName?: string;
  expectedObjectName?: string;
  propFormat?: RegExp;
  propFormatStr?: string;
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
export const appendError = (mainErrors: string[], localResult: Result<boolean, string>): void => {
  if (!localResult.isErr()) {
    return;
  }

  mainErrors.push(localResult.error);
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

export const checkProp = <T, E extends { [name: string]: unknown }>(
  parent: T,
  propName: string,
  expectedType: PropertyType,
  presence: PropertyPresence,
  errorPrefix: string,
  opts?: CheckPropOptions<E>,
): Result<boolean, string> => {
  const options = { ...{ propCanBeEmpty: false }, ...(opts || {}) };

  const pushTypeError = (): string => {
    let enumString = '';
    if ([PropertyType.array, PropertyType.enum].includes(expectedType)) {
      enumString = ` of ${
        options.arrayElementsExpectedEnumName
          ? `enum ${chalk.bold(options.arrayElementsExpectedEnumName)}`
          : chalk.bold(options.arrayElementsExpectedType)
      }`;
    }

    let objectString = '';
    if (options.expectedObjectName) {
      objectString = ` of ${chalk.bold(options.expectedObjectName)}`;
    }

    return `${errorPrefix} has property ${chalk.bold(propName)} (${chalk.bold(
      prop,
    )}) with incorrect type (should be ${getAorAn(expectedType)} ${chalk.bold(
      expectedType,
    )}${enumString}${objectString})`;
  };

  const pushTypeEnumError = (): string => {
    // Necessary guard for Typescript, will never happen.
    if (!options.expectedEnum) {
      return '';
    }
    return `${errorPrefix} has incorrect type for property ${chalk.bold(propName)} (${chalk.bold(
      prop ? prop : "''",
    )}), should be ${getAorAn(String(options.expectedEnumName))} ${chalk.bold(
      options.expectedEnumName,
    )} enum: ${
      expectedType === PropertyType.enum ? `${enumToValues(options.expectedEnum).join(' | ')}` : ''
    }`;
  };

  const pushZeroLengthStringError = (): string => {
    return `${errorPrefix} has property ${chalk.bold(propName)} that is an empty string`;
  };

  const pushZeroLengthArrayError = (): string => {
    return `${errorPrefix} has property ${chalk.bold(propName)} that is an empty ${chalk.bold(
      'array',
    )} (should be array of ${
      options.arrayElementsExpectedEnum
        ? `${chalk.bold(options.arrayElementsExpectedEnumName)} enum)`
        : chalk.bold(options.arrayElementsExpectedType)
    })`;
  };

  const propKey = <keyof T>propName;
  const prop = expectedType === PropertyType.array ? (parent[propKey] as []) : parent[propKey];

  // Check if prop is present, if required, or not required but it present anyway
  if (prop !== undefined) {
    // Property is present, whether optional or mandatory. Nothing to do.
  } else {
    if (presence === PropertyPresence.optional) {
      // It's okay to be missing a property if it's optional, but there is nothing else to check
      return ok(true);
    } else {
      let enumString = '';
      if ([PropertyType.array, PropertyType.enum].includes(expectedType)) {
        enumString = ` of ${
          options.arrayElementsExpectedEnum
            ? `enum ${chalk.bold(options.arrayElementsExpectedEnumName)}`
            : chalk.bold(options.arrayElementsExpectedType)
        }`;
      }
      let objectString = '';
      if (options.expectedObjectName) {
        objectString = ` of ${chalk.bold(options.expectedObjectName)}`;
      }

      return err(
        `${errorPrefix} is missing property ${chalk.bold(propName)} (should be ${getAorAn(
          expectedType,
        )} ${chalk.bold(expectedType)}${enumString}${objectString})`,
      );
    }
  }

  // If we got here, then the property is present, whether it's mandatory or optional

  // Check the property type
  // Most things can be type checked with "typeof", except for arrays.
  switch (expectedType) {
    case PropertyType.array:
      if (Array.isArray(prop)) {
        // Property is correct type, nothing to do
      } else {
        return err(pushTypeError());
      }
      break;
    case PropertyType.enum:
      if (!options.expectedEnum) {
        return err('just not possible, sorry');
      }
      if (isValueInEnum(prop as string, options.expectedEnum)) {
        // This value is in the enum set, so nothing to do
      } else {
        return err(pushTypeEnumError());
      }
      break;
    default:
      if (typeof prop === expectedType) {
        // Property is correct type, nothing to do
      } else {
        return err(pushTypeError());
      }
  }

  // Check there are characters if the prop is a string, or no elements if it's an array
  if (expectedType === PropertyType.string) {
    if ((prop as string).length > 0) {
      // The prop has characters, nothing to do.
      // Except, perhaps, check its format...
      if (options.propFormat && options.propFormatStr) {
        const propFormatResult = checkPropFormat(
          propName,
          prop as string,
          options.propFormat,
          options.propFormatStr,
          errorPrefix,
        );
        if (propFormatResult.isOk()) {
          // The string has the correct format (if required). Nothing to do
        } else {
          return err(propFormatResult.error);
        }
      }
    } else {
      return err(pushZeroLengthStringError());
    }
  } else if (expectedType === PropertyType.array) {
    if ((prop as []).length > 0) {
      // The prop has elements, nothing to do.
    } else {
      return err(pushZeroLengthArrayError());
    }
  }

  // If this is an array, check to be sure the elements are valid
  if (expectedType === PropertyType.array) {
    let theType = 'string';
    if (
      options.arrayElementsExpectedType === PropertyType.enum &&
      options.arrayElementsExpectedEnumName !== undefined
    ) {
      theType = options.arrayElementsExpectedEnumName;
    }

    const errors = [] as string[];
    (prop as []).forEach((el) => {
      switch (options.arrayElementsExpectedType) {
        case PropertyType.enum:
          if (options.arrayElementsExpectedEnum) {
            const isEnum = isValueInEnum(el, options.arrayElementsExpectedEnum);
            if (isEnum) {
              // This value is in the enum set, so nothing to do
            } else {
              errors.push(chalk.bold(el ? JSON.stringify(el).replaceAll('"', "'") : "''"));
            }
          }
          break;
        // case PropertyType.object:
        //   if (typeof el !== options.arrayElementsExpectedType) {
        //     errors.push('poop' + JSON.stringify(JSON.stringify(el)));
        //   }
        //   break;
        default:
          if (typeof el !== options.arrayElementsExpectedType) {
            errors.push(JSON.stringify(el).replaceAll('"', "'"));
          }
      }
    });
    if (errors.length > 0) {
      // This if is done to satisfy typescript
      // if (
      //   options.arrayElementsExpectedType === PropertyType.string ||
      //   options.arrayElementsExpectedType === PropertyType.enum
      // ) {
      // if (options.arrayElementsExpectedEnumName === undefined) {
      //   return err('This will never happen');
      // }
      return err(
        `${errorPrefix} has property ${chalk.bold(
          propName,
        )} with one or more invalid values for array of ${chalk.bold(theType)}${
          options.arrayElementsExpectedEnum ? ' enum' : ''
        }: ${chalk.bold(errors.join('|'))}`,
      );
      // }
    }

    // if (options.arrayElementsExpectedType === PropertyType.enum) {
    //   logger.verbose(
    //     `array elements should be ${JSON.stringify(options.arrayElementsExpectedEnum)}`,
    //   );
    // } else {
    //   logger.verbose('This can never happen!');
    // }
  }

  return ok(true);
};

export const checkForExtraProps = (
  parent: object,
  validOPropNames: string[],
  errorPrefix: string,
): Result<boolean, string[]> => {
  const errors: string[] = [];

  const pushInvalidKeyError = (propName: string): void => {
    errors.push(`${errorPrefix} has property ${chalk.bold(propName)} which is not expected`);
  };

  Object.keys(parent)
    .filter((k) => !validOPropNames.includes(k))
    .forEach((k) => pushInvalidKeyError(k));

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
  }
};

export const checkPropFormat = (
  propName: string,
  propValue: string,
  propFormat: RegExp,
  propFormatStr: string,
  errPrefix: string,
): Result<boolean, string> => {
  if (propFormat.test(propValue)) {
    return ok(true);
  } else {
    return err(
      `${errPrefix} has property ${chalk.bold(propName)} with an invalid format: ${chalk.bold(
        propValue,
      )} (should be ${chalk.bold(propFormatStr)})`,
    );
  }
};

/**
 * Checks that a sid which has been referred to exists
 */
export const checkSidReference = (
  sid: string,
  searchResult: Search | undefined,
  errorPrefix: string,
): Result<boolean, string> => {
  if (searchResult) {
    return ok(true);
  } else {
    return err(`${errorPrefix} references a search sid which doesn't exist: ${chalk.bold(sid)}`);
  }
};
