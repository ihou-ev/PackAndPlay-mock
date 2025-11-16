// ストリーマー情報を取得
const creatorSlug = 'tanaka';
const creator = getCreatorBySlug(creatorSlug);
const creatorPacks = getPacksByCreator(creatorSlug);

// サイドバーナビゲーションをレンダリング（creator/配下用にパス調整）
function renderCreatorSidebarNav() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;

  let navHTML = '';

  if (isLoggedIn()) {
    const session = getCurrentSession();
    const role = session.role;

    if (role === 'creator') {
      navHTML = `
        <a href="${getRelativePath('profile.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          プロフィール
        </a>
        <a href="${getRelativePath('discover.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          ストリーマーを探す
        </a>
        <a href="${getRelativePath('dashboard/index.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"></path>
          </svg>
          ダッシュボード
        </a>
        <a href="${getRelativePath('history.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          履歴
        </a>
        <a href="${getRelativePath('settings.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          設定
        </a>
        <a href="javascript:void(0)" onclick="logout()" class="sidebar-nav-link" style="margin-top: auto;">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          ログアウト
        </a>
      `;
    } else {
      // viewer role
      navHTML = `
        <a href="${getRelativePath('profile.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          プロフィール
        </a>
        <a href="${getRelativePath('discover.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          ストリーマーを探す
        </a>
        <a href="${getRelativePath('following.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          フォロー中
        </a>
        <a href="${getRelativePath('inventory.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          マイカード
        </a>
        <a href="${getRelativePath('history.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          履歴
        </a>
        <a href="${getRelativePath('settings.html')}" class="sidebar-nav-link">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          設定
        </a>
        <a href="javascript:void(0)" onclick="logout()" class="sidebar-nav-link" style="margin-top: auto;">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          ログアウト
        </a>
      `;
    }
  } else {
    // ログインしていない場合
    navHTML = `
      <a href="${getRelativePath('index.html')}" class="sidebar-nav-link">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        ホーム
      </a>
      <a href="${getRelativePath('discover.html')}" class="sidebar-nav-link">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        ストリーマーを探す
      </a>
    `;
  }

  sidebarNav.innerHTML = navHTML;
}

// クリエイター情報を設定
// Note: creatorAvatar text is hardcoded in HTML, don't use textContent as it removes child elements (live-signal)
document.getElementById('creatorName').textContent = creator.name;

// フォロー解除
function unfollowCreator(event) {
  event.preventDefault();
  event.stopPropagation();

  // カスタムモーダルを表示
  showUnfollowModal();
}

// フォロー解除モーダルを表示
function showUnfollowModal() {
  const modal = document.getElementById('unfollowModal');
  const message = document.getElementById('unfollowModalMessage');
  const confirmButton = document.getElementById('unfollowConfirmButton');

  message.textContent = `${creator.name}のフォローを解除しますか？`;

  confirmButton.onclick = function() {
    toggleFollow(creator.id);

    // ボタンを「フォローする」に変更
    const button = document.getElementById('followButton');
    if (button) {
      button.className = 'following-button unfollow-style';
      button.innerHTML = '<span>フォローする</span>';
      button.onclick = (e) => followCreator(e);
      button.blur();
    }

    // フォロー中カウント更新
    const followingCountEl = document.getElementById('followingCount');
    if (followingCountEl) {
      const followedCreators = getFollowedCreators();
      followingCountEl.textContent = followedCreators.length;
    }

    closeUnfollowModal();
  };

  modal.classList.add('active');
}

// フォロー解除モーダルを閉じる
function closeUnfollowModal() {
  const modal = document.getElementById('unfollowModal');
  modal.classList.remove('active');
}

// フォローする
function followCreator(event) {
  event.preventDefault();
  event.stopPropagation();

  toggleFollow(creator.id);

  // ボタンを「フォロー中」に変更
  const button = document.getElementById('followButton');
  if (button) {
    button.className = 'following-button';
    button.innerHTML = '<span>フォロー中</span>';
    button.onclick = (e) => unfollowCreator(e);
    button.blur();
  }

  // フォロー中カウント更新
  const followingCountEl = document.getElementById('followingCount');
  if (followingCountEl) {
    const followedCreators = getFollowedCreators();
    followingCountEl.textContent = followedCreators.length;
  }
}

