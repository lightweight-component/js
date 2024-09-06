import { Xhr, Utils } from "@ajaxjs/util";

/**
 * 处理响应的回调函数
 */
type XhrCallback = (json: object, text: string) => void;

export default {
    afterDelete(cb?: (a: RepsonseResult) => void): (j: RepsonseResult) => void {
        return function (j: RepsonseResult): void {
            if (j.status) {
                cb && cb(j);
                this.$Message.success('删除成功');
            }
            else
                this.$Message.info('删除失败。' + j.message);
        }
    },

    delInfo(index: number) {
        Xhr.xhr_del(`${this.API}/${this.list.data[index].id}`, (j: RepsonseResult) => {
            if (j.status) {
                this.list.data.splice(index, 1);
                this.list.total--;
                this.$Message.success('删除成功');
            } else
                this.$Message.info('删除失败。' + j.message);
        });
    },

    /**
     * id 列
     */
    id: { title: '#', width: 60, key: 'id', align: 'center' },

    /**
     * 创建日期
     */
    createDate: {
        title: '创建日期',/*  key: 'createDate', */ width: 160, align: 'center', render(h: (a: string, b: string) => object, params: any) {
            return h('div', Utils.dateFormat.call(new Date(params.row.createDate), 'yyyy-MM-dd hh:mm'));
        }
    },

    /**
     * 分类标签
     */
    tags: { title: '分类标签', minWidth: 100, key: 'tagsNames', align: 'center', ellipsis: true },

    status: {
        title: '状态', width: 80,
        render(h: (a: string, b: object, c: string) => void, params: any) {
            let str = '', color = '';

            switch (params.row.stat) {
                case -1:
                    str = '草稿';
                    color = 'gray';
                    break;
                case 2:
                    color = 'red';
                    str = '禁用';
                    break;
                case 1:
                    color = 'red';
                    str = '已删除';
                    break
                case null:
                case 0:
                default:
                    color = 'green';
                    str = "启用";
            }

            return h('div', {
                style: {
                    color: color
                }
            }, str);
        }
    },
    getPageList(self: any, listArray: any, callback?: () => void): XhrCallback {
        return (j: JsonResponse) => {
            if (j.status) {
                listArray.total = j.data.total;
                listArray.data = j.data.rows;

                callback && callback();
            } else
                self.$Message.warning(j.message || '获取数据失败');
        }
    },

    copyBeanClean(bean: object): object {
        const deepCopy: any = JSON.parse(JSON.stringify(bean));

        delete deepCopy.createDate;
        delete deepCopy.updateDate;
        delete deepCopy.updateDate;
        delete deepCopy.creatorId;
        delete deepCopy.updaterId;
        delete deepCopy.creator;
        delete deepCopy.updater;
        delete deepCopy.extend;

        return deepCopy;
    }
};