export function getQueryParam(variable: string, isParent: boolean): string | null {
    const query: string = (isParent ? parent.location : window.location).search.substring(1);
    const vars: string[] = query.split("&");

    for (let i = 0; i < vars.length; i++) {
        const pair: string[] = vars[i].split("=");

        if (pair[0] == variable)
            return pair[1];
    }

    return null;
}

/**
* 复制文字到剪切板
* 
* @param {*} text 
*/
export function copyToClipboard(text: string): void {
    if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.style.position = 'fixed';// 隐藏此输入框
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        textarea.value = text;  // 赋值
        textarea.select(); // 选中
        document.execCommand('copy', true);
        document.body.removeChild(textarea);
    }
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * https://www.cnblogs.com/liuxianan/p/js-download.html
 * 
 * ref 这应该是你见过的最全前端下载总结 https://juejin.cn/post/6844903763359039501
 * 
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
export function openDownloadDialog(url: string | Blob, saveName: string): void {
    if (typeof url == 'object' && url instanceof Blob)
        url = URL.createObjectURL(url); // 创建blob地址

    const aLink: HTMLAnchorElement = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效

    let event;
    if (window.MouseEvent)
        event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }

    aLink.dispatchEvent(event);
}

export function myHTMLInclude(): void {
    let a: Element, file: string | null, xhttp: XMLHttpRequest;
    const z = document.getElementsByTagName("*");

    for (let i = 0; i < z.length; i++) {
        if (z[i].getAttribute("w3-include-html")) {
            a = z[i].cloneNode(false) as Element;
            file = z[i].getAttribute("w3-include-html");
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    a.removeAttribute("w3-include-html");
                    a.innerHTML = xhttp.responseText;
                    // @ts-ignore
                    z[i].parentNode.replaceChild(a, z[i]);
                    myHTMLInclude();
                }
            }

            if (file) {
                xhttp.open("GET", file, false);
                xhttp.send();
            }

            return;
        }
    }
}