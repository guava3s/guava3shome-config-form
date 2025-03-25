import {defineConfig} from "vuepress/config";

export default defineConfig({
    title: '高度定制化的表单处理机器',
    themeConfig: {
        lastUpdated: '最后更新时间',
        nav: [
            {text: '指南', link: '/guide/'},
            {text: '赞助', link: 'https://google.com'},
            {
                text: '0.8',
                items: [
                    {text: 'v0.8', link: '/guide/'}
                ]
            },
            {
                text: '',
                ariaLabel: 'Language Menu',
                link: '/language.svg',
                items: [
                    {text: '简体中文', link: '/language/chinese/'},
                    {text: 'English', link: '/language/japanese/'}
                ]
            }
        ]
    }
});
