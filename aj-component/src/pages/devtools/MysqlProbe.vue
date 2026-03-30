<template>
    <Tabs value="name1">
        <TabPane label="概览" name="name1">
            <iframe src="mysql_probe/index.html" @load="adjustHeight"></iframe>
        </TabPane>
        <TabPane label="系统变量" name="name2">
            <iframe src="mysql_probe/variables.html"></iframe>
        </TabPane>
        <TabPane label="表信息" name="name3">
            <iframe src="mysql_probe/tables-list.html"></iframe>
        </TabPane>
    </Tabs>
</template>

<script lang="ts" setup>
const adjustHeight = (e: Event) => {
    const iframe = e.target as HTMLIFrameElement;
    // 获取 iframe 内部文档的高度
    // 注意：仅限同源策略，跨域会报错
    const innerDoc: Document | undefined = iframe.contentDocument || iframe.contentWindow?.document;
    const height: number = innerDoc?.body.scrollHeight as number;
    iframe.style.height = `${height}px`;
};
</script>

<style lang="less" scoped>
iframe {
    width: 100%;
    height: 100%;
    border: none;
}
</style>