// filepath: ~\Desktop\tool\background.js
// Background script cho extension
let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let startTime = null;

// Khởi tạo trạng thái từ server khi extension khởi động
async function initializeFromServer() {
  try {
    console.log('🔄 Khởi tạo từ server...');
    
    // Lấy session từ server
    const sessionResponse = await fetch('https://employee-tracker-2np8.onrender.com/employee-session');
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      if (sessionData.employeeId && sessionData.employeeName) {
        currentEmployeeId = sessionData.employeeId;
        currentEmployeeName = sessionData.employeeName;
        console.log('✅ Loaded session from server:', sessionData);
      }
    }
    
    // Lấy tracking status từ server
    const trackingResponse = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status');
    if (trackingResponse.ok) {
      const trackingData = await trackingResponse.json();
      if (trackingData.isTracking) {
        isTracking = true;
        startTime = trackingData.startTime;
        console.log('✅ Loaded tracking status from server:', trackingData);
      }
    }
    
    updateBadge();
    console.log('📊 Khôi phục trạng thái từ server:', { isTracking, currentEmployeeId, currentEmployeeName, startTime });
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục từ server:', error);
  }
}

// Lưu trạng thái vào server
async function saveToServer() {
  try {
    const trackingData = {
      isTracking,
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      startTime
    };
    
    const response = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData)
    });
    
    if (response.ok) {
      console.log('💾 Đã lưu trạng thái vào server');
    } else {
      console.error('❌ Lỗi khi lưu vào server');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lưu vào server:', error);
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
    
    saveToServer();
    updateBadge();
    
    console.log('▶️ Bắt đầu tracking:', { currentEmployeeId, currentEmployeeName, startTime });
    sendResponse({ success: true });
  }
  
  if (request.action === 'stopTracking') {
    isTracking = false;
    currentEmployeeId = null;
    currentEmployeeName = null;
    startTime = null;
    
    // Xóa tracking status khỏi server
    fetch('https://employee-tracker-2np8.onrender.com/tracking-status', {
      method: 'DELETE'
    }).catch(error => {
      console.error('❌ Lỗi khi xóa tracking status:', error);
    });
    
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
  
  if (request.action === 'saveStatus') {
    const { status } = request;
    isTracking = status.isTracking;
    currentEmployeeId = status.employeeId;
    currentEmployeeName = status.employeeName;
    startTime = status.startTime;
    
    saveToServer();
    updateBadge();
    
    console.log('💾 Đã lưu trạng thái:', status);
    sendResponse({ success: true });
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
  initializeFromServer();
});

// Khởi tạo khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 Extension được cài đặt');
  initializeFromServer();
});

// Khởi tạo ngay lập tức
initializeFromServer();