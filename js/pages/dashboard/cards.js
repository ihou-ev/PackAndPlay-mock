// dashboard/cards.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // ログインチェック
  if (!requireLogin()) {
    return;
  }

  // 配信者権限チェック
  if (!requireCreatorRole()) {
    return;
  }

  // サイドバーのナビゲーションを生成
  renderSidebarNav('dashboard-cards');

  let editingCardId = null;

  // 統計情報を更新
  function updateStats() {
    const totalCards = cards.length;
    const nCards = cards.filter(c => c.rarity === 'N').length;
    const rCards = cards.filter(c => c.rarity === 'R').length;
    const srCards = cards.filter(c => c.rarity === 'SR').length;
    const urCards = cards.filter(c => c.rarity === 'UR').length;

    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('normalCards').textContent = nCards;
    document.getElementById('rareCards').textContent = rCards;
    document.getElementById('superRareCards').textContent = srCards;
    document.getElementById('ultraRareCards').textContent = urCards;
  }

  // フィルター適用
  window.applyFilters = function() {
    const rarityFilter = document.getElementById('rarityFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    let filtered = [...cards];

    if (rarityFilter) {
      filtered = filtered.filter(card => card.rarity === rarityFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(card => card.type === typeFilter);
    }

    renderCards(filtered);
  };

  // カード表示
  function renderCards(cardsToRender) {
    const cardGrid = document.getElementById('cardGrid');
    const emptyState = document.getElementById('emptyState');

    if (cardsToRender.length === 0) {
      cardGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    cardGrid.innerHTML = cardsToRender.map(card => {
      const rarityClass = `badge-${card.rarity}`;
      const typeClass = `badge-${card.type}`;
      const typeName = {
        'action': 'アクション',
        'visual': 'ビジュアル',
        'message': 'メッセージ'
      }[card.type] || card.type;

      return `
        <div class="card-item" data-card-id="${card.id}">
          <div class="card-item-header">
            <h3 class="card-item-name">${card.name}</h3>
            <div class="card-item-badges">
              <span class="card-badge ${rarityClass}">${card.rarity}</span>
              <span class="card-badge ${typeClass}">${typeName}</span>
            </div>
          </div>
          ${card.flavor ? `<p class="card-item-flavor">${card.flavor}</p>` : ''}
          <p class="card-item-description">${card.description || 'カードの説明がありません'}</p>
          <div class="card-item-actions">
            <button class="card-action-button" onclick="editCard(${card.id})">編集</button>
            <button class="card-action-button delete" onclick="deleteCard(${card.id})">削除</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // カード作成モーダルを開く
  window.openCreateModal = function() {
    editingCardId = null;
    document.getElementById('modalTitle').textContent = '新規カード作成';
    document.getElementById('cardForm').reset();
    openCardModal();
  };

  // カード編集
  window.editCard = function(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    editingCardId = cardId;
    document.getElementById('modalTitle').textContent = 'カード編集';
    document.getElementById('cardName').value = card.name;
    document.getElementById('cardFlavor').value = card.flavor || '';
    document.getElementById('cardDescription').value = card.description || '';
    document.getElementById('cardRarity').value = card.rarity;
    document.getElementById('cardType').value = card.type;
    document.getElementById('cardImage').value = card.imageUrl || '';

    openCardModal();
  };

  // カード削除
  window.deleteCard = function(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    if (confirm(`「${card.name}」を削除してもよろしいですか？`)) {
      const index = cards.findIndex(c => c.id === cardId);
      if (index !== -1) {
        cards.splice(index, 1);
        showToast('カードを削除しました', 'success');
        updateStats();
        applyFilters();
      }
    }
  };

  // モーダルを開く
  function openCardModal() {
    const modal = document.getElementById('cardModal');
    modal.style.display = '';
    modal.classList.add('active');
  }

  // モーダルを閉じる
  window.closeCardModal = function() {
    const modal = document.getElementById('cardModal');
    modal.classList.remove('active');
    editingCardId = null;
  };

  // フォーム送信
  document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const cardData = {
      name: document.getElementById('cardName').value,
      flavor: document.getElementById('cardFlavor').value,
      description: document.getElementById('cardDescription').value,
      rarity: document.getElementById('cardRarity').value,
      type: document.getElementById('cardType').value,
      imageUrl: document.getElementById('cardImage').value,
      requiresApproval: document.getElementById('cardType').value === 'message',
      effectData: {}
    };

    if (editingCardId) {
      // 編集
      const card = cards.find(c => c.id === editingCardId);
      if (card) {
        Object.assign(card, cardData);
        showToast('カードを更新しました', 'success');
      }
    } else {
      // 新規作成
      const newCard = {
        id: Math.max(...cards.map(c => c.id), 0) + 1,
        ...cardData
      };
      cards.push(newCard);
      showToast('カードを作成しました', 'success');
    }

    closeCardModal();
    updateStats();
    applyFilters();
  });

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

  // モーダル外クリックで閉じる
  const cardModal = document.getElementById('cardModal');
  if (cardModal) {
    const modalContent = cardModal.querySelector('.modal');
    if (modalContent) {
      modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    cardModal.addEventListener('click', function(e) {
      closeCardModal();
    });
  }

  // 初期表示
  updateStats();
  applyFilters();
});
