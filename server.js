const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Data storage
let activities = [];
let comments = [];
let employees = []; // Danh sách nhân viên được admin quản lý
let employeeSessions = new Map(); // Lưu session của nhân viên
let trackingStatus = new Map(); // Lưu trạng thái tracking của nhân viên

// Helper function để lưu data vào file
function saveDataToFile() {
  const data = { 
    activities, 
    comments, 
    employees, 
    employeeSessions: Array.from(employeeSessions.entries()),
    trackingStatus: Array.from(trackingStatus.entries()),
    lastUpdated: new Date().toISOString() 
  };
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
}

// Helper function để load data từ file
function loadDataFromFile() {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      activities = data.activities || [];
      comments = data.comments || [];
      employees = data.employees || [];
      
      // Load employee sessions
      if (data.employeeSessions) {
        employeeSessions = new Map(data.employeeSessions);
      }
      
      // Load tracking status
      if (data.trackingStatus) {
        trackingStatus = new Map(data.trackingStatus);
      }
      
      console.log(`✅ Đã load ${activities.length} activities, ${comments.length} comments, ${employees.length} employees, ${employeeSessions.size} sessions, ${trackingStatus.size} tracking status từ file`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi load data từ file:', error);
  }
}

// Validation helper
function validateActivity(data) {
  return data.employeeId && data.employeeName && data.startTime;
}

function validateComment(data) {
  return data.employeeId && data.employeeName && data.comment && data.time;
}

// Kiểm tra nhân viên có tồn tại không
function validateEmployee(employeeId, employeeName) {
  const employee = employees.find(emp => 
    emp.employeeId === employeeId && emp.employeeName === employeeName
  );
  return employee !== undefined;
}

// Middleware để kiểm tra admin access
function requireAdmin(req, res, next) {
  const adminToken = req.headers['admin-token'] || req.query.admin_token;
  
  // Simple admin check (trong thực tế nên dùng JWT)
  if (adminToken === 'admin123') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }
}

// API Routes cho quản lý nhân viên (cần admin)
app.post('/employees', requireAdmin, (req, res) => {
  const { employeeId, employeeName, position, department, password } = req.body;
  
  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  
  // Kiểm tra mã nhân viên đã tồn tại chưa
  const existingEmployee = employees.find(emp => emp.employeeId === employeeId);
  if (existingEmployee) {
    return res.status(400).json({ error: 'Mã nhân viên đã tồn tại' });
  }
  
  const employee = {
    id: Date.now(),
    employeeId,
    employeeName,
    password: password || '123456', // Mật khẩu mặc định
    position: position || 'Nhân viên',
    department: department || 'Chưa phân bộ',
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  employees.push(employee);
  saveDataToFile();
  
  console.log(`✅ Thêm nhân viên mới: ${employeeName} (${employeeId}) - Password: ${employee.password}`);
  res.json({ success: true, employee });
});

app.get('/employees', requireAdmin, (req, res) => {
  const { active } = req.query;
  let filteredEmployees = employees;
  
  if (active === 'true') {
    filteredEmployees = employees.filter(emp => emp.isActive);
  }
  
  res.json(filteredEmployees);
});

app.put('/employees/:employeeId', requireAdmin, (req, res) => {
  const { employeeId } = req.params;
  const { employeeName, position, department, isActive } = req.body;
  
  const employeeIndex = employees.findIndex(emp => emp.employeeId === employeeId);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
  }
  
  employees[employeeIndex] = {
    ...employees[employeeIndex],
    employeeName: employeeName || employees[employeeIndex].employeeName,
    position: position || employees[employeeIndex].position,
    department: department || employees[employeeIndex].department,
    isActive: isActive !== undefined ? isActive : employees[employeeIndex].isActive,
    updatedAt: new Date().toISOString()
  };
  
  saveDataToFile();
  console.log(`✅ Cập nhật nhân viên: ${employeeId}`);
  res.json({ success: true, employee: employees[employeeIndex] });
});

app.delete('/employees/:employeeId', requireAdmin, (req, res) => {
  const { employeeId } = req.params;
  
  const employeeIndex = employees.findIndex(emp => emp.employeeId === employeeId);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
  }
  
  employees.splice(employeeIndex, 1);
  saveDataToFile();
  
  console.log(`🗑️ Xóa nhân viên: ${employeeId}`);
  res.json({ success: true });
});

// API cập nhật mật khẩu nhân viên
app.put('/employees/:employeeId/password', requireAdmin, (req, res) => {
  const { employeeId } = req.params;
  const { password } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  
  const employeeIndex = employees.findIndex(emp => emp.employeeId === employeeId);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
  }
  
  employees[employeeIndex].password = password;
  employees[employeeIndex].updatedAt = new Date().toISOString();
  
  saveDataToFile();
  
  console.log(`🔐 Cập nhật mật khẩu cho nhân viên: ${employeeId}`);
  res.json({ success: true, message: 'Cập nhật mật khẩu thành công' });
});

