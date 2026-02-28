import { ref, reactive, computed, onMounted } from 'vue';
// import { this.$Message, Modal } from 'view-design'; // 或 iview

// --- 数据定义 ---
const spuFormRef = ref(null);
const submitting = ref(false);

// 假设这些 URL 为你实际的 API 地址
const uploadActionUrl = '/api/upload/image'; // 替换为你的上传接口
const fetchProductUrl = '/api/products/'; // 替换为你的获取商品详情接口
const saveProductUrl = '/api/products'; // 替换为你的保存/更新接口

// formData 存储页面所有数据
const formData = ref({
    spu: {
        id: null, // 编辑时有值
        name: '',
        code: '',
        tags: '',
        brandId: null,
        categoryId: null,
        description: '',
        mainImageUrl: '',
        stat: 1,
    },
    selectedAttributes: [ // 初始为空数组，或可以有一个空的规格项
        // {
        //   def: { id: null, name: '' }, // 选择的属性定义
        //   values: [], // 该属性下的所有值
        //   newValueInput: '', // 输入新值的临时变量
        // }
    ],
    skus: [] // 动态生成的 SKU 列表
});

// baseData 存储基础数据
const baseData = ref({
    allAttributes: [
        { id: 1, name: '颜色' },
        { id: 2, name: '尺寸' },
        { id: 3, name: '内存' },
        // ... 从后端 API 获取
    ],
    brands: [
        { id: 1, name: '苹果' },
        { id: 2, name: '三星' },
        // ...
    ],
    categories: [
        { id: 1, name: '手机' },
        { id: 2, name: '电脑' },
        // ...
    ]
});

// 表单验证规则
const spuRules = {
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
};

// --- 计算属性 ---

// 主图文件列表，用于 Upload 组件
const mainImageFileList = computed(() => {
    if (formData.value.spu.mainImageUrl) {
        return [{
            name: 'main-image.jpg', // 可以从 URL 中提取真实文件名
            url: formData.value.spu.mainImageUrl,
            status: 'finished'
        }];
    }
    return [];
});

// SKU 表格的列定义 (动态 + 固定)
const skuColumns = computed(() => {
    let cols = [];

    // 为每个选定的规格生成一个列
    formData.value.selectedAttributes.forEach((spec, index) => {
        cols.push({
            title: spec.def.name || `规格${index + 1}`,
            key: `spec_${spec.def.id}`, // 使用 spec id 作为 key
            width: 150,
            render: (h, params) => {
                // 从 SKU 的 skuAttributeValues 中找到对应规格的值
                const attrVal = params.row.skuAttributeValues.find(av => av.attrDefId === spec.def.id);
                return h('span', attrVal ? attrVal.attrValueText : '-');
            }
        });
    });

    // 添加固定 SKU 信息列
    cols.push(
        {
            title: 'SKU 编码',
            key: 'code',
            width: 180,
            render: (h, params) => h('Input', {
                props: {
                    value: params.row.code,
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].code = val;
                    }
                }
            })
        },
        {
            title: 'SKU 名称',
            key: 'name',
            width: 200,
            render: (h, params) => h('Input', {
                props: {
                    value: params.row.name,
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].name = val;
                    }
                }
            })
        },
        {
            title: '销售价 (元)',
            key: 'price',
            width: 120,
            render: (h, params) => h('InputNumber', {
                props: {
                    value: params.row.price ? params.row.price / 100 : null, // 分转元
                    precision: 2,
                    min: 0
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].price = val !== null ? Math.round(val * 100) : null; // 元转分
                    }
                }
            })
        },
        {
            title: '成本价 (元)',
            key: 'costPrice',
            width: 120,
            render: (h, params) => h('InputNumber', {
                props: {
                    value: params.row.costPrice ? params.row.costPrice / 100 : null,
                    precision: 2,
                    min: 0
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].costPrice = val !== null ? Math.round(val * 100) : null;
                    }
                }
            })
        },
        {
            title: '划线价 (元)',
            key: 'marketPrice',
            width: 120,
            render: (h, params) => h('InputNumber', {
                props: {
                    value: params.row.marketPrice ? params.row.marketPrice / 100 : null,
                    precision: 2,
                    min: 0
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].marketPrice = val !== null ? Math.round(val * 100) : null;
                    }
                }
            })
        },
        {
            title: '库存',
            key: 'stock',
            width: 100,
            render: (h, params) => h('InputNumber', {
                props: {
                    value: params.row.stock,
                    min: 0
                },
                on: {
                    'input': (val) => {
                        formData.value.skus[params.index].stock = val;
                    }
                }
            })
        },
        {
            title: '图片',
            key: 'imageUrl',
            width: 120,
            render: (h, params) => h('div', [
                h('Upload', {
                    props: {
                        action: uploadActionUrl,
                        format: ['jpg', 'jpeg', 'png'],
                        max: 1,
                        showUploadList: false,
                        // fileList: params.row.imageUrl ? [{name: 'sku-img.jpg', url: params.row.imageUrl}] : []
                    },
                    on: {
                        'on-success': (res, file) => {
                            formData.value.skus[params.index].imageUrl = res.url; // 假设后端返回 {url: '...'}
                        }
                    }
                }, [
                    h('Button', { props: { size: 'small' } }, '上传'),
                ]),
                params.row.imageUrl ? h('img', {
                    attrs: { src: params.row.imageUrl, style: 'max-width: 50px; max-height: 50px; margin-top: 5px;' },
                    domProps: { alt: 'SKU Image' }
                }) : null
            ])
        }
    );

    return cols;
});

