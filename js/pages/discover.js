// discover.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // サイドバーのナビゲーションを生成（main.jsの共通関数を使用）
  renderSidebarNav('discover');

  // 状態管理
  let currentTab = 'ranking';
  let currentPeriod = 'today';
  let currentSort = 'followers';
  let searchQuery = '';

  // スパーク数をフォーマット（K単位）
  function formatSparks(num) {
    if (num >= 1000) {
      const k = num / 1000;
      // 小数点1桁まで表示（.0の場合は整数表示）
      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return num.toString();
  }

  // タブ切り替え
  window.switchTab = function(tab) {
    currentTab = tab;

    // タブボタンのアクティブ状態を更新
    document.getElementById('rankingTab').classList.toggle('active', tab === 'ranking');
    document.getElementById('allListTab').classList.toggle('active', tab === 'allList');

    // コンテンツの表示切り替え
    document.getElementById('rankingContent').classList.toggle('active', tab === 'ranking');
    document.getElementById('allListContent').classList.toggle('active', tab === 'allList');

    // 表示を更新
    if (tab === 'ranking') {
      renderRanking();
    } else {
      renderCreators();
    }
  };

  // 期間フィルター切り替え（ランキング用）
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

      return `
        <div class="creator-card ranking-card" id="ranking-creator-${creator.id}">
          <a href="creator/${creator.slug}.html" class="creator-card-link"></a>
          <div class="creator-card-banner">
            <div class="ranking-badge${badgeClass}">${rank}</div>
            <div class="creator-card-avatar-wrapper">
              <div class="creator-card-avatar">
                ${creator.name.charAt(0)}
                ${creator.isLive ? '<span class="live-signal"></span>' : ''}
              </div>
            </div>
          </div>
          <div class="creator-card-info">
            <div class="creator-card-text">
              <div class="creator-card-name">${creator.name}</div>
              <div class="creator-card-id">@${creator.slug}</div>
              ${creator.bio ? `<div class="creator-card-bio">${creator.bio}</div>` : ''}
            </div>
          </div>
          <div class="creator-card-stats">
            <span class="sparks-consumed">${formatSparks(sparks)} スパーク</span>
          </div>
          <button class="creator-card-follow-btn${isFollowing ? ' following' : ' unfollow-style'}" onclick="${isFollowing ? `unfollowCreatorDiscover(${creator.id}, event, 'ranking')` : `followCreatorDiscover(${creator.id}, event, 'ranking')`}">
            ${isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        </div>
      `;
    }).join('');
  }

  // ソート変更（全体の一覧用）
  window.sortCreators = function() {
    currentSort = document.getElementById('sortSelect').value;
    renderCreators();
  };

  // 配信者リスト表示（全体の一覧）
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
      return `
        <div class="creator-card" id="creator-${creator.id}">
          <a href="creator/${creator.slug}.html" class="creator-card-link"></a>
          <div class="creator-card-banner">
            <div class="creator-card-avatar-wrapper">
              <div class="creator-card-avatar">
                ${creator.name.charAt(0)}
                ${creator.isLive ? '<span class="live-signal"></span>' : ''}
              </div>
            </div>
          </div>
          <div class="creator-card-info">
            <div class="creator-card-text">
              <div class="creator-card-name">${creator.name}</div>
              <div class="creator-card-id">@${creator.slug}</div>
              ${creator.bio ? `<div class="creator-card-bio">${creator.bio}</div>` : ''}
            </div>
          </div>
          <div class="creator-card-stats">
            <img src="../image/follower.png" alt="followers" class="follower-icon"> ${(creator.followerCount || 0).toLocaleString()}
          </div>
          <button class="creator-card-follow-btn${isFollowing ? ' following' : ' unfollow-style'}" onclick="${isFollowing ? `unfollowCreatorDiscover(${creator.id}, event, 'list')` : `followCreatorDiscover(${creator.id}, event, 'list')`}">
            ${isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        </div>
      `;
    }).join('');
  }

  // フォロー解除（discover.js専用、main.jsの汎用関数を使用してHTML再描画）
  window.unfollowCreatorDiscover = function(creatorId, event, source) {
    event.preventDefault();
    event.stopPropagation();

    const creator = creators.find(c => c.id === creatorId);
    const creatorName = creator ? creator.name : '配信者';

    // main.jsのshowUnfollowModalを使用
    showUnfollowModal(creatorId, creatorName, function() {
      // フォロー解除後にHTML再描画
      if (currentTab === 'ranking') {
        renderRanking();
      } else {
        renderCreators();
      }
    });
  };

  // フォローする（discover.js専用、HTML再描画）
  window.followCreatorDiscover = function(creatorId, event, source) {
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
    if (currentTab === 'ranking') {
      renderRanking();
    } else {
      renderCreators();
    }
  };

  // 検索
  document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    renderCreators();
  });

  // 初期表示（ランキングタブを表示）
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
