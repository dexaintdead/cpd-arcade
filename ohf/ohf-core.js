/* Oak Hill Farm: Farm Friends v2 — core: data, save, audio, narrator, input (build 2026101001-ohf2) */
(function () {
'use strict';
var O = window.OHF = window.OHF || {};
O.BUILD = '2026101001-ohf2';
O.GAME_ID = 'oak-hill-farm';
O.V = '?v=2';
var EMBED = false; try { EMBED = window.top !== window; } catch (e) { EMBED = true; }
O.EMBED = EMBED;
O.post = function (type, extra) { try { if (window.parent !== window) window.parent.postMessage(Object.assign({ arcade: type, game: O.GAME_ID }, extra || {}), '*'); } catch (e) {} };
O.$ = function (id) { return document.getElementById(id); };
O.ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
O.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
O.rnd = function (a, b) { return a + Math.random() * (b - a); };
O.pick = function (a) { return a[(Math.random() * a.length) | 0]; };
O.dist = function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); };
O.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
O.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };

/* ---------------- assets ---------------- */
O.ANIMAL_KEYS = ['boots','nugget','brunello','molly','rosie','cookie','paris','charlotte','penelope','prosciutto','pearl','george','hazel','lola','mo','larry','curley','armani','speckles','kiwi','gaby','bianca','amina','tracey','boca','aretha','betty','funny','rodney','peter','bunnies','chicks'];
O.PROP_KEYS = ['kid_girl','kid_boy','truck','barn','barn_winter','dome','oak','oak_winter','oak_spring','oak_summer','stand','haystack','garden','shed','coffee','trough','spool','pump','hutch','pumpkins','sunflower','mums','wheelbarrow','bench','snowman','flowerbed','pumpkin_big','crop_sprout','crop_carrot','crop_pumpkin',
  'i_mess','i_hay','i_carrot','i_apple','i_water','i_brush','i_grain','i_egg','i_basket','i_rake','i_heart','i_blanket','i_seeds','i_bouquet','i_melon','i_feather','i_hose',
  'acc_bow','acc_bandana','acc_crown','acc_scarf','acc_hat','acc_gold','sticker_gold'];
O.JPG_KEYS = ['map_fall','map_winter','map_spring','map_summer','bg_hill'];
O.IMG = {};
O.src = function (k) { return 'ohf/' + k + (O.JPG_KEYS.indexOf(k) >= 0 || k === 'cover' ? '.jpg' : '.webp') + O.V; };
O.ANCHOR = {};
function anchorOf(k, im) {
  // find where the head is: the top-most solid pixel in the front 55% of a right-facing sprite
  try {
    var w = 64, h = Math.max(8, Math.round(64 * im.naturalHeight / im.naturalWidth));
    var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, front = (k === 'peter' || k === 'bunnies' || k === 'chicks') ? 0.2 : 0.45;
    for (var y = 0; y < h; y++) for (var xx = Math.floor(w * front); xx < w; xx++) if (d[(y * w + xx) * 4 + 3] > 140) {
      // centre of the solid run on this row near the top
      var x0 = xx, x1 = xx; while (x1 < w - 1 && d[(y * w + x1 + 1) * 4 + 3] > 140) x1++;
      return { hx: ((x0 + x1) / 2) / w, hy: y / h };
    }
  } catch (e) {}
  return { hx: 0.7, hy: 0.05 };
}
O.loadAll = function (onProgress, done) {
  var keys = O.ANIMAL_KEYS.concat(O.PROP_KEYS, O.JPG_KEYS), n = 0, tot = keys.length;
  keys.forEach(function (k) {
    var im = new Image(); im.decoding = 'async';
    im.onload = function () { if (O.ANIMAL_KEYS.indexOf(k) >= 0) O.ANCHOR[k] = anchorOf(k, im); fin(); };
    im.onerror = fin; im.src = O.src(k); O.IMG[k] = im;
  });
  function fin() { n++; onProgress(n / tot); if (n === tot) done(); }
};

