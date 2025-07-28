import { useState, useCallback } from 'react';
import { HttpRequest, HttpResponse, BodyType } from './httpTypes';
import { formatUrl, parseHeaders, parseCookies, prepareBody } from './httpUtils';

const useHttpClient = () => {
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(async (request: HttpRequest) => {
    setLoading(true);
    setError(null);

    try {

      // 确保 request.body 存在
      const requestBody = request.body || { type: 'none' as BodyType };

      // 格式化URL
      // 第20行附近修改如下：
      const params = (request.params || []).map(param => ({
        ...param,
        enabled: param.enabled ?? true, // 补充 enabled 字段，默认为 true
      }));

      const url = formatUrl(request.url, params);
      if (!url) throw new Error('URL为必填项');

      // 准备请求头
      const headers = (request.headers || []).map(header => ({
        ...header,
        enabled: header.enabled ?? true, // 补充 enabled 字段，默认为 true
      }));
      const requestHeaders = parseHeaders(headers);

      // 添加Cookie到请求头
      const cookies = parseCookies(
        (request.cookies || []).map(cookie => ({
          ...cookie,
          enabled: cookie.enabled ?? true, // 补充 enabled 字段，默认为 true
        }))
      );
      if (cookies) {
        requestHeaders['Cookie'] = cookies;
      }

      // 准备请求体
      // 确保 requestBody 是一个包含 type 属性的对象
      const bodyConfig = typeof requestBody === 'object' && requestBody !== null && 'type' in requestBody
        ? requestBody
        : { type: 'none' as BodyType };

      const [body, contentType] = prepareBody(bodyConfig.type, bodyConfig);

      // 添加内容类型
      if (contentType && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = contentType;
      }

      let responseData: any;
      let responseStatus: number;
      let responseStatusText: string;
      let responseHeaders: Record<string, string> = {};
      let responseTime: number;
       
      if (request.useTauri || typeof request.useTauri === 'undefined') {
        // Tauri fetch - 使用最新 API
        const { fetch } = await import('@tauri-apps/plugin-http');

        // 创建请求选项
        const options: any = {
          method: request.method || 'GET',
          headers: requestHeaders,
          responseType: 3, // 二进制响应类型
        };

        // 添加代理设置
        if (request.proxy && request.proxy.type !== 'none') {
          options.proxy = {
            type: request.proxy.type,
            host: request.proxy.host,
            port: request.proxy.port,
            ...(request.proxy.username && {
              auth: {
                username: request.proxy.username,
                password: request.proxy.password || '',
              }
            })
          };
        }

        // 准备请求体 - 确保处理所有可能的情况
        if (body !== undefined && body !== null) {
          if (typeof body === 'string') {
            options.body = {
              type: 'Text',
              payload: body
            };
          } else if (body instanceof Blob) {
            options.body = {
              type: 'Binary',
              payload: Array.from(new Uint8Array(await body.arrayBuffer()))
            };
          } else if (body instanceof ArrayBuffer) {
            options.body = {
              type: 'Binary',
              payload: Array.from(new Uint8Array(body))
            };
          } else if (body instanceof FormData) {
            // 转换 FormData 为键值对数组
            const formEntries: [string, string | number[]][] = [];
            for (const [key, value] of body.entries()) {
              if (value instanceof Blob) {
                formEntries.push([key, Array.from(new Uint8Array(await value.arrayBuffer()))]);
              } else {
                formEntries.push([key, value as string]);
              }
            }
            options.body = {
              type: 'Form',
              payload: formEntries
            };
          } else if (typeof body === 'object') {
            options.body = {
              type: 'Json',
              payload: body
            };
          }
        }

        const start = Date.now();
        const resTauri = await fetch(url, options);
        responseTime = Date.now() - start;

        responseStatus = resTauri.status;
        responseStatusText = resTauri.statusText || '';

        // 处理二进制数据
        if ('data' in resTauri && resTauri.data instanceof Uint8Array) {
          const resContentType = resTauri.headers.get('content-type') || 'application/octet-stream';
          responseData = new Blob([resTauri.data], { type: resContentType });
        } else {
          if ('data' in resTauri) {
            responseData = resTauri.data;
          } else {
            responseData = await resTauri.text();
          }
        }

        // 将 Headers 对象转换为 Record<string, string>
        const headers: Record<string, string> = {};
        if ('headers' in resTauri && resTauri.headers) {
          resTauri.headers.forEach((value: string, key: string) => {
            headers[key] = value;
          });
        }
        responseHeaders = headers;
      } else {
        // 浏览器模式
        if (request.proxy && request.proxy.type !== 'none') {
          console.warn('浏览器模式不支持代理设置');
        }

        const start = Date.now();
        const response = await fetch(url, {
          method: request.method || 'GET',
          headers: requestHeaders,
          body: body as BodyInit,
        });
        responseTime = Date.now() - start;

        responseStatus = response.status;
        responseStatusText = response.statusText;

        // 将 Headers 对象转换为 Record<string, string>
        const headers: Record<string, string> = {};
        if (response.headers) {
          response.headers.forEach((value: string, key: string) => {
            headers[key] = value;
          });
        }
        responseHeaders = headers;

        // 根据内容类型解析响应体
        const resContentType = response.headers.get('content-type') || '';

        if (resContentType.includes('application/json')) {
          responseData = await response.json();
        } else if (resContentType.includes('text/') || resContentType.includes('application/xml')) {
          responseData = await response.text();
        } else {
          responseData = await response.blob();
        }
      }

      // 计算响应大小
      let responseSize = 0;
      if (responseData instanceof Blob) {
        responseSize = responseData.size;
      } else if (typeof responseData === 'string') {
        responseSize = new Blob([responseData]).size;
      } else if (responseData !== null && responseData !== undefined) {
        responseSize = JSON.stringify(responseData).length;
      }

      const httpResponse: HttpResponse = {
        status: responseStatus,
        statusText: responseStatusText,
        headers: responseHeaders,
        body: responseData,
        time: responseTime,
        size: responseSize,
      };

      setResponse(httpResponse);
    } catch (err) {
      console.error('HTTP请求错误:', err);
      setError(err instanceof Error ? err.message : '未知错误发生');
    } finally {
      setLoading(false);
    }
  }, []);

  return { response, loading, error, sendRequest };
};

export default useHttpClient;