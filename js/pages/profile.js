// ログインチェック
if (!requireLogin()) {
  // ログインが必要な場合、requireLogin関数内でリダイレクトされる
}

// セッション情報を取得
const session = getCurrentSession();

// スパーク残高を初期化（デモ用：1000スパーク）
if (!session.coins && session.coins !== 0) {
  session.coins = 1000;
  saveToStorage('session', session);
}

// 選択されたアバター画像とヘッダー画像
let selectedAvatarImage = session.avatarImage || null;
let selectedHeaderImage = session.headerImage || null;

// プロフィール情報を表示
function renderProfile() {
  if (!session) return;

  // ヘッダー画像表示
  const headerImageElement = document.getElementById('profileHeaderImage');
  if (selectedHeaderImage) {
    headerImageElement.style.backgroundImage = `url(${selectedHeaderImage})`;
    headerImageElement.style.backgroundSize = 'cover';
    headerImageElement.style.backgroundPosition = 'center';
  } else {
    headerImageElement.style.backgroundImage = '';
    headerImageElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // アバター表示
  const avatarElement = document.getElementById('profileAvatar');
  avatarElement.innerHTML = ''; // クリア

  if (selectedAvatarImage) {
    // 画像がある場合は画像を表示
    const img = document.createElement('img');
    img.src = selectedAvatarImage;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    avatarElement.appendChild(img);
  } else {
    // 画像がない場合は頭文字を表示
    const initial = session.name ? session.name.charAt(0) : '?';
    avatarElement.textContent = initial;
  }

  // 名前
  document.getElementById('profileName').textContent = session.name || 'ユーザー名';

  // ユーザーID（メールアドレスから生成）
  const userId = session.email ? '@' + session.email.split('@')[0] : '@username';
  document.getElementById('profileUserId').textContent = userId;

  // Bio（デモ用のデフォルトテキスト）
  const bio = session.bio || 'Pack&Playで配信をもっと楽しもう！';
  document.getElementById('profileBio').textContent = bio;

  // スパーク残高
  const coinBalance = session.coins || 0;
  document.getElementById('coinBalance').textContent = coinBalance.toLocaleString();

  // フォロー中の数
  const followedCreators = getFollowedCreators();
  document.getElementById('followingCount').textContent = followedCreators.length;
}

// 名前をインライン編集
function editName() {
  const nameWrapper = document.querySelector('.profile-name-wrapper');
  const nameInput = document.getElementById('profileNameInput');

  // 現在の名前を入力フィールドにセット
  nameInput.value = session.name || '';

  // 表示を切り替え
  nameWrapper.style.display = 'none';
  nameInput.style.display = 'block';
  nameInput.focus();
  nameInput.select();
}

// 名前を保存
function saveName() {
  const nameWrapper = document.querySelector('.profile-name-wrapper');
  const nameInput = document.getElementById('profileNameInput');
  const newName = nameInput.value.trim();

  if (!newName) {
    // 空の場合は元の名前に戻す
    nameInput.value = session.name || 'ユーザー名';
    nameWrapper.style.display = 'inline-flex';
    nameInput.style.display = 'none';
    return;
  }

  if (newName !== session.name) {
    // 名前が変更された場合
    session.name = newName;
    saveToStorage('session', session);
    showToast('表示名を更新しました', 'success');
    renderProfile();
  }

  // 表示を切り替え
  nameWrapper.style.display = 'inline-flex';
  nameInput.style.display = 'none';
}

// キーボードイベントハンドリング
function handleNameKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveName();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    const nameWrapper = document.querySelector('.profile-name-wrapper');
    const nameInput = document.getElementById('profileNameInput');

    // キャンセル：元の表示に戻す
    nameInput.value = session.name || '';
    nameWrapper.style.display = 'inline-flex';
    nameInput.style.display = 'none';
  }
}

// Bioをインライン編集
function editBio() {
  const bioWrapper = document.querySelector('.profile-bio-wrapper');
  const bioTextarea = document.getElementById('profileBioTextarea');

  // 現在のbioをテキストエリアにセット
  bioTextarea.value = session.bio || '';

  // 表示を切り替え
  bioWrapper.style.display = 'none';
  bioTextarea.style.display = 'block';
  bioTextarea.focus();
}

