// Content script cho Facebook comment tracking
console.log('🚀 Content script đã load');

// Biến global để lưu trạng thái
let isTracking = false;
let currentEmployeeId = null;
let currentEmployeeName = null;
let startTime = null;
let pendingComments = new Map();

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
    } else {
      console.error('❌ Lỗi khi gửi comment');
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi comment:', error);
  }
}

// Kiểm tra trạng thái tracking
async function checkTrackingStatus() {
  if (!isTracking || !currentEmployeeId || !currentEmployeeName) {
    console.log('📊 Tracking status:', { isTracking, currentEmployeeId, currentEmployeeName });
    return false;
  }
  return true;
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
  
  return content.trim();
}

// Xử lý comment submit
async function handleCommentSubmit(commentElement, submitButton) {
  if (!await checkTrackingStatus()) {
    console.log('❌ Không đang tracking hoặc chưa có thông tin nhân viên');
    return;
  }
  
  const content = getCommentContent(commentElement);
  if (!content) {
    console.log('❌ Không tìm thấy nội dung comment');
    return;
  }
  
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
  console.log('🔍 Tìm comment boxes...');
  
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
          await handleCommentSubmit(commentElement, submitButton);
        });
        
        // Lắng nghe Enter key
        commentElement.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            console.log('⌨️ Enter pressed');
            e.preventDefault();
            await handleCommentSubmit(commentElement, submitButton);
          }
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
  
  console.log('✅ Content script đã khởi tạo xong');
}

// Chạy khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Chạy lại mỗi 5 giây để đảm bảo không bỏ sót
setInterval(setupCommentTracking, 5000);