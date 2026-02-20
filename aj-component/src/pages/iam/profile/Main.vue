<template>
    <div class="user-center-main">
        <h3 class="aj-center-title">概览</h3>
        <h4>欢迎</h4>
        <hr class="aj-hr" />
        <div style="padding:0 3% 5% 3%;">
            <div style="float:right;">
                <!--  <a href="/profile/">修改个人资料</a>
            | <a href="admin/">进入后台</a>
            <br /> -->
                上次登录： 查看<a href="###" @click="$parent.showing = 'loginLog'">登录历史</a>
            </div>
            您好，{{ $parent.USER.username || $parent.USER.loginId }}，很高兴为您服务：）
        </div>
        <h4>个人信息</h4>
        <hr class="aj-hr" />
        <br />
        <table class="aj-form-table">
            <tbody>
                <tr>
                    <td>用户 id：</td>
                    <td>#{{ $parent.USER.id }}</td>
                    <td>用户账号：</td>
                    <td>{{ $parent.USER.loginId }}</td>
                </tr>
                <tr>
                    <td>昵称</td>
                    <td><input type="text" v-model="$parent.USER.username" /></td>
                    <td>真实姓名</td>
                    <td><input type="text" v-model="$parent.USER.realName" /></td>
                </tr>
                <tr>
                    <td>性别</td>
                    <td>
                        {{ $parent.USER.gender == 1 ? '男' : '' }}
                        {{ $parent.USER.gender == 2 ? '女' : '' }}
                        {{ $parent.USER.gender || '未知' }}
                    </td>
                    <td>生日</td>
                    <td><input type="text" v-model="$parent.USER.birthday" /></td>
                </tr>
                <tr>
                    <td>电话</td>
                    <td><input type="text" v-model="$parent.USER.phone" /></td>
                    <td>邮件</td>
                    <td><input type="text" v-model="$parent.USER.email" /></td>
                </tr>
                <tr>
                    <td>地区</td>
                    <td colspan="3"><input type="text" v-model="$parent.USER.email" /></td>
                </tr>
                <tr>
                    <td>租户</td>
                    <td>{{ $parent.USER.tenantName }}#{{ $parent.USER.tenantId }} </td>
                    <td>组织</td>
                    <td></td>
                </tr>
                <tr>
                    <td>简介</td>
                    <td colspan="3"><textarea style="width:92%;min-height:50px;padding:5px"
                            v-model="$parent.USER.content"></textarea>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- 	<h4>我的订单</h4>
	<hr class="aj-hr" />
	<div class="box" style="margin: 0 auto;width: 500px;">
		<img src="" width="160" style="vertical-align: middle;" /> 还没消费过，马上<a href="/shop/goods/">去看看？</a>~
	</div> -->
    </div>
</template>

<script>
export default {};
</script>