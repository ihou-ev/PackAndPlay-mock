// auth/login.html専用スクリプト

let selectedRole = 'viewer';

function selectRole(role) {
  selectedRole = role;

  // ビジュアル更新
  document.getElementById('viewerOption').classList.remove('selected');
  document.getElementById('creatorOption').classList.remove('selected');

  if (role === 'viewer') {
    document.getElementById('viewerOption').classList.add('selected');
  } else {
    document.getElementById('creatorOption').classList.add('selected');
  }
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('メールアドレスとパスワードを入力してください', 'error');
    return;
  }

  performLogin(selectedRole, email);
}

function quickLogin(role) {
  selectRole(role);
  performLogin(role, `demo-${role}@packandplay.com`);
}

function performLogin(role, email) {
  showLoading();

  setTimeout(() => {
    // セッション情報を保存
    const session = {
      isLoggedIn: true,
      role: role,
      email: email,
      name: role === 'creator' ? '田中太郎' : 'テスト視聴者',
      creatorSlug: role === 'creator' ? 'tanaka' : null,
      loginTime: new Date().toISOString()
    };

    saveToStorage('session', session);

    hideLoading();
    showToast(`${role === 'creator' ? '配信者' : '視聴者'}としてログインしました`, 'success');

    // リダイレクト
    setTimeout(() => {
      if (role === 'creator') {
        window.location.href = '../dashboard/index.html';
      } else {
        window.location.href = '../index.html';
      }
    }, 1000);
  }, 1500);
}

// 初期選択
selectRole('viewer');

// 既にログイン済みの場合はリダイレクト
const session = loadFromStorage('session');
if (session && session.isLoggedIn) {
  showToast('既にログインしています', 'info');
  setTimeout(() => {
    if (session.role === 'creator') {
      window.location.href = '../dashboard/index.html';
    } else {
      window.location.href = '../index.html';
    }
  }, 1000);
}
