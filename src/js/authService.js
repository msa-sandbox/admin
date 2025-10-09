import { authApi, setAccessToken } from './api.js'

export async function login(email, password) {
    const response = await authApi.post('/login', { email, password })

    console.log(response)

    setAccessToken(response.data.token)

    return response.data
}

export async function logout() {
    await authApi.post('/logout')

    setAccessToken(null)
}

export async function refreshToken() {
    const response = await authApi.post('/refresh')
    setAccessToken(response.data.token)

    return response.data
}

export async function refreshAccessToken() {
    const response = await authApi.post('/refresh', {}, { withCredentials: true })
    const token = response.data.token
    setAccessToken(token)
    return token
}
