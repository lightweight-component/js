<template>
    <div class="login-page" @mousemove="handleMouseMove">
        <div class="login-container">
            <!-- 浮动装饰图标 -->
            <div class="floating-icons">
                <span v-for="(icon, index) in icons" :key="index" :style="{
                    left: icon.left + 'px', transform: translateY(icon.top + 'px'),
                    width: icon.size + 'px',
                    height: icon.size + 'px',
                    animationDuration: (10 + Math.random() * 20) + 's',
                    animationDelay: (Math.random() * 5) + 's'
                }">
                </span>
            </div>
            <!-- 标题 -->
            <h2>欢迎登录</h2>

            <!-- 登录表单 -->
            <form @submit.prevent="handleSubmit">z

                <!-- 用户名输入 -->
                <div class="input-group">
                    <input type="text" required v-model="username">
                    <label>用户名</label>
                </div>

                <!-- 密码输入 -->
                <div class="input-group">
                    <input type="password" required v-model="password">
                    <label>密码</label>
                </div>

                <!-- 登录按钮 -->
                <button type="submit" class="btn">登 录</button>

                <!-- 辅助链接 -->
                <div class="links">
                    <a href="#" @mouseenter="changeBgColor('#a1c4fd')">忘记密码?</a>
                    <a href="#" @mouseenter="changeBgColor('#fbc2eb')">注册账号</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 用户输入数据
const username = ref('');
const password = ref('');

// 浮动图标数据
const icons = ref([]);

// 生成浮动图标
const createIcons = () => {
    const iconsCount = 10;
    const newIcons = [];
    for (let i = 0; i < iconsCount; i++) {
        newIcons.push({
            left: Math.random() * 380,     // 随机水平位置
            top: Math.random() * 400,      // 随机起始高度
            size: 20 + Math.random() * 30  // 随机大小（20~50px）
        });
    }
    icons.value = newIcons;
};

// 表单提交
const handleSubmit = () => {
    alert(`欢迎, ${username.value}!`);
};

// 鼠标悬停链接时改变背景色
const changeBgColor = (color) => {
    document.body.style.background = `linear-gradient(45deg, ${color}, ${color.replace(')', '')}80)`;
};

// 鼠标移动时动态改变背景角度
const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth; // 0 ~ 1
    const angle = x * 180; // 0 ~ 180deg
    document.body.style.background = `linear-gradient(${angle}deg, #ff9a9e, #fad0c4)`;
};

// 组件挂载后初始化图标
onMounted(() => {
    createIcons();
});
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* background: linear-gradient(45deg, #ff9a9e, #fad0c4); */
    transition: background 0.5s ease;
}

.login-container {
    position: relative;
    width: 380px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    /* 毛玻璃效果 */
    border-radius: 20px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 50px rgba(0, 0, 0, 0.15);
}

.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: 0.5s;
}

.login-container:hover::before {
    left: 100%;
}

.input-group input {
    width: 100%;
    padding: 15px 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    outline: none;
    border-radius: 35px;
    color: #fff;
    font-size: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.input-group input:focus,
.input-group input:hover {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.input-group label {
    position: absolute;
    top: 15px;
    left: 20px;
    color: rgba(255, 255, 255, 0.8);
    pointer-events: none;
    transition: all 0.3s ease;
}

.input-group input:focus+label,
.input-group input:valid+label {
    top: -10px;
    left: 15px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.2);
    padding: 0 10px;
    border-radius: 10px;
}

.btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(45deg, #ff9a9e, #fad0c4);
    border: none;
    border-radius: 35px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: 0.5s;
}

.btn:hover::before {
    left: 100%;
}

.floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.floating-icons span {
    position: absolute;
    display: block;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 15s linear infinite;
    opacity: 0;
}

.login-container:hover .floating-icons span {
    opacity: 1;
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }

    100% {
        transform: translateY(-1000px) rotate(720deg);
        opacity: 0;
    }
}
</style>