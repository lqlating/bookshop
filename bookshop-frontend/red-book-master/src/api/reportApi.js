import axiosInstance from './axiosInstance';

const reportApi = {
  // 提交举报
  submitReport(reportData) {
    return axiosInstance.post('/addReport', reportData);
  }
};

export default reportApi; 