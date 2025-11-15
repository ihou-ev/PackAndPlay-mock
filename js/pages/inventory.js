// インベントリデータを取得（ローカルストレージ + モックデータ）
let inventory = loadFromStorage('inventory', []);

// モックデータも追加（デモ用）
if (inventory.length === 0) {
  inventory = [
    { id: 1, name: 'こんにちは', rarity: 'N', type: 'message', creatorName: '田中太郎', isUsed: false, acquiredAt: '2025-11-01' },
    { id: 2, name: 'いいね！', rarity: 'R', type: 'action', creatorName: '田中太郎', isUsed: false, acquiredAt: '2025-11-01' },
    { id: 3, name: 'きらきら', rarity: 'SR', type: 'visual', creatorName: '田中太郎', isUsed: true, acquiredAt: '2025-11-01' },
    { id: 4, name: 'ハート', rarity: 'N', type: 'visual', creatorName: 'アリスちゃんねる', isUsed: false, acquiredAt: '2025-11-02' },
    { id: 5, name: '花火', rarity: 'SR', type: 'visual', creatorName: '田中太郎', isUsed: false, acquiredAt: '2025-11-03' },
    { id: 6, name: 'ありがとう', rarity: 'R', type: 'message', creatorName: 'ゲームマスター', isUsed: false, acquiredAt: '2025-11-03' },
    { id: 7, name: 'レインボー', rarity: 'UR', type: 'visual', creatorName: '田中太郎', isUsed: false, acquiredAt: '2025-11-04' },
    { id: 8, name: 'キラキラ', rarity: 'R', type: 'visual', creatorName: 'アリスちゃんねる', isUsed: false, acquiredAt: '2025-11-04' }
  ];
}

let currentFilters = {
  creator: '',
  rarity: '',
  status: ''
};

let selectedCard = null;

// 配信者フィルターの選択肢を生成
const creators = [...new Set(inventory.map(c => c.creatorName))];
const creatorFilter = document.getElementById('creatorFilter');
creators.forEach(creator => {
  const option = document.createElement('option');
  option.value = creator;
  option.textContent = creator;
  creatorFilter.appendChild(option);
});

