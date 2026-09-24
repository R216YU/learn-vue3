# 買い物リストアプリ 要件定義書 (requirement.md)

## 0. このドキュメントについて

- このドキュメントは、学習用に作る「買い物リストアプリ」の **仕様の正** です
- 実装は開発者自身が行い、完成後に AI がこのドキュメントと突き合わせてレビューします
- 仕様を変更したくなった場合は、実装を変えるだけでなく **このファイルも更新** してください
- 作成日: 2026-09-24

### 前作（forum-app）からの位置づけ

| | todo-app | forum-app | 本アプリ |
| --- | --- | --- | --- |
| 主題 | Composition API の基礎 | Vue Router / 画面設計 / 状態管理の自作 | **サーバーサイド・フォーム・UIライブラリ** |
| 状態管理 | ref / composable | composable 自作（モジュールスコープ） | **Pinia** |
| 永続化 | localStorage | localStorage | **SQLite（サーバー）** |
| ルーティング | なし | Vue Router 手書き | **Nuxt ファイルベース** |
| バリデーション | なし | 手書き `if` | **valibot + Regle** |
| CSS | 素のCSS | scoped CSS | **Tailwind + shadcn-vue** |

**今回いちばん大きい変化は「サーバーが存在すること」です。** データはブラウザではなくサーバーの SQLite にあり、画面はAPIを通してそれを読み書きします。

---

## 1. アプリの概要

ひとことで言うと「**複数の買い物リストを作り、売り場カテゴリごとに整理しながら買い物できるアプリ**」です。

- ユーザーは買い物リストを複数作成できる
- 各リストにアイテム（買うもの）を登録し、数量・単位・カテゴリ・予定金額を設定できる
- 買い物中はアイテムをチェックして「購入済み」にできる（実際の金額も記録できる）
- アイテムは売り場カテゴリ別にグルーピングして表示できる
- 買い終わったリストはアーカイブして履歴として残せる
- よく買うものはテンプレートに登録し、新しいリストへ一括追加できる
- ログイン機能はない（単一ユーザー想定）
- データはサーバーの SQLite に保存する

---

## 2. 技術スタック

| 項目 | 内容 |
| --- | --- |
| フレームワーク | **Nuxt 4**（SSR 有効。SPA モードにはしない） |
| 言語 | TypeScript |
| 状態管理 | **Pinia**（`@pinia/nuxt`）。setup stores 記法を使う |
| DB | **SQLite**（Node 組み込みの `node:sqlite`。ORM は使わない） |
| サーバー | Nuxt の server ルート（Nitro） |
| バリデーション | **valibot**（サーバー・クライアント共通のスキーマ） |
| フォーム | **Regle** |
| UI | **shadcn-vue** + Tailwind CSS |
| アイコン | lucide-vue-next（shadcn-vue の標準） |

### ライブラリ方針

- 上記以外のライブラリは **原則として追加しない**
- 特に以下は今回 **使わない**（学習の焦点がぼけるため）
  - ORM（Drizzle / Prisma）— SQL を直接書く
  - 日付ライブラリ（date-fns / dayjs）— 自作する
  - TanStack Query 等のデータ取得ライブラリ — Nuxt の `useFetch` / `$fetch` と Pinia で組む
- 追加したくなったら、**このファイルの表を更新してから**入れること

### なぜ `node:sqlite` か

Node 22 以降に組み込まれた標準モジュールで、**npm パッケージの追加もネイティブビルドも不要**です。ORM を挟まないので、テーブル設計と SQL をそのまま学べます。

---

## 3. 用語とデータモデル

### 3.1 用語

- **リスト (List)**: 1回の買い物のまとまり。「今週の買い物」など
- **アイテム (Item)**: リストの中の1行。「牛乳 1本」など
- **カテゴリ (Category)**: 売り場の区分。「野菜」「肉・魚」「日用品」など
- **テンプレート (Template)**: よく買うものの組み合わせ。リスト作成時に一括投入できる

### 3.2 DB スキーマ

