/**
 * 視聴者管理ページ
 */

// モック視聴者データ（視聴者のみ）
const mockViewers = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com', status: 'active', joinedAt: '2025-01-15', lastLogin: '2025-03-20', loginMethod: 'YouTube', coins: 1500, packs: 5, cards: 23, spent: 2500, following: 8 },
  { id: 2, name: '鈴木花子', email: 'suzuki@example.com', status: 'active', joinedAt: '2025-02-20', lastLogin: '2025-03-19', loginMethod: 'Twitch', coins: 800, packs: 12, cards: 45, spent: 6000, following: 15 },
  { id: 3, name: '山田美咲', email: 'yamada@example.com', status: 'suspended', joinedAt: '2025-03-05', lastLogin: '2025-03-10', loginMethod: 'YouTube', coins: 200, packs: 2, cards: 8, spent: 1000, following: 5 },
  { id: 4, name: '伊藤翔', email: 'ito@example.com', status: 'active', joinedAt: '2025-03-10', lastLogin: '2025-03-18', loginMethod: 'Twitch', coins: 2000, packs: 8, cards: 32, spent: 4000, following: 12 },
  { id: 5, name: '高橋悠', email: 'takahashi@example.com', status: 'active', joinedAt: '2025-03-18', lastLogin: '2025-03-19', loginMethod: 'X', coins: 500, packs: 1, cards: 4, spent: 500, following: 2 },
  { id: 6, name: '小林愛', email: 'kobayashi@example.com', status: 'active', joinedAt: '2025-01-25', lastLogin: '2025-03-20', loginMethod: 'YouTube', coins: 3000, packs: 15, cards: 67, spent: 7500, following: 20 },
  { id: 7, name: '吉田麻衣', email: 'yoshida@example.com', status: 'active', joinedAt: '2025-02-28', lastLogin: '2025-03-17', loginMethod: 'Twitch', coins: 1200, packs: 3, cards: 12, spent: 1500, following: 6 },
  { id: 8, name: '中村健一', email: 'nakamura@example.com', status: 'active', joinedAt: '2025-01-20', lastLogin: '2025-03-19', loginMethod: 'YouTube', coins: 2500, packs: 10, cards: 42, spent: 5000, following: 9 },
  { id: 9, name: '松本さくら', email: 'matsumoto@example.com', status: 'active', joinedAt: '2025-02-14', lastLogin: '2025-03-20', loginMethod: 'Twitch', coins: 1800, packs: 7, cards: 28, spent: 3500, following: 11 },
  { id: 10, name: '井上大地', email: 'inoue@example.com', status: 'suspended', joinedAt: '2025-03-01', lastLogin: '2025-03-08', loginMethod: 'YouTube', coins: 100, packs: 1, cards: 3, spent: 500, following: 3 }
];

