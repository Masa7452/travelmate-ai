# フェーズ1 仕様書 — API本実装込みで全テストGreen

*Version: 1.4 — 2025-01-27*

## 1. 目的

* **Phase1の時点で、すべてのAPIテストをGreen**にするため、**/api 配下を本実装（InMemory）** する。
* **create-xyzの4画面（Home/Plan Detail/Explore/My Trips）をApp Routerへ移植**し、実APIに接続する。
* ユーザーが「自然文→旅程生成→詳細確認→保存→管理」の一連の体験ができるMVPを提供。

## 2. スコープ（IN/OUT）

**IN（本実装・InMemory）**

* `/api/itineraries`（POST）… 旅程生成（Stub Planner + 検証 + 保存 → `{id}`）
* `/api/itineraries/[id]`（GET）… 保存済み旅程の取得
* `/api/explore`（GET）… 公開プランの一覧（最小は空配列可だが型は厳密）
* `/api/my-trips`（GET/POST）… マイトリップの一覧/追加
* `/api/my-trips/[id]`（DELETE）… マイトリップの削除
* **500モック注入**（`?__mock=500` or `x-mock-error: internal` を全エンドポイントで対応）
* **UI移植**：Home/Plan Detail/Explore/My Trips の4画面を実APIに接続

**OUT（将来フェーズ）**

* 実DB、認証、編集UI、外部API連携、公開/共有設定など。

## 3. データ契約

```typescript
type Itinerary = {
  id: string;
  createdAt: string;       // ISO
  title: string;
  sourceQuery: string;     // 入力自然文（PlanDetail上部に表示）
  days: Day[];
};

type Day = {
  date: string;            // YYYY-MM-DD
  segments: Segment[];
};

type Segment =
  | { type: "poi";  name: string; stayMin?: number; note?: string }
  | { type: "move"; from: string; to: string; mode?: "walk"|"bus"|"train"; etaMin?: number }
  | { type: "meal"; name: string; stayMin?: number }
  | { type: "buffer"; min: number };

type PublicPlanCard = {
  id: string;
  title: string;
  days?: number;
};

type MyTripCard = {
  id: string;
  title: string;
  createdAt: string;       // ISO
};
```

## 4. エンドポイント仕様（READ-ONLY I/O）

### 4.1 POST `/api/itineraries`

* **Req**: `{ "query": string }`（空/過大は400）
* **Flow**: Planner(Stub) → Itinerary生成 → Zod検証 → 保存 → `{ id }` 返却
* **Res**: `200 { id: string }` / `400` / `422` / `500`
* **Mock500**: `?__mock=500` または `x-mock-error: internal` で 500 を強制（検出は各route.tsの責務）

### 4.2 GET `/api/itineraries/[id]`

* **Res**: `200 Itinerary` / `404`（未存在）

### 4.3 GET `/api/explore`

* **Res**: `200 PublicPlanCard[]`（空配列可）
* **備考**: カードのIDは実在するItineraryと一致させるか、404を適切にハンドリング

### 4.4 GET `/api/my-trips`

* **Res**: `200 MyTripCard[]`（InMemory保管内容を列挙）

### 4.5 POST `/api/my-trips`

* **Req**: `{ id: string; title: string }`
* **Res**: `200 MyTripCard`（保存後の実体を返却）

### 4.6 DELETE `/api/my-trips/[id]`

* **Res**: `200 { ok: true }`

## 5. UI移植仕様

### 5.1 移植マップ

| create-xyz source | Phase 1 での移設先 | 主な変更 |
|-------------------|-------------------|----------|
| `apps/web/src/app/page.jsx` | `src/app/page.tsx` | POST /api/itineraries でID発行→/plan/{id}遷移、data-testid 付与 |
| `apps/web/src/app/explore/page.jsx` | `src/app/explore/page.tsx` | モック配列削除→GET /api/explore fetch |
| `apps/web/src/app/plan/page.jsx` | `src/app/plan/[id]/page.tsx` | GET /api/itineraries/{id} で描画、Save to My Trips を POST /api/my-trips へ接続 |
| （新規） | `src/app/my-trips/page.tsx` | GET/DELETE /api/my-trips 接続 |

### 5.2 data-testid 属性（厳密指定）

* Home: `home-input`, `home-submit`
* Plan Detail: `sourceQuery-banner`, `timeline`, `save-to-mytrips`
* Explore: `explore-list`
* My Trips: `mytrips-list`, `delete-trip`（削除ボタンは追加で `data-trip-id="{id}"` 属性）

## 6. 実装方針

1. **Contracts**（`src/Shared/Contracts.ts`）：型定義とZodスキーマ
2. **Error Mapping**（`src/Shared/ErrorMapping.ts`）：統一エラーハンドリング
   * `mapErrorToStatus(error: Error): number` 純粋関数を公開（Error→HTTPステータス変換）
   * Mock 500トリガ検出（`?__mock=500` / `x-mock-error: internal`）は各route.tsの責務
   * エラー分類表：
     | Error Type | HTTP Status | 用途 |
     |------------|------------|------|
     | ValidationError | 422 | Zod検証失敗 |
     | NotFoundError | 404 | リソース不在 |
     | ConflictError | 409 | 重複（将来） |
     | その他 | 500 | 内部エラー |
