import VK from 'next-auth/providers/vk';

const provider = VK({ clientId: 'test', clientSecret: 'secret', checks: ['state'] });
console.log('Provider keys:', Object.keys(provider));
console.log('Provider options:', provider.options);
console.log('Provider checks:', provider.checks);
console.log('Provider type:', provider.type);
console.log('Provider authorization:', provider.authorization);