// --- 方法定义 ---

// 初始化数据 (模拟获取商品详情)
const initPageData = async (productId) => {
    try {
        // 1. 获取基础数据 (属性、品牌、分类) - 通常在组件挂载或路由守卫中获取一次
        // await loadBaseData(); 

        // 2. 获取具体商品数据
        // const response = await fetch(`${fetchProductUrl}${productId}`);
        // const productDetail = await response.json();
        // formData.value = productDetail; // 假设后端返回的数据结构与 formData 一致

        // --- Mock Data for Demo ---
        formData.value.spu = {
            id: 999,
            name: 'iPhone 15 Pro Max',
            code: 'IP15PM-256-TIT',
            tags: '手机,苹果,旗舰',
            brandId: 1,
            categoryId: 1,
            description: '全新一代 Pro 系列手机...',
            mainImageUrl: 'https://via.placeholder.com/200x200.png?text=Main+Image',
            stat: 1
        };

        formData.value.selectedAttributes = [
            {
                def: { id: 1, name: '颜色' },
                values: [{ id: 101, value: '钛金属' }, { id: 102, value: '蓝色' }],
                newValueInput: ''
            },
            {
                def: { id: 3, name: '内存' },
                values: [{ id: 301, value: '256GB' }, { id: 302, value: '512GB' }],
                newValueInput: ''
            }
        ];
        generateSkus(); // 根据 mock 的规格生成 SKU
        // --- End Mock Data ---
    } catch (error) {
        console.error('Failed to load product data:', error);
        this.$Message.error('加载商品数据失败');
    }
};

// 生成 SKU 列表
const generateSkus = () => {
    const specs = formData.value.selectedAttributes;
    if (specs.length === 0) {
        formData.value.skus = [];
        return;
    }

    // 使用笛卡尔积算法生成所有组合
    let result = [[]];
    for (let spec of specs) {
        const currentValues = spec.values;
        const newResult = [];
        for (let combination of result) {
            for (let value of currentValues) {
                newResult.push([...combination, { def: spec.def, value: value }]);
            }
        }
        result = newResult;
    }

    // 将组合转换为 SKU 对象
    const newSkus = result.map((combo, index) => {
        const existingSku = formData.value.skus.find(s => s._tempId === `_temp_${index}`); // 如果是编辑，尝试保留旧数据

        const skuAttributeValues = combo.map(item => ({
            attrDefId: item.def.id,
            attrDefName: item.def.name,
            attrValueId: item.value.id,
            attrValueText: item.value.value
        }));

        const nameSuffix = combo.map(item => item.value.value).join(' ');
        const codeSuffix = combo.map(item => item.value.value.substring(0, 3)).join('');

        return {
            _tempId: `_temp_${index}`, // 临时 ID，用于区分
            code: existingSku?.code || `SKU-${formData.value.spu.code}-${codeSuffix}`.toUpperCase(),
            name: existingSku?.name || `${formData.value.spu.name} ${nameSuffix}`,
            price: existingSku?.price || null,
            costPrice: existingSku?.costPrice || null,
            marketPrice: existingSku?.marketPrice || null,
            stock: existingSku?.stock || null,
            imageUrl: existingSku?.imageUrl || null,
            skuAttributeValues: skuAttributeValues
        };
    });

    formData.value.skus = newSkus;
};

