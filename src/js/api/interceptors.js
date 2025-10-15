import axios from 'axios'

let accessToken = null
let isRefreshing = false
let refreshPromise = null

export function setAccessToken(token) {
    accessToken = token
}

export function attachAuthInterceptors(apiInstance, refreshFn) {
    const rawApi = axios.create({
        baseURL: apiInstance.defaults.baseURL,
        withCredentials: true
    })

    // Add X-Requested-With header
    function addCSRFHeader(config) {
        if (
            config.method === 'post' &&
            ['/refresh', '/logout', '/login'].some(path => config.url.endsWith(path))
        ) {
            config.headers['X-Requested-With'] = 'XMLHttpRequest'
        }
    }

    apiInstance.interceptors.request.use((config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        addCSRFHeader(config)
        return config
    })

    // Add CSRF-хедер in rawApi also (refresh is POST as well)
    rawApi.interceptors.request.use((config) => {
        addCSRFHeader(config)
        return config
    })

    apiInstance.interceptors.response.use(
        res => res,
        async (error) => {
            const original = error.config

            // If it was already a request to refresh token, reject it
            if (original.url.endsWith('/refresh')) {
                return Promise.reject(error)
            }

            if (error.response?.status === 401 && !original._retry) {
                original._retry = true

                if (!isRefreshing) {
                    isRefreshing = true
                    refreshPromise = refreshFn(rawApi)
                        .then(token => {
                            setAccessToken(token)
                            isRefreshing = false
                            return token
                        })
                        .catch(err => {
                            isRefreshing = false
                            accessToken = null
                            throw err
                        })
                }

                const newToken = await refreshPromise
                original.headers.Authorization = `Bearer ${newToken}`
                return apiInstance(original)
            }

            return Promise.reject(error)
        }
    )
}

