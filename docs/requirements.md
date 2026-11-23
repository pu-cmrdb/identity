# identity 需求與驗收

行雲者研發基地身分認證與存取管理系統（IAM）：帳號登入、Passkey、OAuth2／OIDC Provider、API key、使用者與應用程式管理。行雲其他服務（例如 `pu-cmrdb/ams`）都透過它登入。

## 1. 技術棧

| 項目 | 選擇 |
| --- | --- |
| 框架 | Next.js 16（App Router，Server Components 優先） |
| 語言 | TypeScript（strict） |
| 執行環境／套件管理 | Bun（`bun.lock`） |
| API | tRPC v11 + TanStack Query，`superjson` 序列化 |
| 資料庫 | SQLite（libsql）+ Drizzle ORM，資料表前綴 `identity_`，migration 在 `drizzle/` |
| 認證 | Better Auth：`admin`、`auditLog`、`oauthProvider`、`username`、`apiKey`、`passkey`、`jwt`、`openAPI`；Discord 社交登入 |
| 環境變數驗證 | arktype + `@t3-oss/env-nextjs`（`src/env.ts`） |
| UI | Tailwind CSS v4、Radix UI、Base UI、shadcn/ui |
| Lint／格式 | Biome |
| 測試 | `bun test`（`tests/`） |

## 2. 本機開發

identity 跑在 **port 3000**；需要測 ams 登入時，ams 另外跑在 **port 3001**（見 ams 的 `docs/requirements.md`）。

```bash
git clone https://github.com/pu-cmrdb/identity.git && cd identity
bun install
cp .env.example .env
```

`.env` 本機值：

| 變數 | 本機值 |
| --- | --- |
| `APP_DEV_URL` | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | 本機隨機字串（≥ 32 字元，`openssl rand -base64 32`） |
| `BETTER_AUTH_DISCORD_CLIENT_ID`、`BETTER_AUTH_DISCORD_CLIENT_SECRET` | 不測 Discord 登入時填任意假值 |
| `DATABASE_URL` | `file:./data/db.sqlite` |

```bash
bun run drizzle:migrate
bun run db:seed     # 本機管理員、AMS OAuth client（redirect 含 http://localhost:3001）、AMS API key
bun run dev         # http://localhost:3000
```

`db:seed` 印出的 client secret 與 API key 是本機開發值，只填進本機 ams 的 `.env`，不要貼到 issue、PR 或 commit。

### 與 ams 一起跑

1. identity 依上面步驟在 3000 啟動並執行 `db:seed`。
2. ams 的 `.env` 填入 `BETTER_AUTH_IAM_URL=http://localhost:3000`、`NEXT_PUBLIC_BETTER_AUTH_IAM_URL=http://localhost:3000`，以及 seed 印出的 client ID／secret 與 API key。
3. ams 在 3001 啟動，打開 `http://localhost:3001` 應導向 `http://localhost:3000/login`，登入並同意授權後回到 ams。

## 3. 範圍

| 模組 | 內容 |
| --- | --- |
| 登入 | 帳密（關閉自行註冊）、使用者名稱、Passkey、Discord |
| OAuth2／OIDC Provider | 授權碼流程（PKCE）、consent 頁、`.well-known` 探索端點、JWT／JWKS |
| 應用程式管理 | 管理員建立與管理 OAuth client（`/applications`） |
| 使用者管理 | 管理員建立、停用、設定角色（`admin`／`user`）（`/manage/users`） |
| API key | 供服務端呼叫（例如 ams 讀取使用者清單） |
| 稽核 | 認證事件寫入 audit log |

## 4. 驗收條件

### 4.1 每個 PR 都要滿足

- [ ] 對應一個 issue，PR 說明含 `Closes #N`。
- [ ] CI（lint、typecheck、test、build）在 PR head commit 全綠，且 workflow 不需要任何 secrets。（CI workflow 合併到 main 之前，以本機完整跑過推送前檢查全綠、並在 PR 說明附上結果為準。）
- [ ] 新功能或修正附 `bun test` 測試。
- [ ] 沒有提交 `.env`、金鑰、真實資料或建置產物（`.next/`、`data/`、`*.sqlite`）。
- [ ] 認證相關改動說明對 ams 等下游的影響，並在本機以 ams（3001）實測登入。

### 4.2 基礎／CI

- [ ] 乾淨 clone 後 `bun install --frozen-lockfile` 成功。
- [ ] 依第 2 節，只用 `.env.example` 填假值即可在 3000 啟動並讓 ams（3001）完成 OAuth 登入。

### 4.3 安全

- [ ] 不接受未認證的 OAuth 動態客戶端註冊；客戶端只由管理員建立。
- [ ] seed 不在正式環境使用。
- [ ] （暫緩，David 2026-11-23）原始碼中沒有固定的管理員密碼。
- [ ] 只有 `admin` 角色可管理使用者、應用程式與 API key。
- [ ] Better Auth 及其 plugin 使用一致且無已知漏洞的版本（與 ams 一致）。

## 5. 本週驗收底稿（行雲司 2026-11-23；David 16:54 定案）

> 本節是本週的範圍與驗收基準。和 issue 內文衝突時，以本節為準。ams 端的完整底稿見 `pu-cmrdb/ams` 的 `docs/requirements.md` 第 5 節。

