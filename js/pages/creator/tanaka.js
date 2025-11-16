// creator/tanaka.html専用スクリプト（ストリーマーホームページ）

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

// パック一覧の表示（パックタブのみ）
function renderPacks() {
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

  if (packsGridFull) packsGridFull.innerHTML = packHTML;
}

// 活動紹介の表示
function renderActivityIntro() {
  const activityIntro = document.getElementById('activityIntro');
  if (!activityIntro) return;

  const introHTML = `
    <p>はじめまして、田中太郎です！</p>
    <p>Pack&Playで活動しているストリーマーで、主にゲーム実況やトークを中心に配信しています。</p>
    <p>毎週月・水・金の20時から定期配信を行っていて、視聴者の皆さんと楽しく盛り上がっています。</p>
    <p>カードパックを使った視聴者参加型の配信スタイルが特徴で、皆さんのカードで配信を盛り上げてくれると嬉しいです！</p>
  `;

  activityIntro.innerHTML = introHTML;
}

// おすすめ動画の表示
function renderRecommendedVideos() {
  const recommendedVideos = document.getElementById('recommendedVideos');
  if (!recommendedVideos) return;

  const videos = [
    {
      id: 1,
      title: '【初心者向け】マインクラフト基本解説！最初の夜を乗り越えよう',
      views: '12.5万回視聴',
      date: '2週間前',
      url: 'tanaka-stream.html'
    },
    {
      id: 2,
      title: 'Pack&Playのカード機能を使ってみた！配信がもっと楽しくなる',
      views: '8.2万回視聴',
      date: '1ヶ月前',
      url: 'tanaka-stream.html'
    },
    {
      id: 3,
      title: '視聴者参加型企画！カードでサプライズ連発の神回',
      views: '15.3万回視聴',
      date: '2ヶ月前',
      url: 'tanaka-stream.html'
    }
  ];

  const videosHTML = videos.map(video => `
    <a href="${video.url}" class="video-card">
      <div class="video-card-thumbnail">
        <div class="video-card-play"></div>
      </div>
      <div class="video-card-content">
        <div class="video-card-title">${video.title}</div>
        <div class="video-card-meta">${video.views} • ${video.date}</div>
      </div>
    </a>
  `).join('');

  recommendedVideos.innerHTML = videosHTML;
}

// おすすめ記事の表示
function renderRecommendedArticles() {
  const recommendedArticles = document.getElementById('recommendedArticles');
  if (!recommendedArticles) return;

  const articles = [
    {
      id: 1,
      title: 'Pack&Play活動開始から1年！振り返りと今後の展望',
      date: '2025年10月15日',
      url: '#'
    },
    {
      id: 2,
      title: 'ストリーマーが語る：視聴者参加型配信の楽しさと工夫',
      date: '2025年9月20日',
      url: '#'
    },
    {
      id: 3,
      title: '【インタビュー】Pack&Playで配信スタイルが変わった話',
      date: '2025年8月10日',
      url: '#'
    }
  ];

  const articlesHTML = articles.map(article => `
    <a href="${article.url}" class="article-card">
      <div class="article-card-thumbnail"></div>
      <div class="article-card-content">
        <div class="article-card-title">${article.title}</div>
        <div class="article-card-meta">${article.date}</div>
      </div>
    </a>
  `).join('');

  recommendedArticles.innerHTML = articlesHTML;
}

// aboutテキストの表示
function renderAbout() {
  const aboutText = document.getElementById('aboutText');
  if (!aboutText) return;

  const aboutContent = `ストリーマーについて

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
  const liveStreamTitle = document.getElementById('liveStreamTitle');
  const liveViewerCount = document.getElementById('liveViewerCount');

  if (creatorData && creatorData.isLive) {
    liveStreamThumbnail.style.display = 'flex';
    liveSignal.style.display = 'block';

    // 配信タイトルを設定
    if (liveStreamTitle) {
      liveStreamTitle.textContent = creatorData.streamTitle || '配信中';
    }

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
  renderActivityIntro();
  renderRecommendedVideos();
  renderRecommendedArticles();
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
