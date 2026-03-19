import Render from "./document-render.vue";
declare const _default: {
    components: {
        Render: import("vue").VueConstructor<Render<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: any[]) => Render<Record<string, any>, Record<string, any>, never, never, any>>>;
    };
    data(): {
        perview: boolean;
        value3: boolean;
        documnetObj: API_HELPER_DOCUMENT;
        styles: {
            height: string;
            overflow: string;
            paddingBottom: string;
            position: string;
        };
        formData: {
            name: string;
            url: string;
            owner: string;
            type: string;
            approver: string;
            date: string;
            desc: string;
        };
    };
    methods: {
        enlagrn(e: Event): void;
        save(): void;
    };
};
export default _default;
