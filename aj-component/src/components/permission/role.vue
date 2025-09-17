<template>
  <div>
    <!--  <h1 class="page-title">角色管理</h1> -->

    <div class="main">
      <div class="left">
        <div>
          <span class="btns">
            <Button type="primary" icon="ios-add" @click="createTopRoleNode">创建顶级角色</Button>
            <Button type="info" icon="ios-refresh" @click="refreshRoleList">刷新</Button>
          </span>

        </div>
        <h2>角色管理</h2>

        <div class="tree">
          <Tree :data="roleTreeData" @on-select-change="onTreeNodeClk" @on-contextmenu="handleContextMenu">
            <template #contextMenu>
              <DropdownItem @click.native="editRole" style="color: cornflowerblue">
                <Icon type="ios-create-outline" /> 编辑角色
              </DropdownItem>
              <DropdownItem @click.native="addSubNode" style="color: green">
                <Icon type="md-add" /> 添加子节点
              </DropdownItem>
              <DropdownItem @click.native="delRole" style="color: #ed4014">
                <Icon type="md-close" /> 删除角色
                <!-- ✖ -->
              </DropdownItem>
            </template>
          </Tree>
        </div>
      </div>

      <div class="right">
        <p class="note">
          你可以维护角色可访问的模块，可以给角色分配模块，也可以给角色分配子角色。一个角色对应多个权限；角色可以继承，拥有父级的所有模块的访问权限。
        </p>

        <div>
          <h2>
            {{ currentRole ? '角色[' + currentRole.name + ']可访问的模块' : '请选择一个角色' }}
            <span style="font-weight:normal;font-size:14px;" v-if="currentRole.id == null">请从左侧选择一个角色以继续操作</span>
          </h2>

          <div class="permission-list">
            <select multiple v-model="selectedPermissions">
              <option v-for="item in permission.permissionList" :key="item.name" :value="item.id">{{ item.name }}
              </option>
            </select>
            <div class="permission-bts">
              <Button :disabled="currentRole.id == null" type="primary" icon="ios-add"
                @click="addPermission">添加模块</Button>
              <Button :disabled="!selectedPermissions.length" type="warning" icon="ios-remove"
                @click="removePermission">移除模块</Button>
              <Button :disabled="currentRole.id == null" type="error" icon="ios-close"
                @click="clearPermission">清空模块</Button>
              <br />
              <Button :disabled="currentRole.id == null" type="success" icon="ios-add-circle-outline"
                @click="savePermission">&nbsp;&nbsp;&nbsp;保 存&nbsp;&nbsp;&nbsp;</Button>
            </div>
            <p>增加、删除模块请到<a @click="showPermissionMgr(false)">模块管理</a>。</p>
          </div>
        </div>
        <br />
        <fieldset class="panel">
          <legend>通过继承父级的模块：</legend>
          <div class="inherited-permission">
            <span v-for="(item, index) in permission.inheritPermissionList" :key="item.id">{{ item.roleName
            }}-{{ item.name }}
              <span v-if="index < permission.inheritPermissionList.length - 1">、</span>
            </span>
          </div>
        </fieldset>
      </div>
    </div>

    <Modal v-model="isShisShowRoleEditForm" :title="'角色' + (!roleForm.isCreate ? ' #' + currentRole.id : '')"
      @on-ok="saveRole">
      <Form :model="currentRole" :label-width="100" style="margin-right: 10%;margin-left: 3%;">
        <FormItem label="角色名称">
          <Input v-model="currentRole.name" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="角色说明">
          <Input type="textarea" :rows="4" v-model="currentRole.content" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem v-if="!roleForm.isTop">
          <Checkbox v-model="currentRole.isInheritedParent">继承父级权限</Checkbox>
        </FormItem>
        <FormItem label="角色状态">
          <label><input type="radio" v-model="currentRole.stat" value="0" /> 启用</label> &nbsp;
          <label><input type="radio" v-model="currentRole.stat" value="2" /> 禁用</label>
        </FormItem>
        <FormItem v-if="!roleForm.isCreate" style="color:gray;">
          创建于 {{ currentRole.createDate }}
          <br />
          修改于 {{ currentRole.updateDate }}
        </FormItem>
      </Form>
    </Modal>

    <Modal v-model="isShowPermissionMgr" width="1000" title="权限管理列表">
      <PermissionMgr :is-pickup="isPermissionMgrPickup" :on-pickup="pickupPermission" :simple-api="simpleApi" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import { get, post, put, del } from '../common';
import { get, post, put, postForm, putForm, del } from '../common/request';
import type { RolePanel, RolePanel_Permission, RolePanel_Permission_ListItem } from './role-type';
import List from '../common-ui';
import PermissionMgr from './permission.vue';
import refreshTokens from '../common/tokenRefresh';

// refreshTokens();

export default defineComponent({
  components: { PermissionMgr },
  data(): RolePanel {
    return {
      simpleApi: 'http://localhost:8082/iam_api/common_api',
      roleApi: 'http://localhost:8082/iam_api/permission',
      permissionApi: 'http://localhost:8082/iam_api/module_permission',
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
  mounted(): void {
    this.refreshRoleList();
  },
  methods: {
    handleContextMenu(data: any): void {
      this.contextData = data;
    },

    /**
      * 编辑角色信息
      * 
      * 该函数用于初始化角色编辑表单，设置编辑状态，并从服务器获取指定角色的详细信息
      * 
      * @returns {void}
      */
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

    /**
    * 创建顶级角色节点
    * 
    * 该函数用于初始化创建一个新的顶级角色，设置相关表单状态和数据
    * 
    * @returns {void}
    */
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
          del(`${this.roleApi}/role/${this.contextData.id}`, (j: any) => {
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
      get(`${this.roleApi}/role_tree`, (j: any) => {
        if (j.status) {
          this.roleTreeData = j.data;
        } else
          this.$Message.warning(j.message || '获取数据失败');
      });
    },

    /**
      * 保存角色信息
      * 
      * 该函数用于保存角色数据，根据roleForm的isCreate属性判断是创建还是修改操作。
      * 如果是创建操作，则向角色添加parentId属性并发送POST请求；
      * 如果是修改操作，则发送PUT请求更新现有角色信息。
      * 操作成功后会显示相应提示信息并刷新角色列表。
      * 
      * @returns {void}
      */
    saveRole(): void {
      let data: any = List.copyBeanClean(this.currentRole);

      if (this.roleForm.isCreate) {
        data.parentId = this.contextData.id;

        postForm(`${this.simpleApi}/role`, data, (j: any) => {
          if (j.status) {
            this.$Message.success('创建成功');
            this.refreshRoleList();
          }
        });
      } else
        putForm(`${this.simpleApi}/role`, data, (j: any) => {
          if (j.status) {
            this.$Message.success('修改成功');
            this.refreshRoleList();
          }
        });
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

      postForm(`${this.permissionApi}/add_permissions_to_role`, data, (j: any) => {
        if (j.status)
          this.$Message.success('保存权限成功');
      });
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
</script>

<style lang="less" scoped src="./role.less"></style>