<template>
    <div>
        <div class="holder">
            <Button type="primary" @click="refreshData">刷新</Button>
        </div>

        <br />
        <br />
        <h2>系统状态</h2>
        <div class="holder list">
            <div>
                CPU 使用率
                <Progress :percent="Math.round(data.cupInfo.usePercent * 100)" />
                {{ Math.round(data.cupInfo.usePercent * 100) }}%
            </div>
            <div>
                内存占用
                <Progress :percent="Math.round(data.memoryInfo.usePercent * 100)" />
                {{ data.memoryInfo.free }} 可用，共 {{ data.memoryInfo.total }}
            </div>
            <div>
                磁盘占用
                <Progress :percent="Math.round(data.diskUsePercent)" />
                {{ Math.round(data.diskUsePercent) }}%
            </div>
        </div>

        <h2>服务器信息</h2>
        <table>
            <tr>
                <td class="name">服务器名称</td>
                <td class="value"> {{ data.sysInfo.name }}</td>
                <td class="name">操作系统</td>
                <td class="value">{{ data.sysInfo.osName }}</td>
            </tr>
            <tr>
                <td class="name">服务器 IP</td>
                <td class="value"> {{ data.sysInfo.ip }}</td>
                <td class="name">系统架构</td>
                <td class="value">{{ data.sysInfo.osArch }}</td>
            </tr>
        </table>

        <h2>内存信息</h2>
        <table>
            <tr>
                <td class="name">全部内存</td>
                <td class="value"> {{ data.memoryInfo.total }}</td>
                <td class="name">已使用内存</td>
                <td class="value">{{ data.memoryInfo.used }}</td>
            </tr>
            <tr>
                <td class="name">未使用内存</td>
                <td class="value"> {{ data.memoryInfo.free }}</td>
                <td class="name">使用率</td>
                <td class="value">{{ (data.memoryInfo.usePercent * 100) + '%' }}</td>
            </tr>
        </table>

        <h2>JVM 信息</h2>
        <table>
            <tr>
                <td class="name">Java 运行时</td>
                <td class="value"> {{ data.jvmInfo.jdkName }}</td>
                <td class="name">Java 版本</td>
                <td class="value">{{ data.jvmInfo.jdkVersion }}</td>
            </tr>
            <tr>
                <td class="name">Java 架构</td>
                <td class="value"> {{ data.jvmInfo.arch }}</td>
                <td class="name">Java 厂商</td>
                <td class="value">{{ data.jvmInfo.vendor }}</td>
            </tr>
            <tr>
                <td class="name">最大内存</td>
                <td class="value"> {{ data.jvmInfo.maxMemory }}</td>
                <td class="name">已用内存</td>
                <td class="value">{{ data.jvmInfo.usedMemory }}</td>
            </tr>
            <tr>
                <td class="name">可用内存</td>
                <td class="value"> {{ data.jvmInfo.freeMemory }}</td>
                <td class="name">内存使用率</td>
                <td class="value">{{ data.jvmInfo.usePercent }}%</td>
            </tr>
            <tr>
                <td class="name">启动时间</td>
                <td class="value"> {{ data.jvmInfo.startTime ? new Date(data.jvmInfo.startTime) : '-' }}</td>
                <td class="name">安装路径</td>
                <td class="value">{{ data.jvmInfo.jdkHome }}</td>
            </tr>
        </table>
    </div>
</template>


<script lang="ts">
import { XhrFetch } from '@ajaxjs/util';

