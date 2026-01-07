/**
 * 配置
 */
interface ConfigInterface {
    /**DS
     * DS
     */
    dsApiRoot: string;
    IAM_ApiRoot: string;
    loginUrl: string;
    thisPageUrl: string;
}

/**
 * 项目
 */
type DataService_Porject = {
    id: number;
    name: string;
    content: string;
    apiPrefixDev: string;
    apiPrefixProd: string;
    defaultConfig: any;
};

/**
 * 树节点
 */
type DS_TreeNode_Project = {
    title: string,
    contextmenu: boolean,
    expand?: boolean,
    loading: boolean,
    render: Function,
    projectData: any,
    children?: DS_TreeNode_Service[]
};

/**
 * 树节点（服务）
 */
type DS_TreeNode_Service = {
    title: string,
    contextmenu: boolean,
    expand?: boolean,
    /**
     * 是否创建的
     */
    isCreate?: boolean,
    data: any,
    id: string,
    parentNode: DS_TreeNode_Service | any,
    render?: Function,
    children?: DS_TreeNode_Service[]
};


// iView 组件的配置定义

//  cfg: any;

/**
 * iView Table 配置字段， data 字段
 */
type TableListConfig = {
    /**
     * 列定义
     */
    columns: any[];

    /**
     * 表格数据
     */
    data: any[];

    /**
     * 记录总数
     */
    total: number;

    /**
     * MySQL 分页方式 start
     */
    start?: number;

    /**
     * MySQL 分页方式 limit
     */
    limit?: number;

    /**
     * 页码，表示第几页
     */
    pageNo?: number;

    /**
     * 每页记录数，等同于 MySQL 分页方式 limit
     */
    pageSize?: number;

    /**
     * 表格处于加载中状态
     */
    loading?: boolean;
};

/**
 * iView Table 配置方法
 */
type TableListMethod = {
    /**
     * 异步加载列表数据
     */
    getData(): void;

    /**
     * 打开详情 UI
     * 
     * @param id 
     */
    openInfo?(id: number): void;

    /**
     * 删除
     * 
     * @param id 
     * @param index 行号
     */
    deleteInfo?(id: number, index: number): void;
};