<!-- 调整正文字体大小 -->
<template>
    <div class="aj-adjust-font-size">
        <span>字体大小</span>
        <ul @click="onClk">
            <li><label><input type="radio" name="fontSize" /> 小</label></li>
            <li><label><input type="radio" name="fontSize" /> 中</label></li>
            <li><label><input type="radio" name="fontSize" /> 大</label></li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'aj-adjust-font-size',
    props: {
        articleTarget: { type: String, default: "article p" }, // 正文所在的位置，通过 CSS Selector 定位
    },
    methods: {
        onClk(ev) {
            let el = ev.target;
            let setFontSize = (fontSize) => {
                document.body.querySelectorAll(this.$props.articleTarget).forEach((p) => (p.style.fontSize = fontSize));
            };

            if (el.tagName == "LABEL" || el.tagName == "INPUT") {
                if (el.tagName != "LABEL") el = el.parentNode;

                if (el.innerHTML.indexOf("大") != -1) setFontSize("14pt");
                else if (el.innerHTML.indexOf("中") != -1) setFontSize("10.5pt");
                else if (el.innerHTML.indexOf("小") != -1) setFontSize("9pt");
            }
        }
    }
};
</script>

<style lang="less" scoped>
.aj-adjust-font-size {
    width: 180px;
    font-size: 0.8rem;
    padding: 10px;
    float: right;
    background-color: #e3e3e3;
    border-radius: 5px;

    span {
        float: left;
        width: 35%;
        display: block;
    }

    ul {
        width: 65%;
        float: right;
        margin: 0;
        padding: 0;

        li {
            input {
                vertical-align: top;
            }

            cursor: pointer;
            display: block;
            float: right;
            width: 33%;
        }
    }
}
</style>
