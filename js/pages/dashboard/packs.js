// dashboard/packs.html専用スクリプト

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
  renderSidebarNav('dashboard-packs');

  let editingPackId = null;
  let selectedCards = {}; // { cardId: dropRate }
  let currentPackImageData = null;

  // レアリティごとの基本重み（排出率の基準値）
  const rarityWeights = {
    'N': 50,   // ノーマル: 高確率
    'R': 30,   // レア: 中確率
    'SR': 15,  // スーパーレア: 低確率
    'UR': 5    // ウルトラレア: 超低確率
  };

  // プリセットカード（よく使われる基本的なカード）
  const presetCards = [
    { id: 'preset-1', name: 'こんにちは', rarity: 'N', type: 'message', description: '視聴者から挨拶メッセージ', imageUrl: '' },
    { id: 'preset-2', name: 'ありがとう', rarity: 'N', type: 'message', description: '感謝のメッセージ', imageUrl: '' },
    { id: 'preset-3', name: 'いいね！', rarity: 'R', type: 'action', description: '画面にいいねエフェクト', imageUrl: '' },
    { id: 'preset-4', name: 'きらきら', rarity: 'R', type: 'visual', description: 'キラキラエフェクト', imageUrl: '' },
    { id: 'preset-5', name: '花火', rarity: 'SR', type: 'visual', description: '花火エフェクト', imageUrl: '' },
    { id: 'preset-6', name: 'レインボー', rarity: 'SR', type: 'visual', description: 'レインボーエフェクト', imageUrl: '' },
    { id: 'preset-7', name: '激レア', rarity: 'UR', type: 'action', description: '超豪華エフェクト', imageUrl: '' },
    { id: 'preset-8', name: '応援メッセージ', rarity: 'R', type: 'message', description: '視聴者からの応援', imageUrl: '' },
  ];

  // 統計情報を更新
  function updateStats() {
    const totalPacks = packs.length;
    const totalSales = packs.reduce((sum, pack) => sum + (pack.sales || 0), 0);
    const averagePrice = totalPacks > 0
      ? Math.round(packs.reduce((sum, pack) => sum + pack.price, 0) / totalPacks)
      : 0;

    document.getElementById('totalPacks').textContent = totalPacks;
    document.getElementById('totalSales').textContent = `¥${totalSales.toLocaleString()}`;
    document.getElementById('averagePrice').textContent = `¥${averagePrice.toLocaleString()}`;
  }

  // パック表示
  function renderPacks() {
    const packList = document.getElementById('packList');
    const emptyState = document.getElementById('emptyState');

    if (packs.length === 0) {
      packList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    packList.innerHTML = packs.map(pack => {
      const imageUrl = pack.imageUrl || '';
      const description = pack.description || 'パックの説明がありません';
      const cardCount = pack.cards?.length || 0;
      const sales = pack.sales || 0;
      const isPublished = pack.isPublished !== false; // デフォルトは公開

      return `
        <div class="pack-item" data-pack-id="${pack.id}">
          <div class="pack-image" style="${imageUrl ? `background-image: url('${imageUrl}'); background-size: cover;` : ''}"></div>
          <div class="pack-info">
            <div class="pack-header">
              <h3 class="pack-name">${pack.name}</h3>
              <div class="pack-header-right">
                <span class="pack-status-badge ${isPublished ? 'published' : 'unpublished'}">
                  ${isPublished ? '公開中' : '非公開'}
                </span>
                <div class="pack-price">¥${pack.price.toLocaleString()}</div>
              </div>
            </div>
            <p class="pack-description">${description}</p>
            <div class="pack-meta">
              <span class="pack-meta-item">📇 ${cardCount}種類のカード</span>
              <span class="pack-meta-item">💰 ${sales.toLocaleString()}円の売上</span>
            </div>
            <div class="pack-actions">
              <button class="pack-action-button toggle" onclick="togglePackPublish(${pack.id})">
                ${isPublished ? '非公開にする' : '公開する'}
              </button>
              <button class="pack-action-button" onclick="editPack(${pack.id})">編集</button>
              <button class="pack-action-button delete" onclick="deletePack(${pack.id})">削除</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // カード選択モーダルを開く
  window.openCardSelectionModal = function() {
    renderPresetCards();
    renderOriginalCards();
    updateCardSelectionCount();
    const modal = document.getElementById('cardSelectionModal');
    modal.style.display = '';
    modal.classList.add('active');
  };

  // カード選択数を更新
  function updateCardSelectionCount() {
    const subtitle = document.querySelector('#cardSelectionModal .modal-subtitle');
    if (subtitle) {
      const count = Object.keys(selectedCards).length;
      subtitle.textContent = `選択中: ${count}/10枚`;

      // 10枚選択済みの場合は警告色に
      if (count >= 10) {
        subtitle.style.color = '#dc2626';
        subtitle.style.fontWeight = '600';
      } else {
        subtitle.style.color = '#6b7280';
        subtitle.style.fontWeight = '400';
      }
    }
  }

  // カード選択モーダルを閉じる
  window.closeCardSelectionModal = function() {
    const modal = document.getElementById('cardSelectionModal');
    modal.classList.remove('active');
  };

  // タブ切り替え
  window.switchCardTab = function(tabName) {
    // タブボタンの切り替え
    document.querySelectorAll('.card-selection-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`.card-selection-tab[data-tab="${tabName}"]`).classList.add('active');

    // タブコンテンツの切り替え
    document.querySelectorAll('.card-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}CardTab`).classList.add('active');
  };

  // プリセットカードを表示
  function renderPresetCards() {
    const grid = document.getElementById('presetCardGrid');
    grid.innerHTML = presetCards.map(card => renderVisualCard(card, true)).join('');
  }

  // オリジナルカードを表示
  function renderOriginalCards() {
    const grid = document.getElementById('originalCardGrid');
    grid.innerHTML = cards.map(card => renderVisualCard(card, false)).join('');
  }

  // ビジュアルカードを生成
  function renderVisualCard(card, isPreset) {
    const cardIdStr = String(card.id);
    const isSelected = selectedCards.hasOwnProperty(cardIdStr);
    const rarityColors = {
      'N': '#9ca3af',
      'R': '#3b82f6',
      'SR': '#8b5cf6',
      'UR': '#f59e0b'
    };

    // 画像パスの調整
    let cardImage = card.imageUrl || '';
    if (cardImage && !cardImage.startsWith('data:') && !cardImage.startsWith('http') && !cardImage.startsWith('../')) {
      cardImage = '../' + cardImage;
    }

    return `
      <div class="visual-card-item ${isSelected ? 'selected' : ''}" onclick="selectCard('${cardIdStr}')">
        <div class="visual-card-frame" style="border-color: ${rarityColors[card.rarity]}">
          <div class="visual-card-image">
            ${cardImage ? `<img src="${cardImage}" alt="${card.name}">` : '<div class="visual-card-placeholder"></div>'}
          </div>
          <div class="visual-card-info">
            <div class="visual-card-name">${card.name}</div>
            <span class="visual-card-rarity" style="background: ${rarityColors[card.rarity]}">${card.rarity}</span>
          </div>
          ${isSelected ? '<div class="visual-card-check">✓</div>' : ''}
        </div>
      </div>
    `;
  }

  // レアリティに基づいて排出率を自動調整
  window.autoAdjustDropRates = function() {
    const selectedCardIds = Object.keys(selectedCards);
    if (selectedCardIds.length === 0) return;

    // 各カードのレアリティを取得して重みを計算
    let totalWeight = 0;
    const cardWeights = {};

    selectedCardIds.forEach(cardId => {
      const card = presetCards.find(c => String(c.id) === cardId) || cards.find(c => String(c.id) === cardId);
      if (card) {
        const weight = rarityWeights[card.rarity] || 10;
        cardWeights[cardId] = weight;
        totalWeight += weight;
      }
    });

    // 重みを正規化して排出率を計算（合計100%）
    if (totalWeight > 0) {
      let assignedTotal = 0;

      selectedCardIds.forEach((cardId, index) => {
        const weight = cardWeights[cardId] || 0;

        // 最後のカード以外は通常の計算
        if (index < selectedCardIds.length - 1) {
          const rate = parseFloat(((weight / totalWeight) * 100).toFixed(1));
          selectedCards[cardId] = rate;
          assignedTotal += rate;
        } else {
          // 最後のカードで100%になるように調整
          selectedCards[cardId] = parseFloat((100 - assignedTotal).toFixed(1));
        }
      });
    }

    renderSelectedCardsList();
    updateDropRateTotal();
  };

  // カードを選択
  window.selectCard = function(cardId) {
    if (selectedCards.hasOwnProperty(cardId)) {
      delete selectedCards[cardId];
    } else {
      // 最大10枚までの制限
      if (Object.keys(selectedCards).length >= 10) {
        showToast('カードは最大10枚まで選択できます', 'error');
        return;
      }
      selectedCards[cardId] = 0;
    }

    // カードを追加した場合は自動調整
    if (selectedCards.hasOwnProperty(cardId)) {
      autoAdjustDropRates();
    }

    renderPresetCards();
    renderOriginalCards();
    renderSelectedCardsList();
    updateDropRateTotal();
    updateCardSelectionCount();
  };

  // 選択済みカードリストを表示
  function renderSelectedCardsList() {
    const list = document.getElementById('selectedCardsList');

    const selectedCardIds = Object.keys(selectedCards);
    if (selectedCardIds.length === 0) {
      list.innerHTML = '<div class="empty-cards-message">カードが追加されていません</div>';
      return;
    }

    list.innerHTML = selectedCardIds.map(cardId => {
      // プリセットかオリジナルか判定
      const card = presetCards.find(c => String(c.id) === cardId) || cards.find(c => String(c.id) === cardId);
      if (!card) return '';

      const dropRate = selectedCards[cardId] || 0;
      const rarityColors = {
        'N': '#9ca3af',
        'R': '#3b82f6',
        'SR': '#8b5cf6',
        'UR': '#f59e0b'
      };

      // 画像パスの調整
      let cardImage = card.imageUrl || '';
      if (cardImage && !cardImage.startsWith('data:') && !cardImage.startsWith('http') && !cardImage.startsWith('../')) {
        cardImage = '../' + cardImage;
      }

      return `
        <div class="selected-card-visual">
          <div class="selected-card-thumbnail">
            <div class="selected-card-image" style="border-color: ${rarityColors[card.rarity]}">
              ${cardImage ? `<img src="${cardImage}" alt="${card.name}">` : '<div class="selected-card-placeholder"></div>'}
            </div>
            <span class="selected-card-badge" style="background: ${rarityColors[card.rarity]}">${card.rarity}</span>
          </div>
          <div class="selected-card-details">
            <div class="selected-card-name">${card.name}</div>
            <div class="selected-card-controls">
              <label class="drop-rate-label">排出率</label>
              <div class="drop-rate-input-group">
                <input type="number"
                       class="drop-rate-input"
                       value="${dropRate}"
                       min="0"
                       max="100"
                       step="0.1"
                       placeholder="0"
                       oninput="updateDropRate('${cardId}', this.value)">
                <span class="drop-rate-percent">%</span>
              </div>
            </div>
          </div>
          <button type="button" class="remove-card-btn-visual" onclick="removeCard('${cardId}')" title="削除">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  }

  // カードを削除
  window.removeCard = function(cardId) {
    delete selectedCards[cardId];
    renderPresetCards();
    renderOriginalCards();
    renderSelectedCardsList();
    updateDropRateTotal();
    updateCardSelectionCount();
  };

  // 排出率更新
  window.updateDropRate = function(cardId, value) {
    const rate = parseFloat(value) || 0;
    selectedCards[cardId] = Math.max(0, Math.min(100, rate));
    updateDropRateTotal();
  };

  // 排出率合計を更新
  function updateDropRateTotal() {
    const total = Object.values(selectedCards).reduce((sum, rate) => sum + rate, 0);
    const totalElement = document.getElementById('totalDropRate');
    const warningElement = document.getElementById('dropRateWarning');

    totalElement.textContent = total.toFixed(1);

    // 合計が100%の場合
    if (Math.abs(total - 100) < 0.01) {
      totalElement.classList.remove('invalid');
      totalElement.classList.add('valid');
      warningElement.classList.add('hidden');
    } else {
      totalElement.classList.remove('valid');
      totalElement.classList.add('invalid');
      warningElement.classList.remove('hidden');
    }
  }

  // 画像アップロード処理
  window.handlePackImageUpload = function(event) {
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
      currentPackImageData = e.target.result;

      // プレビュー表示
      const preview = document.getElementById('packImagePreview');
      preview.innerHTML = `<img src="${currentPackImageData}" alt="パック画像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">`;
    };
    reader.readAsDataURL(file);
  };

  // パック作成モーダルを開く
  window.openCreateModal = function() {
    editingPackId = null;
    selectedCards = {};
    currentPackImageData = null;
    document.getElementById('modalTitle').textContent = '新規パック作成';
    document.getElementById('packForm').reset();
    document.getElementById('packIsPublished').checked = true;
    updatePublishToggleLabel();

    // 画像プレビューをリセット
    const preview = document.getElementById('packImagePreview');
    preview.innerHTML = `
      <div class="pack-image-placeholder-upload">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span>クリックして画像を選択</span>
      </div>
    `;

    renderSelectedCardsList();
    updateDropRateTotal();
    openPackModal();
  };

  // パック編集
  window.editPack = function(packId) {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    editingPackId = packId;
    currentPackImageData = pack.imageUrl || null;

    // 選択カードと排出率を復元
    selectedCards = {};
    if (pack.cards && Array.isArray(pack.cards)) {
      pack.cards.forEach(card => {
        selectedCards[String(card.id)] = card.dropRate || 0;
      });
    }

    document.getElementById('modalTitle').textContent = 'パック編集';
    document.getElementById('packName').value = pack.name;
    document.getElementById('packDescription').value = pack.description || '';
    document.getElementById('packPrice').value = pack.price;
    document.getElementById('packCardCount').value = pack.cards?.length || 1;
    document.getElementById('packIsPublished').checked = pack.isPublished !== false;
    updatePublishToggleLabel();

    // 画像プレビューを設定
    const preview = document.getElementById('packImagePreview');
    if (pack.imageUrl) {
      preview.innerHTML = `<img src="${pack.imageUrl}" alt="パック画像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">`;
    } else {
      preview.innerHTML = `
        <div class="pack-image-placeholder-upload">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>クリックして画像を選択</span>
        </div>
      `;
    }

    renderSelectedCardsList();
    updateDropRateTotal();
    openPackModal();
  };

  // パック公開状態切り替え
  window.togglePackPublish = function(packId) {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    pack.isPublished = !pack.isPublished;
    const status = pack.isPublished ? '公開' : '非公開';
    showToast(`パックを${status}にしました`, 'success');
    renderPacks();
  };

  // パック削除
  window.deletePack = function(packId) {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    if (confirm(`「${pack.name}」を削除してもよろしいですか？`)) {
      const index = packs.findIndex(p => p.id === packId);
      if (index !== -1) {
        packs.splice(index, 1);
        showToast('パックを削除しました', 'success');
        updateStats();
        renderPacks();
      }
    }
  };

  // モーダルを開く
  function openPackModal() {
    const modal = document.getElementById('packModal');
    modal.style.display = '';
    modal.classList.add('active');
  }

  // モーダルを閉じる
  window.closePackModal = function() {
    const modal = document.getElementById('packModal');
    modal.classList.remove('active');
    editingPackId = null;
  };

  // トグルスイッチラベル更新
  function updatePublishToggleLabel() {
    const checkbox = document.getElementById('packIsPublished');
    const label = document.getElementById('publishToggleLabel');
    if (checkbox && label) {
      label.textContent = checkbox.checked ? '公開する' : '非公開にする';
    }
  }

  // トグルスイッチの変更イベント
  const publishCheckbox = document.getElementById('packIsPublished');
  if (publishCheckbox) {
    publishCheckbox.addEventListener('change', updatePublishToggleLabel);
  }

  // フォーム送信
  document.getElementById('packForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 選択されたカードを配列に変換
    const cardsArray = Object.keys(selectedCards).map(cardId => {
      // プリセットかオリジナルか判定してカード情報を取得
      const card = presetCards.find(c => String(c.id) === cardId) || cards.find(c => String(c.id) === cardId);
      if (!card) return null;

      return {
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        type: card.type || 'action',
        dropRate: selectedCards[cardId] || 0
      };
    }).filter(card => card !== null);

    // カードが選択されているか確認
    if (cardsArray.length === 0) {
      showToast('カードを1枚以上追加してください', 'error');
      return;
    }

    // 排出率の合計が100%か確認
    const total = Object.values(selectedCards).reduce((sum, rate) => sum + rate, 0);
    if (Math.abs(total - 100) > 0.01) {
      showToast('排出率の合計を100%にしてください', 'error');
      return;
    }

    const packData = {
      name: document.getElementById('packName').value,
      description: document.getElementById('packDescription').value,
      price: parseInt(document.getElementById('packPrice').value),
      imageUrl: currentPackImageData || '',
      isPublished: document.getElementById('packIsPublished').checked,
      cards: cardsArray
    };

    if (editingPackId) {
      // 編集
      const pack = packs.find(p => p.id === editingPackId);
      if (pack) {
        Object.assign(pack, packData);
        showToast('パックを更新しました', 'success');
      }
    } else {
      // 新規作成
      const newPack = {
        id: Math.max(...packs.map(p => p.id), 0) + 1,
        ...packData,
        sales: 0,
        createdAt: new Date().toISOString()
      };
      packs.push(newPack);
      showToast('パックを作成しました', 'success');
    }

    closePackModal();
    updateStats();
    renderPacks();
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
  const packModal = document.getElementById('packModal');
  if (packModal) {
    const modalContent = packModal.querySelector('.modal');
    if (modalContent) {
      modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    packModal.addEventListener('click', function(e) {
      closePackModal();
    });
  }

  // 初期表示
  updateStats();
  renderPacks();
});
