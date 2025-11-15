// URLパラメータからロールを取得
const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role') || 'viewer';

// ロールに応じた表示を設定
const roleText = role === 'creator' ? '配信者' : '視聴者';

document.getElementById('loginTitle').textContent = `${roleText}としてログイン`;

// 配信者の場合はXボタンを非表示
if (role === 'creator') {
  document.getElementById('xPlatformBtn').style.display = 'none';
}

// プラットフォームを選択してログイン
function selectPlatform(platform) {
  // プラットフォーム名を取得
  const platformNames = {
    'youtube': 'YouTube',
    'twitch': 'Twitch',
    'x': 'X (Twitter)'
  };

  const platformName = platformNames[platform];

  showLoading();

  // デモ用：実際のOAuth認証をシミュレート
  setTimeout(() => {
    // セッション情報を保存
    const session = {
      isLoggedIn: true,
      role: role,
      email: `demo-${platform}@packandplay.com`,
      name: role === 'creator' ? '田中太郎' : 'テスト視聴者',
      creatorSlug: role === 'creator' ? 'tanaka' : null,
      loginMethod: platform,
      loginPlatform: platformName,
      loginTime: new Date().toISOString(),
      coins: 1000  // 初期スパーク残高
    };

    saveToStorage('session', session);

    // フォロー中の配信者を初期化（初回ログイン時のみ）
    if (!loadFromStorage('followedCreators')) {
      saveToStorage('followedCreators', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // デフォルトで10人フォロー
    }

    hideLoading();

    showToast(`${platformName}で${roleText}としてログインしました`, 'success');

    // リダイレクト
    setTimeout(() => {
      if (role === 'creator') {
        window.location.href = 'dashboard/index.html';
      } else {
        window.location.href = 'profile.html';
      }
    }, 1000);
  }, 1500);
}

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
