export type RolePanel = {
    simpleApi: string;

    /**
     * 角色 API
     */
    roleApi: string;

    /**
     * 
     */
    permissionApi: string;

    /**
     * 
     */
    isShisShowRoleEditForm: boolean;

    /**
     * 是否显示权限管理器
     */
    isShowPermissionMgr: boolean

    /**
     * 是否显示权限管理器
     */
    isPermissionMgrPickup: boolean

    /**
     * 当前角色
     */
    currentRole: any

    permission: RolePanel_Permission

    selectedPermissions: []

    /**
     * 右键菜单数据
     */
    contextData: any

    roleTreeData: []

    roleForm: any
}

export type RolePanel_Permission = {
    inheritPermissionList: RolePanel_Permission_ListItem[],

    permissionList: RolePanel_Permission_ListItem[]
};

export type RolePanel_Permission_ListItem = {
    id: any
    name: string
    isInherit?: boolean
};
