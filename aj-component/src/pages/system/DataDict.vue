<template>
    <div>
        <h1>数据字典</h1>
        <TreeTable name="组织机构" :list="list" :api="api" :form-fields="formFields" />
    </div>
</template>

<script>
import TreeTable from '../../components/tree-table/tree-table.vue';

export default {
    components: { TreeTable },
    data() {
        return {
            api: 'dd',
            list: [
                {
                    title: '名称',
                    key: 'name',
                    align: 'left',
                    tree: true,
                    maxWidth: 200
                },
                {
                    title: '值（value）',
                    key: 'value',
                    align: 'center',
                },
                {
                    title: '说明',
                    align: 'center',
                    key: 'content'
                },
                {
                    title: '扩展属性',
                    align: 'center',
                    key: 'extraData'
                },
                {
                    title: '创建日期',
                    align: 'center',
                    width: 150,
                    render(h, { row }) {
                        if (row.createDate) {
                            let arr = row.createDate.split(':');
                            arr.pop();

                            return h('span', arr.join(':'));
                        }
                    },
                    // key: 'createDate'
                },
            ],
            formFields: [{
                name: '值（Value）',
                key: 'value'
            }]
        };
    }
};
</script>