/* Tre & Jada — Episode 1: "Payday". 18+ adult comedy. Original characters (ContentPad).
   Node format:
     id: { day, bg, music, lines:[[who, expr, text]], choice:{ q, secs, def, opts:[{ t, fx, set, go }] },
           mini:{ game, go }, go, end }
   who: tre | jada | mike | brenda | marcus | kiki | deshawn | sys (on-screen caption, not voiced)
   fx: meter deltas { mood, wallet, sanity, trust }. set: story flags. */
window.TJ_SCRIPT = {
  title: 'Tre & Jada',
  episode: 'Episode 1 — Payday',
  start: { mood: 60, wallet: 600, sanity: 70, trust: 55 },
  first: 'mon_intro',
  nodes: {

  // ───────────────────────── MONDAY — BRUNCH ─────────────────────────
  mon_intro: { day: 'MONDAY', bg: 'apartment', music: 'theme', lines: [
    ['sys', '', 'MONDAY · Payday. $600 hit the account at 6:02 AM.'],
    ['tre', 'smug', 'Six hundred dollars. Look at me. I\'m a whole-ass hedge fund.'],
    ['jada', 'happy', 'Babe! Brunch. Today. Just us. You and me, bottomless mimosas, no phones.'],
    ['tre', 'neutral', 'Just us?'],
    ['jada', 'flirty', 'Just us. I swear on my edges.'],
    ['tre', 'nervous', 'You swore on your edges last time and your cousin moved in for three damn weeks.']
  ], go: 'mon_brunch' },

  mon_brunch: { bg: 'brunch', music: 'brunch', lines: [
    ['sys', '', 'Velvet Mimosa · 11:30 AM'],
    ['tre', 'neutral', 'Okay, this is nice. Table for two, right?'],
    ['kiki', 'friends', 'SURPRIIIISE! Jada said you were treating!'],
    ['tre', 'shocked', 'I\'m sorry, Jada said the FUCK?'],
    ['jada', 'laugh', 'I said you were treating ME. They heard what they wanted to hear.'],
    ['kiki', 'friends', 'Waiter! Six bottomless, the lobster waffle, and whatever\'s on fire over there.'],
    ['tre', 'annoyed', 'That\'s a candle, Kiki.'],
    ['kiki', 'friends', 'Then bring me two.'],
    ['sys', '', 'Ninety minutes later. The bill arrives. $418.37.'],
    ['jada', 'flirty', 'Baaabe. The waiter\'s looking at you.'],
    ['tre', 'defeated', 'Why the hell is the waiter looking at me like he\'s seen my credit score?']
  ], choice: { q: 'The bill is $418.37. What does Tre do?', secs: 9, def: 2, opts: [
    { t: 'Pay for everybody like a king', fx: { mood: 15, wallet: -418, sanity: -10 }, set: { paidBrunch: 1 }, go: 'mon_pay' },
    { t: 'Split it six ways, publicly', fx: { mood: -15, wallet: -70, trust: -5 }, go: 'mon_split' },
    { t: 'Fake an emergency phone call', fx: { mood: -10, wallet: 0, sanity: 5, trust: -10 }, set: { fakeCall: 1 }, go: 'mon_fake' }
  ] } },

  mon_pay: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'smug', 'Put it all on me. Every waffle. Every candle.'],
    ['kiki', 'friends', 'Okaaay, Tre! Jada, he a real one. Keep him.'],
    ['jada', 'happy', 'See? THAT\'S my man. Y\'all hate to see it.'],
    ['tre', 'defeated', '(whispering) There goes my car insurance. There goes my dignity. There goes my whole damn will to live.'],
    ['jada', 'flirty', 'Baby, you are getting SO taken care of tonight. Like... thoroughly.'],
    ['tre', 'neutral', '...Okay. Four hundred dollars of worth it. I\'ma need a receipt for tonight too.']
  ], go: 'tue_intro' },

  mon_split: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'neutral', 'So it\'s seventy each, and Kiki, you owe an extra nine for the candles.'],
    ['kiki', 'friends', 'A Venmo request? At BRUNCH? In front of GOD and these damn mimosas?'],
    ['jada', 'mad', 'Tre. You just embarrassed the shit out of me in front of the whole group chat. They\'re typing about it RIGHT NOW.'],
    ['tre', 'annoyed', 'Good. Tell them the lobster waffle wasn\'t free either.'],
    ['jada', 'sideeye', 'Oh, you can sleep on the couch with that math. And keep your hands to yourself, \'cause tonight I damn sure am.']
  ], go: 'tue_intro' },

  mon_fake: { bg: 'brunch', music: 'brunch', lines: [
    ['tre', 'shocked', '(into phone) Hello? Grandma? You fell WHERE? Into the WHAT?'],
    ['jada', 'sideeye', 'Your grandma died in 2019, Tre.'],
    ['tre', 'nervous', '(still on phone) ...and she\'s STILL falling, that\'s how serious this is.'],
    ['kiki', 'friends', 'He ran. Girl, he RAN. That motherfucker left a shoe.'],
    ['jada', 'dramatic', 'I\'m paying for brunch with my emergency lash money. I\'ll never forget this.']
  ], go: 'tue_intro' },

  // ───────────────────────── TUESDAY — WORK ─────────────────────────
  tue_intro: { day: 'TUESDAY', bg: 'work', music: 'work', lines: [
    ['sys', '', 'TUESDAY · Big Mike\'s Mattress Kingdom'],
    ['mike', 'mike', 'TRE! My guy! My son! My favorite employee who is about to do me a favor.'],
    ['tre', 'annoyed', 'Hell no.'],
    ['mike', 'mike', 'Double shift. Tonight. Mattress Madness Midnight Sale. Time and a half and all the hot dogs you can carry.'],
    ['deshawn', 'deshawn', 'Bro, take it. Hot dogs are a currency. I\'m basically rich off hot dogs.'],
    ['tre', 'neutral', 'Jada wanted to watch our show tonight. She said if I miss another episode it\'s "a pattern."'],
    ['deshawn', 'deshawn', 'Women love a man with a work ethic. Trust me. I\'m single for completely unrelated reasons.']
  ], choice: { q: 'Big Mike needs a double shift tonight.', secs: 8, def: 0, opts: [
    { t: 'Take the double (play The Shift)', fx: { mood: -10, sanity: -10 }, set: { double: 1 }, go: 'tue_shift' },
    { t: 'Call in "sick" and go home to Jada', fx: { mood: 15, wallet: -40, trust: 5 }, go: 'tue_home' }
  ] } },

  tue_shift: { bg: 'work', music: 'work', lines: [
    ['mike', 'mike', 'That\'s my boy! Sell those mattresses like your rent depends on it.'],
    ['tre', 'defeated', 'My rent DOES depend on it, Mike. That\'s the fucked up part.'],
    ['mike', 'mike', 'Exactly. Motivation!']
  ], mini: { game: 'shift', go: 'tue_after_shift' } },

  tue_after_shift: { bg: 'apartment', music: 'theme', lines: [
    ['sys', '', '1:14 AM. Tre gets home smelling like hot dogs and memory foam.'],
    ['jada', 'sideeye', 'Oh, so you DO live here.'],
    ['tre', 'nervous', 'Baby, I was making money. For us. For our future. For your brunches.'],
    ['jada', 'dramatic', 'I watched the season finale ALONE, Tre. Do you know who died? You don\'t. Because you were selling a Cloud Nine pillow-top to a stranger.'],
    ['tre', 'neutral', 'I sold four, actually.']
  ], go: 'wed_intro' },

  tue_home: { bg: 'apartment', music: 'theme', lines: [
    ['tre', 'nervous', '(fake cough) Mike, I got the... the thing. The bubonic.'],
    ['mike', 'mike', 'You were fine thirty seconds ago!'],
    ['tre', 'smug', 'It\'s fast-acting, Mike. Gotta go. Contagious.'],
    ['sys', '', 'Later, on the couch.'],
    ['jada', 'happy', 'You came home! Ugh, I love you. Put your feet up. Want a snack? I\'ll even let you hold the remote.'],
    ['tre', 'laugh', 'The REMOTE? Girl, are you proposing?'],
    ['jada', 'flirty', 'Watch the show. And if you\'re good, you get a bonus episode later. No commercials.']
  ], go: 'wed_intro' },

  // ───────────────────────── WEDNESDAY — THE LIKE ─────────────────────────
  wed_intro: { day: 'WEDNESDAY', bg: 'bedroom', music: 'tense', lines: [
    ['sys', '', 'WEDNESDAY · 7:12 AM. Tre\'s phone lights up on the nightstand.'],
    ['jada', 'sideeye', 'Who is "Tiffany High School"?'],
    ['tre', 'shocked', 'Who is WHAT?'],
    ['jada', 'mad', '"Tiffany High School liked your photo." From 2017. At 3 AM. Why the fuck is a woman from your PAST doing archaeology on your page at three in the morning?'],
    ['tre', 'nervous', 'I don\'t even remember a Tiffany. There were like nine Tiffanys. It was a whole Tiffany era.'],
    ['jada', 'dramatic', 'A whole ERA?']
  ], choice: { q: 'Jada is holding your phone like evidence.', secs: 8, def: 1, opts: [
    { t: 'Explain calmly and show her the DMs (there are none)', fx: { mood: 5, trust: 15, sanity: -5 }, go: 'wed_explain' },
    { t: 'Delete Instagram right in front of her', fx: { mood: 10, trust: -5, sanity: -10 }, set: { deletedIG: 1 }, go: 'wed_delete' },
    { t: 'Counter-accuse: "Who\'s Marcus liking YOUR stuff?"', fx: { mood: -20, trust: -15, sanity: 5 }, set: { counter: 1, marcus: 1 }, go: 'wed_counter' }
  ] } },

  wed_explain: { bg: 'bedroom', music: 'tense', lines: [
    ['tre', 'neutral', 'Look. Open the DMs. Nothing. Just a guy from my old job asking if I still have his drill.'],
    ['jada', 'sideeye', '...Do you still have his drill?'],
    ['tre', 'nervous', 'That\'s a separate investigation.'],
    ['jada', 'laugh', 'Okay. Fine. But if Tiffany likes ONE more thing, I\'m commenting "who the fuck is this" with my whole chest.']
  ], go: 'wed_chat' },

  wed_delete: { bg: 'bedroom', music: 'tense', lines: [
    ['tre', 'smug', 'Watch this. Delete. Gone. No more Instagram. I\'m a free man.'],
    ['jada', 'shocked', 'Wait, you had pictures of ME on there! Our anniversary post had four hundred likes!'],
    ['tre', 'defeated', 'They\'re in a better place now.'],
    ['jada', 'happy', 'Honestly? That was kind of hot. Stupid as hell. But hot. Bedroom. Now.']
  ], go: 'wed_chat' },

  wed_counter: { bg: 'bedroom', music: 'tense', lines: [
    ['tre', 'smug', 'Oh, we\'re doing this? Let\'s talk about MARCUS liking your gym selfie with the fire emoji.'],
    ['jada', 'mad', 'Marcus is a family friend!'],
    ['tre', 'annoyed', 'Marcus is your EX, who drinks protein shakes out of a gallon jug like a damn horse.'],
    ['jada', 'dramatic', 'Oh, so now we\'re jealous of HORSES?'],
    ['marcus', 'marcus', '(text) hey jada, still on for leg day? 💪'],
    ['tre', 'shocked', 'LEG DAY? Whose legs, Jada?!']
  ], go: 'wed_chat' },

  wed_chat: { bg: 'work', music: 'work', lines: [
    ['sys', '', 'Later, on break. Three group chats explode at once.'],
    ['deshawn', 'deshawn', 'Bro, your phone is vibrating so hard it\'s doing a lap around the break room.'],
    ['tre', 'defeated', 'The Boys chat, Jada\'s family chat, and some chat called "Kiki\'s Birthday Planning (NO MEN)". Why am I in a no-men chat?'],
    ['deshawn', 'deshawn', 'Whatever you do, do NOT send the wrong message in the wrong chat. That\'s how my uncle got divorced. Twice. Same wife.']
  ], mini: { game: 'chat', go: 'thu_intro' } },

  // ───────────────────────── THURSDAY — THE MALL ─────────────────────────
  thu_intro: { day: 'THURSDAY', bg: 'mall', music: 'mall', lines: [
    ['sys', '', 'THURSDAY · The mall. "I\'m just looking."'],
    ['jada', 'happy', 'I\'m just looking, babe. Window shopping. It\'s cardio for the soul.'],
    ['tre', 'annoyed', 'You said that last time and we left with a dog.'],
    ['jada', 'flirty', 'And you LOVE Biscuit.'],
    ['tre', 'neutral', 'Biscuit bit me on my ass.'],
    ['jada', 'laugh', 'Because you were acting brand new. Come on. Carry my bag. Just the one.']
  ], choice: { q: '"Just the one bag." How does Tre survive the mall?', secs: 8, def: 0, opts: [
    { t: 'Carry the bags like a man (play Mall Mayhem)', fx: {}, go: 'thu_mall' },
    { t: 'Hide in the food court with Deshawn', fx: { mood: -15, sanity: 15, wallet: -15 }, go: 'thu_hide' },
    { t: 'Pretend you got paged for a "mattress emergency"', fx: { mood: -10, trust: -10, sanity: 10 }, go: 'thu_paged' }
  ] } },

  thu_mall: { bg: 'mall', music: 'mall', lines: [
    ['jada', 'happy', 'Okay, ONE stop. Then maybe Sephora. Then maybe the one with the candles. Then pretzels. Pretzels don\'t count.'],
    ['tre', 'defeated', 'Lord, if you\'re listening, please let her card decline. Amen. Shit. Sorry. Amen.']
  ], mini: { game: 'mall', go: 'thu_after' } },

  thu_hide: { bg: 'mall', music: 'mall', lines: [
    ['deshawn', 'deshawn', 'Welcome to the Husband Daycare. We got Wi-Fi, a charger, and a guy named Ray who\'s been here since 2022.'],
    ['tre', 'laugh', 'Is Ray okay?'],
    ['deshawn', 'deshawn', 'Ray\'s wife is "just looking." Ray will never be okay.'],
    ['jada', 'mad', '(text) WHERE THE HELL ARE YOU. I needed an opinion on two shoes that are THE SAME SHOE.']
  ], go: 'thu_after' },

  thu_paged: { bg: 'mall', music: 'mall', lines: [
    ['tre', 'shocked', 'Oh no. Babe. Mattress emergency. Somebody\'s... springs... sprung.'],
    ['jada', 'sideeye', 'There\'s no such thing as a mattress emergency.'],
    ['tre', 'nervous', 'Tell that to the springs, Jada!'],
    ['jada', 'dramatic', 'Fine. Go. I\'ll just shop ALONE. With YOUR card. Which you left in my purse. Bye.']
  ], fx: { wallet: -120 }, go: 'thu_after' },

  thu_after: { bg: 'apartment', music: 'theme', lines: [
    ['sys', '', 'Thursday night. Tre checks his bank app with one eye closed.'],
    ['tre', 'defeated', 'I have... money. Some money. A number. It\'s a smaller number than before.'],
    ['jada', 'flirty', 'Tomorrow\'s date night, baby. I booked us at Gilded. You know, the one from TikTok with the gold steak.'],
    ['tre', 'shocked', 'The GOLD steak? They wrap a steak in GOLD, Jada. That\'s not food, that\'s jewelry.']
  ], go: 'fri_intro' },

  // ───────────────────────── FRIDAY — DATE NIGHT ─────────────────────────
  fri_intro: { day: 'FRIDAY', bg: 'restaurant', music: 'date', lines: [
    ['sys', '', 'FRIDAY · Gilded. A waiter in a velvet blazer hands Tre a menu with no prices on it.'],
    ['tre', 'nervous', 'Why are there no prices? Babe, why are there no prices? That\'s a threat. That\'s a menu making a threat. This menu is pressing me.'],
    ['jada', 'happy', 'Because if you have to ask, you can\'t afford it!'],
    ['tre', 'defeated', 'I\'m ASKING, Jada! I\'m asking with my whole broke ass!'],
    ['jada', 'flirty', 'Look at you in a button-up. Mm. You clean up nice. Order something fun, and maybe dessert is at home.']
  ], choice: { q: 'The menu has no prices. What does Tre order?', secs: 8, def: 0, opts: [
    { t: 'Survive the bill (play Date Night)', fx: {}, go: 'fri_date' },
    { t: '"I\'m not hungry, I ate earlier."', fx: { mood: -10, wallet: -90, sanity: -5 }, go: 'fri_nothungry' }
  ] } },

  fri_date: { bg: 'restaurant', music: 'date', lines: [
    ['jada', 'happy', 'Okay, the gold steak, the truffle fries, and whatever has a sparkler in it.'],
    ['tre', 'defeated', 'Spin the wheel, baby. Spin it.']
  ], mini: { game: 'date', go: 'fri_after' } },

  fri_nothungry: { bg: 'restaurant', music: 'date', lines: [
    ['tre', 'neutral', 'I\'m good, I ate earlier. I\'ll just have water.'],
    ['jada', 'sideeye', 'You ate a gas station hot dog at 3 PM, Tre.'],
    ['tre', 'smug', 'And that bitch is still working.'],
    ['sys', '', 'The water is $14. It\'s from a glacier. The glacier has a publicist.'],
    ['jada', 'mad', 'You\'re eating my fries with your eyes. I can FEEL it.']
  ], go: 'fri_after' },

  fri_after: { bg: 'apartment', music: 'theme', lines: [
    ['sys', '', 'Friday, 11:48 PM. Jada\'s phone buzzes.'],
    ['jada', 'shocked', 'Oh no. My mama\'s coming for Sunday dinner. Tomorrow. She said, quote, "I want to meet this Tre properly."'],
    ['tre', 'shocked', 'PROPERLY? I met her at your cousin\'s cookout! She called me "the one in the hoodie" for two hours!'],
    ['jada', 'laugh', 'That was a compliment, babe. She called my last boyfriend "the problem."']
  ], go: 'sat_intro' },

  // ───────────────────────── SATURDAY — HER MAMA ─────────────────────────
  sat_intro: { day: 'SATURDAY', bg: 'kitchen', music: 'theme', lines: [
    ['sys', '', 'SATURDAY · Ms. Brenda has arrived. She brought her own casserole. And her own chair.'],
    ['brenda', 'brenda', 'So. You\'re the Tre.'],
    ['tre', 'nervous', 'Yes ma\'am. The one and only. Well, there\'s a Tre at my job, but he\'s in sales, so.'],
    ['brenda', 'brenda', 'And what are your intentions with my baby? Besides eating all her groceries.'],
    ['jada', 'laugh', 'Mama!'],
    ['brenda', 'brenda', 'I\'m asking a question. Now taste this potato salad and tell me the truth. My pastor\'s wife says it needs more relish. That heifer. I want to know if I need to pray for her.']
  ], choice: { q: 'Ms. Brenda\'s potato salad has raisins in it.', secs: 9, def: 0, opts: [
    { t: 'Lie with your whole chest: "Best I ever had"', fx: { mood: 10, trust: 5, sanity: -10 }, set: { mamaLove: 1 }, go: 'sat_lie' },
    { t: 'Be honest: "Ma\'am... are those raisins?"', fx: { mood: -15, trust: 10 }, go: 'sat_honest' },
    { t: 'Hide in the bathroom until she leaves', fx: { mood: -20, sanity: 10, trust: -5 }, go: 'sat_hide' }
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
    ['sys', '', 'Forty-five minutes in the bathroom. Tre learns every scent of every candle.'],
    ['brenda', 'brenda', '(through the door) Baby, is he sick or is he scared?'],
    ['jada', 'mad', 'He\'s SCARED, Mama.'],
    ['brenda', 'brenda', 'Mm. Your daddy hid in a bathroom too. For eleven years.']
  ], go: 'sun_intro' },

  // ───────────────────────── SUNDAY — THE TALK ─────────────────────────
  sun_intro: { day: 'SUNDAY', bg: 'apartment', music: 'tense', lines: [
    ['sys', '', 'SUNDAY · 9:00 PM. Jada turns off the TV. That\'s never good.'],
    ['jada', 'neutral', 'Babe. Can we talk?'],
    ['tre', 'shocked', 'Oh shit. Every man in America just felt that. Somewhere, Deshawn felt that.'],
    ['jada', 'neutral', 'I\'ve been thinking about us. About this week. About everything.']
  ], go: 'ENDING' },

  // ───────────────────────── ENDINGS ─────────────────────────
  end_wifed: { bg: 'stadium', music: 'win', end: { title: 'WIFED UP', rank: 'S', blurb: 'Kiss Cam. Jumbotron. One knee. Twenty thousand people watching.' }, lines: [
    ['jada', 'happy', 'This week? You showed up. You paid, you worked, you lied to my mama about raisins. That\'s love.'],
    ['tre', 'smug', 'Funny you say that.'],
    ['sys', '', 'One week later. The arena. The Kiss Cam lands on them. Tre gets down on one knee.'],
    ['jada', 'shocked', 'TRE! On the JUMBOTRON?'],
    ['tre', 'nervous', 'Jada... will you—'],
    ['jada', 'flirty', '...Let me think about it. I\'m playing! Yes! YES! Kiki, are you filming?!']
  ] },

  end_broke_happy: { bg: 'rooftop', music: 'win', end: { title: 'BROKE BUT HAPPY', rank: 'A', blurb: 'Zero dollars. One rooftop. Two cups of ramen. Best night of the year.' }, lines: [
    ['jada', 'neutral', 'You spent every dollar on me this week. You\'re broke, aren\'t you?'],
    ['tre', 'defeated', 'I have eleven cents and a coupon for a free side of coleslaw.'],
    ['sys', '', 'The rooftop. Two lawn chairs. Two cups of shrimp ramen.'],
    ['jada', 'laugh', 'This is the most romantic thing you\'ve ever done and it cost you a dollar ten.'],
    ['tre', 'laugh', 'Ninety cents. The coleslaw coupon came through.']
  ] },

  end_speedrun: { bg: 'apartment', music: 'sad', end: { title: 'SUGAR DADDY SPEEDRUN', rank: 'D', blurb: 'Bankrupt in four days. A new personal record.' }, lines: [
    ['tre', 'defeated', 'Babe. I gotta be honest. My bank account is negative. The app sent me a sad face emoji.'],
    ['jada', 'shocked', 'Negative? How the fuck do you spend money you DON\'T HAVE?'],
    ['tre', 'annoyed', 'Brunch, Jada. Brunch, the mall, and a steak wrapped in jewelry.'],
    ['jada', 'sideeye', 'So... is this a bad time to tell you Kiki\'s birthday is next weekend? In Miami?']
  ] },

  end_snapped: { bg: 'cabin', music: 'sad', end: { title: 'HE SNAPPED', rank: 'C', blurb: 'Tre moved to a cabin. He fishes now. The fish don\'t ask about brunch.' }, lines: [
    ['tre', 'annoyed', 'Jada. I love you. But I\'m tired. I\'m tired as shit, Jada.'],
    ['sys', '', 'Three weeks later. A cabin. No Wi-Fi. A lake.'],
    ['tre', 'neutral', 'Me and the fish have an understanding. The fish don\'t want a lobster waffle. The fish just want a worm.'],
    ['deshawn', 'deshawn', '(on a crackling phone) Bro, Jada says come home, she misses you. Also you left the stove on.']
  ] },

  end_couch: { bg: 'apartment', music: 'sad', end: { title: 'THE COUCH', rank: 'C', blurb: 'You live on the couch now. The couch is your relationship.' }, lines: [
    ['jada', 'mad', 'This week was a hot-ass MESS, Tre. You were a mess. I was a little bit of a mess. But mostly you.'],
    ['tre', 'nervous', 'So... are we breaking up?'],
    ['jada', 'sideeye', 'No. But you\'re sleeping out here until you remember my love language.'],
    ['tre', 'defeated', 'Is it acts of service?'],
    ['jada', 'mad', 'It\'s RECEIPTS, Tre. My love language is RECEIPTS.']
  ] },

  end_read: { bg: 'bedroom', music: 'sad', end: { title: 'LEFT ON READ', rank: 'D', blurb: 'She moved on. So did her group chat. And her mama.' }, lines: [
    ['jada', 'neutral', 'I don\'t trust you, Tre. And without trust, what are we even doing?'],
    ['tre', 'shocked', 'Watching our show? Eating snacks? Building a life?'],
    ['sys', '', 'Monday morning. Tre texts "good morning beautiful." Read 7:02 AM.'],
    ['tre', 'defeated', 'Read at 7:02. No reply. The silence is so loud I can hear it in my teeth.']
  ] },

  end_marcus: { bg: 'apartment', music: 'sad', end: { title: 'HER EX WINS', rank: 'F', blurb: 'Marcus was always in the picture. Literally. In the background of her gym selfies.' }, lines: [
    ['jada', 'neutral', 'You accused me, you lied to me, and honestly? Marcus never made me split a brunch.'],
    ['tre', 'shocked', 'MARCUS? Leg Day Marcus?'],
    ['marcus', 'marcus', '(at the door, holding a gallon of protein shake) Ready, babe?'],
    ['tre', 'annoyed', 'Bro, you\'re drinking out of a jug like a damn horse.'],
    ['marcus', 'marcus', 'And she loves it. Leg day. Every day.']
  ] },

  end_twist: { bg: 'apartment', music: 'sad', end: { title: 'PLOT TWIST', rank: 'B', blurb: 'It was you. You were the problem the whole time.' }, lines: [
    ['jada', 'neutral', 'Tre. Pull up your screen time.'],
    ['tre', 'nervous', 'Why?'],
    ['jada', 'mad', 'Eleven hours on Instagram. You accused ME about Marcus while YOU watched three hundred reels of women doing yoga.'],
    ['tre', 'defeated', '...They were teaching me balance, Jada.']
  ] },

  end_barely: { bg: 'apartment', music: 'theme', end: { title: 'STILL TOGETHER (BARELY)', rank: 'B', blurb: 'You survived the week. Next week has a birthday trip to Miami. To be continued...' }, lines: [
    ['jada', 'neutral', 'This week was a lot. But you\'re still here, and I\'m still here, so.'],
    ['tre', 'neutral', 'So we good?'],
    ['jada', 'flirty', 'We\'re good. Come here. Turn the TV back on. Bonus episode.'],
    ['tre', 'laugh', 'The bonus episode! I\'ve been waiting all week!'],
    ['jada', 'sideeye', 'Also Kiki\'s birthday is in Miami next weekend and you\'re paying for the Airbnb.']
  ] }
  }
};

/* Which ending Sunday lands on. Order matters — first match wins. */
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
