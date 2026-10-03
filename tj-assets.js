/* Tre & Jada — asset map. voice = line id (node.index) -> MP3; voices = ContentPad Voice Lab ids (ElevenLabs clones of AI-designed voices) (ContentPad Vault, media.cpdblackbook.com). */
(function () {
  var P = 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/';
  function u(id, ext) { return P + id + '.' + (ext || 'png'); }
  window.TJ_ASSETS = {
    cover: u('f65c9ecd-ff8b-43cf-ab89-76f862120282'),
    bg: {
      apartment: u('0628a2d8-d6e0-47fb-a84c-a7648ab50e84'), brunch: u('704bc154-ff11-41d0-bdf1-5138a33fa3bb'),
      work: u('9ce6b550-84f1-42cf-a18b-8c19b6548e8a'), bedroom: u('46bedba4-0ec3-4396-b25f-0c3837fe84dd'),
      mall: u('c63ecdf0-d12f-4937-8e79-f1af5c5cdee1'), restaurant: u('4503d861-ba83-49f9-9671-a8daa93b86b8'),
      kitchen: u('fd2e81d9-0cd1-4cd5-9e8a-4f52217e1d8d'), rooftop: u('a5c0f411-2d8a-44fa-a2b5-ae96cd72ca71'),
      cabin: u('a0335734-b5e4-4a61-bae7-5850276cbed3'), stadium: u('0afdb923-49b8-4d82-bccb-3cc2e6d18d8c')
    },
    /* Green-screen sprites; keyed in the browser. crop = keep this fraction of the trimmed height (frames full-body art like the others). */
    sprite: {
      tre: { neutral: [u('2a15c7a9-19e5-4b04-b979-8bcd00079b9a'), 0.72], annoyed: u('534e92ab-b975-46cc-b20b-505235669258'),
        shocked: u('ec8e48de-bafe-484c-b869-b778fa49bc23'), nervous: u('69386155-df90-4a96-883c-e9e34087a099'),
        smug: u('fe5439f5-1258-4a11-9815-b9845f9b7c91'), defeated: u('ca6fa27b-ec62-4059-822d-9c6e5eaad2e5'),
        laugh: u('72cc0058-4e0b-40c4-82c0-ca88dbb7df62') },
      jada: { neutral: u('2c77e26f-d856-4117-8992-e297b353bf86'), mad: u('edc13e84-947b-4294-80ee-84570a3fcba4'),
        sideeye: u('c70bb232-bc28-4e07-96b2-e6b66099a95c'), laugh: u('b34adbb4-7d6f-4d8d-808f-914c65104d7a'),
        flirty: u('39edcddc-c4f1-4ef1-a96e-c2f116a4d301'), dramatic: u('e47799b9-126e-46d5-b009-90bba349bb31'),
        shocked: u('960041e4-a06b-4355-9d01-0f6c70eaa31a'), happy: u('ef1c7d0c-d774-4848-bf63-c2c2b82d021c') },
      tre_brunch: { neutral: [u('79147e2e-308c-44e3-961c-02c94c16b185'), 0.72], shocked: u('9a12c777-6a3d-4fde-98c1-4748dfc6a826'), annoyed: u('e33ebbc2-9759-4746-bf65-62f145a80d46'),
        defeated: u('67613f99-cef7-4bfc-bf9a-1dc65384acd5'), smug: u('03684b05-e5ec-4e46-9178-6effeb3274bc'), nervous: u('6a2b1ec9-8ab1-4757-b662-a47ce643cbfa') },
      tre_work: { neutral: [u('2e63a57a-b656-4db6-b012-05f6d58513da'), 0.72], annoyed: u('ab5db960-ee43-4621-bbf5-23b3a92a5e14'), defeated: u('b3870d3a-cdc3-4742-ab58-de0b283bda4b') },
      tre_date: { neutral: [u('70f344c2-063f-4acc-aa80-485364d59929'), 0.72], nervous: u('dc86898a-5a4d-4390-869e-9c8b68620a97'), defeated: u('22241a3d-ce98-4ece-adcb-752f057c3311'), smug: u('29904a4e-2d2e-4d03-a8af-c24d9eab2cd3') },
      tre_mama: { neutral: [u('1a4809a9-8a76-479d-bee4-d63646e63789'), 0.72], nervous: u('87e29ae9-6e57-452e-aad5-d8a62b5162d0'), smug: u('001003ec-63c3-4d0a-a836-1f63a04b14e1'), defeated: u('4bcadd3d-6b10-4967-9bcb-6f446dc87309') },
      tre_cabin: { neutral: [u('a19c598b-bd9a-412c-8a9c-441da2e19be5'), 0.72], annoyed: u('b79df641-aedd-42c7-90a9-ea499cacb163') },
      jada_brunch: { neutral: [u('130e09a6-b719-4d92-9c5a-f1277896e7bd'), 0.72], laugh: u('a3869508-2c86-4c2b-9032-3fccfaac701c'), flirty: u('f9fd67d2-09fb-4faf-96c6-0974104bc477'),
        happy: u('acb098a2-bdf0-4bf7-a58f-a53009c777a6'), mad: u('fa838a8f-ebd4-493b-a75e-18fbb3c773bf'), sideeye: u('7822bdbc-1d87-4270-bfd8-19c9bd7aa9c5'), dramatic: u('52b08e74-09af-428d-b99a-130aa3f62576') },
      jada_date: { neutral: [u('a0349dbc-96e1-4671-aff5-55a299d3cd1d'), 0.72], happy: u('53e2c88d-8bc9-418d-aee8-343f83c8c6db'), flirty: u('0ed25952-5b6c-4fae-9189-773e97afaeac'),
        sideeye: u('148d34c0-2980-4dc8-af08-9a21ce4963c6'), mad: u('65cc9c45-41f5-4f82-8780-3995a6375ae9'), shocked: u('126244ee-61ee-487f-8217-8acd12990492') },
      mike: { mike: u('9764a1b8-e9c3-4ad7-b58d-547f5baf6ae7') }, brenda: { brenda: u('425f4f57-1916-4a30-9c52-b9d134d0a93b') },
      marcus: { marcus: u('a31379e7-03f2-46a8-88cf-346fc37c5bbb') }, kiki: { friends: u('b35185dd-05f6-4ee2-b987-0d744685cf75') },
      deshawn: { deshawn: u('33df7243-7228-4910-b3c5-4dbe23712e76') }
    },

    /* Scenario outfits: base (full body, cropped to match) + expressions rendered from it. */
    outfits: {
      brunch: { tre: 'brunch', jada: 'brunch' }, work: { tre: 'work' }, restaurant: { tre: 'date', jada: 'date' },
      stadium: { tre: 'date', jada: 'date' }, kitchen: { tre: 'mama' }, cabin: { tre: 'cabin' }
    },
    /* Per-location colour grade (CSS filter on the cut-outs) + the room's light colour for the rim/light wrap. */
    grade: {
      apartment: ['sepia(.12) saturate(1.05) brightness(.97)', 'rgba(255,190,120,.18)'],
      brunch: ['sepia(.1) saturate(1.12) brightness(1.02)', 'rgba(255,170,140,.2)'],
      work: ['saturate(.95) brightness(1.02) hue-rotate(-4deg)', 'rgba(200,230,255,.14)'],
      bedroom: ['brightness(.78) saturate(.8) hue-rotate(8deg)', 'rgba(90,110,220,.28)'],
      mall: ['brightness(1.04) saturate(1.05)', 'rgba(255,240,220,.12)'],
      restaurant: ['brightness(.86) sepia(.25) saturate(1.1)', 'rgba(255,170,90,.24)'],
      kitchen: ['sepia(.15) saturate(1.05)', 'rgba(255,210,140,.18)'],
      rooftop: ['brightness(.8) saturate(.85) hue-rotate(10deg)', 'rgba(120,140,255,.25)'],
      cabin: ['sepia(.18) saturate(.95)', 'rgba(255,200,160,.2)'],
      stadium: ['brightness(.9) saturate(1.1) hue-rotate(-8deg)', 'rgba(255,110,190,.22)']
    },
    /* Animated scenes: the cast is painted into a looping clip; speakers get a face window. */
    cg: { brunch: u('408a83f4-4538-400e-995f-325318ef76ab', 'mp4') },
    music: {
      theme: u('a26d0969-3969-4897-9bbf-f9c493e1c6a1', 'mp3'),
      brunch: u('8e40e9fd-7b3e-4ea6-ae23-1bd73a6e0f17', 'mp3'),
      work: u('d92ef65f-78e0-408a-85d9-754be1692e08', 'mp3'),
      tense: u('d2cb5ddf-b3e9-4cc1-89dc-3a9f100aec83', 'mp3'),
      mall: u('98d59d6c-b7e5-439c-9752-60dc7a10fb3f', 'mp3'),
      date: u('f7761f90-65dd-4e0c-a955-b69f28af8ad8', 'mp3'),
      win: u('defe2ece-3aab-4eef-bb93-d542c045a36a', 'mp3'),
      sad: u('f045d333-43be-482b-8002-f0205d96ab2a', 'mp3')
    },
    voice: {
      'mon_intro.1': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/d1349beb-3e6c-47ce-bb7b-9b34a5afefba.mp3',
      'mon_intro.2': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/4281deab-d11a-4586-91a5-b4869fce95fa.mp3',
      'mon_intro.3': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/1e036596-46e8-4f71-9185-1bc52c490a6f.mp3',
      'mon_intro.4': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/23b9bdd4-6e0b-4a9d-bf83-fa0337e7f487.mp3',
      'mon_intro.5': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/374d2cc5-a36d-4b8d-8bad-3a47427c3727.mp3',
      'mon_brunch.1': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/ab809102-70e5-4a80-822f-437c09de8cf7.mp3',
      'mon_brunch.3': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/2da53004-2291-4e5d-89e0-4ace46c2ef89.mp3',
      'mon_brunch.4': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/0d53484c-ca77-4887-a56f-508b3460ebd8.mp3',
      'mon_brunch.6': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/c97accf5-95f4-498e-8d2a-6f585f1b4d5e.mp3',
      'mon_brunch.9': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/deb4266e-41c9-4a48-93b7-1740dd0b3386.mp3',
      'mon_brunch.10': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/4ee593be-2dcc-463d-864f-b6504c9133a8.mp3',
      'mon_pay.0': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/cb2158c0-612b-4b65-af22-2355dc46c008.mp3',
      'mon_pay.2': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/b9200ed1-d3b4-4540-ae78-3b7a10447be6.mp3',
      'mon_pay.3': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/dea752e8-1ef5-4698-8182-de401b13b218.mp3',
      'mon_pay.4': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/4f0d0c7b-696f-402d-b2ee-2bd6ed2cd395.mp3',
      'mon_pay.5': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/7a135211-e40c-4783-98a7-294ec1357c5d.mp3',
      'mon_split.0': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/5e99e63d-cd72-498c-97d0-c0e35e1401ec.mp3',
      'mon_split.2': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/d58349ce-41da-4424-9bc7-d13c4918a768.mp3',
      'mon_split.3': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/fda7bd1b-5c59-401c-9258-f35a38ba98d0.mp3',
      'mon_split.4': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/a80e1226-ef9a-4b86-b035-8a64850d59da.mp3',
      'mon_fake.0': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/683b3f5a-5c31-46f3-91b2-8e1206d96875.mp3',
      'mon_fake.1': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/5c66a9e8-8ab4-4173-9213-2c8d185b231f.mp3',
      'mon_fake.2': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/63fc9f7e-f7c3-4b4a-8f5d-214046707acb.mp3',
      'mon_fake.4': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/781e2a60-31a8-4137-b40d-1ed11fac4f7c.mp3',
      'mon_brunch.2': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/97aaa71d-db54-4f17-96cd-106ec1beb686.mp3',
      'mon_brunch.5': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/0d77292f-89ff-40ef-8cdd-53da721c6665.mp3',
      'mon_brunch.7': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/871e2585-a4b9-4e06-9c09-c7d2d5142011.mp3',
      'mon_pay.1': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/6f7e1005-6af6-455b-9f75-4207fb94bb9b.mp3',
      'mon_split.1': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/99aa129c-b1fa-4a08-87b1-57bd08a09337.mp3',
      'mon_fake.3': 'https://media.cpdblackbook.com/a2a988e8-fbbd-4510-8238-b1c311f61608/1cca0127-86d7-4c24-8092-ccb7595033a2.mp3'
    },
    voices: { tre: '352c8208-4d67-46fc-a848-330b979ad394', jada: '48030710-48dd-46be-8f29-45839ad7b3a1', kiki: 'be2364c1-f41b-4b17-8ca7-ce16ed9af398', mike: '0d5d6727-c7a1-4390-b3d4-dd985be16b84', brenda: '8edd875c-8846-406e-ade2-444a5730e5b0', marcus: '6d275554-2443-4cea-b59e-bc54b8e01d8b', deshawn: 'e42da1ac-5137-4c47-b039-74d712013bc0' }
  };
})();
