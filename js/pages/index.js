// PWA Service Worker 登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// ロール選択ボタンをクリック → ログインページへリダイレクト
function quickLogin(role) {
  window.location.href = 'login.html?role=' + role;
}

// ランキング表示（フォロワー数順）
function renderRanking() {
  const rankingScroll = document.getElementById('rankingScroll');
  if (!rankingScroll) return;

  // フォロワー数でソート（上位10件）
  const rankedCreators = [...creators]
    .sort((a, b) => b.followerCount - a.followerCount)
    .slice(0, 10);

  const rankingHTML = rankedCreators.map((creator, index) => {
    const rank = index + 1;
    const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
    const liveBadge = creator.isLive
      ? '<span class="ranking-card-live-badge">LIVE</span>'
      : '';

    // アバターの初期文字（画像がない場合のフォールバック）
    const initial = creator.name.charAt(0);

    // バナー画像（あればbackground-image、なければグラデーション）
    const bannerStyle = creator.bannerUrl
      ? `background-image: url('${creator.bannerUrl}'); background-size: cover; background-position: center;`
      : '';

    // アバター表示（画像があれば画像、なければ初期文字）
    const avatarContent = creator.avatarUrl
      ? `<img src="${creator.avatarUrl}" alt="${creator.name}" class="ranking-card-avatar-img">`
      : initial;

    // デモ用：tanakaのみ実在のページあり、それ以外はdiscover.htmlへ
    const linkHref = creator.slug === 'tanaka' ? 'creator/tanaka.html' : 'discover.html';

    return `
      <a href="${linkHref}" class="ranking-card">
        <div class="ranking-card-header" style="${bannerStyle}">
          <div class="ranking-card-rank ${rankClass}">${rank}</div>
          <div class="ranking-card-avatar">${avatarContent}</div>
        </div>
        <div class="ranking-card-body">
          <div class="ranking-card-name">
            ${creator.name}${liveBadge}
          </div>
          <div class="ranking-card-bio">${creator.bio}</div>
          <div class="ranking-card-stats">
            <div class="ranking-card-stat">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              ${creator.followerCount.toLocaleString()}
            </div>
            <div class="ranking-card-stat">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              ${creator.packCount}パック
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');

  rankingScroll.innerHTML = rankingHTML;
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
  renderRanking();
});

// 既にログイン済みの場合はリダイレクト
const session = loadFromStorage('session');
if (session && session.isLoggedIn) {
  showToast('既にログインしています', 'info');
  setTimeout(() => {
    if (session.role === 'creator') {
      window.location.href = 'dashboard/index.html';
    } else {
      window.location.href = 'profile.html';
    }
  }, 1000);
}
