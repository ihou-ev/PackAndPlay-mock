# Pack&Play バックエンド実装仕様書

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [データベース設計](#3-データベース設計)
4. [API仕様](#4-api仕様)
5. [認証・認可](#5-認証認可)
6. [リアルタイム通信](#6-リアルタイム通信)
7. [決済フロー](#7-決済フロー)
8. [外部サービス連携](#8-外部サービス連携)
9. [セキュリティ要件](#9-セキュリティ要件)
10. [非機能要件](#10-非機能要件)

---

## 1. システム概要

### 1.1 サービス概要

Pack&Playは、ストリーマー（配信者）と視聴者をつなぐカードパック販売プラットフォームです。

- **視聴者**: カードパックを購入し、カードを使用して配信に参加
- **ストリーマー**: カードとパックを作成・販売し、視聴者のカード使用を承認

### 1.2 システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                         クライアント                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│   PWA       │  OBS Overlay│  Dashboard  │  Viewer App │ Mobile  │
│ (Next.js)   │  (Browser)  │  (Next.js)  │  (Next.js)  │ (PWA)   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       └─────────────┴──────┬──────┴─────────────┴───────────┘
                            │
                    ┌───────▼───────┐
                    │   API Gateway  │
                    │   (Next.js)    │
                    └───────┬───────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼──────┐     ┌───────▼───────┐    ┌───────▼───────┐
│  Supabase   │     │   Supabase    │    │    Stripe     │
│  Database   │     │   Realtime    │    │   Payments    │
│ (PostgreSQL)│     │  (WebSocket)  │    │               │
└─────────────┘     └───────────────┘    └───────────────┘
```

---

## 2. 技術スタック

### 2.1 推奨技術

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | Next.js 14+ (App Router) | SSR/SSG対応、TypeScript統合 |
| バックエンド | Next.js API Routes / Supabase Edge Functions | サーバーレス、スケーラブル |
| データベース | Supabase (PostgreSQL) | RLS、Realtime、認証統合 |
| 認証 | Supabase Auth + OAuth | YouTube/Twitch/X対応 |
| リアルタイム | Supabase Realtime | WebSocket、Broadcast |
| 決済 | Stripe | 日本円対応、セキュリティ |
| ストレージ | Supabase Storage / Cloudflare R2 | 画像アップロード |
| ホスティング | Vercel | Next.js最適化、エッジ配信 |
| CDN | Cloudflare | 画像配信、DDoS対策 |

### 2.2 開発環境

```bash
# 必要なツール
- Node.js 20+
- pnpm (推奨) または npm
- Docker (ローカルSupabase用)
- Supabase CLI
- Stripe CLI (Webhook開発用)
```

---

## 3. データベース設計

### 3.1 ER図

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    creators     │       │     cards       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │──────<│ user_id (FK)    │       │ creator_id (FK) │>──┐
│ name            │       │ slug (UNIQUE)   │   ┌──<│ name            │   │
│ avatar_url      │       │ display_name    │   │   │ rarity          │   │
│ header_url      │       │ bio             │   │   │ type            │   │
│ role            │       │ avatar_url      │   │   │ flavor_text     │   │
│ coins           │       │ banner_url      │   │   │ description     │   │
│ bio             │       │ channel_url     │   │   │ image_url       │   │
│ created_at      │       │ platform        │   │   │ cooldown_min    │   │
│ updated_at      │       │ is_verified     │   │   │ requires_approval│  │
│ deleted_at      │       │ follower_count  │   │   │ effect_data     │   │
└─────────────────┘       │ created_at      │   │   │ created_at      │   │
                          └─────────────────┘   │   │ updated_at      │   │
                                    │           │   └─────────────────┘   │
                                    │           │                         │
┌─────────────────┐       ┌─────────▼─────────┐ │   ┌─────────────────┐   │
│    follows      │       │      packs        │ │   │   pack_cards    │   │
├─────────────────┤       ├───────────────────┤ │   ├─────────────────┤   │
│ id (PK)         │       │ id (PK)           │ │   │ id (PK)         │   │
│ user_id (FK)    │──────<│ creator_id (FK)   │>┘   │ pack_id (FK)    │>──┤
│ creator_id (FK) │>──────│ name              │     │ card_id (FK)    │>──┘
│ created_at      │       │ description       │<────│ drop_rate       │
└─────────────────┘       │ price             │     └─────────────────┘
                          │ image_url         │
                          │ is_published      │     ┌─────────────────┐
                          │ sales_count       │     │  owned_cards    │
                          │ created_at        │     ├─────────────────┤
                          │ updated_at        │     │ id (PK)         │
                          └───────────────────┘     │ user_id (FK)    │
                                    │               │ card_id (FK)    │
                                    │               │ pack_id (FK)    │
┌─────────────────┐       ┌─────────▼─────────┐     │ creator_id (FK) │
│   purchases     │       │   redemptions     │     │ is_used         │
├─────────────────┤       ├───────────────────┤     │ used_at         │
│ id (PK)         │       │ id (PK)           │     │ acquired_at     │
│ user_id (FK)    │       │ owned_card_id (FK)│>────│ created_at      │
│ pack_id (FK)    │       │ viewer_id (FK)    │     └─────────────────┘
│ card_id (FK)    │       │ creator_id (FK)   │
│ amount          │       │ message           │     ┌─────────────────┐
│ currency        │       │ status            │     │ overlay_events  │
│ stripe_payment_id│      │ processed_at      │     ├─────────────────┤
│ status          │       │ created_at        │     │ id (PK)         │
│ created_at      │       └───────────────────┘     │ creator_id (FK) │
└─────────────────┘                                 │ redemption_id   │
                                                    │ card_data       │
┌─────────────────┐       ┌─────────────────┐       │ displayed_at    │
│ stream_settings │       │ spark_transactions│      │ created_at      │
├─────────────────┤       ├─────────────────┤       └─────────────────┘
│ id (PK)         │       │ id (PK)         │
│ creator_id (FK) │       │ user_id (FK)    │       ┌─────────────────┐
│ platform        │       │ type            │       │ creator_stats   │
│ stream_url      │       │ amount          │       ├─────────────────┤
│ embed_settings  │       │ balance_before  │       │ id (PK)         │
│ created_at      │       │ balance_after   │       │ creator_id (FK) │
│ updated_at      │       │ reference_id    │       │ period          │
└─────────────────┘       │ created_at      │       │ sparks_consumed │
                          └─────────────────┘       │ revenue         │
                                                    │ recorded_at     │
                                                    └─────────────────┘
```

### 3.2 テーブル定義

#### 3.2.1 users (ユーザー)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  header_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'creator', 'admin')),
  coins INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  auth_provider VARCHAR(20),
  auth_provider_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deletion_requested_at TIMESTAMPTZ,

  CONSTRAINT coins_non_negative CHECK (coins >= 0)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
```

#### 3.2.2 creators (ストリーマー)

```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  channel_url TEXT,
  platform VARCHAR(20) CHECK (platform IN ('youtube', 'twitch', 'twitcasting', 'nicolive')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  stream_url TEXT,
  stream_title TEXT,
  stream_description TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9_-]+$')
);

CREATE UNIQUE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_creators_slug ON creators(slug);
CREATE INDEX idx_creators_is_live ON creators(is_live);
CREATE INDEX idx_creators_follower_count ON creators(follower_count DESC);
```

#### 3.2.3 cards (カード)

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  rarity VARCHAR(5) NOT NULL CHECK (rarity IN ('N', 'R', 'SR', 'UR')),
  type VARCHAR(20) NOT NULL DEFAULT 'action' CHECK (type IN ('message', 'action', 'visual')),
  flavor_text TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  cooldown_minutes INTEGER NOT NULL DEFAULT 1,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  effect_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_creator_id ON cards(creator_id);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_is_active ON cards(is_active);
```

#### 3.2.4 packs (パック)

```sql
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sales_count INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT price_positive CHECK (price > 0)
);

CREATE INDEX idx_packs_creator_id ON packs(creator_id);
CREATE INDEX idx_packs_is_published ON packs(is_published);
```

#### 3.2.5 pack_cards (パック内カード)

```sql
CREATE TABLE pack_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  drop_rate DECIMAL(5, 2) NOT NULL,

  CONSTRAINT drop_rate_valid CHECK (drop_rate > 0 AND drop_rate <= 100),
  CONSTRAINT pack_card_unique UNIQUE (pack_id, card_id)
);

CREATE INDEX idx_pack_cards_pack_id ON pack_cards(pack_id);
CREATE INDEX idx_pack_cards_card_id ON pack_cards(card_id);

-- 排出率合計が100%になることを保証するトリガー
CREATE OR REPLACE FUNCTION check_drop_rate_sum()
RETURNS TRIGGER AS $$
DECLARE
  total_rate DECIMAL(5, 2);
BEGIN
  SELECT COALESCE(SUM(drop_rate), 0) INTO total_rate
  FROM pack_cards
  WHERE pack_id = NEW.pack_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  total_rate := total_rate + NEW.drop_rate;

  IF total_rate > 100.01 THEN
    RAISE EXCEPTION 'Total drop rate cannot exceed 100%%';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_drop_rate
BEFORE INSERT OR UPDATE ON pack_cards
FOR EACH ROW EXECUTE FUNCTION check_drop_rate_sum();
```

#### 3.2.6 owned_cards (所持カード)

```sql
CREATE TABLE owned_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE RESTRICT,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE RESTRICT,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE RESTRICT,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_owned_cards_user_id ON owned_cards(user_id);
CREATE INDEX idx_owned_cards_card_id ON owned_cards(card_id);
CREATE INDEX idx_owned_cards_creator_id ON owned_cards(creator_id);
CREATE INDEX idx_owned_cards_is_used ON owned_cards(is_used);
```

#### 3.2.7 redemptions (カード使用申請)

```sql
CREATE TYPE redemption_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owned_card_id UUID NOT NULL REFERENCES owned_cards(id) ON DELETE RESTRICT,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE RESTRICT,
  message TEXT,
  status redemption_status NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_creator_id ON redemptions(creator_id);
CREATE INDEX idx_redemptions_viewer_id ON redemptions(viewer_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
CREATE INDEX idx_redemptions_created_at ON redemptions(created_at DESC);
```

#### 3.2.8 follows (フォロー)

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT follow_unique UNIQUE (user_id, creator_id)
);

CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_creator_id ON follows(creator_id);

-- フォロワー数を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE creators SET follower_count = follower_count + 1 WHERE id = NEW.creator_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE creators SET follower_count = follower_count - 1 WHERE id = OLD.creator_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follower_count();
```

#### 3.2.9 purchases (購入履歴)

```sql
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE RESTRICT,
  owned_card_id UUID REFERENCES owned_cards(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  status purchase_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_pack_id ON purchases(pack_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_stripe_payment_intent_id ON purchases(stripe_payment_intent_id);
```

#### 3.2.10 spark_transactions (スパーク取引履歴)

```sql
CREATE TYPE transaction_type AS ENUM ('charge', 'purchase', 'refund', 'bonus', 'adjustment');

CREATE TABLE spark_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spark_transactions_user_id ON spark_transactions(user_id);
CREATE INDEX idx_spark_transactions_type ON spark_transactions(type);
CREATE INDEX idx_spark_transactions_created_at ON spark_transactions(created_at DESC);
```

#### 3.2.11 overlay_events (オーバーレイイベント)

```sql
CREATE TABLE overlay_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  redemption_id UUID REFERENCES redemptions(id) ON DELETE SET NULL,
  card_name VARCHAR(100) NOT NULL,
  card_rarity VARCHAR(5) NOT NULL,
  card_type VARCHAR(20),
  viewer_name VARCHAR(100),
  viewer_message TEXT,
  effect_data JSONB DEFAULT '{}',
  displayed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_overlay_events_creator_id ON overlay_events(creator_id);
CREATE INDEX idx_overlay_events_created_at ON overlay_events(created_at DESC);
```

#### 3.2.12 stream_settings (配信設定)

```sql
CREATE TABLE stream_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform VARCHAR(20) CHECK (platform IN ('youtube', 'twitch', 'twitcasting', 'nicolive')),
  stream_url TEXT,
  embed_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT stream_settings_creator_unique UNIQUE (creator_id)
);

CREATE INDEX idx_stream_settings_creator_id ON stream_settings(creator_id);
```

#### 3.2.13 creator_stats (ストリーマー統計)

```sql
CREATE TYPE stat_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE creator_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  period stat_period NOT NULL,
  period_start DATE NOT NULL,
  sparks_consumed INTEGER NOT NULL DEFAULT 0,
  packs_sold INTEGER NOT NULL DEFAULT 0,
  revenue INTEGER NOT NULL DEFAULT 0,
  cards_used INTEGER NOT NULL DEFAULT 0,
  new_followers INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT creator_stats_unique UNIQUE (creator_id, period, period_start)
);

CREATE INDEX idx_creator_stats_creator_id ON creator_stats(creator_id);
CREATE INDEX idx_creator_stats_period ON creator_stats(period, period_start DESC);
```

### 3.3 Row Level Security (RLS) ポリシー

```sql
-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- creators テーブル
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY creators_select_all ON creators
  FOR SELECT USING (true);

CREATE POLICY creators_update_own ON creators
  FOR UPDATE USING (auth.uid() = user_id);

-- cards テーブル
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY cards_select_active ON cards
  FOR SELECT USING (is_active = true);

CREATE POLICY cards_all_own ON cards
  FOR ALL USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- packs テーブル
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY packs_select_published ON packs
  FOR SELECT USING (is_published = true OR
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY packs_all_own ON packs
  FOR ALL USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- owned_cards テーブル
ALTER TABLE owned_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY owned_cards_select_own ON owned_cards
  FOR SELECT USING (user_id = auth.uid());

-- redemptions テーブル
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY redemptions_select_own ON redemptions
  FOR SELECT USING (
    viewer_id = auth.uid() OR
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY redemptions_insert_viewer ON redemptions
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

CREATE POLICY redemptions_update_creator ON redemptions
  FOR UPDATE USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

-- follows テーブル
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY follows_select_all ON follows
  FOR SELECT USING (true);

CREATE POLICY follows_manage_own ON follows
  FOR ALL USING (user_id = auth.uid());
```

---

## 4. API仕様

### 4.1 エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| **認証** |
| POST | `/api/auth/login` | OAuth認証開始 | 不要 |
| POST | `/api/auth/callback` | OAuth コールバック | 不要 |
| POST | `/api/auth/logout` | ログアウト | 必要 |
| GET | `/api/auth/session` | セッション情報取得 | 必要 |
| **ユーザー** |
| GET | `/api/users/me` | 自分の情報取得 | 必要 |
| PATCH | `/api/users/me` | プロフィール更新 | 必要 |
| POST | `/api/users/me/avatar` | アバター画像アップロード | 必要 |
| DELETE | `/api/users/me` | アカウント削除申請 | 必要 |
| **ストリーマー** |
| GET | `/api/creators` | ストリーマー一覧 | 不要 |
| GET | `/api/creators/:slug` | ストリーマー詳細 | 不要 |
| GET | `/api/creators/ranking` | ランキング取得 | 不要 |
| POST | `/api/creators/register` | ストリーマー登録 | 必要 |
| PATCH | `/api/creators/:id` | ストリーマー情報更新 | 必要(本人) |
| **フォロー** |
| GET | `/api/follows` | フォロー中一覧 | 必要 |
| POST | `/api/follows/:creatorId` | フォローする | 必要 |
| DELETE | `/api/follows/:creatorId` | フォロー解除 | 必要 |
| **カード** |
| GET | `/api/cards` | カード一覧(自分のカード) | 必要(creator) |
| POST | `/api/cards` | カード作成 | 必要(creator) |
| PATCH | `/api/cards/:id` | カード更新 | 必要(creator) |
| DELETE | `/api/cards/:id` | カード削除 | 必要(creator) |
| **パック** |
| GET | `/api/packs` | 公開パック一覧 | 不要 |
| GET | `/api/packs/:id` | パック詳細(排出率含む) | 不要 |
| POST | `/api/packs` | パック作成 | 必要(creator) |
| PATCH | `/api/packs/:id` | パック更新 | 必要(creator) |
| DELETE | `/api/packs/:id` | パック削除 | 必要(creator) |
| POST | `/api/packs/:id/publish` | パック公開 | 必要(creator) |
| POST | `/api/packs/:id/unpublish` | パック非公開 | 必要(creator) |
| **購入・開封** |
| POST | `/api/packs/:id/purchase` | パック購入 | 必要 |
| POST | `/api/packs/:id/open` | パック開封 | 必要 |
| **インベントリ** |
| GET | `/api/inventory` | 所持カード一覧 | 必要 |
| GET | `/api/inventory/stats` | インベントリ統計 | 必要 |
| **カード使用・承認** |
| POST | `/api/redemptions` | カード使用申請 | 必要 |
| GET | `/api/redemptions/pending` | 承認待ち一覧 | 必要(creator) |
| POST | `/api/redemptions/:id/approve` | カード承認 | 必要(creator) |
| POST | `/api/redemptions/:id/reject` | カード拒否 | 必要(creator) |
| **スパーク** |
| GET | `/api/sparks/balance` | 残高確認 | 必要 |
| GET | `/api/sparks/history` | 取引履歴 | 必要 |
| POST | `/api/sparks/charge` | チャージ開始 | 必要 |
| **決済** |
| POST | `/api/payments/create-intent` | 決済インテント作成 | 必要 |
| POST | `/api/payments/webhook` | Stripe Webhook | 不要 |
| **オーバーレイ** |
| GET | `/api/overlay/:creatorSlug` | オーバーレイ設定 | 不要 |
| **配信設定** |
| GET | `/api/stream-settings` | 配信設定取得 | 必要(creator) |
| PUT | `/api/stream-settings` | 配信設定更新 | 必要(creator) |
| **ダッシュボード** |
| GET | `/api/dashboard/stats` | 統計情報 | 必要(creator) |
| GET | `/api/dashboard/recent-activity` | 最近のアクティビティ | 必要(creator) |

### 4.2 リクエスト/レスポンス詳細

#### 4.2.1 認証

**POST /api/auth/login**

```typescript
// Request
{
  provider: 'youtube' | 'twitch' | 'x',
  role: 'viewer' | 'creator',
  redirect_url?: string
}

// Response
{
  auth_url: string  // OAuthプロバイダーへのリダイレクトURL
}
```

**GET /api/auth/session**

```typescript
// Response
{
  user: {
    id: string,
    email: string,
    name: string,
    avatar_url: string | null,
    role: 'viewer' | 'creator' | 'admin',
    coins: number,
    creator_slug?: string  // creatorの場合のみ
  },
  expires_at: string  // ISO 8601
}
```

#### 4.2.2 ストリーマー

**GET /api/creators**

```typescript
// Query Parameters
{
  page?: number,        // デフォルト: 1
  limit?: number,       // デフォルト: 20, 最大: 100
  sort?: 'followers' | 'recent' | 'name',
  is_live?: boolean,
  search?: string
}

// Response
{
  creators: [
    {
      id: string,
      slug: string,
      display_name: string,
      bio: string | null,
      avatar_url: string | null,
      banner_url: string | null,
      is_live: boolean,
      follower_count: number,
      pack_count: number
    }
  ],
  pagination: {
    page: number,
    limit: number,
    total: number,
    total_pages: number
  }
}
```

**GET /api/creators/:slug**

```typescript
// Response
{
  id: string,
  slug: string,
  display_name: string,
  bio: string | null,
  avatar_url: string | null,
  banner_url: string | null,
  channel_url: string | null,
  platform: string | null,
  is_live: boolean,
  stream_url: string | null,
  stream_title: string | null,
  stream_description: string | null,
  follower_count: number,
  total_sales: number,
  packs: [
    {
      id: string,
      name: string,
      description: string | null,
      price: number,
      image_url: string | null,
      card_count: number
    }
  ],
  is_following: boolean  // ログイン中の場合
}
```

#### 4.2.3 パック購入・開封

**POST /api/packs/:id/purchase**

```typescript
// Request
{
  payment_method: 'sparks'  // 将来的にstripeも追加
}

// Response (Success)
{
  success: true,
  purchase_id: string,
  remaining_sparks: number
}

// Response (Error)
{
  success: false,
  error: {
    code: 'INSUFFICIENT_SPARKS' | 'PACK_NOT_FOUND' | 'PACK_NOT_AVAILABLE',
    message: string
  }
}
```

**POST /api/packs/:id/open**

```typescript
// Request
{
  purchase_id: string
}

// Response
{
  card: {
    id: string,
    owned_card_id: string,
    name: string,
    rarity: 'N' | 'R' | 'SR' | 'UR',
    type: 'message' | 'action' | 'visual',
    flavor_text: string | null,
    description: string,
    image_url: string | null,
    creator_name: string
  }
}
```

#### 4.2.4 カード使用申請・承認

**POST /api/redemptions**

```typescript
// Request
{
  owned_card_id: string,
  message?: string  // messageタイプのカードの場合
}

// Response
{
  redemption_id: string,
  status: 'pending' | 'auto_approved',
  requires_approval: boolean
}
```

**POST /api/redemptions/:id/approve**

```typescript
// Response
{
  success: true,
  overlay_event_id: string
}
```

#### 4.2.5 インベントリ

**GET /api/inventory**

```typescript
// Query Parameters
{
  page?: number,
  limit?: number,
  creator_id?: string,
  rarity?: 'N' | 'R' | 'SR' | 'UR',
  status?: 'unused' | 'used' | 'all'
}

// Response
{
  cards: [
    {
      id: string,
      owned_card_id: string,
      card_id: string,
      name: string,
      rarity: 'N' | 'R' | 'SR' | 'UR',
      type: 'message' | 'action' | 'visual',
      flavor_text: string | null,
      description: string,
      image_url: string | null,
      creator_id: string,
      creator_name: string,
      pack_id: string,
      pack_name: string,
      is_used: boolean,
      acquired_at: string
    }
  ],
  stats: {
    total: number,
    unused: number,
    used: number
  },
  pagination: {
    page: number,
    limit: number,
    total: number,
    total_pages: number
  }
}
```

---

## 5. 認証・認可

### 5.1 OAuth認証フロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Backend   │     │   OAuth     │     │  Supabase   │
│   (PWA)     │     │  (Next.js)  │     │  Provider   │     │    Auth     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Login Request  │                   │                   │
       │ (provider, role)  │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │ 2. Auth URL       │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 3. Redirect to OAuth Provider         │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │ 4. User Authorization                 │                   │
       │<─────────────────────────────────────>│                   │
       │                   │                   │                   │
       │ 5. Callback with Code                 │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │ 6. Code Exchange  │                   │                   │
       │──────────────────>│                   │                   │
       │                   │ 7. Token Exchange │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 8. User Info      │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │ 9. Create/Update User                 │
       │                   │───────────────────────────────────────>│
       │                   │                   │                   │
       │                   │ 10. Session Token │                   │
       │                   │<───────────────────────────────────────│
       │                   │                   │                   │
       │ 11. Set Cookie    │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 12. Redirect to App                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

### 5.2 OAuthプロバイダー設定

#### YouTube (Google)

```typescript
// 必要なスコープ
const YOUTUBE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/youtube.readonly'  // チャンネル情報取得(オプション)
];
```

#### Twitch

```typescript
// 必要なスコープ
const TWITCH_SCOPES = [
  'openid',
  'user:read:email'
];
```

#### X (Twitter)

```typescript
// OAuth 2.0 with PKCE
const X_SCOPES = [
  'users.read',
  'tweet.read',
  'offline.access'
];
```

### 5.3 ロールベースアクセス制御 (RBAC)

```typescript
// roles.ts
export enum Role {
  VIEWER = 'viewer',
  CREATOR = 'creator',
  ADMIN = 'admin'
}

export const PERMISSIONS = {
  // 視聴者
  [Role.VIEWER]: [
    'profile:read',
    'profile:update',
    'creators:read',
    'packs:read',
    'packs:purchase',
    'inventory:read',
    'inventory:use',
    'follows:manage',
    'sparks:read',
    'sparks:charge'
  ],

  // ストリーマー (視聴者の権限 + 追加権限)
  [Role.CREATOR]: [
    // 視聴者の権限すべて
    'profile:read',
    'profile:update',
    'creators:read',
    'packs:read',
    'packs:purchase',
    'inventory:read',
    'inventory:use',
    'follows:manage',
    'sparks:read',
    'sparks:charge',
    // ストリーマー固有
    'creator:update',
    'cards:manage',
    'packs:manage',
    'redemptions:manage',
    'dashboard:read',
    'stream-settings:manage',
    'overlay:read'
  ],

  // 管理者
  [Role.ADMIN]: [
    '*'  // すべての権限
  ]
};

// ミドルウェア
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = PERMISSIONS[user.role] || [];

    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  };
}
```

### 5.4 セッション管理

```typescript
// session.ts
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    coins: number;
    creator_slug?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;  // Unix timestamp
}

// セッション有効期限
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;  // 7日
const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000;     // 24時間前からリフレッシュ

// セッション更新ロジック
async function refreshSessionIfNeeded(session: Session): Promise<Session | null> {
  const now = Date.now();
  const expiresAt = session.expires_at * 1000;

  if (now >= expiresAt) {
    // セッション期限切れ
    return null;
  }

  if (expiresAt - now <= REFRESH_THRESHOLD) {
    // リフレッシュが必要
    return await refreshSession(session.refresh_token);
  }

  return session;
}
```

---

## 6. リアルタイム通信

### 6.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Realtime                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   Channel:      │    │   Channel:      │                     │
│  │  overlay:{slug} │    │ redemptions:{id}│                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           │  Broadcast           │  Postgres Changes             │
│           ▼                      ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  OBS Overlay    │    │  Dashboard      │                     │
│  │  (Browser)      │    │  (PWA)          │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 チャンネル設計

#### オーバーレイチャンネル

```typescript
// overlay-channel.ts
import { RealtimeChannel } from '@supabase/supabase-js';

interface CardEffect {
  id: string;
  card_name: string;
  card_rarity: 'N' | 'R' | 'SR' | 'UR';
  card_type: 'message' | 'action' | 'visual';
  viewer_name: string;
  viewer_message?: string;
  effect_data: Record<string, unknown>;
  timestamp: number;
}

class OverlayChannel {
  private channel: RealtimeChannel | null = null;
  private creatorSlug: string;

  constructor(creatorSlug: string) {
    this.creatorSlug = creatorSlug;
  }

  async subscribe(onEvent: (event: CardEffect) => void): Promise<void> {
    this.channel = supabase.channel(`overlay:${this.creatorSlug}`);

    this.channel
      .on('broadcast', { event: 'card_effect' }, (payload) => {
        onEvent(payload.payload as CardEffect);
      })
      .subscribe();
  }

  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// 使用例 (OBS Overlay)
const overlay = new OverlayChannel('tanaka');
overlay.subscribe((event) => {
  displayCardEffect(event);
});
```

#### 承認待ちチャンネル

```typescript
// redemptions-channel.ts
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Redemption {
  id: string;
  owned_card_id: string;
  viewer_id: string;
  creator_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  card?: {
    name: string;
    rarity: string;
    type: string;
  };
  viewer?: {
    name: string;
  };
}

class RedemptionsChannel {
  private channel: RealtimeChannel | null = null;
  private creatorId: string;

  constructor(creatorId: string) {
    this.creatorId = creatorId;
  }

  async subscribe(callbacks: {
    onInsert: (redemption: Redemption) => void;
    onUpdate: (redemption: Redemption) => void;
  }): Promise<void> {
    this.channel = supabase.channel(`redemptions:${this.creatorId}`);

    this.channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'redemptions',
          filter: `creator_id=eq.${this.creatorId}`
        },
        (payload: RealtimePostgresChangesPayload<Redemption>) => {
          callbacks.onInsert(payload.new as Redemption);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'redemptions',
          filter: `creator_id=eq.${this.creatorId}`
        },
        (payload: RealtimePostgresChangesPayload<Redemption>) => {
          callbacks.onUpdate(payload.new as Redemption);
        }
      )
      .subscribe();
  }

  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// 使用例 (Dashboard)
const redemptions = new RedemptionsChannel(creatorId);
redemptions.subscribe({
  onInsert: (r) => addToQueue(r),
  onUpdate: (r) => updateQueue(r)
});
```

### 6.3 カード承認 → オーバーレイ表示フロー

```typescript
// approve-redemption.ts
async function approveRedemption(redemptionId: string): Promise<void> {
  const { data: redemption, error } = await supabase
    .from('redemptions')
    .select(`
      *,
      owned_cards (
        cards (
          name,
          rarity,
          type,
          effect_data
        )
      ),
      viewers:users!viewer_id (
        name
      )
    `)
    .eq('id', redemptionId)
    .single();

  if (error) throw error;

  // ステータス更新
  await supabase
    .from('redemptions')
    .update({
      status: 'approved',
      processed_at: new Date().toISOString()
    })
    .eq('id', redemptionId);

  // 所持カードを使用済みに
  await supabase
    .from('owned_cards')
    .update({
      is_used: true,
      used_at: new Date().toISOString()
    })
    .eq('id', redemption.owned_card_id);

  // オーバーレイイベント作成
  const overlayEvent = {
    creator_id: redemption.creator_id,
    redemption_id: redemptionId,
    card_name: redemption.owned_cards.cards.name,
    card_rarity: redemption.owned_cards.cards.rarity,
    card_type: redemption.owned_cards.cards.type,
    viewer_name: redemption.viewers.name,
    viewer_message: redemption.message,
    effect_data: redemption.owned_cards.cards.effect_data
  };

  await supabase.from('overlay_events').insert(overlayEvent);

  // Realtimeでブロードキャスト
  const creatorSlug = await getCreatorSlug(redemption.creator_id);

  await supabase.channel(`overlay:${creatorSlug}`).send({
    type: 'broadcast',
    event: 'card_effect',
    payload: {
      id: overlayEvent.id,
      card_name: overlayEvent.card_name,
      card_rarity: overlayEvent.card_rarity,
      card_type: overlayEvent.card_type,
      viewer_name: overlayEvent.viewer_name,
      viewer_message: overlayEvent.viewer_message,
      effect_data: overlayEvent.effect_data,
      timestamp: Date.now()
    }
  });
}
```

---

## 7. 決済フロー

### 7.1 スパークシステム

Pack&Playでは「スパーク」という仮想通貨を使用します。

```
1 スパーク = 1 円
```

#### スパーク取得方法

1. **チャージ**: Stripeを通じて購入
2. **ボーナス**: キャンペーン等で付与

#### スパーク使用方法

1. **パック購入**: パック価格分のスパークを消費

### 7.2 Stripeチャージフロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Backend   │     │   Stripe    │     │  Database   │
│   (PWA)     │     │  (Next.js)  │     │             │     │  (Supabase) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Charge Request │                   │                   │
       │ (amount: 1000)    │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Create PaymentIntent               │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 3. client_secret  │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │ 4. client_secret  │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 5. Confirm Payment (Stripe.js)        │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │ 6. Payment Result │                   │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │                   │ 7. Webhook: payment_intent.succeeded  │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │ 8. Update user coins                  │
       │                   │───────────────────────────────────────>│
       │                   │                   │                   │
       │                   │ 9. Create transaction                 │
       │                   │───────────────────────────────────────>│
       │                   │                   │                   │
       │ 10. Balance Updated (Realtime)                            │
       │<──────────────────────────────────────────────────────────│
       │                   │                   │                   │
```

### 7.3 実装コード

#### チャージAPI

```typescript
// /api/sparks/charge/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// スパークパッケージ
const SPARK_PACKAGES = {
  500: { price: 500, bonus: 0 },
  1000: { price: 1000, bonus: 50 },
  3000: { price: 3000, bonus: 200 },
  5000: { price: 5000, bonus: 500 },
  10000: { price: 10000, bonus: 1500 }
};

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await request.json();

  const package_ = SPARK_PACKAGES[amount as keyof typeof SPARK_PACKAGES];
  if (!package_) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // PaymentIntent作成
  const paymentIntent = await stripe.paymentIntents.create({
    amount: package_.price,
    currency: 'jpy',
    metadata: {
      user_id: session.user.id,
      sparks: amount,
      bonus: package_.bonus,
      type: 'spark_charge'
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  return Response.json({
    client_secret: paymentIntent.client_secret,
    amount: package_.price,
    sparks: amount + package_.bonus
  });
}
```

#### Webhook処理

```typescript
// /api/payments/webhook/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
  }

  return Response.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { user_id, sparks, bonus, type } = paymentIntent.metadata;

  if (type !== 'spark_charge') return;

  const totalSparks = parseInt(sparks) + parseInt(bonus);

  // トランザクションで処理
  await supabase.rpc('add_sparks', {
    p_user_id: user_id,
    p_amount: totalSparks,
    p_type: 'charge',
    p_reference_id: paymentIntent.id,
    p_description: `${sparks}スパーク購入${bonus ? ` (+${bonus}ボーナス)` : ''}`
  });
}
```

#### スパーク追加関数 (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION add_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
BEGIN
  -- 現在の残高を取得（排他ロック）
  SELECT coins INTO v_balance_before
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  v_balance_after := v_balance_before + p_amount;

  -- 残高がマイナスにならないことを確認
  IF v_balance_after < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 残高更新
  UPDATE users
  SET coins = v_balance_after, updated_at = NOW()
  WHERE id = p_user_id;

  -- 取引履歴作成
  INSERT INTO spark_transactions (
    user_id, type, amount, balance_before, balance_after,
    reference_type, reference_id, description
  )
  VALUES (
    p_user_id, p_type, p_amount, v_balance_before, v_balance_after,
    CASE WHEN p_reference_id IS NOT NULL THEN 'stripe_payment' ELSE NULL END,
    p_reference_id::UUID,
    p_description
  );
END;
$$ LANGUAGE plpgsql;
```

### 7.4 パック購入フロー

```typescript
// /api/packs/[id]/purchase/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const packId = params.id;

  // パック情報取得
  const { data: pack, error: packError } = await supabase
    .from('packs')
    .select('*, creator:creators(id, slug)')
    .eq('id', packId)
    .eq('is_published', true)
    .single();

  if (packError || !pack) {
    return Response.json({ error: 'Pack not found' }, { status: 404 });
  }

  // 残高確認
  const { data: user } = await supabase
    .from('users')
    .select('coins')
    .eq('id', session.user.id)
    .single();

  if (!user || user.coins < pack.price) {
    return Response.json(
      { error: 'Insufficient sparks', code: 'INSUFFICIENT_SPARKS' },
      { status: 400 }
    );
  }

  // トランザクションで購入処理
  const { data: result, error } = await supabase.rpc('purchase_pack', {
    p_user_id: session.user.id,
    p_pack_id: packId,
    p_price: pack.price
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    purchase_id: result.purchase_id,
    remaining_sparks: result.remaining_sparks
  });
}
```

```sql
-- パック購入関数
CREATE OR REPLACE FUNCTION purchase_pack(
  p_user_id UUID,
  p_pack_id UUID,
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_purchase_id UUID;
  v_pack_cards RECORD;
  v_drawn_card_id UUID;
  v_owned_card_id UUID;
  v_creator_id UUID;
  v_random DECIMAL;
  v_cumulative DECIMAL := 0;
BEGIN
  -- ユーザー残高取得（排他ロック）
  SELECT coins INTO v_balance_before
  FROM users WHERE id = p_user_id
  FOR UPDATE;

  IF v_balance_before < p_price THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_balance_after := v_balance_before - p_price;

  -- 残高更新
  UPDATE users SET coins = v_balance_after, updated_at = NOW()
  WHERE id = p_user_id;

  -- パックのcreator_id取得
  SELECT creator_id INTO v_creator_id FROM packs WHERE id = p_pack_id;

  -- カード抽選（重み付きランダム）
  v_random := random() * 100;

  FOR v_pack_cards IN
    SELECT card_id, drop_rate
    FROM pack_cards
    WHERE pack_id = p_pack_id
    ORDER BY drop_rate DESC
  LOOP
    v_cumulative := v_cumulative + v_pack_cards.drop_rate;
    IF v_random <= v_cumulative THEN
      v_drawn_card_id := v_pack_cards.card_id;
      EXIT;
    END IF;
  END LOOP;

  -- フォールバック
  IF v_drawn_card_id IS NULL THEN
    SELECT card_id INTO v_drawn_card_id
    FROM pack_cards WHERE pack_id = p_pack_id
    LIMIT 1;
  END IF;

  -- 所持カード追加
  INSERT INTO owned_cards (user_id, card_id, pack_id, creator_id)
  VALUES (p_user_id, v_drawn_card_id, p_pack_id, v_creator_id)
  RETURNING id INTO v_owned_card_id;

  -- 購入履歴作成
  INSERT INTO purchases (user_id, pack_id, owned_card_id, amount, status, completed_at)
  VALUES (p_user_id, p_pack_id, v_owned_card_id, p_price, 'completed', NOW())
  RETURNING id INTO v_purchase_id;

  -- 取引履歴作成
  INSERT INTO spark_transactions (
    user_id, type, amount, balance_before, balance_after,
    reference_type, reference_id, description
  )
  VALUES (
    p_user_id, 'purchase', -p_price, v_balance_before, v_balance_after,
    'purchase', v_purchase_id,
    'パック購入'
  );

  -- パック売上更新
  UPDATE packs
  SET sales_count = sales_count + 1,
      total_revenue = total_revenue + p_price
  WHERE id = p_pack_id;

  -- ストリーマー売上更新
  UPDATE creators
  SET total_sales = total_sales + p_price
  WHERE id = v_creator_id;

  RETURN json_build_object(
    'purchase_id', v_purchase_id,
    'owned_card_id', v_owned_card_id,
    'card_id', v_drawn_card_id,
    'remaining_sparks', v_balance_after
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 8. 外部サービス連携

### 8.1 YouTube Data API

#### 配信状態取得

```typescript
// youtube-api.ts
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

interface LiveStreamInfo {
  isLive: boolean;
  videoId?: string;
  title?: string;
  description?: string;
  viewerCount?: number;
}

export async function getYouTubeLiveStatus(channelId: string): Promise<LiveStreamInfo> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      type: ['video'],
      eventType: 'live'
    });

    const liveVideo = response.data.items?.[0];

    if (!liveVideo) {
      return { isLive: false };
    }

    // 視聴者数取得
    const videoResponse = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [liveVideo.id!.videoId!]
    });

    const liveDetails = videoResponse.data.items?.[0]?.liveStreamingDetails;

    return {
      isLive: true,
      videoId: liveVideo.id!.videoId!,
      title: liveVideo.snippet?.title || undefined,
      description: liveVideo.snippet?.description || undefined,
      viewerCount: liveDetails?.concurrentViewers
        ? parseInt(liveDetails.concurrentViewers)
        : undefined
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return { isLive: false };
  }
}
```

### 8.2 Twitch API

```typescript
// twitch-api.ts
interface TwitchToken {
  access_token: string;
  expires_at: number;
}

let tokenCache: TwitchToken | null = null;

async function getTwitchToken(): Promise<string> {
  if (tokenCache && tokenCache.expires_at > Date.now()) {
    return tokenCache.access_token;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials'
    })
  });

  const data = await response.json();

  tokenCache = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000
  };

  return tokenCache.access_token;
}

interface TwitchLiveInfo {
  isLive: boolean;
  title?: string;
  gameName?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
}

export async function getTwitchLiveStatus(channelName: string): Promise<TwitchLiveInfo> {
  const token = await getTwitchToken();

  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
    {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  const stream = data.data?.[0];

  if (!stream) {
    return { isLive: false };
  }

  return {
    isLive: true,
    title: stream.title,
    gameName: stream.game_name,
    viewerCount: stream.viewer_count,
    thumbnailUrl: stream.thumbnail_url
      .replace('{width}', '1280')
      .replace('{height}', '720')
  };
}
```

### 8.3 ライブ状態定期更新

```typescript
// cron/update-live-status.ts
// Vercel Cron Job または Supabase Edge Function で実行

export async function updateCreatorsLiveStatus() {
  // すべてのストリーマーを取得
  const { data: creators } = await supabase
    .from('creators')
    .select('id, platform, channel_url')
    .not('channel_url', 'is', null);

  if (!creators) return;

  for (const creator of creators) {
    let liveInfo: { isLive: boolean; title?: string; description?: string } = { isLive: false };

    try {
      switch (creator.platform) {
        case 'youtube':
          const channelId = extractYouTubeChannelId(creator.channel_url);
          if (channelId) {
            liveInfo = await getYouTubeLiveStatus(channelId);
          }
          break;
        case 'twitch':
          const channelName = extractTwitchChannelName(creator.channel_url);
          if (channelName) {
            const twitchInfo = await getTwitchLiveStatus(channelName);
            liveInfo = {
              isLive: twitchInfo.isLive,
              title: twitchInfo.title,
              description: twitchInfo.gameName
            };
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to check live status for creator ${creator.id}:`, error);
    }

    // データベース更新
    await supabase
      .from('creators')
      .update({
        is_live: liveInfo.isLive,
        stream_title: liveInfo.title || null,
        stream_description: liveInfo.description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', creator.id);
  }
}

// Vercel Cron設定 (vercel.json)
// {
//   "crons": [{
//     "path": "/api/cron/update-live-status",
//     "schedule": "*/5 * * * *"  // 5分ごと
//   }]
// }
```

---

## 9. セキュリティ要件

### 9.1 認証・認可

- **OAuth 2.0/OIDC準拠**: YouTube, Twitch, X
- **JWT トークン管理**: Supabase Auth標準
- **セッション有効期限**: 7日（24時間前からリフレッシュ）
- **CSRF対策**: SameSite Cookie + State パラメータ

### 9.2 データ保護

- **暗号化**:
  - 通信: TLS 1.3
  - 保存: Supabase標準暗号化（AES-256）
- **個人情報**:
  - メールアドレス: ハッシュ化して検索インデックス
  - パスワード: 保存しない（OAuthのみ）

### 9.3 入力検証

```typescript
// validation.ts
import { z } from 'zod';

// カード作成スキーマ
export const createCardSchema = z.object({
  name: z.string().min(1).max(100),
  rarity: z.enum(['N', 'R', 'SR', 'UR']),
  flavor_text: z.string().max(500).optional(),
  description: z.string().min(1).max(1000),
  cooldown_minutes: z.number().int().min(1).max(1440),
  requires_approval: z.boolean(),
  effect_data: z.record(z.unknown()).optional()
});

// パック作成スキーマ
export const createPackSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.number().int().min(100).max(100000),
  cards: z.array(z.object({
    card_id: z.string().uuid(),
    drop_rate: z.number().min(0.1).max(100)
  })).min(1).max(10).refine(
    (cards) => {
      const total = cards.reduce((sum, c) => sum + c.drop_rate, 0);
      return Math.abs(total - 100) < 0.01;
    },
    { message: '排出率の合計は100%である必要があります' }
  )
});
```

### 9.4 レート制限

```typescript
// rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// エンドポイント別レート制限
export const rateLimits = {
  // 認証系: 10回/分
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:auth'
  }),

  // API一般: 100回/分
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api'
  }),

  // 購入系: 30回/分
  purchase: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:purchase'
  }),

  // カード使用: 60回/分
  redemption: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:redemption'
  })
};