### 5.1 流程限制

- 不另外新增 Gate 1 workflow，也不修改社團既有 workflow。
  - identity 的 CI workflow（lint、typecheck、build、test）是 David 明確要求的，不屬於這條限制（D14）。identity CI 合併前，後續 PR 不能合併（P0）。
- 不合併、不部署；正式站（`iam.cmrdb.cs.pu.edu.tw`）不碰。
- 優先順序：P0 → P6，依行雲司清單（見 5.4）。

### 5.2 和 ams 有關的權限

- 角色沿用 identity 既有 admin plugin 的 `role`（`admin`／`user`），不新增角色名稱。
- ams 的權限：只有 `admin` 能新增、修改、刪除財產、類別、盤點計畫，以及查看使用者名單；一般社員可以看財產、依規則出借、執行被分配的盤點。
- ams 透過現有的 IAM API key 查詢使用者 `role`（或 OIDC claim）。identity 這邊不需要新增角色。
- 驗收：
  - [ ] 本機 identity（3000）＋ ams（3001）下，`admin` 與 `user` 登入 ams 後，ams 能正確分辨兩者。

### 5.3 本週不做

- **預設管理員密碼與種子腳本修改**（David 2026-11-23 定案：本週不做）。
- 各 issue 中標為「第一版暫緩」的項目。

本週照做：AGENTS.md／requirements.md、CI、Better Auth 1.7.16、關閉動態客戶端註冊。除純文件變更外，每項合併前都要在本機以 ams 實測登入。

### 5.4 P0–P6 優先順序

依行雲司本週清單（2026-11-23 16:53，D16）。依序完成，前一級的驗收通過後再合併下一級。

| 優先 | 範圍 | 驗收 |
| --- | --- | --- |
| **P0 基礎設施** | 兩倉 `AGENTS.md`、`docs/requirements.md`；修好 ams CI，讓 main 再次變綠；identity 補上與 ams 同級的 lint、測試、建置 CI。identity 沒有 CI，就不能合併後續 PR | 兩倉 main 的檢查都綠燈，文件已進 repo |
| **P1 安全**（不含種子密碼） | identity 關閉 `allowDynamicClientRegistration`；兩倉 Better Auth（含 `@better-auth/*`）升到 1.7.16，先測 ams 透過 identity 登入，再合併；ams 角色權限：只有 admin 能改刪財產、類別、盤點計畫，並看使用者名單（出借路由的權限檢查可當範本）。建議一併處理：正式環境不信任 localhost、登入回跳只允許本站路徑、identity `users.list` 限 admin、關掉或收緊 `allowDifferentEmails` | 未授權者不能改刪財產與盤點；動態註冊已關閉；套件為 1.7.16；登入可用 |
| **P2 財產前端**（ams #29） | 總覽、新增／編輯、類別管理。可能已在 main：先對照驗收條件驗證，做完就關，不重做。圖片不在 #29 範圍內。已知缺少關鍵字搜尋框，另外補上 | 驗收條件逐項對照通過；關閉時附 commit |
| **P3 盤點**（ams #33） | 計畫建立與任務清單：後端已完成，確認前端是否已在 main，缺的再補。手動盤點 #34：待盤列表、確認無誤、異常修改（改數量時備註必填）。成果檢視 #36：計畫資訊、異常標示、發起人結案，以現有後端為準對齊驗收。舊 PR #54、#50 由替代 PR 接手，不對別人的分支 force push | #34、#36 的驗收通過；原 PR 註明被取代後關閉 |
| **P4 出借與儀表板** | 後端 #60、#61：建立、歸還、清單；restricted 要查授權人；只有 `creator_id` 能歸還；借出時財產改為 borrowed、歸還時改回 normal（只改該單的財產）。補齊現有的 borrow 路由，不另起一套。前端 #57、#59：借用表單（借用人、預計歸還日、備註）、無權限提示、只有開單人看得到歸還、成功後更新畫面。儀表板 #58：我的借用（active）、待辦盤點（in_progress 且分配給自己）、可跳轉、空狀態 | 各 issue 的驗收通過 |
| **P5 圖片**（以 #24 為主，#21 重複） | #24、#25。#21 獨有的內容先搬到 #24，再關 #21 | 上傳後以 hash 存到 `data/images/`；metadata 入庫；相同 hash 不重複存；`asset.getImages` 回傳歷史；`imageRouter` 已掛上 |
| **P6 標籤機 B21S** | 在 ams 內用 Web Bluetooth 直連，不依賴 printer 倉，也不用 `PRINT_SERVER_URL`。QR 一律指向 `/scan?id=<assetId>`，依登入身分導向財產詳情或盤點頁。單筆列印（新增財產後可印，也可補印）。貼紙含財產名稱、學校產編、QR，Logo 可選。排版可以寫死，但紙張尺寸預設 50×30 mm 且可調。不做批次列印、不做缺紙回報。本週只支援已配對的電腦版 Chrome／Edge，其他瀏覽器提示改用。#47 以 not planned 關閉（printer 倉不封存、不刪除） | #48：瀏覽器觸發列印成功；印表機未連線時給出明確錯誤 |

本週不做：逾期 Email、多層審核、批次列印、盤點圖表、全站統計；identity 預設密碼與種子腳本。
