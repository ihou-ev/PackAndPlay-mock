// カードエフェクトを表示
function displayCardEffect(cardData) {
  const container = document.getElementById('effectContainer');

  // カードエフェクト要素を作成
  const cardEffect = document.createElement('div');
  cardEffect.className = 'card-effect';

  // カードアイコン
  const icons = {
    'action': '⚡',
    'visual': '✨',
    'message': '💬'
  };

  cardEffect.innerHTML = `
    <div class="card-icon">${icons[cardData.type] || '🎴'}</div>
    <div class="card-name">${cardData.name}</div>
    <div class="card-rarity ${cardData.rarity.toLowerCase()}">${cardData.rarity}</div>
    ${cardData.viewerMessage ? `
      <div class="viewer-message">
        ${cardData.viewerMessage}
      </div>
      <div class="viewer-name">- ${cardData.viewerName || '視聴者'} -</div>
    ` : ''}
  `;

  container.appendChild(cardEffect);

  // パーティクルエフェクトを生成
  if (cardData.rarity === 'UR' || cardData.rarity === 'SR') {
    createParticles(50);
  } else {
    createParticles(20);
  }

  // きらきらエフェクト
  if (cardData.type === 'visual' || cardData.rarity === 'UR') {
    createSparkles(30);
  }

  // 効果音（モックアップなので実際には再生しない）
  console.log('Playing sound effect for card:', cardData);

  // 5秒後にフェードアウト
  setTimeout(() => {
    cardEffect.classList.add('fadeOut');
    setTimeout(() => {
      container.removeChild(cardEffect);
    }, 500);
  }, 5000);
}

// パーティクルを生成
function createParticles(count) {
  const container = document.getElementById('effectContainer');

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // ランダムな位置
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    // ランダムな色
    const colors = ['#d946a6', '#818cf8', '#fbbf24', '#10b981'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    // ランダムな遅延
    particle.style.animationDelay = Math.random() * 0.5 + 's';

    container.appendChild(particle);

    // 3秒後に削除
    setTimeout(() => {
      if (particle.parentNode) {
        container.removeChild(particle);
      }
    }, 3000);
  }
}

// きらきらエフェクトを生成
function createSparkles(count) {
  const container = document.getElementById('effectContainer');

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    // ランダムな位置
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';

    // ランダムな遅延
    sparkle.style.animationDelay = Math.random() * 0.5 + 's';

    container.appendChild(sparkle);

    // 2秒後に削除
    setTimeout(() => {
      if (sparkle.parentNode) {
        container.removeChild(sparkle);
      }
    }, 2000);
  }
}

// テスト用関数
function testCard(type, rarity) {
  const testData = {
    name: 'テストカード',
    type: type,
    rarity: rarity,
    viewerName: 'テスト視聴者',
    viewerMessage: type === 'message' ? 'これはテストメッセージです！' : null
  };

  displayCardEffect(testData);
}

// 実際のアプリケーションでは、ここでSupabase Realtimeに接続して
// 承認されたカードのイベントをリスニングします
console.log('OBS Overlay initialized');
console.log('Waiting for card redemption events...');

// ローカルストレージから承認イベントを監視（デモ用）
window.addEventListener('storage', (e) => {
  if (e.key === 'overlayEvent' && e.newValue) {
    const event = JSON.parse(e.newValue);
    displayCardEffect(event.card);

    // イベントをクリア
    localStorage.removeItem('overlayEvent');
  }
});

// 定期的にチェック（デモ用）
setInterval(() => {
  const event = localStorage.getItem('overlayEvent');
  if (event) {
    const data = JSON.parse(event);
    displayCardEffect(data.card);
    localStorage.removeItem('overlayEvent');
  }
}, 1000);
  </script>
