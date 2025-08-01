// Content script cho Facebook tracking - Tối ưu phiên bản
console.log('🚀 Content script đã được nạp trên Facebook!');

let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let lastCommentTime = 0;
let pendingComments = new Map();

// Load tracking status từ localStorage
function loadTrackingStatusFromStorage() {
  try {
    const stored = localStorage.getItem('employee_tracker_status');
    if (stored) {
      const status = JSON.parse(stored);
      isTracking = status.isTracking || false;
      currentEmployeeId = status.employeeId || null;
      currentEmployeeName = status.employeeName || null;
      console.log('📥 Loaded tracking status:', { isTracking, currentEmployeeId, currentEmployeeName });
    }
  } catch (error) {
    console.error('❌ Lỗi load tracking status:', error);
  }
}

// Save tracking status
function saveTrackingStatusToStorage() {
  try {
    const status = { isTracking, currentEmployeeId, currentEmployeeName };
    localStorage.setItem('employee_tracker_status', JSON.stringify(status));
    console.log('💾 Saved tracking status:', status);
  } catch (error) {
    console.error('❌ Lỗi save tracking status:', error);
  }
}

// Kiểm tra trạng thái tracking
async function checkTrackingStatus() {
  try {
    if (!chrome.runtime || !chrome.runtime.id) {
      console.log('⚠️ Extension context không hợp lệ, sử dụng cache');
      return isTracking;
    }
    
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    isTracking = response.isTracking;
    currentEmployeeId = response.employeeId;
    currentEmployeeName = response.employeeName;
    
    saveTrackingStatusToStorage();
    return isTracking;
  } catch (error) {
    console.error('❌ Lỗi kiểm tra tracking status:', error);
    return isTracking;
  }
}

// Gửi comment đến server
async function sendComment(comment) {
  if (!isTracking || !currentEmployeeId) {
    console.log('⚠️ Không đang tracking hoặc chưa có employee ID');
    return;
  }
  
  // Tránh duplicate trong 3 giây
  const now = Date.now();
  if (now - lastCommentTime < 3000) {
    console.log('⚠️ Bỏ qua comment duplicate');
    return;
  }
  lastCommentTime = now;
  
  try {
    console.log('📤 Gửi comment:', comment.substring(0, 50));
    
    const response = await fetch('https://employee-tracker-2np8.onrender.com/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: currentEmployeeId,
        employeeName: currentEmployeeName,
        comment: comment.trim(),
        time: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log('✅ Gửi comment thành công');
    } else {
      console.error('❌ Lỗi gửi comment:', response.status);
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối server:', error);
  }
}

// Tìm comment box - Tối ưu
function findCommentBox() {
  const selectors = [
    '[contenteditable="true"][role="textbox"]',
    '[contenteditable="true"][data-testid*="composer"]',
    '[contenteditable="true"][data-testid*="comment"]',
    '[contenteditable="true"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.offsetParent !== null && 
          element.style.display !== 'none' && 
          element.style.visibility !== 'hidden') {
        return element;
      }
    }
  }
  return null;
}

// Tìm submit button - Tối ưu
function findSubmitButton() {
  const selectors = [
    '[aria-label="Comment"]',
    '[aria-label="Post"]',
    '[data-testid*="submit"]',
    '[data-testid*="post"]',
    'button[type="submit"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.offsetParent !== null && 
          element.style.display !== 'none' && 
          !element.disabled) {
        return element;
      }
    }
  }
  return null;
}

// Lấy nội dung comment - Tối ưu
function getCommentContent(element) {
  if (!element) return '';
  
  // Thử nhiều cách
  let content = element.innerText || element.textContent || '';
  
  // Nếu không có, tìm trong child elements
  if (!content.trim()) {
    const textElements = element.querySelectorAll('*');
    for (const el of textElements) {
      if (el.textContent && el.textContent.trim()) {
        content = el.textContent;
        break;
      }
    }
  }
  
  return content.trim();
}

// Lưu comment đang chờ gửi
function savePendingComment(comment, commentBox) {
  const commentId = Date.now();
  pendingComments.set(commentId, {
    comment: comment,
    commentBox: commentBox,
    timestamp: Date.now()
  });
  console.log('💾 Lưu comment đang chờ:', comment.substring(0, 50));
  return commentId;
}

