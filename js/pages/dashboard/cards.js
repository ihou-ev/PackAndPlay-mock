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
  let currentCardImageData = null;

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

  // パックフィルターを生成
  function populatePackFilter() {
    const packFilter = document.getElementById('packFilter');
    if (!packFilter) return;

    // 現在のセッションからクリエイターのパックを取得
    const session = getCurrentSession();
    if (!session) return;

    const creatorPacks = packs.filter(p => p.creatorSlug === session.creatorSlug);

    creatorPacks.forEach(pack => {
      const option = document.createElement('option');
      option.value = pack.id;
      option.textContent = pack.name;
      packFilter.appendChild(option);
    });
  }

  // フィルター適用
  window.applyFilters = function() {
    const packFilter = document.getElementById('packFilter').value;
    const rarityFilter = document.getElementById('rarityFilter').value;

    let filtered = [...cards];

    // パックでフィルター
    if (packFilter) {
      const selectedPack = packs.find(p => p.id === parseInt(packFilter));
      if (selectedPack) {
        // パックに含まれるカードIDのリストを取得
        const packCardIds = selectedPack.cards.map(c => c.id);
        filtered = filtered.filter(card => packCardIds.includes(card.id));
      }
    }

    // レアリティでフィルター
    if (rarityFilter) {
      filtered = filtered.filter(card => card.rarity === rarityFilter);
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
      // 画像パスの調整（dashboard/からの相対パス）
      let cardImage = card.imageUrl || '';
      if (cardImage && !cardImage.startsWith('data:') && !cardImage.startsWith('http') && !cardImage.startsWith('../')) {
        cardImage = '../' + cardImage;
      }

      return `
        <div class="inventory-card creator-card" data-card-id="${card.id}">
          <div class="card-frame">
            <svg class="card-frame-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
              <!-- メインフレーム -->
              <rect x="2" y="2" width="196" height="276" rx="8" fill="none" stroke="#000000" stroke-width="3"/>

              <!-- コーナー装飾 左上 -->
              <path d="M 8 8 L 20 8 L 8 20 Z" fill="#000000" opacity="0.5"/>
              <!-- コーナー装飾 右上 -->
              <path d="M 192 8 L 180 8 L 192 20 Z" fill="#000000" opacity="0.5"/>
              <!-- コーナー装飾 左下 -->
              <path d="M 8 272 L 20 272 L 8 260 Z" fill="#000000" opacity="0.5"/>
              <!-- コーナー装飾 右下 -->
              <path d="M 192 272 L 180 272 L 192 260 Z" fill="#000000" opacity="0.5"/>

              <!-- 装飾ライン 上部 -->
              <line x1="30" y1="8" x2="170" y2="8" stroke="#000000" stroke-width="1" opacity="0.3"/>
              <!-- 装飾ライン 下部 -->
              <line x1="30" y1="272" x2="170" y2="272" stroke="#000000" stroke-width="1" opacity="0.3"/>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-image-area">
              ${cardImage ? `<img src="${cardImage}" alt="${card.name}" class="card-image">` : '<div class="card-image-placeholder"></div>'}
            </div>
            <div class="card-text-area">
              <div class="card-name">${card.name}</div>
              ${card.flavor ? `<div class="card-flavor">${card.flavor}</div>` : ''}
              <div class="card-description">${card.description || 'カードの説明がありません'}</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="card-action-btn card-edit-btn" onclick="editCard(${card.id}); event.stopPropagation();" title="編集">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button class="card-action-btn card-delete-btn" onclick="deleteCard(${card.id}); event.stopPropagation();" title="削除">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 画像アップロード処理
  window.handleCardImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      showToast('画像サイズは5MB以下にしてください', 'error');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      showToast('画像ファイルを選択してください', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      currentCardImageData = e.target.result;

      // プレビュー表示
      const preview = document.getElementById('cardImagePreview');
      preview.innerHTML = `<img src="${currentCardImageData}" alt="カード画像">`;
    };
    reader.readAsDataURL(file);
  };

  // カード作成モーダルを開く
  window.openCreateModal = function() {
    editingCardId = null;
    currentCardImageData = null;
    document.getElementById('modalTitle').textContent = '新規カード作成';
    document.getElementById('cardForm').reset();

    // デフォルト値を設定
    document.getElementById('cardApproval').value = 'auto';

    // 画像プレビューをリセット
    const preview = document.getElementById('cardImagePreview');
    preview.innerHTML = `
      <div class="card-image-placeholder-upload">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span>クリックして画像を選択</span>
      </div>
    `;

    openCardModal();
  };

  // カード編集
  window.editCard = function(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    editingCardId = cardId;
    currentCardImageData = card.imageUrl || null;
    document.getElementById('modalTitle').textContent = 'カード編集';
    document.getElementById('cardName').value = card.name;
    document.getElementById('cardFlavor').value = card.flavor || '';
    document.getElementById('cardDescription').value = card.description || '';
    document.getElementById('cardRarity').value = card.rarity;
    document.getElementById('cardCooldown').value = card.cooldown || '1';
    document.getElementById('cardApproval').value = card.requiresApproval ? 'manual' : 'auto';

    // 画像プレビューを設定
    const preview = document.getElementById('cardImagePreview');
    if (card.imageUrl) {
      preview.innerHTML = `<img src="${card.imageUrl}" alt="カード画像">`;
    } else {
      preview.innerHTML = `
        <div class="card-image-placeholder-upload">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>クリックして画像を選択</span>
        </div>
      `;
    }

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
    currentCardImageData = null;

    // ファイル入力をリセット
    const fileInput = document.getElementById('cardImageInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // フォーム送信
  document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const approvalValue = document.getElementById('cardApproval').value;

    const cardData = {
      name: document.getElementById('cardName').value,
      flavor: document.getElementById('cardFlavor').value,
      description: document.getElementById('cardDescription').value,
      rarity: document.getElementById('cardRarity').value,
      cooldown: parseInt(document.getElementById('cardCooldown').value),
      imageUrl: currentCardImageData || '',
      type: 'action', // デフォルト値として保持（互換性のため）
      requiresApproval: approvalValue === 'manual',
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
  populatePackFilter();
  updateStats();
  applyFilters();
});
