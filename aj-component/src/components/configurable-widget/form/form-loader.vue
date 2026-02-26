<template>
  <FromRenderer ref="FromRenderer" :cfg="cfg" />
  <div class="btns" v-if="isShowBtns">
    <span v-if="isShowInfoBtn">
      <Input style="width:50px" v-model="entityId" /> <Button style="width:90px" @click="loadInfo">加载</Button>
    </span>
    <Button type="primary" v-if="status === 1" @click="create">创建</Button>
    <Button type="primary" v-if="status === 2" @click="update">保存</Button>
    <Button @click="$router.back()">返回</Button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { findNode } from "./info/info";
import FromRenderer from "./renderer/form-factory-renderer.vue";
import { XhrFetch, DateFormat } from '@ajaxjs/util';
import { getRealUrl } from '../common/utils';

declare const window: Window & {// 声明 window.config 并为其指定类型
  config: ConfigInterface;
};

export default defineComponent({
  setup() {
    const FromRenderer = ref();

    return { FromRenderer };
  },
  components: { FromRenderer },
  props: {
    id: { type: Number, required: false }, // 表单配置 id
    isShowInfoBtn: { type: Boolean, required: false, default: false }, // 是否显示加载 info，以便于调试
    isShowBtns: { type: Boolean, required: false, default: true }, // 是否显示按钮，还是自定义按钮？
  },
  data() {
    return {
      formId: this.id || 0, // 表单定义 id
      entityId: 0, // 实体 id
      cfg: { fields: [] } as any,
      status: 1, // 0=查看/1=新增/2=修改
      oldJson: null, // JSON Based 下的旧 JSON 完整数据。因为 data 只有部分
    };
  },
  mounted(): void {
    if (this.$route.query.id)
      this.entityId = Number(this.$route.query.id);

    if (this.formId)
      this.load();
  },
  methods: {
    /**
     * 加载表单配置
     */
    load(): void {
      if (this.entityId) // 有 id 表示修改状态
        this.status = 2;
      else {
        this.status = 1;
        this.FromRenderer.data = {};
      }

      XhrFetch.get(`${window.config.dsApiRoot}/common_api/ds_widget_config/${this.formId}`, (j: ApiResponseResult) => {
        if (j && j.status) {
          this.cfg = j.data.config;

          if (this.entityId) {// 加载单笔内容
            this.loadInfo();
          }
          // let cfg: FormFactory_Config = this.cfg;
          // let isJsonBased: boolean = !!cfg.jsonBased && cfg.jsonBased.isJsonBased;
          // let dataBinding: DataBinding = cfg.dataBinding;

          // if (isJsonBased) {
          //   this.status = 2; // JSON 配置模式下没有新建

          //   XhrFetch.get(dataBinding.url, (j: RepsonseResult) => {
          //     this.oldJson = j; // 完整的

          //     let jsonTarget: any = findNode(this.oldJson, this.entityId.split(".")); // 部分的，目标的

          //     this.FromRenderer.data = {};
          //     Object.assign(this.FromRenderer.data, jsonTarget);
          //   });
          // } else {
          //   if (this.entityId) {// 加载单笔内容
          //     this.FromRenderer.data = {};

          //     XhrFetch.get(`${dataBinding.url}/${this.entityId}`, (j: RepsonseResult) => {
          //       if (isJsonBased) {
          //         this.FromRenderer.data = j;
          //         this.FromRenderer.$forceUpdate();
          //       } else {
          //         let r = j.data;

          //         if (r) {
          //           this.FromRenderer.data = r;
          //           this.FromRenderer.$forceUpdate();
          //         } else
          //           this.$Message.warning("获取单笔内容失败");
          //       }
          //     });
          //   }
          // }
        } else
          this.$Message.error("获取表单配置失败");
      });
    },
    /**
     * 创建
     */
    create(): void {
      const api: string = this.cfg.infoApi;

      if (!api) {
        console.error("API doesn't exist");
        return;
      }

      const data: any = this._getSaveData();
      delete data.id;

      XhrFetch.post(getRealUrl(api), data, (j: ApiResponseResult) => {
        if (j.status) {
          this.status = 2;
          this.$Message.success('创建成功');
        } else
          this.$Message.error(j.message || '失败，原因未知！');
      });
      // let cfg: FormFactory_Config = this.cfg, api: DataBinding;

      // let callback = (j: RepsonseResult) => {
      //   if (j.status) {
      //     this.$Message.success(j.message);
      //     setTimeout(() => location.hash = location.hash + '&entityId=' + j.data, 2000);
      //   } else
      //     this.$Message.error(j.message || '创建失败，原因未知！');
      // };

      // if (cfg.isRESTful_writeApi) {
      //   api = cfg.updateApi;
      //   let r: ManagedRequest = this._initParams(api);

      //   post(r.url, callback, r.params);
      // } else {
      //   api = cfg.createApi;
      //   let r: ManagedRequest = this._initParams(api);

      //   (api.httpMethod == 'post' ? post : put)(r.url, callback, r.params);
      // }
    },
    /**
      * 更新
      */
    update(): void {
      const api: string = this.cfg.infoApi;

      if (!api) {
        console.error("API doesn't exist");
        return;
      }

      const data: any = this._getSaveData();

      XhrFetch.put(getRealUrl(api), data, (j: ApiResponseResult) => {
        if (j.status)
          this.$Message.success('保存成功');
        else
          this.$Message.error(j.message || '失败，原因未知！');
      });
      // let cfg: FormFactory_Config = this.cfg, api: DataBinding = cfg.updateApi;
      // let params: any = api.baseParams || {};

      // if (cfg.jsonBased.isJsonBased) {// Raw body post
      //   let jsonTarget: any = findNode(this.oldJson, this.entityId.split('.'));
      //   Object.assign(jsonTarget, this.FromRenderer.data);

      //   // @ts-ignore
      //   let json: string = JSON.stringify(r.params);
      //   console.log(json);

      //   post(api.url, json, (j: RepsonseResult) => {
      //     console.log(j)
      //   }, { contentType: 'application/json' });
      // } else {
      //   let r: ManagedRequest = this._initParams(api, this.FromRenderer.data, this);

      //   XhrFetch.put(r.url, (j: RepsonseResult) => {
      //     if (j.status)
      //       this.$Message.success(j.message);
      //     else
      //       this.$Message.error(j.message || '更新失败，原因未知！');
      //   }, r.params);
      // }
    },
    _getSaveData(): any {
      let data: any = {};
      Object.assign(data, this.FromRenderer.data);

      for (let key in data) {
        const field = data[key];

        if (field instanceof Date)
          data[key] = DateFormat.formatDate.call(field);
      }

      // clean fields no need
      // delete data.id;
      delete data.creator;
      delete data.creatorId;
      delete data.createDate;
      delete data.updater;
      delete data.createDate;
      delete data.updaterId;
      delete data.updateDate;
      data = camelToSnake(data);

      return data;
    },
    /**
     * 加载详情
     */
    loadInfo(): void {
      const api: string = this.cfg.infoApi;

      if (!api) {
        console.error("API doesn't exist");
        return;
      }

      XhrFetch.get(getRealUrl(api) + "/" + this.entityId, (j: ApiResponseResult) => {
        if (j && j.status) {
          this.FromRenderer.data = j.data;
          this.status = 2;
        }
      });
    }
  },
});

