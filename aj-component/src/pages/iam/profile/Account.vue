<template>
    <div class="user-center-account">
        <h3 class="aj-center-title">帐号管理</h3>
        <ul class="safe">
            <!--         <li>	
            <a href="javascript:openPopupTpl('modiflyPhone');">修改登录名</a>
            <div :class="$parent.username ? 'ok' : 'fail' ">登录名</div>
            <div>登录名即用户名</div>
        </li> -->
            <li>
                <a href="javascript:void(0);" @click="showSetPhone = true">设置手机</a>
                <div :class="$parent.USER.phone ? 'ok' : 'fail'">绑定手机</div>
                <div>{{ $parent.USER.phone || '未绑定手机' }}</div>
            </li>
            <li>
                <a href="javascript:void(0);" @click="showSetEmail = true">设置邮箱</a>
                <div :class="$parent.USER.email ? 'ok' : 'fail'">绑定邮箱</div>
                <div>{{ $parent.USER.email || '未绑定邮箱' }}</div>
            </li>
            <li>
                <a href="javascript:void(0);" @click="showChangePsw = true">修改密码</a>
                <div class="ok">设置密码</div>
                <div>已设置</div>
            </li>
            <li>
                <a href="oauth/">管理绑定</a>
                <div style="padding-left:3%;">第三方登录</div>
                <div>通过微博、微信、QQ等第三方登录的绑定</div>
            </li>

            <li>
                <a href="javascript:void(0);" @click="isShowDelAccount = true">账号注销</a>
                <div style="padding-left:3%;">删除帐号</div>

                <div>删除该帐号以及所有该帐号关联的信息</div>
            </li>
        </ul>
        <aj-layer v-if="showSetPhone">
            <div style="width:800px; height:400px;text-align: center;">
                <h1>设置手机</h1>
                <aj-process-line />
                <form class="aj-form" style="width:300px; margin: 0 auto;">
                    <div>
                        <input type="text" placeholder="请输入手机号码" size="30" />
                    </div>
                    <div>
                        <input type="text" placeholder="请输入验证码" size="10" /> <button>发送验证码</button>
                    </div>
                    <div>
                        <button>保存手机</button> &nbsp;&nbsp;&nbsp;<a href="javascript:void(0);" @click="showSetPhone = false">取消</a>
                    </div>
                </form>
            </div>
        </aj-layer>
        <aj-layer v-if="showSetEmail">
            <div style="width:800px; height:400px;text-align: center;">
                <h1>设置邮箱</h1>
                <aj-process-line />
                <form class="aj-form" style="width:300px; margin: 0 auto;">
                    <div>
                        <input type="text" placeholder="请输入邮箱" size="30" />
                    </div>
                    <div>
                        <input type="text" placeholder="请输入邮箱验证码" size="10" /> <button>发送验证码</button>
                    </div>
                    <div>
                        <button>保存邮箱</button> &nbsp;&nbsp;&nbsp;<a href="javascript:void(0);" @click="showSetEmail = false">取消</a>
                    </div>
                </form>
            </div>
        </aj-layer>
        <aj-layer v-if="showChangePsw">
            <div style="width:800px; height:400px;text-align: center;">
                <h1>修改密码</h1>
                <aj-process-line />
                <form class="aj-form" style="width:300px; margin: 0 auto;">
                    <div>
                        <input type="password" placeholder="请输入原密码" size="30" />
                    </div>
                    <div>
                        <input type="password" placeholder="请输入新密码" size="30" />
                    </div>
                    <div>
                        <input type="password" placeholder="请重复输入新密码" size="30" />
                    </div>
                    <div>
                        <button>修改密码</button> &nbsp;&nbsp;&nbsp;<a href="javascript:void(0);" @click="showChangePsw = false">取消</a>
                    </div>
                </form>
            </div>
        </aj-layer>
        <aj-confirm v-show="isShowDelAccount" state="isShowDelAccount" :confirm-handler="delAccount"
            message="确定删除帐号吗？" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            userMail: null,
            userPhone: null,
            isEmailVerified: null,
            isShowDelAccount: false,
            showSetPhone: false,
            showSetEmail: false,
            showChangePsw: false,
        };
    },
    mounted() {
    },
    methods: {
        delAccount() {
            alert(9)
        }
    }
};
</script>