// API để validate nhân viên từ extension
app.post('/validate-employee', (req, res) => {
  const { employeeId, employeeName } = req.body;
  
  if (!employeeId || !employeeName) {
    return res.json({ isValid: false, message: 'Thiếu thông tin' });
  }
  
  const isValid = validateEmployee(employeeId, employeeName);
  const employee = employees.find(emp => emp.employeeId === employeeId);
  
  if (isValid && employee && !employee.isActive) {
    return res.json({ isValid: false, message: 'Nhân viên đã bị vô hiệu hóa' });
  }
  
  res.json({ 
    isValid, 
    message: isValid ? 'Nhân viên hợp lệ' : 'Nhân viên không tồn tại',
    employee: isValid ? employee : null
  });
});

// API đăng nhập nhân viên
app.post('/employee-login', (req, res) => {
  const { employeeId, password } = req.body;
  
  if (!employeeId || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập' });
  }
  
  const employee = employees.find(emp => emp.employeeId === employeeId);
  
  if (!employee) {
    return res.json({ success: false, message: 'Mã nhân viên không tồn tại' });
  }
  
  if (!employee.isActive) {
    return res.json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
  }
  
  // Kiểm tra password (trong thực tế nên hash password)
  if (employee.password !== password) {
    return res.json({ success: false, message: 'Mật khẩu không đúng' });
  }
  
  console.log(`✅ Nhân viên đăng nhập: ${employee.employeeName} (${employeeId})`);
  res.json({ 
    success: true, 
    message: 'Đăng nhập thành công',
    employeeName: employee.employeeName,
    employeeId: employee.employeeId
  });
});

// API Routes cho tracking
app.post('/activity', (req, res) => {
  const { employeeId, employeeName, startTime } = req.body;
  
  if (!validateActivity(req.body)) {
    console.log('❌ Invalid activity data:', req.body);
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  
  // Kiểm tra nhân viên có tồn tại không
  if (!validateEmployee(employeeId, employeeName)) {
    console.log('❌ Employee not found:', { employeeId, employeeName });
    return res.status(400).json({ error: 'Nhân viên không tồn tại' });
  }
  
  const activity = {
    id: Date.now(),
    employeeId,
    employeeName,
    startTime,
    createdAt: new Date().toISOString()
  };
  
  activities.push(activity);
  saveDataToFile();
  
  console.log(`✅ Nhận activity từ nhân viên ${employeeName} (${employeeId}) lúc ${new Date(startTime).toLocaleString()}`);
  res.json({ success: true, id: activity.id });
});

app.post('/comment', (req, res) => {
  const { employeeId, employeeName, comment, time } = req.body;
  
  if (!validateComment(req.body)) {
    console.log('❌ Invalid comment data:', req.body);
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  
  // Kiểm tra nhân viên có tồn tại không
  if (!validateEmployee(employeeId, employeeName)) {
    console.log('❌ Employee not found for comment:', { employeeId, employeeName });
    return res.status(400).json({ error: 'Nhân viên không tồn tại' });
  }
  
  const commentData = {
    id: Date.now(),
    employeeId,
    employeeName,
    comment: comment.trim(),
    time,
    createdAt: new Date().toISOString()
  };
  
  comments.push(commentData);
  saveDataToFile();
  
  console.log(`💬 Nhận comment từ nhân viên ${employeeName} (${employeeId}): "${comment.trim()}"`);
  res.json({ success: true, id: commentData.id });
});

app.get('/data', requireAdmin, (req, res) => {
  const { employeeId, startDate, endDate } = req.query;
  
  let filteredActivities = activities;
  let filteredComments = comments;
  
  // Filter theo employeeId
  if (employeeId) {
    filteredActivities = activities.filter(a => a.employeeId === employeeId);
    filteredComments = comments.filter(c => c.employeeId === employeeId);
  }
  
  // Filter theo date range
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    filteredActivities = filteredActivities.filter(a => {
      const activityDate = new Date(a.startTime);
      return activityDate >= start && activityDate <= end;
    });
    
    filteredComments = filteredComments.filter(c => {
      const commentDate = new Date(c.time);
      return commentDate >= start && commentDate <= end;
    });
  }
  
  res.json({
    activities: filteredActivities,
    comments: filteredComments,
    total: {
      activities: filteredActivities.length,
      comments: filteredComments.length
    }
  });
});

app.get('/employees/stats', requireAdmin, (req, res) => {
  const employeeStats = employees.map(employee => {
    const employeeActivities = activities.filter(a => a.employeeId === employee.employeeId);
    const employeeComments = comments.filter(c => c.employeeId === employee.employeeId);
    
    return {
      ...employee,
      totalActivities: employeeActivities.length,
      totalComments: employeeComments.length,
      lastActivity: employeeActivities.length > 0 ? 
        employeeActivities[employeeActivities.length - 1].startTime : null,
      lastComment: employeeComments.length > 0 ? 
        employeeComments[employeeComments.length - 1].time : null
    };
  });
  
  res.json(employeeStats);
});

app.delete('/data', requireAdmin, (req, res) => {
  const { type, id } = req.query;
  
  if (type === 'activities') {
    activities = [];
  } else if (type === 'comments') {
    comments = [];
  } else if (id) {
    activities = activities.filter(a => a.id != id);
    comments = comments.filter(c => c.id != id);
  } else {
    activities = [];
    comments = [];
  }
  
  saveDataToFile();
  console.log(`🗑️ Đã xóa ${type || 'all'} data`);
  res.json({ success: true });
});

// Health check
// Employee session management
app.post('/employee-session', (req, res) => {
  const { employeeId, employeeName } = req.body;
  
  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'Thiếu thông tin nhân viên' });
  }
  
  // Lưu session
  employeeSessions.set(employeeId, {
    employeeId,
    employeeName,
    lastUpdated: new Date().toISOString()
  });
  
  saveDataToFile();
  console.log(`💾 Lưu session cho nhân viên: ${employeeName} (${employeeId})`);
  res.json({ success: true });
});