// Bioを保存
function saveBio() {
  const bioWrapper = document.querySelector('.profile-bio-wrapper');
  const bioTextarea = document.getElementById('profileBioTextarea');
  const newBio = bioTextarea.value.trim();

  // 最大文字数チェック（160文字）
  if (newBio.length > 160) {
    showToast('自己紹介は160文字以内で入力してください', 'error');
    return;
  }

  if (newBio !== (session.bio || '')) {
    // Bioが変更された場合
    session.bio = newBio;
    saveToStorage('session', session);
    showToast('自己紹介を更新しました', 'success');
    renderProfile();
  }

  // 表示を切り替え
  bioWrapper.style.display = 'block';
  bioTextarea.style.display = 'none';
}

// キーボードイベントハンドリング（Bio）
function handleBioKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    const bioWrapper = document.querySelector('.profile-bio-wrapper');
    const bioTextarea = document.getElementById('profileBioTextarea');

    // キャンセル：元の表示に戻す
    bioTextarea.value = session.bio || '';
    bioWrapper.style.display = 'block';
    bioTextarea.style.display = 'none';
  }
}

// メインアバターをクリックしてアップロード
function openAvatarUpload() {
  document.getElementById('mainAvatarFileInput').click();
}

// メインアバター画像をアップロード（即座に保存）
function handleMainAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // ファイルサイズチェック（5MB制限）
  if (file.size > 5 * 1024 * 1024) {
    showToast('画像サイズは5MB以下にしてください', 'error');
    return;
  }

  // 画像タイプチェック
  if (!file.type.startsWith('image/')) {
    showToast('画像ファイルを選択してください', 'error');
    return;
  }

  showLoading();

  // FileReaderで画像を読み込み
  const reader = new FileReader();
  reader.onload = function(e) {
    selectedAvatarImage = e.target.result;

    // 即座にセッションに保存
    session.avatarImage = selectedAvatarImage;
    saveToStorage('session', session);

    hideLoading();
    showToast('アバター画像を更新しました', 'success');

    // 表示を更新
    renderProfile();
  };
  reader.readAsDataURL(file);
}

// ヘッダー画像をクリックしてアップロード
function openHeaderImageUpload() {
  document.getElementById('headerImageFileInput').click();
}

// ヘッダー画像をアップロード（即座に保存）
function handleHeaderImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // ファイルサイズチェック（5MB制限）
  if (file.size > 5 * 1024 * 1024) {
    showToast('画像サイズは5MB以下にしてください', 'error');
    return;
  }

  // 画像タイプチェック
  if (!file.type.startsWith('image/')) {
    showToast('画像ファイルを選択してください', 'error');
    return;
  }

  showLoading();

  // FileReaderで画像を読み込み
  const reader = new FileReader();
  reader.onload = function(e) {
    selectedHeaderImage = e.target.result;

    // 即座にセッションに保存
    session.headerImage = selectedHeaderImage;
    saveToStorage('session', session);

    hideLoading();
    showToast('ヘッダー画像を更新しました', 'success');

    // 表示を更新
    renderProfile();
  };
  reader.readAsDataURL(file);
}

// スパークチャージページへ移動
function goToCharge() {
  showToast('スパークチャージ機能は近日公開予定です', 'info');
  // 将来的には: window.location.href = 'charge.html';
}

// 配信中の配信者のみを表示
function renderLiveCreators() {
  const liveGrid = document.getElementById('liveGrid');
  const liveEmpty = document.getElementById('liveEmpty');

  if (typeof getFollowedCreators === 'undefined') {
    console.error('getFollowedCreators is not defined');
    return;
  }

  const followedCreators = getFollowedCreators();
  const liveCreators = followedCreators.filter(creator => creator.isLive);

  if (liveCreators.length === 0) {
    liveGrid.innerHTML = '';
    liveEmpty.style.display = 'block';
    return;
  }

  liveEmpty.style.display = 'none';

  liveGrid.innerHTML = liveCreators.map(creator => `
    <div class="following-card" id="creator-${creator.id}">
      <a href="creator/${creator.slug}.html" class="following-card-link">
        <div class="following-avatar">
          ${creator.name.charAt(0)}
          <span class="following-live-signal"></span>
        </div>
        <div class="following-info">
          <div class="following-name-row">
            <span class="following-name">${creator.name}</span>
            <span class="following-id">@${creator.slug}</span>
          </div>
          <div class="following-bio">${creator.bio || ''}</div>
        </div>
      </a>
      <button class="following-button" onclick="unfollowCreator(${creator.id}, event)">
        <span>フォロー中</span>
      </button>
    </div>
  `).join('');
}

