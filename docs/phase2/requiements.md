# フェーズ2 仕様書 — 永続化の抽象化（Port & Adapter 正式化）
*Version: 1.2 — 2025-08-27*

## 0. 背景 / 前提
- Phase 1では **全APIをInMemory実装**で本実装済み（/api/itineraries, /api/explore, /api/my-trips）
- **4画面（Home/Plan Detail/Explore/My Trips）すべて実APIに接続済み**
- 本フェーズでは **APIのI/OやE2E挙動は変えず**、内部構造を **Port & Adapter** に正式化
- 将来のDB置換を**環境変数による切替**で無停止実行可能にする
- **非破壊リファクタリング原則**: すべての既存テストをグリーン維持

---

## 1. 目的（What & Why）
- **What**: データアクセスを **Repository Port** として正式定義し、現在のInMemory実装を **Adapter** として分離
- **Why**: 
  - 後続フェーズで **Prisma + Postgres / Supabase** へ環境変数でスワップ可能にする
  - 最小差分、無停止、ロールバック容易な構造を確立
  - API I/O は一切変更しない（非破壊リファクタ）

---

## 2. スコープ（IN / OUT）

### IN（本フェーズで実装）
- `ItineraryRepository` Port 定義（`save`, `findById`）
- `TripsRepository` Port 定義（`list`, `add`, `remove`）  
- `InMemoryItineraryRepository` Adapter 実装（現在のMap実装を移設）
- `InMemoryTripsRepository` Adapter 実装（現在のMap実装を移設）
- `createRepositories()` Provider による DI 標準化
- Error Taxonomy（NotFound/Validation/Conflict/Internal）と `mapErrorToStatus` 対応表
- `.env.example` に `DB_PROVIDER`, `DATABASE_URL` 追加
- Explore ↔ Plan のID整合性E2Eテスト
- UseCase命名規則の統一（`.usecase.ts`）
- JSDoc追加（Ports/UseCases）

### OUT（将来フェーズ）
- 実DB接続・DDL・マイグレーション
- 認証・RLS
- UI機能追加（既存4画面は実装済み）

---

## 3. 成果物（Deliverables）

| 成果物 | パス | 説明 |
|--------|------|------|
| Port定義 | `src/Core/Domain/Ports/ItineraryRepository.ts` | 旅程リポジトリインターフェース |
| | `src/Core/Domain/Ports/TripsRepository.ts` | トリップリポジトリインターフェース |
| Adapter実装 | `src/Core/Infrastructure/Repositories/Itinerary/repository.ts` | InMemory実装 |
| | `src/Core/Infrastructure/Repositories/Trips/repository.ts` | InMemory実装 |
| Provider | `src/Core/Infrastructure/Provider/repository.ts` | DI Factory（ENV切替対応） |
| Error定義 | `src/Core/Application/Errors.ts` | NotFoundError, ValidationError |
| Use-case更新 | `src/Core/Application/UseCases/*.usecase.ts` 各種 | DI対応差分 |
| API Handler更新 | `src/app/api/*/route.ts` | Provider経由の呼び出し |
| 環境設定 | `.env.example` | DB_PROVIDER, DATABASE_URL 追加 |
| ドキュメント | `Architecture.md` | Port & Adapter 図、切替手順 |

---

## 4. API I/O（Phase 1から完全不変）

### エンドポイント仕様（READ-ONLY）
- **POST `/api/itineraries`**: `{query:string}` → `{id:string}` / 400 / 422 / 500
- **GET `/api/itineraries/[id]`**: → Itinerary / 404
- **GET `/api/explore`**: → PublicPlanCard[]
- **GET `/api/my-trips`**: → MyTripCard[]
- **POST `/api/my-trips`**: `{id:string, title:string}` → MyTripCard
- **DELETE `/api/my-trips/[id]`**: → `{ok:true}`

### 共通仕様（継続）
- **Mock 500**: 全エンドポイントで両対応
  - `?__mock=500` クエリパラメータ
  - `x-mock-error: internal` ヘッダー
- **Zod検証**: API境界で必須
  - 入力: `parse()`
  - 出力: `safeParse()`
- **Mock 500トリガ検出**: 各route.tsの責務
- **mapErrorToStatus**: 純粋関数（Error→HTTPステータス変換）
- **GUARD**: `src/app/**` パスは変更禁止、API I/O契約不変

---

