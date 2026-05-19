const crypto = require('crypto');

// Генерируем PKCE
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

console.log('Code verifier:', codeVerifier);
console.log('Code challenge:', codeChallenge);

const authUrl = new URL('https://oauth.vk.com/authorize');
authUrl.searchParams.set('client_id', '54593860');
authUrl.searchParams.set('redirect_uri', 'https://ai-legal-assistant-henna.vercel.app/api/auth/callback/vk');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'email');
authUrl.searchParams.set('state', 'test-state');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

console.log('Auth URL:', authUrl.toString());