3. **InMemory Repos**
   * `src/Core/Infrastructure/Repositories/Itinerary/repository.ts`：`save` / `findById`
   * `src/Core/Infrastructure/Repositories/Trips/repository.ts`：`list` / `add` / `remove`
4. **Planner Stub**（`src/Core/Infrastructure/Services/PlannerStub.ts`）：入力から妥当なItinerary生成
5. **Provider**（`src/Core/Infrastructure/Provider/repository.ts`）：`createRepositories()` によるDI標準化
6. **UseCases**（`src/Core/Application/UseCases/*.usecase.ts`）
   * ファイル名は必ず `.usecase.ts` で終わる
   * エクスポート名は PascalCase（例: `CreateItinerary`）
   * JSDoc必須（`@fileoverview`, `@param`, `@returns`, `@throws`）
   * 統一シグネチャ：`(repos: Repositories, ...params) => ReturnType`
7. **Route Handlers**（`src/app/api/*/route.ts`）
   * 全エンドポイント実装
   * Zod境界検証（入力parse、出力safeParse）
   * mapErrorToStatus使用（エラー→HTTPステータス変換の純粋関数）
   * Mock 500トリガ検出は各route.tsの責務
8. **UI Components**：モック配列撤廃、実API接続

## 7. テスト要件

### 7.1 Unit Tests
* ドメイン層：Itinerary/Segment バリデーション
* アプリケーション層：UseCases with DI mocking
* インフラ層：InMemory操作の不変性（deep copy）
* **テスト規約**：
  * TDD（Red→Green→Refactor）
  * AAA（Arrange/Act/Assert）
  * Arrow functions only
  * Deterministic（fake timers使用）

### 7.2 API Tests
* 全エンドポイントの200/400/404/422/500
* mapErrorToStatus 関数経由の確認（vi.spyOn）
* Zod境界（入力parse・出力safeParse）のアサート
* Mock 500の両トリガ（?__mock=500とx-mock-error: internal）テスト

### 7.3 E2E Tests（4フロー）
* Home→Plan（sourceQuery/timeline表示）
* Plan→Save→My Trips 反映
* Explore 表示
* My Trips 削除操作
* data-testid の厳密使用

## 8. 非機能要件（NFR）

* **性能**: P95 ≤ 10s（旅程生成）
* **品質**: TDD（Red→Green→Refactor）、`pnpm run check` 必須
* **規約**: 
  * `any/unknown`禁止
  * `for/forEach`禁止
  * アロー関数のみ
  * AAAテスト
  * UseCase命名規則（`.usecase.ts`）
  * JSDoc必須（public UseCases/Ports）
* **エラー処理**: すべて`@shared/ErrorMapping`の`mapErrorToStatus`経由
* **GUARD**: `src/app/**` パスは変更・改名禁止（URL維持）、API I/O契約は不変

## 9. 受け入れ条件（AC）

1. **全テストGreen**: `pnpm run check && pnpm test && pnpm run test:e2e`
2. **UI実API接続**: モック配列の完全削除
3. **エラー統一**: mapErrorToStatus の一貫使用（純粋関数としての動作確認）
4. **Zod検証**: 全API境界での入出力検証（parse/safeParse）
5. **API I/O不変**: 仕様通りのリクエスト/レスポンス形状を厳守
6. **ドキュメント**: README.mdにInMemory制限を明記

## 10. リスクと対策

* **InMemoryの揮発性**: サーバー再起動で消失 → README明記
* **Explore→Plan リンク整合性**: 存在しないIDで404 → 適切なエラーハンドリング
* **モック残留**: lintルールで検知（オプション）
* **E2E不安定**: data-testid の固定化（削除は `delete-trip` + `data-trip-id` の組み合わせ）
* **API I/O変更**: GUARDによりsrc/app/**とAPI契約は変更禁止

## 11. ディレクトリ構成（現行）

```
src/
├── Shared/                          # 共有レイヤー
│   ├── Contracts.ts                 # Zod スキーマと型定義
│   └── ErrorMapping.ts              # エラーマッピング関数
├── Core/
│   ├── Domain/
│   │   ├── Ports/
│   │   │   ├── ItineraryRepository.ts
│   │   │   └── TripsRepository.ts
│   │   └── Types.ts
│   ├── Application/
│   │   ├── UseCases/
│   │   │   ├── CreateItinerary.usecase.ts
│   │   │   ├── GetItinerary.usecase.ts
│   │   │   ├── GetPublicPlans.usecase.ts
│   │   │   ├── ListTrips.usecase.ts
│   │   │   ├── AddTrip.usecase.ts
│   │   │   ├── DeleteTrip.usecase.ts
│   │   │   └── index.ts
│   │   └── errors.ts
│   └── Infrastructure/
│       ├── Services/
│       │   └── PlannerStub.ts
│       ├── Repositories/
│       │   ├── Itinerary/
│       │   │   └── repository.ts
│       │   └── Trips/
│       │       └── repository.ts
│       └── Provider/
│           └── repository.ts
└── app/                            # Next.js App Router
    └── api/                        # API Routes
        ├── itineraries/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── explore/
        │   └── route.ts
        └── my-trips/
            ├── route.ts
            └── [id]/
                └── route.ts
```

## 12. パスエイリアス

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/Core/*"],
  "@shared/*": ["./src/Shared/*"],
  "@app/*": ["./src/app/*"]
}
```