/* ---------------- the cast ---------------- */
O.KINDS = {
  horse: { eats: ['hay', 'apple', 'carrot', 'melon'], voice: 'horse', warm: 1 },
  pony: { eats: ['carrot', 'apple', 'hay', 'melon'], voice: 'pony', warm: 1 },
  mule: { eats: ['hay', 'apple', 'carrot', 'melon'], voice: 'mule', warm: 1 },
  donkey: { eats: ['hay', 'carrot', 'apple', 'melon'], voice: 'donkey', warm: 1 },
  cow: { eats: ['hay', 'apple', 'melon'], voice: 'cow' },
  calf: { eats: ['hay', 'apple', 'melon'], voice: 'calf' },
  sheep: { eats: ['grain', 'hay', 'melon'], voice: 'sheep' },
  goat: { eats: ['grain', 'hay', 'apple', 'melon', 'carrot'], voice: 'goat' },
  alpaca: { eats: ['hay', 'carrot', 'melon'], voice: 'alpaca' },
  hen: { eats: ['grain', 'melon'], voice: 'hen' },
  rooster: { eats: ['grain', 'melon'], voice: 'rooster' },
  peacock: { eats: ['grain', 'melon'], voice: 'peacock' },
  bunny: { eats: ['carrot'], voice: 'bunny' },
  chick: { eats: ['grain'], voice: 'chick' }
};
// id, name, kind, pen, height, role, fact, favorite, secret
O.CAST = [
  ['boots','Boots','horse','horses',150,'The Clydesdale',"A gentle giant! Boots is a flaxen chestnut with a blonde mane and big fluffy feet. His best friends are Nugget and Gaby.",'apple',"Secret: Boots sticks his tongue out when he's feeling silly."],
  ['nugget','Nugget','horse','horses',138,'The draft horse',"A golden palomino draft horse with a blonde mane. Boots and Nugget do everything together.",'carrot',"Secret: Nugget always lets Boots have the first bite."],
  ['brunello','Brunello','pony','ponies',92,'Mini pony stallion',"Brunello is a mini pony stallion. Small pony, BIG personality!",'apple',"Secret: Brunello thinks he is the tallest horse on the farm."],
  ['molly','Molly','pony','ponies',86,'Mini pony',"Molly is a mini pony who loves to prance around the corral.",'carrot',"Secret: Molly prances extra high when someone is watching."],
  ['rosie','Rosie','pony','ponies',86,'Mini pony',"Rosie is a mini pony. She looks extra pretty with flowers in her mane.",'apple',"Secret: Rosie's favorite flowers are daisies."],
  ['cookie','Cookie','mule','donkeys',120,'Mule',"Cookie is a mule. A mule's mom is a horse and its dad is a donkey!",'apple',"Secret: Cookie can hear you open the apple bucket from across the farm."],
  ['paris','Paris','mule','donkeys',120,'Mule',"Paris is a mule with lots of style. Cookie and Paris are a team.",'carrot',"Secret: Paris always poses for pictures."],
  ['charlotte','Charlotte','donkey','donkeys',104,'Donkey',"Charlotte is a sweet donkey with the softest, fuzziest ears.",'carrot',"Secret: Charlotte loves a scratch behind the ears."],
  ['penelope','Penelope','donkey','donkeys',104,'Donkey',"Penelope is a cheerful donkey. Listen for her hee-haw!",'apple',"Secret: Penelope's hee-haw is the loudest on the farm."],
  ['prosciutto','Prosciutto','calf','cows',96,'Mini Highland cow',"Prosciutto is a mini Highland cow with a long, shaggy coat and a fluffy fringe.",'apple',"Secret: Prosciutto's fringe is so long he peeks through it."],
  ['pearl','Pearl','calf','cows',94,'Mini Highland cow',"Pearl is a mini Highland cow, fluffy from her horns to her hooves.",'hay',"Secret: Pearl loves being brushed more than anything."],
  ['george','George','calf','cows',78,'Micro Highland cow',"George is a micro Highland cow and the fluffiest friend on the farm. Peekaboo, George!",'apple',"Secret: George is the hide-and-seek champion of Oak Hill Farm."],
  ['hazel','Hazel','calf','cows',78,'Micro Highland cow',"Hazel is a micro Highland cow, tiny and shaggy and sweet.",'hay',"Secret: Hazel follows George everywhere."],
  ['lola','Lola','cow','cows',122,'Jersey cow',"Lola is a Jersey cow with big brown eyes and long eyelashes.",'apple',"Secret: Lola's cowbell jingles when she dances."],
  ['mo','Mo','sheep','sheep',84,'Curly black-faced sheep',"Mo is one of three curly black-faced sheep. He's the boss of the bunch.",'grain',"Secret: Mo always gets to the feed bucket first."],
  ['larry','Larry','sheep','sheep',84,'Curly black-faced sheep',"Larry is a curly black-faced sheep with wild, frizzy wool.",'hay',"Secret: Larry's wool gets frizzier on rainy days."],
  ['curley','Curley','sheep','sheep',84,'Curly black-faced sheep',"Curley is the roundest, happiest, curliest sheep around.",'grain',"Secret: Curley naps under the oak tree every afternoon."],
  ['armani','Armani','goat','goats',78,'Nigerian Dwarf goat',"Armani is a Nigerian Dwarf goat with bright blue eyes. Very fashionable!",'apple',"Secret: Armani likes to stand on the tallest spool."],
  ['speckles','Speckles','goat','goats',76,'Nigerian Dwarf goat',"Speckles is a blue-eyed Nigerian Dwarf goat covered in spots and speckles.",'grain',"Secret: Speckles has more spots than anyone can count."],
  ['kiwi','Kiwi','goat','goats',74,'Nigerian Dwarf goat',"Kiwi is a bouncy blue-eyed Nigerian Dwarf goat. Queen of the spools!",'melon',"Secret: Kiwi can jump over a giant pumpkin. Boing!"],
  ['gaby','Gaby','alpaca','alpacas',128,'Alpaca',"Gaby is a fluffy alpaca. Her best friend is Boots the Clydesdale!",'carrot',"Secret: Gaby gives the best alpaca kisses."],
  ['bianca','Bianca','alpaca','alpacas',126,'Alpaca',"Bianca is a snow-white alpaca with a puffy top-knot.",'hay',"Secret: Bianca hums when she is happy."],
  ['amina','Amina','alpaca','alpacas',126,'Black alpaca',"Amina is the farm's beautiful black alpaca.",'carrot',"Secret: Amina's fleece shines in the sun."],
  ['tracey','Tracey','alpaca','alpacas',124,'Alpaca',"Tracey is a fawn alpaca with a fluffy top-knot and a cheeky smile.",'hay',"Secret: Tracey is always the first to say hello."],
  ['boca','Boca','hen','chickens',50,'Special chicken',"Boca is one of the special chickens who live in the Chicken Dome.",'grain',"Secret: Boca lays the biggest eggs in the Dome."],
  ['aretha','Aretha','hen','chickens',52,'Special chicken',"Aretha is a special chicken. She's got a voice!",'melon',"Secret: Aretha sings a little song every morning."],
  ['betty','Betty White','hen','chickens',50,'Special chicken',"Betty White is a special chicken, as fluffy as a cotton ball.",'grain',"Secret: Betty White is the fluffiest hen in New Jersey."],
  ['funny','Funny Lookin Chicken','hen','chickens',54,'Special chicken',"Her feathers go every which way, and that's what makes her perfect.",'melon',"Secret: Her feathers stick out even more after a nap."],
  ['rodney','Rodney','rooster','chickens',68,'Show rooster',"Rodney is a show rooster who lives in the Chicken Dome. He wakes up the whole farm!",'grain',"Secret: Rodney once overslept, and the whole farm had to wake him up!"],
  ['peter','Peter','peacock','yard',104,'The Peacock',"Peter the Peacock loves to show off his beautiful tail.",'grain',"Secret: Peter has more than a hundred eyes on his tail."],
  ['bunnies','The Bunnies','bunny','bunnies',54,'Bunnies',"The farm bunnies love carrots more than anything.",'carrot',"Secret: The bunnies always share their carrots."],
  ['chicks','The Chicks','chick','chickens',40,'Baby chicks',"Brand-new baby chicks from the Chicken Dome. Peep peep!",'grain',"Secret: The chicks follow Rodney around like a parade."]
];
O.BY = {};
O.CAST.forEach(function (c) { O.BY[c[0]] = { id: c[0], name: c[1], kind: c[2], pen: c[3], h: c[4], role: c[5], fact: c[6], fav: c[7], secret: c[8] }; });
O.ITEMS = {
  hay: { img: 'i_hay', name: 'hay' }, carrot: { img: 'i_carrot', name: 'carrots' }, apple: { img: 'i_apple', name: 'apples' },
  water: { img: 'i_water', name: 'water' }, grain: { img: 'i_grain', name: 'feed' }, brush: { img: 'i_brush', name: 'the brush', tool: 1 },
  rake: { img: 'i_rake', name: 'the rake', tool: 1 }, hose: { img: 'i_hose', name: 'the hose', tool: 1 }, eggs: { img: 'i_basket', name: 'eggs', count: 1 },
  blanket: { img: 'i_blanket', name: 'a blanket' }, melon: { img: 'i_melon', name: 'watermelon' }, seeds: { img: 'i_seeds', name: 'seeds' },
  bouquet: { img: 'i_bouquet', name: 'flowers' }, snow: { img: 'i_egg', name: 'snowballs', count: 1 }, pumpkin: { img: 'pumpkins', name: 'a pumpkin' }
};
O.canGive = function (kind, item) {
  if (item === 'blanket') return !!O.KINDS[kind].warm || kind === 'calf' || kind === 'cow';
  return O.KINDS[kind].eats.indexOf(item) >= 0;
};
O.ACCS = [
  { id: 'bow', img: 'acc_bow', name: 'Pink bow', at: 'head' },
  { id: 'bandana', img: 'acc_bandana', name: 'Red bandana', at: 'neck' },
  { id: 'crown', img: 'acc_crown', name: 'Daisy crown', at: 'head' },
  { id: 'scarf', img: 'acc_scarf', name: 'Cozy scarf', at: 'neck' },
  { id: 'hat', img: 'acc_hat', name: 'Straw hat', at: 'head' },
  { id: 'gold', img: 'acc_gold', name: 'Golden crown', at: 'head', secret: 1 }
];
O.HEART_LV = [1, 4, 9, 16, 25];   // hearts needed for friendship levels 1..5
O.friendLv = function (id) { var h = (O.SAVE.hearts[id] || 0), l = 0; for (var i = 0; i < O.HEART_LV.length; i++) if (h >= O.HEART_LV[i]) l = i + 1; return l; };

