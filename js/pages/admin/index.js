/**
 * 管理者ダッシュボード
 * renderAdminSidebarNavはmain.jsで定義
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
 * ダッシュボード統計を読み込み
 */
function loadDashboardStats() {
  // モックデータから統計を計算
  const totalUsers = mockViewers.length;
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
