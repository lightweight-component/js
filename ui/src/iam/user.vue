<template>
  <a @click="showUserInfo">{{ state }}</a>
</template>

<script lang="ts">
import {  Utils } from "@ajaxjs/util";
import Vue from "vue";

const logout = "localStorage.removeItem('accessToken');location.reload();";

export default Vue.extend({
  name: 'IamUser',
  data() {
    return {
      state: "未登录",
      isShowInfo: false,
      payload: null,
    };
  },

  mounted(): void {
    // localStorage.setItem("accessToken", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwiYXVkIjoiREVGQVVMVF9TQ09QRTt0ZW5hbnRJZD0wIiwiZXhwIjoxNzIxMjMzMTE0LCJpc3MiOiJmb29AYmFyLm5ldCIsImlhdCI6MTcyMTE0NjcxNH0.mykPFQv2fkqmEk1UJs6vErtwATIdUmmbNvJDCMP4pMI');
    let accessToken: string = localStorage.getItem("accessToken");

    if (accessToken) {
      // 将 JWT Token 拆分为三个部分
      const tokenParts: string[] = accessToken.split(".");
      const payload = JSON.parse(atob(tokenParts[1])); // 解析载荷

      this.payload = payload;
      this.state = payload.name + "已登录";
    }
  },
  methods: {
    showUserInfo(): void {
      if (this.state === "未登录") {
        // @ts-ignore xxx
        location.assign(window.config.loginUrl);
      } else {
        this.$Modal.info({
          title: "当前用户信息",
          content: `<p>用户名： ${
            this.payload.name
          }</p><p>Token 过期时间：${Utils.dateFormat.call(
            new Date(this.payload.exp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          )}</p><p><a href="#" onclick="${logout}">用户登出</a></p>`,
        });
      }
    },
  },
});
</script>