// 规格项相关方法
const handleAddSpec = () => {
    formData.value.selectedAttributes.push({
        def: { id: null, name: '' },
        values: [],
        newValueInput: ''
    });
};

const handleRemoveSpec = (index) => {
    if (formData.value.selectedAttributes.length <= 1) {
        this.$this.$Message.warning('至少需要一个规格项');
        return;
    }
    formData.value.selectedAttributes.splice(index, 1);
    generateSkus(); // 重新生成 SKU
};

const handleAddSpecValue = (specIndex) => {
    const spec = formData.value.selectedAttributes[specIndex];
    if (!spec.newValueInput.trim()) return;

    // 检查是否重复
    if (spec.values.some(v => v.value === spec.newValueInput)) {
        this.$Message.warning(`规格值 "${spec.newValueInput}" 已存在`);
        return;
    }

    // 创建临时 ID 和值对象
    const newId = Date.now(); // 简单模拟 ID，实际应由后端分配或使用 UUID
    spec.values.push({ id: newId, value: spec.newValueInput });
    spec.newValueInput = ''; // 清空输入框
    generateSkus(); // 重新生成 SKU
};

const handleRemoveSpecValue = (specIndex, valIndex) => {
    const spec = formData.value.selectedAttributes[specIndex];
    spec.values.splice(valIndex, 1);
    generateSkus(); // 重新生成 SKU
};

const onSpecDefChange = (specIndex) => {
    // 当规格定义改变时，清空该规格下的所有值
    formData.value.selectedAttributes[specIndex].values = [];
    formData.value.selectedAttributes[specIndex].newValueInput = '';
    generateSkus(); // 重新生成 SKU
};

// 上传相关方法
const handleMainImageUploadSuccess = (response, file) => {
    // 假设后端返回 {url: '...'}
    formData.value.spu.mainImageUrl = response.url;
};

const handleMainImageRemove = () => {
    formData.value.spu.mainImageUrl = '';
};

// 提交方法
const handleSubmit = async () => {
    // 1. 验证 SPU 基本信息
    const spuValid = await spuFormRef.value.validate();
    if (!spuValid) {
        this.$Message.error('请填写完整的商品基本信息');
        return;
    }

    // 2. 验证 SKU 列表 (可以根据需要添加更详细的验证逻辑)
    if (formData.value.skus.length === 0) {
        Modal.confirm({
            title: '确认提交',
            content: '当前没有生成任何 SKU，确定要提交吗？',
            onOk: async () => {
                await performSubmit();
            }
        });
        return;
    }

    // 3. 执行提交
    await performSubmit();
};

const performSubmit = async () => {
    submitting.value = true;
    try {
        // 清理临时 ID
        const submitData = JSON.parse(JSON.stringify(formData.value));
        submitData.skus.forEach(sku => delete sku._tempId);

        // 发送请求
        // const response = await fetch(saveProductUrl, {
        //     method: 'POST', // 或 'PUT' if editing
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(submitData)
        // });

        // --- Mock Submit ---
        console.log('Submitting data:', submitData);
        // --- End Mock ---

        // if (!response.ok) throw new Error(response.statusText);
        this.$Message.success('商品保存成功');
        // $router.push('/products'); // 提交成功后跳转
    } catch (error) {
        console.error('Failed to submit product:', error);
        this.$Message.error('保存失败: ' + error.message);
    } finally {
        submitting.value = false;
    }
};

// 页面加载时初始化
onMounted(() => {
    const productId = 999; // 从路由参数获取，例如 route.params.id
    initPageData(productId);
});