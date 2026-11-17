const CHALLENGE = 'Basic realm="Vector Space docs", charset="UTF-8"';

const sha256 = (text: string) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));

export default {
  async fetch(request, env) {
    // An unset secret reads as undefined, which would make "undefined:undefined" a valid login.
    if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASSWORD) {
      return new Response('Basic auth is not configured', { status: 500 });
    }
    // The challenge asks for UTF-8, so the expected header encodes the same bytes; btoa alone throws outside Latin-1.
    const bytes = new TextEncoder().encode(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASSWORD}`);
    const expected = `Basic ${btoa(String.fromCharCode(...bytes))}`;
    const given = request.headers.get('Authorization') ?? '';
    // timingSafeEqual needs equal lengths; hashing gives them without leaking the header length.
    const [a, b] = await Promise.all([sha256(given), sha256(expected)]);
    if (!crypto.subtle.timingSafeEqual(a, b)) {
      return new Response('Authentication required', { status: 401, headers: { 'WWW-Authenticate': CHALLENGE } });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
