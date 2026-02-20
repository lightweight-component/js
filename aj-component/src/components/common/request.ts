import { clearTokens, getAccessToken } from './authStorage';
import refreshTokens from './tokenRefresh';

let isRefreshing: boolean = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error)
            prom.reject(error);
        else
            prom.resolve(token);
    });

    failedQueue = [];
};

// 暴露一个函数，用于在请求中调用
async function handleTokenRefresh(originalRequest: () => Promise<any>): Promise<any> {
    if (!isRefreshing) {
        isRefreshing = true;

        try {
            const newToken = await refreshTokens();
            processQueue(null, newToken.accessToken);

            return await originalRequest(); // 重试原请求
        } catch (error) {
            processQueue(error, null);
            clearTokens();
            throw error;
        } finally {
            isRefreshing = false;
        }
    } else {// 正在刷新，排队等待
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then(async () => {
            return await originalRequest(); // 新 token 已就绪，重试
        });
    }
};

//-----------------------------------------------------------------------


// 定义 HTTP 请求头的类型：键值对，值为 string | number | boolean（常见类型）
export type HttpHeaders = {
    [key: string]: string | number | boolean;
};

// 定义回调函数的类型：接收一个参数（通常是响应数据），无返回值
export type ResponseCallback = (data: any) => void;

// 标记请求是否已重试，避免无限循环
let isRetry = false;

function request(api: string, method: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    const makeRequest = () => {
        return new Promise<void>((resolve, reject) => {
            let headers: HttpHeaders = { ...header };

            // 获取当前 Token
            getAccessToken().then(token => {
                if (token)
                    headers['Authorization'] = `Bearer ${token}`;

                method = method.toUpperCase();
                let body: string | null = bodyData;

                if (bodyData && (method === 'POST' || method === 'PUT')) {
                    if (headers['Content-Type'] === 'application/json')
                        body = JSON.stringify(bodyData);
                    else if (headers['Content-Type'] === 'application/x-www-form-urlencoded')
                        body = json2formParams(bodyData);
                }

                fetch(api, {
                    method,
                    headers: headers as unknown as HeadersInit,
                    body,
                    credentials: 'include' as const,
                }).then(response => {
                    if (response.status === 404) {
                        throw new Error('Not found 404: ' + api);
                    } else if (response.status === 500) {
                        throw new Error('Server error: ' + api);
                    } else if (response.status === 401 && !isRetry) {
                        // ⚠️ 401 且未重试 → 尝试刷新 Token
                        isRetry = true;
                        return handleTokenRefresh(() => makeRequest()).finally(() => {
                            isRetry = false;
                        });
                    } else if (!response.ok) 
                        throw new Error(`Unexpected status: ${response.status}`);
                    
                    return response.json();
                })
                    .then(data => {
                        if (callback) 
                            callback(data);

                        resolve();
                    })
                    .catch(error => {
                        if (error.message.includes('401')) 
                            // 刷新失败或无权限
                            console.error('Authentication failed, please login again.');
                         else 
                            console.error('Network error when fetching from: ' + api, error);
                        
                        reject(error);
                    });
            });
        });
    };

    makeRequest().catch(() => {
        // 错误已在内部处理
    });
}

function json2formParams(params: any): string {
    const pairs: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && typeof value !== 'function')
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }

    return pairs.join('&');
}

/**
 * HTTP GET 请求
 * 
 * @param api API 地址
 * @param callback 
 * @param header 
 */
export function get(api: string, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'GET', null, callback, header);
}

export function post(api: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'POST', bodyData, callback, { 'Content-Type': 'application/json', ...header });
}

export function postForm(api: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'POST', bodyData, callback, { 'Content-Type': 'application/x-www-form-urlencoded', ...header });
}

export function put(api: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'PUT', bodyData, callback, { 'Content-Type': 'application/json', ...header });
}

export function putForm(api: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'PUT', bodyData, callback, { 'Content-Type': 'application/x-www-form-urlencoded', ...header });
}

export function del(api: string, callback: ResponseCallback, header?: HttpHeaders): void {
    request(api, 'DELETE', null, callback, header);
}
 