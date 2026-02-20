<template>
    <div>
        <div style="margin-bottom: 20px;">
            <span style="float:right;">
                <Button @click="showCreate" v-if="!isPickup" type="primary" icon="ios-add"
                    style="margin-right: 10px;">增加模块</Button>
                <Button @click="getData()" icon="ios-refresh">刷新</Button>
            </span>
            <Input style="width: 30%;" @on-search="doSearch" search enter-button placeholder="模块的名称或编码皆可搜索" />
        </div>
        <Table border :columns="columnsDef" :data="list.data" style="min-height:250px">
            <template #action="{ row }">
                <a v-if="isPickup" style="margin-right: 5px" @click="onPickup(row)">选择</a>
                <span v-if="!isPickup">
                    <Poptip confirm title="确定删除？" @on-ok="doDelete(row.id)">
                        <a style="margin-right: 5px;color:red" icon="ios-trash">删除</a>
                    </Poptip>
                    |
                    <a style="margin-right: 5px;color:green;" @click="edit(row.id)" icon="ios-edit">编辑</a>
                </span>
            </template>
        </Table>

        <Page style="margin:20px auto;text-align: center;" :page-size="list.limit" :total="list.total"
            :model-value="list.current" @on-change="onPageNoChange" @on-page-size-change="handleChangePageSize"
            size="small" show-total show-elevator show-sizer />

        <Modal v-model="isShowEditWin" :title="isCreate ? '创建模块' : '编辑模块' + permissionData.id" width="600"
            @on-ok="save">
            <Form :model="permissionData" :rules="ruleValidate" :label-width="100"
                style="margin-right: 10%;margin-left: 3%;">
                <FormItem label="模块名称" prop="name">
                    <Input v-model="permissionData.name" placeholder="请输入模块名称……"></Input>
                </FormItem>
                <FormItem label="模块编码" prop="code">
                    <Input v-model="permissionData.code" placeholder="请输入模块编码……"></Input>
                </FormItem>
                <FormItem label="模块说明">
                    <Input type="textarea" :rows="4" v-model="permissionData.content" placeholder="请输入模块说明……"></Input>
                </FormItem>
                <FormItem label="模块状态">
                    <label><input type="radio" v-model="permissionData.stat" value="0" /> 启用</label> &nbsp;
                    <label><input type="radio" v-model="permissionData.stat" value="2" /> 禁用</label>
                </FormItem>
                <FormItem v-if="!isCreate" style="color:gray;">
                    创建于 {{ permissionData.createDate }} 修改于 {{ permissionData.updateDate }}
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { XhrFetch } from '@ajaxjs/util';
import List from '../common/common-ui';
import type { PermissionPanel } from './permission-type';

/**
 * 模块列表
 */
export default defineComponent({
    props: {
        isPickup: {
            type: Boolean,
            default: false,
        },
        onPickup: {
            type: Function
        },
        simpleApi: {
            type: String,
            required: true
        }
    },
    data(): PermissionPanel {
        return {
            isCreate: true,
            isShowEditWin: false,
            permissionData: {},
            columnsDef: [
                List.id,
                {
                    title: "模块名称",
                    key: "name",
                },
                {
                    title: "模块编码",
                    key: "code",
                    ellipsis: true
                },
                List.status,
                List.createDate,
                {
                    title: "操作",
                    slot: "action",
                    width: 120,
                },
            ],
            listData: [],
            list: {
                total: 0,
                limit: 5,
                current: 1,
                data: []
            } as iViewListData,
            ruleValidate: {
                name: [
                    { required: true, message: '该字段非空约束', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '该字段非空约束', trigger: 'blur' }
                ],
            }
        };
    },
    mounted(): void {
        this.getData();
    },
    methods: {
        getData(queryString?: string): void {
            let api: string = `${this.simpleApi}/module_permission/page_no?pageNo=${this.list.current}&limit=${this.list.limit}`;

            if (this.isPickup)
                api += '&q_stat=0';

            if (queryString)
                api += `&${queryString}`;

            get(api, List.getPageList(this, this.list));
        },
        onPageNoChange(pageNo: number): void {
            this.list.current = pageNo;
            this.getData();
        },
        handleChangePageSize(pageSize: number): void {
            this.list.limit = pageSize;
            this.getData();
        },
        pickup(index: number): void { },
        doSearch(keyword: string): void {
            this.list.current = 1; // reset first
            this.getData(`ql_name=${keyword}&ql_code=${keyword}`);
        },
        showCreate(): void {
            this.permissionData = {};
            this.isShowEditWin = true;
            this.isCreate = true;
        },
        doDelete(id: number): void {
            XhrFetch.del(`${this.simpleApi}/module_permission/${id}`, (j: any) => {
                if (j.status) {
                    this.$Message.success('删除成功');
                    this.getData();
                }
            });
        },
        edit(id: number): void {
            this.isShowEditWin = true;
            this.isCreate = false;

            XhrFetch.get(`${this.simpleApi}/module_permission/${id}`, (j: any) => {
                if (j.status)
                    this.permissionData = j.data;
            });
        },
        save(): void {
            let data: any = List.copyBeanClean(this.permissionData);

            if (this.isCreate) {
                XhrFetch.post(`${this.simpleApi}/module_permission`, data, (j: any) => {
                    if (j.status) {
                        this.$Message.success('创建成功');
                        this.getData();
                    }
                });
            } else {
                XhrFetch.put(`${this.simpleApi}/module_permission`, data, (j: any) => {
                    if (j.status) {
                        this.$Message.success('修改成功');
                        this.getData();
                    }
                });
            }
        }
    },
    watch: {
        /**
         * 分页
         * 
         * @param v 
         */
        isPickup(v: boolean): void {
            this.getData();

            if (v) {
                for (let i: number = 0; i < this.columnsDef.length; i++)
                    if (this.columnsDef[i].title === '状态') {
                        this.columnsDef.splice(i, 1);
                        break;
                    }
            }
            // else
            //     this.columnsDef.splice(3, 0, List.status);
        }
    }
});
</script>