export type Post = {
  pid: string;
  title: string;
};

export type Posts = {
  [pid: string]: Post;
};