```sql
CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL,              -- 表示色（'#RRGGBB'）
  sort_order INTEGER NOT NULL,           -- 売り場順（小さいほど先）
  created_at INTEGER NOT NULL
);

CREATE TABLE lists (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'archived'
  shopped_at INTEGER,                          -- 買い物完了日時（アーカイブ時に記録）
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE items (
  id              TEXT PRIMARY KEY,
  list_id         TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  category_id     TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  quantity        REAL NOT NULL DEFAULT 1,
  unit            TEXT NOT NULL DEFAULT '個',
  estimated_price INTEGER,              -- 予定金額（円・整数）。未設定は NULL
  actual_price    INTEGER,              -- 実際の金額。未購入なら NULL
  note            TEXT NOT NULL DEFAULT '',
  is_purchased    INTEGER NOT NULL DEFAULT 0,   -- 0 | 1（SQLite に boolean 型はない）
  sort_order      INTEGER NOT NULL,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE TABLE templates (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE template_items (
  id          TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  quantity    REAL NOT NULL DEFAULT 1,
  unit        TEXT NOT NULL DEFAULT '個',
  sort_order  INTEGER NOT NULL
);

CREATE INDEX idx_items_list_id ON items(list_id);
CREATE INDEX idx_lists_status  ON lists(status);
```

**意識すること:**

- SQLite に `BOOLEAN` / `DATETIME` 型はない。真偽値は `INTEGER`（0/1）、日時は `INTEGER`（エポックミリ秒）で持つ
- 外部キー制約はデフォルトで無効。接続時に `PRAGMA foreign_keys = ON` を実行すること
- 集計値（合計金額・アイテム数・進捗率）は **カラムに持たず、SQL で計算する**（forum-app で `Post[]` から投稿数を計算したのと同じ原則）

### 3.3 TypeScript の型

DB の行（snake_case）と、アプリで扱う型（camelCase）は **別物として扱う**こと。変換層を1箇所に置く。

```ts
// DB の行（server 側でのみ使う）
type ListRow = {
  id: string
  name: string
  note: string
  status: string
  shopped_at: number | null
  created_at: number
  updated_at: number
}

// アプリで扱う型（クライアントにも渡る）
type ShoppingList = {
  id: string
  name: string
  note: string
  status: 'active' | 'archived'
  shoppedAt: number | null
  createdAt: number
  updatedAt: number
}

type Item = {
  id: string
  listId: string
  categoryId: string | null
  name: string
  quantity: number
  unit: string
  estimatedPrice: number | null
  actualPrice: number | null
  note: string
  isPurchased: boolean        // DB の 0/1 をここで boolean にする
  sortOrder: number
  createdAt: number
  updatedAt: number
}

type Category = {
  id: string
  name: string
  color: string
  sortOrder: number
  createdAt: number
}

// 一覧画面で使う集計つきの型（SQL で計算して返す）
type ListSummary = ShoppingList & {
  itemCount: number
  purchasedCount: number
  estimatedTotal: number       // 予定金額の合計
  actualTotal: number          // 実際の金額の合計
}

// 詳細画面で使う型
type ListDetail = ShoppingList & {
  items: Item[]
}
```

> `List` は TypeScript の組み込み型名と紛らわしいため、アプリ側の型名は `ShoppingList` とする。

### 3.4 valibot スキーマ

**スキーマは `shared/` に置き、サーバーとクライアントの両方から import すること。**
同じルールを2回書かない ―― これが valibot を入れる最大の目的です。

必要なスキーマ（最低限）:

- `CreateListInput` — リスト作成（アイテム配列を含む）
- `UpdateListInput` — リスト更新（名前・メモ・ステータス）
- `CreateItemInput` / `UpdateItemInput`
- `CreateCategoryInput` / `UpdateCategoryInput`
- `CreateTemplateInput`

バリデーションルールは「6. 機能要件」の各項目に記載。

**意識すること:**

- 金額は `<input>` から文字列で来る。`v.pipe(v.string(), v.transform(Number), v.integer(), ...)` のように **変換もスキーマに含める**
- 前後の空白のトリムもスキーマの責務（`v.trim()`）にする。UI 側で `.trim()` を書かない
- サーバーは **必ず** 受け取った body をスキーマで検証してから SQL に渡す。クライアントを信用しない

---

## 4. サーバー API 仕様

すべて `server/api/` 配下。レスポンスは JSON。

