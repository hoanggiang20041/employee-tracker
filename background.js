// filepath: ~\Desktop\tool\background.js
// Background script cho extension
let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let startTime = null;

// Khởi tạo trạng thái từ storage khi extension khởi động
async function initializeFromStorage() {
  try {
    const result = await chrome.storage.local.get(['isTracking', 'employeeId', 'employeeName', 'startTime']);
    if (result.isTracking) {
      isTracking = result.isTracking;
      currentEmployeeId = result.employeeId;
      currentEmployeeName = result.employeeName;
      startTime = result.startTime;
      console.log('📊 Khôi phục trạng thái từ storage:', { isTracking, currentEmployeeId, currentEmployeeName, startTime });
      updateBadge();
    }
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục từ storage:', error);
  }
}

// Lưu trạng thái vào storage
async function saveToStorage() {
  try {
    await chrome.storage.local.set({
      isTracking,
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      startTime
    });
    console.log('💾 Đã lưu trạng thái vào storage');
  } catch (error) {
    console.error('❌ Lỗi khi lưu vào storage:', error);
  }
}

// Lắng nghe message từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Nhận message:', request);
  
  if (request.action === 'startTracking') {
    isTracking = true;
    currentEmployeeId = request.employeeId;
    currentEmployeeName = request.employeeName;
    startTime = new Date().toISOString();
    
    saveToStorage();
    updateBadge();
    
    console.log('▶️ Bắt đầu tracking:', { currentEmployeeId, currentEmployeeName, startTime });
    sendResponse({ success: true });
  }
  
  if (request.action === 'stopTracking') {
    isTracking = false;
    currentEmployeeId = null;
    currentEmployeeName = null;
    startTime = null;
    
    // Xóa khỏi storage
    chrome.storage.local.remove(['isTracking', 'employeeId', 'employeeName', 'startTime']);
    
    updateBadge();
    console.log('⏹️ Dừng tracking');
    sendResponse({ success: true });
  }
  
  if (request.action === 'getStatus') {
    const response = {
      isTracking,
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      startTime
    };
    console.log('📊 Trả về trạng thái:', response);
    sendResponse(response);
  }
  
  if (request.action === 'validateEmployee') {
    // Validate employee ID và name
    const { employeeId, employeeName } = request;
    const isValid = validateEmployee(employeeId, employeeName);
    console.log('🔍 Validate employee:', { employeeId, employeeName, isValid });
    sendResponse({ isValid });
  }
});

// Validate employee ID và name
function validateEmployee(employeeId, employeeName) {
  if (!employeeId || !employeeName) {
    return false;
  }
  
  // Kiểm tra format employee ID (ví dụ: NV001, EMP001, etc.)
  const idPattern = /^(NV|EMP|E)\d{3,6}$/i;
  if (!idPattern.test(employeeId.trim())) {
    return false;
  }
  
  // Kiểm tra tên nhân viên (ít nhất 2 ký tự)
  if (employeeName.trim().length < 2) {
    return false;
  }
  
  return true;
}

// Cập nhật badge khi có thay đổi
function updateBadge() {
  if (isTracking) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    chrome.action.setTitle({ title: `Đang theo dõi: ${currentEmployeeName} (${currentEmployeeId})` });
  } else {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Employee Tracker - Chưa theo dõi' });
  }
}

// Khởi tạo khi extension khởi động
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Extension khởi động');
  initializeFromStorage();
});

// Khởi tạo khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 Extension được cài đặt');
  initializeFromStorage();
});

// Khởi tạo ngay lập tức
initializeFromStorage();