// フォロー・フォロー解除関数はmain.jsで定義されたものを使用
// profile.jsではrenderProfile()を追加で呼ぶためにmain.jsの関数をオーバーライド

// main.jsの元の関数を保存
const mainUnfollowCreator = unfollowCreator;
const mainFollowCreator = followCreator;
const mainShowUnfollowModal = showUnfollowModal;

// profile.js用にオーバーライド（renderProfile()を追加）
unfollowCreator = function(creatorId, event) {
  // main.jsの関数を呼び、完了後にrenderProfile()を実行
  mainUnfollowCreator.call(this, creatorId, event);
  // showUnfollowModalのconfirmButton.onclickでrenderProfile()を呼ぶ必要があるため、
  // showUnfollowModalもオーバーライド
};

// showUnfollowModalをオーバーライド（profile.js用にHTML再描画を追加）
showUnfollowModal = function(creatorId, creatorName, updateCallback) {
  const modal = document.getElementById('unfollowModal');
  const message = document.getElementById('unfollowModalMessage');
  const confirmButton = document.getElementById('unfollowConfirmButton');

  message.textContent = `${creatorName}のフォローを解除しますか？`;

  confirmButton.onclick = function() {
    toggleFollow(creatorId);

    // カスタム更新処理があれば実行
    if (updateCallback) {
      updateCallback(creatorId, false);
    }

    // プロフィール更新（profile.js固有処理）
    renderProfile();

    // 配信中タブのHTML再描画（フォロー解除により表示が変わる可能性があるため）
    renderLiveCreators();

    // フォロー中カウント更新
    const followingCountEl = document.getElementById('followingCount');
    if (followingCountEl) {
      const followedCreators = getFollowedCreators();
      followingCountEl.textContent = followedCreators.length;
    }

    closeUnfollowModal();
  };

  modal.classList.add('active');
};

followCreator = function(creatorId, event) {
  event.preventDefault();
  event.stopPropagation();

  toggleFollow(creatorId);

  // プロフィール更新（profile.js固有処理）
  renderProfile();

  // 配信中タブのHTML再描画（フォロー追加により表示が変わる可能性があるため）
  renderLiveCreators();

  // フォロー中カウント更新
  const followingCountEl = document.getElementById('followingCount');
  if (followingCountEl) {
    const followedCreators = getFollowedCreators();
    followingCountEl.textContent = followedCreators.length;
  }
};

// アカウント削除モーダルを表示
function confirmDeleteAccount() {
  document.getElementById('deleteAccountModal').style.display = 'flex';
  // ボディのスクロールを無効化
  document.body.style.overflow = 'hidden';
}

// モーダルを閉じる
function closeDeleteModal(event) {
  // オーバーレイをクリックした場合のみ閉じる
  if (event && event.target.classList.contains('modal-overlay')) {
    document.getElementById('deleteAccountModal').style.display = 'none';
    document.body.style.overflow = '';
  } else if (!event) {
    // ボタンから呼び出された場合
    document.getElementById('deleteAccountModal').style.display = 'none';
    document.body.style.overflow = '';
  }
}

// アカウント削除申請を実行
function executeDeleteAccount() {
  // モーダルを閉じる
  document.getElementById('deleteAccountModal').style.display = 'none';
  document.body.style.overflow = '';

  showLoading();
  setTimeout(() => {
    hideLoading();
    // 削除申請日時を保存（実際のシステムでは、バックエンドでスパーク残高チェックなどを行う）
    const deletionRequest = {
      requestedAt: new Date().toISOString(),
      scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      status: 'pending'
    };

    // セッションに削除申請情報を保存
    session.deletionRequest = deletionRequest;
    saveToStorage('session', session);

    showToast('アカウント削除を申請しました。30日後に削除されます。', 'success');

    // 表示を更新
    renderDeletionRequest();
  }, 1000);
}

