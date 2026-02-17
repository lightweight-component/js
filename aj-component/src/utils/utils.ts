/**
 * Gets a query parameter value from the URL search string.
 * 
 * @param variable - The name of the query parameter to retrieve.
 * @param isParent - Whether to get the parameter from the parent window's URL (true) or current window's URL (false).
 * @returns The value of the query parameter if found, otherwise null.
 */
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
