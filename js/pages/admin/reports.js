/**
 * データエクスポートページ
 */

// モック視聴者データ（users.jsと同じ）
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

// モック精算データ（payouts.jsと同じ）
const mockPayouts = [
  {
    id: 1,
    creatorId: 1,
    creatorName: '田中太郎',
    creatorSlug: 'tanaka',
    period: '2025-02',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    grossSales: 125000,
    platformFee: 12500,
    netAmount: 112500,
    status: 'pending',
    paidAt: null,
    bankName: '三菱UFJ銀行',
    accountHolder: 'タナカ タロウ'
  },
  {
    id: 2,
    creatorId: 2,
    creatorName: 'ゲーミングマスター',
    creatorSlug: 'gamingmaster',
    period: '2025-02',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    grossSales: 87000,
    platformFee: 8700,
    netAmount: 78300,
    status: 'pending',
    paidAt: null,
    bankName: 'みずほ銀行',
    accountHolder: 'ゲーミングマスター'
  },
  {
    id: 3,
    creatorId: 3,
    creatorName: 'さとうスポーツ',
    creatorSlug: 'satosports',
    period: '2025-02',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    grossSales: 45000,
    platformFee: 4500,
    netAmount: 40500,
    status: 'pending',
    paidAt: null,
    bankName: '楽天銀行',
    accountHolder: 'サトウ スポーツ'
  },
  {
    id: 4,
    creatorId: 1,
    creatorName: '田中太郎',
    creatorSlug: 'tanaka',
    period: '2025-01',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    grossSales: 98000,
    platformFee: 9800,
    netAmount: 88200,
    status: 'completed',
    paidAt: '2025-02-15',
    bankName: '三菱UFJ銀行',
    accountHolder: 'タナカ タロウ'
  },
  {
    id: 5,
    creatorId: 2,
    creatorName: 'ゲーミングマスター',
    creatorSlug: 'gamingmaster',
    period: '2025-01',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    grossSales: 156000,
    platformFee: 15600,
    netAmount: 140400,
    status: 'completed',
    paidAt: '2025-02-15',
    bankName: 'みずほ銀行',
    accountHolder: 'ゲーミングマスター'
  },
  {
    id: 6,
    creatorId: 4,
    creatorName: 'クリエイティブ花子',
    creatorSlug: 'creativeh',
    period: '2025-02',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    grossSales: 23000,
    platformFee: 2300,
    netAmount: 20700,
    status: 'processing',
    paidAt: null,
    bankName: '三井住友銀行',
    accountHolder: 'クリエイティブ ハナコ'
  }
];

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
    p.bankName,
    p.accountHolder
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
    emptyState.style.display = '';
    return;
  }

  emptyState?.classList.add('hidden');
  emptyState.style.display = 'none';

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