// 削除申請をキャンセル
function cancelDeletionRequest() {
  if (confirm('アカウント削除申請をキャンセルしますか？')) {
    showLoading();
    setTimeout(() => {
      hideLoading();
      // 削除申請情報を削除
      delete session.deletionRequest;
      saveToStorage('session', session);

      showToast('アカウント削除申請をキャンセルしました', 'success');

      // 表示を更新
      renderDeletionRequest();
    }, 800);
  }
}

// 削除申請状態を表示
function renderDeletionRequest() {
  const area = document.getElementById('deletionRequestArea');
  if (!area) return;

  if (session.deletionRequest && session.deletionRequest.status === 'pending') {
    // 削除申請中の場合
    const scheduledDate = new Date(session.deletionRequest.scheduledDeletionDate);
    const formattedDate = scheduledDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    area.innerHTML = `
      <div style="display: inline-block; padding: 0.75rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; margin-bottom: 0.5rem;">
        <div style="color: #991b1b; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">アカウント削除申請中</div>
        <div style="color: #7f1d1d; font-size: 0.75rem;">削除予定日: ${formattedDate}</div>
      </div>
      <div>
        <a href="javascript:void(0)" onclick="cancelDeletionRequest()" style="display: inline-block; color: #6b7280; font-size: 0.875rem; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; transition: all 0.2s;">申請をキャンセル</a>
      </div>
    `;
  } else {
    // 通常の表示
    area.innerHTML = `
      <a href="javascript:void(0)" onclick="confirmDeleteAccount()" style="display: inline-block; color: #ef4444; font-size: 0.875rem; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #ef4444; border-radius: 0.5rem; transition: all 0.2s;">アカウント削除を申請</a>
    `;
  }
}

// モバイルメニュー関数はjs/main.jsで定義

// タブ切り替え
function switchTab(tabName) {
  // タブボタンの切り替え
  document.querySelectorAll('.following-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  // タブコンテンツの切り替え
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  if (tabName === 'timeline') {
    document.getElementById('timelineTab').classList.add('active');
  } else if (tabName === 'live') {
    document.getElementById('liveTab').classList.add('active');
  }
}

// タイムラインを表示
function renderTimeline() {
  const timelineGrid = document.getElementById('timelineGrid');
  const timelineEmpty = document.getElementById('timelineEmpty');

  // タイムラインモックデータ
  const timelineItems = [
    {
      creatorId: 2,
      creatorName: 'アリスちゃんねる',
      action: '新しいパックを公開しました',
      detail: '「アリスの魔法パック」',
      time: '2時間前'
    },
    {
      creatorId: 8,
      creatorName: 'いとさくらのゲーム実況',
      action: '配信を開始しました',
      detail: 'ホラーゲーム実況配信中！',
      time: '3時間前'
    },
    {
      creatorId: 1,
      creatorName: '田中太郎',
      action: '新しいカードを追加しました',
      detail: '「激レアカード」をパックに追加',
      time: '5時間前'
    },
    {
      creatorId: 6,
      creatorName: '鈴木美咲の歌枠',
      action: '配信を開始しました',
      detail: '歌ってみた配信中♪',
      time: '6時間前'
    },
    {
      creatorId: 4,
      creatorName: '山田花子の料理チャンネル',
      action: '新しいパックを公開しました',
      detail: '「料理応援パック」',
      time: '8時間前'
    },
    {
      creatorId: 7,
      creatorName: 'たかはしイラスト工房',
      action: '配信を開始しました',
      detail: 'お絵描き配信中🎨',
      time: '1日前'
    }
  ];

  if (timelineItems.length === 0) {
    timelineGrid.innerHTML = '';
    timelineEmpty.style.display = 'block';
    return;
  }

  timelineEmpty.style.display = 'none';

  timelineGrid.innerHTML = timelineItems.map(item => {
    const creator = creators.find(c => c.id === item.creatorId);
    const initial = creator ? creator.name.charAt(0) : '?';
    const creatorSlug = creator ? creator.slug : '';

    return `
      <div class="timeline-item">
        <div class="timeline-avatar">${initial}</div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-creator-name">${item.creatorName}</span>
            <span class="timeline-creator-id">@${creatorSlug}</span>
            <span class="timeline-time">${item.time}</span>
          </div>
          <div class="timeline-detail">
            <span class="timeline-action">${item.action}</span>
            <span class="timeline-pack-name">${item.detail}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 初期表示
renderSidebarNav('profile');
renderProfile();
renderLiveCreators();
renderDeletionRequest();
renderTimeline();
