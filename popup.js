console.log('popup.js đã được nạp!');

let timerInterval = null;

// Khởi tạo popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Popup đã load');
  
  // Load thông tin nhân viên đã lưu
  await loadSavedEmployeeInfo();
  
  // Load trạng thái tracking
  await loadTrackingStatus();
  
  // Cập nhật UI
  updateUI();
  
  // Bắt đầu timer nếu đang tracking
  if (isTracking) {
    startTimer();
  }
});

// Load thông tin nhân viên đã lưu
async function loadSavedEmployeeInfo() {
  try {
    // Load từ server
    const response = await fetch('https://employee-tracker-2np8.onrender.com/employee-session');
    if (response.ok) {
      const data = await response.json();
      if (data.employeeId && data.employeeName) {
        document.getElementById('employeeId').value = data.employeeId;
        document.getElementById('employeeName').value = data.employeeName;
        console.log('📥 Loaded employee info from server:', data);
        
        // Lưu lại để đảm bảo persistence
        await saveEmployeeInfo(data.employeeId, data.employeeName);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi load employee info:', error);
  }
}

// Lưu thông tin nhân viên
async function saveEmployeeInfo(employeeId, employeeName) {
  try {
    // Lưu vào server
    const response = await fetch('https://employee-tracker-2np8.onrender.com/employee-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, employeeName })
    });
    
    if (response.ok) {
      console.log('💾 Saved employee info to server');
      
      // Cũng lưu tracking status để đảm bảo persistence
      const trackingResponse = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          isTracking: false,
          startTime: null
        })
      });
      
      if (trackingResponse.ok) {
        console.log('💾 Saved tracking status to server');
      }
    } else {
      console.error('❌ Lỗi khi lưu employee info lên server');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lưu employee info:', error);
  }
}

// Thiết lập validation
function setupValidation() {
  const employeeIdInput = document.getElementById('employeeId');
  const employeeNameInput = document.getElementById('employeeName');
  
  // Real-time validation
  employeeIdInput.addEventListener('input', validateEmployeeId);
  employeeNameInput.addEventListener('input', validateEmployeeName);
  
  // Validate khi blur
  employeeIdInput.addEventListener('blur', validateEmployeeId);
  employeeNameInput.addEventListener('blur', validateEmployeeName);
}

// Validate employee ID format
function validateEmployeeId() {
  const input = document.getElementById('employeeId');
  const validation = document.getElementById('employeeIdValidation');
  const value = input.value.trim();
  
  // Pattern: NV001, EMP001, E001, etc.
  const idPattern = /^(NV|EMP|E)\d{3,6}$/i;
  
  if (!value) {
    input.classList.remove('error');
    validation.textContent = '';
    validation.className = 'validation-message';
    return false;
  }
  
  if (!idPattern.test(value)) {
    input.classList.add('error');
    validation.textContent = '❌ Mã nhân viên không đúng định dạng (VD: NV001, EMP001)';
    validation.className = 'validation-message error';
    return false;
  }
  
  input.classList.remove('error');
  validation.textContent = '✅ Mã nhân viên hợp lệ';
  validation.className = 'validation-message';
  return true;
}

// Validate employee name format
function validateEmployeeName() {
  const input = document.getElementById('employeeName');
  const validation = document.getElementById('employeeNameValidation');
  const value = input.value.trim();
  
  if (!value) {
    input.classList.remove('error');
    validation.textContent = '';
    validation.className = 'validation-message';
    return false;
  }
  
  if (value.length < 2) {
    input.classList.add('error');
    validation.textContent = '❌ Tên nhân viên phải có ít nhất 2 ký tự';
    validation.className = 'validation-message error';
    return false;
  }
  
  if (value.length > 50) {
    input.classList.add('error');
    validation.textContent = '❌ Tên nhân viên quá dài (tối đa 50 ký tự)';
    validation.className = 'validation-message error';
    return false;
  }
  
  input.classList.remove('error');
  validation.textContent = '✅ Tên nhân viên hợp lệ';
  validation.className = 'validation-message';
  return true;
}

// Validate tất cả format
function validateAllFormat() {
  const isIdValid = validateEmployeeId();
  const isNameValid = validateEmployeeName();
  return isIdValid && isNameValid;
}

// Validate nhân viên từ server
async function validateEmployeeFromServer(employeeId, employeeName) {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/validate-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, employeeName })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi khi validate từ server:', error);
    return { isValid: false, message: 'Lỗi kết nối server' };
  }
}

