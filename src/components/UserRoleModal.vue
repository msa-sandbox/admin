<template>
    <el-dialog
        v-model="visible"
        :title="`Change role for ${user.name}`"
        width="500px"
        @close="$emit('close')"
    >
        <div v-if="roles.length">
            <el-radio-group v-model="selectedRole">
                <el-radio
                    v-for="role in roles"
                    :key="role"
                    :label="role"
                >
                    {{ role }}
                </el-radio>
            </el-radio-group>
        </div>
        <div v-else>
            Loading roles...
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

import { ref } from 'vue'
import { authApi } from '@/js/api.js'

const props = defineProps({ user: Object })
const emit = defineEmits(['close'])

const visible = ref(true)
const roles = ref([])
const selectedRole = ref(null)

authApi
    .get(`/users/${props.user.id}/roles`)
    .then((response) => {
        roles.value = response.data
        selectedRole.value = props.user.role
    })
    .catch(() => {
        roles.value = ['admin', 'user', 'guest']

        // Mock data if API is not available
        selectedRole.value = props.user.role
    })

function save() {
    console.log(`Saving role ${selectedRole.value} for user ${props.user.id}`)
    emit('close')
}

</script>
