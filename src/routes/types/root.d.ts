interface IResponse<T> {
  code: number;
  message?: string;
  data?: T;
}
interface Pagination<T> {
  total: number;
  bucket: number;
  limit: number;
  data?: T[];
}

interface PaginationOption {
  bucket: number | 1;
  limit: number | 20;
}

interface Entity<T> {
  ids: string[];
  entities: T[];
}
