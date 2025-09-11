import { defineComponent } from 'vue';
import { get, post, put, del } from '../common';

type RolePanel = {
    simpleApi: string;

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

    contextData: any

    roleTreeData: []

    roleForm: any
}

type RolePanel_Permission = {
    inheritPermissionList: RolePanel_Permission_ListItem[],

    permissionList: RolePanel_Permission_ListItem[]
};

type RolePanel_Permission_ListItem = {
    id: any
    name: string
    isInherit?: boolean
};

export default defineComponent({
    data(): RolePanel {
        return {
            simpleApi: 'http://localhost:8888/iam/simple_api',
            permissionApi: 'http://localhost:8888/iam/permission',
            isShisShowRoleEditForm: false,
            isShowPermissionMgr: false,
            isPermissionMgrPickup: true,
            currentRole: {
                name: ''
            },
            permission: {
                inheritPermissionList: [],
                permissionList: []
            } as RolePanel_Permission,
            selectedPermissions: [],
            contextData: null,
            roleTreeData: [],
            roleForm: {
                isTop: false,
                isCreate: false
            }
        };
    },
    methods: {
        handleContextMenu(data: any): void {
            this.contextData = data;
        },
        editRole(): void {
            this.roleForm.isCreate = false;
            this.isShisShowRoleEditForm = true;

            this.roleForm.isTop = this.contextData.parentId == -1;

            get(`${this.simpleApi}/role/${this.contextData.id}`, (j: any) => {
                if (j.status) {
                    this.currentRole = j.data;
                } else
                    this.$Message.warning(j.message || '获取数据失败');
            });
        },
        createTopRoleNode(): void {
            this.roleForm.isTop = true;
            this.roleForm.isCreate = true;
            this.currentRole = {};
            this.contextData = { id: -1 };
            this.isShisShowRoleEditForm = true;
        },
        delRole(): void {
            let treeNodeName: string = this.contextData.title;

            this.$Modal.confirm({
                title: '删除角色',
                content: `<p>确定删除 ${treeNodeName} 这个节点吗？<br />注意：该节点下<b>所有的子节点</b>也会一并被删除！</p>`,
                onOk: () => {
                    del(`${this.permissionApi}/role/${this.contextData.id}`, (j: any) => {
                        if (j.status) {
                            this.$Message.success('删除成功');
                            this.refreshRoleList();
                        } else
                            this.$Message.warning(j.message || '获取数据失败');
                    });
                }
            });
        },
        addSubNode(): void {
            this.roleForm.isTop = false;
            this.roleForm.isCreate = true;
            this.currentRole = {};
            this.isShisShowRoleEditForm = true;
        },
        refreshRoleList(): void {
            get(`${this.permissionApi}/role_tree`, (j: any) => {
                if (j.status) {
                    this.roleTreeData = j.data;
                } else
                    this.$Message.warning(j.message || '获取数据失败');
            });
        },

        saveRole(): void {
            let data: any = List.copyBeanClean(this.currentRole);
            data.parentId = this.contextData.id;

            if (this.roleForm.isCreate) {
                post(`${this.simpleApi}/role`, (j: any) => {
                    if (j.status) {
                        this.$Message.success('创建成功');
                        this.refreshRoleList();
                    }
                }, data);
            } else {
                put(`${this.simpleApi}/role/${data.id}`, (j: any) => {
                    if (j.status) {
                        this.$Message.success('修改成功');
                        this.refreshRoleList();
                    }
                }, data);
            }
        },

        onTreeNodeClk(nodeArr: any[], node: any): void {
            // debugger
            this.currentRole = { name: node.title, id: node.id };
        },

        //--------------------------- permission -----------------------

        addPermission(): void {
            this.showPermissionMgr(true);
        },
        removePermission(): void {
            for (const id of this.selectedPermissions) {
                const index = this.permission.permissionList.findIndex(element => element.id === id);

                if (index !== -1)
                    this.permission.permissionList.splice(index, 1);
            }
        },
        clearPermission(): void {
            this.permission.permissionList = [];
        },

        savePermission(): void {
            let arr: string[] = [];
            this.permission.permissionList.forEach((item: any) => arr.push(item.id));

            let data: any = {
                roleId: this.currentRole.id,
                permissionIds: arr.join(',')
            };

            post(`${this.permissionApi}/add_permissions_to_role`, (j: any) => {
                if (j.status)
                    this.$Message.success('保存权限成功');
            }, data);
        },
        showPermissionMgr(isPermissionMgrPickup: boolean): void {
            this.isShowPermissionMgr = true;
            this.isPermissionMgrPickup = isPermissionMgrPickup;
        },
        pickupPermission(data: any): void {
            // TODO add multiple selection
            let arr: any[] = this.permission.permissionList;

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == data.id) {
                    this.$Message.warning('已经添加了权限' + data.name);
                    return;
                }
            }

            this.permission.permissionList.push({
                id: data.id,
                name: data.name
            });

            this.$Message.success(`添加权限[${data.name}]成功`);
            // debugger
        },
        handlePermissionList(data: RolePanel_Permission_ListItem[]): void {
            this.permission.inheritPermissionList = [];
            this.permission.permissionList = [];

            data.forEach((item: RolePanel_Permission_ListItem) => {
                if (item.isInherit)
                    this.permission.inheritPermissionList.push(item);
                else
                    this.permission.permissionList.push({
                        id: item.id,
                        name: item.name
                    });

            });
        }
    },

    watch: {
        currentRole(currentRole): void {
            if (currentRole && currentRole.id) {
                get(`${this.permissionApi}/permission_list_by_role/${currentRole.id}`, (j: any) => {
                    if (j.status) {
                        this.handlePermissionList(j.data);
                    } else
                        this.$Message.warning(j.message || '获取数据失败');
                });
            }
        }
    }
});