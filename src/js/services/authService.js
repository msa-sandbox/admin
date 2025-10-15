import authApi from '@/js/api/authApi.js'
import { setAccessToken } from '@/js/api/interceptors.js'

export async function login(email, password) {
    const { data } = await authApi.post('/login', { email, password })
    setAccessToken(data.token)
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
    return token
}
