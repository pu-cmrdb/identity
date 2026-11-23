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
- [ ] CI（lint、typecheck、test、build）在 PR head commit 全綠，且 workflow 不需要任何 secrets。
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
