// Pack&Play モックデータ

// 配信者データ
const creators = [
  {
    id: 1,
    slug: 'tanaka',
    name: '田中太郎',
    displayName: 'たなかたろう',
    bio: '毎日配信中！初心者向けゲーム実況やってます 🎮',
    channelUrl: 'https://youtube.com/@tanaka',
    isLive: true,
    packCount: 3,
    totalSales: 250000,
    followerCount: 15200,
    sparksConsumed: {
      today: 1200,
      week: 8500,
      month: 35000,
      year: 250000
    }
  },
  {
    id: 2,
    slug: 'vtuber_alice',
    name: 'アリスちゃんねる',
    displayName: 'Alice Channel',
    bio: 'バーチャル配信者 ✨ 歌とゲームが大好き！',
    channelUrl: 'https://youtube.com/@alice',
    isLive: false,
    packCount: 5,
    totalSales: 500000,
    followerCount: 32800,
    sparksConsumed: {
      today: 2500,
      week: 15000,
      month: 65000,
      year: 500000
    }
  },
  {
    id: 3,
    slug: 'gaming_master',
    name: 'ゲームマスター',
    displayName: 'Gaming Master',
    bio: 'プロゲーマー | FPS & MOBA専門配信',
    channelUrl: 'https://twitch.tv/gamingmaster',
    isLive: true,
    packCount: 2,
    totalSales: 180000,
    followerCount: 12500,
    sparksConsumed: {
      today: 800,
      week: 5500,
      month: 25000,
      year: 180000
    }
  },
  {
    id: 4,
    slug: 'yamada_cooking',
    name: '山田花子の料理チャンネル',
    displayName: 'やまだはなこ',
    bio: '簡単で美味しい料理を毎週配信 🍳 料理初心者歓迎',
    channelUrl: 'https://youtube.com/@yamadacooking',
    isLive: false,
    packCount: 4,
    totalSales: 320000,
    followerCount: 28400,
    sparksConsumed: {
      today: 1800,
      week: 12000,
      month: 48000,
      year: 320000
    }
  },
  {
    id: 5,
    slug: 'sato_sports',
    name: 'サトケンスポーツ',
    displayName: '佐藤健一',
    bio: 'スポーツ解説 ⚽ サッカー・野球を中心に配信',
    channelUrl: 'https://twitch.tv/satosports',
    isLive: true,
    packCount: 3,
    totalSales: 280000,
    followerCount: 19700,
    sparksConsumed: {
      today: 1500,
      week: 9000,
      month: 38000,
      year: 280000
    }
  },
  {
    id: 6,
    slug: 'suzuki_music',
    name: '鈴木美咲の歌枠',
    displayName: 'すずきみさき',
    bio: '歌ってみた配信 🎤 リクエスト受付中♪',
    channelUrl: 'https://youtube.com/@suzukimusic',
    isLive: false,
    packCount: 6,
    totalSales: 650000,
    followerCount: 45600,
    sparksConsumed: {
      today: 3000,
      week: 20000,
      month: 85000,
      year: 650000
    }
  },
  {
    id: 7,
    slug: 'takahashi_art',
    name: 'たかはしイラスト工房',
    displayName: '高橋良太',
    bio: 'イラスト制作配信 🎨 お絵描き講座やってます',
    channelUrl: 'https://youtube.com/@takahashiart',
    isLive: true,
    packCount: 4,
    totalSales: 380000,
    followerCount: 23100,
    sparksConsumed: {
      today: 2000,
      week: 13500,
      month: 55000,
      year: 380000
    }
  },
  {
    id: 8,
    slug: 'ito_game',
    name: 'いとさくらのゲーム実況',
    displayName: '伊藤さくら',
    bio: 'ホラーゲーム中心の実況配信者 | 毎日20時から',
    channelUrl: 'https://twitch.tv/itogame',
    isLive: false,
    packCount: 7,
    totalSales: 720000,
    followerCount: 58900,
    sparksConsumed: {
      today: 3500,
      week: 25000,
      month: 98000,
      year: 720000
    }
  },
  {
    id: 9,
    slug: 'watanabe_talk',
    name: 'わたなべ雑談ルーム',
    displayName: '渡辺翔太',
    bio: 'まったり雑談配信 ☕ 気軽にコメントしてね',
    channelUrl: 'https://youtube.com/@watanabetalk',
    isLive: true,
    packCount: 2,
    totalSales: 150000,
    followerCount: 8600,
    sparksConsumed: {
      today: 900,
      week: 6000,
      month: 22000,
      year: 150000
    }
  },
  {
    id: 10,
    slug: 'nakamura_asmr',
    name: 'ゆいASMR',
    displayName: '中村ゆい',
    bio: '癒しのASMR配信 🌙 眠れない夜にどうぞ',
    channelUrl: 'https://youtube.com/@nakamuraasmr',
    isLive: false,
    packCount: 5,
    totalSales: 480000,
    followerCount: 37200,
    sparksConsumed: {
      today: 2200,
      week: 14000,
      month: 60000,
      year: 480000
    }
  },
  {
    id: 11,
    slug: 'kobayashi_code',
    name: 'コバヤシコーディング',
    displayName: '小林大輝',
    bio: 'プログラミング配信 💻 初心者向けコーディング解説',
    channelUrl: 'https://twitch.tv/kobayashicode',
    isLive: true,
    packCount: 3,
    totalSales: 220000,
    followerCount: 14800,
    sparksConsumed: {
      today: 1100,
      week: 7500,
      month: 32000,
      year: 220000
    }
  },
  {
    id: 12,
    slug: 'kato_horror',
    name: 'かとまりホラー実況',
    displayName: '加藤真理',
    bio: 'ホラゲー専門配信者 👻 絶叫注意！',
    channelUrl: 'https://youtube.com/@katohorror',
    isLive: false,
    packCount: 6,
    totalSales: 590000,
    followerCount: 42300,
    sparksConsumed: {
      today: 2800,
      week: 18000,
      month: 75000,
      year: 590000
    }
  },
  {
    id: 13,
    slug: 'yoshida_retro',
    name: 'ヨシダレトロゲーム',
    displayName: '吉田隆',
    bio: 'レトロゲーム実況 🕹️ 懐かしのゲームを遊び尽くす',
    channelUrl: 'https://youtube.com/@yoshidaretro',
    isLive: false,
    packCount: 4,
    totalSales: 340000,
    followerCount: 26700,
    sparksConsumed: {
      today: 1600,
      week: 11000,
      month: 45000,
      year: 340000
    }
  }
];

// discover.html用のエイリアス
const mockCreators = creators;

// フォロー中の配信者（デモ用）
// 実際のアプリではユーザーごとにlocalStorageに保存
const defaultFollowedCreatorIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 10人のサンプル（配信中5人、配信中でない5人）

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

function getFollowedCreators() {
  const followedIds = loadFromStorage('followedCreators', defaultFollowedCreatorIds);
  return creators.filter(c => followedIds.includes(c.id));
}

function isFollowing(creatorId) {
  const followedIds = loadFromStorage('followedCreators', defaultFollowedCreatorIds);
  return followedIds.includes(creatorId);
}

function toggleFollow(creatorId) {
  let followedIds = loadFromStorage('followedCreators', defaultFollowedCreatorIds);
  if (followedIds.includes(creatorId)) {
    followedIds = followedIds.filter(id => id !== creatorId);
  } else {
    followedIds.push(creatorId);
  }
  saveToStorage('followedCreators', followedIds);
  return followedIds.includes(creatorId);
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
  return `${price.toLocaleString()}スパーク`;
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
