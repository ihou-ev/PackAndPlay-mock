/**
 * レポート・分析ページ
 */

let currentPeriod = 'month';

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // KPIを表示
  renderKPIs();

  // チャートを表示
  renderCharts();

  // ランキングを表示
  renderRankings();

  // 最近の取引を表示
  renderTransactions();

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
      <a href="${item.href}" class="sidebar-nav-link ${isActive ? 'active' : ''}">
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span class="sidebar-nav-label">${item.label}</span>
      </a>
    `;
  }).join('');
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // 期間選択ボタン
  const periodButtons = document.querySelectorAll('.period-button');
  periodButtons.forEach(button => {
    button.addEventListener('click', () => {
      periodButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      currentPeriod = button.dataset.period;
      updateReportData();
    });
  });
}

/**
 * レポートデータを更新
 */
function updateReportData() {
  renderKPIs();
  renderCharts();
  showToast(`${getPeriodLabel(currentPeriod)}のデータを表示`, 'info');
}

/**
 * 期間ラベルを取得
 */
function getPeriodLabel(period) {
  const labels = {
    today: '今日',
    week: '今週',
    month: '今月',
    year: '今年'
  };
  return labels[period] || period;
}

/**
 * KPIを表示
 */
function renderKPIs() {
  // 期間に応じたモックデータ
  const kpiData = getKPIData(currentPeriod);

  document.getElementById('totalSales').textContent = `¥${kpiData.sales.toLocaleString()}`;
  document.getElementById('salesChange').textContent = `${kpiData.salesChange > 0 ? '+' : ''}${kpiData.salesChange}%`;
  document.getElementById('salesChange').className = `kpi-change kpi-change-${kpiData.salesChange >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('totalTransactions').textContent = kpiData.transactions.toLocaleString();
  document.getElementById('transactionsChange').textContent = `${kpiData.transactionsChange > 0 ? '+' : ''}${kpiData.transactionsChange}%`;
  document.getElementById('transactionsChange').className = `kpi-change kpi-change-${kpiData.transactionsChange >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('newUsers').textContent = kpiData.newUsers.toLocaleString();
  document.getElementById('usersChange').textContent = `${kpiData.usersChange > 0 ? '+' : ''}${kpiData.usersChange}%`;
  document.getElementById('usersChange').className = `kpi-change kpi-change-${kpiData.usersChange >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('newCreators').textContent = kpiData.newCreators.toLocaleString();
  document.getElementById('creatorsChange').textContent = `${kpiData.creatorsChange > 0 ? '+' : ''}${kpiData.creatorsChange}%`;
  document.getElementById('creatorsChange').className = `kpi-change kpi-change-${kpiData.creatorsChange >= 0 ? 'positive' : 'negative'}`;
}

/**
 * 期間別KPIデータを取得
 */
function getKPIData(period) {
  const data = {
    today: {
      sales: 24500,
      salesChange: 12,
      transactions: 45,
      transactionsChange: 8,
      newUsers: 15,
      usersChange: 5,
      newCreators: 1,
      creatorsChange: 0
    },
    week: {
      sales: 178000,
      salesChange: 15,
      transactions: 312,
      transactionsChange: 10,
      newUsers: 89,
      usersChange: 12,
      newCreators: 5,
      creatorsChange: 25
    },
    month: {
      sales: 856000,
      salesChange: 23,
      transactions: 1450,
      transactionsChange: 18,
      newUsers: 425,
      usersChange: 20,
      newCreators: 18,
      creatorsChange: 15
    },
    year: {
      sales: 12500000,
      salesChange: 45,
      transactions: 18500,
      transactionsChange: 35,
      newUsers: 5200,
      usersChange: 42,
      newCreators: 156,
      creatorsChange: 38
    }
  };

  return data[period] || data.month;
}

/**
 * チャートを表示（簡易棒グラフ）
 */
function renderCharts() {
  const chartData = getChartData(currentPeriod);
  const salesChart = document.getElementById('salesChart');

  if (salesChart) {
    const maxValue = Math.max(...chartData.map(d => d.sales));

    salesChart.innerHTML = chartData.map(item => `
      <div class="bar-row">
        <div class="bar-label">${item.label}</div>
        <div class="bar-wrapper">
          <div class="bar bar-sales" style="width: ${(item.sales / maxValue * 100)}%"></div>
        </div>
        <div class="bar-value">¥${item.sales.toLocaleString()}</div>
      </div>
    `).join('');
  }
}

/**
 * チャートデータを取得
 */
function getChartData(period) {
  const data = {
    today: [
      { label: '0-6時', sales: 3200 },
      { label: '6-12時', sales: 5800 },
      { label: '12-18時', sales: 8500 },
      { label: '18-24時', sales: 7000 }
    ],
    week: [
      { label: '月', sales: 22000 },
      { label: '火', sales: 18500 },
      { label: '水', sales: 25000 },
      { label: '木', sales: 31000 },
      { label: '金', sales: 28500 },
      { label: '土', sales: 35000 },
      { label: '日', sales: 18000 }
    ],
    month: [
      { label: '1週目', sales: 185000 },
      { label: '2週目', sales: 210000 },
      { label: '3週目', sales: 245000 },
      { label: '4週目', sales: 216000 }
    ],
    year: [
      { label: '1Q', sales: 2800000 },
      { label: '2Q', sales: 3200000 },
      { label: '3Q', sales: 3500000 },
      { label: '4Q', sales: 3000000 }
    ]
  };

  return data[period] || data.month;
}

/**
 * ランキングを表示
 */
function renderRankings() {
  // 売上ランキング
  const salesRanking = [...creators]
    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
    .slice(0, 5);

  const salesRankingEl = document.getElementById('salesRanking');
  if (salesRankingEl) {
    salesRankingEl.innerHTML = salesRanking.map((creator, index) => `
      <div class="ranking-item">
        <div class="ranking-position ranking-position-${index < 3 ? index + 1 : 'default'}">
          ${index + 1}
        </div>
        <div class="ranking-avatar">
          ${creator.avatarUrl
            ? `<img src="${creator.avatarUrl}" alt="${creator.name}">`
            : creator.name.charAt(0)
          }
        </div>
        <div class="ranking-info">
          <div class="ranking-name">${creator.displayName}</div>
        </div>
        <div class="ranking-value">¥${(creator.totalSales || 0).toLocaleString()}</div>
      </div>
    `).join('');
  }

  // フォロワーランキング
  const followerRanking = [...creators]
    .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0))
    .slice(0, 5);

  const followerRankingEl = document.getElementById('followerRanking');
  if (followerRankingEl) {
    followerRankingEl.innerHTML = followerRanking.map((creator, index) => `
      <div class="ranking-item">
        <div class="ranking-position ranking-position-${index < 3 ? index + 1 : 'default'}">
          ${index + 1}
        </div>
        <div class="ranking-avatar">
          ${creator.avatarUrl
            ? `<img src="${creator.avatarUrl}" alt="${creator.name}">`
            : creator.name.charAt(0)
          }
        </div>
        <div class="ranking-info">
          <div class="ranking-name">${creator.displayName}</div>
        </div>
        <div class="ranking-value">${(creator.followerCount || 0).toLocaleString()}</div>
      </div>
    `).join('');
  }
}