## 5. 設計方針

### 5.1 依存方向
```
Domain (Ports) ← Application (Use-cases) ← Infrastructure (Adapters/Providers) ← API Handlers
```

### 5.2 Port 定義（Domain層）
```typescript
// src/Core/Domain/Ports/ItineraryRepository.ts
/**
 * @fileoverview Repository port for itinerary persistence
 */
export interface ItineraryRepository {
  save(itinerary: Readonly<Itinerary>): Promise<{ id: string }>;
  findById(id: string): Promise<Itinerary | undefined>;
}

// src/Core/Domain/Ports/TripsRepository.ts  
/**
 * @fileoverview Repository port for trip management
 */
export interface TripsRepository {
  list(): Promise<readonly MyTripCard[]>;
  add(card: Readonly<MyTripCard>): Promise<void>;
  remove(id: string): Promise<boolean>; // true if deleted, false if not found
}
```

### 5.3 Error Taxonomy & Mapping

| Error Type | HTTP Status | 用途 |
|------------|-------------|------|
| `NotFoundError` | 404 | リソース不在 |
| `ValidationError` | 422 | Zod検証失敗 |
| `ConflictError` | 409 | ID重複等（将来） |
| `InternalError` | 500 | 予期しない失敗 |

```typescript
// src/Shared/ErrorMapping.ts
export const mapErrorToStatus = (error: Error): number => {
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ValidationError) return 422;
  if (error instanceof ConflictError) return 409;
  return 500;
};
```

### 5.4 Provider Factory（DI）

```typescript
// src/Core/Infrastructure/Provider/repository.ts
/**
 * @fileoverview Repository provider with environment-based switching
 */
export interface Repositories {
  itineraries: ItineraryRepository;
  trips: TripsRepository;
}

export const createRepositories = (): Repositories => {
  // Default to memory if DB_PROVIDER not set
  const provider = process.env.DB_PROVIDER || 'memory';
  
  if (provider === 'memory') {
    return {
      itineraries: new InMemoryItineraryRepository(),
      trips: new InMemoryTripsRepository(),
    };
  }
  // 将来: provider === 'postgres' の場合の実装
  
  throw new Error(`Unknown DB_PROVIDER: ${provider}`);
};
```

### 5.5 Use-case DI

すべてのuse-caseは統一シグネチャ: `(repos: Repositories, ...params) => ReturnType`
ファイル名は `.usecase.ts` で終わる

```typescript
// src/Core/Application/UseCases/CreateItinerary.usecase.ts
/**
 * @fileoverview Create itinerary use case
 * @param {Repositories} repos - Repository instances
 * @param {object} input - Input with query string
 * @returns {Promise<{id: string}>} Generated itinerary ID
 * @throws {ValidationError} Invalid input
 */
export const CreateItinerary = 
  (repos: Repositories, input: { query: string }): Promise<{ id: string }> => {
    const itinerary = await buildItinerary(input.query); // PlannerStub
    return repos.itineraries.save(itinerary);
  };

// src/Core/Application/UseCases/DeleteTrip.usecase.ts  
/**
 * @param {Repositories} repos - Repository instances  
 * @param {string} id - Trip ID to delete
 * @returns {Promise<boolean>} true if deleted, false if not found
 */
export const DeleteTrip = 
  (repos: Repositories, id: string): Promise<boolean> => {
    return repos.trips.remove(id); // returns boolean from repository
  };
```

---

## 6. 実装計画（Stages）

### Stage A — Port定義 & InMemory Adapter形式化
- Port interfaces 作成（TSDoc完備）
- 既存InMemory実装をAdapter として `src/Core/Infrastructure/Repositories/<Feature>/repository.ts` へ移設
- deep copy/Object.freeze による不変性保証

### Stage B — Error Taxonomy & DI基盤
- Error クラス定義と `mapErrorToStatus` 実装
- Provider factory 作成（ENV切替土台）
- Use-case を DI 対応に更新（`.usecase.ts` 命名規則適用）

### Stage C — API Handler 移行
- 全ハンドラを Provider 経由に切替
- `mapErrorToStatus` による統一エラーレスポンス
- Mock 500 両対応の維持確認
- **API I/O は一切変更しない**

### Stage D — 整合性E2E & ドキュメント
- Explore ↔ Plan ID整合性E2E追加
  - シード戦略: テスト前にAPIまたは直接注入でサンプルデータ作成
  - 実在ID遷移と404ハンドリングの検証
