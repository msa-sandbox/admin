import { authApi } from './index.js'
import { attachAuthInterceptors } from './interceptors.js'
import { refreshAccessTokenRaw } from '@/js/services/authService.js'

attachAuthInterceptors(authApi, refreshAccessTokenRaw)
export default authApi
