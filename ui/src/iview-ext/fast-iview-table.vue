<template>
  <div>
    <!-- 搜索表单 -->
    <Card :bordered="false" dis-hover class="common-search-panel" style="text-align:left">
      <span style="float:right;">
        <Button type="primary" icon="ios-search" @click="$parent.getData()">查询</Button>
        <Button style="margin-left:10px" @click="reset">重置</Button>
      </span>
      <Input suffix="ios-search" v-model="list.search.name" @on-enter="getData" clearable :placeholder="'请输入' + widgetName_ + '名称'" />
    </Card>

    <div>
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

        <Page class="ivu-mt ivu-text-right" :total="list.total" :current.sync="list.pageNo" show-total show-sizer :page-size="list.limit" @on-page-size-change="handleChangePageSize" />
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

<script lang="ts" src="./fast-iview-table.ts"></script>