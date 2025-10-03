import axios from 'axios'
import { getEnv } from "@/js/functions.js";

// Base API instance
export const authApi = axios.create({
    baseURL: getEnv('AUTH_URL'),
    timeout: 2000
})