// 初期化：フォロー状態を確認してボタンを設定
function initFollowButton() {
  const followedCreators = getFollowedCreators();
  const followedIds = followedCreators.map(c => c.id);
  const isFollowing = followedIds.includes(creator.id);
  const button = document.getElementById('followButton');

  if (button) {
    if (isFollowing) {
      button.className = 'following-button';
      button.innerHTML = '<span>フォロー中</span>';
      button.onclick = (e) => unfollowCreator(e);
    } else {
      button.className = 'following-button unfollow-style';
      button.innerHTML = '<span>フォローする</span>';
      button.onclick = (e) => followCreator(e);
    }
  }
}

// 配信プレイヤーの設定
function setupStreamPlayer() {
  const player = document.getElementById('streamPlayer');
  const offline = document.getElementById('streamOffline');
  const liveSignal = document.getElementById('liveSignal');

  console.log('Creator:', creator);
  console.log('isLive:', creator.isLive);
  console.log('liveSignal element:', liveSignal);

  if (creator.isLive && creator.streamUrl) {
    // 配信中の場合
    player.src = creator.streamUrl;
    player.style.display = 'block';
    offline.style.display = 'none';

    // LIVE信号を表示
    if (liveSignal) {
      liveSignal.style.display = 'block';
      console.log('LIVE signal shown');
    } else {
      console.error('liveSignal element not found');
    }

    // 配信概要を設定
    if (creator.streamDescription) {
      setupStreamDescription(creator.streamDescription);
    } else {
      showEmptyDescription();
    }
  } else {
    // 配信していない場合
    player.style.display = 'none';
    offline.style.display = 'flex';

    // LIVE信号を非表示
    if (liveSignal) {
      liveSignal.style.display = 'none';
    }

    showEmptyDescription();
  }
}

// フォロワー数を更新
function updateFollowerCount() {
  const followedIds = getFollowedCreators();
  const followerCount = Math.floor(Math.random() * 50000) + 1000; // モックデータ
  document.getElementById('followerCount').textContent = `${followerCount.toLocaleString()} フォロワー`;
}

// 空の概要表示
function showEmptyDescription() {
  document.getElementById('streamDescription').style.display = 'none';
  document.getElementById('streamDescriptionToggle').style.display = 'none';
  document.getElementById('streamDescriptionFade').style.display = 'none';
  document.getElementById('streamDescriptionEmpty').style.display = 'block';
}

// 配信概要のセットアップ
function setupStreamDescription(description) {
  const descriptionElement = document.getElementById('streamDescription');
  const toggleButton = document.getElementById('streamDescriptionToggle');
  const fade = document.getElementById('streamDescriptionFade');
  const emptyElement = document.getElementById('streamDescriptionEmpty');

  descriptionElement.textContent = description;
  descriptionElement.style.display = 'block';
  emptyElement.style.display = 'none';

  // 高さをチェックして、3行を超える場合はトグルボタンを表示
  setTimeout(() => {
    const lineHeight = parseFloat(getComputedStyle(descriptionElement).lineHeight);
    const maxHeight = lineHeight * 3;

    if (descriptionElement.scrollHeight > maxHeight) {
      toggleButton.style.display = 'flex';
      fade.style.display = 'block';
    } else {
      toggleButton.style.display = 'none';
      fade.style.display = 'none';
      descriptionElement.classList.remove('collapsed');
      descriptionElement.classList.add('expanded');
    }
  }, 0);
}

// 配信概要の展開/折りたたみ
function toggleDescription() {
  const descriptionElement = document.getElementById('streamDescription');
  const toggleButton = document.getElementById('streamDescriptionToggle');
  const toggleText = document.getElementById('toggleText');
  const fade = document.getElementById('streamDescriptionFade');

  const isExpanded = descriptionElement.classList.contains('expanded');

  if (isExpanded) {
    // 折りたたむ
    descriptionElement.classList.remove('expanded');
    descriptionElement.classList.add('collapsed');
    toggleButton.classList.remove('expanded');
    toggleText.textContent = 'もっと見る';
    fade.style.display = 'block';
  } else {
    // 展開する
    descriptionElement.classList.remove('collapsed');
    descriptionElement.classList.add('expanded');
    toggleButton.classList.add('expanded');
    toggleText.textContent = '閉じる';
    fade.style.display = 'none';
  }
}


