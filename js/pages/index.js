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
