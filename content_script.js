// Content script cho Facebook tracking
console.log('🚀 Content script đã được nạp trên Facebook!');
console.log('📍 URL hiện tại:', window.location.href);

let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let lastCommentTime = 0; // Tránh duplicate comment

// Kiểm tra trạng thái tracking từ background script
async function checkTrackingStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    isTracking = response.isTracking;
    currentEmployeeId = response.employeeId;
    currentEmployeeName = response.employeeName;
    console.log('📊 Tracking status:', { isTracking, currentEmployeeId, currentEmployeeName });
    
    // Dispatch custom event để debug page có thể lắng nghe
    document.dispatchEvent(new CustomEvent('tracking-status-updated', {
      detail: { isTracking, currentEmployeeId, currentEmployeeName }
    }));
    
    return isTracking;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra trạng thái tracking:', error);
    return false;
  }
}

// Gửi comment đến server
async function sendComment(comment) {
  if (!isTracking || !currentEmployeeId) {
    console.log('⚠️ Không đang tracking hoặc chưa có employee ID');
    return;
  }
  
  // Tránh duplicate comment trong 5 giây
  const now = Date.now();
  if (now - lastCommentTime < 5000) {
    console.log('⚠️ Bỏ qua comment duplicate');
    return;
  }
  lastCommentTime = now;
  
  try {
    console.log('📤 Đang gửi comment:', {
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      comment: comment.substring(0, 100) + (comment.length > 100 ? '...' : ''),
      time: new Date().toISOString()
    });
    
    // Dispatch custom event để debug
    document.dispatchEvent(new CustomEvent('comment-detected', {
      detail: { comment: comment.trim(), employeeId: currentEmployeeId, employeeName: currentEmployeeName }
    }));
    
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
      console.log('✅ Đã gửi comment thành công:', comment.substring(0, 50) + '...');
    } else {
      const errorData = await response.json();
      console.error('❌ Lỗi khi gửi comment:', errorData.error || response.status);
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối server:', error);
  }
}

// Tìm comment box trên Facebook với nhiều selector
function findCommentBox() {
  const selectors = [
    // Post composer
    '[data-testid="post-composer-text-input"]',
    '[data-testid="composer-text-input"]',
    '[contenteditable="true"][data-testid*="composer"]',
    
    // Comment composer
    '[data-testid="comment-composer-text-input"]',
    '[contenteditable="true"][data-testid*="comment"]',
    
    // Generic contenteditable
    '[contenteditable="true"][role="textbox"]',
    '[contenteditable="true"]',
    
    // Facebook specific
    'div[contenteditable="true"][data-testid]',
    'div[contenteditable="true"][aria-label*="comment"]',
    'div[contenteditable="true"][aria-label*="post"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      // Kiểm tra element có visible và focusable không
      if (element.offsetParent !== null && 
          element.style.display !== 'none' && 
          element.style.visibility !== 'hidden') {
        console.log('🔍 Tìm thấy comment box:', selector);
        return element;
      }
    }
  }
  
  console.log('⚠️ Không tìm thấy comment box');
  return null;
}

// Tìm nút gửi comment/post
function findSubmitButton() {
  const selectors = [
    // Post buttons
    '[data-testid="composer-post-button"]',
    '[data-testid="post-composer-submit-button"]',
    '[aria-label="Đăng"]',
    '[aria-label="Post"]',
    
    // Comment buttons
    '[data-testid="comment-composer-submit-button"]',
    '[aria-label="Comment"]',
    '[aria-label="Bình luận"]',
    
    // Generic submit buttons
    'button[type="submit"]',
    'button[data-testid*="submit"]',
    'button[data-testid*="post"]',
    'button[data-testid*="comment"]',
    
    // Facebook specific
    'button[aria-label*="post"]',
    'button[aria-label*="comment"]',
    'button[aria-label*="submit"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.offsetParent !== null && 
          element.style.display !== 'none' && 
          element.style.visibility !== 'hidden' &&
          !element.disabled) {
        console.log('🔍 Tìm thấy submit button:', selector);
        return element;
      }
    }
  }
  
  return null;
}

