export interface IFindAllOptions {
  take?: number;
  skip?: number;
}

export interface IFindAllResponse<T> {
  data: T[];
  total: number;
  take: number;
  skip: number;
}
