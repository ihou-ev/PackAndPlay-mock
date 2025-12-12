/**
 * ストリーマー管理ページ
 */

let filteredCreators = [...creators];
let currentCreatorSlug = null;
let currentTab = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 統計サマリーを更新
  updateStatsSummary();

  // ストリーマー一覧を表示
  renderCreatorList();
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
  const totalCreators = creators.length;
  const liveCreators = creators.filter(c => c.isLive).length;
  const pendingCreators = 2; // モック値

  document.getElementById('totalCreators').textContent = totalCreators;
  document.getElementById('liveCreators').textContent = liveCreators;
  document.getElementById('pendingCreators').textContent = pendingCreators;
}

/**
 * タブを切り替え
 */
function switchTab(tab) {
  currentTab = tab;

  // タブのアクティブ状態を更新
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  applyFilters();
}

/**
 * フィルターを適用
 */
function applyFilters() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sortFilter = document.getElementById('sortFilter')?.value || 'followers';

  // タブでフィルタ
  filteredCreators = creators.filter(creator => {
    // 検索フィルタ
    const matchesSearch = !searchQuery ||
      creator.name.toLowerCase().includes(searchQuery) ||
      creator.displayName.toLowerCase().includes(searchQuery) ||
      creator.slug.toLowerCase().includes(searchQuery);

    // タブフィルタ
    let matchesTab = true;
    if (currentTab === 'live') {
      matchesTab = creator.isLive;
    } else if (currentTab === 'pending') {
      matchesTab = creator.status === 'pending';
    } else if (currentTab === 'suspended') {
      matchesTab = creator.status === 'suspended';
    }

    return matchesSearch && matchesTab;
  });

  // ソート
  switch (sortFilter) {
    case 'followers':
      filteredCreators.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
      break;
    case 'sales':
      filteredCreators.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
      break;
    case 'newest':
      filteredCreators.sort((a, b) => b.id - a.id);
      break;
    case 'oldest':
      filteredCreators.sort((a, b) => a.id - b.id);
      break;
  }

  renderCreatorList();
}

/**
 * ストリーマー一覧を表示
 */