/**
 * 将对象的键从驼峰风格转换为下划线风格
 * 
 * @param obj - 输入的源对象
 * @returns 返回一个键为下划线风格的新对象
 */
function camelToSnake(obj: any): any {
  // 1. 处理 null 或 undefined 的情况
  if (obj === null || obj === undefined)
    return obj;


  // 2. 如果是基本类型（number, string, boolean, symbol, bigint）或 Date, RegExp 等对象，直接返回
  if (typeof obj !== 'object')
    return obj;

  // 3. 处理数组
  if (Array.isArray(obj))
    // 对数组中的每个元素递归调用 camelToSnake
    return obj.map(item => camelToSnake(item));

  // 4. 处理普通对象
  const result: any = {}; // 使用 any 作为临时类型，因为我们还不知道 result 的确切形状
  for (const [key, value] of Object.entries(obj)) {
    // 5. 将当前键从驼峰转换为下划线
    const snakeKey: string = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    // 6. 递归处理值，确保嵌套的对象和数组也被转换
    result[snakeKey] = camelToSnake(value);
  }

  return result;
}
</script>

<style lang="less" scoped>
.btns {
  text-align: center;
  padding: 20px 0;

  Button {
    width: 130px;
    letter-spacing: 3px;
    margin-right: 30px;
  }
}
</style>