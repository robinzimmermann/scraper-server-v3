import chalk from 'chalk';
import * as utils from '../../src/utils/utils';

describe('utils', () => {
  it('isNumeric is valid', () => {
    expect(utils.isNumeric('123')).toBeTrue();
  });

  it('isNumeric is invalid', () => {
    expect(utils.isNumeric('abc')).toBeFalse();
  });

  it('compareArrays is valid', () => {
    const arr1 = ['a', 'b', 3];
    const arr2 = ['a', 'b', 3];
    expect(utils.compareArrays(arr1, arr2)).toBeTrue();
  });

  it('compareArrays is invalid', () => {
    const arr1 = ['a', 'b'].sort();
    const arr2 = ['a', 'c'].sort();
    expect(utils.compareArrays(arr1, arr2)).toBeFalse();
  });

  it('compareArrays using object properties', () => {
    const arr1 = Object.keys({ aaa: 1, bbb: 2 }).sort();
    const arr2 = ['aaa', 'bbb'].sort();
    expect(utils.compareArrays(arr1, arr2)).toBeTrue();
  });

  it('differenceArrays with same arrays', () => {
    const arr1 = ['a', 'b', 3];
    const arr2 = [3, 'a', 'b'];
    expect(utils.differenceArrays(arr1, arr2)).toBeEmpty();
  });

  it('differenceArrays with different arrays', () => {
    const arr1 = ['a', 'b', 3];
    const arr2 = ['a'];
    expect(utils.differenceArrays(arr1, arr2)).toBeEmpty();
  });

  it('differenceArrays with different arrays 2', () => {
    const arr1 = ['subcategories'];
    const arr2 = ['subcategories', 'dummy'];
    expect(utils.differenceArrays(arr1, arr2)).toIncludeSameMembers(['dummy']);
  });

  it('uppercase word should return "a"', () => {
    expect(utils.getAorAn('Robin')).toBe('a');
  });

  it('uppercase should return "an"', () => {
    expect(utils.getAorAn('Alex')).toBe('an');
  });

  it('lowercase word should return "a"', () => {
    expect(utils.getAorAn('robin')).toBe('a');
  });

  it('lowercase should return "an"', () => {
    expect(utils.getAorAn('alex')).toBe('an');
  });

  it('empty string should return nothing', () => {
    expect(utils.getAorAn('')).toBe('');
  });

  it('getAorAn invalid string should return nothing', () => {
    const aaa: string | null = null;
    expect(utils.getAorAn(aaa as unknown as string)).toBe('');
  });

  it('remove ANSI codes should work when there are ANSI codes', () => {
    expect(utils.removeAnsiCodes('\u001B[4mUnicorn\u001B[0m')).toBe('Unicorn');
  });

  it('remove ANSI codes should work when there are no ANSI codes', () => {
    expect(utils.removeAnsiCodes('poop')).toBe('poop');
  });

  it('remove ANSI codes should work when there is chalk in the string', () => {
    expect(utils.removeAnsiCodes(chalk.bold.yellow('hello'))).toBe('hello');
  });
});
