# CLAUDE.md — プロジェクト開発指針（Claude Code 用）

> このファイルはレポジトリ直下に配置し、Claude Code が常に参照する開発規約です。  
> 人間のメンテナが明示的に指示しない限り、本ファイルを最優先で従います。

---

## 1) 開発哲学と原則

### Core Beliefs
- **Incremental progress over big bangs**: 大規模リライトより小さい改良を積み重ねる  
- **Learning from existing code**: 既存コードを調べ、パターンを学び再利用する  
- **Pragmatic over dogmatic**: 理想論より現実的な解決を優先する  
- **Clear intent over clever code**: 賢さよりも意図が明快で理解しやすいコードを選ぶ  

### 開発原則
1. 小さい単位で改良を進める  
2. **テスト駆動開発 (TDD)** を基本とする  
   - 入出力を定義し、失敗するテストを先に書く  
   - **Red → Green → Refactor** を徹底  
     - Red: 仕様を表すテストを先に書き、必ず失敗を確認  
     - Green: テストが通る最小限の実装  
     - Refactor: 振る舞いを変えず設計を改善  
3. 優先順位: **テスト容易性 > 可読性 > 一貫性 > シンプルさ**  
4. 厳格な型定義 (`any`/`unknown`は禁止、テストのみ例外可)  
5. **アロー関数をデフォルト**、`for`/`forEach`は禁止。`map`/`filter`/`reduce` を優先  
6. **イミュータブルなドメインモデル設計**  
   - プロパティは `readonly`  
   - `public` 修飾子は不要  
   - インスタンス生成は `create` ファクトリメソッド  
   - 状態変更は新インスタンスを返す  

### シンプルさの定義
- 関数やクラスは単一責任  
- 早すぎる抽象化を避ける  
- 説明が必要なら複雑すぎると判断する  
- 退屈で予測可能な実装を選ぶ  

### TDD の鉄則
1. **Red → Green → Refactor** を常に守る  
2. **テストは仕様である**。実装に合わせた改変は厳禁  
3. テスト修正が許されるのは以下のみ  
   - 仕様変更  
   - テストの誤り修正  
   - 非決定性の除去  

#### アンチパターン（禁止）
- ❌ 緑化のためだけのテスト改変  
- ❌ テスト後回し (Test-After)  
- ❌ 過剰モックや内部実装への依存  
- ❌ 非決定的テスト（時刻・乱数・外部依存で不安定）  
- ❌ テスト削除で解決  

#### AI活用ルール
- AIによるテスト自動改変は禁止  
- テストを変更するPRは必ず人間レビュー必須  

---

## 2) 準備フェーズ（Phase 0）

- **パッケージ管理**: `pnpm`  
- **Lint/Format**: ESLint + Prettier、`pnpm run lint`  
- **型チェック**: `pnpm run typecheck`（`tsc --noEmit`）  
- **テスト**: Vitest + Testing Library、`pnpm run test`  
- **e2e**: Playwright セットアップ  
- **CI/CD**: GitHub Actions で `pnpm run check` を必須化  
- **環境変数**: `.env.example` に必須項目を整理  

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit --pretty",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write .",
    "check": "pnpm run lint && pnpm run typecheck && pnpm run test"
  }
}


---

## 3) 開発サイクル

1. **Planning**: `/plan_feature` で機能を3–5ステージに分割し `IMPLEMENTATION_PLAN.md` に記録

   * フォーマット:

     ```markdown
     ## Stage N: [Name]  
     **Goal**: [成果物]  
     **Success Criteria**: [テスト可能な結果]  
     **Tests**: [テストケース例]  
     **Status**: [Not Started|In Progress|Complete]  
     ```
   * ステージごとに進行状況を更新し、完了後は削除する
2. **Test First**: `/write_tests` で失敗するテストを作成
3. **Implement**: `/implement_step` で最小限の差分コードを追加
4. **Refactor**: `/refactor` で重複排除・整理。テストは常にグリーン維持
5. **Commit**: Conventional Commits 形式で「なぜ」を説明

### 詰まった時のプロトコル

