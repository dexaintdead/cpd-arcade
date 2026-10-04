/* Tre & Jada — Episode 1: "Payday". 18+ adult comedy. Original characters (ContentPad).
   v3 (4 Oct 2026): Brooklyn. Bigger paycheck, real NYC prices, rent due Sunday. The brunch argument,
   "for the gram", the soft launch, cutscenes, three new mini-games (Bottomless, Hot Takes, For the Gram).
   Node format:
     id: { day, bg, music, loc:[place, sub], cut, lines:[[who, expr, text, cond?]],
           choice:{ q, secs, def, opts:[{ t, fx, set, go }] }, mini:{ game, go }, go, end, fx }
   who: tre | jada | mike | brenda | marcus | kiki | deshawn | sys (on-screen caption, not voiced)
   cond (optional): 'flag', '!flag', 'wallet<150', 'shiftSold>=6' ... joined with '&' (all) or '|' (any).
   loc: the station-sign title card shown when the scene changes place.
   cut: a cutscene (see cuts below) played before the node's lines.
   Text in sys lines and choices may use {tab} {split} (brunch bill) — voiced lines never carry numbers that change.
   fx: meter deltas { mood, wallet, sanity, trust }; wallet may be '-tab' / '-split' (the brunch bill). set: story flags. */
window.TJ_SCRIPT = {
  title: 'Tre & Jada',
  episode: 'Episode 1 — Payday',
  city: 'Brooklyn',
  rent: 1350,
  start: { mood: 60, wallet: 2400, sanity: 70, trust: 55 },
  first: 'mon_intro',

  /* Cutscenes. clip = a short animated shot (video, or a still with a slow push-in) with timed captions;
     phone = Tre's phone screen: notifications, a story, a post, texts. Items may carry a cond. */
  cuts: {
    payday: { kind: 'clip', clip: 'payday', secs: 6.5, caps: [
      [0, '6:02 AM. Bed-Stuy, Brooklyn.'],
      [1.6, '📲 DIRECT DEPOSIT  +$2,400.00', 'note'],
      [3.6, '📲 LANDLORD: Rent is due Sunday 🙂', 'note bad']
    ] },
    story: { kind: 'phone', title: "Kiki's story", secs: 6, items: [
      ['story', 'brunch', 'he paid for EVERYTHING 😍👑 @jada keep him', 'paidBrunch'],
      ['story', 'brunch', 'he venmo requested me AT BRUNCH 💀💀 11 slides coming', 'splitBrunch'],
      ['story', 'shoe', 'he ran. he left a shoe. 🏃🏾‍♂️👟', 'fakeCall'],
      ['meta', '', '👁 2,184 views · 🔥 214 replies']
    ] },
    subway: { kind: 'clip', clip: 'subway', secs: 5.5, caps: [
      [0, 'Tuesday, 8:41 AM. The train to Flatbush.'],
      [2.4, 'The man next to Tre is eating a hot dog. At 8:41 AM.']
    ] },
    softlaunch: { kind: 'phone', title: "Jada's post", secs: 7, items: [
      ['post', 'dumbo', 'golden hour with my 🤍', 'gramShots>=4'],
      ['post', 'bridge', 'golden hour 🌉 (the light was NOT cooperating)', 'gramShots<4'],
      ['comment', 'kiki', 'whose HAND is that 👀👀👀', 'gramShots>=4'],
      ['comment', 'kiki', 'where is TRE in this 😭', 'gramShots<4'],
      ['comment', 'tre', 'eight months. I am a hand.', 'gramShots>=4'],
      ['comment', 'tre', 'I was standing RIGHT THERE.', 'gramShots<4'],
      ['meta', '', '❤️ 412 likes · Jada liked Kiki\'s comment']
    ] },
    brenda: { kind: 'clip', clip: 'brenda', secs: 6, caps: [
      [0, 'Saturday, 6:00 PM sharp. Not 6:01.'],
      [2.6, 'She took two buses and a train from Canarsie. She brought her own chair.']
    ] },
    rent: { kind: 'phone', title: 'Sunday, 9:00 AM', secs: 6, items: [
      ['text', 'landlord', 'Rent 🙂'],
      ['text', 'landlord', 'Just the smiley face. That\'s the whole text.'],
      ['bank', 'rent', 'RENT  −$1,350.00']
    ] }
  },

  nodes: {

  // ───────────────────────── MONDAY — BRUNCH ─────────────────────────
  mon_intro: { day: 'MONDAY', bg: 'apartment', music: 'theme', cut: 'payday', loc: ['Home', 'Bed-Stuy · 1 bedroom · shower next to the stove'], lines: [
    ['sys', '', 'MONDAY · Payday. $2,400 just hit. Rent is $1,350. It\'s due Sunday.'],
    ['tre', 'smug', 'Twenty-four hundred dollars. Look at me. I\'m a whole-ass hedge fund.'],
    ['tre', 'neutral', 'Rent comes out Sunday. That leaves a thousand and fifty dollars of pure, beautiful, Brooklyn freedom.'],
    ['jada', 'happy', 'Babe! Brunch. Today. Just us. You and me, bottomless mimosas, no phones.'],
    ['tre', 'neutral', 'Just us?'],
    ['jada', 'flirty', 'Just us. I swear on my edges.'],
    ['tre', 'nervous', 'You swore on your edges last time and your cousin moved in for three damn weeks.']
  ], go: 'mon_brunch' },

  mon_brunch: { bg: 'brunch', music: 'brunch', loc: ['Velvet Mimosa', 'Fort Greene · 11:30 AM · 90-minute wait'], lines: [
    ['sys', '', 'Velvet Mimosa · Fort Greene · 11:30 AM'],
    ['tre', 'neutral', 'Okay, this is nice. Table for two, right?'],
    ['kiki', 'friends', 'SURPRIIIISE! Jada said you were treating!', '', { shot: 'b_surprise' }],
    ['tre', 'shocked', 'I\'m sorry, Jada said the FUCK?'],
    ['jada', 'laugh', 'I said you were treating ME. They heard what they wanted to hear.'],
    ['kiki', 'friends', 'Six bottomless, and nobody eat yet. Content first. The light in here is giving.', '', { shot: 'b_content' }],
    ['tre', 'annoyed', 'Kiki, it\'s forty-five dollars a person for bottomless. In this economy?'],
    ['kiki', 'friends', 'In THIS economy, babe, mimosas are a human right. Waiter! We\'re ready!', '', { shot: '-' }]
  ], mini: { game: 'bottomless', go: 'mon_bill' } },

  mon_bill: { bg: 'brunch', music: 'brunch', lines: [
    ['sys', '', 'Ninety minutes later. The bill lands in front of Tre. Not the middle. In front of TRE. {tab}.', '', { shot: 'b_bill' }],
    ['tre', 'defeated', 'Why the hell is the waiter looking at me like he\'s seen my credit score?'],
    ['jada', 'flirty', 'Baaabe. The waiter\'s looking at you.'],
    ['kiki', 'friends', 'Oh, and Jada, Marcus said hey. He saw you at the gym Saturday.', '', { shot: '-' }],
    ['tre', 'annoyed', 'Who the hell is Marcus?'],
    ['jada', 'sideeye', 'Nobody. A gym friend. Focus, Tre. The bill.'],
    ['kiki', 'friends', 'I mean, it\'s 2026. A real man pays for everything. Rent, brunch, my lashes. That\'s just biblical.'],
    ['tre', 'shocked', 'YOUR lashes? Kiki, I am not dating y\'all! I am dating ONE person at this table!'],
    ['jada', 'dramatic', 'Oh, here we go. It\'s about to be a whole podcast at this table.']
  ], mini: { game: 'takes', go: 'mon_decide' } },

  mon_decide: { bg: 'brunch', music: 'brunch', lines: [
    ['kiki', 'friends', 'Okay, okay. He funny. Y\'all, we\'ll cover the bottles. Don\'t say I never did nothing for you, Tre.', 'takesWon', { shot: 'b_nod' }],
    ['jada', 'happy', 'See? That\'s why I keep him. He can talk his way out of a parking ticket.', 'takesWon'],
    ['kiki', 'friends', 'Mm-hm. Anyway. Somebody still gotta pay this bill. And it ain\'t gonna be my bottomless.', '!takesWon', { shot: 'b_smug' }],
    ['jada', 'sideeye', 'You just got bodied by Kiki in front of the whole brunch, babe. Pay something.', 'takesFolds>=3'],
    ['sys', '', 'The bill: {tab}. Six women are looking at Tre. So is the waiter. So is God.', '', { shot: 'b_bill' }]
  ], choice: { q: 'The bill is {tab}. What does Tre do?', secs: 14, def: 2, opts: [
    { t: 'Pay for everybody like a king', fx: { mood: 15, wallet: '-tab', sanity: -10 }, set: { paidBrunch: 1 }, go: 'mon_pay' },
    { t: 'Split it six ways, publicly ({split} each)', fx: { mood: -15, wallet: '-split', trust: -5 }, set: { splitBrunch: 1 }, go: 'mon_split' },
    { t: 'Fake an emergency phone call', fx: { mood: -10, wallet: 0, sanity: 5, trust: -10 }, set: { fakeCall: 1 }, go: 'mon_fake' }
  ] } },

  mon_pay: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'smug', 'Put it all on me. Every waffle. Every candle.', '', { shot: 'b_cheer' }],
    ['kiki', 'friends', 'Okaaay, Tre! Jada, he a real one. Keep him.'],
    ['jada', 'happy', 'See? THAT\'S my man. Y\'all hate to see it.'],
    ['sys', '', 'The card machine asks for a tip. It starts at 25 percent. There is no "no".', '', { shot: '-' }],
    ['tre', 'defeated', '(whispering) There goes my MetroCard. There goes my dignity. There goes my whole damn will to live.'],
    ['jada', 'flirty', 'Baby, you are getting SO taken care of tonight. Like... thoroughly.'],
    ['tre', 'neutral', '...Okay. Worth it. I\'ma need a receipt for tonight too.']
  ], go: 'mon_story' },

  mon_split: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'neutral', 'So it\'s six ways, even. And Kiki, you owe an extra nine for the candles.'],
    ['kiki', 'friends', 'A Venmo request? At BRUNCH? In front of GOD and these damn mimosas?', '', { shot: 'b_gasp' }],
    ['tre', 'annoyed', 'You said a real man pays for everything. A real man also does MATH, Kiki.'],
    ['jada', 'mad', 'Tre. You just embarrassed the shit out of me in front of the whole group chat. They\'re typing about it RIGHT NOW.', '', { shot: '-' }],
    ['tre', 'annoyed', 'Good. Tell them the lobster waffle wasn\'t free either.'],
    ['jada', 'sideeye', 'Oh, you can sleep on the couch with that math. And keep your hands to yourself, \'cause tonight I damn sure am.']
  ], go: 'mon_story' },

  mon_fake: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'shocked', '(into phone) Hello? Grandma? You fell WHERE? Into the WHAT?'],
    ['jada', 'sideeye', 'Your grandma died in 2019, Tre.'],
    ['tre', 'nervous', '(still on phone) ...and she\'s STILL falling, that\'s how serious this is.'],
    ['kiki', 'friends', 'He ran. Girl, he RAN. Down Fulton Street. That motherfucker left a shoe.', '', { shot: 'b_shoe' }],
    ['jada', 'dramatic', 'I\'m paying for brunch with my emergency lash money. I\'ll never forget this.']
  ], go: 'mon_story' },

  mon_story: { bg: 'apartment', music: 'theme', cut: 'story', loc: ['Home', 'Bed-Stuy · Monday night'], lines: [
    ['sys', '', 'Monday night. Kiki posted. Of course Kiki posted.'],
    ['tre', 'defeated', 'Two thousand people watched that. My MOTHER watched that. She replied with a praying hands emoji.']
  ], go: 'tue_intro' },

  // ───────────────────────── TUESDAY — WORK ─────────────────────────
  tue_intro: { day: 'TUESDAY', bg: 'work', music: 'work', cut: 'subway', loc: ['Big Mike\'s Mattress Kingdom', 'Flatbush Ave · "We will NOT be undersold"'], lines: [
    ['sys', '', 'TUESDAY · Big Mike\'s Mattress Kingdom · Flatbush Ave'],
    ['deshawn', 'deshawn', 'Bro. Kiki posted you paying for six women\'s brunch. Two hundred likes. You a legend and you broke.', 'paidBrunch', { shot: 'w_phone' }],
    ['deshawn', 'deshawn', 'Bro. You Venmo-requested Kiki AT brunch? She made a whole story about you. Eleven slides.', 'splitBrunch', { shot: 'w_phone' }],
    ['deshawn', 'deshawn', 'Bro. Kiki posted your shoe. Just your shoe. Caption says "he ran."', 'fakeCall', { shot: 'w_phone' }],
    ['deshawn', 'deshawn', 'And I heard you went toe to toe with the girls on that "man pays for everything" stuff. Respect. Stupid. But respect.', 'takesWon'],
    ['tre', 'defeated', 'Monday was a war, Deshawn. And I lost.'],
    ['mike', 'mike', 'TRE! My guy! My son! My favorite employee who is about to do me a favor.', '', { shot: 'w_mike' }],
    ['tre', 'annoyed', 'Hell no.'],
    ['mike', 'mike', 'Double shift. Tonight. Mattress Madness Midnight Sale. Eighty-five dollars commission a mattress and all the hot dogs you can carry.'],
    ['deshawn', 'deshawn', 'Bro, take it. Hot dogs are a currency. I\'m basically rich off hot dogs.', '', { shot: 'w_hotdogs' }],
    ['tre', 'nervous', 'After that brunch? I need this money bad.', 'paidBrunch'],
    ['tre', 'neutral', 'But Jada wanted to watch our show tonight. She said if I miss another episode it\'s "a pattern."', '', { shot: '-' }],
    ['deshawn', 'deshawn', 'Women love a man with a work ethic. Trust me. I\'m single for completely unrelated reasons.']
  ], choice: { q: 'Big Mike needs a double shift tonight.', secs: 14, def: 0, opts: [
    { t: 'Take the double (play The Shift)', fx: { mood: -10, sanity: -10 }, set: { double: 1 }, go: 'tue_shift' },
    { t: 'Fake-cough at Mike and go home to Jada', fx: { mood: 15, wallet: -95, trust: 5 }, set: { skipped: 1 }, go: 'tue_home' }
  ] } },

  tue_shift: { bg: 'work', music: 'work', lines: [
    ['mike', 'mike', 'That\'s my boy! Sell those mattresses like your rent depends on it.'],
    ['tre', 'defeated', 'My rent DOES depend on it, Mike. That\'s the fucked up part.'],
    ['mike', 'mike', 'Exactly. Motivation!']
  ], mini: { game: 'shift', go: 'tue_after_shift' } },

  tue_after_shift: { bg: 'apartment', music: 'theme', loc: ['Home', 'Bed-Stuy · 1:14 AM'], lines: [
    ['sys', '', '1:14 AM. Tre gets home smelling like hot dogs and memory foam.'],
    ['jada', 'sideeye', 'Oh, so you DO live here.'],
    ['tre', 'smug', 'Baby, I sold so many mattresses tonight Mike cried. Real tears. Hot dog-scented tears.', 'shiftSold>=6'],
    ['tre', 'nervous', 'Baby, I was making money. For us. For our future. For your brunches.'],
    ['jada', 'dramatic', 'I watched the season finale ALONE, Tre. Do you know who died? You don\'t. Because you were selling a Cloud Nine pillow-top to a stranger.'],
    ['tre', 'neutral', 'Was it the twin? Tell me it was the evil twin.'],
    ['jada', 'mad', 'Go to sleep, Tre. On YOUR side. And take a shower first, you smell like a ballpark.']
  ], go: 'wed_intro' },

  tue_home: { bg: 'apartment', music: 'theme', loc: ['Home', 'Bed-Stuy · 6:30 PM'], lines: [
    ['sys', '', 'Ten seconds earlier, at the store. Directly in front of Big Mike.'],
    ['tre', 'nervous', '(fake cough) Mike, I got the... the thing. The bubonic.'],
    ['mike', 'mike', 'You were fine thirty seconds ago!'],
    ['tre', 'smug', 'It\'s fast-acting, Mike. Gotta go. Contagious.'],
    ['sys', '', 'Later, on the couch. The couch is also the dining room.'],
    ['jada', 'happy', 'You came home! Ugh, I love you. Put your feet up. Want a snack? I\'ll even let you hold the remote.'],
    ['tre', 'laugh', 'The REMOTE? Girl, are you proposing?'],
    ['jada', 'flirty', 'Watch the show. And if you\'re good, you get a bonus episode later. No commercials.']
  ], go: 'wed_intro' },

  // ───────────────────────── WEDNESDAY — THE LIKE ─────────────────────────
  wed_intro: { day: 'WEDNESDAY', bg: 'bed', music: 'tense', loc: ['The Bedroom', 'Bed-Stuy · 7:12 AM'], lines: [
    ['sys', '', 'WEDNESDAY · 7:12 AM. Tre\'s phone lights up on the nightstand.'],
    ['jada', 'sideeye', 'Who is "Tiffany High School"?'],
    ['tre', 'shocked', 'Who is WHAT?'],
    ['jada', 'mad', '"Tiffany High School liked your photo." From 2017. At 3 AM. Why the fuck is a woman from your PAST doing archaeology on your page at three in the morning?'],
    ['tre', 'nervous', 'I don\'t even remember a Tiffany. There were like nine Tiffanys. It was a whole Tiffany era.'],
    ['jada', 'dramatic', 'A whole ERA?'],
    ['tre', 'annoyed', 'And let\'s be clear. You don\'t even post me. Eight months, Jada. On your page I am a HAND. I\'m soft launched. I\'m a rumor.'],
    ['jada', 'sideeye', 'Don\'t change the subject. The hand is a CHOICE. We\'re talking about Tiffany.']
  ], choice: { q: 'Jada is holding your phone like evidence.', secs: 14, def: 1, opts: [
    { t: 'Explain calmly and show her the DMs (there are none)', fx: { mood: 5, trust: 15, sanity: -5 }, set: { explained: 1 }, go: 'wed_explain' },
    { t: 'Delete Instagram right in front of her', fx: { mood: 10, trust: -5, sanity: -10 }, set: { deletedIG: 1 }, go: 'wed_delete' },
    { t: 'Flip it: "Let\'s talk about Marcus."', fx: { mood: -20, trust: -15, sanity: 5 }, set: { counter: 1, marcus: 1 }, go: 'wed_counter' }
  ] } },

  wed_explain: { bg: 'bed', music: 'tense', lines: [
    ['tre', 'neutral', 'Look. Open the DMs. Nothing. Just a guy from my old job asking if I still have his drill.'],
    ['jada', 'sideeye', '...Do you still have his drill?'],
    ['tre', 'nervous', 'That\'s a separate investigation.'],
    ['jada', 'laugh', 'Okay. Fine. But if Tiffany likes ONE more thing, I\'m commenting "who the fuck is this" with my whole chest.']
  ], go: 'wed_chat' },

  wed_delete: { bg: 'bed', music: 'tense', lines: [
    ['tre', 'smug', 'Watch this. Delete. Gone. No more Instagram. I\'m a free man.'],
    ['jada', 'shocked', 'Wait, you had pictures of ME on there! Our anniversary post had four hundred likes!'],
    ['tre', 'defeated', 'They\'re in a better place now.'],
    ['jada', 'happy', 'Honestly? That was kind of hot. Stupid as hell. But hot. Come back to bed.']
  ], go: 'wed_chat' },

  wed_counter: { bg: 'bed', music: 'tense', lines: [
    ['tre', 'smug', 'Oh, we\'re doing this? Let\'s talk about MARCUS. Gym Friend Marcus. Fire-emoji-on-your-gym-selfie Marcus.'],
    ['jada', 'mad', 'Marcus is a family friend!'],
    ['tre', 'annoyed', 'Saturday he was a gym friend. Now he\'s a FAMILY friend? He got promoted?'],
    ['jada', 'dramatic', 'He drinks protein out of a gallon jug, Tre! He\'s basically a horse! Are you jealous of a HORSE?'],
    ['marcus', 'marcus', '(text) hey jada, still on for leg day? 💪'],
    ['tre', 'shocked', 'LEG DAY? Whose legs, Jada?!']
  ], go: 'wed_chat' },

  wed_chat: { bg: 'work', music: 'work', loc: ['Big Mike\'s Mattress Kingdom', 'Flatbush Ave · the break room'], lines: [
    ['sys', '', 'Later, on break. Three group chats explode at once.'],
    ['mike', 'mike', 'Look who\'s back from the plague. Nice tan for a dying man, Tre.', 'skipped'],
    ['deshawn', 'deshawn', 'Bro, your phone is vibrating so hard it\'s doing a lap around the break room.', '', { shot: 'w_buzz' }],
    ['tre', 'defeated', 'The Boys chat, Jada\'s family chat, and some chat called "Kiki\'s Birthday Planning (NO MEN)". Why am I in a no-men chat?'],
    ['deshawn', 'deshawn', 'Because you the one paying. Whatever you do, do NOT send the wrong message in the wrong chat. That\'s how my uncle got divorced. Twice. Same wife.', '', { shot: '-' }]
  ], mini: { game: 'chat', go: 'thu_intro' } },

  // ───────────────────────── THURSDAY — FOR THE GRAM, THEN THE MALL ─────────────────────────
  thu_intro: { day: 'THURSDAY', bg: 'dumbo', music: 'mall', loc: ['DUMBO', 'Washington St · the bridge shot · golden hour'], lines: [
    ['sys', '', 'THURSDAY · DUMBO. The bridge shot. Four hundred people are taking the same picture.'],
    ['jada', 'happy', 'Okay, so I booked us at Gilded tomorrow night. The place in Williamsburg with the gold steak. And I have NOTHING to wear.'],
    ['tre', 'shocked', 'The GOLD steak? They wrap a steak in GOLD, Jada. That\'s not food, that\'s jewelry.'],
    ['jada', 'flirty', 'So I need a dress that matches the jewelry. But first, pictures. The light is PERFECT. You\'re my photographer.'],
    ['tre', 'nervous', 'Your photographer? Is that a promotion from "hand"?'],
    ['jada', 'sideeye', 'Get the bridge, get my good side, and do NOT get that man on the scooter. Go.']
  ], mini: { game: 'gram', go: 'thu_gram' } },

  thu_gram: { bg: 'dumbo', music: 'mall', lines: [
    ['jada', 'happy', 'Oh, these are GOOD. Babe. You got my angles. You studied.', 'gramShots>=4'],
    ['jada', 'mad', 'Tre, every picture has a pigeon in it. EVERY picture. Did you hire the pigeon?', 'gramShots<4'],
    ['tre', 'annoyed', 'Jada, we been here forty minutes. I haven\'t seen the bridge. I\'ve seen your phone. Are we hanging out or is this a shoot for the gram?'],
    ['jada', 'dramatic', 'It\'s BOTH, Tre! Memories are content! Content is memories!'],
    ['tre', 'neutral', 'Then post me. Hard launch. Face and everything.'],
    ['jada', 'flirty', 'Mm. We\'ll see. Earn it. Come on, the mall closes at nine.']
  ], go: 'thu_post' },

  thu_post: { bg: 'mall', music: 'mall', cut: 'softlaunch', loc: ['Kings Galleria', 'Downtown Brooklyn · "I\'m just looking"'], lines: [
    ['sys', '', 'Downtown Brooklyn. The mall. Jada posted on the way. Tre is, once again, a hand.', 'gramShots>=4'],
    ['sys', '', 'Downtown Brooklyn. The mall. Jada posted on the way. Tre is not in it at all.', 'gramShots<4'],
    ['tre', 'defeated', 'Eight months. I\'m a hand. My hand has a following now. My hand is more famous than me.'],
    ['jada', 'happy', 'And you LOVE that hand. Come on. Carry my bag. Just the one. I\'m just looking.'],
    ['tre', 'annoyed', 'You said that last time and we left with a dog.'],
    ['jada', 'laugh', 'And you LOVE Biscuit.'],
    ['tre', 'neutral', 'Biscuit bit me on my ass.'],
    ['jada', 'mad', 'Oh, and Kiki showed me the screenshots, by the way. ALL of them. We\'ll talk.', 'chatWrong>=3']
  ], choice: { q: '"Just the one bag." How does Tre survive the mall?', secs: 14, def: 0, opts: [
    { t: 'Carry the bags like a man (play Mall Mayhem)', fx: {}, set: { carried: 1 }, go: 'thu_mall' },
    { t: 'Hide in the food court with Deshawn', fx: { mood: -15, sanity: 15, wallet: -25 }, set: { hidMall: 1 }, go: 'thu_hide' },
    { t: 'Pretend you got paged for a "mattress emergency"', fx: { mood: -10, trust: -10, sanity: 10 }, set: { paged: 1 }, go: 'thu_paged' }
  ] } },

  thu_mall: { bg: 'mall', music: 'mall', lines: [
    ['jada', 'happy', 'Okay, ONE stop for the dress. Then maybe the makeup place. Then maybe the one with the candles. Then pretzels. Pretzels don\'t count.'],
    ['tre', 'defeated', 'Lord, if you\'re listening, please let her card decline. Amen. Shit. Sorry. Amen.', '', { shot: 'm_bags' }]
  ], mini: { game: 'mall', go: 'thu_after' } },

  thu_hide: { bg: 'mall', music: 'mall', lines: [
    ['deshawn', 'deshawn', 'Welcome to the Husband Daycare. My girl\'s been in the makeup store since Tuesday. We got Wi-Fi, a charger, and a guy named Ray who\'s been here since 2022.'],
    ['tre', 'laugh', 'Is Ray okay?'],
    ['deshawn', 'deshawn', 'Ray\'s wife is "just looking." Ray will never be okay.'],
    ['jada', 'mad', '(text) WHERE THE HELL ARE YOU. I needed an opinion on two dresses that are THE SAME DRESS.']
  ], go: 'thu_after' },

  thu_paged: { bg: 'mall', music: 'mall', lines: [
    ['tre', 'shocked', 'Oh no. Babe. Mattress emergency. Somebody\'s... springs... sprung.'],
    ['jada', 'sideeye', 'There\'s no such thing as a mattress emergency.'],
    ['tre', 'nervous', 'Tell that to the springs, Jada!'],
    ['jada', 'dramatic', 'Fine. Go. I\'ll just shop ALONE. With YOUR card. Which you left in my purse. Bye.']
  ], fx: { wallet: -260 }, go: 'thu_after' },

  thu_after: { bg: 'apartment', music: 'theme', loc: ['Home', 'Bed-Stuy · Thursday night'], lines: [
    ['sys', '', 'Thursday night. Tre checks his bank app with one eye closed.'],
    ['tre', 'defeated', 'Okay. I still have rent. And a little bit of "just in case" money. Just in case of Jada.', 'wallet>=1650'],
    ['tre', 'shocked', 'The bank app just asked me if I\'m okay. Rent is Sunday. The APP is worried about me.', 'wallet<1650'],
    ['jada', 'happy', 'Okay, the dress is perfect. Burgundy. Satin. You\'re gonna lose your mind.'],
    ['jada', 'sideeye', 'Even though SOMEBODY dropped half my bags in front of the whole mall.', 'bagsDropped>=4'],
    ['tre', 'nervous', 'I already lost my mind, Jada. And my money. The dress can have whatever\'s left.']
  ], go: 'fri_intro' },

  // ───────────────────────── FRIDAY — DATE NIGHT ─────────────────────────
  fri_intro: { day: 'FRIDAY', bg: 'restaurant', music: 'date', loc: ['Gilded', 'Williamsburg · no prices on the menu'], lines: [
    ['sys', '', 'FRIDAY · Gilded, Williamsburg. A waiter in a velvet blazer hands Tre a menu with no prices on it.'],
    ['tre', 'nervous', 'Why are there no prices? Babe, why are there no prices? That\'s a menu making a threat. This menu is pressing me.', '', { shot: 'r_menu' }],
    ['jada', 'happy', 'Because if you have to ask, you can\'t afford it!'],
    ['tre', 'defeated', 'I\'m ASKING, Jada! I\'m asking with my whole broke ass!'],
    ['jada', 'flirty', 'Look at you in a button-up. Mm. You clean up nice. Order something fun, and maybe dessert is at home.', '', { shot: '-' }]
  ], choice: { q: 'The menu has no prices. What does Tre order?', secs: 14, def: 0, opts: [
    { t: 'Survive the bill (play Date Night)', fx: {}, set: { dateNight: 1 }, go: 'fri_date' },
    { t: '"I\'m not hungry, I ate earlier."', fx: { mood: -10, wallet: -175, sanity: -5 }, set: { notHungry: 1 }, go: 'fri_nothungry' }
  ] } },

  fri_date: { bg: 'restaurant', music: 'date', lines: [
    ['jada', 'happy', 'Okay, the gold steak, the truffle fries, and whatever has a sparkler in it.'],
    ['tre', 'defeated', 'Spin the wheel, baby. Spin it.']
  ], mini: { game: 'date', go: 'fri_after' } },

  fri_nothungry: { bg: 'restaurant', music: 'date', lines: [
    ['tre', 'neutral', 'I\'m good, I ate earlier. I\'ll just have water.'],
    ['jada', 'sideeye', 'You ate a gas station hot dog at 3 PM, Tre.'],
    ['tre', 'smug', 'And that bitch is still working.'],
    ['sys', '', 'The water is $16. It\'s from a glacier. The glacier has a publicist.'],
    ['jada', 'mad', 'You\'re eating my fries with your eyes. I can FEEL it.']
  ], go: 'fri_after' },

  fri_after: { bg: 'apartment', music: 'theme', loc: ['Home', 'Bed-Stuy · 11:48 PM'], lines: [
    ['sys', '', 'Friday, 11:48 PM. Jada\'s phone buzzes.'],
    ['jada', 'shocked', 'Oh no. My mama\'s coming over tomorrow. For dinner. She said, quote, "I want to meet this Tre properly."'],
    ['tre', 'shocked', 'PROPERLY? I met her at your cousin\'s cookout! She called me "the one in the hoodie" for two hours!'],
    ['jada', 'laugh', 'That was a compliment, babe. She called my last boyfriend "the problem."'],
    ['tre', 'nervous', 'Wait. Is your last boyfriend... Marcus?', 'marcus'],
    ['jada', 'sideeye', 'Go to sleep, Tre.', 'marcus'],
    ['jada', 'flirty', 'Wear something with a collar. She respects a collar.']
  ], go: 'sat_intro' },

  // ───────────────────────── SATURDAY — HER MAMA ─────────────────────────
  sat_intro: { day: 'SATURDAY', bg: 'kitchen', music: 'theme', cut: 'brenda', loc: ['Home', 'Bed-Stuy · 6:00 PM · Ms. Brenda has arrived'], lines: [
    ['sys', '', 'SATURDAY · Ms. Brenda has arrived. She brought her own casserole. And her own chair.'],
    ['brenda', 'brenda', 'So. You\'re the Tre. Nice collar.'],
    ['tre', 'nervous', 'Yes ma\'am. The one and only. Well, there\'s a Tre at my job, but he\'s in sales, so.'],
    ['brenda', 'brenda', 'Kiki told me you paid for six grown women\'s brunch. You rich, or you just slow?', 'paidBrunch'],
    ['brenda', 'brenda', 'Kiki told me you sent her a bill at brunch. In public. Bold. Stupid, but bold.', 'splitBrunch'],
    ['brenda', 'brenda', 'Kiki told me you ran out of a restaurant and left a shoe. You find it?', 'fakeCall'],
    ['brenda', 'brenda', 'And I saw the picture. My daughter dating a HAND now? Where\'s your face, baby? Is it in witness protection?'],
    ['brenda', 'brenda', 'And what are your intentions with my baby? Besides eating all her groceries.'],
    ['jada', 'laugh', 'Mama!'],
    ['brenda', 'brenda', 'I\'m asking a question. Now taste my famous potato salad and tell me the truth. My pastor\'s wife says it needs more relish. That heifer.', '', { shot: 'k_raisins' }]
  ], choice: { q: 'Ms. Brenda\'s potato salad has raisins in it.', secs: 14, def: 0, opts: [
    { t: 'Lie with your whole chest: "Best I ever had"', fx: { mood: 10, trust: 5, sanity: -10 }, set: { mamaLove: 1 }, go: 'sat_lie' },
    { t: 'Be honest: "Ma\'am... are those raisins?"', fx: { mood: -15, trust: 10 }, set: { honest: 1 }, go: 'sat_honest' },
    { t: 'Hide in the bathroom until she leaves', fx: { mood: -20, sanity: 10, trust: -5 }, set: { hidMama: 1 }, go: 'sat_hide' }
  ] } },

  sat_lie: { bg: 'kitchen', music: 'theme', lines: [
    ['tre', 'smug', 'Ms. Brenda. This is the best potato salad I\'ve ever had. The raisins are... bold. Brave. Visionary.'],
    ['brenda', 'brenda', 'Mm-hm. I knew she was a hater. Jada, he can stay.'],
    ['jada', 'happy', 'She likes you! She NEVER likes anybody!'],
    ['tre', 'defeated', '(whispering) I\'m going to taste those raisins for the rest of my life.']
  ], go: 'sun_intro' },

  sat_honest: { bg: 'kitchen', music: 'theme', lines: [
    ['tre', 'neutral', 'With respect, ma\'am... are those raisins?'],
    ['brenda', 'brenda', 'They are cranberries. Craisins. A HEALTHY choice.'],
    ['tre', 'nervous', 'In potato salad, though?'],
    ['brenda', 'brenda', 'Jada. Get my chair. We\'re leaving.'],
    ['jada', 'mad', 'TRE! It took her four years to come over here!'],
    ['brenda', 'brenda', '...He\'s honest, though. Your daddy never told me the truth about nothing. Fine. I\'ll stay for dessert.']
  ], go: 'sun_intro' },

  sat_hide: { bg: 'kitchen', music: 'theme', lines: [
    ['sys', '', 'Forty-five minutes in the bathroom. The bathroom is also next to the stove. Tre learns every scent of every candle.'],
    ['brenda', 'brenda', '(through the door) Baby, is he sick or is he scared?'],
    ['jada', 'mad', 'He\'s SCARED, Mama.'],
    ['brenda', 'brenda', 'Mm. Your daddy hid in a bathroom too. For eleven years.']
  ], go: 'sun_intro' },

  // ───────────────────────── SUNDAY — RENT, THEN THE TALK ─────────────────────────
  sun_intro: { day: 'SUNDAY', bg: 'apartment', music: 'tense', cut: 'rent', fx: { wallet: -1350 }, loc: ['Home', 'Bed-Stuy · 9:00 PM'], lines: [
    ['sys', '', 'SUNDAY · Rent went out at 9 AM. At 9:00 PM, Jada turns off the TV. That\'s never good.'],
    ['jada', 'neutral', 'Babe. Can we talk?'],
    ['tre', 'shocked', 'Oh shit. Every man in America just felt that. Somewhere, Deshawn felt that.'],
    ['jada', 'neutral', 'I\'ve been thinking about this week. All of it. I made a list.'],
    ['tre', 'nervous', 'A LIST?'],
    ['jada', 'happy', 'Monday you paid for the whole brunch. Kiki still talks about it.', 'paidBrunch'],
    ['jada', 'mad', 'Monday you sent my best friend a Venmo request at brunch.', 'splitBrunch'],
    ['jada', 'sideeye', 'Monday you faked a call from your dead grandma and left a shoe.', 'fakeCall'],
    ['jada', 'laugh', 'And you shut Kiki all the way up about the "man pays for everything" thing. She\'s still mad. I loved it.', 'takesWon'],
    ['jada', 'sideeye', 'Tuesday you chose mattresses over me. Which, fine. Somebody has to pay for brunch.', 'double'],
    ['jada', 'flirty', 'Tuesday you came home. You gave the bubonic plague to Big Mike for me. That was sweet.', 'skipped'],
    ['jada', 'happy', 'Wednesday you showed me your DMs. No drama. I noticed that.', 'explained'],
    ['jada', 'laugh', 'Wednesday you deleted Instagram for me. Dumb. But I noticed.', 'deletedIG'],
    ['jada', 'mad', 'And Wednesday you made Marcus a whole thing.', 'counter'],
    ['jada', 'mad', 'And Kiki has screenshots of your group chats. Plural.', 'chatWrong>=3'],
    ['jada', 'happy', 'Thursday you took my pictures. And you actually got my good side. I noticed THAT too.', 'gramShots>=4'],
    ['jada', 'happy', 'Thursday you carried every bag in that mall. Like a pack mule. A sexy pack mule.', 'carried'],
    ['jada', 'mad', 'Thursday you hid in a food court with Deshawn while I tried on dresses alone.', 'hidMall'],
    ['jada', 'sideeye', 'Thursday you got "paged." For a mattress emergency. Which isn\'t real.', 'paged'],
    ['jada', 'happy', 'Friday you didn\'t even blink at the bill.', 'dateNight&wallet>=100&declined<1'],
    ['jada', 'dramatic', 'Friday your card got declined in front of a violinist. He stopped PLAYING, Tre.', 'declined>=1'],
    ['jada', 'sideeye', 'Friday you ate my fries with your eyes.', 'notHungry'],
    ['jada', 'happy', 'And yesterday you lied to my mama\'s face about raisins. For me. That\'s love.', 'mamaLove'],
    ['jada', 'neutral', 'And yesterday you told my mama the truth. She respects you now. It\'s terrifying.', 'honest'],
    ['jada', 'mad', 'And yesterday you hid in the bathroom for forty-five minutes.', 'hidMama'],
    ['tre', 'defeated', 'So... what\'s the verdict?']
  ], go: 'ENDING' },

  // ───────────────────────── ENDINGS ─────────────────────────
  end_wifed: { bg: 'stadium', music: 'win', loc: ['The Arena', 'Downtown Brooklyn · one week later'], end: { title: 'WIFED UP', rank: 'S', blurb: 'Kiss Cam. Jumbotron. One knee. Nineteen thousand people watching. Hard launched.' }, lines: [
    ['jada', 'happy', 'The verdict? You showed up. All week. That\'s the whole list.'],
    ['tre', 'smug', 'Funny you say that.'],
    ['sys', '', 'One week later. The arena. The Kiss Cam lands on them. Tre gets down on one knee.'],
    ['jada', 'shocked', 'TRE! On the JUMBOTRON?'],
    ['tre', 'nervous', 'Jada... will you—'],
    ['jada', 'flirty', '...Let me think about it. I\'m playing! Yes! YES! Kiki, are you filming?!'],
    ['tre', 'laugh', 'Nineteen thousand people just saw my face. Not my hand. My FACE. I\'m HARD LAUNCHED, baby!']
  ] },

  end_broke_happy: { bg: 'rooftop', music: 'win', loc: ['The Roof', 'Bed-Stuy · the whole skyline for free'], end: { title: 'BROKE BUT HAPPY', rank: 'A', blurb: 'Zero dollars. One rooftop. The whole Manhattan skyline for free. Best night of the year.' }, lines: [
    ['jada', 'neutral', 'You spent every dollar on me this week. You\'re broke, aren\'t you?'],
    ['tre', 'defeated', 'I have eleven cents and a coupon for a free side of coleslaw.'],
    ['sys', '', 'The roof of the building. Two lawn chairs. Two cups of shrimp ramen. The skyline, for free.'],
    ['jada', 'laugh', 'This is the most romantic thing you\'ve ever done and it cost you a dollar ten.'],
    ['tre', 'laugh', 'Ninety cents. The coleslaw coupon came through.']
  ] },

  end_speedrun: { bg: 'apartment', music: 'sad', end: { title: 'SUGAR DADDY SPEEDRUN', rank: 'D', blurb: 'Couldn\'t cover rent in Brooklyn in under a week. A new personal record.' }, lines: [
    ['tre', 'defeated', 'Babe. I gotta be honest. Rent went through and now my bank account is negative. The landlord sent another smiley face.'],
    ['jada', 'shocked', 'Negative? How the fuck do you spend money you DON\'T HAVE?'],
    ['tre', 'annoyed', 'Brunch, Jada. Six women and a lobster waffle.', 'paidBrunch'],
    ['tre', 'annoyed', 'The mall, Jada. You were "just looking" at four stores.', 'carried|paged'],
    ['tre', 'annoyed', 'And a steak wrapped in jewelry.', 'dateNight'],
    ['jada', 'sideeye', 'So... is this a bad time to tell you Kiki\'s birthday is next weekend? In Miami?']
  ] },

  end_snapped: { bg: 'cabin', music: 'sad', loc: ['A Cabin', 'Upstate · no Wi-Fi · no brunch'], end: { title: 'HE SNAPPED', rank: 'C', blurb: 'Tre moved upstate. He fishes now. The fish don\'t ask about brunch.' }, lines: [
    ['tre', 'annoyed', 'Jada. I love you. But I\'m tired. I\'m tired as shit, Jada.'],
    ['sys', '', 'Three weeks later. A cabin upstate. No Wi-Fi. No brunch. A lake.'],
    ['tre', 'neutral', 'Me and the fish have an understanding. The fish don\'t want a lobster waffle. The fish just want a worm.'],
    ['deshawn', 'deshawn', '(on a crackling phone) Bro, Jada says come home, she misses you. Also Big Mike wants his hot dogs back.']
  ] },

  end_couch: { bg: 'apartment', music: 'sad', end: { title: 'THE COUCH', rank: 'C', blurb: 'You live on the couch now. In Brooklyn, the couch is also the dining room.' }, lines: [
    ['jada', 'mad', 'The verdict? This week was a hot-ass MESS, Tre. You were a mess. I was a little bit of a mess. But mostly you.'],
    ['tre', 'nervous', 'So... are we breaking up?'],
    ['jada', 'sideeye', 'No. But you\'re sleeping out here until you remember my love language.'],
    ['tre', 'defeated', 'Is it acts of service?'],
    ['jada', 'mad', 'It\'s RECEIPTS, Tre. My love language is RECEIPTS.']
  ] },

  end_read: { bg: 'bedroom', music: 'sad', end: { title: 'LEFT ON READ', rank: 'D', blurb: 'She moved on. So did her group chat. And her mama.' }, lines: [
    ['jada', 'neutral', 'The verdict? I don\'t trust you, Tre. And without trust, what are we even doing?'],
    ['tre', 'shocked', 'Watching our show? Eating snacks? Building a life?'],
    ['sys', '', 'Monday morning. Tre texts "good morning beautiful." Read 7:02 AM.'],
    ['tre', 'defeated', 'Read at 7:02. No reply. The silence is so loud I can hear it in my teeth.']
  ] },

  end_marcus: { bg: 'apartment', music: 'sad', end: { title: 'HER EX WINS', rank: 'F', blurb: 'The gym friend. The family friend. The ex. Same guy. Leg day, every day.' }, lines: [
    ['jada', 'neutral', 'You want the truth? Marcus is my ex. And you know what? He never once accused me of anything.'],
    ['tre', 'shocked', 'MARCUS? Gym Friend Marcus? FAMILY Friend Marcus?'],
    ['marcus', 'marcus', '(at the door, holding a gallon of protein shake) Ready, babe?'],
    ['tre', 'annoyed', 'Bro, you\'re drinking out of a jug like a damn horse.'],
    ['marcus', 'marcus', 'And she loves it. Leg day. Every day.']
  ] },

  end_twist: { bg: 'apartment', music: 'sad', end: { title: 'PLOT TWIST', rank: 'B', blurb: 'It was you. You were the problem the whole time.' }, lines: [
    ['jada', 'neutral', 'The verdict? Pull up your screen time.'],
    ['tre', 'nervous', 'Why?'],
    ['jada', 'mad', 'Eleven hours on Instagram. You came for ME about Marcus while YOU watched three hundred reels of women doing yoga.'],
    ['tre', 'defeated', '...They were teaching me balance, Jada.']
  ] },

  end_barely: { bg: 'apartment', music: 'theme', end: { title: 'STILL TOGETHER (BARELY)', rank: 'B', blurb: 'You survived the week. And Brooklyn rent. Next week: a birthday trip to Miami. To be continued...' }, lines: [
    ['jada', 'neutral', 'The verdict? This week was a lot. But you\'re still here, and I\'m still here, so.'],
    ['tre', 'neutral', 'So we good?'],
    ['jada', 'flirty', 'We\'re good. Come here. Turn the TV back on. Bonus episode.'],
    ['tre', 'laugh', 'The bonus episode! I\'ve been waiting all week!'],
    ['jada', 'sideeye', 'Also Kiki\'s birthday is in Miami next weekend and you\'re paying for the Airbnb.']
  ] }
  }
};

