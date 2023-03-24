export interface JsonDb<T> {
  read: () => T;

  write: () => void;
}
