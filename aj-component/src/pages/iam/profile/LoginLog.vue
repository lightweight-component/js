<template>
    <ListLoader class="login-log" :id="147" :default-action="false" />>
</template>

<script>
import { ConfigWdiget } from '@ajaxjs/ui';

export default {
    components: {
        ListLoader: ConfigWdiget.ListLoader
    }
}
</script>

<style>
.login-log .ivu-card-body {
    padding: 0;
}
</style>