import { Suspense } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  return (
    <div>
      <Card className="min-w-xs md:min-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">歡迎回來</CardTitle>

          <CardDescription>登入以繼續使用身份管理系統</CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
