<template>
  <div class="users-container">
    <h2>用户管理</h2>
    <DataList :normal-data="bannedUsers" :pending-data="[]" :reported-data="reportedUsers" :show-pending="false"
      default-active-tab="reported" content-type="user">
      <template #default="{ row }">
        <el-table-column prop="user_id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="report_count" label="被举报次数" width="120" />
        <el-table-column prop="report_reason" label="举报原因" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag type="danger" v-if="scope.row.is_banned === 1">已封禁</el-tag>
            <el-tag type="warning" v-else>被举报</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleView(scope.row)">
              查看
            </el-button>
            <template v-if="scope.row.is_banned === 0">
              <el-button size="small" type="danger" @click="openBanDialog(scope.row)">
                封禁
              </el-button>
            </template>
            <template v-else>
              <el-button size="small" type="warning" @click="handleUnban(scope.row)">
                解封
              </el-button>
            </template>
          </template>
        </el-table-column>
      </template>
    </DataList>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户详情" width="500px">
      <div v-if="selectedUser" class="user-detail">
        <div class="user-header">
          <div class="user-avatar" v-if="selectedUser.avatar_base64">
            <img :src="`data:image/jpeg;base64,${selectedUser.avatar_base64}`" alt="用户头像">
          </div>
          <div class="user-avatar avatar-placeholder" v-else></div>
          <div class="user-info">
            <h3>{{ selectedUser.username }}</h3>
            <p>账号: {{ selectedUser.account }}</p>
            <p>邮箱: {{ selectedUser.email }}</p>
          </div>
        </div>
        <div class="user-body">
          <p><strong>性别:</strong> {{ selectedUser.gender || '未设置' }}</p>
          <p><strong>简介:</strong> {{ selectedUser.introduction || '无' }}</p>
          <p><strong>粉丝数:</strong> {{ selectedUser.fans || '0' }}</p>
          <p><strong>订阅数:</strong> {{ selectedUser.subscript || '0' }}</p>
          <p v-if="selectedUser.report_reason"><strong>举报原因:</strong> {{ selectedUser.report_reason }}</p>
          <p v-if="selectedUser.report_count"><strong>被举报次数:</strong> {{ selectedUser.report_count }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <template v-if="selectedUser && selectedUser.is_banned === 0">
            <el-button type="danger" @click="openBanDialog(selectedUser)">封禁用户</el-button>
          </template>
          <template v-else-if="selectedUser">
            <el-button type="warning" @click="handleUnban(selectedUser)">解封用户</el-button>
          </template>
        </span>
      </template>
    </el-dialog>

    <!-- 封禁天数选择弹窗 -->
    <el-dialog v-model="banDialogVisible" title="设置封禁时长" width="400px">
      <div class="ban-form">
        <p>您正在对用户 <strong>{{ userToBan?.username }}</strong> 进行封禁</p>
        <el-form :model="banForm" label-width="100px">
          <el-form-item label="封禁天数">
            <el-select v-model="banForm.banDays" placeholder="请选择封禁天数">
              <el-option label="1天" :value="1" />
              <el-option label="3天" :value="3" />
              <el-option label="7天" :value="7" />
              <el-option label="15天" :value="15" />
              <el-option label="30天" :value="30" />
              <el-option label="永久封禁" :value="9999" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="banDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBan">确认封禁</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import DataList from '../components/DataList.vue'
import { ElMessage } from 'element-plus'
import { useReportsStore } from '@/store/reports'
import userApi from '@/api/modules/userApi'
import reportApi from '@/api/modules/reportApi'

// 定义类型
interface ReportItem {
  report_id: number
  report_content_id: number
  report_reason: string
  reporter_id?: number
}

// 存储用户数据
const reportedUsers = ref<any[]>([])
const bannedUsers = ref<any[]>([])
const loading = ref(false)
const reportsStore = useReportsStore()

// 用户详情弹窗
const dialogVisible = ref(false)
const selectedUser = ref<any>(null)

// 封禁弹窗
const banDialogVisible = ref(false)
const userToBan = ref<any>(null)
const banForm = reactive({
  banDays: 7
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取被举报用户
    await reportsStore.getUserReports()
    const userReports = reportsStore.userReports as ReportItem[]
    console.log('获取到的举报数据:', userReports)

    // 为每个被举报用户获取详细信息
    const reportedUsersDetails = []
    for (const report of userReports) {
      if (!report.report_content_id) continue

      try {
        const userRes = await userApi.SearchUserById(report.report_content_id)
        console.log('用户详情:', userRes)

        if (userRes.data?.data?.length > 0) {
          const userDetail = userRes.data.data[0]

          // 只添加未被封禁的用户到被举报列表
          if (userDetail.is_banned === 0) {
            reportedUsersDetails.push({
              ...userDetail,
              user_id: userDetail.id,  // 确保id字段映射正确
              report_reason: report.report_reason,
              report_count: 1,  // 默认为1, 后续可能根据需要计算
              report_id: report.report_id,
              status: '被举报'
            })
          }
        }
      } catch (error) {
        console.error(`获取用户详情失败, ID=${report.report_content_id}:`, error)
      }
    }

    // 更新被举报用户列表
    reportedUsers.value = reportedUsersDetails
    console.log('处理后的被举报用户:', reportedUsers.value)

    // 获取已封禁用户
    try {
      const bannedRes = await userApi.getBannedUsers()
      console.log('已封禁用户数据:', bannedRes)

      if (bannedRes.data?.data) {
        // 处理已封禁用户数据
        bannedUsers.value = bannedRes.data.data.map((user: any) => ({
          ...user,
          user_id: user.id,  // 确保id字段映射正确
          status: '已封禁',
          is_banned: 1
        }))
      }
    } catch (error) {
      console.error('获取封禁用户失败:', error)
      ElMessage.error('获取封禁用户失败')
    }

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查看用户详情
const handleView = async (row: any) => {
  console.log('查看用户:', row)
  selectedUser.value = row
  dialogVisible.value = true
}

// 打开封禁用户弹窗
const openBanDialog = (row: any) => {
  userToBan.value = row
  banForm.banDays = 7 // 默认设置为7天
  banDialogVisible.value = true
}

// 确认封禁
const confirmBan = async () => {
  if (!userToBan.value) return

  try {
    loading.value = true
    // 调用封禁API，传入封禁天数
    await userApi.banUser(userToBan.value.user_id || userToBan.value.id, banForm.banDays)

    // 显示成功消息，包含封禁天数
    const message = banForm.banDays === 9999
      ? `已永久封禁用户: ${userToBan.value.username}`
      : `已封禁用户: ${userToBan.value.username}，封禁时长: ${banForm.banDays}天`

    ElMessage.success(message)

    // 如果是从举报列表中封禁，需要处理举报
    if (userToBan.value.report_id) {
      try {
        // 删除举报记录
        await reportApi.deleteReport(userToBan.value.report_id)
      } catch (error) {
        console.error('删除举报记录失败:', error)
      }
    }

    // 重新获取数据
    await fetchData()

    // 关闭弹窗
    banDialogVisible.value = false
    if (dialogVisible.value) {
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('封禁用户失败:', error)
    ElMessage.error('封禁用户失败')
  } finally {
    loading.value = false
  }
}

// 解封用户
const handleUnban = async (row: any) => {
  try {
    loading.value = true
    // 调用解封API
    await userApi.unbanUser(row.user_id || row.id)
    ElMessage.success(`已解封用户: ${row.username}`)

    // 立即从已封禁列表中移除该用户
    bannedUsers.value = bannedUsers.value.filter(user => user.user_id !== (row.user_id || row.id))

    // 关闭弹窗
    if (dialogVisible.value) {
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('解封用户失败:', error)
    ElMessage.error('解封用户失败')
    // 如果失败，重新获取数据
    await fetchData()
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(fetchData)
</script>

<style scoped>
.users-container {
  min-height: calc(100vh - 40px);
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 4px;
  background-color: #409eff;
  border-radius: 2px;
}

:deep(.el-button) {
  margin: 0 4px;
}

:deep(.el-tag) {
  margin: 0 4px;
}

/* 用户详情样式 */
.user-detail {
  padding: 0 10px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  background-color: #e0e0e0;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.user-info p {
  margin: 5px 0;
  color: #606266;
}

.user-body p {
  margin: 10px 0;
  line-height: 1.5;
}

/* 封禁表单样式 */
.ban-form {
  padding: 0 20px;
}

.ban-form p {
  margin-bottom: 20px;
  font-size: 16px;
}
</style>
