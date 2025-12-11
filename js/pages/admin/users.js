/**
 * ユーザー管理ページ
 */

// モックユーザーデータ
const mockUsers = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'viewer', status: 'active', joinedAt: '2025-01-15', purchases: 5 },
  { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: 'viewer', status: 'active', joinedAt: '2025-02-20', purchases: 12 },
  { id: 3, name: '佐藤健太', email: 'sato@example.com', role: 'creator', status: 'active', joinedAt: '2025-01-10', purchases: 0 },
  { id: 4, name: '山田美咲', email: 'yamada@example.com', role: 'viewer', status: 'suspended', joinedAt: '2025-03-05', purchases: 2 },
  { id: 5, name: '伊藤翔', email: 'ito@example.com', role: 'viewer', status: 'active', joinedAt: '2025-03-10', purchases: 8 },
  { id: 6, name: '渡辺真理', email: 'watanabe@example.com', role: 'creator', status: 'active', joinedAt: '2025-02-01', purchases: 0 },
  { id: 7, name: '高橋悠', email: 'takahashi@example.com', role: 'viewer', status: 'pending', joinedAt: '2025-03-18', purchases: 0 },
  { id: 8, name: '小林愛', email: 'kobayashi@example.com', role: 'viewer', status: 'active', joinedAt: '2025-01-25', purchases: 15 },
  { id: 9, name: '加藤大輔', email: 'kato@example.com', role: 'admin', status: 'active', joinedAt: '2025-01-01', purchases: 0 },
  { id: 10, name: '吉田麻衣', email: 'yoshida@example.com', role: 'viewer', status: 'active', joinedAt: '2025-02-28', purchases: 3 }
];

let filteredUsers = [...mockUsers];
let currentPage = 1;
const perPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 統計サマリーを更新
  updateStatsSummary();

  // ユーザー一覧を表示
  renderUsers();

  // イベントリスナーを設定
  setupEventListeners();
});

/**
 * 管理者用サイドバーナビゲーションを生成
 */
function renderAdminSidebarNav() {
  const navContainer = document.getElementById('sidebarNav');
  if (!navContainer) return;

  const currentPath = window.location.pathname;
  const navItems = [
    { href: 'index.html', icon: '📊', label: 'ダッシュボード' },
    { href: 'users.html', icon: '👥', label: 'ユーザー管理' },
    { href: 'creators.html', icon: '🎬', label: 'ストリーマー管理' },
    { href: 'reports.html', icon: '📈', label: 'レポート' },
    { href: 'settings.html', icon: '⚙️', label: 'システム設定' }
  ];

  navContainer.innerHTML = navItems.map(item => {
    const isActive = currentPath.includes(item.href);
    return `
      <a href="${item.href}" class="sidebar-nav-item ${isActive ? 'active' : ''}">
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span class="sidebar-nav-label">${item.label}</span>
      </a>
    `;
  }).join('');
}

/**
 * 統計サマリーを更新
 */
function updateStatsSummary() {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const viewerCount = mockUsers.filter(u => u.role === 'viewer').length;
  const creatorCount = mockUsers.filter(u => u.role === 'creator').length;

  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('activeUsers').textContent = activeUsers;
  document.getElementById('viewerCount').textContent = viewerCount;
  document.getElementById('creatorCount').textContent = creatorCount;
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // 検索入力
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      filterUsers();
    }, 300));
  }

  // ロールフィルタ
  const roleFilter = document.getElementById('roleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', filterUsers);
  }

  // ステータスフィルタ
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', filterUsers);
  }
}

/**
 * ユーザーをフィルタリング
 */
function filterUsers() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('roleFilter')?.value || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';

  filteredUsers = mockUsers.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery);

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  currentPage = 1;
  renderUsers();
}

/**
 * ユーザー一覧を表示
 */
function renderUsers() {
  renderUsersTable();
  renderUsersCards();
  renderPagination();
}

