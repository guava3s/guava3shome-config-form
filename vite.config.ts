import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

export default defineConfig({
    plugins: [
        vue(),
    ],
    // resolve: {
    //     alias: {
    //         'vue': 'vue/dist/vue.esm-bundler.js' // 包含编译器的构建版本
    //     }
    // },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true, // 允许混合 CommonJS 和 ESM 模块
        },
        lib: {
            entry: resolve(__dirname, './lib/index.ts'),
            name: 'g3-config-form',
            fileName: (format) => `g3-config-form.${format}.js`
        },
        cssCodeSplit: true,
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ['vue'],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue'
                }
            }
        },
    },
})
