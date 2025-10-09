import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import mkcert from "vite-plugin-mkcert";


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '') // load all env variables, even without VITE_

    return {
        plugins: [
            vue(),
            vueDevTools(),
            mkcert(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
        server: {
            https: true,
            host: '0.0.0.0', // important for Docker
            port: 5173
        },
        define: {
            __ENV__: JSON.stringify(env) // global __ENV__ with all env variables
        }
    }
})