let filteredViewers = [...mockViewers];
let currentViewerId = null;

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 統計サマリーを更新
  updateStatsSummary();

  // 視聴者一覧を表示
  renderUserList();
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
    { href: 'users.html', icon: '👥', label: '視聴者管理' },
    { href: 'creators.html', icon: '🎬', label: 'ストリーマー管理' },
    { href: 'payouts.html', icon: '💰', label: '売上精算' },
    { href: 'reports.html', icon: '📈', label: 'レポート' },
    { href: 'settings.html', icon: '⚙️', label: 'システム設定' }
  ];

  navContainer.innerHTML = navItems.map(item => {
    const isActive = currentPath.includes(item.href);
    return `
      <a href="${item.href}" class="sidebar-nav-link ${isActive ? 'active' : ''}">
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
  const totalUsers = mockViewers.length;
  const activeUsers = mockViewers.filter(u => u.status === 'active').length;
  const suspendedUsers = mockViewers.filter(u => u.status === 'suspended').length;

  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('activeUsers').textContent = activeUsers;
  document.getElementById('suspendedUsers').textContent = suspendedUsers;
}

/**
 * フィルターを適用
 */
function applyFilters() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';

  filteredViewers = mockViewers.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery);

    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  renderUserList();
}

/**
 * 視聴者一覧を表示
 */
function renderUserList() {
  const container = document.getElementById('userList');
  const emptyState = document.getElementById('emptyState');

  if (!container) return;

  if (filteredViewers.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  container.innerHTML = filteredViewers.map(user => `
    <div class="user-card" onclick="openUserModal(${user.id})">
      <div class="user-card-main">
        <div class="user-avatar">${user.name.charAt(0)}</div>
        <div class="user-card-info">
          <div class="user-card-name">${user.name}</div>
          <div class="user-card-email">${user.email}</div>
        </div>
        <div class="user-card-badges">
          <span class="badge badge-status-${user.status}">${getStatusLabel(user.status)}</span>
        </div>
      </div>
      <div class="user-card-meta">
        <span>登録: ${formatDate(user.joinedAt)}</span>
        <span>購入: ${user.packs}パック</span>
        <span>¥${user.spent.toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}

/**
 * ステータスラベルを取得
 */
function getStatusLabel(status) {
  const labels = {
    active: 'アクティブ',
    suspended: '停止中',
    pending: '保留中'
  };
  return labels[status] || status;
}

/**
 * 視聴者モーダルを開く
 */
function openUserModal(userId) {
  const user = mockViewers.find(u => u.id === userId);
  if (!user) return;

  currentViewerId = userId;

  // モーダルの内容を更新
  document.getElementById('modalUserAvatar').textContent = user.name.charAt(0);
  document.getElementById('modalUserName').textContent = user.name;
  document.getElementById('modalUserEmail').textContent = user.email;

  // ステータスバッジ
  const statusBadge = document.getElementById('modalUserStatus');
  statusBadge.textContent = getStatusLabel(user.status);
  statusBadge.className = `badge badge-status-${user.status}`;

  // アカウント情報
  document.getElementById('modalUserRegistered').textContent = formatDate(user.joinedAt);
  document.getElementById('modalUserLastLogin').textContent = formatDate(user.lastLogin);
  document.getElementById('modalUserLoginMethod').textContent = user.loginMethod;
  document.getElementById('modalUserCoins').textContent = user.coins.toLocaleString();

  // 利用統計
  document.getElementById('modalUserPacks').textContent = user.packs;
  document.getElementById('modalUserCards').textContent = user.cards;
  document.getElementById('modalUserSpent').textContent = `¥${user.spent.toLocaleString()}`;
  document.getElementById('modalUserFollowing').textContent = user.following;

  // 停止/有効化ボタン
  const suspendBtn = document.getElementById('modalSuspendBtn');
  if (user.status === 'suspended') {
    suspendBtn.textContent = 'アカウント有効化';
    suspendBtn.className = 'button button-success';
  } else {
    suspendBtn.textContent = 'アカウント停止';
    suspendBtn.className = 'button button-warning';
  }

  // モーダル表示
  document.getElementById('userModal').classList.add('active');
}

/**
 * 視聴者モーダルを閉じる
 */
function closeUserModal() {
  document.getElementById('userModal').classList.remove('active');
  currentViewerId = null;
}

/**
 * 視聴者の停止/有効化を切り替え
 */
function toggleUserSuspend() {
  if (!currentViewerId) return;

  const user = mockViewers.find(u => u.id === currentViewerId);
  if (!user) return;

  if (user.status === 'suspended') {
    // 有効化
    user.status = 'active';
    showToast(`${user.name}を有効化しました`, 'success');
  } else {
    // 停止確認
    showConfirmModal(
      '⚠️',
      'アカウント停止',
      `${user.name}のアカウントを停止しますか？`,
      () => {
        user.status = 'suspended';
        updateStatsSummary();
        renderUserList();
        closeUserModal();
        showToast(`${user.name}を停止しました`, 'success');
      }
    );
    return;
  }

  updateStatsSummary();
  renderUserList();
  closeUserModal();
}

/**
 * 確認モーダルを表示
 */
function showConfirmModal(icon, title, message, onConfirm) {
  document.getElementById('confirmIcon').textContent = icon;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;

  const confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.onclick = () => {
    onConfirm();
    closeConfirmModal();
  };

  document.getElementById('confirmModal').classList.add('active');
}

/**
 * 確認モーダルを閉じる
 */
function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
}
