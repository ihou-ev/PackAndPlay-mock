/**
 * 管理者ダッシュボード
 */

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 統計データを読み込み
  loadDashboardStats();

  // アクティビティを読み込み
  loadRecentActivity();

  // 要対応アイテムを読み込み
  loadPendingItems();
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
      <a href="${item.href}" class="sidebar-nav-link ${isActive ? 'active' : ''}">
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span class="sidebar-nav-label">${item.label}</span>
      </a>
    `;
  }).join('');
}

/**
 * ダッシュボード統計を読み込み
 */
function loadDashboardStats() {
  // モックデータから統計を計算
  const totalUsers = 1250; // モック値
  const totalCreators = creators.length;
  const totalSales = creators.reduce((sum, c) => sum + (c.totalSales || 0), 0);
  const totalPacks = packs.length;

  // 統計値を更新
  updateStatValue('totalUsers', totalUsers.toLocaleString());
  updateStatValue('totalCreators', totalCreators.toLocaleString());
  updateStatValue('totalSales', `¥${totalSales.toLocaleString()}`);
  updateStatValue('totalPacks', totalPacks.toLocaleString());
}

/**
 * 統計値を更新
 */
function updateStatValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * 最近のアクティビティを読み込み
 */
function loadRecentActivity() {
  const activityList = document.getElementById('activityList');
  const emptyActivity = document.getElementById('emptyActivity');

  if (!activityList) return;

  // モックアクティビティデータ
  const activities = [
    {
      type: 'purchase',
      icon: '💳',
      text: '<strong>田中太郎</strong>さんが<strong>スターターパック</strong>を購入',
      time: '5分前'
    },
    {
      type: 'signup',
      icon: '👤',
      text: '<strong>新規ユーザー</strong>が登録しました',
      time: '15分前'
    },
    {
      type: 'creator',
      icon: '🎬',
      text: '<strong>GameMaster</strong>が新しいパックを公開',
      time: '1時間前'
    },
    {
      type: 'purchase',
      icon: '💳',
      text: '<strong>鈴木花子</strong>さんが<strong>プレミアムパック</strong>を購入',
      time: '2時間前'
    },
    {
      type: 'signup',
      icon: '👤',
      text: '<strong>新規ユーザー</strong>が登録しました',
      time: '3時間前'
    }
  ];

  if (activities.length === 0) {
    activityList.classList.add('hidden');
    emptyActivity.classList.remove('hidden');
    return;
  }

  emptyActivity.classList.add('hidden');
  activityList.classList.remove('hidden');

  activityList.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon activity-icon-${activity.type}">
        ${activity.icon}
      </div>
      <div class="activity-content">
        <div class="activity-text">${activity.text}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `).join('');
}

/**
 * 要対応アイテムを読み込み
 */
function loadPendingItems() {
  const pendingItems = document.getElementById('pendingItems');
  const emptyPending = document.getElementById('emptyPending');

  if (!pendingItems) return;

  // 承認待ちカード使用リクエスト
  const pendingRedemptions = redeemQueue.filter(r => r.state === 'pending');

  // モック要対応アイテム
  const items = [];

  if (pendingRedemptions.length > 0) {
    items.push({
      icon: '🎴',
      title: `${pendingRedemptions.length}件のカード使用リクエスト`,
      description: '承認待ちのカード使用リクエストがあります',
      action: '確認する',
      href: '../dashboard/redemptions.html'
    });
  }

  // 追加のモックアイテム
  items.push({
    icon: '📝',
    title: '新規ストリーマー申請',
    description: '2件の新規ストリーマー申請があります',
    action: '審査する',
    href: 'creators.html'
  });

  if (items.length === 0) {
    pendingItems.classList.add('hidden');
    emptyPending.classList.remove('hidden');
    return;
  }

  emptyPending.classList.add('hidden');
  pendingItems.classList.remove('hidden');

  pendingItems.innerHTML = items.map(item => `
    <div class="pending-item">
      <div class="pending-icon">${item.icon}</div>
      <div class="pending-content">
        <div class="pending-title">${item.title}</div>
        <div class="pending-description">${item.description}</div>
      </div>
      <a href="${item.href}" class="pending-action">${item.action}</a>
    </div>
  `).join('');
}
