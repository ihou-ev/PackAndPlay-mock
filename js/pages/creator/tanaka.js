// creator/tanaka.html専用スクリプト（配信者ホームページ）

const creatorSlug = 'tanaka';
const creatorData = getCreatorBySlug(creatorSlug);

// タブ切り替え
window.switchTab = function(tab) {
  // タブボタン
  document.getElementById('homeTab').classList.toggle('active', tab === 'home');
  document.getElementById('packsTab').classList.toggle('active', tab === 'packs');
  document.getElementById('aboutTab').classList.toggle('active', tab === 'about');

  // タブコンテンツ
  document.getElementById('homeContent').classList.toggle('active', tab === 'home');
  document.getElementById('packsContent').classList.toggle('active', tab === 'packs');
  document.getElementById('aboutContent').classList.toggle('active', tab === 'about');
};

// フォローボタンの初期化
function initFollowButton() {
  const followButton = document.getElementById('followButton');
  if (!followButton) return;

  const updateFollowButton = () => {
    const followedCreators = getFollowedCreators();
    const isFollowing = followedCreators.some(c => c.slug === creatorSlug);

    if (isFollowing) {
      followButton.classList.add('following');
      followButton.querySelector('span').textContent = 'フォロー中';
    } else {
      followButton.classList.remove('following');
      followButton.querySelector('span').textContent = 'フォローする';
    }
  };

  followButton.addEventListener('click', function(e) {
    e.preventDefault();
    const followedCreators = getFollowedCreators();
    const isFollowing = followedCreators.some(c => c.slug === creatorSlug);

    if (isFollowing) {
      // フォロー解除確認モーダルを表示
      showUnfollowModal(creatorData.id, creatorData.name, updateFollowButton);
    } else {
      // フォローする
      toggleFollow(creatorData.id);
      updateFollowButton();
      updateFollowerCount();
    }
  });

  updateFollowButton();
}

// フォロワー数の更新
function updateFollowerCount() {
  const followerCountEl = document.getElementById('followerCount');
  if (!followerCountEl) return;

  const followedCreators = getFollowedCreators();
  const isFollowing = followedCreators.some(c => c.slug === creatorSlug);

  // ベースフォロワー数
  let count = creatorData.followerCount || 0;

  // 自分がフォローしている場合は+1
  if (isFollowing) {
    count += 1;
  }

  followerCountEl.textContent = count.toLocaleString();
}

// パック一覧の表示
function renderPacks() {
  const packsGrid = document.getElementById('packsGrid');
  const packsGridFull = document.getElementById('packsGridFull');

  const creatorPacks = packs.filter(p => p.creatorSlug === creatorSlug);

  const packHTML = creatorPacks.map(pack => `
    <a href="packs/pack-detail.html?id=${pack.id}" class="pack-card">
      <div class="pack-card-image">${pack.icon || '🎴'}</div>
      <div class="pack-card-content">
        <div class="pack-card-name">${pack.name}</div>
        <div class="pack-card-price">${pack.price.toLocaleString()}スパーク</div>
      </div>
    </a>
  `).join('');

  if (packsGrid) packsGrid.innerHTML = packHTML;
  if (packsGridFull) packsGridFull.innerHTML = packHTML;
}

// aboutテキストの表示
function renderAbout() {
  const aboutText = document.getElementById('aboutText');
  if (!aboutText) return;

  const aboutContent = `配信者について

毎週月・水・金の20時から配信しています。
ゲーム実況やトークを中心に活動中！

Pack&Playでカードパックを販売しているので、
ぜひ購入して配信で使ってみてください。

配信中にカードを使うと、画面にエフェクトが表示されます。
みんなで盛り上がりましょう！`;

  aboutText.textContent = aboutContent;
}

// 配信中サムネイルの表示
function updateLiveBanner() {
  const liveStreamThumbnail = document.getElementById('liveStreamThumbnail');
  const liveSignal = document.getElementById('liveSignal');
  const liveViewerCount = document.getElementById('liveViewerCount');

  if (creatorData && creatorData.isLive) {
    liveStreamThumbnail.style.display = 'block';
    liveSignal.style.display = 'block';

    // 視聴者数をランダムに生成（デモ用）
    const viewerCount = Math.floor(Math.random() * 500) + 50;
    if (liveViewerCount) {
      liveViewerCount.textContent = `${viewerCount.toLocaleString()}人が視聴中`;
    }
  } else {
    liveStreamThumbnail.style.display = 'none';
    liveSignal.style.display = 'none';
  }
}

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

// 初期化
function init() {
  // サイドバーナビゲーションを初期化
  renderSidebarNav('');

  initFollowButton();
  updateFollowerCount();
  renderPacks();
  renderAbout();
  updateLiveBanner();
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
