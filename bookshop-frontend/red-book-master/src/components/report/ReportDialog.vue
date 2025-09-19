<template>
  <div class="report-dialog" v-show="isVisible">
    <div class="report-content" @click.stop>
      <div class="report-header">
        <span class="title">举报内容</span>
        <span class="close" @click="close">×</span>
      </div>
      <div class="report-body">
        <el-input v-model="reportReason" type="textarea" :rows="4" placeholder="请输入举报理由..." maxlength="200"
          show-word-limit resize="none" />
      </div>
      <div class="report-footer">
        <el-button type="danger" @click="submitReport" :disabled="!reportReason.trim()" class="submit-btn">
          提交举报
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import reportApi from '../../api/reportApi';

const props = defineProps({
  isVisible: Boolean,
  contentType: String,
  targetId: [String, Number],
  reportContentId: [String, Number],
  reporterId: [String, Number],
  extraData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);
const reportReason = ref('');

// 添加 watch 来监控 isVisible
watch(() => props.isVisible, (newVal) => {
  console.log('Dialog visibility changed:', newVal);
});

const close = () => {
  reportReason.value = '';
  emit('close');
};

const submitReport = async () => {
  try {
    await reportApi.submitReport({
      content_type: props.contentType,
      target_id: props.targetId,
      report_content_id: props.reportContentId,
      reporter_id: props.reporterId,
      report_reason: reportReason.value,
      ...props.extraData
    });

    ElMessage.success('举报已提交');
    close();
  } catch (error) {
    ElMessage.error('举报提交失败');
    console.error('举报失败:', error);
  }
};
</script>

<style scoped>
.report-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
  backdrop-filter: blur(3px);
}

.report-content {
  background-color: white;
  width: 400px;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  z-index: 10002;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease-out;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.report-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.report-header .close {
  cursor: pointer;
  font-size: 22px;
  color: #999;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.report-header .close:hover {
  color: #FF2E4D;
  background-color: #fff1f3;
}

.report-body {
  margin-bottom: 24px;
}

.report-body :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  border-color: #e4e7ed;
  transition: all 0.3s;
}

.report-body :deep(.el-textarea__inner:focus) {
  border-color: #FF2E4D;
  box-shadow: 0 0 0 2px rgba(255, 46, 77, 0.1);
}

.report-body :deep(.el-textarea__inner:hover) {
  border-color: #FF2E4D;
}

.report-footer {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 100px;
  background-color: #FF2E4D !important;
  border-color: #FF2E4D !important;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #ff4d66 !important;
  border-color: #ff4d66 !important;
  box-shadow: 0 4px 12px rgba(255, 46, 77, 0.2);
}

.submit-btn:active {
  background-color: #e62945 !important;
  border-color: #e62945 !important;
}

.submit-btn[disabled] {
  background-color: #ffa5b3 !important;
  border-color: #ffa5b3 !important;
  box-shadow: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>