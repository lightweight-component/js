<template>
    <div id="app">
        <h1>Component Library Demo</h1>
        <MyButton label="Click Me!" @click="handleClick" />
    </div>
</template>

<script setup>
import { MyButton } from '../src/components'; // 从源码导入，方便调试

function handleClick() {
    alert('Button clicked!');
}
</script>

<style>
/* Demo 样式 */
</style>