/**
 * 最近の取引を表示
 */
function renderTransactions() {
  const transactions = [
    { id: 1, type: 'purchase', user: '田中太郎', pack: 'スターターパック', amount: 500, time: '5分前' },
    { id: 2, type: 'purchase', user: '鈴木花子', pack: 'プレミアムパック', amount: 1500, time: '15分前' },
    { id: 3, type: 'withdrawal', user: 'GameMaster', pack: '-', amount: -50000, time: '1時間前' },
    { id: 4, type: 'purchase', user: '佐藤健太', pack: 'スターターパック', amount: 500, time: '2時間前' },
    { id: 5, type: 'refund', user: '山田美咲', pack: 'プレミアムパック', amount: -1500, time: '3時間前' },
    { id: 6, type: 'purchase', user: '伊藤翔', pack: 'レアパック', amount: 2000, time: '4時間前' },
    { id: 7, type: 'purchase', user: '渡辺真理', pack: 'スターターパック', amount: 500, time: '5時間前' }
  ];

  const tbody = document.getElementById('transactionsTableBody');
  if (tbody) {
    tbody.innerHTML = transactions.map(tx => `
      <tr>
        <td>${tx.time}</td>
        <td>
          <span class="transaction-type transaction-type-${tx.type}">
            ${getTransactionTypeLabel(tx.type)}
          </span>
        </td>
        <td>${tx.user}</td>
        <td>${tx.pack}</td>
        <td class="transaction-amount ${tx.amount >= 0 ? 'transaction-amount-positive' : 'transaction-amount-negative'}">
          ${tx.amount >= 0 ? '+' : ''}¥${Math.abs(tx.amount).toLocaleString()}
        </td>
      </tr>
    `).join('');
  }
}

/**
 * 取引タイプラベルを取得
 */
function getTransactionTypeLabel(type) {
  const labels = {
    purchase: '購入',
    withdrawal: '出金',
    refund: '返金'
  };
  return labels[type] || type;
}

/**
 * CSVエクスポート
 */
function exportCSV() {
  showToast('CSVエクスポート（モック）', 'info');
}

/**
 * PDFエクスポート
 */
function exportPDF() {
  showToast('PDFエクスポート（モック）', 'info');
}
