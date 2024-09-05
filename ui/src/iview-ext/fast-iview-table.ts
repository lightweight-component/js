import List from './list';
import { Xhr } from "@ajaxjs/util";

export default {
    props: {
        widgetName: { type: String, required: false },
        apiUrl: { type: String, required: false },  // 接口地址
        columnsDef: { type: Array, required: false },  // 列定义
        listApiUrl: { type: String, required: true },
        createRoute: { type: String, required: false },     // 新建事件触发时候，进入的路由地址
        editRoute: { type: String, required: false },       // 编辑事件触发时候，进入的路由地址
        pickup: { type: Boolean, required: false },       // 编辑事件触发时候，进入的路由地址
    },
    data() {
        return {
            widgetName_: this.widgetName,
            listApiUrl_: this.listApiUrl,
            colDefId: 0,
            list: {
                columns: this.columnsDef || [],
                data: [],
                total: 0,
                start: 0,
                limit: 9,
                pageNo: 1,
                pageSize: 9,
                loading: false,
                search: {
                    name: ''
                },
            } as TableListConfig
        };
    },
    mounted() {
        this.getData();
    },
    methods: {
        getData(): void {
            this.list.loading = true;
            const params: any = { pageNo: this.list.pageNo, pageSize: this.list.pageSize };

            // if (this.list.search.name)
            //     params.where = `name LIKE '%${this.list.search.name}%'`;

            this.listApiUrl_ && Xhr.xhr_get(this.listApiUrl_, (j: RepsonseResult) => {
                this.list.loading = false;

                if (j.status) {
                    this.list.data = j.data.rows;
                    this.list.total = j.data.total;
                } else
                    this.$Message.warning(j.message || '获取列表失败');
            }, params);
        },

        /**
         * 分页记录数
         */
        handleChangePageSize(pageSize: number): void {
            this.list.limit = pageSize;
            this.getData();
        },
        reset(): void {
            for (const i in this.search)
                this.search[i] = "";

            this.getData();
        },

        /**
         * 新建
         */
        onCreate(): void {
            if (this.createRoute)
                this.$router.push({ path: this.createRoute }); // 进入详情页，采用相对路径
            else {
                if (!this.$parent.onCreate)
                    throw '请设置父组件的 onCreate 事件处理器';

                this.$parent.onCreate();
            }
        },

        /**
         * 编辑
         */
        onEdit(id: number): void {
            if (this.editRoute)
                this.$router.push({ path: this.editRoute, query: { id } }); // 进入详情页，采用相对路径
            else {
                if (!this.$parent.onEdit)
                    throw '请设置父组件的 onEdit 事件处理器';

                this.$parent.onEdit(id);
            }
        },

        doPickup(data: any): void {
            this.$emit("on-select", data);
        },
        deleteInfo(id: number, index: number): void {
            this.list.loading = true;
            Xhr.xhr_del(`${this.apiUrl}/${id}`, List.afterDelete(() => {
                this.list.data.splice(index, 1);
                this.list.total--;
                this.list.loading = false;
            }).bind(this));
        },
    },
    watch: {
        listApiUrl(v: string): void {
            // debugger
            this.listApiUrl_ = v;
            this.getData();
        },

        /**
         * 分页
         * 
         * @param v 
         */
        current(v: number): void {
            this.start = (v - 1) * this.list.limit;
            this.getData();
        },
        'list.pageNo'(v: number): void {
            this.list.start = (v - 1) * this.list.limit;
            this.getData();
        }
    },
};