/* ---------------- seasons ---------------- */
O.SEASONS = {
  fall:   { name: 'Fall', emoji: '🍂', grass: ['#6fb24e', 'rgba(120,190,80,.45)', 'rgba(90,160,62,.45)', 'rgba(60,120,40,.55)'], dirt: '#d9b37c', pen: 'rgba(170,220,120,.32)', oak: 'oak', barn: 'barn', fx: 'leaves', pond: '#5fb6e8', flowers: ['#fff', '#ffe066', '#ff9ec4'] },
  winter: { name: 'Winter', emoji: '❄️', grass: ['#e9f3fb', 'rgba(255,255,255,.7)', 'rgba(200,222,240,.6)', 'rgba(170,200,225,.45)'], dirt: '#d8d4cc', pen: 'rgba(255,255,255,.45)', oak: 'oak_winter', barn: 'barn_winter', fx: 'snow', pond: '#bfe3f5', flowers: [] },
  spring: { name: 'Spring', emoji: '🌷', grass: ['#7dc75a', 'rgba(150,215,100,.45)', 'rgba(105,185,70,.45)', 'rgba(70,140,45,.55)'], dirt: '#d6ae78', pen: 'rgba(190,235,140,.32)', oak: 'oak_spring', barn: 'barn', fx: 'petals', pond: '#62bde8', flowers: ['#ff9ec4', '#fff', '#ffd1f0', '#c9a7ff', '#ffe066'] },
  summer: { name: 'Summer', emoji: '☀️', grass: ['#5fa944', 'rgba(110,180,60,.45)', 'rgba(80,150,50,.5)', 'rgba(50,110,30,.55)'], dirt: '#dcb276', pen: 'rgba(160,215,110,.3)', oak: 'oak_summer', barn: 'barn', fx: 'butterflies', pond: '#4fb0e6', flowers: ['#ffe066', '#ff8a3c', '#ff5d8f', '#fff'] }
};
O.SEASON_ORDER = ['fall', 'winter', 'spring', 'summer'];