// Xử lý comment khi nhấn Enter
async function handleEnterComment(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    const isTracking = await checkTrackingStatus();
    if (!isTracking) return;
    
    setTimeout(() => {
      const active = document.activeElement;
      if (active && active.getAttribute('contenteditable') === 'true') {
        const comment = getCommentContent(active);
        if (comment) {
          console.log('💬 Phát hiện Enter:', comment.substring(0, 50));
          // Lưu vào pending, sẽ gửi khi click submit
          savePendingComment(comment, active);
        }
      }
    }, 100);
  }
}

// Xử lý comment khi click submit
async function handleSubmitComment(event) {
  const submitButton = findSubmitButton();
  if (!submitButton) return;
  
  const isSubmitButton = event.target === submitButton || 
                        submitButton.contains(event.target) ||
                        event.target.closest('[aria-label="Comment"]') ||
                        event.target.closest('[aria-label="Post"]');
  
  if (isSubmitButton) {
    const isTracking = await checkTrackingStatus();
    if (!isTracking) return;
    
    setTimeout(() => {
      // Thử lấy comment từ pending trước
      if (pendingComments.size > 0) {
        const latestPending = Array.from(pendingComments.values()).pop();
        console.log('📤 Gửi comment từ pending:', latestPending.comment.substring(0, 50));
        sendComment(latestPending.comment);
        pendingComments.clear();
      } else {
        // Nếu không có pending, thử lấy từ comment box
        const commentBox = findCommentBox();
        if (commentBox) {
          const comment = getCommentContent(commentBox);
          if (comment) {
            console.log('💬 Comment qua Submit:', comment.substring(0, 50));
            sendComment(comment);
          }
        }
      }
    }, 200);
  }
}

// Xử lý paste - Chỉ lưu vào pending, không gửi ngay
async function handlePaste(event) {
  const isTracking = await checkTrackingStatus();
  if (!isTracking) return;
  
  const activeElement = document.activeElement;
  if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
    setTimeout(() => {
      const comment = getCommentContent(activeElement);
      if (comment) {
        console.log('📋 Phát hiện paste:', comment.substring(0, 50));
        // Chỉ lưu vào pending, không gửi ngay
        savePendingComment(comment, activeElement);
      }
    }, 100);
  }
}

// Kiểm tra block comment
async function checkBlockComment() {
  const blockSelectors = [
    '[data-testid="block-notification"]',
    '[aria-label*="block"]',
    '[aria-label*="khóa"]',
    '.block-notification'
  ];
  
  for (const selector of blockSelectors) {
    const blockElement = document.querySelector(selector);
    if (blockElement) {
      console.log('🚫 Phát hiện block comment');
      
      // Tìm link gỡ block
      const unblockLink = document.querySelector('a[href*="help/contact"]') || 
                         document.querySelector('a[href*="571927962827151"]');
      
      if (unblockLink) {
        console.log('🔗 Mở trang gỡ block...');
        window.open(unblockLink.href, '_blank');
      }
      break;
    }
  }
}

// Setup observers
function setupObservers() {
  // Keydown listener
  document.addEventListener('keydown', handleEnterComment);
  
  // Click listener
  document.addEventListener('click', handleSubmitComment);
  
  // Paste listener
  document.addEventListener('paste', handlePaste);
  
  // Block checker
  setInterval(async () => {
    const isTracking = await checkTrackingStatus();
    if (isTracking) {
      await checkBlockComment();
    }
  }, 30000);
  
  // Status checker
  setInterval(checkTrackingStatus, 5000);
  
  // Timer để gửi comment pending sau 15 giây
  setInterval(async () => {
    const isTracking = await checkTrackingStatus();
    if (isTracking && pendingComments.size > 0) {
      const latestPending = Array.from(pendingComments.values()).pop();
      const timeSincePending = Date.now() - latestPending.timestamp;
      
      // Gửi comment nếu đã chờ quá 15 giây
      if (timeSincePending > 15000) {
        console.log('⏰ Gửi comment pending sau 15 giây:', latestPending.comment.substring(0, 50));
        sendComment(latestPending.comment);
        pendingComments.clear();
      }
    }
  }, 5000); // Kiểm tra mỗi 5 giây
}

// Khởi tạo
loadTrackingStatusFromStorage();
setupObservers();
checkTrackingStatus();

console.log('🚀 Content script đã sẵn sàng!');