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

                <el-table-column label="Role">
                    <template #default="{ row }">
                        <el-tag
                            :type="row.role === 'admin' ? 'danger' : 'success'"
                        >
                            {{ row.role }}
                        </el-tag>
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
                            Change role
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <UserRoleModal
            v-if="selectedUser"
            :user="selectedUser"
            @close="selectedUser = null"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '@/js/api.js'
import UserRoleModal from './UserRoleModal.vue'

const users = ref([])
const selectedUser = ref(null)

onMounted(() => {
    authApi
        .get('/users')
        .then((response) => {
            users.value = response.data
        })
        .catch(() => {
            users.value = [
                { id: 1, name: 'Alice', role: 'admin' },
                { id: 2, name: 'Bob', role: 'user' },
            ]
        })
})

function openRoleModal(user) {
    selectedUser.value = user
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
</style>