/* ---------------- days ---------------- */
function T(type, o) { return Object.assign({ type: type, have: 0, got: {} }, o || {}); }
O.T = T;
O.DAYS = {
  fall: [
    { name: 'Good Morning, Oak Hill!', intro: "Rodney is up, so everybody's up! Boots and Nugget are waiting for breakfast.", tip: 'Walk to the hay stack next to the barn and press the action button to grab some hay.', tasks: function () { return [T('pet', { ids: ['boots'] }), T('feed', { ids: ['boots'], item: 'hay' }), T('feed', { ids: ['nugget'], item: 'hay' }), T('water', { pen: 'horses' })]; } },
    { name: 'Little Hooves', intro: 'The mini ponies want carrots from the garden, and Rosie wants her mane brushed.', tip: 'Apples come from the Farm Stand by the road. The grooming brush hangs by the barn.', tasks: function () { return [T('feed', { ids: ['molly'], item: 'carrot' }), T('feed', { ids: ['rosie'], item: 'carrot' }), T('feed', { ids: ['brunello'], item: 'apple' }), T('brush', { ids: ['rosie'] })]; } },
    { name: 'Highland Hello', intro: 'The Highland cows are hungry! Hay is heavy, so take the farm truck. Its bed holds four things.', tip: 'Load hay into the truck at the hay stack, drive to the pasture fence, hop out and fill the feeder.', tasks: function () { return [T('feeder', { pen: 'cows', n: 3 }), T('feed', { ids: ['lola'], item: 'apple' }), T('brush', { ids: ['pearl'] }), T('pet', { ids: ['george', 'hazel', 'prosciutto'] }), T('water', { pen: 'cows' })]; } },
    { name: 'Eggs at the Dome', intro: 'Good morning, Chicken Dome! Feed the special chickens, then collect their eggs and sell them at the Farm Stand.', tip: 'Feed comes from the feed shed. Walk over the eggs to put them in your basket.', tasks: function () { return [T('domefeed'), T('eggs', { n: 6 }), T('sell', { n: 6 }), T('feed', { ids: ['peter'], item: 'grain' }), T('pet', { ids: ['rodney'] })]; } },
    { name: 'Goat Escape!', intro: 'Oh no! Armani, Speckles and Kiwi hopped the fence again! Find them and lead them home to the goat yard.', tip: 'Walk up to a goat and press the action button. It will follow you!', tasks: function () { return [T('roundup', { ids: ['armani', 'speckles', 'kiwi'] }), T('feed', { ids: ['armani', 'speckles', 'kiwi'], item: 'grain' }), T('water', { pen: 'goats' })]; } },
    { name: 'Alpaca Spa Day', intro: 'Gaby, Bianca, Amina and Tracey are getting fluffed up today.', tip: 'Hold the action button to brush. Keep going until the circle fills up!', tasks: function () { return [T('brush', { ids: ['gaby', 'bianca', 'amina', 'tracey'] }), T('feeder', { pen: 'alpacas', n: 2 }), T('water', { pen: 'alpacas' })]; } },
    { name: 'Barn Clean-Up', intro: 'The barn yard is a mess! Grab the rake from the wheelbarrow, then feed the donkeys and mules.', tip: 'Hold the action button on a straw mess to rake it up.', tasks: function () { return [T('rake', { n: 6 }), T('feed', { ids: ['charlotte', 'penelope', 'cookie', 'paris'], item: 'hay' }), T('water', { pen: 'donkeys' })]; } },
    { name: 'The Fall Festival', intro: "It's the Fall Festival at Oak Hill Farm! Feed Mo, Larry and Curley, treat the bunnies, and decorate the farm.", tip: 'Buy decorations at the Farm Market with the coins you have earned.', fest: 1, tasks: function () { return [T('feed', { ids: ['mo', 'larry', 'curley'], item: 'grain' }), T('feed', { ids: ['bunnies'], item: 'carrot' }), T('decor', { n: 2 }), T('pet', { ids: ['peter', 'boots', 'gaby'] })]; } }
  ],
  winter: [
    { name: 'First Snow', intro: 'It snowed last night! Boots and Nugget need warm blankets, and their water trough froze solid.', tip: 'Blankets are on the rack by the barn. Hold the action button at a frozen trough to break the ice.', tasks: function () { return [T('feed', { ids: ['boots', 'nugget'], item: 'blanket' }), T('ice', { pen: 'horses' }), T('pet', { ids: ['george'] })]; } },
    { name: 'Warm Hay for Everyone', intro: 'Cold days make hungry animals. Fill the feeders for the Highland cows and the alpacas.', tip: 'The truck bed holds four bales of hay.', tasks: function () { return [T('feeder', { pen: 'cows', n: 3 }), T('feeder', { pen: 'alpacas', n: 2 }), T('pet', { ids: ['amina'] })]; } },
    { name: 'Frozen Troughs', intro: 'Brrr! Three water troughs froze overnight. Crack the ice so everyone can drink.', tip: 'Walk up to a frozen trough and hold the action button.', tasks: function () { return [T('ice', { pen: 'ponies' }), T('ice', { pen: 'donkeys' }), T('ice', { pen: 'goats' }), T('feed', { ids: ['molly', 'rosie'], item: 'carrot' })]; } },
    { name: 'Cozy Coop', intro: 'The special chickens are snug in the Chicken Dome. Bring them breakfast and collect the eggs.', tip: 'Walk over the eggs to put them in your basket.', tasks: function () { return [T('domefeed'), T('eggs', { n: 4 }), T('sell', { n: 4 }), T('feed', { ids: ['rodney'], item: 'grain' })]; } },
    { name: 'Snowy Escape', intro: 'The goats are playing in the snow outside their yard! Bring them home, and give Brunello a blanket.', tip: 'Walk up to a goat and press the action button. It will follow you!', tasks: function () { return [T('roundup', { ids: ['armani', 'speckles', 'kiwi'] }), T('feed', { ids: ['brunello'], item: 'blanket' })]; } },
    { name: 'Build a Snowman', intro: "Let's build a snowman in the barn yard! Pick up three snowballs and bring them to the snowman spot.", tip: 'Walk over a snow pile to pick up a snowball.', tasks: function () { return [T('snowman', { n: 3 }), T('pet', { ids: ['mo', 'larry', 'curley'] })]; } },
    { name: 'Winter Grooming', intro: 'Highland cows grow extra-shaggy winter coats. Brush out the tangles!', tip: 'Hold the action button to brush.', tasks: function () { return [T('brush', { ids: ['pearl', 'prosciutto', 'hazel', 'george'] }), T('ice', { pen: 'cows' })]; } },
    { name: 'Holiday on the Farm', intro: 'Happy holidays, Oak Hill Farm! Hang decorations and give everyone a special treat.', tip: 'Buy decorations at the Farm Market.', fest: 1, tasks: function () { return [T('decor', { n: 2 }), T('feed', { ids: ['boots', 'nugget', 'lola'], item: 'apple' }), T('pet', { ids: ['peter', 'gaby'] })]; } }
  ],
  spring: [
    { name: 'Hello, Spring!', intro: "Spring is here! Plant seeds in the garden plots and water them so they grow.", tip: 'Seeds are in the crate next to the garden. Plant, then bring water.', tasks: function () { return [T('plant', { n: 3 }), T('wplot', { n: 3 }), T('pet', { ids: ['bunnies'] })]; } },
    { name: 'Chick Check', intro: 'Peep peep! Baby chicks hatched in the Chicken Dome. Say hello, then feed everyone.', tip: 'The chicks are in the Chicken Dome yard.', tasks: function () { return [T('pet', { ids: ['chicks'] }), T('domefeed'), T('eggs', { n: 4 })]; } },
    { name: 'Spring Cleaning', intro: 'Time to sweep out winter! Rake up the barn yard and give the ponies fresh water.', tip: 'The rake is in the red wheelbarrow.', tasks: function () { return [T('rake', { n: 6 }), T('water', { pen: 'ponies' }), T('feed', { ids: ['brunello'], item: 'apple' })]; } },
    { name: 'Garden Harvest', intro: 'The garden grew! Pick the vegetables and share them with your friends.', tip: 'Walk up to a ready plant with empty hands to pick it.', tasks: function () { return [T('harvest', { n: 3 }), T('feed', { ids: ['bunnies', 'molly'], item: 'carrot' })]; } },
    { name: 'Muddy Goats', intro: 'Armani, Speckles and Kiwi played in the spring mud! Brush them clean.', tip: 'Hold the action button to brush.', tasks: function () { return [T('brush', { ids: ['armani', 'speckles', 'kiwi'] }), T('feed', { ids: ['armani', 'speckles', 'kiwi'], item: 'grain' })]; } },
    { name: 'Alpaca Picnic', intro: 'A sunny picnic for the alpacas. Hay, carrots and fresh water!', tip: 'Carrots come from the garden.', tasks: function () { return [T('feeder', { pen: 'alpacas', n: 2 }), T('feed', { ids: ['gaby', 'tracey'], item: 'carrot' }), T('water', { pen: 'alpacas' })]; } },
    { name: "Peter's Big Show", intro: 'Peter wandered off to show his tail to someone. Can you find him?', tip: 'Follow the arrow to find Peter.', farPeter: 1, tasks: function () { return [T('pet', { ids: ['peter'] }), T('feed', { ids: ['mo', 'larry', 'curley'], item: 'grain' }), T('sell', { n: 4 }), T('eggs', { n: 4 })]; } },
    { name: 'The Spring Fair', intro: 'It is the Spring Fair! Decorate the farm and get the ponies looking their best.', tip: 'Buy decorations at the Farm Market.', fest: 1, tasks: function () { return [T('decor', { n: 2 }), T('brush', { ids: ['rosie', 'molly'] }), T('pet', { ids: ['boots', 'gaby', 'george'] })]; } }
  ],
  summer: [
    { name: 'Hot, Hot, Hot!', intro: "It's a scorcher! Cool everybody off with the garden hose.", tip: 'The hose is next to the water pump. Hold the action button to spray.', tasks: function () { return [T('cool', { ids: ['boots', 'nugget', 'lola'] }), T('water', { pen: 'horses' })]; } },
    { name: 'Watermelon Day', intro: 'Cold watermelon is the best summer treat. Share it around!', tip: 'Watermelon is in the cooler by the Farm Stand.', tasks: function () { return [T('feed', { ids: ['armani', 'speckles', 'kiwi'], item: 'melon' }), T('feed', { ids: ['brunello'], item: 'melon' }), T('feed', { ids: ['aretha', 'funny'], item: 'melon' })]; } },
    { name: 'The Flower Stand Opens', intro: 'The flower field is blooming! Pick bouquets and sell them at the Farm Stand.', tip: 'Pick a bouquet at the flower field by the road.', tasks: function () { return [T('pick', { n: 4 }), T('sellf', { n: 4 })]; } },
    { name: 'Summer Shade', intro: "The alpacas are hot in their fluffy coats. Spray them with the hose, then visit the sheep under the oak.", tip: 'Hold the action button to spray.', tasks: function () { return [T('cool', { ids: ['gaby', 'bianca', 'amina', 'tracey'] }), T('pet', { ids: ['mo', 'larry', 'curley'] })]; } },
    { name: 'Garden Growing', intro: 'Plant a summer garden: pumpkins and carrots for fall!', tip: 'Seeds are in the crate next to the garden.', tasks: function () { return [T('plant', { n: 3 }), T('wplot', { n: 3 }), T('feed', { ids: ['bunnies'], item: 'carrot' })]; } },
    { name: 'Escape Artists', intro: 'The goats escaped AGAIN. Bring them home and give Kiwi her favorite treat.', tip: 'Kiwi loves watermelon!', tasks: function () { return [T('roundup', { ids: ['armani', 'speckles', 'kiwi'] }), T('feed', { ids: ['kiwi'], item: 'melon' }), T('water', { pen: 'goats' })]; } },
    { name: 'Big Barn Day', intro: 'Clean the barn yard and fill the hay feeders for the horses and donkeys.', tip: 'Use the truck to carry lots of hay.', tasks: function () { return [T('rake', { n: 6 }), T('feeder', { pen: 'horses', n: 2 }), T('feeder', { pen: 'donkeys', n: 2 })]; } },
    { name: 'End of Summer Party', intro: 'One last summer party before fall! Decorate and share watermelon with your best friends.', tip: 'Buy decorations at the Farm Market.', fest: 1, tasks: function () { return [T('decor', { n: 2 }), T('feed', { ids: ['boots', 'gaby', 'george'], item: 'melon' }), T('pet', { ids: ['peter', 'rodney'] })]; } }
  ]
};
// the Farm Map: each season is 8 days with 3 bonus stops between them
O.LEVELS = {};
var BONUS = {
  fall:   { mg1: ['eggs', 1], story: ['roll', 1], mg2: ['spools', 1] },
  winter: { mg1: ['feathers', 1], story: ['wake', 1], mg2: ['spa', 1] },
  spring: { mg1: ['eggs', 2], story: ['seek', 1], mg2: ['feathers', 2] },
  summer: { mg1: ['spools', 2], story: ['seek', 2], mg2: ['spa', 2] }
};
O.MINI_NAMES = { eggs: 'Egg Catch', spools: 'King of the Spools', feathers: "Peter's Feather Match", spa: 'Alpaca Spa', roll: 'The Great Pumpkin Roll', wake: 'Rodney Oversleeps', seek: 'Peekaboo, George!' };
O.MINI_ICON = { eggs: 'i_egg', spools: 'spool', feathers: 'i_feather', spa: 'i_brush', roll: 'pumpkin_big', wake: 'rodney', seek: 'george' };
O.SEASON_ORDER.forEach(function (s) {
  var b = BONUS[s], L = [];
  function day(n) { L.push({ id: s + '-' + n, season: s, type: 'day', n: n }); }
  function bonus(k, isStory) { L.push({ id: s + '-' + k, season: s, type: isStory ? 'story' : 'mini', game: b[k][0], diff: b[k][1] }); }
  day(1); day(2); bonus('mg1'); day(3); day(4); bonus('story', 1); day(5); day(6); bonus('mg2'); day(7); day(8);
  O.LEVELS[s] = L;
});
O.levelById = function (id) { for (var s in O.LEVELS) for (var i = 0; i < O.LEVELS[s].length; i++) if (O.LEVELS[s][i].id === id) return O.LEVELS[s][i]; return null; };
O.levelName = function (L) { return L.type === 'day' ? O.DAYS[L.season][L.n - 1].name : O.MINI_NAMES[L.game]; };
O.isUnlocked = function (L) {
  var s = L.season, list = O.LEVELS[s], i = list.indexOf(L);
  if (s !== 'fall') { var prev = O.SEASON_ORDER[O.SEASON_ORDER.indexOf(s) - 1]; if (!O.SAVE.stars[prev + '-8']) return false; }
  // a day needs the day before it; a bonus stop needs the day right before it
  for (var j = i - 1; j >= 0; j--) if (list[j].type === 'day') return !!O.SAVE.stars[list[j].id];
  return true;
};
O.seasonUnlocked = function (s) { return s === 'fall' || !!O.SAVE.stars[O.SEASON_ORDER[O.SEASON_ORDER.indexOf(s) - 1] + '-8']; };
O.randomDay = function (season, n) {
  var some = function (arr, k) { return O.shuffle(arr).slice(0, k); };
  var feedable = O.CAST.filter(function (c) { return c[0] !== 'peter' && (c[0] !== 'chicks' || season === 'spring' || season === 'summer'); }).map(function (c) { return c[0]; });
  var pens = ['horses', 'ponies', 'donkeys', 'cows', 'alpacas', 'goats', 'sheep'];
  var pool = [T('feed', { ids: some(feedable, 3), item: null }), T(season === 'winter' ? 'ice' : 'water', { pen: O.pick(pens) }),
    T(season === 'summer' ? 'cool' : 'brush', { ids: some(['boots', 'nugget', 'molly', 'rosie', 'brunello', 'gaby', 'bianca', 'amina', 'tracey', 'pearl', 'prosciutto', 'lola', 'charlotte', 'penelope'], 2) })];
  var extra = [function () { return T('eggs', { n: 4 }); }, function () { return T('rake', { n: 4 }); }, function () { return T('feeder', { pen: O.pick(['horses', 'cows', 'alpacas', 'donkeys']), n: 2 }); }, function () { return T('pet', { ids: some(O.ANIMAL_KEYS.filter(function (k) { return feedable.indexOf(k) >= 0; }), 3) }); }, function () { return T('domefeed'); }];
  if (season === 'spring' || season === 'summer') extra.push(function () { return T('harvest', { n: 2 }); });
  if (season === 'summer') extra.push(function () { return T('pick', { n: 2 }); });
  pool.push(O.pick(extra)()); if (Math.random() < 0.6) pool.push(O.pick(extra)());
  if (Math.random() < 0.25) pool.push(T('roundup', { ids: some(['armani', 'speckles', 'kiwi'], 2) }));
  var seen = {}, out = []; pool.forEach(function (t) { var key = t.type + (t.pen || ''); if (!seen[key]) { seen[key] = 1; out.push(t); } });
  return { name: O.SEASONS[season].name + ' Free Play', intro: 'A brand-new day of chores at Oak Hill Farm. Check your clipboard!', tip: '', tasks: function () { return out; } };
};

