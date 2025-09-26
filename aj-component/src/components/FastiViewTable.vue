<template>
  <div>
    <!-- 搜索表单 -->
    <Card :bordered="false" dis-hover class="common-search-panel" style="text-align:left">
      <span style="float:right;">
        <Button type="primary" icon="ios-search" @click="$parent.getData()">查询</Button>
        <Button style="margin-left:10px" @click="reset">重置</Button>
      </span>
      <Input suffix="ios-search" v-model="list.search.name" @on-enter="getData" clearable
        :placeholder="'请输入' + widgetName_ + '名称'" />
    </Card>

    <div>
      <Card :bordered="false" dis-hover>
        <div class="toolbar">
          <Tooltip class="ivu-ml" content="刷新" placement="top">
            <Icon size="20" type="ios-refresh" @click="getData" style="cursor: pointer;" />
          </Tooltip>

          <slot name="toolbar"></slot>
          <Button v-if="!!createRoute || !!$parent.onCreate" type="primary" icon="md-add"
            @click="onCreate">新建{{ widgetName_ }}</Button>
        </div>

        <Table :columns="list.columns" :data="list.data" :loading="list.loading" height="500">
          <template slot-scope="{ row, index }" slot="action">
            <slot name="list_action" :item="row"></slot>
            <a v-if="pickup" style="color:green;" @click="doPickup(row)">选择</a>

            <span v-if="!pickup">
              <a style="color:green;" @click="onEdit(row.id)">编辑</a>
              <Divider type="vertical" />
              <Poptip confirm transfer title="是否要删除此行？" @on-ok="deleteInfo(row.id, index)">
                <a style="color:red;">删除</a>
              </Poptip>
            </span>
          </template>
        </Table>

        <Page class="ivu-mt ivu-text-right" :total="list.total" :current.sync="list.pageNo" show-total show-sizer
          :page-size="list.limit" @on-page-size-change="handleChangePageSize" />
      </Card>
    </div>
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
import Vue from "vue";
import List from "./list";
import { Xhr } from '@ajaxjs/util';

export default Vue.extend({
  name: "FastViewTable",
  props: {
    widgetName: { type: String, required: false },
    apiUrl: { type: String, required: false },  // 接口地址
    columnsDef: { type: Array, required: false },  // 列定义
    listApiUrl: { type: String, required: true },
    createRoute: { type: String, required: false },     // 新建事件触发时候，进入的路由地址
    editRoute: { type: String, required: false },       // 编辑事件触发时候，进入的路由地址
    pickup: { type: Boolean, required: false },       // 编辑事件触发时候，进入的路由地址
  },
  data() {
    return {
      widgetName_: this.widgetName,
      listApiUrl_: this.listApiUrl,
      colDefId: 0,
      list: {
        columns: this.columnsDef || [],
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
      } as TableListConfig
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData(): void {
      this.list.loading = true;
      const params: any = { pageNo: this.list.pageNo, pageSize: this.list.pageSize };

      // if (this.list.search.name)
      //     params.where = `name LIKE '%${this.list.search.name}%'`;

      this.listApiUrl_ && Xhr.xhr_get(this.listApiUrl_, (j: RepsonseResult) => {
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
      for (const i in this.search)
        this.search[i] = "";

      this.getData();
    },

    /**
     * 新建
     */
    onCreate(): void {
      if (this.createRoute)
        this.$router.push({ path: this.createRoute }); // 进入详情页，采用相对路径
      else {
        if (!this.$parent.onCreate)
          throw '请设置父组件的 onCreate 事件处理器';

        this.$parent.onCreate();
      }
    },

    /**
     * 编辑
     */
    onEdit(id: number): void {
      if (this.editRoute)
        this.$router.push({ path: this.editRoute, query: { id } }); // 进入详情页，采用相对路径
      else {
        if (!this.$parent.onEdit)
          throw '请设置父组件的 onEdit 事件处理器';

        this.$parent.onEdit(id);
      }
    },

    doPickup(data: any): void {
      this.$emit("on-select", data);
    },
    deleteInfo(id: number, index: number): void {
      this.list.loading = true;
      Xhr.xhr_del(`${this.apiUrl}/${id}`, List.afterDelete(() => {
        this.list.data.splice(index, 1);
        this.list.total--;
        this.list.loading = false;
      }).bind(this));
    },
  },
  watch: {
    listApiUrl(v: string): void {
      // debugger
      this.listApiUrl_ = v;
      this.getData();
    },

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
    }
  },
});
</script>