// カードを表示
function renderCards() {
  const grid = document.getElementById('cardsGrid');

  // インベントリからこのストリーマーの未使用カードのみを取得
  const inventory = loadFromStorage('inventory', []);
  const creatorCards = inventory.filter(card => card.creatorSlug === creatorSlug && !card.isUsed);

  if (creatorCards.length === 0) {
    grid.innerHTML = `
      <div class="cards-empty">
        ${creator.name}のカードを持っていません<br>
        パックを購入してカードをゲットしよう！
      </div>
    `;
    return;
  }

  const cardIcons = {
    'message': '💬',
    'action': '⚡',
    'visual': '✨'
  };

  grid.innerHTML = creatorCards.map((card, index) => `
    <div class="card-item">
      <div class="card-icon-large">${cardIcons[card.type] || '🎴'}</div>
      <div class="card-name">${card.name}</div>
      <div class="badge badge-rarity-${card.rarity.toLowerCase()}">${card.rarity}</div>
      <button type="button" class="use-btn" onclick="openUseCardModal(${index})">使う</button>
    </div>
  `).join('');
}

let selectedCardForUse = null;

function openUseCardModal(index) {
  const inventory = loadFromStorage('inventory', []);
  const creatorCards = inventory.filter(card => card.creatorSlug === creatorSlug && !card.isUsed);
  selectedCardForUse = creatorCards[index];

  const cardIcons = {
    'message': '💬',
    'action': '⚡',
    'visual': '✨'
  };

  // モーダルの内容を設定
  document.getElementById('useCardModalIcon').textContent = cardIcons[selectedCardForUse.type] || '🎴';
  document.getElementById('useCardModalTitle').textContent = selectedCardForUse.name;
  document.getElementById('useCardModalBadge').textContent = selectedCardForUse.rarity;
  document.getElementById('useCardModalBadge').className = `badge badge-rarity-${selectedCardForUse.rarity.toLowerCase()}`;

  const cardTypeText = {
    'message': 'メッセージカード',
    'action': 'アクションカード',
    'visual': 'ビジュアルカード'
  };
  document.getElementById('useCardModalMessage').textContent = `この${cardTypeText[selectedCardForUse.type]}を使用しますか？`;

  // 確認ボタンのイベントを設定
  document.getElementById('useCardConfirmButton').onclick = function() {
    closeUseCardModal();
    useCard(selectedCardForUse);
  };

  // モーダルを表示
  document.getElementById('useCardModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUseCardModal() {
  document.getElementById('useCardModal').classList.remove('active');
  document.body.style.overflow = '';
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
  if (e.target.id === 'useCardModal') {
    closeUseCardModal();
  }
});

function useCard(card) {
  showLoading();

  setTimeout(() => {
    hideLoading();

    // カードを使用済みにマーク
    const inventory = loadFromStorage('inventory', []);
    const cardIndex = inventory.findIndex(c =>
      c.id === card.id &&
      c.acquiredAt === card.acquiredAt &&
      c.creatorSlug === card.creatorSlug
    );

    if (cardIndex !== -1) {
      inventory[cardIndex].isUsed = true;
      saveToStorage('inventory', inventory);

      // 承認待ちキューに追加（messageタイプの場合）
      if (card.type === 'message') {
        const redemptions = loadFromStorage('redemptions', []);
        redemptions.push({
          id: Date.now(),
          cardId: card.id,
          cardName: card.name,
          cardType: card.type,
          rarity: card.rarity,
          viewerName: '視聴者',
          message: '（カード使用）',
          timestamp: new Date().toISOString(),
          status: 'pending'
        });
        saveToStorage('redemptions', redemptions);
      }

      renderCards(); // カード一覧を再描画
      showCardUseToast(card); // カスタムトースト表示
    } else {
      showToast('カードの使用に失敗しました', 'error');
    }
  }, 500);
}

// カスタムトーストを表示（カード使用・スプラッシュ送信など共通）
function showCustomToast(options) {
  const {
    icon,
    title,
    badge = null, // { text: 'SR', rarity: 'sr' } or null
    message
  } = options;

  // オーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'card-use-toast-overlay';
  document.body.appendChild(overlay);

  // バッジHTML（存在する場合のみ）
  const badgeHTML = badge
    ? `<div class="badge badge-rarity-${badge.rarity.toLowerCase()}">${badge.text}</div>`
    : '';

  // トーストを作成
  const toast = document.createElement('div');
  toast.className = 'card-use-toast';
  toast.innerHTML = `
    <div class="card-use-toast-icon">${icon}</div>
    <div class="card-use-toast-title">${title}</div>
    ${badgeHTML}
    <div class="card-use-toast-message">${message}</div>
  `;
  document.body.appendChild(toast);

  // 1.5秒後にフェードアウト
  setTimeout(() => {
    toast.classList.add('fade-out');
    overlay.classList.add('fade-out');

    // アニメーション完了後に削除
    setTimeout(() => {
      document.body.removeChild(toast);
      document.body.removeChild(overlay);
    }, 300);
  }, 1500);
}