// Xử lý comment khi nhấn Enter
async function handleEnterComment(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    console.log('⌨️ Phát hiện nhấn Enter');
    
    const isTracking = await checkTrackingStatus();
    if (!isTracking) {
      console.log('⚠️ Không đang tracking, bỏ qua');
      return;
    }
    
    setTimeout(() => {
      const active = document.activeElement;
      if (active && active.getAttribute('contenteditable') === 'true') {
        const comment = active.innerText || active.textContent;
        if (comment && comment.trim().length > 0) {
          console.log('💬 Phát hiện comment qua Enter:', comment.substring(0, 50));
          sendComment(comment);
        }
      }
    }, 100);
  }
}

// Xử lý comment khi click nút gửi
async function handleSubmitComment(event) {
  const submitButton = findSubmitButton();
  if (!submitButton) return;
  
  // Kiểm tra xem click có phải vào submit button không
  const isSubmitButton = event.target === submitButton || 
                        submitButton.contains(event.target) ||
                        event.target.closest('[data-testid*="submit"]') ||
                        event.target.closest('[data-testid*="post"]') ||
                        event.target.closest('[data-testid*="comment"]');
  
  if (isSubmitButton) {
    console.log('🖱️ Phát hiện click nút gửi');
    
    const isTracking = await checkTrackingStatus();
    if (!isTracking) {
      console.log('⚠️ Không đang tracking, bỏ qua');
      return;
    }
    
    setTimeout(async () => {
      // Tìm comment box
      let commentBox = findCommentBox();
      
      if (commentBox) {
        const comment = commentBox.innerText || commentBox.textContent;
        if (comment && comment.trim().length > 0) {
          console.log('💬 Phát hiện comment qua nút gửi:', comment.substring(0, 50));
          sendComment(comment);
        }
      }
    }, 300);
  }
}

// Xử lý comment qua MutationObserver
function setupCommentObserver() {
  console.log('👀 Thiết lập observer cho comment');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Kiểm tra nếu có comment mới được thêm vào
            const commentElements = node.querySelectorAll('[data-testid*="comment"], [data-testid*="post"]');
            commentElements.forEach(async (element) => {
              const isTracking = await checkTrackingStatus();
              if (isTracking && currentEmployeeId) {
                const commentText = element.textContent;
                if (commentText && commentText.trim().length > 10) {
                  console.log('👁️ Phát hiện comment mới qua observer:', commentText.substring(0, 50));
                  // Không gửi ngay, chỉ log để debug
                }
              }
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Xử lý comment qua FormData
function setupFormObserver() {
  console.log('📝 Thiết lập form observer');
  
  // Lắng nghe sự kiện submit form
  document.addEventListener('submit', async (event) => {
    const isTracking = await checkTrackingStatus();
    if (!isTracking) return;
    
    const form = event.target;
    const textInputs = form.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
    
    textInputs.forEach(input => {
      const value = input.value || input.innerText || input.textContent;
      if (value && value.trim().length > 0) {
        console.log('📝 Phát hiện comment qua form submit:', value.substring(0, 50));
        sendComment(value);
      }
    });
  });
}

// Xử lý comment qua Clipboard API
function setupClipboardObserver() {
  console.log('📋 Thiết lập clipboard observer');
  
  // Lắng nghe sự kiện paste
  document.addEventListener('paste', async (event) => {
    const isTracking = await checkTrackingStatus();
    if (!isTracking) return;
    
    const activeElement = document.activeElement;
    if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
      setTimeout(() => {
        const comment = activeElement.innerText || activeElement.textContent;
        if (comment && comment.trim().length > 0) {
          console.log('📋 Phát hiện comment qua paste:', comment.substring(0, 50));
          sendComment(comment);
        }
      }, 500);
    }
  });
}

// Lắng nghe sự kiện nhấn phím
document.addEventListener('keydown', handleEnterComment);

// Lắng nghe sự kiện click
document.addEventListener('click', handleSubmitComment);

// Thiết lập các observer
setupCommentObserver();
setupFormObserver();
setupClipboardObserver();

// Kiểm tra trạng thái tracking định kỳ
setInterval(checkTrackingStatus, 3000);

// Khởi tạo trạng thái ban đầu
checkTrackingStatus();

// Log khi script được load
console.log('🚀 Content script đã sẵn sàng tracking Facebook comments');

// Thêm debug info
console.log('🔧 Debug info:');
console.log('- Facebook URL:', window.location.href);
console.log('- User Agent:', navigator.userAgent);
console.log('- Content editable elements:', document.querySelectorAll('[contenteditable="true"]').length);
console.log('- Submit buttons:', document.querySelectorAll('button[type="submit"]').length);