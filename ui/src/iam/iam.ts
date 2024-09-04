import { Xhr } from "@ajaxjs/util";

/**
 * 获取登录信息
 * 
 * @returns 用户 JWT
 */
export default {
    /**
     * 
     * 
     * @param loginUrl      登录页面地址
     * @param thisPageUrl   前端页面的地址，最后返回这里
     * @returns 
     */
    getLoginInfo(loginUrl: string, thisPageUrl: string): any {
        const token = getQueryParam("token", false);
        let accessToken: string = localStorage.getItem("accessToken");

        if (!accessToken && !token) {
            console.log('你未登录！');
            let target: string = `${loginUrl}?web_url=${encodeURIComponent(thisPageUrl)}`;

            confirm('你未登录。是否跳转到登录页面？') && location.assign(target);

            return;
        }

        if (token) {
            accessToken = decodeURIComponent(token);
            localStorage.setItem("accessToken", accessToken);

            // 只需要第一次的参数，之后不需要，现在清除       
            const url: URL = new URL(location.href); // 创建一个包含查询参数的URL
            const params: URLSearchParams = new URLSearchParams(url.search);// 获取URL中的查询参数
            params.delete('token');// 删除名为'b'的参数
            url.search = params.toString();// 更新URL的查询参数

            location.assign(url.href);
        }

        // window.JWT_TOKEN = JSON.parse(accessToken);
        Xhr.setBaseHeadParams({ Authorization: 'Bearer ' + accessToken });

        // 将 JWT Token 拆分为三个部分
        const tokenParts: string[] = accessToken.split('.')
        const payload = JSON.parse(atob(tokenParts[1])); // 解析载荷

        return payload;
    }
};

function getQueryParam(variable: string, isParent: boolean): string | null {
    var query: string = (isParent ? parent.location : window.location).search.substring(1);
    var vars: string[] = query.split("&");

    for (var i: number = 0; i < vars.length; i++) {
        var pair: string[] = vars[i].split("=");

        if (pair[0] == variable)
            return pair[1];
    }

    return null;
}