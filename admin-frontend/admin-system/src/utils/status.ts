import type { Status } from '@/types'

export const getStatusColor = (status: Status) => {
  const colorMap = {
    normal: 'success',
    pending: 'warning',
    reported: 'danger'
  }
  return colorMap[status]
}

export const getStatusText = (status: Status) => {
  const textMap = {
    normal: '正常',
    pending: '待审核',
    reported: '已举报'
  }
  return textMap[status]
}
