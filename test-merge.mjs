import VK from 'next-auth/providers/vk';

const provider = VK({ clientId: 'test', clientSecret: 'secret', checks: ['state'] });

// Имитируем parseProviders
const { options: userOptions, ...defaults } = provider;

// Простой merge (без deep merge для простоты)
const merged = { ...defaults, ...userOptions };

console.log('Merged checks:', merged.checks);
console.log('Merged clientId:', merged.clientId);
console.log('Merged authorization:', merged.authorization);