function renderCreatorList() {
  const container = document.getElementById('creatorList');
  const emptyState = document.getElementById('emptyState');

  if (!container) return;

  if (filteredCreators.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  container.innerHTML = filteredCreators.map(creator => `
    <div class="creator-card" onclick="openCreatorModal('${creator.slug}')">
      <div class="creator-card-banner" style="${creator.bannerUrl ? `background-image: url('${creator.bannerUrl}')` : ''}"></div>
      <div class="creator-card-content">
        <div class="creator-card-main">
          <div class="creator-avatar">
            ${creator.avatarUrl
              ? `<img src="${creator.avatarUrl}" alt="${creator.name}">`
              : creator.name.charAt(0)
            }
          </div>
          <div class="creator-card-info">
            <div class="creator-card-name">
              ${creator.displayName}
              ${creator.isLive ? '<span class="live-badge">LIVE</span>' : ''}
            </div>
            <div class="creator-card-channel">@${creator.slug}</div>
          </div>
          <div class="creator-card-badges">
            <span class="badge badge-status-${creator.status || 'active'}">${getStatusLabel(creator.status || 'active')}</span>
          </div>
        </div>
        <div class="creator-card-stats">
          <div class="creator-card-stat">
            <div class="creator-card-stat-value">${(creator.followerCount || 0).toLocaleString()}</div>
            <div class="creator-card-stat-label">フォロワー</div>
          </div>
          <div class="creator-card-stat">
            <div class="creator-card-stat-value">¥${(creator.totalSales || 0).toLocaleString()}</div>
            <div class="creator-card-stat-label">売上</div>
          </div>
          <div class="creator-card-stat">
            <div class="creator-card-stat-value">${creator.packCount || 0}</div>
            <div class="creator-card-stat-label">パック</div>
          </div>
        </div>
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
    pending: '審査待ち'
  };
  return labels[status] || status;
}

/**
 * ストリーマーモーダルを開く
 */
function openCreatorModal(slug) {
  const creator = creators.find(c => c.slug === slug);
  if (!creator) return;

  currentCreatorSlug = slug;

  // バナー
  const bannerEl = document.getElementById('modalCreatorBanner');
  if (creator.bannerUrl) {
    bannerEl.style.backgroundImage = `url('${creator.bannerUrl}')`;
  } else {
    bannerEl.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // アバター
  const avatarEl = document.getElementById('modalCreatorAvatar');
  if (creator.avatarUrl) {
    avatarEl.innerHTML = `<img src="${creator.avatarUrl}" alt="${creator.name}">`;
  } else {
    avatarEl.innerHTML = creator.name.charAt(0);
  }

  // 基本情報
  document.getElementById('modalCreatorName').textContent = creator.displayName;
  document.getElementById('modalCreatorChannel').textContent = `@${creator.slug}`;

  // ステータスバッジ
  const statusBadge = document.getElementById('modalCreatorStatus');
  statusBadge.textContent = getStatusLabel(creator.status || 'active');
  statusBadge.className = `badge badge-status-${creator.status || 'active'}`;

  // LIVEバッジ
  const liveBadge = document.getElementById('modalCreatorLive');
  liveBadge.classList.toggle('hidden', !creator.isLive);

  // 統計
  document.getElementById('modalCreatorFollowers').textContent = (creator.followerCount || 0).toLocaleString();
  document.getElementById('modalCreatorSales').textContent = `¥${(creator.totalSales || 0).toLocaleString()}`;
  document.getElementById('modalCreatorPacks').textContent = creator.packCount || 0;
  document.getElementById('modalCreatorCards').textContent = (creator.packCount || 0) * 5; // モック計算

  // プロフィール
  document.getElementById('modalCreatorBio').textContent = creator.bio || '未設定';

  // アカウント情報
  document.getElementById('modalCreatorRegistered').textContent = '2025年1月10日'; // モック
  document.getElementById('modalCreatorPlatform').textContent = 'YouTube';
  document.getElementById('modalCreatorFeeRate').textContent = '10%';
  document.getElementById('modalCreatorBank').textContent = creator.id === 1 ? '設定済み' : '未設定';

  // 停止/有効化ボタン
  const suspendBtn = document.getElementById('modalSuspendBtn');
  if (creator.status === 'suspended') {
    suspendBtn.textContent = 'アカウント有効化';
    suspendBtn.className = 'button button-success';
  } else {
    suspendBtn.textContent = 'アカウント停止';
    suspendBtn.className = 'button button-warning';
  }

  // モーダル表示
  document.getElementById('creatorModal').classList.add('active');
}

/**
 * ストリーマーモーダルを閉じる
 */
function closeCreatorModal() {
  document.getElementById('creatorModal').classList.remove('active');
  currentCreatorSlug = null;
}

/**
 * クリエイターページを開く
 */
function viewCreatorPage() {
  if (!currentCreatorSlug) return;

  if (currentCreatorSlug === 'tanaka') {
    window.open('../creator/tanaka.html', '_blank');
  } else {
    showToast('このストリーマーのページはモックでは利用できません', 'info');
  }
}

/**
 * ストリーマーの停止/有効化を切り替え
 */
function toggleCreatorSuspend() {
  if (!currentCreatorSlug) return;

  const creator = creators.find(c => c.slug === currentCreatorSlug);
  if (!creator) return;

  if (creator.status === 'suspended') {
    // 有効化
    creator.status = 'active';
    updateStatsSummary();
    renderCreatorList();
    closeCreatorModal();
    showToast(`${creator.displayName}を有効化しました`, 'success');
  } else {
    // 停止確認
    showConfirmModal(
      '⚠️',
      'アカウント停止',
      `${creator.displayName}のアカウントを停止しますか？\n配信中のパック販売も停止されます。`,
      () => {
        creator.status = 'suspended';
        updateStatsSummary();
        renderCreatorList();
        closeCreatorModal();
        showToast(`${creator.displayName}を停止しました`, 'success');
      }
    );
  }
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
