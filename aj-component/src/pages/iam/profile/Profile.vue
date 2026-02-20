<template>
    <div class="user-center-profile">
        <h3 class="aj-center-title">个人信息</h3>
        <hr class="aj-hr" />
        <div class="loginId">
            <span style="float:right">注册日期：{{ dateFilter($parent.USER.createDate) }}</span>
            用户 id/登录账号：#{{ $parent.USER.id }}/{{ $parent.USER.loginId }}
        </div>
        <div class="userInfoPanel aj-form">
            <table class="aj-form-table">
                <tbody>
                    <tr>
                        <td>用户名/昵称</td>
                        <td><Input v-model="$parent.USER.username" type="text" /></td>
                        <td></td>
                        <td colspan="1" rowspan="3">
                            <aj-file-upload v-model="image" is-image accept="image/*" @uploaded="onImageUploaded" />
                        </td>
                    </tr>
                    <tr>
                        <td>真实姓名</td>
                        <td><Input v-model="$parent.USER.realName" type="text" /></td>
                        <td>头像</td>
                    </tr>
                    <tr>
                        <td>性别</td>
                        <td> <label> <input v-model="$parent.USER.gender" value="male" type="radio"> 男 </label> <label>
                                <input v-model="$parent.USER.gender" value="female" type="radio"> 女 </label>
                            <label> <input v-model="$parent.USER.gender" value="other" type="radio"> 未知 </label>
                        </td>
                        <td></td>
                    </tr>

                    <tr>
                        <td>地区</td>
                        <td><Input v-model="$parent.USER.email" type="text" /></td>
                        <td>生日</td>
                        <td><Input v-model="$parent.USER.email" type="text" /></td>
                    </tr>
                    <tr>
                        <td>简介</td>
                        <td colspan="3"><Input type="textarea" style="padding: 5px; width: 92%; min-height: 50px;"
                                v-model="$parent.USER.content" /> </td>
                    </tr>
                    <tr>
                        <td>租户</td>
                        <td>{{ $parent.USER.tenantName }}#{{ $parent.USER.tenantId }} </td>
                        <td>组织</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <div class="loginId" style="color:gray">1、登录账号不可修改；2、欲修改电话或邮件请移步至<a href="###"
                    @click="$parent.showing = 'account'">“账号管理”</a>。</div>

            <button class="button-1 small" @click="showUserInfoPanel = false">更 新</button>
        </div>
    </div>
</template>

<script>
import { DateFormat } from '@ajaxjs/util';

export default {
    data() {
        return {
            image: '',
        }
    },
    methods: {
        onImageUploaded(file) {
            // this.$parent.USER.image = file.url;
        },
        dateFilter(v) {
            return DateFormat.dateFormat(v);
        }
    }
};
</script>