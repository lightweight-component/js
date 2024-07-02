import { xhr_get, xhr_post, xhr_put, xhr_del } from '@ajaxjs/util/dist/util/xhr';

const DBType = { 'MY_SQL': 'MySQL', 'ORACLE': 'Oracle', 'SQL_SERVER': 'Sql Server', 'SPARK': 'Spark', 'SQLITE': 'SQLite', DB2: 'DB2' };
// @ts-ignore
const DATASOURCE_API = window.API_ROOT ? API_ROOT + '/data_service/datasource' : '../../data_service/datasource';
// @ts-ignore
const DATA_SERVICE_API = window.API_ROOT ? API_ROOT + '/data_service/admin' : '../../data_service/admin';

export default {
	data(): {} {
		return {
			isCreate: true,
			datasources: [
				{
					id: 1,
					name: '加载中……'
				}
			],
			activedItem: null,
			editing: {},
			form: {
				data: {},
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
		active(item): void {
			this.activedItem = item.id;
			this.form.data = item;
		},
		getList(cb): void {
			// @ts-ignore
			xhr_get(`${window.config.dsApiRoot}/datasource`,  (j: RepsonseResult) => {
				this.datasources = j.data;
			}, { start: 0, limit: 99 });
		},
		add(): void {
			this.activedItem = null;
			this.form.data = {
				name: ''
			};
		},
		create(): void {
			this.$refs.editForm.validate((valid) => {
				if (valid) {
					xhr_post(DATASOURCE_API, this.form.data, j => {
						if (j.status === 1) {
							let newlyId = j.data;
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
			let entity = Object.assign({}, this.form.data);
			xhr_put(DATASOURCE_API, entity, j => {
				if (j.status === 1) {
					this.$Message.success('修改数据源成功');
				}
			});
		},
		del(id, name): void {
			this.$Modal.confirm({
				title: '删除数据源',
				content: `是否删除数据源 #${name}？`,
				onOk: () => {
					xhr_del(DATASOURCE_API + id, j => {
						this.$Message.success('删除数据源成功');
						this.getList(() => this.add());
					});
				}
			});
		},
		test(): void {
			// @ts-ignore
			xhr_get(`${window.config.dsApiRoot}/datasource/test/` + this.activedItem, (j: RepsonseResult) => {
				if (j.status)
					this.$Modal.success({ title: '连接数据源成功' });
			});
		}
	}
};