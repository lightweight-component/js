<template>
  <div class="aj-form-calendar-input" :class="{'show-time': showTime}" @mouseover="onMouseOver">
    <div class="icon fa fa-calendar"></div>
    <input :placeholder="placeholder" size="12" :name="fieldName" :value="date + (dateOnly ? '' : ' ' + time)" type="text" autocomplete="off" />
    <aj-form-calendar ref="calendar" :show-time="showTime" @pick-date="recEvent" @pick-time="recTimeEvent">
    </aj-form-calendar>
  </div>
</template>

<script lang="ts">
/**
 * 帶有 input 輸入框的
 */
export default {
  data() {
    return {
      date: this.fieldValue,
      time: "",
    };
  },
  props: {
    fieldName: { type: String, required: true }, // 表单 name，字段名
    fieldValue: { type: String, required: false, default: "" },
    dateOnly: { type: Boolean, required: false, default: true }, // 是否只处理日期，不考虑时间
    showTime: { type: Boolean, required: false, default: false },
    positionFixed: Boolean, // 是否采用固定定位
    placeholder: { type: String, default: "请输入日期" }, // 提示文字
  },
  watch: {
    fieldValue(n: string): void {
      this.date = n;
    },
  },
  mounted(): void {
    if (this.positionFixed) {
      let el: HTMLElement = this.$el.$(".aj-form-calendar") as HTMLElement;
      el.classList.add("positionFixed");
    }

    // 2012-07-08
    // firefox中解析 new Date('2012/12-23') 不兼容，提示invalid date 无效的日期
    // Chrome下可以直接将其格式化成日期格式，且时分秒默认为零
    // var arr = date.split('-'), now = new Date(arr[0], arr[1] - 1, arr[2],
    // " ", "", " ");
    if (this.fieldValue) {
      let arr: string = this.fieldValue.split(" ")[0],
        _arr = arr.split("-");
      // @ts-ignore xxxx
      this.$refs.calendar.date = new Date(arr[0], arr[1] - 1, arr[2], " ", ""," ");
    }
  },
  methods: {
    recTimeEvent(time: string): void {
      this.time = time;
    },
    recEvent(date: string): void {
      this.date = date.trim();
    },
    onMouseOver(ev: Event): void {
      if (this.positionFixed) {
        let el: HTMLElement = ev.currentTarget as HTMLElement,
          b: DOMRect = el.getBoundingClientRect(),
          c: HTMLElement = this.$el.$(".aj-form-calendar") as HTMLElement;

        c.style.top = b.top + el.clientHeight - 0 + "px";
        c.style.left = b.left - 0 + 0 + "px";
      }
    },
  },
};
</script>