function renderCards(cards) {
  const grid = document.getElementById('cardGrid');
  const emptyState = document.getElementById('emptyState');

  if (cards.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const cardIcons = {
    'message': '💬',
    'action': '⚡',
    'visual': '✨'
  };

  grid.innerHTML = cards.map((card, index) => `
    <div class="card-item ${card.isUsed ? 'used' : ''}">
      <div class="card-icon-large">${cardIcons[card.type]}</div>
      <div class="card-name">${card.name}</div>
      <div class="badge badge-rarity-${card.rarity.toLowerCase()}">${card.rarity}</div>
      <div class="card-creator">${card.creatorName}</div>
      ${card.isUsed
        ? '<div class="status-used">使用済み</div>'
        : `<button class="use-btn" onclick="openUseModal(${index})">使う</button>`
      }
    </div>
  `).join('');
}

function applyFilters() {
  currentFilters.creator = document.getElementById('creatorFilter').value;
  currentFilters.rarity = document.getElementById('rarityFilter').value;
  currentFilters.status = document.getElementById('statusFilter').value;

  let filtered = inventory;

  if (currentFilters.creator) {
    filtered = filtered.filter(c => c.creatorName === currentFilters.creator);
  }

  if (currentFilters.rarity) {
    filtered = filtered.filter(c => c.rarity === currentFilters.rarity);
  }

  if (currentFilters.status === 'unused') {
    filtered = filtered.filter(c => !c.isUsed);
  } else if (currentFilters.status === 'used') {
    filtered = filtered.filter(c => c.isUsed);
  }

  renderCards(filtered);
  updateStats();
}

function updateStats() {
  document.getElementById('totalCards').textContent = inventory.length;
  document.getElementById('unusedCards').textContent = inventory.filter(c => !c.isUsed).length;
  document.getElementById('usedCards').textContent = inventory.filter(c => c.isUsed).length;
  document.getElementById('urCards').textContent = inventory.filter(c => c.rarity === 'UR').length;
}

function openUseModal(index) {
  // フィルター適用後のカードから選択
  const filtered = getFilteredCards();
  selectedCard = filtered[index];

  const cardIcons = {
    'message': '💬',
    'action': '⚡',
    'visual': '✨'
  };

  document.getElementById('modalCardInfo').innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 4rem;">${cardIcons[selectedCard.type]}</div>
      <div style="font-size: 1.5rem; font-weight: 700; margin: 1rem 0;">${selectedCard.name}</div>
      <div class="badge badge-rarity-${selectedCard.rarity.toLowerCase()}">${selectedCard.rarity}</div>
    </div>
  `;

  const messageInput = document.getElementById('messageInput');
  if (selectedCard.type === 'message') {
    messageInput.classList.remove('hidden');
  } else {
    messageInput.classList.add('hidden');
  }

  openModal('useCardModal');
}

function getFilteredCards() {
  let filtered = inventory;

  if (currentFilters.creator) {
    filtered = filtered.filter(c => c.creatorName === currentFilters.creator);
  }

  if (currentFilters.rarity) {
    filtered = filtered.filter(c => c.rarity === currentFilters.rarity);
  }

  if (currentFilters.status === 'unused') {
    filtered = filtered.filter(c => !c.isUsed);
  } else if (currentFilters.status === 'used') {
    filtered = filtered.filter(c => c.isUsed);
  }

  return filtered;
}

function submitCardUse() {
  const message = document.getElementById('viewerMessage').value;

  showLoading();
  setTimeout(() => {
    hideLoading();
    closeModal('useCardModal');

    // カードを使用済みにマーク
    const index = inventory.findIndex(c => c.id === selectedCard.id && c.acquiredAt === selectedCard.acquiredAt);
    if (index !== -1) {
      inventory[index].isUsed = true;
      saveToStorage('inventory', inventory);
    }

    showToast('カードを使用しました！承認待ちキューに追加されました', 'success');

    // 再描画
    applyFilters();
  }, 1500);
}

// ナビゲーション生成
function renderInventoryNav() {
  const session = getCurrentSession();
  const nav = document.querySelector('.inventory-nav');
  const mobileNav = document.getElementById('mobileMenuLinks');

  if (!nav) return;

  let navHtml = '';
  let mobileNavHtml = '';

  if (isLoggedIn()) {
    navHtml = `
      <a href="discover.html" class="inventory-nav-link">配信者を探す</a>
      <a href="profile.html" class="inventory-nav-link">プロフィール</a>
      <a href="javascript:void(0)" onclick="logout()" class="inventory-nav-link">ログアウト</a>
    `;
    mobileNavHtml = `
      <a href="discover.html" class="mobile-menu-link">配信者を探す</a>
      <a href="profile.html" class="mobile-menu-link">プロフィール</a>
      <a href="javascript:void(0)" onclick="logout(); closeMobileMenu();" class="mobile-menu-link">ログアウト</a>
    `;
  } else {
    navHtml = `
      <a href="index.html" class="inventory-nav-link">ログイン</a>
    `;
    mobileNavHtml = `
      <a href="index.html" class="mobile-menu-link">ログイン</a>
    `;
  }

  nav.innerHTML = navHtml;
  if (mobileNav) {
    mobileNav.innerHTML = mobileNavHtml;
  }
}

// モバイルメニュー制御
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const menu = document.querySelector('.mobile-menu');

  hamburger.classList.toggle('active');
  overlay.classList.toggle('active');
  menu.classList.toggle('active');
  document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const menu = document.querySelector('.mobile-menu');

  hamburger.classList.remove('active');
  overlay.classList.remove('active');
  menu.classList.remove('active');
  document.body.style.overflow = '';
}

// 初期表示
renderInventoryNav();
applyFilters();
