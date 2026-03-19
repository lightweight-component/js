<template>
  <div class="aj-form-calendar">
    <div class="selectYearMonth">
      <a href="###" @click="getDate('preYear', null)" class="preYear" title="上一年"> &#171; <!-- &lt; --></a>
      <select @change="setMonth" v-model="month">
        <option value="1">一月</option>
        <option value="2">二月</option>
        <option value="3">三月</option>
        <option value="4">四月</option>
        <option value="5">五月</option>
        <option value="6">六月</option>
        <option value="7">七月</option>
        <option value="8">八月</option>
        <option value="9">九月</option>
        <option value="10">十月</option>
        <option value="11">十一月</option>
        <option value="12">十二月</option>
      </select>
      <a href="###" @click="getDate('nextYear', null)" class="nextYear" title="下一年"> &#187;<!-- &gt; --> </a>
    </div>
    <div class="showCurrentYearMonth">
      <span class="showYear">{{ year }}</span>/<span class="showMonth">{{ month }}</span>
    </div>
    <table>
      <thead>
        <tr>
          <td>日</td>
          <td>一</td>
          <td>二</td>
          <td>三</td>
          <td>四</td>
          <td>五</td>
          <td>六</td>
        </tr>
      </thead>
      <tbody @click="pickDay"></tbody>
    </table>
    <div v-if="showTime" class="showTime">
      时 <select class="hour aj-select">
        <option v-for="n in 24" :key="n">{{ n }}</option>
      </select>
      分 <select class="minute aj-select">
        <option v-for="n in 61" :key="n">{{ n - 1 }}</option>
      </select>
      <a href="#" @click="pickupTime">选择时间</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * 日期选择器
 */
export default defineComponent({
  name: 'Calendar',
  // template: `
  //   <div ref="root">
  //     <table>
  //       <thead>
  //         <!-- 省略表头 -->
  //       </thead>
  //       <tbody ref="tbody"></tbody>
  //     </table>
  //     <!-- 时间选择器的 HTML -->
  //   </div>`,
  props: {
    showTime: Boolean // 是否显示时间，即“时分秒”
  },
  data() {
    const date: Date = new Date;

    return {
      date: date as Date,
      year: date.getFullYear() as number,
      month: date.getMonth() + 1 as number,
      day: 1 as number,
    };
  },
  mounted(): void {
    // @ts-ignore
    this.$options.watch.date.call(this);
  },
  watch: {
    date(): void {
      this.year = this.date.getFullYear();
      this.month = this.date.getMonth() + 1;
      this.render();
    }
  },
  methods: {
    /**
     * 画日历
     */
    render(): void {
      const arr: number[] = this.getDateArr(),// 用来保存日期列表
        frag: DocumentFragment = document.createDocumentFragment();// 插入日期

      while (arr.length) {
        const row: HTMLTableRowElement = document.createElement("tr"); // 每个星期插入一个 tr

        for (let i = 1; i <= 7; i++) { // 每个星期有7天
          const cell: HTMLTableCellElement = document.createElement("td");

          if (arr.length) {
            const d: number | undefined = arr.shift();

            if (d) {
              const text: string = this.year + '-' + this.month + '-' + d;
              cell.title = text;  // 保存日期在 title 属性
              cell.className = 'day day_' + text;
              cell.innerHTML = d + "";

              const on: Date = new Date(this.year, this.month - 1, d);

              // 判断是否今日
              if (isSameDay(on, this.date)) {
                cell.classList.add('onToday');
                // this.onToday && this.onToday(cell);// 点击 今天 时候触发的事件
              }
              // 判断是否选择日期
              // this.selectDay && this.onSelectDay && this.isSameDay(on, this.selectDay) && this.onSelectDay(cell);
            }
          }

          row.appendChild(cell);
        }

        frag.appendChild(row);
      }

      // // 先清空内容再插入
      const tbody: HTMLElement = this.$el.querySelector("table tbody") as HTMLElement;
      tbody.innerHTML = '';
      tbody.appendChild(frag);
    },

    /**
     * 获取指定的日期
     * 
     * @param dateType 
     * @param month 
     */
    getDate(dateType: 'preMonth' | 'nextMonth' | 'setMonth' | 'preYear' | 'nextYear', month: number | null): void {
      const nowYear: number = this.date.getFullYear(),
        nowMonth: number = this.date.getMonth() + 1; // 当前日期

      switch (dateType) {
        case 'preMonth':// 上一月
          this.date = new Date(nowYear, nowMonth - 2, 1);
          break;
        case 'nextMonth':// 下一月
          this.date = new Date(nowYear, nowMonth, 1);
          break;
        case 'setMonth':// 指定月份
          this.date = new Date(nowYear, month || 0 - 1, 1);
          break;
        case 'preYear':// 上一年
          this.date = new Date(nowYear - 1, nowMonth - 1, 1);
          break;
        case 'nextYear':// 下一年
          this.date = new Date(nowYear + 1, nowMonth - 1, 1);
          break;
      }
    },

    /**
     * 
     * 
     * @param querySelectoreven
     */
    setMonth(ev: Event): void {
      const el: HTMLSelectElement = ev.target as HTMLSelectElement;
      this.getDate('setMonth', Number(el.selectedOptions[0].value));
    },

    /**
     * 获取空白的非上月天数 + 当月天数
     * 
     * @param this 
     */
    getDateArr(): number[] {
      const arr: number[] = [];

      // 算出这个月1号距离前面的星期天有多少天
      for (let i = 1, firstDay: number = new Date(this.year, this.month - 1, 1).getDay(); i <= firstDay; i++)
        arr.push(0);

      // 这个月有多少天。用上个月然后设置日子参数为 0，就可以得到本月有多天
      for (let i = 1, monthDay: number = new Date(this.year, this.month, 0).getDate(); i <= monthDay; i++)
        arr.push(i);

      return arr;
    },

    /**
     * 获取日期
     * 
     * @param event 
     */
    pickDay(ev: Event): string {
      const el: HTMLElement = ev.target as HTMLElement, date: string = el.title;
      this.$emit('pickdate', date);

      return date;
    },
    pickupTime(event: Event): void {
      const hour: HTMLSelectElement = this.$el.querySelector('.hour') as HTMLSelectElement,
        minute: HTMLSelectElement = this.$el.querySelector('.minute') as HTMLSelectElement,
        time = hour.selectedOptions[0].value + ':' + minute.selectedOptions[0].value;

      this.$emit('pick-time', time);
    }
  }
});

/**
  * 判断两个日期是否同一日
  * 
  * @param d1 
  * @param d2 
  */
function isSameDay(d1: Date, d2: Date): boolean {
  return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
}
</script>

<style lang="less" src="./Calendar.less"></style>