// Cập nhật trạng thái từ background script
async function updateStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    const { isTracking, employeeId, employeeName, startTime } = response;
    
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusDiv = document.getElementById('status');
    const timerDiv = document.getElementById('timer');
    const employeeInfoDiv = document.getElementById('employeeInfo');
    const employeeIdInput = document.getElementById('employeeId');
    const employeeNameInput = document.getElementById('employeeName');
    
    if (isTracking) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      employeeIdInput.value = employeeId || '';
      employeeNameInput.value = employeeName || '';
      employeeIdInput.disabled = true;
      employeeNameInput.disabled = true;
      statusDiv.textContent = 'Đang theo dõi hoạt động...';
      statusDiv.className = 'status success';
      timerDiv.style.display = 'block';
      employeeInfoDiv.style.display = 'block';
      employeeInfoDiv.innerHTML = `
        👤 <strong>${employeeName}</strong><br>
        🆔 <strong>${employeeId}</strong>
      `;
      
      if (startTime) {
        startTimer(new Date(startTime));
      }
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      employeeIdInput.disabled = false;
      employeeNameInput.disabled = false;
      statusDiv.textContent = 'Sẵn sàng theo dõi';
      statusDiv.className = 'status info';
      timerDiv.style.display = 'none';
      employeeInfoDiv.style.display = 'none';
      
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
  }
}

// Bắt đầu timer
function startTimer(startTime) {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    const now = new Date();
    const diff = now - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('timer').textContent = 
      `⏱️ Thời gian: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Nút bắt đầu tracking
document.getElementById('startBtn').onclick = async function() {
  console.log('Đã bấm nút Bắt đầu');
  
  // Validate format trước
  if (!validateAllFormat()) {
    showStatus('Vui lòng nhập đúng định dạng thông tin!', 'error');
    return;
  }
  
  const employeeId = document.getElementById('employeeId').value.trim();
  const employeeName = document.getElementById('employeeName').value.trim();
  
  try {
    // Validate với server
    const validationResult = await validateEmployeeFromServer(employeeId, employeeName);
    
    if (!validationResult.isValid) {
      showStatus(`❌ ${validationResult.message}`, 'error');
      return;
    }
    
    // Lưu thông tin nhân viên
    await saveEmployeeInfo(employeeId, employeeName);
    
    // Gửi message đến background script
    const response = await chrome.runtime.sendMessage({
      action: 'startTracking',
      employeeId: employeeId,
      employeeName: employeeName
    });
    
    if (response.success) {
      // Gửi dữ liệu đến server
      const startTime = new Date().toISOString();
      const serverResponse = await fetch('https://employee-tracker-2np8.onrender.com/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId, 
          employeeName,
          startTime 
        })
      });
      
      if (serverResponse.ok) {
        showStatus('✅ Đã bắt đầu theo dõi!', 'success');
        await updateStatus();
      } else {
        const errorData = await serverResponse.json();
        showStatus(`❌ ${errorData.error || 'Gửi dữ liệu thất bại!'}`, 'error');
      }
    }
  } catch (error) {
    console.error('Lỗi khi bắt đầu tracking:', error);
    showStatus('❌ Lỗi kết nối server!', 'error');
  }
};

// Nút dừng tracking
document.getElementById('stopBtn').onclick = async function() {
  console.log('Đã bấm nút Dừng');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'stopTracking' });
    
    if (response.success) {
      showStatus('⏹️ Đã dừng theo dõi!', 'info');
      await updateStatus();
    }
  } catch (error) {
    console.error('Lỗi khi dừng tracking:', error);
    showStatus('❌ Lỗi khi dừng tracking!', 'error');
  }
};

// Hiển thị status với style
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

// Hàm đăng xuất
async function logout() {
  try {
    // Xóa session trên server
    await fetch('https://employee-tracker-2np8.onrender.com/employee-session', {
      method: 'DELETE'
    });
    
    // Dừng tracking nếu đang chạy
    await chrome.runtime.sendMessage({ action: 'stopTracking' });
    
    // Reset form
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeName').value = '';
    await updateStatus();
    
    showStatus('🚪 Đã đăng xuất', 'info');
  } catch (error) {
    console.error('❌ Lỗi khi đăng xuất:', error);
    showStatus('❌ Lỗi khi đăng xuất', 'error');
  }
}

// Load trạng thái tracking
async function loadTrackingStatus() {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status');
    if (response.ok) {
      const data = await response.json();
      if (data.isTracking) {
        isTracking = true;
        startTime = data.startTime;
        updateUI();
        console.log('📊 Loaded tracking status from server:', data);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi load tracking status:', error);
  }
}

// Lưu trạng thái tracking
async function saveTrackingStatus(status) {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });
    
    if (response.ok) {
      console.log('💾 Saved tracking status to server');
    } else {
      console.error('❌ Lỗi khi lưu tracking status');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lưu tracking status:', error);
  }
}