// Pack&Play モックデータ

// 配信者データ
const creators = [
  {
    id: 1,
    slug: 'tanaka',
    name: '田中太郎',
    displayName: 'たなかたろう',
    channelUrl: 'https://youtube.com/@tanaka',
    isLive: true,
    packCount: 3,
    totalSales: 250000
  },
  {
    id: 2,
    slug: 'vtuber_alice',
    name: 'アリスちゃんねる',
    displayName: 'Alice Channel',
    channelUrl: 'https://youtube.com/@alice',
    isLive: false,
    packCount: 5,
    totalSales: 500000
  },
  {
    id: 3,
    slug: 'gaming_master',
    name: 'ゲームマスター',
    displayName: 'Gaming Master',
    channelUrl: 'https://twitch.tv/gamingmaster',
    isLive: true,
    packCount: 2,
    totalSales: 180000
  }
];

// パックデータ
const packs = [
  {
    id: 1,
    creatorId: 1,
    creatorSlug: 'tanaka',
    name: '初心者応援パック',
    description: '配信を盛り上げる基本的なカードが入っています',
    price: 500,
    isPublished: true,
    cards: [
      { id: 1, name: 'こんにちは', rarity: 'N', type: 'message', dropRate: 40 },
      { id: 2, name: 'いいね！', rarity: 'R', type: 'action', dropRate: 30 },
      { id: 3, name: 'きらきら', rarity: 'SR', type: 'visual', dropRate: 25 },
      { id: 4, name: '激レアカード', rarity: 'UR', type: 'action', dropRate: 5 }
    ]
  },
  {
    id: 2,
    creatorId: 1,
    creatorSlug: 'tanaka',
    name: 'レアカード限定パック',
    description: '高レアリティのカードが多く含まれる特別なパックです',
    price: 1000,
    isPublished: true,
    cards: [
      { id: 5, name: 'ありがとう', rarity: 'R', type: 'message', dropRate: 50 },
      { id: 6, name: '花火', rarity: 'SR', type: 'visual', dropRate: 35 },
      { id: 7, name: 'レインボー', rarity: 'UR', type: 'visual', dropRate: 15 }
    ]
  },
  {
    id: 3,
    creatorId: 2,
    creatorSlug: 'vtuber_alice',
    name: 'アリスの魔法パック',
    description: 'かわいいエフェクトがいっぱい！',
    price: 800,
    isPublished: true,
    cards: [
      { id: 8, name: 'ハート', rarity: 'N', type: 'visual', dropRate: 45 },
      { id: 9, name: 'キラキラ', rarity: 'R', type: 'visual', dropRate: 35 },
      { id: 10, name: 'ユニコーン', rarity: 'SR', type: 'visual', dropRate: 15 },
      { id: 11, name: '虹色オーラ', rarity: 'UR', type: 'visual', dropRate: 5 }
    ]
  }
];

// カードデータ
const cards = [
  {
    id: 1,
    name: 'こんにちは',
    rarity: 'N',
    type: 'message',
    requiresApproval: true,
    effectData: { message: 'こんにちは！' }
  },
  {
    id: 2,
    name: 'いいね！',
    rarity: 'R',
    type: 'action',
    requiresApproval: false,
    effectData: { animation: 'thumbs-up', sound: 'like.mp3' }
  },
  {
    id: 3,
    name: 'きらきら',
    rarity: 'SR',
    type: 'visual',
    requiresApproval: false,
    effectData: { animation: 'sparkle', duration: 5 }
  },
  {
    id: 4,
    name: '激レアカード',
    rarity: 'UR',
    type: 'action',
    requiresApproval: false,
    effectData: { animation: 'epic-effect', sound: 'epic.mp3' }
  }
];

// 所持カードデータ（ユーザーインベントリ）
const ownedCards = [
  {
    id: 1,
    cardId: 1,
    userId: 1,
    packId: 1,
    creatorName: '田中太郎',
    isUsed: false,
    acquiredAt: '2025-11-01T10:30:00Z'
  },
  {
    id: 2,
    cardId: 2,
    userId: 1,
    packId: 1,
    creatorName: '田中太郎',
    isUsed: false,
    acquiredAt: '2025-11-01T10:30:00Z'
  },
  {
    id: 3,
    cardId: 3,
    userId: 1,
    packId: 1,
    creatorName: '田中太郎',
    isUsed: true,
    acquiredAt: '2025-11-01T10:30:00Z'
  },
  {
    id: 4,
    cardId: 8,
    userId: 1,
    packId: 3,
    creatorName: 'アリスちゃんねる',
    isUsed: false,
    acquiredAt: '2025-11-02T14:20:00Z'
  }
];

// 承認待ちキュー
const redeemQueue = [
  {
    id: 1,
    ownedCardId: 1,
    cardName: 'こんにちは',
    cardRarity: 'N',
    viewerName: '視聴者A',
    viewerMessage: 'いつも配信見てます！',
    state: 'pending',
    createdAt: '2025-11-03T12:00:00Z'
  },
  {
    id: 2,
    ownedCardId: 5,
    cardName: 'ありがとう',
    cardRarity: 'R',
    viewerName: '視聴者B',
    viewerMessage: '面白い配信ありがとう！',
    state: 'pending',
    createdAt: '2025-11-03T12:05:00Z'
  },
  {
    id: 3,
    ownedCardId: 10,
    cardName: 'きらきら',
    cardRarity: 'SR',
    viewerName: '視聴者C',
    viewerMessage: null,
    state: 'approved',
    createdAt: '2025-11-03T11:50:00Z'
  }
];

// ヘルパー関数
function getCreatorBySlug(slug) {
  return creators.find(c => c.slug === slug);
}

function getPacksByCreator(creatorSlug) {
  return packs.filter(p => p.creatorSlug === creatorSlug && p.isPublished);
}

function getPackById(packId) {
  return packs.find(p => p.id === parseInt(packId));
}

function getCardById(cardId) {
  return cards.find(c => c.id === parseInt(cardId));
}

function getOwnedCardsByUser(userId) {
  return ownedCards.filter(oc => oc.userId === userId);
}

function getPendingRedemptions(creatorId) {
  return redeemQueue.filter(r => r.state === 'pending');
}

function getRarityColor(rarity) {
  const colors = {
    'N': '#9ca3af',
    'R': '#3b82f6',
    'SR': '#8b5cf6',
    'UR': '#f59e0b'
  };
  return colors[rarity] || '#9ca3af';
}

function formatPrice(price) {
  return `¥${price.toLocaleString()}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ローカルストレージ操作
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// シミュレーション関数
function simulatePackOpening(packId) {
  const pack = getPackById(packId);
  if (!pack) return null;

  // 重み付きランダム選択
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const card of pack.cards) {
    cumulative += card.dropRate;
    if (random <= cumulative) {
      return card;
    }
  }

  // フォールバック（最初のカード）
  return pack.cards[0];
}

function simulateRedemption(ownedCardId, message = '') {
  const redemption = {
    id: Date.now(),
    ownedCardId: ownedCardId,
    viewerMessage: message,
    state: 'pending',
    createdAt: new Date().toISOString()
  };
  return redemption;
}
