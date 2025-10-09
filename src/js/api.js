import axios from 'axios'
import { getEnv } from "@/js/functions.js";

// Base API instance
export const authApi = axios.create({
    baseURL: `${getEnv('AUTH_URL')}/web`,
    withCredentials: true,  // allow sending cookies (refresh_id)
    timeout: 2000
})

// store JWT in memory
let accessToken = null

export function setAccessToken(token) {
    accessToken = token
}

export function getAccessToken() {
    return accessToken
}

// attach access token to each request
authApi.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

// auto-refresh if access token expired
let isRefreshing = false
let refreshPromise = null

authApi.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and we haven't tried refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            // avoid parallel refresh requests
            if (!isRefreshing) {
                isRefreshing = true
                refreshPromise = authApi.post('/refresh')
                    .then((res) => {
                        const newToken = res.data.token
                        setAccessToken(newToken)
                        isRefreshing = false

                        return newToken
                    })
                    .catch((err) => {
                        isRefreshing = false
                        accessToken = null

                        throw err
                    })
            }

            // wait for token and retry request
            const newToken = await refreshPromise
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            return authApi(originalRequest)
        }

        return Promise.reject(error)
    }
)

