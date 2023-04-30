export type SearchPref = {
  sid: string;
  showInHeader: boolean;
  isSelected: boolean;
};

export type SearchPrefs = {
  [sid: string]: SearchPref;
};

export type UserPrefs = {
  isUndoing: boolean;
  displayMinimalPostcards: boolean;
  searchPrefs: SearchPrefs;
};
