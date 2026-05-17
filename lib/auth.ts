import NextAuth from 'next-auth';
import { createClient } from '@supabase/supabase-js';

// В начале файла, перед использованием Supabase
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('⚠️ Supabase credentials missing. Auth will be disabled.');
    return null;
  }
  
  return createClient(url, key);
}

const supabase = getSupabaseClient();
import { SupabaseAdapter } from '@auth/supabase-adapter';
import VkProvider from 'next-auth/providers/vk';
import CredentialsProvider from 'next-auth/providers/credentials';

let _handlers: { GET: (...args: any[]) => Promise<Response>; POST: (...args: any[]) => Promise<Response> } | undefined;
let _auth: (() => Promise<{ user?: { id: string } } | null>) | undefined;

function init() {
  if (_handlers) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const result = NextAuth({
    adapter: SupabaseAdapter({ url, secret }),
    providers: [
      VkProvider({
        clientId: process.env.VK_CLIENT_ID!,
        clientSecret: process.env.VK_CLIENT_SECRET!,
        profile(profile: any) {
          return {
            id: profile.id.toString(),
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email || null,
            image: profile.photo_200,
            vkId: profile.id.toString(),
          };
        },
      }),
      CredentialsProvider({
        id: 'telegram',
        name: 'Telegram',
        credentials: {
          telegramId: { label: 'Telegram ID', type: 'text' },
          firstName: { label: 'Имя', type: 'text' },
          username: { label: 'Username', type: 'text' },
        },
        async authorize(credentials) {
          const telegramId = credentials?.telegramId as string | undefined;
          if (!telegramId) return null;
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: existing } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
          if (existing) return { id: existing.id, telegramId };
          const { data: newUser, error } = await supabase.from('users').insert({ telegram_id: telegramId, role: 'user' }).select().single();
          if (error || !newUser) return null;
          return { id: newUser.id, telegramId };
        },
      }),
      CredentialsProvider({
        id: 'phone',
        name: 'Телефон',
        credentials: {
          phone: { label: 'Номер телефона', type: 'tel' },
          code: { label: 'Код подтверждения', type: 'text' },
        },
        async authorize(credentials) {
          const phone = credentials?.phone as string | undefined;
          const code = credentials?.code as string | undefined;
          if (!phone || !code || code.length !== 6) return null;
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).single();
          if (existing) return { id: existing.id, phone };
          const { data: newUser } = await supabase.from('users').insert({ phone, role: 'user' }).select().single();
          if (!newUser) return null;
          return { id: newUser.id, phone };
        },
      }),
    ],
    callbacks: {
      async session({ session, token }: any) {
        if (token?.sub && session.user) session.user.id = token.sub;
        return session;
      },
    },
    pages: { signIn: '/login' },
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    debug: process.env.NODE_ENV === 'development',
  });

  _handlers = result.handlers;
  _auth = result.auth;
}

export function getHandlers() {
  init();
  return _handlers!;
}

export function getAuthSession() {
  init();
  return _auth!();
}