### 4.1 エンドポイント一覧

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/lists?status=active\|archived` | リスト一覧（集計つき / `ListSummary[]`） |
| POST | `/api/lists` | リスト作成（アイテムをまとめて登録 / トランザクション） |
| GET | `/api/lists/:id` | リスト詳細（`ListDetail`） |
| PATCH | `/api/lists/:id` | リスト更新（名前・メモ・ステータス） |
| DELETE | `/api/lists/:id` | リスト削除（アイテムもカスケード削除） |
| POST | `/api/lists/:id/items` | アイテム追加 |
| PATCH | `/api/lists/:id/items/bulk` | 一括操作（下記） |
| PATCH | `/api/items/:id` | アイテム更新（チェック・数量・金額など） |
| DELETE | `/api/items/:id` | アイテム削除 |
| GET | `/api/categories` | カテゴリ一覧（`sort_order` 順） |
| POST | `/api/categories` | カテゴリ作成 |
| PATCH | `/api/categories/:id` | カテゴリ更新 |
| DELETE | `/api/categories/:id` | カテゴリ削除（使用中のアイテムは `category_id` が NULL になる） |
| GET | `/api/templates` | テンプレート一覧（アイテム込み） |
| POST | `/api/templates` | テンプレート作成 |
| DELETE | `/api/templates/:id` | テンプレート削除 |
| GET | `/api/lists/name-available?name=xxx` | リスト名が使用可能か（`{ available: boolean }`） |
| GET | `/api/stats` | 集計データ（月別・カテゴリ別） |

一括操作 (`PATCH /api/lists/:id/items/bulk`) のアクション:

- `checkAll` — 全アイテムを購入済みにする
- `uncheckAll` — 全アイテムを未購入に戻す
- `deletePurchased` — 購入済みアイテムをまとめて削除
- `reorder` — アイテムの並び順をまとめて更新（`{ id, sortOrder }[]` を受け取る）

### 4.2 エラーレスポンス

Nuxt の `createError` を使い、HTTP ステータスを正しく返すこと。

| 状況 | ステータス | 備考 |
| --- | --- | --- |
| バリデーションエラー | 400 | `data` にフィールドごとのエラーを入れる |
| 対象が存在しない | 404 | 「存在しない」は例外的な異常ではなく正常な応答 |
| リスト名の重複 | 409 | |
| 予期しないエラー | 500 | SQL のエラーメッセージを**そのまま返さない** |

**意識すること:**

- 400 のとき、クライアントが「どのフィールドが」エラーなのか分かる形で返す。valibot の `issues` を整形して `data` に載せる
- SQL は **必ずプレースホルダ（`?`）を使う**。文字列連結でクエリを組まない（SQL インジェクション）

---

## 5. 画面（ルーティング）

Nuxt のファイルベースルーティングを使う。

| パス | ファイル | 内容 |
| --- | --- | --- |
| `/` | `pages/index.vue` | リスト一覧（アクティブ / アーカイブをタブ切替） |
| `/lists/new` | `pages/lists/new.vue` | リスト作成（アイテムを複数まとめて入力） |
| `/lists/[id]` | `pages/lists/[id].vue` | リスト詳細（買い物モード / 編集モード切替） |
| `/categories` | `pages/categories.vue` | カテゴリ管理 |
| `/templates` | `pages/templates.vue` | テンプレート管理 |
| `/stats` | `pages/stats.vue` | 集計 |
| 上記以外 | `error.vue` | 404 表示＋一覧へ戻るリンク |

---

## 6. 機能要件

実装順の目安としてフェーズを分けていますが、**最終的には全部を満たすこと**。

### フェーズ1 — コア

#### 6.1 リスト一覧 `/`

- [ ] アクティブなリストを一覧表示する
- [ ] 各行に表示する情報
  - リスト名
  - アイテム数 / 購入済み数（例: `3 / 8`）
  - 進捗バー（購入済み ÷ 全体）
  - 予定金額の合計
  - 作成日時
- [ ] 並び順は **更新日時の新しい順**
- [ ] タブで「アクティブ」「アーカイブ済み」を切り替えられる
- [ ] リスト名の部分一致で絞り込める（大文字小文字を区別しない）
- [ ] 0件のとき / 検索結果が0件のときで、**それぞれ** 異なる空状態を表示する
- [ ] 「リストを作成」から `/lists/new` へ遷移できる
- [ ] 各行から削除できる（確認ダイアログの後）

#### 6.2 リスト作成 `/lists/new`

- [ ] 入力項目
  - リスト名（必須 / 1〜50文字 / **既存のアクティブなリストと重複不可**）
  - メモ（任意 / 最大200文字）
  - アイテム（**0件以上の可変長。行を追加・削除できる**）
    - 名前（必須 / 1〜50文字）
    - 数量（必須 / 0より大きい数 / 小数1桁まで）
    - 単位（必須 / 選択式: 個・本・袋・g・kg・ml・L・パック・箱・その他）
    - カテゴリ（任意 / 選択式）
    - 予定金額（任意 / 0以上の整数 / 最大 999999）
    - メモ（任意 / 最大100文字）
- [ ] アイテム行は「行を追加」ボタンで増やせ、各行の削除ボタンで減らせる
- [ ] **バリデーションエラーは行ごと・項目ごとに表示する**（どの行のどの項目が悪いか分かること）
- [ ] エラーがある間は作成ボタンを押せない
- [ ] リスト名の重複チェックは **サーバーへ問い合わせて非同期に検証する**（入力中はデバウンスする）
- [ ] テンプレートを選ぶと、そのアイテムが一括で入力欄に追加される
- [ ] 作成後は作成したリストの詳細画面へ遷移する
- [ ] キャンセルで一覧へ戻れる。**入力中に離脱しようとしたら確認する**

#### 6.3 リスト詳細 `/lists/[id]`

- [ ] リスト名・メモ・進捗を表示する
- [ ] アイテムを一覧表示する
- [ ] 各アイテムに表示する情報
  - チェックボックス（購入済みかどうか）
  - 名前 / 数量 + 単位
  - カテゴリ（色つきバッジ）
  - 予定金額（購入済みなら実際の金額も）
  - メモ（あれば）
- [ ] チェックすると即座に購入済みになる（**楽観的更新**。失敗したら元に戻してエラーを通知する）
- [ ] 購入済みアイテムは打ち消し線などで視覚的に区別する
- [ ] 画面下部（またはヘッダー）に合計を常時表示する
  - 予定金額の合計 / 実際の金額の合計 / 差額
- [ ] アイテムを追加できる（クイック入力: 名前だけで追加できること）
- [ ] アイテムを編集できる（ダイアログ内で全項目）
- [ ] アイテムを削除できる（確認の後）
- [ ] 一覧画面へ戻るリンクがある
- [ ] URL の `[id]` に対応するリストが存在しない場合は「リストが見つかりません」を表示する

### フェーズ2 — 整理と一括操作

#### 6.4 カテゴリ

- [ ] `/categories` でカテゴリの一覧・作成・編集・削除ができる
- [ ] 入力項目: 名前（必須 / 1〜20文字 / 重複不可）、色（必須 / `#RRGGBB`）、並び順
- [ ] 初回起動時に既定カテゴリを投入する（野菜・肉魚・乳製品・パン・飲料・冷凍・調味料・日用品・その他）
- [ ] 削除時、そのカテゴリを使っているアイテム数を警告に表示する
- [ ] リスト詳細で **カテゴリ別にグルーピング表示** できる（売り場順に並ぶ）
- [ ] グルーピング表示 / フラット表示 を切り替えられる

