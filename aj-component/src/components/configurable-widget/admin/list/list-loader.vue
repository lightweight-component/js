<template>
  <div>
    <span v-if="modalInfo || !isShowForm">
      <!-- 搜索表单 -->
      <Card :bordered="false" dis-hover class="common-search-panel" style="text-align:left" v-if="showSearch">
        <span style="float:right;">
          <Button type="primary" icon="ios-search" @click="$parent.getData()">查询</Button>
          <Button style="margin-left:10px" @click="reset">重置</Button>
        </span>
        <Input suffix="ios-search" v-model="list.search.name" @on-enter="getData" clearable :placeholder="'请输入' + widgetName_ + '名称'" />
      </Card>

      <Card :bordered="false" dis-hover>
        <div class="toolbar">
          <Tooltip class="ivu-ml" content="刷新" placement="top">
            <Icon size="20" type="ios-refresh" @click="getData" style="cursor: pointer;" />
          </Tooltip>

          <slot name="toolbar"></slot>
          <Button v-if="!!createRoute || !! $parent.onCreate" type="primary" icon="md-add" @click="onCreate">新建{{widgetName_}}</Button>
        </div>
        <Table :columns="list.columns" :data="list.data" :loading="list.loading" height="500">
          <template slot-scope="{ row, index }" slot="action">
            <slot name="list_action" :item="row"></slot>

            <a style="color:green;" @click="onEdit(row.id)">编辑</a>
            <Divider type="vertical" />
            <Poptip confirm transfer title="是否要删除此行？" @on-ok="deleteInfo(row.id, index)">
              <a style="color:red;">删除</a>
            </Poptip>
          </template>
        </Table>

        <Page class="ivu-mt ivu-text-right" :total="list.total" :current.sync="list.pageNo" show-total show-sizer :page-size="list.limit" @on-page-size-change="handleChangePageSize" />
      </Card>
    </span>

    <Modal v-if="modalInfo" v-model="isShowForm" title="预览" width="800" ok-text="关闭" cancel-text="">
      <FormLoader ref="FormLoader" :api-prefix="apiPrefix" /> 
    </Modal> 

    <span v-if="!modalInfo && isShowForm">
      <a href="#" @click="isShowForm = false">返回列表</a>
      <!-- <FormLoader ref="FormLoader2a" :api-prefix="apiPrefix" style="width:1200px;margin: 0 auto;" /> -->
    </span>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 20px;
  overflow: hidden;
}

.toolbar .ivu-ml {
  float: right;
  padding-top: 10px;
}

/* 分页控件有点问题，修改下 */
.ivu-mt.ivu-text-right {
  text-align: right;
  margin-top: 20px;
}

.common-search-panel .ivu-input-type-text {
  width: 280px;
  margin: 0 10px 16px 0;
}
</style>

<script lang="ts">
import { get } from '../../../common';
import CellRender from '../list/renderer/list-cell-render';
import FormLoader from "../form/form-loader.vue";

// 声明 window.config 并为其指定类型
declare const window: Window & {
    config: ConfigInterface;
};

export default {
    components: { FormLoader },
    props: {
        apiPrefix: { type: String, required: true },     // API 前缀
        createRoute: { type: String, required: false },     // 新建事件触发时候，进入的路由地址
        editRoute: { type: String, required: false },       // 编辑事件触发时候，进入的路由地址
        defaultAction: { type: Boolean, required: false, default: true },
        showSearch: { type: Boolean, required: false, default: true },
        modalInfo: { type: Boolean, required: false, default: true }, // 是否弹窗显示详情，false 为进入新页面
    },
    data() {
        return {
            widgetName_: '',
            cfg: { fields: [] },
            listApiUrl_: '',
            colDefId: 0,
            list: {
                columns: [],
                data: [],
                total: 0,
                start: 0,
                limit: 9,
                pageNo: 1,
                pageSize: 9,
                loading: false,
                search: {
                    name: ''
                },
            } as TableListConfig,
            isShowForm: false,
            bindingFormId: 0
        };
    },

    methods: {
        /**
         * 加载列定义
         */
        getRemoteColDef(): void {
            get(`${this.apiPrefix}/common_api/ds_widget_config/${this.colDefId}?allow=1`, (j: ApiResponseResult) => {
                this.list.loading = false;

                if (j.status) {
                    this.widgetName_ = j.data.name;
                    this.renderConfig(j.data.config);
                } else
                    this.$Message.warning(j.message || '获取列表失败');
            });
        },
        renderConfig(cfg: ListFactory_ListConfig_New): void {
            this.bindingFormId = cfg.bindingForm.id;
            this.listApiUrl_ = cfg.dataBinding.url.replace('{project_prefix}', this.apiPrefix);
            let colDefs: TableColumn[] = cfg.fields;
            this.list.columns = [];

            colDefs.forEach((item: TableColumn) => { // 转换为 iView 的配置
                if (item.isShow) {
                    let rendererColDef: iViewTableColumn = { title: item.title, key: item.key, width: item.width, minWidth: item.minWidth, align: item.align };

                    CellRender(rendererColDef, item);

                    this.list.columns.push(rendererColDef);
                }
            });

            if (this.defaultAction)
                this.list.columns.push({ title: "操作", slot: "action", align: "center", width: 260 });

            this.getData();
        },
        getData(): void {
            this.list.loading = true;
            let params: any = { pageNo: this.list.pageNo, pageSize: this.list.pageSize };

            // if (this.list.search.name)
            //     params.where = `name LIKE '%${this.list.search.name}%'`;

            get(this.listApiUrl_, (j: RepsonseResult) => {
                this.list.loading = false;

                if (j.status) {
                    this.list.data = j.data.rows;
                    this.list.total = j.data.total;
                } else
                    this.$Message.warning(j.message || '获取列表失败');
            }, params);
        },

        /**
         * 分页记录数
         */
        handleChangePageSize(pageSize: number): void {
            this.list.limit = pageSize;
            this.getData();
        },
        reset(): void {
            for (let i in this.search)
                this.search[i] = "";

            this.getData();
        },

        /**
         * 新建
         */
        onCreate(id: number): void {
            if (this.createRoute)
                this.$router.push({ path: this.createRoute }); // 进入详情页，采用相对路径
            else {
                if (!this.$parent.onCreate)
                    throw '请设置父组件的 onCreate 事件处理器';

                this.$parent.edit(id);
            }
        },

        /**
         * 编辑
         */
        onEdit(id: number): void {
            if (this.editRoute)
                this.$router.push({ path: this.editRoute, query: { id } }); // 进入详情页，采用相对路径
            else if (this.$parent.onEdit) {
                // throw '请设置父组件的 onEdit 事件处理器';
                this.$parent.edit(id);
            } else {
                this.isShowForm = true;

                if (!this.modalInfo) {
                    setTimeout(() => {
                        this.$refs.FormLoader2a.formId = this.bindingFormId;
                        this.$refs.FormLoader2a.load();
                    });
                } else {
                    this.$refs.FormLoader.formId = this.bindingFormId;
                    this.$refs.FormLoader.load();
                }
            }
        }
    },
    watch: {
        /**
         * 分页
         * 
         * @param v 
         */
        current(v: number): void {
            this.start = (v - 1) * this.list.limit;
            this.getData();
        },
        'list.pageNo'(v: number): void {
            this.list.start = (v - 1) * this.list.limit;
            this.getData();
        },
        colDefId(v: number): void {
            this.getRemoteColDef();
        },
        'cfg': {
            handler(cfg: ListFactory_ListConfig_New): void {
                this.renderConfig(cfg);
            },
            deep: true
        }
    },
};
</script>