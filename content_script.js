// Content script cho Facebook comment tracking - Hoàn toàn độc lập
console.log('🚀 Content script đã load');

// Biến global để lưu trạng thái
let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let startTime = null;
let lastCommentTime = 0;
let commentCount = 0;

// Khởi tạo từ server khi load
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
    } else {
      console.log('⚠️ Không có session, cần đăng nhập từ popup');
    }
    
    // Lấy tracking status từ server
    const trackingResponse = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status');
    if (trackingResponse.ok) {
      const trackingData = await trackingResponse.json();
      if (trackingData.isTracking) {
        isTracking = true;
        startTime = trackingData.startTime;
        currentEmployeeId = trackingData.employeeId;
        currentEmployeeName = trackingData.employeeName;
        console.log('✅ Loaded tracking status from server:', trackingData);
      }
    }
    
    console.log('📊 Khôi phục trạng thái từ server:', { isTracking, currentEmployeeId, currentEmployeeName, startTime });
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục từ server:', error);
  }
}

// Lưu trạng thái tracking lên server
async function saveTrackingStatus(status) {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });
    
    if (response.ok) {
      console.log('💾 Đã lưu tracking status lên server');
    } else {
      console.error('❌ Lỗi khi lưu tracking status');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lưu tracking status:', error);
  }
}

// Gửi activity lên server
async function sendActivity(activity) {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    
    if (response.ok) {
      console.log('✅ Đã gửi activity:', activity.type);
    } else {
      console.error('❌ Lỗi khi gửi activity');
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi activity:', error);
  }
}

// Gửi comment lên server
async function sendComment(comment) {
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    
    if (response.ok) {
      console.log('✅ Đã gửi comment:', comment.content.substring(0, 50) + '...');
      
      // Tăng số lượng comment
      commentCount++;
      
      // Hiển thị thông báo
      showNotification(`💬 ${currentEmployeeName} đã comment (${commentCount})`, comment.content.substring(0, 100));
      
      // Gửi activity comment
      await sendActivity({
        employeeId: currentEmployeeId,
        employeeName: currentEmployeeName,
        type: 'comment',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        details: `Comment #${commentCount}: ${comment.content.substring(0, 50)}...`
      });
    } else {
      console.error('❌ Lỗi khi gửi comment');
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi comment:', error);
  }
}

