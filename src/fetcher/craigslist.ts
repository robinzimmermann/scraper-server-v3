const anotherFunc = (): void => {
  console.log('ouch');
};

export const init = (): void => {
  console.log("I'm doing it!");
  anotherFunc();
};
