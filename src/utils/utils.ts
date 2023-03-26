export const isValueInEnum = <T extends { [name: string]: unknown }>(
  value: string,
  theEnum: T,
): boolean => {
  return Object.values(theEnum).includes(value);
};

export const getDateTimestamp = (): string => {
  const timestampOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  } as Intl.DateTimeFormatOptions;
  const timestampFormat = new Intl.DateTimeFormat('en-US', timestampOptions);
  const result = timestampFormat
    .format(new Date())
    .replace(',', '')
    .replaceAll('/', '-');
  return result;
};
