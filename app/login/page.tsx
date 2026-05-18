'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
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
              <Scale className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Вход в LexAI</CardTitle>
            <CardDescription>
              Войдите, чтобы получить доступ к AI-консультациям
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button 
              size="lg" 
              className="w-full gap-2 bg-[#0077FF] hover:bg-[#0066DD] text-white"
              onClick={() => signIn('vk', { callbackUrl: '/' })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.365 1.26 2.18 1.817.616.423 1.084.33 1.084.33l2.177-.03s1.14-.071.599-.97c-.044-.073-.314-.66-1.617-1.867-1.364-1.264-1.182-1.06.462-3.246.999-1.332 1.398-2.146 1.273-2.494-.12-.332-.86-.244-.86-.244l-2.45.015s-.182-.025-.316.056c-.132.08-.217.264-.217.264s-.39 1.037-.91 1.92c-1.096 1.86-1.534 1.96-1.713 1.842-.418-.27-.314-1.084-.314-1.66 0-1.807.274-2.562-.534-2.758-.268-.065-.465-.108-1.15-.115-.878-.01-1.62.003-2.042.209-.28.14-.496.45-.364.468.163.022.532.1.728.363.253.34.244 1.103.244 1.103s.145 2.13-.34 2.394c-.332.182-.788-.19-1.766-1.893-.501-.87-.88-1.83-.88-1.83s-.073-.18-.203-.276c-.158-.118-.378-.155-.378-.155l-2.33.016s-.35.01-.478.162c-.115.137-.01.42-.01.42s1.834 4.29 3.91 6.453c1.903 1.98 4.064 1.85 4.064 1.85h.978z"/>
              </svg>
              Войти через VK ID
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">или</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => signIn('email', { callbackUrl: '/' })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Войти по Email
            </Button>
            
            <p className="text-xs text-muted-foreground text-center pt-2">
              Нажимая «Войти», вы соглашаетесь с{' '}
              <Link href="/terms" className="underline hover:text-foreground">условиями использования</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