#### 6.5 表示の絞り込みと一括操作

- [ ] リスト詳細で「未購入のみ」「購入済みのみ」「すべて」を切り替えられる
- [ ] 一括操作ができる
  - すべてチェック / すべて解除
  - 購入済みをまとめて削除
- [ ] アイテムの並び順を変更できる（上下ボタンで可。ドラッグ&ドロップは任意）

#### 6.6 アーカイブ

- [ ] リストを「買い物完了」にするとアーカイブされ、完了日時が記録される
- [ ] アーカイブされたリストは一覧の別タブに表示される
- [ ] アーカイブを解除してアクティブに戻せる
- [ ] アーカイブ済みリストは閲覧のみ（編集不可）とする

### フェーズ3 — 発展

#### 6.7 テンプレート

- [ ] `/templates` でテンプレートの一覧・作成・削除ができる
- [ ] 既存のリストから「テンプレートとして保存」できる
- [ ] リスト作成画面でテンプレートを選んでアイテムを一括投入できる

#### 6.8 集計 `/stats`

- [ ] 月別の支出合計を表示する（直近12ヶ月）
- [ ] カテゴリ別の支出合計を表示する
- [ ] 予定金額と実際の金額の差を表示する
- [ ] **集計はすべて SQL 側で計算する**（全行を取得して JS で集計しない）

### 6.9 共通

- [ ] 日時は `2026/09/24 14:30` のような読みやすい形式で表示する
- [ ] 金額は `¥1,234` のように3桁区切りで表示する
- [ ] 入力値は前後の空白をトリムしてから保存・バリデーションする
- [ ] 空白のみの入力は「未入力」として扱う
- [ ] 通信中はローディング状態が分かる（スケルトン or スピナー）
- [ ] 通信エラー時はトーストで通知し、**画面が壊れない**
- [ ] 破壊的な操作（削除・一括削除）は必ず確認ダイアログを挟む

