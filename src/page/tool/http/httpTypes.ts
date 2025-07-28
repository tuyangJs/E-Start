

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type BodyType =
  | 'none'
  | 'json'
  | 'form-data'
  | 'x-www-form-urlencoded'
  | 'binary'
  | 'GraphQL'
  | 'xml'
  | 'raw'
  | 'msgpack';

export type ProxyType = 'none' | 'http' | 'socks5';

export interface RequestParam {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestCookie {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface FormDataItem {
  key: string;
  value: string | File;
  type: 'text' | 'file';
  enabled?: boolean;
}

export interface RequestBody {
  type: BodyType;
  json?: string;
  formData?: FormDataItem[];
  urlEncoded?: RequestParam[];
  graphQL?: {
    query: string;
    variables: string;
  };
  binary?: File | null;
  xml?: string;
  raw?: string;
  msgpack?: ArrayBuffer | null;
}

export interface ProxyConfig {
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface HttpRequest {
  url: string;
  method: string;
  params?: Array<{
    enabled: boolean; key: string; value: string 
}>;
  headers?: Array<{
    enabled: boolean; key: string; value: string 
}>;
  cookies?: Array<{
    enabled: boolean; key: string; value: string 
}>;
  body?: string;
  useTauri?: boolean;
  proxy?: ProxyConfig;
  type?:string
}

export interface HttpResponse {
  size: number;
  time: number;
  status: number;
  statusText: string;
  headers: Record<string, string | string[]>;
  data?: any;
  body?:any
}