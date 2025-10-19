<template>
    <el-dialog
        v-model="visible"
        :title="'Permissions for ' + (props.user?.name || 'User')"
        width="700px"
        @open="getPermissions"
        destroy-on-close
    >
        <div v-loading="loading" style="min-height: 200px;">
            <div class="top">
            <div class="access-section">
                <h4>Access</h4>
                <div class="access-container">
                    <div class="access-row">
                        <div class="access-item">
                            <span>Web</span>
                            <el-switch v-model="crmAccess.web" size="large" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                        </div>
                    </div>

                    <div class="access-row">
                        <div class="access-item">
                            <span>API</span>
                            <el-switch v-model="crmAccess.api" size="large" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                        </div>
                        <div class="api-token-section">
                            <el-input v-model="apiToken" placeholder="No token generated" readonly>
                                <template #prefix v-if="generatingToken">
                                    <el-icon class="is-loading">
                                        <Loading />
                                    </el-icon>
                                </template>
                                <template #append>
                                    <el-button @click="generateToken" :disabled="!crmAccess.api || generatingToken" icon="Refresh">Generate</el-button>
                                    <el-button @click="copyToken" :disabled="!apiToken || !crmAccess.api" icon="CopyDocument">Copy</el-button>
                                </template>
                            </el-input>
                        </div>
                    </div>
                </div>
            </div>

            <div class="permissions-header">
                <h4>Permissions</h4>
                <div class="bulk-actions">
                    <el-button size="small" type="primary" plain @click="selectAll">Select All</el-button>
                    <el-button size="small" type="primary" plain @click="clearAll">Clear All</el-button>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="cards-container">
                <el-card v-for="(card, cardName) in crmCards" :key="card.id">
                    <template #header>
                        <div class="card-header">
                            <span class="card-title">{{ cardName }}</span>
                            <el-switch v-model="card.read" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"/>
                        </div>
                    </template>


                    <div class="card-body" v-if="card.read === true">
                        <div class="card-body-group">
                            <el-checkbox v-model="card.write" label="Write" />
                            <el-checkbox v-model="card.delete" label="Delete" />
                        </div>

                        <div class="card-body-group">
                            <el-checkbox v-model="card.import" label="Import" />
                            <el-checkbox v-model="card.export" label="Export" />
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
        </div>

        <template #footer>
            <div class="card-footer">
                <el-button type="success" size="large" :loading="saving" @click="save">Save</el-button>
            </div>
        </template>

    </el-dialog>
</template>

<script setup>

import { ref } from 'vue'
import { authApi } from '@/js/api/index.js'
import { Loading } from '@element-plus/icons-vue'

const visible = defineModel({ default: false })
const props = defineProps({
    user: { type: Object },
})
const crmCards = ref();
const crmAccess = ref({ web: false, api: false });
const apiToken = ref('');
const loading = ref(false);
const saving = ref(false);
const generatingToken = ref(false);

// const emit = defineEmits('updated'])

function getPermissions() {
    loading.value = true
    // Fetch available getPermissions from the backend
    authApi
        .get(`/user/${props.user.id}/permissions`)
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

            crmCards.value = body.data.crm.permissions
            crmAccess.value = body.data.crm.access
        })
        .catch(() => {
        })
        .finally(() => {
            loading.value = false
        })
}

function save() {
    saving.value = true
    // Prepare data to send
    const data = {
        crm: {
            access: crmAccess.value,
            permissions: crmCards.value
        }
    }

    authApi
        .put(`/user/${props.user.id}/permissions`, data)
        .then((response) => {
            const body = response.data

            if (body.success === false) {
                ElNotification({
                    title: 'Save error',
                    message: body.message || 'Failed to save user permissions.',
                    type: 'error',
                    duration: 2000,
                })
                return
            }

            ElNotification({
                title: 'Success',
                message: 'User permissions updated successfully',
                type: 'success',
                duration: 2000,
            })

            visible.value = false
        })
        .catch(() => {
            ElNotification({
                title: 'Error',
                message: 'Failed to save user permissions',
                type: 'error',
                duration: 2000,
            })
        })
        .finally(() => {
            saving.value = false
        })
}

function selectAll() {
    if (!crmCards.value) return

    Object.keys(crmCards.value).forEach(key => {
        crmCards.value[key].read = true
        crmCards.value[key].write = true
        crmCards.value[key].delete = true
        crmCards.value[key].import = true
        crmCards.value[key].export = true
    })
}

function clearAll() {
    if (!crmCards.value) return

    Object.keys(crmCards.value).forEach(key => {
        crmCards.value[key].read = false
        crmCards.value[key].write = false
        crmCards.value[key].delete = false
        crmCards.value[key].import = false
        crmCards.value[key].export = false
    })
}

function generateToken() {
    generatingToken.value = true
    // Call API to generate token
    authApi
        .post(`/user/${props.user.id}/token`)
        .then((response) => {
            const body = response.data

            if (body.success === false) {
                ElNotification({
                    title: 'Token generation error',
                    message: body.message || 'Failed to generate token.',
                    type: 'error',
                    duration: 2000,
                })
                return
            }

            apiToken.value = body.data.token
            ElNotification({
                title: 'Success',
                message: 'API token generated successfully',
                type: 'success',
                duration: 2000,
            })
        })
        .catch(() => {
            ElNotification({
                title: 'Error',
                message: 'Failed to generate API token',
                type: 'error',
                duration: 2000,
            })
        })
        .finally(() => {
            generatingToken.value = false
        })
}

function copyToken() {
    if (!apiToken.value) return

    navigator.clipboard.writeText(apiToken.value).then(() => {
        ElNotification({
            title: 'Copied',
            message: 'API token copied to clipboard',
            type: 'success',
            duration: 1500,
        })
    })
}



</script>





<style scoped lang="less">

.el-card {
    width: 200px;
    height: 200px;

    :deep(.el-card__header) {
        padding: 10px 12px;
    }

    :deep(.el-card__body) {
        padding: 12px;
    }

    :deep(.el-card__footer) {
        padding: 8px 12px;
    }
}

.card-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    text-transform: capitalize;
}

.card-body {
    display: flex;
    flex-direction: row;

    .card-body-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
    }

    .el-checkbox {
        width: 100%;
    }
}

.card-footer {
    text-align: right;
}

.body {
    margin-bottom: 20px;
}

.cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
}

.top {
    margin-bottom: 20px;
}

.access-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #dcdfe6;

    h4 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
    }

    .access-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .access-row {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    .access-item {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 150px;

        span {
            font-weight: 500;
            min-width: 50px;
        }
    }

    .api-token-section {
        flex: 1;
    }
}

.permissions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
    }

    .bulk-actions {
        display: flex;
        gap: 10px;
    }
}

</style>