/* ---------------- save ---------------- */
var DEF = { v: 2, coins: 0, stars: {}, best: {}, met: {}, hearts: {}, acc: {}, decor: {}, kid: '', sound: 1, narrate: 1, players: 1, crops: null, snowman: 0, stickers: {}, codes: {}, lastSeason: 'fall', seenIntro: {} };
function loadSave() {
  var s = null; try { s = JSON.parse(O.ls('ohf_save') || 'null'); } catch (e) {}
  var out = JSON.parse(JSON.stringify(DEF));
  if (s) {
    if (!s.v) { // v1 → v2: stars were keyed by day number
      for (var k in (s.stars || {})) out.stars['fall-' + k] = s.stars[k];
      out.coins = s.coins || 0; out.met = s.met || {}; out.decor = s.decor || {}; out.kid = s.kid || ''; out.sound = s.sound === 0 ? 0 : 1;
      for (var m in out.met) out.hearts[m] = 2;
    } else out = Object.assign(out, s);
  }
  return out;
}
O.SAVE = loadSave();
O.reloadSave = function () { O.SAVE = loadSave(); O.soundOn = O.SAVE.sound !== 0; };
O.save = function () {
  O.SAVE.at = Date.now(); O.ls('ohf_save', JSON.stringify(O.SAVE));
  var t = O.totalStars(); if (t > (+O.ls('arcade_best_' + O.GAME_ID) || 0)) O.ls('arcade_best_' + O.GAME_ID, String(t));
};
O.totalStars = function () { var t = 0; for (var k in O.SAVE.stars) t += O.SAVE.stars[k]; return t; };
O.CODES = {
  PEEKABOO: { sticker: 'horseshoe', coins: 25, msg: 'You found the secret code from the Oak Hill Farm coloring books!' },
  STILLWELL: { sticker: 'visitor', coins: 50, msg: 'Thanks for visiting Oak Hill Farm in Holmdel!' }
};
O.STICKERS = [
  { id: 'horseshoe', name: 'Golden Horseshoe', how: 'Enter the secret code from an Oak Hill Farm coloring book', img: 'sticker_gold' },
  { id: 'visitor', name: 'Farm Visitor', how: 'Visit Oak Hill Farm and find the secret code', img: 'sticker_gold' },
  { id: 'fall', name: 'Fall Farmer', how: 'Finish all 8 fall days', emoji: '🍂' },
  { id: 'winter', name: 'Winter Farmer', how: 'Finish all 8 winter days', emoji: '❄️' },
  { id: 'spring', name: 'Spring Farmer', how: 'Finish all 8 spring days', emoji: '🌷' },
  { id: 'summer', name: 'Summer Farmer', how: 'Finish all 8 summer days', emoji: '☀️' },
  { id: 'bestfriend', name: 'Best Friends', how: 'Reach friendship level 5 with any animal', emoji: '💛' },
  { id: 'allfriends', name: 'Everybody\'s Friend', how: 'Meet every animal on the farm', emoji: '📖' },
  { id: 'superstar', name: 'Super Farmer', how: 'Earn 3 stars on every stop of a season', emoji: '🌟' },
  { id: 'artist', name: 'Farm Artist', how: 'Color a page in Coloring mode', emoji: '🖍️' }
];
O.giveSticker = function (id) { if (O.SAVE.stickers[id]) return false; O.SAVE.stickers[id] = Date.now(); O.save(); var st = O.STICKERS.filter(function (x) { return x.id === id; })[0]; if (st && O.toast) O.toast('🏅 New sticker: ' + st.name + '!', st.img ? O.src(st.img) : null, 4000); if (O.SFX) O.SFX.done(); return true; };

