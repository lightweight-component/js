"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_render_vue_1 = __importDefault(require("./document-render.vue"));
// import { xhr_post_upload } from "../../../util/xhr";
//@ts-ignore
// import FileUploader from "./../../../widget/FileUploader/FileUploader.vue";
exports.default = {
    components: {
        Render: document_render_vue_1.default,
        // FileUploader 
    },
    data() {
        return {
            perview: false,
            value3: false,
            documnetObj: {
                name: "解锁任务中所有的飞机",
                description: "把 空闲、解锁失败的进行解锁",
                httpMethod: "GET",
                url: "/uav/{uav_id}/check_status",
                demoUrl: "http://test.ajaxjs.com:8081/drone/uav/10001/check_status",
                codeState: "DEFINED",
                isShow: true,
            },
            styles: {
                height: "calc(100% - 55px)",
                overflow: "auto",
                paddingBottom: "53px",
                position: "static",
            },
            formData: {
                name: "",
                url: "",
                owner: "",
                type: "",
                approver: "",
                date: "",
                desc: "",
            },
        };
    },
    methods: {
        enlagrn(e) {
            let img = e.target;
            img.classList.toggle("small");
        },
        save() {
            // xhr_post_upload("", (j) => {}, {}, { contentType: null });
        },
    },
};
//# sourceMappingURL=document.js.map