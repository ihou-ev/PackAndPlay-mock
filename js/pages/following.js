// ログインチェック
if (!requireLogin()) {
  // ログインが必要な場合、requireLogin関数内でリダイレクトされる
}

// セッション情報を取得
const session = getCurrentSession();


// フォロー中の配信者を表示
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

  followingGrid.innerHTML = sortedCreators.map(creator => `
    <div class="following-card" id="creator-${creator.id}">
      <a href="creator/${creator.slug}.html" class="following-card-link">
        <div class="following-avatar">
          ${creator.name.charAt(0)}
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
  `).join('');
}

function sortFollowingCreators() {
  const sortBy = document.getElementById('sortSelect').value;
  renderFollowingCreators(sortBy);
}

// フォロー関連関数、モバイルメニュー関数はjs/main.jsで定義

// 初期表示
renderSidebarNav(''); // main.jsの共通関数を使用
renderFollowingCreators();
