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

    /**
     * 链路 id
     */
    traceId: string
}

declare type ApiResponseResultData = {
    /**
     * 分页的总数
     */
    totalCount?: number;
    list?: any[];
} & Record<string, any>;

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

/**
 * 树节点
 */
declare type TreeMap = {
    id: number;

    /**
     * 父 id，输入时候必填
     */
    parentId: number;

    /**
     * iView Table 控件的展开属性
     */
    _showChildren: boolean;

    /**
     * 子节点，生成 Tree 之后出现
     */
    children?: TreeMap[];
}