/**
 * テーブル形式でユーザーを表示
 */
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('emptyState');

  if (!tbody) return;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageUsers = filteredUsers.slice(start, end);

  if (filteredUsers.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = pageUsers.map(user => `
    <tr>
      <td>
        <div class="user-info">
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="role-badge role-badge-${user.role}">${getRoleLabel(user.role)}</span>
      </td>
      <td>
        <span class="status-badge status-badge-${user.status}">${getStatusLabel(user.status)}</span>
      </td>
      <td>${formatDate(user.joinedAt)}</td>
      <td>${user.purchases}</td>
      <td class="actions-cell">
        <button class="action-button action-button-view" onclick="viewUser(${user.id})">詳細</button>
        <button class="action-button action-button-edit" onclick="editUser(${user.id})">編集</button>
        ${user.status === 'active'
          ? `<button class="action-button action-button-suspend" onclick="suspendUser(${user.id})">停止</button>`
          : `<button class="action-button action-button-edit" onclick="activateUser(${user.id})">有効化</button>`
        }
      </td>
    </tr>
  `).join('');
}

/**
 * カード形式でユーザーを表示（モバイル用）
 */
function renderUsersCards() {
  const container = document.getElementById('usersCards');

  if (!container) return;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageUsers = filteredUsers.slice(start, end);

  if (filteredUsers.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = pageUsers.map(user => `
    <div class="user-card">
      <div class="user-card-header">
        <div class="user-avatar">${user.name.charAt(0)}</div>
        <div class="user-card-info">
          <div class="user-card-name">${user.name}</div>
          <div class="user-card-email">${user.email}</div>
        </div>
        <span class="status-badge status-badge-${user.status}">${getStatusLabel(user.status)}</span>
      </div>
      <div class="user-card-details">
        <div class="user-card-detail">
          <span class="user-card-detail-label">ロール: </span>
          <span class="role-badge role-badge-${user.role}">${getRoleLabel(user.role)}</span>
        </div>
        <div class="user-card-detail">
          <span class="user-card-detail-label">登録日: </span>${formatDate(user.joinedAt)}
        </div>
        <div class="user-card-detail">
          <span class="user-card-detail-label">購入数: </span>${user.purchases}
        </div>
      </div>
      <div class="user-card-actions">
        <button class="action-button action-button-view" onclick="viewUser(${user.id})">詳細</button>
        <button class="action-button action-button-edit" onclick="editUser(${user.id})">編集</button>
        ${user.status === 'active'
          ? `<button class="action-button action-button-suspend" onclick="suspendUser(${user.id})">停止</button>`
          : `<button class="action-button action-button-edit" onclick="activateUser(${user.id})">有効化</button>`
        }
      </div>
    </div>
  `).join('');
}

/**
 * ページネーションを表示
 */
function renderPagination() {
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationButtons = document.getElementById('paginationButtons');

  if (!paginationInfo || !paginationButtons) return;

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, filteredUsers.length);

  paginationInfo.textContent = `${start}-${end} / ${filteredUsers.length}件`;

  let buttonsHtml = `
    <button class="pagination-button" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      前へ
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      buttonsHtml += `
        <button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      buttonsHtml += `<span style="padding: 0 0.5rem;">...</span>`;
    }
  }

  buttonsHtml += `
    <button class="pagination-button" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      次へ
    </button>
  `;

  paginationButtons.innerHTML = buttonsHtml;
}

/**
 * ページを移動
 */
function goToPage(page) {
  const totalPages = Math.ceil(filteredUsers.length / perPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderUsers();
  window.scrollTo(0, 0);
}

/**
 * ロールラベルを取得
 */
function getRoleLabel(role) {
  const labels = {
    viewer: '視聴者',
    creator: 'ストリーマー',
    admin: '管理者'
  };
  return labels[role] || role;
}

/**
 * ステータスラベルを取得
 */
function getStatusLabel(status) {
  const labels = {
    active: '有効',
    suspended: '停止中',
    pending: '保留中'
  };
  return labels[status] || status;
}

/**
 * ユーザー詳細を表示
 */
function viewUser(userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    showToast(`${user.name}の詳細を表示（モック）`, 'info');
  }
}

/**
 * ユーザーを編集
 */
function editUser(userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    showToast(`${user.name}を編集（モック）`, 'info');
  }
}

/**
 * ユーザーを停止
 */
function suspendUser(userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    if (confirm(`${user.name}を停止しますか？`)) {
      user.status = 'suspended';
      renderUsers();
      updateStatsSummary();
      showToast(`${user.name}を停止しました`, 'success');
    }
  }
}

/**
 * ユーザーを有効化
 */
function activateUser(userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.status = 'active';
    renderUsers();
    updateStatsSummary();
    showToast(`${user.name}を有効化しました`, 'success');
  }
}
