import NextAuth from 'next-auth';
import VK from '@auth/core/providers/vk';

try {
  const authConfig = {
    providers: [
      VK({
        clientId: process.env.VK_CLIENT_ID || 'test',
        clientSecret: process.env.VK_CLIENT_SECRET || 'test',
      }),
    ],
    debug: true,
  };
  
  const { handlers } = NextAuth(authConfig);
  console.log('NextAuth initialized successfully');
  console.log('Handlers:', Object.keys(handlers));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}