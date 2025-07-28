import { RequestParam, BodyType, RequestCookie, RequestHeader } from './httpTypes';

export const formatUrl = (url: string, params: RequestParam[]): string => {
  if (!url) return '';
  
  const validParams = params.filter(p => p.enabled && p.key.trim());
  if (validParams.length === 0) return url;
  
  const urlObj = new URL(url);
  validParams.forEach(param => {
    urlObj.searchParams.append(param.key, param.value);
  });
  
  return urlObj.toString();
};

export const parseHeaders = (headers: RequestHeader[]): Record<string, string> => {
  return headers
    .filter(h => h.enabled && h.key.trim())
    .reduce((acc, header) => {
      acc[header.key] = header.value;
      return acc;
    }, {} as Record<string, string>);
};

export const parseCookies = (cookies: RequestCookie[]): string => {
  return cookies
    .filter(c => c.enabled && c.key.trim())
    .map(cookie => `${cookie.key}=${cookie.value}`)
    .join('; ');
};
export const prepareBody = (bodyType: BodyType, bodyData: any): [any, string | null] => {
  try {
    switch (bodyType) {
      case 'none':
        return [null, null];
      
      case 'json':
        try {
          const json = typeof bodyData.json === 'string' ? JSON.parse(bodyData.json) : bodyData.json;
          return [JSON.stringify(json), 'application/json'];
        } catch (e) {
          return [bodyData.json, 'application/json'];
        }
      
      case 'x-www-form-urlencoded':
        const params = new URLSearchParams();
        if (bodyData.urlEncoded && Array.isArray(bodyData.urlEncoded)) {
          bodyData.urlEncoded
            .filter((p: any) => p.enabled && p.key)
            .forEach((p: any) => params.append(p.key, p.value));
        }
        return [params.toString(), 'application/x-www-form-urlencoded'];
      
      case 'form-data':
        const formData = new FormData();
        if (bodyData.formData && Array.isArray(bodyData.formData)) {
          bodyData.formData
            .filter((f: any) => f.enabled && f.key)
            .forEach((f: any) => {
              if (f.type === 'file' && f.value instanceof File) {
                formData.append(f.key, f.value);
              } else if (f.value !== undefined) {
                formData.append(f.key, String(f.value));
              }
            });
        }
        return [formData, null];
      
      case 'GraphQL':
        try {
          const variables = typeof bodyData.graphQL?.variables === 'string' 
            ? JSON.parse(bodyData.graphQL.variables) 
            : bodyData.graphQL?.variables;
          return [JSON.stringify({ 
            query: bodyData.graphQL?.query || '', 
            variables 
          }), 'application/json'];
        } catch (e) {
          return [JSON.stringify({ 
            query: bodyData.graphQL?.query || '', 
            variables: bodyData.graphQL?.variables || '{}'
          }), 'application/json'];
        }
      
      case 'xml':
        return [bodyData.xml || '', 'application/xml'];
      
      case 'raw':
        return [bodyData.raw || '', 'text/plain'];
      
      case 'binary':
        return [bodyData.binary || null, 'application/octet-stream'];
      
      case 'msgpack':
        return [bodyData.msgpack || null, 'application/msgpack'];
      
      default:
        return [null, null];
    }
  } catch (error) {
    console.error('Error preparing body:', error);
    return [null, null];
  }
};
export const formatResponseSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};