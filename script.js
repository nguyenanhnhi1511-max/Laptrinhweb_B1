"use strict";

// Dữ liệu khởi tạo
const items = [
  {
    id: 1,
    title: "Viết báo cáo HTML",
    dueDate: "2026-10-20",
    priority: "Cao",
    status: "pending"
  },
  {
    id: 2,
    title: "Ôn Flexbox",
    dueDate: "2026-10-23",
    priority: "Trung bình",
    status: "pending"
  },
  {
    id: 3,
    title: "Làm bài DOM",
    dueDate: "2026-10-19",
    priority: "Cao",
    status: "done"
  },
  {
    id: 4,
    title: "Đọc tài liệu CSS",
    dueDate: "2026-10-25",
    priority: "Thấp",
    status: "pending"
  },
  {
    id: 5,
    title: "Thiết kế trang cá nhân",
    dueDate: "2026-10-21",
    priority: "Trung bình",
    status: "done"
  }
];

// Biến trạng thái hiện tại
let currentFilter = "all";
let searchKeyword = "";

// Lấy các phần tử DOM
const taskListEl = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const titleError = document.getElementById("title-error");
const searchInput = document.getElementById("search-input");
const taskCountEl = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".btn-filter");

// ==================== C1: Hiển thị danh sách ====================
function renderTasks() {
  // Lọc theo trạng thái + tìm kiếm
  let filtered = items.filter(item => {
    // Lọc trạng thái
    if (currentFilter === "pending" && item.status !== "pending") return false;
    if (currentFilter === "done" && item.status !== "done") return false;

    // Tìm kiếm (không phân biệt hoa thường)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      if (!item.title.toLowerCase().includes(keyword)) return false;
    }
    return true;
  });

  // Cập nhật số lượng
  taskCountEl.textContent = `(${filtered.length})`;

  // Xóa danh sách cũ
  taskListEl.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");

  // Tạo từng item
  filtered.forEach(item => {
    const li = document.createElement("li");
    li.className = `task-item ${item.status === "done" ? "done" : ""}`;
    li.dataset.id = item.id;

    // Chuyển priority thành class CSS
    const priorityClass = item.priority
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    li.innerHTML = `
      <div class="task-content">
        <div class="task-title">${escapeHtml(item.title)}</div>
        <div class="task-meta">
          <span>Hạn: ${formatDate(item.dueDate)}</span>
          <span class="priority ${priorityClass}">${item.priority}</span>
          <span>${item.status === "done" ? "✓ Đã hoàn thành" : "⏳ Chưa hoàn thành"}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-action btn-toggle" data-action="toggle">
          ${item.status === "done" ? "Hoàn tác" : "Hoàn thành"}
        </button>
        <button class="btn-action btn-delete" data-action="delete">Xóa</button>
      </div>
    `;

    taskListEl.appendChild(li);
  });
}

// Hàm hỗ trợ escape HTML (tránh XSS)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format ngày
function formatDate(dateStr) {
  if (!dateStr) return "Không có";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// ==================== C2: Thêm công việc ====================
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  // Kiểm tra tên không rỗng
  if (!title) {
    titleError.textContent = "Vui lòng nhập tên công việc!";
    titleInput.focus();
    return;
  }

  titleError.textContent = "";

  // Tạo id mới
  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

  // Thêm vào mảng
  items.push({
    id: newId,
    title: title,
    dueDate: dueDate || "",
    priority: priority,
    status: "pending"
  });

  // Cập nhật giao diện ngay
  renderTasks();

  // Xóa form
  taskForm.reset();
  titleInput.focus();
});

// ==================== C3: Tìm kiếm + Lọc ====================
searchInput.addEventListener("input", function () {
  searchKeyword = this.value.trim();
  renderTasks();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", function () {
    // Bỏ active cũ
    filterButtons.forEach(b => b.classList.remove("active"));
    // Active nút hiện tại
    this.classList.add("active");

    currentFilter = this.dataset.filter;
    renderTasks();
  });
});

// ==================== C4: Đánh dấu hoàn thành + Xóa ====================
taskListEl.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const li = btn.closest(".task-item");
  const id = Number(li.dataset.id);
  const action = btn.dataset.action;

  if (action === "toggle") {
    const item = items.find(i => i.id === id);
    if (item) {
      item.status = item.status === "done" ? "pending" : "done";
      renderTasks();
    }
  }

  if (action === "delete") {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      renderTasks();
    }
  }
});

// ==================== Khởi chạy ====================
document.addEventListener("DOMContentLoaded", function () {
  renderTasks();
});