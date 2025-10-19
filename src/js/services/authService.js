import authApi from '@/js/api/authApi.js'
import { setAccessToken } from '@/js/api/interceptors.js'

export async function login(email, password) {
    const { data } = await authApi.post('/login', { email, password })
    setAccessToken(data.token)
    // scheduleTokenRefresh(() => authApi.post('/refresh'), data.ttl)
    return data
}

export async function logout() {
    await authApi.post('/logout')
    setAccessToken(null)
}

export async function refreshAccessTokenRaw(rawApi) {
    const { data } = await rawApi.post('/refresh')
    return data.token
}

export async function refreshAccessToken() {
    const token = await refreshAccessTokenRaw(authApi)
    setAccessToken(token)
    // scheduleTokenRefresh(() => authApi.post('/refresh'), data.ttl)
    return token
}


// Let's try to make a refresh token before it is expired.
// For this we need to schedule a refresh token request before the token expires.
// As a backup we also have an interceptor that will handle 401 responses.
let refreshTimer = null

export function scheduleTokenRefresh(refreshFn, ttl) {
    // Clear any existing timer
    if (refreshTimer) {
        clearTimeout(refreshTimer)
    }

    // Refresh token 30 seconds before it expires
    const refreshDelay = Math.max(0, (ttl - 30) * 1000)

    refreshTimer = setTimeout(() => {
        refreshFn()
    }, refreshDelay)
}
