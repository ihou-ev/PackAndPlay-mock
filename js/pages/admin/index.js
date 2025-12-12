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
    { href: 'reports.html', icon: '📥', label: 'データエクスポート' },
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
