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
        
        // Tự động điền form sau 5 giây
        setTimeout(() => {
            const defaultMessage = 'Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.';
            fillUnblockForm(defaultMessage);
        }, 5000);
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
    `;
    
    button.addEventListener('click', () => {
        const defaultMessage = 'Tôi muốn gỡ khóa comment cho tài khoản của mình. Tôi không vi phạm quy định nào của Facebook và cần khôi phục quyền comment để tương tác với bạn bè và gia đình. Tôi cam kết tuân thủ các quy định cộng đồng của Facebook trong tương lai.';
        fillUnblockForm(defaultMessage);
    });
    
    document.body.appendChild(button);
}

// Thêm nút sau khi trang load
setTimeout(addAutoFillButton, 2000);

console.log('🔓 Unblock content script đã sẵn sàng'); 