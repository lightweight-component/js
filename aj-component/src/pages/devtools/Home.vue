<template>
  <div>
    <div class="holder">
      <Checkbox v-model="autoRefresh" style="margin-right: 10px;">自动刷新</Checkbox>
      <Button type="primary" @click="refreshData">立即刷新</Button>
    </div>

    <div class="holder circle">
      <div>
        <i-Circle :percent="Math.round(data.cupInfo.usePercent * 100)" :size="180">
          <span class="demo-Circle-inner" style="font-size:24px">{{ Math.round(data.cupInfo.usePercent * 100) }}%
            <br />
            <span style="font-size:16px">CPU</span>
          </span>
        </i-Circle>
      </div>
      <div>
        <i-Circle :percent="Math.round(data.memoryInfo.usePercent * 100)" :size="180">
          <span class="demo-Circle-inner" style="font-size:24px">{{ Math.round(data.memoryInfo.usePercent * 100) }}%
            <br />
            <span style="font-size:16px">内存</span>
          </span>
        </i-Circle>
      </div>
      <div>
        <i-Circle :percent="Math.round(data.diskUsePercent)" :size="180">
          <span class="demo-Circle-inner" style="font-size:24px">{{ Math.round(data.diskUsePercent) }}%
            <br />
            <span style="font-size:16px">磁盘</span>
          </span>
        </i-Circle>
      </div>
    </div>
    <br />
    <br />
    <h2>磁盘状态</h2>
    <div class="holder list">
      <div v-for="(disk, index) in data.diskInfo" :key="index">
        {{ disk.mount }}
        <Progress :percent="Math.round(disk.usePercent)" />
        {{ disk.avail }} 可用，共 {{ disk.size }}
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

    <h2>处理器信息</h2>
    <table>
      <tr>
        <td class="name">物理处理器数量</td>
        <td class="value"> {{ data.cupInfo.physicalProcessorCount }}</td>
        <td class="name">逻辑处理器数量</td>
        <td class="value">{{ data.cupInfo.logicalProcessorCount }}</td>
      </tr>
      <tr>
        <td class="name">系统使用率</td>
        <td class="value"> {{ (data.cupInfo.systemPercent * 100) + '%' }}</td>
        <td class="name">用户使用率</td>
        <td class="value">{{ (data.cupInfo.userPercent * 100) + '%' }}</td>
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
        <td class="value">{{ Math.round(data.jvmInfo.usePercent * 100) }}%</td>
      </tr>
      <tr>
        <td class="name">启动时间</td>
        <td class="value"> {{ new Date(data.jvmInfo.startTime) }}</td>
        <td class="name">安装路径</td>
        <td class="value">{{ data.jvmInfo.jdkHome }}</td>
      </tr>
    </table>
  </div>
</template>


<script lang="ts">
import { XhrFetch } from '@ajaxjs/util';

export default {
  data() {
    return {
      data: {
        cupInfo: {},
        memoryInfo: {},
        sysInfo: {},
        jvmInfo: {},
        diskInfo: [],
        diskUsePercent: 0
      },
      autoRefresh: true,
      refreshInterval: undefined as number | undefined
    }
  },
  mounted(): void {
    this.refreshData();
    this.startAutoRefresh();
  },
  watch: {
    autoRefresh(newVal) {
      if (newVal) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
  },
  methods: {
    refreshData(): void {
      XhrFetch.get(`http://localhost:8080/system_info`, res => {
        if (res.data) {
          this.data = res.data;
        }
      });
    },
    startAutoRefresh() {
      if (!this.refreshInterval)
        //@ts-ignore
        this.refreshInterval = setInterval(() => { this.refreshData(); }, 3000);
    },
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = undefined;
      }
    }
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