/* ---------------- audio ---------------- */
var AC = null, MASTER = null; O.music = null; O.soundOn = O.SAVE.sound !== 0;
O.audio = function () {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = O.soundOn ? 0.55 : 0; MASTER.connect(AC.destination); O.AC = AC; } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  if (!O.music) { O.music = new Audio('ohf/theme.mp3' + '?v=1'); O.music.loop = true; O.music.volume = 0.3; }
  if (O.soundOn && O.music.paused && !O.musicHold) { var p = O.music.play(); if (p && p.catch) p.catch(function () {}); }
};
O.setSound = function (on) { O.soundOn = on; O.SAVE.sound = on ? 1 : 0; O.save(); if (MASTER) MASTER.gain.value = on ? 0.55 : 0; if (O.music) { if (on) { var p = O.music.play(); if (p && p.catch) p.catch(function () {}); } else O.music.pause(); } if (!on) O.stopTalk(); };
function tone(o) {
  if (!AC || !O.soundOn) return; var t0 = AC.currentTime + (o.at || 0), d = o.t || 0.2, m = o.m || 1;
  var osc = AC.createOscillator(), g = AC.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f * m, t0); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2 * m, t0 + d);
  if (o.vib) { var l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = o.vibf || 6; lg.gain.value = o.vib * m; l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + d + 0.05); }
  var v = o.v || 0.2; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.03, d / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  var last = osc; if (o.lp) { var f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp * m; f.Q.value = o.q || 1; osc.connect(f); last = f; }
  last.connect(g); g.connect(MASTER); osc.start(t0); osc.stop(t0 + d + 0.05);
}
function noise(o) { if (!AC || !O.soundOn) return; var t0 = AC.currentTime + (o.at || 0), d = o.t || 0.15; var b = AC.createBuffer(1, Math.ceil(AC.sampleRate * d), AC.sampleRate), a = b.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; var s = AC.createBufferSource(); s.buffer = b; var f = AC.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.frequency.value = o.f || 2000; f.Q.value = o.q || 1; var g = AC.createGain(); g.gain.setValueAtTime(o.v || 0.15, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); s.connect(f); f.connect(g); g.connect(MASTER); s.start(t0); }
O.tone = tone; O.noise = noise;
O.SFX = {
  pop: function () { tone({ f: 520, f2: 880, t: 0.09, type: 'triangle', v: 0.22 }); },
  drop: function () { tone({ f: 660, f2: 330, t: 0.1, type: 'triangle', v: 0.18 }); },
  chime: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone({ f: f, t: 0.22, type: 'triangle', v: 0.16, at: i * 0.07 }); }); },
  done: function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone({ f: f, t: 0.3, type: 'triangle', v: 0.15, at: i * 0.08 }); }); },
  levelup: function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone({ f: f, t: 0.18, type: 'square', v: 0.06, lp: 2600, at: i * 0.09 }); }); },
  coin: function () { tone({ f: 988, t: 0.08, type: 'square', v: 0.07, lp: 3000 }); tone({ f: 1319, t: 0.25, type: 'square', v: 0.07, lp: 3000, at: 0.07 }); },
  no: function () { tone({ f: 300, f2: 220, t: 0.18, type: 'square', v: 0.08, lp: 900 }); tone({ f: 260, f2: 200, t: 0.2, type: 'square', v: 0.08, lp: 900, at: 0.17 }); },
  brush: function () { noise({ f: 3500, t: 0.09, v: 0.08, q: 0.7 }); },
  spray: function () { noise({ f: 5000, t: 0.12, v: 0.07, q: 0.4, ft: 'highpass' }); },
  rake: function () { noise({ f: 1400, t: 0.16, v: 0.12, q: 0.6 }); },
  crack: function () { noise({ f: 3000, t: 0.06, v: 0.2, q: 3 }); tone({ f: 1800, f2: 900, t: 0.08, type: 'square', v: 0.05, lp: 4000 }); },
  splash: function () { noise({ f: 900, t: 0.35, v: 0.16, q: 0.5 }); tone({ f: 700, f2: 300, t: 0.2, v: 0.06 }); },
  honk: function () { tone({ f: 392, t: 0.16, type: 'sawtooth', v: 0.09, lp: 1400 }); tone({ f: 330, t: 0.22, type: 'sawtooth', v: 0.09, lp: 1400, at: 0.17 }); },
  door: function () { noise({ f: 500, t: 0.12, v: 0.12, q: 2 }); tone({ f: 180, t: 0.12, type: 'triangle', v: 0.1, at: 0.04 }); },
  jump: function () { tone({ f: 320, f2: 760, t: 0.16, type: 'triangle', v: 0.16 }); },
  bonk: function () { tone({ f: 180, f2: 90, t: 0.2, type: 'square', v: 0.08, lp: 700 }); },
  splat: function () { noise({ f: 600, t: 0.2, v: 0.14, q: 1 }); },
  flip: function () { noise({ f: 2400, t: 0.05, v: 0.08, q: 1.2 }); },
  giggle: function () { [0, 1, 2, 3].forEach(function (i) { tone({ f: 620 + i * 40, f2: 720 + i * 40, t: 0.07, type: 'sine', v: 0.1, at: i * 0.09 }); }); },
  star: function (i) { tone({ f: 784 + i * 196, t: 0.35, type: 'triangle', v: 0.16 }); tone({ f: 1568 + i * 392, t: 0.25, type: 'sine', v: 0.06 }); },
  note: function (i) { var f = [523, 587, 659, 784, 880][i % 5]; tone({ f: f, t: 0.18, type: 'triangle', v: 0.14 }); }
};
var V = {
  horse: function (m) { tone({ f: 700, f2: 1050, t: 0.25, type: 'sawtooth', v: 0.07, lp: 1800, vib: 60, vibf: 22, m: m }); tone({ f: 1050, f2: 420, t: 0.6, type: 'sawtooth', v: 0.07, lp: 1500, vib: 70, vibf: 24, at: 0.22, m: m }); },
  pony: function (m) { tone({ f: 900, f2: 1400, t: 0.2, type: 'sawtooth', v: 0.06, lp: 2200, vib: 70, vibf: 24, m: m }); tone({ f: 1400, f2: 600, t: 0.45, type: 'sawtooth', v: 0.06, lp: 2000, vib: 80, vibf: 26, at: 0.18, m: m }); },
  donkey: function (m) { for (var i = 0; i < 3; i++) { tone({ f: 820, f2: 900, t: 0.22, type: 'square', v: 0.06, lp: 1600, at: i * 0.5, m: m }); tone({ f: 300, f2: 240, t: 0.26, type: 'sawtooth', v: 0.08, lp: 900, at: i * 0.5 + 0.23, m: m }); } },
  mule: function (m) { for (var i = 0; i < 2; i++) { tone({ f: 700, f2: 800, t: 0.22, type: 'square', v: 0.06, lp: 1500, at: i * 0.5, m: m }); tone({ f: 330, f2: 260, t: 0.26, type: 'sawtooth', v: 0.08, lp: 900, at: i * 0.5 + 0.23, m: m }); } },
  cow: function (m) { tone({ f: 150, f2: 118, t: 1.0, type: 'sawtooth', v: 0.14, lp: 700, q: 4, vib: 3, vibf: 5, m: m }); },
  calf: function (m) { tone({ f: 240, f2: 190, t: 0.7, type: 'sawtooth', v: 0.12, lp: 900, q: 4, vib: 4, vibf: 6, m: m }); },
  sheep: function (m) { tone({ f: 360, f2: 330, t: 0.7, type: 'sawtooth', v: 0.09, lp: 1500, q: 3, vib: 22, vibf: 26, m: m }); },
  goat: function (m) { tone({ f: 520, f2: 470, t: 0.55, type: 'sawtooth', v: 0.08, lp: 2000, q: 3, vib: 40, vibf: 30, m: m }); },
  alpaca: function (m) { tone({ f: 290, f2: 340, t: 0.5, type: 'sine', v: 0.16, vib: 8, vibf: 4, m: m }); tone({ f: 340, f2: 280, t: 0.5, type: 'sine', v: 0.14, at: 0.45, vib: 8, vibf: 4, m: m }); },
  hen: function (m) { for (var i = 0; i < 3; i++) tone({ f: 760 + i * 40, f2: 980, t: 0.08, type: 'triangle', v: 0.12, at: i * 0.12, m: m }); tone({ f: 900, f2: 600, t: 0.25, type: 'triangle', v: 0.12, at: 0.4, m: m }); },
  rooster: function (m) { [[520, 700, 0.18], [700, 840, 0.22], [840, 980, 0.5], [980, 620, 0.45]].forEach(function (n, i, a) { var at = 0; for (var j = 0; j < i; j++) at += a[j][2] * 0.85; tone({ f: n[0], f2: n[1], t: n[2], type: 'sawtooth', v: 0.07, lp: 2400, vib: 15, vibf: 12, at: at, m: m }); }); },
  peacock: function (m) { tone({ f: 1300, f2: 900, t: 0.35, type: 'square', v: 0.05, lp: 2600, m: m }); tone({ f: 1300, f2: 850, t: 0.4, type: 'square', v: 0.05, lp: 2600, at: 0.4, m: m }); },
  bunny: function (m) { tone({ f: 1500, f2: 1900, t: 0.07, type: 'sine', v: 0.12, m: m }); tone({ f: 1700, f2: 2100, t: 0.07, type: 'sine', v: 0.1, at: 0.1, m: m }); },
  chick: function (m) { for (var i = 0; i < 4; i++) tone({ f: 2200, f2: 2800, t: 0.06, type: 'sine', v: 0.08, at: i * 0.13, m: m }); }
};
var lastVoice = {};
// every animal has its own pitch, so Boots and Nugget don't sound the same
O.voice = function (id) {
  var a = O.BY[id]; var k = a ? O.KINDS[a.kind].voice : id, n = performance.now(); if (lastVoice[id] && n - lastVoice[id] < 500) return; lastVoice[id] = n;
  var m = a ? 0.84 + O.hash(id) * 0.34 : 1; if (V[k]) V[k](m);
};
O.kindVoice = function (k, m) { if (V[k]) V[k](m || 1); };
var engine = null;
O.engineOn = function (on) { if (!AC) return; if (on && !engine && O.soundOn) { var o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 48; o2.type = 'square'; o2.frequency.value = 49.5; f.type = 'lowpass'; f.frequency.value = 360; g.gain.value = 0.05; o.connect(f); o2.connect(f); f.connect(g); g.connect(MASTER); o.start(); o2.start(); engine = { o: o, o2: o2, g: g }; } else if (!on && engine) { var e = engine; engine = null; try { e.g.gain.setTargetAtTime(0.0001, AC.currentTime, 0.08); setTimeout(function () { e.o.stop(); e.o2.stop(); }, 400); } catch (x) {} } };
O.engineRev = function (v) { if (engine) engine.o.frequency.value = 48 + v * 0.06; };

