<!-- 帮助图标 -->
<template>
  <i style="cursor: pointer;" class="ivu-icon ivu-icon-ios-help-circle-outline" :title="text"></i>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Tips',
  props: { text: { type: String, required: true } }
});
</script>
