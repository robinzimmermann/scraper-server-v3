export const isValueInEnum = <T extends { [name: string]: unknown }>(
  value: string,
  theEnum: T,
): boolean => {
  return Object.values(theEnum).includes(value);
};
