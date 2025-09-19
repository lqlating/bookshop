import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@/api/modules/usersApi'

export const useUsersStore = defineStore('users', () => {
  const userList = ref([])
  const loading = ref(false)

  const getUsers = async (params: any) => {
    loading.value = true
    try {
      const res = await usersApi.getList(params)
      userList.value = res.data
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, data: any) => {
    await usersApi.update(id, data)
    await getUsers({})
  }

  const deleteUser = async (id: number) => {
    await usersApi.delete(id)
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