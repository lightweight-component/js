/**
 * Gets a query parameter value from the URL search string.
 * 
 * @param variable - The name of the query parameter to retrieve.
 * @param isParent - Whether to get the parameter from the parent window's URL (true) or current window's URL (false).
 * @returns The value of the query parameter if found, otherwise null.
 */
export function getQueryParam(variable: string, isParent: boolean = false): string | null {
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
 * 函数节流
 *
 * @author https://www.cnblogs.com/moqiutao/p/6875955.html
 * @param fn
 * @param delay
 * @param mustRunDelay
 */
export function throttle(fn: Function, delay: number, mustRunDelay: number): Function {
    let timer: number, t_start: number;

    return function () {
        let t_curr: number = +new Date();
        window.clearTimeout(timer);

        if (!t_start)
            t_start = t_curr;

        if (t_curr - t_start >= mustRunDelay) {
            fn.apply(this, arguments);
            t_start = t_curr;
        } else {
            let args = arguments;
            timer = window.setTimeout(() => fn.apply(this, args), delay);
        }
    };
}

/**
 * 并行和串行任务 
 * 
 * @author https://segmentfault.com/a/1190000013265925
 * @param arr 
 * @param finnaly 
 */
export function parallel(arr: [], _finally: Function) {
    let fn: Function, index: number = 0;
    // @ts-ignore
    let statusArr = Array(arr.length).fill().map(() => ({ isActive: false, data: null }));

    let isFinished = (): boolean => statusArr.every((item: any) => item.isActive === true);


    let resolve = function (index: number): Function {
        return function (data: any) {
            statusArr[index].data = data;
            statusArr[index].isActive = true;
            let isFinish: boolean = isFinished();

            if (isFinish) {
                let datas = statusArr.map((item: any) => item.data);

                _finally(datas);
            }
        };
    };

    while ((fn = arr.shift())) {
        fn(resolve(index));// 给 resolve 函数追加参数,可以使用 bind 函数实现,这里使用了柯里化
        index++;
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

    let event: any;

    if (window.MouseEvent)
        event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }

    aLink.dispatchEvent(event);
}


/**
 * Copies text to the clipboard using the modern Clipboard API if available, or a fallback method.
 * 
 * @param text - The text to copy to the clipboard.
 * @returns void
 * @description Uses navigator.clipboard.writeText() for modern browsers, and falls back to creating a temporary textarea element
 * for older browsers that don't support the Clipboard API.
 */
export function copyToClipboard(text: string): void {
    if (navigator.clipboard)
        navigator.clipboard.writeText(text);  // clipboard api 复制
    else {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
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
 * Processes elements with the "w3-include-html" attribute by fetching and including the specified HTML content.
 * This function recursively processes elements to handle any newly added content that also has the attribute.
 * 
 * @description Iterates through all elements in the document, finds those with the "w3-include-html" attribute,
 * fetches the HTML content from the specified file using a synchronous XMLHttpRequest, replaces the element with
 * the fetched content, and then calls itself recursively to process any new elements that might have been added.
 */
export function myHTMLInclude(): void {
    let a: Element, file: string | null, xhttp: XMLHttpRequest;
    const z: HTMLCollectionOf<Element> = document.getElementsByTagName("*");

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

/**
 * 向父级元素递归搜索
 * 
 * @param _el       当前所在元素
 * @param tagName   目标标签名称
 * @param className 目标元素样式类
 * @returns 目标元素，找不到为 null
 */
export function up(_el: Element, tagName: string, className: string): Element | null {
    if (tagName && className)
        throw '只能任选一种参数，不能同时传';

    let el: Element = _el.parentNode as Element;
    tagName = tagName && tagName.toUpperCase();

    while (el) {
        if (tagName && el.tagName == tagName)
            return el;

        if (className && el.className && ~el.className.indexOf(className))
            return el;

        el = <Element>el.parentNode;
    }

    return null;
}