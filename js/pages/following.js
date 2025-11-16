// ログインチェック
if (!requireLogin()) {
  // ログインが必要な場合、requireLogin関数内でリダイレクトされる
}

// セッション情報を取得
const session = getCurrentSession();


// フォロー中のストリーマーを表示
function renderFollowingCreators(sortBy = 'default') {
  const followingGrid = document.getElementById('followingGrid');
  const followingEmpty = document.getElementById('followingEmpty');
  const followingCount = document.getElementById('followingCount');

  const allFollowedCreators = getFollowedCreators();

  if (allFollowedCreators.length === 0) {
    followingGrid.innerHTML = '';
    followingEmpty.style.display = 'block';
    followingCount.textContent = '0';
    return;
  }

  followingEmpty.style.display = 'none';
  followingCount.textContent = allFollowedCreators.length;

  // 並び替え
  let sortedCreators = [...allFollowedCreators];
  if (sortBy === 'name') {
    sortedCreators.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  } else if (sortBy === 'live') {
    sortedCreators.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return 0;
    });
  }

  followingGrid.innerHTML = sortedCreators.map(creator => {
    const avatarContent = creator.slug === 'tanaka'
      ? `<img src="image/tanaka_avatar.png" alt="${creator.name}" class="following-avatar-img">`
      : creator.name.charAt(0);
    const avatarClass = creator.slug === 'tanaka' ? 'following-avatar has-image' : 'following-avatar';

    return `
      <div class="following-card" id="creator-${creator.id}">
        <a href="creator/${creator.slug}.html" class="following-card-link">
          <div class="following-avatar-wrapper">
            <div class="${avatarClass}">
              ${avatarContent}
            </div>
            ${creator.isLive ? '<span class="following-live-signal"></span>' : ''}
          </div>
          <div class="following-info">
            <div class="following-name">${creator.name}</div>
            <div class="following-bio">${creator.bio || ''}</div>
          </div>
        </a>
        <button class="following-button" onclick="unfollowCreator(${creator.id}, event)">
          <span>フォロー中</span>
        </button>
      </div>
    `;
  }).join('');
}

function sortFollowingCreators() {
  const sortBy = document.getElementById('sortSelect').value;
  renderFollowingCreators(sortBy);
}

// showUnfollowModalをオーバーライド（following.js用にHTML再描画を追加）
showUnfollowModal = function(creatorId, creatorName, updateCallback) {
  const modal = document.getElementById('unfollowModal');
  const message = document.getElementById('unfollowModalMessage');
  const confirmButton = document.getElementById('unfollowConfirmButton');

  message.textContent = `${creatorName}のフォローを解除しますか？`;

  confirmButton.onclick = function() {
    toggleFollow(creatorId);

    // カスタム更新処理があれば実行
    if (updateCallback) {
      updateCallback(creatorId, false);
    }

    // フォロー中リスト更新（following.js固有処理）
    renderFollowingCreators();

    // フォロー中カウント更新
    const followingCountEl = document.getElementById('followingCount');
    if (followingCountEl) {
      const followedCreators = getFollowedCreators();
      followingCountEl.textContent = followedCreators.length;
    }

    closeUnfollowModal();
  };

  modal.classList.add('active');
};

// モバイルメニュー
window.toggleMobileMenu = function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileMenuOverlay');
  sidebar.classList.toggle('mobile-active');
  overlay.classList.toggle('active');
};

window.closeMobileMenu = function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileMenuOverlay');
  sidebar.classList.remove('mobile-active');
  overlay.classList.remove('active');
};

// 初期表示
renderSidebarNav(''); // main.jsの共通関数を使用
renderFollowingCreators();
