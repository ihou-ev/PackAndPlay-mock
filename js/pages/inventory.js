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
  let isModalOpening = false;

  // 初期データ生成（デモ用）
  // 常に最新のデータを生成（開発用）
  inventory = generateDemoInventory();
  saveToStorage('inventory', inventory);

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
            </div>
          </div>
        </div>
      `;
    }).join('');

    // カードクリックイベントを追加
    const cards = cardGrid.querySelectorAll('.inventory-card');
    console.log('カードイベント設定数:', cards.length);
    cards.forEach(card => {
      card.addEventListener('click', function(e) {
        console.log('カードクリック:', this.getAttribute('data-card-id'));
        e.preventDefault(); // デフォルト動作を防止
        e.stopPropagation(); // イベントのバブリングを止める
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
    console.log('openCardDetailModal呼び出し:', cardId);
    const card = inventory.find(c => c.id === cardId);
    if (!card) {
      console.log('カードが見つかりません:', cardId);
      return;
    }

    selectedCard = card;
    const modal = document.getElementById('useCardModal');
    if (!modal) {
      console.log('モーダル要素が見つかりません');
      return;
    }
    console.log('モーダル要素取得成功');

    // モーダルの要素を取得
    const modalCardName = document.getElementById('modalCardName');
    const modalCardFlavor = document.getElementById('modalCardFlavor');
    const modalCardDescription = document.getElementById('modalCardDescription');
    const modalCardCreator = document.getElementById('modalCardCreator');
    const modalCardPack = document.getElementById('modalCardPack');
    const modalCardCount = document.getElementById('modalCardCount');
    const modalCardCooldown = document.getElementById('modalCardCooldown');

    // カード名を設定
    modalCardName.textContent = card.name;

    // フレーバーテキストを設定（現在は空）
    modalCardFlavor.textContent = card.flavor || '';

    // カード説明を設定
    modalCardDescription.textContent = card.effect;

    // ストリーマー名とパック名を設定
    modalCardCreator.textContent = card.creatorName;
    modalCardPack.textContent = card.packName;

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

    // モーダルを開く
    isModalOpening = true;
    console.log('モーダルを開く - isModalOpening:', isModalOpening);
    console.log('モーダル開く前のクラス:', modal.className);
    console.log('モーダル開く前のactive:', modal.classList.contains('active'));

    modal.classList.add('active');

    console.log('モーダル開いた後のクラス:', modal.className);
    console.log('モーダルクラス追加後 - active:', modal.classList.contains('active'));

    // 計算済みスタイルを確認
    const computedStyle = window.getComputedStyle(modal);
    console.log('モーダルのopacity:', computedStyle.opacity);
    console.log('モーダルのvisibility:', computedStyle.visibility);
    console.log('モーダルのdisplay:', computedStyle.display);

    // 次のイベントループでフラグをリセット
    setTimeout(() => {
      isModalOpening = false;
      console.log('isModalOpeningフラグリセット:', isModalOpening);
    }, 100);
  };

  // カード詳細モーダルを閉じる
  window.closeUseCardModal = function() {
    console.log('closeUseCardModal呼び出し');
    const modal = document.getElementById('useCardModal');
    console.log('モーダル閉じる前のクラス:', modal.className);
    console.log('モーダル閉じる前のactive:', modal.classList.contains('active'));

    modal.classList.remove('active');

    console.log('モーダル閉じた後のクラス:', modal.className);
    console.log('モーダルクラス削除後 - active:', modal.classList.contains('active'));

    // 計算済みスタイルを確認
    const computedStyle = window.getComputedStyle(modal);
    console.log('閉じた後のopacity:', computedStyle.opacity);
    console.log('閉じた後のvisibility:', computedStyle.visibility);

    selectedCard = null;
  };

  // デモ用インベントリ生成
  function generateDemoInventory() {
    if (typeof ownedCards === 'undefined' || typeof cards === 'undefined' || typeof packs === 'undefined') {
      return [];
    }

    // ownedCardsをベースに、cardsから詳細情報を取得
    return ownedCards.map(ownedCard => {
      const cardDetails = cards.find(c => c.id === ownedCard.cardId);
      if (!cardDetails) return null;

      // パック情報を取得
      const packDetails = packs.find(p => p.id === ownedCard.packId);

      // effectを生成（descriptionがあればそれを使用、なければ自動生成）
      let effect = '';
      if (cardDetails.description) {
        effect = cardDetails.description;
      } else if (cardDetails.type === 'message') {
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
        flavor: cardDetails.flavor || '',
        effect: effect,
        creatorName: ownedCard.creatorName,
        creatorId: ownedCard.creatorId || 1,
        packId: ownedCard.packId,
        packName: packDetails ? packDetails.name : '不明なパック',
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
  console.log('モーダルイベントリスナー設定開始');
  if (useCardModal) {
    // モーダルコンテンツのクリックはバブリングを止める
    const modalContent = useCardModal.querySelector('.modal');
    if (modalContent) {
      console.log('モーダルコンテンツのクリックイベント設定');
      modalContent.addEventListener('click', function(e) {
        console.log('モーダルコンテンツクリック - stopPropagation');
        e.stopPropagation();
      });
    }

    // モーダルオーバーレイのクリックでモーダルを閉じる
    console.log('モーダルオーバーレイのクリックイベント設定');
    useCardModal.addEventListener('click', function(e) {
      console.log('モーダルオーバーレイクリック - isModalOpening:', isModalOpening);
      console.log('モーダルオーバーレイクリック - target:', e.target);
      console.log('モーダルオーバーレイクリック - currentTarget:', e.currentTarget);
      // モーダルを開いている最中はクリックを無視
      if (isModalOpening) {
        console.log('モーダル開き中のためクリックを無視');
        return;
      }
      closeUseCardModal();
    });
  }
  console.log('モーダルイベントリスナー設定完了');

  // 初期表示
  updateStats();
  populateCreatorFilter();
  applyFilters();
});
