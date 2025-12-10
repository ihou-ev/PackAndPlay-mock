// discover.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // サイドバーのナビゲーションを生成（main.jsの共通関数を使用）
  renderSidebarNav('discover');

  // 状態管理
  let currentSort = 'followers';
  let searchQuery = '';

  // ソート変更
  window.sortCreators = function() {
    currentSort = document.getElementById('sortSelect').value;
    renderCreators();
  };

  // ストリーマーリスト表示
  function renderCreators() {
    const list = document.getElementById('creatorsList');
    const emptyState = document.getElementById('emptyState');
    const followedCreators = getFollowedCreators();
    const followedIds = followedCreators.map(c => c.id);

    // フィルタリング
    let filtered = [...creators];

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ソート
    if (currentSort === 'followers') {
      filtered.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
    } else if (currentSort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    } else if (currentSort === 'live') {
      filtered.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      list.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    list.innerHTML = filtered.map(creator => {
      const isFollowing = followedIds.includes(creator.id);
      const avatarContent = creator.slug === 'tanaka'
        ? `<img src="image/tanaka_avatar.png" alt="${creator.name}" class="creator-card-avatar-img">`
        : creator.name.charAt(0);
      const avatarClass = creator.slug === 'tanaka' ? 'creator-card-avatar has-image' : 'creator-card-avatar';
      const bannerStyle = creator.slug === 'tanaka'
        ? `background-image: url('image/tanaka_banner.png'); background-size: cover; background-position: center 35%;`
        : '';

      return `
        <div class="creator-card" id="creator-${creator.id}">
          <a href="creator/${creator.slug}.html" class="creator-card-link"></a>
          <div class="creator-card-banner" style="${bannerStyle}">
            <div class="creator-card-avatar-wrapper">
              <div class="${avatarClass}">
                ${avatarContent}
              </div>
            </div>
          </div>
          <div class="creator-card-info">
            <div class="creator-card-text">
              <div class="creator-card-name">${creator.name}${creator.isLive ? '<span class="live-badge-inline">LIVE</span>' : ''}</div>
              <div class="creator-card-id">@${creator.slug}</div>
              ${creator.bio ? `<div class="creator-card-bio">${creator.bio}</div>` : ''}
            </div>
          </div>
          <div class="creator-card-stats">
            <img src="image/follower.svg" alt="followers" class="follower-icon"> ${(creator.followerCount || 0).toLocaleString()}
          </div>
          <button class="creator-card-follow-btn${isFollowing ? ' following' : ' unfollow-style'}" onclick="${isFollowing ? `unfollowCreatorDiscover(${creator.id}, event)` : `followCreatorDiscover(${creator.id}, event)`}">
            ${isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        </div>
      `;
    }).join('');
  }

  // フォロー解除（discover.js専用、main.jsの汎用関数を使用してHTML再描画）
  window.unfollowCreatorDiscover = function(creatorId, event) {
    event.preventDefault();
    event.stopPropagation();

    const creator = creators.find(c => c.id === creatorId);
    const creatorName = creator ? creator.name : 'ストリーマー';

    // main.jsのshowUnfollowModalを使用
    showUnfollowModal(creatorId, creatorName, function() {
      // フォロー解除後にHTML再描画
      renderCreators();
    });
  };

  // フォローする（discover.js専用、HTML再描画）
  window.followCreatorDiscover = function(creatorId, event) {
    event.preventDefault();
    event.stopPropagation();

    toggleFollow(creatorId);

    // フォロー中カウント更新
    const followingCountEl = document.getElementById('followingCount');
    if (followingCountEl) {
      const followedCreators = getFollowedCreators();
      followingCountEl.textContent = followedCreators.length;
    }

    // フォロー後にHTML再描画
    renderCreators();
  };

  // 検索
  document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    renderCreators();
  });

  // 初期表示
  renderCreators();

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
});
