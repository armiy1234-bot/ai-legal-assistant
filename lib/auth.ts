import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import VkProvider from 'next-auth/providers/vk';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    VkProvider({
      clientId: process.env.VK_CLIENT_ID!,
      clientSecret: process.env.VK_CLIENT_SECRET!,
      profile(profile) {
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
        if (!credentials?.telegramId) return null;
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', credentials.telegramId)
          .single();
        if (existing) {
          return { id: existing.id, telegramId: credentials.telegramId };
        }
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            telegram_id: credentials.telegramId,
            role: 'user',
          })
          .select()
          .single();
        if (error || !newUser) return null;
        return { id: newUser.id, telegramId: credentials.telegramId };
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
        if (!credentials?.phone || !credentials?.code) return null;
        if (credentials.code.length !== 6) return null;
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('phone', credentials.phone)
          .single();
        if (existing) {
          return { id: existing.id, phone: credentials.phone };
        }
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            phone: credentials.phone,
            role: 'user',
          })
          .select()
          .single();
        if (!newUser) return null;
        return { id: newUser.id, phone: credentials.phone };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
});
