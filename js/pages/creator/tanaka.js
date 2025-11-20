// creator/tanaka.html専用スクリプト（ストリーマーホームページ）

const creatorSlug = 'tanaka';
const creatorData = getCreatorBySlug(creatorSlug);

// タブ切り替え
window.switchTab = function(tab) {
  // タブボタン
  document.getElementById('homeTab').classList.toggle('active', tab === 'home');
  document.getElementById('packsTab').classList.toggle('active', tab === 'packs');

  // タブコンテンツ
  document.getElementById('homeContent').classList.toggle('active', tab === 'home');
  document.getElementById('packsContent').classList.toggle('active', tab === 'packs');
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

// 外部リンクの表示
function renderExternalLinks() {
  const externalLinks = document.getElementById('externalLinks');
  const externalLinksSection = document.getElementById('externalLinksSection');
  if (!externalLinks || !externalLinksSection) return;

  // プロフィールデータをlocalStorageから読み込み（デフォルト値を設定）
  const profileData = loadFromStorage('creatorProfile', {
    social: {
      youtube: 'https://youtube.com/@tanaka_taro',
      twitch: 'https://twitch.tv/tanaka_taro',
      twitter: 'https://x.com/tanaka_taro'
    },
    otherLinks: [
      {
        id: 1,
        name: 'BOOTH（グッズ販売）',
        url: 'https://tanaka-taro.booth.pm/'
      }
    ]
  });

  const links = [];

  // SNSリンク
  if (profileData.social) {
    if (profileData.social.youtube) {
      links.push({
        url: profileData.social.youtube,
        name: 'YouTube',
        icon: `<svg class="external-link-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        class: 'external-link-youtube'
      });
    }
    if (profileData.social.twitch) {
      links.push({
        url: profileData.social.twitch,
        name: 'Twitch',
        icon: `<svg class="external-link-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
        class: 'external-link-twitch'
      });
    }
    if (profileData.social.twitter) {
      links.push({
        url: profileData.social.twitter,
        name: 'X',
        icon: `<svg class="external-link-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        class: 'external-link-twitter'
      });
    }
  }

  // その他のリンク
  if (profileData.otherLinks && profileData.otherLinks.length > 0) {
    profileData.otherLinks.forEach(link => {
      if (link.url && link.name) {
        links.push({
          url: link.url,
          name: link.name,
          icon: `<svg class="external-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
          class: ''
        });
      }
    });
  }

  // リンクがない場合はセクションを非表示
  if (links.length === 0) {
    externalLinksSection.style.display = 'none';
    return;
  }

  externalLinksSection.style.display = 'block';

  // リンクHTML生成
  const linksHTML = links.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="external-link ${link.class}">
      ${link.icon}
      <span>${link.name}</span>
    </a>
  `).join('');

  externalLinks.innerHTML = linksHTML;

  // デバッグ用ログ
  console.log('External links rendered:', links.length, 'links');
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
  renderExternalLinks();
  renderActivityIntro();
  renderRecommendedVideos();
  renderPacks();
  updateLiveBanner();
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