/* Line conditions: 'flag', '!flag', 'meter<n', 'flag>=n', joined with '&' (all) or '|' (any). */
window.TJ_COND = function (cond, m, f) {
  if (!cond) return true;
  function one(c) {
    c = c.trim(); var neg = c[0] === '!'; if (neg) c = c.slice(1);
    var mt = c.match(/^(\w+)\s*(>=|<=|>|<|==)\s*(-?\d+)$/), r;
    if (mt) { var v = (mt[1] in m ? m[mt[1]] : f[mt[1]]) || 0, n = +mt[3]; r = mt[2] === '>=' ? v >= n : mt[2] === '<=' ? v <= n : mt[2] === '>' ? v > n : mt[2] === '<' ? v < n : v === n; }
    else r = !!f[c];
    return neg ? !r : r;
  }
  if (cond.indexOf('|') >= 0) return cond.split('|').some(one);
  return cond.split('&').every(one);
};

/* Which ending Sunday lands on (after rent has gone out). Order matters — first match wins. */
window.TJ_ENDING = function (m, f) {
  if (m.sanity <= 0) return 'end_snapped';
  if (m.wallet <= 0 && m.mood >= 60) return 'end_broke_happy';
  if (m.wallet <= 0) return 'end_speedrun';
  if (f.counter && f.marcus && m.trust < 40) return 'end_marcus';
  if (f.counter && m.trust < 55) return 'end_twist';
  if (m.trust < 30) return 'end_read';
  if (m.mood >= 80 && m.trust >= 60) return 'end_wifed';
  if (m.mood < 40) return 'end_couch';
  return 'end_barely';
};
