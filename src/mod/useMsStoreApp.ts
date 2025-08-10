import { fetch } from '@tauri-apps/plugin-http';
import { useState, useEffect } from 'react';

export interface MsStoreAppInfo {
    ProductId: string;
    ProductTitle: string;
    Description: string;
    Publisher: string;
}

// 模块级缓存
let cachedInfo: MsStoreAppInfo | null = null;
let fetchPromise: Promise<MsStoreAppInfo> | null = null;

function loadMsStoreApp(
    appId: string,
    market = 'US',
    language = 'zh-CN',
    locale = language,
    deviceFamily = 'Windows.Desktop',
    timeoutSeconds = 10
): Promise<MsStoreAppInfo> {
    if (fetchPromise) return fetchPromise;

    const url = `https://storeedgefd.dsx.mp.microsoft.com/v9.0/products/${appId}` +
        `?market=${market}` +
        `&languages=${encodeURIComponent(language)}` +
        `&locale=${encodeURIComponent(locale)}` +
        `&deviceFamily=${encodeURIComponent(deviceFamily)}`;



    fetchPromise = fetch(url, {
        method: 'GET',
        //@ts-ignore
        timeout: timeoutSeconds,
        responseType: 'json',
    })
        .then(async res => {
            if (!res) {
                console.error('响应为空或无 data 字段：', res);
                throw new Error('响应结构不正确，data 为空');
            }

            const data = JSON.parse(await res.text() as any);
            const p = data?.Payload;
            if (p) {
                const info: MsStoreAppInfo = {
                    ProductId: p.ProductId,
                    ProductTitle: p.Title,
                    Description: p.Description,
                    Publisher: p.PublisherName || p.Publisher
                };
                cachedInfo = info;
                return info;
            }

            throw new Error('未找到产品信息');
        })
        .catch(err => {
            if (cachedInfo) {
                console.warn('Fetch failed, using cached info:', err);
                return cachedInfo;
            }
            throw err;
        });

    return fetchPromise;
}

/**
 * React Hook：组件中调用它，自动获取 info/loading/error
 * @param enabled 默认启用，如需延迟加载则设为 false
 */
export function useMsStoreApp(
    appId: string,
    market?: string,
    language?: string,
    locale?: string,
    deviceFamily?: string,
    enabled: boolean = true // 👈 新增的启用开关
) {
    const [info, setInfo] = useState<MsStoreAppInfo | null>(cachedInfo);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(!cachedInfo && enabled);

    useEffect(() => {
        if (!enabled) return;

        if (cachedInfo) {
            setLoading(false);
            setInfo(cachedInfo);
            return;
        }

        setLoading(true);
        loadMsStoreApp(appId, market, language, locale, deviceFamily)
            .then(res => {
                setInfo(res);
                setError(null);
            })
            .catch((err: any) => {
                //console.error('Fetch error:', err);
                setError(err.message || String(err));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [appId, market, language, locale, deviceFamily, enabled]);

    return { info, loading, error };
}
