'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, ArrowLeft, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        <Card className="border-border/50 shadow-apple-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Личный кабинет</CardTitle>
            <CardDescription>
              Ваша учётная запись
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{session?.user?.id}</span>
              </div>
              {session?.user?.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{session.user.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус:</span>
                <span className="text-green-600 font-medium">Авторизован</span>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="w-4 h-4" />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
