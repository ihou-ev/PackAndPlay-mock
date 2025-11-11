// Pack&Play モックアップ - 共通JavaScript

// モーダル管理
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// モーダルの外側クリックで閉じる
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

// トースト通知
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const style = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
    color: 'white',
    fontWeight: '600',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: '9999',
    animation: 'slideIn 0.3s ease-out'
  };

  Object.assign(toast.style, style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// ローディングスピナー
function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'loading';
  loading.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #d946a6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
    </div>
  `;
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    document.body.removeChild(loading);
  }
}

// アニメーション用CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(20px); }
  }
`;
document.head.appendChild(styleSheet);

// カード開封アニメーション
function animatePackOpening(cardData, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'pack-opening-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease-out;
    ">
      <div class="card-reveal" style="
        text-align: center;
        animation: scaleIn 0.8s ease-out;
      ">
        <div style="
          font-size: 4rem;
          margin-bottom: 1rem;
        ">🎴</div>
        <div style="
          color: white;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        ">${cardData.name}</div>
        <div class="badge badge-rarity-${cardData.rarity.toLowerCase()}" style="
          font-size: 1.5rem;
          padding: 0.5rem 1.5rem;
        ">${cardData.rarity}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    document.body.removeChild(overlay);
    if (callback) callback();
  }, 3000);
}

