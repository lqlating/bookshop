import { defineStore } from 'pinia'
import { ref } from 'vue'
import userApi from '@/api/modules/userApi'

export const useUsersStore = defineStore('users', () => {
  const userList = ref([])
  const loading = ref(false)

  const getUsers = async (params: any) => {
    loading.value = true
    try {
      // 使用 userApi 的方法，需要根据实际 API 调整
      const res = await userApi.SearchUserByUsername(params?.username || '')
      userList.value = res.data?.data || []
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, data: any) => {
    await userApi.editUser({ ...data, id })
    await getUsers({})
  }

  const deleteUser = async (id: number) => {
    await userApi.DeleteUser(id)
    await getUsers({})
  }

  return {
    userList,
    loading,
    getUsers,
    updateUser,
    deleteUser
  }
}) 