// ミドルウェア
export async function rateLimit(
  request: Request,
  type: keyof typeof rateLimits
): Promise<{ success: boolean; remaining: number }> {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success, remaining } = await rateLimits[type].limit(ip);
  return { success, remaining };
}
```

### 9.5 景表法対応

カードパックのガチャ機能は日本の景品表示法に準拠する必要があります。

#### 排出率表示の義務化

```typescript
// pack-detail.ts
interface PackWithDropRates {
  id: string;
  name: string;
  price: number;
  cards: {
    id: string;
    name: string;
    rarity: string;
    drop_rate: number;  // 必ず表示
  }[];
}

// APIレスポンスには必ず排出率を含める
export async function getPackDetails(packId: string): Promise<PackWithDropRates> {
  const { data } = await supabase
    .from('packs')
    .select(`
      id, name, price, description,
      pack_cards (
        drop_rate,
        cards (id, name, rarity, type)
      )
    `)
    .eq('id', packId)
    .eq('is_published', true)
    .single();

  // 排出率を整形して返す
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    cards: data.pack_cards.map(pc => ({
      id: pc.cards.id,
      name: pc.cards.name,
      rarity: pc.cards.rarity,
      drop_rate: pc.drop_rate  // 必須
    }))
  };
}
```

#### 確率検証システム

```sql
-- パック開封統計（確率監査用）
CREATE TABLE pack_opening_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES packs(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  expected_rate DECIMAL(5, 2) NOT NULL,
  actual_count INTEGER NOT NULL DEFAULT 0,
  total_openings INTEGER NOT NULL DEFAULT 0,
  actual_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN total_openings > 0
    THEN (actual_count::DECIMAL / total_openings * 100)
    ELSE 0 END
  ) STORED,
  variance DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN total_openings > 0
    THEN ABS(expected_rate - (actual_count::DECIMAL / total_openings * 100))
    ELSE 0 END
  ) STORED,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pack_card_stats_unique UNIQUE (pack_id, card_id)
);

