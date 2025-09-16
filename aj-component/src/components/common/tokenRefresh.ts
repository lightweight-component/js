
import { getRefreshToken, saveTokens } from './authStorage';

const clientId: string = 'r3fgD3x43ft5H',
    clientSecret: string = 'zKvmMA4KmJ2CIijl9ubqbXpHm1',
    IAM_REFRESH_TOKEN: string = 'http://127.0.0.1:8082/iam_api/oidc/refresh_token';

type ResultData = {
    id_token: string;
    refresh_token: string;
};

// 刷新 Token 的 API 调用
export default async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await getRefreshToken();

    if (!refreshToken)
        throw new Error('No refresh token available');

    const params = {
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
    };

    const response = await fetch(IAM_REFRESH_TOKEN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: encodeClient(clientId, clientSecret)
        },
        body: json2formParams(params),
    });

    if (!response.ok)
        throw new Error('Token refresh failed');

    const result = await response.json();
    const { status, message, data } = result as {
        status: number;
        message: string;
        data: ResultData
    }

    if (status === 1) {
        // debugger
        await saveTokens(data.id_token, data.refresh_token || refreshToken); // 保存新 Token
        return { accessToken: data.id_token, refreshToken: data.refresh_token || refreshToken };
    } else
        throw new Error(`Token refresh failed. Reason: ${message}`);
};

/**
 * 对客户端ID和密钥进行基础认证编码。
 * 
 * 该方法用于将客户端的ID和密钥组合成一个字符串，并对该字符串进行 Base64 编码，
 * 以用于 HTTP 请求中的 Authorization 头，实现基础认证。
 * 基础认证是一种简单的认证方式，其中客户端的ID和密钥以一定格式组合，并进行编码，
 * 以此向服务器证明客户端的身份。
 *
 * @param clientId - 客户端ID，用于标识客户端
 * @param clientSecret - 客户端密钥，用于验证客户端的身份
 * @returns 返回编码后的字符串，格式为 "Basic base64编码的客户端ID:客户端密钥"
 * @throws 如果 clientId 或 clientSecret 为空，则抛出错误
 */
export function encodeClient(clientId: string, clientSecret: string): string {
    if (!clientId || !clientSecret || clientId.trim() === '' || clientSecret.trim() === '')
        throw new Error('Missing the arguments: clientId/clientSecret');

    const clientAndSecret = `${clientId}:${clientSecret}`;

    // 浏览器环境使用 btoa，Node.js 环境使用 Buffer
    let base64Encoded: string;

    if (typeof window !== 'undefined' && window.btoa) // 浏览器环境
        base64Encoded = btoa(unescape(encodeURIComponent(clientAndSecret)));
    else
        base64Encoded = Buffer.from(clientAndSecret).toString('base64');// Node.js 环境

    return `Basic ${base64Encoded}`;
}

function json2formParams(params: any): string {
    const pairs: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && typeof value !== 'function')
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }

    return pairs.join('&');
}