/* ---------------- narrator (reads chores out loud for little ones) ---------------- */
var talkVoice = null;
function pickVoice() {
  if (!window.speechSynthesis) return null; var vs = speechSynthesis.getVoices() || [];
  var pref = [/Samantha/i, /Google US English/i, /Aria/i, /Jenny/i, /Zira/i, /Karen/i, /en-US/i, /^en/i];
  for (var i = 0; i < pref.length; i++) for (var j = 0; j < vs.length; j++) if (pref[i].test(vs[j].name) || pref[i].test(vs[j].lang)) return vs[j];
  return vs[0] || null;
}
if (window.speechSynthesis) { try { speechSynthesis.onvoiceschanged = function () { talkVoice = pickVoice(); }; } catch (e) {} }
O.say = function (text, interrupt) {
  if (!O.SAVE.narrate || !O.soundOn || !window.speechSynthesis || !text) return;
  try {
    if (interrupt !== false) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/[🍂❄️🌷☀️💡✅📖🏅🎉🪙⭐]/g, ''));
    talkVoice = talkVoice || pickVoice(); if (talkVoice) u.voice = talkVoice;
    u.rate = 0.98; u.pitch = 1.12; u.volume = 1;
    if (O.music) { O.music.volume = 0.12; u.onend = u.onerror = function () { if (O.music) O.music.volume = 0.3; }; }
    speechSynthesis.speak(u);
  } catch (e) {}
};
O.stopTalk = function () { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} if (O.music) O.music.volume = 0.3; };

