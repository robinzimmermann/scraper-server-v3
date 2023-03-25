const anotherFunc = (): void => {
  console.log('ouch');
};

export const doIt = (): void => {
  console.log("I'm doing it!");
  anotherFunc();
};
