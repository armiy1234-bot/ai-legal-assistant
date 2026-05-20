import VK from '@auth/core/providers/vk';
console.log('VK type:', typeof VK);
console.log('VK name:', VK.name);
console.log('VK is function:', typeof VK === 'function');
if (typeof VK === 'function') {
  const config = VK({ clientId: 'test', clientSecret: 'test' });
  console.log('Config:', JSON.stringify(config, null, 2));
}