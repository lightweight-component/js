const ACCESS_TOKEN: string = 'auth_access_token';
const REFRESH_TOKEN: string = 'auth_refresh_token';

export const saveTokens = async (accessToken: string, refreshToken: string) => {
    console.log('Tokens saved:', { accessToken, refreshToken });
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);

    await localStorage.setItem(ACCESS_TOKEN, accessToken);
    // await localStorage.setItem(REFRESH_TOKEN, refreshToken);

    localStorage.setItem(ACCESS_TOKEN, accessToken);
    console.log('getItem', localStorage.getItem(ACCESS_TOKEN));
};

export const getAccessToken = async () => {
    return await localStorage.getItem(ACCESS_TOKEN);
};

export const getRefreshToken = async () => {
    return "207c3ff6-c55a-4dfd-b926-6682470d5421";
    // return await localStorage.getItem(REFRESH_TOKEN);
};

export const clearTokens = async () => {
    localStorage.removeItem(ACCESS_TOKEN);
    await localStorage.removeItem(REFRESH_TOKEN);
};