* 最大3回の試行 or 30分以上停滞で停止
* 試行内容・エラー・仮説をログ化
* 代替案を2–3個提示し、人間に判断を委ねる
* 抽象度やアプローチを再検討し、よりシンプルな解法を模索

---

## 4) Claudeの役割モード

* **Planner**: 機能分解とテスト仕様定義
* **Architect**: 必要最小限の設計提案（ER図・シーケンス図は簡潔に）
* **Implementer**: 差分ベースで実装、短く明快かつ型安全
* **Tester/QA**: 入出力契約に基づき AAA パターンでテスト
* **Refactorer**: 命名改善・重複排除。挙動は変更しない
* **Reviewer**: チェックリストに基づきレビューし改善点を提示

---

## 5) 品質チェックリスト

### コード品質

* [ ] 早期リターンでネストを浅くしている
* [ ] 厳格な型 (`any`/`unknown`禁止、テストのみ例外可)
* [ ] 宣言的コード（`map`/`filter`/`reduce` 使用、`for`/`forEach` 禁止）
* [ ] アロー関数をデフォルト使用
* [ ] 意図が明確で説明不要なシンプル実装
* [ ] 型定義は `type` 優先、`interface` は外部ライブラリ時のみ使用
* [ ] ドメインモデルはイミュータブル設計（`readonly`/`create`/新インスタンス返却）

### 構造とスタイル

* [ ] 300行超で分割を検討、500行超で必須分割
* [ ] 定数は `UPPER_SNAKE_CASE` または `PascalCase`
* [ ] クロスコンポーネントの値/関数は `useMemo` / `useCallback`

### Definition of Done

* [ ] Tests が作成されすべてパス
* [ ] コードが規約に準拠
* [ ] Linter/Formatter 警告なし
* [ ] 実装が `IMPLEMENTATION_PLAN.md` と一致
* [ ] Commit メッセージに「なぜ」を含める
* [ ] TODO コメントには issue 番号を付与

### テスト指針

* [ ] 入出力契約に基づくテスト
* [ ] AAAパターン準拠
* [ ] カバレッジ80%以上（I/O層除外可）
* [ ] テスト名は `should_<business_rule>` 形式

---

## 6) プライバシー・セキュリティ

* PII はログに出さない
* Supabase Storage は private bucket を利用
* RLS で `user_id = auth.uid()` を強制
* データ削除/エクスポート API を提供

---

## 7) スラッシュコマンド

* `/plan_feature {title}` : 機能をステージ分解しテスト仕様を提示
* `/write_tests {unit|e2e} {scope}` : テストコード生成
* `/implement_step {scope}` : 差分コード実装
* `/sql_schema {change}` : マイグレーションとRLS差分
* `/recompute_job {range}` : 再計算ジョブ生成
* `/oauth_provider {oura|strava}` : OAuth設計
* `/review_pr` : PRレビュー
* `/docs_changelog {summary}` : ドキュメント更新

---

## 8) ドキュメント構成

* **CLAUDE.md**: 本規約
* **IMPLEMENTATION\_PLAN.md**: ステージ分解と進行管理
* **要件定義書.md**: 機能要求・ユーザストーリー・非機能要件
* **設計仕様書.md**: DBスキーマ・API仕様・UIモックアップ

---

## 9) 意思決定フレームワーク

1. **Testability**: テスト容易性を最優先に判断
2. **Readability**: 半年後にも理解できるか
3. **Consistency**: 既存パターンに沿っているか
4. **Simplicity**: 最小限の解法か
5. **Reversibility**: 後から変更しやすいか

---

## 10) サンプル（TDDベース）

```ts
// lib/circadian.test.ts
import { describe, it, expect } from "vitest";
import { socialJetlag } from "./circadian";

describe("socialJetlag", () => {
  it("should return the difference in minutes between weekday and weekend wake-up median", () => {
    expect(socialJetlag(["07:00", "07:10"], ["09:00", "08:50"])).toBe(110);
  });
});
```

---

## 11) 不明点対応

* 実装前に不明な点は必ず質問する
* コスト・レイテンシ・プライバシー要件を阻害する場合は必ず相談

---
