<template>
    <PageHeader title="交易流水" hidden-breadcrumb />
    <ListLoader :id="145" edit-btn-as-view />
</template>

<script>
import ListLoader from '../../components/configurable-widget/list/list-loader.vue';

export default {
    components: {
        ListLoader
    }
}
</script>