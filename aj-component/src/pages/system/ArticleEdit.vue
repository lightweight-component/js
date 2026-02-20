<template>
    <div>
        <h1>文章编辑</h1>

        <Form ref="formCustom" :model="article" :rules="ruleValidate" :label-width="80">
            <FormItem label="标题" prop="name">
                <Input v-model="article.name" placeholder="请输入文章的标题" />
            </FormItem>
            <FormItem label="简介" prop="intro">
                <Input v-model="article.intro" type="textarea" placeholder="请输入文章的简介" />
            </FormItem>
            <FormItem label="正文">
                <HtmlEditor ref="htmlEditor" :isIonicons="true" v-model="article.content"
                    upload-image-action-url="https://wyndme.cn/robot_api//upload/image" />
            </FormItem>
            <FormItem label="状态">
                <RadioGroup v-model="article.stat" style="display: inline-block;">
                    <Radio label="0">已发布</Radio>
                    <Radio label="1">已删除</Radio>
                    <Radio label="2">草稿</Radio>
                </RadioGroup>
                <!-- <span>创建日期：{{ formatDate(article.createDate, 'yyyy-MM-dd HH:mm:ss') }}</span> -->
                <span v-if="!isCreate" style="float: right;">创建日期：{{ formatDate(article.createDate) }} 修改日期：{{
                    formatDate(article.updateDate) }}</span>
            </FormItem>
            <FormItem>
                <Button type="primary" @click="handleSubmit" style="width:150px;">{{ isCreate ? '创 建' : '更 新'
                }}</Button>
                <Button style="margin-left: 20px;" @click="$router.back();">返 回</Button>
            </FormItem>
        </Form>

    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
// import type { Button } from 'view-ui-plus';
import HtmlEditor from '../../components/html-editor/HtmlEditor.vue';
import { XhrFetch, DateFormat } from '@ajaxjs/util';

// 声明 window.config 并为其指定类型
declare const window: Window & {
    config: ConfigInterface;
};

export default {
    setup() {
        const htmlEditor = ref();
        const formCustom = ref();

        return { htmlEditor, formCustom };
    },
    data() {
        return {
            article: {} as ArticleEntity,
            isCreate: true,
            ruleValidate: {
                name: [
                    { required: true, message: '请输入文章的标题', trigger: 'blur' }
                ],
                intro: [
                    { required: false, message: '请输入文章的简介', trigger: 'blur' },
                    { max: 255, message: '简介不能超过255个字符', trigger: 'blur' }
                ],

            }
        }
    },
    components: {
        HtmlEditor
    },
    mounted(): void {
        const articleId: string = this.$route.query.id as string;

        if (articleId) {
            XhrFetch.get(`${window.config.dsApiRoot}/common_api/article/${articleId}`, (j: ApiResponseResult) => {
                if (j.status) {
                    this.article = j.data as ArticleEntity;
                    // this.htmlEditor.setIframeBody(this.article.content);
                } else
                    this.$Message.warning(j.message || '获取文章失败');
            });

            this.isCreate = false;
        }
    },
    methods: {
        handleSubmit(): void {
            this.formCustom.validate((valid: boolean) => {
                if (!valid) {
                    this.$Message.error('表单验证失败，请检查输入！');
                    return;
                }

                const data = toCamelCase(this.article);

                if (this.isCreate)
                    XhrFetch.post(`${window.config.dsApiRoot}/common_api/article`, data, (j: ApiResponseResult) => {
                        if (j.status) {
                            this.isCreate = false;
                            this.$Message.success('创建成功');
                        } else
                            this.$Message.error(j.message || '创建失败，原因未知！');
                    });
                else {
                    data.id = this.article.id;

                    XhrFetch.put(`${window.config.dsApiRoot}/common_api/article`, data, (j: ApiResponseResult) => {
                        if (j.status)
                            this.$Message.success('更新成功');
                        else
                            this.$Message.error(j.message || '更新失败，原因未知！');
                    });
                }
            })
        },
        formatDate(date: string) {
            return DateFormat.dateFormat(date, 'yyyy-MM-dd hh:mm:ss');
        }
    }
}

function toCamelCase(obj: any): any {
    const newObj: any = {};

    for (let i in obj) {
        if (i == 'creator' || i == 'creatorId' || i == 'createDate' || i == 'updater' || i == 'updaterId' || i == 'updateDate')
            continue;

        const key: string = toCamelCaseStr(i);
        newObj[key] = obj[i];
    }

    return newObj;
}

/**
 * 从驼峰转换为下划线
 * @param str 
 */
function toCamelCaseStr(str: string): string {
    return str.replace(/(?<!^)[A-Z]/g, match => `_${match.toLowerCase()}`);
}
</script>

<style scoped>
h1 {
    margin: 0% 1%;
}

Form {
    max-width: 1500px;
    margin: 3% 0%;
}
</style>