---

## 7. やらないこと（スコープ外）

- ログイン / 認証 / ユーザー管理（**単一ユーザー想定**）
- 複数人でのリアルタイム共有・同期
- 商品マスタ / バーコード読み取り / 価格の自動取得
- 画像アップロード
- 通知・リマインダー
- 多言語対応
- ダークモード（shadcn-vue が標準で持つ範囲を超えた作り込みはしない）
- 本番デプロイ・CI

---

## 8. 設計方針（構成の目安）

厳密な指定ではなく目安です。迷ったらこの形に寄せてください。

```
├── app/
│   ├── components/
│   │   ├── ui/              # shadcn-vue が生成する。手で書き換えない
│   │   ├── list/            # ListCard.vue / ListProgress.vue など
│   │   └── item/            # ItemRow.vue / ItemFormDialog.vue など
│   ├── composables/         # UIに紐づくロジック（useListFilter など）
│   ├── pages/               # ファイルベースルーティング
│   ├── stores/              # Pinia（useListsStore / useCategoriesStore）
│   ├── utils/               # 表示整形（formatYen / formatDateTime）
│   ├── app.vue
│   └── error.vue
├── server/
│   ├── api/                 # エンドポイント
│   ├── db/
│   │   ├── index.ts         # 接続 / PRAGMA / マイグレーション
│   │   ├── schema.sql
│   │   ├── seed.ts          # 既定カテゴリ投入
│   │   └── queries/         # SQL をまとめる（listQueries.ts など）
│   └── utils/
│       ├── mappers.ts       # DB行(snake_case) ⇄ アプリ型(camelCase)
│       └── validate.ts      # valibot でリクエストを検証する共通処理
├── shared/                  # サーバーとクライアントの両方から使う
│   ├── types/
│   └── schemas/             # valibot スキーマ（★ここが単一の真実の源）
└── data/
    └── app.db               # SQLite ファイル（.gitignore に入れる）
```

意識したいこと:

- **`shared/schemas/` が最重要。** 同じバリデーションルールをサーバーとクライアントで2回書かない
- **`server/` のコードがクライアントに漏れないこと。** DB接続コードを `app/` から import しない
- **SQL は `server/db/queries/` にまとめる。** API ハンドラに生 SQL を散らかさない
- **Pinia ストアは「サーバー状態のキャッシュ + 更新操作」**。表示用の整形は `computed` かコンポーネント側で
- 親から子へは props、子から親へは emit の流れを守る
- **`app/` 配下でモジュールスコープの `ref` をシングルトン状態として使わない**（理由は下記）

### SSR と状態の注意（最重要）

forum-app では、状態管理をこう作りました。

```ts
// composables/usePosts.ts（forum-app）
const _posts = ref<Post[]>(storage.getPosts())   // モジュールスコープのシングルトン
export const usePosts = () => { ... }
```

**この形は Nuxt の SSR では使えません。**

サーバー側では Node プロセスが起動したまま複数のリクエストを処理します。モジュールスコープの `ref` はプロセス起動時に1度だけ作られるため、**あるリクエストで書き込んだ値が別のリクエストにも見えてしまいます**（cross-request state pollution）。

そのため Nuxt では:

- リクエストごとに独立した状態が必要 → `useState()` または **Pinia**
- Pinia のストアはアプリインスタンス単位に作られるので、`@pinia/nuxt` 経由なら安全

**「forum-app で正解だった書き方が、なぜ Nuxt では間違いになるのか」を説明できることを、本アプリの学習目標のひとつとします。**

---

## 9. 完成の判断基準（レビュー時のチェックに使う）

1. 6章のチェックボックスがすべて満たされている
2. サーバーを再起動してもデータが消えない（SQLite に永続化されている）
3. 存在しないURL・存在しないIDを直接開いてもアプリがクラッシュしない
4. `npm run build`（型チェック含む）が通る
5. **ブラウザの JS を無効にしても、リスト一覧と詳細の中身がHTMLとして表示される**（SSR が効いていることの確認）
6. 同じバリデーションルールがサーバーとクライアントで二重に書かれていない
7. SQL がすべてプレースホルダを使っている（文字列連結なし）
8. Vue3 / Nuxt のベストプラクティスに沿っている（詳細は CLAUDE.md のレビュー観点を参照）