-- 開封時に統計更新
CREATE OR REPLACE FUNCTION update_opening_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pack_opening_stats (pack_id, card_id, expected_rate, actual_count, total_openings)
  SELECT
    NEW.pack_id,
    NEW.card_id,
    pc.drop_rate,
    1,
    1
  FROM pack_cards pc
  WHERE pc.pack_id = NEW.pack_id AND pc.card_id = NEW.card_id
  ON CONFLICT (pack_id, card_id) DO UPDATE SET
    actual_count = pack_opening_stats.actual_count + 1,
    total_openings = pack_opening_stats.total_openings + 1,
    last_updated = NOW();

  -- 同じパックの他のカードのtotal_openingsも更新
  UPDATE pack_opening_stats
  SET total_openings = total_openings + 1, last_updated = NOW()
  WHERE pack_id = NEW.pack_id AND card_id != NEW.card_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_opening_stats
AFTER INSERT ON owned_cards
FOR EACH ROW EXECUTE FUNCTION update_opening_stats();
```

### 9.6 アカウント削除（GDPR対応）

```typescript
// account-deletion.ts
export async function requestAccountDeletion(userId: string): Promise<void> {
  // 削除申請を記録（30日後に実行）
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 30);

  await supabase
    .from('users')
    .update({
      deletion_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  // 通知メール送信
  await sendEmail(userId, 'account_deletion_scheduled', {
    scheduled_date: scheduledDate.toLocaleDateString('ja-JP')
  });
}

export async function cancelAccountDeletion(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({
      deletion_requested_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

// Cron Job: 毎日実行
export async function processScheduledDeletions(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: usersToDelete } = await supabase
    .from('users')
    .select('id')
    .lt('deletion_requested_at', thirtyDaysAgo.toISOString())
    .is('deleted_at', null);

  for (const user of usersToDelete || []) {
    await deleteUserData(user.id);
  }
}

async function deleteUserData(userId: string): Promise<void> {
  // 論理削除（データは保持、個人情報は匿名化）
  await supabase.rpc('anonymize_user_data', { p_user_id: userId });

  await supabase
    .from('users')
    .update({
      email: `deleted_${userId}@deleted.packandplay.com`,
      name: '削除済みユーザー',
      avatar_url: null,
      header_url: null,
      bio: null,
      deleted_at: new Date().toISOString()
    })
    .eq('id', userId);
}
```

---

## 10. 非機能要件

### 10.1 パフォーマンス

| 指標 | 目標値 |
|------|--------|
| API レスポンスタイム (P95) | < 200ms |
| ページ読み込み (LCP) | < 2.5s |
| オーバーレイ遅延 | < 500ms |
| 同時接続数 | 10,000+ |

### 10.2 可用性

- **目標稼働率**: 99.9% (月間ダウンタイム < 44分)
- **バックアップ**: 日次自動バックアップ（7日間保持）
- **DR**: マルチリージョン対応（Vercel Edge + Supabase）

### 10.3 スケーラビリティ

```
Phase 1 (MVP): ~1,000 DAU
- Supabase Free/Pro
- Vercel Hobby/Pro
- 単一リージョン

Phase 2 (Growth): ~10,000 DAU
- Supabase Pro
- Vercel Pro + Edge Functions
- CDN最適化

Phase 3 (Scale): ~100,000 DAU
- Supabase Enterprise / self-hosted
- Vercel Enterprise
- マルチリージョン
- Read Replica
```

### 10.4 監視・ログ

```typescript
// monitoring.ts
// Vercel Analytics + Sentry を使用

import * as Sentry from '@sentry/nextjs';

// エラー監視
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10%のトランザクションをサンプリング
  environment: process.env.NODE_ENV
});

// カスタムメトリクス
export function trackEvent(name: string, data: Record<string, unknown>): void {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', { name, data });
  }

  // Sentry Breadcrumb
  Sentry.addBreadcrumb({
    category: 'custom',
    message: name,
    data,
    level: 'info'
  });
}

