declare const window: Window & {// 声明 window.config 并为其指定类型
    config: ConfigInterface;
};

const PROJECT_PREFIX: RegExp = /{project_prefix}/i;
const IAM_PREFIX: RegExp = /{iam_prefix}/i;

export function getRealUrl(url: string): string {
    if (PROJECT_PREFIX.test(url))
        return url.replace(PROJECT_PREFIX, window.config.dsApiRoot);
    else if (IAM_PREFIX.test(url))
        return url.replace(IAM_PREFIX, window.config.iamApi);
    else
        if ((url.indexOf(window.config.dsApiRoot) != -1) || url.indexOf(window.config.iamApi) != -1)
            return url;
        else
            return window.config.dsApiRoot + url;
}