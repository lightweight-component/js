<template>
  <div>
    <FastiViewTable widget-name="表单定义" :list-api-url="getApiUrl()" :columns-def="list.columns">
      <template v-slot:list_action="item">
        <a @click="openDemo(item.item)">预览</a>
        <Divider type="vertical" />
      </template>
    </FastiViewTable>

    <Modal v-model="perview.isShow" title="预览" width="1200" ok-text="关闭" cancel-text="">
      <FormLoader ref="previewloader" foo :is-Show-Info-Btn="true" :isShowInfoBtn="true" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import List from "../../common/common-ui";
import FormLoader from "./form-loader.vue";
import FastiViewTable from "../../common/FastiViewTable.vue";
import { DateFormat } from '@ajaxjs/util';

// 声明 window.config 并为其指定类型
declare const window: Window & {
  config: ConfigInterface;
};

/**
 * FORM 管理界面列表
 */
export default defineComponent({
  setup() {
    const previewloader = ref(null);

    return { previewloader };
  },
  components: { FastiViewTable, FormLoader },
  data() {
    return {
      perview: { isShow: false, title: "", data: {} },
      list: {
        columns: [
          List.id,
          {
            title: "列表名称",
            key: "name",
            minWidth: 130,
            ellipsis: true,
            tooltip: true,
          },
          {
            title: "关联数据库",
            render(h: Function, params: any) {
              if (params.row.datasourceName)
                return h("span", params.row.datasourceName + "/" + params.row.tableName);
              else return h("span", params.row.tableName);
            },
            width: 280,
            ellipsis: true,
          },
          {
            title: "修改日期",
            width: 160,
            align: "center",
            render(h: Function, params: any) {
              return h("div", DateFormat.dateFormat(params.row.updateDate, "yyyy-MM-dd hh:mm"));
            },
          },
          List.createDate,
          List.status,
          { title: "操作", slot: "action", align: "center", width: 260 },
        ],
      },
    };
  },

  methods: {
    getApiUrl(): string {
      return window.config.dsApiRoot + '/common_api/ds_widget_config/page_no?q_type=FORM';
    },

    /**
     * 预览
     */
    openDemo(this: ComponentInstance, item: any): void {
      // this.$refs.preview.formId = item.id;
      // this.$refs.preview.load();
      this.previewloader.formId = item.id;
      this.previewloader.load();
      this.perview.isShow = true;
    },

    /**
     * 进入详情页
     */
    onCreate(): void {
      this.$router.push({ path: "form-info" });
    },

    /**
     * 编辑
     */
    onEdit(id: number): void {
      this.$router.push({ path: "form-info", query: { id } });
    },
  },
});
</script>