app.get('/employee-session', (req, res) => {
  const { employeeId } = req.query;
  
  if (employeeId) {
    // Lấy session của nhân viên cụ thể
    const session = employeeSessions.get(employeeId);
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ error: 'Không tìm thấy session' });
    }
  } else {
    // Trả về session mới nhất
    const sessions = Array.from(employeeSessions.values());
    const latestSession = sessions.sort((a, b) => 
      new Date(b.lastUpdated) - new Date(a.lastUpdated)
    )[0];
    
    if (latestSession) {
      res.json(latestSession);
    } else {
      res.status(404).json({ error: 'Không có session nào' });
    }
  }
});

// Xóa session nhân viên (đăng xuất)
app.delete('/employee-session', (req, res) => {
  const { employeeId } = req.query;
  
  if (employeeId) {
    // Xóa session của nhân viên cụ thể
    if (employeeSessions.has(employeeId)) {
      employeeSessions.delete(employeeId);
      // Cũng xóa tracking status
      if (trackingStatus.has(employeeId)) {
        trackingStatus.delete(employeeId);
      }
      saveDataToFile();
      console.log(`🚪 Đăng xuất nhân viên: ${employeeId}`);
      res.json({ success: true, message: 'Đăng xuất thành công' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy session' });
    }
  } else {
    // Xóa tất cả sessions
    employeeSessions.clear();
    trackingStatus.clear();
    saveDataToFile();
    console.log('🚪 Đã xóa tất cả sessions và tracking status');
    res.json({ success: true, message: 'Đã xóa tất cả sessions' });
  }
});

// API quản lý tracking status
app.post('/tracking-status', (req, res) => {
  const { employeeId, employeeName, isTracking, startTime } = req.body;
  
  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'Thiếu thông tin nhân viên' });
  }
  
  trackingStatus.set(employeeId, {
    employeeId,
    employeeName,
    isTracking: isTracking || false,
    startTime: startTime || null,
    lastUpdated: new Date().toISOString()
  });
  
  saveDataToFile();
  console.log(`📊 Cập nhật tracking status: ${employeeId} - ${isTracking ? 'ON' : 'OFF'}`);
  res.json({ success: true });
});

app.get('/tracking-status', (req, res) => {
  const { employeeId } = req.query;
  
  if (employeeId) {
    // Lấy tracking status của nhân viên cụ thể
    const status = trackingStatus.get(employeeId);
    if (status) {
      res.json(status);
    } else {
      res.json({ isTracking: false, employeeId: null, employeeName: null, startTime: null });
    }
  } else {
    // Trả về tracking status mới nhất
    const statuses = Array.from(trackingStatus.values());
    const latestStatus = statuses.sort((a, b) => 
      new Date(b.lastUpdated) - new Date(a.lastUpdated)
    )[0];
    
    if (latestStatus) {
      res.json(latestStatus);
    } else {
      res.json({ isTracking: false, employeeId: null, employeeName: null, startTime: null });
    }
  }
});

// API để lấy tracking status theo employee ID (không cần admin token)
app.get('/tracking-status/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  const status = trackingStatus.get(employeeId);
  if (status) {
    res.json(status);
  } else {
    res.json({ isTracking: false, employeeId: null, employeeName: null, startTime: null });
  }
});

app.delete('/tracking-status', (req, res) => {
  const { employeeId } = req.query;
  
  if (employeeId) {
    // Xóa tracking status của nhân viên cụ thể
    if (trackingStatus.has(employeeId)) {
      trackingStatus.delete(employeeId);
      saveDataToFile();
      console.log(`⏹️ Dừng tracking: ${employeeId}`);
      res.json({ success: true, message: 'Đã dừng tracking' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy tracking status' });
    }
  } else {
    // Xóa tất cả tracking status
    trackingStatus.clear();
    saveDataToFile();
    console.log('⏹️ Đã xóa tất cả tracking status');
    res.json({ success: true, message: 'Đã xóa tất cả tracking status' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataCount: {
      activities: activities.length,
      comments: comments.length,
      employees: employees.length,
      sessions: employeeSessions.size,
      trackingStatus: trackingStatus.size
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Data API: http://localhost:${PORT}/data`);
  console.log(`👥 Employees API: http://localhost:${PORT}/employees`);
  
  // Load data từ file khi khởi động
  loadDataFromFile();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Đang tắt server...');
  saveDataToFile();
  process.exit(0);
});