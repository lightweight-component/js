<template>
    <ListLoader class="login-log" :id="147" :default-action="false" />>
</template>

<script>
import ListLoader from '../../../components/configurable-widget/list/list-loader.vue';

export default {
    components: {
        ListLoader: ListLoader
    }
}
</script>

<style>
.login-log .ivu-card-body {
    padding: 0;
}
</style>