// Hiển thị thông báo
function showNotification(title, message) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 300px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
  `;
  
  // Thêm CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Tự động ẩn sau 5 giây
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Kiểm tra trạng thái tracking
async function checkTrackingStatus() {
  // Kiểm tra local state trước
  if (isTracking && currentEmployeeId && currentEmployeeName) {
    return true;
  }
  
  // Nếu local state không có, thử lấy từ server
  try {
    const response = await fetch('https://employee-tracker-2np8.onrender.com/tracking-status');
    if (response.ok) {
      const data = await response.json();
      if (data.isTracking && data.employeeId && data.employeeName) {
        isTracking = true;
        currentEmployeeId = data.employeeId;
        currentEmployeeName = data.employeeName;
        startTime = data.startTime;
        console.log('🔄 Khôi phục tracking status từ server:', data);
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra tracking status:', error);
  }
  
  console.log('📊 Tracking status:', { isTracking, currentEmployeeId, currentEmployeeName });
  return false;
}

// Lấy nội dung comment từ element
function getCommentContent(element) {
  if (!element) return '';
  
  // Thử nhiều cách để lấy nội dung
  let content = '';
  
  // Cách 1: Lấy từ data-lexical-text-content
  const lexicalContent = element.getAttribute('data-lexical-text-content');
  if (lexicalContent) {
    content = lexicalContent;
  }
  
  // Cách 2: Lấy từ innerText
  if (!content) {
    content = element.innerText || element.textContent || '';
  }
  
  // Cách 3: Lấy từ các span con
  if (!content) {
    const spans = element.querySelectorAll('span');
    content = Array.from(spans).map(span => span.textContent).join(' ').trim();
  }
  
  // Cách 4: Lấy từ div[contenteditable]
  if (!content) {
    const editableDiv = element.querySelector('div[contenteditable="true"]');
    if (editableDiv) {
      content = editableDiv.innerText || editableDiv.textContent || '';
    }
  }
  
  // Cách 5: Lấy từ tất cả text nodes
  if (!content) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node.textContent.trim());
      }
    }
    content = textNodes.join(' ').trim();
  }
  
  return content.trim();
}

// Xử lý comment submit
async function handleCommentSubmit(commentElement, submitButton) {
  const isTracking = await checkTrackingStatus();
  if (!isTracking) {
    console.log('❌ Không đang tracking hoặc chưa có thông tin nhân viên');
    return;
  }
  
  const content = getCommentContent(commentElement);
  if (!content) {
    console.log('❌ Không tìm thấy nội dung comment');
    return;
  }
  
  // Tránh duplicate trong 3 giây
  const now = Date.now();
  if (now - lastCommentTime < 3000) {
    console.log('⚠️ Bỏ qua comment duplicate');
    return;
  }
  lastCommentTime = now;
  
  console.log('📝 Tìm thấy comment:', content.substring(0, 50) + '...');
  
  const commentData = {
    employeeId: currentEmployeeId,
    employeeName: currentEmployeeName,
    content: content,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    postUrl: window.location.href
  };
  
  await sendComment(commentData);
}

// Tìm và theo dõi comment boxes
function setupCommentTracking() {
  // Các selector cho comment boxes
  const commentSelectors = [
    'div[contenteditable="true"][data-lexical-editor="true"]',
    'div[contenteditable="true"]',
    '[data-testid="comment-composer"] div[contenteditable="true"]',
    '[aria-label="Write a comment"]',
    '[placeholder*="comment"]',
    '[placeholder*="Comment"]'
  ];
  
  // Các selector cho submit buttons
  const submitSelectors = [
    '[aria-label="Comment"]',
    '[data-testid="comment-composer-submit"]',
    'button[type="submit"]',
    'input[type="submit"]',
    '[role="button"]'
  ];
  
  commentSelectors.forEach(selector => {
    const commentElements = document.querySelectorAll(selector);
    commentElements.forEach(commentElement => {
      if (commentElement.dataset.tracked) return; // Đã track rồi
      
      commentElement.dataset.tracked = 'true';
      console.log('🎯 Đã track comment element:', selector);
      
      // Tìm submit button gần nhất
      let submitButton = null;
      let parent = commentElement.parentElement;
      
      while (parent && !submitButton) {
        submitSelectors.forEach(submitSelector => {
          const button = parent.querySelector(submitSelector);
          if (button && button.offsetParent !== null) { // Button visible
            submitButton = button;
          }
        });
        parent = parent.parentElement;
      }
      
      if (submitButton) {
        console.log('🔍 Tìm thấy submit button:', submitButton);
        
        // Lắng nghe sự kiện submit
        submitButton.addEventListener('click', async (e) => {
          console.log('🖱️ Submit button clicked');
          // Delay để đảm bảo comment đã được nhập
          setTimeout(() => {
            handleCommentSubmit(commentElement, submitButton);
          }, 200);
        });
        
        // Lắng nghe Enter key
        commentElement.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            console.log('⌨️ Enter pressed');
            e.preventDefault();
            // Delay để đảm bảo comment đã được nhập
            setTimeout(() => {
              handleCommentSubmit(commentElement, submitButton);
            }, 200);
          }
        });
        
        // Lắng nghe input events để capture paste
        commentElement.addEventListener('input', async (e) => {
          console.log('📝 Input event detected');
          // Lưu comment tạm thời
          const content = getCommentContent(commentElement);
          if (content) {
            console.log('💾 Comment content:', content.substring(0, 50) + '...');
          }
        });
        
        // Lắng nghe paste events
        commentElement.addEventListener('paste', async (e) => {
          console.log('📋 Paste event detected');
          // Delay để đảm bảo paste đã hoàn thành
          setTimeout(() => {
            const content = getCommentContent(commentElement);
            if (content) {
              console.log('📋 Pasted content:', content.substring(0, 50) + '...');
            }
          }, 100);
        });
      }
    });
  });
}

// Theo dõi DOM changes để tìm comment boxes mới
const observer = new MutationObserver((mutations) => {
  let shouldCheck = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Kiểm tra nếu có comment box mới
          const hasCommentBox = node.querySelector && (
            node.querySelector('div[contenteditable="true"]') ||
            node.querySelector('[data-testid="comment-composer"]') ||
            node.querySelector('[aria-label="Write a comment"]')
          );
          
          if (hasCommentBox) {
            shouldCheck = true;
          }
        }
      });
    }
  });
  
  if (shouldCheck) {
    setTimeout(setupCommentTracking, 100);
  }
});

// Khởi tạo
async function init() {
  await initializeFromServer();
  
  // Setup comment tracking
  setupCommentTracking();
  
  // Theo dõi DOM changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Thêm global event listeners
  setupGlobalEventListeners();
  
  console.log('✅ Content script đã khởi tạo xong');
}

// Setup global event listeners
function setupGlobalEventListeners() {
  // Global paste listener
  document.addEventListener('paste', async (e) => {
    console.log('📋 Global paste event detected');
    
    // Kiểm tra xem có đang tracking không
    const isTracking = await checkTrackingStatus();
    if (!isTracking) {
      return;
    }
    
    // Tìm comment box đang active
    const activeElement = document.activeElement;
    if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
      console.log('📋 Paste vào comment box detected');
      
      // Delay để đảm bảo paste đã hoàn thành
      setTimeout(() => {
        const content = getCommentContent(activeElement);
        if (content) {
          console.log('📋 Pasted content in comment box:', content.substring(0, 50) + '...');
        }
      }, 100);
    }
  });
  
  // Global keydown listener cho Enter
  document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
        console.log('⌨️ Global Enter pressed in comment box');
        
        // Kiểm tra tracking status
        const isTracking = await checkTrackingStatus();
        if (!isTracking) {
          return;
        }
        
        // Tìm submit button
        let submitButton = null;
        let parent = activeElement.parentElement;
        
        while (parent && !submitButton) {
          const button = parent.querySelector('[aria-label="Comment"], [data-testid="comment-composer-submit"], button[type="submit"]');
          if (button && button.offsetParent !== null) {
            submitButton = button;
          }
          parent = parent.parentElement;
        }
        
        if (submitButton) {
          console.log('🔍 Found submit button for Enter key');
          setTimeout(() => {
            handleCommentSubmit(activeElement, submitButton);
          }, 200);
        }
      }
    }
  });
}

// Chạy khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Chạy lại mỗi 10 giây để đảm bảo không bỏ sót (giảm từ 5 giây)
setInterval(setupCommentTracking, 10000);