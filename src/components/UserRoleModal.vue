<template>
    <el-dialog
        v-model="visible"
        :title="`Change roles for ${user.name}`"
        width="500px"
        @close="$emit('close')"
    >
        <div v-if="roles.length">
            <el-checkbox-group v-model="selectedRoles">
                <el-checkbox
                    v-for="role in visibleRoles"
                    :key="role"
                    :label="role"
                >
                    {{ formatRole(role) }}
                </el-checkbox>
            </el-checkbox-group>
        </div>
        <div v-else>
            <el-skeleton :rows="3" animated />
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="$emit('close')">Cancel</el-button>
                <el-button type="primary" @click="save">Save</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { authApi } from '@/js/api/index.js'
import { ElNotification } from 'element-plus'

const props = defineProps({
    user: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const visible = ref(true)
const roles = ref([])
const selectedRoles = ref([])

// Role hierarchy definition
const roleHierarchy = {
    ROLE_ADMIN: ['ROLE_WEB_USER', 'ROLE_API_USER', 'ROLE_USER'],
    ROLE_WEB_USER: ['ROLE_USER'],
    ROLE_API_USER: ['ROLE_USER'],
}

// Hide base role from UI
const visibleRoles = computed(() => roles.value.filter(r => r !== 'ROLE_USER'))

onMounted(() => {
    // Fetch available roles from backend
    authApi
        .get(`/users/roles`)
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

            // Expected response: ["ROLE_ADMIN","ROLE_WEB_USER","ROLE_API_USER","ROLE_USER"]
            roles.value = body.data || []
            selectedRoles.value = props.user.roles || []
        })
        .catch(() => {
            // Mock data fallback
            roles.value = ['ROLE_ADMIN', 'ROLE_WEB_USER', 'ROLE_API_USER', 'ROLE_USER']
            selectedRoles.value = props.user.roles || []
        })
})

// Watch for role changes and apply cascading selection logic
watch(selectedRoles, (newRoles, oldRoles) => {
    const hasAdmin = newRoles.includes('ROLE_ADMIN')
    const hasWeb = newRoles.includes('ROLE_WEB_USER')
    const hasApi = newRoles.includes('ROLE_API_USER')

    // CASE 1: All 3 were selected, and one child (Web or API) was removed → remove Admin
    const hadAllThreeBefore =
        oldRoles.includes('ROLE_ADMIN') &&
        oldRoles.includes('ROLE_WEB_USER') &&
        oldRoles.includes('ROLE_API_USER')

    const nowMissingOneChild =
        hadAllThreeBefore &&
        (!newRoles.includes('ROLE_WEB_USER') || !newRoles.includes('ROLE_API_USER'))

    if (nowMissingOneChild) {
        selectedRoles.value = selectedRoles.value.filter(r => r !== 'ROLE_ADMIN')
        return
    }

    // CASE 2: Admin selected → add both Web and API
    if (hasAdmin) {
        if (!hasWeb) selectedRoles.value.push('ROLE_WEB_USER')
        if (!hasApi) selectedRoles.value.push('ROLE_API_USER')
        return
    }

    // CASE 3: Web + API selected → add Admin
    if (hasWeb && hasApi && !hasAdmin) {
        selectedRoles.value.push('ROLE_ADMIN')
        return
    }

    // CASE 4: Admin was manually removed → leave Web/API as is (do nothing)
})



// Format role name for display
function formatRole(role) {
    return role
        .replace('ROLE_', '')
        .replace('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Save updated roles to backend
function save() {
    // Always include ROLE_USER in payload
    const rolesToSave = Array.from(new Set([...selectedRoles.value, 'ROLE_USER']))

    authApi
        .put(`/users/${props.user.id}/roles`, {
            roles: rolesToSave,
        })
        .then((response) => {
            const body = response.data
            if (body.success === true) {
                ElNotification({
                    title: 'Success',
                    message: `Roles for ${props.user.name} updated successfully.`,
                    type: 'success',
                    duration: 2000,
                })

                emit('updated')
                console.log('[UserRoleModal] emitted updated')
            } else {
                ElNotification({
                    title: 'Error',
                    message: body.message || 'Failed to save user roles.',
                    type: 'error',
                })
            }
        })
        .catch((error) => {
            ElNotification({
                title: 'Error',
                message: 'Failed to save user roles.',
                type: 'error',
            })
        })
        .finally(() => {
            emit('close')
        })
}

</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
