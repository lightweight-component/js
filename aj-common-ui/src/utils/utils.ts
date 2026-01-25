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
 