<template>
    <div>
        <el-card class="box-card">
            <div class="card-header">
                <h2>Users</h2>
                <el-button type="primary">
                    Add User
                </el-button>
            </div>

            <el-table :data="users" style="width: 100%" border stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="Name" />

                <el-table-column label="Roles">
                    <template #default="{ row }">
                        <div class="roles">
                            <el-tag
                                v-for="(role) in row.roles"
                                :type="roleColor(role)"
                                effect="dark"
                                style="margin-right: 4px"
                            >
                                {{ formatRole(role) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="Actions" width="160">
                    <template #default="{ row }">
                        <el-button
                            size="small"
                            type="info"
                            plain
                            @click="openRoleModal(row)"
                        >
                            Change
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <UserPermission
            v-model="dialogVisible"
            :user="selectedUser"
            @updated="loadUsers"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '@/js/api/index.js'
import UserPermission from './UserPermission.vue'

const users = ref([])
const selectedUser = ref(null)
const dialogVisible = ref(false)

onMounted(loadUsers)
function loadUsers() {
    authApi
        .get('/users')
        .then((response) => {
            const body = response.data
            if (body.success === false) {
                ElNotification({
                    title: 'Data fetch error',
                    message: body.message || 'Failed to fetch user data.',
                    type: 'error',
                    duration: 2000,
                })
            }

            users.value = body.data
        })
        .catch((exception) => {
            console.log(exception)
        })
}

function roleColor(role) {
    switch (role) {
        case 'ROLE_ADMIN':
            return 'danger'
        case 'ROLE_WEB_USER':
            return 'success'
        case 'ROLE_API_USER':
            return 'warning'
        case 'ROLE_USER':
            return undefined
        default:
            return 'info'
    }
}

function formatRole(role) {
    return role
        .replace('ROLE_', '')
        .replace('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function openRoleModal(user) {
    selectedUser.value = user
    dialogVisible.value = true
}
</script>

<style scoped>
.box-card {
    margin: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.roles {
    display: flex;
    flex-wrap: wrap;
}
</style>
