<script setup lang="ts">
import DataSource from './components/data-source/data-source.vue';
import TableSelector from './components/table-selector/table-selector.vue';
import ApiHelper from './components/api-helper/index.vue';
import ApiHelper2 from './components/api-helper2/api-helper.vue';
import ApiSelector from './components/api-selector/index.vue';
import Role from './components/permission/role.vue';
import UserLogin from './widgets/user-login/UserLogin.vue';
import CF_Admin from './components/configurable-widget/admin/index.vue';

window.config = {
  dsApiRoot: 'http://localhost:8088/robot_api',
};
</script>

<template>
  <div>
    <!-- <UserLogin /> -->
    <h2>模块权限管理</h2>
    <CF_Admin style="width:1300px;height: 700px;" />
    <!--<Role />-->
    <!--     <h2>数据源选择器</h2>
    <DataSource class="box" api="/foo" />

    <h2>数据表选择器</h2>
    <TableSelector class="box" />
    <h2>数据库字段选择器</h2>
    TODO

    <h2>API 选择器</h2>
    <ApiSelector class="box" style="width:300px;height: 300px;" />

    <h2>HTTP 请求前端组件</h2>
    <ApiHelper class="box" :is-cross-db="false" />
    <ApiHelper2 class="box" :is-cross-db="false" /> -->
  </div>
</template>

<style scoped>
.box {
  width: 1300px;
  border: 1px solid lightgray;
  border-radius: 5px;
  padding: 3%;
}

.box.big {
  width: 1500px;
}

h2 {
  text-align: left;
  padding: 2% 0;
}
</style>