// カード使用トーストを表示（後方互換性のためのラッパー）
function showCardUseToast(card) {
  const cardIcons = {
    'message': '💬',
    'action': '⚡',
    'visual': '✨'
  };

  showCustomToast({
    icon: cardIcons[card.type] || '🎴',
    title: card.name,
    badge: { text: card.rarity, rarity: card.rarity },
    message: 'カードを使用しました'
  });
}

// スプラッシュ金額設定
const splashAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000];
let selectedSplashAmount = 100;

// 金額から色のティアを計算
function getAmountTier(amount) {
  if (amount < 500) return 1;
  if (amount < 2000) return 2;
  if (amount < 5000) return 3;
  if (amount < 10000) return 4;
  if (amount < 30000) return 5;
  return 6;
}

// スライダーからティアインデックスを取得
function getSliderIndexForAmount(amount) {
  for (let i = splashAmounts.length - 1; i >= 0; i--) {
    if (amount >= splashAmounts[i]) {
      return i;
    }
  }
  return 0;
}

// 金額に応じたメッセージ文字数制限を取得
function getMessageMaxLength(amount) {
  if (amount <= 100) return 0; // メッセージ不可
  if (amount < 1000) return 50;
  if (amount < 5000) return 100;
  if (amount < 20000) return 150;
  return 200;
}

// プレビュー更新
function updatePreview(amount) {
  selectedSplashAmount = amount;
  const tier = getAmountTier(amount);
  const maxLength = getMessageMaxLength(amount);

  const preview = document.getElementById('splashPreview');
  const amountDisplay = document.getElementById('splashPreviewAmount');
  const messageInput = document.getElementById('splashMessage');

  preview.setAttribute('data-tier', tier);
  amountDisplay.textContent = `${amount.toLocaleString()}スパーク`;

  // メッセージ入力の制御
  if (amount <= 100) {
    messageInput.disabled = true;
    messageInput.value = '';
    messageInput.placeholder = 'メッセージを送るには200スパーク以上必要です';
    messageInput.maxLength = 0;
  } else {
    messageInput.disabled = false;
    messageInput.placeholder = `メッセージを入力...（最大${maxLength}文字）`;
    messageInput.maxLength = maxLength;

    // 既存のメッセージが新しい制限を超えている場合は切り詰める
    if (messageInput.value.length > maxLength) {
      messageInput.value = messageInput.value.substring(0, maxLength);
    }
  }
}

// スライダーから更新
function updateFromSlider(sliderValue) {
  const index = parseInt(sliderValue);
  const amount = splashAmounts[index];

  document.getElementById('splashAmountInput').value = amount;
  updatePreview(amount);
}

// 入力欄から更新
function updateFromInput() {
  const input = document.getElementById('splashAmountInput');
  let amount = parseInt(input.value) || 100;

  // 範囲チェック
  if (amount < 100) amount = 100;
  if (amount > 50000) amount = 50000;

  input.value = amount;

  // スライダーの位置を更新
  const sliderIndex = getSliderIndexForAmount(amount);
  document.getElementById('splashSlider').value = sliderIndex;

  updatePreview(amount);
}

// キーボードの左右矢印キーで金額変更
function handleSparkKeydown(event) {
  const input = document.getElementById('splashAmountInput');
  let amount = parseInt(input.value) || 100;

  if (event.key === 'ArrowLeft') {
    // 左矢印: -100
    event.preventDefault();
    amount = Math.max(100, amount - 100);
    input.value = amount;
    updateFromInput();
  } else if (event.key === 'ArrowRight') {
    // 右矢印: +100
    event.preventDefault();
    amount = Math.min(50000, amount + 100);
    input.value = amount;
    updateFromInput();
  }
}

function sendSplash() {
  const message = document.getElementById('splashMessage').value;

  // モーダルの内容を設定
  document.getElementById('splashModalAmount').textContent = selectedSplashAmount.toLocaleString();
  document.getElementById('splashModalMessage').textContent = message || 'なし';

  // 確認ボタンのイベントを設定
  document.getElementById('splashConfirmButton').onclick = function() {
    closeSplashModal();
    confirmSendSplash();
  };

  // モーダルを表示
  document.getElementById('splashModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSplashModal() {
  document.getElementById('splashModal').classList.remove('active');
  document.body.style.overflow = '';
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
  if (e.target.id === 'splashModal') {
    closeSplashModal();
  }
});

