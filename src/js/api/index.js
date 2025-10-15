import axios from 'axios'
import { getEnv } from '@/js/functions.js'

function createApi(baseUrl) {
    return axios.create({
        baseURL: baseUrl,
        withCredentials: true,
        timeout: 2000
    })
}

export const authApi = createApi(`${getEnv('AUTH_URL')}/web`)
export const crmApi = createApi(`${getEnv('CRM_URL')}`)