const TEST = {
    "cupInfo": {
        "physicalProcessorCount": 4,
        "logicalProcessorCount": 4,
        "systemPercent": 0.08,
        "userPercent": 0.06,
        "waitPercent": 0,
        "usePercent": 0.15
    },
    "memoryInfo": {
        "total": "11.89GB",
        "used": "8.5GB",
        "free": "3.39GB",
        "usePercent": 0.71
    },
    "diskInfos": null,
    "jvmInfo": {
        "jdkVersion": "1.8.0_181",
        "jdkHome": "C:\\Program Files\\Java\\jre1.8.0_181",
        "jdkName": "Java HotSpot(TM) 64-Bit Server VM",
        "jvmTotalMemory": "184MB",
        "maxMemory": "2.64GB",
        "freeMemory": "148.16MB",
        "usedMemory": "35.84MB",
        "usePercent": 0.19,
        "startTime": 1649682389913,
        "vendor": "Oracle Corporation",
        "arch": "amd64",
        "uptime": 1931
    },
    "sysInfo": {
        "name": "Old_i5",
        "ip": "169.254.70.213",
        "osName": "Windows 8.1",
        "osArch": "amd64",
        "userDir": "C:\\code\\aj-framework"
    },
    "diskUsePercent": 82.72
};

export default {
    data() {
        return {
            data: {
                cupInfo: {
                    physicalProcessorCount: 0,
                    logicalProcessorCount: 0,
                    systemPercent: 0,
                    userPercent: 0,
                    waitPercent: 0,
                    usePercent: 0
                },
                memoryInfo: {
                    total: '0GB',
                    used: '0GB',
                    free: '0GB',
                    usePercent: 0
                },
                diskInfos: null,
                jvmInfo: {
                    jdkVersion: '',
                    jdkHome: '',
                    jdkName: '',
                    jvmTotalMemory: '',
                    maxMemory: '',
                    freeMemory: '',
                    usedMemory: '',
                    usePercent: 0,
                    startTime: 0,
                    vendor: '',
                    arch: '',
                    uptime: 0
                },
                sysInfo: {
                    name: '',
                    ip: '',
                    osName: '',
                    osArch: '',
                    userDir: ''
                },
                diskUsePercent: 0
            }
        }
    },
    methods: {
        refreshData() {
            this.fetchSystemInfo();
            this.fetchJvmInfo();
            this.fetchCpuInfo();
            this.fetchMemInfo();
        },
        fetchSystemInfo() {
            XhrFetch.get(`${window.config.dsApiRoot}/sys_monitor/sys_info`, res => {
                if (res.data) {
                    this.data.sysInfo = res.data;
                }
            });
        },
        fetchJvmInfo() {
            XhrFetch.get(`${window.config.dsApiRoot}/sys_monitor/jvm_info`, res => {
                if (res.data) {
                    this.data.jvmInfo = res.data;
                }
            });
        },
        fetchCpuInfo() {
            XhrFetch.get(`${window.config.dsApiRoot}/sys_monitor/cpu_usage`, res => {
                if (res.data) {
                    // CPU 使用率直接是数值
                    this.data.cupInfo.usePercent = res.data / 100;
                }
            });
        },
        fetchMemInfo() {
            XhrFetch.get(`${window.config.dsApiRoot}/sys_monitor/mem_info`, res => {
                if (res.data) {
                    // 转换内存单位（KB 转 GB）
                    const total: string = (parseInt(res.data.total) / (1024 * 1024)).toFixed(2) + 'GB';
                    const free: string = (parseInt(res.data.free) / (1024 * 1024)).toFixed(2) + 'GB';
                    const used: number = (parseInt(res.data.total) - parseInt(res.data.free)) / (1024 * 1024);
                    const usedGB: string = used.toFixed(2) + 'GB';
                    const usePercent: number = used / (parseInt(res.data.total) / (1024 * 1024));

                    this.data.memoryInfo = { total, used: usedGB, free, usePercent };
                }
            });
        }
    },
    mounted(): void {
        this.refreshData();
    }
}
</script>

<style scoped>
.holder,
h2,
table {
    margin: 15px auto;
    width: 100% !important;
}

table {
    border: 1px lightgray solid;
    border-collapse: collapse;
    border-spacing: 0;
}

td {
    padding: 8px 18px;
    border: 1px lightgray solid;
    line-height: 160%;
    height: 120%;
}

.list>div {
    display: inline-block;
    width: 24%;
    margin-right: 1%;
}

.circle>div {
    display: inline-block;
    width: 33.3%;
    text-align: center;
}

.name {
    background-color: #e9e9e9;
    width: 15%;
}

.value {
    width: 30%;
    font-weight: bold;
}
</style>
