/**
 * 視聴者管理ページ
 * mockViewersはmock-data.jsで定義
 */

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
