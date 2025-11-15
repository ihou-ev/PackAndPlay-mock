# Pack&Play リファクタリングガイド

## 概要
コードの保守性とスケーラビリティを向上させるため、ページごとの分離からコンポーネントベースの構成にリファクタリングしました。

## 新しいディレクトリ構造

```
css/
├── app.css                    # メインCSSエントリーポイント（すべてをインポート）
├── base/
│   ├── variables.css          # CSS変数（色、フォント、スペーシング等）
│   └── reset.css              # リセットCSS
├── components/
│   ├── buttons.css            # ボタンコンポーネント
│   ├── cards.css              # カードコンポーネント
│   ├── modals.css             # モーダルコンポーネント
│   ├── forms.css              # フォームコンポーネント
│   ├── navbar.css             # ナビゲーションバー
│   ├── sidebar.css            # サイドバー
│   ├── tabs.css               # タブUI
│   ├── badges.css             # バッジ
│   ├── mobile-menu.css        # モバイルメニュー
│   └── utilities.css          # ユーティリティクラス
├── layouts/
│   ├── container.css          # コンテナレイアウト
│   └── grid.css               # グリッドレイアウト
└── pages/
    ├── discover.css           # ページ固有スタイル
    ├── inventory.css
    ├── following.css
    └── ... その他のページ

js/
├── app.js                     # メインJavaScriptエントリーポイント
├── core/
│   └── utils.js               # ユーティリティ関数
├── services/
│   └── storage.js             # localStorage管理
├── components/
│   ├── modal.js               # モーダル機能
│   └── toast.js               # トースト通知
├── mock-data.js               # モックデータ（既存）
├── main.js                    # 共通関数（既存）
└── pages/
    ├── discover.js            # ページ固有ロジック
    ├── inventory.js
    ├── following.js
    └── ... その他のページ
```

## HTMLファイルでの使用方法

### CSS読み込み

```html
<head>
  <!-- コンポーネントベースCSS -->
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/pages/discover.css">
</head>
```

### JavaScript読み込み

```html
<body>
  <!-- コンポーネントベースJavaScript -->
  <script src="js/services/storage.js"></script>
  <script src="js/core/utils.js"></script>
  <script src="js/components/modal.js"></script>
  <script src="js/components/toast.js"></script>
  <script src="js/mock-data.js"></script>
  <script src="js/main.js"></script>
  <script src="js/pages/discover.js"></script>
</body>
```

## 主要な変更点

### 1. CSS変数の統一管理
- すべての色、フォント、スペーシングは `css/base/variables.css` で管理
- デザイン変更時は1ファイルの修正で全体に反映

### 2. コンポーネントの再利用
- ボタン、カード、モーダルなどの共通UIは独立したファイルで管理
- 重複コードの削減
- 一貫したデザインの維持が容易

### 3. 責任分離
- **Base**: リセットと変数
- **Components**: 再利用可能なUIコンポーネント
- **Layouts**: レイアウトシステム
- **Pages**: ページ固有のスタイル

### 4. JavaScript の構造化
- **Services**: データ管理（localStorage等）
- **Core**: ユーティリティ関数
- **Components**: UI機能（モーダル、トースト等）
- **Pages**: ページ固有のロジック

## メリット

✅ **保守性向上**: 変更箇所が明確で、影響範囲が限定的
✅ **コードの再利用**: 共通コンポーネントの使い回しが容易
✅ **スケーラビリティ**: 新ページ追加時の作業量が削減
✅ **一貫性**: デザインパターンの統一が容易
✅ **チーム開発**: 役割分担が明確

## 既存ページの移行手順

他のHTMLページを新しい構成に移行する際は、以下の手順に従ってください：

### 1. CSSリンクの更新

**変更前:**
```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/inventory.css">
```

**変更後:**
```html
<link rel="stylesheet" href="css/app.css">
<link rel="stylesheet" href="css/pages/inventory.css">
```

### 2. JavaScriptリンクの更新

**変更前:**
```html
<script src="js/mock-data.js"></script>
<script src="js/main.js"></script>
<script src="js/inventory.js"></script>
```

**変更後:**
```html
<script src="js/services/storage.js"></script>
<script src="js/core/utils.js"></script>
<script src="js/components/modal.js"></script>
<script src="js/components/toast.js"></script>
<script src="js/mock-data.js"></script>
<script src="js/main.js"></script>
<script src="js/pages/inventory.js"></script>
```

### 3. パス調整（サブディレクトリの場合）

dashboard/やcreator/内のHTMLファイルは相対パスを調整：

```html
<!-- dashboard/index.html の場合 -->
<link rel="stylesheet" href="../css/app.css">
<link rel="stylesheet" href="../css/pages/dashboard/index.css">

<script src="../js/services/storage.js"></script>
<script src="../js/core/utils.js"></script>
<!-- ... -->
<script src="../js/pages/dashboard/index.js"></script>
```

## 完了状況

- ✅ ディレクトリ構造の作成
- ✅ CSS変数とベーススタイルの抽出
- ✅ 共通コンポーネントのCSS分離
- ✅ 共通コンポーネントのJavaScript分離
- ✅ ページ固有ファイルのpages/への移動
- ✅ 全HTMLページの更新完了
  - ✅ ルートディレクトリ (index.html, discover.html, inventory.html, following.html, profile.html, history.html, login.html)
  - ✅ auth/login.html
  - ✅ creator/ (tanaka.html, packs/pack-detail.html, packs/pack-open.html)
  - ✅ dashboard/ (index.html, cards.html, packs.html, redemptions.html)
  - ✅ overlay/index.html
  - ✅ legal/ (terms.html, commerce.html, privacy.html, scta.html, contact.html)

## 注意事項

- `css/style.css` と `css/app.css` は異なるファイルです
- 移行中は両方が存在する状態ですが、最終的には `css/app.css` に統一します
- すべてのページを移行後、古いファイル（`css/style.css`等）は削除できます

## クリーンアップ完了

✅ **全ての古いファイルを削除完了**

削除されたファイル：
- `css/style.css`
- `css/inventory.css`, `css/following.css`, `css/profile.css`, `css/history.css`, `css/login.css`
- `css/creator/` ディレクトリ（全ファイル）
- `css/dashboard/` ディレクトリ（全ファイル）
- `css/overlay/` ディレクトリ（全ファイル）
- `js/inventory.js`, `js/following.js`, `js/profile.js`, `js/history.js`, `js/login.js`
- `js/creator/` ディレクトリ（全ファイル）
- `js/dashboard/` ディレクトリ（全ファイル）
- `js/overlay/` ディレクトリ（全ファイル）

## 次のステップ

1. ✅ 全HTMLページの移行完了
2. ✅ 古いCSSファイルの削除完了
3. ✅ 古いJavaScriptファイルの削除完了
4. コンポーネントの更なる細分化（必要に応じて）
5. 将来的にはWebpack等のバンドラー導入を検討
