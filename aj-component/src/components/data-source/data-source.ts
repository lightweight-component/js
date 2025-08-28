import { defineComponent } from 'vue';
import { get, post, put, del } from '../common';

const DBType = { 'MY_SQL': 'MySQL', 'ORACLE': 'Oracle', 'SQL_SERVER': 'Sql Server', 'SPARK': 'Spark', 'SQLITE': 'SQLite', DB2: 'DB2' };

interface datasource {
	id: number;
	name: string;
};

export default defineComponent({
	name: 'DataSource',
	props: {
		/**
		 * API 地址
		 */
		api: {
			type: String,
			required: true,
		}
	},
	data() {
		return {
			isCreate: true,
			datasources: [
				{
					id: 1,
					name: '加载中……'
				}
			] as datasource[],
			activedItem: null,
			editing: {},
			form: {
				data: {} as datasource,
				rules: {
					name: [
						{ required: true, message: '数据源名称不能为空', trigger: 'blur' }
					],
				}
			},
			DBType: DBType
		};
	},
	mounted(): void {
		this.getList();
	},
	methods: {
		active(item: any): void {
			this.activedItem = item.id;
			this.form.data = item;
		},
		getList(callback?: (data: any) => void): void {
			get(`${this.api}/datasource?start=0&`, (j) => {
				this.datasources = j.data;
				callback && callback(this.datasources);
			});
		},
		add(): void {
			this.activedItem = null;
			this.form.data = {
				id: 0,
				name: ''
			};
		},
		create(): void {
			const form = this.$refs.editForm as any;

			form.validate((valid: boolean) => {
				if (valid) {
					post(`${this.api}/datasource`, this.form.data, j => {
						if (j.status === 1) {
							const newlyId = j.data;
							this.getList(() => this.activedItem = newlyId);
							this.$Message.success('创建数据源成功');
							this.form.data.id = newlyId;
						}
					});
				} else
					this.$Message.error('表单验证不通过');
			});
		},
		update(): void {
			const entity = Object.assign({}, this.form.data);
			put(`${this.api}/datasource`, entity, j => {
				if (j.status === 1)
					this.$Message.success('修改数据源成功');
			});
		},
		del(id: number, name: string): void {
			this.$Modal.confirm({
				title: '删除数据源',
				content: `是否删除数据源 #${name}？`,
				onOk: () => {
					del(this.api + id, (j: any): void => {
						this.$Message.success('删除数据源成功');
						this.getList(() => this.add());
					});
				}
			});
		},
		test(): void {
			get(`${this.api}/datasource/test/` + this.activedItem, (j) => {
				if (j.status)
					this.$Modal.success({ title: '连接数据源成功' });
			});
		}
	}
});