# AGENTS.md

給所有在 `pu-cmrdb/identity` 工作的人類與 AI agent 的規則。
本倉庫採用 **issue-driven-dev** 流程：每個變更都從 GitHub issue 開始，經過審查的 PR 才能進 `main`。

需求、技術棧、本機開發與驗收條件見 [`docs/requirements.md`](docs/requirements.md)；架構見 [`ARCHITECTURE.md`](ARCHITECTURE.md)；一般貢獻規範見 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

identity 是行雲所有服務（含 `pu-cmrdb/ams`）的登入中心，**任何改動都可能讓下游服務無法登入**，認證相關變更要特別小心並說明對下游的影響。

## 流程

1. 從一個 open issue `#N` 開始；沒有 issue 就先開 issue，寫清楚背景、要做什麼、驗收條件。
2. 從最新的 `main` 切分支：`<type>/<N>-<short-slug>`（例：`fix/7-disable-dynamic-registration`）。
3. Commit 使用 Conventional Commits，並在訊息中引用 issue（`#N`）。
4. 推送前在本機跑過 CI 會跑的檢查（見下方「推送前檢查」），紅燈不推。
5. 開 PR，說明中寫 `Closes #N`、改了什麼、為什麼、怎麼驗證，以及對 ams 等下游服務的影響。一個 issue 對一個 PR。
6. PR 可合併的條件：
   - CI 在 PR 目前的 head commit 全綠（CI workflow 合併到 main 之前，以本機完整跑過推送前檢查全綠、並在 PR 說明附上結果為準）。
   - 審查（邏輯／正確性／安全）回報 0 Blocker、0 Major；動到前端時另做 UI 審查。
   - 審查與合併針對同一個 head commit，用 `gh pr merge --match-head-commit <sha>` 鎖定。
7. 合併由維護者決定，開發者 agent 不自行合併。

## 推送前檢查

```bash
bun install --frozen-lockfile
SKIP_ENV_VALIDATION=true bun run typegen
bun run lint
bun run typecheck
bun test
SKIP_ENV_VALIDATION=true bun run build   # 搭配 .env.example 的假值
```

改了 `package.json` 一定要一起提交更新後的 `bun.lock`。

## 硬性規則

- **不要 push 到 `main`**，所有變更都走 PR。
- **不要 force-push** 共用分支。
- **開發者／審查者 agent 不合併 PR。**
- **不要印出或提交 `.env` 與任何金鑰**（`BETTER_AUTH_SECRET`、Discord／OAuth client secret、API key、JWKS 私鑰），也不要在 `.env` 填入正式環境的真實金鑰。本機開發時從 `.env.example` 複製成 `.env`，填入假值或本機隨機值。
- **不要碰正式站**（`iam.cmrdb.cs.pu.edu.tw`、`ams.cmrdb.cs.pu.edu.tw`）與正式資料庫，也不要部署。
- **不要在正式環境執行 `db:seed`**；seed 只用於本機與測試。
- **不要提交真實使用者資料**，測試只用合成資料。
- 不要跳過 hooks 或停用 CI 檢查來讓 PR 變綠。
- `src/server/database/schema/auth.ts` 由 `bun run auth:generate` 產生，不要手動修改；schema 異動用 `bun run db:generate`，migration 與程式碼放同一個 PR。
- `src/components/ui/` 由 shadcn 產生，非必要不手動修改。
- 新增環境變數時同步更新 `src/env.ts` 與 `.env.example`（只放範例值）。
