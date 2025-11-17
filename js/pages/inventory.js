// inventory.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // ログインチェック
  if (!requireLogin()) {
    return;
  }

  // サイドバーのナビゲーションを生成
  renderSidebarNav('inventory');

  // 状態管理
  let inventory = loadFromStorage('inventory', []);
  let selectedCard = null;

  // 初期データ生成（デモ用）
  if (inventory.length === 0) {
    inventory = generateDemoInventory();
    saveToStorage('inventory', inventory);
  }

  // 統計情報を更新
  function updateStats() {
    const total = inventory.length;
    const unused = inventory.filter(card => !card.used).length;
    const used = inventory.filter(card => card.used).length;

    document.getElementById('totalCards').textContent = total;
    document.getElementById('unusedCards').textContent = unused;
    document.getElementById('usedCards').textContent = used;
  }

  // ストリーマーフィルターを生成
  function populateCreatorFilter() {
    const creatorFilter = document.getElementById('creatorFilter');
    const creators = [...new Set(inventory.map(card => card.creatorName))];

    creators.forEach(creatorName => {
      const option = document.createElement('option');
      option.value = creatorName;
      option.textContent = creatorName;
      creatorFilter.appendChild(option);
    });
  }

  // フィルター適用
  window.applyFilters = function() {
    const creatorFilter = document.getElementById('creatorFilter').value;
    const rarityFilter = document.getElementById('rarityFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = [...inventory];

    if (creatorFilter) {
      filtered = filtered.filter(card => card.creatorName === creatorFilter);
    }

    if (rarityFilter) {
      filtered = filtered.filter(card => card.rarity === rarityFilter);
    }

    if (statusFilter === 'unused') {
      filtered = filtered.filter(card => !card.used);
    } else if (statusFilter === 'used') {
      filtered = filtered.filter(card => card.used);
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
      const usedClass = card.used ? ' used' : '';
      const cardImage = card.imageUrl || ''; // 将来的にストリーマーが設定した画像

      return `
        <div class="inventory-card${usedClass}" data-card-id="${card.id}">
          <div class="card-frame">
            <svg class="card-frame-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="frame-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="shine-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
                </linearGradient>
              </defs>
              <!-- メインフレーム -->
              <rect x="2" y="2" width="196" height="276" rx="8" fill="none" stroke="url(#frame-gradient-${card.id})" stroke-width="3"/>

              <!-- 光沢効果 -->
              <rect x="5" y="5" width="30" height="60" rx="4" fill="url(#shine-gradient-${card.id})" opacity="0.6"/>

              <!-- コーナー装飾 左上 -->
              <path d="M 8 8 L 20 8 L 8 20 Z" fill="url(#frame-gradient-${card.id})" opacity="0.5"/>
              <!-- コーナー装飾 右上 -->
              <path d="M 192 8 L 180 8 L 192 20 Z" fill="url(#frame-gradient-${card.id})" opacity="0.5"/>
              <!-- コーナー装飾 左下 -->
              <path d="M 8 272 L 20 272 L 8 260 Z" fill="url(#frame-gradient-${card.id})" opacity="0.5"/>
              <!-- コーナー装飾 右下 -->
              <path d="M 192 272 L 180 272 L 192 260 Z" fill="url(#frame-gradient-${card.id})" opacity="0.5"/>

              <!-- 装飾ライン 上部 -->
              <line x1="30" y1="8" x2="170" y2="8" stroke="url(#frame-gradient-${card.id})" stroke-width="1" opacity="0.3"/>
              <!-- 装飾ライン 下部 -->
              <line x1="30" y1="272" x2="170" y2="272" stroke="url(#frame-gradient-${card.id})" stroke-width="1" opacity="0.3"/>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-image-area">
              ${cardImage ? `<img src="${cardImage}" alt="${card.name}" class="card-image">` : '<div class="card-image-placeholder"></div>'}
            </div>
            <div class="card-text-area">
              <div class="card-name">${card.name}</div>
              <div class="card-creator">${card.creatorName}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // カードクリックイベントを追加
    const cards = cardGrid.querySelectorAll('.inventory-card');
    cards.forEach(card => {
      card.addEventListener('click', function() {
        const cardId = this.getAttribute('data-card-id');
        openCardDetailModal(cardId);
      });
    });
  }

  // 日付フォーマット
  function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // カード詳細モーダルを開く
  window.openCardDetailModal = function(cardId) {
    const card = inventory.find(c => c.id === cardId);
    if (!card) return;

    selectedCard = card;
    const modal = document.getElementById('useCardModal');
    if (!modal) return;

    // モーダルの要素を取得
    const modalCardName = document.getElementById('modalCardName');
    const modalCardRarity = document.getElementById('modalCardRarity');
    const modalCardDescription = document.getElementById('modalCardDescription');
    const modalCardCount = document.getElementById('modalCardCount');
    const modalCardCooldown = document.getElementById('modalCardCooldown');

    // カード名とレアリティを設定
    modalCardName.textContent = card.name;
    modalCardRarity.textContent = card.rarity;
    modalCardRarity.className = `modal-rarity-badge rarity-${card.rarity}`;

    // カード説明を設定
    modalCardDescription.textContent = card.effect;

    // 所有数を計算（同じcardIdのカード数）
    const ownedCount = inventory.filter(c => c.cardId === card.cardId && !c.used).length;
    modalCardCount.textContent = `${ownedCount}枚`;

    // クールダウンタイムを設定
    const cooldownMap = {
      'N': '1分',
      'R': '5分',
      'SR': '10分',
      'UR': '30分'
    };
    modalCardCooldown.textContent = cooldownMap[card.rarity] || '1分';

    modal.classList.add('active');
  };

  // カード詳細モーダルを閉じる
  window.closeUseCardModal = function() {
    const modal = document.getElementById('useCardModal');
    modal.classList.remove('active');
    selectedCard = null;
  };

  // デモ用インベントリ生成
  function generateDemoInventory() {
    if (typeof ownedCards === 'undefined' || typeof cards === 'undefined') {
      return [];
    }

    // ownedCardsをベースに、cardsから詳細情報を取得
    return ownedCards.map(ownedCard => {
      const cardDetails = cards.find(c => c.id === ownedCard.cardId);
      if (!cardDetails) return null;

      // effectを生成
      let effect = '';
      if (cardDetails.type === 'message') {
        effect = cardDetails.effectData?.message || 'メッセージを送信';
      } else if (cardDetails.type === 'action') {
        effect = `${cardDetails.effectData?.animation || 'アニメーション'}を再生`;
      } else if (cardDetails.type === 'visual') {
        effect = `${cardDetails.effectData?.animation || 'エフェクト'}を表示`;
      }

      return {
        id: `card-${ownedCard.id}`,
        cardId: cardDetails.id,
        name: cardDetails.name,
        rarity: cardDetails.rarity,
        type: cardDetails.type,
        effect: effect,
        creatorName: ownedCard.creatorName,
        creatorId: ownedCard.creatorId || 1,
        acquiredAt: ownedCard.acquiredAt,
        used: ownedCard.isUsed || false
      };
    }).filter(card => card !== null);
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

  // モーダル外クリックで閉じる
  const useCardModal = document.getElementById('useCardModal');
  if (useCardModal) {
    useCardModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeUseCardModal();
      }
    });
  }

  // 初期表示
  updateStats();
  populateCreatorFilter();
  applyFilters();
});
