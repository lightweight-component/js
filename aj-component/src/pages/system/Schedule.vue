<template>
    <PageHeader title="任务调度" hidden-breadcrumb />
    <ListLoader :id="146" :show-edit-btn="false">
        <template v-slot:list_action="{ item, index }">
            <!-- 在这里可以使用 item 和 index -->
            <a style="color:rgb(240 7 189);" @click="trigger(item.id)">▶ 执行</a>
            <Divider type="vertical" />
            <a style="color:#2d8cf0;" @click="pause(item.id)">❚❚ 暂停</a>
            <Divider type="vertical" />
            <a style="color:green;" @click="resume(item.id)">⟳ 恢复</a>
            <Divider type="vertical" />
        </template>
    </ListLoader>
</template>

<script lang="ts">
import { XhrFetch } from '@ajaxjs/util';
import ListLoader from '../../components/configurable-widget/list/list-loader.vue';

export default {
    components: {
        ListLoader
    },
    methods: {
        trigger(id: number): void {
            alert(typeof id)

            // aj.xhr.postForm('http://localhost:8301/scheduled/trigger/' + id, null, (json) => {
            //     if (json && json.status == 1) {
            //         alert('执行成功');
            //         location.reload();
            //     }
            // });
        },
        del(id: number): void {
            if (confirm('确定删除？')) {
                let url = "http://localhost:8301/scheduled/remove/" + id;
                XhrFetch.post(url, {}, (json) => {
                    if (json && json.status == 1) {
                        alert('删除成功');
                        location.reload();
                    }
                });
            }
        },
        pause(id: number): void {
            XhrFetch.post('http://localhost:8301/scheduled/pause/' + id, {}, (json) => {
                if (json && json.status == 1) {
                    alert('暂停成功');
                    location.reload();
                }
            });
        },
        resume(id: number): void {
            XhrFetch.post('http://localhost:8301/scheduled/resume/' + id, {}, (json) => {
                if (json && json.status == 1) {
                    alert('恢复成功');
                    location.reload();
                }
            });
        }
    }
}
</script>