- Architecture.md に Port & Adapter 図追加
- `.env.example` 更新

---

## 7. テスト計画

### 新規追加テスト
| テスト種別 | 対象 | 検証内容 |
|-----------|------|----------|
| Port準拠 | Repository interfaces | 契約準拠、不変性、remove戻り値boolean |
| Error Mapping | mapErrorToStatus | 全Error種別の対応、vi.spyOnで呼び出し確認 |
| DI Spy | Use-cases | Repository メソッド呼び出し（DI with mocking） |
| 整合性E2E | Explore→Plan | 実在ID遷移、404ハンドリング、シード投入 |

### 既存テスト（非破壊）
- Unit Tests: 全Green維持
- API Tests: 200/400/404/422/500 継続（I/O不変）
- E2E Tests: 主要フロー動作不変

### テスト規約
- TDD: Red → Green → Refactor
- AAA: Arrange / Act / Assert
- Arrow functions only
- Deterministic（fake timers使用）
- API境界でZod検証とmapErrorToStatusアサート

---

## 8. 非機能要件（NFR）

- **性能**: P95 ≤ 10s 維持（旅程生成）
- **品質**: `pnpm run check` 常時Green
- **規約**: 
  - `any/unknown` 禁止
  - `for/forEach` 禁止
  - アロー関数、関数型・イミュータブル指向
  - UseCase命名: `.usecase.ts`、PascalCase exports
  - JSDoc必須（public Ports/UseCases）
- **可観測性**: 主要イベントログ（PII除外）

---

## 9. 受け入れ条件（AC）

1. **既存テスト維持**: Unit/API/E2E すべて非破壊でGreen
2. **新規テスト追加**: 
   - Port準拠テストGreen
   - Error mapping テストGreen  
   - Explore ↔ Plan 整合E2E Green
3. **DI実装完了**: 
   - 全API Handler が Provider 経由
   - Use-case が統一シグネチャ `(repos, ...params) => ReturnType`
   - `.usecase.ts` 命名規則適用
4. **環境設定**: 
   - `.env.example` に DB_PROVIDER=memory（デフォルト）, DATABASE_URL 記載
   - `createRepositories()` が ENV で切替可能（未設定時は memory）
5. **ドキュメント更新**: 
   - Architecture.md に Port & Adapter 構造記載
   - JSDoc完備（`@fileoverview`, `@param`, `@returns`, `@throws`）
6. **API I/O不変**: リクエスト/レスポンス形状が完全に保持される

---

## 10. リスク / 対策

| リスク | 影響 | 対策 |
|--------|------|------|
| InMemoryデータ消失 | 再起動で全データ喪失 | README/Docsに明記、MVP前提 |
| 循環依存 | ビルドエラー | 依存方向の静的解析 |
| Explore→Plan不整合 | 404エラー | 整合性E2Eで検証 |
| Error mapping 漏れ | 不適切なHTTPステータス | 対応表テストで網羅 |
| API I/O変更 | 既存クライアント破壊 | GUARDによる変更禁止、テストで検証 |

---

## 最終チェックリスト

- [ ] `mapErrorToStatus` 関数名固定、APIテストでスパイ/アサート
- [ ] Zod検証: 全エンドポイントで入力parse/出力safeParse
- [ ] remove戻り値: boolean契約がテストで確認済み
- [ ] Exploreカード: 実在旅程IDにリンク、404 UXがE2E確認済み
- [ ] シード戦略: E2Eテスト前のデータ投入方法が文書化済み
- [ ] `.env.example`: DB_PROVIDER/DATABASE_URL追記済み
- [ ] Architecture.md: Port & Adapter図、ENV切替手順記載済み
- [ ] Use-case: 統一シグネチャ `(repos, ...params) => ReturnType`
- [ ] UseCase files: `.usecase.ts` 命名規則適用済み
- [ ] JSDoc: すべてのpublic Ports/UseCasesに記載済み
- [ ] API I/O: Phase1と完全同一（非破壊確認済み）

---

## 11. 変更履歴

- 1.0 (2025-08-27): 初版作成
- 1.1 (2025-08-27): Phase 1完了状況反映、ディレクトリ統一、Error Taxonomy追加
- 1.2 (2025-08-27): API I/O不変の明記、UseCase命名規則、JSDoc要件、パス表記統一