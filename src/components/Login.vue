<template>
    <div class="login-container">
        <el-card class="login-card" shadow="hover">
            <h2 class="title">Admin Login</h2>

            <el-form @submit.prevent="handleLogin" label-position="top">
                <el-form-item label="Email">
                    <el-input v-model="email" placeholder="Enter your email" />
                </el-form-item>

                <el-form-item label="Password">
                    <el-input
                        v-model="password"
                        type="password"
                        placeholder="Enter your password"
                    />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" :loading="loading" native-type="submit" @click="handleLogin" block>
                        Login
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/js/authService.js'
import { ElNotification } from 'element-plus'

const email = ref('')
const password = ref('')
const loading = ref(false)

const emit = defineEmits(['logged-in'])

async function handleLogin() {
    loading.value = true
    try {
        await login(email.value, password.value)
        ElNotification({
            title: 'Welcome',
            message: 'You have successfully logged in!',
            type: 'success',
        })
        emit('logged-in') // tell parent that login succeeded
    } catch (e) {
        ElNotification({
            title: 'Login failed',
            message: e.response?.data?.error || 'Invalid email or password',
            type: 'error',
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

.login-card {
    width: 380px;
    padding: 20px;
    border-radius: 12px;
    margin-top: 20vh;
}

.title {
    text-align: center;
    margin-bottom: 20px;
    font-weight: 600;
}
</style>
