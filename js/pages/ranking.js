// ranking.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // サイドバーのナビゲーションを生成（main.jsの共通関数を使用）
  renderSidebarNav('ranking');

  // 状態管理
  let currentPeriod = 'today';

  // スパーク数をフォーマット（K単位）
  function formatSparks(num) {
    if (num >= 1000) {
      const k = num / 1000;
      // 小数点1桁まで表示（.0の場合は整数表示）
      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return num.toString();
  }

  // 期間フィルター切り替え
  window.filterByPeriod = function() {
    currentPeriod = document.getElementById('periodSelect').value;
    renderRanking();
  };

  // ランキング表示
  function renderRanking() {
    const list = document.getElementById('rankingList');
    const followedCreators = getFollowedCreators();
    const followedIds = followedCreators.map(c => c.id);

    // スパーク消費量でソート
    let ranked = [...creators].sort((a, b) => {
      const aValue = a.sparksConsumed ? a.sparksConsumed[currentPeriod] : 0;
      const bValue = b.sparksConsumed ? b.sparksConsumed[currentPeriod] : 0;
      return bValue - aValue;
    });

    list.innerHTML = ranked.map((creator, index) => {
      const isFollowing = followedIds.includes(creator.id);
      const rank = index + 1;
      const sparks = creator.sparksConsumed ? creator.sparksConsumed[currentPeriod] : 0;
      const isTopThree = rank <= 3;

      // ランキングバッジのクラスを決定
      let badgeClass = '';
      if (rank === 1) badgeClass = ' gold';
      else if (rank === 2) badgeClass = ' silver';
      else if (rank === 3) badgeClass = ' bronze';

      const avatarContent = creator.slug === 'tanaka'
        ? `<img src="image/tanaka_avatar.png" alt="${creator.name}" class="creator-card-avatar-img">`
        : creator.name.charAt(0);
      const avatarClass = creator.slug === 'tanaka' ? 'creator-card-avatar has-image' : 'creator-card-avatar';
      const bannerStyle = creator.slug === 'tanaka'
        ? `background-image: url('image/tanaka_banner.png'); background-size: cover; background-position: center 35%;`
        : '';

      return `
        <div class="creator-card ranking-card" id="ranking-creator-${creator.id}">
          <a href="creator/${creator.slug}.html" class="creator-card-link"></a>
          <div class="creator-card-banner" style="${bannerStyle}">
            <div class="ranking-badge${badgeClass}">${rank}</div>
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
            <span class="sparks-consumed"><img src="image/spark.svg" alt="spark" class="spark-icon"> ${formatSparks(sparks)}</span>
          </div>
          <button class="creator-card-follow-btn${isFollowing ? ' following' : ' unfollow-style'}" onclick="${isFollowing ? `unfollowCreatorRanking(${creator.id}, event)` : `followCreatorRanking(${creator.id}, event)`}">
            ${isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        </div>
      `;
    }).join('');
  }

  // フォロー解除（ranking.js専用、main.jsの汎用関数を使用してHTML再描画）
  window.unfollowCreatorRanking = function(creatorId, event) {
    event.preventDefault();
    event.stopPropagation();

    const creator = creators.find(c => c.id === creatorId);
    const creatorName = creator ? creator.name : 'ストリーマー';

    // main.jsのshowUnfollowModalを使用
    showUnfollowModal(creatorId, creatorName, function() {
      // フォロー解除後にHTML再描画
      renderRanking();
    });
  };

  // フォローする（ranking.js専用、HTML再描画）
  window.followCreatorRanking = function(creatorId, event) {
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
    renderRanking();
  };

  // 初期表示
  renderRanking();

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
