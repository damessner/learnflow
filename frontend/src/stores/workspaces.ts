import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref([])
  const currentWorkspace = ref(null)
  const loading = ref(false)

  async function fetchWorkspaces(classId) {
    const query = classId ? `?class_id=${encodeURIComponent(classId)}` : ''
    const data = await api.get(`/workspaces${query}`)
    workspaces.value = data.workspaces || []
  }

  async function fetchWorkspace(id) {
    const data = await api.get(`/workspaces/${id}`)
    currentWorkspace.value = data
    return data
  }

  async function createWorkspace(payload) {
    const data = await api.post('/workspaces', payload)
    return data.workspace
  }

  async function updateWorkspace(id, payload) {
    const data = await api.put(`/workspaces/${id}`, payload)
    return data.workspace
  }

  async function deleteWorkspace(id) {
    await api.del(`/workspaces/${id}`)
  }

  async function addItem(workspaceId, payload) {
    return api.post(`/workspaces/${workspaceId}/items`, payload)
  }

  async function removeItem(workspaceId, itemId) {
    return api.del(`/workspaces/${workspaceId}/items/${itemId}`)
  }

  async function reorderItems(workspaceId, itemIds) {
    return api.put(`/workspaces/${workspaceId}/items/reorder`, { itemIds })
  }

  return {
    workspaces,
    currentWorkspace,
    loading,
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addItem,
    removeItem,
    reorderItems,
  }
})