function confirmSendSplash() {
  showLoading();

  const amount = selectedSplashAmount;

  setTimeout(() => {
    hideLoading();

    // カスタムトーストで送信完了を表示
    showCustomToast({
      icon: '💰',
      title: `${amount.toLocaleString()} スパーク`,
      badge: null,
      message: 'スプラッシュを送信しました！'
    });

    // リセット
    document.getElementById('splashMessage').value = '';
    document.getElementById('splashAmountInput').value = '100';
    document.getElementById('splashSlider').value = '0';
    updatePreview(100);
  }, 500);
}

// タブ切り替え
function switchActionTab(tab) {
  // タブボタンの状態を更新
  document.querySelectorAll('.action-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  event.currentTarget.classList.add('active');

  // コンテンツの表示を切り替え
  document.querySelectorAll('.action-content').forEach(content => {
    content.classList.remove('active');
  });

  if (tab === 'overview') {
    document.getElementById('overviewContent').classList.add('active');
  } else if (tab === 'cards') {
    document.getElementById('cardsContent').classList.add('active');
  } else if (tab === 'splash') {
    document.getElementById('splashContent').classList.add('active');
  } else if (tab === 'packs') {
    document.getElementById('packsContent').classList.add('active');
  }
}

// パックを表示
function renderPacks() {
  const grid = document.getElementById('packsGrid');

  if (creatorPacks.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #9ca3af;">
        📦 パックがありません
      </div>
    `;
    return;
  }

  grid.innerHTML = creatorPacks.map(pack => `
    <div class="pack-card" onclick="viewPack(${pack.id})">
      <div class="pack-image">📦</div>
      <div class="pack-content">
        <div class="pack-name">${pack.name}</div>
        <p class="pack-description">${pack.description}</p>
        <div class="pack-footer">
          <div class="pack-price">¥${pack.price.toLocaleString()}</div>
          <button type="button" class="buy-button" onclick="event.stopPropagation(); purchasePack(${pack.id})">
            購入する
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function viewPack(packId) {
  window.location.href = `../packs/pack-detail.html?id=${packId}`;
}

function purchasePack(packId) {
  // 実際のアプリでは決済処理を実装
  if (confirm('このパックを購入しますか？')) {
    alert('購入処理を開始します...');
    // 購入後はpack-open.htmlへ遷移
    setTimeout(() => {
      window.location.href = `../packs/pack-open.html?id=${packId}`;
    }, 1000);
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

// サンプルカードを追加
function addSampleCards() {
  const inventory = loadFromStorage('inventory', []);

  // 既にtanakaのカードがある場合はスキップ
  const hasTanakaCards = inventory.some(card => card.creatorSlug === 'tanaka');
  if (hasTanakaCards) {
    return;
  }

  // サンプルカードを追加
  const sampleCards = [
    {
      id: 1,
      name: 'こんにちは',
      rarity: 'N',
      type: 'message',
      creatorName: '田中太郎',
      creatorSlug: 'tanaka',
      isUsed: false,
      acquiredAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'いいね！',
      rarity: 'R',
      type: 'action',
      creatorName: '田中太郎',
      creatorSlug: 'tanaka',
      isUsed: false,
      acquiredAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'きらきら',
      rarity: 'SR',
      type: 'visual',
      creatorName: '田中太郎',
      creatorSlug: 'tanaka',
      isUsed: false,
      acquiredAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'ありがとう',
      rarity: 'R',
      type: 'message',
      creatorName: '田中太郎',
      creatorSlug: 'tanaka',
      isUsed: false,
      acquiredAt: new Date().toISOString()
    },
    {
      id: 4,
      name: '激レアカード',
      rarity: 'UR',
      type: 'action',
      creatorName: '田中太郎',
      creatorSlug: 'tanaka',
      isUsed: false,
      acquiredAt: new Date().toISOString()
    }
  ];

  inventory.push(...sampleCards);
  saveToStorage('inventory', inventory);
}

// 初期化
function init() {
  // サイドバーナビゲーションを初期化
  renderCreatorSidebarNav();

  addSampleCards(); // サンプルカードを追加
  initFollowButton();
  updateFollowerCount();
  setupStreamPlayer();
  renderCards();
  renderPacks();

  // スプラッシュプレビューに視聴者（ログインユーザー）情報を設定
  const session = getCurrentSession();
  if (session && session.displayName) {
    document.getElementById('splashPreviewAvatar').textContent = session.displayName.charAt(0);
    document.getElementById('splashPreviewName').textContent = session.displayName;
  } else {
    // ログインしていない場合のデフォルト
    document.getElementById('splashPreviewAvatar').textContent = 'あ';
    document.getElementById('splashPreviewName').textContent = 'あなた';
  }
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
