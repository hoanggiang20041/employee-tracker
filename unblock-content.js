// Content script cho trang gỡ block Facebook
console.log('🔓 Unblock content script đã được nạp');

// Lắng nghe message từ trang chính
window.addEventListener('message', function(event) {
    if (event.data.type === 'FILL_UNBLOCK_FORM') {
        console.log('📝 Nhận yêu cầu điền form');
        fillUnblockForm(event.data.message);
    }
});

// Hàm điền form gỡ block
function fillUnblockForm(message) {
    try {
        console.log('🔍 Tìm kiếm form elements...');
        
        // Tìm tất cả textarea
        const textareas = document.querySelectorAll('textarea');
        console.log('📝 Tìm thấy', textareas.length, 'textarea');
        
        textareas.forEach((textarea, index) => {
            console.log('📝 Điền textarea', index + 1);
            textarea.value = message;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Tìm tất cả input text
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"]');
        console.log('📝 Tìm thấy', textInputs.length, 'input text');
        
        textInputs.forEach((input, index) => {
            if (input.placeholder && input.placeholder.toLowerCase().includes('email')) {
                console.log('📧 Điền email input');
                input.value = 'your-email@example.com';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Tìm contenteditable elements
        const contentEditables = document.querySelectorAll('[contenteditable="true"]');
        console.log('📝 Tìm thấy', contentEditables.length, 'contenteditable');
        
        contentEditables.forEach((element, index) => {
            console.log('📝 Điền contenteditable', index + 1);
            element.textContent = message;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        console.log('✅ Đã điền form thành công');
        
        // Tự động submit sau 3 giây
        setTimeout(() => {
            submitUnblockForm();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Lỗi khi điền form:', error);
    }
}

// Hàm submit form
function submitUnblockForm() {
    try {
        console.log('📤 Tìm kiếm nút submit...');
        
        // Tìm tất cả nút submit
        const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
        console.log('📤 Tìm thấy', submitButtons.length, 'submit button');
        
        submitButtons.forEach((button, index) => {
            console.log('📤 Click submit button', index + 1);
            if (!button.disabled) {
                button.click();
            }
        });
        
        // Tìm nút có text liên quan đến submit
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('submit') || text.includes('gửi') || text.includes('send')) {
                console.log('📤 Click button với text:', button.textContent);
                if (!button.disabled) {
                    button.click();
                }
            }
        });
        
        console.log('✅ Đã submit form');
        
    } catch (error) {
        console.error('❌ Lỗi khi submit form:', error);
    }
}

// Auto-detect và điền form khi trang load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Trang gỡ block đã load');
    
    // Kiểm tra xem có phải trang gỡ block không
    if (window.location.href.includes('facebook.com/help/contact')) {
        console.log('✅ Đây là trang gỡ block Facebook');
        
        // Hiển thị popup thông báo
        showBlockNotification();
        
        // Tự động điền form sau 5 giây
        setTimeout(() => {
            const defaultMessage = 'Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.';
            fillUnblockForm(defaultMessage);
        }, 5000);
    }
});

// Hiển thị popup thông báo block
function showBlockNotification() {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            text-align: center;
        ">
            <h2 style="color: #dc3545; margin-top: 0;">🚫 Phát hiện Block Comment</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Tài khoản của bạn đã bị Facebook block comment. 
                Extension sẽ tự động điền form kháng cáo và gửi yêu cầu gỡ block.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 10px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Đóng</button>
                <button onclick="fillUnblockForm('Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.'); this.parentElement.parentElement.parentElement.remove();" style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">🤖 Tự động điền ngay</button>
            </div>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        " onclick="this.remove()"></div>
    `;
    
    document.body.appendChild(popup);
    
    // Tự động đóng sau 10 giây
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 10000);
}

// Thêm listener cho khi trang đã load hoàn toàn
window.addEventListener('load', function() {
    console.log('🌐 Trang đã load hoàn toàn');
    
    if (window.location.href.includes('facebook.com/help/contact')) {
        console.log('✅ Đây là trang gỡ block Facebook (load event)');
        
        // Thử điền form sau khi trang load hoàn toàn
        setTimeout(() => {
            const defaultMessage = 'Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.';
            fillUnblockForm(defaultMessage);
        }, 3000);
    }
});

// Thêm nút tự động điền vào trang
function addAutoFillButton() {
    const button = document.createElement('button');
    button.textContent = '🤖 Tự động điền form';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    button.addEventListener('click', () => {
        const defaultMessage = 'Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.';
        fillUnblockForm(defaultMessage);
    });
    
    // Thêm nút submit riêng
    const submitButton = document.createElement('button');
    submitButton.textContent = '📤 Tự động gửi';
    submitButton.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 9999;
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    submitButton.addEventListener('click', () => {
        submitUnblockForm();
    });
    
    document.body.appendChild(button);
    document.body.appendChild(submitButton);
}

// Thêm nút sau khi trang load
setTimeout(addAutoFillButton, 2000);

// Thêm nút sau khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addAutoFillButton, 1000);
    });
} else {
    setTimeout(addAutoFillButton, 1000);
}

console.log('🔓 Unblock content script đã sẵn sàng'); 