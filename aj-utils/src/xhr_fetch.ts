// 定义 HTTP 请求头的类型：键值对，值为 string | number | boolean（常见类型）
export type HttpHeaders = {
    [key: string]: string | number | boolean;
};

// 定义回调函数的类型：接收一个参数（通常是响应数据），无返回值
export type ResponseCallback = (data: any) => void;

function request(api: string, method: string, bodyData: any, callback: ResponseCallback, header?: HttpHeaders): void {
    let headers: HttpHeaders = {};

    if (header)
        for (const key in header)
            headers[key] = header[key];

    method = method.toUpperCase();
    let body: string | null = bodyData;

    if (bodyData && (method === 'POST' || method === 'PUT')) {
        if (headers['Content-Type'] == 'application/json')
            body = JSON.stringify(bodyData);
        else if (headers['Content-Type'] == "application/x-www-form-urlencoded")
            body = json2formParams(bodyData);
    }

    fetch(api, {
        method,
        headers: headers as unknown as HeadersInit,
        body,
        credentials: 'include' as const
    }).then(response => {
        if (response.status === 404)
            throw new Error('Not found 404: ' + api);
        else if (response.status === 500)
            throw new Error('Server error: ' + api);
        else if (!response.ok)
            throw new Error(`Unexpected status: ${response.status}`);

        return response.json();
    })
        .then(data => {
            if (callback)
                callback(data); // 调用回调
        })
        .catch(error => {
            console.error('Network error when fetching from: ' + api, error); // 网络错误时才会 reject Promise
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