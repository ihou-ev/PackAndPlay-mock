/**
 * データエクスポートページ
 * mockViewers, mockPayoutsはmock-data.jsで定義
 * renderAdminSidebarNavはmain.jsで定義
 */

// エクスポート履歴
let exportHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // データ件数を更新
  updateDataCounts();

  // エクスポート履歴を表示
  renderExportHistory();
});

/**
 * データ件数を更新
 */
function updateDataCounts() {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 視聴者
  document.getElementById('viewerCount').textContent = `${mockViewers.length}件`;
  document.getElementById('viewerLastUpdate').textContent = formattedDate;

  // ストリーマー
  document.getElementById('creatorCount').textContent = `${creators.length}件`;
  document.getElementById('creatorLastUpdate').textContent = formattedDate;

  // 売上精算
  document.getElementById('payoutCount').textContent = `${mockPayouts.length}件`;
  document.getElementById('payoutLastUpdate').textContent = formattedDate;
}

/**
 * 視聴者データをエクスポート
 */
function exportViewers() {
  const headers = ['ID', '名前', 'メール', 'ステータス', '登録日', '最終ログイン', 'ログイン方法', '所持コイン', '購入パック数', '所持カード数', '総購入額', 'フォロー数'];

  const rows = mockViewers.map(v => [
    v.id,
    v.name,
    v.email,
    v.status === 'active' ? 'アクティブ' : '停止中',
    v.joinedAt,
    v.lastLogin,
    v.loginMethod,
    v.coins,
    v.packs,
    v.cards,
    v.spent,
    v.following
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(csv, 'viewers');

  addExportHistory('視聴者データ', mockViewers.length);
  showToast('視聴者データをエクスポートしました', 'success');
}

/**
 * ストリーマーデータをエクスポート
 */
function exportCreators() {
  const headers = ['ID', '名前', '表示名', 'スラッグ', 'ステータス', '配信中', 'フォロワー数', '総売上', 'パック数', '今日の消費スパーク', '今週の消費スパーク', '今月の消費スパーク'];

  const rows = creators.map(c => [
    c.id,
    c.name,
    c.displayName || c.name,
    c.slug,
    c.status === 'suspended' ? '停止中' : 'アクティブ',
    c.isLive ? 'はい' : 'いいえ',
    c.followerCount || 0,
    c.totalSales || 0,
    c.packCount || 0,
    c.sparksConsumed?.today || 0,
    c.sparksConsumed?.week || 0,
    c.sparksConsumed?.month || 0
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(csv, 'creators');

  addExportHistory('ストリーマーデータ', creators.length);
  showToast('ストリーマーデータをエクスポートしました', 'success');
}

/**
 * 売上精算データをエクスポート
 */
function exportPayouts() {
  const headers = ['ID', 'ストリーマー名', '精算期間', '期間開始日', '期間終了日', '総売上', 'プラットフォーム手数料', '振込金額', 'ステータス', '振込日', '銀行名', '口座名義'];

  const statusLabels = {
    pending: '振込待ち',
    processing: '処理中',
    completed: '振込完了'
  };

  const rows = mockPayouts.map(p => [
    p.id,
    p.creatorName,
    formatPeriod(p.period),
    p.periodStart,
    p.periodEnd,
    p.grossSales,
    p.platformFee,
    p.netAmount,
    statusLabels[p.status] || p.status,
    p.paidAt || '',
    p.bankInfo?.bankName || '',
    p.bankInfo?.accountHolder || ''
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(csv, 'payouts');

  addExportHistory('売上精算データ', mockPayouts.length);
  showToast('売上精算データをエクスポートしました', 'success');
}

/**
 * 期間をフォーマット
 */
function formatPeriod(period) {
  const [year, month] = period.split('-');
  return `${year}年${parseInt(month)}月分`;
}

/**
 * CSVを生成
 */
function generateCSV(headers, rows) {
  const BOM = '\uFEFF'; // Excel用UTF-8 BOM
  const headerLine = headers.map(h => `"${h}"`).join(',');
  const dataLines = rows.map(row =>
    row.map(cell => {
      const value = String(cell);
      // ダブルクォートをエスケープ
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return BOM + [headerLine, ...dataLines].join('\n');
}

/**
 * CSVをダウンロード
 */
function downloadCSV(csv, prefix) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `${prefix}_${timestamp}.csv`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * エクスポート履歴を追加
 */
function addExportHistory(dataType, recordCount) {
  const now = new Date();
  const session = getCurrentSession();

  exportHistory.unshift({
    id: Date.now(),
    dataType,
    recordCount,
    exportedAt: now.toISOString(),
    exportedBy: session?.name || '管理者'
  });

  // 最新10件まで保持
  if (exportHistory.length > 10) {
    exportHistory = exportHistory.slice(0, 10);
  }

  renderExportHistory();
}

/**
 * エクスポート履歴を表示
 */
function renderExportHistory() {
  const container = document.getElementById('exportHistory');
  const emptyState = document.getElementById('emptyHistory');

  if (!container) return;

  if (exportHistory.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    if (emptyState) emptyState.style.display = '';
    return;
  }

  emptyState?.classList.add('hidden');
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = exportHistory.map(item => {
    const date = new Date(item.exportedAt);
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    return `
      <div class="export-history-item">
        <div class="export-history-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="export-history-info">
          <div class="export-history-title">${item.dataType}</div>
          <div class="export-history-meta">${item.recordCount}件 • ${item.exportedBy}</div>
        </div>
        <div class="export-history-date">${formattedDate}</div>
      </div>
    `;
  }).join('');
}
