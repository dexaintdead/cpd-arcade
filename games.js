/* ContentPad Arcade — the game catalog (build 2026100301-arcade).
   Phase 1: house games live in this repo as <slug>.html at the top level and are listed here.
   Phase 2 moves the catalog to the API (member submissions + review queue). */
window.ARCADE_GAMES = [
  {
    slug: 'skyline-dash',
    file: 'skyline-dash.html',
    title: 'Maverick: Skyline Dash',
    tagline: 'Run the rooftops. Dodge the drones. Grab the gold.',
    about: 'Maverick is late for a launch and the city is his shortcut. Sprint across neon rooftops at sunset, double-jump the gaps, duck under delivery drones and stay clear of one very grumpy storm cloud. It gets faster the longer you last.',
    genre: 'Runner',
    tags: ['Action', 'Endless', 'One button'],
    controls: [['Space / tap / (A)', 'Jump — tap again in the air to double jump, hold for height'], ['P / Esc / Start', 'Pause'], ['M', 'Mute']],
    by: 'ContentPad Studios',
    made: 'Art and music made in ContentPad Studio · code by Claude',
    cover: 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/65ac6d66-2d2f-481d-abf0-92f43cb0fa52.png',
    accent: '#ff4fb3',
    released: '2026-10-03',
    controller: true, mobile: true,
    status: 'live'
  },
  {
    slug: 'trey-and-jada',
    title: 'Trey & Jada',
    tagline: 'Keep the relationship alive. Keep your wallet alive. Pick one.',
    about: 'A choose-your-path relationship comedy. Every choice changes the next scene — shopping trips, surprise birthdays, the group chat, the ex who keeps liking her photos. Dozens of endings. Most of them are your fault.',
    genre: 'Story RPG',
    tags: ['Comedy', 'Choices matter', 'Many endings'],
    by: 'ContentPad Studios',
    accent: '#f5c542',
    status: 'soon'
  },
  {
    slug: 'maze-rush',
    title: 'Maze Rush',
    tagline: 'An original neon maze chase. Clear the board before they clear you.',
    genre: 'Arcade',
    tags: ['Classic', 'Controller'],
    by: 'ContentPad Studios',
    accent: '#7b6cff',
    status: 'soon'
  }
];
