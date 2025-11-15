// URLパラメータからパックIDを取得
const packId = getUrlParam('id') || 1;
const pack = getPackById(parseInt(packId));

if (!pack) {
  window.location.href = '../tanaka.html';
}

document.getElementById('packName').textContent = pack.name;

// きらきらエフェクトを生成
function createSparkles() {
  const sparklesContainer = document.getElementById('sparkles');
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparklesContainer.appendChild(sparkle);
  }
}

createSparkles();

function openPack() {
  const packBox = document.getElementById('packBox');
  packBox.classList.add('opening');

  // パック開封シミュレーション
  const drawnCard = simulatePackOpening(packId);

  setTimeout(() => {
    document.getElementById('openingArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');

    // カード情報を表示
    const cardIcons = {
      'message': '💬',
      'action': '⚡',
      'visual': '✨'
    };

    document.getElementById('cardIcon').textContent = cardIcons[drawnCard.type] || '🎴';
    document.getElementById('cardName').textContent = drawnCard.name;

    const rarityBadge = document.getElementById('cardRarity');
    rarityBadge.textContent = drawnCard.rarity;
    rarityBadge.className = 'badge badge-rarity-' + drawnCard.rarity.toLowerCase();

    const typeLabels = {
      'message': 'メッセージカード',
      'action': 'アクションカード',
      'visual': 'ビジュアルカード'
    };
    document.getElementById('cardType').textContent = typeLabels[drawnCard.type];

    // 効果音（モックアップなので実際には再生しない）
    console.log('カードを引きました:', drawnCard);

    // インベントリに追加（ローカルストレージ）
    const inventory = loadFromStorage('inventory', []);
    inventory.push({
      ...drawnCard,
      acquiredAt: new Date().toISOString(),
      packId: packId,
      creatorName: pack.creatorSlug
    });
    saveToStorage('inventory', inventory);

    showToast('カードをインベントリに追加しました', 'success');
  }, 1000);
}
  </script>
