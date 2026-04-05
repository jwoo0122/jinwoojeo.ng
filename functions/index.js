const ASCII_ART = `
  ┌───────────────────────────────────────┐
  │                                       │
  │   Jinwoo Jeong                        │
  │   Frontend Developer                  │
  │                                       │
  │   Work                                │
  │     Viva Republica (2021~)            │
  │     Channel Corp. (2019~2021)         │
  │     CLASSUM (2018~2019)               │
  │                                       │
  │   Education                           │
  │     KAIST - School of Computing, BS   │
  │                                       │
  │   Interests                           │
  │     Web technology                    │
  │     AT protocol                       │
  │     Productivity tools                │
  │                                       │
  │   https://jinwoojeo.ng               │
  │   https://github.com/jwoo0122        │
  │                                       │
  └───────────────────────────────────────┘
`;

const CLI_AGENTS = /curl|wget|httpie/i;

export async function onRequestGet(context) {
  const ua = context.request.headers.get('user-agent') || '';
  if (CLI_AGENTS.test(ua)) {
    return new Response(ASCII_ART, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  return context.next();
}
