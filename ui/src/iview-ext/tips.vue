<template>
  <i style="cursor: pointer;" class="ivu-icon ivu-icon-ios-help-circle-outline" :title="text"></i>
</template>

<script>
import Vue from "vue";

/**
 * 帮助图标
 */
export default Vue.extend({
  name: 'Tips',
  props: {
    text: { type: String, required: true },
  },
});
</script>
