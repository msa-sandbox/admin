<template>
    <div class="app">
        <header class="app-header" v-if="isLoggedIn">
            <h1>Admin Panel</h1>
            <el-button type="danger" plain @click="handleLogout">
                Logout
            </el-button>
        </header>

        <main class="app-content">
            <Login v-if="!isLoggedIn" @logged-in="isLoggedIn = true" />
            <UserList v-else />
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import UserList from './components/UserList.vue'
import { logout, refreshAccessToken } from '@/js/authService.js'
import { ElNotification } from 'element-plus'

const isLoggedIn = ref(false)
const loading = ref(true) // show spinner while loading

onMounted(async () => {
    try {
        await refreshAccessToken() // get new access_token
        isLoggedIn.value = true
    } catch (e) {
        // Refresh failed — user is not authenticated
        isLoggedIn.value = false
    } finally {
        loading.value = false
    }
})

async function handleLogout() {
    await logout()
    ElNotification({
        title: 'Logged out',
        message: 'You have been logged out successfully.',
        type: 'info',
    })
    isLoggedIn.value = false
}
</script>

<style lang="less" scoped>
.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f6fa;
    color: #2f3640;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 10px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.app-content {
    flex: 1;
    padding: 20px;
}
</style>