/* ---------------- input ---------------- */
// Two players can share one keyboard: P1 = WASD + Space/E + F/T, P2 = arrows + Enter + Shift.
// With one player, both sets drive farmhand 1. Controller 1 drives P1, controller 2 drives P2.
O.K = {}; O.PRESS = {};
function kd(e, down) {
  var k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === 'Shift' && e.location === 1) k = 'ShiftL';
  if (down && !O.K[k] && !e.repeat) O.PRESS[k] = 1; O.K[k] = down;
}
addEventListener('keydown', function (e) {
  var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  if (/^(Arrow|Enter|Tab)/.test(e.key) || e.key === ' ') e.preventDefault(); O.audio(); kd(e, true);
});
addEventListener('keyup', function (e) { kd(e, false); });
addEventListener('blur', function () { O.K = {}; if (O.onBlur) O.onBlur(); });
addEventListener('message', function (e) { if (e.source !== window.parent) return; var d = e.data || {}; if (d.arcade === 'key') { O.audio(); kd({ key: d.key, repeat: d.repeat }, d.type === 'keydown'); } });
O.pressed = function (list) { for (var i = 0; i < list.length; i++) if (O.PRESS[list[i]]) return true; return false; };
O.held = function (list) { for (var i = 0; i < list.length; i++) if (O.K[list[i]]) return true; return false; };
O.GP = [{ prev: {}, cur: {} }, { prev: {}, cur: {} }];
O.pollPads = function () {
  var ps = window.ArcadePad ? ArcadePad.pads() : [];
  for (var i = 0; i < 2; i++) { var g = O.GP[i]; g.prev = g.cur; g.cur = {}; if (ps[i]) { var r = ArcadePad.read(ps[i]); if (r) { g.cur = r; if (r.any) O.audio(); } } }
};
O.gpPress = function (b, i) { var g = O.GP[i || 0]; return g.cur[b] && !g.prev[b]; };
O.anyPadPress = function (b) { return O.gpPress(b, 0) || O.gpPress(b, 1); };
// a player's controls this frame
O.controls = function (pi, twoP, touch) {
  var ix = 0, iy = 0, act = false, actHeld = false, truck = false;
  var L = pi === 0 ? (twoP ? ['a'] : ['a', 'ArrowLeft']) : ['ArrowLeft'], R = pi === 0 ? (twoP ? ['d'] : ['d', 'ArrowRight']) : ['ArrowRight'];
  var U = pi === 0 ? (twoP ? ['w'] : ['w', 'ArrowUp']) : ['ArrowUp'], D = pi === 0 ? (twoP ? ['s'] : ['s', 'ArrowDown']) : ['ArrowDown'];
  var A = pi === 0 ? (twoP ? [' ', 'e', 'j'] : [' ', 'Enter', 'e', 'j']) : ['Enter', 'Shift'], Tk = pi === 0 ? (twoP ? ['f', 't'] : ['y', 't', 'f']) : ['/', '.'];
  if (O.held(L)) ix -= 1; if (O.held(R)) ix += 1; if (O.held(U)) iy -= 1; if (O.held(D)) iy += 1;
  var g = O.GP[pi].cur;
  if (g.lx && Math.abs(g.lx) > 0.2) ix += g.lx; else { if (g.left) ix -= 1; if (g.right) ix += 1; }
  if (g.ly && Math.abs(g.ly) > 0.2) iy += g.ly; else { if (g.up) iy -= 1; if (g.down) iy += 1; }
  if (pi === 0 && touch && touch.on) { ix += touch.x; iy += touch.y; }
  var m = Math.sqrt(ix * ix + iy * iy); if (m > 1) { ix /= m; iy /= m; m = 1; }
  act = O.pressed(A) || O.gpPress('a', pi) || (pi === 0 && O.PRESS.__act);
  actHeld = O.held(A) || !!g.a || (pi === 0 && O.TOUCHACT);
  truck = O.pressed(Tk) || O.gpPress('x', pi) || (pi === 0 && O.PRESS.__truck);
  return { x: ix, y: iy, m: m, act: act, held: actHeld, truck: truck };
};
})();