const scaleInStyle = document.createElement('style');
scaleInStyle.textContent = `
  @keyframes scaleIn {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
document.head.appendChild(scaleInStyle);

// フォームバリデーション
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      field.style.borderColor = '#e5e7eb';
    }
  });

  return isValid;
}

// 確認ダイアログ
function confirmAction(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}

// ページネーション
function paginate(items, page = 1, perPage = 10) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    items: items.slice(start, end),
    totalPages: Math.ceil(items.length / perPage),
    currentPage: page
  };
}

// 検索フィルタリング
function filterItems(items, query, fields) {
  query = query.toLowerCase();
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(query);
    });
  });
}

// ソート
function sortItems(items, field, order = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}

// URLパラメータ取得
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// デバウンス
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// クリップボードにコピー
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('クリップボードにコピーしました', 'success');
  }).catch(() => {
    showToast('コピーに失敗しました', 'error');
  });
}

// セッション管理
function getCurrentSession() {
  return loadFromStorage('session', null);
}

function isLoggedIn() {
  const session = getCurrentSession();
  return session && session.isLoggedIn === true;
}

function requireLogin() {
  if (!isLoggedIn()) {
    showToast('ログインが必要です', 'error');
    setTimeout(() => {
      window.location.href = getRelativePath('index.html');
    }, 1000);
    return false;
  }
  return true;
}

function requireCreatorRole() {
  if (!isLoggedIn()) {
    showToast('ログインが必要です', 'error');
    setTimeout(() => {
      window.location.href = getRelativePath('index.html');
    }, 1000);
    return false;
  }

  const session = getCurrentSession();
  if (session.role !== 'creator') {
    showToast('配信者のみアクセス可能です', 'error');
    setTimeout(() => {
      window.location.href = getRelativePath('discover.html');
    }, 1000);
    return false;
  }

  return true;
}

function logout() {
  confirmAction('ログアウトしますか？', () => {
    localStorage.removeItem('session');
    showToast('ログアウトしました', 'success');
    setTimeout(() => {
      // プロトコルに応じて処理を分岐
      if (window.location.protocol === 'file:') {
        // file://の場合は相対パスを使用
        window.location.href = getRelativePath('index.html');
      } else {
        // HTTPの場合はルートからの絶対パスを使用
        window.location.href = '/index.html';
      }
    }, 1000);
  });
}

// 相対パスを計算するヘルパー
function getRelativePath(targetPath) {
  const currentPath = window.location.pathname;

  // ファイル名を除いたディレクトリパスを取得
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));

  // プロジェクトルート（PackAndPlay-mock）を基準にする
  let projectRootIndex = currentDir.lastIndexOf('PackAndPlay-mock');

  if (projectRootIndex === -1) {
    // プロジェクトルートが見つからない場合、フォールバック
    // ファイル名から深さを推定
    if (currentPath.includes('/dashboard/') || currentPath.includes('/creator/') && !currentPath.includes('/packs/') || currentPath.includes('/overlay/')) {
      // 1階層下
      return '../' + targetPath;
    } else if (currentPath.includes('/packs/')) {
      // 2階層下
      return '../../' + targetPath;
    } else {
      // ルート
      return targetPath;
    }
  }

  // プロジェクトルート以降のパスを取得
  const pathAfterRoot = currentDir.substring(projectRootIndex + 'PackAndPlay-mock'.length);

  // 深さを計算（空のセグメントを除外）
  const segments = pathAfterRoot.split('/').filter(s => s && s !== '.');
  const depth = segments.length;

  if (depth === 0) {
    // ルートディレクトリにいる場合
    return targetPath;
  } else {
    // 深さに応じて../を追加
    return '../'.repeat(depth) + targetPath;
  }
}

// ナビゲーションバーを更新
function updateNavbar() {
  const session = getCurrentSession();
  const navLinks = document.querySelector('.nav-links');

  if (!navLinks) return;

  if (isLoggedIn()) {
    // ログイン済み
    const role = session.role;

    if (role === 'creator') {
      // 配信者用ナビゲーション
      navLinks.innerHTML = `
        <li><a href="${getRelativePath('discover.html')}">配信者を探す</a></li>
        <li><a href="${getRelativePath('dashboard/index.html')}">ダッシュボード</a></li>
        <li><a href="${getRelativePath('dashboard/cards.html')}">カード管理</a></li>
        <li><a href="${getRelativePath('dashboard/redemptions.html')}">承認待ち</a></li>
        <li>
          <button class="btn btn-sm btn-outline" onclick="logout()" style="margin-left: 1rem;">
            ログアウト
          </button>
        </li>
      `;
    } else {
      // 視聴者用ナビゲーション
      navLinks.innerHTML = `
        <li><a href="${getRelativePath('discover.html')}">配信者を探す</a></li>
        <li><a href="${getRelativePath('inventory.html')}">マイカード</a></li>
        <li>
          <button class="btn btn-sm btn-outline" onclick="logout()" style="margin-left: 1rem;">
            ログアウト
          </button>
        </li>
      `;
    }
  } else {
    // 未ログイン
    navLinks.innerHTML = `
      <li><a href="${getRelativePath('discover.html')}">配信者を探す</a></li>
      <li>
        <a href="${getRelativePath('index.html')}" class="btn btn-sm btn-primary" style="margin-left: 1rem;">
          ログイン
        </a>
      </li>
    `;
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  // ナビゲーションバーを更新
  updateNavbar();

  // すべての閉じるボタンにイベントリスナーを追加
  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // すべてのモーダル開くボタンにイベントリスナーを追加
  document.querySelectorAll('[data-open-modal]').forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.getAttribute('data-open-modal');
      openModal(modalId);
    });
  });
});

// サイドバーナビゲーション生成（共通関数）
function renderSidebarNav(currentPage = '') {
  const sidebarNav = document.getElementById('sidebarNav');

  if (!sidebarNav) return;

  let navHTML = '';

  if (isLoggedIn()) {
    const session = getCurrentSession();
    const role = session.role;

    if (role === 'creator') {
      navHTML = `
        <a href="profile.html" class="sidebar-nav-link${currentPage === 'profile' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          プロフィール
        </a>
        <a href="discover.html" class="sidebar-nav-link${currentPage === 'discover' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          配信者を探す
        </a>
        <a href="dashboard/index.html" class="sidebar-nav-link${currentPage === 'dashboard' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"></path>
          </svg>
          ダッシュボード
        </a>
        <a href="history.html" class="sidebar-nav-link${currentPage === 'history' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          履歴
        </a>
        <a href="settings.html" class="sidebar-nav-link${currentPage === 'settings' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          設定
        </a>
        <a href="javascript:void(0)" onclick="logout()" class="sidebar-nav-link" style="margin-top: auto;">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          ログアウト
        </a>
      `;
    } else {
      navHTML = `
        <a href="profile.html" class="sidebar-nav-link${currentPage === 'profile' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          プロフィール
        </a>
        <a href="discover.html" class="sidebar-nav-link${currentPage === 'discover' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          配信者を探す
        </a>
        <a href="inventory.html" class="sidebar-nav-link${currentPage === 'inventory' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          マイカード
        </a>
        <a href="history.html" class="sidebar-nav-link${currentPage === 'history' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          履歴
        </a>
        <a href="settings.html" class="sidebar-nav-link${currentPage === 'settings' ? ' active' : ''}">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          設定
        </a>
        <a href="javascript:void(0)" onclick="logout()" class="sidebar-nav-link" style="margin-top: auto;">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          ログアウト
        </a>
      `;
    }
  } else {
    navHTML = `
      <a href="login.html" class="sidebar-nav-link">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
        </svg>
        ログイン
      </a>
    `;
  }

  sidebarNav.innerHTML = navHTML;
}
