/**
 * API 响应结果
 *
 */
declare type ApiResponseResult = {
    /**
     * 状态 1=成功, 0=失败
     */
    status: number;

    /**
     * 信息
     */
    message: string;

    /**
     * 错误码
     */
    errorCode?: number;

    /**
     * 数据
     */
    data: ApiResponseResultData;

    traceId: string
}

declare type ApiResponseResultData = {
    /**
     * 分页的总数
     */
    totalCount?: number;
    list?: any[];
}

/**
 * iView Table 列表所使用的 Data 项
 */
declare type iViewListData = {
    total: number;
    
    limit: number;

    /**
     * 当前页码
     */
    current: number;

    data: any[]
}