// 重要イベントの追跡
export const events = {
  packPurchased: (packId: string, price: number) =>
    trackEvent('pack_purchased', { packId, price }),

  cardUsed: (cardId: string, rarity: string) =>
    trackEvent('card_used', { cardId, rarity }),

  creatorFollowed: (creatorId: string) =>
    trackEvent('creator_followed', { creatorId }),

  sparkCharged: (amount: number) =>
    trackEvent('spark_charged', { amount })
};
```

### 10.5 テスト戦略

```typescript
// テスト構成
// - Unit Tests: Vitest
// - Integration Tests: Vitest + Supabase Local
// - E2E Tests: Playwright

// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 付録

### A. 環境変数一覧

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OAuth - YouTube (Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# OAuth - X (Twitter)
X_CLIENT_ID=
X_CLIENT_SECRET=

# Stripe
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# YouTube Data API
YOUTUBE_API_KEY=

# Redis (Rate Limiting)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Sentry
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

### B. マイグレーション順序

1. `001_create_users.sql`
2. `002_create_creators.sql`
3. `003_create_cards.sql`
4. `004_create_packs.sql`
5. `005_create_pack_cards.sql`
6. `006_create_owned_cards.sql`
7. `007_create_redemptions.sql`
8. `008_create_follows.sql`
9. `009_create_purchases.sql`
10. `010_create_spark_transactions.sql`
11. `011_create_overlay_events.sql`
12. `012_create_stream_settings.sql`
13. `013_create_creator_stats.sql`
14. `014_create_rls_policies.sql`
15. `015_create_functions.sql`
16. `016_create_triggers.sql`

### C. 用語集

| 用語 | 説明 |
|------|------|
| スパーク | アプリ内仮想通貨（1スパーク = 1円） |
| パック | カードの入った購入可能な商品 |
| カード | 視聴者がストリーマーに対して使用できるアイテム |
| 排出率 | パック内のカードが出る確率（景表法で表示義務あり） |
| レア度 | N（Normal）, R（Rare）, SR（Super Rare）, UR（Ultra Rare） |
| カードタイプ | message（メッセージ）, action（アクション）, visual（視覚効果） |
| リデンプション | カード使用申請 |
| オーバーレイ | OBSに表示するエフェクト画面 |

---

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025-12-10 | 1.0.0 | 初版作成 |
