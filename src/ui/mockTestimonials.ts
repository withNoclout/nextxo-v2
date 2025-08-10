export type Platform = 'x' | 'discord'

export interface Testimonial {
  id: string
  platform: Platform
  username: string // e.g., "@mock.user1"
  name?: string // optional display name
  text: string // compliment
  color?: string // optional accent for avatar
}

export const mockTestimonials: Testimonial[] = [
  { id: 't01', platform: 'x',       username: '@mock.user1',  text: 'NetXO shipped our MVP a week faster. Dark mode bonus ✨' },
  { id: 't02', platform: 'discord', username: '@mock.user2',  text: 'Realtime charts were shockingly easy. Loved the docs!' },
  { id: 't03', platform: 'x',       username: '@mock.user3',  text: 'CLI + templates = zero boilerplate. Chef’s kiss.' },
  { id: 't04', platform: 'discord', username: '@mock.user4',  text: 'Auth + storage worked first try. Rare. Beautiful.' },
  { id: 't05', platform: 'x',       username: '@mock.user5',  text: 'We swapped our backend in a day. Perf stayed crisp.' },
  { id: 't06', platform: 'discord', username: '@mock.user6',  text: 'Vector search demoed in under 10 mins. Wild.' },
  { id: 't07', platform: 'x',       username: '@mock.user7',  text: 'Branching + previews = happy reviewers ✅' },
  { id: 't08', platform: 'discord', username: '@mock.user8',  text: 'RLS made multi-tenant safe without pain.' },
  { id: 't09', platform: 'x',       username: '@mock.user9',  text: 'Edge functions are snappy. Logs are clean.' },
  { id: 't10', platform: 'discord', username: '@mock.user10', text: 'Love the grid aesthetics. Feels premium.' },
  { id: 't11', platform: 'x',       username: '@mock.user11', text: 'Carbon monitor dashboards look 🔥 on mobile.' },
  { id: 't12', platform: 'discord', username: '@mock.user12', text: 'Webhooks + queues simplified our pipeline.' },
  { id: 't13', platform: 'x',       username: '@mock.user13', text: 'Docs read like a tour guide. Smooth ride.' },
  { id: 't14', platform: 'discord', username: '@mock.user14', text: 'Type-safe APIs saved us from weekend bug hunts.' },
  { id: 't15', platform: 'x',       username: '@mock.user15', text: 'One click to prod. No YAML forehead creases.' },
  { id: 't16', platform: 'discord', username: '@mock.user16', text: 'Support replies were actually helpful. 10/10.' },
]
