import { and, eq } from 'drizzle-orm';

import { db, schema } from '../database';
import { auth } from '../auth';

// ─── 管理員帳號 ───────────────────────────────────────────────────────────────

console.log('正在檢查 管理員帳號 ...');

const adminEmail = 'admin@identity.cmrdb.cs.pu.edu.tw';
const adminName = 'cmrdb_admin';
const adminPassword = 'cmrdb_admin';

let adminUser = await db.query.users.findFirst({
  where: eq(schema.users.email, adminEmail),
});

if (adminUser) {
  console.log('⏭️ 管理員帳號已存在，略過');
  console.log('');
}
else {
  try {
    await auth.api.createUser({
      body: {
        data: {
          username: adminName,
        },
        email: adminEmail,
        name: adminName,
        password: adminPassword,
        role: 'admin',
      },
    });

    adminUser = await db.query.users.findFirst({
      where: eq(schema.users.email, adminEmail),
    });

    console.log('✅ 初始管理員使用者建立成功');
    console.log('');
    console.log('請使用以下憑證登入管理員使用者：');
    console.log(`  電子郵件：${adminEmail}`);
    console.log(`  使用者名稱：${adminName}`);
    console.log(`  密碼：${adminPassword}`);
    console.log('');
  }
  catch (error) {
    console.error('❌ 初始管理員使用者無法建立：', error);
  }
}

// ─── 行雲財產管理系統 ─────────────────────────────────────────────────────────

console.log('正在檢查 行雲財產管理系統 ...');

const amsClientName = '行雲財產管理系統';

const existingAmsClient = await db.query.oauthClients.findFirst({
  where: eq(schema.oauthClients.name, amsClientName),
});

if (existingAmsClient) {
  console.log('⏭️ 行雲財產管理系統 已存在，略過');
  console.log('');
  console.log(`  應用程式 ID ： ${existingAmsClient.clientId}`);
  console.log('');
}
else {
  try {
    const { client_id, client_secret } = await auth.api.adminCreateOAuthClient({
      body: {
        client_name: amsClientName,
        client_uri: 'https://ams.cmrdb.cs.pu.edu.tw',
        enable_end_session: true,
        grant_types: ['authorization_code', 'refresh_token'],
        post_logout_redirect_uris: [
          'https://ams.cmrdb.cs.pu.edu.tw',
          'http://localhost:3001',
        ],
        redirect_uris: [
          'https://ams.cmrdb.cs.pu.edu.tw/api/auth/oauth2/callback/identity',
          'http://localhost:3001/api/auth/oauth2/callback/identity',
        ],
        scope: 'openid profile email offline_access',
        skip_consent: false,
        type: 'web',
      },
    });

    console.log('✅ 行雲財產管理系統 註冊成功');
    console.log('');
    console.log(`  應用程式 ID ： ${client_id}`);
    console.log(`  應用程式密鑰： ${client_secret}`);
    console.log('');
  }
  catch (error) {
    console.error('❌ 應用程式註冊失敗：', error);
  }
}

// ─── 行雲財產管理系統 API 金鑰 ───────────────────────────────────────────────

if (adminUser) {
  console.log('正在檢查 行雲財產管理系統 API 金鑰 ...');

  const amsApiKeyName = 'ams';

  const existingApiKey = await db.query.apikeys.findFirst({
    where: and(
      eq(schema.apikeys.name, amsApiKeyName),
      eq(schema.apikeys.referenceId, adminUser.id),
    ),
  });

  if (existingApiKey) {
    console.log('⏭️ API 金鑰已存在，略過');
    console.log('');
    console.log('  若需要重新產生，請先手動刪除現有金鑰後再次執行。');
    console.log('');
  }
  else {
    try {
      const apiKey = await auth.api.createApiKey({
        body: {
          expiresIn: null,
          name: amsApiKeyName,
          userId: adminUser.id,
        },
      });

      console.log('✅ API 金鑰建立成功');
      console.log('');
      console.log('⚠️  請妥善保存此金鑰，之後將無法再次查看：');
      console.log(`  API 金鑰：${apiKey.key}`);
      console.log('');
    }
    catch (error) {
      console.error('❌ API 金鑰建立失敗：', error);
    }
  }
}
