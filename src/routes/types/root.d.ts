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
  bucket: number;
  limit: number;
}

interface Entity<T> {
  ids: string[];
  entities: T[];
}

interface MapEntity<T> {
  ids: string[];
  entities: Map<string, T>;
}

interface Provider {
  provide: any;
  useClass: any;
}

type CallBackFactory = (...models: any) => any;

interface ConfigFactoryModel {
  name: string;
  useFactory: CallBackFactory;
  imports: any[];
  inject: string[];
}
