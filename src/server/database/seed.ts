import { auth } from '../auth';

try {
  console.log('正在註冊 管理員帳號 ...');

  const name = 'cmrdb_admin';
  const email = 'admin@identity.cmrdb.cs.pu.edu.tw';
  const password = 'cmrdb_admin';

  await auth.api.createUser({
    body: {
      data: {
        username: name,
      },
      email,
      name,
      password,
      role: 'admin',
    },
  });

  console.log('✅ 初始管理員使用者建立成功');
  console.log('');
  console.log('請使用以下憑證登入管理員使用者：');
  console.log(`  電子郵件：${email}`);
  console.log(`  使用者名稱：${name}`);
  console.log(`  密碼：${password}`);
  console.log('');
}
catch (error) {
  console.error('❌ 初始管理員使用者無法失敗：', error);
}

try {
  console.log('正在註冊 行雲資產管理系統 ...');

  const { client_id, client_secret } = await auth.api.adminCreateOAuthClient({
    body: {
      client_name: '行雲資產管理系統',
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

  console.log('✅ 行雲資產管理系統 註冊成功');
  console.log('');
  console.log(`  應用程式 ID ： ${client_id}`);
  console.log(`  應用程式密鑰： ${client_secret}`);
  console.log('');
}
catch (error) {
  console.error('❌ 應用程式註冊失敗：', error);
}
