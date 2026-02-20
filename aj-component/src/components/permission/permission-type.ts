/**
 * 模块
 */
type ModuleEntity = {
    id: number;

    /**
     * 名称
     */
    name: string;


    content: string;

    /**
     * 编码
     */
    code: string;

    stat: number;

    createDate: string;

    updateDate: string;
};

export type PermissionPanel = {
    isCreate: boolean,
    isShowEditWin: boolean,
    permissionData: ModuleEntity,
    columnsDef: [],
    listData: [],
    list: iViewListData,
    ruleValidate: any
};
