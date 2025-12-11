/**
 * ストリーマー管理ページ
 */

let filteredCreators = [...creators];
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

  // クリエイター一覧を表示
  renderCreators();

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
 * 統計サマリーを更新
 */
function updateStatsSummary() {
  const totalCreators = creators.length;
  const liveCount = creators.filter(c => c.isLive).length;
  const totalSales = creators.reduce((sum, c) => sum + (c.totalSales || 0), 0);
  const totalPacks = creators.reduce((sum, c) => sum + (c.packCount || 0), 0);

  document.getElementById('totalCreators').textContent = totalCreators;
  document.getElementById('liveCount').textContent = liveCount;
  document.getElementById('totalSales').textContent = `¥${totalSales.toLocaleString()}`;
  document.getElementById('totalPacks').textContent = totalPacks;
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // 検索入力
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      filterCreators();
    }, 300));
  }

  // ステータスフィルタ
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', filterCreators);
  }

  // ソート
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', filterCreators);
  }
}

/**
 * クリエイターをフィルタリング
 */
function filterCreators() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const sortFilter = document.getElementById('sortFilter')?.value || 'sales';

  filteredCreators = creators.filter(creator => {
    const matchesSearch = !searchQuery ||
      creator.name.toLowerCase().includes(searchQuery) ||
      creator.displayName.toLowerCase().includes(searchQuery) ||
      creator.slug.toLowerCase().includes(searchQuery);

    const matchesStatus = !statusFilter ||
      (statusFilter === 'live' && creator.isLive) ||
      (statusFilter === 'offline' && !creator.isLive);

    return matchesSearch && matchesStatus;
  });

  // ソート
  switch (sortFilter) {
    case 'sales':
      filteredCreators.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
      break;
    case 'followers':
      filteredCreators.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
      break;
    case 'packs':
      filteredCreators.sort((a, b) => (b.packCount || 0) - (a.packCount || 0));
      break;
    case 'name':
      filteredCreators.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      break;
  }

  currentPage = 1;
  renderCreators();
}

/**
 * クリエイター一覧を表示
 */
function renderCreators() {
  renderCreatorsTable();
  renderCreatorsCards();
  renderPagination();
}

/**
 * テーブル形式でクリエイターを表示
 */
function renderCreatorsTable() {
  const tbody = document.getElementById('creatorsTableBody');
  const emptyState = document.getElementById('emptyState');

  if (!tbody) return;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageCreators = filteredCreators.slice(start, end);

  if (filteredCreators.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = pageCreators.map(creator => `
    <tr>
      <td>
        <div class="creator-info">
          <div class="creator-avatar">
            ${creator.avatarUrl
              ? `<img src="${creator.avatarUrl}" alt="${creator.name}">`
              : creator.name.charAt(0)
            }
          </div>
          <div>
            <div class="creator-name">${creator.displayName}</div>
            <div class="creator-slug">@${creator.slug}</div>
          </div>
        </div>
      </td>
      <td>
        ${creator.isLive
          ? '<span class="live-indicator">LIVE</span>'
          : '<span class="offline-indicator">オフライン</span>'
        }
      </td>
      <td class="numeric-cell">${(creator.followerCount || 0).toLocaleString()}</td>
      <td class="numeric-cell">${creator.packCount || 0}</td>
      <td class="numeric-cell">¥${(creator.totalSales || 0).toLocaleString()}</td>
      <td class="actions-cell">
        <button class="action-button action-button-view" onclick="viewCreator('${creator.slug}')">詳細</button>
        <button class="action-button action-button-edit" onclick="editCreator('${creator.slug}')">編集</button>
        <button class="action-button action-button-suspend" onclick="suspendCreator('${creator.slug}')">停止</button>
      </td>
    </tr>
  `).join('');
}

/**
 * カード形式でクリエイターを表示（モバイル用）
 */
function renderCreatorsCards() {
  const container = document.getElementById('creatorsCards');

  if (!container) return;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageCreators = filteredCreators.slice(start, end);

  if (filteredCreators.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = pageCreators.map(creator => `
    <div class="creator-card">
      <div class="creator-card-header">
        <div class="creator-avatar">
          ${creator.avatarUrl
            ? `<img src="${creator.avatarUrl}" alt="${creator.name}">`
            : creator.name.charAt(0)
          }
        </div>
        <div class="creator-card-info">
          <div class="creator-card-name">${creator.displayName}</div>
          <div class="creator-card-slug">@${creator.slug}</div>
        </div>
        ${creator.isLive
          ? '<span class="live-indicator">LIVE</span>'
          : '<span class="offline-indicator">オフライン</span>'
        }
      </div>
      <div class="creator-card-details">
        <div class="creator-card-detail">
          <span class="creator-card-detail-label">フォロワー: </span>${(creator.followerCount || 0).toLocaleString()}
        </div>
        <div class="creator-card-detail">
          <span class="creator-card-detail-label">パック数: </span>${creator.packCount || 0}
        </div>
        <div class="creator-card-detail">
          <span class="creator-card-detail-label">総売上: </span>¥${(creator.totalSales || 0).toLocaleString()}
        </div>
      </div>
      <div class="creator-card-actions">
        <button class="action-button action-button-view" onclick="viewCreator('${creator.slug}')">詳細</button>
        <button class="action-button action-button-edit" onclick="editCreator('${creator.slug}')">編集</button>
        <button class="action-button action-button-suspend" onclick="suspendCreator('${creator.slug}')">停止</button>
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

  const totalPages = Math.ceil(filteredCreators.length / perPage);
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, filteredCreators.length);

  paginationInfo.textContent = `${start}-${end} / ${filteredCreators.length}件`;

  if (totalPages <= 1) {
    paginationButtons.innerHTML = '';
    return;
  }

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
  const totalPages = Math.ceil(filteredCreators.length / perPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderCreators();
  window.scrollTo(0, 0);
}

/**
 * クリエイター詳細を表示
 */
function viewCreator(slug) {
  const creator = creators.find(c => c.slug === slug);
  if (creator) {
    // tanakaの場合は実際のページへ遷移
    if (slug === 'tanaka') {
      window.location.href = '../creator/tanaka.html';
    } else {
      showToast(`${creator.displayName}の詳細を表示（モック）`, 'info');
    }
  }
}

/**
 * クリエイターを編集
 */
function editCreator(slug) {
  const creator = creators.find(c => c.slug === slug);
  if (creator) {
    showToast(`${creator.displayName}を編集（モック）`, 'info');
  }
}

/**
 * クリエイターを停止
 */
function suspendCreator(slug) {
  const creator = creators.find(c => c.slug === slug);
  if (creator) {
    if (confirm(`${creator.displayName}を停止しますか？`)) {
      showToast(`${creator.displayName}を停止しました（モック）`, 'success');
    }
  }
}
