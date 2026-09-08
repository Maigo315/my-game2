
(() => {
  const DEV_VERSION = "v0.46v";
  const SAVE_SCHEMA_VERSION = 9;
  const SAVE_SLOT_COUNT = 3;
  const SAVE_KEY_PREFIX = "milesta_save_v1_slot_";
  let saveUiContext = "milesta";
  let saveUiMode = "save";
  let initialGameSnapshot = null;
  const state = {
    gold: 0,
    items:{
      potion:0,highPotion:0,exPotion:0,lastPotion:0,
      magicHerb:0,magicCondenseGrass:0,spiritDew:0,
      antidote:0,panacea:0,lifeStone:0,phoenixTail:0,
      polishDrink:0,guardDrink:0,magicDrink:0,blockDrink:0,quickDrink:0,superDrink:0,palioCocktail:0,
      cleanBall:0,mountOil:0,superOil:0,auraGear:0,auraMachine:0,
      poisonGasBottle:0,smokeBomb:0,sealingCrystal:0,
      returnFeather:0,holyWater:0,emergencyEscapePack:0,deliciousMilk:0,granzerBadge:0,
      demonFireSeed:0,restCross:0,mysteriousMap:0,changeCube:0,healLeaf:0,
      powerSeed:0,guardSeed:0,intellectSeed:0,spiritSeed:0,speedSeed:0,fateSeed:0,lifeSeed:0,magicSeed:0,allSeed:0
    },
    currentShop:null,
    shopMode:"buy",
    shopSelectedKey:null,
    travelMerchantMet:false,
    limitedShopPurchases:{},
    limitedMapTreasures:{},
    caveUnlocked:false,
    caveBossDefeated:false,
    selectedArea: "plains",
    currentTown: "milesta",
    run: null,
    battleReturn: "homeScreen",
    battleFromRun: false,
    battleActorSlot: 0,
    battleFormationArea: "plains",
    battleFormationIndex: 0,
    battleActive: ["hero"],
    battleReserve: [],
    battleEnemies: [],
    battleRound: 1,
    battleTurnSlot: 0,
    battlePhase: "input",
    battleEnded: false,
    battleDirectTest: false,
    battleActions: [null,null,null,null],
    battleTargetMode: null,
    battleSpeed: 1,
    battleAutoContinuous: false,
    battleAutoStartTimer: null,
    battleTestSnapshot: null,
    devSkillTestSnapshot: null,
    devForceRecruit: false,
    eventFlags: {},
    prologueStage: 0,
    storyEventRuntime: null,
    ownedSpecies: new Set(),
    recruitedWaiting: [],
    battleVictoryData: null,
    battleDefeatCounter: 0,
    escapeAttempts: 0,
    escapeBaseRate: null,
    battleEscapeDisabled: false,
    battleSpecial: null,
    partySelection: null,
    partyManageContext: "milesta",
    partyWaitingViewOpen: false,
    partyDetailCharacterId: "hero",
    characterDetailTab: "status",
    equipmentSlot: "weapon",
    equipmentPreviewId: null,
    equipmentCompareMode: "stats",
    equipmentPickerScrollTop: 0,
    exploreSkillActorId: null,
    exploreSkillId: null,
    exploreItemId:"potion",
    pendingRecruitCandidate: null,
    fortuneCasts: 0
  };

  const ELIZA_EVENT_IMG = 'assets/npcs/eliza_event.webp';
  const NPC_OLDMAN_IMG = "assets/npcs/oldman.webp";


  const NPC_GIRL_IMG = "assets/npcs/girl.webp";
  const NPC_SOLDIER_IMG = "assets/npcs/soldier.webp";
  const NPC_BOY_IMG = "assets/npcs/boy.webp";
  const NPC_OLDWOMAN_IMG = "assets/npcs/oldwoman.webp";
  const NPC_YOUNGMAN_IMG = "assets/npcs/youngman.webp";
  const NPC_YOUNGWOMAN_IMG = "assets/npcs/youngwoman.webp";

  const STORY_EVENTS = {
    milestaIntroEliza: {
      completionFlag:"milestaIntroDone",
      steps:[
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"どうしたの？ぼーっとして。"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"18歳になった{{hero}}には、今日から洞窟でのお仕事も手伝ってもらうからね！"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"さ、準備はいい？",choices:[{label:"はい",goto:"yes"},{label:"いいえ",goto:"no"}]},
        {type:"label",id:"yes"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"……って、あれ？武器が無いじゃん。"},
        {type:"jump",goto:"common"},
        {type:"label",id:"no"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"あ、そっか。武器が無いよね。"},
        {type:"label",id:"common"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`{{hero}}も知っての通り、ミレスタの外には魔物娘が出るからね。\nちゃんとお店で買って、装備するんだよ？`},
        {type:"dialogue",speaker:"主人公",text:"……！"},
        {type:"system",text:"『{{hero}}はエリザから100Gをもらった！』",effects:[{type:"gold",amount:100}]},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`じゃあ、町の門で集合！\n私は先に行ってるね！`},
        {type:"tutorial",title:"📌 次の目的",text:`ショップで武器を買って、「世界マップ」からミレスタ平原へ向かいましょう。\n装備は買っただけでは装備されません。「仲間編成→詳細を見る」からキャラ詳細画面を呼び出して装備させましょう。`,effects:[{type:"stage",value:1}]},
        {type:"end"}
      ]
    },
    plainsDepartEliza: {
      after:"startElizaPlains",
      steps:[
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`お、来たね！\nそれじゃあ行こっか！`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`大丈夫大丈夫。今日は私もついて行くから。\nあ、でも先頭は任せるね。洞窟までは迷わないはずだし。`},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"よし！さっそく行ってみよう！"},
        {type:"end"}
      ]
    },
    plainsPrologueEnd: {
      steps:[
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`着いたね！\n洞窟の中には、ナメクジ娘たちがいるから……`},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"あれ……？"},
        {type:"dialogue",speaker:"主人公",text:"……？"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"……何、この気配。"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`{{hero}}、悪いけど、今日は帰って。\nちょっと変な感じがするの。`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`ごめんごめん！\nお仕事はまた今度教えるから！`},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`大丈夫。\nちょっと中を調べたら、私もすぐ帰るから。`},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"じゃ、ちょっと行ってくるね！"},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"system",text:`『エリザは洞窟の中へと走っていった……。\n{{hero}}は彼女の言葉に従って、ミレスタの町へと帰ることにした。』`,effects:[{type:"leaveEliza"},{type:"stage",value:3},{type:"returnMilesta"}]},
        {type:"narration",text:`その夜、{{hero}}はエリザの帰りを待ち続けた。\nしかし、一向に帰ってくることはなく、夜が明けた……。`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`ふむ……丸一日経ったというのに、エリザは帰ってこないか……。\n洞窟で何かあったのかもしれんな。`},
        {type:"dialogue",speaker:"主人公",text:"……！"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`何？自分が様子を見てくるだと？\nしかしお主はまだ18になったばかり……`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`……いや。止めても無駄か。\nせめてこれを持って行くといい。`},
        {type:"system",text:"『{{hero}}は町長から「ポーション×2」と「帰還の羽」をもらった！』",effects:[{type:"item",id:"potion",amount:2},{type:"item",id:"returnFeather",amount:1},{type:"stage",value:4}]},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`帰還の羽は、瞬時に町に戻ることができる、冒険の必需品だ。\n……気をつけて行ってくるのだぞ。`},
        {type:"end"}
      ]
    },
    caveBossIntro: {
      after:"startCaveBossBattle",
      steps:[
        {type:"dialogue",speaker:"主人公",text:"エリザ……！"},
        {type:"system",text:"『{{hero}}は、洞窟の奥で倒れているエリザを見つけた！』"},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:`{{hero}}……！？\nだめ、逃げて……！`},
        {type:"dialogue",speaker:"？？？",portraitId:"vanguard",text:`あれ〜？また人間？\nもうボク疲れてるんだけど……。`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"？？？",portraitId:"vanguard",text:`まあいいや。\nキミ弱そうだし。キミもボッコボコにしてあげる！`},
        {type:"dialogue",speaker:"エリザ",portrait:ELIZA_EVENT_IMG,text:"だめ……この魔物娘、魔界の……"},
        {type:"dialogue",speaker:"？？？",portraitId:"vanguard",text:`あはは！そっちのお姉さんは強かったけど、キミはどうかな？\nちょっと遊んであげる！`},
        {type:"end"}
      ]
    },
    caveBossAfter: {
      steps:[
        {type:"dialogue",speaker:"魔界の尖兵",portraitId:"vanguard",text:`っ……！なんだ、やるじゃん。\nしかも……`},
        {type:"dialogue",speaker:"魔界の尖兵",portraitId:"vanguard",text:`魔物娘を連れてる……！？\nもしかして、キミが『扉』を……`},
        {type:"dialogue",speaker:"魔界の尖兵",portraitId:"vanguard",text:"…………"},
        {type:"dialogue",speaker:"魔界の尖兵",portraitId:"vanguard",text:`まあ、いいや。\nボクは『扉』が開いてたからちょっと遊びに来ただけだし。もう帰ろっと`},
        {type:"dialogue",speaker:"主人公",text:"……？"},
        {type:"dialogue",speaker:"魔界の尖兵",portraitId:"vanguard",text:`じゃーね！魔縁者のお兄さん！\nまた『扉』開いてよ！`},
        {type:"system",text:"『魔界の尖兵はどこかに去って行った……。』"},
        {type:"dialogue",speaker:"主人公",text:"……！"},
        {type:"system",text:`『{{hero}}はエリザの方へ振り返る。\nしかし……』`},
        {type:"dialogue",speaker:"主人公",text:"……！？"},
        {type:"system",text:`『そこにエリザの姿はなかった。\nその代わりに、血痕の近くに上質なバッジのようなものが落ちている。』`},
        {type:"dialogue",speaker:"主人公",text:"……"},
        {type:"system",text:"『{{hero}}はそれを拾い上げた。』",effects:[{type:"item",id:"granzerBadge",amount:1}]},
        {type:"system",text:"『⚜️「グランゼルのバッジ」を手に入れた！』"},
        {type:"system",text:"『{{hero}}は洞窟を後にしてミレスタの町へと戻るのだった。』",effects:[{type:"returnMilesta"}]},
        {type:"narration",text:"―― ミレスタの町 ――"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`ほう……そんなことが。\nエリザ……`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`そのバッジに刻まれている国章は、グランゼル王国のものだ。それも、王国軍が使っているバッジ……。\nエリザの失踪に、グランゼル軍が関係している可能性は高い。`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:"……わかっておる。行くのだな。"},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`お前にとってエリザがどれだけ大切な存在か。よく分かっているつもりだ。\nだから……儂も止はしない。`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`だが用心するのだ。\n大国グランゼルが関わっているとなると……一筋縄ではいかないかもしれん。`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`グランゼル城下町までは長旅になる。\nまずは、洞窟の横道を抜け、港町ヨーディーに向かうのだ。`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`今は岩壁で塞がれていたはずだが……町の者に言ってどけさせてやる。\n気をつけて行くのだぞ。`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"system",text:"『{{hero}}は町長に向かって、深く頭を下げた。』"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:"ときにお主……魔縁者として目覚めたようだな？"},
        {type:"dialogue",speaker:"主人公",text:"……？"},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`今は知らずともよい。\nだが、お主は数奇な運命を背負っているようだ。`},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`儂もできる限り協力しよう。\n仲間にした魔物娘がこれ以上連れていけないという時も来るだろう。その時は、こちらで面倒を見よう。`},
        {type:"tutorial",title:"📌 ミレスタ待機が使用できるようになりました。",text:`仲間編成から、魔物娘をミレスタに預けることができます。預けた魔物娘は、ミレスタから連れて行くこともできます。`,effects:[{type:"flag",key:"milestaWaitingUnlocked",value:true},{type:"flag",key:"caveSidepathUnlocked",value:true},{type:"flag",key:"prologueComplete",value:true},{type:"stage",value:6}]},
        {type:"dialogue",speaker:"町長",silhouette:NPC_OLDMAN_IMG,text:`くれぐれも無理はするでないぞ。\nいつでも帰ってくるといい。`},
        {type:"system",text:"『{{hero}}はもう一度頭を下げると、町長に見送られながら、その場を後にした。』"},
        {type:"end"}
      ]
    },
    recruitTutorial: {
      completionFlag:"recruitTutorialDone",
      steps:[
        {type:"tutorial",title:"📌 魔物娘の勧誘",text:`戦闘に勝利すると、倒した魔物娘が起き上がることがあります。
起き上がった魔物娘は仲間にすることができます。`},
        {type:"end"}
      ]
    },
    granzelArrivalPoster: {
      completionFlag:"granzelArrivalPosterDone",
      steps:[
        {type:"dialogue",speaker:"主人公",text:"……？"},
        {type:"system",text:"『グランゼル城下町に到着した{{hero}}は、一枚の貼り紙に気付いた。』"},
        {type:"system",text:`『魔縁者を見つけたら、王国軍まで。
魔物娘を呼ぶ危険な存在です。決して近付かないでください。』`},
        {type:"dialogue",speaker:"主人公",text:"…………"},
        {type:"system",text:"『{{hero}}は、この町では仲間たちを隠して歩くことにした。』",effects:[{type:"flag",key:"granzelCompanionsHidden",value:true}]},
        {type:"end"}
      ]
    }
  };

  const TRAVEL_MERCHANT_IMG = "assets/npcs/travel_merchant.webp";

  const IMG = {
    hero: "assets/characters/hero.webp",
    slime: "assets/characters/slime.webp",
    slimebes: "assets/characters/slimebes.webp",
    poison: "assets/characters/poison.webp",
    dog: "assets/characters/dog.webp",
    slug: "assets/characters/slug.webp",
    fairy: "assets/characters/fairy.webp",
    harpy: "assets/characters/harpy.webp",
    momo: "assets/characters/momo.webp",
    arachne: "assets/characters/arachne.webp",
    alraune: "assets/characters/alraune.webp",
    rabbit: "assets/characters/rabbit.webp",
    demon: "assets/characters/demon.webp",
    golem: "assets/characters/golem.webp",
    elf: "assets/characters/elf.webp",
    sylph: "assets/characters/sylph.webp",
    owl: "assets/characters/owl.webp",
    moth: "assets/characters/moth.webp",
    forestMage: "assets/characters/forest_mage.webp",
    silverSlime: "assets/characters/silver_slime.webp",
    maidDevil: "assets/characters/maid_devil.webp",
    lamia: "assets/characters/lamia.webp",
    poisonArachne: "assets/characters/poison_arachne.webp",
    ghost: "assets/characters/ghost.webp",
    karen: "assets/characters/karen.webp",
    sheep: 'assets/characters/sheep.webp',
    lindwurm: 'assets/characters/lindwurm.webp',    madGolem: "assets/characters/mad_golem.webp",
    scylla: "assets/characters/scylla.webp",
    mimic: "assets/characters/mimic.webp",
    podalge: "assets/characters/podalge.webp",
    mermaid: "assets/characters/mermaid.webp",
    kitsune: "assets/characters/kitsune.webp",
    lloyd: "assets/characters/lloyd.webp",
    dogu: "assets/characters/dogu.webp",
    desertDog: "assets/characters/desert_dog.webp",
    hotSandTentacle: "assets/characters/hot_sand_tentacle.webp",

    prominence: "assets/characters/prominence.webp",
    magmaSlug: "assets/characters/magma_slug.webp",
    scorpion: "assets/characters/scorpion.webp",
    dragon: "assets/characters/dragon.webp",

  };

  const HELLHOUND_IMG = "assets/characters/hellhound.webp";

  const NODE = {
    start:  {icon:"⬆", label:"入口", color:"#386a62"},
    battle: {icon:"⚔", label:"戦闘", color:"#7a3d42"},
    chest:  {icon:"🪎", label:"宝箱", color:"#7a6638"},
    mimicChest:{icon:"🪎", label:"宝箱", color:"#17131b"},
    heal:   {icon:"❤", label:"回復", color:"#3d7355"},
    shop:   {icon:"🛒", label:"ショップ", color:"#53608b"},
    event:  {icon:"？", label:"イベント", color:"#664c7c"},
    healLeafGoal:{icon:"🍃",label:"ヒールリーフ",color:"#3f7652"},
    empty:  {icon:"·", label:"何もない", color:"#40505a"},
    stairs: {icon:"⬇", label:"第二層へ", color:"#496d78"},
    sidepath:{icon:"🪨", label:"崩れた岩壁", color:"#665d55"},
    yodyStart:{icon:"⚓", label:"港町ヨーディー側", color:"#386a62"},
    yodyPort:{icon:"⚓", label:"港町ヨーディー", color:"#4f7182"},
    yodyMountain:{icon:"⛰️", label:"ヨーディー山道", color:"#765f49"},
    yodyFootpath:{icon:"🌿", label:"麓の小道", color:"#547153"},
    mountainBoss:{icon:"👑", label:"強敵", color:"#8a4c4c"},
    tilenoExit:{icon:"★", label:"ティレーノ地方へ", color:"#5f735c"},
    tilenoMountainStart:{icon:"⛰️", label:"ヨーディー山道側", color:"#5f735c"},
    tilenoTown:{icon:"🏘️", label:"ティレーノの街", color:"#4f7182"},
    tilenoWetland:{icon:"🌾", label:"ティレーノ湿原", color:"#516d61"},
    tilenoToxicWetland:{icon:"☠️", label:"ティレーノ毒湿地", color:"#574368"},
    toxicGate:{icon:"💀", label:"冒険者たちの跡", color:"#5c4b43"},
    toxicBoss:{icon:"☠️", label:"毒の魔物娘", color:"#713653"},
    zelrenoForest:{icon:"🌲", label:"ゼルレーノ森林地帯", color:"#456b4c"},
    granzelPlains:{icon:"🌾", label:"グランゼル大平原", color:"#8b7b4d"},
    granzelTown:{icon:"🏰", label:"グランゼル城下町", color:"#b18b58"},
    iceCorridor:{icon:"❄️", label:"氷雪の回廊", color:"#83b7d2"},
    runelCavern:{icon:"🪨", label:"ルネル岩窟", color:"#8a6f58"},
    restiaBorder:{icon:"🧭", label:"レスティア国境", color:"#5d4b5e"},
    runelExit:{icon:"★", label:"ルネル地方へ", color:"#7a6b45"},
    runelTown:{icon:"🏘️", label:"ルネルの街", color:"#6f7f5a"},
    runelRuins:{icon:"🏚️", label:"ルネルパリオ城下町跡", color:"#6d6257"},
    runelRuinsBoss:{icon:"🐍", label:"黒蛇", color:"#34272f"},
    fairyGrove:{icon:"✨", label:"妖精郷への森", color:"#4e725d"},
    forestBlockedPath:{icon:"🌳", label:"倒木の分岐", color:"#5d4932"},
    forestDeepBoss:{icon:"🦉", label:"魔物娘", color:"#66546f"},
    salidPreview:{icon:"🏜️", label:"サリード砂漠", color:"#8b7544"},
    goal:   {icon:"★", label:"最奥", color:"#8d7136"}
  };

  const MOB_MERCHANT_IMG = "assets/npcs/mob_merchant.webp";

  const MILESTA_TALK_NPCS = [
    {id:"girl",name:"少女",gender:"female",silhouette:NPC_GIRL_IMG},
    {id:"oldman",name:"おじいさん",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"merchant",name:"商人",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"soldier",name:"兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"boy",name:"少年",gender:"male",silhouette:NPC_BOY_IMG},
    {id:"oldwoman",name:"おばあさん",gender:"female",silhouette:NPC_OLDWOMAN_IMG},
    {id:"youngman",name:"若者",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"lady",name:"お姉さん",gender:"female",silhouette:NPC_YOUNGWOMAN_IMG}
  ];
  const YODY_TALK_NPCS = [
    {id:"yodyYoungman",name:"若者",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"yodySailor",name:"船乗り",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"yodyWoman",name:"女性",gender:"female",silhouette:NPC_YOUNGWOMAN_IMG},
    {id:"yodySoldier",name:"兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"yodyAdventurer",name:"女冒険家",gender:"female",silhouette:NPC_GIRL_IMG},
    {id:"yodyBrother",name:"お兄さん",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"yodyTreasureHunter",name:"トレジャーハンター",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"yodyCaptain",name:"サリード連絡船船長",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"yodyBoy",name:"少年",gender:"male",silhouette:NPC_BOY_IMG}
  ];
  const TILENO_TALK_NPCS = [
    {id:"tilenoYoungman",name:"若者",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"tilenoGuildStaff",name:"冒険者ギルド職員",gender:"female",silhouette:NPC_YOUNGWOMAN_IMG},
    {id:"tilenoSoldier",name:"兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"tilenoOldwoman",name:"おばあさん",gender:"female",silhouette:NPC_OLDWOMAN_IMG},
    {id:"tilenoFemaleAdventurer",name:"女冒険者",gender:"female",silhouette:NPC_GIRL_IMG},
    {id:"tilenoBrother",name:"お兄さん",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"tilenoAdventurer",name:"冒険者",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"tilenoOldman",name:"おじいさん",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"tilenoBoy",name:"少年",gender:"male",silhouette:NPC_BOY_IMG}
  ];

  const KUNPUTEI_TALK_NPCS = [
    {id:"kunputeiOwner",name:"薫風亭の主人",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"kunputeiAdventurer",name:"冒険者",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"kunputeiFemaleAdventurer",name:"女冒険者",gender:"female",silhouette:NPC_GIRL_IMG}
  ];

  const RUNEL_TALK_NPCS = [
    {id:"runelYoungman",name:"青年",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"runelGirl",name:"少女",gender:"female",silhouette:NPC_GIRL_IMG},
    {id:"runelOldman",name:"老人",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"runelSoldier",name:"兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"runelHistoryMan",name:"歴史好きな男",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"runelLady",name:"お姉さん",gender:"female",silhouette:NPC_YOUNGWOMAN_IMG},
    {id:"runelTreasureHunter",name:"トレジャーハンター",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"runelMerchant",name:"商人",gender:"male",silhouette:MOB_MERCHANT_IMG}
  ];

  const GRANZEL_KING_IMG = "assets/npcs/granzel_king.webp";
  const MARGARET_IMG = "assets/npcs/margaret.webp";

  const GRANZEL_TALK_NPCS = [
    {id:"granzelYoungman",name:"若者",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"granzelGirl",name:"少女",gender:"female",silhouette:NPC_GIRL_IMG},
    {id:"granzelSoldier",name:"兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelBrother",name:"お兄さん",gender:"male",silhouette:NPC_YOUNGMAN_IMG},
    {id:"granzelOldman",name:"おじいさん",gender:"male",silhouette:NPC_OLDMAN_IMG},
    {id:"granzelAdventurer",name:"冒険家",gender:"male",silhouette:MOB_MERCHANT_IMG},
    {id:"granzelLady",name:"お姉さん",gender:"female",silhouette:NPC_YOUNGWOMAN_IMG},
    {id:"granzelGrimSoldier",name:"険しい顔の兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelCastleGate",name:"グランゼル城へ",gender:"male",silhouette:NPC_SOLDIER_IMG}
  ];
  const GRANZEL_CASTLE_TALK_NPCS = [
    {id:"granzelCastleEntranceSoldier",name:"入口の兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelCastleDepressedSoldier",name:"落ち込む兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelCastleWhisperSoldiers",name:"ひそひそ話す兵士たち",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelCastleDrunkSoldier",name:"酒を飲む兵士",gender:"male",silhouette:NPC_SOLDIER_IMG},
    {id:"granzelKing",name:"グランゼル王",gender:"male",portrait:GRANZEL_KING_IMG},
    {id:"granzelMargaret",name:"マーガレット",gender:"female",portrait:MARGARET_IMG}
  ];

  const screens = [...document.querySelectorAll(".screen")];
  const $ = id => document.getElementById(id);

  function showScreen(id){
    screens.forEach(s => s.classList.toggle("active", s.id === id));
    document.body.classList.toggle("title-mode",id==="titleScreen");
    document.body.classList.toggle("battle-mode",id==="battleScreen");
  }
  const TOWN_INFO={
    milesta:{name:"辺境の町ミレスタ",shortName:"ミレスタ",shop:"town"},
    yody:{name:"港町ヨーディー",shortName:"港町ヨーディー",shop:"yordy"},
    tileno:{name:"ティレーノの街",shortName:"ティレーノの街",shop:"tileno"},
    granzel:{name:"グランゼル城下町",shortName:"グランゼル城下町",shop:"granzel"},
    runel:{name:"ルネルの街",shortName:"ルネルの街",shop:"runel"},
    kunputei:{name:"薫風亭",shortName:"薫風亭",shop:"kunputei"}
  };
  function normalizeTownKey(town){ return town==="yody"?"yody":town==="tileno"?"tileno":town==="granzel"?"granzel":town==="runel"?"runel":town==="kunputei"?"kunputei":"milesta"; }
  function townInfo(town=state.currentTown){ return TOWN_INFO[normalizeTownKey(town)]; }
  function townDisplayName(town=state.currentTown){ return townInfo(town).shortName; }
  function waitingAccessAllowed(){ return state.partyManageContext==="milesta" && waitingUnlocked(); }
  function maybeStartGranzelArrivalPoster(){
    if(state.currentTown!=="granzel" || !state.eventFlags?.granzelTownReached || state.eventFlags?.granzelArrivalPosterDone || state.storyEventRuntime) return;
    setTimeout(()=>{
      if(state.currentTown==="granzel" && state.eventFlags?.granzelTownReached && !state.eventFlags?.granzelArrivalPosterDone && !state.storyEventRuntime){
        startStoryEvent("granzelArrivalPoster",{force:true});
      }
    },80);
  }
  function showTownScreen(town=state.currentTown){
    state.currentTown=normalizeTownKey(town);
    const info=townInfo();
    if($("townHomeTitle")) $("townHomeTitle").textContent=info.name;
    if($("topTitle")) $("topTitle").textContent=info.name;
    if($("topSubtitle")) $("topSubtitle").textContent=`${info.shortName} ${DEV_VERSION}`;
    if($("goWorld")) $("goWorld").innerHTML=state.currentTown==="kunputei"?'<span class="icon">🚪</span>出発する':'<span class="icon">🗺️</span>世界マップ';
    showScreen("homeScreen");
    updateHeader();
    maybeStartGranzelArrivalPoster();
  }
  function enterTown(town,message=""){
    state.currentTown=normalizeTownKey(town);
    if(state.currentTown==="yody"){
      state.eventFlags.yodyPortReached=true;
      state.eventFlags.yodyRegionUnlocked=true;
      state.selectedArea="yodyTown";
    }else if(state.currentTown==="tileno"){
      state.eventFlags.tilenoTownReached=true;
      state.eventFlags.tilenoRegionReached=true;
      state.selectedArea="tilenoTown";
    }else if(state.currentTown==="granzel"){
      state.eventFlags.granzelTownReached=true;
      state.eventFlags.granzelPlainsReached=true;
      state.selectedArea="granzelTown";
    }else if(state.currentTown==="runel"){
      state.eventFlags.runelTownReached=true;
      state.eventFlags.runelRegionReached=true;
      state.selectedArea="runelTown";
    }else state.selectedArea="milestaTown";
    state.run=null;
    restorePartyFull();
    updateWorld();
    showTownScreen(state.currentTown);
    if(message) toast(message);
  }
  function returnToMilestaFromExploration(message="ミレスタへ帰還しました"){
    state.currentTown="milesta";
    state.selectedArea="milestaTown";
    finishRun(message);
  }
  function updateHeader(){
    $("goldText").textContent = state.gold;
    const potionText=$("potionText"); if(potionText) potionText.textContent = itemCount("potion");
    const exploreItemBtn=$("exploreItemBtn");
    if(exploreItemBtn) exploreItemBtn.textContent=`🎒 所持品`;
    const featherCount=$("returnFeatherCount");
    if(featherCount) featherCount.textContent=`×${itemCount("returnFeather")}`;
    $("cavePin").classList.toggle("locked", !state.caveUnlocked);
  }
  function toast(msg){
    const t=$("toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove("show"),2000);
  }
  function showShopFeedback(msg,kind="buy") {
    const el=$("shopFlash");
    if(!el) return;
    el.textContent=msg;
    el.className=`shop-flash show${kind==="sell"?" sell":""}`;
    clearTimeout(el._timer);
    el._timer=setTimeout(()=>{ if(el) el.className="shop-flash"; },1600);
  }
  function modal(title, body, actions=[["OK", closeModal]]){
    $("modalTitle").textContent=title;
    $("modalBody").textContent=body;
    const box=$("modalActions"); box.innerHTML="";
    actions.forEach(([label, fn, cls, disabled])=>{
      const b=document.createElement("button");
      b.className="small-btn"+(cls ? " "+cls : "");
      b.textContent=label;
      b.disabled=!!disabled;
      b.onclick=fn;
      box.appendChild(b);
    });
    $("modal").classList.add("show");
  }
  function closeModal(){ $("modal").classList.remove("show"); }

  function prologueStage(){ return Number(state.prologueStage)||0; }
  function recruitmentUnlocked(){ return prologueStage()>=4; }
  function recruitTutorialDone(){ return !!state.eventFlags?.recruitTutorialDone || !!state.caveUnlocked || !!state.caveBossDefeated; }
  function returnFeatherUnlocked(){ return prologueStage()>=4 && recruitTutorialDone(); }
  function waitingUnlocked(){ return !!state.eventFlags?.milestaWaitingUnlocked; }
  function resetElizaEscortState(){
    const c=roster?.eliza;if(!c)return;
    c.level=30;c.exp=0;c.fate=20;
    ensureCharacterFinalVariation(c);
    c.stats=mutableStatsFromFormal(characterProfiles.eliza,30,c.finalVariation);
    c.equipment={weapon:"dagger",shield:"wood_shield",body:"milesta_clothes",accessory:"no_accessory"};
    const mods=equipmentStatDelta(c);
    Object.entries(mods).forEach(([k,v])=>{if(k in c.stats)c.stats[k]+=v;});
    c.stats.hp=c.stats.hpMax;c.stats.mp=c.stats.mpMax;
    c.learnedSkills=["ice","frost","cold","heal","allHeal"];
    clearBattleOnlyStates(c,{preservePoison:false});
  }
  function joinElizaEscort(){
    resetElizaEscortState();
    state.battleActive=state.battleActive.filter(id=>id!=="eliza");
    state.battleReserve=state.battleReserve.filter(id=>id!=="eliza");
    if(state.battleActive.length>=4){
      const idx=[...state.battleActive].reverse().findIndex(id=>id!=="hero");
      const actual=idx<0?state.battleActive.length-1:state.battleActive.length-1-idx;
      const displaced=state.battleActive.splice(Math.max(0,actual),1)[0];
      if(displaced && displaced!=="hero"){
        if(state.battleReserve.length<6) state.battleReserve.push(displaced);
        else if(!state.recruitedWaiting.includes(displaced)) state.recruitedWaiting.push(displaced);
      }
    }
    state.battleActive.push("eliza");
    ensureHeroTravelMember();
  }
  function leaveElizaEscort(){
    state.battleActive=state.battleActive.filter(id=>id!=="eliza");
    state.battleReserve=state.battleReserve.filter(id=>id!=="eliza");
    ensureHeroTravelMember();
  }
  function returnMilestaForStory(){
    state.run=null;
    state.battleSpecial=null;state.battleEscapeDisabled=false;
    state.currentTown="milesta";
    state.selectedArea="milestaTown";
    restorePartyFull();
    updateWorld();showTownScreen("milesta");
  }

  function normalizeHeroName(value){
    return Array.from(String(value??"").trim()).slice(0,8).join("");
  }
  function escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function storyHeroName(){
    return normalizeHeroName(roster?.hero?.name)||"ロイド";
  }
  function storyText(value){
    return String(value??"").replace(/\{\{hero\}\}/g,storyHeroName());
  }
  function townTalkPhase(){
    if(prologueStage()>=6) return 3;
    if(prologueStage()>=3) return 2;
    return 1;
  }
  let townTalkSubarea="town";
  function openTownTalkModal(preserveSubarea=false){
    if(!preserveSubarea) townTalkSubarea="town";
    const town=normalizeTownKey(state.currentTown);
    $("townTalkTitle").textContent=(town==="granzel" && townTalkSubarea==="castle")
      ? "グランゼル城"
      : town==="yody"?"港町ヨーディーの住民":town==="tileno"?"ティレーノの街の住民":town==="granzel"?"グランゼル城下町の住民":town==="runel"?"ルネルの街の住民":town==="kunputei"?"薫風亭":"ミレスタの住民";
    renderTownTalkMenu();
    $("townTalkModal").classList.add("show");
    $("townTalkModal").setAttribute("aria-hidden","false");
  }
  function closeTownTalkModal(){
    $("townTalkModal").classList.remove("show");
    $("townTalkModal").setAttribute("aria-hidden","true");
  }
  function openGranzelCastleTalkMenu(){
    townTalkSubarea="castle";
    openTownTalkModal(true);
  }
  function currentTownTalkNpcs(){
    if(state.currentTown==="granzel" && townTalkSubarea==="castle"){
      return GRANZEL_CASTLE_TALK_NPCS.filter(npc=>{
        if(npc.id==="granzelCastleWhisperSoldiers" && state.eventFlags?.tilenoToxicBossDefeated) return false;
        if(npc.id==="granzelMargaret" && !state.eventFlags?.runelRuinsBossDefeated) return false;
        return true;
      });
    }
    const list=state.currentTown==="yody"?YODY_TALK_NPCS:state.currentTown==="tileno"?TILENO_TALK_NPCS:state.currentTown==="granzel"?GRANZEL_TALK_NPCS:state.currentTown==="runel"?RUNEL_TALK_NPCS:state.currentTown==="kunputei"?KUNPUTEI_TALK_NPCS:MILESTA_TALK_NPCS;
    return list.filter(npc=>{
      if(npc.id==="yodyBoy" && state.eventFlags?.yodyBoyQuestCompleted) return false;
      if(npc.id==="tilenoBoy"){
        if(!state.eventFlags?.yodyBoyQuestCompleted) return false;
        if(state.eventFlags?.zelrenoForestDeepQuestStarted && !state.eventFlags?.zelrenoForestDeepCleared) return false;
      }
      if(npc.id==="granzelGrimSoldier" && state.eventFlags?.granzelSoldierSceneDone) return false;
      if(npc.id==="granzelCastleGate" && !state.eventFlags?.granzelSoldierSceneDone) return false;
      return true;
    }).map(npc=>{
      if(npc.id!=="tilenoBoy") return npc;
      if(state.eventFlags?.zelrenoForestDeepCleared) return {...npc,name:"エディ"};
      if(state.eventFlags?.tilenoToxicBossDefeated && !state.eventFlags?.zelrenoForestDeepQuestStarted) return {...npc,name:"？？？",silhouette:IMG.karen};
      return npc;
    });
  }
    function renderTownTalkMenu(){
    const grid=$("townTalkGrid");
    if(!grid) return;
    grid.innerHTML="";
    const inGranzelCastle=state.currentTown==="granzel" && townTalkSubarea==="castle";
    if(inGranzelCastle){
      const back=document.createElement("button");
      back.className="town-talk-card";
      back.innerHTML='<span class="town-talk-card-name">← 城下町へ戻る</span>';
      back.onclick=()=>{townTalkSubarea="town";openTownTalkModal(true);};
      grid.appendChild(back);
    }
    const npcs=currentTownTalkNpcs();
    if(!npcs.length){
      const empty=document.createElement("div");
      empty.className="town-talk-empty";
      empty.textContent="現在話せる相手はいません。";
      grid.appendChild(empty);
      return;
    }
    npcs.forEach(npc=>{
      const btn=document.createElement("button");
      btn.className="town-talk-card";
      btn.innerHTML=`<span class="town-talk-card-name">${escapeHtml(npc.name)}</span>`;
      if(npc.id==="granzelCastleGate") btn.onclick=()=>openGranzelCastleTalkMenu();
      else btn.onclick=()=>{closeTownTalkModal();startTownResidentTalk(npc.id);};
      grid.appendChild(btn);
    });
  }
  function startTemporaryStoryEvent(steps,options={}){
    STORY_EVENTS.__townResidentTalk={steps:Array.isArray(steps)?steps:[{type:"end"}]};
    state.storyEventRuntime={id:"__townResidentTalk",index:0,preview:false,appliedEffects:new Set(),returnToTownTalk:options.returnToTownTalk!==false,afterCallback:typeof options.after==="function"?options.after:null};
    renderStoryEventStep();
    return true;
  }
  function talkDialogue(speaker,silhouette,gender,text,effects=[]){
    return {type:"dialogue",speaker,silhouette,silhouetteTone:gender,text,effects};
  }
  function talkSystem(text,effects=[]){
    return {type:"system",text,effects};
  }
  function townNpcData(id,town=state.currentTown){
    const list=town==="yody"?YODY_TALK_NPCS:town==="tileno"?TILENO_TALK_NPCS:town==="granzel"?GRANZEL_TALK_NPCS:town==="granzelCastle"?GRANZEL_CASTLE_TALK_NPCS:town==="runel"?RUNEL_TALK_NPCS:town==="kunputei"?KUNPUTEI_TALK_NPCS:MILESTA_TALK_NPCS;
    return list.find(n=>n.id===id)||list[0];
  }
  function startYodyCaptainBoarding(npc){
    if(state.gold<50){
      startTemporaryStoryEvent([
        talkDialogue("船長",npc.silhouette,npc.gender,`なんだ、金が足りねえじゃねえか。
片道50Gだ。用意してからまた来な！`),
        {type:"end"}
      ]);
      return;
    }
    state.gold-=50;
    state.eventFlags.salidDesertUnlocked=true;
    updateHeader();
    startTemporaryStoryEvent([
      talkDialogue("船長",npc.silhouette,npc.gender,`おう！じゃあ乗りな！`),
      {type:"end"}
    ],{returnToTownTalk:false,after:()=>startSalidDesertPreview()});
  }
  function startYodyResidentTalk(id){
    const npc=townNpcData(id,"yody");
    let steps=[];
    if(id==="yodyYoungman"){
      steps=[talkDialogue("若者",npc.silhouette,npc.gender,`ここは港町ヨーディーだ。
グランゼル本国の方じゃ戦争で大変らしいが、うちは比較的平和だぜ。`)];
    }else if(id==="yodySailor"){
      steps=[talkDialogue("船乗り",npc.silhouette,npc.gender,`戦争がなんだってんだ！
俺たちは今までずっとサリードと取引してきたんだ！国の勝手な決定でやめられるかよ！`)];
    }else if(id==="yodyWoman"){
      steps=[
        talkDialogue("女性",npc.silhouette,npc.gender,`あなた、ミレスタから来たの？
最近は魔物娘も凶暴化してるのに、1人でよく来れたわね。`),
        talkDialogue("女性",npc.silhouette,npc.gender,`え？1人じゃない……魔物娘と一緒？
……あなた、それ城下町では冗談でも言っちゃダメよ。`)
      ];
    }else if(id==="yodySoldier"){
      steps=[
        talkDialogue("兵士",npc.silhouette,npc.gender,`北東の山道に出るデーモンには気をつけるんだぞ。
奴らの雷魔法を食らうと、身体が動けなくなることがあるんだ。`),
        talkDialogue("兵士",npc.silhouette,npc.gender,`俺なんか、感電したままやりたい放題されて……。
うぅ……情けない話だ……。`)
      ];
    }else if(id==="yodyAdventurer"){
      steps=[talkDialogue("女冒険家",npc.silhouette,npc.gender,`うぅ……酷い目に遭ったわ。
船でサリード砂漠まで行ってきたけど、魔物娘強すぎ！危うく死にかけたわ！
あなたも腕に自信がないなら行かない方がいいわよ。`)];
    }else if(id==="yodyBrother"){
      steps=[
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`ここから北東に行けば、ティレーノの街に続く山道がある。
冒険者ギルドもあって賑やかな街だぜ。`),
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`ティレーノからさらに東に進んで森林地帯を抜ければグランゼル城が見えるが……
あの森林地帯、魔物娘も多くて危険だからなぁ。行くなら気をつけろよな。`)
      ];
    }else if(id==="yodyTreasureHunter"){
      steps=[
        talkDialogue("トレジャーハンター",npc.silhouette,npc.gender,`探索マップの左上に、🪎 お宝 0/2 とか書いてあるのがわかるか？
これは、そのエリアにある特別な「お宝」をいくつ見つけたかを表してるんだ。`),
        talkDialogue("トレジャーハンター",npc.silhouette,npc.gender,`「お宝」が欲しければ、とにかく宝箱を開けることだな。
一度の探索で全部見つけられなくても、何度だってチャレンジだ！`)
      ];
    }else if(id==="yodyCaptain"){
      steps=[
        talkDialogue("船長",npc.silhouette,npc.gender,`戦争だろうが構いはしねえ。
うちとサリードの関係はそんなんで切れるもんじゃねえからな。`),
        {...talkDialogue("船長",npc.silhouette,npc.gender,`つーわけで、サリードまで乗って行くか？
片道50Gだ。
※探索マップ:サリード砂漠を解放し、移動します`),choices:[
          {label:"乗る(-50G)",action:()=>startYodyCaptainBoarding(npc)},
          {label:"乗らない",goto:"captainEnd"}
        ]},
        {type:"label",id:"captainEnd"}
      ];
    }else if(id==="yodyBoy"){
      const first=!state.eventFlags?.yodyBoyTalked;
      if(first){
        steps.push(
          talkDialogue("少年",npc.silhouette,npc.gender,`うーん……どうしよう……。`,[{type:"flag",key:"yodyBoyTalked",value:true}]),
          talkDialogue("主人公",null,null,`……？`),
          talkDialogue("少年",npc.silhouette,npc.gender,`あっ、えっと……実は、姉が怪我をしてしまって。
この町で、怪我によく効く薬草が売ってるはずなんですけど、在庫切らしてるみたいなんですよね。`),
          talkDialogue("少年",npc.silhouette,npc.gender,`北東の山脈の麓から続く小道の先で採れるらしいんですけど……魔物娘が出るから行けないし……。`),
          talkDialogue("主人公",null,null,`…………`),
          talkDialogue("少年",npc.silhouette,npc.gender,`あ、こんなこと話しても仕方ないですよね。
あなたも、薬草が欲しかったら入荷を待つしかないですよ。`)
        );
      }else{
        steps.push(talkDialogue("少年",npc.silhouette,npc.gender,`薬草、いつ入荷するんだろう……。
姉さんの傷、早く治さないと……。`));
      }
      if(itemCount("healLeaf")>0){
        steps.push(
          {type:"system",text:"『ヒールリーフを少年に譲りますか？』",choices:[
            {label:"はい",goto:"giveHealLeaf",effects:[{type:"removeItem",id:"healLeaf",amount:1}]},
            {label:"いいえ",goto:"boyEnd"}
          ]},
          {type:"label",id:"giveHealLeaf"},
          talkDialogue("少年",npc.silhouette,npc.gender,`えっ、それ……薬草じゃないですか！
僕に譲ってくれるんですか？`),
          talkDialogue("主人公",null,null,`……！`),
          talkDialogue("少年",npc.silhouette,npc.gender,`あ、ありがとうございます！
さっそく姉さんの怪我を治さないと……！`),
          talkDialogue("少年",npc.silhouette,npc.gender,`少ないですが、これ、お礼です！`),
          talkSystem("『{{hero}}は150Gを受け取った！』",[{type:"gold",amount:150}]),
          talkDialogue("少年",npc.silhouette,npc.gender,`僕、ティレーノに住んでるんです。
ティレーノに寄った時は、必ず訪ねてきてくださいね！姉ともどもお待ちしてます！`),
          talkSystem("『少年は走り去っていった。』",[{type:"flag",key:"yodyBoyQuestCompleted",value:true}]),
          talkDialogue("主人公",null,null,`…………`),
          {type:"jump",goto:"boyDone"},
          {type:"label",id:"boyEnd"},
          {type:"jump",goto:"boyDone"},
          {type:"label",id:"boyDone"}
        );
      }
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }
  function startTilenoResidentTalk(id){
    const npc=townNpcData(id,"tileno");
    let steps=[];
    if(id==="tilenoBoy" && state.eventFlags?.yodyBoyQuestCompleted && state.eventFlags?.tilenoToxicBossDefeated && !state.eventFlags?.zelrenoForestDeepQuestStarted && !state.eventFlags?.zelrenoForestDeepCleared){
      steps=[
        {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"黒い髪、ぼんやりした顔……あなたね！？"},
        talkDialogue("主人公",null,null,"……！？"),
        {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`その節はどうも！ほんとに助かったわ！
でも今はそれどころじゃないの！`},
        {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"エディが魔物娘に攫われたの！！"},
        talkDialogue("主人公",null,null,"？？？？"),
        {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`あなた、強いんでしょ？力を貸して！
場所はゼルレーノ森林地帯の奥地！いいわね！？`},
        {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"間違えてグランゼル大平原まで行っちゃダメだからね！！"},
        {type:"system",text:"女冒険家は猛スピードで森林地帯へと向かって行った。",effects:[{type:"flag",key:"zelrenoForestDeepQuestStarted",value:true}]},
        talkDialogue("主人公",null,null,"？？？？"),
        {type:"end"}
      ];
      startTemporaryStoryEvent(steps);
      return;
    }
    if(id==="tilenoYoungman"){
      steps=[talkDialogue("若者",npc.silhouette,npc.gender,`ここは冒険者ギルドの街、ティレーノだ。
国中の冒険者たちが集まってるぜ！`)];
    }else if(id==="tilenoGuildStaff"){
      if(!state.eventFlags?.tilenoGuildPanaceaReceived){
        steps=[
          talkDialogue("冒険者ギルド職員",npc.silhouette,npc.gender,`冒険者さんですね？まずはこちらをどうぞ！`),
          talkSystem("『{{hero}}は万能薬をもらった！』",[{type:"item",id:"panacea",amount:1},{type:"flag",key:"tilenoGuildPanaceaReceived",value:true}]),
          talkDialogue("冒険者ギルド職員",npc.silhouette,npc.gender,`この辺りには毒の魔物娘やフクロウ娘がいますからね！
状態異常対策を怠ってはいけませんよ！`)
        ];
      }else{
        steps=[talkDialogue("冒険者ギルド職員",npc.silhouette,npc.gender,`この辺りには毒の魔物娘やフクロウ娘がいますからね！
状態異常対策を怠ってはいけませんよ！`)];
      }
    }else if(id==="tilenoSoldier"){
      steps=[
        talkDialogue("兵士",npc.silhouette,npc.gender,`エルフは、射抜いて即死させてくることがある危険な魔物娘だ。
万が一のことを考えて、命の石は用意しておきたいな。`),
        talkDialogue("兵士",npc.silhouette,npc.gender,`あと、警戒心は強いが、礼儀正しく接すれば襲ってこない個体もいるらしい。
俺は……逃げようとして矢を撃たれたよ。`)
      ];
    }else if(id==="tilenoOldwoman"){
      steps=[
        talkDialogue("おばあさん",npc.silhouette,npc.gender,`まったく……魔物娘魔物娘って。
エルフはあたしが子供の頃は、魔物娘なんて扱いじゃなかったよ。`),
        talkDialogue("おばあさん",npc.silhouette,npc.gender,`それが今じゃ人間と離れて暮らすようになって……。
ああ、時代の変化ってのは恐ろしいね。`)
      ];
    }else if(id==="tilenoFemaleAdventurer"){
      steps=[
        talkDialogue("女冒険者",npc.silhouette,npc.gender,`ティレーノ湿原には行ったかい？
あそこの奥地には、毒の魔物娘たちが巣食ってるんだ。かなり危険だよ。`),
        talkDialogue("女冒険者",npc.silhouette,npc.gender,`今も、報酬目当ての冒険者たちが次々とやられて病院送りにされてる。
あんたも行くなら覚悟をしておくんだね。`)
      ];
    }else if(id==="tilenoBrother"){
      steps=[
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`ここから東に行くと、ゼルレーノ森林地帯だ。
深い森だが、そこを抜ければグランゼル城下町に行けるぞ。`),
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`俺もグランゼルの鋼鉄製の装備欲しいし、行ってみるかな……。`)
      ];
    }else if(id==="tilenoAdventurer"){
      steps=[
        talkDialogue("冒険者",npc.silhouette,npc.gender,`今、俺たち冒険者を騒がせてる三つの依頼。
『湿原の毒の魔物娘』、『ルネル地方の黒いラミア』、そして『魔縁者の捕獲』だ。`),
        talkDialogue("冒険者",npc.silhouette,npc.gender,`『魔縁者』ってやつは、魔物娘と心を通わせるらしい。
グランゼル王室直々の依頼らしいが、人間を捕まえるってのもなぁ……。`)
      ];
      if(travelingWithMonsterGirl()) steps.push(talkDialogue("冒険者",npc.silhouette,npc.gender,`え、あんた、魔物娘と一緒に……
み、見なかったことにしておくよ。`));
    }else if(id==="tilenoOldman"){
      steps=[
        talkDialogue("おじいさん",npc.silhouette,npc.gender,`森林地帯に行くのなら、魔法ばかりに頼るのは危険じゃぞ。
あそこの魔物娘は、魔法に強い魔物娘も多いからのう。`),
        talkDialogue("おじいさん",npc.silhouette,npc.gender,`ワシみたいな、斧を扱うパワーファイターを1人は連れて行くといいぞ。
ふぉっふぉっふぉ……！`)
      ];
    }else if(id==="tilenoBoy"){
      if(state.eventFlags?.zelrenoForestDeepCleared){
        steps=[
          talkDialogue("エディ",NPC_BOY_IMG,"male",`あ、{{hero}}さん！
姉さんは迷惑かけてないですか？
邪魔だったら遠慮なく待機させていいですからね！`)
        ];
        if(travelPartyIds().includes("karen")) steps.push({type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:"エディ……あんたねぇ……。"});
      }else{
        steps=[
          talkDialogue("少年",npc.silhouette,npc.gender,`あ！あなたは……薬草をくれたお兄さん！
来てくれたんですね！`),
          talkDialogue("少年",npc.silhouette,npc.gender,`ただ……姉の傷はまだ治ってないんです。
今回はいつもより無理してしまったみたいで。`),
          talkDialogue("少年",npc.silhouette,npc.gender,`姉の傷が治ったら、一緒に何かお礼をしますから！
またいらしてくださいね！`)
        ];
      }
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }
  function startGranzelResidentTalk(id){
    const npc=townNpcData(id,"granzel");
    let steps=[];
    if(id==="granzelYoungman"){
      steps=[talkDialogue("若者",npc.silhouette,npc.gender,`ここはグランゼル城下町だ。
戦争が起こりそうでちょっとピリピリしてるね……。`)];
    }else if(id==="granzelGirl"){
      steps=[
        talkDialogue("少女",npc.silhouette,npc.gender,`この前ね！ラミアのおねーさんに遊んでもらったの！
すっごく楽しかったよ！`),
        talkDialogue("少女",npc.silhouette,npc.gender,`でも、このことお母さんに言ったら、怒られちゃった……。
そのことは誰にも言うなって。`),
        talkDialogue("少女",npc.silhouette,npc.gender,`……あ、言っちゃった！`)
      ];
    }else if(id==="granzelSoldier"){
      steps=[
        talkDialogue("兵士",npc.silhouette,npc.gender,`グランゼル大平原には、銀色のスライム娘が出没するぞ。
倒せれば大量の経験値がもらえるらしい。`),
        talkDialogue("兵士",npc.silhouette,npc.gender,`クリティカルな攻撃でも出せれば一発で倒せる。
やっぱり時代は拳や斧、か？`)
      ];
    }else if(id==="granzelBrother"){
      steps=[
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`グランゼルといえば、ゼルレギンス！
履き心地抜群！地属性や毒にもちょっと強くなる！`),
        talkDialogue("お兄さん",npc.silhouette,npc.gender,`……あ、俺はメーカー勤めでさ。
ショップに売ってるから、ぜひ買って行ってくれよな。`)
      ];
    }else if(id==="granzelOldman"){
      steps=[
        talkDialogue("おじいさん",npc.silhouette,npc.gender,`北のアルム王国との戦争ももうすぐかのぉ。
孫が徴兵されなければよいのだが……。`),
        talkDialogue("おじいさん",npc.silhouette,npc.gender,`アルベルト様に代替わりして平和になったと思っとったが、どういう心変わりなのか……。
まるで人が変わったかのようじゃ。`)
      ];
    }else if(id==="granzelAdventurer"){
      steps=[
        talkDialogue("冒険家",npc.silhouette,npc.gender,`噂によると、戦闘に参加していなくても経験値が得られる、不思議な装飾品があるらしい。`),
        talkDialogue("冒険家",npc.silhouette,npc.gender,`ゼルレーノ森林地帯の宝箱に隠されてると聞いたんだが……
君も興味があったら探してみたらどうだい？`)
      ];
    }else if(id==="granzelLady"){
      steps=[
        talkDialogue("お姉さん",npc.silhouette,npc.gender,`ここから南東に行けば、ルネル地方やレスティア公国に続く、ルネル岩窟があるわ。
魔物娘も強くて危険な洞窟よ。`),
        talkDialogue("お姉さん",npc.silhouette,npc.gender,`ルネル地方は、旧ルネルパリオ領。
その昔、200年ぐらい前だったかしら？グランゼルが滅ぼしたらしいのよね。`)
      ];
    }else if(id==="granzelGrimSoldier"){
      steps=[
        talkDialogue("主人公",null,null,`…………`),
        talkSystem(`『グランゼル王国軍の兵士だ。
{{hero}}はグランゼルのバッジを握りしめる。』`),
        {type:"system",text:`『エリザの失踪に関わっているかもしれない。
声をかけてみますか？』`,choices:[
          {label:"はい",goto:"approachSoldiers"},
          {label:"いいえ",goto:"watchSoldiers"}
        ]},
        {type:"label",id:"approachSoldiers"},
        talkSystem(`『{{hero}}が声をかけようとした、その時だった。』`),
        {type:"jump",goto:"soldierConversation"},
        {type:"label",id:"watchSoldiers"},
        talkSystem(`『{{hero}}は少し離れたところから様子を見ることにした。』`),
        {type:"label",id:"soldierConversation"},
        talkDialogue("険しい顔の兵士",NPC_SOLDIER_IMG,"male",`おい！魔縁者は見つかったのか？`),
        talkDialogue("新米らしき兵士",NPC_SOLDIER_IMG,"male",`見つかるわけないじゃないですか。
昨日の今日で見つかったら、誰も苦労しませんよ。`),
        talkDialogue("険しい顔の兵士",NPC_SOLDIER_IMG,"male",`魔縁者をとっ捕まえて昇進したやつもいるんだぞ！
もっと真面目に探せ！`),
        talkDialogue("新米らしき兵士",NPC_SOLDIER_IMG,"male",`そんなこと言ったって、グランゼル中探し回って2,3人程度でしょ？
望み薄ですよ。望み薄。`),
        talkDialogue("険しい顔の兵士",NPC_SOLDIER_IMG,"male",`ちっ！まあいい。
とりあえず飯でも食うか。ついて来い！`),
        talkDialogue("新米らしき兵士",NPC_SOLDIER_IMG,"male",`はぁ……嫌な先輩だなぁ。
マーガレット様の私兵になりたかった……あっちは新人いびりとか無さそうだし。`),
        talkSystem(`『兵士たちは城の中へと去って行った。』`,[{type:"flag",key:"granzelSoldierSceneDone",value:true}]),
        talkDialogue("主人公",null,null,`…………`)
      ];
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }
  function startGranzelCastleResidentTalk(id){
    const npc=townNpcData(id,"granzelCastle");
    let steps=[];
    if(id==="granzelCastleEntranceSoldier"){
      steps=[talkDialogue("入口の兵士",npc.silhouette,npc.gender,`ようこそ、グランゼル城へ。
一般の方でも入城できますが、王への無礼は無いようにお願いしますね。`)];
    }else if(id==="granzelCastleDepressedSoldier"){
      steps=[
        talkDialogue("落ち込む兵士",npc.silhouette,npc.gender,`はぁ……来期からアルム国境に異動だよ……。
こんな戦争目前って時にそんなところで働けるかよ……。`),
        talkDialogue("落ち込む兵士",npc.silhouette,npc.gender,`そもそも国境自体、あの氷雪の回廊を抜けなきゃならないんだ。
職場にたどり着く前に死ぬんじゃないか……？`)
      ];
    }else if(id==="granzelCastleWhisperSoldiers"){
      steps=[
        talkDialogue("兵士A",NPC_SOLDIER_IMG,"male",`おい、例の件は準備できてるな？`),
        talkDialogue("兵士B",NPC_SOLDIER_IMG,"male",`はい。対象Vの動向も確認済み。あとは予定通りに……`),
        talkDialogue("兵士A",NPC_SOLDIER_IMG,"male",`失敗は許されない。誰も死なないよう、万全の体制で臨むぞ。`),
        talkDialogue("主人公",null,null,`……？`)
      ];
    }else if(id==="granzelCastleDrunkSoldier"){
      steps=[
        talkDialogue("酒を飲む兵士",npc.silhouette,npc.gender,`ったく！ティレーノの冒険者ギルドは何やってんだ！
魔縁者もルネル地方の魔物娘も！いつになったら片付けてくれるんだ！？`),
        talkDialogue("酒を飲む兵士",npc.silhouette,npc.gender,`特にルネルの黒蛇だ！
あの化け物のせいで何人やられたと思ってやがる！城下町跡も派手にぶっ壊しやがって……！`),
        talkDialogue("酒を飲む兵士",npc.silhouette,npc.gender,`やっぱり民間は頼りねえ……
なあ！？兄ちゃんもそう思うよなぁ！？`),
        talkDialogue("主人公",null,null,`…………`)
      ];
    }else if(id==="granzelMargaret"){
      return startMargaretCastleTalk();
    }else if(id==="granzelKing"){
      if(state.eventFlags?.granzelKingAudienceDone){
        steps=[{type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`魔界の『扉』、魔縁者……。
もはや、グランゼルのためには、手段を選んでいる場合ではない……。`}];
      }else{
        steps=[
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`……報告はそれで全部か。`},
          talkDialogue("兵士",NPC_SOLDIER_IMG,"male",`はっ！`),
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`下がるがいい。
引き続き、魔縁者を捜索しろ。`},
          talkDialogue("兵士",NPC_SOLDIER_IMG,"male",`はっ！`),
          talkSystem(`『兵士はその場を後にした。』`),
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`おお、旅の者か。
よくぞ我が城へ参った。ゆっくりとしていくがいい。`},
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`我が国はアルム王国と戦争目前の状態にある。
義勇兵への志願なら、喜んで受け入れよう。`},
          talkDialogue("主人公",null,null,`…………`),
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`時に、お主は魔縁者は知っておるか？
魔物娘と心を通わせ、この国に禍を招く者のことだ。`},
          talkDialogue("主人公",null,null,`……！`),
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`昨今の魔物娘の凶暴化の原因も、奴らの手によるものだ。
ティレーノの毒沼、ルネル地方の黒蛇……`},
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`……おお、すまない。
ところで、私に何か用があったのかな？`},
          talkDialogue("主人公",null,null,`…………`),
          talkSystem(`『{{hero}}は、グランゼルのバッジを見せようとした。
しかし……』`),
          {type:"dialogue",speaker:"？？？",portrait:MARGARET_IMG,text:`お父様。`},
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`む？
おお、マーガレット。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`お父様。昨日より顔色がよろしくないのでは？
少しはお休みになられてください。`},
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`ああ、だがそうも言ってられん。
アルムに先手を打たれるわけにもいかない。魔縁者も……`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`お父様らしいですわ。無理はなさらないでくださいね。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ところで……こちらは私の客人です。
ね、{{hero}}さん。`},
          talkDialogue("主人公",null,null,`……！？`),
          {type:"dialogue",speaker:"グランゼル王",portrait:GRANZEL_KING_IMG,text:`おお、そうだったのか。
では行くがよい。こんなところで立ち話も疲れるであろう？`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ふふ。そうさせていただきますわ。`},
          talkSystem(`『マーガレットは{{hero}}に耳打ちした。』`),
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`それを父に見せてはダメ。
行きましょう。`},
          talkSystem(`『二人は玉座の間を後にした……。』`),
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ミレスタ方面で魔界の『扉』が開いたこと。そして、そこでグランゼル国章が刻まれた正規兵のバッジが一つ消えたこと。
父はそれを知っています。`},
          talkDialogue("主人公",null,null,`…………`),
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`危ないところでした。
あのバッジを見られてしまえば、あなたは魔縁者として、拘束されていたことでしょう。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`…………`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……申し遅れましたわ。私はこの国の姫、マーガレット。
貴方は、魔縁者の{{hero}}さん……で、間違いありませんね？`},
          talkDialogue("主人公",null,null,`……！`),
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`貴方のことは、少し前から見ていました。
ですが、私は貴方を捕まえる気はありません。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`魔縁者は禍を招く者ではない……。
私は、そう信じておりますから。`},
          talkDialogue("主人公",null,null,`…………`),
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ここでは人の目があります。
詳しい話は、場所を変えてしましょう。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`城下町から北上すると、氷雪の回廊と呼ばれる、グランゼルとアルム王国の緩衝地帯があります。
その入口で落ち合いましょう。`},
          {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私は先に行って待っていますわ。
貴方も、気を付けていらしてくださいませね。`},
          talkSystem(`『マーガレットはお辞儀をすると、優雅に立ち去った。』`),
          talkDialogue("主人公",null,null,`…………`,[
            {type:"flag",key:"granzelKingAudienceDone",value:true}
          ])
        ];
      }
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }

  function finishMargaretRunelFirstReport(){
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.margaretRunelFirstReportDone=true;
    state.eventFlags.margaretRunelReportPending=false;
    state.currentTown="granzel";
    state.selectedArea="granzelTown";
    enterTown("granzel");
  }
  function startMargaretRunelFirstReport(){
    const steps=[
      talkDialogue("兵士",NPC_SOLDIER_IMG,"male",`こちらは王女マーガレット様の私室です。
立ち入りはご遠慮ください。`),
      talkDialogue("主人公",null,null,`…………`),
      talkDialogue("兵士",NPC_SOLDIER_IMG,"male",`何？ルネルの黒蛇をやっつけた？
貴様、何を訳の分からないことを……`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`その方は確かに私の客人です。
問題ありませんよ。`},
      talkDialogue("兵士",NPC_SOLDIER_IMG,"male",`マーガレット様！
し、失礼いたしました。`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さん。またお会いできると信じておりましたわ。
さあ、中へどうぞ。`},
      talkSystem(`『{{hero}}はマーガレットの私室に通された。』`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`あのルネルの黒蛇を倒すとは。
さすがは{{hero}}さん。さすがは魔縁者ですね。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……ヴリトラ。ルネルの黒蛇、あるいは対象Vという名で呼ばれたあの魔物娘は、本来は魔界に存在するはずの種族と言われています。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ミレスタの洞窟でも『扉』が開かれ、魔界の魔物娘がこの世界に現れた。
これは、偶然ではないのでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`誰かが、意図的に『扉』を開いている。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`噂によると、魔界の『扉』を開くには、魔縁者の血が不可欠だとか。
父が魔縁者を捕らえていることにも、関係があるのかも……。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……失礼しました。
今は、そんな話をしている場合ではありませんでしたね。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`エリザさんが運び込まれた痕跡が無いのはおかしいですね。
確かに、城下町跡に『荷物』が運び込まれたのは確認されています。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ヴリトラの脅威が無くなった今、私たちも城下町跡の調査は行います。
二日後、またここに来ていただけますか？`},
      talkSystem(`『{{hero}}は頷くと、マーガレットの私室を後にした。』`),
      talkSystem(`『{{hero}}はグランゼルに滞在し、時が過ぎるのを待った。
そして、二日後……』`),
      {type:"end"}
    ];
    startTemporaryStoryEvent(steps,{returnToTownTalk:false,after:finishMargaretRunelFirstReport});
  }
  function startMargaretRunelSecondReport(){
    const steps=[
      talkSystem(`『{{hero}}はマーガレットの私室に招かれた……。』`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さん。エリザさんについて、続報があります。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ルネルパリオ城下町跡に突如として現れ、霧のように消えて行った……。
私の私兵たちが確かに目撃しています。`},
      talkDialogue("主人公",null,null,`……！`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私は……この一件には父が関わっていると見ています。
父が魔縁者を捕らえている理由、それはまだわかりませんが……何か忌まわしい実験をしているのかも？`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ええ。エリザさんは、魔縁者ではないのですよね。
ですが、魔縁者の子孫と思しき、ミレスタの民。目をつけられても不思議ではありません。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`とにかく、これ以上深入りするなら、グランゼル王国そのものと対立することになるかもしれません。
それでも……あなたはエリザさんを諦めないのですか？`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……そうですか。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`…………`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……私は、父を止めたい。
今の父はどこかおかしいんです。疑心に支配され、かつての温厚な父はどこかに消えてしまった……。そう思ってしまうほどに。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さん、協力しませんか？
私は父を止めるために。あなたは、エリザさんと再会するために。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私は、内側から父と王国軍の内情を探ります。
ですが……そう簡単にはいかないでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さんには、エリザさんを捜しつつ諸国を巡り、旅の魔縁者として、そこの君主たちの信頼を勝ち取ってほしいのです。`},
      talkDialogue("主人公",null,null,`……？`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`あなたが信頼を勝ち取ったら、私はそこから個人的なパイプを使って関係を深めます。
そうして築いた『後ろ盾』があれば、より深く調査に踏み込めるはずです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`まあ、こちらは私にお任せください。
グランゼルの軍事拡大に伴って、周辺諸国も問題に悩まされています。中には、魔縁者にしか解決できない問題もあるはず。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`行ってみればわかると思いますよ。
……協力、してくださいますか？`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……ありがとうございます。
それでは、お互い全力を尽くしましょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さんに行っていただきたいのは、砂漠の国サリード、北の雪国アルム、そして魔物娘を信仰するレスティア公国……。
順番はお任せしますが、まずはサリード王国に向かうことをお勧めしますわ。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`詳しく聞きたくなりましたら、また私の私室をお訪ねください。
……ご武運を。`},
      talkDialogue("主人公",null,null,`…………`),
      talkSystem(`『{{hero}}はマーガレットの私室を後にした。』`,[
        {type:"flag",key:"margaretRunelSecondReportDone",value:true},
        {type:"flag",key:"margaretThreeNationQuestStarted",value:true}
      ]),
      {type:"end"}
    ];
    startTemporaryStoryEvent(steps);
  }
  function startMargaretCountryInfo(){
    const menu={type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`{{hero}}さん。
各国の情報について、お話しましょう。`,choices:[
      {label:"サリード王国について",goto:"margaretSalidInfo"},
      {label:"アルム王国について",goto:"margaretAlmInfo"},
      {label:"レスティア公国について",goto:"margaretRestiaInfo"},
      {label:"特に無い",goto:"margaretCountryInfoEnd"}
    ]};
    const steps=[
      {type:"label",id:"margaretCountryInfoMenu"},
      menu,

      {type:"label",id:"margaretSalidInfo"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`サリード王国は、南の大陸を支配する砂漠の国です。
グランゼル王国とも、昔から関係は悪くありません。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`しかし、現在グランゼルが侵攻しようとしているアルム王国と同盟を結んでいるため、戦争が起きればグランゼルと衝突することになるでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`炎に耐性のある魔物娘が多く生息しているようですね。
逆に、氷属性が弱点の魔物娘も多そうです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`緊張が高まっているため、公式には渡航禁止になっていますが……
港町ヨーディーの船乗りなら、乗せて行ってくれるかもしれません。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`他に聞きたいことはございますか？`},
      {type:"jump",goto:"margaretCountryInfoMenu"},

      {type:"label",id:"margaretAlmInfo"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`アルム王国は、グランゼルの北に位置する雪国です。
過去何度もグランゼルと衝突しています。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……グランゼルが一方的に侵攻しようとしていると言った方が正しいですね。
その度に、卓越した政治的手腕でなんとか切り抜けてきたと言われています。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`現在も父の意向で、グランゼルはアルム王国と戦争を起こそうとしています。
アルムはサリード王国と同盟を結んでいるため、ひとたび戦争が始まればその規模は過去に類を見ないものになるでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`氷に耐性のある魔物娘が多く生息しているようですね。
逆に、炎属性が弱点の魔物娘も多そうです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`以前私たちが話した、氷雪の回廊を覚えていますか？
あの回廊を抜けた先に、アルム王国の国境があります。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`当然、厳戒態勢なので一般の方は通ることはできませんが……
アルム国王は魔縁者に『助力』を求めているそうです。あなたなら、もしかしたら……。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`他に聞きたいことはございますか？`},
      {type:"jump",goto:"margaretCountryInfoMenu"},

      {type:"label",id:"margaretRestiaInfo"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`レスティア公国は、グランゼルの東に位置する、自然豊かな土地が広がる国です。
魔物娘を崇拝している特殊な宗教国家でもあります。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`かつてはグランゼルの一部でしたが、紆余曲折を経て独立に至りました。
しかし、父はレスティアの再併合も視野に入れています。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`当然、レスティア側の反発は激しいものです。
一部の過激派が、大公の方針を無視してグランゼルに先制攻撃……テロを仕掛けようとしているとの噂もあります。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`個性豊かな魔物娘が生息しており、総合的な力が求められることになるでしょう。
魔物娘だけで言えば、サリードやアルムよりも危険と言えます。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ルネル岩窟の横道を抜けた先に、レスティア国境があります。
当然、厳戒態勢ですが……レスティアは魔物娘だけではなく魔縁者も崇拝対象としています。あなたなら、通してもらえるかもしれません。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`他に聞きたいことはございますか？`},
      {type:"jump",goto:"margaretCountryInfoMenu"},

      {type:"label",id:"margaretCountryInfoEnd"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`それでは、よろしくお願いします。
情報が聞きたくなりましたら、またいつでもいらしてくださいね。`},
      talkSystem(`『{{hero}}はマーガレットの私室を後にした。』`),
      {type:"end"}
    ];
    startTemporaryStoryEvent(steps);
  }
  function startMargaretCastleTalk(){
    if(!state.eventFlags?.runelRuinsBossDefeated) return false;
    if(!state.eventFlags?.margaretRunelFirstReportDone) return startMargaretRunelFirstReport();
    if(!state.eventFlags?.margaretRunelSecondReportDone) return startMargaretRunelSecondReport();
    return startMargaretCountryInfo();
  }

  function margaretIceTopicsComplete(){
    return !!state.eventFlags?.margaretIceTopicSelf
      && !!state.eventFlags?.margaretIceTopicMagicBond
      && !!state.eventFlags?.margaretIceTopicWar;
  }
  function margaretIceMeetingPending(){
    return !!state.eventFlags?.granzelKingAudienceDone && !state.eventFlags?.margaretIceCorridorMeetingDone;
  }
  function finishMargaretIceCorridorMeeting(){
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.margaretIceCorridorMeetingDone=true;
    state.eventFlags.margaretPoisonQuestAccepted=true;
    state.eventFlags.iceCorridorReached=true;
    // Compatibility with v0.45g saves. This flag no longer controls whether the goal exists.
    state.eventFlags.iceCorridorRouteUnlocked=true;
    state.currentTown="granzel";
    state.selectedArea="granzelTown";
    if(state.run) finishRun("マーガレットとの話を終え、グランゼル城下町へ戻りました");
    else enterTown("granzel","マーガレットとの話を終え、グランゼル城下町へ戻りました");
  }
  function startMargaretIceCorridorMeeting(){
    if(!margaretIceMeetingPending()) return false;
    if(!state.eventFlags) state.eventFlags={};
    const wasReached=!!state.eventFlags.iceCorridorReached;
    const topicChoices=[
      {label:"あなたは？",showIf:()=>!state.eventFlags?.margaretIceTopicSelf,effects:[{type:"flag",key:"margaretIceTopicSelf",value:true}],goto:"margaretSelf"},
      {label:"魔縁者について",showIf:()=>!state.eventFlags?.margaretIceTopicMagicBond,effects:[{type:"flag",key:"margaretIceTopicMagicBond",value:true}],goto:"margaretMagicBond"},
      {label:"アルム王国との戦争",showIf:()=>!state.eventFlags?.margaretIceTopicWar,effects:[{type:"flag",key:"margaretIceTopicWar",value:true}],goto:"margaretWar"},
      {label:"エリザについて",showIf:()=>margaretIceTopicsComplete(),goto:"margaretEliza"}
    ];
    const menuStep=()=>({
      type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,
      text:`聞きたいことがありそうな顔をしていますね。\n私が答えられる範囲であれば、なんでもお答えしますわ。`,
      choices:topicChoices
    });
    const steps=[
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`よくいらしてくれました。\nここなら、落ち着いて話ができそうです。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"label",id:"margaretMenu"},
      menuStep(),

      {type:"label",id:"margaretSelf"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私はグランゼル王の一人娘、マーガレット。\nそれ以上でもそれ以下でもありませんわ。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`貴方のことを知ったのは、本当に偶然でした。\n初めて見た、生粋の魔縁者……貴方こそが、この国の希望だと確信しております。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"jump",goto:"margaretMenu"},

      {type:"label",id:"margaretMagicBond"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ご存知ないですか？\n魔縁者とは、魔物娘と心を通わせ、その力を引き出す力を持った者のことです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`かつては、大国ルネルパリオにのみ、その存在が確認されていました。\nしかし、グランゼルとの戦争によって世界中に離散……`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私の調べによれば、ミレスタは魔縁者が興した町なんですよ。\nもっとも、200年の時を経てその血は薄まり、魔縁者の力を発現させる者はほとんど居ないそうですが……。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`父は、魔縁者を禍の元凶として見ています。\n詳しくは分かりませんが、『魔縁者たちが魔界の「扉」を開けようとしている』とか……。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`しかし、私はそうは思いません。\n父が何を考えているのかは定かではないですが、少し発想が飛躍しているように感じるのです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私にとって、魔縁者は憧れであり、希望……。\n貴方こそが、この国の状況を変えてくれる存在だと、信じております。`},
      {type:"jump",goto:"margaretMenu"},

      {type:"label",id:"margaretWar"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`アルム王国だけではありません。グランゼル王国は、サリード王国、レスティア公国とも戦争をしようとしています。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`自国にいる魔縁者を探し出し、グランゼルに差し出せ。さもなくば、国を奪う……と。`},
      talkDialogue("主人公",null,null,`……？`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`お父様の目的は、魔縁者を捕らえることです。\n捕らえられた魔縁者がどうなっているのかは分かりませんが……あまり、希望は持てませんわね。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ともかく、目下の標的は、この国の北に位置するアルム王国。……そして、アルム王国と同盟を結んでいるサリード王国になるでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`アルム王国は、グランゼルほどの武力は持ち合わせていません。\nですが、外交手腕は確かなもので、さらにサリード王国まで絡んでくるとなると……グランゼルといえど、楽には行かないでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`このまま戦争が始まれば、多くの血が流れることは確実です。\nそうならないよう、私は独自に動いているのです。`},
      {type:"jump",goto:"margaretMenu"},

      {type:"label",id:"margaretEliza"},
      talkSystem(`『{{hero}}はグランゼルのバッジを見せ、エリザを捜していることを話した。』`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`なるほど……貴方が城までいらしたことには、そういう理由があったのですね。\nエリザさん、知らないお名前ですわね。`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`開いた魔界の『扉』。グランゼル国章の刻まれたバッジ。エリザさんの失踪……。\n確かに不可解ですが、私なら力になれるかもしれません。`},
      talkDialogue("主人公",null,null,`……！`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`私も一国の王女ですからね。\n私の権限を用いれば、エリザさんについて調べることはできるでしょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`しかし……危ない橋です。\n魔界の『扉』、もっと言えば魔縁者が絡んでいるかもしれない案件です。父に知られれば、私とて何らかの危険に晒される可能性はあります。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`そこで一つ、取引をしませんか？`},
      talkDialogue("主人公",null,null,`……？`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ティレーノ地方の湿原に巣食う、毒の魔物娘。\nこの話、聞いたことはありませんか？\n{{hero}}さんには、この魔物娘を撃退してほしいのです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`多くの冒険者たちが返り討ちに遭い、グランゼル軍もアルム王国との緊張状態で迂闊に動けない状況です。\nですが……貴方なら解決できるのではないでしょうか？`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`その間に、私はエリザさんのことを調べておきます。\n毒の魔物娘の件を解決できたら、必ずや貴方の望む情報をお渡しすると約束しましょう。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`どうでしょう。\n毒の魔物娘の撃退、引き受けていただけますか？`},
      talkDialogue("主人公",null,null,`…………`),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……助かりますわ。\nこちらをお持ちください。`},
      talkSystem(`『{{hero}}はマーガレットから防毒マスクをもらった！』`,[{type:"equip",id:"gas_mask",amount:1}]),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`その一個しか用意できませんでしたが、お役立てください。\nそれでは、私はこれで。すぐに城に戻り、エリザさんについて調べてまいります。`},
      talkSystem(`『マーガレットはお辞儀をすると、優雅に去って行った……。』`,[
        {type:"flag",key:"margaretIceCorridorMeetingDone",value:true},
        {type:"flag",key:"margaretPoisonQuestAccepted",value:true},
        {type:"flag",key:"iceCorridorReached",value:true},
        {type:"flag",key:"iceCorridorRouteUnlocked",value:true}
      ])
    ];
    if(!wasReached){
      steps.push(talkSystem(`『氷雪の回廊へ、世界マップから直接向かえるようになった。』`));
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps,{returnToTownTalk:false,after:finishMargaretIceCorridorMeeting});
    return true;
  }

  function startKunputeiResidentTalk(id){
    const npc=townNpcData(id,"kunputei");
    let steps=[];
    if(id==="kunputeiOwner"){
      steps=[
        {type:"dialogue",speaker:"薫風亭の主人",silhouette:npc.silhouette,silhouetteTone:npc.gender,text:`いらっしゃいませ。ルネル岩窟を抜けて疲れたでしょう。200Gになりますが、ご休憩して行かれますか？`,choices:[
          {label:"はい",disabledIf:()=>state.gold<200,effects:[{type:"gold",amount:-200},{type:"restoreTravelPartyFull"}],goto:"kunputeiRest"},
          {label:"いいえ",goto:"kunputeiOwnerEnd"}
        ]},
        {type:"label",id:"kunputeiRest"},
        talkDialogue("薫風亭の主人",npc.silhouette,npc.gender,`それではどうぞごゆっくり。`),
        talkSystem(`『{{hero}}たちのHPとMPが全回復した！』`),
        {type:"label",id:"kunputeiOwnerEnd"}
      ];
    }else if(id==="kunputeiAdventurer"){
      steps=[
        talkDialogue("冒険者",npc.silhouette,npc.gender,`あんたもルネルの街に行くのかい？
俺もそうなんだが、ちょっと休憩中さ。`),
        talkDialogue("冒険者",npc.silhouette,npc.gender,`岩窟を抜けたってのに、まだまだ先は長そうだ。
でも、ここまで来て帰還の羽で帰るってのももったいないんだよなぁ……。`)
      ];
    }else if(id==="kunputeiFemaleAdventurer"){
      steps=[
        talkDialogue("女冒険者",npc.silhouette,npc.gender,`ここからは旧ルネルパリオ領よ。
グランゼル国民としては、200年前グランゼルが何をしたか考えると……ちょっと複雑ね。`),
        talkDialogue("女冒険者",npc.silhouette,npc.gender,`あ、そうそう。ここのパリオカクテルはとっても美味しいわよ。
滋養強壮効果もあって、外国でも密かに注目されてるらしいわ。`)
      ];
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }

  function startRunelResidentTalk(id){
    const npc=townNpcData(id,"runel");
    let steps=[];
    if(id==="runelYoungman"){
      steps=[
        talkDialogue("青年",npc.silhouette,npc.gender,`ここはルネルの街だよ。
歴史的に曰くのある土地だけど、どうってことない、普通の街さ。`),
        talkDialogue("青年",npc.silhouette,npc.gender,`店では純銀製の装備も扱ってるよ。それ目当ての冒険者さんも多いね。
まあ、ゆっくりして行きなよ。`)
      ];
    }else if(id==="runelGirl"){
      steps=[
        talkDialogue("少女",npc.silhouette,npc.gender,`わたし、きれいな女神様を見たの！
まちの近くの森に入っていったの！`),
        talkDialogue("少女",npc.silhouette,npc.gender,`でも、だれも信じてくれないの……。
あの森は、だれにも中に入れないふしぎな森なんだって。`)
      ];
    }else if(id==="runelOldman"){
      steps=[
        talkDialogue("老人",npc.silhouette,npc.gender,`この街の人間は、みんなグランゼルの入植者とその子孫さ。
かつてのルネルパリオの民はもういないよ。`),
        talkDialogue("老人",npc.silhouette,npc.gender,`その多くが自分から土地を捨てて散り散りに逃げていったそうな。
それが各地の魔縁者の先祖だって話だよ。`)
      ];
    }else if(id==="runelSoldier"){
      steps=[
        talkDialogue("兵士",npc.silhouette,npc.gender,`もしルネルの黒蛇に挑むなら、氷や光属性の魔法を用意しておくことだ。
逆に、闇属性にはめっぽう強い。`),
        talkDialogue("兵士",npc.silhouette,npc.gender,`あとは、強力な攻撃に耐えられるよう、レベルと装備を整えておくのも当然重要だな。
……まあ、とはいえ机上の空論だ。あの化け物をなんとかできる人間がいるとは思えねえ。`)
      ];
    }else if(id==="runelHistoryMan"){
      steps=[
        talkDialogue("歴史好きな男",npc.silhouette,npc.gender,`おいおい！
せっかくルネルパリオ城下町跡を観光しに来たってのに、魔物娘の巣窟ってどういうことだよ！？`),
        talkDialogue("歴史好きな男",npc.silhouette,npc.gender,`なんか生気を感じさせない不気味な魔物娘もいるって話だし、黒蛇っつうやばい奴もいるらしいし……。
はあ、諦めて故郷に帰るかぁ。`)
      ];
    }else if(id==="runelLady"){
      steps=[
        talkDialogue("お姉さん",npc.silhouette,npc.gender,`私は魔縁者じゃないわよ。
というか、この街に魔縁者はいないわ。`),
        talkDialogue("お姉さん",npc.silhouette,npc.gender,`この前も王国軍がここに来て、魔縁者はいないか？ってしつこくてね。
そりゃあ、確かにルネルパリオは魔縁者発祥の地ではあるけど……いい加減めんどくさいわ。`)
      ];
    }else if(id==="runelTreasureHunter"){
      steps=[
        talkDialogue("トレジャーハンター",npc.silhouette,npc.gender,`宝箱ノードは、背景の色にも注目だ。
実は宝箱にも二種類ある。`),
        talkDialogue("トレジャーハンター",npc.silhouette,npc.gender,`黒い背景の宝箱は要注意だ。
腕に自信がないなら、絶対に触れない方がいいぜ。`)
      ];
    }else if(id==="runelMerchant"){
      steps=[
        talkDialogue("商人",npc.silhouette,npc.gender,`ルネル岩窟には、奇妙なお宝が眠っているとか。
なんでも、それは装備者が獲得する経験値を0にしてしまうらしいです。`),
        talkDialogue("商人",npc.silhouette,npc.gender,`しかし、その経験値は戦っている他の仲間たちに配分されるそうです。
気になるなら、あなたも探してみてはどうですか？`)
      ];
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }

  function startTownResidentTalk(id){
    if(state.currentTown==="runel") return startRunelResidentTalk(id);
    if(state.currentTown==="kunputei") return startKunputeiResidentTalk(id);
    if(state.currentTown==="yody") return startYodyResidentTalk(id);
    if(state.currentTown==="tileno") return startTilenoResidentTalk(id);
    if(state.currentTown==="granzel" && townTalkSubarea==="castle") return startGranzelCastleResidentTalk(id);
    if(state.currentTown==="granzel") return startGranzelResidentTalk(id);
    const npc=townNpcData(id,"milesta"), phase=townTalkPhase();
    let steps=[];
    if(id==="girl"){
      if(phase===1) steps=[talkDialogue("少女",npc.silhouette,npc.gender,`エリザお姉ちゃん、今日もお仕事？
え、{{hero}}お兄ちゃんも行くの？頑張ってね！`)];
      else steps=[talkDialogue("少女",npc.silhouette,npc.gender,`エリザお姉ちゃんどこ行っちゃったんだろう？
早く帰ってくるといいね！`)];
    }else if(id==="oldman"){
      if(phase<3) steps=[talkDialogue("おじいさん",npc.silhouette,npc.gender,`{{hero}}ももう18になったのか……早いもんじゃのお。
ワシがお前さんぐらいの頃は……`),talkSystem("『おじいさんは長々と自分語りをしている……。』")];
      else steps=[talkDialogue("おじいさん",npc.silhouette,npc.gender,`おお、旅に出るのか。
儂が18の頃も、旅に出たもんじゃよ。屈強な魔物娘を薙ぎ倒して、遥か遠くの国まで……`),talkSystem("『おじいさんは長々と自分語りをしている……。』")];
    }else if(id==="merchant"){
      if(phase<3) steps=[talkDialogue("商人",npc.silhouette,npc.gender,`おう、{{hero}}。
外に出るなら、うちの店でちゃんと装備を整えてから行ってくれよな！`)];
      else steps=[talkDialogue("商人",npc.silhouette,npc.gender,`エリザさんのこと、頼んだぜ。
旅に出るなら、うちの店に寄ってからにしろよな！`)];
    }else if(id==="soldier"){
      if(phase===1) steps=[talkDialogue("兵士",npc.silhouette,npc.gender,`犬娘は氷属性に耐性を持っている。
アイスやコールドなどの氷魔法は効きづらいぞ。`),talkDialogue("兵士",npc.silhouette,npc.gender,`何より可愛い……。
ああっ、俺も魔物だったら触れ合えるのになぁ。`)];
      else if(phase===2) steps=[talkDialogue("兵士",npc.silhouette,npc.gender,`洞窟に出るナメクジ娘は、物理防御が高い。
魔法で一気に倒すといいぞ。`),talkDialogue("兵士",npc.silhouette,npc.gender,`噂では、ピンク色のナメクジもいるんだとか……。
一度見てみたいもんだな。`)];
      else steps=[talkDialogue("兵士",npc.silhouette,npc.gender,`洞窟の横道には、毒を使うアラクネが出るぞ。
毒消し草やキュアの準備は忘れずにな。`),talkDialogue("兵士",npc.silhouette,npc.gender,`ちなみに毒は、HPが毎ラウンド大きく削られてしまう。
そもそも毒にかからないようにするのが一番だ。`)];
    }else if(id==="boy"){
      if(phase===1) steps=[talkDialogue("少年",npc.silhouette,npc.gender,`{{hero}}くん、エリザお姉ちゃんと遊びに行くんだろ？
いーなー、俺も遊びに行きたい！`),talkDialogue("少年",npc.silhouette,npc.gender,`え？遊びじゃなくて仕事？
ふーん、よくわかんないけど頑張って！`)];
      else if(phase===2) steps=[talkDialogue("少年",npc.silhouette,npc.gender,`え？エリザお姉ちゃん帰ってないの？
うぅ……なんか俺も心配になってきた。{{hero}}くん！絶対連れて帰ってこいよな！`)];
      else steps=[talkDialogue("少年",npc.silhouette,npc.gender,`エリザお姉ちゃんも居なくなって、{{hero}}くんも旅に出ちゃうなんて……。
俺、待ってるから！早く二人で帰ってこいよな！`)];
    }else if(id==="oldwoman"){
      if(phase===1) steps=[talkDialogue("おばあさん",npc.silhouette,npc.gender,`{{hero}}ちゃん。働き盛りだからって、無理はいけないよ。
エリザの言うことを聞いて、安全第一にね。`),talkDialogue("おばあさん",npc.silhouette,npc.gender,`……まあ、エリザもすぐ無理するんだけどねぇ。
{{hero}}ちゃん、あの子が無理した時はあんたが止めてあげなさいよ。`)];
      else if(phase===2) steps=[talkDialogue("おばあさん",npc.silhouette,npc.gender,`あの子は無鉄砲なところがあるからねぇ。もちろんエリザのことさ。
{{hero}}ちゃん、あんたまで帰ってこなくなるなんてことはやめておくれよ。`)];
      else steps=[talkDialogue("おばあさん",npc.silhouette,npc.gender,`エリザ……。あの子がいないと、なんだか町も静かだねぇ。
{{hero}}ちゃん、あの子のこと、必ず見つけてやるんだよ。`)];
    }else if(id==="youngman"){
      if(phase===1) steps=[talkDialogue("若者",npc.silhouette,npc.gender,`はぁ、エリザさんは今日もきれいだなぁ。
気さくに話しかけてくれるし、天使だ……。`),talkDialogue("若者",npc.silhouette,npc.gender,`なんだよ、{{hero}}じゃねえか。
お前、エリザさんの足引っ張るんじゃねーぞ！`)];
      else if(phase===2) steps=[talkDialogue("若者",npc.silhouette,npc.gender,`くそ……エリザさん……！
俺が助けに行きてぇのに、足が震えやがる……！`),talkDialogue("若者",npc.silhouette,npc.gender,`{{hero}}、お前は行くのか？
お前はすげえよ……。すまねえが、頼んだぜ。`)];
      else steps=[talkDialogue("若者",npc.silhouette,npc.gender,`そうか……。エリザさんを捜すんだな。
お前とエリザさんは姉弟みたいなものだったもんな。じっとしてられないよな。`),talkDialogue("若者",npc.silhouette,npc.gender,`俺も何かできることがないか探してみるよ。
旅、頑張れよ。`)];
    }else if(id==="lady"){
      if(phase===1) steps=[talkDialogue("お姉さん",npc.silhouette,npc.gender,`あら、{{hero}}じゃない。
今からエリザとお仕事でしょ？ふふ、頑張ってね。`),talkDialogue("お姉さん",npc.silhouette,npc.gender,`それにしても、男前に育ったわね。
……いや、エリザに怒られそうだからやめとくわ。`)];
      else if(phase===2) steps=[talkDialogue("お姉さん",npc.silhouette,npc.gender,`心配ね、エリザ。
あの子に限って、最悪なことにはなってないとは思うけど……。`),talkDialogue("お姉さん",npc.silhouette,npc.gender,`助けに行くなんて、勇敢なのね。
私は戦えないから……無事を祈ってるわ。`)];
      else if(!state.eventFlags?.milestaWomanFeatherReceived) steps=[talkDialogue("お姉さん",npc.silhouette,npc.gender,`エリザを捜す旅……頑張ってね。
私にはこんなことしかできないけど……これ、持って行って。`),talkSystem("『{{hero}}はお姉さんから帰還の羽をもらった！』",[{type:"item",id:"returnFeather",amount:1},{type:"flag",key:"milestaWomanFeatherReceived",value:true}]),talkDialogue("お姉さん",npc.silhouette,npc.gender,`帰還の羽、最近は需要が上がって高値になってるのよね。
それでも無理しないで、危なくなったらすぐ帰ってくるのよ。`)];
      else steps=[talkDialogue("お姉さん",npc.silhouette,npc.gender,`エリザがいないとやっぱり寂しいわ。
あの子をからかうのが、毎日の楽しみだったのに……。`)];
    }
    steps.push({type:"end"});
    startTemporaryStoryEvent(steps);
  }
  function storyLabelIndex(steps,label){ return steps.findIndex(s=>s?.type==="label" && s.id===label); }
  function applyStoryEffect(effect,runtime){
    if(!effect || runtime?.preview) return;
    if(effect.type==="gold"){
      state.gold=Math.max(0,Number(state.gold||0)+Number(effect.amount||0));
      updateHeader();
    }else if(effect.type==="item"){
      addItemCount(effect.id,Number(effect.amount||1));
    }else if(effect.type==="equip"){
      addEquipmentOwned(effect.id,Number(effect.amount||1));
    }else if(effect.type==="removeItem"){
      removeItemCount(effect.id,Number(effect.amount||1));
    }else if(effect.type==="flag"){
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags[effect.key]=effect.value!==false;
    }else if(effect.type==="stage"){
      state.prologueStage=Math.max(0,Number(effect.value)||0);
    }else if(effect.type==="joinEliza"){
      joinElizaEscort();
    }else if(effect.type==="joinKaren"){
      recruitKarenAt17();
    }else if(effect.type==="leaveEliza"){
      leaveElizaEscort();
    }else if(effect.type==="returnMilesta"){
      returnMilestaForStory();
    }else if(effect.type==="restoreTravelPartyFull"){
      restoreTravelPartyFull();
      updateHeader();
    }
  }
  function finishStoryEvent(){
    const runtime=state.storyEventRuntime;
    const def=runtime?STORY_EVENTS[runtime.id]:null;
    const returnToTownTalk=!!runtime && !runtime.preview && runtime.id==="__townResidentTalk" && runtime.returnToTownTalk!==false;
    const afterCallback=(!runtime?.preview && typeof runtime?.afterCallback==="function")?runtime.afterCallback:null;
    if(runtime && !runtime.preview && def?.completionFlag){
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags[def.completionFlag]=true;
    }
    const after=(!runtime?.preview && def?.after) ? def.after : null;
    state.storyEventRuntime=null;
    // 住民会話だけは、背面のミレスタ画面を露出させないよう
    // 住民選択画面を先に用意してから会話レイヤーを閉じる。
    if(returnToTownTalk) openTownTalkModal(true);
    $("storyEventModal").classList.remove("show");
    updateHeader();
    if($("debugModal")?.classList.contains("show")) debugRefreshProgress();
    if(after==="startElizaPlains"){
      state.prologueStage=2;
      joinElizaEscort();
      setTimeout(()=>startRun("plains"),60);
    }else if(after==="startCaveBossBattle"){
      setTimeout(()=>openBattle(true,"caveBoss",{special:"caveBoss",escapeDisabled:true}),60);
    }
    if(afterCallback) setTimeout(afterCallback,60);
  }
  function chooseStoryEvent(choice){
    const runtime=state.storyEventRuntime;if(!runtime)return;
    const def=STORY_EVENTS[runtime.id];if(!def)return finishStoryEvent();
    (choice?.effects||[]).forEach(effect=>applyStoryEffect(effect,runtime));
    if(typeof choice?.action==="function"){ choice.action(); return; }
    if(choice?.goto){
      const idx=storyLabelIndex(def.steps,choice.goto);
      runtime.index=idx>=0?idx+1:runtime.index+1;
    }else runtime.index++;
    renderStoryEventStep();
  }
  function advanceStoryEvent(){
    if(!state.storyEventRuntime)return;
    state.storyEventRuntime.index++;
    renderStoryEventStep();
  }
  function renderStoryEventStep(){
    const runtime=state.storyEventRuntime;if(!runtime)return;
    const def=STORY_EVENTS[runtime.id];if(!def)return finishStoryEvent();
    const steps=def.steps||[];
    let guard=0;
    while(runtime.index<steps.length && guard++<100){
      const step=steps[runtime.index]||{};
      if(step.type==="label"){runtime.index++;continue;}
      if(step.type==="jump"){
        const idx=storyLabelIndex(steps,step.goto);runtime.index=idx>=0?idx+1:runtime.index+1;continue;
      }
      if(step.type==="effect"){
        applyStoryEffect(step,runtime);runtime.index++;continue;
      }
      if(step.type==="end") return finishStoryEvent();

      if(!runtime.appliedEffects.has(runtime.index)){
        (step.effects||[]).forEach(e=>applyStoryEffect(e,runtime));
        runtime.appliedEffects.add(runtime.index);
      }

      const panel=$("storyEventPanel"),portrait=$("storyEventPortrait"),portraitWrap=$("storyEventPortraitWrap"),speaker=$("storyEventSpeaker"),body=$("storyEventText"),choices=$("storyEventChoices"),next=$("storyEventNextBtn");
      const isSystem=step.type==="system",isTutorial=step.type==="tutorial",isNarration=step.type==="narration";
      const dynamicPortrait=step.portraitId ? (enemyData?.[step.portraitId]?.img || roster?.[step.portraitId]?.img || null) : null;
      const portraitSrc=step.silhouette || step.portrait || dynamicPortrait || (!isSystem && !isTutorial && !isNarration && step.speaker==="主人公" ? roster.hero?.img : null);
      const hasPortrait=!!portraitSrc && !isSystem && !isTutorial && !isNarration;
      panel.classList.toggle("no-portrait",!hasPortrait);
      panel.classList.toggle("system",isSystem);
      panel.classList.toggle("tutorial",isTutorial);
      panel.classList.toggle("narration",isNarration);
      portraitWrap.classList.toggle("silhouette",!!step.silhouette && hasPortrait);
      portraitWrap.classList.toggle("male",!!step.silhouette && hasPortrait && (step.silhouetteTone||"male")!=="female");
      portraitWrap.classList.toggle("female",!!step.silhouette && hasPortrait && step.silhouetteTone==="female");
      const speakerName=step.speaker==="主人公"?storyHeroName():storyText(step.speaker||"");
      if(hasPortrait){portrait.src=portraitSrc;portrait.alt=speakerName||"立ち絵";}else{portrait.removeAttribute("src");portrait.alt="";}
      speaker.textContent=isTutorial?(step.title||"📌 案内"):((isSystem||isNarration)?"":speakerName);
      body.textContent=storyText(step.text||"");
      choices.innerHTML="";
      const opts=(Array.isArray(step.choices)?step.choices:[]).filter(opt=>typeof opt?.showIf!=="function" || !!opt.showIf());
      panel.classList.toggle("has-choices",opts.length>0);
      panel.classList.toggle("multi-choice",opts.length>2);
      opts.forEach(opt=>{const b=document.createElement("button");b.className="story-choice";b.textContent=storyText(opt.label);b.disabled=typeof opt?.disabledIf==="function"?!!opt.disabledIf():!!opt?.disabled;b.onclick=()=>chooseStoryEvent(opt);choices.appendChild(b);});
      next.hidden=opts.length>0;
      $("storyEventHint").textContent="";
      $("storyEventPreview").classList.toggle("show",!!runtime.preview);
      $("storyEventModal").classList.add("show");
      return;
    }
    finishStoryEvent();
  }
  function startStoryEvent(id,options={}){
    const def=STORY_EVENTS[id];if(!def)return false;
    const preview=!!options.preview,force=!!options.force;
    if(!preview && !force && def.completionFlag && state.eventFlags?.[def.completionFlag]) return false;
    state.storyEventRuntime={id,index:0,preview,appliedEffects:new Set()};
    renderStoryEventStep();
    return true;
  }
  $("storyEventNextBtn").onclick=advanceStoryEvent;

  function configurePartyManageScreen(context="milesta"){
    state.partyManageContext=context;
    const exploring=context==="explore";
    const yodyTown=context==="yody";
    const tilenoTown=context==="tileno";
    const granzelTown=context==="granzel";
    const kunputei=context==="kunputei";
    const travelOnly=exploring||yodyTown||tilenoTown||granzelTown||kunputei;
    const waitingOk=context==="milesta" && waitingUnlocked();
    $("partyManageShell").classList.toggle("explore-mode",travelOnly);
    if(travelOnly || !waitingOk) state.partyWaitingViewOpen=false;
    $("partyManageShell").classList.toggle("waiting-view-mode",!travelOnly && waitingOk && state.partyWaitingViewOpen);
    $("partyManageKicker").textContent=exploring ? "EXPEDITION PARTY ORGANIZE" : yodyTown ? "YODY PARTY ORGANIZE" : tilenoTown ? "TILENO PARTY ORGANIZE" : granzelTown ? "GRANZEL PARTY ORGANIZE" : kunputei ? "KUNPUTEI PARTY ORGANIZE" : "MILESTA PARTY ORGANIZE";
    $("partyManageTitle").textContent=exploring ? "探索パーティ編成" : "仲間編成";
    $("partyManageDesc").textContent=exploring
      ? "同行中の10枠を入れ替えます。1人目をタップして選び、次に移動先の枠をタップしてください。主人公も控えへ移動できます。"
      : waitingOk
        ? "探索に同行する10枠を整理します。選択中の仲間は「ミレスタに待機させる」で預けられ、「待機から呼び出す」で戻せます。主人公はバトルと控えの間だけ移動できます。"
        : "同行中の10枠を整理します。バトルメンバーと控えの入れ替えができます。ミレスタ待機の仲間を呼び出したり、預けたりできるのはミレスタだけです。";
    $("partyWaitingOpenBtn").hidden=travelOnly || !waitingOk;
    $("partyWaitSelectedBtn").hidden=travelOnly || !waitingOk;
    $("partyBackBtn").textContent=exploring ? "← 探索へ" : `← ${townDisplayName(context)}へ`;
  }

  function openPartyManage(context="milesta"){
    state.partySelection=null;
    state.partyWaitingViewOpen=false;
    configurePartyManageScreen(context);
    if(context!=="explore" && context!=="kunputei") restorePartyFull();
    renderPartyManage();
    showScreen("partyScreen");
    $("topSubtitle").textContent=context==="explore" ? `探索パーティ編成 ${DEV_VERSION}` : `${townDisplayName(context)}・仲間編成 ${DEV_VERSION}`;
  }

  $("dummyParty").onclick=()=>openPartyManage(state.currentTown);
  $("townShopBtn").onclick=()=>openShop(townInfo().shop);
  $("homeInventoryBtn").onclick=()=>openInventoryMenu("home","items");
  $("townTalkCloseBtn").onclick=()=>closeTownTalkModal();
  $("townTalkModal").onclick=e=>{ if(e.target===$("townTalkModal")) closeTownTalkModal(); };
  $("dummyTalk").onclick=()=>{
    if(state.currentTown==="milesta" && prologueStage()===0 && !state.eventFlags?.milestaIntroDone){
      startStoryEvent("milestaIntroEliza");
      return;
    }
    openTownTalkModal();
  };
  function centerWorldMapOn(area=state.selectedArea,behavior="auto"){
    const viewport=$("worldMapViewport");
    const pin=document.querySelector(`.area-pin[data-area="${area}"]`);
    if(!viewport||!pin||pin.style.display==="none") return;
    const x=Number(pin.dataset.mapX)||pin.offsetLeft;
    const y=Number(pin.dataset.mapY)||pin.offsetTop;
    const left=Math.max(0,Math.min(viewport.scrollWidth-viewport.clientWidth,x-viewport.clientWidth/2));
    const top=Math.max(0,Math.min(viewport.scrollHeight-viewport.clientHeight,y-viewport.clientHeight/2));
    viewport.scrollTo({left,top,behavior});
  }
  function enableWorldMapMousePan(){
    const viewport=$("worldMapViewport");
    if(!viewport||viewport.dataset.panReady) return;
    viewport.dataset.panReady="1";
    let dragging=false,startX=0,startY=0,startLeft=0,startTop=0;
    viewport.addEventListener("pointerdown",e=>{
      if(e.pointerType!=="mouse"||e.button!==0||e.target.closest(".area-pin")) return;
      dragging=true;startX=e.clientX;startY=e.clientY;startLeft=viewport.scrollLeft;startTop=viewport.scrollTop;
      viewport.classList.add("dragging");viewport.setPointerCapture?.(e.pointerId);e.preventDefault();
    });
    viewport.addEventListener("pointermove",e=>{
      if(!dragging) return;
      viewport.scrollLeft=startLeft-(e.clientX-startX);viewport.scrollTop=startTop-(e.clientY-startY);
    });
    const endDrag=e=>{if(!dragging)return;dragging=false;viewport.classList.remove("dragging");try{viewport.releasePointerCapture?.(e.pointerId);}catch(_){}};
    viewport.addEventListener("pointerup",endDrag);viewport.addEventListener("pointercancel",endDrag);
  }
  enableWorldMapMousePan();
  function departKunputei(){
    modal("🌿 ルネル地方",`薫風亭を出ると、旧ルネルパリオ領の道が先へ続いている。

ルネルの街まで、まだ長い道のりになりそうだ。`,[
      ["出発する",()=>{closeModal();enterRunelRegionFromKunputei();}],
      ["薫風亭へ戻る",closeModal]
    ]);
  }
  $("goWorld").onclick=()=>{
    if(state.currentTown==="kunputei"){departKunputei();return;}
    $("topSubtitle").textContent=`世界マップ ${DEV_VERSION}`;
    updateWorld();showScreen("worldScreen");
    requestAnimationFrame(()=>centerWorldMapOn(state.selectedArea,"auto"));
  };
  $("saveLoadBtn").onclick=()=>openSaveUi(state.currentTown,"save");
  $("returnTitleBtn").onclick=()=>confirmReturnToTitle();
  $("titleNewBtn").onclick=()=>startNewGame();
  $("titleContinueBtn").onclick=()=>openSaveUi("title","load");
  $("heroNameInput").addEventListener("input",updateHeroNameEntry);
  $("heroNameInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.isComposing&&!$("heroNameConfirmBtn").disabled){e.preventDefault();confirmHeroNameEntry();}});
  $("heroNameConfirmBtn").onclick=confirmHeroNameEntry;

  function ensureHeroTravelMember(){
    if(state.battleActive.includes("hero") || state.battleReserve.includes("hero")) return;
    if(state.battleActive.length<4){ state.battleActive.push("hero"); return; }
    if(state.battleReserve.length<6){ state.battleReserve.push("hero"); return; }
    const displaced=state.battleReserve.pop();
    state.battleReserve.push("hero");
    // displaced automatically becomes a Milesta waiting member because waiting is derived from ownedSpecies.
  }

  function waitingSpeciesIds(){
    const traveling=new Set([...state.battleActive,...state.battleReserve]);
    return [...state.ownedSpecies].filter(id=>!traveling.has(id));
  }

  function partyLocation(id){
    let i=state.battleActive.indexOf(id);
    if(i>=0) return {group:"battle",index:i};
    i=state.battleReserve.indexOf(id);
    if(i>=0) return {group:"reserve",index:i};
    if(state.ownedSpecies.has(id)) return {group:"waiting",index:-1};
    return null;
  }

  function partyThumbHtml(c){
    const heroClass=c.id==="hero" ? " hero-thumb" : "";
    return c.img
      ? `<span class="party-slot-thumb${heroClass}"><img src="${c.img}" alt="${c.name}"></span>`
      : `<span class="party-slot-thumb"><span class="hero-placeholder">👤</span></span>`;
  }

  function partyCardHtml(c){
    const st=S(c);
    const heroTag=c.id==="hero" ? "・同行固定" : "";
    return `${partyThumbHtml(c)}
      <span class="party-slot-info">
        <span class="party-slot-name">${c.name}</span>
        <span class="party-slot-meta">Lv${c.level}${heroTag}</span>
        <span class="party-mini-hp"><b>HP</b><i style="--hp:${hpPct(c)}%"></i><span>${st.hp}/${st.hpMax}</span></span>
        <span class="party-mini-hp mp"><b>MP</b><i style="--hp:${mpPct(c)}%"></i><span>${st.mp}/${st.mpMax}</span></span>
      </span>`;
  }

  function updatePartyDetail(id=null){
    const c=roster[id||"hero"] || roster.hero;
    state.partyDetailCharacterId=c.id;
    const st=S(c);
    const portrait=$("partyDetailPortrait");
    portrait.innerHTML=c.img ? `<img src="${c.img}" alt="${c.name}">` : "<span>👤</span>";
    $("partyDetailName").textContent=c.name;
    $("partyDetailMeta").textContent=`Lv${c.level}`;
    $("partyDetailStats").innerHTML=`
      <div class="party-detail-resource-row">
        <div class="party-detail-resource">
          <div class="party-detail-resource-head"><b>HP</b><span>${st.hp}/${st.hpMax}</span></div>
          <div class="party-detail-resource-bar hp"><i style="width:${hpPct(c)}%"></i></div>
        </div>
        <div class="party-detail-resource">
          <div class="party-detail-resource-head"><b>MP</b><span>${st.mp}/${st.mpMax}</span></div>
          <div class="party-detail-resource-bar mp"><i style="width:${mpPct(c)}%"></i></div>
        </div>
      </div>
      <div class="party-detail-ability-row">
        <span>攻 <b>${st.atk}</b></span><span>防 <b>${st.def}</b></span><span>魔 <b>${st.magic}</b></span>
        <span>魔防 <b>${st.mdef}</b></span><span>速 <b>${st.spd}</b></span><span>運 <b>${equipmentExtras(c).fate}</b></span>
      </div>`;
  }

  function selectPartyMember(id,group,index){
    state.partySelection={id,group,index};
    updatePartyDetail(id);
    const heroNote=id==="hero" && waitingAccessAllowed() ? " 主人公はミレスタ待機には移せません。" : "";
    $("partyDetailGuide").textContent=(!waitingAccessAllowed()
      ? "選択中。移動したいバトル枠・控え枠をタップしてください。"
      : "選択中。移動先のバトル枠・控え枠をタップするか、「ミレスタに待機させる」を押してください。")+heroNote;
    renderPartyManage(false);
  }

  function clearPartySelection(message="仲間をタップすると選択できます。"){
    state.partySelection=null;
    $("partyDetailGuide").textContent=message;
    renderPartyManage(false);
  }

  function moveSelectedTo(group,index,destId=null){
    const sel=state.partySelection;
    if(!sel) return;
    const id=sel.id;
    const source=partyLocation(id);
    if(!source) return;
    if(roster[id]?.partyLocked || (destId && roster[destId]?.partyLocked)){ clearPartySelection("エリザはこの探索中、同行固定です。"); return; }

    const sourceArr=source.group==="battle" ? state.battleActive : source.group==="reserve" ? state.battleReserve : null;
    const destArr=group==="battle" ? state.battleActive : state.battleReserve;

    if(group==="battle" && !destId && state.battleActive.length>=4){ clearPartySelection("バトルメンバーは4人までです。"); return; }
    if(group==="reserve" && !destId && state.battleReserve.length>=6){ clearPartySelection("控えは6人までです。"); return; }
    if(source.group==="battle" && group==="reserve" && !destId && state.battleActive.length<=1){
      clearPartySelection("バトルメンバーは最低1人必要です。"); return;
    }

    // Waiting -> battle/reserve. Occupied destination swaps the displaced member to waiting automatically.
    if(source.group==="waiting"){
      if(destId) destArr[index]=id;
      else destArr.push(id);
      clearPartySelection(`${roster[id].name}を${group==="battle"?"バトルメンバー":"控え"}へ移動しました。`);
      return;
    }

    // Same group: swap/reorder.
    if(source.group===group){
      if(destId && source.index!==index){
        [sourceArr[source.index],sourceArr[index]]=[sourceArr[index],sourceArr[source.index]];
      }else if(!destId && source.index!==index){
        const [moved]=sourceArr.splice(source.index,1); sourceArr.push(moved);
      }
      clearPartySelection("並び順を変更しました。");
      return;
    }

    // Battle <-> reserve.
    if(destId){
      const oldDest=destArr[index]; destArr[index]=id; sourceArr[source.index]=oldDest;
    }else{
      sourceArr.splice(source.index,1); destArr.push(id);
    }
    clearPartySelection(`${roster[id].name}を${group==="battle"?"バトルメンバー":"控え"}へ移動しました。`);
  }

  function moveSelectedToWaiting(){
    if(state.partyManageContext!=="milesta") return;
    if(!waitingUnlocked()){ clearPartySelection("ミレスタ待機はまだ利用できません。"); return; }
    const sel=state.partySelection;
    if(!sel) return;
    if(sel.id==="hero"){ clearPartySelection("主人公は探索パーティから外せません。"); return; }
    const source=partyLocation(sel.id);
    if(!source || source.group==="waiting"){ clearPartySelection(); return; }
    if(source.group==="battle" && state.battleActive.length<=1){ clearPartySelection("バトルメンバーは最低1人必要です。"); return; }
    const arr=source.group==="battle" ? state.battleActive : state.battleReserve;
    arr.splice(source.index,1);
    if(traitOf(roster[sel.id])?.effect?.type==="nextBattlePolishFromHealNode") roster[sel.id]._desertDogPolishPending=false;
    clearPartySelection(`${roster[sel.id].name}をミレスタ待機にしました。`);
  }

  function swapSelectedWithWaiting(waitId){
    const sel=state.partySelection;
    if(!sel || sel.group==="waiting") { selectPartyMember(waitId,"waiting",-1); return; }
    if(sel.id==="hero"){ clearPartySelection("主人公はミレスタ待機には移せません。"); return; }
    const source=partyLocation(sel.id);
    if(!source || source.group==="waiting") return;
    const arr=source.group==="battle" ? state.battleActive : state.battleReserve;
    arr[source.index]=waitId;
    if(traitOf(roster[sel.id])?.effect?.type==="nextBattlePolishFromHealNode") roster[sel.id]._desertDogPolishPending=false;
    clearPartySelection(`${roster[sel.id].name}と${roster[waitId].name}を入れ替えました。`);
  }

  function makePartySlot(group,index,id){
    const btn=document.createElement("button");
    if(!id){
      btn.className="party-organize-slot empty";
      btn.textContent=group==="battle" ? `EMPTY ${index+1}/4` : `EMPTY ${index+1}/6`;
      btn.onclick=()=>moveSelectedTo(group,index,null);
      return btn;
    }

    const c=roster[id];
    btn.className="party-organize-slot";
    if(c?.partyLocked) btn.classList.add("locked");
    if(state.partySelection?.id===id) btn.classList.add("selected");
    btn.innerHTML=partyCardHtml(c);
    btn.onclick=()=>{
      if(c?.partyLocked){ updatePartyDetail(id); $("partyDetailGuide").textContent="エリザはこの探索中、同行固定です。"; return; }
      if(state.partySelection && state.partySelection.id!==id){
        moveSelectedTo(group,index,id);
      }else if(state.partySelection?.id===id){
        clearPartySelection();
      }else{
        selectPartyMember(id,group,index);
      }
    };
    return btn;
  }

  function renderPartyManage(refreshDetail=true){
    ensureHeroTravelMember();
    const battle=$("partyBattleSlots");
    const reserve=$("partyReserveSlots");
    const waiting=$("partyWaitingList");
    battle.innerHTML=""; reserve.innerHTML=""; waiting.innerHTML="";

    for(let i=0;i<4;i++) battle.appendChild(makePartySlot("battle",i,state.battleActive[i]||null));
    for(let i=0;i<6;i++) reserve.appendChild(makePartySlot("reserve",i,state.battleReserve[i]||null));

    const waits=(!waitingAccessAllowed()) ? [] : waitingSpeciesIds();
    if(state.partyManageContext==="milesta"){
      if(!waits.length){
        const empty=document.createElement("div"); empty.className="party-wait-empty"; empty.textContent="待機中の仲間はいません"; waiting.appendChild(empty);
      }else{
        waits.forEach(id=>{
          const c=roster[id];
          const btn=document.createElement("button"); btn.className="party-wait-card party-organize-slot";
          if(state.partySelection?.id===id) btn.classList.add("selected");
          btn.innerHTML=partyCardHtml(c);
          btn.onclick=()=>{
            const alreadySelected=state.partySelection?.group==="waiting" && state.partySelection?.id===id;
            if(alreadySelected){
              state.partySelection=null;
              updatePartyDetail(state.battleActive[0] || state.battleReserve[0] || "hero");
              $("partyDetailGuide").textContent="呼び出したい仲間をタップしてください。";
            }else{
              state.partySelection={id,group:"waiting",index:-1};
              updatePartyDetail(id);
              $("partyDetailGuide").textContent=`${c.name}を選択中です。「編成に呼び出す」で編成画面へ進むか、「詳細を見る」でステータスを確認できます。`;
            }
            renderPartyManage(false);
          };
          waiting.appendChild(btn);
        });
      }
    }

    $("partyBattleCount").textContent=`${state.battleActive.length} / 4`;
    $("partyReserveCount").textContent=`${state.battleReserve.length} / 6`;
    $("partyWaitingCount").textContent=String(waits.length);
    const waitBtn=$("partyWaitSelectedBtn");
    const canWait=waitingAccessAllowed() && !state.partyWaitingViewOpen && !!state.partySelection && state.partySelection.group!=="waiting" && state.partySelection.id!=="hero";
    waitBtn.classList.toggle("ready",canWait);
    waitBtn.disabled=!canWait;
    const deployBtn=$("partyWaitingDeployBtn");
    const canDeploy=waitingAccessAllowed() && state.partyWaitingViewOpen && state.partySelection?.group==="waiting";
    if(deployBtn){
      deployBtn.classList.toggle("ready",canDeploy);
      deployBtn.disabled=!canDeploy;
    }
    if(refreshDetail) updatePartyDetail(state.partySelection?.id || state.battleActive[0] || state.battleReserve[0] || "hero");
  }


  const RESISTANCE_LABELS = {
    fire:"炎",ice:"氷",thunder:"雷",wind:"風",earth:"地",light:"光",dark:"闇",pleasure:"快楽",
    poison:"毒",blind:"暗闇",silence:"封印",death:"即死"
  };
  const RESISTANCE_ICONS = {
    fire:"🔥",ice:"❄️",light:"✨",dark:"🌙",thunder:"⚡",wind:"🍃",earth:"🪨",pleasure:"💗",
    poison:"☠️",blind:"👁️",silence:"🔇",death:"💀"
  };
  const ATTRIBUTE_RESISTANCE_KEYS=["fire","ice","light","dark","thunder","wind","earth","pleasure"];
  const STATUS_RESISTANCE_KEYS=["poison","blind","silence","death"];

  function resistanceBadgeHtml(rank){
    const cls=RESISTANCE_RANKS[rank] ? ` rank-${rank}` : "";
    return `<span class="resistance-badge${cls}">${rank}</span>`;
  }
  function resistanceHeadHtml(key){
    const icon=RESISTANCE_ICONS[key]||"◇";
    const label=RESISTANCE_LABELS[key]||key;
    return `<div class="resistance-head"><span class="resistance-icon" aria-hidden="true">${icon}</span><span class="resistance-label">${label}</span></div>`;
  }

  function setCharacterDetailTab(tab="status"){
    const valid=["status","skills"].includes(tab) ? tab : "status";
    state.characterDetailTab=valid;
    document.querySelectorAll("[data-character-tab]").forEach(btn=>btn.classList.toggle("active",btn.dataset.characterTab===valid));
    [["status","characterPanelStatus"],["skills","characterPanelSkills"]].forEach(([name,id])=>{
      $(id)?.classList.toggle("active",name===valid);
    });
    if(valid!=="status" && state.equipmentPickerOpen){
      state.equipmentPickerOpen=false;
      const c=roster[state.partyDetailCharacterId];
      if(c) renderCharacterPortrait(c);
    }
  }

  function resistanceCards(profile,keys){
    return keys.map(key=>{
      const rank=profile?.resist?.[key] || "-";
      return `<div class="character-resistance">${resistanceHeadHtml(key)}<div class="resistance-value-row">${resistanceBadgeHtml(rank)}</div></div>`;
    }).join("");
  }

  function characterDetailIds(){
    let ids;
    if(state.partyManageContext!=="milesta"){
      ids=[...state.battleActive,...state.battleReserve];
    }else{
      // Keep the same practical order as the organize screen: battle -> reserve -> Milesta waiting.
      ids=[...state.battleActive,...state.battleReserve,...waitingSpeciesIds()];
      if(!ids.includes("hero")) ids.unshift("hero");
    }
    return [...new Set(ids)].filter(id=>roster[id]);
  }

  function updateCharacterDetailNavigator(){
    const ids=characterDetailIds();
    const current=state.partyDetailCharacterId;
    let index=ids.indexOf(current);
    if(index<0) index=0;
    $("characterNavCount").textContent=ids.length ? `${index+1} / ${ids.length}` : "1 / 1";
    const locked=ids.length<=1;
    $("characterPrevBtn").disabled=locked;
    $("characterNextBtn").disabled=locked;
  }

  function shiftCharacterDetail(delta){
    const ids=characterDetailIds();
    if(ids.length<=1) return;
    let index=ids.indexOf(state.partyDetailCharacterId);
    if(index<0) index=0;
    index=(index+delta+ids.length)%ids.length;
    renderCharacterDetail(ids[index],true);
  }

  function equipmentPreviewState(c,slot,itemId){
    const eq={...ensureEquipment(c)}; if(itemId) eq[slot]=itemId;
    const currentDelta=equipmentStatDelta(c); const previewDelta=equipmentStatDelta(c,eq);
    const currentExtras=equipmentExtras(c); const previewExtras=equipmentExtras(c,eq);
    const base={...S(c)}; Object.entries(currentDelta).forEach(([k,v])=>{if(k in base)base[k]-=v;});
    const cur={...base},pre={...base}; Object.entries(currentDelta).forEach(([k,v])=>cur[k]=(cur[k]||0)+v); Object.entries(previewDelta).forEach(([k,v])=>pre[k]=(pre[k]||0)+v);
    cur.crit=currentExtras.crit;cur.evasion=currentExtras.evasion;cur.fate=currentExtras.fate;
    pre.crit=previewExtras.crit;pre.evasion=previewExtras.evasion;pre.fate=previewExtras.fate;
    return {cur,pre,eq};
  }
  function equipmentDiffHtml(label,cur,pre,suffix=""){
    const diff=pre-cur,cls=diff>0?"up":diff<0?"down":"same",arrow=diff>0?"▲":diff<0?"▼":"－";
    const format=v=>suffix==="％"?Number(v).toFixed(1):v;
    return `<div class="equipment-stat"><span>${label}</span><strong>${format(cur)}${suffix}</strong><em class="${cls}">${arrow}${diff?` ${format(pre)}${suffix}`:""}</em></div>`;
  }
  const RESISTANCE_RANK_ORDER=["E","D","C","B","A","S"];
  function equipmentResistanceDelta(equipmentOverride){
    const out={};
    const allKeys=[...ATTRIBUTE_RESISTANCE_KEYS,...STATUS_RESISTANCE_KEYS];
    EQUIPMENT_SLOTS.forEach(slot=>{
      const item=equipmentCatalog[equipmentOverride?.[slot]];
      Object.entries(item?.resist||{}).forEach(([key,v])=>out[key]=(out[key]||0)+v);
      const all=Number(item?.resistAll)||0;
      if(all) allKeys.forEach(key=>out[key]=(out[key]||0)+all);
    });
    return out;
  }
  function shiftedResistanceRank(baseRank,steps=0){
    const i=RESISTANCE_RANK_ORDER.indexOf(baseRank);
    if(i<0) return baseRank||"-";
    return RESISTANCE_RANK_ORDER[Math.max(0,Math.min(RESISTANCE_RANK_ORDER.length-1,i+steps))];
  }
  function equipmentResistancePreview(c,eq){
    const base=profileFor(c)?.resist||{};
    const currentEq=ensureEquipment(c);
    const curDelta=equipmentResistanceDelta(currentEq),preDelta=equipmentResistanceDelta(eq);
    const cur={},pre={};
    [...ATTRIBUTE_RESISTANCE_KEYS,...STATUS_RESISTANCE_KEYS].forEach(k=>{
      cur[k]=shiftedResistanceRank(base[k]||"-",curDelta[k]||0);
      pre[k]=shiftedResistanceRank(base[k]||"-",preDelta[k]||0);
    });
    return {cur,pre};
  }
  function equipmentResistanceDiffHtml(key,cur,pre){
    const ci=RESISTANCE_RANK_ORDER.indexOf(cur),pi=RESISTANCE_RANK_ORDER.indexOf(pre);
    const diff=(ci<0||pi<0)?0:pi-ci,cls=diff>0?"up":diff<0?"down":"same";
    const body=diff===0
      ? resistanceBadgeHtml(cur)
      : `<span class="resistance-delta ${cls}" aria-hidden="true">${diff>0?"▲":"▼"}</span>${resistanceBadgeHtml(pre)}`;
    const changeLabel=diff===0?`${cur}`:`${cur}から${pre}へ${diff>0?"上昇":"低下"}`;
    return `<div class="equipment-resistance" aria-label="${RESISTANCE_LABELS[key]||key} ${changeLabel}">${resistanceHeadHtml(key)}<div class="resistance-value-row">${body}</div></div>`;
  }

  function renderCharacterPortrait(c){
    const card=document.querySelector(".character-portrait-card");
    if(card) card.classList.remove("picker-mode");
    const portrait=$("characterPortrait");
    if(!portrait) return;
    portrait.className="character-portrait";
    portrait.innerHTML="";
    if(c.img){
      const img=document.createElement("img"); img.src=c.img; img.alt=c.name; portrait.appendChild(img);
    }else{
      const ph=document.createElement("span"); ph.textContent="👤"; portrait.appendChild(ph);
    }
  }

  function equipmentItemBits(c,item){
    const mods=itemModsFor(c,item); const bits=[];
    Object.entries(mods).filter(([,v])=>v).forEach(([k,v])=>bits.push(`${({atk:"攻",def:"防",magic:"魔",mdef:"魔防",spd:"速",hpMax:"HP",mpMax:"MP"}[k]||k)}${v>0?"+":""}${v}`));
    if(item.crit) bits.push(`会心+${Number(item.crit).toFixed(1)}%`);
    if(item.evasion) bits.push(`回避+${Number(item.evasion).toFixed(1)}%`);
    if(item.bowInstantKillRate) bits.push(`射抜+${Number(item.bowInstantKillRate).toFixed(1)}%`);
    if(item.basicDeathRate) bits.push(`即死+${(Number(item.basicDeathRate)*100).toFixed(1)}%`);
    if(item.basicDispelRate) bits.push(`通常攻撃でバフ解除 ${Math.round(Number(item.basicDispelRate)*100)}%`);
    if(item.roundStartBlockRate) bits.push(`R開始ブロック ${Math.round(Number(item.roundStartBlockRate)*100)}%`);
    if(item.roundEndHealRate && item.roundEndHealPercent) bits.push(`R終了HP${Math.round(Number(item.roundEndHealPercent)*100)}%回復 ${Math.round(Number(item.roundEndHealRate)*100)}%`);
    if(item.attackAll) bits.push(`全体${Math.round((item.normalAttackPower||1)*100)}%`);
    if(item.defenseInfluence!==undefined && item.defenseInfluence!==1) bits.push(`防御影響${Math.round(item.defenseInfluence*100)}%`);
    if(item.fate) bits.push(`運${item.fate>0?"+":""}${item.fate}`);
    if(item.hpPercent) bits.push(`最大HP${item.hpPercent>0?"+":""}${Math.round(item.hpPercent*100)}%`);
    if(item.mpPercent) bits.push(`最大MP${item.mpPercent>0?"+":""}${Math.round(item.mpPercent*100)}%`);
    if(item.allStatPercent) bits.push(`全能力${Math.round(item.allStatPercent*100)}%`);
    if(item.fatePercent) bits.push(`運命${Math.round(item.fatePercent*100)}%`);
    Object.entries(item.resist||{}).forEach(([key,steps])=>{
      if(steps) bits.push(`${RESISTANCE_LABELS[key]||key}耐性${steps>0?"+":""}${steps}`);
    });
    if(item.resistAll) bits.push(`全耐性${item.resistAll>0?"+":""}${item.resistAll}`);
    Object.entries(item.physicalStatus||{}).forEach(([status,rate])=>bits.push(`${statusName(status)}攻撃+${Math.round(Number(rate)*100)}%`));
    if(item.bowInstantKillImmune) bits.push("射抜即死無効");
    if(item.erodeDamageMultiplier) bits.push(`イロード被ダメ${Math.round((Number(item.erodeDamageMultiplier)-1)*100)}%`);
    if(item.expMultiplier && item.expMultiplier!==1) bits.push(`EXP×${Number(item.expMultiplier).toFixed(1)}`);
    if(item.reserveExpRate) bits.push(`控えEXP${Math.round(Number(item.reserveExpRate)*100)}%`);
    if(item.redistributeExp) bits.push("EXP分配");
    if(item.preventWipe) bits.push("全滅回避・消滅");
    if(item.battleNodeWeightBonus) bits.push(`戦闘ノード重み+${Math.round(Number(item.battleNodeWeightBonus)*100)}%`);
    if(item.skillBoost) bits.push("専用技強化");
    return bits;
  }

  function renderEquipmentPicker(c,slot){
    const card=document.querySelector(".character-portrait-card");
    const portrait=$("characterPortrait"); if(!card||!portrait)return;
    card.classList.add("picker-mode"); portrait.className="";
    const emptyId={weapon:"bare",shield:"no_shield",body:"no_body",accessory:"no_accessory"}[slot];
    const previewId=state.equipmentPreviewId||c.equipment[slot];
    const items=(equipmentInventory[slot]||[]).filter(id=>ownedEquipmentCount(id)>0 || id===c.equipment[slot]);
    const list=items.map(id=>{
      const item=equipmentCatalog[id];
      const bits=equipmentItemBits(c,item);
      const isEmpty=id===emptyId;
      const free=freeEquipmentCount(id,c.id);
      const noCopy=!isEmpty && id!==c.equipment[slot] && free<=0;
      const unavailable=!!item.unavailable||noCopy;
      const mark=item.unavailable?"保留":noCopy?"使用中":id===c.equipment[slot]?"装備中":isEmpty?"":`×${free}`;
      return `<button class="equipment-picker-item${id===previewId?" preview":""}${id===c.equipment[slot]?" equipped":""}" data-picker-item="${id}" ${unavailable?"disabled":""}><span class="ico">${item.icon||"－"}</span><span><b>${item.name}</b><small>${bits.join(" / ")||"補正なし"}</small></span><span class="mark">${mark}</span></button>`;
    }).join("");
    const item=equipmentCatalog[previewId];
    const same=previewId===c.equipment[slot];
    const previewIsEmpty=previewId===emptyId;
    const currentIsEmpty=c.equipment[slot]===emptyId;
    const removeMode=(!currentIsEmpty && (same||previewIsEmpty));
    const confirmLabel=removeMode?"装備をはずす":"装備する";
    const confirmDisabled=same&&currentIsEmpty;
    portrait.innerHTML=`<div class="equipment-picker"><div class="equipment-picker-head"><strong>${EQUIPMENT_SLOT_LABELS[slot]}を選択</strong><span>${items.length}個</span></div><div class="equipment-picker-list">${list}</div><div class="equipment-picker-footer"><div class="equipment-picker-desc"><strong>${item?.name||"装備なし"}</strong><br>${item?.desc||""}</div><div class="equipment-picker-actions"><button id="equipmentPickerCancel">キャンセル</button><button class="primary" id="equipmentPickerConfirm" ${confirmDisabled?"disabled":""}>${confirmLabel}</button></div></div></div>`;
    const listEl=portrait.querySelector(".equipment-picker-list");
    if(listEl) listEl.scrollTop=state.equipmentPickerScrollTop||0;
    portrait.querySelectorAll("[data-picker-item]").forEach(b=>b.onclick=()=>{
      state.equipmentPickerScrollTop=listEl?.scrollTop||0;
      state.equipmentPreviewId=b.dataset.pickerItem;
      renderEquipmentTab(c);
      renderEquipmentPicker(c,slot);
    });
    $("equipmentPickerCancel").onclick=()=>{state.equipmentPickerOpen=false;state.equipmentPreviewId=c.equipment[slot];state.equipmentPickerScrollTop=0;renderEquipmentTab(c);renderCharacterPortrait(c);};
    $("equipmentPickerConfirm").onclick=()=>{
      const targetId=removeMode?emptyId:state.equipmentPreviewId;
      changeEquipment(c,slot,targetId);
      state.equipmentPickerOpen=false;state.equipmentPreviewId=c.equipment[slot];state.equipmentPickerScrollTop=0;renderCharacterDetail(c.id,true);
    };
  }

  function renderEquipmentTab(c){
    const host=$("characterEquipment"); if(!host)return; ensureEquipment(c);
    const slot=state.equipmentSlot||"weapon";
    let previewId=state.equipmentPreviewId;
    if(!equipmentInventory[slot]?.includes(previewId)) previewId=c.equipment[slot];
    state.equipmentPreviewId=previewId;
    const p=equipmentPreviewState(c,slot,previewId);
    const resist=equipmentResistancePreview(c,p.eq);
    const favorites=favoriteWeaponTypes(c);
    const slotsHtml=EQUIPMENT_SLOTS.map(sl=>{const item=equipmentCatalog[c.equipment[sl]];return `<button class="equipment-slot${sl===slot?" selected":""}" data-equip-slot="${sl}"><span class="equipment-slot-icon">${item?.icon||"－"}</span><span><span class="equipment-slot-kind">${EQUIPMENT_SLOT_LABELS[sl]}</span><span class="equipment-slot-name">${item?.name||"装備なし"}</span></span><span>›</span></button>`;}).join("");
    const statHtml=[
      ["攻撃",p.cur.atk,p.pre.atk,""],["防御",p.cur.def,p.pre.def,""],
      ["魔力",p.cur.magic,p.pre.magic,""],["魔防",p.cur.mdef,p.pre.mdef,""],
      ["素早さ",p.cur.spd,p.pre.spd,""],["運命値",p.cur.fate,p.pre.fate,""],
      ["会心率",p.cur.crit,p.pre.crit,"％"],["回避率",p.cur.evasion,p.pre.evasion,"％"]
    ].map(x=>equipmentDiffHtml(x[0],x[1],x[2],x[3])).join("");
    const resistanceHtml=[...ATTRIBUTE_RESISTANCE_KEYS,...STATUS_RESISTANCE_KEYS].map(k=>equipmentResistanceDiffHtml(k,resist.cur[k],resist.pre[k])).join("");
    const compareMode=state.equipmentCompareMode||"stats";
    const compareTabs=`<div class="equipment-compare-tabs"><button class="equipment-compare-tab${compareMode==="stats"?" active":""}" data-equip-compare="stats">能力</button><button class="equipment-compare-tab${compareMode==="resist"?" active":""}" data-equip-compare="resist">耐性</button></div>`;
    const compareBody=compareMode==="resist" ? `<div class="equipment-resistance-grid">${resistanceHtml}</div>` : `<div class="equipment-stat-grid">${statHtml}</div>`;
    const favoriteText=favorites.length?favorites.map(type=>`${weaponTypeIcons[type]||""} ${weaponTypeLabels[type]||type}`).join(" / "):"未設定";
    host.innerHTML=`<div class="equipment-combined"><div class="equipment-slots"><div class="equipment-slot-list">${slotsHtml}</div><div class="equipment-favorite">得意武器種：${favoriteText}</div></div><div class="equipment-preview">${compareTabs}${compareBody}</div></div>`;
    host.querySelectorAll("[data-equip-slot]").forEach(b=>b.onclick=()=>{state.equipmentSlot=b.dataset.equipSlot;state.equipmentPreviewId=c.equipment[state.equipmentSlot];state.equipmentPickerScrollTop=0;state.equipmentPickerOpen=true;renderEquipmentTab(c);renderEquipmentPicker(c,state.equipmentSlot);});
    host.querySelectorAll("[data-equip-compare]").forEach(b=>b.onclick=()=>{state.equipmentCompareMode=b.dataset.equipCompare;renderEquipmentTab(c);});
  }

  function fitCharacterDetailName(){
    const el=$("characterName");
    if(!el) return;
    // Start at the normal stylesheet size and keep shrinking until the whole
    // name fits. Character names are never intentionally abbreviated here.
    el.style.fontSize="";
    requestAnimationFrame(()=>{
      if(!el || !el.isConnected) return;
      let size=parseFloat(getComputedStyle(el).fontSize)||23;
      const safetyMinSize=6;
      while(el.scrollWidth>el.clientWidth && size>safetyMinSize){
        size-=0.5;
        el.style.fontSize=`${size}px`;
      }
    });
  }

  function renderCharacterDetail(id="hero",preserveTab=false){
    const tab=preserveTab ? (state.characterDetailTab||"status") : "status";
    const c=roster[id] || roster.hero;
    const st=S(c);
    const profile=profileFor(c);
    state.partyDetailCharacterId=c.id;
    state.equipmentPreviewId=ensureEquipment(c)[state.equipmentSlot||"weapon"];
    if(!preserveTab){state.equipmentCompareMode="stats";state.equipmentPickerScrollTop=0;}

    $("characterName").textContent=c.name;
    fitCharacterDetailName();
    $("characterLevel").textContent=`LEVEL ${c.level}`;

    state.equipmentPickerOpen=false;
    renderCharacterPortrait(c);

    $("characterHpText").textContent=`${st.hp} / ${st.hpMax}`;
    $("characterMpText").textContent=`${st.mp} / ${st.mpMax}`;
    $("characterHpBar").style.width=`${hpPct(c)}%`;
    $("characterMpBar").style.width=`${mpPct(c)}%`;

    if(c.level>=MAX_LEVEL){
      $("characterExpText").textContent="MAX";
      $("characterExpBar").style.width="100%";
      $("characterExpNote").textContent="最大レベル";
    }else{
      const need=expNeeded(c.level,c);
      const pct=Math.max(0,Math.min(100,Math.round(c.exp/need*100)));
      $("characterExpText").textContent=`${c.exp} / ${need}`;
      $("characterExpBar").style.width=`${pct}%`;
      $("characterExpNote").textContent=`次のレベルまで ${Math.max(0,need-c.exp)} EXP`;
    }

    const trait=profile?.trait;
    $("characterTrait").innerHTML=trait
      ? `<div class="character-trait-card"><div class="character-trait-icon">${trait.icon||"✨"}</div><div class="character-trait-main"><div class="character-trait-name">${trait.name}</div><div class="character-trait-desc">${trait.desc}</div></div></div>`
      : `<div class="character-trait-card character-trait-empty"><div class="character-trait-icon">◇</div><div class="character-trait-main"><div class="character-trait-name">固有特性 未設定</div><div class="character-trait-desc">このキャラクターの固有特性はまだ設定されていません。</div></div></div>`;

    if(profile?.resist){
      const eqResDelta=equipmentResistanceDelta(ensureEquipment(c));
      const effectiveProfile={...profile,resist:{...profile.resist}};
      [...ATTRIBUTE_RESISTANCE_KEYS,...STATUS_RESISTANCE_KEYS].forEach(k=>effectiveProfile.resist[k]=shiftedResistanceRank(profile.resist[k],eqResDelta[k]||0));
      $("characterResistance").innerHTML=`
        <div class="character-resistance-section"><div class="character-resistance-title">属性耐性</div><div class="character-resistance-grid">${resistanceCards(effectiveProfile,ATTRIBUTE_RESISTANCE_KEYS)}</div></div>
        <div class="character-resistance-section"><div class="character-resistance-title">状態異常耐性</div><div class="character-resistance-grid">${resistanceCards(effectiveProfile,STATUS_RESISTANCE_KEYS)}</div></div>
        <div class="character-resistance-note">ランクは E ～ S。装備による耐性補正も反映しています。</div>`;
    }else{
      $("characterResistance").innerHTML=`<div class="character-skill-empty">耐性データはまだ正式移行されていません</div>`;
    }

    const skillIds=learnedSkillIds(c);
    $("characterSkillList").innerHTML=skillIds.length ? skillIds.map(sid=>{
      const sk=skills[sid];
      if(!sk) return "";
      return `<div class="character-skill-card">`+
        `<div class="character-skill-icon">${sk.icon||"✨"}</div>`+
        `<div class="character-skill-main"><div class="character-skill-name">${sk.name}</div><div class="character-skill-desc">${sk.desc||""}</div></div>`+
        `<div class="character-skill-cost">${sk.kind==="passive"?"PASSIVE":`MP ${sk.cost||0}`}</div></div>`;
    }).join("") : `<div class="character-skill-empty">習得済みスキルはありません</div>`;

    renderEquipmentTab(c);
    updateCharacterDetailNavigator();
    setCharacterDetailTab(tab);
  }

  document.querySelectorAll("[data-character-tab]").forEach(btn=>{
    btn.onclick=()=>setCharacterDetailTab(btn.dataset.characterTab);
  });
  $("characterPrevBtn").onclick=()=>shiftCharacterDetail(-1);
  $("characterNextBtn").onclick=()=>shiftCharacterDetail(1);

  function openCharacterDetail(id=state.partyDetailCharacterId||"hero"){
    renderCharacterDetail(id);
    $("characterBackBtn").textContent=state.partyManageContext==="explore" ? "← 探索編成へ" : "← 仲間編成へ";
    showScreen("characterScreen");
    // The detail screen is hidden while renderCharacterDetail() runs, so its name width
    // cannot be measured reliably until the screen has actually become visible.
    requestAnimationFrame(()=>requestAnimationFrame(fitCharacterDetailName));
    $("topSubtitle").textContent=`キャラ詳細・装備試作 ${DEV_VERSION}`;
  }

  $("partyDetailOpenBtn").onclick=()=>openCharacterDetail(state.partyDetailCharacterId||"hero");
  $("characterBackBtn").onclick=()=>{
    configurePartyManageScreen(state.partyManageContext);
    renderPartyManage(false);
    showScreen("partyScreen");
    $("topSubtitle").textContent=state.partyManageContext==="explore" ? `探索パーティ編成 ${DEV_VERSION}` : `${townDisplayName(state.partyManageContext)}・仲間編成 ${DEV_VERSION}`;
  };

  $("partyWaitingOpenBtn").onclick=()=>{
    if(!waitingAccessAllowed()) return;
    state.partySelection=null;
    state.partyWaitingViewOpen=true;
    configurePartyManageScreen("milesta");
    renderPartyManage(true);
    $("partyDetailGuide").textContent="呼び出したい仲間をタップしてください。詳細を見るだけでも選択できます。";
  };
  $("partyWaitingDeployBtn").onclick=()=>{
    const sel=state.partySelection;
    if(!sel || sel.group!=="waiting") return;
    const c=roster[sel.id];
    state.partyWaitingViewOpen=false;
    configurePartyManageScreen("milesta");
    $("partyDetailGuide").textContent=`${c.name}を呼び出します。移動先のバトルメンバー・控えのキャラ、または空き枠をタップしてください。`;
    renderPartyManage(false);
  };
  $("partyWaitingCloseBtn").onclick=()=>{
    state.partySelection=null;
    state.partyWaitingViewOpen=false;
    configurePartyManageScreen("milesta");
    renderPartyManage(true);
    $("partyDetailGuide").textContent="仲間をタップすると選択できます。";
  };
  $("partyWaitSelectedBtn").onclick=moveSelectedToWaiting;
  $("partyBackBtn").onclick=()=>{
    state.partySelection=null;
    if(state.partyManageContext==="explore"){
      renderExploreParty();
      showScreen("exploreScreen");
      $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
      updateHeader();
      return;
    }
    if(state.currentTown!=="kunputei") restorePartyFull();
    showTownScreen(state.currentTown);
  };

  $("backHome").onclick=()=>showTownScreen(state.currentTown);
  $("devBadge").onclick=()=>openDebugTools();







  /*
    v0.20 internal organization:
    - Character combat stats are grouped in stats {}
    - learnedSkills is an array, so characters can later hold 5-8+ skills
    - Skill definitions are separated from characters
    - Enemy formation / area data stays separated from character data
  */
  /*
    v0.20 character data foundation
    - Formal profile data is separated from mutable battle state.
    - Lv1 / Lv100 values + growth curve produce intermediate stats.
    - EXP type, recruitment rank, resistances, unique trait and planned skills live here.
    - All current playable-character profiles use Lv1 / Lv100 interpolation.
  */
  const MAX_LEVEL = 100;

  const GROWTH_CURVES = {
    // progress = x + bias * x * (1 - x)
    // A positive bias is early-blooming, a negative bias is late-blooming.
    // All curves still pass exactly through Lv1=0% and Lv100=100%, avoiding the huge Lv2-3 jump of x^a.
    ultraEarly:{label:"超早熟",bias:.80},
    early:{label:"早熟",bias:.35},
    slightlyEarly:{label:"やや早熟",bias:.18},
    normal:{label:"普通",bias:0},
    slightlyLate:{label:"やや晩成",bias:-.22},
    late:{label:"晩成",bias:-.45},
    ultraLate:{label:"超晩成",bias:-.80}
  };

  const EXP_TYPES = {
    superFast:{label:"超速い",multiplier:.85},
    fast:{label:"速い",multiplier:.95},
    normal:{label:"普通",multiplier:1.00},
    slow:{label:"遅い",multiplier:1.20},
    superSlow:{label:"超遅い",multiplier:1.45}
  };

  const RESISTANCE_RANKS = {
    E:{damage:1.50,status:1.50},
    D:{damage:1.25,status:1.25},
    C:{damage:1.00,status:1.00},
    B:{damage:.75,status:.75},
    A:{damage:.50,status:.50},
    S:{damage:.25,status:.25}
  };

  const characterProfiles = {
    hero:{
      id:"hero",role:"万能型（主人公）",isMonsterGirl:false,growthType:"normal",expType:"slow",recruitRank:null,fate:16,
      base:{hpMax:60,mpMax:24,atk:17,def:13,magic:17,mdef:11,spd:12},
      final:{hpMax:800,mpMax:550,atk:330,def:290,magic:320,mdef:280,spd:330},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"C",blind:"C",silence:"C",death:"C"},
      trait:null,
      plannedSkills:{1:["fire"],2:["heal"],6:["blaze"],12:["death"],16:["flare"],19:["allMagic"],24:["heavenlyLight"],28:["pleasureOne"],32:["lastHeal"],37:["gigaRaise"],41:["allDeath"],50:["heroicTailwind"],60:["endBlaze"],75:["canceller"]}
    },
    eliza:{
      id:"eliza",role:"同行NPC",isMonsterGirl:false,growthType:"normal",expType:"normal",recruitRank:null,fate:20,
      base:{hpMax:60,mpMax:18,atk:21,def:15,magic:11,mdef:15,spd:18},
      final:{hpMax:780,mpMax:390,atk:350,def:310,magic:250,mdef:240,spd:370},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"C",blind:"C",silence:"C",death:"C"},
      trait:null,plannedSkills:{1:["ice","frost","cold","heal","allHeal"]}
    },
    slime:{
      id:"slime",role:"序盤の繋ぎ・壁役",growthType:"early",expType:"superFast",recruitRank:"E",fate:12,
      base:{hpMax:58,mpMax:10,atk:10,def:7,magic:5,mdef:7,spd:5},
      final:{hpMax:630,mpMax:310,atk:250,def:250,magic:150,mdef:250,spd:190},
      resist:{fire:"D",ice:"D",light:"C",dark:"C",thunder:"D",wind:"C",earth:"C",pleasure:"C",poison:"E",blind:"B",silence:"B",death:"B"},
      trait:{id:"slimeBody",name:"スライムボディ",icon:"🟢",chance:.20,trigger:"onPhysicalHit",rollPerHit:true,oncePerAction:true,desc:"物理ダメージを受けた時、20%の確率でHPを5%回復。多段攻撃は各ヒットで判定するが、1行動中の発動は最大1回。",effect:{type:"healPercent",percent:5,requiresAlive:true}},
      plannedSkills:{2:["tackle"],8:["guard"],11:["cold"],25:["allGuard"],32:["raise2"],44:["allMount"],70:["lastAura"]}
    },
    dog:{
      id:"dog",role:"アタッカー・探索支援",growthType:"early",expType:"superFast",recruitRank:"E",fate:10,
      base:{hpMax:41,mpMax:6,atk:15,def:8,magic:1,mdef:4,spd:13},
      final:{hpMax:550,mpMax:200,atk:290,def:260,magic:110,mdef:210,spd:310},
      resist:{fire:"C",ice:"B",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"E",poison:"C",blind:"D",silence:"C",death:"D"},
      trait:{id:"digging",name:"あなほり",icon:"🐾",chance:.10,trigger:"healNode",desc:"回復ノード選択時、確率でアイテムを入手。"},
      plannedSkills:{4:["polish"],6:["cure"],21:["allQuick"],33:["counterStance"],55:["doubleAttack"]}
    },
    fairy:{
      id:"fairy",role:null,growthType:"early",expType:"superFast",recruitRank:"E",fate:18,
      base:{hpMax:34,mpMax:20,atk:6,def:5,magic:16,mdef:12,spd:17},
      final:{hpMax:530,mpMax:450,atk:160,def:220,magic:300,mdef:310,spd:300},
      resist:{fire:"D",ice:"C",light:"A",dark:"D",thunder:"C",wind:"B",earth:"A",pleasure:"C",poison:"C",blind:"C",silence:"D",death:"E"},
      trait:{id:"healingFairy",name:"癒しの妖精",icon:"🧚",chance:.15,trigger:"turnEnd",desc:"ターン終了時、15%の確率でダメージを受けている味方1人に、MPを消費せずヒールを発動する。",effect:{type:"freeSkill",skillId:"heal",mpCost:0,target:"damagedAlly"}},
      plannedSkills:{1:["heal"],3:["ice"],12:["wind"],18:["highHeal"],30:["gigaFrost"],36:["fairyHeal"],65:["endCold"],84:["eternal"]}
    },
    slug:{
      id:"slug",role:null,growthType:"early",expType:"fast",recruitRank:"E",fate:9,
      base:{hpMax:44,mpMax:12,atk:12,def:14,magic:4,mdef:3,spd:1},
      final:{hpMax:530,mpMax:210,atk:240,def:330,magic:150,mdef:150,spd:100},
      resist:{fire:"E",ice:"C",light:"C",dark:"C",thunder:"D",wind:"C",earth:"B",pleasure:"B",poison:"B",blind:"C",silence:"C",death:"C"},
      trait:{id:"regenerationSlug",name:"再生ナメクジ",icon:"🐌",trigger:"battleVictory",desc:"戦闘勝利時、戦闘不能でなければ自身のHPを最大HPの20%回復する。",effect:{type:"healPercent",percent:20,requiresAlive:true}},
      plannedSkills:{1:["cure"],15:["raise"],38:["stealth"],51:["guardianBlessing"]}
    },
    momo:{
      id:"momo",role:null,growthType:"early",expType:"fast",recruitRank:"E",fate:15,
      base:{hpMax:54,mpMax:23,atk:13,def:15,magic:13,mdef:3,spd:2},
      final:{hpMax:540,mpMax:340,atk:250,def:300,magic:240,mdef:160,spd:120},
      resist:{fire:"E",ice:"C",light:"C",dark:"C",thunder:"D",wind:"C",earth:"B",pleasure:"B",poison:"B",blind:"C",silence:"C",death:"C"},
      trait:{id:"stickyHeal",name:"ネバネバヒール",icon:"💗",chance:.25,trigger:"turnEndAfterHealingMagic",desc:"回復魔法を使用したターン終了時、25%の確率で自身の魔力が1.3倍になる（5ラウンド）。",effect:{type:"battleBuff",stat:"magic",multiplier:1.30,duration:5,stacking:"refresh"}},
      plannedSkills:{1:["heal"],4:["allHeal"],18:["allHeal2"],25:["allBlock"],41:["fairyHeal"],50:["gigaRaise"]}
    },
    arachne:{
      id:"arachne",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:8,
      base:{hpMax:40,mpMax:16,atk:11,def:10,magic:12,mdef:12,spd:8},
      final:{hpMax:600,mpMax:440,atk:240,def:240,magic:280,mdef:240,spd:280},
      resist:{fire:"D",ice:"C",light:"D",dark:"A",thunder:"C",wind:"C",earth:"C",pleasure:"B",poison:"A",blind:"A",silence:"C",death:"C"},
      trait:{id:"timeThread",name:"時繰りの糸",icon:"🕸️",chance:.20,trigger:"battleStart",desc:"戦闘開始時、20%の確率でランダムな味方1人にクイックを発動する。",effect:{type:"castSkill",skillId:"quick",target:"randomAlly"}},
      plannedSkills:{2:["poison"],5:["touch"],14:["dark"],16:["allQuick"],29:["gigaPleasure"],36:["gigaDark"],42:["eraser"]}
    },
    slimebes:{
      id:"slimebes",role:null,growthType:"early",expType:"superFast",recruitRank:"D",fate:12,
      base:{hpMax:52,mpMax:7,atk:18,def:6,magic:5,mdef:6,spd:9},
      final:{hpMax:600,mpMax:260,atk:310,def:240,magic:130,mdef:230,spd:270},
      resist:{fire:"D",ice:"D",light:"C",dark:"C",thunder:"E",wind:"C",earth:"C",pleasure:"D",poison:"E",blind:"B",silence:"B",death:"B"},
      trait:{id:"orangeGel",name:"オレンジジェル",icon:"🟠",chance:.01,trigger:"normalAttack",rollPerHit:true,oncePerAction:true,desc:"通常攻撃の各ヒット時、1%の確率で対象のバフをすべて解除する。多段攻撃は各ヒットで判定するが、1行動中の発動は最大1回。",effect:{type:"removeBuffs",target:"attackedEnemy",all:true}},
      plannedSkills:{6:["silence"],11:["blaze"],31:["fresh"],40:["counterStance"],57:["unyieldingHeart"]}
    },
    harpy:{
      id:"harpy",role:null,growthType:"early",expType:"fast",recruitRank:"C",fate:16,
      base:{hpMax:33,mpMax:16,atk:16,def:9,magic:13,mdef:7,spd:26},
      final:{hpMax:530,mpMax:430,atk:300,def:220,magic:270,mdef:210,spd:390},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"E",wind:"B",earth:"A",pleasure:"C",poison:"D",blind:"C",silence:"E",death:"C"},
      trait:{id:"windWings",name:"風の翼",icon:"🪽",trigger:"passive",desc:"味方全員の風属性攻撃のダメージを5%上昇させる。",effect:{type:"partyElementDamageBoost",element:"wind",percent:5}},
      plannedSkills:{3:["sonic"],10:["allHeal"],13:["wind"],24:["return"],36:["gigaWind"],41:["aura"],84:["annihilationWindBlade"]}
    },
    alraune:{
      id:"alraune",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:14,
      base:{hpMax:29,mpMax:19,atk:11,def:14,magic:16,mdef:9,spd:6},
      final:{hpMax:510,mpMax:480,atk:220,def:260,magic:260,mdef:220,spd:230},
      resist:{fire:"E",ice:"C",light:"B",dark:"D",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"E",blind:"C",silence:"C",death:"C"},
      trait:{id:"toxinAbsorb",name:"毒素吸収",icon:"🌿",trigger:"battleVictory",desc:"戦闘終了時、毒状態の味方がいる場合、ランダムな1人の毒を解除し、自身のHPを最大HPの30%回復する。",effect:{type:"curePoisonAndHealSelf",percent:30,target:"randomPoisonedAlly"}},
      plannedSkills:{1:["heal"],4:["stone"],10:["fresh"],18:["raise"],27:["allHeal2"],34:["gigaQuake"],43:["allMount"],51:["lastHeal"]}
    },
    rabbit:{
      id:"rabbit",role:null,growthType:"early",expType:"superFast",recruitRank:"D",fate:22,
      base:{hpMax:38,mpMax:12,atk:15,def:6,magic:12,mdef:7,spd:19},
      final:{hpMax:590,mpMax:350,atk:270,def:230,magic:250,mdef:230,spd:350},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"D",wind:"C",earth:"C",pleasure:"E",poison:"C",blind:"C",silence:"D",death:"B"},
      trait:{id:"luckyBunny",name:"ラッキーバニー",icon:"🐇",trigger:"battleDrop",desc:"敵のアイテムドロップ確率が1.2倍になる。",effect:{type:"dropRateMultiplier",multiplier:1.20}},
      plannedSkills:{3:["touch"],6:["quick"],11:["death"],18:["erode"],22:["pleasure"],33:["escape"],41:["heroicTailwind"],50:["gigaErode"],76:["megidoPleasure"]}
    },
    demon:{
      id:"demon",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:13,
      base:{hpMax:32,mpMax:30,atk:5,def:9,magic:18,mdef:16,spd:12},
      final:{hpMax:520,mpMax:610,atk:140,def:200,magic:330,mdef:290,spd:290},
      resist:{fire:"C",ice:"C",light:"D",dark:"B",thunder:"A",wind:"C",earth:"C",pleasure:"B",poison:"C",blind:"C",silence:"D",death:"C"},
      trait:{id:"mageDemon",name:"魔術師悪魔",icon:"🔮",chance:.30,trigger:"defend",desc:"防御選択時、30%の確率で最大MPの5%回復する。",effect:{type:"restoreMpPercent",percent:5}},
      plannedSkills:{1:["petitThunder"],5:["magicConcentration"],8:["blaze"],12:["raise"],15:["thunder"],23:["flare"],32:["allMagic"],46:["magicBarrier"]}
    },
    golem:{
      id:"golem",role:null,growthType:"early",expType:"fast",recruitRank:"C",fate:11,
      base:{hpMax:64,mpMax:1,atk:18,def:18,magic:2,mdef:4,spd:4},
      final:{hpMax:780,mpMax:40,atk:300,def:310,magic:70,mdef:120,spd:140},
      resist:{fire:"C",ice:"D",light:"C",dark:"C",thunder:"B",wind:"E",earth:"B",pleasure:"E",poison:"B",blind:"D",silence:"C",death:"D"},
      trait:{id:"rockDemon",name:"岩の魔人",icon:"🪨",trigger:"buffReceived",desc:"自身が受ける防御力アップ効果の倍率に+0.10する。",effect:{type:"buffMultiplierBonus",stat:"def",add:.10}},
      plannedSkills:{10:["guard"],38:["terraCrash"],42:["counterStance"]}
    },
    elf:{
      id:"elf",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:17,
      base:{hpMax:43,mpMax:21,atk:15,def:12,magic:13,mdef:13,spd:13},
      final:{hpMax:620,mpMax:420,atk:290,def:250,magic:280,mdef:280,spd:280},
      resist:{fire:"C",ice:"C",light:"B",dark:"D",thunder:"C",wind:"B",earth:"D",pleasure:"E",poison:"D",blind:"B",silence:"B",death:"D"},
      trait:{id:"pureHunter",name:"清純なる狩人",icon:"🏹",chance:.10,trigger:"onMagicDamage",desc:"快楽属性以外の魔法ダメージを受けた時、10%の確率で通常攻撃で反撃する。1回の敵行動につき最大1回。",effect:{type:"magicCounter",excludeElement:"pleasure"}},
      plannedSkills:{2:["silence"],9:["highHeal"],16:["thunder"],21:["holy"],33:["raise2"],37:["gigaHoly"],45:["stardust"]}
    },
    sylph:{
      id:"sylph",role:null,growthType:"normal",expType:"superFast",recruitRank:"B",fate:20,
      base:{hpMax:31,mpMax:28,atk:8,def:7,magic:16,mdef:15,spd:22},
      final:{hpMax:550,mpMax:540,atk:130,def:220,magic:330,mdef:320,spd:360},
      resist:{fire:"D",ice:"C",light:"B",dark:"D",thunder:"C",wind:"S",earth:"D",pleasure:"C",poison:"D",blind:"C",silence:"B",death:"E"},
      trait:{id:"windFairy",name:"風の妖精",icon:"🌪️",trigger:"passive",desc:"戦闘中、味方全員が受ける風属性ダメージを5%軽減する。",effect:{type:"partyElementDamageReduction",element:"wind",percent:5}},
      plannedSkills:{1:["heal"],5:["wind"],10:["block"],17:["allHeal2"],26:["allPolish"],33:["gigaWind"],41:["heroicTailwind"],57:["annihilationWindBlade"]}
    },
    owl:{
      id:"owl",role:null,growthType:"normal",expType:"normal",recruitRank:"C",fate:15,
      base:{hpMax:56,mpMax:23,atk:16,def:10,magic:14,mdef:16,spd:14},
      final:{hpMax:720,mpMax:400,atk:310,def:250,magic:290,mdef:270,spd:310},
      resist:{fire:"D",ice:"B",light:"C",dark:"B",thunder:"D",wind:"C",earth:"A",pleasure:"C",poison:"C",blind:"S",silence:"D",death:"C"},
      trait:{id:"sadisticClaw",name:"嗜虐の爪",icon:"🦉",trigger:"critical",desc:"HP50%以下の敵に対する会心率が+5.0%される。",effect:{type:"lowHpCritBonus",threshold:.50,bonus:5}},
      plannedSkills:{4:["blind"],9:["polish"],16:["dark"],24:["neoBlind"],35:["explosiveFist"],43:["stealth"],55:["finalDarkHammer"]}
    },
    moth:{
      id:"moth",role:null,growthType:"early",expType:"fast",recruitRank:"C",fate:8,
      base:{hpMax:42,mpMax:38,atk:11,def:9,magic:15,mdef:21,spd:10},
      final:{hpMax:640,mpMax:660,atk:230,def:190,magic:310,mdef:380,spd:270},
      resist:{fire:"D",ice:"C",light:"C",dark:"C",thunder:"B",wind:"C",earth:"C",pleasure:"C",poison:"D",blind:"D",silence:"D",death:"D"},
      trait:{id:"mysticScales",name:"不思議な鱗粉",icon:"🦋",trigger:"passive",desc:"戦闘中、他の味方全員の消費MPが20%軽減される（端数切り上げ、最低1）。",effect:{type:"partyMpCostReduction",percent:20,excludeSelf:true}},
      plannedSkills:{3:["allHeal"],6:["silence"],12:["quake"],21:["fresh"],28:["allBlock"],36:["gigaQuake"],41:["supply"],54:["allMount"]}
    },
    forestMage:{
      id:"forestMage",role:null,growthType:"slightlyLate",expType:"slow",recruitRank:"A",fate:19,
      base:{hpMax:36,mpMax:25,atk:7,def:11,magic:17,mdef:16,spd:11},
      final:{hpMax:610,mpMax:710,atk:120,def:250,magic:380,mdef:320,spd:300},
      resist:{fire:"D",ice:"C",light:"C",dark:"C",thunder:"B",wind:"C",earth:"C",pleasure:"B",poison:"A",blind:"B",silence:"D",death:"D"},
      trait:{id:"sageWisdom",name:"賢者の知恵",icon:"📚",trigger:"allyRevived",desc:"戦闘中、味方の戦闘不能が解除された時、そのキャラの最も高い能力を1.3倍にする（5ラウンド）。",effect:{type:"buffHighestStatOnRevive",multiplier:1.30,duration:5}},
      plannedSkills:{3:["stone"],6:["highHeal"],13:["holy"],20:["allHeal2"],32:["gigaQuake"],36:["fairyHeal"],40:["gigaRaise"],48:["stardust"],60:["judgmentLance"]}
    },
    silverSlime:{
      id:"silverSlime",role:null,growthType:"late",expType:"superSlow",recruitRank:"B",fate:20,
      base:{hpMax:10,mpMax:18,atk:13,def:42,magic:13,mdef:45,spd:40},
      final:{hpMax:150,mpMax:360,atk:320,def:530,magic:320,mdef:550,spd:560},
      resist:{fire:"A",ice:"A",light:"A",dark:"A",thunder:"A",wind:"A",earth:"A",pleasure:"A",poison:"S",blind:"S",silence:"S",death:"S"},
      trait:{id:"silverBody",name:"シルバーボディ",icon:"🪙",trigger:"passive",desc:"状態異常・即死を受けない。戦闘中、このキャラがバトルメンバーにいる間は逃走成功率が10ポイント上がる。",effect:{type:"statusAndDeathImmunity",escapeBonus:10}},
      plannedSkills:{1:["cold"],8:["return"],12:["wind"],21:["raise2"],34:["gigaWind"],39:["eraser"],45:["gigaFrost"],61:["unyieldingHeart"]}
    },
    maidDevil:{
      id:"maidDevil",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:13,
      base:{hpMax:35,mpMax:20,atk:15,def:10,magic:16,mdef:14,spd:16},
      final:{hpMax:610,mpMax:430,atk:280,def:260,magic:290,mdef:300,spd:320},
      resist:{fire:"C",ice:"C",light:"D",dark:"B",thunder:"D",wind:"C",earth:"C",pleasure:"B",poison:"C",blind:"C",silence:"B",death:"C"},
      trait:{id:"maidGift",name:"メイドの土産",icon:"🧹",trigger:"onKo",desc:"このキャラが戦闘不能になった時、1戦闘に1回だけ、他の生存中の味方全員のランダムな能力を1.3倍にする（5ラウンド）。",effect:{type:"buffOtherAlliesOnKo",multiplier:1.30,duration:5,oncePerBattle:true}},
      plannedSkills:{3:["polish"],6:["guard"],9:["quick"],18:["allHeal2"],26:["hellDark"],39:["lastHeal"],47:["demonSpiritFlow"],54:["allMount"]}
    },
    lamia:{
      id:"lamia",role:null,growthType:"normal",expType:"fast",recruitRank:"B",fate:9,
      base:{hpMax:68,mpMax:9,atk:21,def:10,magic:5,mdef:8,spd:9},
      final:{hpMax:870,mpMax:160,atk:350,def:220,magic:160,mdef:190,spd:230},
      resist:{fire:"C",ice:"E",light:"C",dark:"C",thunder:"D",wind:"C",earth:"D",pleasure:"D",poison:"B",blind:"C",silence:"D",death:"D"},
      trait:{id:"sheddingBody",name:"脱皮する身体",icon:"🐍",chance:.25,trigger:"turnEnd",desc:"ラウンド終了時、毒・暗闇・封印・感電のいずれかなら25%の確率ですべて解除し、自身にクイックと同じ素早さ上昇効果を付与する。",effect:{type:"cleanseAndQuick",multiplier:1.30,duration:5}},
      plannedSkills:{3:["powerCharge"],8:["cure"],17:["allPolish"],30:["counterStance"],42:["terraCrash"]}
    },
    poison:{
      id:"poison",role:null,growthType:"early",expType:"superFast",recruitRank:"D",fate:6,
      base:{hpMax:62,mpMax:14,atk:10,def:14,magic:5,mdef:14,spd:5},
      final:{hpMax:700,mpMax:370,atk:240,def:280,magic:180,mdef:270,spd:170},
      resist:{fire:"D",ice:"D",light:"D",dark:"B",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"S",blind:"C",silence:"C",death:"C"},
      trait:{id:"poisonGel",name:"ポイズンジェル",icon:"☠️",chance:.20,trigger:"onPhysicalHit",desc:"敵から物理ダメージを受けた時、20%を基礎確率として、その敵を毒状態にする。毒耐性の影響を受ける。",effect:{type:"poisonAttackerOnPhysicalHit",baseRate:.20,requiresAlive:true}},
      plannedSkills:{1:["poison"],7:["blaze"],15:["neoPoison"],26:["neoBlind"],43:["allDeath"]}
    },
    poisonArachne:{
      id:"poisonArachne",role:null,growthType:"slightlyEarly",expType:"normal",recruitRank:"C",fate:8,
      base:{hpMax:42,mpMax:14,atk:8,def:15,magic:15,mdef:16,spd:16},
      final:{hpMax:660,mpMax:380,atk:180,def:290,magic:290,mdef:310,spd:310},
      resist:{fire:"D",ice:"C",light:"E",dark:"A",thunder:"C",wind:"C",earth:"C",pleasure:"B",poison:"S",blind:"A",silence:"B",death:"C"},
      trait:{id:"debilitatingPoison",name:"虚脱の毒",icon:"🕷️",trigger:"passive",desc:"戦闘中、このキャラがバトルメンバーにいる間、毒状態の敵の攻撃・防御・魔力・魔法防御・素早さを30%低下させる。",effect:{type:"poisonedEnemyAllStatDown",multiplier:.70}},
      plannedSkills:{1:["poison"],10:["dark"],15:["neoPoison"],23:["cold2"],34:["pleasureOne"],42:["aura"],50:["escape"]}
    },
    ghost:{
      id:"ghost",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:4,
      base:{hpMax:28,mpMax:26,atk:5,def:7,magic:16,mdef:18,spd:18},
      final:{hpMax:490,mpMax:540,atk:80,def:180,magic:310,mdef:290,spd:320},
      resist:{fire:"A",ice:"B",light:"E",dark:"A",thunder:"A",wind:"C",earth:"B",pleasure:"A",poison:"B",blind:"B",silence:"B",death:"S"},
      trait:{id:"swayingGhost",name:"ゆらゆらゴースト",icon:"👻",chance:.08,trigger:"onPhysicalIncoming",desc:"敵から物理属性の攻撃を受ける時、8%の確率でダメージを無効にする。",effect:{type:"physicalDamageNullify",chance:.08}},
      plannedSkills:{1:["fire"],10:["pleasure"],17:["magicConcentration"],25:["blaze2"],31:["allBlock"],43:["pleasureOne"],48:["demonSpiritFlow"]}
    },
    madGolem:{
      id:"madGolem",role:null,growthType:"early",expType:"fast",recruitRank:"C",fate:10,
      base:{hpMax:57,mpMax:11,atk:17,def:13,magic:11,mdef:12,spd:11},
      final:{hpMax:660,mpMax:190,atk:290,def:270,magic:230,mdef:260,spd:250},
      resist:{fire:"C",ice:"B",light:"D",dark:"D",thunder:"A",wind:"E",earth:"C",pleasure:"C",poison:"C",blind:"D",silence:"C",death:"D"},
      trait:{id:"mudDemon",name:"泥の魔人",icon:"🟫",trigger:"attack",desc:"このキャラが攻撃する際、敵の防御力アップ効果を無視する。",effect:{type:"ignoreEnemyDefenseBuff"}},
      plannedSkills:{2:["stone"],9:["cure"],20:["allBlock"],29:["gigaQuake"],44:["doubleAttack"]}
    },
    scylla:{
      id:"scylla",role:null,growthType:"slightlyEarly",expType:"fast",recruitRank:"D",fate:9,
      base:{hpMax:64,mpMax:16,atk:15,def:10,magic:14,mdef:11,spd:13},
      final:{hpMax:740,mpMax:380,atk:300,def:220,magic:290,mdef:210,spd:270},
      resist:{fire:"D",ice:"C",light:"C",dark:"C",thunder:"E",wind:"C",earth:"C",pleasure:"C",poison:"C",blind:"B",silence:"C",death:"D"},
      trait:{id:"writhingTentacles",name:"うねうね触手",icon:"🐙",chance:.05,trigger:"normalAttack",desc:"鞭による通常攻撃時、5%の確率で再度通常攻撃する。追加攻撃からは再発動しない。",effect:{type:"whipNormalFollowup",chance:.05}},
      plannedSkills:{1:["touch"],12:["pleasure"],20:["eraser"],31:["aura"],37:["gigaPleasure"],42:["dragonSpiral"]}
    },
    mimic:{
      id:"mimic",role:null,growthType:"normal",expType:"slow",recruitRank:"B",fate:5,
      base:{hpMax:23,mpMax:15,atk:16,def:14,magic:11,mdef:14,spd:15},
      final:{hpMax:450,mpMax:450,atk:320,def:270,magic:250,mdef:250,spd:310},
      resist:{fire:"B",ice:"B",light:"D",dark:"B",thunder:"E",wind:"C",earth:"D",pleasure:"C",poison:"B",blind:"B",silence:"D",death:"A"},
      trait:{id:"treasureHunterMimic",name:"宝箱探し",icon:"🧰",chance:.10,trigger:"mapEntry",desc:"マップ移動時、10%の確率でランダムな通常マス1つを宝箱マスに変える。1マップにつき最大1回。",effect:{type:"mapNodeToChest",chance:.10,maxPerMap:1,candidateTypes:["battle","event"]}},
      plannedSkills:{2:["cold"],8:["death"],15:["raise"],22:["erode"],29:["allMagic"],36:["pleasureOne"],45:["gigaErode"],51:["berserk"]}
    },
    podalge:{
      id:"podalge",role:null,growthType:"early",expType:"superFast",recruitRank:"C",fate:19,
      base:{hpMax:38,mpMax:18,atk:15,def:7,magic:12,mdef:10,spd:23},
      final:{hpMax:530,mpMax:430,atk:290,def:210,magic:230,mdef:240,spd:330},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"E",wind:"A",earth:"A",pleasure:"C",poison:"D",blind:"D",silence:"D",death:"C"},
      trait:{id:"happySong",name:"ハッピーソング",icon:"🎵",chance:.15,trigger:"battleVictory",desc:"戦闘勝利時、15%の確率で味方全員の獲得経験値が1.25倍になる。バトルメンバーにいる時のみ発動する。",effect:{type:"partyExpBoostChance",chance:.15,multiplier:1.25}},
      plannedSkills:{1:["wind"],6:["blind"],12:["flare"],20:["gigaHeal"],29:["allMagic"],38:["gigaWind"],45:["allFresh"],56:["lastFlare"]}
    },
    mermaid:{
      id:"mermaid",role:null,growthType:"slightlyEarly",expType:"normal",recruitRank:"C",fate:14,
      base:{hpMax:33,mpMax:21,atk:11,def:10,magic:16,mdef:15,spd:12},
      final:{hpMax:510,mpMax:500,atk:220,def:230,magic:300,mdef:280,spd:270},
      resist:{fire:"D",ice:"B",light:"C",dark:"C",thunder:"E",wind:"C",earth:"D",pleasure:"B",poison:"C",blind:"C",silence:"D",death:"C"},
      trait:{id:"waterMelody",name:"水の音色",icon:"🌊",trigger:"passive",desc:"戦闘中、味方全員が受ける炎属性ダメージを5%軽減する。",effect:{type:"partyElementDamageReduction",element:"fire",percent:5}},
      plannedSkills:{3:["highHeal"],10:["wind"],14:["frost"],19:["allHeal2"],27:["mount"],34:["gigaFrost"],39:["gigaWind"],53:["fortune"]}
    },
    kitsune:{
      id:"kitsune",role:null,growthType:"ultraEarly",expType:"fast",recruitRank:"C",fate:17,
      base:{hpMax:36,mpMax:27,atk:13,def:8,magic:14,mdef:13,spd:14},
      final:{hpMax:620,mpMax:540,atk:280,def:220,magic:290,mdef:250,spd:260},
      resist:{fire:"B",ice:"C",light:"C",dark:"A",thunder:"B",wind:"D",earth:"C",pleasure:"C",poison:"C",blind:"C",silence:"E",death:"C"},
      trait:{id:"foxTrickery",name:"化かし妖術",icon:"🦊",trigger:"enemyMagic",desc:"1ラウンド目に敵から受ける魔法を、最初の1回だけ必ず回避する。",effect:{type:"firstRoundEnemyMagicDodge",round:1,uses:1}},
      plannedSkills:{1:["stone"],7:["allHeal"],13:["quake"],22:["eraser"],35:["gigaQuake"],41:["lastHeal"],47:["demonSpiritFlow"],59:["allMount"]}
    },
    lloyd:{
      id:"lloyd",role:null,growthType:"slightlyEarly",expType:"normal",recruitRank:"C",fate:12,
      base:{hpMax:83,mpMax:47,atk:26,def:22,magic:24,mdef:20,spd:16},
      final:{hpMax:880,mpMax:300,atk:330,def:240,magic:200,mdef:190,spd:180},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"E",wind:"D",earth:"D",pleasure:"A",poison:"S",blind:"C",silence:"C",death:"B"},
      trait:{id:"ancientTechCrystal",name:"古代技術の結晶",icon:"⚙️",trigger:"statusIncoming",desc:"毒状態にならない。感電効果を受けた時は、通常の付与率・耐性を無視して必ず感電する。",effect:{type:"poisonImmuneShockCertain"}},
      plannedSkills:{1:["highHeal"],10:["allHeal2"],35:["lastHeal"],50:["canceller"]}
    },
    dogu:{
      id:"dogu",role:null,growthType:"slightlyEarly",expType:"normal",recruitRank:"D",fate:10,
      base:{hpMax:30,mpMax:10,atk:15,def:15,magic:14,mdef:14,spd:10},
      final:{hpMax:350,mpMax:260,atk:310,def:280,magic:250,mdef:250,spd:250},
      resist:{fire:"A",ice:"A",light:"B",dark:"B",thunder:"B",wind:"D",earth:"D",pleasure:"A",poison:"A",blind:"C",silence:"C",death:"A"},
      trait:{id:"ancientLegacy",name:"古代の遺産",icon:"🏺",chance:.15,trigger:"elementDamageIncoming",desc:"炎属性・氷属性ダメージを受ける時、15%の確率でそのダメージを無効化する。付随する状態異常などは防がない。",effect:{type:"elementDamageNullifyChance",elements:["fire","ice"],chance:.15}},
      plannedSkills:{1:["holy"],8:["neoSilence"],15:["fresh"],18:["heavenlyLight"],24:["death"],33:["gigaHoly"],41:["allDeath"],48:["guardianBlessing"]}
    },
    desertDog:{
      id:"desertDog",role:null,growthType:"early",expType:"fast",recruitRank:"D",fate:10,
      base:{hpMax:35,mpMax:13,atk:14,def:11,magic:9,mdef:6,spd:12},
      final:{hpMax:500,mpMax:370,atk:290,def:270,magic:220,mdef:220,spd:280},
      resist:{fire:"B",ice:"D",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"E",poison:"C",blind:"D",silence:"C",death:"D"},
      trait:{id:"desertDogRest",name:"砂漠のわんこ",icon:"🐕",trigger:"healNode",desc:"回復ノードを選択すると、次にバトルメンバーとして戦闘開始した時、攻撃力が上がる。",effect:{type:"nextBattlePolishFromHealNode",multiplier:1.30,duration:5}},
      plannedSkills:{1:["blaze"],13:["fresh"],25:["allPolish"],32:["raise2"],39:["explosiveFist"],48:["allFresh"]}
    },
    hotSandTentacle:{
      id:"hotSandTentacle",role:null,growthType:"normal",expType:"normal",recruitRank:"C",fate:12,
      base:{hpMax:59,mpMax:8,atk:17,def:6,magic:8,mdef:11,spd:15},
      final:{hpMax:710,mpMax:270,atk:320,def:250,magic:200,mdef:260,spd:300},
      resist:{fire:"B",ice:"D",light:"C",dark:"C",thunder:"D",wind:"D",earth:"C",pleasure:"C",poison:"C",blind:"B",silence:"C",death:"D"},
      trait:{id:"encouragingStrike",name:"激励の一撃",icon:"💢",trigger:"turnEnd",desc:"ラウンド終了時、状態異常の他の味方1人に最大HPの8%ダメージを与え、その味方の攻撃力・魔力・素早さを上げる。HPが8%以下の味方は対象外。",effect:{type:"damageAfflictedAllyAndBuff",damagePercent:.08,multiplier:1.30,duration:5,statuses:["poison","blind","silence","shock"],stats:["atk","magic","spd"]}},
      plannedSkills:{2:["cure"],9:["quake"],17:["eraser"],26:["gigaHeal"],34:["gigaQuake"],43:["allDeath"]}
    },
    prominence:{
      id:"prominence",role:null,growthType:"normal",expType:"superFast",recruitRank:"C",fate:15,
      base:{hpMax:33,mpMax:23,atk:11,def:4,magic:14,mdef:12,spd:16},
      final:{hpMax:490,mpMax:460,atk:250,def:200,magic:310,mdef:280,spd:290},
      resist:{fire:"S",ice:"E",light:"B",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"D",poison:"C",blind:"B",silence:"D",death:"E"},
      trait:{id:"fireFairy",name:"炎の妖精",icon:"🔥",trigger:"elementDamageIncoming",desc:"炎属性のダメージを受けると、ダメージを無効化してHPが100回復する。",effect:{type:"absorbElementHealFixed",element:"fire",heal:100}},
      plannedSkills:{1:["blaze"],5:["flare"],17:["blaze2"],25:["allBlock"],32:["gigaFlare"],38:["explosiveFist"],54:["lastFlare"],68:["endBlaze"]}
    },
    magmaSlug:{
      id:"magmaSlug",role:null,growthType:"early",expType:"normal",recruitRank:"D",fate:7,
      base:{hpMax:35,mpMax:17,atk:15,def:19,magic:15,mdef:3,spd:1},
      final:{hpMax:440,mpMax:410,atk:310,def:380,magic:290,mdef:150,spd:100},
      resist:{fire:"S",ice:"E",light:"C",dark:"C",thunder:"D",wind:"C",earth:"B",pleasure:"B",poison:"B",blind:"C",silence:"C",death:"C"},
      trait:{id:"burningSlug",name:"燃え盛るナメクジ",icon:"🌋",trigger:"passive",desc:"炎属性ダメージを受けない。無属性の物理攻撃が炎属性になる。",effect:{type:"fireImmuneAndNeutralPhysicalElement",immuneElement:"fire",physicalElement:"fire"}},
      plannedSkills:{1:["flare"],8:["polish"],16:["raise"],29:["gigaFlare"],36:["blaze2"],43:["terraCrash"],51:["lastFlare"]}
    },
    scorpion:{
      id:"scorpion",role:null,growthType:"slightlyEarly",expType:"fast",recruitRank:"C",fate:11,
      base:{hpMax:38,mpMax:18,atk:17,def:12,magic:9,mdef:7,spd:18},
      final:{hpMax:590,mpMax:400,atk:340,def:270,magic:210,mdef:200,spd:320},
      resist:{fire:"B",ice:"D",light:"C",dark:"C",thunder:"B",wind:"D",earth:"B",pleasure:"C",poison:"A",blind:"C",silence:"C",death:"C"},
      trait:{id:"desertThief",name:"砂漠の盗賊",icon:"🦂",trigger:"battleVictory",desc:"バトルメンバーにいると、敵のノーマルドロップ率が4%上がる。",effect:{type:"normalDropRateFlatBonus",bonus:.04}},
      plannedSkills:{1:["eraser"],12:["thunder"],25:["mount"],34:["explosiveFist"],42:["allDeath"],66:["doubleAttack"]}
    },
    dragon:{
      id:"dragon",role:null,growthType:"normal",expType:"slow",recruitRank:"B",fate:10,
      base:{hpMax:82,mpMax:14,atk:18,def:10,magic:5,mdef:4,spd:10},
      final:{hpMax:1030,mpMax:350,atk:350,def:250,magic:170,mdef:160,spd:240},
      resist:{fire:"A",ice:"D",light:"C",dark:"C",thunder:"B",wind:"B",earth:"D",pleasure:"E",poison:"B",blind:"B",silence:"B",death:"E"},
      trait:{id:"dragonSoul",name:"ドラゴンソウル",icon:"🐉",trigger:"elementDamageReceived",desc:"氷属性ダメージを受けると、攻撃力が上がる。",effect:{type:"buffOnElementDamageReceived",element:"ice",buff:"atk",multiplier:1.30,duration:5}},
      plannedSkills:{8:["wind"],15:["flare"],24:["allHeal2"],35:["gigaWind"],43:["lastHeal"],56:["lastFlare"]}
    },
    karen:{
      id:"karen",role:"人間の仲間",isMonsterGirl:false,growthType:"normal",expType:"normal",recruitRank:null,fate:15,
      base:{hpMax:58,mpMax:17,atk:19,def:16,magic:10,mdef:9,spd:12},
      final:{hpMax:870,mpMax:430,atk:360,def:280,magic:240,mdef:250,spd:290},
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"D",poison:"D",blind:"C",silence:"B",death:"C"},
      trait:{id:"fullOfSpirit",name:"気合十分",icon:"🔥",trigger:"skillEnhance",desc:"パワーチャージの攻撃力上昇倍率が2.0倍から2.2倍になる。",effect:{type:"powerChargeMultiplierOverride",skillId:"powerCharge",multiplier:2.20}},
      plannedSkills:{1:["powerCharge","quake"],17:["allBlock"],20:["return"],27:["mount"],32:["counterStance"],40:["fortune"],45:["gigaQuake"],51:["berserk"],63:["earthWrath"]}
    }
  };

  const FINAL_STAT_VARIATION_RANGE=5;
  const FINAL_STAT_KEYS=["hpMax","mpMax","atk","def","magic","mdef","spd"];
  function rollFinalStatVariation(profile){
    const result={};
    FINAL_STAT_KEYS.forEach(key=>{
      const base=Number(profile?.final?.[key])||0;
      result[key]=base===0 ? 0 : Math.floor(Math.random()*(FINAL_STAT_VARIATION_RANGE*2+1))-FINAL_STAT_VARIATION_RANGE;
    });
    return result;
  }
  function ensureCharacterFinalVariation(c){
    const profile=profileFor(c);
    if(!c || !profile) return null;
    if(!c.finalVariation || typeof c.finalVariation!=="object") c.finalVariation=rollFinalStatVariation(profile);
    FINAL_STAT_KEYS.forEach(key=>{
      if(!Number.isFinite(Number(c.finalVariation[key]))) c.finalVariation[key]=0;
      if((Number(profile.final?.[key])||0)===0) c.finalVariation[key]=0;
    });
    return c.finalVariation;
  }

  function formalStatsAtLevel(profile,level,finalVariation=null){
    const lv=Math.max(1,Math.min(MAX_LEVEL,level));
    const x=(lv-1)/(MAX_LEVEL-1);
    const curve=GROWTH_CURVES[profile.growthType] || GROWTH_CURVES.normal;
    const progress=Math.max(0,Math.min(1,x + curve.bias*x*(1-x)));
    const result={};
    FINAL_STAT_KEYS.forEach(key=>{
      const a=Number(profile.base[key])||0;
      const baseFinal=Number(profile.final[key])||0;
      const offset=baseFinal===0 ? 0 : (Number(finalVariation?.[key])||0);
      const b=Math.max(key==="hpMax"?1:0,baseFinal+offset);
      result[key]=Math.round(a+(b-a)*progress);
    });
    return result;
  }

  function mutableStatsFromFormal(profile,level=1,finalVariation=null){
    const st=formalStatsAtLevel(profile,level,finalVariation);
    return {hp:st.hpMax,hpMax:st.hpMax,mp:st.mpMax,mpMax:st.mpMax,atk:st.atk,def:st.def,magic:st.magic,mdef:st.mdef,spd:st.spd};
  }

  function plannedSkillIdsUpTo(profile,level,implementedOnly=true){
    if(!profile?.plannedSkills) return [];
    const ids=[];
    Object.entries(profile.plannedSkills).forEach(([lv,list])=>{
      if(Number(lv)<=level) ids.push(...list);
    });
    return [...new Set(ids)].filter(id=>!implementedOnly || ["fire","flare","gigaFlare","lastFlare","blaze","blaze2","endBlaze","ice","frost","gigaFrost","lastFrost","cold","cold2","endCold","petitThunder","thunder","gigaThunder","heavenlyThunder","stone","quake","gigaQuake","earthWrath","sonic","wind","gigaWind","annihilationWindBlade","holy","gigaHoly","judgmentLance","heavenlyLight","bigBang","dark","gigaDark","finalDarkHammer","hellDark","apocalypse","touch","pleasure","gigaPleasure","megidoPleasure","pleasureOne","erode","gigaErode","lastErode","ruinErosion","poison","neoPoison","blind","neoBlind","silence","neoSilence","death","allDeath","eraser","heal","highHeal","gigaHeal","lastHeal","allHeal","allHeal2","fairyHeal","eternal","raise","raise2","gigaRaise","miracleFestival","cure","fresh","allFresh","mount","allMount","aura","lastAura","polish","allPolish","warGodAura","guard","allGuard","guardianBlessing","magic","allMagic","demonSpiritFlow","block","allBlock","spiritKingBlessing","quick","allQuick","heroicTailwind","berserk","fortune","escape","supply","neoSupply","stealth","return","tackle","counterStance","doubleAttack","autoFresh","canceller","unyieldingHeart","powerCharge","magicConcentration","explosiveFist","swordDance","terraCrash","stardust","magicBarrier","dragonSpiral","nephilimLaser"].includes(id));
  }

  // v0.46i: reconcile natural skills whose acquisition levels/contents were rebalanced.
  // Older saves may already contain the previous versions, so only the affected skill IDs are rebuilt.
  const REBALANCED_NATURAL_SKILL_IDS={
    forestMage:new Set(["holy","allHeal2","gigaQuake","fairyHeal"]),
    ghost:new Set(["allHeal2","magicConcentration"]),
    podalge:new Set(["allHeal2","gigaHeal"])
  };
  function reconcileRebalancedNaturalSkills(c){
    const ids=REBALANCED_NATURAL_SKILL_IDS[c?.profileId||c?.id];
    if(!ids) return;
    const kept=(c.learnedSkills||[]).filter(id=>!ids.has(id));
    const natural=plannedSkillIdsUpTo(profileFor(c),c.level||1).filter(id=>ids.has(id));
    c.learnedSkills=[...new Set([...kept,...natural])];
  }

  // v0.24 formal weapon prototype: seven weapon identities + critical/evasion foundations.
  const EQUIPMENT_SLOTS=["weapon","shield","body","accessory"];
  const EQUIPMENT_SLOT_LABELS={weapon:"武器",shield:"盾",body:"身体",accessory:"アクセサリ"};
  const equipmentCatalog={
    bare:{id:"bare",slot:"weapon",name:"装備なし",icon:"－",mods:{},canCrit:true,normalAttackPower:1},

    // 拳
    stone_claw:{id:"stone_claw",slot:"weapon",weaponType:"fist",name:"石の爪",icon:"🥊",mods:{atk:3,spd:2},crit:8.0,canCrit:true,normalAttackPower:1,price:50,desc:"石製の爪。攻撃力+3 / 素早さ+2 / 会心率+8.0%。"},
    bronze_knuckle:{id:"bronze_knuckle",slot:"weapon",weaponType:"fist",name:"ブロンズナックル",icon:"🥊",mods:{atk:12,spd:6},crit:8.2,canCrit:true,normalAttackPower:1,price:190,desc:"銅製の拳装備。攻撃力+12 / 素早さ+6 / 会心率+8.2%。"},
    steel_claw:{id:"steel_claw",slot:"weapon",weaponType:"fist",name:"鋼鉄の爪",icon:"🥊",mods:{atk:21,spd:14},crit:8.5,canCrit:true,normalAttackPower:1,price:700,desc:"鋼鉄製の拳装備。攻撃力+21 / 素早さ+14 / 会心率+8.5%。"},
    silver_knuckle:{id:"silver_knuckle",slot:"weapon",weaponType:"fist",name:"シルバーナックル",icon:"🥊",mods:{atk:37,spd:19},crit:8.8,canCrit:true,normalAttackPower:1,price:1500,desc:"銀製の拳装備。攻撃力+37 / 素早さ+19 / 会心率+8.8%。"},
    restian_claw:{id:"restian_claw",slot:"weapon",weaponType:"fist",name:"レスティアンクロー",icon:"🥊",mods:{atk:55,spd:36},crit:9.0,canCrit:true,normalAttackPower:1,price:4200,desc:"レスティア公国で祭具としても使われる拳装備。攻撃力+55 / 素早さ+36 / 会心率+9.0%。"},
    platinum_claw:{id:"platinum_claw",slot:"weapon",weaponType:"fist",name:"プラチナクロー",icon:"🥊",mods:{atk:94,spd:28},crit:9.5,canCrit:true,normalAttackPower:1,price:17800,desc:"白金製の高性能な拳装備。攻撃力+94 / 素早さ+28 / 会心率+9.5%。"},
    golden_claw:{id:"golden_claw",slot:"weapon",weaponType:"fist",name:"煌金の爪",icon:"🥊",mods:{atk:145,spd:41},crit:9.6,canCrit:true,normalAttackPower:1,price:49000,desc:"魔界の特別な金属で作られた拳装備。攻撃力+145 / 素早さ+41 / 会心率+9.6%。"},
    champion:{id:"champion",slot:"weapon",weaponType:"fist",name:"チャンピオン",icon:"🥊",mods:{atk:208,spd:50},crit:10.8,canCrit:true,normalAttackPower:1,price:228000,desc:"王者の証である至高の拳装備。攻撃力+208 / 素早さ+50 / 会心率+10.8%。"},

    // 剣
    dagger:{id:"dagger",slot:"weapon",weaponType:"sword",name:"ダガー",icon:"🗡️",mods:{atk:7},crit:2.0,canCrit:true,normalAttackPower:1,price:60,desc:"鋭利な短剣。攻撃力+7 / 会心率+2.0%。"},
    traveler_sword:{id:"traveler_sword",slot:"weapon",weaponType:"sword",name:"旅人の剣",icon:"⚔️",mods:{atk:20},crit:2.0,canCrit:true,normalAttackPower:1,price:220,desc:"旅人が好む扱いやすい剣。攻撃力+20 / 会心率+2.0%。"},
    iron_sword:{id:"iron_sword",slot:"weapon",weaponType:"sword",name:"アイアンソード",icon:"⚔️",mods:{atk:35},crit:2.2,canCrit:true,normalAttackPower:1,price:720,desc:"鉄製のオーソドックスな剣。攻撃力+35 / 会心率+2.2%。"},
    silver_sword:{id:"silver_sword",slot:"weapon",weaponType:"sword",name:"シルバーソード",icon:"⚔️",mods:{atk:57},crit:2.2,canCrit:true,normalAttackPower:1,price:1700,desc:"銀製の鋭い刃の剣。攻撃力+57 / 会心率+2.2%。"},
    fluffy_tail:{id:"fluffy_tail",slot:"weapon",weaponType:"sword",name:"もふもふしっぽ",icon:"🦊",mods:{atk:2,magic:20},fate:9,canCrit:true,normalAttackPower:1,price:2400,desc:"妖狐のもふもふなしっぽをイメージした武器。攻撃力+2 / 魔力+20 / 運命+9。"},
    salid_saber:{id:"salid_saber",slot:"weapon",weaponType:"sword",name:"サリードサーベル",icon:"⚔️",mods:{atk:72},crit:3.0,canCrit:true,normalAttackPower:1,price:4000,desc:"サリード王国の伝統歪曲刀。攻撃力+72 / 会心率+3.0%。"},
    kirisute_maru:{id:"kirisute_maru",slot:"weapon",weaponType:"sword",name:"切捨丸",icon:"🗡️",mods:{atk:98},crit:2.3,canCrit:true,normalAttackPower:1,basicDeathRate:.03,price:9000,desc:"ヒザクラの民が携帯すると言われる、恐ろしく斬れる剣。攻撃力+98 / 会心率+2.3% / 即死率+3.0%。"},
    platinum_sword:{id:"platinum_sword",slot:"weapon",weaponType:"sword",name:"プラチナソード",icon:"⚔️",mods:{atk:125},crit:2.6,canCrit:true,normalAttackPower:1,price:20000,desc:"白金製の高性能な剣。攻撃力+125 / 会心率+2.6%。"},
    golden_sword:{id:"golden_sword",slot:"weapon",weaponType:"sword",name:"煌金の剣",icon:"⚔️",mods:{atk:184},crit:2.6,canCrit:true,normalAttackPower:1,price:50500,desc:"魔界の特別な金属で作られた剣。攻撃力+184 / 会心率+2.6%。"},
    breaker:{id:"breaker",slot:"weapon",weaponType:"sword",name:"ブレイカー",icon:"⚔️",mods:{atk:240},crit:2.8,canCrit:true,normalAttackPower:1,price:255000,desc:"全てを斬り裂き破壊すると言われる剣。攻撃力+240 / 会心率+2.8%。"},

    // 斧槌
    stone_axe:{id:"stone_axe",slot:"weapon",weaponType:"axe",name:"石の斧",icon:"🪓",mods:{atk:11,spd:-7},crit:3.0,canCrit:true,normalAttackPower:1,price:90,desc:"石製の重い斧。攻撃力+11 / 素早さ-7 / 会心率+3.0%。"},
    bronze_axe:{id:"bronze_axe",slot:"weapon",weaponType:"axe",name:"ブロンズアクス",icon:"🪓",mods:{atk:29,spd:-10},crit:3.4,canCrit:true,normalAttackPower:1,price:260,desc:"ブロンズ製の斧。攻撃力+29 / 素早さ-10 / 会心率+3.4%。"},
    steel_axe:{id:"steel_axe",slot:"weapon",weaponType:"axe",name:"鋼鉄の斧",icon:"🪓",mods:{atk:47,spd:-14},crit:3.9,canCrit:true,normalAttackPower:1,price:780,desc:"鋼鉄製の重量感あふれる斧。攻撃力+47 / 素早さ-14 / 会心率+3.9%。"},
    silver_axe:{id:"silver_axe",slot:"weapon",weaponType:"axe",name:"シルバーアクス",icon:"🪓",mods:{atk:69,spd:-17},crit:4.3,canCrit:true,normalAttackPower:1,price:2000,desc:"銀製の戦斧。攻撃力+69 / 素早さ-17 / 会心率+4.3%。"},
    icebreaker_maul:{id:"icebreaker_maul",slot:"weapon",weaponType:"axe",name:"氷砕の大槌",icon:"🔨",mods:{atk:94,spd:-45},crit:6.5,canCrit:true,normalAttackPower:1,price:4800,desc:"アルム王国で分厚い氷を砕くために使われる大槌。攻撃力+94 / 素早さ-45 / 会心率+6.5%。"},
    platinum_axe:{id:"platinum_axe",slot:"weapon",weaponType:"axe",name:"白金の斧",icon:"🪓",mods:{atk:163,spd:-22},crit:5.1,canCrit:true,normalAttackPower:1,price:24000,desc:"白金製の高性能な戦斧。攻撃力+163 / 素早さ-22 / 会心率+5.1%。"},
    golden_axe:{id:"golden_axe",slot:"weapon",weaponType:"axe",name:"煌金の戦斧",icon:"🪓",mods:{atk:227,spd:-26},crit:5.5,canCrit:true,normalAttackPower:1,price:56000,desc:"魔界の特別な金属で作られた戦斧。攻撃力+227 / 素早さ-26 / 会心率+5.5%。"},
    destroyer:{id:"destroyer",slot:"weapon",weaponType:"axe",name:"デストロイヤー",icon:"🪓",mods:{atk:298,spd:-35},crit:6.2,canCrit:true,normalAttackPower:1,price:284000,desc:"魔界の特別な金属で作られた戦斧。攻撃力+298 / 素早さ-35 / 会心率+6.2%。"},

    // 弓：射抜は通常の即死耐性とは別枠の弓固有判定。
    short_bow:{id:"short_bow",slot:"weapon",weaponType:"bow",name:"ショートボウ",icon:"🏹",mods:{atk:6},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.0,price:70,desc:"初心者用の弓。攻撃力+6 / 射抜+2.0%。"},
    traveler_bow:{id:"traveler_bow",slot:"weapon",weaponType:"bow",name:"旅人の弓",icon:"🏹",mods:{atk:18},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.1,price:200,desc:"旅人が好む扱いやすい弓。攻撃力+18 / 射抜+2.1%。"},
    elven_bow:{id:"elven_bow",slot:"weapon",weaponType:"bow",name:"エルフの弓",icon:"🏹",mods:{atk:26,magic:4},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.5,price:500,desc:"エルフたちが扱う、魔力を帯びた弓。攻撃力+26 / 魔力+4 / 射抜+2.5%。"},
    iron_bow:{id:"iron_bow",slot:"weapon",weaponType:"bow",name:"アイアンボウ",icon:"🏹",mods:{atk:31},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.2,price:690,desc:"鉄製の弓。攻撃力+31 / 射抜+2.2%。"},
    silver_bow:{id:"silver_bow",slot:"weapon",weaponType:"bow",name:"シルバーボウ",icon:"🏹",mods:{atk:52},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.3,price:1500,desc:"銀製の弓。攻撃力+52 / 射抜+2.3%。"},
    restian_bow:{id:"restian_bow",slot:"weapon",weaponType:"bow",name:"レスティアンボウ",icon:"🏹",mods:{atk:77},crit:3.0,canCrit:true,normalAttackPower:1,bowInstantKillRate:1.4,price:4600,desc:"会心が発生する、レスティア公国の戦闘用弓。攻撃力+77 / 会心率+3.0% / 射抜+1.4%。"},
    hamaya_bow:{id:"hamaya_bow",slot:"weapon",weaponType:"bow",name:"破魔弓",icon:"🏹",mods:{atk:86},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.4,basicDispelRate:.10,price:8800,desc:"魔を滅するヒザクラの名弓。攻撃力+86 / 射抜+2.4%。通常攻撃で敵のバフを解除することがある。"},
    platinum_bow:{id:"platinum_bow",slot:"weapon",weaponType:"bow",name:"白金の弓",icon:"🏹",mods:{atk:117},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.5,price:19500,desc:"白金製の高性能な弓。攻撃力+117 / 射抜+2.5%。"},
    golden_bow:{id:"golden_bow",slot:"weapon",weaponType:"bow",name:"煌金の弓",icon:"🏹",mods:{atk:171},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.6,price:50000,desc:"魔界の特別な金属で作られた弓。攻撃力+171 / 射抜+2.6%。"},
    chiron:{id:"chiron",slot:"weapon",weaponType:"bow",name:"ケイローン",icon:"🏹",mods:{atk:224,magic:18},canCrit:false,normalAttackPower:1,bowInstantKillRate:2.6,price:272000,desc:"神話の力が宿る大いなる弓。攻撃力+224 / 魔力+18 / 射抜+2.6%。"},

    // 杖
    hinoki_staff:{id:"hinoki_staff",slot:"weapon",weaponType:"staff",name:"檜の杖",icon:"🪄",mods:{atk:1,magic:4},canCrit:false,normalAttackPower:1,price:70,desc:"檜でできた杖。攻撃力+1 / 魔力+4。"},
    mage_staff:{id:"mage_staff",slot:"weapon",weaponType:"staff",name:"魔術師の杖",icon:"🪄",mods:{atk:2,magic:9,mdef:4},canCrit:false,normalAttackPower:1,price:230,desc:"魔法を使うための木製の杖。攻撃力+2 / 魔力+9 / 魔防+4。"},
    iron_rod:{id:"iron_rod",slot:"weapon",weaponType:"staff",name:"アイアンロッド",icon:"🪄",mods:{atk:13,magic:15,mdef:12},canCrit:false,normalAttackPower:1,price:740,desc:"魔力のこもった鉄製の魔法杖。攻撃力+13 / 魔力+15 / 魔防+12。"},
    silver_rod:{id:"silver_rod",slot:"weapon",weaponType:"staff",name:"シルバーロッド",icon:"🪄",mods:{atk:20,magic:24,mdef:19},canCrit:false,normalAttackPower:1,price:1800,desc:"魔力のこもった銀製の魔法杖。攻撃力+20 / 魔力+24 / 魔防+19。"},
    ritual_staff:{id:"ritual_staff",slot:"weapon",weaponType:"staff",name:"祭杖",icon:"🪄",mods:{atk:13,magic:31,mdef:28},canCrit:false,normalAttackPower:1,roundStartBlockRate:.10,price:4500,desc:"レスティア公国の祭事のための杖。攻撃力+13 / 魔力+31 / 魔防+28。ラウンド開始時、自分にブロックを発動することがある。"},
    platinum_rod:{id:"platinum_rod",slot:"weapon",weaponType:"staff",name:"プラチナロッド",icon:"🪄",mods:{atk:25,magic:40,mdef:37},canCrit:false,normalAttackPower:1,price:22000,desc:"魔力のこもった白金製の高性能な魔法杖。攻撃力+25 / 魔力+40 / 魔防+37。"},
    golden_staff:{id:"golden_staff",slot:"weapon",weaponType:"staff",name:"煌金の杖",icon:"🪄",mods:{atk:34,magic:51,mdef:49},canCrit:false,normalAttackPower:1,price:52000,desc:"魔界の特別な金属で作られた魔法杖。攻撃力+34 / 魔力+51 / 魔防+49。"},
    hecate:{id:"hecate",slot:"weapon",weaponType:"staff",name:"ヘカテー",icon:"🪄",mods:{atk:56,magic:64,mdef:62},fate:3,canCrit:false,normalAttackPower:1,price:273000,desc:"女神の名を冠した究極の魔法杖。攻撃力+56 / 魔力+64 / 魔防+62 / 運命+3。"},

    // 鞭：通常攻撃は敵全体へ70%威力。
    whip:{id:"whip",slot:"weapon",weaponType:"whip",name:"ウィップ",icon:"➰",mods:{atk:6},canCrit:false,normalAttackPower:.70,attackAll:true,price:80,desc:"初心者用の鞭。攻撃力+6 / 通常攻撃は敵全体へ70%威力。"},
    alra_whip:{id:"alra_whip",slot:"weapon",weaponType:"whip",name:"アルラウィップ",icon:"➰",mods:{atk:16},canCrit:false,normalAttackPower:.70,attackAll:true,roundEndHealRate:.05,roundEndHealPercent:.10,price:80,desc:"アルラウネの蔦でできた鞭。攻撃力+16 / 通常攻撃は敵全体へ70%威力。ラウンド終了時に5%の確率でHPを10%回復する。"},
    bronze_whip:{id:"bronze_whip",slot:"weapon",weaponType:"whip",name:"ブロンズウィップ",icon:"➰",mods:{atk:17},canCrit:false,normalAttackPower:.70,attackAll:true,price:230,desc:"一部に銅が使われている鞭。攻撃力+17 / 通常攻撃は敵全体へ70%威力。"},
    iron_whip:{id:"iron_whip",slot:"weapon",weaponType:"whip",name:"アイアンウィップ",icon:"➰",mods:{atk:30},canCrit:false,normalAttackPower:.70,attackAll:true,price:760,desc:"一部に鋼鉄が使われている鞭。攻撃力+30 / 通常攻撃は敵全体へ70%威力。"},
    silver_whip:{id:"silver_whip",slot:"weapon",weaponType:"whip",name:"シルバーウィップ",icon:"➰",mods:{atk:50},canCrit:false,normalAttackPower:.70,attackAll:true,price:1900,desc:"一部に純銀が使われている鞭。攻撃力+50 / 通常攻撃は敵全体へ70%威力。"},
    trainer_whip:{id:"trainer_whip",slot:"weapon",weaponType:"whip",name:"調教師の鞭",icon:"➰",mods:{atk:64},crit:1.5,canCrit:true,normalAttackPower:.70,attackAll:true,price:4200,desc:"砂漠の猛獣を躾けるための鞭。攻撃力+64 / 会心率+1.5% / 通常攻撃は敵全体へ70%威力。"},
    platinum_whip:{id:"platinum_whip",slot:"weapon",weaponType:"whip",name:"プラチナウィップ",icon:"➰",mods:{atk:109},canCrit:false,normalAttackPower:.70,attackAll:true,price:23000,desc:"一部に白金が使われている高性能な鞭。攻撃力+109 / 通常攻撃は敵全体へ70%威力。"},
    golden_whip:{id:"golden_whip",slot:"weapon",weaponType:"whip",name:"煌金の鞭",icon:"➰",mods:{atk:163},canCrit:false,normalAttackPower:.70,attackAll:true,price:54000,desc:"一部に白金が使われている高性能な鞭。攻撃力+163 / 通常攻撃は敵全体へ70%威力。"},
    mad_dragon_tail:{id:"mad_dragon_tail",slot:"weapon",weaponType:"whip",name:"狂龍の尾",icon:"➰",mods:{atk:219},canCrit:false,normalAttackPower:.70,attackAll:true,price:269000,desc:"荒々しい龍を思わせる恐ろしい鞭。攻撃力+219 / 通常攻撃は敵全体へ70%威力。"},

    // 銃：通常攻撃は85%威力、敵防御力の影響は50%。
    type_milesta:{id:"type_milesta",slot:"weapon",weaponType:"gun",name:"タイプ・ミレスタ",icon:"🔫",mods:{atk:9},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:90,desc:"ミレスタ製の銃。攻撃力+9 / 敵防御力の影響50%。"},
    hunter:{id:"hunter",slot:"weapon",weaponType:"gun",name:"ハンター",icon:"🔫",mods:{atk:21},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:250,desc:"獣狩りで用いられる銃。攻撃力+21 / 敵防御力の影響50%。"},
    type_zel:{id:"type_zel",slot:"weapon",weaponType:"gun",name:"タイプ・ゼル",icon:"🔫",mods:{atk:36},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:780,desc:"グランゼル王国で流通している銃。攻撃力+36 / 敵防御力の影響50%。"},
    type_runel:{id:"type_runel",slot:"weapon",weaponType:"gun",name:"タイプ・ルネル",icon:"🔫",mods:{atk:60},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:2000,desc:"ルネル地方から出土した兵器を模した大量生産品。攻撃力+60 / 敵防御力の影響50%。"},
    alm_hunting_gun:{id:"alm_hunting_gun",slot:"weapon",weaponType:"gun",name:"アルムの猟銃",icon:"🔫",mods:{atk:78},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,bowInstantKillRate:1.5,price:4900,desc:"雪国アルムで狩猟に用いられる猟銃。攻撃力+78 / 射抜+1.5% / 敵防御力の影響50%。"},
    remaster_zel:{id:"remaster_zel",slot:"weapon",weaponType:"gun",name:"リマスター・ゼル",icon:"🔫",mods:{atk:132},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:22000,desc:"グランゼルの技術力の結晶である戦闘銃。攻撃力+132 / 敵防御力の影響50%。"},
    limbo_magic_gun:{id:"limbo_magic_gun",slot:"weapon",weaponType:"gun",name:"辺獄の魔銃",icon:"🔫",mods:{atk:190},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:53000,desc:"魔界で流通している恐るべき魔銃。攻撃力+190 / 敵防御力の影響50%。"},
    fatality:{id:"fatality",slot:"weapon",weaponType:"gun",name:"フェイタリティ",icon:"🔫",mods:{atk:252,spd:8},canCrit:false,normalAttackPower:.85,defenseInfluence:.50,price:270000,desc:"標的を葬り去る致命の魔銃。攻撃力+252 / 素早さ+8 / 敵防御力の影響50%。"},

    // ドロップ等の既存装備
    paw_hand:{id:"paw_hand",slot:"weapon",weaponType:"fist",name:"肉球ハンド",icon:"🐾",mods:{atk:5,spd:8},crit:9.5,canCrit:true,normalAttackPower:1,price:180,desc:"攻撃力+5 / 素早さ+8 / 会心率+9.5%。肉球がついた可愛い拳装備。"},
    no_shield:{id:"no_shield",slot:"shield",name:"装備なし",icon:"－",mods:{}},
    wood_shield:{id:"wood_shield",slot:"shield",name:"木の盾",icon:"🛡️",mods:{def:2},price:30,desc:"木製の扱いやすい盾。防御力+2。"},
    stone_greatshield:{id:"stone_greatshield",slot:"shield",name:"石の大盾",icon:"🪨",mods:{def:5,spd:-5},price:60,desc:"石でできた重い盾。防御力+5 / 素早さ-5。"},
    buckler:{id:"buckler",slot:"shield",name:"バックラー",icon:"🛡️",mods:{def:4},price:100,desc:"腕に装着する小型の盾。防御力+4。"},
    iron_buckler:{id:"iron_buckler",slot:"shield",name:"アイアンバックラー",icon:"🛡️",mods:{def:9},price:330,desc:"鉄製の頑丈なバックラー。防御力+9。"},
    iron_greatshield:{id:"iron_greatshield",slot:"shield",name:"鉄の大盾",icon:"🛡️",mods:{def:16,spd:-7},price:420,desc:"鉄製の重い大盾。防御力+16 / 素早さ-7。"},
    silver_shield:{id:"silver_shield",slot:"shield",name:"シルバーシールド",icon:"🛡️",mods:{def:23,spd:-10},price:1100,desc:"純銀製の大きな盾。防御力+23 / 素早さ-10。"},
    heat_bulwark:{id:"heat_bulwark",slot:"shield",name:"炎熱の防壁",icon:"🔥",mods:{def:12,mdef:5},resist:{fire:1,ice:-1},price:2800,desc:"炎から身を守る魔法の盾。防御力+12 / 魔防+5 / 炎耐性+1 / 氷耐性-1。"},
    snow_bulwark:{id:"snow_bulwark",slot:"shield",name:"氷雪の防壁",icon:"❄️",mods:{def:12,mdef:5},resist:{fire:-1,ice:1},price:2800,desc:"冷気から身を守る魔法の盾。防御力+12 / 魔防+5 / 炎耐性-1 / 氷耐性+1。"},
    ritual_shield:{id:"ritual_shield",slot:"shield",name:"祭事の盾",icon:"🛡️",mods:{def:10},resist:{blind:1,silence:1,death:1},price:3000,desc:"祭事に使われる不思議な模様の盾。防御力+10 / 暗闇・封印・即死耐性+1。"},
    water_mirror_shield:{id:"water_mirror_shield",slot:"shield",name:"水鏡の盾",icon:"🪞",mods:{def:10,mdef:8},resist:{thunder:1,poison:1,death:1},price:4800,desc:"ヒザクラに伝わる美しい盾。防御力+10 / 魔防+8 / 雷・毒・即死耐性+1。"},
    platinum_shield:{id:"platinum_shield",slot:"shield",name:"白金の盾",icon:"🛡️",mods:{def:40,spd:-12},price:12000,desc:"白金製の高性能な大盾。防御力+40 / 素早さ-12。"},
    limbo_shield:{id:"limbo_shield",slot:"shield",name:"辺獄の盾",icon:"🛡️",mods:{def:55,spd:-12},price:32000,desc:"魔界で流通しているとんでもなく頑丈な盾。防御力+55 / 素早さ-12。"},
    fire_god_shield:{id:"fire_god_shield",slot:"shield",name:"炎神の盾",icon:"🔥",mods:{def:5,mdef:5},resist:{fire:2},price:6000,desc:"炎耐性を大きく上げる盾。防御力+5 / 魔防+5 / 炎耐性+2。"},
    ice_god_shield:{id:"ice_god_shield",slot:"shield",name:"氷神の盾",icon:"❄️",mods:{def:5,mdef:5},resist:{ice:2},price:6000,desc:"氷耐性を大きく上げる盾。防御力+5 / 魔防+5 / 氷耐性+2。"},
    wind_god_shield:{id:"wind_god_shield",slot:"shield",name:"風神の盾",icon:"🌪️",mods:{def:5,mdef:5},resist:{wind:2},price:6000,desc:"風耐性を大きく上げる盾。防御力+5 / 魔防+5 / 風耐性+2。"},
    earth_god_shield:{id:"earth_god_shield",slot:"shield",name:"地神の盾",icon:"🪨",mods:{def:5,mdef:5},resist:{earth:2},price:6000,desc:"地耐性を大きく上げる盾。防御力+5 / 魔防+5 / 地耐性+2。"},
    empty_mind_barrier:{id:"empty_mind_barrier",slot:"shield",name:"無心の障壁",icon:"🫧",mods:{mdef:10},resist:{pleasure:2},price:10000,desc:"快楽から身を守る障壁。魔防+10 / 快楽耐性+2。"},
    spirit_shield:{id:"spirit_shield",slot:"shield",name:"精霊の盾",icon:"🔮",mods:{def:10,mdef:10},fate:4,resist:{fire:1,ice:1,light:1,dark:1},price:54000,desc:"精霊の加護が宿った神秘的な盾。防御力+10 / 魔防+10 / 運命+4 / 炎・氷・光・闇耐性+1。"},
    angel_shield:{id:"angel_shield",slot:"shield",name:"天使の盾",icon:"🪽",mods:{def:12},fate:2,resist:{light:2,dark:-1},price:8000,desc:"天使が扱うと言われる聖なる盾。防御力+12 / 運命+2 / 光耐性+2 / 闇耐性-1。"},
    dark_shield:{id:"dark_shield",slot:"shield",name:"暗黒の盾",icon:"🌑",mods:{def:14},fate:-2,resist:{light:-1,dark:2},price:8000,desc:"闇をまとった禍々しい盾。防御力+14 / 運命-2 / 光耐性-1 / 闇耐性+2。"},
    alm_small_shield:{id:"alm_small_shield",slot:"shield",name:"アルムの小盾",icon:"🛡️",mods:{def:2},resist:{fire:-1,ice:1},price:120,desc:"アルム王国製の小さな盾。防御力+2 / 炎耐性-1 / 氷耐性+1。"},

    no_body:{id:"no_body",slot:"body",name:"装備なし",icon:"－",mods:{}},
    milesta_clothes:{id:"milesta_clothes",slot:"body",name:"ミレスタの服",icon:"👕",mods:{def:3,spd:2},price:50,desc:"着心地の良い布の服。防御力+3 / 素早さ+2。"},
    leather_armor:{id:"leather_armor",slot:"body",name:"革の鎧",icon:"🥋",mods:{def:6},price:90,desc:"冒険向きの革製の鎧。防御力+6。"},
    traveler_clothes:{id:"traveler_clothes",slot:"body",name:"旅人の服",icon:"👕",mods:{def:4,spd:7},price:130,desc:"旅人たちが好む動きやすい服。防御力+4 / 素早さ+7。"},
    bronze_mail:{id:"bronze_mail",slot:"body",name:"ブロンズメイル",icon:"🛡️",mods:{def:11},price:190,desc:"ブロンズ製の安価な鎧。防御力+11。"},
    mage_robe:{id:"mage_robe",slot:"body",name:"魔術師のローブ",icon:"🥻",mods:{def:5,magic:3,mdef:5},price:230,desc:"魔法を扱う者のためのローブ。防御力+5 / 魔力+3 / 魔防+5。"},
    maid_dress:{id:"maid_dress",slot:"body",name:"メイドドレス",icon:"👗",mods:{def:11,mdef:3},fate:5,resist:{silence:1},price:420,desc:"戦闘用に作られた、比較的動きやすいメイド服。防御力+11 / 魔防+3 / 運命+5 / 封印耐性+1。"},
    iron_mail:{id:"iron_mail",slot:"body",name:"アイアンメイル",icon:"🛡️",mods:{def:18},price:440,desc:"鋼鉄でできた頑丈な鎧。防御力+18。"},
    runel_clothes:{id:"runel_clothes",slot:"body",name:"ルネルの服",icon:"👕",mods:{def:15,spd:10},price:1550,desc:"ルネル地方で親しまれている服。防御力+15 / 素早さ+10。"},
    silver_mail:{id:"silver_mail",slot:"body",name:"シルバーメイル",icon:"🛡️",mods:{def:27,mdef:5},price:1700,desc:"少し魔力がこめられた純銀製の鎧。防御力+27 / 魔防+5。"},
    magical_cloth:{id:"magical_cloth",slot:"body",name:"マジカルクロス",icon:"🧥",mods:{def:20,magic:9,mdef:17},price:2900,desc:"魔力が織り込まれた特殊な衣。防御力+20 / 魔力+9 / 魔防+17。"},
    restian_belt:{id:"restian_belt",slot:"body",name:"レスティアンベルト",icon:"🥋",mods:{atk:11,def:23,spd:7},resist:{death:1},price:3600,desc:"攻撃力が上がる不思議な民族衣装。攻撃力+11 / 防御力+23 / 素早さ+7 / 即死耐性+1。"},
    miko_outfit:{id:"miko_outfit",slot:"body",name:"巫女装束",icon:"⛩️",mods:{def:22,magic:5,mdef:10},fate:6,resist:{poison:1,silence:1},price:6800,desc:"みんな大好き巫女さんの装束。防御力+22 / 魔力+5 / 魔防+10 / 運命+6 / 毒・封印耐性+1。"},
    platinum_mail:{id:"platinum_mail",slot:"body",name:"プラチナメイル",icon:"🛡️",mods:{def:48,mdef:8},price:16500,desc:"白金製の高性能な鎧。防御力+48 / 魔防+8。"},
    light_robe:{id:"light_robe",slot:"body",name:"光の法衣",icon:"✨",mods:{def:33,magic:9,mdef:28},resist:{thunder:1,light:1},price:19000,desc:"光の魔力を宿した神秘的な法衣。防御力+33 / 魔力+9 / 魔防+28 / 雷・光耐性+1。"},
    demon_clothes:{id:"demon_clothes",slot:"body",name:"魔界の衣",icon:"🧥",mods:{def:52,spd:18},resist:{dark:1},price:44500,desc:"魔界の一般的な衣服。防御力+52 / 素早さ+18 / 闇耐性+1。"},
    golden_armor:{id:"golden_armor",slot:"body",name:"煌金の鎧",icon:"🛡️",mods:{def:70,mdef:11},price:47000,desc:"魔界の特別な金属で作られた鎧。防御力+70 / 魔防+11。"},
    field_runner:{id:"field_runner",slot:"body",name:"フィールドランナー",icon:"🥾",mods:{def:68,spd:21},resist:{blind:2},price:170000,desc:"戦場を駆ける者のための服。防御力+68 / 素早さ+21 / 暗闇耐性+2。"},
    phalanx:{id:"phalanx",slot:"body",name:"ファランクス",icon:"🛡️",mods:{def:92,mdef:15,spd:-8},resist:{wind:1,poison:2},price:203000,desc:"圧倒的な防御力を誇る重厚な鎧。防御力+92 / 魔防+15 / 素早さ-8 / 風耐性+1 / 毒耐性+2。"},
    yggdrasil:{id:"yggdrasil",slot:"body",name:"ユグドラシル",icon:"🌳",mods:{def:54,magic:16,mdef:46},fate:5,resist:{thunder:1,earth:1,silence:1},price:240000,desc:"神の木の名を冠する最高峰の法衣。防御力+54 / 魔力+16 / 魔防+46 / 運命+5 / 雷・地・封印耐性+1。"},
    ragged_robe:{id:"ragged_robe",slot:"body",name:"ボロボロローブ",icon:"🥻",mods:{def:3,mdef:3},price:60,desc:"ボロボロになったローブ。防御力+3 / 魔防+3。"},

    no_accessory:{id:"no_accessory",slot:"accessory",name:"装備なし",icon:"－",mods:{}},
    hunter_charm:{id:"hunter_charm",slot:"accessory",name:"狩人の御守り",icon:"🦷",mods:{atk:2},crit:2,price:200,desc:"狩人たちが愛用する御守り。攻撃力+2 / 会心率+2.0%。"},
    light_shoes:{id:"light_shoes",slot:"accessory",name:"身軽なシューズ",icon:"👟",mods:{},evasion:5,price:250,desc:"身軽に動ける靴。回避率+5.0%。"},
    magic_earrings:{id:"magic_earrings",slot:"accessory",name:"魔法のイヤリング",icon:"💎",mods:{magic:4},resist:{silence:1},price:300,desc:"魔法を扱う者向けのイヤリング。魔力+4 / 封印耐性+1。"},
    forest_circlet:{id:"forest_circlet",slot:"accessory",name:"森のサークレット",icon:"🌿",mods:{def:2,mdef:2},resist:{blind:1,silence:1},price:300,desc:"森の加護が宿るサークレット。防御力+2 / 魔防+2 / 暗闇・封印耐性+1。"},
    fate_ring:{id:"fate_ring",slot:"accessory",name:"運命の指輪",icon:"💍",mods:{},fate:4,price:180,desc:"安物だが運気が上がりそうな指輪。運命+4。"},
    poison_gloves:{id:"poison_gloves",slot:"accessory",name:"毒手袋",icon:"🧤",mods:{},physicalStatus:{poison:.10},price:400,desc:"毒が塗りたくられた危険な手袋。物理攻撃時、10%を基準に毒を付与する。"},
    hidden_smoke:{id:"hidden_smoke",slot:"accessory",name:"仕込み煙幕",icon:"🌫️",mods:{},physicalStatus:{blind:.10},price:400,desc:"服の中などに仕込んでおく煙幕。物理攻撃時、10%を基準に暗闇を付与する。"},
    sealing_talisman:{id:"sealing_talisman",slot:"accessory",name:"封魔の呪符",icon:"🔇",mods:{},physicalStatus:{silence:.10},price:400,desc:"敵のスキルを封じることがある呪符。物理攻撃時、10%を基準に封印を付与する。"},
    veteran_charm:{id:"veteran_charm",slot:"accessory",name:"歴戦の御守り",icon:"🎖️",mods:{atk:12,mdef:-10},crit:4,price:3600,desc:"歴戦の戦士たちが愛用する御守り。攻撃力+12 / 魔防-10 / 会心率+4.0%。"},
    shadow_shoes:{id:"shadow_shoes",slot:"accessory",name:"影法師の靴",icon:"👟",mods:{},evasion:12,price:4400,desc:"かなり身軽に動ける靴。回避率+12.0%。"},
    bandana:{id:"bandana",slot:"accessory",name:"バンダナ",icon:"🎀",mods:{atk:1,def:1,spd:2},price:80,desc:"気が引き締まるバンダナ。攻撃力+1 / 防御力+1 / 素早さ+2。"},
    full_face:{id:"full_face",slot:"accessory",name:"フルフェイス",icon:"⛑️",mods:{def:5},bowInstantKillImmune:true,price:180,desc:"頭部を完全に守る装備。防御力+5 / 射抜即死無効。"},
    erosion_guard_helmet:{id:"erosion_guard_helmet",slot:"accessory",name:"侵蝕防護メット",icon:"🪖",mods:{def:12},erodeDamageMultiplier:.30,price:2500,desc:"イロードの魔力から身を守るメット。防御力+12 / イロード系魔法の被ダメージ-70%。"},
    golden_helmet:{id:"golden_helmet",slot:"accessory",name:"黄金の兜",icon:"👑",mods:{def:17,mdef:7},fate:10,resist:{light:1,dark:-1,thunder:-1},price:52000,desc:"光の力を宿した黄金の兜。防御力+17 / 魔防+7 / 運命+10 / 光耐性+1 / 闇・雷耐性-1。"},
    restian_tiara:{id:"restian_tiara",slot:"accessory",name:"レスティアンティアラ",icon:"👑",mods:{atk:4,def:6,mdef:5},resist:{poison:1,death:1},price:2700,desc:"レスティア公国伝統の頭飾り。攻撃力+4 / 防御力+6 / 魔防+5 / 毒・即死耐性+1。"},
    thunder_god_helmet:{id:"thunder_god_helmet",slot:"accessory",name:"雷神の兜",icon:"⚡",mods:{def:20,mdef:14},resist:{thunder:5},price:108000,desc:"雷耐性がものすごく上がる兜。防御力+20 / 魔防+14 / 雷耐性+5。"},
    zel_leggings:{id:"zel_leggings",slot:"accessory",name:"ゼルレギンス",icon:"🥾",mods:{def:3},resist:{earth:1,poison:1},price:310,desc:"グランゼル王国で流通している一般的なレギンス。防御力+3 / 地・毒耐性+1。"},
    runel_sneakers:{id:"runel_sneakers",slot:"accessory",name:"ルネルスニーカー",icon:"👟",mods:{spd:2},resist:{earth:1,wind:1},price:550,desc:"ルネル地方で大人気のスニーカー。素早さ+2 / 地・風耐性+1。"},
    windcaller_shoes:{id:"windcaller_shoes",slot:"accessory",name:"風呼びの靴",icon:"🌪️",mods:{def:-4,spd:12},resist:{wind:2,earth:-1},price:7400,desc:"風の加護を宿した靴。防御力-4 / 素早さ+12 / 風耐性+2 / 地耐性-1。"},
    earth_greaves:{id:"earth_greaves",slot:"accessory",name:"大地の具足",icon:"🥾",mods:{def:16},resist:{wind:-1,earth:3},price:12000,desc:"大地の力を宿した頑丈な具足。防御力+16 / 風耐性-1 / 地耐性+3。"},
    hero_shoes:{id:"hero_shoes",slot:"accessory",name:"英雄の靴",icon:"👢",mods:{def:-5,mdef:-5,spd:40},price:50000,desc:"英雄が履いていたと言われる靴。防御力-5 / 魔防-5 / 素早さ+40。"},
    gold_ring:{id:"gold_ring",slot:"accessory",name:"ゴールドリング",icon:"💍",mods:{def:8,mdef:10},fate:3,resist:{light:1,silence:1,death:1},price:9200,desc:"黄金でできた神秘的な指輪。防御力+8 / 魔防+10 / 運命+3 / 光・封印・即死耐性+1。"},
    platinum_ring:{id:"platinum_ring",slot:"accessory",name:"プラチナリング",icon:"💍",mods:{def:13,mdef:16},fate:8,resist:{light:1,dark:1,thunder:1,silence:1,death:1},price:27000,desc:"白金でできたとても神秘的な指輪。防御力+13 / 魔防+16 / 運命+8 / 光・闇・雷・封印・即死耐性+1。"},
    red_bracelet:{id:"red_bracelet",slot:"accessory",name:"紅のブレスレット",icon:"🔴",mods:{mdef:4},resist:{fire:1},price:1900,desc:"炎耐性が上がる腕輪。魔防+4 / 炎耐性+1。"},
    blue_bracelet:{id:"blue_bracelet",slot:"accessory",name:"蒼のブレスレット",icon:"🔵",mods:{mdef:4},resist:{ice:1},price:1900,desc:"氷耐性が上がる腕輪。魔防+4 / 氷耐性+1。"},
    white_bracelet:{id:"white_bracelet",slot:"accessory",name:"白のブレスレット",icon:"⚪",mods:{mdef:4},resist:{light:1},price:1900,desc:"光耐性が上がる腕輪。魔防+4 / 光耐性+1。"},
    black_bracelet:{id:"black_bracelet",slot:"accessory",name:"黒のブレスレット",icon:"⚫",mods:{mdef:4},resist:{dark:1},price:1900,desc:"闇耐性が上がる腕輪。魔防+4 / 闇耐性+1。"},
    red_orb:{id:"red_orb",slot:"accessory",name:"紅の宝珠",icon:"🔴",mods:{magic:8,mdef:10},resist:{fire:3,ice:-2},price:8200,desc:"炎耐性に特化する宝珠。魔力+8 / 魔防+10 / 炎耐性+3 / 氷耐性-2。"},
    blue_orb:{id:"blue_orb",slot:"accessory",name:"蒼の宝珠",icon:"🔵",mods:{magic:8,mdef:10},resist:{fire:-2,ice:3},price:8200,desc:"氷耐性に特化する宝珠。魔力+8 / 魔防+10 / 炎耐性-2 / 氷耐性+3。"},
    white_orb:{id:"white_orb",slot:"accessory",name:"白の宝珠",icon:"⚪",mods:{magic:8,mdef:10},resist:{light:3,dark:-2},price:8200,desc:"光耐性に特化する宝珠。魔力+8 / 魔防+10 / 光耐性+3 / 闇耐性-2。"},
    black_orb:{id:"black_orb",slot:"accessory",name:"黒の宝珠",icon:"⚫",mods:{magic:8,mdef:10},resist:{light:-2,dark:3},price:8200,desc:"闇耐性に特化する宝珠。魔力+8 / 魔防+10 / 光耐性-2 / 闇耐性+3。"},
    gas_mask:{id:"gas_mask",slot:"accessory",name:"防毒マスク",icon:"😷",mods:{},resist:{poison:3},price:450,desc:"毒から身を守るマスク。毒耐性+3。"},
    lightning_rod:{id:"lightning_rod",slot:"accessory",name:"避雷針",icon:"⚡",mods:{},resist:{thunder:3},price:500,desc:"雷から身を守る避雷針。雷耐性+3。"},
    night_vision_glasses:{id:"night_vision_glasses",slot:"accessory",name:"暗視グラス",icon:"🥽",mods:{},resist:{blind:3},price:450,desc:"暗闇でも視界を確保できる眼鏡。暗闇耐性+3。"},
    barrier_charm:{id:"barrier_charm",slot:"accessory",name:"結界の護符",icon:"📿",mods:{},resist:{silence:3},price:450,desc:"封印の魔力を跳ね除ける護符。封印耐性+3。"},
    talisman:{id:"talisman",slot:"accessory",name:"タリスマン",icon:"📿",mods:{mdef:6},resist:{death:4},price:1200,desc:"即死の災いから守ってくれる御守り。魔防+6 / 即死耐性+4。"},
    spirit_gem:{id:"spirit_gem",slot:"accessory",name:"精霊の宝石",icon:"💎",mods:{atk:-8,magic:6,mdef:14},resist:{poison:1,blind:1,silence:1,death:1},price:5600,desc:"精霊の魔力を宿した宝石。攻撃力-8 / 魔力+6 / 魔防+14 / 毒・暗闇・封印・即死耐性+1。"},
    matchmaking_charm:{id:"matchmaking_charm",slot:"accessory",name:"縁結びの御守り",icon:"🎀",mods:{def:2,mdef:4},fate:7,price:2000,desc:"ヒザクラ伝統のご利益のある御守り。防御力+2 / 魔防+4 / 運命+7。"},
    demon_ocarina:{id:"demon_ocarina",slot:"accessory",name:"魔縁のオカリナ",icon:"🎵",mods:{},fate:15,battleNodeWeightBonus:.25,price:9800,desc:"魔物娘が寄ってくる不思議なオカリナ。運命+15 / 探索の戦闘ノード抽選重み+25%。複数装備で加算。"},
    war_god_charm:{id:"war_god_charm",slot:"accessory",name:"戦神の御守り",icon:"⚔️",mods:{atk:35,magic:-10,mdef:-10},price:50000,desc:"攻撃力に特化する御守り。攻撃力+35 / 魔力-10 / 魔防-10。"},
    guardian_bracelet:{id:"guardian_bracelet",slot:"accessory",name:"守護神の腕輪",icon:"🛡️",mods:{atk:-15,def:55,magic:-15},price:50000,desc:"防御力に特化する腕輪。攻撃力-15 / 防御力+55 / 魔力-15。"},
    demon_ancestor_earring:{id:"demon_ancestor_earring",slot:"accessory",name:"魔祖の耳飾り",icon:"💎",mods:{atk:-10,def:-10,magic:35},price:50000,desc:"魔力に特化する耳飾り。攻撃力-10 / 防御力-10 / 魔力+35。"},
    spirit_king_collar:{id:"spirit_king_collar",slot:"accessory",name:"精霊王の首輪",icon:"📿",mods:{atk:-15,magic:-15,mdef:55},price:50000,desc:"魔法防御に特化する首輪。攻撃力-15 / 魔力-15 / 魔防+55。"},
    energy_bottle:{id:"energy_bottle",slot:"accessory",name:"エナジーボトル",icon:"🧪",mods:{},hpPercent:.10,price:8800,desc:"生命力を供給するボトル。最大HP+10%。"},
    energy_tank:{id:"energy_tank",slot:"accessory",name:"エナジータンク",icon:"🛢️",mods:{},hpPercent:.20,price:45000,desc:"生命力を補完する貯蔵タンク。最大HP+20%。"},
    magic_bottle:{id:"magic_bottle",slot:"accessory",name:"マジックボトル",icon:"🧪",mods:{},mpPercent:.10,price:8800,desc:"魔力を供給するボトル。最大MP+10%。"},
    magic_tank:{id:"magic_tank",slot:"accessory",name:"マジックタンク",icon:"🛢️",mods:{},mpPercent:.20,price:45000,desc:"魔力を補完する貯蔵タンク。最大MP+20%。"},
    growth_crystal:{id:"growth_crystal",slot:"accessory",name:"成長の水晶",icon:"🔹",mods:{},allStatPercent:-.20,fatePercent:-.20,resistAll:-2,expMultiplier:1.50,price:100,desc:"成長を促す水晶。全ステータス（運命含む）-20% / 全耐性-2 / 獲得経験値+50%。"},
    trial_crystal:{id:"trial_crystal",slot:"accessory",name:"試練の水晶",icon:"🔷",mods:{},allStatPercent:-.50,fatePercent:-.50,resistAll:-3,expMultiplier:2.00,price:200,desc:"試練を与える水晶。全ステータス（運命含む）-50% / 全耐性-3 / 獲得経験値+100%。"},
    hardship_crystal:{id:"hardship_crystal",slot:"accessory",name:"苦難の水晶",icon:"💠",mods:{},allStatPercent:-.75,fatePercent:-.75,resistAll:-4,expMultiplier:2.50,price:400,desc:"苦難をもたらす水晶。全ステータス（運命含む）-75% / 全耐性-4 / 獲得経験値+150%。"},
    training_sash:{id:"training_sash",slot:"accessory",name:"修練の襷",icon:"🎗️",mods:{},reserveExpRate:.50,price:800,desc:"戦闘不参加でも経験値が得られる襷。控え時、基礎経験値の50%を獲得。"},
    honing_eye:{id:"honing_eye",slot:"accessory",name:"練磨の眼",icon:"👁️",mods:{},reserveExpRate:.80,price:3200,desc:"戦闘不参加でも経験値が得られる不思議な眼。控え時、基礎経験値の80%を獲得。"},
    void_membrane:{id:"void_membrane",slot:"accessory",name:"無の光膜",icon:"🫧",mods:{},redistributeExp:true,price:600,desc:"獲得経験値0。勝利時に生存していれば、本来の経験値を生存中の前列・非装備者へ均等分配する。複数装備者の分も合算。"},
    holy_beast_clock:{id:"holy_beast_clock",slot:"accessory",name:"聖獣の時計",icon:"⌚",mods:{},preventWipe:true,price:10000,desc:"全滅時、前列の味方全員をHP全回復で復活し、消滅する神秘の懐中時計。"},
    martial_gauntlet:{id:"martial_gauntlet",slot:"accessory",name:"武神の手甲",icon:"🥊",mods:{},skillBoost:{skillId:"explosiveFist",kind:"hits",amount:1},price:5000,desc:"爆裂拳を強化する手甲。爆裂拳の攻撃回数+1。"},
    sword_god_hair:{id:"sword_god_hair",slot:"accessory",name:"剣神の遺髪",icon:"🗡️",mods:{},skillBoost:{skillId:"swordDance",kind:"hits",amount:1},price:5000,desc:"剣の舞を強化する遺髪。剣の舞の攻撃回数+1。"},
    beast_god_belt:{id:"beast_god_belt",slot:"accessory",name:"獣神のベルト",icon:"🪓",mods:{},skillBoost:{skillId:"terraCrash",kind:"critDamage",multiplier:1.20},price:5000,desc:"テラクラッシュを強化するベルト。テラクラッシュの会心ダメージ倍率をさらに1.2倍。"},
    stardust_monocle:{id:"stardust_monocle",slot:"accessory",name:"星屑のモノクル",icon:"🧐",mods:{},skillBoost:{skillId:"stardust",kind:"power",value:2.70},price:5000,desc:"スターダストを強化するモノクル。スターダストの威力を220%から270%へ強化。"},
    mana_amplifier:{id:"mana_amplifier",slot:"accessory",name:"魔流増幅器",icon:"🪄",mods:{},skillBoost:{skillId:"magicBarrier",kind:"barrier",value:.70},price:5000,desc:"魔力障壁を強化する増幅器。魔法ダメージ軽減率を60%から70%へ強化。"},
    dragon_god_tattoo:{id:"dragon_god_tattoo",slot:"accessory",name:"龍神のタトゥー",icon:"🐉",mods:{},skillBoost:{skillId:"dragonSpiral",kind:"hits",amount:1},price:5000,desc:"龍螺旋を強化するタトゥー。龍螺旋の攻撃回数+1。"},
    ancient_patch:{id:"ancient_patch",slot:"accessory",name:"古代のパッチ",icon:"🔧",mods:{},skillBoost:{skillId:"nephilimLaser",kind:"laser",power:2.50,shockRate:.50},price:5000,desc:"ネフィリムレーザーを強化する謎のパッチ。威力220%→250%、感電35%→50%。"}

  };

  // v0.43n: equipment icons are standardized by equipment category.
  const EQUIPMENT_CATEGORY_ICONS={
    weapon:{fist:"🥊",sword:"🗡️",axe:"🪓",bow:"🏹",staff:"🪄",whip:"➰",gun:"🔫"},
    shield:"🛡️",
    body:"👕",
    accessory:"💍"
  };
  Object.values(equipmentCatalog).forEach(item=>{
    if(!item || ["bare","no_shield","no_body","no_accessory"].includes(item.id)) return;
    if(item.slot==="weapon") item.icon=EQUIPMENT_CATEGORY_ICONS.weapon[item.weaponType]||"🗡️";
    else if(EQUIPMENT_CATEGORY_ICONS[item.slot]) item.icon=EQUIPMENT_CATEGORY_ICONS[item.slot];
  });

  const equipmentInventory={
    weapon:["bare","stone_claw","bronze_knuckle","steel_claw","silver_knuckle","restian_claw","platinum_claw","golden_claw","champion","dagger","traveler_sword","iron_sword","silver_sword","salid_saber","kirisute_maru","platinum_sword","golden_sword","breaker","stone_axe","bronze_axe","steel_axe","silver_axe","icebreaker_maul","platinum_axe","golden_axe","destroyer","short_bow","traveler_bow","elven_bow","iron_bow","silver_bow","restian_bow","hamaya_bow","platinum_bow","golden_bow","chiron","hinoki_staff","mage_staff","iron_rod","silver_rod","ritual_staff","platinum_rod","golden_staff","hecate","whip","alra_whip","bronze_whip","iron_whip","silver_whip","trainer_whip","platinum_whip","golden_whip","mad_dragon_tail","type_milesta","hunter","type_zel","type_runel","alm_hunting_gun","remaster_zel","limbo_magic_gun","fatality","paw_hand"],
    shield:["no_shield","wood_shield","stone_greatshield","buckler","iron_buckler","iron_greatshield","silver_shield","heat_bulwark","snow_bulwark","ritual_shield","water_mirror_shield","platinum_shield","limbo_shield","fire_god_shield","ice_god_shield","wind_god_shield","earth_god_shield","empty_mind_barrier","spirit_shield","angel_shield","dark_shield","alm_small_shield"],
    body:["no_body","milesta_clothes","leather_armor","traveler_clothes","bronze_mail","mage_robe","maid_dress","iron_mail","runel_clothes","silver_mail","magical_cloth","restian_belt","miko_outfit","platinum_mail","light_robe","demon_clothes","golden_armor","field_runner","phalanx","yggdrasil","ragged_robe"],
    accessory:["no_accessory","hunter_charm","light_shoes","magic_earrings","forest_circlet","fate_ring","poison_gloves","hidden_smoke","sealing_talisman","veteran_charm","shadow_shoes","bandana","full_face","erosion_guard_helmet","golden_helmet","restian_tiara","thunder_god_helmet","zel_leggings","runel_sneakers","windcaller_shoes","earth_greaves","hero_shoes","gold_ring","platinum_ring","red_bracelet","blue_bracelet","white_bracelet","black_bracelet","red_orb","blue_orb","white_orb","black_orb","gas_mask","lightning_rod","night_vision_glasses","barrier_charm","talisman","spirit_gem","matchmaking_charm","demon_ocarina","war_god_charm","guardian_bracelet","demon_ancestor_earring","spirit_king_collar","energy_bottle","energy_tank","magic_bottle","magic_tank","growth_crystal","trial_crystal","hardship_crystal","training_sash","honing_eye","void_membrane","holy_beast_clock","martial_gauntlet","sword_god_hair","beast_god_belt","stardust_monocle","mana_amplifier","dragon_god_tattoo","ancient_patch"]
  };
  // Real ownership begins in v0.31. "装備なし" is unlimited; actual gear must be bought or found.
  const equipmentOwnedCounts={};
  Object.values(equipmentInventory).flat().forEach(id=>equipmentOwnedCounts[id]=0);
  ["bare","no_shield","no_body","no_accessory"].forEach(id=>equipmentOwnedCounts[id]=999);
  function equippedCount(itemId,excludeCharacterId=null){
    return Object.values(roster||{}).filter(c=>!c.npcEquipment && c.id!==excludeCharacterId && Object.values(ensureEquipment(c)).includes(itemId)).length;
  }
  function ownedEquipmentCount(itemId){ return Number(equipmentOwnedCounts[itemId]||0); }
  function freeEquipmentCount(itemId,excludeCharacterId=null){
    if(["bare","no_shield","no_body","no_accessory"].includes(itemId)) return 999;
    return Math.max(0,ownedEquipmentCount(itemId)-equippedCount(itemId,excludeCharacterId));
  }
  function addEquipmentOwned(itemId,count=1){
    equipmentOwnedCounts[itemId]=Math.max(0,(equipmentOwnedCounts[itemId]||0)+count);
  }
  function equippedItemList(c,equipmentOverride=null){
    const eq=equipmentOverride||ensureEquipment(c);
    return EQUIPMENT_SLOTS.map(slot=>equipmentCatalog[eq[slot]]).filter(Boolean);
  }
  function equipmentHasFlag(c,key){ return equippedItemList(c).some(item=>!!item?.[key]); }
  function equipmentNumberSum(c,key){ return equippedItemList(c).reduce((sum,item)=>sum+(Number(item?.[key])||0),0); }
  function equippedAccessory(c){ return equipmentCatalog[ensureEquipment(c).accessory]||equipmentCatalog.no_accessory; }
  function effectiveSkillForActor(actor,baseSkill){
    if(!actor || !baseSkill) return baseSkill;
    const boost=equippedAccessory(actor)?.skillBoost;
    if(!boost || boost.skillId!==baseSkill.id) return baseSkill;
    const sk={...baseSkill};
    if(boost.kind==="hits") sk.hits=Math.max(1,(Number(sk.hits)||1)+(Number(boost.amount)||0));
    else if(boost.kind==="critDamage") sk.critDamageMultiplier=Math.max(1,Number(boost.multiplier)||1);
    else if(boost.kind==="power") sk.power=Math.max(0,Number(boost.value)||Number(sk.power)||1);
    else if(boost.kind==="barrier") sk.reduction=Math.max(0,Math.min(.95,Number(boost.value)||Number(sk.reduction)||0));
    else if(boost.kind==="laser"){
      sk.power=Math.max(0,Number(boost.power)||Number(sk.power)||1);
      sk.shockRate=Math.max(0,Math.min(1,Number(boost.shockRate)||Number(sk.shockRate)||0));
    }
    return sk;
  }
  function applyEquipmentPhysicalStatus(actor,target){
    if(!actor || !target || target.hp<=0) return null;
    const statusMap=equippedAccessory(actor)?.physicalStatus;
    if(!statusMap) return null;
    for(const [status,baseRate] of Object.entries(statusMap)){
      const result=tryInflictStatus(target,status,Number(baseRate)||0);
      if(result.success) return {status,result};
    }
    return null;
  }
  const favoriteWeaponsByCharacter={hero:["sword","bow","staff"],eliza:["sword"],slime:["fist","whip"],dog:["fist"],fairy:["staff","whip"],slug:["fist","axe"],momo:["fist","axe"],arachne:["staff","whip"],slimebes:["fist","sword","axe"],poison:["fist","axe"],harpy:["fist","staff"],alraune:["staff","whip"],rabbit:["fist","sword","whip"],demon:["staff"],golem:["fist","axe"],elf:["bow"],sylph:["staff"],owl:["fist","bow"],moth:["staff","whip"],forestMage:["bow","staff"],silverSlime:["fist","bow","whip"],maidDevil:["fist","whip","gun"],lamia:["axe","whip"],poisonArachne:["bow","staff","whip"],ghost:["staff"],madGolem:["fist","axe"],scylla:["whip"],mimic:["whip","gun"],podalge:["fist","bow"],mermaid:["staff"],kitsune:["sword","staff","whip"],lloyd:["gun"],dogu:["sword","bow","gun"],desertDog:["fist"],hotSandTentacle:["whip"],prominence:["fist","staff"],magmaSlug:["fist","axe"],scorpion:["fist","sword","gun"],dragon:["fist"],karen:["sword","axe"]};
  const weaponTypeLabels={fist:"拳",sword:"剣",axe:"斧槌",bow:"弓",staff:"杖",whip:"鞭",gun:"銃"};
  const weaponTypeIcons={fist:"🥊",sword:"⚔️",axe:"🪓",bow:"🏹",staff:"🪄",whip:"〰️",gun:"🔫"};
  const BASE_CRITICAL_RATE=0;
  const BASE_EVASION_RATE=0;
  const BASE_CRITICAL_MULTIPLIER=1.50;
  function roundRate1(value){ return Math.round((Number(value)||0)*10)/10; }
  function clampRate(value){ return Math.max(0,Math.min(100,roundRate1(value))); }
  function favoriteWeaponTypes(c){ return favoriteWeaponsByCharacter[c?.id]||[]; }
  function ensureEquipment(c){
    if(!c.equipment) c.equipment={weapon:"bare",shield:"no_shield",body:"no_body",accessory:"no_accessory"};
    return c.equipment;
  }
  function equippedWeapon(c){ return equipmentCatalog[ensureEquipment(c).weapon]||equipmentCatalog.bare; }
  function itemModsFor(c,item){
    const mods={...(item?.mods||{})};
    const favored=item?.slot==="weapon" && item.weaponType && favoriteWeaponTypes(c).includes(item.weaponType);
    if(favored){
      // Proficiency strengthens positive flat stat bonuses by 10%, with at least +1. Penalties and percentage stats are unchanged.
      Object.keys(mods).forEach(k=>{
        const v=Number(mods[k])||0;
        if(v>0) mods[k]=v+Math.max(1,Math.round(v*.10));
      });
    }
    return mods;
  }
  function equipmentExtras(c,equipmentOverride=null){
    const eq=equipmentOverride||ensureEquipment(c);
    let crit=Number(c?.critRate)||BASE_CRITICAL_RATE;
    let evasion=Number(c?.evasionRate)||BASE_EVASION_RATE;
    let fate=Number(c?.fate)||0;
    let fatePercent=0;
    let critMultiplier=BASE_CRITICAL_MULTIPLIER+(Number(c?.critMultiplierBonus)||0);
    EQUIPMENT_SLOTS.forEach(slot=>{
      const item=equipmentCatalog[eq[slot]]; if(!item)return;
      crit+=Number(item.crit)||0;
      evasion+=Number(item.evasion)||0;
      fate+=Number(item.fate)||0;
      fatePercent+=Number(item.fatePercent)||0;
      critMultiplier+=Number(item.critMultiplierBonus)||0;
    });
    if(fatePercent) fate=Math.max(0,Math.round(fate*(1+fatePercent)));
    return {crit:clampRate(crit),evasion:clampRate(evasion),fate,critMultiplier:Math.max(1,Math.round(critMultiplier*100)/100)};
  }
  function weaponAttackProfile(c){
    const weapon=equippedWeapon(c);
    return {
      weapon,
      power:Number.isFinite(weapon.normalAttackPower)?weapon.normalAttackPower:1,
      defenseInfluence:Number.isFinite(weapon.defenseInfluence)?weapon.defenseInfluence:1,
      attackAll:!!weapon.attackAll,
      canCrit:weapon.canCrit!==false,
      bowInstantKillRate:clampRate(weapon.bowInstantKillRate||0),
      basicDeathRate:Math.max(0,Number(weapon.basicDeathRate)||0),
      basicDispelRate:Math.max(0,Number(weapon.basicDispelRate)||0),
      fx:weapon.weaponType==="fist"?{kind:"punch",symbol:"💥"}:
         weapon.weaponType==="sword"?{kind:"slash",symbol:"✦"}:
         weapon.weaponType==="axe"?{kind:"heavy",symbol:"💥"}:
         weapon.weaponType==="bow"?{kind:"arrow",symbol:"➶"}:
         weapon.weaponType==="staff"?{kind:"magicshot",symbol:"✧"}:
         weapon.weaponType==="whip"?{kind:"whip",symbol:"〰"}:
         weapon.weaponType==="gun"?{kind:"gun",symbol:"✹"}:
         {kind:"impact",symbol:"💥"}
    };
  }
  function equipmentBaseStatsForPercent(c){
    const profile=profileFor(c);
    if(profile){
      const base=formalStatsAtLevel(profile,c.level||1,ensureCharacterFinalVariation(c));
      const seed=seedBonusOf(c);
      ["hpMax","mpMax","atk","def","magic","mdef","spd"].forEach(k=>base[k]=(Number(base[k])||0)+(Number(seed[k])||0));
      return base;
    }
    const st=S(c)||{};
    return {hpMax:Number(st.hpMax)||1,mpMax:Number(st.mpMax)||0,atk:Number(st.atk)||0,def:Number(st.def)||0,magic:Number(st.magic)||0,mdef:Number(st.mdef)||0,spd:Number(st.spd)||0};
  }
  function equipmentStatDelta(c,equipmentOverride=null){
    const eq=equipmentOverride||ensureEquipment(c);
    const d={hpMax:0,mpMax:0,atk:0,def:0,magic:0,mdef:0,spd:0};
    const pct={hpMax:0,mpMax:0,atk:0,def:0,magic:0,mdef:0,spd:0};
    EQUIPMENT_SLOTS.forEach(slot=>{
      const item=equipmentCatalog[eq[slot]]; if(!item)return;
      const mods=itemModsFor(c,item);
      Object.entries(mods).forEach(([k,v])=>{if(k in d)d[k]+=Number(v)||0;});
      const all=Number(item.allStatPercent)||0;
      if(all) Object.keys(pct).forEach(k=>pct[k]+=all);
      pct.hpMax+=Number(item.hpPercent)||0;
      pct.mpMax+=Number(item.mpPercent)||0;
    });
    if(Object.values(pct).some(Boolean)){
      const base=equipmentBaseStatsForPercent(c);
      Object.keys(pct).forEach(k=>{
        if(!pct[k]) return;
        const before=(Number(base[k])||0)+(Number(d[k])||0);
        d[k]+=Math.round(before*pct[k]);
      });
    }
    return d;
  }
  function changeEquipment(c,slot,itemId){
    if(c?.equipmentLocked){toast("このキャラクターの装備は変更できません");return;}
    ensureEquipment(c);
    if(itemId!==c.equipment[slot] && freeEquipmentCount(itemId,c.id)<=0){ toast("その装備の空きがありません"); return; }
    const oldDelta=equipmentStatDelta(c); const oldHpMax=c.stats.hpMax, oldMpMax=c.stats.mpMax;
    Object.entries(oldDelta).forEach(([k,v])=>{ if(k in c.stats) c.stats[k]-=v; });
    c.equipment[slot]=itemId;
    const newDelta=equipmentStatDelta(c);
    Object.entries(newDelta).forEach(([k,v])=>{ if(k in c.stats) c.stats[k]+=v; });
    c.stats.hp=Math.min(c.stats.hpMax,c.stats.hp+Math.max(0,c.stats.hpMax-oldHpMax));
    c.stats.mp=Math.min(c.stats.mpMax,c.stats.mp+Math.max(0,c.stats.mpMax-oldMpMax));
  }

  const roster = {
    hero:{
      id:"hero",name:"主人公",img:IMG.hero,fate:characterProfiles.hero.fate,profileId:"hero",
      stats:mutableStatsFromFormal(characterProfiles.hero,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.hero,1),caption:"主人公の行動を選択",
      portrait:{scale:1.22,x:0,y:0},atkBuff:1,atkBuffRounds:0
    },
    eliza:{
      id:"eliza",name:"エリザ",img:ELIZA_EVENT_IMG,fate:20,profileId:"eliza",
      stats:mutableStatsFromFormal(characterProfiles.eliza,30),
      learnedSkills:["ice","frost","cold","heal","allHeal"],caption:"NPC：自動行動",
      portrait:{scale:1.08,x:0,y:1},atkBuff:1,atkBuffRounds:0,
      fixedLevel:30,levelLocked:true,equipmentLocked:true,npcAuto:true,npcOnly:true,npcEquipment:true,partyLocked:true,
      equipment:{weapon:"dagger",shield:"wood_shield",body:"milesta_clothes",accessory:"no_accessory"}
    },
    slime:{
      id:"slime",name:"スライム娘",img:IMG.slime,fate:characterProfiles.slime.fate,profileId:"slime",
      stats:mutableStatsFromFormal(characterProfiles.slime,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.slime,1),caption:"スライム娘の行動を選択",
      portrait:{scale:1.28,x:0,y:4},atkBuff:1,atkBuffRounds:0
    },
    dog:{
      id:"dog",name:"犬娘",img:IMG.dog,fate:characterProfiles.dog.fate,profileId:"dog",
      stats:mutableStatsFromFormal(characterProfiles.dog,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.dog,1),caption:"犬娘の行動を選択",
      portrait:{scale:1.12,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    fairy:{
      id:"fairy",name:"フェアリー",img:IMG.fairy,fate:characterProfiles.fairy.fate,profileId:"fairy",
      stats:mutableStatsFromFormal(characterProfiles.fairy,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.fairy,1),caption:"フェアリーの行動を選択",
      portrait:{scale:1.23,x:0,y:2},atkBuff:1,atkBuffRounds:0
    },
    slug:{
      id:"slug",name:"ナメクジ娘",img:IMG.slug,fate:characterProfiles.slug.fate,profileId:"slug",
      stats:mutableStatsFromFormal(characterProfiles.slug,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.slug,1),caption:"ナメクジ娘の行動を選択",
      portrait:{scale:1.08,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    slimebes:{
      id:"slimebes",name:"スライムベス娘",img:IMG.slimebes,fate:characterProfiles.slimebes.fate,profileId:"slimebes",
      stats:mutableStatsFromFormal(characterProfiles.slimebes,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.slimebes,1),caption:"スライムベス娘の行動を選択",
      portrait:{scale:1.25,x:0,y:4},atkBuff:1,atkBuffRounds:0
    },
    poison:{
      id:"poison",name:"ポイズンスライム娘",img:IMG.poison,fate:characterProfiles.poison.fate,profileId:"poison",
      stats:mutableStatsFromFormal(characterProfiles.poison,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.poison,1),caption:"ポイズンスライム娘の行動を選択",
      portrait:{scale:1.22,x:0,y:3},atkBuff:1,atkBuffRounds:0
    },
    harpy:{
      id:"harpy",name:"ハーピー",img:IMG.harpy,fate:characterProfiles.harpy.fate,profileId:"harpy",
      stats:mutableStatsFromFormal(characterProfiles.harpy,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.harpy,1),caption:"ハーピーの行動を選択",
      portrait:{scale:1.10,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    momo:{
      id:"momo",name:"モモイロナメクジ",img:IMG.momo,fate:characterProfiles.momo.fate,profileId:"momo",
      stats:mutableStatsFromFormal(characterProfiles.momo,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.momo,1),caption:"モモイロナメクジの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    arachne:{
      id:"arachne",name:"アラクネ",img:IMG.arachne,fate:characterProfiles.arachne.fate,profileId:"arachne",
      stats:mutableStatsFromFormal(characterProfiles.arachne,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.arachne,1),caption:"アラクネの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    alraune:{
      id:"alraune",name:"アルラウネ",img:IMG.alraune,fate:characterProfiles.alraune.fate,profileId:"alraune",
      stats:mutableStatsFromFormal(characterProfiles.alraune,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.alraune,1),caption:"アルラウネの行動を選択",
      portrait:{scale:1.08,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    rabbit:{
      id:"rabbit",name:"ウサギ娘",img:IMG.rabbit,fate:characterProfiles.rabbit.fate,profileId:"rabbit",
      stats:mutableStatsFromFormal(characterProfiles.rabbit,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.rabbit,1),caption:"ウサギ娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    demon:{
      id:"demon",name:"デーモン",img:IMG.demon,fate:characterProfiles.demon.fate,profileId:"demon",
      stats:mutableStatsFromFormal(characterProfiles.demon,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.demon,1),caption:"デーモンの行動を選択",
      portrait:{scale:1.04,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    golem:{
      id:"golem",name:"ゴーレム娘",img:IMG.golem,fate:characterProfiles.golem.fate,profileId:"golem",
      stats:mutableStatsFromFormal(characterProfiles.golem,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.golem,1),caption:"ゴーレム娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    elf:{
      id:"elf",name:"エルフ",img:IMG.elf,fate:characterProfiles.elf.fate,profileId:"elf",
      stats:mutableStatsFromFormal(characterProfiles.elf,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.elf,1),caption:"エルフの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    sylph:{
      id:"sylph",name:"シルフィ",img:IMG.sylph,fate:characterProfiles.sylph.fate,profileId:"sylph",
      stats:mutableStatsFromFormal(characterProfiles.sylph,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.sylph,1),caption:"シルフィの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    owl:{
      id:"owl",name:"フクロウ娘",img:IMG.owl,fate:characterProfiles.owl.fate,profileId:"owl",
      stats:mutableStatsFromFormal(characterProfiles.owl,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.owl,1),caption:"フクロウ娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    moth:{
      id:"moth",name:"モス",img:IMG.moth,fate:characterProfiles.moth.fate,profileId:"moth",
      stats:mutableStatsFromFormal(characterProfiles.moth,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.moth,1),caption:"モスの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    forestMage:{
      id:"forestMage",name:"フォレストメイジ",img:IMG.forestMage,fate:characterProfiles.forestMage.fate,profileId:"forestMage",
      stats:mutableStatsFromFormal(characterProfiles.forestMage,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.forestMage,1),caption:"フォレストメイジの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    silverSlime:{
      id:"silverSlime",name:"シルバースライム",img:IMG.silverSlime,fate:characterProfiles.silverSlime.fate,profileId:"silverSlime",
      stats:mutableStatsFromFormal(characterProfiles.silverSlime,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.silverSlime,1),caption:"シルバースライムの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    maidDevil:{
      id:"maidDevil",name:"メイドデビル",img:IMG.maidDevil,fate:characterProfiles.maidDevil.fate,profileId:"maidDevil",
      stats:mutableStatsFromFormal(characterProfiles.maidDevil,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.maidDevil,1),caption:"メイドデビルの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    lamia:{
      id:"lamia",name:"ラミア",img:IMG.lamia,fate:characterProfiles.lamia.fate,profileId:"lamia",
      stats:mutableStatsFromFormal(characterProfiles.lamia,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.lamia,1),caption:"ラミアの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    poisonArachne:{
      id:"poisonArachne",name:"ポイズンアラクネ",img:IMG.poisonArachne,fate:characterProfiles.poisonArachne.fate,profileId:"poisonArachne",
      stats:mutableStatsFromFormal(characterProfiles.poisonArachne,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.poisonArachne,1),caption:"ポイズンアラクネの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    ghost:{
      id:"ghost",name:"ゴースト娘",img:IMG.ghost,fate:characterProfiles.ghost.fate,profileId:"ghost",
      stats:mutableStatsFromFormal(characterProfiles.ghost,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.ghost,1),caption:"ゴースト娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    madGolem:{
      id:"madGolem",name:"マッドゴーレム",img:IMG.madGolem,fate:characterProfiles.madGolem.fate,profileId:"madGolem",
      stats:mutableStatsFromFormal(characterProfiles.madGolem,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.madGolem,1),caption:"マッドゴーレムの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    scylla:{
      id:"scylla",name:"スキュラ",img:IMG.scylla,fate:characterProfiles.scylla.fate,profileId:"scylla",
      stats:mutableStatsFromFormal(characterProfiles.scylla,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.scylla,1),caption:"スキュラの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    mimic:{
      id:"mimic",name:"ミミック娘",img:IMG.mimic,fate:characterProfiles.mimic.fate,profileId:"mimic",
      stats:mutableStatsFromFormal(characterProfiles.mimic,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.mimic,1),caption:"ミミック娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    podalge:{
      id:"podalge",name:"ポダルゲ",img:IMG.podalge,fate:characterProfiles.podalge.fate,profileId:"podalge",
      stats:mutableStatsFromFormal(characterProfiles.podalge,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.podalge,1),caption:"ポダルゲの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    mermaid:{
      id:"mermaid",name:"マーメイド",img:IMG.mermaid,fate:characterProfiles.mermaid.fate,profileId:"mermaid",
      stats:mutableStatsFromFormal(characterProfiles.mermaid,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.mermaid,1),caption:"マーメイドの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    kitsune:{
      id:"kitsune",name:"妖狐",img:IMG.kitsune,fate:characterProfiles.kitsune.fate,profileId:"kitsune",
      stats:mutableStatsFromFormal(characterProfiles.kitsune,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.kitsune,1),caption:"妖狐の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    lloyd:{
      id:"lloyd",name:"ロイド",img:IMG.lloyd,fate:characterProfiles.lloyd.fate,profileId:"lloyd",
      stats:mutableStatsFromFormal(characterProfiles.lloyd,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.lloyd,1),caption:"ロイドの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    dogu:{
      id:"dogu",name:"土偶娘",img:IMG.dogu,fate:characterProfiles.dogu.fate,profileId:"dogu",
      stats:mutableStatsFromFormal(characterProfiles.dogu,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.dogu,1),caption:"土偶娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    desertDog:{
      id:"desertDog",name:"デザートドッグ",img:IMG.desertDog,fate:characterProfiles.desertDog.fate,profileId:"desertDog",
      stats:mutableStatsFromFormal(characterProfiles.desertDog,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.desertDog,1),caption:"デザートドッグの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    hotSandTentacle:{
      id:"hotSandTentacle",name:"熱砂の触手",img:IMG.hotSandTentacle,fate:characterProfiles.hotSandTentacle.fate,profileId:"hotSandTentacle",
      stats:mutableStatsFromFormal(characterProfiles.hotSandTentacle,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.hotSandTentacle,1),caption:"熱砂の触手の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    prominence:{
      id:"prominence",name:"プロミネンス",img:IMG.prominence,fate:characterProfiles.prominence.fate,profileId:"prominence",
      stats:mutableStatsFromFormal(characterProfiles.prominence,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.prominence,1),caption:"プロミネンスの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    magmaSlug:{
      id:"magmaSlug",name:"マグマスラッグ",img:IMG.magmaSlug,fate:characterProfiles.magmaSlug.fate,profileId:"magmaSlug",
      stats:mutableStatsFromFormal(characterProfiles.magmaSlug,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.magmaSlug,1),caption:"マグマスラッグの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    scorpion:{
      id:"scorpion",name:"スコーピオン娘",img:IMG.scorpion,fate:characterProfiles.scorpion.fate,profileId:"scorpion",
      stats:mutableStatsFromFormal(characterProfiles.scorpion,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.scorpion,1),caption:"スコーピオン娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    dragon:{
      id:"dragon",name:"ドラゴン娘",img:IMG.dragon,fate:characterProfiles.dragon.fate,profileId:"dragon",
      stats:mutableStatsFromFormal(characterProfiles.dragon,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.dragon,1),caption:"ドラゴン娘の行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    },
    karen:{
      id:"karen",name:"カレン",img:IMG.karen,fate:characterProfiles.karen.fate,profileId:"karen",
      stats:mutableStatsFromFormal(characterProfiles.karen,1),
      learnedSkills:plannedSkillIdsUpTo(characterProfiles.karen,1),caption:"カレンの行動を選択",
      portrait:{scale:1.06,x:0,y:1},atkBuff:1,atkBuffRounds:0
    }
  };
  Object.values(roster).forEach(c=>ensureEquipment(c));
  roster.hero.finalVariation=rollFinalStatVariation(characterProfiles.hero);
  { const c=roster.eliza,mods=equipmentStatDelta(c); Object.entries(mods).forEach(([k,v])=>{if(k in c.stats)c.stats[k]+=v;}); c.stats.hp=c.stats.hpMax;c.stats.mp=c.stats.mpMax; }
  // v0.31: the hero starts dressed, but weapon choice is left to the player.
  addEquipmentOwned("milesta_clothes",1);
  changeEquipment(roster.hero,"body","milesta_clothes");

  const MAGIC_RANK_MULTIPLIERS={E:.70,D:1.00,C:1.50,B:1.80,A:2.20,S:2.70};
  const MAGIC_ALL_TARGET_MULTIPLIER=.75;
  const PLEASURE_RESIST_DAMAGE={E:1.75,D:1.40,C:1.00,B:.65,A:.35,S:.15};
  const STATUS_BASE_RATE={single:.65,all:.50,deathSingle:.30,deathAll:.20};

  const MAGIC_FX_SYMBOLS={fire:"🔥",ice:"❄️",thunder:"⚡",earth:"🪨",wind:"🌪️",light:"✨",dark:"🌑",pleasure:"💗"};
  function magicSkill(id,name,icon,cost,target,element,rank,extra={}){
    const all=target==="enemyAll";
    return {id,name,icon,cost,target,kind:"magic",element,rank,
      rankMultiplier:MAGIC_RANK_MULTIPLIERS[rank]||1,
      targetMultiplier:all?MAGIC_ALL_TARGET_MULTIPLIER:1,
      desc:`敵${all?"全体":"1体"}に${element?({fire:"炎",ice:"氷",thunder:"雷",earth:"地",wind:"風",light:"光",dark:"闇",pleasure:"快楽"}[element]||element)+"属性":"無属性"}の魔法ダメージ`,
      animation:element==="fire"?"fire":"magicshot",fxSymbol:MAGIC_FX_SYMBOLS[element]||icon,...extra};
  }
  function statusSkill(id,name,icon,cost,target,status,baseRate,extra={}){
    const all=target==="enemyAll";
    const label={poison:"毒",blind:"暗闇",silence:"封印",death:"即死"}[status]||status;
    return {id,name,icon,cost,target,kind:"status",status,baseRate,
      desc:`敵${all?"全体":"1体"}を一定確率で${label}${status==="death"?"させる":"状態にする"}`,...extra};
  }

  const skills = {
    // Standard attack magic: (30 + MAG×1.20) × rank × target modifier × MDEF × resistance × variance.
    // E/D/C/B/A/S = 0.70/1.00/1.50/1.80/2.20/2.70. All-target = 0.75.
    fire:magicSkill("fire","ファイア","🔥",4,"enemy","fire","E"),
    flare:magicSkill("flare","フレア","🔥",10,"enemy","fire","C"),
    gigaFlare:magicSkill("gigaFlare","ギガフレア","🔥",18,"enemy","fire","A"),
    lastFlare:magicSkill("lastFlare","ラストフレア","🔥",28,"enemy","fire","S"),
    blaze:magicSkill("blaze","ブレイズ","🔥",6,"enemyAll","fire","E"),
    blaze2:magicSkill("blaze2","ブレイズⅡ","🔥",15,"enemyAll","fire","C"),
    endBlaze:magicSkill("endBlaze","エンドブレイズ","🔥",40,"enemyAll","fire","S"),

    ice:magicSkill("ice","アイス","❄️",4,"enemy","ice","E"),
    frost:magicSkill("frost","フロスト","❄️",10,"enemy","ice","C"),
    gigaFrost:magicSkill("gigaFrost","ギガフロスト","❄️",18,"enemy","ice","A"),
    lastFrost:magicSkill("lastFrost","ラストフロスト","❄️",28,"enemy","ice","S"),
    cold:magicSkill("cold","コールド","🧊",6,"enemyAll","ice","E"),
    cold2:magicSkill("cold2","コールドⅡ","🧊",15,"enemyAll","ice","C"),
    endCold:magicSkill("endCold","エンドコールド","🧊",40,"enemyAll","ice","S"),

    // Thunder trades damage for Shock. Shock uses thunder resistance and cannot be duration-refreshed.
    petitThunder:magicSkill("petitThunder","プチサンダー","⚡",6,"enemy","thunder","E",{rankMultiplier:.55,shockRate:.40,desc:"敵1体に雷属性の魔法ダメージ。感電させることがある"}),
    thunder:magicSkill("thunder","サンダー","⚡",13,"enemyAll","thunder","D",{rankMultiplier:.80,shockRate:.40,desc:"敵全体に雷属性の魔法ダメージ。感電させることがある"}),
    gigaThunder:magicSkill("gigaThunder","ギガサンダー","⚡",27,"enemyAll","thunder","B",{rankMultiplier:1.30,shockRate:.45,desc:"敵全体に雷属性の魔法ダメージ。感電させることがある"}),
    heavenlyThunder:magicSkill("heavenlyThunder","天の轟雷","⚡",65,"enemyAll","thunder","S",{shockRate:.50,desc:"敵全体に雷属性の魔法ダメージ。感電させることがある"}),

    stone:magicSkill("stone","ストーン","🪨",4,"enemy","earth","E"),
    quake:magicSkill("quake","クエイク","🪨",10,"enemyAll","earth","D"),
    gigaQuake:magicSkill("gigaQuake","ギガクエイク","🪨",21,"enemyAll","earth","B"),
    earthWrath:magicSkill("earthWrath","大地の怒り","🪨",40,"enemyAll","earth","S"),

    sonic:magicSkill("sonic","ソニック","🌪️",4,"enemy","wind","E"),
    wind:magicSkill("wind","ウィンド","🌪️",10,"enemyAll","wind","D"),
    gigaWind:magicSkill("gigaWind","ギガウィンド","🌪️",21,"enemyAll","wind","B"),
    annihilationWindBlade:magicSkill("annihilationWindBlade","殲滅の風刃","🌪️",40,"enemyAll","wind","S"),

    holy:magicSkill("holy","ホーリー","✨",10,"enemy","light","C"),
    gigaHoly:magicSkill("gigaHoly","ギガホーリー","✨",18,"enemy","light","A"),
    judgmentLance:magicSkill("judgmentLance","裁きの聖槍","✨",28,"enemy","light","S"),
    heavenlyLight:magicSkill("heavenlyLight","天の光","🌟",15,"enemyAll","light","C"),
    bigBang:magicSkill("bigBang","ビッグバン","🌟",40,"enemyAll","light","S"),

    dark:magicSkill("dark","ダーク","🌑",10,"enemy","dark","C"),
    gigaDark:magicSkill("gigaDark","ギガダーク","🌑",18,"enemy","dark","A"),
    finalDarkHammer:magicSkill("finalDarkHammer","終焉の闇槌","🌑",28,"enemy","dark","S"),
    hellDark:magicSkill("hellDark","獄の闇","🌘",15,"enemyAll","dark","C"),
    apocalypse:magicSkill("apocalypse","アポカリプス","🌘",40,"enemyAll","dark","S"),

    // Pleasure has a wider resistance curve: E175/D140/C100/B65/A35/S15%.
    touch:magicSkill("touch","タッチ","💗",4,"enemy","pleasure","E"),
    pleasure:magicSkill("pleasure","プレジャー","💗",10,"enemyAll","pleasure","D"),
    gigaPleasure:magicSkill("gigaPleasure","ギガプレジャー","💗",24,"enemyAll","pleasure","B",{rankMultiplier:2.00}),
    megidoPleasure:magicSkill("megidoPleasure","メギドプレジャー","💗",40,"enemyAll","pleasure","S"),
    pleasureOne:magicSkill("pleasureOne","プレジャー・ワン","💗",18,"enemy","pleasure","A"),

    // Erode series: extreme gamble. The lower bound stays at 1% even at high rank.
    erode:magicSkill("erode","イロード","🎲",15,"enemyAll",null,"C",{gambleRange:[.01,2.20],desc:"敵全体に無属性ダメージ。威力が大きく変動する"}),
    gigaErode:magicSkill("gigaErode","ギガイロード","🎲",27,"enemyAll",null,"A",{gambleRange:[.01,2.40],desc:"敵全体に無属性ダメージ。威力が大きく変動する"}),
    lastErode:magicSkill("lastErode","ラストイロード","🎲",40,"enemyAll",null,"S",{gambleRange:[.01,2.60],desc:"敵全体に無属性ダメージ。威力が大きく変動する"}),
    ruinErosion:magicSkill("ruinErosion","破滅の侵蝕","🎲",28,"enemy",null,"S",{gambleRange:[.01,3.00],desc:"敵1体に無属性ダメージ。威力が大きく変動する"}),

    poison:statusSkill("poison","ポイズン","☠️",5,"enemy","poison",STATUS_BASE_RATE.single),
    neoPoison:statusSkill("neoPoison","ネオポイズン","☠️",10,"enemyAll","poison",STATUS_BASE_RATE.all),
    blind:statusSkill("blind","ブラインド","🌫️",5,"enemy","blind",STATUS_BASE_RATE.single),
    neoBlind:statusSkill("neoBlind","ネオブラインド","🌫️",10,"enemyAll","blind",STATUS_BASE_RATE.all),
    silence:statusSkill("silence","サイレンス","🔇",5,"enemy","silence",STATUS_BASE_RATE.single),
    neoSilence:statusSkill("neoSilence","ネオサイレンス","🔇",10,"enemyAll","silence",STATUS_BASE_RATE.all),
    death:statusSkill("death","デス","☠️",12,"enemy","death",STATUS_BASE_RATE.deathSingle),
    allDeath:statusSkill("allDeath","オールデス","☠️",24,"enemyAll","death",STATUS_BASE_RATE.deathAll),
    eraser:{id:"eraser",name:"イレイザー",icon:"🫧",cost:15,target:"enemyAll",kind:"dispel",desc:"敵全体のバフ・強化状態をすべて解除する"},

    tackle:{
      id:"tackle",name:"体当たり",icon:"💥",cost:4,target:"enemy",
      desc:"敵1体に物理ダメージ。使用後、自身に反動ダメージ",kind:"physical",power:1.50,recoilRate:.10,animation:"impact"
    },

    // Physical passives. These never appear as selectable battle commands.
    counterStance:{id:"counterStance",name:"カウンタースタンス",icon:"↩️",cost:0,target:"passive",kind:"passive",battleUse:false,chance:.20,desc:"物理攻撃を受けた時、一定確率で通常攻撃による反撃を行う"},
    doubleAttack:{id:"doubleAttack",name:"連続攻撃",icon:"⚔️",cost:0,target:"passive",kind:"passive",battleUse:false,chance:.15,desc:"通常攻撃後、一定確率でもう一度だけ通常攻撃する"},
    autoFresh:{id:"autoFresh",name:"オートフレッシュ",icon:"✨",cost:0,target:"passive",kind:"passive",battleUse:false,chance:.20,desc:"ターン終了時、一定確率で自身の状態異常を全て解除する"},
    canceller:{id:"canceller",name:"キャンセラー",icon:"🚫",cost:0,target:"passive",kind:"passive",battleUse:false,chance:.08,desc:"敵の魔法を受ける時、まれにダメージと効果を完全無効化する"},
    unyieldingHeart:{id:"unyieldingHeart",name:"不屈の心",icon:"❤️‍🔥",cost:0,target:"passive",kind:"passive",battleUse:false,desc:"戦闘勝利時、自身が戦闘不能ならHP1で復活"},

    // Charge skills stack multiplicatively with ordinary stat buffs. MP costs are provisional until separately finalized.
    powerCharge:{id:"powerCharge",name:"パワーチャージ",icon:"💪",cost:8,target:"self",kind:"charge",chargeStat:"atk",multiplier:2.00,duration:2,provisionalCost:true,desc:"次のターン終了時まで自身の攻撃力を上げる"},
    magicConcentration:{id:"magicConcentration",name:"魔力集中",icon:"🧠",cost:8,target:"self",kind:"charge",chargeStat:"magic",multiplier:2.00,duration:2,provisionalCost:true,desc:"次のターン終了時まで自身の魔力を上げる"},

    // Weapon-exclusive techniques.
    explosiveFist:{id:"explosiveFist",name:"爆裂拳",icon:"🥊",cost:24,target:"enemyRandom",kind:"multiPhysical",requiredWeaponTypes:["fist"],hits:5,hitPower:.60,canCrit:true,desc:"拳専用技。ランダムな敵に物理ダメージ。これを5回繰り返す"},
    swordDance:{id:"swordDance",name:"剣の舞",icon:"🗡️",cost:24,target:"enemyRandom",kind:"multiPhysical",requiredWeaponTypes:["sword"],hits:4,hitPower:.75,canCrit:true,desc:"剣専用技。ランダムな敵に物理ダメージ。これを4回繰り返す"},
    terraCrash:{id:"terraCrash",name:"テラクラッシュ",icon:"🪓",cost:20,target:"enemy",kind:"physicalSpecial",requiredWeaponTypes:["axe","hammer"],power:1.50,forceCrit:true,canCrit:true,animation:"heavy",fxSymbol:"💥",desc:"斧・槌専用技。敵1体に物理ダメージ。必ず会心"},
    stardust:{id:"stardust",name:"スターダスト",icon:"🏹",cost:24,target:"enemy",kind:"physicalSpecial",requiredWeaponTypes:["bow"],power:2.20,canCrit:true,dispelOnHit:true,animation:"arrow",fxSymbol:"✨",desc:"弓専用技。敵1体に物理ダメージ。バフを全て解除する"},
    magicBarrier:{id:"magicBarrier",name:"魔力障壁",icon:"🪄",cost:38,target:"allyAll",kind:"magicBarrier",requiredWeaponTypes:["staff"],reduction:.60,duration:2,priority:"defense",desc:"杖専用技。次のターンまで味方全員の魔法耐性を上げる"},
    dragonSpiral:{id:"dragonSpiral",name:"龍螺旋",icon:"➰",cost:24,target:"enemyRandom",kind:"multiPhysical",requiredWeaponTypes:["whip"],hits:6,hitPower:.50,canCrit:true,desc:"鞭専用技。ランダムな敵に物理ダメージ。これを6回繰り返す"},
    nephilimLaser:{id:"nephilimLaser",name:"ネフィリムレーザー",icon:"🔫",cost:48,target:"enemyAll",kind:"physicalAll",requiredWeaponTypes:["gun"],power:2.20,defenseInfluence:.50,canCrit:false,shockRate:.35,animation:"gun",fxSymbol:"✹",desc:"銃専用技。敵全体に無属性ダメージ。感電させることがある"},

    // Recovery magic. Lower tiers intentionally age out as HP rises.
    heal:{id:"heal",name:"ヒール",icon:"💚",cost:3,target:"ally",fieldUse:"ally",kind:"heal",healBase:25,healMagic:.45,desc:"味方1人のHPを小さく回復",animation:"heal"},
    highHeal:{id:"highHeal",name:"ハイヒール",icon:"💚",cost:7,target:"ally",fieldUse:"ally",kind:"heal",healBase:45,healMagic:.85,desc:"味方1人のHPを回復",animation:"heal"},
    gigaHeal:{id:"gigaHeal",name:"ギガヒール",icon:"💚",cost:12,target:"ally",fieldUse:"ally",kind:"heal",healBase:70,healMagic:1.35,desc:"味方1人のHPを大きく回復",animation:"heal"},
    lastHeal:{id:"lastHeal",name:"ラストヒール",icon:"💚",cost:21,target:"ally",fieldUse:"ally",kind:"heal",fullHeal:true,desc:"味方1人のHPを全回復",animation:"heal"},
    allHeal:{id:"allHeal",name:"オルヒール",icon:"💚",cost:6,target:"allyAll",fieldUse:"allyAll",kind:"heal",healBase:25,healMagic:.45,healScale:.70,desc:"前列の味方4人のHPを小さく回復",animation:"heal"},
    allHeal2:{id:"allHeal2",name:"オルヒールⅡ",icon:"💚",cost:12,target:"allyAll",fieldUse:"allyAll",kind:"heal",healBase:45,healMagic:.85,healScale:.70,desc:"前列の味方4人のHPを回復",animation:"heal"},
    fairyHeal:{id:"fairyHeal",name:"フェアリーヒール",icon:"🧚",cost:20,target:"allyAll",fieldUse:"allyAll",kind:"heal",healBase:70,healMagic:1.35,healScale:.70,desc:"前列の味方4人のHPを大きく回復",animation:"heal"},
    eternal:{id:"eternal",name:"エターナル",icon:"🌈",cost:46,target:"allyAll",fieldUse:"allyAll",kind:"heal",fullHeal:true,desc:"前列の味方4人のHPを全回復",animation:"heal"},

    raise:{id:"raise",name:"レイズ",icon:"🕊️",cost:8,target:"ally",fieldUse:"allyKO",kind:"revive",revivePercent:.20,desc:"戦闘不能の味方1人を復活"},
    raise2:{id:"raise2",name:"レイズⅡ",icon:"🕊️",cost:20,target:"allyAll",fieldUse:"allyAllKO",kind:"revive",revivePercent:.20,desc:"前列の戦闘不能の味方を全員復活させる"},
    gigaRaise:{id:"gigaRaise",name:"ギガレイズ",icon:"✨",cost:32,target:"ally",fieldUse:"allyKO",kind:"revive",revivePercent:1,desc:"戦闘不能の味方1人をHP全回復で復活"},
    miracleFestival:{id:"miracleFestival",name:"奇跡の祝祭",icon:"🌟",cost:110,target:"allyAll",kind:"revive",revivePercent:1,fullPartyHeal:true,desc:"前列の戦闘不能の味方を全員復活させ、前列の味方4人のHPを全回復する"},

    cure:{id:"cure",name:"キュア",icon:"🌿",cost:4,target:"ally",fieldUse:"allyCleanse",kind:"cleanse",statuses:["poison"],desc:"味方1人の毒を解除"},
    fresh:{id:"fresh",name:"フレッシュ",icon:"✨",cost:11,target:"ally",fieldUse:"allyCleanse",kind:"cleanse",allStatus:true,desc:"味方1人の状態異常をすべて解除"},
    allFresh:{id:"allFresh",name:"オールフレッシュ",icon:"✨",cost:22,target:"allyAll",fieldUse:"allyAllCleanse",kind:"cleanse",allStatus:true,desc:"前列の味方4人の状態異常をすべて解除"},

    mount:{id:"mount",name:"マウント",icon:"🛡️",cost:15,target:"ally",kind:"barrier",barrier:"mount",desc:"味方1人に、状態異常を1回無効化するマウントを付与"},
    allMount:{id:"allMount",name:"オールマウント",icon:"🛡️",cost:38,target:"allyAll",kind:"barrier",barrier:"mount",desc:"味方全員に、状態異常を1回無効化するマウントを付与"},
    aura:{id:"aura",name:"オーラ",icon:"🔮",cost:18,target:"ally",kind:"barrier",barrier:"aura",desc:"味方1人に、敵の魔法を1回完全無効化するオーラを付与"},
    lastAura:{id:"lastAura",name:"ラストオーラ",icon:"🔮",cost:45,target:"allyAll",kind:"barrier",barrier:"aura",desc:"味方全員に、敵の魔法を1回完全無効化するオーラを付与"},

    // Standard buffs: 1.30x for 5 rounds. Ultimate buffs: 1.50x for 4 rounds.
    polish:{id:"polish",name:"ポリッシュ",icon:"✨",cost:6,target:"ally",kind:"buff",buff:"atk",multiplier:1.30,duration:5,desc:"味方1人の攻撃力を一時的に上げる",animation:"buff"},
    allPolish:{id:"allPolish",name:"オールポリッシュ",icon:"✨",cost:14,target:"allyAll",kind:"buff",buff:"atk",multiplier:1.30,duration:5,desc:"味方全員の攻撃力を一時的に上げる",animation:"buff"},
    warGodAura:{id:"warGodAura",name:"戦神の覇気",icon:"🔥",cost:21,target:"allyAll",kind:"buff",buff:"atk",multiplier:1.50,duration:4,desc:"味方全員の攻撃力を一時的に大幅に上げる",animation:"buff"},
    guard:{id:"guard",name:"ガード",icon:"🛡️",cost:6,target:"ally",kind:"buff",buff:"def",multiplier:1.30,duration:5,desc:"味方1人の防御力を一時的に上げる",animation:"buff"},
    allGuard:{id:"allGuard",name:"オールガード",icon:"🛡️",cost:14,target:"allyAll",kind:"buff",buff:"def",multiplier:1.30,duration:5,desc:"味方全員の防御力を一時的に上げる",animation:"buff"},
    guardianBlessing:{id:"guardianBlessing",name:"守護神の加護",icon:"🛡️",cost:21,target:"allyAll",kind:"buff",buff:"def",multiplier:1.50,duration:4,desc:"味方全員の防御力を一時的に大幅に上げる",animation:"buff"},
    magic:{id:"magic",name:"マジック",icon:"🔷",cost:6,target:"ally",kind:"buff",buff:"magic",multiplier:1.30,duration:5,desc:"味方1人の魔力を一時的に上げる",animation:"buff"},
    allMagic:{id:"allMagic",name:"オールマジック",icon:"🔷",cost:14,target:"allyAll",kind:"buff",buff:"magic",multiplier:1.30,duration:5,desc:"味方全員の魔力を一時的に上げる",animation:"buff"},
    demonSpiritFlow:{id:"demonSpiritFlow",name:"魔祖の霊流",icon:"🔷",cost:21,target:"allyAll",kind:"buff",buff:"magic",multiplier:1.50,duration:4,desc:"味方全員の魔力を一時的に大幅に上げる",animation:"buff"},
    block:{id:"block",name:"ブロック",icon:"🔶",cost:6,target:"ally",kind:"buff",buff:"mdef",multiplier:1.30,duration:5,desc:"味方1人の魔法防御力を一時的に上げる",animation:"buff"},
    allBlock:{id:"allBlock",name:"オールブロック",icon:"🔶",cost:14,target:"allyAll",kind:"buff",buff:"mdef",multiplier:1.30,duration:5,desc:"味方全員の魔法防御力を一時的に上げる",animation:"buff"},
    spiritKingBlessing:{id:"spiritKingBlessing",name:"精霊王の祝福",icon:"🔶",cost:21,target:"allyAll",kind:"buff",buff:"mdef",multiplier:1.50,duration:4,desc:"味方全員の魔法防御力を一時的に大幅に上げる",animation:"buff"},
    quick:{id:"quick",name:"クイック",icon:"💨",cost:6,target:"ally",kind:"buff",buff:"spd",multiplier:1.30,duration:5,desc:"味方1人の素早さを一時的に上げる",animation:"buff"},
    allQuick:{id:"allQuick",name:"オールクイック",icon:"💨",cost:14,target:"allyAll",kind:"buff",buff:"spd",multiplier:1.30,duration:5,desc:"味方全員の素早さを一時的に上げる",animation:"buff"},
    heroicTailwind:{id:"heroicTailwind",name:"英雄の追風",icon:"💨",cost:21,target:"allyAll",kind:"buff",buff:"spd",multiplier:1.50,duration:4,desc:"味方全員の素早さを一時的に大幅に上げる",animation:"buff"},

    berserk:{id:"berserk",name:"バーサーク",icon:"💢",cost:15,target:"self",kind:"berserk",multiplier:1.60,duration:5,desc:"自身を一時的に狂乱状態にする"},
    fortune:{id:"fortune",name:"フォーチュン",icon:"🍀",cost:50,target:"self",kind:"fortune",desc:"敵が仲間になる確率を上昇させる"},
    escape:{id:"escape",name:"エスケープ",icon:"🏃",cost:48,target:"self",kind:"escape",desc:"通常戦闘から100%逃走する"},
    supply:{id:"supply",name:"サプライ",icon:"🔹",cost:80,target:"ally",fieldUse:"allyMP",kind:"mpTransfer",restoreMp:80,desc:"自身のMPを味方1人に譲渡する"},
    neoSupply:{id:"neoSupply",name:"ネオサプライ",icon:"💠",cost:200,target:"allyAll",fieldUse:"frontAllMP",kind:"mpTransfer",restoreMp:50,desc:"自身のMPを前列の味方4人に譲渡する"},
    stealth:{id:"stealth",name:"ステルス",icon:"🥷",cost:30,target:"none",fieldUse:"stealth",battleUse:false,kind:"stealth",successRate:.35,desc:"マップ上の戦闘マスを一定確率で消滅させる"},
    return:{id:"return",name:"リターン",icon:"🌀",cost:8,target:"none",fieldUse:"return",battleUse:false,kind:"return",desc:"探索を終了してミレスタへ帰還する"}

  };

  // v0.34q: keep menu skill icons consistent by role / element; battle FX uses fxSymbol separately.
  const SKILL_ELEMENT_ICONS={fire:"🔴",ice:"🔵",thunder:"🟡",earth:"🟤",wind:"🟢",light:"⚪",dark:"🟣",pleasure:"🩷"};
  function unifiedSkillIcon(sk){
    if(!sk) return "🔹";
    if(sk.kind==="heal" || sk.kind==="cleanse") return "💚";
    if(sk.kind==="revive") return "✨";
    if(sk.kind==="magic") return SKILL_ELEMENT_ICONS[sk.element] || "⚫";
    if(sk.kind==="status") return "🟣";
    if(sk.kind==="dispel") return "⚪";
    if(["buff","barrier","charge","magicBarrier","mpTransfer","fortune","stealth","return","escape","berserk"].includes(sk.kind)) return "🔹";
    if(["physical","multiPhysical","physicalSpecial","physicalAll"].includes(sk.kind)) return "🟠";
    if(sk.kind==="passive") return "🔸";
    return sk.icon || "🔹";
  }
  Object.values(skills).forEach(sk=>{sk.icon=unifiedSkillIcon(sk);});

  // v0.20: the full future plan lives in characterProfiles. Only implemented skills are activated for now.
  const levelSkillTable = {
    hero:{1:["fire"],2:["heal"],6:["blaze"],12:["death"],16:["flare"],19:["allMagic"],24:["heavenlyLight"],28:["pleasureOne"],32:["lastHeal"],37:["gigaRaise"],41:["allDeath"],50:["heroicTailwind"],60:["endBlaze"],75:["canceller"]},
    slime:{2:["tackle"],8:["guard"],11:["cold"],25:["allGuard"],32:["raise2"],44:["allMount"],70:["lastAura"]},
    dog:{4:["polish"],6:["cure"],21:["allQuick"],33:["counterStance"],55:["doubleAttack"]},
    fairy:{1:["heal"],3:["ice"],12:["wind"],18:["highHeal"],30:["gigaFrost"],36:["fairyHeal"],65:["endCold"],84:["eternal"]},
    slug:{1:["cure"],15:["raise"],38:["stealth"],51:["guardianBlessing"]},
    momo:{1:["heal"],4:["allHeal"],18:["allHeal2"],25:["allBlock"],41:["fairyHeal"],50:["gigaRaise"]},
    arachne:{2:["poison"],5:["touch"],14:["dark"],16:["allQuick"],29:["gigaPleasure"],36:["gigaDark"],42:["eraser"]},
    slimebes:{6:["silence"],11:["blaze"],31:["fresh"],40:["counterStance"],57:["unyieldingHeart"]},
    harpy:{3:["sonic"],10:["allHeal"],13:["wind"],24:["return"],36:["gigaWind"],41:["aura"],84:["annihilationWindBlade"]},
    alraune:{1:["heal"],4:["stone"],10:["fresh"],18:["raise"],27:["allHeal2"],34:["gigaQuake"],43:["allMount"],51:["lastHeal"]},
    rabbit:{3:["touch"],6:["quick"],11:["death"],18:["erode"],22:["pleasure"],33:["escape"],41:["heroicTailwind"],50:["gigaErode"],76:["megidoPleasure"]},
    demon:{1:["petitThunder"],5:["magicConcentration"],8:["blaze"],12:["raise"],15:["thunder"],23:["flare"],32:["allMagic"],46:["magicBarrier"]},
    golem:{10:["guard"],38:["terraCrash"],42:["counterStance"]},
    elf:{2:["silence"],9:["highHeal"],16:["thunder"],21:["holy"],33:["raise2"],37:["gigaHoly"],45:["stardust"]},
    sylph:{1:["heal"],5:["wind"],10:["block"],17:["allHeal2"],26:["allPolish"],33:["gigaWind"],41:["heroicTailwind"],57:["annihilationWindBlade"]},
    owl:{4:["blind"],9:["polish"],16:["dark"],24:["neoBlind"],35:["explosiveFist"],43:["stealth"],55:["finalDarkHammer"]},
    moth:{3:["allHeal"],6:["silence"],12:["quake"],21:["fresh"],28:["allBlock"],36:["gigaQuake"],41:["supply"],54:["allMount"]},
    forestMage:{3:["stone"],6:["highHeal"],15:["holy"],31:["fairyHeal"],34:["gigaQuake"],40:["gigaRaise"],48:["stardust"],60:["judgmentLance"]},
    silverSlime:{1:["cold"],8:["return"],12:["wind"],21:["raise2"],34:["gigaWind"],39:["eraser"],45:["gigaFrost"],61:["unyieldingHeart"]},
    maidDevil:{3:["polish"],6:["guard"],9:["quick"],18:["allHeal2"],26:["hellDark"],39:["lastHeal"],47:["demonSpiritFlow"],54:["allMount"]},
    lamia:{3:["powerCharge"],8:["cure"],17:["allPolish"],30:["counterStance"],42:["terraCrash"]},
    poison:{1:["poison"],7:["blaze"],15:["neoPoison"],26:["neoBlind"],43:["allDeath"]},
    poisonArachne:{1:["poison"],10:["dark"],15:["neoPoison"],23:["cold2"],34:["pleasureOne"],42:["aura"],50:["escape"]},
    ghost:{1:["fire"],10:["pleasure"],17:["allHeal2"],25:["blaze2"],31:["allBlock"],43:["pleasureOne"],48:["demonSpiritFlow"]},
    madGolem:{2:["stone"],9:["cure"],20:["allBlock"],29:["gigaQuake"],44:["doubleAttack"]},
    scylla:{1:["touch"],12:["pleasure"],20:["eraser"],31:["aura"],37:["gigaPleasure"],42:["dragonSpiral"]},
    mimic:{2:["cold"],8:["death"],15:["raise"],22:["erode"],29:["allMagic"],36:["pleasureOne"],45:["gigaErode"],51:["berserk"]},
    podalge:{1:["wind"],6:["blind"],12:["flare"],17:["allHeal2"],29:["allMagic"],38:["gigaWind"],45:["allFresh"],56:["lastFlare"]},
    mermaid:{3:["highHeal"],10:["wind"],14:["frost"],19:["allHeal2"],27:["mount"],34:["gigaFrost"],39:["gigaWind"],53:["fortune"]},
    kitsune:{1:["stone"],7:["allHeal"],13:["quake"],22:["eraser"],35:["gigaQuake"],41:["lastHeal"],47:["demonSpiritFlow"],59:["allMount"]},
    lloyd:{1:["highHeal"],10:["allHeal2"],35:["lastHeal"],50:["canceller"]},
    dogu:{1:["holy"],8:["neoSilence"],15:["fresh"],18:["heavenlyLight"],24:["death"],33:["gigaHoly"],41:["allDeath"],48:["guardianBlessing"]},
    desertDog:{1:["blaze"],13:["fresh"],25:["allPolish"],32:["raise2"],39:["explosiveFist"],48:["allFresh"]},
    hotSandTentacle:{2:["cure"],9:["quake"],17:["eraser"],26:["gigaHeal"],34:["gigaQuake"],43:["allDeath"]},
    prominence:{1:["blaze"],5:["flare"],17:["blaze2"],25:["allBlock"],32:["gigaFlare"],38:["explosiveFist"],54:["lastFlare"],68:["endBlaze"]},
    magmaSlug:{1:["flare"],8:["polish"],16:["raise"],29:["gigaFlare"],36:["blaze2"],43:["terraCrash"],51:["lastFlare"]},
    scorpion:{1:["eraser"],12:["thunder"],25:["mount"],34:["explosiveFist"],42:["allDeath"],66:["doubleAttack"]},
    dragon:{8:["wind"],15:["flare"],24:["allHeal2"],35:["gigaWind"],43:["lastHeal"],56:["lastFlare"]},
    karen:{1:["powerCharge","quake"],17:["allBlock"],20:["return"],27:["mount"],32:["counterStance"],40:["fortune"],45:["gigaQuake"],51:["berserk"],63:["earthWrath"]}
  };

  function skillsLearnedAtLevel(c,level){
    return levelSkillTable[c.id]?.[level] || [];
  }

  function learnSkillsForLevel(c,level){
    const learned=[];
    skillsLearnedAtLevel(c,level).forEach(skillId=>{
      if(!c.learnedSkills.includes(skillId)){
        c.learnedSkills.push(skillId);
        learned.push(skillId);
      }
    });
    return learned;
  }

  const initialLearnedSkills = Object.fromEntries(
    Object.entries(roster).map(([id,c])=>[id,[...(c.learnedSkills||[])]])
  );

  const initialStats = Object.fromEntries(
    Object.entries(roster).map(([id,c])=>[id,{...c.stats}])
  );

  // All currently registered playable characters use formal Lv1 / Lv100 profile growth.
  const characterGrowth = {};

  Object.values(roster).forEach(c=>{
    c.level=c.fixedLevel||1;
    c.exp=0;
    c.growth=characterGrowth[c.id] || null;
    c.seedBonus={hpMax:0,mpMax:0,atk:0,def:0,magic:0,mdef:0,spd:0,fate:0};
  });

  function seedBonusOf(c){
    if(!c.seedBonus) c.seedBonus={hpMax:0,mpMax:0,atk:0,def:0,magic:0,mdef:0,spd:0,fate:0};
    return c.seedBonus;
  }

  function profileFor(cOrId){
    const id=typeof cOrId==="string" ? cOrId : cOrId?.profileId || cOrId?.id;
    return characterProfiles[id] || null;
  }
  function characterIsMonsterGirl(cOrId){
    const profile=profileFor(cOrId);
    if(typeof profile?.isMonsterGirl==="boolean") return profile.isMonsterGirl;
    return !!profile?.recruitRank;
  }
  function travelingWithMonsterGirl(){
    return travelPartyIds().some(id=>characterIsMonsterGirl(roster[id]));
  }

  function rebuildFormalCharacterStats(c,{fullHeal=false,preserveDeficit=true}={}){
    const profile=profileFor(c);
    if(!c || !profile) return false;
    const variation=ensureCharacterFinalVariation(c);
    const old={...S(c)};
    const hpDeficit=preserveDeficit?Math.max(0,(Number(old.hpMax)||0)-(Number(old.hp)||0)):0;
    const mpDeficit=preserveDeficit?Math.max(0,(Number(old.mpMax)||0)-(Number(old.mp)||0)):0;
    const base=formalStatsAtLevel(profile,c.level||1,variation);
    const seed=seedBonusOf(c);
    FINAL_STAT_KEYS.forEach(key=>base[key]=(Number(base[key])||0)+(Number(seed[key])||0));
    const next={hp:base.hpMax,hpMax:base.hpMax,mp:base.mpMax,mpMax:base.mpMax,atk:base.atk,def:base.def,magic:base.magic,mdef:base.mdef,spd:base.spd};
    const equip=equipmentStatDelta(c);
    Object.entries(equip).forEach(([k,v])=>{ if(k in next) next[k]+=v; });
    next.hp=fullHeal?next.hpMax:Math.max(0,Math.min(next.hpMax,next.hpMax-hpDeficit));
    next.mp=fullHeal?next.mpMax:Math.max(0,Math.min(next.mpMax,next.mpMax-mpDeficit));
    c.stats=next;
    return true;
  }

  function expNeeded(level,cOrId=null){
    // v0.46c: steeper quadratic EXP curve. Early levels stay approachable,
    // while mid/late-game level-ups require progressively more battles.
    const n=Math.max(0,level-1);
    const base=60 + n*55 + n*n*2;
    const profile=profileFor(cOrId);
    const mult=profile ? (EXP_TYPES[profile.expType]?.multiplier || 1) : 1;
    return Math.max(1,Math.round(base*mult));
  }

  function levelUpCharacter(c){
    if(c.level>=MAX_LEVEL) return [];
    const profile=profileFor(c);
    if(profile){
      // Percent equipment depends on the level-scaled base stats. Rebuilding from the equipped
      // effective values preserves the current HP/MP deficit and guarantees current <= max.
      c.level++;
      rebuildFormalCharacterStats(c,{fullHeal:false,preserveDeficit:true});
    }else{
      const old=S(c);
      c.level++;
      const g=c.growth || {hp:7,mp:2,atk:2,def:1,magic:1,mdef:1,spd:1};
      old.hpMax+=g.hp; old.hp=Math.min(old.hpMax,old.hp+g.hp);
      old.mpMax+=g.mp; old.mp=Math.min(old.mpMax,old.mp+g.mp);
      old.atk+=g.atk; old.def+=g.def; old.magic+=g.magic; old.mdef+=g.mdef; old.spd+=g.spd;
    }
    return learnSkillsForLevel(c,c.level);
  }

  function travelPartyIds(){
    return [...new Set([...state.battleActive,...state.battleReserve])];
  }

  // v0.44r condition container. Poison persists between battles during exploration; other battle-only conditions clear when battle ends.
  function conditionsOf(c){
    if(!c.conditions) c.conditions={poison:false,blind:false,silence:false,shock:false,berserk:false,mount:false,aura:false};
    return c.conditions;
  }

  function clearBattleOnlyStates(c,{preservePoison=false}={}){
    if(!c) return;
    c.defending=false;
    c.atkBuff=1;c.atkBuffRounds=0;
    c.defBuff=1;c.defBuffRounds=0;
    c.magicBuff=1;c.magicBuffRounds=0;
    c.mdefBuff=1;c.mdefBuffRounds=0;
    c.spdBuff=1;c.spdBuffRounds=0;
    c.powerChargeMultiplier=1;c.powerChargeRounds=0;
    c.magicConcentrationMultiplier=1;c.magicConcentrationRounds=0;
    c.magicBarrierRounds=0;
    c.magicBarrierReduction=0;
    c._usedHealingMagicThisRound=false;
    c._maidGiftTriggeredThisBattle=false;
    c._foxTrickeryUsedThisBattle=false;
    c.shockRecoverFails=0;
    c.berserkRounds=0;
    const cond=conditionsOf(c);
    Object.keys(cond).forEach(key=>{
      if(key==="poison" && preservePoison) return;
      cond[key]=false;
    });
  }

  function clearBattleEndStates(){
    travelPartyIds().forEach(id=>{
      const c=roster[id]; if(!c) return;
      if(S(c).hp<=0) clearStatesOnKo(c);
      else clearBattleOnlyStates(c,{preservePoison:true});
    });
  }

  // v0.44r: KO immediately removes temporary buffs and every status condition, including poison.
  function clearStatesOnKo(c){
    if(!c || S(c).hp>0) return;
    c.defending=false;
    c.atkBuff=1;c.atkBuffRounds=0;
    c.defBuff=1;c.defBuffRounds=0;
    c.magicBuff=1;c.magicBuffRounds=0;
    c.mdefBuff=1;c.mdefBuffRounds=0;
    c.spdBuff=1;c.spdBuffRounds=0;
    c.powerChargeMultiplier=1;c.powerChargeRounds=0;
    c.magicConcentrationMultiplier=1;c.magicConcentrationRounds=0;
    c.magicBarrierRounds=0;c.magicBarrierReduction=0;
    c.shockRecoverFails=0;c.berserkRounds=0;
    c._usedHealingMagicThisRound=false;
    const cond=conditionsOf(c);
    Object.keys(cond).forEach(key=>{cond[key]=false;});
  }

  function battleStatusEffectMarkup(c){
    const chips=[];
    if(c.defending) chips.push('<span class="status-effect-chip defend">🛡 防御</span>');
    if(c.atkBuffRounds>0) chips.push(`<span class="status-effect-chip buff">ATK↑ ${c.atkBuffRounds}R</span>`);
    if(c.defBuffRounds>0) chips.push(`<span class="status-effect-chip buff">DEF↑ ${c.defBuffRounds}R</span>`);
    if(c.magicBuffRounds>0) chips.push(`<span class="status-effect-chip buff">MAG↑ ${c.magicBuffRounds}R</span>`);
    if(c.mdefBuffRounds>0) chips.push(`<span class="status-effect-chip buff">MDEF↑ ${c.mdefBuffRounds}R</span>`);
    if(c.spdBuffRounds>0) chips.push(`<span class="status-effect-chip buff">SPD↑ ${c.spdBuffRounds}R</span>`);
    if(c.powerChargeRounds>0) chips.push(`<span class="status-effect-chip buff">💪 CHARGE ${c.powerChargeRounds}R</span>`);
    if(c.magicConcentrationRounds>0) chips.push(`<span class="status-effect-chip buff">🧠 FOCUS ${c.magicConcentrationRounds}R</span>`);
    if(c.magicBarrierRounds>0) chips.push(`<span class="status-effect-chip buff">🪄 障壁 ${c.magicBarrierRounds}R</span>`);
    const cond=conditionsOf(c);
    if(cond.poison) chips.push('<span class="status-effect-chip poison">☠ 毒</span>');
    if(cond.blind) chips.push('<span class="status-effect-chip bad">暗闇</span>');
    if(cond.silence) chips.push('<span class="status-effect-chip bad">封印</span>');
    if(cond.shock) chips.push('<span class="status-effect-chip bad">⚡ 感電</span>');
    if(cond.berserk) chips.push(`<span class="status-effect-chip buff">狂乱${c.berserkRounds>0?` ${c.berserkRounds}R`:''}</span>`);
    if(cond.mount) chips.push('<span class="status-effect-chip buff">マウント</span>');
    if(cond.aura) chips.push('<span class="status-effect-chip buff">オーラ</span>');
    return chips.join('');
  }

  function statGrowthDiff(before,after){
    return {
      hpMax:after.hpMax-before.hpMax,
      mpMax:after.mpMax-before.mpMax,
      atk:after.atk-before.atk,
      def:after.def-before.def,
      magic:after.magic-before.magic,
      mdef:after.mdef-before.mdef,
      spd:after.spd-before.spd
    };
  }

  function grantExperienceToCharacter(c,amount,leveled){
    amount=Math.max(0,Math.round(Number(amount)||0));
    if(!c || c.levelLocked || amount<=0) return;
    const oldLevel=c.level;
    const before={...S(c)};
    const learned=[];
    c.exp+=amount;
    let gains=0;
    while(c.level<MAX_LEVEL && c.exp>=expNeeded(c.level,c)){
      c.exp-=expNeeded(c.level,c);
      learned.push(...levelUpCharacter(c));
      gains++;
    }
    if(gains){
      leveled.push({id:c.id,name:c.name,oldLevel,level:c.level,gains,growth:statGrowthDiff(before,S(c)),learned:[...new Set(learned)]});
    }
  }

  function catchUpExpMultiplier(c){
    if(!c || c.id==="hero") return 1;
    const hero=roster.hero;
    if(!hero) return 1;
    const gap=Math.max(0,(Number(hero.level)||1)-(Number(c.level)||1));
    if(gap>=12) return 2.5;
    if(gap>=9) return 2.0;
    if(gap>=6) return 1.5;
    if(gap>=3) return 1.25;
    return 1;
  }

  // v0.46e: characters who outlevel normal enemies receive smoothly reduced EXP.
  // Enemy Lv +2 or less: 100%; +3..+10: -10 points per level; +11:15%, +12:10%, +13+:5%.
  function lowerLevelEnemyExpMultiplier(characterLevel,enemyLevel){
    const cLv=Math.max(1,Number(characterLevel)||1);
    const eLv=Math.max(0,Number(enemyLevel)||0);
    if(eLv<=0) return 1;
    const diff=cLv-eLv;
    if(diff<=2) return 1;
    if(diff===3) return .90;
    if(diff===4) return .80;
    if(diff===5) return .70;
    if(diff===6) return .60;
    if(diff===7) return .50;
    if(diff===8) return .40;
    if(diff===9) return .30;
    if(diff===10) return .20;
    if(diff===11) return .15;
    if(diff===12) return .10;
    return .05;
  }

  function enemyExpDecayApplies(enemy){
    if(!enemy) return false;
    const base=enemyData[enemy.id];
    if(enemy.id==="silverSlime" || enemy.boss || base?.boss) return false;
    return Number(base?.level)>0;
  }

  function battleExpForCharacter(c,rewardEnemies,globalMultiplier=1){
    if(!c) return 0;
    const raw=(rewardEnemies||[]).reduce((sum,enemy)=>{
      const exp=Math.max(0,Number(enemy?.exp)||0);
      if(exp<=0) return sum;
      if(!enemyExpDecayApplies(enemy)) return sum+exp;
      const enemyLevel=Number(enemyData[enemy.id]?.level)||0;
      return sum+exp*lowerLevelEnemyExpMultiplier(c.level,enemyLevel);
    },0);
    return Math.max(0,Math.round(raw*Math.max(0,Number(globalMultiplier)||0)));
  }

  function awardExperience(rewardEnemies,globalMultiplier=1,eligibleIds=null){
    const leveled=[];
    const enemies=Array.isArray(rewardEnemies)?rewardEnemies:[];
    if(!enemies.length) return {leveled,grantedById:new Map(),decayApplied:false};
    const eligible=eligibleIds instanceof Set ? eligibleIds : null;
    const activeIds=[...new Set(state.battleActive)].filter(id=>{
      const c=roster[id];
      if(!c || c.levelLocked) return false;
      if(eligible) return eligible.has(id);
      return S(c).hp>0;
    });
    const recipients=activeIds.filter(id=>!equippedAccessory(roster[id])?.redistributeExp);
    const donors=activeIds.filter(id=>!!equippedAccessory(roster[id])?.redistributeExp);
    const personalBase=new Map(activeIds.map(id=>[id,battleExpForCharacter(roster[id],enemies,globalMultiplier)]));
    const awards=new Map(activeIds.map(id=>[id,equippedAccessory(roster[id])?.redistributeExp?0:(personalBase.get(id)||0)]));

    // 無の光膜：装備者が本来受け取るはずだった（格下補正後の）EXPを、前列の生存・非装備者へ均等分配する。
    const pool=donors.reduce((sum,id)=>sum+(personalBase.get(id)||0),0);
    if(pool>0 && recipients.length){
      const each=Math.floor(pool/recipients.length),remainder=pool%recipients.length;
      recipients.forEach((id,index)=>awards.set(id,(awards.get(id)||0)+each+(index<remainder?1:0)));
    }

    const grantedById=new Map();
    // 個人EXP倍率と主人公とのレベル差による追いつき補正は、格下補正・分配後に適用する。
    recipients.forEach(id=>{
      const c=roster[id];
      const equipMult=Math.max(0,Number(equippedAccessory(c)?.expMultiplier)||1);
      const catchUpMult=catchUpExpMultiplier(c);
      const grant=Math.max(0,Math.round((awards.get(id)||0)*equipMult*catchUpMult));
      grantedById.set(id,grant);
      grantExperienceToCharacter(c,grant,leveled);
    });
    donors.forEach(id=>grantedById.set(id,0));

    // 控えEXP装備。戦闘不能中の控えには入らない。格下補正は控え本人のLvで判定する。
    [...new Set(state.battleReserve)].forEach(id=>{
      if(activeIds.includes(id)) return;
      const c=roster[id]; if(!c || c.levelLocked || S(c).hp<=0) return;
      const rate=Math.max(0,Number(equippedAccessory(c)?.reserveExpRate)||0);
      if(rate>0){
        const grant=Math.max(0,Math.round(battleExpForCharacter(c,enemies,globalMultiplier)*rate));
        grantedById.set(id,grant);
        grantExperienceToCharacter(c,grant,leveled);
      }
    });

    const decayApplied=[...activeIds,...new Set(state.battleReserve)].some(id=>{
      const c=roster[id];
      if(!c) return false;
      return enemies.some(enemy=>enemyExpDecayApplies(enemy) && lowerLevelEnemyExpMultiplier(c.level,enemyData[enemy.id]?.level)<1);
    });
    return {leveled,grantedById,decayApplied};
  }

  function restorePartyFull(){
    Object.values(roster).forEach(c=>{
      const st=S(c);
      st.hp=st.hpMax;
      st.mp=st.mpMax;
      clearBattleOnlyStates(c,{preservePoison:false});
    });
  }
  function restoreTravelPartyFull(){
    travelPartyIds().forEach(id=>{
      const c=roster[id];if(!c)return;
      const st=S(c);
      st.hp=st.hpMax;
      st.mp=st.mpMax;
      clearBattleOnlyStates(c,{preservePoison:false});
    });
  }

  function recoverTravelParty(hpRate=.50,mpRate=.40){
    let hpGain=0,mpGain=0;
    travelPartyIds().forEach(id=>{
      const c=roster[id],st=S(c);
      if(st.hp<=0) return;
      const oldHp=st.hp,oldMp=st.mp;
      st.hp=Math.min(st.hpMax,st.hp+Math.floor(st.hpMax*hpRate));
      st.mp=Math.min(st.mpMax,st.mp+Math.floor(st.mpMax*mpRate));
      hpGain+=st.hp-oldHp;
      mpGain+=st.mp-oldMp;
    });
    return {hpGain,mpGain};
  }

  function snapshotPartyState(){
    return {
      active:[...state.battleActive],
      reserve:[...state.battleReserve],
      items:{...(state.items||{})},
      roster:Object.fromEntries(Object.entries(roster).map(([id,c])=>[id,{
        stats:{...c.stats},
        level:c.level,
        exp:c.exp,
        fate:c.fate,
        finalVariation:c.finalVariation?{...c.finalVariation}:null,
        seedBonus:{...seedBonusOf(c)},
        learnedSkills:[...(c.learnedSkills||[])],
        atkBuff:c.atkBuff,
        atkBuffRounds:c.atkBuffRounds,
        defBuff:c.defBuff,defBuffRounds:c.defBuffRounds,
        magicBuff:c.magicBuff,magicBuffRounds:c.magicBuffRounds,
        mdefBuff:c.mdefBuff,mdefBuffRounds:c.mdefBuffRounds,
        spdBuff:c.spdBuff,spdBuffRounds:c.spdBuffRounds,
        defending:!!c.defending,
        conditions:{...conditionsOf(c)},
        desertDogPolishPending:!!c._desertDogPolishPending
      }]))
    };
  }

  function restorePartySnapshot(snapshot){
    if(!snapshot) return;
    state.battleActive=[...snapshot.active];
    state.battleReserve=[...snapshot.reserve];
    if(snapshot.items) state.items={...snapshot.items};
    Object.entries(snapshot.roster).forEach(([id,s])=>{
      const c=roster[id];
      if(!c) return;
      c.stats={...s.stats};
      c.level=s.level;
      c.exp=s.exp;
      if(Number.isFinite(s.fate)) c.fate=s.fate;
      c.finalVariation=s.finalVariation?{...s.finalVariation}:c.finalVariation||null;
      c.seedBonus={...seedBonusOf(c),...(s.seedBonus||{})};
      c.learnedSkills=[...(s.learnedSkills||initialLearnedSkills[id]||[])];
      c.atkBuff=s.atkBuff??1;
      c.atkBuffRounds=s.atkBuffRounds??0;
      c.defBuff=s.defBuff??1;c.defBuffRounds=s.defBuffRounds??0;
      c.magicBuff=s.magicBuff??1;c.magicBuffRounds=s.magicBuffRounds??0;
      c.mdefBuff=s.mdefBuff??1;c.mdefBuffRounds=s.mdefBuffRounds??0;
      c.spdBuff=s.spdBuff??1;c.spdBuffRounds=s.spdBuffRounds??0;
      c.defending=s.defending;
      c.conditions={...conditionsOf(c),...(s.conditions||{})};
      c._desertDogPolishPending=!!s.desertDogPolishPending;
    });
  }

  // v0.34q save / load foundation. Manual saves are currently allowed only in Milesta.
  function saveSlotKey(slot){ return `${SAVE_KEY_PREFIX}${slot}`; }
  function serializeRun(run){
    if(!run) return null;
    return {
      ...run,
      visited:[...(run.visited||[])],
      resolved:[...(run.resolved||[])],
      diggingChecked:[...(run.diggingChecked||[])]
    };
  }
  function deserializeRun(run){
    if(!run) return null;
    return {
      ...run,
      visited:new Set(run.visited||[]),
      resolved:new Set(run.resolved||[]),
      diggingChecked:new Set(run.diggingChecked||[])
    };
  }
  function capturePersistentState(){
    return {
      heroName:String(roster?.hero?.name||"主人公"),
      gold:state.gold,
      items:{...(state.items||{})},
      travelMerchantMet:!!state.travelMerchantMet,
      limitedShopPurchases:{...(state.limitedShopPurchases||{})},
      limitedMapTreasures:{...(state.limitedMapTreasures||{})},
      caveUnlocked:!!state.caveUnlocked,
      caveBossDefeated:!!state.caveBossDefeated,
      eventFlags:{...(state.eventFlags||{})},
      prologueStage:prologueStage(),
      selectedArea:state.selectedArea||"plains",
      currentTown:normalizeTownKey(state.currentTown),
      run:serializeRun(state.run),
      battleActive:[...state.battleActive],
      battleReserve:[...state.battleReserve],
      ownedSpecies:[...state.ownedSpecies],
      recruitedWaiting:[...(state.recruitedWaiting||[])],
      roster:Object.fromEntries(Object.entries(roster).map(([id,c])=>[id,{
        level:Number(c.level)||1,
        exp:Number(c.exp)||0,
        fate:Number(c.fate)||0,
        stats:{...S(c)},
        finalVariation:c.finalVariation?{...c.finalVariation}:null,
        seedBonus:{...seedBonusOf(c)},
        learnedSkills:[...(c.learnedSkills||[])],
        equipment:{...ensureEquipment(c)},
        conditions:{...conditionsOf(c)},
        desertDogPolishPending:!!c._desertDogPolishPending
      }])),
      equipmentOwnedCounts:{...equipmentOwnedCounts}
    };
  }
  function applyPersistentState(data){
    if(!data) return false;
    const base=initialGameSnapshot?.game||capturePersistentState();
    state.gold=Number.isFinite(Number(data.gold))?Number(data.gold):base.gold;
    state.items={...(base.items||{}),...(data.items||{})};
    state.travelMerchantMet=!!data.travelMerchantMet;
    state.limitedShopPurchases={...(base.limitedShopPurchases||{}),...(data.limitedShopPurchases||{})};
    state.limitedMapTreasures={...(base.limitedMapTreasures||{}),...(data.limitedMapTreasures||{})};
    state.caveUnlocked=!!data.caveUnlocked;
    state.caveBossDefeated=!!data.caveBossDefeated;
    state.eventFlags={...(base.eventFlags||{}),...(data.eventFlags||{})};
    state.prologueStage=Number.isFinite(Number(data.prologueStage)) ? Math.max(0,Number(data.prologueStage)) : (data.eventFlags?.milestaIntroDone ? 4 : Number(base.prologueStage)||0);
    state.storyEventRuntime=null;
    state.selectedArea=data.selectedArea||"plains";
    state.currentTown=normalizeTownKey(data.currentTown||base.currentTown||"milesta");
    state.run=deserializeRun(data.run);
    state.battleActive=Array.isArray(data.battleActive)?data.battleActive.filter(id=>roster[id]).slice(0,4):[...base.battleActive];
    state.battleReserve=Array.isArray(data.battleReserve)?data.battleReserve.filter(id=>roster[id]&&!state.battleActive.includes(id)).slice(0,6):[...base.battleReserve];
    state.ownedSpecies=new Set((data.ownedSpecies||[]).filter(id=>roster[id]&&id!=="hero"&&!roster[id].npcOnly));
    state.recruitedWaiting=[...(data.recruitedWaiting||[])].filter(id=>roster[id]&&id!=="hero"&&!roster[id].npcOnly);

    Object.keys(equipmentOwnedCounts).forEach(id=>equipmentOwnedCounts[id]=0);
    Object.assign(equipmentOwnedCounts,base.equipmentOwnedCounts||{},data.equipmentOwnedCounts||{});
    ["bare","no_shield","no_body","no_accessory"].forEach(id=>equipmentOwnedCounts[id]=999);

    Object.entries(base.roster||{}).forEach(([id,b])=>{
      const c=roster[id]; if(!c) return;
      const r=data.roster?.[id]||b;
      c.level=c.fixedLevel||Number(r.level)||1;
      c.exp=c.levelLocked?0:Math.max(0,Number(r.exp)||0);
      c.fate=Number.isFinite(Number(r.fate))?Number(r.fate):Number(b.fate)||0;
      c.stats={...(b.stats||{}),...(r.stats||{})};
      c.finalVariation=r.finalVariation?{...r.finalVariation}:(b.finalVariation?{...b.finalVariation}:null);
      c.seedBonus={...(b.seedBonus||{}),...(r.seedBonus||{})};
      // Backfill any natural skills added or moved to earlier levels in newer versions.
      // This keeps older saves compatible (e.g. ポイズンスライムのLv1「ポイズン」).
      c.learnedSkills=[...new Set([
        ...(r.learnedSkills||b.learnedSkills||[]),
        ...naturalSkillIdsAtLevel(c,c.level)
      ])];
      reconcileRebalancedNaturalSkills(c);
      c.equipment={...(b.equipment||{}),...(r.equipment||{})};
      // v0.46i migration: older percent-equipment level-ups could leave current HP/MP 1+ above max.
      c.stats.hp=Math.max(0,Math.min(Number(c.stats.hpMax)||1,Number(c.stats.hp)||0));
      c.stats.mp=Math.max(0,Math.min(Number(c.stats.mpMax)||0,Number(c.stats.mp)||0));
      c.conditions={...conditionsOf(c),...(r.conditions||{})};
      c._desertDogPolishPending=!!r.desertDogPolishPending;
      const needsVariationMigration=!!profileFor(c) && !r.finalVariation && (id==="hero" || state.ownedSpecies.has(id));
      if(needsVariationMigration){
        ensureCharacterFinalVariation(c);
        rebuildFormalCharacterStats(c,{fullHeal:false,preserveDeficit:true});
      }
      clearBattleOnlyStates(c,{preservePoison:true});
    });
    if(roster.hero){
      const incomingName=typeof data.heroName==="string"?normalizeHeroName(data.heroName):"";
      roster.hero.name=incomingName||"ロイド";
    }

    // Town saves should always resume from a clean non-battle state.
    state.battleReturn="homeScreen";
    state.battleFromRun=false;
    state.battleDirectTest=false;
    state.battleEnemies=[];
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleEnded=false;
    state.battleAutoContinuous=false;
    state.battleTestSnapshot=null;
    state.devSkillTestSnapshot=null;
    state.pendingRecruitCandidate=null;
    state.battleSpecial=null;
    state.battleEscapeDisabled=false;
    state.fortuneCasts=0;
    state.partySelection=null;
    state.partyWaitingViewOpen=false;
    state.partyManageContext="milesta";
    return true;
  }
  function makeSaveDocument(){
    const game=capturePersistentState();
    // Manual saves are town-only; active exploration is not persisted.
    game.run=null;
    return {
      saveVersion:SAVE_SCHEMA_VERSION,
      appVersion:DEV_VERSION,
      savedAt:new Date().toISOString(),
      location:townDisplayName(state.currentTown),
      game
    };
  }
  function readSaveSlot(slot){
    try{
      const raw=localStorage.getItem(saveSlotKey(slot));
      if(!raw) return null;
      const data=JSON.parse(raw);
      if(!data || !data.game) return null;
      return data;
    }catch(err){
      console.warn("save read failed",slot,err);
      return null;
    }
  }
  function hasAnySave(){
    for(let i=1;i<=SAVE_SLOT_COUNT;i++) if(readSaveSlot(i)) return true;
    return false;
  }
  function formatSaveDate(iso){
    if(!iso) return "日時不明";
    try{return new Date(iso).toLocaleString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});}
    catch(_){return iso;}
  }
  function refreshTitleContinue(){
    const btn=$("titleContinueBtn"); if(btn) btn.disabled=!hasAnySave();
  }
  function closeSaveUi(){ $("saveModal").classList.remove("show"); }
  function setSaveUiMode(mode){
    saveUiMode=mode;
    $("saveTabSave").classList.toggle("active",mode==="save");
    $("saveTabLoad").classList.toggle("active",mode==="load");
    renderSaveSlots();
  }
  function openSaveUi(context="milesta",mode="save"){
    saveUiContext=context;
    saveUiMode=context==="title"?"load":mode;
    const titleOnly=context==="title";
    $("saveTitle").textContent=titleOnly?"つづきから":"セーブ／ロード";
    $("saveDesc").textContent=titleOnly?"ロードするデータを選んでください。":`${townDisplayName(context)}では3つの手動セーブ枠を使用できます。`;
    $("saveTabSave").hidden=titleOnly;
    $("saveTabLoad").hidden=titleOnly;
    $("saveTabs").style.display=titleOnly?"none":"grid";
    $("saveCloseBtn").textContent=titleOnly?"← タイトルへ":"閉じる";
    $("saveModal").classList.add("show");
    setSaveUiMode(saveUiMode);
  }
  function saveSlotSummary(data){
    if(!data) return null;
    const hero=data.game?.roster?.hero||{};
    const friends=(data.game?.ownedSpecies||[]).length;
    const heroName=normalizeHeroName(data.game?.heroName)||"ロイド";
    return {
      title:data.location||"ミレスタ",
      meta:`${heroName} Lv ${hero.level||1}　💰 ${Number(data.game?.gold)||0} G　仲間 ${friends}人`,
      date:formatSaveDate(data.savedAt)
    };
  }
  function savePartyPortraits(data){
    const activeIds=Array.isArray(data?.game?.battleActive)?data.game.battleActive.slice(0,4):[];
    const reserveIds=Array.isArray(data?.game?.battleReserve)?data.game.battleReserve.slice(0,6):[];
    const makeCell=(id,role)=>{
      const c=id?roster[id]:null;
      if(c?.img){
        const displayName=id==="hero"?(normalizeHeroName(data?.game?.heroName)||"ロイド"):(c.name||id);
        const safeName=escapeHtml(displayName);
        return `<span class="save-party-thumb ${role}" title="${safeName}"><img src="${c.img}" alt="${safeName}"></span>`;
      }
      return `<span class="save-party-thumb ${role} empty" title="空き枠"></span>`;
    };
    const activeCells=[];
    const reserveCells=[];
    for(let i=0;i<4;i++) activeCells.push(makeCell(activeIds[i],"active"));
    for(let i=0;i<6;i++) reserveCells.push(makeCell(reserveIds[i],"reserve"));
    return `<div class="save-party-strip" aria-label="保存時の探索メンバー"><div class="save-party-group" aria-label="バトルメンバー">${activeCells.join("")}</div><span class="save-party-divider" aria-hidden="true"></span><div class="save-party-group" aria-label="控えメンバー">${reserveCells.join("")}</div></div>`;
  }

  function renderSaveSlots(){
    const list=$("saveSlotList"); list.innerHTML="";
    for(let slot=1;slot<=SAVE_SLOT_COUNT;slot++){
      const data=readSaveSlot(slot),sum=saveSlotSummary(data);
      const row=document.createElement("div");
      row.className=`save-slot${data?"":" empty"}`;
      row.innerHTML=`<div class="save-slot-index">SLOT ${slot}</div><div class="save-slot-main${data?"":" empty"}">${data?`<div class="save-slot-info"><div class="save-slot-title">${escapeHtml(sum.title)}</div><div class="save-slot-meta">${escapeHtml(sum.meta)}</div><div class="save-slot-date">${escapeHtml(sum.date)}</div></div>${savePartyPortraits(data)}`:`<div class="save-slot-title">EMPTY</div><div class="save-slot-meta">セーブデータはありません。</div>`}</div><div class="save-slot-actions"></div>`;
      const actions=row.querySelector(".save-slot-actions");
      const main=document.createElement("button");
      main.className="primary";
      main.textContent=saveUiMode==="save"?"セーブ":"ロード";
      main.disabled=saveUiMode==="load"&&!data;
      main.onclick=()=>saveUiMode==="save"?requestSaveSlot(slot,data):requestLoadSlot(slot,data);
      actions.appendChild(main);
      if(data){
        const del=document.createElement("button"); del.className="danger"; del.textContent="削除";
        del.onclick=()=>requestDeleteSlot(slot);
        actions.appendChild(del);
      }
      list.appendChild(row);
    }
  }
  function writeSaveSlot(slot){
    try{
      localStorage.setItem(saveSlotKey(slot),JSON.stringify(makeSaveDocument()));
      closeModal();
      renderSaveSlots();
      refreshTitleContinue();
      toast(`SLOT ${slot} にセーブしました。`);
    }catch(err){
      console.error("save failed",err);
      closeModal();
      modal("セーブ失敗","セーブデータを書き込めませんでした。ブラウザの保存領域を確認してください。");
    }
  }
  function requestSaveSlot(slot,existing){
    if(saveUiContext==="title") return;
    if(existing){
      modal("セーブ確認",`SLOT ${slot} のデータに上書きしますか？`,[["上書きする",()=>writeSaveSlot(slot)],["やめる",closeModal]]);
    }else writeSaveSlot(slot);
  }
  function requestLoadSlot(slot,data){
    if(!data) return;
    modal("ロード確認",`SLOT ${slot} のデータをロードしますか？\n現在の未保存の進行状況は失われます。`,[["ロードする",()=>loadSaveSlot(slot)],["やめる",closeModal]]);
  }
  function loadSaveSlot(slot){
    const data=readSaveSlot(slot);
    if(!data){ closeModal(); renderSaveSlots(); return; }
    if(Number(data.saveVersion)>SAVE_SCHEMA_VERSION){
      closeModal(); modal("ロードできません","このセーブデータは、より新しい形式で作成されています。"); return;
    }
    applyPersistentState(data.game);
    if(!data.game?.currentTown) state.currentTown=data.location==="港町ヨーディー"?"yody":data.location==="ティレーノの街"?"tileno":data.location==="グランゼル城下町"?"granzel":data.location==="ルネルの街"?"runel":data.location==="薫風亭"?"kunputei":"milesta";
    if(Number(data.saveVersion)<5 && roster.hero) roster.hero.name="ロイド";
    if(Number(data.saveVersion)<4 && state.caveBossDefeated){
      state.eventFlags.milestaWaitingUnlocked=true;
      state.eventFlags.caveSidepathUnlocked=true;
      state.eventFlags.prologueComplete=true;
      state.prologueStage=Math.max(6,prologueStage());
    }
    closeModal(); closeSaveUi();
    if(state.currentTown!=="kunputei") restorePartyFull();
    updateWorld();
    showTownScreen(state.currentTown);
    toast(`SLOT ${slot} をロードしました。`);
  }
  function requestDeleteSlot(slot){
    modal("セーブデータ削除",`SLOT ${slot} のデータを削除しますか？\nこの操作は取り消せません。`,[["削除する",()=>{localStorage.removeItem(saveSlotKey(slot));closeModal();renderSaveSlots();refreshTitleContinue();}],["やめる",closeModal]]);
  }
  function updateHeroNameEntry(){
    const input=$("heroNameInput");
    if(!input) return;
    const chars=Array.from(input.value||"");
    if(chars.length>8) input.value=chars.slice(0,8).join("");
    const count=Array.from(input.value||"").length;
    $("heroNameCount").textContent=`${count} / 8`;
    $("heroNameConfirmBtn").disabled=normalizeHeroName(input.value).length===0;
  }
  function openHeroNameEntry(){
    const input=$("heroNameInput");
    $("nameEntryPortrait").src=roster.hero?.img||"";
    input.value="ロイド";
    updateHeroNameEntry();
    $("nameEntryModal").classList.add("show");
    setTimeout(()=>{input.focus();input.select();},40);
  }
  function confirmHeroNameEntry(){
    const input=$("heroNameInput");
    const name=normalizeHeroName(input.value)||"ロイド";
    roster.hero.name=name;
    updateHeader();
    // v0.38e: keep the name layer on top until the prologue layer is fully prepared.
    showTownScreen("milesta");
    startStoryEvent("milestaIntroEliza");
    $("nameEntryModal").classList.remove("show");
    toast("新しい冒険を始めます。");
  }
  function startNewGame(){
    if(!initialGameSnapshot) return;
    applyPersistentState(initialGameSnapshot.game);
    // The protagonist's individual Lv100 variation is rolled when a new adventure begins.
    roster.hero.finalVariation=rollFinalStatVariation(characterProfiles.hero);
    rebuildFormalCharacterStats(roster.hero,{fullHeal:true,preserveDeficit:false});
    state.run=null;
    restorePartyFull();
    updateWorld(); updateHeader();
    $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
    openHeroNameEntry();
  }
  function confirmReturnToTitle(){
    modal("タイトルに戻る","タイトル画面に戻りますか？\nセーブしていない進行状況は失われます。",[["タイトルに戻る",()=>{closeModal();closeSaveUi();state.run=null;showTitleScreen();}],["やめる",closeModal]]);
  }
  function showTitleScreen(){
    refreshTitleContinue();
    if($("topTitle")) $("topTitle").textContent="辺境の町ミレスタ";
    if($("topSubtitle")) $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
    showScreen("titleScreen");
  }
  $("saveCloseBtn").onclick=closeSaveUi;
  $("saveTabSave").onclick=()=>setSaveUiMode("save");
  $("saveTabLoad").onclick=()=>setSaveUiMode("load");

  // v0.34q development helper: temporarily expose late / otherwise unobtainable skills for UI testing.
  function devOwnedCharacterIds(){
    return [...new Set(["hero",...state.ownedSpecies])].filter(id=>roster[id]);
  }

  function captureDevSkillTestSnapshot(){
    if(state.devSkillTestSnapshot) return;
    state.devSkillTestSnapshot=Object.fromEntries(Object.entries(roster).map(([id,c])=>[id,{
      level:c.level,
      exp:c.exp,
      stats:{...c.stats},
      learnedSkills:[...(c.learnedSkills||[])]
    }]));
  }

  function devAllSkillIdsFor(c){
    // The hero is the universal test actor: every currently implemented skill is exposed,
    // including skills they never learn naturally (e.g. オルヒール / ステルス / リターン).
    if(c.id==="hero") return Object.keys(skills);
    const profile=profileFor(c);
    const planned=profile?.plannedSkills
      ? Object.values(profile.plannedSkills).flat().filter(id=>skills[id])
      : [];
    return [...new Set([...(c.learnedSkills||[]),...planned])];
  }

  function applyDevAllSkills({maxLevel=false}={}){
    captureDevSkillTestSnapshot();
    // Rebase on the original pre-test state so switching between the two test modes is predictable.
    Object.entries(state.devSkillTestSnapshot).forEach(([id,s])=>{
      const c=roster[id];
      if(!c) return;
      c.level=s.level;
      c.exp=s.exp;
      c.stats={...s.stats};
      c.learnedSkills=[...(s.learnedSkills||[])];
    });
    devOwnedCharacterIds().forEach(id=>{
      const c=roster[id];
      if(maxLevel){
        while(c.level<MAX_LEVEL) levelUpCharacter(c);
        c.exp=0;
      }
      c.learnedSkills=[...new Set(devAllSkillIdsFor(c))];
      const st=S(c);
      st.hp=st.hpMax;
      st.mp=st.mpMax;
      clearBattleOnlyStates(c,{preservePoison:false});
    });
    updateDevSkillTestButton();
    updateHeader();
  }

  function restoreDevSkillTestState(){
    const snap=state.devSkillTestSnapshot;
    if(!snap) return false;
    Object.entries(snap).forEach(([id,s])=>{
      const c=roster[id];
      if(!c) return;
      c.level=s.level;
      c.exp=s.exp;
      c.stats={...s.stats};
      c.learnedSkills=[...(s.learnedSkills||[])];
      clearBattleOnlyStates(c,{preservePoison:false});
    });
    state.devSkillTestSnapshot=null;
    updateDevSkillTestButton();
    updateHeader();
    return true;
  }

  function updateDevSkillTestButton(){
    const btn=$("devSkillTestBtn");
    if(!btn) return;
    btn.textContent=state.devSkillTestSnapshot
      ? "🧪 開発用：スキルテスト（適用中）"
      : "🧪 開発用：スキルテスト";
  }

  function openDevSkillTestMenu(){
    const active=!!state.devSkillTestSnapshot;
    modal("🧪 スキルテスト",
      "現在仲間になっているキャラを一時的にテスト強化します。\n主人公は、自力習得しないものを含む現在実装済みの全スキルを取得します。\n他の仲間は、そのキャラに予定されている実装済みスキルを全取得します。\n\n元に戻すまでテスト状態は維持されます。",
      [
        ["全スキルのみ",()=>{closeModal();applyDevAllSkills({maxLevel:false});toast("🧪 スキルテスト：全スキルを一時習得しました");}],
        ["最大Lv＋全スキル",()=>{closeModal();applyDevAllSkills({maxLevel:true});toast("🧪 スキルテスト：最大Lv＋全スキルを適用しました");}],
        ["元の状態に戻す",()=>{closeModal();if(restoreDevSkillTestState()) toast("↩️ スキルテスト前の状態に戻しました");else toast("戻せるテスト状態がありません");},"",!active],
        ["やめる",closeModal]
      ]
    );
  }

  const recruitRanks = {
    E:{base:.22,cap:1.0},
    D:{base:.12,cap:1.0},
    C:{base:.06,cap:1.0},
    B:{base:.025,cap:1.2},
    A:{base:.007,cap:2.0},
    S:{base:.0025,cap:5.0}
  };

  // Recruitment rank mirrors each character's current formal profile where available.
  const speciesRecruitment = {
    slime:{name:"スライム娘",rank:"E"},
    dog:{name:"犬娘",rank:"E"},
    fairy:{name:"フェアリー",rank:"E"},
    slug:{name:"ナメクジ娘",rank:"E"},
    slimebes:{name:"スライムベス娘",rank:"D"},
    poison:{name:"ポイズンスライム娘",rank:"D"},
    harpy:{name:"ハーピー",rank:"C"},
    momo:{name:"モモイロナメクジ",rank:"E"},
    arachne:{name:"アラクネ",rank:"D"},
    alraune:{name:"アルラウネ",rank:"D"},
    rabbit:{name:"ウサギ娘",rank:"D"},
    demon:{name:"デーモン",rank:"D"},
    golem:{name:"ゴーレム娘",rank:"C"},
    elf:{name:"エルフ",rank:"D"},
    sylph:{name:"シルフィ",rank:"B"},
    owl:{name:"フクロウ娘",rank:"C"},
    moth:{name:"モス",rank:"C"},
    forestMage:{name:"フォレストメイジ",rank:"A"},
    silverSlime:{name:"シルバースライム",rank:"B"},
    maidDevil:{name:"メイドデビル",rank:"D"},
    lamia:{name:"ラミア",rank:"B"},
    poisonArachne:{name:"ポイズンアラクネ",rank:"C"},
    ghost:{name:"ゴースト娘",rank:"D"},
    madGolem:{name:"マッドゴーレム",rank:"C"},
    scylla:{name:"スキュラ",rank:"D"},
    mimic:{name:"ミミック娘",rank:"B"},
    podalge:{name:"ポダルゲ",rank:"C"},
    mermaid:{name:"マーメイド",rank:"C"},
    kitsune:{name:"妖狐",rank:"C"},
    lloyd:{name:"ロイド",rank:"C"},
    dogu:{name:"土偶娘",rank:"D"},
    desertDog:{name:"デザートドッグ",rank:"D"},
    hotSandTentacle:{name:"熱砂の触手",rank:"C"},
    prominence:{name:"プロミネンス",rank:"C"},
    magmaSlug:{name:"マグマスラッグ",rank:"D"},
    scorpion:{name:"スコーピオン娘",rank:"C"},
    dragon:{name:"ドラゴン娘",rank:"B"}
  };

  // v0.41a: defeated enemies can drop one consumable/equipment item at most.
  // Rare is rolled first; only when it misses is the normal 10% roll attempted.
  const NORMAL_DROP_RATE=.10;
  const RARE_DROP_RATE=.03;
  const SEED_DROP_RATE=.01;
  const VRITRA_IMG = "assets/characters/vritra.webp";

  const battleDropTable={
    slime:{normal:{kind:"item",id:"potion",rate:NORMAL_DROP_RATE}},
    dog:{normal:{kind:"equipment",id:"stone_claw",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"paw_hand",rate:RARE_DROP_RATE}},
    fairy:{rare:{kind:"item",id:"magicHerb",rate:RARE_DROP_RATE}},
    slug:{normal:{kind:"item",id:"antidote",rate:NORMAL_DROP_RATE}},
    momo:{normal:{kind:"item",id:"antidote",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"lifeSeed",rate:SEED_DROP_RATE}},
    arachne:{normal:{kind:"item",id:"antidote",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"ragged_robe",rate:RARE_DROP_RATE}},
    slimebes:{normal:{kind:"item",id:"potion",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"polishDrink",rate:RARE_DROP_RATE}},
    poison:{normal:{kind:"item",id:"antidote",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"highPotion",rate:RARE_DROP_RATE}},
    poisonArachne:{normal:{kind:"item",id:"antidote",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"poisonGasBottle",rate:RARE_DROP_RATE}},
    ghost:{normal:{kind:"equipment",id:"ragged_robe",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"magicHerb",rate:RARE_DROP_RATE}},
    madGolem:{normal:{kind:"item",id:"highPotion",rate:NORMAL_DROP_RATE}},
    scylla:{rare:{kind:"equipment",id:"iron_whip",rate:RARE_DROP_RATE}},
    mimic:{rare:{kind:"item",id:"auraGear",rate:RARE_DROP_RATE}},
    mermaid:{normal:{kind:"item",id:"blockDrink",rate:NORMAL_DROP_RATE}},
    kitsune:{rare:{kind:"equipment",id:"fluffy_tail",rate:RARE_DROP_RATE}},
    lloyd:{normal:{kind:"equipment",id:"bronze_mail",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"lifeSeed",rate:SEED_DROP_RATE}},
    dogu:{normal:{kind:"item",id:"blockDrink",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"holyWater",rate:RARE_DROP_RATE}},
    tentacle:{normal:{kind:"item",id:"panacea",rate:1}},
    harpy:{normal:{kind:"item",id:"returnFeather",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"light_shoes",rate:RARE_DROP_RATE}},
    alraune:{normal:{kind:"equipment",id:"whip",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"alra_whip",rate:RARE_DROP_RATE}},
    rabbit:{rare:{kind:"item",id:"mysteriousMap",rate:RARE_DROP_RATE}},
    demon:{normal:{kind:"equipment",id:"ragged_robe",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"mage_staff",rate:RARE_DROP_RATE}},
    golem:{rare:{kind:"item",id:"guardSeed",rate:SEED_DROP_RATE}},
    elf:{rare:{kind:"equipment",id:"elven_bow",rate:RARE_DROP_RATE}},
    sylph:{normal:{kind:"equipment",id:"hinoki_staff",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"intellectSeed",rate:SEED_DROP_RATE}},
    owl:{normal:{kind:"item",id:"returnFeather",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"bronze_knuckle",rate:RARE_DROP_RATE}},
    moth:{rare:{kind:"item",id:"spiritSeed",rate:SEED_DROP_RATE}},
    forestMage:{normal:{kind:"item",id:"potion",rate:NORMAL_DROP_RATE},rare:{kind:"item",id:"magicHerb",rate:RARE_DROP_RATE}},
    maidDevil:{normal:{kind:"item",id:"highPotion",rate:NORMAL_DROP_RATE},rare:{kind:"equipment",id:"maid_dress",rate:RARE_DROP_RATE}},
    lamia:{rare:{kind:"item",id:"powerSeed",rate:SEED_DROP_RATE}},
    silverSlime:{rare:{kind:"item",id:"emergencyEscapePack",rate:RARE_DROP_RATE}},
    podalge:{normal:{kind:"item",id:"returnFeather",rate:NORMAL_DROP_RATE}},
    podalgeBoss:{normal:{kind:"item",id:"speedSeed",rate:1}}
  };

  function battleDropRateMultiplier(){
    let multiplier=1;
    battleTraitSlots({livingOnly:false}).forEach(({c})=>{
      const effect=traitOf(c)?.effect;
      if(effect?.type==="dropRateMultiplier") multiplier*=Math.max(0,Number(effect.multiplier)||1);
    });
    return multiplier;
  }

  function battleNormalDropRateBonus(){
    let bonus=0;
    battleTraitSlots({livingOnly:false}).forEach(({c})=>{
      const effect=traitOf(c)?.effect;
      if(effect?.type==="normalDropRateFlatBonus") bonus+=Math.max(0,Number(effect.bonus)||0);
    });
    return bonus;
  }

  function battleDropEntryName(entry){
    if(!entry) return "アイテム";
    return entry.kind==="equipment"
      ? (equipmentCatalog[entry.id]?.name||entry.id)
      : (ITEMS[entry.id]?.name||entry.id);
  }

  function rollBattleDrops(){
    const drops=[];
    const rateMultiplier=battleDropRateMultiplier();
    const normalRateBonus=battleNormalDropRateBonus();
    state.battleEnemies.forEach((enemy,encounterIndex)=>{
      if(!enemy || enemy.hp>0 || enemy.noReward) return;
      const table=battleDropTable[enemy.id];
      if(!table) return;
      let picked=null,rarity="normal";
      if(table.rare && Math.random()<Math.min(1,table.rare.rate*rateMultiplier)){
        picked=table.rare;rarity="rare";
      }else if(table.normal && Math.random()<Math.min(1,table.normal.rate*rateMultiplier+normalRateBonus)){
        picked=table.normal;rarity="normal";
      }
      if(!picked) return;
      drops.push({
        enemyId:enemy.id,enemyName:enemy.displayName||enemy.name||speciesRecruitment[enemy.id]?.name||enemy.id,
        encounterIndex,kind:picked.kind,id:picked.id,rarity,granted:false
      });
    });
    return drops;
  }

  function grantBattleDrop(drop){
    if(!drop || drop.granted) return;
    if(drop.kind==="equipment") addEquipmentOwned(drop.id,1);
    else addItemCount(drop.id,1);
    drop.granted=true;
    updateHeader();
  }

  function activeFateTotal(){
    return state.battleActive.reduce((sum,id)=>{
      const c=roster[id];
      return sum+(c?equipmentExtras(c).fate:0);
    },0);
  }

  function baseRecruitmentChance(speciesId,fateTotal=activeFateTotal()){
    const info=speciesRecruitment[speciesId];
    if(!info) return 0;
    const cfg=recruitRanks[info.rank];
    if(!cfg) return 0;
    return cfg.base * (1 + cfg.cap * fateTotal / (100 + fateTotal));
  }

  function recruitmentChance(speciesId,fateTotal=activeFateTotal()){
    const original=baseRecruitmentChance(speciesId,fateTotal);
    if(original<=0) return 0;
    const perCast=Math.min(original,.01);
    return Math.min(.70,original+(Number(state.fortuneCasts)||0)*perCast);
  }

  function pctText(rate){
    const p=rate*100;
    return p<1 ? `${p.toFixed(2)}%` : `${p.toFixed(1)}%`;
  }

  const recruitRankPriority = {E:1,D:2,C:3,B:4,A:5,S:6};

  function uniqueEncounterSpecies(){
    return [...new Set(state.battleEnemies.map(e=>e.id))];
  }

  function chooseRecruitWinner(testMode=false){
    const fateTotal=activeFateTotal();
    const successful=[];

    // One roll per defeated enemy body, even when several are the same species.
    state.battleEnemies.forEach((enemy,encounterIndex)=>{
      const info=speciesRecruitment[enemy.id];
      if(!info || enemy.hp>0 || enemy.noRecruit) return;
      const tutorialBattle=state.battleSpecial==="recruitTutorial";
      if(!testMode && state.ownedSpecies.has(enemy.id) && !tutorialBattle) return;

      const chance=recruitmentChance(enemy.id,fateTotal);
      if(tutorialBattle || state.devForceRecruit || Math.random()<chance){
        successful.push({
          id:enemy.id,
          name:info.name,
          rank:info.rank,
          chance,
          fateTotal,
          defeatOrder:enemy.defeatOrder||0,
          encounterIndex
        });
      }
    });

    if(!successful.length) return null;

    successful.sort((a,b)=>{
      const rankDiff=(recruitRankPriority[b.rank]||0)-(recruitRankPriority[a.rank]||0);
      if(rankDiff) return rankDiff;
      const defeatDiff=(b.defeatOrder||0)-(a.defeatOrder||0);
      if(defeatDiff) return defeatDiff;
      return b.encounterIndex-a.encounterIndex;
    });

    return successful[0];
  }

  function ownedSpeciesNames(){
    return [...state.ownedSpecies]
      .map(id=>speciesRecruitment[id]?.name || roster[id]?.name)
      .filter(Boolean);
  }

  // v0.44r Yody mountain battle-test assets.
  const PODALGE_IMG = "assets/characters/podalge.webp";
  const BATTLE_BG_MOUNTAIN = "assets/backgrounds/mountain.webp";

  // v0.46a: Tylene wetland / toxic marsh battle assets.
  const TENTACLE_IMG = "assets/characters/tentacle.webp";
  const IRON_OWL_IMG = "assets/characters/iron_owl.webp";

  // v0.31 formal early-enemy set. Enemy stats are independent from recruitable-character growth stats.
  // Resistances intentionally mirror the recruitable profile. Critical / evasion remain 0.0% by default.
  const enemyData = {
    slime:{
      name:"スライム娘",img:IMG.slime,exp:10,gold:4,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.slime.resist},
      skills:[],ai:"basic",stats:{hp:34,mp:5,atk:10,def:4,magic:3,mdef:3,spd:5}
    },
    dog:{
      name:"犬娘",img:IMG.dog,exp:14,gold:6,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.dog.resist},
      skills:[],ai:"basic",stats:{hp:46,mp:3,atk:13,def:6,magic:1,mdef:4,spd:11}
    },
    slug:{
      name:"ナメクジ娘",img:IMG.slug,exp:18,gold:7,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.slug.resist},
      skills:[],ai:"basic",stats:{hp:55,mp:4,atk:13,def:14,magic:2,mdef:3,spd:3}
    },
    fairy:{
      name:"フェアリー",img:IMG.fairy,exp:15,gold:7,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.fairy.resist},
      skills:["heal","ice"],ai:"fairySupport",stats:{hp:30,mp:12,atk:7,def:3,magic:10,mdef:8,spd:14}
    },
    momo:{
      name:"モモイロナメクジ",img:IMG.momo,exp:28,gold:12,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.momo.resist},
      skills:["allHeal"],ai:"momoHealer",stats:{hp:78,mp:24,atk:17,def:17,magic:10,mdef:4,spd:3}
    },
    arachne:{
      name:"アラクネ",img:IMG.arachne,exp:22,gold:9,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.arachne.resist},
      skills:["poison"],ai:"arachnePoison",stats:{hp:85,mp:10,atk:28,def:14,magic:16,mdef:15,spd:18}
    },
    slimebes:{
      name:"スライムベス娘",img:IMG.slimebes,exp:28,gold:12,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.slimebes.resist},
      skills:[],ai:"basic",stats:{hp:110,mp:0,atk:34,def:9,magic:5,mdef:9,spd:12}
    },
    harpy:{
      name:"ハーピー",img:IMG.harpy,exp:24,gold:10,critRate:0,evasionRate:5,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.harpy.resist},
      skills:["sonic"],ai:"harpySonic",stats:{hp:70,mp:12,atk:24,def:8,magic:27,mdef:11,spd:45}
    },
    alraune:{
      name:"アルラウネ",img:IMG.alraune,exp:28,gold:12,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.alraune.resist},
      skills:["heal"],ai:"alrauneSupport",basicAttackAll:true,basicAttackPower:.80,basicAttackFx:"whip",basicAttackSymbol:"〰",
      stats:{hp:115,mp:9,atk:28,def:24,magic:28,mdef:20,spd:16}
    },
    rabbit:{
      name:"ウサギ娘",img:IMG.rabbit,exp:26,gold:11,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.rabbit.resist},
      skills:["touch"],ai:"rabbitTouch",stats:{hp:110,mp:8,atk:38,def:15,magic:30,mdef:15,spd:42}
    },
    demon:{
      name:"デーモン",img:IMG.demon,exp:30,gold:13,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.demon.resist},
      skills:["thunder","fire"],ai:"demonCaster",stats:{hp:100,mp:39,atk:14,def:14,magic:42,mdef:28,spd:29}
    },
    golem:{
      name:"ゴーレム娘",img:IMG.golem,exp:31,gold:14,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.golem.resist},
      skills:[],ai:"basic",stats:{hp:150,mp:1,atk:48,def:40,magic:2,mdef:10,spd:8}
    },
    elf:{
      name:"エルフ",img:IMG.elf,exp:35,gold:22,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.elf.resist},
      skills:["highHeal"],ai:"elfArcher",basicBowInstantKillRate:2.5,basicAttackFx:"arrow",basicAttackSymbol:"🏹",stats:{hp:135,mp:33,atk:49,def:32,magic:39,mdef:39,spd:40}
    },
    sylph:{
      name:"シルフィ",img:IMG.sylph,exp:36,gold:23,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.sylph.resist},
      skills:["sonic","wind"],ai:"sylphCaster",stats:{hp:100,mp:45,atk:21,def:20,magic:52,mdef:42,spd:57}
    },
    owl:{
      name:"フクロウ娘",img:IMG.owl,exp:38,gold:25,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.owl.resist},
      skills:["neoBlind"],ai:"owlFighter",stats:{hp:160,mp:29,atk:53,def:36,magic:43,mdef:41,spd:41}
    },
    moth:{
      name:"モス",img:IMG.moth,exp:39,gold:27,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.moth.resist},
      skills:["neoSilence"],ai:"mothSilencer",stats:{hp:145,mp:42,atk:43,def:31,magic:47,mdef:68,spd:38}
    },
    forestMage:{
      name:"フォレストメイジ",img:IMG.forestMage,exp:41,gold:29,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.forestMage.resist},
      skills:["quake","allHeal2"],ai:"forestMageCaster",basicBowInstantKillRate:1.5,basicAttackFx:"arrow",basicAttackSymbol:"🏹",stats:{hp:135,mp:52,atk:38,def:33,magic:57,mdef:49,spd:40}
    },
    poison:{
      name:"ポイズンスライム娘",img:IMG.poison,exp:52,gold:35,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.poison.resist},
      skills:["neoPoison"],ai:"poisonSlimeToxic",basicPoisonRate:.15,stats:{hp:185,mp:38,atk:49,def:44,magic:38,mdef:43,spd:24}
    },
    poisonArachne:{
      name:"ポイズンアラクネ",img:IMG.poisonArachne,exp:56,gold:38,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.poisonArachne.resist},
      skills:["neoPoison","dark"],ai:"poisonArachneToxic",basicPoisonRate:.20,stats:{hp:175,mp:55,atk:44,def:46,magic:50,mdef:55,spd:53}
    },
    ghost:{
      name:"ゴースト娘",img:IMG.ghost,exp:60,gold:40,critRate:0,evasionRate:5,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.ghost.resist},
      skills:["fire","pleasure"],ai:"ghostCaster",stats:{hp:155,mp:64,atk:18,def:35,magic:61,mdef:64,spd:62}
    },
    madGolem:{
      name:"マッドゴーレム",img:IMG.madGolem,exp:66,gold:43,critRate:8.0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.madGolem.resist},
      skills:[],ai:"basic",stats:{hp:260,mp:20,atk:74,def:64,magic:35,mdef:58,spd:40}
    },
    scylla:{
      name:"スキュラ",img:IMG.scylla,exp:68,gold:45,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.scylla.resist},
      skills:["pleasure"],ai:"scyllaPleasure",basicAttackAll:true,basicAttackPower:.75,basicAttackFx:"whip",basicAttackSymbol:"〰",
      stats:{hp:235,mp:55,atk:66,def:48,magic:54,mdef:52,spd:59}
    },
    mimic:{
      name:"ミミック娘",img:IMG.mimic,exp:180,gold:95,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:true,statusImmune:["shock","poison","blind"],resist:{...characterProfiles.mimic.resist},
      skills:["cold2","death"],ai:"mimicSpecial",basicAttackAll:true,basicAttackPower:.75,basicAttackFx:"whip",basicAttackSymbol:"〰",
      stats:{hp:820,mp:135,atk:86,def:70,magic:82,mdef:74,spd:68}
    },
    ironOwl:{
      name:"アイアンオウル",img:IRON_OWL_IMG,exp:300,gold:130,critRate:5.0,evasionRate:0,boss:true,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,
      resist:{fire:"C",ice:"B",light:"C",dark:"C",thunder:"E",wind:"D",earth:"A",pleasure:"B",poison:"A",blind:"S",silence:"D",death:"B"},
      skills:["wind","explosiveFist"],ai:"ironOwlBoss",basicAttackPower:1.15,basicAttackFx:"claw",basicAttackSymbol:" ",
      stats:{hp:1400,mp:100,atk:84,def:76,magic:48,mdef:65,spd:70}
    },
    tentacle:{
      name:"テンタクル",img:TENTACLE_IMG,exp:260,gold:120,critRate:3.0,evasionRate:0,boss:true,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,
      resist:{fire:"D",ice:"C",light:"D",dark:"C",thunder:"E",wind:"C",earth:"C",pleasure:"C",poison:"S",blind:"B",silence:"C",death:"D"},
      skills:["frost","neoPoison"],ai:"tentacleBoss",basicAttackAll:true,basicAttackPower:.75,basicAttackFx:"whip",basicAttackSymbol:"〰",
      stats:{hp:1200,mp:110,atk:78,def:52,magic:62,mdef:54,spd:36}
    },
    maidDevil:{
      name:"メイドデビル",img:IMG.maidDevil,exp:46,gold:31,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.maidDevil.resist},
      skills:["allPolish","allGuard"],ai:"maidDevilSupport",stats:{hp:155,mp:44,atk:49,def:38,magic:50,mdef:46,spd:45}
    },
    lamia:{
      name:"ラミア",img:IMG.lamia,exp:48,gold:33,critRate:3.0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.lamia.resist},
      skills:[],ai:"basic",stats:{hp:215,mp:20,atk:63,def:37,magic:22,mdef:32,spd:31}
    },
    silverSlime:{
      name:"シルバースライム",img:IMG.silverSlime,exp:500,gold:45,critRate:0,evasionRate:10,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,silverBodyDamageCompression:true,resist:{...characterProfiles.silverSlime.resist},
      skills:["cold2"],ai:"silverSlimeMetal",basicBowInstantKillRate:2.0,basicAttackFx:"arrow",basicAttackSymbol:"🏹",stats:{hp:8,mp:35,atk:60,def:0,magic:48,mdef:0,spd:105}
    },
    podalge:{
      name:"ポダルゲ",img:IMG.podalge,exp:72,gold:47,critRate:0,evasionRate:5,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.podalge.resist},
      skills:["wind"],ai:"podalgeWind",stats:{hp:205,mp:80,atk:62,def:46,magic:70,mdef:62,spd:84}
    },
    mermaid:{
      name:"マーメイド",img:IMG.mermaid,exp:76,gold:50,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.mermaid.resist},
      skills:["frost","highHeal"],ai:"mermaidSupport",stats:{hp:235,mp:95,atk:50,def:58,magic:78,mdef:72,spd:56}
    },
    kitsune:{
      name:"妖狐",img:IMG.kitsune,exp:84,gold:55,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.kitsune.resist},
      skills:["quake","thunder"],ai:"kitsuneCaster",basicAttackFx:"slash",basicAttackSymbol:"⚔️",
      stats:{hp:255,mp:105,atk:70,def:56,magic:80,mdef:68,spd:69}
    },
    lloyd:{
      name:"ロイド",img:IMG.lloyd,exp:92,gold:60,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.lloyd.resist},
      skills:["highHeal","allHeal2"],ai:"lloydSupport",
      stats:{hp:320,mp:130,atk:80,def:76,magic:68,mdef:72,spd:59}
    },
    dogu:{
      name:"土偶娘",img:IMG.dogu,exp:94,gold:62,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.dogu.resist},
      skills:["death","neoSilence"],ai:"doguCaster",elementNullifyRate:.15,elementNullifyElements:["fire","ice"],
      stats:{hp:210,mp:100,atk:77,def:79,magic:77,mdef:75,spd:69}
    },
    highLamia:{
      name:"ハイラミア",img:IMG.lamia,exp:100,gold:65,critRate:3.0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{...characterProfiles.lamia.resist},
      skills:["highHeal","allGuard","allBlock"],ai:"highLamiaSupport",
      stats:{hp:380,mp:120,atk:76,def:56,magic:82,mdef:62,spd:46}
    },
    vritra:{
      name:"ヴリトラ",img:VRITRA_IMG,exp:520,gold:220,critRate:0,evasionRate:0,boss:true,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,
      resist:{fire:"C",ice:"E",light:"D",dark:"A",thunder:"D",wind:"C",earth:"C",pleasure:"D",poison:"S",blind:"A",silence:"E",death:"A"},
      skills:["silence","thunder","terraCrash"],ai:"vritraBoss",basicAttackAll:true,basicAttackPower:.75,basicAttackFx:"heavy",basicAttackSymbol:"💥",enemyCounterChance:.20,
      stats:{hp:1900,mp:260,atk:110,def:90,magic:80,mdef:84,spd:80}
    },
    podalgeBoss:{
      name:"ポダルゲ",img:PODALGE_IMG,exp:70,gold:35,critRate:0,evasionRate:5,boss:true,noRecruit:true,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,
      resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"E",wind:"A",earth:"A",pleasure:"C",poison:"D",blind:"D",silence:"D",death:"C"},
      skills:["wind","flare"],ai:"podalgeBoss",stats:{hp:420,mp:70,atk:46,def:24,magic:40,mdef:28,spd:52}
    },
    sheep:{
      name:"シープ",img:IMG.sheep,exp:0,gold:0,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"C",blind:"C",silence:"C",death:"C"},
      skills:[],ai:"basic",stats:{hp:1,mp:1,atk:1,def:1,magic:1,mdef:1,spd:1}
    },
    lindwurm:{
      name:"リンドヴルム",img:IMG.lindwurm,exp:0,gold:0,critRate:0,evasionRate:0,
      bowInstantKillImmune:false,statusDeathImmune:false,resist:{fire:"C",ice:"C",light:"C",dark:"C",thunder:"C",wind:"C",earth:"C",pleasure:"C",poison:"C",blind:"C",silence:"C",death:"C"},
      skills:[],ai:"basic",stats:{hp:1,mp:1,atk:1,def:1,magic:1,mdef:1,spd:1}
    },
    vanguard:{
      name:"魔界の尖兵",img:HELLHOUND_IMG,exp:0,gold:0,critRate:0,evasionRate:0,boss:true,
      bowInstantKillImmune:true,statusDeathImmune:true,statusImmuneAll:true,resist:{...characterProfiles.dog.resist},
      skills:["tackle","cold"],ai:"vanguardBoss",stats:{hp:420,mp:36,atk:34,def:18,magic:16,mdef:15,spd:24}
    }
  };

  // v0.46e provisional enemy levels for overlevel EXP decay.
  // Bosses and Silver Slime are exempt from decay; Lloyd / Dogu are reserved for their future enemy entries.
  const ENEMY_LEVELS = Object.freeze({
    slime:4,dog:4,fairy:4,slug:4,
    momo:7,arachne:7,slimebes:7,
    harpy:8,
    rabbit:10,alraune:10,
    golem:12,demon:12,
    elf:14,sylph:14,
    owl:15,
    moth:16,forestMage:16,
    lamia:18,maidDevil:18,
    poison:20,poisonArachne:20,
    ghost:21,
    madGolem:23,scylla:23,
    podalge:24,mermaid:24,
    kitsune:25,lloyd:25,dogu:25,
    mimic:30
  });
  Object.entries(ENEMY_LEVELS).forEach(([id,level])=>{
    if(enemyData[id]) enemyData[id].level=level;
  });

  // v0.38e battle backgrounds: embedded once and switched by encounter area.
  const BATTLE_BG_PLAINS = "assets/backgrounds/plains.webp";
  const BATTLE_BG_CAVE = "assets/backgrounds/cave.webp";
  const BATTLE_BG_FOREST = 'assets/backgrounds/forest.webp';
  const BATTLE_BG_WETLAND = "assets/backgrounds/wetland.webp";
  const BATTLE_BG_TOXIC_WETLAND = "assets/backgrounds/toxic_wetland.webp";
  const BATTLE_BG_RUINS = "assets/backgrounds/ruins.webp";

  const BATTLE_BG_BY_AREA = {
    plains:BATTLE_BG_PLAINS,eventDogs:BATTLE_BG_PLAINS,
    cave1:BATTLE_BG_CAVE,cave2:BATTLE_BG_CAVE,caveSide:BATTLE_BG_CAVE,rare:BATTLE_BG_CAVE,caveSlugEvent:BATTLE_BG_CAVE,caveBoss:BATTLE_BG_CAVE,runelCavern:BATTLE_BG_CAVE,runelScyllaPot:BATTLE_BG_CAVE,runelRegion:BATTLE_BG_PLAINS,runelRuins:BATTLE_BG_RUINS,runelRuinsMimic:BATTLE_BG_RUINS,runelRuinsKitsuneTrick:BATTLE_BG_RUINS,yodyRegion:BATTLE_BG_PLAINS,
    footpath:BATTLE_BG_FOREST,yodyMountain:BATTLE_BG_MOUNTAIN,yodyMountainBoss:BATTLE_BG_MOUNTAIN,tilenoRegion:BATTLE_BG_FOREST,tilenoElfEvent:BATTLE_BG_FOREST,zelrenoForest:BATTLE_BG_FOREST,zelrenoForestDeep:BATTLE_BG_FOREST,zelrenoForestDeepBoss:BATTLE_BG_FOREST,zelrenoWitchApproach:BATTLE_BG_FOREST,zelrenoWitchWatch:BATTLE_BG_FOREST,granzelPlains:BATTLE_BG_PLAINS,granzelSlimeParade:BATTLE_BG_PLAINS,
    tilenoWetland:BATTLE_BG_WETLAND,tilenoToxicWetland:BATTLE_BG_TOXIC_WETLAND,tilenoToxicBoss:BATTLE_BG_TOXIC_WETLAND,tilenoToxicSlimeEvent:BATTLE_BG_TOXIC_WETLAND
  };

  const battleFormations = {
    plains:{label:"🌿 ミレスタ平原",formations:[
      ["slime"],["slime","slime"],["dog"],["slime","dog"]
    ]},
    cave1:{label:"🕳️ 小さな洞窟",formations:[
      ["dog"],["slime","dog"],["slug"],["fairy"],["fairy","slime","slime"]
    ]},
    cave2:{label:"🕳️ 小さな洞窟・第二層",formations:[
      ["slime","slime","slime","slime"],["slime","slime","dog"],["slug","slug"],["fairy","fairy"],["dog","fairy","slug"]
    ]},
    caveSide:{label:"🕳️ 洞窟の横道",formations:[
      ["slug","slug","slug","slug"],
      ["momo","slug","slug"],
      ["momo","momo","momo"],
      ["arachne","arachne"],
      ["arachne","arachne","arachne"],
      ["slimebes"],
      ["slug","arachne","arachne","slug"],
      ["arachne","arachne","arachne","arachne"]
    ],rareFormationIndexes:[7],rareRate:.05},
    yodyRegion:{label:"🌊 ヨーディー地方",formations:[
      ["arachne","arachne","arachne"],
      ["slimebes","slimebes"],
      ["slime","slimebes","slime"],
      ["arachne","slimebes"],
      ["harpy","harpy","harpy"],
      ["slimebes","harpy"],
      ["arachne","harpy","slimebes"]
    ],rareFormationIndexes:[6],rareRate:.05},
    footpath:{label:"🌲 麓の小道",formations:[
      ["alraune","alraune"],
      ["slimebes","alraune","harpy"],
      ["rabbit","alraune"],
      ["rabbit","rabbit"],
      ["rabbit","rabbit","rabbit"],
      ["rabbit","harpy","rabbit"],
      ["alraune","alraune","alraune"]
    ],rareFormationIndexes:[6],rareRate:.05},
    yodyMountain:{label:"⛰️ ヨーディー山道",formations:[
      ["harpy","harpy","harpy"],
      ["alraune","alraune","alraune"],
      ["demon","golem","harpy"],
      ["golem","golem"],
      ["golem","demon"],
      ["harpy","demon","harpy"],
      ["slimebes","alraune","golem","demon"]
    ],rareFormationIndexes:[6],rareRate:.05},
    yodyMountainBoss:{label:"⛰️ ヨーディー山道",formations:[
      ["harpy","podalgeBoss","harpy"]
    ]},
    tilenoRegion:{label:"🌿 ティレーノ地方",formations:[
      ["elf","elf","sylph"],
      ["sylph","elf","owl"],
      ["sylph","fairy","fairy","sylph"],
      ["owl","elf","alraune"],
      ["owl","owl","owl"]
    ],rareFormationIndexes:[4],rareRate:.05},
    tilenoElfEvent:{label:"🌿 ティレーノ地方・警戒するエルフ",formations:[
      ["elf","elf","elf"]
    ]},
    zelrenoWitchApproach:{label:"🧙 魔女の宴",formations:[["forestMage","forestMage","demon"]]},
    zelrenoWitchWatch:{label:"🫕 魔女の宴",formations:[["slime","poison","slimebes","slime"]]},
    zelrenoForest:{label:"🌲 ゼルレーノ森林地帯",formations:[
      ["owl","owl"],
      ["demon","forestMage","owl"],
      ["moth","owl","moth"],
      ["owl","forestMage","moth"],
      ["forestMage","moth","moth"],
      ["owl","moth","forestMage","owl"]
    ],rareFormationIndexes:[5],rareRate:.05},
    zelrenoForestDeep:{label:"🌲 ゼルレーノ森林地帯・奥地",formations:[
      ["ghost","ghost","ghost"],
      ["ghost","forestMage","ghost"],
      ["owl","owl","ghost"],
      ["demon","forestMage","forestMage"],
      ["moth","moth","moth","moth"],
      ["ghost","ghost","ghost","ghost"]
    ],rareFormationIndexes:[5],rareRate:.05},
    zelrenoForestDeepBoss:{label:"🌲 ゼルレーノ森林地帯・奥地・ボス",formations:[
      ["ironOwl"]
    ]},
    granzelPlains:{label:"🌾 グランゼル大平原",formations:[
      ["maidDevil","lamia","maidDevil"],
      ["lamia","lamia"],
      ["maidDevil","forestMage","moth"],
      ["maidDevil","lamia","owl"],
      ["silverSlime"],
      ["silverSlime","silverSlime"]
    ],rareFormationIndexes:[4,5],rareRate:.10},
    runelCavern:{label:"🪨 ルネル岩窟",formations:[
      ["madGolem","madGolem"],
      ["scylla","scylla","madGolem"],
      ["madGolem","scylla","lamia"],
      ["maidDevil","scylla","scylla","maidDevil"],
      ["silverSlime"],
      ["mimic"]
    ],rareFormationIndexes:[4],rareRate:.05,nonRandomFormationIndexes:[5]},
    runelRegion:{label:"🌿 ルネル地方",formations:[
      ["podalge","mermaid","mermaid"],
      ["podalge","podalge","podalge"],
      ["kitsune","mermaid","podalge"],
      ["mermaid","kitsune","scylla"],
      ["kitsune","scylla","kitsune"],
      ["mermaid","podalge","kitsune","mermaid"],
      ["silverSlime"]
    ],rareFormationIndexes:[5,6],rareRate:.10},
    runelRuins:{label:"🏚️ ルネルパリオ城下町跡",formations:[
      ["dogu","dogu","kitsune","kitsune"],
      ["lloyd","dogu","dogu"],
      ["kitsune","lloyd","dogu"],
      ["podalge","lloyd","kitsune","podalge"],
      ["lloyd","lloyd","dogu","dogu"],
      ["silverSlime","silverSlime"],
      ["highLamia","vritra","highLamia"]
    ],rareFormationIndexes:[4,5],rareRate:.10,nonRandomFormationIndexes:[6]},
    runelRuinsMimic:{label:"🏚️ ルネルパリオ城下町跡・宝箱",formations:[["mimic"]]},
    runelRuinsKitsuneTrick:{label:"🏚️ ルネルパリオ城下町跡・妖狐のいたずら",formations:[["kitsune","kitsune","kitsune","kitsune"]]},
    runelScyllaPot:{label:"🪨 ルネル岩窟・大きな壺",formations:[["scylla","scylla","scylla","scylla"]]},
    runelRegionSong:{label:"🌿 ルネル地方・魔物娘の歌声",formations:[["podalge","podalge","mermaid","mermaid"]]},
    tilenoWetland:{label:"🌿 ティレーノ湿原",formations:[
      ["elf","elf","sylph"],
      ["sylph","fairy","fairy","sylph"],
      ["sylph","elf","poison","poison"],
      ["poisonArachne","elf","elf"]
    ]},
    tilenoToxicWetland:{label:"☠️ ティレーノ毒湿地",formations:[
      ["poison","poison","poison"],
      ["poison","poison","poison","poison"],
      ["poisonArachne","poisonArachne","poison"],
      ["arachne","poisonArachne","poisonArachne"],
      ["poison","poisonArachne","poisonArachne","poison"],
      ["silverSlime"]
    ],rareFormationIndexes:[4,5],rareRate:.10},
    tilenoToxicBoss:{label:"☠️ ティレーノ毒湿地・最奥",formations:[
      ["poison","tentacle","poisonArachne"]
    ]},
    tilenoToxicSlimeEvent:{label:"☠️ ティレーノ毒湿地・毒沼から覗く顔",formations:[
      ["poison","poison","poison","poison","poison"]
    ]},
    granzelSlimeParade:{label:"🌾 グランゼル大平原・スライムの行列",formations:[
      ["slime","slime","slime","slime","slime"],
      ["slime","slimebes","slime","slimebes"],
      ["slime","slimebes","poison"],
      ["slime","slime","slime","silverSlime"]
    ]},
    visualTest:{label:"🧪 画像表示テスト",formations:[
      ["sheep"],
      ["lindwurm"],
      ["sheep","lindwurm"]
    ]},
    rare:{label:"✨ レア編成",formations:[
      ["momo","slug","slug"]
    ]},
    caveSlugEvent:{label:"🕳️ ナメクジの集会",formations:[["slug","slug"]]},
    caveBoss:{label:"🔥 小さな洞窟・最奥",formations:[["vanguard"]]},
    eventDogs:{label:"🌿 ミレスタ平原・獣の痕跡",formations:[["dog","dog"]]}
  };

  // Convenience accessors while keeping the new grouped data structure.
  function S(c){ return c.stats; }

  const ITEMS = {
    // HP recovery
    potion:{id:"potion",name:"ポーション",icon:"🧪",price:12,sellRate:.10,battleUse:true,fieldUse:true,effect:"hpHeal",amount:50,battleTarget:"ally",desc:"味方1人のHPを50回復"},
    highPotion:{id:"highPotion",name:"ハイポーション",icon:"🧪",price:60,sellRate:.10,battleUse:true,fieldUse:true,effect:"hpHeal",amount:150,battleTarget:"ally",desc:"味方1人のHPを150回復"},
    exPotion:{id:"exPotion",name:"エクスポーション",icon:"🧪",price:150,sellRate:.10,battleUse:true,fieldUse:true,effect:"hpHeal",amount:300,battleTarget:"ally",desc:"味方1人のHPを300回復"},
    lastPotion:{id:"lastPotion",name:"ラストポーション",icon:"🧪",price:400,sellRate:.10,battleUse:true,fieldUse:true,effect:"hpHeal",full:true,battleTarget:"ally",desc:"味方1人のHPを全回復"},

    // MP recovery
    magicHerb:{id:"magicHerb",name:"マジックハーブ",icon:"🌿",price:800,sellRate:.10,battleUse:true,fieldUse:true,effect:"mpHeal",amount:40,battleTarget:"ally",desc:"味方1人のMPを40回復"},
    magicCondenseGrass:{id:"magicCondenseGrass",name:"魔凝草",icon:"🌿",price:2000,sellRate:.10,battleUse:true,fieldUse:true,effect:"mpHeal",amount:120,battleTarget:"ally",desc:"味方1人のMPを120回復"},
    spiritDew:{id:"spiritDew",name:"精霊の魔露",icon:"💧",price:5000,sellRate:.10,battleUse:true,fieldUse:true,effect:"mpHeal",amount:300,battleTarget:"ally",desc:"味方1人のMPを300回復"},

    // Recovery / revival
    antidote:{id:"antidote",name:"毒消し草",icon:"🌿",price:10,sellRate:.10,battleUse:true,fieldUse:true,effect:"cleanse",poisonOnly:true,battleTarget:"ally",desc:"味方1人の毒を解除"},
    panacea:{id:"panacea",name:"万能薬",icon:"✨",price:80,sellRate:.10,battleUse:true,fieldUse:true,effect:"cleanse",battleTarget:"ally",desc:"味方1人の状態異常をすべて解除"},
    lifeStone:{id:"lifeStone",name:"命の石",icon:"💠",price:250,sellRate:.10,battleUse:true,fieldUse:true,effect:"revive",revivePercent:.20,battleTarget:"ally",allowKO:true,desc:"味方1人の戦闘不能を解除し、HP20%で復活"},
    phoenixTail:{id:"phoenixTail",name:"フェニックスの羽",icon:"🔥",price:1500,sellRate:.10,battleUse:true,fieldUse:true,effect:"revive",revivePercent:1,battleTarget:"ally",allowKO:true,desc:"味方1人の戦闘不能を解除し、HPを全回復"},

    // Five-round 1.3x buffs, identical to the standard buff spells.
    polishDrink:{id:"polishDrink",name:"ポリッシュドリンク",icon:"🥤",price:400,sellRate:.10,battleUse:true,effect:"buff",buffs:["atk"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の攻撃力を一時的に上げる"},
    guardDrink:{id:"guardDrink",name:"ガードドリンク",icon:"🥤",price:400,sellRate:.10,battleUse:true,effect:"buff",buffs:["def"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の防御力を一時的に上げる"},
    magicDrink:{id:"magicDrink",name:"マジックドリンク",icon:"🥤",price:400,sellRate:.10,battleUse:true,effect:"buff",buffs:["magic"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の魔力を一時的に上げる"},
    blockDrink:{id:"blockDrink",name:"ブロックドリンク",icon:"🥤",price:400,sellRate:.10,battleUse:true,effect:"buff",buffs:["mdef"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の魔法防御力を一時的に上げる"},
    quickDrink:{id:"quickDrink",name:"クイックドリンク",icon:"🥤",price:400,sellRate:.10,battleUse:true,effect:"buff",buffs:["spd"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の素早さを一時的に上げる"},
    superDrink:{id:"superDrink",name:"スーパードリンク",icon:"🌈",price:2000,sellRate:.10,battleUse:true,effect:"buff",buffs:["atk","def","magic","mdef","spd"],multiplier:1.30,duration:5,battleTarget:"ally",desc:"味方1人の攻撃・防御・魔力・魔防・素早さを1.3倍（5ラウンド）"},
    palioCocktail:{id:"palioCocktail",name:"パリオカクテル",icon:"🍸",price:800,sellRate:.10,battleUse:true,effect:"buff",buffs:["atk"],multiplier:1.50,duration:4,battleTarget:"ally",desc:"滋養強壮効果もある、独特な風味のカクテル。戦闘中に使うと、味方1人の攻撃力を4ラウンドの間大きく上げる。"},

    // Non-magical battle utilities. Aura / Canceller do not stop these.
    cleanBall:{id:"cleanBall",name:"まっさらだま",icon:"⚪",price:1800,sellRate:.10,battleUse:true,effect:"dispel",battleTarget:"enemy",desc:"敵1体のバフ・強化状態をすべて解除。非魔法扱い"},
    mountOil:{id:"mountOil",name:"マウントオイル",icon:"🛢️",price:1000,sellRate:.10,battleUse:true,effect:"barrier",barrier:"mount",battleTarget:"ally",desc:"味方1人をマウント状態にする"},
    superOil:{id:"superOil",name:"スーペルオイル",icon:"🛢️",price:4000,sellRate:.10,battleUse:true,effect:"barrier",barrier:"mount",battleTarget:"allyAll",desc:"味方全員をマウント状態にする"},
    auraGear:{id:"auraGear",name:"オーラギア",icon:"⚙️",price:2000,sellRate:.10,battleUse:true,effect:"barrier",barrier:"aura",battleTarget:"ally",desc:"味方1人をオーラ状態にする"},
    auraMachine:{id:"auraMachine",name:"オーラマシン",icon:"🔮",price:8000,sellRate:.10,battleUse:true,effect:"barrier",barrier:"aura",battleTarget:"allyAll",desc:"味方全員をオーラ状態にする"},
    poisonGasBottle:{id:"poisonGasBottle",name:"毒ガス瓶",icon:"☠️",price:500,sellRate:.10,battleUse:true,effect:"statusAll",status:"poison",baseRate:STATUS_BASE_RATE.all,battleTarget:"enemyAll",desc:"敵全体を毒状態にする。ネオポイズン相当・非魔法扱い"},
    smokeBomb:{id:"smokeBomb",name:"煙幕玉",icon:"🌫️",price:500,sellRate:.10,battleUse:true,effect:"statusAll",status:"blind",baseRate:STATUS_BASE_RATE.all,battleTarget:"enemyAll",desc:"敵全体を暗闇状態にする。ネオブラインド相当・非魔法扱い"},
    sealingCrystal:{id:"sealingCrystal",name:"封印の水晶",icon:"🔇",price:500,sellRate:.10,battleUse:true,effect:"statusAll",status:"silence",baseRate:STATUS_BASE_RATE.all,battleTarget:"enemyAll",desc:"敵全体を封印状態にする。ネオサイレンス相当・非魔法扱い"},
    emergencyEscapePack:{id:"emergencyEscapePack",name:"緊急脱出パック",icon:"🏃",price:1000,sellRate:.10,battleUse:true,effect:"escape",battleTarget:"self",desc:"通常戦闘から100%の確率で逃走する"},
    deliciousMilk:{id:"deliciousMilk",name:"おいしいミルク",icon:"🥛",price:9500,sellRate:.10,battleUse:true,effect:"fortune",battleTarget:"self",desc:"敵全体の勧誘確率を少し上昇。"},

    // Exploration utilities
    returnFeather:{id:"returnFeather",name:"帰還の羽",icon:"🪶",price:150,sellRate:.10,fieldUse:true,fieldDirect:"return",desc:"探索を終了し、ミレスタへ即座に帰還する"},
    healLeaf:{id:"healLeaf",name:"ヒールリーフ",icon:"🍃",price:0,sellable:false,keyItem:true,desc:"ヨーディー地方原産の、傷によく効く薬草。"},
    granzerBadge:{id:"granzerBadge",name:"グランゼルのバッジ",icon:"⚜️",price:0,sellable:false,keyItem:true,desc:"グランゼルの国章が刻まれたバッジ。"},
    holyWater:{id:"holyWater",name:"聖水",icon:"💧",price:1500,sellRate:.10,fieldUse:true,fieldDirect:"stealth",successRate:.35,desc:"未踏の戦闘マスを個別に35%判定で無マス化。ステルスと使用枠共有・1マップ1回"},
    demonFireSeed:{id:"demonFireSeed",name:"魔界の火種",icon:"🔥",price:1000,sellRate:.10,fieldUse:true,fieldDirect:"nextBattle",desc:"次に進める通常ノードをすべて戦闘マスに変える"},
    restCross:{id:"restCross",name:"安息の十字架",icon:"✝️",price:1000,sellRate:.10,fieldUse:true,fieldDirect:"nextHeal",desc:"次に進める通常ノードをすべて回復マスに変える"},
    mysteriousMap:{id:"mysteriousMap",name:"不可思議な地図",icon:"🗺️",price:1000,sellRate:.10,fieldUse:true,fieldDirect:"nextEvent",desc:"次に進める通常ノードをすべてイベントマスに変える"},
    changeCube:{id:"changeCube",name:"チェンジキューブ",icon:"🎲",price:6000,sellRate:.10,fieldUse:true,fieldDirect:"rerollMap",desc:"未踏の通常ノードを戦闘・宝箱・回復・イベントからランダムに変更する"},

    // Permanent growth items. Seed bonuses are stored separately so level-ups never erase them.
    powerSeed:{id:"powerSeed",name:"力の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"atk",desc:"攻撃力を永続的に+1"},
    guardSeed:{id:"guardSeed",name:"守りの種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"def",desc:"防御力を永続的に+1"},
    intellectSeed:{id:"intellectSeed",name:"知性の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"magic",desc:"魔力を永続的に+1"},
    spiritSeed:{id:"spiritSeed",name:"精神の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"mdef",desc:"魔法防御を永続的に+1"},
    speedSeed:{id:"speedSeed",name:"敏捷の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"spd",desc:"素早さを永続的に+1"},
    fateSeed:{id:"fateSeed",name:"運命の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"fate",desc:"運命値を永続的に+1"},
    lifeSeed:{id:"lifeSeed",name:"生命の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"hpMax",desc:"最大HPを永続的に+1"},
    magicSeed:{id:"magicSeed",name:"魔法の種",icon:"🌱",price:1000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"mpMax",desc:"最大MPを永続的に+1"},
    allSeed:{id:"allSeed",name:"全能の種",icon:"🌟",price:8000,sellRate:.10,fieldUse:true,effect:"seed",seedStat:"all",desc:"最大HP・最大MP・攻撃・防御・魔力・魔防・素早さ・運命を永続的に+1"}
  };
  const NORMAL_SEED_IDS=["powerSeed","guardSeed","intellectSeed","spiritSeed","speedSeed","fateSeed","lifeSeed","magicSeed"];
  const BATTLE_ITEM_IDS=[
    "potion","highPotion","exPotion","lastPotion","magicHerb","magicCondenseGrass","spiritDew","antidote","panacea","lifeStone","phoenixTail",
    "polishDrink","guardDrink","magicDrink","blockDrink","quickDrink","superDrink","palioCocktail","cleanBall","mountOil","superOil","auraGear","auraMachine",
    "poisonGasBottle","smokeBomb","sealingCrystal","emergencyEscapePack","deliciousMilk"
  ];
  const FIELD_ITEM_IDS=[
    "potion","highPotion","exPotion","lastPotion","magicHerb","magicCondenseGrass","spiritDew","antidote","panacea","lifeStone","phoenixTail",
    "returnFeather","granzerBadge","holyWater","demonFireSeed","restCross","mysteriousMap","changeCube",
    "powerSeed","guardSeed","intellectSeed","spiritSeed","speedSeed","fateSeed","lifeSeed","magicSeed","allSeed"
  ];


  // v0.38e unified developer panel. Debug state itself is intentionally not persisted,
  // while game-state changes made through the panel can be saved normally.
  const DEBUG_TABS=["party","inventory","progress","battle"];
  let debugActiveTab="party";

  function currentScreenId(){ return document.querySelector(".screen.active")?.id || "homeScreen"; }
  function debugSelectedCharacter(){ return roster[$("debugCharacterSelect")?.value] || roster.hero; }
  function naturalSkillIdsAtLevel(c,level){
    const ids=[...(initialLearnedSkills[c.id]||[])];
    Object.entries(levelSkillTable[c.id]||{}).forEach(([lv,list])=>{ if(Number(lv)<=level) ids.push(...list); });
    return [...new Set(ids)].filter(id=>skills[id]);
  }
  function setCharacterLevelDev(c,level){
    if(!c) return;
    level=Math.max(1,Math.min(MAX_LEVEL,Math.round(Number(level)||1)));
    if(state.devSkillTestSnapshot) restoreDevSkillTestState();
    c.level=level;c.exp=0;
    const seed=seedBonusOf(c);
    const profile=profileFor(c);
    let base;
    if(profile){
      base=formalStatsAtLevel(profile,level,ensureCharacterFinalVariation(c));
    }else{
      const lv1={...(initialStats[c.id]||c.stats)};
      const g=c.growth || {hp:7,mp:2,atk:2,def:1,magic:1,mdef:1,spd:1};
      base={
        hpMax:(lv1.hpMax||1)+g.hp*(level-1),mpMax:(lv1.mpMax||0)+g.mp*(level-1),
        atk:(lv1.atk||0)+g.atk*(level-1),def:(lv1.def||0)+g.def*(level-1),
        magic:(lv1.magic||0)+g.magic*(level-1),mdef:(lv1.mdef||0)+g.mdef*(level-1),spd:(lv1.spd||0)+g.spd*(level-1)
      };
    }
    ["hpMax","mpMax","atk","def","magic","mdef","spd"].forEach(k=>base[k]=(Number(base[k])||0)+(Number(seed[k])||0));
    c.stats={hp:base.hpMax,hpMax:base.hpMax,mp:base.mpMax,mpMax:base.mpMax,atk:base.atk,def:base.def,magic:base.magic,mdef:base.mdef,spd:base.spd};
    const equip=equipmentStatDelta(c);
    Object.entries(equip).forEach(([k,v])=>{ if(k in c.stats)c.stats[k]+=v; });
    c.stats.hp=c.stats.hpMax;c.stats.mp=c.stats.mpMax;
    c.learnedSkills=naturalSkillIdsAtLevel(c,level);
    clearBattleOnlyStates(c,{preservePoison:false});
  }
  function debugJoinCharacter(id){
    if(!id || id==="hero" || !roster[id]) return "主人公は常に加入しています。";
    const result=addRecruitedSpecies(id);
    ensureHeroTravelMember();
    return `${roster[id].name}：${result}`;
  }
  function debugLeaveCharacter(id){
    if(!id || id==="hero") return "主人公は離脱できません。";
    if(!state.ownedSpecies.has(id)) return `${roster[id]?.name||id}は加入していません。`;
    state.ownedSpecies.delete(id);
    state.battleActive=state.battleActive.filter(x=>x!==id);
    state.battleReserve=state.battleReserve.filter(x=>x!==id);
    state.recruitedWaiting=(state.recruitedWaiting||[]).filter(x=>x!==id);
    ensureHeroTravelMember();
    if(state.battleActive.length===0){
      const heroPos=state.battleReserve.indexOf("hero");
      if(heroPos>=0){state.battleReserve.splice(heroPos,1);state.battleActive.push("hero");}
    }
    return `${roster[id].name}を仲間一覧から外しました。`;
  }
  function debugHealAll(){
    Object.values(roster).forEach(c=>{const st=S(c);st.hp=st.hpMax;st.mp=st.mpMax;clearBattleOnlyStates(c,{preservePoison:false});});
    if(state.run) updateRunHud();
    updateHeader();
  }
  function debugChangeEquipmentCount(id,delta){
    if(!equipmentCatalog[id] || ["bare","no_shield","no_body","no_accessory"].includes(id)) return;
    const floor=equippedCount(id);
    equipmentOwnedCounts[id]=Math.max(floor,Number(equipmentOwnedCounts[id]||0)+(Number(delta)||0));
  }
  function debugRefreshCharacterStatus(){
    const c=debugSelectedCharacter(); if(!c)return;
    const owned=c.id==="hero" || state.ownedSpecies.has(c.id);
    const loc=partyLocation(c.id);
    $("debugLevelInput").value=c.level||1;
    $("debugCharacterStatus").innerHTML=`<strong>${c.name}</strong>　Lv ${c.level||1}　${owned?'<span class="on">加入済み</span>':'<span class="off">未加入</span>'}　${owned?loc:"－"}<br>HP ${S(c).hp}/${S(c).hpMax}　MP ${S(c).mp}/${S(c).mpMax}　習得スキル ${(c.learnedSkills||[]).length}個`;
    $("debugJoinBtn").disabled=c.id==="hero" || owned;
    $("debugLeaveBtn").disabled=c.id==="hero" || !owned;
  }
  function debugRefreshInventoryStatus(){
    const itemId=$("debugItemSelect")?.value;
    const equipId=$("debugEquipSelect")?.value;
    const item=ITEMS[itemId],eq=equipmentCatalog[equipId];
    $("debugInventoryStatus").innerHTML=`所持金 <strong>${state.gold} G</strong>　${item?`${item.icon||""} ${item.name} <strong>×${itemCount(itemId)}</strong>`:""}　${eq?`${eq.icon||""} ${eq.name} <strong>×${ownedEquipmentCount(equipId)}</strong>`:""}`;
  }
  function debugFlagButton(btn,on){
    if(!btn)return; btn.textContent=on?"ON":"OFF";btn.classList.toggle("good",!!on);btn.classList.toggle("bad",!on);
  }
  function debugRefreshProgress(){
    debugFlagButton($("debugCaveToggleBtn"),state.caveUnlocked);
    debugFlagButton($("debugBossToggleBtn"),state.caveBossDefeated);
    debugFlagButton($("debugMerchantToggleBtn"),state.travelMerchantMet);
    debugFlagButton($("debugIntroToggleBtn"),prologueStage()>=1);
    updateHeader();
    if(typeof updateWorldInfo==="function") updateWorldInfo();
  }
  function debugPopulateFormationIndex(){
    const area=$("debugFormationArea").value;
    const pack=battleFormations[area]||battleFormations.plains;
    const sel=$("debugFormationIndex");sel.innerHTML="";
    pack.formations.forEach((ids,i)=>{
      const op=document.createElement("option");op.value=String(i);op.textContent=`${i+1}. ${ids.map(id=>enemyData[id]?.name||id).join(" + ")}`;sel.appendChild(op);
    });
    debugRefreshFormationStatus();
  }
  function debugRefreshFormationStatus(){
    const area=$("debugFormationArea")?.value;if(!area)return;
    const pack=battleFormations[area]||battleFormations.plains;
    const index=Math.max(0,Math.min(pack.formations.length-1,Number($("debugFormationIndex")?.value)||0));
    const ids=pack.formations[index]||[];
    $("debugFormationStatus").innerHTML=`<strong>${pack.label}</strong><br>${ids.map(id=>`${enemyData[id]?.name||id}（HP ${enemyData[id]?.stats?.hp||"?"}）`).join(" / ")}`;
  }
  function debugRefreshBattleOptions(){ debugFlagButton($("debugForceRecruitBtn"),state.devForceRecruit); }
  function refreshDebugTools(){
    debugRefreshCharacterStatus();debugRefreshInventoryStatus();debugRefreshProgress();debugRefreshFormationStatus();debugRefreshBattleOptions();
    const footer=$("debugFooterState");if(footer) footer.textContent=`現在：${currentScreenId().replace("Screen","")}`;
  }
  function setDebugTab(tab){
    if(!DEBUG_TABS.includes(tab))tab="party";debugActiveTab=tab;
    document.querySelectorAll(".debug-tab").forEach(b=>b.classList.toggle("active",b.dataset.debugTab===tab));
    document.querySelectorAll(".debug-page").forEach(p=>p.classList.toggle("active",p.dataset.debugPage===tab));
    refreshDebugTools();
  }
  function openDebugTools(){
    if(currentScreenId()==="titleScreen"){toast("ゲーム開始後に使用できます。");return;}
    $("debugModal").classList.add("show");setDebugTab(debugActiveTab);
  }
  function closeDebugTools(){ $("debugModal").classList.remove("show"); }
  function initDebugTools(){
    const charSel=$("debugCharacterSelect");
    Object.values(roster).filter(c=>!c.npcOnly).forEach(c=>{const op=document.createElement("option");op.value=c.id;op.textContent=c.name;charSel.appendChild(op);});
    const itemSel=$("debugItemSelect");
    Object.values(ITEMS).forEach(item=>{const op=document.createElement("option");op.value=item.id;op.textContent=`${item.icon||""} ${item.name}`;itemSel.appendChild(op);});
    const equipSel=$("debugEquipSelect");
    Object.values(equipmentCatalog).filter(x=>x && !["bare","no_shield","no_body","no_accessory"].includes(x.id)).forEach(item=>{const op=document.createElement("option");op.value=item.id;op.textContent=`${item.icon||""} ${item.name}`;equipSel.appendChild(op);});
    const areaSel=$("debugFormationArea");
    Object.entries(battleFormations).forEach(([id,pack])=>{const op=document.createElement("option");op.value=id;op.textContent=pack.label;areaSel.appendChild(op);});
    debugPopulateFormationIndex();

    $("debugCloseBtn").onclick=closeDebugTools;
    document.querySelectorAll(".debug-tab").forEach(b=>b.onclick=()=>setDebugTab(b.dataset.debugTab));
    charSel.onchange=debugRefreshCharacterStatus;
    $("debugJoinBtn").onclick=()=>{
      toast(debugJoinCharacter(charSel.value));
      if(currentScreenId()==="partyScreen") renderPartyManage(false);
      refreshDebugTools();
    };
    $("debugLeaveBtn").onclick=()=>{
      toast(debugLeaveCharacter(charSel.value));
      if(currentScreenId()==="partyScreen") renderPartyManage(false);
      refreshDebugTools();
    };
    $("debugJoinAllBtn").onclick=()=>{
      Object.values(roster)
        .filter(c=>c && c.id!=="hero" && !c.npcOnly)
        .forEach(c=>debugJoinCharacter(c.id));
      toast("全プレイアブルキャラを加入状態にしました。");
      if(currentScreenId()==="partyScreen") renderPartyManage(false);
      refreshDebugTools();
    };
    $("debugHealAllBtn").onclick=()=>{debugHealAll();toast("全キャラのHP・MPを回復しました。");refreshDebugTools();};
    $("debugSkillTestOpenBtn").onclick=()=>{closeDebugTools();openDevSkillTestMenu();};
    $("debugSetLevelBtn").onclick=()=>{const c=debugSelectedCharacter();setCharacterLevelDev(c,$("debugLevelInput").value);toast(`${c.name}をLv ${c.level}にしました。`);refreshDebugTools();};
    document.querySelectorAll("[data-debug-level]").forEach(b=>b.onclick=()=>{const c=debugSelectedCharacter();setCharacterLevelDev(c,Number(b.dataset.debugLevel));toast(`${c.name}をLv ${c.level}にしました。`);refreshDebugTools();});

    $("debugGoldAddBtn").onclick=()=>{state.gold=Math.max(0,state.gold+Math.max(1,Number($("debugGoldAmount").value)||1));updateHeader();refreshDebugTools();};
    $("debugGoldSubBtn").onclick=()=>{state.gold=Math.max(0,state.gold-Math.max(1,Number($("debugGoldAmount").value)||1));updateHeader();refreshDebugTools();};
    itemSel.onchange=debugRefreshInventoryStatus;equipSel.onchange=debugRefreshInventoryStatus;
    $("debugItemAddBtn").onclick=()=>{addItemCount(itemSel.value,Math.max(1,Number($("debugItemAmount").value)||1));refreshDebugTools();};
    $("debugItemSubBtn").onclick=()=>{addItemCount(itemSel.value,-Math.max(1,Number($("debugItemAmount").value)||1));refreshDebugTools();};
    $("debugEquipAddBtn").onclick=()=>{debugChangeEquipmentCount(equipSel.value,Math.max(1,Number($("debugEquipAmount").value)||1));refreshDebugTools();};
    $("debugEquipSubBtn").onclick=()=>{debugChangeEquipmentCount(equipSel.value,-Math.max(1,Number($("debugEquipAmount").value)||1));refreshDebugTools();};
    $("debugAllItemsBtn").onclick=()=>{Object.keys(ITEMS).forEach(id=>addItemCount(id,10));toast("全アイテムを10個ずつ追加しました。");refreshDebugTools();};
    $("debugAllEquipmentBtn").onclick=()=>{Object.values(equipmentCatalog).filter(x=>x && !["bare","no_shield","no_body","no_accessory"].includes(x.id)).forEach(x=>debugChangeEquipmentCount(x.id,1));toast("全装備を1個ずつ追加しました。");refreshDebugTools();};

    $("debugCaveToggleBtn").onclick=()=>{state.caveUnlocked=!state.caveUnlocked;debugRefreshProgress();};
    $("debugBossToggleBtn").onclick=()=>{state.caveBossDefeated=!state.caveBossDefeated;debugRefreshProgress();};
    $("debugMerchantToggleBtn").onclick=()=>{state.travelMerchantMet=!state.travelMerchantMet;debugRefreshProgress();};
    $("debugIntroToggleBtn").onclick=()=>{const on=prologueStage()<1;state.eventFlags.milestaIntroDone=on;state.prologueStage=on?1:0;if(!on)leaveElizaEscort();debugRefreshProgress();};
    $("debugProgressOpenBtn").onclick=()=>{state.caveUnlocked=true;state.caveBossDefeated=true;state.travelMerchantMet=true;state.eventFlags.milestaIntroDone=true;state.eventFlags.recruitTutorialDone=true;state.eventFlags.milestaWaitingUnlocked=true;state.eventFlags.caveSidepathUnlocked=true;state.eventFlags.yodyPortReached=true;state.eventFlags.yodyRegionUnlocked=true;state.eventFlags.yodyFootpathUnlocked=true;state.eventFlags.yodyMountainUnlocked=true;state.eventFlags.yodyMountainBossDefeated=true;state.eventFlags.yodyMountainCleared=true;state.eventFlags.tilenoRegionReached=true;state.eventFlags.tilenoTownReached=true;state.eventFlags.tilenoGuildPanaceaReceived=true;state.eventFlags.tilenoWetlandReached=true;state.eventFlags.tilenoToxicWetlandReached=true;state.eventFlags.tilenoToxicWarningFeatherReceived=true;state.eventFlags.tilenoToxicBossDefeated=true;state.eventFlags.margaretPoisonQuestCompleted=true;state.eventFlags.runelStoryLeadKnown=true;state.eventFlags.tilenoToxicBossAfterStoryDone=true;state.eventFlags.zelrenoForestReached=true;state.eventFlags.granzelPlainsReached=true;state.eventFlags.granzelTownReached=true;state.eventFlags.granzelArrivalPosterDone=true;state.eventFlags.granzelCompanionsHidden=true;state.eventFlags.granzelSoldierSceneDone=true;state.eventFlags.granzelKingAudienceDone=true;state.eventFlags.iceCorridorRouteUnlocked=true;state.eventFlags.iceCorridorReached=true;state.eventFlags.runelCavernReached=true;state.eventFlags.kunputeiReached=true;state.eventFlags.runelRegionReached=true;state.eventFlags.runelTownReached=true;state.eventFlags.runelRuinsReached=true;state.eventFlags.runelRuinsBossDefeated=true;state.eventFlags.runelRuinsCleared=true;state.eventFlags.margaretRunelReportPending=false;state.eventFlags.margaretRunelFirstReportDone=true;state.eventFlags.margaretRunelSecondReportDone=true;state.eventFlags.margaretThreeNationQuestStarted=true;state.eventFlags.fairyGroveDiscovered=true;state.eventFlags.margaretIceTopicSelf=true;state.eventFlags.margaretIceTopicMagicBond=true;state.eventFlags.margaretIceTopicWar=true;state.eventFlags.margaretIceCorridorMeetingDone=true;state.eventFlags.margaretPoisonQuestAccepted=true;state.eventFlags.prologueComplete=true;state.eventFlags.milestaWomanFeatherReceived=false;state.prologueStage=6;toast("現行の進行フラグをすべてONにしました。");debugRefreshProgress();};
    $("debugProgressResetBtn").onclick=()=>modal("進行フラグを初期化","現在実装されている進行フラグだけをOFFにします。仲間・所持品・Lv・装備は変わりません。",[["初期化する",()=>{state.caveUnlocked=false;state.caveBossDefeated=false;state.travelMerchantMet=false;state.eventFlags.milestaIntroDone=false;state.eventFlags.recruitTutorialDone=false;state.eventFlags.milestaWaitingUnlocked=false;state.eventFlags.caveSidepathUnlocked=false;state.eventFlags.yodyPortReached=false;state.eventFlags.yodyRegionUnlocked=false;state.eventFlags.yodyFootpathUnlocked=false;state.eventFlags.yodyMountainUnlocked=false;state.eventFlags.yodyMountainBossDefeated=false;state.eventFlags.yodyMountainCleared=false;state.eventFlags.tilenoRegionReached=false;state.eventFlags.tilenoTownReached=false;state.eventFlags.tilenoGuildPanaceaReceived=false;state.eventFlags.tilenoWetlandReached=false;state.eventFlags.tilenoToxicWetlandReached=false;state.eventFlags.tilenoToxicWarningFeatherReceived=false;state.eventFlags.tilenoToxicBossDefeated=false;state.eventFlags.margaretPoisonQuestCompleted=false;state.eventFlags.runelStoryLeadKnown=false;state.eventFlags.tilenoToxicBossAfterStoryDone=false;state.eventFlags.zelrenoForestReached=false;state.eventFlags.granzelPlainsReached=false;state.eventFlags.granzelTownReached=false;state.eventFlags.granzelArrivalPosterDone=false;state.eventFlags.granzelCompanionsHidden=false;state.eventFlags.granzelSoldierSceneDone=false;state.eventFlags.granzelKingAudienceDone=false;state.eventFlags.iceCorridorRouteUnlocked=false;state.eventFlags.iceCorridorReached=false;state.eventFlags.margaretIceTopicSelf=false;state.eventFlags.margaretIceTopicMagicBond=false;state.eventFlags.margaretIceTopicWar=false;state.eventFlags.margaretIceCorridorMeetingDone=false;state.eventFlags.margaretPoisonQuestAccepted=false;state.eventFlags.runelCavernReached=false;state.eventFlags.kunputeiReached=false;state.eventFlags.runelRegionReached=false;state.eventFlags.runelTownReached=false;state.eventFlags.runelRuinsReached=false;state.eventFlags.runelRuinsBossDefeated=false;state.eventFlags.runelRuinsCleared=false;state.eventFlags.margaretRunelReportPending=false;state.eventFlags.margaretRunelFirstReportDone=false;state.eventFlags.margaretRunelSecondReportDone=false;state.eventFlags.margaretThreeNationQuestStarted=false;state.eventFlags.fairyGroveDiscovered=false;state.eventFlags.footpathHealLeafObtained=false;state.eventFlags.yodyBoyTalked=false;state.eventFlags.yodyBoyQuestCompleted=false;state.eventFlags.salidDesertUnlocked=false;state.eventFlags.prologueComplete=false;state.currentTown="milesta";state.selectedArea="plains";state.eventFlags.milestaWomanFeatherReceived=false;state.prologueStage=0;leaveElizaEscort();closeModal();toast("進行フラグを初期状態にしました。");debugRefreshProgress();}],["やめる",closeModal]]);
    $("debugIntroReplayBtn").onclick=()=>{closeDebugTools();startStoryEvent("milestaIntroEliza",{preview:true,force:true});};

    areaSel.onchange=debugPopulateFormationIndex;$("debugFormationIndex").onchange=debugRefreshFormationStatus;
    $("debugBattleStartBtn").onclick=()=>{const area=areaSel.value,index=Number($("debugFormationIndex").value)||0;closeDebugTools();openBattle(false,area,{preserveParty:true,formationIndex:index});};
    $("debugForceRecruitBtn").onclick=()=>{state.devForceRecruit=!state.devForceRecruit;debugRefreshBattleOptions();toast(`勧誘強制成功：${state.devForceRecruit?"ON":"OFF"}`);};
    $("debugBattleSkillBtn").onclick=()=>{closeDebugTools();openDevSkillTestMenu();};
    $("debugBattleHealBtn").onclick=()=>{debugHealAll();toast("全キャラのHP・MPを回復しました。");refreshDebugTools();};
    refreshDebugTools();
  }

    function itemCount(id){ return Math.max(0,Number(state.items?.[id]||0)); }
  function addItemCount(id,n=1){
    if(!state.items) state.items={};
    state.items[id]=Math.max(0,Number(state.items[id]||0)+Number(n||0));
    updateHeader();
  }
  function removeItemCount(id,n=1){ if(itemCount(id)<n) return false; addItemCount(id,-n); return true; }
  function itemUsageLabel(item){
    if(item?.keyItem) return "使用不可";
    if(item?.battleUse && item?.fieldUse) return "戦闘・探索";
    if(item?.battleUse) return "戦闘専用";
    if(item?.fieldUse) return "探索専用";
    return "特殊";
  }
  const SHOP_STOCK={
    town:[
      {kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},
      {kind:"equip",id:"stone_claw"},{kind:"equip",id:"dagger"},{kind:"equip",id:"stone_axe"},{kind:"equip",id:"short_bow"},{kind:"equip",id:"hinoki_staff"},{kind:"equip",id:"whip"},{kind:"equip",id:"type_milesta"},
      {kind:"equip",id:"wood_shield"},{kind:"equip",id:"stone_greatshield"},{kind:"equip",id:"milesta_clothes"},{kind:"equip",id:"leather_armor"}
    ],
    // Town-specific stock. Later towns remain future-ready.
    yordy:[
      {kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},
      {kind:"equip",id:"bronze_knuckle"},{kind:"equip",id:"traveler_sword"},{kind:"equip",id:"traveler_bow"},
      {kind:"equip",id:"stone_axe"},{kind:"equip",id:"hinoki_staff"},{kind:"equip",id:"whip"},
      {kind:"equip",id:"buckler"},{kind:"equip",id:"stone_greatshield"},
      {kind:"equip",id:"traveler_clothes"},{kind:"equip",id:"bronze_mail"},{kind:"equip",id:"mage_robe"}
    ],
    tileno:[
      {kind:"item",id:"potion"},{kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},
      {kind:"equip",id:"bronze_knuckle"},{kind:"equip",id:"traveler_sword"},{kind:"equip",id:"bronze_axe"},{kind:"equip",id:"traveler_bow"},{kind:"equip",id:"mage_staff"},{kind:"equip",id:"bronze_whip"},{kind:"equip",id:"hunter"},
      {kind:"equip",id:"buckler"},{kind:"equip",id:"stone_greatshield"},
      {kind:"equip",id:"traveler_clothes"},{kind:"equip",id:"bronze_mail"},{kind:"equip",id:"mage_robe"},
      {kind:"equip",id:"bandana"},{kind:"equip",id:"full_face"},{kind:"equip",id:"hunter_charm"},{kind:"equip",id:"light_shoes"}
    ],
    granzel:[
      {kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},
      {kind:"equip",id:"steel_claw"},{kind:"equip",id:"iron_sword"},{kind:"equip",id:"steel_axe"},{kind:"equip",id:"iron_bow"},{kind:"equip",id:"iron_rod"},{kind:"equip",id:"iron_whip"},{kind:"equip",id:"type_zel"},
      {kind:"equip",id:"iron_buckler"},{kind:"equip",id:"iron_greatshield"},
      {kind:"equip",id:"traveler_clothes"},{kind:"equip",id:"iron_mail"},{kind:"equip",id:"mage_robe"},
      {kind:"equip",id:"hunter_charm"},{kind:"equip",id:"light_shoes"},{kind:"equip",id:"magic_earrings"},{kind:"equip",id:"zel_leggings"}
    ],
    runel:[
      {kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},
      {kind:"equip",id:"silver_knuckle"},{kind:"equip",id:"silver_sword"},{kind:"equip",id:"silver_axe"},{kind:"equip",id:"silver_bow"},{kind:"equip",id:"silver_rod"},{kind:"equip",id:"silver_whip"},{kind:"equip",id:"type_runel"},
      {kind:"equip",id:"silver_shield"},
      {kind:"equip",id:"runel_clothes"},{kind:"equip",id:"silver_mail"},{kind:"equip",id:"magical_cloth"},
      {kind:"equip",id:"runel_sneakers"},{kind:"equip",id:"talisman"}
    ],
    kunputei:[{kind:"item",id:"highPotion"},{kind:"item",id:"palioCocktail"}],
    plains:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"}],
    cave:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"alm_small_shield",stockLimit:1,stockKey:"travel:alm_small_shield"}],
    caveSide:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"hunter_charm"},{kind:"equip",id:"light_shoes"}],
    yodyRegion:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"growth_crystal",stockLimit:1,stockKey:"travel:yodyRegion:growth_crystal"}],
    footpath:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"growth_crystal",stockLimit:1,stockKey:"travel:yodyRegion:growth_crystal"}],
    yodyMountain:[{kind:"item",id:"potion"},{kind:"item",id:"antidote"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"growth_crystal",stockLimit:1,stockKey:"travel:yodyRegion:growth_crystal"}],
    tilenoRegion:[{kind:"item",id:"potion"},{kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"}],
    tilenoWetland:[{kind:"item",id:"potion"},{kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"}],
    tilenoToxicWetland:[
      {kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},
      {kind:"item",id:"guardDrink",stockLimit:2,sessionLimited:true},{kind:"item",id:"blockDrink",stockLimit:2,sessionLimited:true},{kind:"item",id:"poisonGasBottle",stockLimit:2,sessionLimited:true}
    ],
    zelrenoForest:[{kind:"item",id:"potion"},{kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"forest_circlet",stockLimit:1,stockKey:"travel:zelrenoForest:forest_circlet"}],
    zelrenoForestDeep:[{kind:"item",id:"potion"},{kind:"item",id:"highPotion"},{kind:"item",id:"antidote"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"forest_circlet",stockLimit:1,stockKey:"travel:zelrenoForest:forest_circlet"}],
    granzelPlains:[{kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"equip",id:"lightning_rod"},{kind:"item",id:"lifeSeed",stockLimit:1,sessionLimited:true},{kind:"item",id:"magicSeed",stockLimit:1,sessionLimited:true}],
    runelCavern:[{kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"item",id:"powerSeed",stockLimit:1,stockKey:"travel:runelRoute:powerSeed"},{kind:"item",id:"guardSeed",stockLimit:1,stockKey:"travel:runelRoute:guardSeed"}],
    runelRegion:[{kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"returnFeather"},{kind:"item",id:"lifeStone"},{kind:"equip",id:"fate_ring"},{kind:"item",id:"powerSeed",stockLimit:1,stockKey:"travel:runelRoute:powerSeed"},{kind:"item",id:"guardSeed",stockLimit:1,stockKey:"travel:runelRoute:guardSeed"}],
    runelRuins:[{kind:"item",id:"highPotion"},{kind:"item",id:"panacea"},{kind:"item",id:"lifeStone"},{kind:"item",id:"returnFeather"},{kind:"item",id:"magicSeed",stockLimit:1,stockKey:"travel:runelRuins:magicSeed"},{kind:"item",id:"spiritSeed",stockLimit:1,stockKey:"travel:runelRuins:spiritSeed"}]
  };
  function shopEntryData(entry){ return entry?.kind==="item"?ITEMS[entry.id]:equipmentCatalog[entry?.id]; }
  function shopEntryKey(entry){ return entry?`${entry.kind}:${entry.id}`:""; }
  function shopStockLimit(entry){
    const n=Number(entry?.stockLimit);
    return Number.isFinite(n)&&n>=0?Math.floor(n):null;
  }
  function shopStockKey(entry){ return entry?.stockKey||null; }
  function shopPurchasedCount(entry){
    if(entry?.sessionLimited){
      const key=shopEntryKey(entry);
      return Math.max(0,Math.floor(Number(state.shopSessionPurchases?.[key])||0));
    }
    const key=shopStockKey(entry);
    if(!key) return 0;
    return Math.max(0,Math.floor(Number(state.limitedShopPurchases?.[key])||0));
  }
  function shopRemainingStock(entry){
    const limit=shopStockLimit(entry);
    return limit===null?null:Math.max(0,limit-shopPurchasedCount(entry));
  }
  function shopStockBadgeHtml(entry,mode="buy"){
    if(mode!=="buy") return "";
    const remaining=shopRemainingStock(entry);
    if(remaining===null) return "";
    return remaining>0
      ? `<span class="shop-stock-badge">◆ 限定 残り${remaining}</span>`
      : `<span class="shop-stock-badge soldout">売り切れ</span>`;
  }
  function recordLimitedShopPurchase(entry){
    if(shopStockLimit(entry)===null) return;
    if(entry?.sessionLimited){
      if(!state.shopSessionPurchases || typeof state.shopSessionPurchases!=="object") state.shopSessionPurchases={};
      state.shopSessionPurchases[shopEntryKey(entry)]=shopPurchasedCount(entry)+1;
      return;
    }
    const key=shopStockKey(entry);
    if(!key) return;
    if(!state.limitedShopPurchases || typeof state.limitedShopPurchases!=="object") state.limitedShopPurchases={};
    state.limitedShopPurchases[key]=shopPurchasedCount(entry)+1;
  }
  function sellPriceFor(entry){ const d=shopEntryData(entry); return Math.floor((d?.price||0)*(entry.kind==="equip" ? .50 :(d?.sellRate??.10))); }
  function shopSellEntries(){
    const out=[];
    Object.values(ITEMS).forEach(item=>{ if(item.sellable!==false && item.price>0 && itemCount(item.id)>0) out.push({kind:"item",id:item.id}); });
    Object.entries(equipmentOwnedCounts).forEach(([id,count])=>{ const d=equipmentCatalog[id]; if(d?.price>0 && freeEquipmentCount(id)>0) out.push({kind:"equip",id}); });
    return out;
  }
  function buyShopEntry(entry){
    const d=shopEntryData(entry),price=Number(d?.price)||0;
    const remaining=shopRemainingStock(entry);
    if(remaining!==null && remaining<=0){ toast("この商品は売り切れです"); renderShop(); return; }
    if(state.gold<price){ toast("お金が足りません"); return; }
    state.gold-=price;
    if(entry.kind==="item") addItemCount(entry.id,1); else addEquipmentOwned(entry.id,1);
    recordLimitedShopPurchase(entry);
    state.shopSelectedKey=shopEntryKey(entry); renderShop(); updateHeader(); showShopFeedback(`✅ ${d.name}を購入しました`,`buy`); toast(`✅ ${d.name}を購入しました`);
  }
  function sellShopEntry(entry){
    const d=shopEntryData(entry),price=sellPriceFor(entry);
    if(entry.kind==="item") { if(!removeItemCount(entry.id,1)) return; }
    else { if(freeEquipmentCount(entry.id)<=0) return; equipmentOwnedCounts[entry.id]--; }
    state.gold+=price; state.shopSelectedKey=shopEntryKey(entry); renderShop(); updateHeader(); showShopFeedback(`💠 ${d.name}を売却しました`,`sell`); toast(`💠 ${d.name}を ${price}G で売却しました`);
  }
  const SHOP_COMPARE_STATS=[
    ["hpMax","HP",v=>String(v)],["mpMax","MP",v=>String(v)],["atk","攻",v=>String(v)],["def","防",v=>String(v)],
    ["magic","魔",v=>String(v)],["mdef","魔防",v=>String(v)],["spd","速",v=>String(v)],
    ["crit","会心",v=>`${Number(v).toFixed(1)}%`],["evasion","回避",v=>`${Number(v).toFixed(1)}%`],["fate","運",v=>String(v)]
  ];
  function shopBattleMemberIds(){ return state.battleActive.filter(id=>roster[id]).slice(0,4); }
  function shopDiffChip(label,cur,pre,format){
    const diff=Number(pre)-Number(cur); if(Math.abs(diff)<.0001) return "";
    const cls=diff>0?"up":"down",arrow=diff>0?"▲":"▼";
    return `<span class="shop-diff ${cls}">${label}${arrow}${format(Math.abs(diff))}</span>`;
  }
  function shopResistanceDiffChip(key,cur,pre){
    const ci=RESISTANCE_RANK_ORDER.indexOf(cur),pi=RESISTANCE_RANK_ORDER.indexOf(pre);
    if(ci<0||pi<0||ci===pi) return "";
    const up=pi>ci,cls=up?"up":"down",arrow=up?"▲":"▼";
    return `<span class="shop-diff resist ${cls}">${RESISTANCE_LABELS[key]||key}${arrow}${pre}</span>`;
  }
  function shopEquipSummaryHtml(item){
    const bits=equipmentItemBits(null,item);
    if(!bits.length) return "";
    const chips=bits.map(bit=>{
      const resist=bit.includes("耐性"),down=/-\d/.test(bit);
      return `<span class="shop-equip-chip${resist?" resist":""}${down?" down":""}">${bit}</span>`;
    }).join("");
    return `<div class="shop-equip-summary"><div class="shop-equip-summary-title">装備性能</div><div class="shop-equip-chip-list">${chips}</div></div>`;
  }
  function shopEquipCompareHtml(item){
    const ids=shopBattleMemberIds();
    if(!ids.length) return `<div class="shop-empty">比較できるバトルメンバーがいません</div>`;
    const cards=ids.map(id=>{
      const c=roster[id],slot=item.slot,preview=equipmentPreviewState(c,slot,item.id);
      const statChips=SHOP_COMPARE_STATS.map(([key,label,format])=>shopDiffChip(label,preview.cur[key]||0,preview.pre[key]||0,format)).filter(Boolean);
      const resistPreview=equipmentResistancePreview(c,preview.eq);
      const resistChips=[...ATTRIBUTE_RESISTANCE_KEYS,...STATUS_RESISTANCE_KEYS].map(key=>shopResistanceDiffChip(key,resistPreview.cur[key],resistPreview.pre[key])).filter(Boolean);
      const chips=[...statChips,...resistChips];
      const favored=item.slot==="weapon" && item.weaponType && favoriteWeaponTypes(c).includes(item.weaponType);
      return `<div class="shop-compare-card"><div class="shop-compare-thumb">${c.img?`<img src="${c.img}" alt="${c.name}">`:"👤"}</div><div class="shop-compare-info"><div class="shop-compare-name">${c.name}${favored?`<span class="shop-favorite">得意</span>`:""}</div><div class="shop-diff-line">${chips.length?chips.join(""):`<span class="shop-nochange">能力・耐性は変化なし</span>`}</div></div></div>`;
    }).join("");
    return `<div class="shop-compare-grid">${cards}</div>`;
  }
  function renderShopDetail(entry,mode){
    const box=$("shopDetail"); if(!box)return;
    if(!entry){ box.innerHTML=`<div class="shop-empty">商品を選択してください</div>`; return; }
    const d=shopEntryData(entry); if(!d){box.innerHTML="";return;}
    const price=mode==="buy"?Number(d.price||0):sellPriceFor(entry);
    const owned=entry.kind==="item"?itemCount(entry.id):ownedEquipmentCount(entry.id);
    const free=entry.kind==="equip"?freeEquipmentCount(entry.id):owned;
    const remaining=mode==="buy"?shopRemainingStock(entry):null;
    const soldOut=remaining!==null&&remaining<=0;
    const can=mode==="buy"?!soldOut&&state.gold>=price:(entry.kind==="item"?owned>0:free>0);
    let middle="";
    if(entry.kind==="equip") middle=`<div class="shop-compare">${shopEquipCompareHtml(d)}</div>`;
    else middle=`<div class="shop-compare"><div class="shop-consumable-info"><div class="shop-info-row"><span>所持数</span><strong>×${owned}</strong></div><div class="shop-info-row"><span>使用区分</span><strong>${itemUsageLabel(d)}</strong></div><div class="shop-info-row"><span>売却価格</span><strong>${d.sellable===false?"売却不可":`${sellPriceFor(entry)} G`}</strong></div></div></div>`;
    let note="";
    if(mode==="buy"){
      if(soldOut) note="◆ 限定在庫：売り切れ";
      else if(remaining!==null) note=`◆ 限定在庫：残り${remaining}${state.gold<price?" ／ 所持金が足りません":""}`;
      else note=can?"":"所持金が足りません。";
    }else note=entry.kind==="equip"?`売却可能 ×${free}（装備中の品は売れません）`:`所持 ×${owned}`;
    const equipSummary=entry.kind==="equip"?shopEquipSummaryHtml(d):"";
    box.innerHTML=`<div class="shop-detail-head"><div class="shop-detail-icon">${d.icon||"📦"}</div><div class="shop-detail-name"><b>${d.name}</b><small>${entry.kind==="equip"?EQUIPMENT_SLOT_LABELS[d.slot]||"装備":"アイテム"}</small></div><div class="shop-detail-price">${price} G</div></div><div class="shop-detail-desc">${d.desc||"説明はありません。"}</div>${equipSummary}${middle}<div class="shop-action-row"><div class="shop-action-note${remaining!==null?" limited":""}">${note}</div><button class="shop-action-btn${mode==="sell"?" sell":""}" ${can?"":"disabled"}>${mode==="buy"?(soldOut?"売り切れ":"購入する"):"売却する"}</button></div>`;
    const btn=box.querySelector(".shop-action-btn"); if(btn)btn.onclick=()=>mode==="buy"?buyShopEntry(entry):sellShopEntry(entry);
  }
  function renderShop(){
    const key=state.currentShop||"town",mode=state.shopMode||"buy";
    $("shopBuyTab").classList.toggle("active",mode==="buy"); $("shopSellTab").classList.toggle("active",mode==="sell");
    $("shopGold").textContent=`${state.gold} G`;
    const entries=mode==="buy"?(SHOP_STOCK[key]||[]):shopSellEntries(); const box=$("shopList"); box.innerHTML="";
    if(!entries.length){ state.shopSelectedKey=null; box.innerHTML=`<div class="shop-empty">${mode==="buy"?"商品がありません":"売却できる品がありません"}</div>`; renderShopDetail(null,mode); return; }
    let selected=entries.find(e=>shopEntryKey(e)===state.shopSelectedKey); if(!selected){selected=entries[0];state.shopSelectedKey=shopEntryKey(selected);}
    entries.forEach(entry=>{
      const d=shopEntryData(entry); if(!d)return; const selectedNow=shopEntryKey(entry)===state.shopSelectedKey;
      const price=mode==="buy"?d.price:sellPriceFor(entry); const count=entry.kind==="item"?itemCount(entry.id):ownedEquipmentCount(entry.id); const free=entry.kind==="equip"?freeEquipmentCount(entry.id):count;
      const remaining=mode==="buy"?shopRemainingStock(entry):null; const soldOut=remaining!==null&&remaining<=0;
      const row=document.createElement("button"); row.type="button"; row.className=`shop-row${selectedNow?" selected":""}${soldOut?" soldout":""}`;
      row.innerHTML=`<span class="ico">${d.icon||"📦"}</span><span class="shop-row-main"><b>${d.name}</b><small>${entry.kind==="equip"?`${EQUIPMENT_SLOT_LABELS[d.slot]||"装備"}${d.slot==="weapon"&&d.weaponType?`・${weaponTypeLabels[d.weaponType]||""}`:""}`:(d.desc||"")}</small></span><span class="shop-row-side"><span class="shop-price">${price} G</span><span class="shop-row-meta">${shopStockBadgeHtml(entry,mode)}<span class="shop-owned">${mode==="sell"&&entry.kind==="equip"?`売却可×${free}`:`所持×${count}`}</span></span></span>`;
      row.onclick=()=>{state.shopSelectedKey=shopEntryKey(entry);renderShop();}; box.appendChild(row);
    });
    renderShopDetail(selected,mode);
  }
  function setShopMerchant(key){
    const img=$("shopMerchantImg"),sil=$("shopMerchantSilhouette");
    img.classList.remove("show");sil.classList.remove("show","female"); img.removeAttribute("src");
    if(key==="plains" || key==="cave" || key==="caveSide" || key==="yodyRegion" || key==="footpath" || key==="yodyMountain" || key==="tilenoRegion" || key==="tilenoWetland" || key==="tilenoToxicWetland" || key==="zelrenoForest" || key==="zelrenoForestDeep" || key==="granzelPlains" || key==="runelCavern" || key==="runelRegion" || key==="runelRuins"){
      img.src=TRAVEL_MERCHANT_IMG; img.alt="旅の商人"; img.classList.add("show");
      const first=!state.travelMerchantMet;
      $("shopMerchantLine").textContent=first?"おや？お主は……ククク、これは面白い。私は旅の商人だ。さあ、買って行くといい":"ここで会ったのも何かの縁だ……。さあ、買って行くといい";
      if(first){state.travelMerchantMet=true;}
    }else if(key==="kunputei"){
      sil.style.webkitMaskImage=`url("${MOB_MERCHANT_IMG}")`; sil.style.maskImage=`url("${MOB_MERCHANT_IMG}")`; sil.classList.add("show");
      $("shopMerchantLine").textContent="旅の途中でしょう。必要なものがあれば、どうぞご覧ください。";
    }else{
      sil.style.webkitMaskImage=`url("${MOB_MERCHANT_IMG}")`; sil.style.maskImage=`url("${MOB_MERCHANT_IMG}")`; sil.classList.add("show");
      $("shopMerchantLine").textContent="いらっしゃいませ。必要なものがあれば、どうぞご覧ください。";
    }
  }
  function openShop(key="town"){
    state.currentShop=key; state.shopMode="buy"; state.shopSelectedKey=null; state.shopSessionPurchases={};
    const shopTitles={town:"ミレスタ商店",yordy:"港町ヨーディー商店",tileno:"ティレーノ商店",granzel:"グランゼル城下町商店",runel:"ルネルの街商店",kunputei:"薫風亭・売店",cave:"洞窟の旅商人",caveSide:"洞窟の横道・旅商人",yodyRegion:"ヨーディー地方・旅商人",footpath:"麓の小道・旅商人",yodyMountain:"ヨーディー山道・旅商人",tilenoRegion:"ティレーノ地方・旅商人",tilenoWetland:"ティレーノ湿原・旅商人",tilenoToxicWetland:"ティレーノ毒湿地・旅商人",zelrenoForest:"ゼルレーノ森林地帯・旅商人",zelrenoForestDeep:"ゼルレーノ森林地帯・奥地・旅商人",granzelPlains:"グランゼル大平原・旅商人",runelCavern:"ルネル岩窟・旅商人",runelRegion:"ルネル地方・旅商人",runelRuins:"ルネルパリオ城下町跡・旅商人",plains:"旅の商人"};
    $("shopTitle").textContent=shopTitles[key]||"旅の商人";
    $("shopLead").textContent="商品を選ぶと、装備時の能力差をその場で確認できます。";
    setShopMerchant(key); renderShop(); const sf=$("shopFlash"); if(sf){sf.textContent=""; sf.className="shop-flash";} $("shopModal").classList.add("show");
  }
  function closeShop(){ const sf=$("shopFlash"); if(sf){sf.textContent=""; sf.className="shop-flash";} $("shopModal").classList.remove("show"); state.currentShop=null; state.shopSelectedKey=null; }
  $("shopCloseBtn").onclick=closeShop;
  $("shopBuyTab").onclick=()=>{state.shopMode="buy";state.shopSelectedKey=null;renderShop();};
  $("shopSellTab").onclick=()=>{state.shopMode="sell";state.shopSelectedKey=null;renderShop();};
  $("shopModal").addEventListener("click",e=>{if(e.target===$("shopModal"))closeShop();});

  // Default v0.8 is deliberately slower than v0.7.
  const BASE_TIME = {
    short:360,
    message:560,
    actionLead:420,
    hit:520,
    enemyLead:720,
    enemyAfter:820,
    heal:720,
    buff:720,
    koHold:520,
    koFade:260,
    roundGap:520
  };
  function speedFactor(){ return Math.max(.5,Number(state.battleSpeed)||1); }
  function t(ms){ return Math.round(ms / speedFactor()); }
  function wait(ms){ return new Promise(r=>setTimeout(r,t(ms))); }

  function hpPct(c){ return Math.max(0,Math.min(100,Math.round(S(c).hp/S(c).hpMax*100))); }
  function mpPct(c){ return Math.max(0,Math.min(100,Math.round(S(c).mp/S(c).mpMax*100))); }
  function battleTraitSlots({livingOnly=true}={}){
    const slots=state.battleActive.map((id,i)=>({id,i,c:roster[id]})).filter(x=>!!x.c);
    return livingOnly ? slots.filter(x=>S(x.c).hp>0) : slots;
  }
  // v0.38e rule: unless a trait explicitly says otherwise, battle-start / in-battle / battle-end traits only work while the owner is in battleActive.
  function livingActiveSlots(){ return battleTraitSlots({livingOnly:true}); }
  function livingEnemies(){ return state.battleEnemies.filter(e=>e.hp>0 && !e.escaped); }
  function setMessage(text){ $("battleMessage").textContent=text; }
  function effectiveAtk(c){ return Math.round(S(c).atk*(c.atkBuff||1)*(conditionsOf(c).berserk?1.60:1)*((c.powerChargeRounds||0)>0?(c.powerChargeMultiplier||2):1)); }
  function effectiveDef(c){ return Math.round(S(c).def*(c.defBuff||1)); }
  function effectiveMagic(c){ return Math.round(S(c).magic*(c.magicBuff||1)*((c.magicConcentrationRounds||0)>0?(c.magicConcentrationMultiplier||2):1)); }
  function effectiveMdef(c){ return Math.round(S(c).mdef*(c.mdefBuff||1)); }
  function effectiveSpd(c){ return Math.round(S(c).spd*(c.spdBuff||1)); }
  function traitOf(c){ return characterProfiles[c?.profileId]?.trait || null; }
  function makeTraitActionContext(){ return {triggeredTraits:new Set(),triggeredPassives:new Set()}; }
  function traitRoll(trait){ return !!trait && Number(trait.chance)>0 && Math.random()<Number(trait.chance); }


  function battleSkillCost(actor,sk){
    const base=Math.max(0,Number(sk?.cost)||0);
    if(base<=0) return 0;
    let reduction=0;
    livingActiveSlots().forEach(({c})=>{
      if(!c || c.id===actor?.id) return;
      const effect=traitOf(c)?.effect;
      if(effect?.type==="partyMpCostReduction") reduction+=Math.max(0,Number(effect.percent)||0)/100;
    });
    reduction=Math.min(.90,reduction);
    return Math.max(1,Math.ceil(base*(1-reduction)));
  }

  function criticalRateForAttack(actor,target){
    let rate=criticalRateForActor(actor);
    const effect=traitOf(actor)?.effect;
    if(effect?.type==="lowHpCritBonus" && target && Number(target.hpMax)>0 && Number(target.hp)/Number(target.hpMax)<=Number(effect.threshold||.50)){
      rate+=Number(effect.bonus)||0;
    }
    return clampRate(rate);
  }

  function partyElementDamageTakenMultiplier(element){
    if(!element) return 1;
    let reduction=0;
    livingActiveSlots().forEach(({c})=>{
      const effect=traitOf(c)?.effect;
      if(effect?.type==="partyElementDamageReduction" && effect.element===element) reduction+=(Number(effect.percent)||0)/100;
    });
    return Math.max(0,1-reduction);
  }

  function elementDamageNullifiedByTrait(target,element){
    const trait=traitOf(target),effect=trait?.effect;
    if(effect?.type!=="elementDamageNullifyChance" || !Array.isArray(effect.elements) || !effect.elements.includes(element)) return false;
    const chance=Math.max(0,Math.min(1,Number(effect.chance)||Number(trait?.chance)||0));
    return chance>0 && Math.random()<chance;
  }

  function incomingElementDamageTrait(target,element,damage){
    const raw=Math.max(0,Math.round(Number(damage)||0));
    const trait=traitOf(target),effect=trait?.effect;
    if(!target || !element || raw<=0 || !effect) return {damage:raw,reason:null,heal:0,trait:null};
    if(effect.type==="absorbElementHealFixed" && effect.element===element){
      const healCap=Math.max(0,Number(effect.heal)||0);
      const heal=Math.min(Math.max(0,S(target).hpMax-S(target).hp),healCap);
      if(heal>0) S(target).hp+=heal;
      return {damage:0,reason:"absorb",heal,trait};
    }
    if(effect.type==="fireImmuneAndNeutralPhysicalElement" && effect.immuneElement===element){
      return {damage:0,reason:"immune",heal:0,trait};
    }
    if(effect.type==="elementDamageNullifyChance" && Array.isArray(effect.elements) && effect.elements.includes(element)){
      const chance=Math.max(0,Math.min(1,Number(effect.chance)||Number(trait?.chance)||0));
      if(chance>0 && Math.random()<chance) return {damage:0,reason:"legacy",heal:0,trait};
    }
    return {damage:raw,reason:null,heal:0,trait:null};
  }

  function enemyElementNullify(target,element,damage){
    const raw=Math.max(0,Math.round(Number(damage)||0));
    const rate=Math.max(0,Math.min(1,Number(target?.elementNullifyRate)||0));
    const elements=Array.isArray(target?.elementNullifyElements)?target.elementNullifyElements:[];
    if(raw>0 && element && rate>0 && elements.includes(element) && Math.random()<rate){
      return {damage:0,nullified:true};
    }
    return {damage:raw,nullified:false};
  }

  function physicalAttackElementForActor(actor,skillElement=null){
    if(skillElement) return skillElement;
    const effect=traitOf(actor)?.effect;
    return effect?.type==="fireImmuneAndNeutralPhysicalElement" ? (effect.physicalElement||null) : null;
  }

  function physicalElementDamageMultiplierForActor(actor,target,skillElement=null){
    const element=physicalAttackElementForActor(actor,skillElement);
    if(!element) return 1;
    return elementResistanceMultiplier(target,element)*partyElementDamageMultiplier(element);
  }

  function triggerElementDamageBuffTrait(target,element,damage){
    if(!target || Number(damage)<=0) return null;
    const trait=traitOf(target),effect=trait?.effect;
    if(effect?.type!=="buffOnElementDamageReceived" || effect.element!==element) return null;
    const result=applyStatBuff(target,{buff:effect.buff||"atk",multiplier:Number(effect.multiplier)||1.30,duration:Number(effect.duration)||5});
    return {trait,effect,result};
  }

  function poisonedEnemyStatMultiplier(enemy){
    if(!enemy || !conditionsOf(enemy).poison) return 1;
    const source=livingActiveSlots().find(({c})=>traitOf(c)?.effect?.type==="poisonedEnemyAllStatDown");
    return source ? Number(traitOf(source.c).effect.multiplier)||.70 : 1;
  }

  function effectiveEnemyStat(enemy,key){
    const base=Math.max(0,Number(enemy?.[key])||0);
    const buffKey={atk:"atkBuff",def:"defBuff",magic:"magicBuff",mdef:"mdefBuff",spd:"spdBuff"}[key];
    const buff=buffKey?Math.max(0,Number(enemy?.[buffKey])||1):1;
    return Math.round(base*buff*poisonedEnemyStatMultiplier(enemy));
  }

  function enemyDefenseForAttacker(actor,enemy){
    const effect=traitOf(actor)?.effect;
    if(effect?.type==="ignoreEnemyDefenseBuff" && Math.max(0,Number(enemy?.defBuff)||1)>1){
      const base=Math.max(0,Number(enemy?.def)||0);
      return Math.round(base*poisonedEnemyStatMultiplier(enemy));
    }
    return effectiveEnemyStat(enemy,"def");
  }

  async function maybeTriggerPureHunterCounter(defender,slot,attacker,sk,context){
    const trait=traitOf(defender),effect=trait?.effect;
    if(trait?.id!=="pureHunter" || effect?.type!=="magicCounter" || !attacker || attacker.hp<=0 || S(defender).hp<=0) return false;
    if(sk?.element===effect.excludeElement) return false;
    if(!context) context=makeTraitActionContext();
    const key=`pureHunter:${defender.id}`;
    if(context.triggeredTraits.has(key) || !traitRoll(trait)) return false;
    context.triggeredTraits.add(key);
    setMessage(`🏹 ${defender.name} の「清純なる狩人」！ ${attacker.displayName} に反撃！`);
    await wait(BASE_TIME.short);
    const result=await resolveBasicAttack(defender,{type:"attack",targetUid:attacker.uid},{allowDoubleAttack:false,isCounter:true});
    if(result?.battleWon && !state.battleEnded){ winBattle(); return true; }
    return false;
  }

  const SAGE_WISDOM_STATS=[
    {key:"atk",buff:"atk",name:"攻撃力"},{key:"def",buff:"def",name:"防御力"},{key:"magic",buff:"magic",name:"魔力"},{key:"mdef",buff:"mdef",name:"魔法防御力"},{key:"spd",buff:"spd",name:"素早さ"}
  ];
  function sageWisdomHighestStat(c){
    const values=SAGE_WISDOM_STATS.map(info=>({info,value:Number(S(c)[info.key])||0}));
    const max=Math.max(...values.map(x=>x.value));
    return choose(values.filter(x=>x.value===max))?.info || SAGE_WISDOM_STATS[0].info;
  }
  async function maybeTriggerSageWisdom(revivedCharacters=[]){
    if(!revivedCharacters.length || state.battleEnded) return false;
    const sages=livingActiveSlots().filter(({c})=>traitOf(c)?.effect?.type==="buffHighestStatOnRevive");
    if(!sages.length) return false;
    let triggered=false;
    for(const {c:sage} of sages){
      const effect=traitOf(sage).effect;
      for(const target of revivedCharacters){
        if(!target || S(target).hp<=0) continue;
        const stat=sageWisdomHighestStat(target);
        const result=applyStatBuff(target,{buff:stat.buff,multiplier:Number(effect.multiplier)||1.30,duration:Number(effect.duration)||5});
        renderBattleParty();
        setMessage(result.applied
          ? `📚 ${sage.name} の「賢者の知恵」！ ${target.name} の${stat.name}が上がった！`
          : `📚 ${sage.name} の「賢者の知恵」！ ${target.name} の${stat.name}には、より強い強化効果がかかっている。`);
        await wait(BASE_TIME.buff);
        triggered=true;
      }
    }
    return triggered;
  }

  const MAID_GIFT_STATS=["atk","def","magic","mdef","spd"];
  async function maybeTriggerMaidGiftOnKo(maid){
    if(!maid || S(maid).hp>0 || !state.battleActive.includes(maid.id)) return false;
    const trait=traitOf(maid),effect=trait?.effect;
    if(trait?.id!=="maidGift" || effect?.type!=="buffOtherAlliesOnKo" || maid._maidGiftTriggeredThisBattle) return false;
    maid._maidGiftTriggeredThisBattle=true;
    const targets=livingActiveSlots().filter(({c})=>c.id!==maid.id);
    if(!targets.length) return false;
    const boosted=[];
    for(const {c,i} of targets){
      const stat=choose(MAID_GIFT_STATS);
      const result=applyStatBuff(c,{buff:stat,multiplier:Number(effect.multiplier)||1.30,duration:Number(effect.duration)||5});
      if(result.applied){
        boosted.push(c.name);
        flashPartyValue(i,"","buff",BUFF_INFO[stat]?.label||"UP");
      }
    }
    renderBattleParty();
    setMessage(`🧹 ${maid.name} の「メイドの土産」！ ${boosted.length?"残った味方の能力が上がった！":"味方にはより強い強化効果がかかっている。"}`);
    await wait(BASE_TIME.buff);
    return true;
  }


  function healAmountForSkill(actor,sk){
    if(sk.fullHeal) return Infinity;
    const mag=Math.max(0,effectiveMagic(actor)||0);
    const base=Number(sk.healBase)||0;
    const magicRate=Number(sk.healMagic)||0;
    const scale=Number(sk.healScale)||1;
    return Math.max(1,Math.round((base+mag*magicRate)*scale));
  }

  const BUFF_INFO={
    atk:{value:"atkBuff",rounds:"atkBuffRounds",label:"ATK↑",name:"攻撃力"},
    def:{value:"defBuff",rounds:"defBuffRounds",label:"DEF↑",name:"防御力"},
    magic:{value:"magicBuff",rounds:"magicBuffRounds",label:"MAG↑",name:"魔力"},
    mdef:{value:"mdefBuff",rounds:"mdefBuffRounds",label:"MDEF↑",name:"魔法防御力"},
    spd:{value:"spdBuff",rounds:"spdBuffRounds",label:"SPD↑",name:"素早さ"}
  };

  function applyStatBuff(target,sk){
    const info=BUFF_INFO[sk.buff];
    if(!info || !target) return {applied:false,reason:"invalid",info};
    let multiplier=Number(sk.multiplier)||1;
    const traitEffect=traitOf(target)?.effect;
    if(sk.buff==="def" && traitEffect?.type==="buffMultiplierBonus" && traitEffect.stat==="def"){
      multiplier+=Number(traitEffect.add)||0;
    }
    const current=Number(target[info.value])||1;
    if(current>multiplier) return {applied:false,reason:"stronger",info};
    target[info.value]=multiplier;
    target[info.rounds]=Number(sk.duration)||0;
    return {applied:true,reason:current===multiplier?"refresh":"applied",info,multiplier};
  }

  function clearNegativeConditions(target,{poisonOnly=false}={}){
    const cond=conditionsOf(target);
    // Berserk is a beneficial special state: Fresh / Auto Fresh do not remove it.
    const keys=poisonOnly?["poison"]:["poison","blind","silence","shock"];
    let removed=0;
    keys.forEach(key=>{
      if(cond[key]){ cond[key]=false; removed++; }
    });
    if(!cond.shock) target.shockRecoverFails=0;
    return removed;
  }

  // Enemy-magic defensive hook. Resolution order is Aura -> Canceller -> Magic Barrier -> Defend.
  // Magic Barrier and Defend reduce damage only; non-damage effects are untouched unless Aura/Canceller blocks the spell.
  function enemyMagicDefense(target,{hasDamage=true}={}){
    const cond=conditionsOf(target);
    const traitEffect=traitOf(target)?.effect;
    if(traitEffect?.type==="firstRoundEnemyMagicDodge" && Number(state.battleRound)===Number(traitEffect.round||1) && !target._foxTrickeryUsedThisBattle){
      target._foxTrickeryUsedThisBattle=true;
      return {blocked:true,reason:"foxTrickery",damageMultiplier:0};
    }
    if(cond.aura){
      cond.aura=false;
      return {blocked:true,reason:"aura",damageMultiplier:0};
    }
    const cancel=skills.canceller;
    if(hasPassive(target,"canceller") && Math.random()<(Number(cancel?.chance)||.08)){
      return {blocked:true,reason:"canceller",damageMultiplier:0};
    }
    const barrierActive=hasDamage && Number(target?.magicBarrierRounds)>0;
    const barrierReduction=barrierActive?Math.max(0,Math.min(.95,Number(target?.magicBarrierReduction)||Number(skills.magicBarrier?.reduction)||.60)):0;
    const barrierMultiplier=barrierActive?(1-barrierReduction):1;
    const defendMultiplier=hasDamage && target?.defending ? .50 : 1;
    return {
      blocked:false,
      reason:barrierActive?"magicBarrier":(defendMultiplier<1?"defend":"none"),
      damageMultiplier:barrierMultiplier*defendMultiplier
    };
  }

  function battleAllies(includeReserve=false){
    const ids=includeReserve?travelPartyIds():state.battleActive;
    return ids.map((id,i)=>({id,i:state.battleActive.indexOf(id),c:roster[id]})).filter(x=>x.c);
  }

  function clearEnemyBuffs(enemy){
    if(!enemy) return false;
    let removed=false;
    ["atkBuff","defBuff","magicBuff","mdefBuff","spdBuff"].forEach(key=>{
      if(Number(enemy[key])>1){ enemy[key]=1; removed=true; }
      const roundsKey=`${key}Rounds`;
      if(Number(enemy[roundsKey])>0){ enemy[roundsKey]=0; removed=true; }
    });
    [["powerChargeMultiplier","powerChargeRounds"],["magicConcentrationMultiplier","magicConcentrationRounds"]].forEach(([valueKey,roundKey])=>{
      if(Number(enemy[roundKey])>0){ enemy[roundKey]=0; enemy[valueKey]=1; removed=true; }
    });
    if(Number(enemy.magicBarrierRounds)>0){ enemy.magicBarrierRounds=0; removed=true; }
    const cond=conditionsOf(enemy);
    if(cond.mount){cond.mount=false;removed=true;}
    if(cond.aura){cond.aura=false;removed=true;}
    if(cond.berserk){ cond.berserk=false; enemy.berserkRounds=0; removed=true; }
    if(enemy.buffs && typeof enemy.buffs==="object"){
      if(Object.keys(enemy.buffs).length) removed=true;
      enemy.buffs={};
    }
    return removed;
  }

  async function maybeTriggerOrangeGel(actor,target,context){
    const trait=traitOf(actor);
    if(trait?.id!=="orangeGel" || !context || context.triggeredTraits.has(trait.id)) return false;
    if(!traitRoll(trait)) return false;
    context.triggeredTraits.add(trait.id);
    const removed=clearEnemyBuffs(target);
    if(removed){
      setMessage(`🟠 ${actor.name} の「オレンジジェル」！ ${target.displayName} の強化効果をすべて解除した！`);
      const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
      if(el) spawnFx("impact","🟠",el);
      await wait(BASE_TIME.short);
    }
    return true;
  }

  async function maybeTriggerSlimeBody(target,slot,context){
    const trait=traitOf(target);
    if(trait?.id!=="slimeBody" || !context || context.triggeredTraits.has(trait.id) || S(target).hp<=0) return false;
    if(!traitRoll(trait)) return false;
    context.triggeredTraits.add(trait.id);
    const amount=Math.min(S(target).hpMax-S(target).hp,Math.max(1,Math.ceil(S(target).hpMax*.05)));
    if(amount<=0) return true;
    S(target).hp+=amount;
    renderBattleParty();
    flashPartyValue(slot,amount,"heal");
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(card) spawnFx("heal","🟢",card);
    setMessage(`🟢 ${target.name} の「スライムボディ」！ HPが ${amount} 回復した。`);
    await wait(BASE_TIME.short);
    return true;
  }

  async function maybeTriggerPoisonGelOnPhysicalHit(defender,slot,attacker){
    const trait=traitOf(defender),effect=trait?.effect;
    if(trait?.id!=="poisonGel" || effect?.type!=="poisonAttackerOnPhysicalHit" || !attacker || attacker.hp<=0 || S(defender).hp<=0) return false;
    const result=tryInflictStatus(attacker,"poison",Number(effect.baseRate)||Number(trait.chance)||.20);
    if(!result.success) return false;
    const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${attacker.uid}"]`);
    if(el) spawnFx("magicshot","☠",el);
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    setMessage(`☠️ ${defender.name} の「ポイズンジェル」！ ${attacker.displayName} を毒状態にした！`);
    await wait(BASE_TIME.short);
    return true;
  }

  async function maybeNullifyPhysicalByGhost(target,slot,attacker,attackName="攻撃"){
    const trait=traitOf(target),effect=trait?.effect;
    if(trait?.id!=="swayingGhost" || effect?.type!=="physicalDamageNullify" || S(target).hp<=0) return false;
    const chance=Number(effect.chance)||Number(trait.chance)||.08;
    if(Math.random()>=chance) return false;
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(card) spawnFx("magicshot","👻",card);
    setMessage(`👻 ${target.name} の「ゆらゆらゴースト」！ ${attacker?.displayName||"敵"} の${attackName}をすり抜けた！`);
    await wait(BASE_TIME.short);
    return true;
  }

  async function maybeTriggerMageDemonOnDefend(actor,slot){
    const trait=traitOf(actor);
    if(trait?.id!=="mageDemon" || S(actor).hp<=0 || S(actor).mp>=S(actor).mpMax || !traitRoll(trait)) return false;
    const amount=Math.min(S(actor).mpMax-S(actor).mp,Math.max(1,Math.ceil(S(actor).mpMax*((Number(trait.effect?.percent)||5)/100))));
    if(amount<=0) return false;
    S(actor).mp+=amount;
    renderBattleParty();
    flashPartyValue(slot,amount,"heal");
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(card) spawnFx("heal","🔮",card);
    setMessage(`🔮 ${actor.name} の「魔術師悪魔」！ MPが ${amount} 回復した。`);
    await wait(BASE_TIME.short);
    return true;
  }

  async function maybeTriggerEnemyCounterStance(enemy,actor){
    const chance=Math.max(0,Math.min(1,Number(enemy?.enemyCounterChance)||0));
    if(!enemy || enemy.hp<=0 || !actor || S(actor).hp<=0 || chance<=0 || Math.random()>=chance) return false;
    const slot=state.battleActive.indexOf(actor.id);
    if(slot<0) return false;
    setMessage(`↩️ ${enemy.displayName} の「カウンタースタンス」！ ${actor.name} に反撃！`);
    await wait(BASE_TIME.short);
    if(blindedPhysicalMiss(enemy) || physicalAttackMisses(actor)){
      setMessage(`${enemy.displayName} の反撃！ ${actor.name} はひらりとかわした！`);
      await wait(BASE_TIME.short);
      return true;
    }
    if(await maybeNullifyPhysicalByGhost(actor,slot,enemy,"反撃")) return true;
    let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(actor),Number(enemy.basicAttackPower)||1,1);
    const dmg=Math.max(1,actor.defending?Math.ceil(raw/2):raw);
    S(actor).hp=Math.max(0,S(actor).hp-dmg);
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(card) spawnFx(enemy.basicAttackFx||"impact",enemy.basicAttackSymbol||"💥",card);
    renderBattleParty();
    flashPartyValue(slot,dmg,"damage");
    setMessage(`↩️ ${enemy.displayName} の反撃！ ${actor.name} に ${dmg} ダメージ。`);
    await wait(BASE_TIME.enemyAfter);
    await maybeTriggerPoisonGelOnPhysicalHit(actor,slot,enemy);
    await maybeTriggerSlimeBody(actor,slot,makeTraitActionContext());
    await handleAllyKoFromEnemy(actor,slot);
    return true;
  }

  async function maybeTriggerCounterStance(defender,slot,attacker,context){
    const passive=skills.counterStance;
    if(!defender || !attacker || attacker.hp<=0 || S(defender).hp<=0 || !hasPassive(defender,"counterStance")) return false;
    if(!context) context=makeTraitActionContext();
    const key=`counterStance:${defender.id}`;
    if(context.triggeredPassives?.has(key)) return false;
    if(Math.random()>=(Number(passive?.chance)||.20)) return false;
    context.triggeredPassives?.add(key);
    setMessage(`↩️ ${defender.name} の「カウンタースタンス」！ ${attacker.displayName} に反撃！`);
    await wait(BASE_TIME.short);
    const result=await resolveBasicAttack(defender,{type:"attack",targetUid:attacker.uid},{allowDoubleAttack:false,isCounter:true});
    if(result?.battleWon && !state.battleEnded) winBattle();
    return true;
  }

  function partyElementDamageMultiplier(element){
    if(!element) return 1;
    let bonus=0;
    livingActiveSlots().forEach(({c})=>{
      const trait=traitOf(c);
      const effect=trait?.effect;
      if(effect?.type==="partyElementDamageBoost" && effect.element===element) bonus+=(Number(effect.percent)||0)/100;
    });
    return Math.max(0,1+bonus);
  }

  function applyBattleStartTraits(){
    const notices=[];
    travelPartyIds().forEach(id=>{const c=roster[id];if(c)c._foxTrickeryUsedThisBattle=false;});
    livingActiveSlots().forEach(({c})=>{
      const effect=traitOf(c)?.effect;
      if(effect?.type==="nextBattlePolishFromHealNode" && c._desertDogPolishPending){
        const result=applyStatBuff(c,{buff:"atk",multiplier:Number(effect.multiplier)||Number(skills.polish?.multiplier)||1.30,duration:Number(effect.duration)||Number(skills.polish?.duration)||5});
        c._desertDogPolishPending=false;
        notices.push(result.applied?`🐕 砂漠のわんこ：${c.name} の攻撃力アップ`:`🐕 砂漠のわんこ：${c.name} にはより強い攻撃力アップがかかっている`);
      }
    });
    livingActiveSlots().forEach(({c})=>{
      const trait=traitOf(c);
      if(trait?.id!=="timeThread" || !traitRoll(trait)) return;
      const candidates=livingActiveSlots();
      if(!candidates.length) return;
      const target=choose(candidates);
      const quick=skills.quick;
      target.c.spdBuff=quick.multiplier;
      target.c.spdBuffRounds=quick.duration;
      notices.push(`🕸️ 時繰りの糸：${target.c.name} にクイック`);
    });
    return notices;
  }

  function tickBattleBuffs(skipRoundDecrement=new Set()){
    state.battleActive.concat(state.battleReserve).forEach(id=>{
      const c=roster[id]; if(!c) return;
      [["atkBuff","atkBuffRounds"],["defBuff","defBuffRounds"],["magicBuff","magicBuffRounds"],["mdefBuff","mdefBuffRounds"],["spdBuff","spdBuffRounds"]].forEach(([buffKey,roundKey])=>{
        if(skipRoundDecrement.has(`${c.id}:${roundKey}`)) return;
        if((c[roundKey]||0)>0){
          c[roundKey]--;
          if(c[roundKey]<=0){ c[roundKey]=0; c[buffKey]=1; }
        }
      });
      [["powerChargeMultiplier","powerChargeRounds"],["magicConcentrationMultiplier","magicConcentrationRounds"]].forEach(([valueKey,roundKey])=>{
        if((c[roundKey]||0)>0){
          c[roundKey]--;
          if(c[roundKey]<=0){ c[roundKey]=0; c[valueKey]=1; }
        }
      });
      if((c.magicBarrierRounds||0)>0){
        c.magicBarrierRounds--;
        if(c.magicBarrierRounds<=0){ c.magicBarrierRounds=0; c.magicBarrierReduction=0; }
      }
      if(conditionsOf(c).berserk && (c.berserkRounds||0)>0){
        c.berserkRounds--;
        if(c.berserkRounds<=0){ c.berserkRounds=0; conditionsOf(c).berserk=false; }
      }
    });
    (state.battleEnemies||[]).forEach(enemy=>{
      if(!enemy || enemy.escaped) return;
      [["atkBuff","atkBuffRounds"],["defBuff","defBuffRounds"],["magicBuff","magicBuffRounds"],["mdefBuff","mdefBuffRounds"],["spdBuff","spdBuffRounds"]].forEach(([buffKey,roundKey])=>{
        if((enemy[roundKey]||0)>0){
          enemy[roundKey]--;
          if(enemy[roundKey]<=0){ enemy[roundKey]=0; enemy[buffKey]=1; }
        }
      });
    });
  }

  async function processTurnEndStatuses(){
    // Poison / Blind / Silence persist until cured or battle end. Shock alone has natural recovery.
    // Reapplying an existing status never refreshes or extends it.
    const enemyPoisoned=[...livingEnemies()].filter(e=>conditionsOf(e).poison);
    for(const enemy of enemyPoisoned){
      const dmg=Math.max(1,Math.ceil(enemy.hpMax*.20));
      enemy.hp=Math.max(0,enemy.hp-dmg);
      const killed=enemy.hp<=0;
      if(killed && !enemy.defeatOrder) enemy.defeatOrder=++state.battleDefeatCounter;
      setMessage(`☠ ${enemy.displayName} は毒で ${dmg} ダメージ！${killed?` ${enemy.displayName} を倒した！`:""}`);
      await animateEnemyDamage(enemy,killed,"magicshot","☠");
    }
    if(livingEnemies().length===0){ winBattle(); return true; }

    const allyPoisoned=[...livingActiveSlots()].filter(({c})=>conditionsOf(c).poison);
    for(const {i,c} of allyPoisoned){
      if(S(c).hp<=0) continue;
      const dmg=Math.max(1,Math.ceil(S(c).hpMax*.20));
      S(c).hp=Math.max(0,S(c).hp-dmg);
      renderBattleParty();
      flashPartyValue(i,dmg,"damage");
      setMessage(`☠ ${c.name} は毒で ${dmg} ダメージ！`);
      await wait(BASE_TIME.message);
      if(S(c).hp<=0){
        const outName=c.name;
        clearStatesOnKo(c);
        await maybeTriggerMaidGiftOnKo(c);
        renderBattleParty();
        if(livingActiveSlots().length===0){
          loseBattle();
          return true;
        }
      }
    }

    const shockTargets=[
      ...livingEnemies().map(e=>({entity:e,label:e.displayName,isAlly:false})),
      ...livingActiveSlots().map(({c})=>({entity:c,label:c.name,isAlly:true}))
    ].filter(x=>conditionsOf(x.entity).shock);
    for(const x of shockTargets){
      const fails=Number(x.entity.shockRecoverFails)||0;
      const recovered=fails>=2 || Math.random()<.50;
      if(recovered){
        conditionsOf(x.entity).shock=false;
        x.entity.shockRecoverFails=0;
        setMessage(`⚡ ${x.label} の感電が治った。`);
      }else{
        x.entity.shockRecoverFails=fails+1;
        setMessage(`⚡ ${x.label} はまだ感電している。`);
      }
      if(x.isAlly) renderBattleParty();
      else renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      await wait(BASE_TIME.short);
    }
    return false;
  }

  async function processTurnEndPassives(){
    for(const {c,i} of [...livingActiveSlots()]){
      if(S(c).hp<=0) continue;
      const weapon=equippedWeapon(c);
      const healRate=Math.max(0,Number(weapon?.roundEndHealRate)||0);
      const healPercent=Math.max(0,Number(weapon?.roundEndHealPercent)||0);
      if(healRate>0 && healPercent>0 && S(c).hp<S(c).hpMax && Math.random()<healRate){
        const amount=Math.min(S(c).hpMax-S(c).hp,Math.max(1,Math.ceil(S(c).hpMax*healPercent)));
        if(amount>0){
          S(c).hp+=amount;
          renderBattleParty();
          flashPartyValue(i,amount,"heal");
          const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
          if(card) spawnFx("heal","🌿",card);
          setMessage(`🌿 ${weapon.name} の力で ${c.name} のHPが ${amount} 回復した！`);
          await wait(BASE_TIME.heal);
        }
      }
    }

    for(const {c,i} of [...livingActiveSlots()]){
      if(!hasPassive(c,"autoFresh") || S(c).hp<=0) continue;
      const cond=conditionsOf(c);
      if(!["poison","blind","silence","shock"].some(k=>cond[k])) continue;
      const passive=skills.autoFresh;
      if(Math.random()>=(Number(passive?.chance)||.20)) continue;
      const removed=clearNegativeConditions(c);
      if(!removed) continue;
      renderBattleParty();
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
      if(card) spawnFx("heal","✨",card);
      setMessage(`✨ ${c.name} の「オートフレッシュ」！ 状態異常をすべて解除した。`);
      await wait(BASE_TIME.short);
    }
  }

  async function processTurnEndTraits(){
    const active=[...livingActiveSlots()];
    // Buffs newly granted by an end-of-round trait begin at their full duration next round.
    const skipRoundDecrement=new Set();
    for(const {c} of active){
      const trait=traitOf(c);
      if(trait?.id!=="healingFairy") continue;
      const damaged=livingActiveSlots().filter(x=>S(x.c).hp<S(x.c).hpMax);
      if(!damaged.length || !traitRoll(trait)) continue;
      const target=choose(damaged);
      const heal=skills.heal;
      const healPower=healAmountForSkill(c,heal);
      const amount=Math.min(S(target.c).hpMax-S(target.c).hp,healPower);
      if(amount<=0) continue;
      S(target.c).hp+=amount;
      renderBattleParty();
      flashPartyValue(target.i,amount,"heal");
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${target.i}"]`);
      if(card) spawnFx("heal","🧚",card);
      setMessage(`🧚 ${c.name} の「癒しの妖精」！ MP消費0のヒールで ${target.c.name} のHPが ${amount} 回復した。`);
      await wait(BASE_TIME.heal);
    }

    for(const {c,i} of active){
      const trait=traitOf(c);
      if(trait?.id==="sheddingBody"){
        const cond=conditionsOf(c);
        const afflicted=["poison","blind","silence","shock"].some(k=>cond[k]);
        if(afflicted && traitRoll(trait)){
          const removed=clearNegativeConditions(c);
          const quick=skills.quick;
          const result=applyStatBuff(c,{buff:"spd",multiplier:Number(trait.effect?.multiplier)||Number(quick?.multiplier)||1.30,duration:Number(trait.effect?.duration)||Number(quick?.duration)||5});
          if(result.applied) skipRoundDecrement.add(`${c.id}:spdBuffRounds`);
          renderBattleParty();
          const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
          if(card) spawnFx("buff","🐍",card);
          setMessage(result.applied
            ? `🐍 ${c.name} の「脱皮する身体」！ 状態異常を${removed}個解除し、素早さが上がった！`
            : `🐍 ${c.name} の「脱皮する身体」！ 状態異常を${removed}個解除した！（素早さにはより強い強化効果がかかっている）`);
          await wait(BASE_TIME.buff);
        }
      }
      if(trait?.id==="encouragingStrike"){
        const effect=trait.effect||{};
        const statuses=Array.isArray(effect.statuses)?effect.statuses:["poison","blind","silence","shock"];
        const damagePercent=Math.max(0,Number(effect.damagePercent)||.08);
        const candidates=livingActiveSlots().filter(({c:ally})=>{
          if(!ally || ally.id===c.id || S(ally).hp<=0) return false;
          if(!statuses.some(status=>conditionsOf(ally)[status])) return false;
          const damage=Math.max(1,Math.ceil(S(ally).hpMax*damagePercent));
          return S(ally).hp>damage;
        });
        if(candidates.length){
          const target=choose(candidates);
          const damage=Math.max(1,Math.ceil(S(target.c).hpMax*damagePercent));
          S(target.c).hp=Math.max(1,S(target.c).hp-damage);
          renderBattleParty();
          flashPartyValue(target.i,damage,"damage");
          const targetCard=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${target.i}"]`);
          if(targetCard) spawnFx("impact","💢",targetCard);
          setMessage(`💢 ${c.name} の「激励の一撃」！ ${target.c.name} に ${damage} ダメージ！`);
          await wait(BASE_TIME.short);
          const multiplier=Number(effect.multiplier)||Number(skills.polish?.multiplier)||1.30;
          const duration=Number(effect.duration)||Number(skills.polish?.duration)||5;
          const applied=[];
          for(const stat of (Array.isArray(effect.stats)?effect.stats:["atk","magic","spd"])){
            const result=applyStatBuff(target.c,{buff:stat,multiplier,duration});
            if(result.applied){
              applied.push(BUFF_INFO[stat]?.name||stat);
              skipRoundDecrement.add(`${target.c.id}:${BUFF_INFO[stat]?.rounds||`${stat}BuffRounds`}`);
            }
          }
          renderBattleParty();
          const buffCard=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${target.i}"]`);
          if(buffCard) spawnFx("buff","✨",buffCard);
          setMessage(applied.length
            ? `💢 激励された ${target.c.name} の攻撃力・魔力・素早さが上がった！`
            : `💢 ${target.c.name} には、すでにより強い強化効果がかかっている。`);
          await wait(BASE_TIME.buff);
        }
      }
      if(trait?.id==="stickyHeal" && c._usedHealingMagicThisRound && traitRoll(trait)){
        c.magicBuff=trait.effect.multiplier;
        c.magicBuffRounds=trait.effect.duration;
        skipRoundDecrement.add(`${c.id}:magicBuffRounds`);
        renderBattleParty();
        flashPartyValue(i,"","buff","MAG↑");
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
        if(card) spawnFx("buff","💗",card);
        setMessage(`💗 ${c.name} の「ネバネバヒール」！ 魔力が${trait.effect.multiplier.toFixed(1)}倍になった！（${trait.effect.duration}ラウンド）`);
        await wait(BASE_TIME.buff);
      }
      c._usedHealingMagicThisRound=false;
    }
    state.battleActive.concat(state.battleReserve).forEach(id=>{ if(roster[id]) roster[id]._usedHealingMagicThisRound=false; });
    return skipRoundDecrement;
  }

  function applyVictoryTraits(){
    const notes=[];
    battleTraitSlots({livingOnly:false}).forEach(({c})=>{
      if(!c || S(c).hp<=0) return;
      const trait=traitOf(c);
      if(trait?.id==="regenerationSlug"){
        const amount=Math.min(S(c).hpMax-S(c).hp,Math.max(1,Math.ceil(S(c).hpMax*.20)));
        if(amount<=0) return;
        S(c).hp+=amount;
        notes.push(`${c.name}「再生ナメクジ」+${amount}HP`);
        return;
      }
      if(trait?.id==="toxinAbsorb"){
        const poisoned=battleTraitSlots({livingOnly:false}).filter(x=>x.c && conditionsOf(x.c).poison);
        if(!poisoned.length) return;
        const target=choose(poisoned);
        conditionsOf(target.c).poison=false;
        const amount=Math.min(S(c).hpMax-S(c).hp,Math.max(1,Math.ceil(S(c).hpMax*.30)));
        if(amount>0) S(c).hp+=amount;
        notes.push(`${c.name}「毒素吸収」${target.c.name}の毒を解除${amount>0?` / +${amount}HP`:""}`);
      }
    });
    return notes;
  }

  function rollVictoryExpTrait(){
    const singer=livingActiveSlots().map(({c})=>({c,effect:traitOf(c)?.effect})).find(x=>x.effect?.type==="partyExpBoostChance");
    if(!singer) return {multiplier:1,note:""};
    const chance=Math.max(0,Math.min(1,Number(singer.effect.chance)||Number(traitOf(singer.c)?.chance)||0));
    if(Math.random()>=chance) return {multiplier:1,note:""};
    const multiplier=Math.max(1,Number(singer.effect.multiplier)||1.25);
    return {multiplier,note:`🎵 ${singer.c.name}「ハッピーソング」獲得EXP×${multiplier.toFixed(2)}`};
  }

  function applyVictoryPassives(){
    const notes=[];
    travelPartyIds().forEach(id=>{
      const c=roster[id];
      if(!c || S(c).hp>0 || !hasPassive(c,"unyieldingHeart")) return;
      S(c).hp=1;
      notes.push(`${c.name}「不屈の心」HP1で復活`);
    });
    return notes;
  }

  // v0.24 damage foundation. Standard physical defense influence is 100%; guns can scale only that influence.
  function defenseDamageFactor(offense,defense,defenseInfluence=1){
    const o=Math.max(1,Number(offense)||1);
    const d=Math.max(0,Number(defense)||0);
    const influence=Math.max(0,Number(defenseInfluence)||0);
    return o/(o+d*.70*influence);
  }
  function damageVariance(){ return .95+Math.random()*.10; }
  function physicalDamage(offense,defense,power=1,minDamage=1,defenseInfluence=1){
    const o=Math.max(1,Number(offense)||1);
    const raw=o*Math.max(0,Number(power)||1);
    return Math.max(minDamage,Math.round(raw*defenseDamageFactor(o,defense,defenseInfluence)*damageVariance()));
  }
  function magicDamage(magic,mdef,basePower=0,magicScale=1,minDamage=2){
    const m=Math.max(1,Number(magic)||1);
    const raw=Math.max(0,(Number(basePower)||0)+m*(Number(magicScale)||0));
    return Math.max(minDamage,Math.round(raw*defenseDamageFactor(m,mdef,1)*damageVariance()));
  }

  function resistanceRankFor(target,key){
    if(!target || !key) return "C";
    if(target.stats){
      const profile=profileFor(target);
      const base=profile?.resist?.[key] || "C";
      const delta=equipmentResistanceDelta(ensureEquipment(target))[key]||0;
      return shiftedResistanceRank(base,delta);
    }
    return target.resist?.[key] || enemyData[target.id]?.resist?.[key] || "C";
  }
  function elementResistanceMultiplier(target,element){
    if(!element) return 1;
    const rank=resistanceRankFor(target,element);
    if(element==="pleasure") return PLEASURE_RESIST_DAMAGE[rank] ?? 1;
    return RESISTANCE_RANKS[rank]?.damage ?? 1;
  }
  function statusResistanceMultiplier(target,status){
    const key=status==="shock" ? "thunder" : status;
    const rank=resistanceRankFor(target,key);
    return RESISTANCE_RANKS[rank]?.status ?? 1;
  }
  function spellDamage(actor,target,sk){
    const magic=Math.max(1,effectiveMagic(actor)||1);
    const mdef=Math.max(0,effectiveEnemyStat(target,"mdef"));
    const rank=Number(sk.rankMultiplier)||1;
    const targetMod=Number(sk.targetMultiplier)||1;
    const special=Number(sk.powerMultiplier)||1;
    const raw=(30+magic*1.20)*rank*targetMod*special;
    const defense=defenseDamageFactor(magic,mdef,1);
    const resist=elementResistanceMultiplier(target,sk.element);
    const partyBoost=partyElementDamageMultiplier(sk.element);
    const variance=Array.isArray(sk.gambleRange)
      ? sk.gambleRange[0]+Math.random()*(sk.gambleRange[1]-sk.gambleRange[0])
      : damageVariance();
    return Math.max(1,Math.round(raw*defense*resist*partyBoost*variance));
  }
  function silverBodyAdjustedDamage(target,damage,{critical=false}={}){
    const raw=Math.max(0,Math.round(Number(damage)||0));
    if(!target?.silverBodyDamageCompression || critical || raw<=0) return raw;
    if(raw<150) return 1;
    if(raw<160) return 2;
    if(raw<170) return 3;
    if(raw<180) return 5;
    if(raw<190) return 10;
    if(raw<200) return 25;
    return Math.max(1,Math.round(raw*.25));
  }

  function statusName(status){
    return {poison:"毒",blind:"暗闇",silence:"封印",shock:"感電",death:"即死"}[status]||status;
  }
  function statusIcon(status){
    return {poison:"☠",blind:"🌫️",silence:"🔇",shock:"⚡",death:"☠"}[status]||"✨";
  }
  function statusChancePercent(target,status,baseRate){
    return clampRate((Number(baseRate)||0)*statusResistanceMultiplier(target,status)*100);
  }
  function tryInflictStatus(target,status,baseRate){
    if(!target) return {success:false,reason:"invalid",rate:0};
    const cond=conditionsOf(target);
    const traitEffect=traitOf(target)?.effect;
    if(target.statusImmuneAll || traitEffect?.type==="statusAndDeathImmunity") return {success:false,reason:"immune",rate:0};
    if(Array.isArray(target.statusImmune) && target.statusImmune.includes(status)) return {success:false,reason:"immune",rate:0};
    if(traitEffect?.type==="poisonImmuneShockCertain" && status==="poison") return {success:false,reason:"immune",rate:0};
    if(status==="death" && target.statusDeathImmune) return {success:false,reason:"immune",rate:0};
    if(status!=="death" && cond[status]) return {success:false,reason:"already",rate:statusChancePercent(target,status,baseRate)};
    const forcedShock=traitEffect?.type==="poisonImmuneShockCertain" && status==="shock";
    const rate=forcedShock?100:statusChancePercent(target,status,baseRate);
    if(!forcedShock && Math.random()*100>=rate) return {success:false,reason:"resist",rate};
    // Mount is a separate one-use status barrier and still blocks Lloyd's guaranteed shock.
    if(cond.mount){
      cond.mount=false;
      return {success:false,reason:"mount",rate};
    }
    if(status==="death"){
      if(target.stats) S(target).hp=0;
      else target.hp=0;
      return {success:true,reason:"death",rate};
    }
    cond[status]=true;
    if(status==="shock") target.shockRecoverFails=0;
    return {success:true,reason:"applied",rate};
  }
  function enemyStatusSuffix(enemy){
    const cond=conditionsOf(enemy);
    const parts=[];
    if(cond.poison) parts.push("☠毒");
    if(cond.blind) parts.push("🌫暗");
    if(cond.silence) parts.push("🔇封");
    if(cond.shock) parts.push("⚡感");
    if((enemy.atkBuffRounds||0)>0) parts.push("ATK↑");
    if((enemy.defBuffRounds||0)>0) parts.push("DEF↑");
    return parts.length?` [${parts.join(" ")}]`:"";
  }
  function blindedPhysicalMiss(actor){
    return !!conditionsOf(actor).blind && Math.random()<.70;
  }
  function physicalEvasionRate(target){
    if(target?.stats) return equipmentExtras(target).evasion;
    return clampRate(target?.evasionRate||0);
  }
  function physicalAttackMisses(target){
    const rate=physicalEvasionRate(target);
    return rate>0 && Math.random()*100<rate;
  }
  function criticalRateForActor(actor){ return equipmentExtras(actor).crit; }
  function criticalMultiplierForActor(actor){ return equipmentExtras(actor).critMultiplier; }
  function rollCritical(rate){
    const r=clampRate(rate);
    return r>0 && Math.random()*100<r;
  }

  function rollInitiative(spd){
    const base=Math.max(1,Number(spd)||1);
    return base*(.90+Math.random()*.20);
  }
  function buildTurnOrder(){
    const order=[];
    livingActiveSlots().forEach(({id,i,c})=>{
      const action=state.battleActions[i];
      if(action) order.push({side:"ally",actorId:id,slot:i,action,initiative:rollInitiative(effectiveSpd(c)),tie:Math.random()});
    });
    livingEnemies().forEach(enemy=>{
      order.push({side:"enemy",enemyUid:enemy.uid,initiative:rollInitiative(effectiveEnemyStat(enemy,"spd")),tie:Math.random()});
    });
    order.sort((a,b)=>(b.initiative-a.initiative)||(b.tie-a.tie));
    return order;
  }

  function enemyByUid(uid){
    const enemy=state.battleEnemies.find(e=>e.uid===uid) || null;
    return enemy && !enemy.escaped ? enemy : null;
  }

  function selectedEnemy(){
    const sel=$("enemyStage").querySelector(".enemy.selected");
    if(sel){
      const uid=sel.dataset.enemyUid;
      const e=enemyByUid(uid);
      if(e && e.hp>0) return e;
    }
    return livingEnemies()[0] || null;
  }

  function resetRosterForDirectTest(){
    Object.entries(roster).forEach(([id,c])=>{
      c.stats={...initialStats[id]};
      c.level=c.fixedLevel||1;
      c.exp=0;
      c.learnedSkills=[...(initialLearnedSkills[id]||[])];
      clearBattleOnlyStates(c,{preservePoison:false});
    });
    state.battleActive=["hero","slime","dog","fairy"];
    state.battleReserve=["slug","slimebes","poison","harpy","momo","arachne"];
  }

  function learnedSkillIds(actor){
    return Array.isArray(actor.learnedSkills) ? actor.learnedSkills : [];
  }

  function knownSkills(actor){
    return learnedSkillIds(actor).map(id=>skills[id]).filter(Boolean);
  }
  function hasSkill(actor,skillId){ return !!actor && learnedSkillIds(actor).includes(skillId); }
  function hasPassive(actor,skillId){ return hasSkill(actor,skillId) && skills[skillId]?.kind==="passive"; }
  function weaponRequirementMet(actor,sk){
    if(!sk?.requiredWeaponTypes?.length) return true;
    const type=equippedWeapon(actor)?.weaponType;
    return sk.requiredWeaponTypes.includes(type);
  }
  function weaponRequirementText(sk){
    if(!sk?.requiredWeaponTypes?.length) return "";
    return sk.requiredWeaponTypes.map(t=>weaponTypeLabels[t]||t).join("・");
  }

  function currentSkill(){
    const actor=roster[state.battleActive[state.battleActorSlot]];
    return knownSkills(actor)[0] || null;
  }

  function updateSkillButton(){
    const btn=$("skillBtn");
    if(!btn) return;
    const actor=roster[state.battleActive[state.battleActorSlot]];
    const list=knownSkills(actor).filter(sk=>sk.battleUse!==false);
    if(!list.length){
      $("skillBtnLabel").textContent="スキル未設定";
      $("skillCostLabel").textContent="";
      btn.disabled=true;
      return;
    }
    const sealed=conditionsOf(actor).silence;
    $("skillBtnLabel").textContent=sealed?"封印中":"スキル";
    $("skillCostLabel").textContent=sealed?"使用不可":`${list.length}種`;
    btn.disabled=sealed || state.battlePhase!=="input" || state.battleEnded || S(actor).hp<=0;
  }

  function closeSkillMenu(){
    const modal=$("skillModal");
    if(modal) modal.classList.remove("show");
  }

  function renderSkillPartyStatus(boxId="skillPartyStatus"){
    const box=$(boxId);
    if(!box) return;
    box.innerHTML="";
    for(let slot=0;slot<4;slot++){
      const id=state.battleActive[slot];
      const card=document.createElement("div");
      if(!id || !roster[id]){
        card.className="skill-party-card empty";
        card.textContent="空き";
        box.appendChild(card);
        continue;
      }
      const c=roster[id], st=S(c);
      card.className="skill-party-card"+(slot===state.battleActorSlot?" current":"")+(st.hp<=0?" ko":"");
      const hp=Math.max(0,Math.min(100,Math.round(st.hp/st.hpMax*100)));
      const mp=Math.max(0,Math.min(100,Math.round(st.mp/st.mpMax*100)));
      card.innerHTML=`<div class="skill-party-name">${c.name}</div>`+
        `<div class="skill-party-line"><b>HP</b><span class="skill-party-bar"><i style="width:${hp}%"></i></span><span>${st.hp}/${st.hpMax}</span></div>`+
        `<div class="skill-party-line"><b>MP</b><span class="skill-party-bar mp"><i style="width:${mp}%"></i></span><span>${st.mp}/${st.mpMax}</span></div>`;
      box.appendChild(card);
    }
  }

  function openSkillMenu(){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    const actor=roster[state.battleActive[state.battleActorSlot]];
    const list=knownSkills(actor).filter(sk=>sk.battleUse!==false);
    if(conditionsOf(actor).silence){
      setMessage(`🔇 ${actor.name} は封印されていてスキルを使えません。`);
      return;
    }
    if(!list.length){
      setMessage(`${actor.name} のスキルはまだ未設定です。`);
      return;
    }

    state.battleTargetMode=null;
    renderBattleParty();
    updateActorPortrait();
    updateExecuteButton();
    $("skillSelectTitle").textContent=`${actor.name}：スキル`;
    $("skillSelectLead").textContent=`使用するスキルを選択`;
    renderSkillPartyStatus();
    const box=$("skillList");
    box.innerHTML="";

    list.forEach(sk=>{
      const actualCost=battleSkillCost(actor,sk);
      const enoughMp=S(actor).mp>=actualCost;
      const weaponOk=weaponRequirementMet(actor,sk);
      const usable=enoughMp && weaponOk;
      const btn=document.createElement("button");
      btn.className="skill-option";
      btn.disabled=!usable;
      const targetLabel=sk.target==="enemyAll" ? "敵全体" : sk.target==="enemyRandom" ? "ランダム敵" : sk.target==="allyAll" ? "味方全員" : sk.target==="ally" ? "味方1人" : sk.target==="self" ? "自分" : sk.target==="none" ? "探索専用" : "敵1体";
      const note=!enoughMp?"MP不足":!weaponOk?`要：${weaponRequirementText(sk)}`:targetLabel;
      btn.innerHTML=`<span class="skill-option-icon">${sk.icon||"✨"}</span>`+
        `<span class="skill-option-main"><span class="skill-option-name">${sk.name}</span>`+
        `<span class="skill-option-desc">${sk.desc||""}</span></span>`+
        `<span class="skill-option-meta">MP ${actualCost}<small>${note}</small></span>`;
      btn.onclick=()=>selectSkill(sk.id);
      box.appendChild(btn);
    });
    $("skillModal").classList.add("show");
  }

  function closeItemMenu(){
    const modal=$("itemModal");
    if(modal) modal.classList.remove("show");
  }

  function availableItemForSlot(itemId,slot=state.battleActorSlot){
    const current=state.battleActions[slot];
    return itemCount(itemId) + (current?.type==="item" && current.item===itemId ? 1 : 0);
  }

  function refundQueuedItem(slot){
    const current=state.battleActions[slot];
    if(current?.type==="item"){ addItemCount(current.item,1); }
  }

  function refundAllQueuedItems(){
    state.battleActions.forEach((action,slot)=>{ if(action?.type==="item") refundQueuedItem(slot); });
  }

  function battleItemTargetUsable(item,c){
    if(!item || !c) return false;
    const st=S(c);
    if(item.effect==="revive") return st.hp<=0;
    if(st.hp<=0) return false;
    if(item.effect==="hpHeal") return st.hp<st.hpMax;
    if(item.effect==="mpHeal") return st.mp<st.mpMax;
    if(item.effect==="cleanse"){
      const cond=conditionsOf(c);
      return item.poisonOnly ? !!cond.poison : ["poison","blind","silence","shock"].some(k=>cond[k]);
    }
    return true;
  }

  function battleItemTargetNote(item){
    if(item.battleTarget==="allyAll") return "味方全員";
    if(item.battleTarget==="enemy") return "敵1体";
    if(item.battleTarget==="enemyAll") return "敵全体";
    if(item.battleTarget==="self") return "その場で使用";
    if(item.allowKO) return "戦闘不能の味方";
    return "味方1人";
  }

  function openItemMenu(){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    const actor=roster[state.battleActive[state.battleActorSlot]];
    state.battleTargetMode=null; renderBattleParty(); updateActorPortrait(); updateExecuteButton();
    $("itemSelectTitle").textContent=`${actor.name}：アイテム`; $("itemSelectLead").textContent="使用するアイテムを選択"; renderSkillPartyStatus("itemPartyStatus");
    const box=$("itemList"); box.innerHTML="";
    const shown=BATTLE_ITEM_IDS.filter(id=>availableItemForSlot(id)>0);
    if(!shown.length){
      box.innerHTML='<div class="character-skill-empty">戦闘で使えるアイテムを持っていません。</div>';
    }
    shown.forEach(id=>{
      const item=ITEMS[id],available=availableItemForSlot(id),usable=available>0;
      const btn=document.createElement("button"); btn.className="skill-option"; btn.disabled=!usable;
      btn.innerHTML=`<span class="skill-option-icon">${item.icon}</span><span class="skill-option-main"><span class="skill-option-name">${item.name}</span><span class="skill-option-desc">${item.desc}</span></span><span class="skill-option-meta">× ${available}<small>${battleItemTargetNote(item)}</small></span>`;
      btn.onclick=()=>selectBattleItem(id); box.appendChild(btn);
    });
    $("itemModal").classList.add("show");
  }

  function selectBattleItem(itemId){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    const item=ITEMS[itemId];
    if(!item || !item.battleUse || availableItemForSlot(itemId)<=0){ setMessage(`${item?.name||"アイテム"}を持っていません。`); return; }
    closeItemMenu();
    if(item.battleTarget==="ally"){
      enterBattleTargetMode(
        {kind:"ally",source:"item",item:item.id,actorSlot:state.battleActorSlot,allowKO:!!item.allowKO,returnTo:"item"},
        `${item.icon} ${item.name}：光っている仲間をタップしてください。`
      );
      return;
    }
    if(item.battleTarget==="enemy"){
      enterBattleTargetMode(
        {kind:"enemy",source:"item",item:item.id,actorSlot:state.battleActorSlot,returnTo:"item"},
        `${item.icon} ${item.name}：光っている敵をタップしてください。`
      );
      return;
    }
    queueAction({type:"item",item:item.id});
  }

  function targetModeName(mode=state.battleTargetMode){
    if(!mode) return "";
    if(mode.source==="attack") return "攻撃";
    if(mode.source==="item") return ITEMS[mode.item]?.name || "アイテム";
    return skills[mode.skill]?.name || "スキル";
  }

  function chooseBattleEnemyTarget(enemyUid){
    if(state.battlePhase!=="input" || state.battleEnded || state.battleTargetMode?.kind!=="enemy") return;
    const enemy=enemyByUid(enemyUid);
    if(!enemy || enemy.hp<=0) return;
    cancelScheduledTurnStart();
    const mode=state.battleTargetMode;
    state.battleTargetMode=null;
    if(mode.source==="attack") queueAction({type:"attack",targetUid:enemy.uid});
    else if(mode.source==="item") queueAction({type:"item",item:mode.item,targetUid:enemy.uid});
    else if(mode.source==="skill") queueAction({type:"skill",skill:mode.skill,targetUid:enemy.uid});
  }

  function renderBattleTargetList(mode=state.battleTargetMode){
    const list=$("battleTargetList");
    if(!list) return;
    list.innerHTML="";
    const show=!!(mode && mode.kind==="enemy");
    list.hidden=!show;
    if(!show) return;
    livingEnemies().slice(0,5).forEach(enemy=>{
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="battle-target-enemy";
      btn.textContent=enemy.displayName;
      btn.onclick=()=>chooseBattleEnemyTarget(enemy.uid);
      list.appendChild(btn);
    });
  }

  function updateBattleTargetUi(){
    const commands=$("battleCommands"), mode=state.battleTargetMode;
    if(!commands) return;
    commands.classList.toggle("target-mode",!!mode);
    renderBattleTargetList(mode);
    if(!mode) return;
    const name=targetModeName(mode);
    const enemy=mode.kind==="enemy";
    $("battleTargetIcon").textContent=enemy ? "🎯" : "💠";
    $("battleTargetTitle").textContent=name;
    $("battleTargetHint").textContent=enemy
      ? "敵の名前、または光っている敵をタップしてください。"
      : (mode.requireKO ? "光っている戦闘不能の仲間をタップしてください。" : "光っている仲間をタップしてください。");
  }

  function enterBattleTargetMode(mode,message){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    state.battleTargetMode=mode;
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    renderBattleParty();
    updateActorPortrait();
    updateExecuteButton();
    updateBattleTargetUi();
    setMessage(message || `${targetModeName(mode)}：対象を選択してください。`);
  }

  function cancelBattleTargetSelection(){
    const mode=state.battleTargetMode;
    if(!mode || state.battlePhase!=="input" || state.battleEnded) return;
    state.battleTargetMode=null;
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    renderBattleParty();
    updateActorPortrait();
    updateExecuteButton();
    updateBattleTargetUi();
    if(mode.returnTo==="skill") openSkillMenu();
    else if(mode.returnTo==="item") openItemMenu();
    else setMessage(currentInputPrompt());
  }

  function selectSkill(skillId){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    const actor=roster[state.battleActive[state.battleActorSlot]];
    const sk=skills[skillId];
    if(!sk || !learnedSkillIds(actor).includes(skillId)) return;
    if(conditionsOf(actor).silence){
      setMessage(`🔇 ${actor.name} は封印されていてスキルを使えません。`);
      return;
    }
    const actualCost=battleSkillCost(actor,sk);
    if(S(actor).mp<actualCost){
      setMessage(`${sk.name} を使うMPが足りません。（必要MP ${actualCost}）`);
      return;
    }
    if(!weaponRequirementMet(actor,sk)){
      setMessage(`${sk.name} は ${weaponRequirementText(sk)} を装備している時だけ使えます。`);
      return;
    }

    closeSkillMenu();
    if(sk.target==="enemyAll" || sk.target==="enemyRandom"){
      state.battleTargetMode=null;
      if(!livingEnemies().length){ setMessage("スキルの対象がいません。"); return; }
      queueAction({type:"skill",skill:sk.id});
      return;
    }

    if(sk.target==="enemy"){
      if(!livingEnemies().length){ setMessage("スキルの対象がいません。"); return; }
      enterBattleTargetMode(
        {kind:"enemy",source:"skill",skill:sk.id,actorSlot:state.battleActorSlot,returnTo:"skill"},
        `${sk.icon} ${sk.name}：光っている敵をタップしてください。`
      );
      return;
    }

    if(sk.target==="allyAll" || sk.target==="self"){
      state.battleTargetMode=null;
      queueAction({type:"skill",skill:sk.id,targetId:sk.target==="self"?actor.id:null,targetSlot:sk.target==="self"?state.battleActorSlot:null});
      return;
    }

    if(sk.kind==="revive" && sk.target==="ally"){
      const candidates=state.battleActive.map(id=>roster[id]).filter(c=>c && S(c).hp<=0);
      if(!candidates.length){ setMessage("前列に戦闘不能の仲間がいません。"); return; }
      enterBattleTargetMode(
        {kind:"ally",source:"skill",skill:sk.id,actorSlot:state.battleActorSlot,requireKO:true,returnTo:"skill"},
        `${sk.icon} ${sk.name}：光っている戦闘不能の仲間をタップしてください。`
      );
      return;
    }

    enterBattleTargetMode(
      {kind:"ally",source:"skill",skill:sk.id,actorSlot:state.battleActorSlot,allowKO:false,returnTo:"skill"},
      `${sk.icon} ${sk.name}：光っている仲間をタップしてください。`
    );
  }

  function compactActionLabel(action,actor=null){
    if(!action) return "未入力";
    if(action.type==="defend") return "🛡️ 防御";
    if(action.type==="attack") return actor && weaponAttackProfile(actor).attackAll ? "➰ 全体攻撃" : "⚔️ 攻撃";
    if(action.type==="item"){
      const item=ITEMS[action.item];
      return `${item?.icon||"🧪"} ${item?.name||"アイテム"}`;
    }
    if(action.type==="skill"){
      const sk=skills[action.skill];
      return sk ? `${sk.icon||"✨"} ${sk.name}` : "✨ スキル";
    }
    if(action.type==="swap") return "↔ 交代";
    return action.type;
  }

  function currentInputPrompt(){
    const actor=roster[state.battleActive[state.battleActorSlot]];
    if(!actor) return "";
    return `${actor.name}の行動を選択中`;
  }

  function actionLabel(action,actor=null){
    if(!action) return "未入力";
    if(action.type==="defend") return "🛡 防御";
    if(action.type==="attack"){
      if(actor && weaponAttackProfile(actor).attackAll) return "➰ 敵全体";
      const target=enemyByUid(action.targetUid);
      return `⚔ ${target && target.hp>0 ? target.displayName : "敵"}`;
    }
    if(action.type==="item"){
      const item=ITEMS[action.item];
      if(item?.battleTarget==="enemyAll") return `${item.icon} ${item.name}→敵全体`;
      if(item?.battleTarget==="allyAll") return `${item.icon} ${item.name}→味方全員`;
      if(item?.battleTarget==="self") return `${item.icon} ${item.name}`;
      if(item?.battleTarget==="enemy"){ const target=enemyByUid(action.targetUid); return `${item.icon} ${item.name}→${target?.displayName||"敵"}`; }
      const target=roster[action.targetId || state.battleActive[action.targetSlot]];
      return `${item?.icon||"🧪"} ${item?.name||"アイテム"}→${target ? target.name : "味方"}`;
    }
    if(action.type==="skill"){
      const sk=skills[action.skill];
      if(!sk) return "✨ スキル";
      if(sk.target==="enemyAll") return `${sk.icon} ${sk.name}→敵全体`;
      if(sk.target==="enemyRandom") return `${sk.icon} ${sk.name}→ランダム敵`;
      if(sk.target==="allyAll") return `${sk.icon} ${sk.name}→味方全員`;
      if(sk.target==="self") return `${sk.icon} ${sk.name}→自分`;
      if(sk.target==="enemy"){
        const target=enemyByUid(action.targetUid);
        return `${sk.icon} ${sk.name}→${target && target.hp>0 ? target.displayName : "敵"}`;
      }
      const target=roster[action.targetId || state.battleActive[action.targetSlot]];
      return `${sk.icon} ${sk.name}→${target ? target.name : "味方"}`;
    }
    return action.type;
  }

  function renderBattleParty(){
    const row=$("battlePartyRow");
    row.innerHTML="";
    row.classList.toggle("target-selecting",!!(state.battleTargetMode && state.battleTargetMode.kind==="ally"));
    updateBattleTargetUi();
    state.battleActive.forEach((id,slot)=>{
      const c=roster[id], st=S(c);
      const action=state.battleActions[slot];
      const btn=document.createElement("button");
      btn.className="battle-status-card";
      if(c.npcAuto) btn.classList.add("npc-auto");
      if(slot===state.battleActorSlot && state.battlePhase==="input" && !state.battleEnded && !state.battleTargetMode) btn.classList.add("active");
      if(st.hp<=0) btn.classList.add("ko");
      if(c.defending) btn.classList.add("defending");
      if(c.atkBuffRounds>0) btn.classList.add("buff-atk");
      const targetMode=state.battleTargetMode;
      const targetAllowed=!!(targetMode && targetMode.kind==="ally" && (
        targetMode.source==="item"
          ? battleItemTargetUsable(ITEMS[targetMode.item],c)
          : (targetMode.requireKO ? st.hp<=0 : st.hp>0)
      ));
      if(targetAllowed) btn.classList.add("targetable");
      btn.dataset.slot=String(slot);

      let turnText="";
      if(st.hp<=0) turnText="戦闘不能";
      else if(state.battlePhase==="input"){
        if(c.npcAuto) turnText="AUTO";
        else
        if(state.battleTargetMode && state.battleTargetMode.kind==="ally") turnText="タップで対象";
        else if(slot===state.battleActorSlot) turnText="選択中";
        else if(action) turnText="";
      }else if(slot===state.battleActorSlot && state.battlePhase==="resolve"){
        turnText="行動中";
      }

      const targetSelectText=(state.battleTargetMode && state.battleTargetMode.kind==="ally" && targetAllowed)
        ? `👆 ${targetModeName()}の対象`
        : (st.hp<=0 ? "行動不可" : compactActionLabel(action,c));

      btn.innerHTML=`
        <span class="status-name">${c.name} <small>Lv${c.level}</small></span>
        <span class="status-turn">${turnText}</span>
        <span class="status-effects">${battleStatusEffectMarkup(c)}</span>
        <span class="queued-action ${action?"ready":""}">${targetSelectText}</span>
        <span class="mini-bars"><b>HP</b><span class="mini-bar"><i style="width:${hpPct(c)}%"></i></span><span>${st.hp}/${st.hpMax}</span></span>
        <span class="mini-bars"><b>MP</b><span class="mini-bar mp"><i style="width:${mpPct(c)}%"></i></span><span>${st.mp}/${st.mpMax}</span></span>`;

      btn.onclick=()=>{
        if(state.battlePhase==="input") cancelScheduledTurnStart();
        if(state.battlePhase!=="input" || state.battleEnded) {
          state.battleActorSlot=slot;
          updateActorPortrait();
          renderBattleParty();
          return;
        }
        if(state.battleTargetMode && state.battleTargetMode.kind==="ally"){
          const pending=state.battleTargetMode;
          if(pending.source==="item" && !battleItemTargetUsable(ITEMS[pending.item],c)){
            setMessage("その対象には今は使えません。");
            return;
          }
          if(pending.source!=="item"){
            if(pending.requireKO && st.hp>0){
              setMessage("戦闘不能の仲間だけを対象にできます。");
              return;
            }
            if(!pending.requireKO && st.hp<=0){
              setMessage("戦闘不能の仲間は対象にできません。");
              return;
            }
          }
          const mode=pending;
          const targetId=state.battleActive[slot];
          state.battleTargetMode=null;
          if(mode.source==="item") queueAction({type:"item",item:mode.item,targetSlot:slot,targetId});
          else queueAction({type:"skill",skill:mode.skill,targetSlot:slot,targetId});
          return;
        }
        if(state.battleTargetMode?.kind==="enemy"){
          setMessage(`${targetModeName()}：対象の敵をタップしてください。`);
          return;
        }
        if(c.npcAuto){ setMessage(`${c.name}はNPCとして自動で行動します。`); return; }
        if(st.hp>0){
          if(conditionsOf(c).berserk){ setMessage(`💢 ${c.name} は狂乱状態で自動行動します。`); return; }
          state.battleActorSlot=slot;
          updateActorPortrait();
          renderBattleParty();
          renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
          setMessage(`${c.name}の行動を選択中`);
        }else{
          state.battleActorSlot=slot;
          updateActorPortrait();
          renderBattleParty();
          renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
          // v0.46p: selecting a KO member no longer overwrites the battle message.
        }
      };
      row.appendChild(btn);
    });

    const canDeploy=state.battlePhase==="input" && !state.battleEnded && state.battleReserve.length>0 && livingActiveSlots().length>0;
    for(let slot=state.battleActive.length;slot<4;slot++){
      if(slot===state.battleActive.length && canDeploy){
        const empty=document.createElement("button");
        empty.className="battle-status-card empty-deploy";
        empty.innerHTML="＋ 控えから出す";
        empty.onclick=()=>openSwap(slot);
        row.appendChild(empty);
      }else{
        const empty=document.createElement("div");
        empty.className="battle-status-card";
        empty.style.opacity=".34";
        empty.style.display="flex";
        empty.style.alignItems="center";
        empty.style.justifyContent="center";
        empty.style.fontSize="9px";
        empty.style.color="#8192a1";
        empty.textContent="EMPTY";
        row.appendChild(empty);
      }
    }
    updateSkillButton();
  }

  function updateActorPortrait(){
    const id=state.battleActive[state.battleActorSlot];
    const c=roster[id];
    $("battleActorName").textContent=c.name;
    $("battleActorCaption").textContent=state.battleEnded ? "戦闘終了" :
      state.battleTargetMode ? `${targetModeName()}：${state.battleTargetMode.kind==="enemy" ? "敵を選択" : "仲間を選択"}` :
      state.battlePhase==="input" ? c.caption :
      state.battlePhase==="resolve" ? "味方の行動を処理中" :
      state.battlePhase==="enemy" ? "敵の行動を処理中" : c.caption;
    const box=$("battleActorPortrait");
    box.innerHTML="";
    if(c.img){
      const img=document.createElement("img");
      img.src=c.img; img.alt=c.name;
      const p=c.portrait||{scale:1,x:0,y:0};
      img.style.transform=`translate(${p.x||0}px,${p.y||0}px) scale(${p.scale||1})`;
      box.appendChild(img);
    }else{
      const ph=document.createElement("div"); ph.className="hero-placeholder"; ph.textContent="👤"; box.appendChild(ph);
    }
    updateSkillButton();
  }

  function animateActor(kind){
    const box=$("battleActorPortrait");
    const cls=kind==="attack"?"actor-attack":kind==="buff"?"actor-buff":"actor-cast";
    box.classList.remove("actor-attack","actor-cast","actor-buff");
    void box.offsetWidth;
    box.classList.add(cls);
    setTimeout(()=>box.classList.remove(cls),t(700));
  }

  function spawnFx(kind,symbol,targetEl=null){
    const layer=$("battleEffectLayer");
    const fx=document.createElement("div");
    fx.className=`fx-${kind}`;
    fx.textContent=symbol;
    if(targetEl){
      const fieldRect=$("battleEffectLayer").getBoundingClientRect();
      const r=targetEl.getBoundingClientRect();
      fx.style.left=`${r.left+r.width/2-fieldRect.left}px`;
      fx.style.top=`${r.top+r.height/2-fieldRect.top}px`;
    }
    layer.appendChild(fx);
    setTimeout(()=>fx.remove(),t(950));
  }

  function spawnCritical(targetEl,damage){
    if(!targetEl) return;
    const layer=$("battleEffectLayer");
    const pop=document.createElement("div");
    pop.className="critical-pop";
    pop.innerHTML=`<strong>CRITICAL!</strong><span>${damage}</span>`;
    const fieldRect=layer.getBoundingClientRect();
    const r=targetEl.getBoundingClientRect();
    pop.style.left=`${r.left+r.width/2-fieldRect.left}px`;
    pop.style.top=`${r.top+r.height*.38-fieldRect.top}px`;
    layer.appendChild(pop);
    setTimeout(()=>pop.remove(),t(1050));
  }

  function setBattleActorSlot(slot){
    const maxSlot=Math.max(0,state.battleActive.length-1);
    state.battleActorSlot=Math.max(0,Math.min(maxSlot,Number(slot)||0));
    state.battleTargetMode=null;
    updateActorPortrait();
    renderBattleParty();
  }

  function setBattleBackground(area){
    const field=$("battleField");
    if(!field) return;
    const src=BATTLE_BG_BY_AREA[area] || BATTLE_BG_PLAINS;
    // Externalized CSS consumes this custom property, so resolve the image path
    // against the document first instead of leaving a relative URL inside var().
    const resolved=new URL(src,document.baseURI).href;
    field.style.setProperty("--battle-bg",`url("${resolved}")`);
  }

  function makeBattleEnemyInstance(id,index,suffix="",options={}){
    const base=enemyData[id];
    if(!base) return null;
    return {
      uid:`${id}_${index}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      id,name:base.name,displayName:base.name+suffix,img:base.img,
      hp:base.stats.hp,hpMax:base.stats.hp,mp:base.stats.mp||0,mpMax:base.stats.mp||0,
      atk:base.stats.atk,def:base.stats.def,magic:base.stats.magic||0,
      mdef:base.stats.mdef||0,spd:base.stats.spd||1,exp:base.exp||0,gold:base.gold||0,
      skills:[...(base.skills||[])],ai:base.ai||"basic",resist:{...(base.resist||{})},
      basicAttackAll:!!base.basicAttackAll,basicAttackPower:Number.isFinite(base.basicAttackPower)?base.basicAttackPower:1,
      basicAttackFx:base.basicAttackFx||"impact",basicAttackSymbol:base.basicAttackSymbol||"💥",
      basicBowInstantKillRate:Math.max(0,Number(base.basicBowInstantKillRate)||0),basicPoisonRate:Math.max(0,Number(base.basicPoisonRate)||0),
      critRate:clampRate(base.critRate||0),evasionRate:clampRate(base.evasionRate||0),
      critMultiplier:Number(base.critMultiplier)||BASE_CRITICAL_MULTIPLIER,
      bowInstantKillImmune:!!base.bowInstantKillImmune,statusDeathImmune:!!base.statusDeathImmune,statusImmuneAll:!!base.statusImmuneAll,statusImmune:[...(base.statusImmune||[])],boss:!!base.boss,
      silverBodyDamageCompression:!!base.silverBodyDamageCompression,escaped:false,actionCount:0,
      elementNullifyRate:Math.max(0,Math.min(1,Number(base.elementNullifyRate)||0)),elementNullifyElements:[...(base.elementNullifyElements||[])],
      enemyCounterChance:Math.max(0,Math.min(1,Number(base.enemyCounterChance)||0)),
      noReward:!!options.noReward,noRecruit:!!options.noRecruit,summoned:!!options.summoned,lastSummonRound:0,
      atkBuff:1,atkBuffRounds:0,defBuff:1,defBuffRounds:0,magicBuff:1,magicBuffRounds:0,mdefBuff:1,mdefBuffRounds:0,spdBuff:1,spdBuffRounds:0,
      conditions:{poison:false,blind:false,silence:false,shock:false,berserk:false,mount:false,aura:false},
      lastSkillId:null,
      shockRecoverFails:0,defeatOrder:0
    };
  }

  function renderFormation(area=state.battleFormationArea,index=state.battleFormationIndex,fresh=true){
    if(!battleFormations[area]) area="plains";
    setBattleBackground(area);
    const pack=battleFormations[area];
    index=((index % pack.formations.length)+pack.formations.length)%pack.formations.length;
    state.battleFormationArea=area;
    state.battleFormationIndex=index;

    if(fresh){
      const ids=pack.formations[index];
      const counts={};
      ids.forEach(id=>counts[id]=(counts[id]||0)+1);
      const seen={};
      state.battleEnemies=ids.map((id,i)=>{
        const base=enemyData[id];
        seen[id]=(seen[id]||0)+1;
        const suffix=counts[id]>1 ? String.fromCharCode(64+seen[id]) : "";
        return makeBattleEnemyInstance(id,i,suffix);
      });
    }

    const living=state.battleEnemies.filter(e=>e.hp>0 && !e.escaped);
    const stage=$("enemyStage");
    stage.dataset.count=String(Math.max(1,living.length));
    stage.innerHTML="";

    living.forEach(e=>{
      const div=document.createElement("div");
      div.className="enemy";
      div.dataset.enemyUid=e.uid;
      const img=document.createElement("img"); img.src=e.img; img.alt=e.displayName;
      const name=document.createElement("span");
      const recruitState=!speciesRecruitment[e.id] ? "recruit-unavailable" : (state.ownedSpecies.has(e.id) ? "recruit-owned" : "recruit-new");
      name.className=`enemy-name ${recruitState}`;
      name.textContent=e.displayName+enemyStatusSuffix(e);
      const hpWrap=document.createElement("span"); hpWrap.className="enemy-hp-wrap";
      const hp=document.createElement("i"); hp.className="enemy-hp"; hp.style.width=`${Math.max(0,Math.round(e.hp/e.hpMax*100))}%`;
      hpWrap.appendChild(hp);
      div.append(img,name,hpWrap);

      if(state.battleTargetMode?.kind==="enemy") div.classList.add("targetable");
      div.onclick=()=>chooseBattleEnemyTarget(e.uid);
      stage.appendChild(div);
    });

    stage.classList.toggle("target-selecting",state.battleTargetMode?.kind==="enemy");
    updateBattleTargetUi();

    $("battleAreaLabel").textContent=pack.label;
    const battleHeaderName=(state.battleFromRun && state.run)
      ? currentRunAreaUi().name
      : String(pack.label||"戦闘").replace(/^[^一-龠ぁ-んァ-ヶA-Za-z0-9]+/,"").trim();
    if($("topTitle")) $("topTitle").textContent=battleHeaderName;
    if($("topSubtitle")) $("topSubtitle").textContent=`戦闘 ${DEV_VERSION}`;
    $("formationAreaSelect").value=area;
    $("formationNum").textContent=`${index+1} / ${pack.formations.length}`;
  }

  function randomFormation(area="plains"){
    const pack=battleFormations[area] || battleFormations.plains;
    const count=pack.formations.length;
    if(!count) return 0;
    const nonRandomSet=new Set([...(pack.nonRandomFormationIndexes||[])].filter(i=>Number.isInteger(i) && i>=0 && i<count));
    const rareIndexes=[...(pack.rareFormationIndexes||[])].filter(i=>Number.isInteger(i) && i>=0 && i<count && !nonRandomSet.has(i));
    const rareRate=Math.max(0,Math.min(1,Number(pack.rareRate)||0));
    if(rareIndexes.length && rareRate>0){
      if(Math.random()<rareRate) return choose(rareIndexes);
      const rareSet=new Set(rareIndexes);
      const normalIndexes=Array.from({length:count},(_,i)=>i).filter(i=>!rareSet.has(i) && !nonRandomSet.has(i));
      if(normalIndexes.length) return choose(normalIndexes);
    }
    const selectableIndexes=Array.from({length:count},(_,i)=>i).filter(i=>!nonRandomSet.has(i));
    return selectableIndexes.length ? choose(selectableIndexes) : 0;
  }

  function setCommandsEnabled(enabled){
    if(!enabled){ closeSkillMenu(); closeItemMenu(); }
    document.querySelectorAll(".cmd[data-command], #swapBtn, #escapeBtn").forEach(b=>b.disabled=!enabled);
    $("turnAutoBtn").disabled=!enabled;
    updateSkillButton();
    updateAutoButtons();
  }

  function commandsReady(){ return livingActiveSlots().every(x=>!!state.battleActions[x.i]); }

  function updateExecuteButton(){
    const btn=$("battleExecuteBtn");
    const ready=state.battlePhase==="input" && commandsReady() && !state.battleEnded && !state.battleTargetMode;
    btn.disabled=!ready;
  }

  function cancelScheduledTurnStart(){
    if(state.battleAutoStartTimer){
      clearTimeout(state.battleAutoStartTimer);
      state.battleAutoStartTimer=null;
    }
    const note=$("autoStartNote");
    if(note){
      note.classList.remove("countdown");
      note.textContent=state.battleAutoContinuous ? "継続オート中" : "全員入力で自動開始";
    }
  }

  function scheduleTurnStart(delay=0){
    if(state.battlePhase!=="input" || state.battleEnded || state.battleTargetMode || !commandsReady()) return;
    cancelScheduledTurnStart();
    const note=$("autoStartNote");
    if(note){
      note.classList.add("countdown");
      note.textContent="入力完了 → 行動開始";
    }
    state.battleAutoStartTimer=setTimeout(()=>{
      state.battleAutoStartTimer=null;
      if(state.battlePhase==="input" && !state.battleEnded && !state.battleTargetMode && commandsReady()){
        resolveTurn();
      }
    }, delay);
  }

  function updateAutoButtons(){
    const toggle=$("autoToggleBtn");
    const one=$("turnAutoBtn");
    if(toggle){
      toggle.classList.toggle("on",state.battleAutoContinuous);
      toggle.querySelector("span").innerHTML=state.battleAutoContinuous ? "AUTO<br>ON" : "AUTO<br>OFF";
    }
    if(one) one.disabled=state.battlePhase!=="input" || state.battleEnded;
    const note=$("autoStartNote");
    if(note && !state.battleAutoStartTimer){
      note.classList.remove("countdown");
      note.textContent=state.battleAutoContinuous ? "継続オート中" : "全員入力で自動開始";
    }
  }

  function nextUnqueuedSlot(afterSlot){
    const order=[];
    for(let i=afterSlot+1;i<state.battleActive.length;i++) order.push(i);
    for(let i=0;i<=Math.min(afterSlot,state.battleActive.length-1);i++) order.push(i);
    return order.find(slot=>{
      const c=roster[state.battleActive[slot]];
      return S(c).hp>0 && !c.npcAuto && !state.battleActions[slot];
    });
  }

  function lowestHpEnemy(){
    return [...livingEnemies()].sort((a,b)=>(a.hp/a.hpMax)-(b.hp/b.hpMax))[0] || null;
  }

  function lowestHpAllySlot(){
    const living=livingActiveSlots();
    if(!living.length) return null;
    living.sort((a,b)=>(S(a.c).hp/S(a.c).hpMax)-(S(b.c).hp/S(b.c).hpMax));
    return living[0].i;
  }

  function strongestUnbuffedAllySlot(){
    const living=livingActiveSlots();
    if(!living.length) return null;
    const unbuffed=living.filter(x=>x.c.atkBuffRounds<=0);
    const pool=unbuffed.length ? unbuffed : living;
    pool.sort((a,b)=>effectiveAtk(b.c)-effectiveAtk(a.c));
    return pool[0].i;
  }

  function makeAttackAction(){
    const target=lowestHpEnemy();
    return target ? {type:"attack",targetUid:target.uid} : null;
  }

  function chooseAutoAction(slot){
    const actor=roster[state.battleActive[slot]];
    if(!actor || S(actor).hp<=0) return null;
    if(conditionsOf(actor).silence) return makeAttackAction();
    const firstSkillId=learnedSkillIds(actor)[0] || null;
    const sk=firstSkillId ? skills[firstSkillId] : null;
    const target=lowestHpEnemy();

    // Eliza: fixed escort NPC. She heals when needed and otherwise uses ice magic automatically.
    if(actor.id==="eliza"){
      const living=livingActiveSlots();
      const injured=[...living].sort((a,b)=>(S(a.c).hp/S(a.c).hpMax)-(S(b.c).hp/S(b.c).hpMax));
      const worst=injured[0];
      if(worst && S(worst.c).hp/S(worst.c).hpMax<.50 && S(actor).mp>=battleSkillCost(actor,skills.heal)){
        return {type:"skill",skill:"heal",targetSlot:worst.i,targetId:state.battleActive[worst.i]};
      }
      const hurtCount=living.filter(x=>S(x.c).hp/S(x.c).hpMax<.72).length;
      if(hurtCount>=2 && S(actor).mp>=battleSkillCost(actor,skills.allHeal)) return {type:"skill",skill:"allHeal"};
      if(livingEnemies().length>=2 && S(actor).mp>=battleSkillCost(actor,skills.cold)) return {type:"skill",skill:"cold"};
      if(target && S(actor).mp>=battleSkillCost(actor,skills.frost)) return {type:"skill",skill:"frost",targetUid:target.uid};
      if(target && S(actor).mp>=battleSkillCost(actor,skills.ice)) return {type:"skill",skill:"ice",targetUid:target.uid};
      return makeAttackAction();
    }

    // Hero: demonstrate the multi-skill setup. Blaze when 2+ enemies remain, otherwise Fire.
    if(actor.id==="hero"){
      const blaze=skills.blaze, fire=skills.fire;
      if(livingEnemies().length>=2 && learnedSkillIds(actor).includes("blaze") && S(actor).mp>=battleSkillCost(actor,blaze)){
        return {type:"skill",skill:"blaze"};
      }
      if(target && learnedSkillIds(actor).includes("fire") && S(actor).mp>=battleSkillCost(actor,fire)){
        return {type:"skill",skill:"fire",targetUid:target.uid};
      }
    }

    // Slime: use Tackle while HP is above 30%; otherwise play safely.
    if(actor.id==="slime" && sk?.id==="tackle" && S(actor).mp>=battleSkillCost(actor,sk) && S(actor).hp/S(actor).hpMax>.30 && target){
      return {type:"skill",skill:"tackle",targetUid:target.uid};
    }

    // Dog: if somebody lacks the attack buff, use Polish on the strongest candidate.
    if(actor.id==="dog" && sk?.id==="polish" && S(actor).mp>=battleSkillCost(actor,sk)){
      const needsBuff=livingActiveSlots().some(x=>x.c.atkBuffRounds<=0);
      if(needsBuff){
        const targetSlot=strongestUnbuffedAllySlot();
        if(targetSlot!==null) return {type:"skill",skill:"polish",targetSlot,targetId:state.battleActive[targetSlot]};
      }
    }

    // Fairy: heal the most injured ally below 50%; otherwise attack.
    if(actor.id==="fairy" && sk?.id==="heal" && S(actor).mp>=battleSkillCost(actor,sk)){
      const targetSlot=lowestHpAllySlot();
      if(targetSlot!==null){
        const ally=roster[state.battleActive[targetSlot]];
        if(S(ally).hp/S(ally).hpMax<.50){
          return {type:"skill",skill:"heal",targetSlot,targetId:state.battleActive[targetSlot]};
        }
      }
    }

    return makeAttackAction();
  }

  function fillAutoActions(){
    if(state.battlePhase!=="input" || state.battleEnded) return false;
    cancelScheduledTurnStart();
    state.battleTargetMode=null;

    livingActiveSlots().forEach(({i})=>{
      const action=chooseAutoAction(i);
      if(action){
        refundQueuedItem(i);
        state.battleActions[i]=action;
      }
    });

    const first=livingActiveSlots()[0];
    if(first) state.battleActorSlot=first.i;
    renderBattleParty();
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    updateActorPortrait();
    updateExecuteButton();

    if(commandsReady()){
      setMessage(state.battleAutoContinuous
        ? "AUTO：4人の行動を選択しました。"
        : "1ターンオート：4人の行動を選択しました。");
      scheduleTurnStart(0);
      return true;
    }
    return false;
  }

  function applyRoundStartWeaponEffects(){
    const notices=[];
    livingActiveSlots().forEach(({c})=>{
      const weapon=equippedWeapon(c);
      const rate=Math.max(0,Number(weapon?.roundStartBlockRate)||0);
      if(rate>0 && Math.random()<rate){
        const result=applyStatBuff(c,skills.block);
        if(result.applied) notices.push(`🔶 ${c.name} の ${weapon.name} が輝き、ブロックが発動！`);
      }
    });
    if(notices.length) toast(notices.join(" / "));
  }

  function startCommandInput(){
    if(state.battleEnded) return;
    applyRoundStartWeaponEffects();
    cancelScheduledTurnStart();
    state.battlePhase="input";
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleActive.forEach(id=>roster[id].defending=false);
    livingActiveSlots().forEach(({i,c})=>{
      if(c.npcAuto) state.battleActions[i]=chooseAutoAction(i);
      else if(conditionsOf(c).berserk) state.battleActions[i]=makeAttackAction();
    });

    const living=livingActiveSlots();
    const first=living.find(x=>!x.c.npcAuto && !state.battleActions[x.i]) || living.find(x=>!x.c.npcAuto) || living[0];
    if(!first){ loseBattle(); return; }
    state.battleActorSlot=first.i;
    setCommandsEnabled(true);
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    updateActorPortrait();
    renderBattleParty();
    updateExecuteButton();
    updateAutoButtons();

    if(commandsReady() && living.length && living.every(x=>conditionsOf(x.c).berserk)){
      setCommandsEnabled(false);
      setMessage(`ROUND ${state.battleRound}：狂乱中の仲間が自動で襲いかかる！`);
      scheduleTurnStart(420);
      return;
    }

    if(state.battleAutoContinuous){
      setMessage(`ROUND ${state.battleRound}：AUTOが行動を選択します。`);
      setTimeout(()=>fillAutoActions(),260);
    }else{
      setMessage(currentInputPrompt());
    }
  }

  function queueAction(action){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    const slot=state.battleActorSlot;
    const actor=roster[state.battleActive[slot]];
    if(S(actor).hp<=0) return;

    const previous=state.battleActions[slot];
    const previousItem=previous?.type==="item" ? previous.item : null;
    const nextItem=action?.type==="item" ? action.item : null;
    const available=nextItem ? itemCount(nextItem)+(previousItem===nextItem?1:0) : 0;
    if(nextItem && available<=0){ setMessage(`${ITEMS[nextItem]?.name||"アイテム"}を持っていません。`); return; }
    if(previousItem) addItemCount(previousItem,1);
    if(nextItem) removeItemCount(nextItem,1);

    state.battleTargetMode=null;
    state.battleActions[slot]=action;
    updateHeader();
    renderBattleParty();
    updateExecuteButton();

    const next=nextUnqueuedSlot(slot);
    if(next!==undefined){
      state.battleActorSlot=next;
      updateActorPortrait();
      renderBattleParty();
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      setMessage(currentInputPrompt());
    }else{
      updateActorPortrait();
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      setMessage("全員の行動を選択済み。自動でターンを開始します。");
      scheduleTurnStart(0);
    }
  }

  function queueAttack(){
    cancelScheduledTurnStart();
    state.battleTargetMode=null;
    const actor=roster[state.battleActive[state.battleActorSlot]];
    if(actor && weaponAttackProfile(actor).attackAll){
      if(!livingEnemies().length){ setMessage("攻撃対象がいません。"); return; }
      queueAction({type:"attack",targetUid:null});
      return;
    }
    if(!livingEnemies().length){ setMessage("攻撃対象がいません。"); return; }
    enterBattleTargetMode(
      {kind:"enemy",source:"attack",actorSlot:state.battleActorSlot,returnTo:"command"},
      "⚔ 攻撃：光っている敵をタップしてください。"
    );
  }

  function queueDefend(){
    cancelScheduledTurnStart();
    state.battleTargetMode=null;
    queueAction({type:"defend"});
  }

  function chooseSkill(){
    openSkillMenu();
  }

  function placeholderCommand(name){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    const actor=roster[state.battleActive[state.battleActorSlot]];
    state.battleTargetMode=null;
    renderBattleParty();
    setMessage(`${actor.name}：${name} はまだ仮ボタンです。`);
  }

  async function animateEnemyDamage(target,killed=false,fxKind="slash",fxSymbol="✦",critical=false,damage=0){
    const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
    if(!el) return;
    spawnFx(fxKind,fxSymbol,el);
    if(critical) spawnCritical(el,damage);
    el.classList.add("damage","flash-hit");

    const hpBar=el.querySelector(".enemy-hp");
    const hpNum=el.querySelector(".enemy-hp-num");
    if(hpBar) hpBar.style.width=`${Math.max(0,Math.round(target.hp/target.hpMax*100))}%`;
    if(hpNum) hpNum.textContent=`${target.hp}/${target.hpMax}`;

    await wait(BASE_TIME.hit);
    el.classList.remove("damage","flash-hit");

    if(killed){
      if(!target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
      if(hpBar) hpBar.style.width="0%";
      if(hpNum) hpNum.textContent=`0/${target.hpMax}`;
      await wait(BASE_TIME.koHold);
      el.classList.add("dying");
      await wait(BASE_TIME.koFade);
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    }
  }

  function flashPartyValue(slot,value,kind="damage",label=""){
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(!card) return;
    if(kind==="damage" || kind==="recoil") card.classList.add("hit");
    if(kind==="heal") card.classList.add("heal-glow");
    if(kind==="buff") card.classList.add("buff-glow");

    const pop=document.createElement("span");
    pop.className=kind==="heal"?"heal-pop":kind==="recoil"?"recoil-pop":"damage-pop";
    pop.textContent=kind==="heal"?`+${value}`:kind==="buff"?(label||"ATK↑"):`-${value}`;
    card.appendChild(pop);
    setTimeout(()=>{
      card.classList.remove("hit","heal-glow","buff-glow");
      pop.remove();
    },t(950));
  }

  async function resolveAttack(actor,target,skillName=null,mult=1,fxKind="slash",fxSymbol="✦",options={}){
    const isBasic=!!options.basic;
    const profile=isBasic?weaponAttackProfile(actor):null;
    animateActor("attack");
    setMessage(`${actor.name} の${skillName||"攻撃"}！`);
    await wait(BASE_TIME.actionLead);

    if(blindedPhysicalMiss(actor) || physicalAttackMisses(target)){
      setMessage(`${actor.name} の${skillName||"攻撃"}！ ${target.displayName} はひらりとかわした！`);
      await wait(BASE_TIME.short);
      return {dmg:0,killed:false,missed:true,critical:false};
    }

    // Some swords carry a normal death-status proc. Unlike bow "射抜", this uses the ordinary death-resistance system.
    if(isBasic && profile.basicDeathRate>0){
      const death=tryInflictStatus(target,"death",profile.basicDeathRate);
      if(death.success){
        if(!target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
        setMessage(`☠️ ${actor.name} の一撃が急所を断った！ ${target.displayName} を即死させた！`);
        await animateEnemyDamage(target,true,"slash","☠",false,target.hpMax);
        if(isBasic) await maybeTriggerOrangeGel(actor,target,options.traitContext);
        return {dmg:target.hpMax,killed:true,missed:false,critical:false,instantKill:true};
      }
    }

    // "射抜" is a weapon-specific roll and deliberately ignores the normal death-status resistance system.
    const bowInstantKillBlocked=!!target.bowInstantKillImmune || (!!target.stats && equipmentHasFlag(target,"bowInstantKillImmune"));
    if(isBasic && profile.bowInstantKillRate>0 && !bowInstantKillBlocked && Math.random()*100<profile.bowInstantKillRate){
      target.hp=0;
      if(!target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
      const pierceGun=profile.weapon?.weaponType==="gun";
      setMessage(`${pierceGun?"🔫":"🏹"} ${actor.name} は ${target.displayName} を射抜いた！`);
      await animateEnemyDamage(target,true,pierceGun?"gun":"impact",pierceGun?"✹":"🎯");
      if(isBasic) await maybeTriggerOrangeGel(actor,target,options.traitContext);
      return {dmg:target.hpMax,killed:true,missed:false,critical:false,instantKill:true};
    }

    const attackPower=mult*(isBasic?profile.power:1);
    const defenseInfluence=isBasic?profile.defenseInfluence:1;
    const attackElement=physicalAttackElementForActor(actor,options.element||null);
    let dmg=physicalDamage(effectiveAtk(actor),enemyDefenseForAttacker(actor,target),attackPower,1,defenseInfluence);
    dmg=Math.max(1,Math.round(dmg*physicalElementDamageMultiplierForActor(actor,target,options.element||null)));
    const canCrit=isBasic ? profile.canCrit : options.canCrit!==false;
    const critical=canCrit && (options.forceCrit===true || rollCritical(criticalRateForAttack(actor,target)));
    if(critical) dmg=Math.max(1,Math.round(dmg*criticalMultiplierForActor(actor)*Math.max(1,Number(options.critDamageMultiplier)||1)));
    dmg=silverBodyAdjustedDamage(target,dmg,{critical});
    const legacy=enemyElementNullify(target,attackElement,dmg);
    dmg=legacy.damage;

    target.hp=Math.max(0,target.hp-dmg);
    const killed=target.hp<=0;
    if(killed && !target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
    const critText=critical?" 会心の一撃！":"";
    setMessage(legacy.nullified
      ? `🏺 ${target.displayName} は「古代の遺産」で${attackElement==="fire"?"炎":"氷"}属性ダメージを無効化した！`
      : `${actor.name} の${skillName||"攻撃"}！${critText} ${target.displayName} に ${dmg} ダメージ。${killed?`${target.displayName} を倒した！`:""}`);
    const hitFx=isBasic?profile.fx:{kind:fxKind,symbol:fxSymbol};
    await animateEnemyDamage(target,killed,hitFx.kind,hitFx.symbol,critical,dmg);
    if(!killed){
      const proc=applyEquipmentPhysicalStatus(actor,target);
      if(proc?.result?.success){
        setMessage(`${statusIcon(proc.status)} ${actor.name} の装備効果！ ${target.displayName} は${statusName(proc.status)}状態になった！`);
        await wait(BASE_TIME.short);
      }
    }
    if(isBasic && !killed && profile.basicDispelRate>0 && Math.random()<profile.basicDispelRate){
      const removed=clearEnemyBuffs(target);
      if(removed){
        setMessage(`🏹 ${actor.name} の武器効果！ ${target.displayName} の強化効果を解除した！`);
        const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
        if(el) spawnFx("impact","✨",el);
        await wait(BASE_TIME.short);
      }
    }
    if(isBasic) await maybeTriggerOrangeGel(actor,target,options.traitContext);
    if(!killed && dmg>0) await maybeTriggerEnemyCounterStance(target,actor);
    return {dmg,killed,missed:false,critical,actorKo:S(actor).hp<=0};
  }

  async function resolveBasicAttack(actor,action,options={}){
    const profile=weaponAttackProfile(actor);
    const traitContext=options.traitContext || makeTraitActionContext();
    let result;
    if(!profile.attackAll){
      let target=enemyByUid(action?.targetUid);
      if(!target || target.hp<=0){
        target=livingEnemies()[0]||null;
      }
      if(!target) return {battleWon:true};
      const hit=await resolveAttack(actor,target,null,1,"slash","⚔",{basic:true,traitContext});
      result={battleWon:livingEnemies().length===0,result:hit};
    }else{
      const targets=[...livingEnemies()];
      if(!targets.length) return {battleWon:true};
      animateActor("attack");
      setMessage(`➰ ${actor.name} の鞭撃！`);
      await wait(BASE_TIME.actionLead);

      let total=0,defeated=0,missed=0,criticals=0;
      for(const target of targets){
        if(blindedPhysicalMiss(actor) || physicalAttackMisses(target)){
          missed++;
          setMessage(`➰ ${target.displayName} は鞭撃をかわした！`);
          await wait(BASE_TIME.short);
          continue;
        }
        let dmg=physicalDamage(effectiveAtk(actor),enemyDefenseForAttacker(actor,target),profile.power,1,profile.defenseInfluence);
        dmg=Math.max(1,Math.round(dmg*physicalElementDamageMultiplierForActor(actor,target,null)));
        const critical=profile.canCrit && rollCritical(criticalRateForAttack(actor,target));
        if(critical){
          criticals++;
          dmg=Math.max(1,Math.round(dmg*criticalMultiplierForActor(actor)));
        }
        dmg=silverBodyAdjustedDamage(target,dmg,{critical});
        target.hp=Math.max(0,target.hp-dmg);
        const killed=target.hp<=0;
        if(killed && !target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
        total+=dmg;
        if(killed) defeated++;
        setMessage(`➰ ${target.displayName} に ${dmg} ダメージ。${critical?" 会心！":""}${killed?` ${target.displayName} を倒した！`:""}`);
        await animateEnemyDamage(target,killed,profile.fx.kind,profile.fx.symbol,critical,dmg);
        if(!killed){
          const proc=applyEquipmentPhysicalStatus(actor,target);
          if(proc?.result?.success){
            setMessage(`${statusIcon(proc.status)} ${actor.name} の装備効果！ ${target.displayName} は${statusName(proc.status)}状態になった！`);
            await wait(BASE_TIME.short);
          }
        }
        await maybeTriggerOrangeGel(actor,target,traitContext);
      }
      const notes=[defeated?`${defeated}体撃破`:"",missed?`${missed}体回避`:"",criticals?`${criticals}回会心`:""].filter(Boolean).join(" / ");
      setMessage(`➰ ${actor.name} の鞭撃：合計 ${total} ダメージ${notes?`（${notes}）`:""}`);
      result={battleWon:livingEnemies().length===0,total,defeated,missed};
    }

    const normalTrait=traitOf(actor),normalTraitEffect=normalTrait?.effect;
    if(S(actor).hp>0 && !options.isCounter && !options.isFollowup && !result.battleWon && equippedWeapon(actor)?.weaponType==="whip" && normalTraitEffect?.type==="whipNormalFollowup" && Math.random()<(Number(normalTraitEffect.chance)||Number(normalTrait?.chance)||.05)){
      setMessage(`🐙 ${actor.name} の「うねうね触手」！ 触手が再び襲いかかる！`);
      await wait(BASE_TIME.short);
      const follow=await resolveBasicAttack(actor,action,{allowDoubleAttack:false,isFollowup:true,traitContext});
      result.battleWon=!!follow?.battleWon;
      result.traitFollowup=follow;
    }

    // 連続攻撃 is checked only after a player-selected normal attack, never after a counter or its own follow-up.
    if(S(actor).hp>0 && options.allowDoubleAttack!==false && !options.isCounter && !result.battleWon && hasPassive(actor,"doubleAttack") && Math.random()<(Number(skills.doubleAttack?.chance)||.15)){
      setMessage(`⚔️ ${actor.name} の「連続攻撃」！ もう一度通常攻撃！`);
      await wait(BASE_TIME.short);
      const follow=await resolveBasicAttack(actor,action,{allowDoubleAttack:false,isFollowup:true,traitContext});
      result.battleWon=!!follow?.battleWon;
      result.followup=follow;
    }
    return result;
  }

  async function resolveRandomMultiPhysicalSkill(actor,sk){
    const hits=Math.max(1,Number(sk.hits)||1);
    animateActor("attack");
    setMessage(`${sk.icon||"⚔️"} ${actor.name} は ${sk.name} を放った！`);
    await wait(BASE_TIME.actionLead);
    let total=0,landed=0,missed=0,criticals=0,defeated=0;
    for(let hit=1;hit<=hits;hit++){
      const pool=livingEnemies();
      if(!pool.length) break;
      const target=choose(pool);
      if(blindedPhysicalMiss(actor) || physicalAttackMisses(target)){
        missed++;
        setMessage(`${sk.icon||"⚔️"} ${sk.name} ${hit}撃目！ ${target.displayName} はかわした！`);
        await wait(BASE_TIME.short);
        continue;
      }
      let dmg=physicalDamage(effectiveAtk(actor),enemyDefenseForAttacker(actor,target),Number(sk.hitPower)||1,1,Number(sk.defenseInfluence)||1);
      dmg=Math.max(1,Math.round(dmg*physicalElementDamageMultiplierForActor(actor,target,sk.element||null)));
      const critical=sk.canCrit!==false && rollCritical(criticalRateForAttack(actor,target));
      if(critical){ criticals++; dmg=Math.max(1,Math.round(dmg*criticalMultiplierForActor(actor))); }
      dmg=silverBodyAdjustedDamage(target,dmg,{critical});
      const legacy=enemyElementNullify(target,sk.element||null,dmg);
      dmg=legacy.damage;
      target.hp=Math.max(0,target.hp-dmg);
      const killed=target.hp<=0;
      if(killed && !target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
      total+=dmg; landed++; if(killed)defeated++;
      setMessage(`${sk.icon||"⚔️"} ${sk.name} ${hit}撃目！${critical?" 会心！":""} ${target.displayName} に ${dmg} ダメージ。${killed?`${target.displayName} を倒した！`:""}`);
      await animateEnemyDamage(target,killed,"impact",sk.fxSymbol||sk.icon||"✦",critical,dmg);
      if(!killed){
        const proc=applyEquipmentPhysicalStatus(actor,target);
        if(proc?.result?.success){
          setMessage(`${statusIcon(proc.status)} ${actor.name} の装備効果！ ${target.displayName} は${statusName(proc.status)}状態になった！`);
          await wait(BASE_TIME.short);
        }
        if(dmg>0) await maybeTriggerEnemyCounterStance(target,actor);
        if(S(actor).hp<=0 || state.battleEnded) break;
      }
    }
    const notes=[`${landed}/${hits}ヒット`,criticals?`${criticals}回会心`:"",defeated?`${defeated}体撃破`:"",missed?`${missed}回回避`:""].filter(Boolean).join(" / ");
    setMessage(`${sk.icon||"⚔️"} ${sk.name}：合計 ${total} ダメージ（${notes}）`);
    return {total,landed,missed,criticals,defeated};
  }

  async function resolveAllPhysicalSkill(actor,sk){
    const targets=[...livingEnemies()];
    if(!targets.length) return {total:0};
    animateActor("attack");
    setMessage(`${sk.icon||"⚔️"} ${actor.name} は ${sk.name} を放った！`);
    await wait(BASE_TIME.actionLead);
    let total=0,defeated=0,missed=0,shocked=0;
    for(const target of targets){
      if(blindedPhysicalMiss(actor) || physicalAttackMisses(target)){
        missed++;
        setMessage(`${sk.icon||"⚔️"} ${target.displayName} は攻撃をかわした！`);
        await wait(BASE_TIME.short);
        continue;
      }
      let dmg=physicalDamage(effectiveAtk(actor),enemyDefenseForAttacker(actor,target),Number(sk.power)||1,1,Number(sk.defenseInfluence)||1);
      dmg=Math.max(1,Math.round(dmg*physicalElementDamageMultiplierForActor(actor,target,sk.element||null)));
      const critical=sk.canCrit!==false && rollCritical(criticalRateForAttack(actor,target));
      if(critical) dmg=Math.max(1,Math.round(dmg*criticalMultiplierForActor(actor)));
      dmg=silverBodyAdjustedDamage(target,dmg,{critical});
      const legacy=enemyElementNullify(target,sk.element||null,dmg);
      dmg=legacy.damage;
      target.hp=Math.max(0,target.hp-dmg);
      const killed=target.hp<=0;
      if(killed && !target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
      let shock=null;
      if(!killed && Number(sk.shockRate)>0) shock=tryInflictStatus(target,"shock",sk.shockRate);
      if(shock?.success) shocked++;
      total+=dmg; if(killed) defeated++;
      await animateEnemyDamage(target,killed,sk.animation||"impact",sk.fxSymbol||sk.icon||"✦",critical,dmg);
      if(!killed){
        const proc=applyEquipmentPhysicalStatus(actor,target);
        if(proc?.result?.success){
          setMessage(`${statusIcon(proc.status)} ${actor.name} の装備効果！ ${target.displayName} は${statusName(proc.status)}状態になった！`);
          await wait(BASE_TIME.short);
        }
        if(dmg>0) await maybeTriggerEnemyCounterStance(target,actor);
        if(S(actor).hp<=0 || state.battleEnded) break;
      }
    }
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    setMessage(`${sk.icon||"⚔️"} ${sk.name}！ 敵全体に合計 ${total} ダメージ！${shocked?` ${shocked}体が感電！`:""}${defeated?` ${defeated}体を倒した！`:""}${missed?` ${missed}体は回避。`:""}`);
    return {total,defeated,missed,shocked};
  }

  async function resolveSkill(actor,action,slot){
    const baseSkill=skills[action.skill];
    if(!baseSkill) return;
    const sk=effectiveSkillForActor(actor,baseSkill);
    if(conditionsOf(actor).silence){
      setMessage(`🔇 ${actor.name} は封印されていて ${sk.name} を使えない！`);
      await wait(BASE_TIME.message);
      return;
    }
    const actualCost=battleSkillCost(actor,sk);
    if(S(actor).mp<actualCost){
      setMessage(`${actor.name} はMPが足りず、${sk.name} を使えなかった。`);
      await wait(BASE_TIME.message);
      return;
    }
    if(!weaponRequirementMet(actor,sk)){
      setMessage(`${actor.name} は必要な武器（${weaponRequirementText(sk)}）を装備していないため、${sk.name} を使えなかった。`);
      await wait(BASE_TIME.message);
      return;
    }

    S(actor).mp-=actualCost;
    if(sk.kind==="heal") actor._usedHealingMagicThisRound=true;
    renderBattleParty();

    if(sk.kind==="magic"){
      let targets=[];
      if(sk.target==="enemyAll") targets=[...livingEnemies()];
      else{
        let target=enemyByUid(action.targetUid);
        if(!target || target.hp<=0) target=livingEnemies()[0]||null;
        if(target) targets=[target];
      }
      if(!targets.length) return;

      animateActor("cast");
      setMessage(`${sk.icon||"✨"} ${actor.name} は ${sk.name} を唱えた！`);
      await wait(BASE_TIME.actionLead);

      const results=[];
      for(const target of targets){
        let dmg=spellDamage(actor,target,sk);
        dmg=silverBodyAdjustedDamage(target,dmg);
        const legacy=enemyElementNullify(target,sk.element,dmg);
        dmg=legacy.damage;
        target.hp=Math.max(0,target.hp-dmg);
        const killed=target.hp<=0;
        if(killed && !target.defeatOrder) target.defeatOrder=++state.battleDefeatCounter;
        let shock=null;
        if(!killed && Number(sk.shockRate)>0) shock=tryInflictStatus(target,"shock",sk.shockRate);
        results.push({target,dmg,killed,shock,legacyNullified:legacy.nullified});
      }

      if(sk.target==="enemyAll"){
        const total=results.reduce((sum,r)=>sum+r.dmg,0);
        const defeated=results.filter(r=>r.killed).length;
        const shocked=results.filter(r=>r.shock?.success).length;
        const legacyNullified=results.filter(r=>r.legacyNullified).length;
        setMessage(`${sk.icon||"✨"} ${sk.name}！ 敵全体に合計 ${total} ダメージ！${legacyNullified?` 🏺 ${legacyNullified}体は「古代の遺産」で属性ダメージを無効化。`:""}${shocked?` ${shocked}体が感電！`:""}${defeated?` ${defeated}体を倒した！`:""}`);
        await Promise.all(results.map(r=>animateEnemyDamage(r.target,r.killed,sk.animation||"magicshot",sk.fxSymbol||sk.icon||"✦")));
      }else{
        const r=results[0];
        setMessage(r.legacyNullified
          ? `🏺 ${r.target.displayName} は「古代の遺産」で${sk.element==="fire"?"炎":"氷"}属性ダメージを無効化した！${r.shock?.success?" ⚡ 感電した！":""}`
          : `${sk.icon||"✨"} ${sk.name}！ ${r.target.displayName} に ${r.dmg} ダメージ。${r.shock?.success?"⚡ 感電した！ ":""}${r.killed?`${r.target.displayName} を倒した！`:""}`);
        await animateEnemyDamage(r.target,r.killed,sk.animation||"magicshot",sk.fxSymbol||sk.icon||"✦");
      }
      if(results.some(r=>r.shock?.success) && !results.some(r=>r.killed)) renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      return;
    }

    if(sk.kind==="status"){
      let targets=[];
      if(sk.target==="enemyAll") targets=[...livingEnemies()];
      else{
        let target=enemyByUid(action.targetUid);
        if(!target || target.hp<=0) target=livingEnemies()[0]||null;
        if(target) targets=[target];
      }
      if(!targets.length) return;

      animateActor("cast");
      setMessage(`${sk.icon||"✨"} ${actor.name} は ${sk.name} を唱えた！`);
      await wait(BASE_TIME.actionLead);
      const results=targets.map(target=>({target,result:tryInflictStatus(target,sk.status,sk.baseRate)}));

      if(sk.status==="death"){
        for(const r of results){
          if(r.result.success){
            if(!r.target.defeatOrder) r.target.defeatOrder=++state.battleDefeatCounter;
            await animateEnemyDamage(r.target,true,"magicshot","☠");
          }else{
            const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${r.target.uid}"]`);
            if(el) spawnFx("magicshot","☠",el);
          }
        }
      }else{
        results.forEach(r=>{
          const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${r.target.uid}"]`);
          if(el) spawnFx("magicshot",statusIcon(sk.status),el);
        });
        await wait(BASE_TIME.hit);
        renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      }

      const success=results.filter(r=>r.result.success).length;
      const already=results.filter(r=>r.result.reason==="already").length;
      const immune=results.filter(r=>r.result.reason==="immune").length;
      if(sk.target==="enemyAll"){
        if(success===0){
          const noneMsg=sk.status==="death" ? "しかし、誰も倒れなかった。" : `しかし、誰も${statusName(sk.status)}状態にはならなかった。`;
          setMessage(`${sk.icon||"✨"} ${sk.name}！ ${noneMsg}${already?` ${already}体はすでに同状態。`:""}${immune?` ${immune}体は無効。`:""}`);
        }else{
          setMessage(`${sk.icon||"✨"} ${sk.name}！ ${success}体に${statusName(sk.status)}が決まった。${already?` ${already}体はすでに同状態。`:""}${immune?` ${immune}体は無効。`:""}`);
        }
      }else{
        const r=results[0];
        const msg=r.result.success
          ? (sk.status==="death"?`${r.target.displayName} を即死させた！`:`${r.target.displayName} は${statusName(sk.status)}状態になった！`)
          : r.result.reason==="already"?`${r.target.displayName} はすでに${statusName(sk.status)}状態。`
          : r.result.reason==="immune"?`${r.target.displayName} には効かなかった。`
          : `${r.target.displayName} は${statusName(sk.status)}を免れた。`;
        setMessage(`${sk.icon||"✨"} ${sk.name}！ ${msg}`);
      }
      return;
    }

    if(sk.kind==="dispel"){
      const targets=[...livingEnemies()];
      if(!targets.length) return;
      animateActor("cast");
      setMessage(`🫧 ${actor.name} は ${sk.name} を唱えた！`);
      await wait(BASE_TIME.actionLead);
      let removed=0,blocked=0;
      targets.forEach(target=>{
        const cond=conditionsOf(target);
        const blockedByAura=!!cond.aura;
        let did=false;
        if(blockedByAura){
          cond.aura=false;
          blocked++;
        }else{
          did=clearEnemyBuffs(target);
          if(cond.mount){cond.mount=false;did=true;}
        }
        if(did) removed++;
        const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
        if(el) spawnFx("buff",blockedByAura?"🔮":"🫧",el);
      });
      setMessage(`🫧 ${sk.name}！ ${blocked?`${blocked}体はオーラだけを消費して無効化。 `:""}${removed?`${removed}体の強化効果を解除した。`:blocked?"":"解除できる効果はなかった。"}`);
      await wait(BASE_TIME.buff);
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      return;
    }

    if(sk.id==="tackle"){
      let target=enemyByUid(action.targetUid);
      if(!target || target.hp<=0) target=livingEnemies()[0]||null;
      if(!target) return;

      animateActor("attack");
      setMessage(`${actor.name} は勢いよく体当たりした！`);
      await wait(BASE_TIME.actionLead);
      await resolveAttack(actor,target,"体当たり",sk.power,"impact","💥",{element:sk.element||null});

      const recoil=Math.max(1,Math.round(S(actor).hpMax*sk.recoilRate));
      S(actor).hp=Math.max(0,S(actor).hp-recoil);
      renderBattleParty();
      flashPartyValue(slot,recoil,"recoil");
      setMessage(`${actor.name} は反動で ${recoil} ダメージを受けた。`);
      await wait(BASE_TIME.message);

      if(S(actor).hp<=0){
        const outName=actor.name;
        clearStatesOnKo(actor);
        await maybeTriggerMaidGiftOnKo(actor);
        renderBattleParty();
        if(livingActiveSlots().length===0){ loseBattle(); return; }
      }
      return;
    }

    if(sk.kind==="multiPhysical"){
      await resolveRandomMultiPhysicalSkill(actor,sk);
      return;
    }

    if(sk.kind==="physicalSpecial"){
      let target=enemyByUid(action.targetUid);
      if(!target || target.hp<=0) target=livingEnemies()[0]||null;
      if(!target) return;
      const result=await resolveAttack(actor,target,sk.name,Number(sk.power)||1,sk.animation||"impact",sk.fxSymbol||sk.icon||"✦",{canCrit:sk.canCrit!==false,forceCrit:!!sk.forceCrit,critDamageMultiplier:Number(sk.critDamageMultiplier)||1,element:sk.element||null});
      if(sk.dispelOnHit && !result?.missed){
        const removed=clearEnemyBuffs(target);
        if(removed){
          const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
          if(el) spawnFx("buff","✨",el);
          setMessage(`🏹 ${sk.name} が ${target.displayName} の強化効果をすべて吹き飛ばした！`);
          await wait(BASE_TIME.short);
          renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
        }
      }
      return;
    }

    if(sk.kind==="physicalAll"){
      await resolveAllPhysicalSkill(actor,sk);
      return;
    }

    if(sk.kind==="charge"){
      let actualMultiplier=Number(sk.multiplier)||2;
      if(sk.chargeStat==="atk"){
        const effect=traitOf(actor)?.effect;
        if(effect?.type==="powerChargeMultiplierOverride" && (!effect.skillId || effect.skillId===sk.id)){
          actualMultiplier=Math.max(actualMultiplier,Number(effect.multiplier)||actualMultiplier);
        }
        actor.powerChargeMultiplier=actualMultiplier;
        actor.powerChargeRounds=Number(sk.duration)||2;
      }else{
        actor.magicConcentrationMultiplier=actualMultiplier;
        actor.magicConcentrationRounds=Number(sk.duration)||2;
      }
      animateActor("buff");
      renderBattleParty();
      setMessage(`${sk.icon||"✨"} ${actor.name} は ${sk.name}！ 次のターン終了時まで${sk.chargeStat==="atk"?"攻撃力":"魔力"}が${actualMultiplier.toFixed(1)}倍！`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="magicBarrier"){
      const targets=livingActiveSlots();
      animateActor("buff");
      await wait(BASE_TIME.actionLead);
      targets.forEach(({i,c})=>{
        c.magicBarrierRounds=Math.max(Number(c.magicBarrierRounds)||0,Number(sk.duration)||2);
        c.magicBarrierReduction=Math.max(Number(c.magicBarrierReduction)||0,Number(sk.reduction)||.60);
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
        if(card) spawnFx("buff","🪄",card);
      });
      renderBattleParty();
      setMessage(`🪄 ${sk.name}！ 味方前衛全員が受ける魔法ダメージを${Math.round((Number(sk.reduction)||.60)*100)}%軽減（${Number(sk.duration)||2}ラウンド）。`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="buff"){
      const targets=sk.target==="allyAll"
        ? livingActiveSlots()
        : (()=>{
            let targetSlot=action.targetSlot;
            let target=roster[action.targetId || state.battleActive[targetSlot]];
            const stillActive=target && state.battleActive[targetSlot]===target.id;
            if(!target || S(target).hp<=0 || !stillActive){
              const alt=livingActiveSlots()[0];
              targetSlot=alt?alt.i:null; target=alt?alt.c:null;
            }
            return target?[{i:targetSlot,c:target}]:[];
          })();
      if(!targets.length) return;
      animateActor("buff");
      setMessage(`✨ ${actor.name} は ${sk.name} を使った！`);
      await wait(BASE_TIME.actionLead);
      let applied=0,stronger=0;
      targets.forEach(({i,c})=>{
        const result=applyStatBuff(c,sk);
        if(result.applied){
          applied++;
          flashPartyValue(i,"","buff",result.info.label);
          const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
          if(card) spawnFx("buff",sk.buff==="spd"?"💨":"✨",card);
        }else if(result.reason==="stronger") stronger++;
      });
      renderBattleParty();
      const info=BUFF_INFO[sk.buff];
      setMessage(`${sk.icon||"✨"} ${info?.name||"能力"}アップ！ ${applied}人に×${sk.multiplier.toFixed(2)}（${sk.duration}ラウンド）。${stronger?` ${stronger}人はより強い効果を維持。`:""}`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="heal"){
      const targets=sk.target==="allyAll"
        ? livingActiveSlots().filter(x=>S(x.c).hp<S(x.c).hpMax)
        : (()=>{
            let targetSlot=action.targetSlot;
            let target=roster[action.targetId || state.battleActive[targetSlot]];
            const stillActive=target && state.battleActive[targetSlot]===target.id;
            if(!target || S(target).hp<=0 || !stillActive){
              const alternatives=livingActiveSlots().sort((a,b)=>(S(a.c).hp/S(a.c).hpMax)-(S(b.c).hp/S(b.c).hpMax));
              if(alternatives.length){ targetSlot=alternatives[0].i; target=alternatives[0].c; }
            }
            return target?[{i:targetSlot,c:target}]:[];
          })();
      if(!targets.length){ setMessage(`${sk.name} の回復対象がいなかった。`); return; }
      animateActor("cast");
      setMessage(`💚 ${actor.name} は ${sk.name} を唱えた！`);
      await wait(BASE_TIME.actionLead);
      const baseAmount=healAmountForSkill(actor,sk);
      let total=0;
      targets.forEach(({i,c})=>{
        const missing=S(c).hpMax-S(c).hp;
        const amount=Math.min(missing,sk.fullHeal?missing:baseAmount);
        if(amount<=0) return;
        S(c).hp+=amount; total+=amount;
        flashPartyValue(i,amount,"heal");
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
        if(card) spawnFx("heal","✨",card);
      });
      renderBattleParty();
      setMessage(`💚 ${sk.name}！ ${sk.target==="allyAll"?`味方全員を合計 ${total} 回復。`:`${targets[0].c.name} のHPが ${total} 回復した。`}`);
      await wait(BASE_TIME.heal);
      return;
    }

    if(sk.kind==="revive"){
      const targets=sk.target==="allyAll"
        ? battleAllies(true).filter(x=>S(x.c).hp<=0)
        : (()=>{ const c=roster[action.targetId]; return c&&S(c).hp<=0?[{i:state.battleActive.indexOf(c.id),c}]:[]; })();
      const healEveryone=!!sk.fullPartyHeal;
      if(!targets.length && !healEveryone){ setMessage(`${sk.name} の対象になる戦闘不能者がいなかった。`); return; }
      animateActor("cast");
      setMessage(`🕊️ ${actor.name} は ${sk.name} を唱えた！`);
      await wait(BASE_TIME.actionLead);
      let revived=0;
      const revivedCharacters=[];
      targets.forEach(({c})=>{
        clearStatesOnKo(c);
        const hp=Math.max(1,Math.round(S(c).hpMax*(Number(sk.revivePercent)||.20)));
        S(c).hp=Math.min(S(c).hpMax,hp); revived++; revivedCharacters.push(c);
      });
      if(healEveryone){ battleAllies(true).forEach(({c})=>{ S(c).hp=S(c).hpMax; }); }
      renderBattleParty();
      setMessage(sk.fullPartyHeal?`🌟 奇跡が起きた！ ${revived}人を復活させ、味方全員のHPが全回復！`:`🕊️ ${sk.name}！ ${revived}人が復活した！`);
      await wait(BASE_TIME.heal);
      await maybeTriggerSageWisdom(revivedCharacters);
      return;
    }

    if(sk.kind==="cleanse"){
      const targets=sk.target==="allyAll"
        ? livingActiveSlots()
        : (()=>{ const c=roster[action.targetId || state.battleActive[action.targetSlot]]; return c?[{i:state.battleActive.indexOf(c.id),c}]:[]; })();
      if(!targets.length) return;
      animateActor("cast");
      await wait(BASE_TIME.actionLead);
      let removed=0;
      targets.forEach(({c})=>{ removed+=clearNegativeConditions(c,{poisonOnly:Array.isArray(sk.statuses)&&sk.statuses.length===1&&sk.statuses[0]==="poison"}); });
      renderBattleParty();
      setMessage(`${sk.icon} ${sk.name}！ ${removed?`${removed}個の状態異常を解除した。`:"解除できる状態異常はなかった。"}`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="barrier"){
      const targets=sk.target==="allyAll"
        ? livingActiveSlots()
        : (()=>{ const c=roster[action.targetId || state.battleActive[action.targetSlot]]; return c&&S(c).hp>0?[{i:state.battleActive.indexOf(c.id),c}]:[]; })();
      if(!targets.length) return;
      animateActor("buff");
      await wait(BASE_TIME.actionLead);
      targets.forEach(({i,c})=>{
        conditionsOf(c)[sk.barrier]=true;
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`);
        if(card) spawnFx("buff",sk.barrier==="aura"?"🔮":"🛡️",card);
      });
      renderBattleParty();
      setMessage(`${sk.icon} ${sk.name}！ ${sk.target==="allyAll"?"味方全員":"対象"}に${sk.barrier==="aura"?"オーラ":"マウント"}を付与した。`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="berserk"){
      const cond=conditionsOf(actor);
      cond.berserk=true;
      actor.berserkRounds=sk.duration;
      animateActor("buff");
      renderBattleParty();
      setMessage(`💢 ${actor.name} は狂乱状態になった！ 攻撃力1.6倍・${sk.duration}ラウンド、自動で通常攻撃する。`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="fortune"){
      state.fortuneCasts=(Number(state.fortuneCasts)||0)+1;
      animateActor("buff");
      setMessage(`🍀 フォーチュン！ この戦闘の加入率が上昇した。（重ね掛け ${state.fortuneCasts}回 / 最終70%上限）`);
      await wait(BASE_TIME.buff);
      return;
    }

    if(sk.kind==="escape"){
      if(state.battleEscapeDisabled){ setMessage("この戦闘からは逃走できない！"); await wait(BASE_TIME.message); return; }
      setMessage(`🏃 ${actor.name} はエスケープを唱えた！`);
      await wait(BASE_TIME.message);
      finishEscape();
      return;
    }

    if(sk.kind==="mpTransfer"){
      const targets=sk.target==="allyAll"
        ? livingActiveSlots()
        : (()=>{ const c=roster[action.targetId || state.battleActive[action.targetSlot]]; return c&&S(c).hp>0?[{i:state.battleActive.indexOf(c.id),c}]:[]; })();
      if(!targets.length) return;
      animateActor("cast");
      await wait(BASE_TIME.actionLead);
      let total=0;
      targets.forEach(({i,c})=>{
        const amount=Math.min(S(c).mpMax-S(c).mp,Number(sk.restoreMp)||0);
        S(c).mp+=amount; total+=amount;
        if(i>=0) flashPartyValue(i,amount,"heal");
      });
      renderBattleParty();
      setMessage(`🔹 ${sk.name}！ ${sk.target==="allyAll"?`前衛へ合計 ${total} MP供給。`:`${targets[0].c.name} のMPが ${total} 回復。`}`);
      await wait(BASE_TIME.heal);
      return;
    }
  }
  async function resolveBattleItem(actor,action,slot){
    const item=ITEMS[action.item]; if(!item) return;
    animateActor(item.effect==="buff" || item.effect==="barrier" || item.effect==="fortune" ? "buff" : "cast");
    setMessage(`${item.icon||"🧪"} ${actor.name} は ${item.name} を使った！`);
    await wait(BASE_TIME.actionLead);

    if(item.effect==="escape"){
      if(state.battleEscapeDisabled){ setMessage("この戦闘からは逃走できない！"); await wait(BASE_TIME.message); return; }
      setMessage(`🏃 ${item.name}！ うまく逃げ切った！`);
      await wait(BASE_TIME.message);
      finishEscape();
      return;
    }
    if(item.effect==="fortune"){
      state.fortuneCasts=(Number(state.fortuneCasts)||0)+1;
      setMessage(`🥛 ${item.name}！ 敵全体の加入率が少し上昇した。（重ね掛け ${state.fortuneCasts}回 / 最終70%上限）`);
      await wait(BASE_TIME.buff);
      return;
    }
    if(item.effect==="statusAll"){
      const targets=[...livingEnemies()];
      if(!targets.length) return;
      const results=targets.map(target=>({target,result:tryInflictStatus(target,item.status,item.baseRate)}));
      results.forEach(({target,result})=>{
        const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
        if(el) spawnFx("magicshot",statusIcon(item.status),el);
      });
      await wait(BASE_TIME.hit);
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      const success=results.filter(x=>x.result.success).length;
      const mount=results.filter(x=>x.result.reason==="mount").length;
      const already=results.filter(x=>x.result.reason==="already").length;
      if(success===0){
        setMessage(`${item.icon} ${item.name}！ しかし、誰も${statusName(item.status)}状態にはならなかった。${mount?` ${mount}体はマウントで防いだ。`:""}${already?` ${already}体はすでに同状態。`:""}`);
      }else{
        setMessage(`${item.icon} ${item.name}！ ${success}体に${statusName(item.status)}が決まった。${mount?` ${mount}体はマウントで防いだ。`:""}${already?` ${already}体はすでに同状態。`:""}`);
      }
      await wait(BASE_TIME.buff);
      return;
    }
    if(item.effect==="dispel"){
      let target=enemyByUid(action.targetUid);
      if(!target || target.hp<=0) target=livingEnemies()[0]||null;
      if(!target) return;
      const removed=clearEnemyBuffs(target);
      const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
      if(el) spawnFx("buff","⚪",el);
      renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
      setMessage(removed?`⚪ ${target.displayName} の強化効果をすべて解除した！`:`${target.displayName} には解除できる強化効果がなかった。`);
      await wait(BASE_TIME.buff);
      return;
    }

    const allyTargets=item.battleTarget==="allyAll"
      ? livingActiveSlots()
      : (()=>{
          const targetSlot=action.targetSlot;
          const target=roster[action.targetId || state.battleActive[targetSlot]];
          const stillActive=target && state.battleActive[targetSlot]===target.id;
          return target && stillActive ? [{i:targetSlot,c:target}] : [];
        })();
    if(!allyTargets.length){ setMessage(`${actor.name} は ${item.name} を使えなかった。対象が戦線にいません。`); await wait(BASE_TIME.message); return; }

    if(item.effect==="revive"){
      const {i,c:target}=allyTargets[0];
      if(S(target).hp>0){ setMessage(`${target.name} は戦闘不能ではなかった。`); await wait(BASE_TIME.message); return; }
      clearStatesOnKo(target);
      S(target).hp=Math.max(1,Math.min(S(target).hpMax,Math.round(S(target).hpMax*(Number(item.revivePercent)||.20))));
      renderBattleParty(); flashPartyValue(i,S(target).hp,"heal");
      setMessage(`${item.icon} ${target.name} がHP ${S(target).hp}で復活した！`); await wait(BASE_TIME.heal);
      await maybeTriggerSageWisdom([target]);
      return;
    }

    const livingTargets=allyTargets.filter(({c})=>S(c).hp>0);
    if(!livingTargets.length){ setMessage("戦闘不能の仲間には効果がなかった。"); await wait(BASE_TIME.message); return; }

    if(item.effect==="cleanse"){
      let removed=0;
      livingTargets.forEach(({c})=>{ removed+=clearNegativeConditions(c,{poisonOnly:!!item.poisonOnly}); });
      renderBattleParty();
      setMessage(removed?`${item.icon} 状態異常を ${removed}個解除した。`:`解除できる状態異常はなかった。`);
      await wait(BASE_TIME.buff); return;
    }
    if(item.effect==="hpHeal"){
      let total=0;
      livingTargets.forEach(({i,c})=>{
        const st=S(c),amount=Math.min(st.hpMax-st.hp,item.full?st.hpMax-st.hp:Number(item.amount)||0);
        if(amount>0){ st.hp+=amount; total+=amount; flashPartyValue(i,amount,"heal"); const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`); if(card) spawnFx("heal","🧪",card); }
      });
      renderBattleParty(); updateHeader();
      setMessage(total?`${item.icon} HPが ${total} 回復した。`:`HPはすでに満タンだった。`);
      await wait(BASE_TIME.heal); return;
    }
    if(item.effect==="mpHeal"){
      let total=0;
      livingTargets.forEach(({i,c})=>{
        const st=S(c),amount=Math.min(st.mpMax-st.mp,Number(item.amount)||0);
        if(amount>0){ st.mp+=amount; total+=amount; flashPartyValue(i,amount,"heal"); const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`); if(card) spawnFx("heal","🔹",card); }
      });
      renderBattleParty();
      setMessage(total?`${item.icon} MPが ${total} 回復した。`:`MPはすでに満タンだった。`);
      await wait(BASE_TIME.heal); return;
    }
    if(item.effect==="buff"){
      let applied=0,stronger=0;
      livingTargets.forEach(({i,c})=>{
        (item.buffs||[]).forEach(buff=>{
          const result=applyStatBuff(c,{buff,multiplier:item.multiplier,duration:item.duration});
          if(result.applied) applied++; else if(result.reason==="stronger") stronger++;
        });
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`); if(card) spawnFx("buff",item.icon,card);
      });
      renderBattleParty();
      setMessage(applied?`${item.icon} ${item.name}の効果で能力が上昇した！${stronger?`（${stronger}項目はより強い効果を維持）`:""}`:`より強い強化がかかっているため変化しなかった。`);
      await wait(BASE_TIME.buff); return;
    }
    if(item.effect==="barrier"){
      livingTargets.forEach(({i,c})=>{
        conditionsOf(c)[item.barrier]=true;
        const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${i}"]`); if(card) spawnFx("buff",item.barrier==="aura"?"🔮":"🛡️",card);
      });
      renderBattleParty();
      setMessage(`${item.icon} ${item.battleTarget==="allyAll"?"味方全員":"対象"}を${item.barrier==="aura"?"オーラ":"マウント"}状態にした。`);
      await wait(BASE_TIME.buff); return;
    }
  }

  function enemySkillAvailable(enemy,skillId){
    const sk=skills[skillId];
    return !!sk && (enemy.skills||[]).includes(skillId) && !conditionsOf(enemy).silence && (Number(enemy.mp)||0)>=Number(sk.cost||0);
  }

  function enemyLowestHpRatio(){
    const living=livingEnemies();
    if(!living.length) return 1;
    return Math.min(...living.map(e=>e.hp/Math.max(1,e.hpMax)));
  }

  function chooseEnemyAiAction(enemy,options={}){
    if(conditionsOf(enemy).silence) return {type:"attack"};

    if(enemy.ai==="fairySupport"){
      const low=enemyLowestHpRatio()<=.50;
      const canHeal=enemySkillAvailable(enemy,"heal") && livingEnemies().some(e=>e.hp<e.hpMax);
      const canIce=enemySkillAvailable(enemy,"ice");
      const roll=Math.random();
      if(low){
        if(canHeal){
          if(roll<.45) return {type:"skill",skillId:"heal"};
          if(canIce && roll<.55) return {type:"skill",skillId:"ice"};
        }else if(canIce && roll<.10){
          return {type:"skill",skillId:"ice"};
        }
      }else if(canIce && roll<.15){
        return {type:"skill",skillId:"ice"};
      }
      return {type:"attack"};
    }

    if(enemy.ai==="momoHealer"){
      const living=livingEnemies();
      const damaged=living.some(e=>e.hp<e.hpMax);
      if(damaged && enemySkillAvailable(enemy,"allHeal")){
        const minRatio=enemyLowestHpRatio();
        const solo=living.length===1;
        let chance=0;
        if(minRatio<=.50) chance=solo?.40:.70;
        else if(minRatio<=.80) chance=solo?.25:.45;
        if(chance>0 && Math.random()<chance) return {type:"skill",skillId:"allHeal"};
      }
      return {type:"attack"};
    }

    if(enemy.ai==="arachnePoison"){
      const canPoison=enemySkillAvailable(enemy,"poison");
      const poisonTargets=livingActiveSlots().filter(({c})=>S(c).hp>0 && !conditionsOf(c).poison);
      if(canPoison && poisonTargets.length && Math.random()<.45) return {type:"skill",skillId:"poison"};
      return {type:"attack"};
    }

    if(enemy.ai==="harpySonic"){
      if(enemySkillAvailable(enemy,"sonic") && Math.random()<.40) return {type:"skill",skillId:"sonic"};
      return {type:"attack"};
    }

    if(enemy.ai==="alrauneSupport"){
      const canHeal=enemySkillAvailable(enemy,"heal") && livingEnemies().some(e=>e.hp<e.hpMax);
      if(canHeal && Math.random()<.30) return {type:"skill",skillId:"heal"};
      return {type:"attack"};
    }

    if(enemy.ai==="rabbitTouch"){
      if(enemySkillAvailable(enemy,"touch") && Math.random()<.40) return {type:"skill",skillId:"touch"};
      return {type:"attack"};
    }

    if(enemy.ai==="demonCaster"){
      const roll=Math.random();
      if(roll<.40 && enemySkillAvailable(enemy,"thunder")) return {type:"skill",skillId:"thunder"};
      if(roll<.75 && enemySkillAvailable(enemy,"fire")) return {type:"skill",skillId:"fire"};
      return {type:"attack"};
    }

    if(enemy.ai==="elfArcher"){
      const canHeal=enemySkillAvailable(enemy,"highHeal") && livingEnemies().some(e=>e.hp<e.hpMax);
      if(canHeal && Math.random()<.10) return {type:"skill",skillId:"highHeal"};
      return {type:"attack"};
    }

    if(enemy.ai==="sylphCaster"){
      const canSonic=enemySkillAvailable(enemy,"sonic");
      const canWind=enemySkillAvailable(enemy,"wind");
      const roll=Math.random();
      if(canSonic && canWind){
        if(roll<.65) return {type:"skill",skillId:"sonic"};
        if(roll<.90) return {type:"skill",skillId:"wind"};
        return {type:"attack"};
      }
      if(canSonic && roll<.90) return {type:"skill",skillId:"sonic"};
      if(canWind && roll<.90) return {type:"skill",skillId:"wind"};
      return {type:"attack"};
    }

    if(enemy.ai==="owlFighter"){
      const canBlind=enemySkillAvailable(enemy,"neoBlind") && livingActiveSlots().some(({c})=>S(c).hp>0 && !conditionsOf(c).blind);
      if(canBlind && Math.random()<.15) return {type:"skill",skillId:"neoBlind"};
      return {type:"attack"};
    }

    if(enemy.ai==="mothSilencer"){
      const canSilence=enemySkillAvailable(enemy,"neoSilence") && livingActiveSlots().some(({c})=>S(c).hp>0 && !conditionsOf(c).silence);
      if(canSilence && Math.random()<.25) return {type:"skill",skillId:"neoSilence"};
      return {type:"attack"};
    }

    if(enemy.ai==="forestMageCaster"){
      const canHeal=enemySkillAvailable(enemy,"allHeal2") && livingEnemies().some(e=>e.hp<e.hpMax);
      const canQuake=enemySkillAvailable(enemy,"quake");
      const roll=Math.random();
      if(canHeal){
        if(roll<.10) return {type:"skill",skillId:"allHeal2"};
        if(canQuake && roll<.70) return {type:"skill",skillId:"quake"};
      }else if(canQuake && roll<.60){
        return {type:"skill",skillId:"quake"};
      }
      return {type:"attack"};
    }

    if(enemy.ai==="poisonSlimeToxic"){
      const canPoison=enemySkillAvailable(enemy,"neoPoison") && livingActiveSlots().some(({c})=>S(c).hp>0 && !conditionsOf(c).poison);
      if(canPoison && Math.random()<.25) return {type:"skill",skillId:"neoPoison"};
      return {type:"attack"};
    }

    if(enemy.ai==="poisonArachneToxic"){
      const roll=Math.random();
      const canPoison=enemySkillAvailable(enemy,"neoPoison") && livingActiveSlots().some(({c})=>S(c).hp>0 && !conditionsOf(c).poison);
      if(canPoison && roll<.30) return {type:"skill",skillId:"neoPoison"};
      if(enemySkillAvailable(enemy,"dark") && roll>=.30 && roll<.45) return {type:"skill",skillId:"dark"};
      return {type:"attack"};
    }

    if(enemy.ai==="ghostCaster"){
      const roll=Math.random();
      if(roll<.70 && enemySkillAvailable(enemy,"fire")) return {type:"skill",skillId:"fire"};
      if(roll<.95 && enemySkillAvailable(enemy,"pleasure")) return {type:"skill",skillId:"pleasure"};
      return {type:"attack"};
    }

    if(enemy.ai==="scyllaPleasure"){
      if(enemySkillAvailable(enemy,"pleasure") && Math.random()<.25) return {type:"skill",skillId:"pleasure"};
      return {type:"attack"};
    }

    if(enemy.ai==="mimicSpecial"){
      const roll=Math.random();
      if(roll<.15 && enemySkillAvailable(enemy,"death")) return {type:"skill",skillId:"death"};
      if(roll<.45 && enemySkillAvailable(enemy,"cold2")) return {type:"skill",skillId:"cold2"};
      return {type:"attack"};
    }

    if(enemy.ai==="podalgeWind"){
      if(enemySkillAvailable(enemy,"wind") && Math.random()<.30) return {type:"skill",skillId:"wind"};
      return {type:"attack"};
    }

    if(enemy.ai==="mermaidSupport"){
      const canHeal=enemySkillAvailable(enemy,"highHeal") && livingEnemies().some(e=>e.hp<e.hpMax);
      const canFrost=enemySkillAvailable(enemy,"frost");
      const roll=Math.random();
      if(canHeal && roll<.25) return {type:"skill",skillId:"highHeal"};
      if(canFrost && roll<(canHeal ? .50 : .30)) return {type:"skill",skillId:"frost"};
      return {type:"attack"};
    }

    if(enemy.ai==="kitsuneCaster"){
      const canThunder=enemySkillAvailable(enemy,"thunder");
      const canQuake=enemySkillAvailable(enemy,"quake");
      const roll=Math.random();
      if(canThunder && canQuake){
        if(roll<.15) return {type:"skill",skillId:"thunder"};
        if(roll<.40) return {type:"skill",skillId:"quake"};
      }else{
        if(canThunder && roll<.15) return {type:"skill",skillId:"thunder"};
        if(canQuake && roll<.25) return {type:"skill",skillId:"quake"};
      }
      return {type:"attack"};
    }

    if(enemy.ai==="lloydSupport"){
      const wounded=livingEnemies().some(e=>e.hp<e.hpMax);
      if(!wounded) return {type:"attack"};
      const roll=Math.random();
      if(roll<.05 && enemySkillAvailable(enemy,"allHeal2")) return {type:"skill",skillId:"allHeal2"};
      if(roll<.30 && enemySkillAvailable(enemy,"highHeal")) return {type:"skill",skillId:"highHeal"};
      return {type:"attack"};
    }

    if(enemy.ai==="doguCaster"){
      const roll=Math.random();
      if(roll<.15 && enemySkillAvailable(enemy,"death")) return {type:"skill",skillId:"death"};
      if(roll<.30 && enemySkillAvailable(enemy,"neoSilence")) return {type:"skill",skillId:"neoSilence"};
      return {type:"attack"};
    }

    if(enemy.ai==="highLamiaSupport"){
      const living=livingEnemies();
      const canHeal=enemySkillAvailable(enemy,"highHeal") && living.some(e=>e.hp<e.hpMax);
      const canGuard=enemySkillAvailable(enemy,"allGuard") && living.some(e=>(e.defBuffRounds||0)<=0 || (e.defBuff||1)<1.30);
      const canBlock=enemySkillAvailable(enemy,"allBlock") && living.some(e=>(e.mdefBuffRounds||0)<=0 || (e.mdefBuff||1)<1.30);
      const roll=Math.random();
      if(canHeal && roll<.20) return {type:"skill",skillId:"highHeal"};
      if(canGuard && roll>=.20 && roll<.325) return {type:"skill",skillId:"allGuard"};
      if(canBlock && roll>=.325 && roll<.45) return {type:"skill",skillId:"allBlock"};
      return {type:"attack"};
    }

    if(enemy.ai==="vritraBoss"){
      const round=Math.max(1,Number(state.battleRound)||1);
      if(round>=3 && (round-3)%4===0 && enemySkillAvailable(enemy,"terraCrash")) return {type:"skill",skillId:"terraCrash"};
      const roll=Math.random();
      if(roll<.20 && enemySkillAvailable(enemy,"silence")) return {type:"skill",skillId:"silence"};
      if(roll<.50 && enemySkillAvailable(enemy,"thunder")) return {type:"skill",skillId:"thunder"};
      return {type:"attack"};
    }

    if(enemy.ai==="ironOwlBoss"){
      const roll=Math.random();
      if(roll<.20 && enemySkillAvailable(enemy,"explosiveFist")) return {type:"skill",skillId:"explosiveFist"};
      if(roll<.40 && enemySkillAvailable(enemy,"wind")) return {type:"skill",skillId:"wind"};
      return {type:"attack"};
    }

    if(enemy.ai==="tentacleBoss"){
      const allies=livingEnemies().filter(e=>e.uid!==enemy.uid);
      if(options.allowSummon!==false && state.battleRound%5===0 && allies.length===0 && Number(enemy.lastSummonRound)!==Number(state.battleRound)){
        return {type:"summon",ids:["poison","poisonArachne"]};
      }
      const roll=Math.random();
      const canPoison=enemySkillAvailable(enemy,"neoPoison") && livingActiveSlots().some(({c})=>S(c).hp>0 && !conditionsOf(c).poison);
      if(canPoison && roll<.25) return {type:"skill",skillId:"neoPoison"};
      if(enemySkillAvailable(enemy,"frost") && roll>=.25 && roll<.50) return {type:"skill",skillId:"frost"};
      return {type:"attack"};
    }

    if(enemy.ai==="maidDevilSupport"){
      const living=livingEnemies();
      const canPolish=enemySkillAvailable(enemy,"allPolish") && living.some(e=>(e.atkBuffRounds||0)<=0 || (e.atkBuff||1)<1.30);
      const canGuard=enemySkillAvailable(enemy,"allGuard") && living.some(e=>(e.defBuffRounds||0)<=0 || (e.defBuff||1)<1.30);
      const roll=Math.random();
      if(canPolish && roll<.10) return {type:"skill",skillId:"allPolish"};
      if(canGuard && roll<(canPolish ? .20 : .10)) return {type:"skill",skillId:"allGuard"};
      return {type:"attack"};
    }

    if(enemy.ai==="silverSlimeMetal"){
      const escapeChance=(Number(enemy.actionCount)||0)<=0 ? .25 : .40;
      const roll=Math.random();
      if(roll<escapeChance) return {type:"escape"};
      if(enemySkillAvailable(enemy,"cold2") && Math.random()<.15) return {type:"skill",skillId:"cold2"};
      return {type:"attack"};
    }

    if(enemy.ai==="podalgeBoss"){
      const roll=Math.random();
      if(roll<.40 && enemySkillAvailable(enemy,"wind")) return {type:"skill",skillId:"wind"};
      if(roll<.80 && enemySkillAvailable(enemy,"flare")) return {type:"skill",skillId:"flare"};
      return {type:"attack"};
    }

    if(enemy.ai==="vanguardBoss"){
      const roll=Math.random();
      const hpRatio=Math.max(0,Number(enemy.hp)||0)/Math.max(1,Number(enemy.hpMax)||1);
      const canCold=enemy.lastSkillId!=="cold" && enemySkillAvailable(enemy,"cold");
      const canTackle=hpRatio>.10 && enemySkillAvailable(enemy,"tackle");
      if(roll<.25 && canCold) return {type:"skill",skillId:"cold"};
      if(roll<.65 && canTackle) return {type:"skill",skillId:"tackle"};
      return {type:"attack"};
    }

    return {type:"attack"};
  }

  function enemyHealAmount(enemy,sk){
    if(sk.fullHeal) return Infinity;
    const magic=Math.max(0,effectiveEnemyStat(enemy,"magic"));
    const base=Number(sk.healBase)||0;
    const magicRate=Number(sk.healMagic)||0;
    const scale=Number(sk.healScale)||1;
    return Math.max(1,Math.round((base+magic*magicRate)*scale));
  }

  function enemySpellDamage(enemy,target,sk){
    const magic=Math.max(1,effectiveEnemyStat(enemy,"magic")||1);
    const mdef=Math.max(0,effectiveMdef(target)||0);
    const rank=Number(sk.rankMultiplier)||1;
    const targetMod=Number(sk.targetMultiplier)||1;
    const special=Number(sk.powerMultiplier)||1;
    const raw=(30+magic*1.20)*rank*targetMod*special;
    const defense=defenseDamageFactor(magic,mdef,1);
    const resist=elementResistanceMultiplier(target,sk.element);
    const partyReduction=partyElementDamageTakenMultiplier(sk.element);
    const variance=Array.isArray(sk.gambleRange)
      ? sk.gambleRange[0]+Math.random()*(sk.gambleRange[1]-sk.gambleRange[0])
      : damageVariance();
    const erodeIds=["erode","gigaErode","lastErode","ruinErosion"];
    const equipReduction=erodeIds.includes(sk.id)?Math.max(0,Number(equippedAccessory(target)?.erodeDamageMultiplier)||1):1;
    return Math.max(1,Math.round(raw*defense*resist*partyReduction*variance*equipReduction));
  }

  async function handleAllyKoFromEnemy(target,slot){
    if(S(target).hp>0) return false;
    clearStatesOnKo(target);
    await maybeTriggerMaidGiftOnKo(target);
    renderBattleParty();
    updateActorPortrait();
    if(livingActiveSlots().length===0){ loseBattle(); return true; }
    // v0.38e: KO is already clear from the party HUD; do not add an extra swap guidance message.
    await wait(BASE_TIME.message);
    return false;
  }

  async function executeEnemyHealSkill(enemy,skillId){
    const sk=skills[skillId];
    if(!sk || !enemySkillAvailable(enemy,skillId)) return false;
    let targets=[];
    if(sk.target==="allyAll") targets=livingEnemies().filter(e=>e.hp<e.hpMax);
    else{
      const target=[...livingEnemies()].filter(e=>e.hp<e.hpMax).sort((a,b)=>(a.hp/a.hpMax)-(b.hp/b.hpMax))[0];
      if(target) targets=[target];
    }
    if(!targets.length) return false;

    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    setMessage(`💚 ${enemy.displayName} は ${sk.name} を唱えた！`);
    await wait(BASE_TIME.actionLead);
    const baseAmount=enemyHealAmount(enemy,sk);
    let total=0;
    targets.forEach(target=>{
      const amount=Math.min(target.hpMax-target.hp,sk.fullHeal?(target.hpMax-target.hp):baseAmount);
      if(amount<=0) return;
      target.hp+=amount;
      total+=amount;
      const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
      if(el) spawnFx("heal","✨",el);
    });
    await wait(BASE_TIME.short);
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    if(sk.target==="allyAll") setMessage(`💚 ${sk.name}！ 敵全体を合計 ${total} 回復した。`);
    else setMessage(`💚 ${sk.name}！ ${targets[0].displayName} のHPが ${total} 回復した。`);
    await wait(BASE_TIME.heal);
    return true;
  }

  async function executeEnemyBuffSkill(enemy,skillId){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="buff" || !enemySkillAvailable(enemy,skillId)) return false;
    const targets=sk.target==="allyAll" ? livingEnemies() : [enemy];
    if(!targets.length) return false;
    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`${sk.icon||"✨"} ${enemy.displayName} は ${sk.name} を唱えた！`);
    await wait(BASE_TIME.actionLead);
    let applied=0;
    targets.forEach(target=>{
      const result=applyStatBuff(target,sk);
      if(result.applied) applied++;
      const el=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${target.uid}"]`);
      if(el) spawnFx("buff",sk.icon||"✨",el);
    });
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    setMessage(`${sk.icon||"✨"} ${sk.name}！ ${applied?`敵${sk.target==="allyAll"?"全体":""}の${BUFF_INFO[sk.buff]?.name||"能力"}が上がった！`:"より強い強化効果がかかっている。"}`);
    await wait(BASE_TIME.buff);
    return true;
  }

  async function executeEnemyEscape(enemy,enemyEl){
    if(!enemy || enemy.escaped || enemy.hp<=0) return false;
    enemy.escaped=true;
    setMessage(`🏃 ${enemy.displayName} は逃げ出した！`);
    if(enemyEl){
      enemyEl.classList.add("dying");
      await wait(BASE_TIME.short);
    }
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    await wait(BASE_TIME.enemyAfter);
    if(livingEnemies().length===0){ winBattle(); return true; }
    return true;
  }

  async function executeEnemyMagicSkill(enemy,skillId){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="magic" || !enemySkillAvailable(enemy,skillId)) return false;
    const living=livingActiveSlots();
    if(!living.length){ loseBattle(); return true; }
    const targets=sk.target==="enemyAll" ? living : [choose(living)];

    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`${sk.icon||"✨"} ${enemy.displayName} は ${sk.name} を唱えた！`);
    await wait(BASE_TIME.actionLead);

    let total=0,blocked=0,hitCount=0,shocked=0,foxDodged=0,legacyNullified=0,absorbed=0,elementImmune=0,dragonSoulTriggered=0;
    const traitContext=makeTraitActionContext();
    const magicCounterCandidates=[];
    const results=[];
    for(const entry of targets){
      const target=entry.c,slot=entry.i;
      if(!target || S(target).hp<=0) continue;
      const barrierWasActive=Number(target.magicBarrierRounds)>0;
      const defendWasActive=!!target.defending;
      const defense=enemyMagicDefense(target,{hasDamage:true});
      if(defense.blocked){
        blocked++;
        if(defense.reason==="foxTrickery") foxDodged++;
        results.push({target,slot,blocked:true,blockReason:defense.reason,barrierWasActive,defendWasActive,dmg:0,shock:null,elementTrait:null,dragonSoul:null});
        continue;
      }
      const baseDamage=enemySpellDamage(enemy,target,sk);
      const reducedDamage=Math.max(1,Math.round(baseDamage*defense.damageMultiplier));
      const elementTrait=incomingElementDamageTrait(target,sk.element,reducedDamage);
      const dmg=elementTrait.damage;
      if(elementTrait.reason==="legacy") legacyNullified++;
      if(elementTrait.reason==="absorb") absorbed++;
      if(elementTrait.reason==="immune") elementImmune++;
      if(dmg>0) S(target).hp=Math.max(0,S(target).hp-dmg);
      const dragonSoul=dmg>0?triggerElementDamageBuffTrait(target,sk.element,dmg):null;
      if(dragonSoul) dragonSoulTriggered++;
      let shock=null;
      if(S(target).hp>0 && Number(sk.shockRate)>0){
        shock=tryInflictStatus(target,"shock",sk.shockRate);
        if(shock?.success) shocked++;
      }
      total+=dmg; hitCount++;
      if(dmg>0 && S(target).hp>0) magicCounterCandidates.push({target,slot});
      results.push({target,slot,blocked:false,barrierWasActive,defendWasActive,dmg,shock,elementTrait,dragonSoul});
    }

    // Update the party HUD once, then apply hit reactions. Re-rendering after adding
    // the .hit class would immediately replace the card and cancel its animation.
    renderBattleParty();
    for(const result of results){
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${result.slot}"]`);
      if(result.blocked){
        if(card) spawnFx("magicshot",result.blockReason==="aura"?"🔮":result.blockReason==="foxTrickery"?"🦊":"🚫",card);
        continue;
      }
      if(result.elementTrait?.reason==="absorb"){
        if(result.elementTrait.heal>0) flashPartyValue(result.slot,result.elementTrait.heal,"heal");
        if(card) spawnFx("heal","🔥",card);
      }else if(result.elementTrait?.reason==="immune"){
        if(card) spawnFx("buff","🌋",card);
      }else if(result.elementTrait?.reason==="legacy"){
        if(card) spawnFx("buff","🏺",card);
      }else{
        if(result.dmg>0) flashPartyValue(result.slot,result.dmg,"damage");
        if(card) spawnFx(sk.animation||"magicshot",sk.fxSymbol||sk.icon||"✦",card);
      }
      if(result.dragonSoul && card) spawnFx("buff","🐉",card);
    }

    if(sk.target==="enemyAll"){
      setMessage(`${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ バトルメンバーに合計 ${total} ダメージ。${shocked?` ⚡ ${shocked}人が感電した！`:""}${absorbed?` 🔥 「炎の妖精」が炎を吸収した。`:""}${elementImmune?` 🌋 「燃え盛るナメクジ」が炎を無効化した。`:""}${legacyNullified?` 🏺 ${legacyNullified}人は「古代の遺産」でダメージを無効化した。`:""}${dragonSoulTriggered?` 🐉 「ドラゴンソウル」で攻撃力が上がった。`:""}${foxDodged?` 🦊 ${foxDodged}人は「化かし妖術」で魔法をかわした。`:""}${blocked-foxDodged>0?` ${blocked-foxDodged}人は魔法を無効化した。`:""}`);
    }else{
      const result=results[0];
      if(result && !result.blocked){
        const reduced=[];
        if(result.barrierWasActive) reduced.push("魔力障壁");
        if(result.defendWasActive) reduced.push("防御");
        const suffix=`${result.shock?.success?" ⚡ 感電した！":""}${result.dragonSoul?" 🐉 ドラゴンソウルで攻撃力が上がった！":""}`;
        if(result.elementTrait?.reason==="absorb"){
          setMessage(`${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ 🔥 ${result.target.name} は「炎の妖精」で炎を吸収した！${result.elementTrait.heal>0?` HPが ${result.elementTrait.heal} 回復した。`:""}${suffix}`);
        }else if(result.elementTrait?.reason==="immune"){
          setMessage(`${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ 🌋 ${result.target.name} は「燃え盛るナメクジ」で炎ダメージを無効化した！${suffix}`);
        }else if(result.elementTrait?.reason==="legacy"){
          setMessage(`${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ 🏺 ${result.target.name} は「古代の遺産」で${sk.element==="fire"?"炎":sk.element==="ice"?"氷":"属性"}ダメージを無効化した！${suffix}`);
        }else{
          setMessage(`${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ ${result.target.name} に ${result.dmg} ダメージ。${suffix}${reduced.length?`（${reduced.join("＋")}で軽減）`:""}`);
        }
      }else if(result && result.blocked){
        setMessage(result.blockReason==="foxTrickery"
          ? `${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ 🦊 ${result.target.name} は「化かし妖術」で魔法をかわした！`
          : `${sk.icon||"✨"} ${enemy.displayName} の ${sk.name}！ ${result.target.name} は魔法を無効化した！`);
      }
    }
    await wait(BASE_TIME.enemyAfter);
    for(const {target,slot} of magicCounterCandidates){
      const battleWon=await maybeTriggerPureHunterCounter(target,slot,enemy,sk,traitContext);
      if(battleWon || state.battleEnded) return true;
    }
    for(const entry of targets){
      if(S(entry.c).hp<=0){
        const ended=await handleAllyKoFromEnemy(entry.c,entry.i);
        if(ended || state.battleEnded) return true;
      }
    }
    return true;
  }

  async function executeEnemyStatusSkill(enemy,skillId){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="status" || !enemySkillAvailable(enemy,skillId)) return false;
    const living=livingActiveSlots();
    if(!living.length){ loseBattle(); return true; }
    let targets=[];
    if(sk.target==="enemyAll") targets=living;
    else{
      const preferred=living.filter(({c})=>sk.status==="death" || !conditionsOf(c)[sk.status]);
      targets=[choose(preferred.length?preferred:living)];
    }

    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`${sk.icon||"✨"} ${enemy.displayName} は ${sk.name} を唱えた！`);
    await wait(BASE_TIME.actionLead);

    const results=[];
    let foxDodged=0;
    for(const entry of targets){
      const target=entry.c,slot=entry.i;
      if(!target || S(target).hp<=0) continue;
      const defense=enemyMagicDefense(target,{hasDamage:false});
      let result;
      if(defense.blocked){
        if(defense.reason==="foxTrickery") foxDodged++;
        result={success:false,reason:defense.reason||"immune",rate:0};
      }else{
        result=tryInflictStatus(target,sk.status,sk.baseRate);
      }
      results.push({target,slot,result});
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
      if(card) spawnFx("magicshot",result.reason==="foxTrickery"?"🦊":statusIcon(sk.status),card);
      if(sk.status==="death" && result.success) await handleAllyKoFromEnemy(target,slot);
    }
    renderBattleParty();
    const success=results.filter(r=>r.result.success).length;
    if(sk.target==="enemyAll"){
      if(success===0){
        const noneMsg=sk.status==="death" ? "しかし、誰も倒れなかった。" : `しかし、誰も${statusName(sk.status)}状態にはならなかった。`;
        setMessage(`${sk.icon||"✨"} ${sk.name}！ ${noneMsg}${foxDodged?` 🦊 ${foxDodged}人は「化かし妖術」で魔法をかわした。`:""}`);
      }else{
        setMessage(`${sk.icon||"✨"} ${sk.name}！ ${success}人が${statusName(sk.status)}状態になった。${foxDodged?` 🦊 ${foxDodged}人は「化かし妖術」で魔法をかわした。`:""}`);
      }
    }else if(results[0]){
      const {target,result}=results[0];
      const msg=result.success
        ? (sk.status==="death"?`${target.name} は倒れた！`:`${target.name} は${statusName(sk.status)}状態になった！`)
        : result.reason==="already"?`${target.name} はすでに${statusName(sk.status)}状態。`
        : result.reason==="mount"?`${target.name} はマウントで${statusName(sk.status)}を防いだ！`
        : result.reason==="aura"?`${target.name} はオーラで魔法を無効化した！`
        : result.reason==="foxTrickery"?`🦊 ${target.name} は「化かし妖術」で魔法をかわした！`
        : `${target.name} は${statusName(sk.status)}を免れた。`;
      setMessage(`${sk.icon||"✨"} ${sk.name}！ ${msg}`);
    }
    await wait(BASE_TIME.enemyAfter);
    return true;
  }

  async function executeEnemyPhysicalSkill(enemy,skillId,enemyEl){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="physical" || !enemySkillAvailable(enemy,skillId)) return false;
    const targets=livingActiveSlots();
    if(!targets.length){ loseBattle(); return true; }
    const picked=choose(targets),target=picked.c,slot=picked.i;
    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`💥 ${enemy.displayName} は勢いよく体当たりした！`);
    await wait(BASE_TIME.actionLead);
    if(blindedPhysicalMiss(enemy) || physicalAttackMisses(target)){
      setMessage(`${enemy.displayName} の体当たり！ ${target.name} はひらりとかわした！`);
    }else if(await maybeNullifyPhysicalByGhost(target,slot,enemy,"体当たり")){
      // Damage is completely nullified, but the attacker still suffers tackle recoil below.
    }else{
      let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(target),Number(sk.power)||1,1);
      const dmg=Math.max(1,target.defending?Math.ceil(raw/2):raw);
      S(target).hp=Math.max(0,S(target).hp-dmg);
      if(enemyEl) spawnFx(sk.animation||"impact",sk.fxSymbol||sk.icon||"💥",enemyEl);
      renderBattleParty(); flashPartyValue(slot,dmg,"damage");
      setMessage(`${enemy.displayName} の体当たり！ ${target.name} に ${dmg} ダメージ。${target.defending?"（防御で軽減）":""}`);
      await wait(BASE_TIME.enemyAfter);
      await maybeTriggerPoisonGelOnPhysicalHit(target,slot,enemy);
    }
    const recoil=Math.max(1,Math.round(enemy.hpMax*(Number(sk.recoilRate)||0)));
    enemy.hp=Math.max(0,enemy.hp-recoil);
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    setMessage(`${enemy.displayName} は反動で ${recoil} ダメージを受けた。`);
    await wait(BASE_TIME.message);
    if(enemy.hp<=0){ winBattle(); return true; }
    await handleAllyKoFromEnemy(target,slot);
    return true;
  }

  async function executeEnemyPhysicalSpecialSkill(enemy,skillId,enemyEl){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="physicalSpecial" || !enemySkillAvailable(enemy,skillId)) return false;
    const pool=livingActiveSlots();
    if(!pool.length){ loseBattle(); return true; }
    const picked=choose(pool),target=picked.c,slot=picked.i;
    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`${sk.icon||"💥"} ${enemy.displayName} は ${sk.name} を放った！`);
    await wait(BASE_TIME.actionLead);
    if(blindedPhysicalMiss(enemy) || physicalAttackMisses(target)){
      setMessage(`${enemy.displayName} の ${sk.name}！ ${target.name} はひらりとかわした！`);
      await wait(BASE_TIME.enemyAfter);
      return true;
    }
    if(await maybeNullifyPhysicalByGhost(target,slot,enemy,sk.name)) return true;
    let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(target),Number(sk.power)||1,1,Number(sk.defenseInfluence)||1);
    const critical=sk.canCrit!==false && (sk.forceCrit===true || rollCritical(enemy.critRate||0));
    if(critical) raw=Math.max(1,Math.round(raw*(Number(enemy.critMultiplier)||BASE_CRITICAL_MULTIPLIER)*Math.max(1,Number(sk.critDamageMultiplier)||1)));
    const dmg=Math.max(1,target.defending?Math.ceil(raw/2):raw);
    S(target).hp=Math.max(0,S(target).hp-dmg);
    const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
    if(card) spawnFx(sk.animation||"heavy",critical?"‼":(sk.fxSymbol||sk.icon||"💥"),card);
    renderBattleParty();
    flashPartyValue(slot,dmg,"damage");
    setMessage(`${sk.icon||"💥"} ${enemy.displayName} の ${sk.name}！${critical?" 会心！":""} ${target.name} に ${dmg} ダメージ。${target.defending?"（防御で軽減）":""}`);
    await wait(BASE_TIME.enemyAfter);
    await maybeTriggerPoisonGelOnPhysicalHit(target,slot,enemy);
    await maybeTriggerSlimeBody(target,slot,makeTraitActionContext());
    if(S(target).hp>0){
      await maybeTriggerCounterStance(target,slot,enemy,makeTraitActionContext());
      if(state.battleEnded || enemy.hp<=0) return true;
    }
    await handleAllyKoFromEnemy(target,slot);
    return true;
  }

  async function executeEnemyMultiPhysicalSkill(enemy,skillId,enemyEl){
    const sk=skills[skillId];
    if(!sk || sk.kind!=="multiPhysical" || !enemySkillAvailable(enemy,skillId)) return false;
    const hits=Math.max(1,Number(sk.hits)||1);
    enemy.mp=Math.max(0,(Number(enemy.mp)||0)-Number(sk.cost||0));
    enemy.lastSkillId=skillId;
    setMessage(`${sk.icon||"⚔️"} ${enemy.displayName} は ${sk.name} を放った！`);
    await wait(BASE_TIME.actionLead);
    let total=0,landed=0,missed=0,criticals=0;
    const traitContext=makeTraitActionContext();
    for(let hit=1;hit<=hits;hit++){
      if(state.battleEnded || enemy.hp<=0) break;
      const pool=livingActiveSlots();
      if(!pool.length){ loseBattle(); break; }
      const target=choose(pool),c=target.c,slot=target.i;
      if(blindedPhysicalMiss(enemy) || physicalAttackMisses(c)){
        missed++;
        setMessage(`${sk.icon||"⚔️"} ${sk.name} ${hit}撃目！ ${c.name} はかわした！`);
        await wait(BASE_TIME.short);
        continue;
      }
      if(await maybeNullifyPhysicalByGhost(c,slot,enemy,sk.name)){
        missed++;
        continue;
      }
      let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(c),Number(sk.hitPower)||1,1,Number(sk.defenseInfluence)||1);
      const critical=sk.canCrit!==false && rollCritical(enemy.critRate||0);
      if(critical){ criticals++; raw=Math.max(1,Math.round(raw*(Number(enemy.critMultiplier)||BASE_CRITICAL_MULTIPLIER))); }
      const dmg=Math.max(1,c.defending?Math.ceil(raw/2):raw);
      S(c).hp=Math.max(0,S(c).hp-dmg);
      total+=dmg; landed++;
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${slot}"]`);
      if(card) spawnFx(sk.animation||"punch",sk.fxSymbol||sk.icon||"🥊",card);
      renderBattleParty(); flashPartyValue(slot,dmg,"damage");
      setMessage(`${sk.icon||"⚔️"} ${sk.name} ${hit}撃目！${critical?" 会心！":""} ${c.name} に ${dmg} ダメージ。${c.defending?"（防御で軽減）":""}`);
      await wait(BASE_TIME.enemyAfter);
      await maybeTriggerPoisonGelOnPhysicalHit(c,slot,enemy);
      await maybeTriggerSlimeBody(c,slot,traitContext);
      if(S(c).hp>0){
        await maybeTriggerCounterStance(c,slot,enemy,traitContext);
        if(state.battleEnded || enemy.hp<=0) break;
      }
      const ended=await handleAllyKoFromEnemy(c,slot);
      if(ended || state.battleEnded) break;
    }
    if(!state.battleEnded && enemy.hp>0){
      const notes=[`${landed}/${hits}ヒット`,criticals?`${criticals}回会心`:"",missed?`${missed}回回避`:""].filter(Boolean).join(" / ");
      setMessage(`${sk.icon||"⚔️"} ${sk.name}：合計 ${total} ダメージ（${notes}）`);
      await wait(BASE_TIME.short);
    }
    clearEnemyActing();
    return true;
  }

  async function executeEnemyBasicAttack(enemy,enemyEl){
    enemy.lastSkillId=null;
    let targets=livingActiveSlots();
    if(targets.length===0){ loseBattle(); return; }

    if(enemy.basicAttackAll){
      const traitContext=makeTraitActionContext();
      const attackPower=Number.isFinite(enemy.basicAttackPower)?enemy.basicAttackPower:.80;
      setMessage(`${enemy.displayName} の攻撃！`);
      await wait(BASE_TIME.actionLead);
      let total=0,missed=0,criticals=0;
      for(const target of [...targets]){
        if(state.battleEnded || enemy.hp<=0) return;
        const c=target.c;
        if(!c || S(c).hp<=0) continue;
        if(blindedPhysicalMiss(enemy) || physicalAttackMisses(c)){
          missed++;
          setMessage(`${enemy.displayName} の攻撃！ ${c.name} はひらりとかわした！`);
          await wait(BASE_TIME.short);
          continue;
        }
        if(await maybeNullifyPhysicalByGhost(c,target.i,enemy,"攻撃")) continue;
        let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(c),attackPower,1);
        const critical=rollCritical(enemy.critRate||0);
        if(critical){
          criticals++;
          raw=Math.max(1,Math.round(raw*(Number(enemy.critMultiplier)||BASE_CRITICAL_MULTIPLIER)));
        }
        const dmg=Math.max(1,c.defending?Math.ceil(raw/2):raw);
        S(c).hp=Math.max(0,S(c).hp-dmg);
        total+=dmg;
        if(enemyEl) spawnFx(enemy.basicAttackFx||"whip",critical?"‼":(enemy.basicAttackSymbol||"〰"),enemyEl);
        renderBattleParty();
        flashPartyValue(target.i,dmg,"damage");
        setMessage(`${enemy.displayName} の攻撃！${critical?" 会心！":""} ${c.name} に ${dmg} ダメージ。${c.defending?"（防御で軽減）":""}`);
        await wait(BASE_TIME.enemyAfter);
        await maybeTriggerPoisonGelOnPhysicalHit(c,target.i,enemy);
        await maybeTriggerSlimeBody(c,target.i,traitContext);
        if(S(c).hp>0){
          await maybeTriggerCounterStance(c,target.i,enemy,traitContext);
          if(state.battleEnded || enemy.hp<=0) return;
        }
        const ended=await handleAllyKoFromEnemy(c,target.i);
        if(ended || state.battleEnded) return;
      }
      return;
    }

    const target=choose(targets);
    const c=target.c;
    const traitContext=makeTraitActionContext();

    if(blindedPhysicalMiss(enemy) || physicalAttackMisses(c)){
      setMessage(`${enemy.displayName} の攻撃！ ${c.name} はひらりとかわした！`);
      await wait(BASE_TIME.enemyAfter);
      clearEnemyActing();
      return;
    }
    if(await maybeNullifyPhysicalByGhost(c,target.i,enemy,"攻撃")){
      clearEnemyActing();
      return;
    }

    const enemyBowRate=Math.max(0,Number(enemy.basicBowInstantKillRate)||0);
    const enemyBowBlocked=equipmentHasFlag(c,"bowInstantKillImmune");
    if(enemyBowRate>0 && !enemyBowBlocked && Math.random()*100<enemyBowRate){
      S(c).hp=0;
      const card=$("battlePartyRow").querySelector(`.battle-status-card[data-slot="${target.i}"]`);
      if(card) spawnFx("arrow","🎯",card);
      renderBattleParty();
      setMessage(`🏹 ${enemy.displayName} は ${c.name} を射抜いた！`);
      await wait(BASE_TIME.enemyAfter);
      await handleAllyKoFromEnemy(c,target.i);
      return;
    }

    const attackPower=Number.isFinite(enemy.basicAttackPower)?enemy.basicAttackPower:1;
    let raw=physicalDamage(effectiveEnemyStat(enemy,"atk"),effectiveDef(c),attackPower,1);
    const critical=rollCritical(enemy.critRate||0);
    if(critical) raw=Math.max(1,Math.round(raw*(Number(enemy.critMultiplier)||BASE_CRITICAL_MULTIPLIER)));
    const dmg=Math.max(1,c.defending?Math.ceil(raw/2):raw);
    S(c).hp=Math.max(0,S(c).hp-dmg);

    if(enemyEl) spawnFx(enemy.basicAttackFx||"impact",critical?"‼":(enemy.basicAttackSymbol||"💥"),enemyEl);
    renderBattleParty();
    flashPartyValue(target.i,dmg,"damage");
    setMessage(`${enemy.displayName} の攻撃！${critical?" 会心！":""} ${c.name} に ${dmg} ダメージ。${c.defending?"（防御で軽減）":""}`);
    await wait(BASE_TIME.enemyAfter);
    if(S(c).hp>0 && Number(enemy.basicPoisonRate)>0){
      const poison=tryInflictStatus(c,"poison",Number(enemy.basicPoisonRate));
      if(poison.success){ renderBattleParty(); setMessage(`☠ ${c.name} は毒状態になった！`); await wait(BASE_TIME.short); }
    }
    await maybeTriggerPoisonGelOnPhysicalHit(c,target.i,enemy);
    await maybeTriggerSlimeBody(c,target.i,traitContext);
    if(S(c).hp>0){
      await maybeTriggerCounterStance(c,target.i,enemy,traitContext);
      if(state.battleEnded){ clearEnemyActing(); return; }
    }

    await handleAllyKoFromEnemy(c,target.i);
  }

  function summonBattleEnemy(id){
    const aliveSame=livingEnemies().filter(e=>e.id===id).length;
    const suffix=aliveSame>0 ? String.fromCharCode(65+aliveSame) : "";
    const summoned=makeBattleEnemyInstance(id,state.battleEnemies.length,suffix,{noReward:true,noRecruit:true,summoned:true});
    if(summoned) state.battleEnemies.push(summoned);
    return summoned;
  }

  async function executeEnemySummon(enemy,action){
    if(!enemy || enemy.hp<=0) return false;
    setMessage(`${enemy.displayName}は仲間を呼んだ！`);
    await wait(BASE_TIME.actionLead);
    (action.ids||[]).forEach(id=>summonBattleEnemy(id));
    enemy.lastSummonRound=state.battleRound;
    renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
    await wait(BASE_TIME.enemyAfter);
    clearEnemyActing();
    return true;
  }

  async function executeEnemyAction(enemy,options={}){
    if(state.battleEnded || !enemy || enemy.hp<=0) return;
    if(conditionsOf(enemy).shock){
      setMessage(`⚡ ${enemy.displayName} は感電していて動けない！`);
      await wait(BASE_TIME.enemyAfter);
      return;
    }
    state.battlePhase="enemy";
    clearEnemyActing();
    const enemyEl=$("enemyStage").querySelector(`.enemy[data-enemy-uid="${enemy.uid}"]`);
    if(enemyEl) enemyEl.classList.add("acting");
    renderBattleParty();
    setMessage(`${enemy.displayName} が行動！`);
    await wait(BASE_TIME.enemyLead);

    const action=chooseEnemyAiAction(enemy,options);
    enemy.actionCount=(Number(enemy.actionCount)||0)+1;
    if(action.type==="summon"){ await executeEnemySummon(enemy,action); return; }
    if(action.type==="escape"){ await executeEnemyEscape(enemy,enemyEl); return; }
    if(action.type==="skill"){
      const sk=skills[action.skillId];
      if(sk?.kind==="heal" && await executeEnemyHealSkill(enemy,action.skillId)) return;
      if(sk?.kind==="buff" && await executeEnemyBuffSkill(enemy,action.skillId)) return;
      if(sk?.kind==="magic" && await executeEnemyMagicSkill(enemy,action.skillId)) return;
      if(sk?.kind==="status" && await executeEnemyStatusSkill(enemy,action.skillId)) return;
      if(sk?.kind==="physical" && await executeEnemyPhysicalSkill(enemy,action.skillId,enemyEl)) return;
      if(sk?.kind==="physicalSpecial" && await executeEnemyPhysicalSpecialSkill(enemy,action.skillId,enemyEl)) return;
      if(sk?.kind==="multiPhysical" && await executeEnemyMultiPhysicalSkill(enemy,action.skillId,enemyEl)) return;
    }
    await executeEnemyBasicAttack(enemy,enemyEl);
  }

  async function executeEnemyTurn(enemy){
    if(state.battleEnded || !enemy || enemy.hp<=0) return;
    await executeEnemyAction(enemy);
    if(state.battleEnded || enemy.hp<=0) return;
    const hpRatio=Math.max(0,Number(enemy.hp)||0)/Math.max(1,Number(enemy.hpMax)||1);
    if(enemy.ai==="mimicSpecial" && state.battleRound%2===0){
      // Mimic Girl is a special encounter: every even-numbered round has two actions.
      await executeEnemyAction(enemy);
      return;
    }
    if(enemy.ai==="vritraBoss" && state.battleRound%2===0){
      // Vritra acts twice on every even-numbered round. Forced Terra Crash rounds are odd, so they never stack with this.
      await executeEnemyAction(enemy);
      return;
    }
    if((enemy.ai==="tentacleBoss" || enemy.ai==="ironOwlBoss") && hpRatio<=.30){
      // Bosses become two-action enemies below 30% HP. Tentacle cannot summon twice in one round.
      await executeEnemyAction(enemy,{allowSummon:false});
    }
  }

  function clamp(min,max,value){ return Math.max(min,Math.min(max,value)); }

  function averageLivingAllySpd(){
    const living=livingActiveSlots();
    if(!living.length) return 1;
    return living.reduce((sum,x)=>sum+Math.max(1,S(x.c).spd||1),0)/living.length;
  }

  function averageLivingEnemySpd(){
    const living=livingEnemies();
    if(!living.length) return 1;
    return living.reduce((sum,e)=>sum+Math.max(1,effectiveEnemyStat(e,"spd")||1),0)/living.length;
  }

  function baseEscapeRate(){
    const ally=averageLivingAllySpd();
    const enemy=averageLivingEnemySpd();
    const ratio=(ally-enemy)/Math.max(1,ally+enemy);
    return clamp(30,90,Math.round(70+40*ratio));
  }

  function battleEscapeTraitBonus(){
    let bonus=0;
    livingActiveSlots().forEach(({c})=>{
      const effect=traitOf(c)?.effect;
      if(effect?.type==="statusAndDeathImmunity") bonus+=Number(effect.escapeBonus)||0;
    });
    return bonus;
  }

  function currentEscapeRate(attemptNumber=state.escapeAttempts+1){
    const base=state.escapeBaseRate ?? baseEscapeRate();
    const traitBonus=battleEscapeTraitBonus();
    if(attemptNumber>=3) return 100;
    if(attemptNumber===2) return Math.min(100,base+20+traitBonus);
    return Math.min(100,base+traitBonus);
  }

  function finishEscape(){
    state.battleEnded=true;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    state.battlePhase="ended";
    state.battleTargetMode=null;
    state.battleActions=[null,null,null,null];
    clearBattleEndStates();
    setCommandsEnabled(false);
    hideRecruitOverlay();
    hideBattleContinue();
    clearEnemyActing();

    if(state.battleDirectTest){
      restorePartySnapshot(state.battleTestSnapshot);
      state.battleTestSnapshot=null;
      state.battleDirectTest=false;
      state.battleFromRun=false;
      showScreen("homeScreen");
      $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
      updateHeader();
      return;
    }

    state.battleFromRun=false;
    updateRunHud();
    showScreen("exploreScreen");
    $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
  }

  async function attemptEscape(){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    if(state.battleEscapeDisabled){ setMessage("この戦闘からは逃走できない！"); return; }
    cancelScheduledTurnStart();
    state.battleAutoContinuous=false;
    updateAutoButtons();
    closeSkillMenu();
    closeItemMenu();
    $("swapModal").classList.remove("show");
    state.battleTargetMode=null;
    refundAllQueuedItems();
    state.battleActions=[null,null,null,null];
    state.battleActive.forEach(id=>roster[id].defending=false);

    if(state.escapeBaseRate===null) state.escapeBaseRate=baseEscapeRate();
    state.escapeAttempts++;
    const rate=currentEscapeRate(state.escapeAttempts);
    state.battlePhase="resolve";
    setCommandsEnabled(false);
    renderBattleParty();
    setMessage("逃走を試みた……！");
    await wait(BASE_TIME.message);

    if(Math.random()*100<rate){
      setMessage("うまく逃げ切った！");
      await wait(BASE_TIME.message);
      finishEscape();
      return;
    }

    setMessage("逃げ切れなかった！");
    await wait(BASE_TIME.message);

    // 逃走失敗時は味方全員の行動を消費し、敵だけが1回ずつ行動する。
    const enemies=[...livingEnemies()].map(enemy=>({enemy,initiative:rollInitiative(effectiveEnemyStat(enemy,"spd")),tie:Math.random()}))
      .sort((a,b)=>(b.initiative-a.initiative)||(b.tie-a.tie));
    for(const entry of enemies){
      if(state.battleEnded) return;
      const enemy=enemyByUid(entry.enemy.uid);
      if(!enemy || enemy.hp<=0) continue;
      await executeEnemyTurn(enemy);
      if(state.battleEnded) return;
    }

    if(!state.battleEnded){
      state.battleRound++;
      await wait(BASE_TIME.roundGap);
      startCommandInput();
    }
  }

  async function resolveTurn(){
    if(state.battlePhase!=="input" || state.battleEnded || !commandsReady() || state.battleTargetMode) return;
    cancelScheduledTurnStart();
    state.battlePhase="resolve";
    setCommandsEnabled(false);
    updateExecuteButton();

    // Defend and defense-priority skills resolve before normal initiative.
    // Within this defensive phase, faster allies act first.
    const defensePriorityTurns=livingActiveSlots().map(({i,c})=>({i,c,action:state.battleActions[i]}))
      .filter(x=>x.action?.type==="defend" || (x.action?.type==="skill" && skills[x.action.skill]?.priority==="defense"))
      .sort((a,b)=>effectiveSpd(b.c)-effectiveSpd(a.c));
    for(const {i,c:actor,action} of defensePriorityTurns){
      if(state.battleEnded || S(actor).hp<=0) continue;
      state.battleActorSlot=i;
      updateActorPortrait();
      if(conditionsOf(actor).shock){
        const label=action.type==="defend"?"身を守れない":`${skills[action.skill]?.name||"防御スキル"} を使えない`;
        setMessage(`⚡ ${actor.name} は感電していて${label}！`);
        await wait(BASE_TIME.message);
        continue;
      }
      if(action.type==="defend"){
        actor.defending=true;
        animateActor("buff");
        renderBattleParty();
        setMessage(`${actor.name} は身を守った。`);
        await wait(BASE_TIME.message);
        await maybeTriggerMageDemonOnDefend(actor,i);
      }else{
        await resolveSkill(actor,action,i);
        if(state.battleEnded) return;
      }
    }

    const turnOrder=buildTurnOrder().filter(turn=>!(turn.side==="ally" && (turn.action?.type==="defend" || (turn.action?.type==="skill" && skills[turn.action.skill]?.priority==="defense"))));

    for(const turn of turnOrder){
      if(state.battleEnded) return;

      if(turn.side==="enemy"){
        const enemy=enemyByUid(turn.enemyUid);
        if(!enemy || enemy.hp<=0) continue;
        await executeEnemyTurn(enemy);
        if(state.battleEnded) return;
        continue;
      }

      const slot=turn.slot;
      if(state.battleActive[slot]!==turn.actorId) continue;
      const actor=roster[turn.actorId];
      const action=turn.action;
      if(!actor || S(actor).hp<=0 || !action) continue;

      state.battlePhase="resolve";
      clearEnemyActing();
      state.battleActorSlot=slot;
      updateActorPortrait();
      renderBattleParty();

      if(conditionsOf(actor).shock){
        setMessage(`⚡ ${actor.name} は感電していて動けない！`);
        await wait(BASE_TIME.message);
        continue;
      }

      if(action.type==="attack"){
        const result=await resolveBasicAttack(actor,action);
        await wait(BASE_TIME.short);
        if(result?.battleWon || livingEnemies().length===0){ winBattle(); return; }
        continue;
      }

      if(action.type==="item"){
        await resolveBattleItem(actor,action,slot);
        await wait(BASE_TIME.short);
        continue;
      }

      if(action.type==="skill"){
        await resolveSkill(actor,action,slot);
        await wait(BASE_TIME.short);
        if(livingEnemies().length===0){ winBattle(); return; }
      }
    }

    clearEnemyActing();
    const statusEndedBattle=await processTurnEndStatuses();
    if(statusEndedBattle || state.battleEnded) return;
    await processTurnEndPassives();
    if(state.battleEnded) return;
    const endTurnBuffSkips=await processTurnEndTraits();
    if(state.battleEnded) return;
    tickBattleBuffs(endTurnBuffSkips);

    if(!state.battleEnded){
      state.battleRound++;
      await wait(BASE_TIME.roundGap);
      startCommandInput();
    }
  }

  function clearEnemyActing(){
    $("enemyStage").querySelectorAll(".enemy.acting").forEach(el=>el.classList.remove("acting"));
  }

  function autoReplaceSlot(slot){
    const reserveIndex=state.battleReserve.findIndex(id=>S(roster[id]).hp>0);
    if(reserveIndex<0) return false;
    const outgoing=state.battleActive[slot];
    const incoming=state.battleReserve[reserveIndex];
    state.battleActive[slot]=incoming;
    state.battleReserve[reserveIndex]=outgoing;
    state.battleActions[slot]=null;
    return true;
  }

  function autoDeployReserves(){
    let changed=false;
    state.battleActive.forEach((id,slot)=>{
      if(S(roster[id]).hp<=0 && autoReplaceSlot(slot)) changed=true;
    });
    return changed || livingActiveSlots().length>0;
  }

  function showBattleContinue(){
    $("battleContinueBtn").classList.add("show");
  }

  function hideBattleContinue(){
    $("battleContinueBtn").classList.remove("show");
  }

  const levelGrowthLabels={hpMax:"最大HP",mpMax:"最大MP",atk:"攻撃",def:"防御",magic:"魔力",mdef:"魔防",spd:"素早さ"};

  function renderLevelUpEntry(entry){
    const c=roster[entry.id];
    $("levelUpTitle").textContent=`${entry.name}のレベルが上がった！`;
    $("levelUpStep").textContent=`${state.levelUpPresentationIndex+1} / ${state.levelUpPresentationQueue.length}`;
    $("levelUpOldLevel").textContent=entry.oldLevel;
    $("levelUpNewLevel").textContent=entry.level;
    const portrait=$("levelUpPortrait");
    portrait.innerHTML=c?.img ? `<img src="${c.img}" alt="${entry.name}">` : `<span class="hero-placeholder">👤</span>`;

    $("levelUpGrowthGrid").innerHTML=Object.entries(levelGrowthLabels).map(([key,label])=>{
      const value=entry.growth?.[key]||0;
      return `<div class="levelup-growth"><span>${label}</span><strong>+${value}</strong></div>`;
    }).join("");

    const learned=(entry.learned||[]).map(id=>skills[id]).filter(Boolean);
    $("levelUpSkillBox").hidden=learned.length===0;
    $("levelUpSkillList").innerHTML=learned.map(sk=>`<span class="levelup-skill-chip">${sk.icon||"✨"} ${sk.name}</span>`).join("");
    $("levelUpNextBtn").textContent=state.levelUpPresentationIndex>=state.levelUpPresentationQueue.length-1 ? "決定" : "次へ";
  }

  function showLevelUpResults(entries,afterClose){
    if(!entries?.length){
      if(afterClose) afterClose();
      return;
    }
    state.levelUpPresentationQueue=[...entries];
    state.levelUpPresentationIndex=0;
    state.levelUpAfterClose=afterClose||null;
    renderLevelUpEntry(state.levelUpPresentationQueue[0]);
    $("levelUpModal").classList.add("show");
  }

  function advanceLevelUpResults(){
    if(!state.levelUpPresentationQueue.length) return;
    if(state.levelUpPresentationIndex<state.levelUpPresentationQueue.length-1){
      state.levelUpPresentationIndex++;
      renderLevelUpEntry(state.levelUpPresentationQueue[state.levelUpPresentationIndex]);
      return;
    }
    $("levelUpModal").classList.remove("show");
    state.levelUpPresentationQueue=[];
    state.levelUpPresentationIndex=0;
    const cb=state.levelUpAfterClose;
    state.levelUpAfterClose=null;
    if(cb) cb();
  }

  $("levelUpNextBtn").onclick=advanceLevelUpResults;

  function winBattle(){
    if(state.battleEnded) return;
    state.battleEnded=true;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    state.battlePhase="ended";
    state.battleTargetMode=null;
    setCommandsEnabled(false);
    updateExecuteButton();
    clearEnemyActing();
    const expEligibleIds=new Set(state.battleActive.filter(id=>roster[id] && S(roster[id]).hp>0));
    const victoryTraitNotes=applyVictoryTraits();
    const victoryPassiveNotes=applyVictoryPassives();
    victoryTraitNotes.push(...victoryPassiveNotes);
    clearBattleEndStates();
    renderBattleParty();
    $("battleActorCaption").textContent="VICTORY";
    hideBattleContinue();

    if(state.battleFromRun){
      const rewardEnemies=state.battleEnemies.filter(e=>e && e.hp<=0 && !e.escaped && !e.noReward);
      const gain=rewardEnemies.reduce((sum,e)=>sum+(e.gold||0),0);
      const baseExpGain=rewardEnemies.reduce((sum,e)=>sum+(e.exp||0),0);
      const expTrait=baseExpGain>0?rollVictoryExpTrait():{multiplier:1,note:""};
      if(expTrait.note) victoryTraitNotes.push(expTrait.note);
      const expGain=Math.max(0,Math.round(baseExpGain*expTrait.multiplier));
      const expResult=awardExperience(rewardEnemies,expTrait.multiplier,expEligibleIds);
      const leveled=expResult.leveled;
      if(expResult.decayApplied) victoryTraitNotes.push("📉 格下補正あり");
      const drops=rollBattleDrops();

      state.gold+=gain;
      state.run.runGold+=gain;
      state.run.runExp+=expGain;
      state.battleVictoryData={gain,expGain,leveled,drops,dropIndex:0};
      state.levelUpPresentationDone=false;

      const levelText=leveled.length
        ? `　LEVEL UP：${leveled.map(x=>`${x.name} Lv${x.level}`).join("、")}`
        : "";
      const traitText=victoryTraitNotes.length?`　${victoryTraitNotes.join(" / ")}`:"";
      const escapedOnly=rewardEnemies.length===0 && state.battleEnemies.some(e=>e.escaped);
      setMessage(state.battleSpecial==="caveBoss"
        ? "魔界の尖兵を撃退した！"
        : escapedOnly
          ? `戦闘終了。敵は逃げ去った。報酬はなかった。${traitText}`
          : `勝利！ ${gain}G / 戦闘EXP ${expGain}。${levelText}${traitText}`);
      renderBattleParty();
      showBattleContinue();
    }else{
      state.battleVictoryData={gain:0,expGain:0,leveled:[],drops:[],dropIndex:0};
      state.levelUpPresentationDone=true;
      const traitText=victoryTraitNotes.length?` ${victoryTraitNotes.join(" / ")}`:"";
      const escapedOnly=state.battleEnemies.length>0 && state.battleEnemies.every(e=>e.escaped || e.hp>0);
      setMessage(escapedOnly
        ? `戦闘終了。敵は逃げ去った。戦闘テストではEXP・ゴールドは獲得しません。${traitText}`
        : `勝利！ 戦闘テストではEXP・ゴールドは獲得しません。${traitText}`);
      showBattleContinue();
    }
  }

  function finishVictoryReturn(extraToast=""){
    const data=state.battleVictoryData || {gain:0,expGain:0,leveled:[]};
    state.battleVictoryData=null;
    state.levelUpPresentationDone=false;
    state.levelUpPresentationQueue=[];
    state.levelUpPresentationIndex=0;
    state.levelUpAfterClose=null;
    $("levelUpModal").classList.remove("show");
    hideBattleDrop();
    hideBattleContinue();

    if(state.battleDirectTest){
      restorePartySnapshot(state.battleTestSnapshot);
      state.battleTestSnapshot=null;
      state.battleDirectTest=false;
      state.battleFromRun=false;
      showScreen("homeScreen");
      $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
      updateHeader();
      if(extraToast) toast(extraToast);
      return;
    }

    updateRunHud();
    showScreen("exploreScreen");
    $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
    state.battleFromRun=false;

    if(state.battleSpecial==="recruitTutorial"){
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      if(extraToast) toast(extraToast);
      if(!recruitTutorialDone()) startStoryEvent("recruitTutorial",{force:true});
      return;
    }

    if(state.battleSpecial==="caveBoss"){
      state.caveBossDefeated=true;
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      startStoryEvent("caveBossAfter",{force:true});
      return;
    }
    if(state.battleSpecial==="yodyMountainBoss"){
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags.yodyMountainBossDefeated=true;
      if(state.run?.area==="yodyMountain"){
        state.run.mountainBossDefeated=true;
        state.run.resolved.add(state.run.current);
      }
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      renderMap();updateRunHud();
      toast("ポダルゲとハーピーたちを撃退した！");
      return;
    }
    if(state.battleSpecial==="tilenoToxicBoss" || state.battleFormationArea==="tilenoToxicBoss"){
      if(state.run?.area==="tilenoToxicWetland") state.run.resolved.add(state.run.current);
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      setTimeout(()=>startTilenoToxicBossAfter(),80);
      return;
    }
    if(state.battleSpecial==="zelrenoGhostGaze"){
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      const count=rerollForestDeepUnvisitedNodes();
      setTimeout(()=>modal("👻 ゴースト娘の視線",`周りの雰囲気が変わった気がする……。${count?`

未踏の通常ノードが再構成された。`:""}`,[["進む",closeModal]]),80);
      return;
    }
    if(state.battleSpecial==="zelrenoForestDeepBoss" || state.battleFormationArea==="zelrenoForestDeepBoss"){
      if(state.run?.area==="zelrenoForestDeep") state.run.resolved.add(state.run.current);
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      setTimeout(()=>startZelrenoForestDeepBossAfter(),80);
      return;
    }
    if(state.battleSpecial==="runelRuinsBoss"){
      if(state.run?.area==="runelRuins") state.run.resolved.add(state.run.current);
      state.battleSpecial=null;
      state.battleEscapeDisabled=false;
      setTimeout(()=>startRunelRuinsBossAfter(),80);
      return;
    }
    state.battleSpecial=null;
    state.battleEscapeDisabled=false;
    if(extraToast) toast(extraToast);
  }

  function recruitKarenAt17(){
    if(state.ownedSpecies.has("karen")) return "加入済み";
    const c=roster.karen;
    c.level=17;
    c.exp=0;
    c.learnedSkills=plannedSkillIdsUpTo(characterProfiles.karen,17);
    addEquipmentOwned("iron_sword",1);
    addEquipmentOwned("iron_buckler",1);
    addEquipmentOwned("iron_mail",1);
    ensureEquipment(c);
    c.equipment.weapon="iron_sword";
    c.equipment.shield="iron_buckler";
    c.equipment.body="iron_mail";
    c.equipment.accessory=c.equipment.accessory||"no_accessory";
    ensureCharacterFinalVariation(c);
    rebuildFormalCharacterStats(c,{fullHeal:true,preserveDeficit:false});
    state.ownedSpecies.add("karen");
    let placement="ミレスタで待機";
    if(state.battleReserve.length<6 && state.battleActive.length+state.battleReserve.length<10){
      state.battleReserve.push("karen");
      placement="控えに加わった";
    }else if(!state.recruitedWaiting.includes("karen")) state.recruitedWaiting.push("karen");
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.karenJoined=true;
    updateHeader();
    return placement;
  }

  function addRecruitedSpecies(id){
    if(state.ownedSpecies.has(id)) return "加入済み";
    const recruit=roster[id];
    if(recruit && profileFor(recruit)){
      ensureCharacterFinalVariation(recruit);
      rebuildFormalCharacterStats(recruit,{fullHeal:true,preserveDeficit:false});
    }
    state.ownedSpecies.add(id);

    // New recruits join the expedition reserve if there is space.
    // During exploration, the recruit can be moved from reserve into a battle slot through party organization.
    if(state.battleReserve.length<6 && state.battleActive.length+state.battleReserve.length<10){
      state.battleReserve.push(id);
      return "控えに加わった";
    }

    if(!state.recruitedWaiting.includes(id)) state.recruitedWaiting.push(id);
    return "ミレスタで待機";
  }

  function showBattleDrop(drop){
    if(!drop) return;
    grantBattleDrop(drop);
    $("battleDropHeadline").textContent=`${drop.enemyName}はアイテムを落とした！`;
    $("battleDropItemText").textContent=`${battleDropEntryName(drop)}を入手した！`;
    $("battleMessage").textContent=`${drop.enemyName}はアイテムを落とした！`;
    $("battleDropStage").classList.add("show");
  }

  function hideBattleDrop(){
    $("battleDropStage").classList.remove("show");
  }

  function advanceBattleDrop(){
    const data=state.battleVictoryData;
    if(!data) return;
    hideBattleDrop();
    data.dropIndex=(Number(data.dropIndex)||0)+1;
    continueAfterVictory();
  }

  $("battleDropContinueBtn").onclick=advanceBattleDrop;

  function showRecruitOverlay(candidate,testMode=false){
    state.pendingRecruitCandidate={...candidate,testMode};
    const c=roster[candidate.id];
    $("recruitImage").src=c?.img || enemyData[candidate.id]?.img || "";
    $("recruitImage").alt=candidate.name;
    $("recruitHeadline").textContent=`${candidate.name}が起き上がった！`;
    $("recruitQuestion").textContent="仲間にしますか？";
    $("recruitTestNote").textContent=testMode ? "直接戦闘テスト：選択は加入記録に残りません" : "";
    $("recruitYesBtn").textContent="はい";
    $("recruitNoBtn").textContent="いいえ";
    $("recruitActions").classList.remove("show");
    $("recruitContinueBtn").classList.add("show");
    $("battleMessage").textContent=`${candidate.name}が起き上がった！`;
    $("battleRecruitStage").classList.add("show");
  }

  function advanceRecruitPrompt(){
    if(!state.pendingRecruitCandidate) return;
    $("recruitContinueBtn").classList.remove("show");
    $("recruitActions").classList.add("show");
    $("battleMessage").textContent="仲間にしますか？";
  }

  function hideRecruitOverlay(){
    $("battleRecruitStage").classList.remove("show");
    $("recruitContinueBtn").classList.remove("show");
    $("recruitActions").classList.remove("show");
  }

  function resolveRecruitChoice(accept){
    const pending=state.pendingRecruitCandidate;
    if(!pending) return;

    const forcedTutorialRecruit=!pending.testMode && state.battleSpecial==="recruitTutorial" && pending.id==="slime";
    if(!accept && forcedTutorialRecruit){
      pending.refusalCount=(Number(pending.refusalCount)||0)+1;
      state.pendingRecruitCandidate=pending;
      const msg=pending.refusalCount===1
        ? "スライム娘はこちらをじっと見つめている……。どうやら諦める気はないようだ。"
        : "スライム娘はどうしてもついて来たいようだ……！";
      $("battleMessage").textContent=msg;
      $("recruitQuestion").textContent=msg;
      return;
    }

    state.pendingRecruitCandidate=null;
    hideRecruitOverlay();

    if(pending.testMode){
      finishVictoryReturn(accept ? `${pending.name}を仲間にする演出を確認` : "勧誘を見送った");
      return;
    }

    if(accept){
      const placement=addRecruitedSpecies(pending.id);
      finishVictoryReturn(`${pending.name}が仲間になった！ ${placement}`);
    }else{
      finishVictoryReturn(`${pending.name}を見送った`);
    }
  }

  $("recruitContinueBtn").onclick=advanceRecruitPrompt;
  $("recruitYesBtn").onclick=()=>resolveRecruitChoice(true);
  $("recruitNoBtn").onclick=()=>resolveRecruitChoice(false);

  function continueAfterVictory(){
    if(!state.battleEnded || state.battlePhase!=="ended") return;
    hideBattleContinue();

    const data=state.battleVictoryData || {leveled:[]};
    if(!state.levelUpPresentationDone && data.leveled?.length){
      state.levelUpPresentationDone=true;
      showLevelUpResults(data.leveled,continueAfterVictory);
      return;
    }

    const drops=data.drops||[];
    const dropIndex=Number(data.dropIndex)||0;
    if(dropIndex<drops.length){
      showBattleDrop(drops[dropIndex]);
      return;
    }

    const candidate=(state.battleDirectTest || recruitmentUnlocked()) ? chooseRecruitWinner(state.battleDirectTest) : null;
    if(candidate){
      showRecruitOverlay(candidate,state.battleDirectTest);
      return;
    }

    // No recruit event: return normally without surfacing internal recruitment results.
    finishVictoryReturn();
  }

  $("battleContinueBtn").onclick=continueAfterVictory;

  function tryUseHolyBeastClock(){
    if(!Array.isArray(state.battleActive) || !state.battleActive.length) return false;
    const wearer=state.battleActive.map(id=>roster[id]).find(c=>c && ensureEquipment(c).accessory==="holy_beast_clock");
    if(!wearer) return false;
    wearer.equipment.accessory="no_accessory";
    equipmentOwnedCounts.holy_beast_clock=Math.max(0,Number(equipmentOwnedCounts.holy_beast_clock||0)-1);
    state.battleActive.forEach(id=>{
      const c=roster[id]; if(!c)return;
      S(c).hp=S(c).hpMax;
      c.defending=false;
    });
    renderBattleParty();
    updateActorPortrait();
    setMessage(`⌚ 聖獣の時計が砕け散った！ 前列の味方全員がHP全回復で復活した！`);
    return true;
  }

  function loseBattle(){
    if(state.battleEnded) return;
    if(tryUseHolyBeastClock()) return;
    state.battleEnded=true;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    state.battlePhase="ended";
    state.battleTargetMode=null;
    setCommandsEnabled(false);
    updateExecuteButton();
    clearEnemyActing();
    clearBattleEndStates();
    renderBattleParty();
    $("battleActorCaption").textContent="DEFEAT";
    hideRecruitOverlay();
    hideBattleDrop();
    hideBattleContinue();
    setMessage(state.battleFromRun
      ? "パーティは力尽きた……。探索を終了してミレスタへ戻ります。"
      : "パーティは力尽きた……。戦闘テストを終了します。");

    setTimeout(()=>{
      if(state.battleDirectTest){
        restorePartySnapshot(state.battleTestSnapshot);
        state.battleTestSnapshot=null;
      }else{
        state.run=null;
        restorePartyFull();
      }
      showScreen("homeScreen");
      $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
      state.battleFromRun=false;
      state.battleDirectTest=false;
      updateHeader();
    },t(1600));
  }

  function updateSpeedButtons(){
    document.querySelectorAll(".speed-btn").forEach(btn=>{
      btn.classList.toggle("active",Number(btn.dataset.speed)===Number(state.battleSpeed));
    });
  }

  document.querySelectorAll(".speed-btn").forEach(btn=>{
    btn.onclick=()=>{
      state.battleSpeed=Number(btn.dataset.speed)||1;
      localStorage.setItem("milesta_battle_speed",String(state.battleSpeed));
      updateSpeedButtons();
      const label=state.battleSpeed===.75?"ゆっくり":state.battleSpeed===1?"標準":state.battleSpeed===1.5?"速い":"高速";
      toast(`戦闘速度：${label}`);
    };
  });

  function openBattle(fromRun=false,area="plains",options={}){
    state.battleFromRun=fromRun;
    state.battleDirectTest=!fromRun;
    state.battleReturn=fromRun?"exploreScreen":"homeScreen";
    if(!fromRun){
      state.battleTestSnapshot=snapshotPartyState();
      if(!options.preserveParty) resetRosterForDirectTest();
    }

    state.battleSpeed=Number(localStorage.getItem("milesta_battle_speed")||"1");
    updateSpeedButtons();

    state.battleFormationArea=area;
    const requestedFormation=Number(options.formationIndex);
    state.battleFormationIndex=Number.isInteger(requestedFormation)
      ? ((requestedFormation % (battleFormations[area]?.formations.length||1)) + (battleFormations[area]?.formations.length||1)) % (battleFormations[area]?.formations.length||1)
      : randomFormation(area);
    state.battleEscapeDisabled=!!options.escapeDisabled || area==="caveBoss" || area==="yodyMountainBoss" || area==="tilenoToxicBoss" || area==="zelrenoForestDeepBoss";
    state.battleSpecial=options.special || (area==="caveBoss"?"caveBoss":area==="yodyMountainBoss"?"yodyMountainBoss":area==="tilenoToxicBoss"?"tilenoToxicBoss":area==="zelrenoForestDeepBoss"?"zelrenoForestDeepBoss":null);
    state.battleRound=1;
    state.battleTurnSlot=0;
    state.battleEnded=false;
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleAutoContinuous=false;
    state.battleVictoryData=null;
    state.pendingRecruitCandidate=null;
    state.levelUpPresentationDone=false;
    state.levelUpPresentationQueue=[];
    state.levelUpPresentationIndex=0;
    state.levelUpAfterClose=null;
    $("levelUpModal").classList.remove("show");
    state.battleDefeatCounter=0;
    state.escapeAttempts=0;
    state.escapeBaseRate=null;
    state.fortuneCasts=0;
    hideRecruitOverlay();
    hideBattleDrop();
    hideBattleContinue();
    cancelScheduledTurnStart();
    updateAutoButtons();

    $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
    $("battleTestTools").style.display=fromRun?"none":"flex";
    $("battleWinBtn").style.display=fromRun?"none":"block";
    showScreen("battleScreen");

    renderFormation(area,state.battleFormationIndex,true);
    const startTraitNotices=applyBattleStartTraits();
    let forestSilenceApplied=false;
    let ruinsCurseApplied=false;
    if(fromRun && state.run?.pendingForestSilence){
      state.battleActive.forEach(id=>{const c=roster[id];if(c&&S(c).hp>0)conditionsOf(c).silence=true;});
      state.run.pendingForestSilence=false;
      forestSilenceApplied=true;
    }
    if(fromRun && state.run?.area==="runelRuins" && state.run?.ruinsCursePending){
      const hero=roster.hero;
      if(hero && S(hero).hp>0){const cond=conditionsOf(hero);cond.silence=true;cond.blind=true;ruinsCurseApplied=true;}
      state.run.ruinsCursePending=false;
    }
    startCommandInput();
    if(forestSilenceApplied) setMessage("🔇 危険な鱗粉の影響で、バトルメンバー全員が封印状態になった！");
    if(ruinsCurseApplied) setMessage(`👁 古代の呪いが発動！ ${roster.hero.name}は封印・暗闇状態になった！`);
    if(area==="caveBoss") setMessage("魔界の尖兵が襲いかかってきた！");
    if(area==="yodyMountainBoss") setMessage("ポダルゲとハーピーたちが立ちはだかった！");
    if(area==="tilenoToxicBoss") setMessage("テンタクルと毒の魔物娘たちが襲いかかってきた！");
    else if(area==="zelrenoForestDeepBoss") setMessage("アイアンオウルが立ちはだかった！");
    else if(state.battleSpecial==="runelRuinsBoss") setMessage("黒蛇ヴリトラが襲いかかってきた！");
    if(startTraitNotices.length) toast(startTraitNotices.join(" / "));
  }

  function closeBattleTest(){
    if(state.battleFromRun){
      setMessage("探索中の戦闘からは、勝利するまで戻れません。");
      return;
    }
    state.battleEnded=true;
    state.battleAutoContinuous=false;
    hideBattleDrop();
    hideBattleContinue();
    cancelScheduledTurnStart();
    restorePartySnapshot(state.battleTestSnapshot);
    state.battleTestSnapshot=null;
    state.battleDirectTest=false;
    showScreen("homeScreen");
    $("topSubtitle").textContent=`探索＋勧誘・装備試作 ${DEV_VERSION}`;
    updateHeader();
    toast("戦闘テストを終了");
  }

  function openSwap(deploySlot=null){
    if(state.battlePhase!=="input" || state.battleEnded) return;
    cancelScheduledTurnStart();
    state.battleTargetMode=null;
    const deployMode=Number.isInteger(deploySlot) && deploySlot>=state.battleActive.length && state.battleActive.length<4;
    const activeSlot=state.battleActorSlot;
    const active=roster[state.battleActive[activeSlot]];
    if(!deployMode && active?.partyLocked){ setMessage("エリザはこの探索中、交代できません。"); return; }
    $("swapLead").textContent=deployMode
      ? "空き枠へ出す控えメンバーを選択（ターン消費なし）"
      : `${active.name} と交代する控えメンバーを選択（ターン消費なし）`;
    const grid=$("reserveGrid");
    grid.innerHTML="";

    state.battleReserve.forEach((id,reserveIndex)=>{
      const c=roster[id], st=S(c);
      const card=document.createElement("button");
      card.className="reserve-card"+(st.hp<=0?" ko":"");

      // v0.38e: KO reserves may enter the front line as long as at least one front-line member remains alive.
      const nextFrontIds=deployMode
        ? [...state.battleActive,id]
        : state.battleActive.map((frontId,slot)=>slot===activeSlot?id:frontId);
      const wouldAllKo=!nextFrontIds.some(frontId=>S(roster[frontId]).hp>0);
      card.disabled=wouldAllKo;
      if(wouldAllKo) card.title="バトルメンバー全員が戦闘不能になるため交代できません";

      const thumb=c.img
        ? `<span class="reserve-thumb"><img src="${c.img}" alt="${c.name}"></span>`
        : `<span class="reserve-thumb"><span class="hero-placeholder">👤</span></span>`;
      card.innerHTML=`${thumb}<span class="reserve-info"><span class="reserve-name">${c.name} Lv${c.level}</span><small>HP ${st.hp}/${st.hpMax}</small><small>MP ${st.mp}/${st.mpMax}</small></span>`;
      card.onclick=()=>{
        if(wouldAllKo){
          setMessage("バトルメンバー全員が戦闘不能になる交代はできません。");
          return;
        }
        if(deployMode){
          const slot=state.battleActive.length;
          state.battleReserve.splice(reserveIndex,1);
          state.battleActive.push(id);
          state.battleActions[slot]=null;
          state.battleTargetMode=null;
          $("swapModal").classList.remove("show");

          if(st.hp>0){
            state.battleActorSlot=slot;
            updateActorPortrait();
            renderBattleParty();
            renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
            updateExecuteButton();
            setMessage(`${c.name} が戦闘に参加。`);
          }else{
            const next=nextUnqueuedSlot(activeSlot);
            const fallback=livingActiveSlots()[0];
            if(next!==undefined) state.battleActorSlot=next;
            else if(fallback) state.battleActorSlot=fallback.i;
            updateActorPortrait();
            renderBattleParty();
            renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
            updateExecuteButton();
            if(commandsReady()){
              setMessage(`${c.name} が戦闘不能のまま前列に参加。全員の行動を選択済みです。`);
              scheduleTurnStart(0);
            }else{
              setMessage(`${c.name} が戦闘不能のまま前列に参加。${currentInputPrompt()}`);
            }
          }
          return;
        }
        const outgoing=state.battleActive[activeSlot];
        state.battleActive[activeSlot]=id;
        state.battleReserve[reserveIndex]=outgoing;
        refundQueuedItem(activeSlot);
        state.battleActions[activeSlot]=null;
        state.battleTargetMode=null;
        $("swapModal").classList.remove("show");

        if(st.hp>0){
          state.battleActorSlot=activeSlot;
          updateActorPortrait();
          renderBattleParty();
          renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
          updateExecuteButton();
          setMessage(`${roster[outgoing].name} → ${c.name} に交代。`);
        }else{
          const next=nextUnqueuedSlot(activeSlot);
          const fallback=livingActiveSlots()[0];
          if(next!==undefined) state.battleActorSlot=next;
          else if(fallback) state.battleActorSlot=fallback.i;
          updateActorPortrait();
          renderBattleParty();
          renderFormation(state.battleFormationArea,state.battleFormationIndex,false);
          updateExecuteButton();
          if(commandsReady()){
            setMessage(`${roster[outgoing].name} → ${c.name} に交代。${c.name} は戦闘不能のまま前列へ出ました。`);
            scheduleTurnStart(0);
          }else{
            setMessage(`${roster[outgoing].name} → ${c.name} に交代。${c.name} は戦闘不能のまま前列へ。${currentInputPrompt()}`);
          }
        }
      };
      grid.appendChild(card);
    });
    $("swapModal").classList.add("show");
  }

  $("swapCloseBtn").onclick=()=>$("swapModal").classList.remove("show");
  $("swapModal").addEventListener("click",e=>{ if(e.target===$("swapModal")) $("swapModal").classList.remove("show"); });
  $("swapBtn").onclick=()=>openSwap();
  $("escapeBtn").onclick=attemptEscape;
  $("battleTargetBackBtn").onclick=cancelBattleTargetSelection;
  $("skillCloseBtn").onclick=closeSkillMenu;
  $("skillModal").addEventListener("click",e=>{ if(e.target===$("skillModal")) closeSkillMenu(); });
  $("itemCloseBtn").onclick=closeItemMenu;
  $("itemModal").addEventListener("click",e=>{ if(e.target===$("itemModal")) closeItemMenu(); });
  $("exploreReserveBtn").onclick=()=>openPartyManage("explore");


  $("turnAutoBtn").onclick=()=>{
    if(state.battlePhase!=="input" || state.battleEnded) return;
    fillAutoActions();
  };

  $("autoToggleBtn").onclick=()=>{
    if(state.battleEnded) return;
    state.battleAutoContinuous=!state.battleAutoContinuous;
    updateAutoButtons();
    if(state.battleAutoContinuous){
      setMessage("継続AUTOをONにしました。以後のラウンドは自動で行動を選択します。");
      if(state.battlePhase==="input") fillAutoActions();
    }else{
      cancelScheduledTurnStart();
      setMessage("継続AUTOをOFFにしました。次の行動から手動で選べます。");
    }
  };

  $("formationAreaSelect").onchange=e=>{
    if(state.battlePhase==="resolve" || state.battlePhase==="enemy") return;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    updateAutoButtons();
    state.battleFormationIndex=0;
    state.battleRound=1;
    state.battleEnded=false;
    refundAllQueuedItems();
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleDefeatCounter=0;
    state.escapeAttempts=0;
    state.escapeBaseRate=null;
    renderFormation(e.target.value,0,true);
    travelPartyIds().forEach(id=>clearBattleOnlyStates(roster[id],{preservePoison:false}));
    const startTraitNotices=applyBattleStartTraits();
    startCommandInput();
    if(startTraitNotices.length) toast(startTraitNotices.join(" / "));
  };
  $("formationPrevBtn").onclick=()=>{
    if(state.battlePhase==="resolve" || state.battlePhase==="enemy") return;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    updateAutoButtons();
    state.battleRound=1;
    state.battleEnded=false;
    refundAllQueuedItems();
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleDefeatCounter=0;
    state.escapeAttempts=0;
    state.escapeBaseRate=null;
    renderFormation(state.battleFormationArea,state.battleFormationIndex-1,true);
    travelPartyIds().forEach(id=>clearBattleOnlyStates(roster[id],{preservePoison:false}));
    const startTraitNotices=applyBattleStartTraits();
    startCommandInput();
    if(startTraitNotices.length) toast(startTraitNotices.join(" / "));
  };
  $("formationNextBtn").onclick=()=>{
    if(state.battlePhase==="resolve" || state.battlePhase==="enemy") return;
    state.battleAutoContinuous=false;
    cancelScheduledTurnStart();
    updateAutoButtons();
    state.battleRound=1;
    state.battleEnded=false;
    refundAllQueuedItems();
    state.battleActions=[null,null,null,null];
    state.battleTargetMode=null;
    state.battleDefeatCounter=0;
    state.escapeAttempts=0;
    state.escapeBaseRate=null;
    renderFormation(state.battleFormationArea,state.battleFormationIndex+1,true);
    travelPartyIds().forEach(id=>clearBattleOnlyStates(roster[id],{preservePoison:false}));
    const startTraitNotices=applyBattleStartTraits();
    startCommandInput();
    if(startTraitNotices.length) toast(startTraitNotices.join(" / "));
  };

  document.querySelectorAll(".cmd[data-command]").forEach(btn=>{
    btn.onclick=()=>{
      const cmd=btn.dataset.command;
      if(cmd==="攻撃") queueAttack();
      else if(cmd==="防御") queueDefend();
      else if(cmd==="スキル") chooseSkill();
      else if(cmd==="アイテム") openItemMenu();
      else placeholderCommand(cmd);
    };
  });
  $("battleExecuteBtn").onclick=resolveTurn;
  $("battleWinBtn").onclick=closeBattleTest;


  function updateWorld(){
    updateHeader();
    const yodyUnlocked=!!state.eventFlags?.yodyRegionUnlocked;
    const yodyTownUnlocked=!!state.eventFlags?.yodyPortReached;
    const footpathUnlocked=!!state.eventFlags?.yodyFootpathUnlocked;
    const mountainUnlocked=!!state.eventFlags?.yodyMountainUnlocked;
    const tilenoUnlocked=!!state.eventFlags?.tilenoTownReached;
    const tilenoWetlandUnlocked=!!state.eventFlags?.tilenoWetlandReached;
    const tilenoToxicWetlandUnlocked=!!state.eventFlags?.tilenoToxicWetlandReached;
    const forestUnlocked=!!state.eventFlags?.zelrenoForestReached;
    const granzelPlainsUnlocked=!!state.eventFlags?.granzelTownReached;
    const granzelTownUnlocked=!!state.eventFlags?.granzelTownReached;
    const iceCorridorUnlocked=!!state.eventFlags?.iceCorridorReached;
    const runelCavernUnlocked=!!state.eventFlags?.runelCavernReached;
    const runelTownUnlocked=!!state.eventFlags?.runelTownReached;
    const runelRuinsUnlocked=!!state.eventFlags?.runelRuinsReached;
    const fairyGroveKnown=!!state.eventFlags?.fairyGroveDiscovered;
    if(!state.caveUnlocked && state.selectedArea==="cave") state.selectedArea="plains";
    if(!yodyUnlocked && state.selectedArea==="yodyRegion") state.selectedArea=state.caveUnlocked?"cave":"plains";
    if(!yodyTownUnlocked && state.selectedArea==="yodyTown") state.selectedArea=yodyUnlocked?"yodyRegion":state.caveUnlocked?"cave":"plains";
    if(!footpathUnlocked && state.selectedArea==="footpath") state.selectedArea=yodyUnlocked?"yodyRegion":state.caveUnlocked?"cave":"plains";
    if(!mountainUnlocked && state.selectedArea==="yodyMountain") state.selectedArea=yodyUnlocked?"yodyRegion":state.caveUnlocked?"cave":"plains";
    if(!tilenoUnlocked && state.selectedArea==="tilenoRegion") state.selectedArea=mountainUnlocked?"yodyMountain":yodyUnlocked?"yodyRegion":state.caveUnlocked?"cave":"plains";
    if(!tilenoUnlocked && state.selectedArea==="tilenoTown") state.selectedArea=mountainUnlocked?"yodyMountain":yodyUnlocked?"yodyRegion":state.caveUnlocked?"cave":"plains";
    if(!tilenoWetlandUnlocked && state.selectedArea==="tilenoWetland") state.selectedArea=tilenoUnlocked?"tilenoRegion":mountainUnlocked?"yodyMountain":"plains";
    if(!tilenoToxicWetlandUnlocked && state.selectedArea==="tilenoToxicWetland") state.selectedArea=tilenoWetlandUnlocked?"tilenoWetland":tilenoUnlocked?"tilenoRegion":"plains";
    if(!forestUnlocked && state.selectedArea==="zelrenoForest") state.selectedArea=tilenoUnlocked?"tilenoRegion":mountainUnlocked?"yodyMountain":yodyUnlocked?"yodyRegion":"plains";
    if(!granzelPlainsUnlocked && state.selectedArea==="granzelPlains") state.selectedArea=forestUnlocked?"zelrenoForest":tilenoUnlocked?"tilenoRegion":"plains";
    if(!granzelTownUnlocked && state.selectedArea==="granzelTown") state.selectedArea=forestUnlocked?"zelrenoForest":tilenoUnlocked?"tilenoRegion":"plains";
    if(!iceCorridorUnlocked && state.selectedArea==="iceCorridor") state.selectedArea=granzelTownUnlocked?"granzelTown":granzelPlainsUnlocked?"granzelPlains":forestUnlocked?"zelrenoForest":"plains";
    if(!runelCavernUnlocked && state.selectedArea==="runelCavern") state.selectedArea=granzelPlainsUnlocked?"granzelPlains":granzelTownUnlocked?"granzelTown":forestUnlocked?"zelrenoForest":"plains";
    if(!runelTownUnlocked && state.selectedArea==="runelRegion") state.selectedArea=runelCavernUnlocked?"runelCavern":granzelPlainsUnlocked?"granzelPlains":"plains";
    if(!runelTownUnlocked && state.selectedArea==="runelTown") state.selectedArea=runelCavernUnlocked?"runelCavern":granzelPlainsUnlocked?"granzelPlains":"plains";
    if(!runelRuinsUnlocked && state.selectedArea==="runelRuins") state.selectedArea=runelTownUnlocked?"runelRegion":runelCavernUnlocked?"runelCavern":"plains";
    if(!fairyGroveKnown && state.selectedArea==="fairyGrove") state.selectedArea=runelTownUnlocked?"runelRegion":runelCavernUnlocked?"runelCavern":"plains";
    const a=state.selectedArea;
    const caveVisible=!!state.caveUnlocked;
    if($("cavePin")) $("cavePin").style.display=caveVisible?"flex":"none";
    if($("caveRoute")) $("caveRoute").style.display=caveVisible?"":"none";
    if($("yodyRegionPin")) $("yodyRegionPin").style.display=yodyUnlocked?"flex":"none";
    if($("yodyRoute")) $("yodyRoute").style.display=yodyUnlocked?"":"none";
    if($("yodyTownPin")) $("yodyTownPin").style.display=yodyTownUnlocked?"flex":"none";
    if($("yodyTownRoute")) $("yodyTownRoute").style.display=yodyTownUnlocked?"":"none";
    if($("footpathPin")) $("footpathPin").style.display=footpathUnlocked?"flex":"none";
    if($("footpathRoute")) $("footpathRoute").style.display=footpathUnlocked?"":"none";
    if($("yodyMountainWorldPin")) $("yodyMountainWorldPin").style.display=mountainUnlocked?"flex":"none";
    if($("yodyMountainWorldRoute")) $("yodyMountainWorldRoute").style.display=mountainUnlocked?"":"none";
    if($("tilenoRegionWorldPin")) $("tilenoRegionWorldPin").style.display=tilenoUnlocked?"flex":"none";
    if($("tilenoRegionWorldRoute")) $("tilenoRegionWorldRoute").style.display=tilenoUnlocked?"":"none";
    if($("tilenoTownWorldPin")) $("tilenoTownWorldPin").style.display=tilenoUnlocked?"flex":"none";
    if($("tilenoTownWorldRoute")) $("tilenoTownWorldRoute").style.display=tilenoUnlocked?"":"none";
    if($("tilenoWetlandWorldPin")) $("tilenoWetlandWorldPin").style.display=tilenoWetlandUnlocked?"flex":"none";
    if($("tilenoWetlandWorldRoute")) $("tilenoWetlandWorldRoute").style.display=tilenoWetlandUnlocked?"":"none";
    if($("tilenoToxicWetlandWorldPin")) $("tilenoToxicWetlandWorldPin").style.display=tilenoToxicWetlandUnlocked?"flex":"none";
    if($("tilenoToxicWetlandWorldRoute")) $("tilenoToxicWetlandWorldRoute").style.display=tilenoToxicWetlandUnlocked?"":"none";
    if($("zelrenoForestWorldPin")) $("zelrenoForestWorldPin").style.display=forestUnlocked?"flex":"none";
    if($("zelrenoForestWorldRoute")) $("zelrenoForestWorldRoute").style.display=forestUnlocked?"":"none";
    if($("granzelPlainsWorldPin")) $("granzelPlainsWorldPin").style.display=granzelPlainsUnlocked?"flex":"none";
    if($("granzelPlainsWorldRoute")) $("granzelPlainsWorldRoute").style.display=granzelPlainsUnlocked?"":"none";
    if($("granzelTownWorldPin")) $("granzelTownWorldPin").style.display=granzelTownUnlocked?"flex":"none";
    if($("granzelTownWorldRoute")) $("granzelTownWorldRoute").style.display=granzelTownUnlocked?"":"none";
    if($("iceCorridorWorldPin")) $("iceCorridorWorldPin").style.display=iceCorridorUnlocked?"flex":"none";
    if($("iceCorridorWorldRoute")) $("iceCorridorWorldRoute").style.display=iceCorridorUnlocked?"":"none";
    if($("runelCavernWorldPin")) $("runelCavernWorldPin").style.display=runelCavernUnlocked?"flex":"none";
    if($("runelCavernWorldRoute")) $("runelCavernWorldRoute").style.display=runelCavernUnlocked?"":"none";
    if($("runelRegionWorldPin")) $("runelRegionWorldPin").style.display=runelTownUnlocked?"flex":"none";
    if($("runelRegionWorldRoute")) $("runelRegionWorldRoute").style.display=runelTownUnlocked?"":"none";
    if($("runelTownWorldPin")) $("runelTownWorldPin").style.display=runelTownUnlocked?"flex":"none";
    if($("runelTownWorldRoute")) $("runelTownWorldRoute").style.display=runelTownUnlocked?"":"none";
    if($("runelRuinsWorldPin")) $("runelRuinsWorldPin").style.display=runelRuinsUnlocked?"flex":"none";
    if($("runelRuinsWorldRoute")) $("runelRuinsWorldRoute").style.display=runelRuinsUnlocked?"":"none";
    if($("fairyGroveWorldPin")) $("fairyGroveWorldPin").style.display=fairyGroveKnown?"flex":"none";
    if($("fairyGroveWorldRoute")) $("fairyGroveWorldRoute").style.display=fairyGroveKnown?"":"none";
    document.querySelectorAll(".area-pin").forEach(p=>p.classList.toggle("selected",p.dataset.area===a));
    if(a==="milestaTown"){
      $("areaName").textContent="辺境の町ミレスタ";
      $("areaDesc").textContent="冒険の本拠地となる辺境の町。待機中の仲間の管理もここで行える。";
    }else if(a==="plains"){
      $("areaName").textContent="ミレスタ平原";
      $("areaDesc").textContent="町のすぐ外に広がる穏やかな平原。危険な魔物娘もほとんどいない。";
    }else if(a==="cave"){
      $("areaName").textContent="小さな洞窟";
      $("areaDesc").textContent="ミレスタの町の近くにある洞窟。ナメクジ娘の巣にもなっている。";
    }else if(a==="yodyTown"){
      $("areaName").textContent="港町ヨーディー";
      $("areaDesc").textContent="サリード王国との交易で栄える港町。ヨーディー地方を越えた先にある。";
    }else if(a==="footpath"){
      $("areaName").textContent="麓の小道";
      $("areaDesc").textContent="ヨーディー北東の山脈、その麓から木立の中へ続く小道。珍しい薬草が採れるという。";
    }else if(a==="yodyMountain"){
      $("areaName").textContent="ヨーディー山道";
      $("areaDesc").textContent="ヨーディー地方とティレーノ地方を結ぶ険しい山道。峠には強力な魔物娘も現れる。";
    }else if(a==="tilenoRegion"){
      $("areaName").textContent="ティレーノ地方";
      $("areaDesc").textContent="草原・森・水辺が入り混じる緑豊かな地方。湿原やゼルレーノ森林地帯へ続く道が伸びている。";
    }else if(a==="tilenoTown"){
      $("areaName").textContent="ティレーノの街";
      $("areaDesc").textContent="国中から冒険者が集まる、冒険者ギルドの街。湿原や森林地帯へ向かう者たちの拠点でもある。";
    }else if(a==="tilenoWetland"){
      $("areaName").textContent="ティレーノ湿原";
      $("areaDesc").textContent="ティレーノ地方北部に広がる湿原。さらに奥には毒気に覆われた湿地がある。";
    }else if(a==="tilenoToxicWetland"){
      $("areaName").textContent="ティレーノ毒湿地";
      $("areaDesc").textContent="ティレーノ湿原の奥に広がる、毒気に覆われた危険な湿地。毒の魔物娘たちが巣食っている。";
    }else if(a==="zelrenoForest"){
      $("areaName").textContent="ゼルレーノ森林地帯";
      $("areaDesc").textContent="ティレーノ地方の東に広がる深い森林地帯。魔法に強い魔物娘も多く生息している。";
    }else if(a==="granzelPlains"){
      $("areaName").textContent="グランゼル大平原";
      $("areaDesc").textContent="グランゼル王国中央部に広がる大平原。北は氷雪の回廊、南東はルネル岩窟へと道が続いている。";
    }else if(a==="granzelTown"){
      $("areaName").textContent="グランゼル城下町";
      $("areaDesc").textContent="グランゼル王国の中心に築かれた大きな城下町。王国軍の兵士や旅人が行き交っている。";
    }else if(a==="iceCorridor"){
      $("areaName").textContent="氷雪の回廊";
      $("areaDesc").textContent="グランゼル城下町の北にある、雪と氷に覆われた回廊。現在は入口まで訪れることができる。";
    }else if(a==="runelCavern"){
      $("areaName").textContent="ルネル岩窟";
      $("areaDesc").textContent="グランゼル大平原南東からルネル地方へ抜ける岩窟。暗い洞内には強力な魔物娘も潜んでいる。";
    }else if(a==="runelRegion"){
      $("areaName").textContent="ルネル地方";
      $("areaDesc").textContent="旧ルネルパリオ領に広がる地方。ルネルの街や旧城下町跡、立ち入り難い森へと道が続いている。";
    }else if(a==="runelTown"){
      $("areaName").textContent="ルネルの街";
      $("areaDesc").textContent="旧ルネルパリオ領に築かれた街。現在はグランゼルからの入植者と、その子孫たちが暮らしている。";
    }else if(a==="runelRuins"){
      $("areaName").textContent="ルネルパリオ城下町跡";
      $("areaDesc").textContent="かつてルネルパリオの城下町だった廃墟。魔物娘が巣食い、危険な場所になっている。";
    }else if(a==="fairyGrove"){
      $("areaName").textContent="妖精郷";
      $("areaDesc").textContent="ルネル地方の森の奥にある不思議な場所。森に入っても、なぜか入口へ戻されてしまう。";
    }else{
      $("areaName").textContent="ヨーディー地方";
      $("areaDesc").textContent="港町ヨーディー周辺に広がる海沿いの地方。山道や麓へ続く道が伸びている。";
    }
    $("backHome").textContent=`← ${townDisplayName(state.currentTown)}へ`;
    if(a==="fairyGrove"){
      $("departBtn").textContent="現在は入れない";
      $("departBtn").disabled=true;
      $("departBtn").classList.add("locked");
    }else{
      $("departBtn").textContent=(a==="milestaTown"||a==="yodyTown"||a==="tilenoTown"||a==="granzelTown"||a==="runelTown")?"町へ移動する":a==="iceCorridor"?"入口へ移動する":"探索を開始する";
      $("departBtn").disabled=false;
      $("departBtn").classList.remove("locked");
    }
  }
  document.querySelectorAll(".area-pin").forEach(pin=>{
    pin.onclick=()=>{
      if(pin.dataset.area==="cave" && !state.caveUnlocked){
        toast(prologueStage()>=4?"今はミレスタ平原から洞窟へ向かう必要があります":"まだこの場所は発見していません");
        return;
      }
      if(pin.dataset.area==="yodyRegion" && !state.eventFlags?.yodyRegionUnlocked){
        toast("まだこの場所へ直接向かうことはできません");
        return;
      }
      if(pin.dataset.area==="yodyTown" && !state.eventFlags?.yodyPortReached){
        toast("まだ港町ヨーディーには到着していません");
        return;
      }
      if(pin.dataset.area==="footpath" && !state.eventFlags?.yodyFootpathUnlocked){
        toast("まだ麓の小道は発見していません");
        return;
      }
      if(pin.dataset.area==="yodyMountain" && !state.eventFlags?.yodyMountainUnlocked){
        toast("まだヨーディー山道は発見していません");
        return;
      }
      if(pin.dataset.area==="tilenoRegion" && !state.eventFlags?.tilenoTownReached){
        toast("ティレーノの街に到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="tilenoTown" && !state.eventFlags?.tilenoTownReached){
        toast("まだティレーノの街には到着していません");
        return;
      }
      if(pin.dataset.area==="tilenoWetland" && !state.eventFlags?.tilenoWetlandReached){
        toast("ティレーノ地方から一度到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="tilenoToxicWetland" && !state.eventFlags?.tilenoToxicWetlandReached){
        toast("ティレーノ湿原から一度到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="zelrenoForest" && !state.eventFlags?.zelrenoForestReached){
        toast("まだゼルレーノ森林地帯は発見していません");
        return;
      }
      if(pin.dataset.area==="granzelPlains" && !state.eventFlags?.granzelTownReached){
        toast("グランゼル城下町に到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="granzelTown" && !state.eventFlags?.granzelTownReached){
        toast("まだグランゼル城下町には到着していません");
        return;
      }
      if(pin.dataset.area==="iceCorridor" && !state.eventFlags?.iceCorridorReached){
        toast("グランゼル大平原から一度到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="runelCavern" && !state.eventFlags?.runelCavernReached){
        toast("グランゼル大平原から一度到着すると、ここへ直接向かえるようになります");
        return;
      }
      if(pin.dataset.area==="runelRegion" && !state.eventFlags?.runelTownReached){
        toast("ルネルの街に到着すると、世界マップに表示されます");
        return;
      }
      if(pin.dataset.area==="runelTown" && !state.eventFlags?.runelTownReached){
        toast("まだルネルの街には到着していません");
        return;
      }
      if(pin.dataset.area==="runelRuins" && !state.eventFlags?.runelRuinsReached){
        toast("まだルネルパリオ城下町跡には到着していません");
        return;
      }
      if(pin.dataset.area==="fairyGrove" && !state.eventFlags?.fairyGroveDiscovered){
        toast("まだこの場所は発見していません");
        return;
      }
      state.selectedArea=pin.dataset.area;
      updateWorld();
    };
  });

  $("departBtn").onclick=()=>{
    if(state.selectedArea==="milestaTown"){ enterTown("milesta","ミレスタへ移動しました"); return; }
    if(state.selectedArea==="yodyTown"){ enterTown("yody","港町ヨーディーへ移動しました"); return; }
    if(state.selectedArea==="tilenoTown"){ enterTown("tileno","ティレーノの街へ移動しました"); return; }
    if(state.selectedArea==="granzelTown"){ enterTown("granzel","グランゼル城下町へ移動しました"); return; }
    if(state.selectedArea==="runelTown"){ enterTown("runel","ルネルの街へ移動しました"); return; }
    if(state.selectedArea==="iceCorridor"){
      if(margaretIceMeetingPending()){ startMargaretIceCorridorMeeting(); return; }
      modal("❄️ 氷雪の回廊",`雪と氷に覆われた、氷雪の回廊の入口だ。`,[["世界マップへ戻る",closeModal]]);
      return;
    }
    if(state.selectedArea==="plains" && prologueStage()===1){ startStoryEvent("plainsDepartEliza",{force:true}); return; }
    startRun(state.selectedArea);
  };

  function rand(n){ return Math.floor(Math.random()*n); }
  function choose(arr){ return arr[rand(arr.length)]; }

  function battleNodeWeightMultiplier(){
    const bonus=travelPartyIds().reduce((sum,id)=>sum+(Number(equippedAccessory(roster[id])?.battleNodeWeightBonus)||0),0);
    return Math.max(0,1+bonus);
  }
  function weightedChoice(entries){
    const total=entries.reduce((sum,e)=>sum+Math.max(0,Number(e.weight)||0),0);
    if(total<=0) return entries[0]?.type||"battle";
    let roll=Math.random()*total;
    for(const entry of entries){
      roll-=Math.max(0,Number(entry.weight)||0);
      if(roll<0) return entry.type;
    }
    return entries[entries.length-1]?.type||"battle";
  }
  function applyMapEntryTraits(nodes){
    const list=Array.isArray(nodes)?nodes:[];
    const mimic=travelPartyIds().map(id=>roster[id]).find(c=>traitOf(c)?.effect?.type==="mapNodeToChest");
    if(!mimic) return list;
    const effect=traitOf(mimic).effect;
    const chance=Math.max(0,Math.min(1,Number(effect.chance)||Number(traitOf(mimic)?.chance)||0));
    if(Math.random()>=chance) return list;
    const allowed=new Set(Array.isArray(effect.candidateTypes)?effect.candidateTypes:["battle","event"]);
    const candidates=list.filter(n=>n && n.layer>0 && allowed.has(n.type));
    if(candidates.length) choose(candidates).type="chest";
    return list;
  }

  function weightedNode(layer,area="plains"){
    const battleMult=battleNodeWeightMultiplier();
    if(layer===1 && area!=="caveSide" && area!=="yodyRegion" && area!=="yodyMountain" && area!=="tilenoRegion" && area!=="tilenoWetland" && area!=="tilenoToxicWetland" && area!=="zelrenoForest" && area!=="zelrenoForestDeep" && area!=="granzelPlains" && area!=="runelCavern" && area!=="runelRegion" && area!=="runelRuins") return weightedChoice([{type:"battle",weight:3*battleMult},{type:"chest",weight:1}]);
    const base=area==="tilenoToxicWetland"
      ? {battle:55,chest:18,heal:8,event:16,shop:3}
      : area==="zelrenoForestDeep"
      ? {battle:54,chest:18,heal:10,event:15,shop:3}
      : area==="granzelPlains"
      ? {battle:52,chest:18,heal:10,event:15,shop:5}
      : area==="runelCavern"
      ? {battle:53,chest:18,heal:10,event:16,shop:3}
      : area==="runelRegion"
      ? {battle:52,chest:18,heal:11,event:16,shop:3}
      : area==="runelRuins"
      ? {battle:54,chest:18,heal:9,event:16,shop:3}
      : (area==="cave" || area==="caveSide" || area==="yodyMountain" || area==="zelrenoForest")
        ? {battle:52,chest:18,heal:12,event:15,shop:3}
        : {battle:48,chest:18,heal:12,event:16,shop:6};
    return weightedChoice(Object.entries(base).map(([type,weight])=>({type,weight:type==="battle"?weight*battleMult:weight})));
  }

  const CAVE_SIDE_NORMAL_LAYERS=12;
  const CAVE_SIDE_GOAL_LAYER=13;
  const CAVE_SIDE_VIEW_HEIGHT=1420;
  function caveSideLayerY(layer){ return 1360-layer*100; }

  const FOOTPATH_NORMAL_LAYERS=12;
  const FOOTPATH_GOAL_LAYER=13;
  const FOOTPATH_VIEW_HEIGHT=1420;
  function footpathLayerY(layer){ return 1360-layer*100; }

  const YODY_MOUNTAIN_BOSS_LAYER=12;
  const YODY_MOUNTAIN_EXIT_LAYER=18;
  const YODY_MOUNTAIN_VIEW_HEIGHT=2000;
  function yodyMountainLayerY(layer){ return 1940-layer*100; }
  function yodyMountainLayerCount(){
    const r=Math.random();
    return r<.18?1:r<.82?2:3;
  }

  const YODY_NORMAL_LAYERS=8;
  const YODY_GOAL_LAYER=9;
  const YODY_VIEW_WIDTH=1320;
  const YODY_VIEW_HEIGHT=1040;
  // Leave a real top margin for the fixed area/legend HUD, while keeping the broad branching shape.
  function yodyLayerY(layer){ return 930-layer*88; }
  function connectMapLayers(layers,{extraChance=.45,maxExtraDistance=390}={}){
    for(let l=0;l<layers.length-1;l++){
      const prev=layers[l],next=layers[l+1];
      prev.forEach(p=>p.out=[]);
      next.forEach(n=>{
        const nearest=[...prev].sort((a,b)=>Math.abs(a.x-n.x)-Math.abs(b.x-n.x))[0];
        if(nearest&&!nearest.out.includes(n.id)) nearest.out.push(n.id);
      });
      prev.forEach(p=>{
        if(p.out.length===0){
          const nearest=[...next].sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
          if(nearest)p.out.push(nearest.id);
        }
        if(Math.random()<extraChance && next.length>1){
          const sorted=[...next].sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
          const candidate=sorted[1];
          if(candidate && Math.abs(candidate.x-p.x)<maxExtraDistance && !p.out.includes(candidate.id)) p.out.push(candidate.id);
        }
      });
    }
  }
  function buildYodyRegionMap(entryMode="fromSideCave"){
    const layers=[];
    const startType=entryMode==="fromYordy"?"yodyStart":"start";
    layers.push([{id:"L0N0",layer:0,index:0,x:660,y:yodyLayerY(0),type:startType,out:[]}]);
    for(let l=1;l<=YODY_NORMAL_LAYERS;l++){
      const count=3+rand(2);
      const xs=count===3?[260,660,1060]:[150,490,830,1170];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:yodyLayerY(l),
        type:weightedNode(l,"yodyRegion"),out:[]
      })));
    }
    if(entryMode==="fromYordy"){
      layers.push([
        {id:"YODY_MOUNTAIN",layer:YODY_GOAL_LAYER,index:0,x:350,y:yodyLayerY(YODY_GOAL_LAYER),type:"yodyMountain",out:[]},
        {id:"YODY_FOOTPATH",layer:YODY_GOAL_LAYER,index:1,x:970,y:yodyLayerY(YODY_GOAL_LAYER),type:"yodyFootpath",out:[]}
      ]);
    }else{
      layers.push([{id:"YODY_PORT",layer:YODY_GOAL_LAYER,index:0,x:660,y:yodyLayerY(YODY_GOAL_LAYER),type:"yodyPort",out:[]}]);
    }
    connectMapLayers(layers,{extraChance:.58,maxExtraDistance:560});
    return layers.flat();
  }

  const TILENO_NORMAL_LAYERS=8;
  const TILENO_GOAL_LAYER=9;
  const TILENO_SHORT_NORMAL_LAYERS=5;
  const TILENO_SHORT_GOAL_LAYER=6;
  const TILENO_WETLAND_BRANCH_LAYER=6;

  function buildTilenoRegionMap(entryMode="fromWorld"){
    const shortRoute=entryMode==="fromMountain";
    const normalLayers=shortRoute?TILENO_SHORT_NORMAL_LAYERS:TILENO_NORMAL_LAYERS;
    const goalLayer=shortRoute?TILENO_SHORT_GOAL_LAYER:TILENO_GOAL_LAYER;
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:660,y:yodyLayerY(0),type:shortRoute?"tilenoMountainStart":"start",out:[]}]);
    for(let l=1;l<=normalLayers;l++){
      const count=3+rand(2);
      const xs=count===3?[260,660,1060]:[150,490,830,1170];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:yodyLayerY(l),
        type:weightedNode(l,"tilenoRegion"),out:[]
      })));
    }
    layers.push([{
      id:shortRoute?"TILENO_TOWN":"ZELRENO_FOREST",layer:goalLayer,index:0,x:660,y:yodyLayerY(goalLayer),
      type:shortRoute?"tilenoTown":"zelrenoForest",out:[]
    }]);
    connectMapLayers(layers,{extraChance:.58,maxExtraDistance:560});
    const flat=layers.flat();
    if(!shortRoute){
      const branch={id:"TILENO_WETLAND",layer:TILENO_WETLAND_BRANCH_LAYER,index:99,x:95,y:yodyLayerY(TILENO_WETLAND_BRANCH_LAYER),type:"tilenoWetland",out:[]};
      const sources=layers[TILENO_WETLAND_BRANCH_LAYER-1]||[];
      const nearest=[...sources].sort((a,b)=>a.x-b.x).slice(0,2);
      nearest.forEach(src=>{if(!src.out.includes(branch.id))src.out.push(branch.id);});
      flat.push(branch);
    }
    return flat;
  }

  const TILENO_WETLAND_NORMAL_LAYERS=6;
  const TILENO_WETLAND_GOAL_LAYER=7;
  const TILENO_WETLAND_VIEW_WIDTH=1320;
  const TILENO_WETLAND_VIEW_HEIGHT=760;
  function tilenoWetlandLayerY(layer){ return 690-layer*88; }
  function tilenoWetlandLayerCount(){ return Math.random()<.60?3:4; }
  function buildTilenoWetlandMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:660,y:tilenoWetlandLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=TILENO_WETLAND_NORMAL_LAYERS;l++){
      const count=tilenoWetlandLayerCount();
      const xs=count===3?[260,660,1060]:[150,490,830,1170];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:tilenoWetlandLayerY(l),
        type:weightedNode(l,"tilenoWetland"),out:[]
      })));
    }
    layers.push([{id:"TILENO_TOXIC_WETLAND",layer:TILENO_WETLAND_GOAL_LAYER,index:0,x:660,y:tilenoWetlandLayerY(TILENO_WETLAND_GOAL_LAYER),type:"tilenoToxicWetland",out:[]}]);
    connectMapLayers(layers,{extraChance:.58,maxExtraDistance:560});
    return layers.flat();
  }

  const TILENO_TOXIC_NORMAL_LAYERS=10;
  const TILENO_TOXIC_GATE_LAYER=11;
  const TILENO_TOXIC_BOSS_LAYER=12;
  const TILENO_TOXIC_VIEW_WIDTH=1200;
  const TILENO_TOXIC_VIEW_HEIGHT=1300;
  function tilenoToxicLayerY(layer){ return 1230-layer*95; }
  function tilenoToxicLayerCount(){
    const r=Math.random();
    return r<.20?2:r<.80?3:4;
  }
  function buildTilenoToxicWetlandMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:600,y:tilenoToxicLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=TILENO_TOXIC_NORMAL_LAYERS;l++){
      const count=tilenoToxicLayerCount();
      const xs=count===2?[390,810]:count===3?[220,600,980]:[130,440,760,1070];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(41)-20),y:tilenoToxicLayerY(l),
        type:weightedNode(l,"tilenoToxicWetland"),out:[]
      })));
    }
    layers.push([{id:"TILENO_TOXIC_GATE",layer:TILENO_TOXIC_GATE_LAYER,index:0,x:600,y:tilenoToxicLayerY(TILENO_TOXIC_GATE_LAYER),type:"toxicGate",out:[]}]);
    layers.push([{id:"TILENO_TOXIC_BOSS",layer:TILENO_TOXIC_BOSS_LAYER,index:0,x:600,y:tilenoToxicLayerY(TILENO_TOXIC_BOSS_LAYER),type:"toxicBoss",out:[]}]);
    connectMapLayers(layers,{extraChance:.42,maxExtraDistance:480});
    return layers.flat();
  }

  const ZELRENO_FOREST_NORMAL_LAYERS=14;
  const ZELRENO_FOREST_GOAL_LAYER=15;
  const ZELRENO_FOREST_BRANCH_LAYER=8;
  const ZELRENO_FOREST_VIEW_HEIGHT=1620;
  function zelrenoForestLayerY(layer){ return 1560-layer*100; }
  function zelrenoForestLayerCount(){
    const r=Math.random();
    return r<.10?1:r<.70?2:3;
  }
  function buildZelrenoForestMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:500,y:zelrenoForestLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=ZELRENO_FOREST_NORMAL_LAYERS;l++){
      const count=zelrenoForestLayerCount();
      const xs=count===1?[500]:count===2?[390,610]:[300,500,700];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(count===1?0:rand(35)-17),y:zelrenoForestLayerY(l),
        type:weightedNode(l,"zelrenoForest"),out:[]
      })));
    }
    layers.push([{id:"GRANZEL_PLAINS",layer:ZELRENO_FOREST_GOAL_LAYER,index:0,x:500,y:zelrenoForestLayerY(ZELRENO_FOREST_GOAL_LAYER),type:"granzelPlains",out:[]}]);
    connectMapLayers(layers,{extraChance:.34,maxExtraDistance:330});
    const flat=layers.flat();
    const branch={id:"ZELRENO_BLOCKED_BRANCH",layer:ZELRENO_FOREST_BRANCH_LAYER,index:99,x:900,y:zelrenoForestLayerY(ZELRENO_FOREST_BRANCH_LAYER),type:"forestBlockedPath",out:[]};
    const sources=layers[ZELRENO_FOREST_BRANCH_LAYER-1]||[];
    [...sources].sort((a,b)=>b.x-a.x).slice(0,2).forEach(src=>{if(!src.out.includes(branch.id))src.out.push(branch.id);});
    flat.push(branch);
    return flat;
  }

  const ZELRENO_FOREST_DEEP_NORMAL_LAYERS=8;
  const ZELRENO_FOREST_DEEP_BOSS_LAYER=9;
  const ZELRENO_FOREST_DEEP_VIEW_HEIGHT=1020;
  function zelrenoForestDeepLayerY(layer){ return 960-layer*100; }
  function zelrenoForestDeepLayerCount(){ return Math.random()<.35?1:2; }
  function buildZelrenoForestDeepMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:500,y:zelrenoForestDeepLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=ZELRENO_FOREST_DEEP_NORMAL_LAYERS;l++){
      const count=zelrenoForestDeepLayerCount();
      const xs=count===1?[500]:[360,640];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(count===1?0:rand(31)-15),y:zelrenoForestDeepLayerY(l),
        type:weightedNode(l,"zelrenoForestDeep"),out:[]
      })));
    }
    layers.push([{id:"ZELRENO_FOREST_DEEP_BOSS",layer:ZELRENO_FOREST_DEEP_BOSS_LAYER,index:0,x:500,y:zelrenoForestDeepLayerY(ZELRENO_FOREST_DEEP_BOSS_LAYER),type:"forestDeepBoss",out:[]}]);
    connectMapLayers(layers,{extraChance:.28,maxExtraDistance:320});
    return layers.flat();
  }

  const GRANZEL_PLAINS_NORMAL_LAYERS=13;
  const GRANZEL_PLAINS_GOAL_LAYER=14;
  const GRANZEL_PLAINS_SHORT_NORMAL_LAYERS=6;
  const GRANZEL_PLAINS_SHORT_GOAL_LAYER=7;
  const GRANZEL_PLAINS_VIEW_WIDTH=1500;
  const GRANZEL_PLAINS_VIEW_HEIGHT=1600;
  function granzelPlainsLayerY(layer){ return 1540-layer*100; }
  function granzelPlainsLayerCount(){
    const r=Math.random();
    return r<.15?2:r<.50?3:r<.90?4:5;
  }
  function granzelPlainsXs(count){
    if(count===2) return [500,1000];
    if(count===3) return [300,750,1200];
    if(count===4) return [180,560,940,1320];
    return [150,450,750,1050,1350];
  }
  function buildGranzelPlainsMap(entryMode="fromWorld"){
    const shortRoute=entryMode==="fromForest";
    const normalLayers=shortRoute?GRANZEL_PLAINS_SHORT_NORMAL_LAYERS:GRANZEL_PLAINS_NORMAL_LAYERS;
    const goalLayer=shortRoute?GRANZEL_PLAINS_SHORT_GOAL_LAYER:GRANZEL_PLAINS_GOAL_LAYER;
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:750,y:granzelPlainsLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=normalLayers;l++){
      const count=granzelPlainsLayerCount();
      const xs=granzelPlainsXs(count);
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:granzelPlainsLayerY(l),
        type:weightedNode(l,"granzelPlains"),out:[]
      })));
    }
    if(shortRoute){
      layers.push([{id:"GRANZEL_TOWN",layer:goalLayer,index:0,x:750,y:granzelPlainsLayerY(goalLayer),type:"granzelTown",out:[]}]);
    }else{
      const goals=[
        {id:"ICE_CORRIDOR",layer:goalLayer,index:0,x:420,y:granzelPlainsLayerY(goalLayer)-18,type:"iceCorridor",out:[]},
        {id:"RUNEL_CAVERN",layer:goalLayer,index:1,x:1080,y:granzelPlainsLayerY(goalLayer)+18,type:"runelCavern",out:[]}
      ];
      layers.push(goals);
    }
    connectMapLayers(layers,{extraChance:.62,maxExtraDistance:720});
    return layers.flat();
  }

  const RUNEL_CAVERN_NORMAL_LAYERS=10;
  const RUNEL_CAVERN_EXIT_LAYER=11;
  const RUNEL_CAVERN_BORDER_LAYER=7;
  const RUNEL_CAVERN_VIEW_HEIGHT=1420;
  function runelCavernLayerY(layer){ return 1360-layer*110; }
  function runelCavernLayerCount(){
    const r=Math.random();
    return r<.15?1:r<.75?2:3;
  }
  function runelCavernXs(count){
    return count===1?[500]:count===2?[360,640]:[240,500,760];
  }
  function makeRunelMimicChestAvoidable(layers,node){
    const layer=node?.layer;
    if(!Number.isInteger(layer) || layer<=0 || !layers[layer] || layers[layer].length<2) return false;
    const alternatives=layers[layer].filter(n=>n.id!==node.id);
    const sources=layers[layer-1]||[];
    sources.filter(src=>(src.out||[]).includes(node.id)).forEach(src=>{
      if(src.out.length>1) return;
      const alt=[...alternatives].sort((a,b)=>Math.abs(a.x-src.x)-Math.abs(b.x-src.x))[0];
      if(alt && !src.out.includes(alt.id)) src.out.push(alt.id);
    });
    return sources.filter(src=>(src.out||[]).includes(node.id)).every(src=>src.out.some(id=>id!==node.id));
  }
  function buildRunelCavernMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:500,y:runelCavernLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=RUNEL_CAVERN_NORMAL_LAYERS;l++){
      const count=runelCavernLayerCount(),xs=runelCavernXs(count);
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(count===1?0:rand(35)-17),y:runelCavernLayerY(l),
        type:weightedNode(l,"runelCavern"),out:[]
      })));
    }
    layers.push([{id:"RUNEL_EXIT",layer:RUNEL_CAVERN_EXIT_LAYER,index:0,x:500,y:runelCavernLayerY(RUNEL_CAVERN_EXIT_LAYER),type:"runelExit",out:[]}]);
    connectMapLayers(layers,{extraChance:.38,maxExtraDistance:390});

    // A fixed detour toward the Restia border branches left around the seventh stage.
    const border={id:"RESTIA_BORDER",layer:RUNEL_CAVERN_BORDER_LAYER,index:99,x:90,y:runelCavernLayerY(RUNEL_CAVERN_BORDER_LAYER)+18,type:"restiaBorder",out:[]};
    const branchSources=layers[RUNEL_CAVERN_BORDER_LAYER-1]||[];
    [...branchSources].sort((a,b)=>a.x-b.x).slice(0,Math.min(2,branchSources.length)).forEach(src=>{if(!src.out.includes(border.id))src.out.push(border.id);});

    // Only naturally generated, avoidable chests can become visible black Mimic chests.
    const naturalChestCandidates=layers.slice(1,RUNEL_CAVERN_NORMAL_LAYERS+1).flat().filter(n=>n.type==="chest" && (layers[n.layer]?.length||0)>1);
    naturalChestCandidates.forEach(n=>{
      if(Math.random()<.10 && makeRunelMimicChestAvoidable(layers,n)) n.type="mimicChest";
    });
    return [...layers.flat(),border];
  }

  const RUNEL_REGION_NORMAL_LAYERS=18;
  const RUNEL_REGION_GOAL_LAYER=19;
  const RUNEL_REGION_VIEW_WIDTH=1500;
  const RUNEL_REGION_VIEW_HEIGHT=2100;
  function runelRegionLayerY(layer){ return 2040-layer*105; }
  function runelRegionLayerCount(){
    const r=Math.random();
    return r<.25?2:r<.70?3:r<.95?4:5;
  }
  function runelRegionXs(count){
    if(count===2) return [500,1000];
    if(count===3) return [300,750,1200];
    if(count===4) return [180,560,940,1320];
    return [150,450,750,1050,1350];
  }
  const RUNEL_REGION_WORLD_NORMAL_LAYERS=8;
  const RUNEL_REGION_WORLD_GOAL_LAYER=9;
  const RUNEL_REGION_WORLD_VIEW_HEIGHT=1120;
  function runelRegionWorldLayerY(layer){ return 1070-layer*105; }
  function runelRegionWorldLayerCount(){
    const r=Math.random();
    return r<.30?2:r<.80?3:4;
  }
  function runelRegionWorldXs(count){
    if(count===2) return [500,1000];
    if(count===3) return [300,750,1200];
    return [180,560,940,1320];
  }
  function buildRunelRegionWorldMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:750,y:runelRegionWorldLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=RUNEL_REGION_WORLD_NORMAL_LAYERS;l++){
      const count=runelRegionWorldLayerCount(),xs=runelRegionWorldXs(count);
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:runelRegionWorldLayerY(l),
        type:weightedNode(l,"runelRegion"),out:[]
      })));
    }
    layers.push([{id:"RUNEL_RUINS",layer:RUNEL_REGION_WORLD_GOAL_LAYER,index:0,x:750,y:runelRegionWorldLayerY(RUNEL_REGION_WORLD_GOAL_LAYER),type:"runelRuins",out:[]}]);
    connectMapLayers(layers,{extraChance:.52,maxExtraDistance:650});

    // A fixed left-hand detour branches near stage 2 toward the inaccessible fairy forest.
    const fairy={id:"FAIRY_GROVE",layer:2,index:99,x:95,y:runelRegionWorldLayerY(2)+12,type:"fairyGrove",out:[]};
    const branchSources=layers[1]||[];
    const source=[...branchSources].sort((a,b)=>a.x-b.x)[0];
    if(source && !source.out.includes(fairy.id)) source.out.push(fairy.id);
    return [...layers.flat(),fairy];
  }
  function buildRunelRegionMap(entryMode="fromKunputei"){
    if(entryMode==="fromWorld") return buildRunelRegionWorldMap();
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:750,y:runelRegionLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=RUNEL_REGION_NORMAL_LAYERS;l++){
      const count=runelRegionLayerCount(),xs=runelRegionXs(count);
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:runelRegionLayerY(l),
        type:weightedNode(l,"runelRegion"),out:[]
      })));
    }
    layers.push([{id:"RUNEL_TOWN",layer:RUNEL_REGION_GOAL_LAYER,index:0,x:750,y:runelRegionLayerY(RUNEL_REGION_GOAL_LAYER),type:"runelTown",out:[]}]);
    connectMapLayers(layers,{extraChance:.58,maxExtraDistance:680});
    return layers.flat();
  }

  const RUNEL_RUINS_NORMAL_LAYERS=14;
  const RUNEL_RUINS_BOSS_LAYER=15;
  const RUNEL_RUINS_VIEW_WIDTH=1500;
  const RUNEL_RUINS_VIEW_HEIGHT=1720;
  function runelRuinsLayerY(layer){ return 1660-layer*100; }
  function runelRuinsLayerCount(){
    const r=Math.random();
    return r<.25?2:r<.75?3:4;
  }
  function runelRuinsXs(count){
    if(count===2) return [500,1000];
    if(count===3) return [300,750,1200];
    return [180,560,940,1320];
  }
  function buildRunelRuinsMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:750,y:runelRuinsLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<=RUNEL_RUINS_NORMAL_LAYERS;l++){
      const count=runelRuinsLayerCount(),xs=runelRuinsXs(count);
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(51)-25),y:runelRuinsLayerY(l),
        type:weightedNode(l,"runelRuins"),out:[]
      })));
    }
    layers.push([{id:"RUNEL_RUINS_BOSS",layer:RUNEL_RUINS_BOSS_LAYER,index:0,x:750,y:runelRuinsLayerY(RUNEL_RUINS_BOSS_LAYER),type:"runelRuinsBoss",out:[]}]);
    connectMapLayers(layers,{extraChance:.50,maxExtraDistance:650});
    // Only naturally generated, avoidable treasure chests can become Mimics.
    layers.slice(1,RUNEL_RUINS_NORMAL_LAYERS+1).flat().filter(n=>n.type==="chest").forEach(n=>{
      if(Math.random()<.10 && makeRunelMimicChestAvoidable(layers,n)) n.type="mimicChest";
    });
    return layers.flat();
  }

  function buildYodyMountainMap(){
    const layers=[];
    layers.push([{id:"L0N0",layer:0,index:0,x:500,y:yodyMountainLayerY(0),type:"start",out:[]}]);
    for(let l=1;l<YODY_MOUNTAIN_EXIT_LAYER;l++){
      if(l===YODY_MOUNTAIN_BOSS_LAYER){
        layers.push([{id:"YODY_MOUNTAIN_BOSS",layer:l,index:0,x:500,y:yodyMountainLayerY(l),type:"mountainBoss",out:[]}]);
        continue;
      }
      const count=yodyMountainLayerCount();
      const xs=count===1?[500]:count===2?[405,595]:[325,500,675];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(count===1?0:rand(31)-15),y:yodyMountainLayerY(l),
        type:weightedNode(l,"yodyMountain"),out:[]
      })));
    }
    layers.push([{id:"TILENO_EXIT",layer:YODY_MOUNTAIN_EXIT_LAYER,index:0,x:500,y:yodyMountainLayerY(YODY_MOUNTAIN_EXIT_LAYER),type:"tilenoExit",out:[]}]);
    connectMapLayers(layers,{extraChance:.28,maxExtraDistance:285});
    return layers.flat();
  }

  function buildMap(area="plains",caveLayer=1,options={}){
    if(area==="yodyRegion") return buildYodyRegionMap(options.entryMode||"fromSideCave");
    if(area==="yodyMountain") return buildYodyMountainMap();
    if(area==="tilenoRegion") return buildTilenoRegionMap(options.entryMode||"fromWorld");
    if(area==="tilenoWetland") return buildTilenoWetlandMap();
    if(area==="tilenoToxicWetland") return buildTilenoToxicWetlandMap();
    if(area==="zelrenoForest") return buildZelrenoForestMap();
    if(area==="zelrenoForestDeep") return buildZelrenoForestDeepMap();
    if(area==="granzelPlains") return buildGranzelPlainsMap(options.entryMode||"fromWorld");
    if(area==="runelCavern") return buildRunelCavernMap();
    if(area==="runelRegion") return buildRunelRegionMap(options.entryMode||"fromKunputei");
    if(area==="runelRuins") return buildRunelRuinsMap();
    const layers=[];
    const isCaveSide=area==="caveSide";
    const isFootpath=area==="footpath";
    const normalLayerCount=isCaveSide?CAVE_SIDE_NORMAL_LAYERS:isFootpath?FOOTPATH_NORMAL_LAYERS:5;
    const goalLayer=isCaveSide?CAVE_SIDE_GOAL_LAYER:isFootpath?FOOTPATH_GOAL_LAYER:6;
    const yPositions=[655,555,455,355,255,155,65];
    const yForLayer=isCaveSide ? caveSideLayerY : isFootpath ? footpathLayerY : (layer=>yPositions[layer]);
    layers.push([{id:"L0N0",layer:0,index:0,x:500,y:yForLayer(0),type:"start",out:[]}]);
    for(let l=1;l<=normalLayerCount;l++){
      const count=2+rand(2);
      const xs=count===2?[350,650]:[245,500,755];
      layers.push(xs.map((x,i)=>({
        id:`L${l}N${i}`,layer:l,index:i,x:x+(rand(41)-20),y:yForLayer(l),
        type:weightedNode(l,area),out:[]
      })));
    }
    if(isCaveSide){
      const layer7=layers[7];
      if(layer7?.length){
        const guaranteed=choose(layer7);
        guaranteed.type="heal";
        guaranteed.guaranteedMidHeal=true;
      }
    }else if(area==="cave"){
      const normalNodes=layers.slice(1).flat();
      if(!normalNodes.some(n=>n.type==="chest")) choose(normalNodes).type="chest";
    }
    if(area==="plains" && prologueStage()===2){
      const normalNodes=layers.slice(1).flat();
      if(!normalNodes.some(n=>n.type==="battle")) choose(normalNodes).type="battle";
    }
    if(area==="plains" && prologueStage()>=4 && !recruitTutorialDone()){
      layers[1].forEach(n=>n.type="battle");
    }
    const goalType=isFootpath?"healLeafGoal":(!isCaveSide && area==="cave"&&caveLayer===1?"stairs":"goal");
    layers.push([{id:`L${goalLayer}N0`,layer:goalLayer,index:0,x:500,y:yForLayer(goalLayer),type:goalType,out:[]}]);

    for(let l=0;l<layers.length-1;l++){
      const prev=layers[l],next=layers[l+1];
      prev.forEach(p=>p.out=[]);
      next.forEach(n=>{
        const nearest=[...prev].sort((a,b)=>Math.abs(a.x-n.x)-Math.abs(b.x-n.x))[0];
        if(!nearest.out.includes(n.id)) nearest.out.push(n.id);
      });
      prev.forEach(p=>{
        if(p.out.length===0){
          const nearest=[...next].sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
          p.out.push(nearest.id);
        }
        if(Math.random()<.45 && next.length>1){
          const sorted=[...next].sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
          const candidate=sorted[1];
          if(candidate && Math.abs(candidate.x-p.x)<390 && !p.out.includes(candidate.id)) p.out.push(candidate.id);
        }
      });
    }
    if(isCaveSide){
      const heal=layers[7]?.find(n=>n.guaranteedMidHeal);
      if(heal){
        layers[6].forEach(p=>{if(!p.out.includes(heal.id)) p.out.push(heal.id);});
      }
    }

    const flat=layers.flat();
    if(area==="cave"&&caveLayer===2){
      const third=layers[3];
      const source=[...third].sort((a,b)=>b.x-a.x)[0];
      const side={id:"CAVE_SIDE",layer:3,index:99,x:910,y:yPositions[3],type:"sidepath",out:[]};
      if(source&&!source.out.includes(side.id)) source.out.push(side.id);
      flat.push(side);
    }
    return flat;
  }

  function currentRunAreaUi(){
    if(!state.run) return {icon:"🌿",name:"ミレスタ平原"};
    if(state.run.area==="cave") return {icon:"🕳️",name:`小さな洞窟・第${state.run.caveLayer===1?"一":"二"}層`};
    if(state.run.area==="caveSide") return {icon:"🕳️",name:"洞窟の横道"};
    if(state.run.area==="yodyRegion") return {icon:"🌊",name:"ヨーディー地方"};
    if(state.run.area==="footpath") return {icon:"🌲",name:"麓の小道"};
    if(state.run.area==="yodyMountain") return {icon:"⛰️",name:"ヨーディー山道"};
    if(state.run.area==="tilenoRegion") return {icon:"🌿",name:"ティレーノ地方"};
    if(state.run.area==="tilenoWetland") return {icon:"🌾",name:"ティレーノ湿原"};
    if(state.run.area==="tilenoToxicWetland") return {icon:"☠️",name:"ティレーノ毒湿地"};
    if(state.run.area==="zelrenoForest") return {icon:"🌲",name:"ゼルレーノ森林地帯"};
    if(state.run.area==="zelrenoForestDeep") return {icon:"🌲",name:"ゼルレーノ森林地帯・奥地"};
    if(state.run.area==="granzelPlains") return {icon:"🌾",name:"グランゼル大平原"};
    if(state.run.area==="runelCavern") return {icon:"🪨",name:"ルネル岩窟"};
    if(state.run.area==="runelRegion") return {icon:"🌿",name:"ルネル地方"};
    if(state.run.area==="runelRuins") return {icon:"🏚️",name:"ルネルパリオ城下町跡"};
    if(state.run.area==="salidDesert") return {icon:"🏜️",name:"サリード砂漠"};
    return {icon:"🌿",name:"ミレスタ平原"};
  }
  function setExploreAreaLabel(){
    if(!state.run) return;
    const ui=currentRunAreaUi();
    $("exploreAreaLabel").textContent=`${ui.icon} ${ui.name}`;
    updateExploreTreasureCounter();
    if($("topTitle")) $("topTitle").textContent=ui.name;
    if($("topSubtitle")) $("topSubtitle").textContent=`探索 ${DEV_VERSION}`;
  }

  function resetRunMapLocalState(){
    if(!state.run) return;
    state.run.current="L0N0";
    state.run.previous=null;
    state.run.visited=new Set(["L0N0"]);
    state.run.resolved=new Set();
    state.run.toxicGateCleared=false;
    state.run.stealthUsed=false;
    state.run.slugTrapActive=false;
    state.run.ruinsCursePending=false;
  }

  function startRun(area=state.selectedArea||"plains"){
    restorePartyFull();
    const cave=area==="cave",yody=area==="yodyRegion",footpath=area==="footpath",mountain=area==="yodyMountain",tileno=area==="tilenoRegion",wetland=area==="tilenoWetland",toxic=area==="tilenoToxicWetland",forest=area==="zelrenoForest",granzel=area==="granzelPlains",runel=area==="runelCavern",runelRegion=area==="runelRegion",runelRuins=area==="runelRuins";
    const runArea=cave?"cave":yody?"yodyRegion":footpath?"footpath":mountain?"yodyMountain":tileno?"tilenoRegion":wetland?"tilenoWetland":toxic?"tilenoToxicWetland":forest?"zelrenoForest":granzel?"granzelPlains":runel?"runelCavern":runelRegion?"runelRegion":runelRuins?"runelRuins":"plains";
    const entryMode=yody?"fromYordy":tileno?"fromWorld":granzel?"fromWorld":runelRegion?"fromWorld":null;
    state.run={
      area:runArea,
      caveLayer:cave?1:0,entryMode,
      nodes:applyMapEntryTraits(buildMap(runArea,cave?1:0,{entryMode})),
      current:"L0N0",previous:null,
      visited:new Set(["L0N0"]),runGold:0,runExp:0,resolved:new Set(),stealthUsed:false,slugTrapActive:false,
      mountainBossDefeated:mountain?!!state.eventFlags?.yodyMountainBossDefeated:false,
      toxicGateCleared:false,ruinsCursePending:false
    };
    setExploreAreaLabel();
    showScreen("exploreScreen"); renderMap(); updateRunHud();
    if(yody || mountain || tileno || wetland || toxic || forest || granzel || runel || runelRegion || runelRuins) requestAnimationFrame(()=>scrollMapToCurrent(true));
  }

  function enterCaveLayer(layer){
    if(!state.run || state.run.area!=="cave") return;
    state.run.caveLayer=layer;
    state.run.nodes=applyMapEntryTraits(buildMap("cave",layer));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
  }

  // v0.34b: continue the same expedition directly from the plains goal into the cave.
  // Party HP/MP, inventory and accumulated run rewards are preserved; map-local state resets.
  function enterCaveFromPlains(){
    if(!state.run) return;
    state.run.area="cave";
    state.run.caveLayer=1;
    state.run.nodes=applyMapEntryTraits(buildMap("cave",1));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
    toast("小さな洞窟・第一層へ進んだ");
  }

  function enterCaveSidepath(){
    if(!state.run) return;
    state.run.area="caveSide";
    state.run.caveLayer=0;
    state.run.entryMode=null;
    state.run.nodes=applyMapEntryTraits(buildMap("caveSide",0));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("洞窟の横道へ進んだ");
  }

  function enterYodyRegionFromSideCave(){
    if(!state.run) return;
    state.run.area="yodyRegion";
    state.run.caveLayer=0;
    state.run.entryMode="fromSideCave";
    state.run.nodes=applyMapEntryTraits(buildMap("yodyRegion",0,{entryMode:"fromSideCave"}));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ヨーディー地方へ進んだ");
  }

  function enterFootpathFromYodyRegion(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.yodyFootpathUnlocked=true;
    state.run.area="footpath";
    state.run.caveLayer=0;
    state.run.entryMode="fromYodyRegion";
    state.run.nodes=applyMapEntryTraits(buildMap("footpath",0));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("麓の小道へ進んだ");
  }

  function enterYodyMountainFromYodyRegion(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.yodyMountainUnlocked=true;
    state.run.area="yodyMountain";
    state.run.caveLayer=0;
    state.run.entryMode="fromYodyRegion";
    state.run.mountainBossDefeated=!!state.eventFlags.yodyMountainBossDefeated;
    state.run.nodes=applyMapEntryTraits(buildMap("yodyMountain",0));
    resetRunMapLocalState();
    setExploreAreaLabel(); renderMap(); updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ヨーディー山道へ進んだ");
  }

  function enterTilenoRegionFromYodyMountain(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.yodyMountainCleared=true;
    state.eventFlags.tilenoRegionReached=true;
    state.run.area="tilenoRegion";
    state.run.caveLayer=0;
    state.run.entryMode="fromMountain";
    state.run.nodes=applyMapEntryTraits(buildMap("tilenoRegion",0,{entryMode:"fromMountain"}));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ティレーノ地方へ進んだ");
  }

  function enterTilenoWetlandFromTilenoRegion(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.tilenoWetlandReached=true;
    state.run.area="tilenoWetland";
    state.run.caveLayer=0;
    state.run.entryMode="fromTilenoRegion";
    state.run.nodes=applyMapEntryTraits(buildMap("tilenoWetland",0));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ティレーノ湿原へ進んだ");
  }

  function enterTilenoToxicWetlandFromWetland(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.tilenoToxicWetlandReached=true;
    state.run.area="tilenoToxicWetland";
    state.run.caveLayer=0;
    state.run.entryMode="fromWetland";
    state.run.nodes=applyMapEntryTraits(buildMap("tilenoToxicWetland",0));
    resetRunMapLocalState();
    state.run.toxicGateCleared=false;
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ティレーノ毒湿地へ進んだ");
  }

  function enterZelrenoForestFromTilenoRegion(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.zelrenoForestReached=true;
    state.run.area="zelrenoForest";
    state.run.caveLayer=0;
    state.run.entryMode="fromTilenoRegion";
    state.run.pendingForestSilence=false;
    state.run.nodes=applyMapEntryTraits(buildMap("zelrenoForest",0));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ゼルレーノ森林地帯へ進んだ");
  }

  function enterZelrenoForestDeepFromForest(){
    if(!state.run) return;
    state.run.area="zelrenoForestDeep";
    state.run.caveLayer=0;
    state.run.entryMode="fromForestBranch";
    state.run.pendingForestSilence=false;
    state.run.nodes=applyMapEntryTraits(buildMap("zelrenoForestDeep",0));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ゼルレーノ森林地帯・奥地へ進んだ");
  }

  function enterGranzelPlainsFromZelrenoForest(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.granzelPlainsReached=true;
    state.run.area="granzelPlains";
    state.run.caveLayer=0;
    state.run.entryMode="fromForest";
    state.run.wagonRideActive=false;
    state.run.nodes=applyMapEntryTraits(buildMap("granzelPlains",0,{entryMode:"fromForest"}));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("グランゼル大平原へ進んだ");
  }

  function enterKunputeiFromRunelCavern(){
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.kunputeiReached=true;
    state.currentTown="kunputei";
    state.selectedArea="runelCavern";
    state.run=null;
    state.battleSpecial=null;
    state.battleEscapeDisabled=false;
    clearBattleEndStates();
    updateWorld();
    showTownScreen("kunputei");
    toast("薫風亭に到着しました");
  }

  function enterRunelRegionFromKunputei(){
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.runelRegionReached=true;
    state.run={
      area:"runelRegion",caveLayer:0,entryMode:"fromKunputei",
      nodes:applyMapEntryTraits(buildMap("runelRegion",0,{entryMode:"fromKunputei"})),
      current:"L0N0",previous:null,visited:new Set(["L0N0"]),runGold:0,runExp:0,resolved:new Set(),
      stealthUsed:false,slugTrapActive:false,toxicGateCleared:false,wagonRideActive:false
    };
    setExploreAreaLabel();
    showScreen("exploreScreen");renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ルネル地方へ出発した");
  }

  function enterRunelRuinsFromRunelRegion(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.runelRuinsReached=true;
    state.run.area="runelRuins";
    state.run.caveLayer=0;
    state.run.entryMode="fromRunelRegion";
    state.run.wagonRideActive=false;
    state.run.ruinsCursePending=false;
    state.run.nodes=applyMapEntryTraits(buildMap("runelRuins",0));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ルネルパリオ城下町跡へ進んだ");
  }

  function enterRunelCavernFromGranzelPlains(){
    if(!state.run) return;
    if(!state.eventFlags) state.eventFlags={};
    state.eventFlags.runelCavernReached=true;
    state.run.area="runelCavern";
    state.run.caveLayer=0;
    state.run.entryMode="fromGranzelPlains";
    state.run.nodes=applyMapEntryTraits(buildMap("runelCavern",0));
    resetRunMapLocalState();
    setExploreAreaLabel();renderMap();updateRunHud();
    requestAnimationFrame(()=>scrollMapToCurrent(true));
    toast("ルネル岩窟へ進んだ");
  }

  function startSalidDesertPreview(){
    restorePartyFull();
    state.currentTown="yody";
    state.run={
      area:"salidDesert",caveLayer:0,entryMode:"fromYodyShip",
      nodes:[
        {id:"L0N0",layer:0,index:0,x:500,y:650,type:"start",out:["SALID_PREVIEW"]},
        {id:"SALID_PREVIEW",layer:1,index:0,x:500,y:170,type:"salidPreview",out:[]}
      ],
      current:"L0N0",previous:null,visited:new Set(["L0N0"]),runGold:0,runExp:0,resolved:new Set(),stealthUsed:false,slugTrapActive:false
    };
    setExploreAreaLabel();
    showScreen("exploreScreen");
    renderMap();
    updateRunHud();
    toast("サリード砂漠へ到着した");
  }

  function byId(id){ return state.run.nodes.find(n=>n.id===id); }
  function reachableIds(){
    const cur=byId(state.run.current);
    if(cur?.type==="mountainBoss" && !state.run?.mountainBossDefeated && !state.eventFlags?.yodyMountainBossDefeated) return new Set();
    if(cur?.type==="toxicGate" && !state.run?.toxicGateCleared) return new Set();
    if(["granzelPlains","runelRegion"].includes(state.run?.area) && state.run?.wagonRideActive && cur){
      return new Set(state.run.nodes.filter(n=>n.layer===cur.layer+1).map(n=>n.id));
    }
    return new Set(cur.out || []);
  }

  function svgEl(name,attrs={}){
    const e=document.createElementNS("http://www.w3.org/2000/svg",name);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    return e;
  }

  function renderMap(){
    const svg=$("mapSvg"),scroller=$("mapScroll");
    svg.innerHTML="";
    const run=state.run;
    const isMountain=run?.area==="yodyMountain";
    const isTileno=run?.area==="tilenoRegion";
    const isTilenoWetland=run?.area==="tilenoWetland";
    const isToxic=run?.area==="tilenoToxicWetland";
    const isForest=run?.area==="zelrenoForest";
    const isForestDeep=run?.area==="zelrenoForestDeep";
    const isGranzel=run?.area==="granzelPlains";
    const isRunel=run?.area==="runelCavern";
    const isRunelRegion=run?.area==="runelRegion";
    const isRunelRuins=run?.area==="runelRuins";
    const isRunelRegionShort=isRunelRegion && run?.entryMode==="fromWorld";
    const isLong=run?.area==="caveSide"||run?.area==="footpath"||isMountain||isForest||isForestDeep||isRunel,isFootpath=run?.area==="footpath",isYody=run?.area==="yodyRegion",isBroad=isYody||isTileno||isTilenoWetland||isGranzel||isRunelRegion||isRunelRuins;
    if(scroller){
      scroller.classList.toggle("long-map",isLong);
      scroller.classList.toggle("yody-map",isYody||isTileno||isTilenoWetland);
      scroller.classList.toggle("toxic-wetland-map",isToxic);
      scroller.classList.toggle("mountain-map",isMountain);
      scroller.classList.toggle("forest-map",isForest);
      scroller.classList.toggle("forest-deep-map",isForestDeep);
      scroller.classList.toggle("granzel-map",isGranzel);
      scroller.classList.toggle("runel-region-map",isRunelRegion);
      scroller.classList.toggle("runel-region-short",isRunelRegionShort);
      scroller.classList.toggle("runel-ruins-map",isRunelRuins);
    }
    const longHeight=isMountain?YODY_MOUNTAIN_VIEW_HEIGHT:isForest?ZELRENO_FOREST_VIEW_HEIGHT:isForestDeep?ZELRENO_FOREST_DEEP_VIEW_HEIGHT:isRunel?RUNEL_CAVERN_VIEW_HEIGHT:(isFootpath?FOOTPATH_VIEW_HEIGHT:CAVE_SIDE_VIEW_HEIGHT);
    svg.setAttribute("viewBox",isRunelRuins?`0 0 ${RUNEL_RUINS_VIEW_WIDTH} ${RUNEL_RUINS_VIEW_HEIGHT}`:isRunelRegion?`0 0 ${RUNEL_REGION_VIEW_WIDTH} ${isRunelRegionShort?RUNEL_REGION_WORLD_VIEW_HEIGHT:RUNEL_REGION_VIEW_HEIGHT}`:isGranzel?`0 0 ${GRANZEL_PLAINS_VIEW_WIDTH} ${GRANZEL_PLAINS_VIEW_HEIGHT}`:isToxic?`0 0 ${TILENO_TOXIC_VIEW_WIDTH} ${TILENO_TOXIC_VIEW_HEIGHT}`:isTilenoWetland?`0 0 ${TILENO_WETLAND_VIEW_WIDTH} ${TILENO_WETLAND_VIEW_HEIGHT}`:isLong?`0 0 1000 ${longHeight}`:isBroad?`0 0 ${YODY_VIEW_WIDTH} ${YODY_VIEW_HEIGHT}`:"0 0 1000 720");
    const reachable=reachableIds();

    // subtle floor / route separators
    const floorCount=isMountain?(YODY_MOUNTAIN_EXIT_LAYER-1):isForest?ZELRENO_FOREST_NORMAL_LAYERS:isForestDeep?ZELRENO_FOREST_DEEP_NORMAL_LAYERS:isRunelRuins?RUNEL_RUINS_NORMAL_LAYERS:isRunelRegion?(isRunelRegionShort?RUNEL_REGION_WORLD_NORMAL_LAYERS:RUNEL_REGION_NORMAL_LAYERS):isGranzel?(run.entryMode==="fromForest"?GRANZEL_PLAINS_SHORT_NORMAL_LAYERS:GRANZEL_PLAINS_NORMAL_LAYERS):isRunel?RUNEL_CAVERN_NORMAL_LAYERS:isToxic?TILENO_TOXIC_NORMAL_LAYERS:isTilenoWetland?TILENO_WETLAND_NORMAL_LAYERS:isLong?(isFootpath?FOOTPATH_NORMAL_LAYERS:CAVE_SIDE_NORMAL_LAYERS):isYody?YODY_NORMAL_LAYERS:isTileno?(run.entryMode==="fromMountain"?TILENO_SHORT_NORMAL_LAYERS:TILENO_NORMAL_LAYERS):5;
    for(let l=1;l<=floorCount;l++){
      const y=isMountain?yodyMountainLayerY(l):isForest?zelrenoForestLayerY(l):isForestDeep?zelrenoForestDeepLayerY(l):isRunelRuins?runelRuinsLayerY(l):isRunelRegion?(isRunelRegionShort?runelRegionWorldLayerY(l):runelRegionLayerY(l)):isGranzel?granzelPlainsLayerY(l):isRunel?runelCavernLayerY(l):isToxic?tilenoToxicLayerY(l):isTilenoWetland?tilenoWetlandLayerY(l):isLong?(isFootpath?footpathLayerY(l):caveSideLayerY(l)):isBroad?yodyLayerY(l):655-l*100;
      const line=svgEl("line",{x1:(isGranzel||isRunelRegion||isRunelRuins)?90:isBroad?90:isToxic?90:95,y1:y+45,x2:(isGranzel||isRunelRegion||isRunelRuins)?1410:isBroad?1230:isToxic?1110:930,y2:y+45,stroke:"#263b4c","stroke-width":"2","stroke-dasharray":"8 12"});
      svg.appendChild(line);
      if(!isBroad && !isMountain && !isToxic){
        const label=svgEl("text",{x:35,y:y+6,class:"floor-label"});
        label.textContent=`${l}F`;
        svg.appendChild(label);
      }
    }

    // edges
    run.nodes.forEach(n=>{
      (n.out||[]).forEach(tid=>{
        const t=byId(tid);
        const line=svgEl("line",{x1:n.x,y1:n.y,x2:t.x,y2:t.y,class:"edge"});
        if(n.id===run.current) line.classList.add("active");
        svg.appendChild(line);
      });
    });

    // nodes
    run.nodes.forEach(n=>{
      const g=svgEl("g",{class:"node"});
      const isVisited=run.visited.has(n.id);
      const isCurrent=run.current===n.id;
      const isReach=reachable.has(n.id);
      if(isVisited) g.classList.add("visited");
      if(isCurrent) g.classList.add("current");
      else if(isReach) g.classList.add("reachable");
      else if(!isVisited) g.classList.add("unreachable");
      g.setAttribute("transform",`translate(${n.x},${n.y})`);
      g.setAttribute("role","button");
      g.setAttribute("data-node-id",n.id);
      g.setAttribute("aria-label",NODE[n.type].label);
      const c=svgEl("circle",{cx:0,cy:0,r:34,fill:NODE[n.type].color});
      const icon=svgEl("text",{x:0,y:2});
      icon.textContent=NODE[n.type].icon;
      g.append(c,icon);
      if(isReach){
        g.addEventListener("click",()=>moveTo(n.id));
      }else if(isCurrent && n.type==="mountainBoss" && !state.run?.mountainBossDefeated && !state.eventFlags?.yodyMountainBossDefeated){
        g.style.cursor="pointer";
        g.addEventListener("click",()=>resolveNode(n));
      }else if(isCurrent && n.type==="toxicGate" && !state.run?.toxicGateCleared){
        g.style.cursor="pointer";
        g.addEventListener("click",()=>resolveNode(n));
      }else if(isCurrent && n.type==="toxicBoss" && !state.eventFlags?.tilenoToxicBossDefeated){
        g.style.cursor="pointer";
        g.addEventListener("click",()=>resolveNode(n));
      }else if(isCurrent && n.type==="forestDeepBoss" && !state.eventFlags?.zelrenoForestDeepCleared){
        g.style.cursor="pointer";
        g.addEventListener("click",()=>resolveNode(n));
      }else if(isCurrent && n.type==="runelRuinsBoss" && !state.eventFlags?.runelRuinsCleared){
        g.style.cursor="pointer";
        g.addEventListener("click",()=>resolveNode(n));
      }
      svg.appendChild(g);
    });

    // Destination names stay near the exit nodes so a branch has meaning before the player taps it.
    if(isBroad){
      run.nodes.forEach(n=>{
        let name="";
        if(n.type==="yodyMountain") name="ヨーディー山道";
        else if(n.type==="yodyFootpath") name="麓の小道";
        else if(n.type==="yodyPort") name="港町ヨーディー";
        else if(n.type==="tilenoTown") name="ティレーノの街";
        else if(n.type==="tilenoWetland") name="ティレーノ湿原";
        else if(n.type==="tilenoToxicWetland") name="ティレーノ毒湿地";
        else if(n.type==="zelrenoForest") name="ゼルレーノ森林地帯";
        else if(n.type==="granzelTown") name="グランゼル城下町";
        else if(n.type==="iceCorridor") name="氷雪の回廊";
        else if(n.type==="runelCavern") name="ルネル岩窟";
        else if(n.type==="runelTown") name="ルネルの街";
        else if(n.type==="runelRuins") name="ルネルパリオ城下町跡";
        else if(n.type==="fairyGrove") name="妖精郷";
        if(!name) return;
        const label=svgEl("text",{x:n.x,y:n.y+64,class:"yody-destination-label"});
        label.textContent=name;
        svg.appendChild(label);
      });
    }
    if(isForest){
      run.nodes.forEach(n=>{
        let name="";
        if(n.type==="forestBlockedPath") name="倒木";
        else if(n.type==="granzelPlains") name="グランゼル大平原";
        if(!name) return;
        const label=svgEl("text",{x:n.x,y:n.y+64,class:"yody-destination-label"});
        label.textContent=name;
        svg.appendChild(label);
      });
    }
    if(isRunel){
      run.nodes.forEach(n=>{
        let name="";
        if(n.type==="restiaBorder") name="レスティア国境";
        else if(n.type==="runelExit") name="ルネル地方";
        if(!name) return;
        const label=svgEl("text",{x:n.x,y:n.y+64,class:"yody-destination-label"});
        label.textContent=name;
        svg.appendChild(label);
      });
    }
  }

  function scrollMapToCurrent(immediate=false){
    if(!state.run || !["caveSide","footpath","yodyRegion","yodyMountain","tilenoRegion","tilenoWetland","tilenoToxicWetland","zelrenoForest","zelrenoForestDeep","granzelPlains","runelCavern","runelRegion","runelRuins"].includes(state.run.area)) return;
    const scroller=$("mapScroll"),svg=$("mapSvg");
    if(!scroller || !svg) return;
    const current=byId(state.run.current); if(!current) return;
    if(state.run.area==="yodyRegion" || state.run.area==="tilenoRegion" || state.run.area==="tilenoWetland" || state.run.area==="granzelPlains" || state.run.area==="runelRegion" || state.run.area==="runelRuins"){
      const nodeEl=svg.querySelector(`[data-node-id="${current.id}"]`);
      if(!nodeEl) return;
      const sr=scroller.getBoundingClientRect(),nr=nodeEl.getBoundingClientRect();
      const centerX=scroller.scrollLeft+(nr.left+nr.width/2-sr.left);
      const centerY=scroller.scrollTop+(nr.top+nr.height/2-sr.top);
      const maxLeft=Math.max(0,scroller.scrollWidth-scroller.clientWidth);
      const maxTop=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
      const targetLeft=Math.max(0,Math.min(maxLeft,centerX-scroller.clientWidth*.50));
      const targetTop=Math.max(0,Math.min(maxTop,centerY-scroller.clientHeight*.58));
      scroller.scrollTo({left:targetLeft,top:targetTop,behavior:immediate?"auto":"smooth"});
      return;
    }
    const viewHeight=state.run.area==="runelRuins"?RUNEL_RUINS_VIEW_HEIGHT:state.run.area==="runelRegion"?RUNEL_REGION_VIEW_HEIGHT:state.run.area==="yodyMountain"?YODY_MOUNTAIN_VIEW_HEIGHT:state.run.area==="tilenoToxicWetland"?TILENO_TOXIC_VIEW_HEIGHT:state.run.area==="zelrenoForest"?ZELRENO_FOREST_VIEW_HEIGHT:state.run.area==="zelrenoForestDeep"?ZELRENO_FOREST_DEEP_VIEW_HEIGHT:state.run.area==="runelCavern"?RUNEL_CAVERN_VIEW_HEIGHT:(state.run.area==="footpath"?FOOTPATH_VIEW_HEIGHT:CAVE_SIDE_VIEW_HEIGHT);
    const scale=svg.getBoundingClientRect().height/viewHeight;
    const target=Math.max(0,current.y*scale-scroller.clientHeight*.68);
    scroller.scrollTo({top:target,behavior:immediate?"auto":"smooth"});
  }

  function renderExploreParty(){
    const list=$("explorePartyList");
    if(!list) return;
    list.innerHTML="";
    state.battleActive.forEach(id=>{
      const c=roster[id],st=S(c);
      const card=document.createElement("div");
      card.className="member"+(st.hp<=0?" ko":"");
      const cond=conditionsOf(c);
      card.innerHTML=`
        <div class="member-head"><div class="name">${c.name}</div><div class="member-tags">${state.run?.area==="runelRuins"&&state.run?.ruinsCursePending&&id==="hero"?'<span class="explore-condition curse">👁 呪い</span>':''}${cond.poison?'<span class="explore-condition poison">☠ 毒</span>':''}<span class="lv-tag">Lv${c.level}</span></div></div>
        <div class="resource-line"><b>HP</b><span class="bar"><i style="width:${hpPct(c)}%"></i></span><span>${st.hp}/${st.hpMax}</span></div>
        <div class="resource-line"><b>MP</b><span class="bar mp"><i style="width:${mpPct(c)}%"></i></span><span>${st.mp}/${st.mpMax}</span></div>`;
      list.appendChild(card);
    });
    $("exploreReserveBtn").textContent=`👥 パーティ編成`;
    $("explorePartyTitle").textContent=`BATTLE MEMBER ${state.battleActive.length} / 4　RESERVE ${state.battleReserve.length} / 6`;
  }

  function closeExploreSkillMenu(){
    const modalEl=$("exploreSkillModal");
    if(modalEl?._effectTimer){clearTimeout(modalEl._effectTimer);modalEl._effectTimer=null;}
    $("exploreSkillBackBtn").disabled=false;
    $("exploreSkillModal").classList.remove("show");
    state.exploreSkillActorId=null;
    state.exploreSkillId=null;
  }

  function setExploreSkillModalView(mode){
    const modalEl=$("exploreSkillModal");
    if(!modalEl) return;
    modalEl.classList.remove("skill-view-actors","skill-view-list","skill-view-target");
    modalEl.classList.add(`skill-view-${mode}`);
  }

  function fieldSkillsForActor(c){
    return c ? knownSkills(c).filter(sk=>sk.fieldUse) : [];
  }

  function fieldSkillHasTarget(actor,sk){
    if(!actor || !sk || S(actor).hp<=0 || S(actor).mp<sk.cost) return false;
    const party=travelPartyIds().map(id=>roster[id]).filter(Boolean);
    switch(sk.fieldUse){
      case "return": return true;
      case "stealth": return !!state.run && !state.run.stealthUsed && state.run.nodes.some(n=>n.type==="battle" && !state.run.visited.has(n.id));
      case "ally": return party.some(c=>S(c).hp>0 && S(c).hp<S(c).hpMax);
      case "allyAll": {
        const targets=sk.kind==="heal" ? state.battleActive.map(id=>roster[id]).filter(Boolean) : party;
        return targets.some(c=>S(c).hp>0 && S(c).hp<S(c).hpMax);
      }
      case "allyKO": return party.some(c=>S(c).hp<=0);
      case "allyAllKO": return party.some(c=>S(c).hp<=0);
      case "miracle": return party.some(c=>S(c).hp<=0 || S(c).hp<S(c).hpMax);
      case "allyCleanse": return party.some(c=>S(c).hp>0 && ["poison","blind","silence","shock"].some(k=>conditionsOf(c)[k]));
      case "allyAllCleanse": return party.some(c=>S(c).hp>0 && ["poison","blind","silence","shock"].some(k=>conditionsOf(c)[k]));
      case "allyMP": return party.some(c=>c.id!==actor.id && S(c).hp>0 && S(c).mp<S(c).mpMax);
      case "frontAllMP": return state.battleActive.some(id=>{const c=roster[id];return c&&S(c).hp>0&&S(c).mp<S(c).mpMax;});
      default:return true;
    }
  }

  function exploreSkillPersonCard(c){
    const st=S(c),skillsForField=fieldSkillsForActor(c),hasSkills=skillsForField.length>0;
    const card=document.createElement("button");
    card.className=`explore-item-target-card explore-skill-actor-card${hasSkills?"":" no-field-skills"}`;
    card.disabled=!hasSkills;
    const portrait=c.img?`<img src="${c.img}" alt="">`:`<span>👤</span>`;
    const hp=Math.max(0,Math.min(100,st.hpMax?st.hp/st.hpMax*100:0));
    const mp=Math.max(0,Math.min(100,st.mpMax?st.mp/st.mpMax*100:0));
    card.innerHTML=`<span class="explore-item-target-thumb">${portrait}</span><span class="explore-item-target-stats"><span class="explore-item-target-name">${c.name}</span><span class="explore-item-mini-resource"><b>HP</b><span class="value">${st.hp}/${st.hpMax}</span><span class="explore-item-mini-bar"><i style="width:${hp}%"></i></span></span><span class="explore-item-mini-resource"><b>MP</b><span class="value">${st.mp}/${st.mpMax}</span><span class="explore-item-mini-bar mp"><i style="width:${mp}%"></i></span></span></span>`;
    if(hasSkills) card.onclick=()=>selectExploreSkillActor(c.id);
    return card;
  }

  function renderExploreSkillActors(){
    setExploreSkillModalView("actors");
    state.exploreSkillActorId=null;
    state.exploreSkillId=null;
    $("exploreSkillLead").textContent="スキルを使う仲間を選択";
    $("exploreSkillActorView").hidden=false;
    $("exploreSkillListView").hidden=true;
    $("exploreSkillTargetView").hidden=true;
    const targets=$("exploreSkillActors"); targets.innerHTML="";
    const battle=document.createElement("div"); battle.className="explore-item-target-group battle";
    const reserve=document.createElement("div"); reserve.className="explore-item-target-group reserve";
    for(let i=0;i<4;i++){ const c=roster[state.battleActive[i]]; battle.appendChild(c?exploreSkillPersonCard(c):exploreItemEmptySlot()); }
    for(let i=0;i<6;i++){ const c=roster[state.battleReserve[i]]; reserve.appendChild(c?exploreSkillPersonCard(c):exploreItemEmptySlot()); }
    targets.append(battle,reserve);
  }

  function selectExploreSkillActor(actorId){
    const actor=roster[actorId]; if(!actor) return;
    state.exploreSkillActorId=actorId;
    state.exploreSkillId=null;
    renderExploreSkillList();
  }

  function renderExploreSkillList(){
    setExploreSkillModalView("list");
    const actor=roster[state.exploreSkillActorId];
    if(!actor){ renderExploreSkillActors(); return; }
    state.exploreSkillId=null;
    $("exploreSkillLead").textContent=`${actor.name}：使用するスキルを選択`;
    $("exploreSkillActorView").hidden=true;
    $("exploreSkillListView").hidden=false;
    $("exploreSkillTargetView").hidden=true;
    const st=S(actor);
    $("exploreSkillActorSummary").innerHTML=`<span style="font-size:24px">${actor.img?`<img src="${actor.img}" alt="" style="width:36px;height:36px;object-fit:contain">`:"✨"}</span><span><strong>${actor.name}</strong><br>HP ${st.hp}/${st.hpMax}　MP ${st.mp}/${st.mpMax}</span>`;
    const box=$("exploreSkillList"); box.innerHTML="";
    const entries=fieldSkillsForActor(actor);
    if(!entries.length){
      box.innerHTML='<div class="character-skill-empty">探索中に使用できるスキルを覚えていません。</div>';
      return;
    }
    entries.forEach(sk=>{
      const usable=fieldSkillHasTarget(actor,sk);
      const btn=document.createElement("button");
      btn.className="skill-option";
      btn.disabled=!usable;
      const note=st.hp<=0?"戦闘不能":st.mp<sk.cost?"MP不足":!usable?(sk.fieldUse==="stealth"&&state.run?.stealthUsed?"使用済み":"対象なし"):"探索で使用";
      const fieldDesc=sk.desc||"";
      btn.innerHTML=`<span class="skill-option-icon">${sk.icon||"✨"}</span>`+
        `<span class="skill-option-main"><span class="skill-option-name">${sk.name}</span>`+
        `<span class="skill-option-desc">${fieldDesc}</span></span>`+
        `<span class="skill-option-meta">MP ${sk.cost}<small>${note}</small></span>`;
      btn.onclick=()=>selectExploreSkill(actor.id,sk.id);
      box.appendChild(btn);
    });
  }

  function captureExploreSkillPartyState(){
    return Object.fromEntries(travelPartyIds().map(id=>{
      const c=roster[id],st=c?S(c):null;
      return c&&st ? [id,{hp:st.hp,hpMax:st.hpMax,mp:st.mp,mpMax:st.mpMax}] : null;
    }).filter(Boolean));
  }

  function exploreSkillEffectCard(c,before,change){
    const st=S(c),old=before||{hp:st.hp,hpMax:st.hpMax,mp:st.mp,mpMax:st.mpMax};
    const card=document.createElement("button");
    card.type="button";
    card.className="explore-item-target-card explore-skill-effect-card";
    const effectKind=change?.kind||"";
    if(change?.amount>0 || effectKind==="cleanse") card.classList.add(`effect-${effectKind}`);
    const portrait=c.img?`<img src="${c.img}" alt="">`:`<span>👤</span>`;
    const hp=Math.max(0,Math.min(100,old.hpMax?old.hp/old.hpMax*100:0));
    const mp=Math.max(0,Math.min(100,old.mpMax?old.mp/old.mpMax*100:0));
    let gain="";
    if(effectKind==="cleanse") gain='<span class="explore-skill-effect-gain">✨ 解除</span>';
    else if(change?.amount>0){
      const prefix=effectKind==="mp"?"MP +":effectKind==="revive"?"✨ +":"HP +";
      gain=`<span class="explore-skill-effect-gain">${prefix}${change.amount}</span>`;
    }
    card.innerHTML=`<span class="explore-item-target-thumb">${portrait}</span><span class="explore-item-target-stats"><span class="explore-item-target-name">${c.name}</span><span class="explore-item-mini-resource"><b>HP</b><span class="value hp-value">${old.hp}/${old.hpMax}</span><span class="explore-item-mini-bar"><i class="hp-fill" style="width:${hp}%"></i></span></span><span class="explore-item-mini-resource"><b>MP</b><span class="value mp-value">${old.mp}/${old.mpMax}</span><span class="explore-item-mini-bar mp"><i class="mp-fill" style="width:${mp}%"></i></span></span></span>${gain}`;
    card.dataset.characterId=c.id;
    return card;
  }

  function showExploreSkillEffect(actor,sk,before,changes,text,{battleOnly=false,returnToTarget=false}={}){
    setExploreSkillModalView("target");
    $("exploreSkillLead").textContent=`${actor.name}：${sk.name} の効果`;
    $("exploreSkillActorView").hidden=true;
    $("exploreSkillListView").hidden=true;
    $("exploreSkillTargetView").hidden=false;
    $("exploreSkillBackBtn").disabled=true;
    const ast=S(actor);
    $("exploreSkillSummary").innerHTML=`<span style="font-size:24px">${sk.icon||"✨"}</span><span><strong>${actor.name}：${sk.name}</strong><br>${text}　MP ${ast.mp}/${ast.mpMax}</span>`;
    const targets=$("exploreSkillTargets"); targets.innerHTML="";
    const battle=document.createElement("div"); battle.className="explore-item-target-group battle";
    const reserve=document.createElement("div"); reserve.className="explore-item-target-group reserve";
    if(battleOnly) reserve.classList.add("effect-outside");
    const changeMap=Object.fromEntries((changes||[]).map(ch=>[ch.id,ch]));
    for(let i=0;i<4;i++){
      const c=roster[state.battleActive[i]];
      battle.appendChild(c?exploreSkillEffectCard(c,before[c.id],changeMap[c.id]):exploreItemEmptySlot());
    }
    for(let i=0;i<6;i++){
      const c=roster[state.battleReserve[i]];
      reserve.appendChild(c?exploreSkillEffectCard(c,before[c.id],changeMap[c.id]):exploreItemEmptySlot());
    }
    targets.append(battle,reserve);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      travelPartyIds().forEach(id=>{
        const card=targets.querySelector(`[data-character-id="${id}"]`); if(!card)return;
        const c=roster[id],st=c?S(c):null;if(!st)return;
        const hpFill=card.querySelector(".hp-fill"),mpFill=card.querySelector(".mp-fill");
        if(hpFill) hpFill.style.width=`${Math.max(0,Math.min(100,st.hpMax?st.hp/st.hpMax*100:0))}%`;
        if(mpFill) mpFill.style.width=`${Math.max(0,Math.min(100,st.mpMax?st.mp/st.mpMax*100:0))}%`;
        const hpValue=card.querySelector(".hp-value"),mpValue=card.querySelector(".mp-value");
        if(hpValue) hpValue.textContent=`${st.hp}/${st.hpMax}`;
        if(mpValue) mpValue.textContent=`${st.mp}/${st.mpMax}`;
      });
    }));
    updateRunHud();
    const modalEl=$("exploreSkillModal");
    if(modalEl._effectTimer) clearTimeout(modalEl._effectTimer);
    modalEl._effectTimer=setTimeout(()=>{
      modalEl._effectTimer=null;
      $("exploreSkillBackBtn").disabled=false;
      if($("exploreSkillModal").classList.contains("show")){
        if(returnToTarget) renderExploreSkillTargets();
        else renderExploreSkillList();
      }
    },1050);
  }

  function useExploreAllSkill(actor,sk){
    const ast=S(actor);
    if(ast.hp<=0 || ast.mp<sk.cost || !fieldSkillHasTarget(actor,sk)) return;
    const before=captureExploreSkillPartyState();
    const travelParty=travelPartyIds().map(id=>roster[id]).filter(Boolean);
    const battleParty=state.battleActive.map(id=>roster[id]).filter(Boolean);
    const party=(sk.kind==="heal") ? battleParty : travelParty;
    ast.mp-=sk.cost;
    let count=0,total=0;
    const changes=[];
    if(sk.kind==="heal"){
      const power=healAmountForSkill(actor,sk);
      party.filter(c=>S(c).hp>0).forEach(c=>{
        const amount=Math.min(S(c).hpMax-S(c).hp,sk.fullHeal?S(c).hpMax-S(c).hp:power);
        if(amount>0){S(c).hp+=amount;total+=amount;count++;changes.push({id:c.id,kind:"hp",amount});}
      });
    }else if(sk.kind==="revive"){
      party.filter(c=>S(c).hp<=0).forEach(c=>{
        clearStatesOnKo(c);
        const old=S(c).hp;S(c).hp=Math.max(1,Math.round(S(c).hpMax*(Number(sk.revivePercent)||.20)));
        const amount=S(c).hp-old;count++;changes.push({id:c.id,kind:"revive",amount});
      });
      if(sk.fullPartyHeal) party.forEach(c=>{
        const old=S(c).hp;S(c).hp=S(c).hpMax;const amount=S(c).hp-old;
        if(amount>0 && !changes.some(ch=>ch.id===c.id)) changes.push({id:c.id,kind:"hp",amount});
      });
    }else if(sk.kind==="cleanse"){
      party.forEach(c=>{ const n=clearNegativeConditions(c,{poisonOnly:false}); total+=n; if(n){count++;changes.push({id:c.id,kind:"cleanse",amount:n});} });
    }else if(sk.kind==="mpTransfer"){
      battleParty.filter(c=>S(c).hp>0).forEach(c=>{const amount=Math.min(S(c).mpMax-S(c).mp,sk.restoreMp);if(amount>0){S(c).mp+=amount;total+=amount;count++;changes.push({id:c.id,kind:"mp",amount});}});
    }
    const text=sk.kind==="heal"?`${count}人・合計HP ${total} 回復`:sk.kind==="revive"?`${count}人を復活${sk.fullPartyHeal?"＋全員全回復":""}`:sk.kind==="cleanse"?`${total}個の状態異常を解除`:`合計MP ${total} 回復`;
    showExploreSkillEffect(actor,sk,before,changes,text,{battleOnly:sk.kind==="heal"||sk.kind==="mpTransfer"});
    toast(`${actor.name} の${sk.name}：${text}`);
  }

  function selectExploreSkill(actorId,skillId){
    const actor=roster[actorId],sk=skills[skillId];
    if(!actor || !sk || !sk.fieldUse) return;
    state.exploreSkillActorId=actorId;
    state.exploreSkillId=skillId;
    const ast=S(actor);
    if(ast.hp<=0){ toast(`${actor.name} は戦闘不能でスキルを使えません`); return; }
    if(ast.mp<sk.cost){ toast(`${actor.name} のMPが足りません`); return; }
    if(sk.fieldUse==="return"){
      modal("🌀 リターン",`${actor.name}がリターンを使用します。\nMPを ${sk.cost} 消費してミレスタへ帰還しますか？`,[
        ["帰還する",()=>{ ast.mp-=sk.cost; closeModal(); closeExploreSkillMenu(); returnToMilestaFromExploration("リターンでミレスタへ帰還しました"); }],
        ["やめる",closeModal]
      ]);
      return;
    }
    if(sk.fieldUse==="stealth"){
      if(state.run.stealthUsed){ toast("このマップではすでにステルスを使用しています"); return; }
      const battles=state.run.nodes.filter(n=>n.type==="battle" && !state.run.visited.has(n.id));
      if(!battles.length){ toast("未踏の戦闘マスがありません"); return; }
      ast.mp-=sk.cost;
      state.run.stealthUsed=true;
      let erased=0;
      battles.forEach(n=>{ if(Math.random()<sk.successRate){n.type="empty";erased++;} });
      renderMap(); updateRunHud(); renderExploreSkillList();
      toast(`ステルス：戦闘マス ${erased}個が静まり返った`);
      return;
    }
    if(["allyAll","allyAllKO","miracle","allyAllCleanse","frontAllMP"].includes(sk.fieldUse)){
      useExploreAllSkill(actor,sk); return;
    }
    renderExploreSkillTargets();
  }

  function fieldTargetUsable(sk,c,actor=null){
    const st=S(c);
    switch(sk.fieldUse){
      case "ally": return st.hp>0 && st.hp<st.hpMax;
      case "allyKO": return st.hp<=0;
      case "allyCleanse": return st.hp>0 && ["poison","blind","silence","shock"].some(k=>conditionsOf(c)[k]);
      case "allyMP": return (!actor || c.id!==actor.id) && st.hp>0 && st.mp<st.mpMax;
      default:return false;
    }
  }

  function exploreSkillTargetCard(c,actor,sk){
    const st=S(c),ast=S(actor),selfBlocked=sk.fieldUse==="allyMP"&&c.id===actor.id,canUse=ast.hp>0 && ast.mp>=sk.cost && fieldTargetUsable(sk,c,actor);
    const card=document.createElement("button"); card.className="explore-item-target-card"; card.disabled=!canUse;
    if(selfBlocked) card.title="サプライは使用者自身には使えません";
    const portrait=c.img?`<img src="${c.img}" alt="">`:`<span>👤</span>`;
    const hp=Math.max(0,Math.min(100,st.hpMax?st.hp/st.hpMax*100:0));
    const mp=Math.max(0,Math.min(100,st.mpMax?st.mp/st.mpMax*100:0));
    card.innerHTML=`<span class="explore-item-target-thumb">${portrait}</span><span class="explore-item-target-stats"><span class="explore-item-target-name">${c.name}</span><span class="explore-item-mini-resource"><b>HP</b><span class="value">${st.hp}/${st.hpMax}</span><span class="explore-item-mini-bar"><i style="width:${hp}%"></i></span></span><span class="explore-item-mini-resource"><b>MP</b><span class="value">${st.mp}/${st.mpMax}</span><span class="explore-item-mini-bar mp"><i style="width:${mp}%"></i></span></span></span>`;
    card.onclick=()=>useExploreSkillOnTarget(c.id);
    return card;
  }

  function renderExploreSkillTargets(){
    setExploreSkillModalView("target");
    const actor=roster[state.exploreSkillActorId],sk=skills[state.exploreSkillId];
    if(!actor || !sk){ renderExploreSkillActors(); return; }
    $("exploreSkillLead").textContent=`${actor.name}：${sk.name} の対象を選択`;
    $("exploreSkillActorView").hidden=true;
    $("exploreSkillListView").hidden=true;
    $("exploreSkillTargetView").hidden=false;
    const ast=S(actor);
    const fieldDesc=(sk.kind==="heal"&&sk.fieldUse==="allyAll")?`${sk.desc||""}（探索中はバトルメンバー4人のみ）`:(sk.desc||"");
    $("exploreSkillSummary").innerHTML=`<span style="font-size:24px">${sk.icon||"✨"}</span><span><strong>${actor.name}：${sk.name}</strong><br>MP ${ast.mp}/${ast.mpMax}　消費MP ${sk.cost}　${fieldDesc}</span>`;
    const targets=$("exploreSkillTargets"); targets.innerHTML="";
    const battle=document.createElement("div"); battle.className="explore-item-target-group battle";
    const reserve=document.createElement("div"); reserve.className="explore-item-target-group reserve";
    for(let i=0;i<4;i++){ const c=roster[state.battleActive[i]]; battle.appendChild(c?exploreSkillTargetCard(c,actor,sk):exploreItemEmptySlot()); }
    for(let i=0;i<6;i++){ const c=roster[state.battleReserve[i]]; reserve.appendChild(c?exploreSkillTargetCard(c,actor,sk):exploreItemEmptySlot()); }
    targets.append(battle,reserve);
  }

  function useExploreSkillOnTarget(targetId){
    const actor=roster[state.exploreSkillActorId],sk=skills[state.exploreSkillId],target=roster[targetId];
    if(!actor || !sk || !target) return;
    const ast=S(actor),tst=S(target);
    if(ast.hp<=0){ toast(`${actor.name} は戦闘不能でスキルを使えません`); renderExploreSkillTargets(); return; }
    if(ast.mp<sk.cost){ toast(`${actor.name} のMPが足りません`); renderExploreSkillTargets(); return; }
    if(!fieldTargetUsable(sk,target,actor)){ toast(sk.fieldUse==="allyMP"&&target.id===actor.id?"サプライは使用者自身には使えません":"その対象には今は使えません"); return; }
    const before=captureExploreSkillPartyState();
    ast.mp-=sk.cost;
    let text="",change=null;
    if(sk.kind==="heal"){
      const power=healAmountForSkill(actor,sk),amount=Math.min(tst.hpMax-tst.hp,sk.fullHeal?tst.hpMax-tst.hp:power);
      tst.hp+=amount; text=`${target.name} のHPが ${amount} 回復`; change={id:target.id,kind:"hp",amount};
    }else if(sk.kind==="revive"){
      clearStatesOnKo(target);
      const old=tst.hp,amount=Math.max(1,Math.round(tst.hpMax*(Number(sk.revivePercent)||.20))); tst.hp=Math.min(tst.hpMax,amount); text=`${target.name} がHP ${tst.hp}で復活`; change={id:target.id,kind:"revive",amount:tst.hp-old};
    }else if(sk.kind==="cleanse"){
      const removed=clearNegativeConditions(target,{poisonOnly:Array.isArray(sk.statuses)&&sk.statuses[0]==="poison"}); text=`${target.name} の状態異常を ${removed}個解除`; change={id:target.id,kind:"cleanse",amount:removed};
    }else if(sk.kind==="mpTransfer"){
      const amount=Math.min(tst.mpMax-tst.mp,sk.restoreMp); tst.mp+=amount; text=`${target.name} のMPが ${amount} 回復`; change={id:target.id,kind:"mp",amount};
    }
    showExploreSkillEffect(actor,sk,before,change?[change]:[],text,{battleOnly:false,returnToTarget:true});
    toast(`${actor.name} の${sk.name}：${text}`);
  }

  function openExploreSkillMenu(){
    if(!state.run) return;
    renderExploreSkillActors();
    $("exploreSkillModal").classList.add("show");
  }

  function closeExploreItemMenu(){
    $("exploreItemModal").classList.remove("show");
  }

  const MAP_ITEM_SPECIAL_TYPES=new Set(["start","shop","goal","stairs","sidepath","forestDeepBoss","mimicChest","restiaBorder","runelExit","runelTown","runelRuins","runelRuinsBoss","fairyGrove"]);
  function fieldItemTargetUsable(itemId,c){
    const item=ITEMS[itemId],st=S(c); if(!item) return false;
    if(item.effect==="hpHeal") return st.hp>0 && st.hp<st.hpMax;
    if(item.effect==="mpHeal") return st.hp>0 && st.mp<st.mpMax;
    if(item.effect==="cleanse"){
      if(st.hp<=0) return false;
      const cond=conditionsOf(c);
      return item.poisonOnly ? !!cond.poison : ["poison","blind","silence","shock"].some(k=>cond[k]);
    }
    if(item.effect==="revive") return st.hp<=0;
    if(item.effect==="seed") return true;
    return false;
  }
  function nextModifiableNodes(){
    if(!state.run) return [];
    const reachable=reachableIds();
    return state.run.nodes.filter(n=>reachable.has(n.id) && !MAP_ITEM_SPECIAL_TYPES.has(n.type));
  }
  function remainingModifiableNodes(){
    if(!state.run) return [];
    return state.run.nodes.filter(n=>!state.run.visited.has(n.id) && !MAP_ITEM_SPECIAL_TYPES.has(n.type));
  }
  function fieldDirectItemUsable(item){
    if(!state.run || !item?.fieldDirect) return false;
    if(item.fieldDirect==="return") return true;
    if(item.fieldDirect==="stealth") return !state.run.stealthUsed && state.run.nodes.some(n=>n.type==="battle" && !state.run.visited.has(n.id));
    if(["nextBattle","nextHeal","nextEvent"].includes(item.fieldDirect)) return nextModifiableNodes().length>0;
    if(item.fieldDirect==="rerollMap") return remainingModifiableNodes().length>0;
    return false;
  }
  let inventoryContext="home";
  let inventoryTab="items";
  const INVENTORY_EMPTY_EQUIPMENT_IDS=new Set(["bare","no_shield","no_body","no_accessory"]);

  function inventoryItemActionNote(item){
    if(inventoryContext!=="explore") return "確認のみ";
    if(!item.fieldUse) return "探索中は使用不可";
    if(item.fieldDirect) return fieldDirectItemUsable(item)?"タップして使用":"今は使用不可";
    return "タップして使用";
  }
  function renderInventoryItems(){
    const choices=$("exploreFieldItemList"); choices.innerHTML="";
    const shown=Object.values(ITEMS).filter(item=>!item.keyItem && itemCount(item.id)>0);
    if(!shown.length){ choices.innerHTML='<div class="inventory-empty">アイテムを持っていません。</div>'; return; }
    shown.forEach(item=>{
      const count=itemCount(item.id);
      const usable=inventoryContext==="explore" && !!item.fieldUse && (!item.fieldDirect || fieldDirectItemUsable(item));
      const tag=itemUsageLabel(item);
      if(usable){
        const b=document.createElement("button"); b.type="button"; b.className="inventory-row";
        b.innerHTML=`<span class="inventory-row-icon">${item.icon}</span><span class="inventory-row-main"><span class="inventory-row-name">${item.name}</span><span class="inventory-slot-tag">${tag}</span><span class="inventory-row-desc">${item.desc}</span></span><span class="inventory-row-side"><span class="inventory-row-count">×${count}</span><span class="inventory-row-note usable">${inventoryItemActionNote(item)}</span></span>`;
        b.onclick=()=>{
          if(item.fieldDirect) useExploreDirectItem(item.id);
          else{ state.exploreItemId=item.id; renderExploreItemTargets(); }
        };
        choices.appendChild(b);
      }else{
        const row=document.createElement("div"); row.className="inventory-row";
        row.innerHTML=`<span class="inventory-row-icon">${item.icon}</span><span class="inventory-row-main"><span class="inventory-row-name">${item.name}</span><span class="inventory-slot-tag">${tag}</span><span class="inventory-row-desc">${item.desc}</span></span><span class="inventory-row-side"><span class="inventory-row-count">×${count}</span><span class="inventory-row-note">${inventoryItemActionNote(item)}</span></span>`;
        choices.appendChild(row);
      }
    });
  }
  function renderInventoryEquipment(){
    const list=$("inventoryEquipmentList"); list.innerHTML="";
    const ids=EQUIPMENT_SLOTS.flatMap(slot=>equipmentInventory[slot]||[]).filter(id=>!INVENTORY_EMPTY_EQUIPMENT_IDS.has(id) && ownedEquipmentCount(id)>0);
    if(!ids.length){ list.innerHTML='<div class="inventory-empty">装備品を持っていません。</div>'; return; }
    ids.forEach(id=>{
      const item=equipmentCatalog[id]; if(!item) return;
      const owned=ownedEquipmentCount(id),using=equippedCount(id);
      const row=document.createElement("div"); row.className="inventory-row";
      row.innerHTML=`<span class="inventory-row-icon">${item.icon||"◇"}</span><span class="inventory-row-main"><span class="inventory-row-name">${item.name}</span><span class="inventory-slot-tag">${EQUIPMENT_SLOT_LABELS[item.slot]||"装備品"}</span><span class="inventory-row-desc">${item.desc||""}</span></span><span class="inventory-row-side"><span class="inventory-row-count">×${owned}</span><span class="inventory-row-note">${using>0?`装備中 ${using}`:"未装備"}</span></span>`;
      list.appendChild(row);
    });
  }
  function renderInventoryKeyItems(){
    const list=$("inventoryKeyList"); list.innerHTML="";
    const shown=Object.values(ITEMS).filter(item=>item.keyItem && itemCount(item.id)>0);
    if(!shown.length){ list.innerHTML='<div class="inventory-empty">貴重品はまだありません。</div>'; return; }
    shown.forEach(item=>{
      const row=document.createElement("div"); row.className="inventory-row";
      row.innerHTML=`<span class="inventory-row-icon">${item.icon||"⚜️"}</span><span class="inventory-row-main"><span class="inventory-row-name">${item.name}</span><span class="inventory-slot-tag">貴重品</span><span class="inventory-row-desc">${item.desc||""}</span></span><span class="inventory-row-side"><span class="inventory-row-count">×${itemCount(item.id)}</span><span class="inventory-row-note">使用不可</span></span>`;
      list.appendChild(row);
    });
  }
  function renderInventory(){
    $("exploreItemListView").hidden=false;
    $("exploreItemTargetView").hidden=true;
    $("inventoryTabs").hidden=false;
    $("inventoryTitle").textContent="所持品";
    $("exploreItemLead").textContent=inventoryContext==="explore"?"アイテムは探索中に使用できます":"現在の所持品を確認";
    document.querySelectorAll("[data-inventory-tab]").forEach(btn=>btn.classList.toggle("active",btn.dataset.inventoryTab===inventoryTab));
    $("inventoryItemsPanel").hidden=inventoryTab!=="items";
    $("inventoryEquipmentPanel").hidden=inventoryTab!=="equipment";
    $("inventoryKeyPanel").hidden=inventoryTab!=="key";
    if(inventoryTab==="items") renderInventoryItems();
    else if(inventoryTab==="equipment") renderInventoryEquipment();
    else renderInventoryKeyItems();
  }
  function renderExploreItemList(){ inventoryTab="items"; renderInventory(); }
  function openInventoryMenu(context="home",tab="items"){
    if(context==="explore" && !state.run) return;
    inventoryContext=context; inventoryTab=tab; state.exploreItemId=null; renderInventory(); $("exploreItemModal").classList.add("show");
  }
  function openExploreItemMenu(){ openInventoryMenu("explore","items"); }

  function exploreItemTargetCard(c,item){
    const st=S(c),canUse=itemCount(item.id)>0&&fieldItemTargetUsable(item.id,c);
    const card=document.createElement("button"); card.className="explore-item-target-card"; card.disabled=!canUse;
    const portrait=c.img?`<img src="${c.img}" alt="">`:`<span>👤</span>`;
    const hp=Math.max(0,Math.min(100,st.hpMax?st.hp/st.hpMax*100:0));
    const mp=Math.max(0,Math.min(100,st.mpMax?st.mp/st.mpMax*100:0));
    card.innerHTML=`<span class="explore-item-target-thumb">${portrait}</span><span class="explore-item-target-stats"><span class="explore-item-target-name">${c.name}</span><span class="explore-item-mini-resource"><b>HP</b><span class="value">${st.hp}/${st.hpMax}</span><span class="explore-item-mini-bar"><i style="width:${hp}%"></i></span></span><span class="explore-item-mini-resource"><b>MP</b><span class="value">${st.mp}/${st.mpMax}</span><span class="explore-item-mini-bar mp"><i style="width:${mp}%"></i></span></span></span>`;
    card.onclick=()=>useExploreFieldItem(c.id);
    return card;
  }
  function exploreItemEmptySlot(){
    const empty=document.createElement("div"); empty.className="explore-item-target-empty-slot";
    empty.innerHTML='<span class="explore-item-target-thumb"></span><span class="explore-item-target-stats"></span>';
    return empty;
  }
  function renderExploreItemTargets(){
    const item=ITEMS[state.exploreItemId]||ITEMS.potion;
    $("exploreItemListView").hidden=true; $("exploreItemTargetView").hidden=false;
    $("inventoryTabs").hidden=true;
    $("exploreItemLead").textContent="使用する相手を選択";
    $("exploreItemSummary").innerHTML=`<span style="font-size:24px">${item.icon}</span><span><strong>${item.name} ×${itemCount(item.id)}</strong><br>${item.desc}</span>`;
    const targets=$("exploreItemTargets"); targets.innerHTML="";
    const battle=document.createElement("div"); battle.className="explore-item-target-group battle";
    const reserve=document.createElement("div"); reserve.className="explore-item-target-group reserve";
    for(let i=0;i<4;i++){ const c=roster[state.battleActive[i]]; battle.appendChild(c?exploreItemTargetCard(c,item):exploreItemEmptySlot()); }
    for(let i=0;i<6;i++){ const c=roster[state.battleReserve[i]]; reserve.appendChild(c?exploreItemTargetCard(c,item):exploreItemEmptySlot()); }
    targets.append(battle,reserve);
  }
  function applySeedItem(c,item){
    const bonus=seedBonusOf(c),st=S(c);
    const applyOne=key=>{
      if(key==="fate"){ bonus.fate=(Number(bonus.fate)||0)+1; c.fate=(Number(c.fate)||0)+1; return; }
      bonus[key]=(Number(bonus[key])||0)+1;
      if(key==="hpMax"){ st.hpMax+=1; st.hp=Math.min(st.hpMax,st.hp+1); return; }
      if(key==="mpMax"){ st.mpMax+=1; st.mp=Math.min(st.mpMax,st.mp+1); return; }
      st[key]=(Number(st[key])||0)+1;
    };
    if(item.seedStat==="all") ["hpMax","mpMax","atk","def","magic","mdef","spd","fate"].forEach(applyOne);
    else applyOne(item.seedStat);
  }

  function useExploreFieldItem(id){
    const c=roster[id],item=ITEMS[state.exploreItemId]; if(!c||!item||itemCount(item.id)<=0)return;
    const st=S(c); if(!fieldItemTargetUsable(item.id,c)){toast("その対象には今は使えません");return;}
    removeItemCount(item.id,1); let text="";
    if(item.effect==="hpHeal"){
      const amount=Math.min(st.hpMax-st.hp,item.full?st.hpMax-st.hp:Number(item.amount)||0); st.hp+=amount; text=`HPが ${amount} 回復`;
    }else if(item.effect==="mpHeal"){
      const amount=Math.min(st.mpMax-st.mp,Number(item.amount)||0); st.mp+=amount; text=`MPが ${amount} 回復`;
    }else if(item.effect==="cleanse"){
      const removed=clearNegativeConditions(c,{poisonOnly:!!item.poisonOnly}); text=removed?`状態異常を ${removed}個解除`:"解除できる状態異常はなかった";
    }else if(item.effect==="revive"){
      clearStatesOnKo(c);
      st.hp=Math.max(1,Math.min(st.hpMax,Math.round(st.hpMax*(Number(item.revivePercent)||.20)))); text=`HP ${st.hp}で復活`;
    }else if(item.effect==="seed"){
      applySeedItem(c,item); text=`${item.desc}`;
    }
    updateRunHud(); renderExploreItemTargets(); toast(`${c.name}：${text}`);
  }

  function useExploreDirectItem(id){
    const item=ITEMS[id]; if(!state.run || !item || itemCount(id)<=0) return;
    if(id==="returnFeather" && !returnFeatherUnlocked()){ toast("今は使用できないようだ。"); return; }
    if(!fieldDirectItemUsable(item)){ toast(item.fieldDirect==="stealth" && state.run.stealthUsed?"このマップではステルス系効果をすでに使用しています":"今はこのアイテムを使えません"); return; }
    if(item.fieldDirect==="return"){
      modal(`${item.icon} ${item.name}を使いますか？`,`${item.name}を1個消費して、現在の探索を終了します。
所持数：${itemCount(id)}`,[
        ["使用する",()=>{ if(!state.run || !removeItemCount(id,1)){closeModal();return;} closeModal();closeExploreItemMenu();returnToMilestaFromExploration(`${item.name}でミレスタへ帰還しました`); }],
        ["やめる",closeModal]
      ]); return;
    }
    if(item.fieldDirect==="stealth"){
      const battles=state.run.nodes.filter(n=>n.type==="battle" && !state.run.visited.has(n.id));
      if(!battles.length || state.run.stealthUsed) return;
      removeItemCount(id,1); state.run.stealthUsed=true; let erased=0;
      battles.forEach(n=>{ if(Math.random()<(Number(item.successRate)||.35)){n.type="empty";erased++;} });
      renderMap(); updateRunHud(); renderExploreItemList(); toast(`${item.name}：戦闘マス ${erased}個が静まり返った`); return;
    }
    if(["nextBattle","nextHeal","nextEvent"].includes(item.fieldDirect)){
      const nodes=nextModifiableNodes(); if(!nodes.length) return;
      const type=item.fieldDirect==="nextBattle"?"battle":item.fieldDirect==="nextHeal"?"heal":"event";
      removeItemCount(id,1); nodes.forEach(n=>n.type=type); renderMap(); updateRunHud(); renderExploreItemList();
      toast(`${item.name}：次の通常ノード ${nodes.length}個を${NODE[type].label}マスに変更`); return;
    }
    if(item.fieldDirect==="rerollMap"){
      const nodes=remainingModifiableNodes(); if(!nodes.length) return;
      removeItemCount(id,1); const pool=["battle","chest","heal","event"]; nodes.forEach(n=>n.type=choose(pool));
      renderMap(); updateRunHud(); renderExploreItemList(); toast(`${item.name}：未踏の通常ノード ${nodes.length}個を再構成した`); return;
    }
  }

  function useReturnFeather(){ useExploreDirectItem("returnFeather"); }

  const legacyReturnFeatherBtn=$("exploreReturnFeatherBtn"); if(legacyReturnFeatherBtn) legacyReturnFeatherBtn.onclick=useReturnFeather;
  $("exploreSkillBtn").onclick=openExploreSkillMenu;
  $("exploreSkillCloseBtn").onclick=closeExploreSkillMenu;
  $("exploreSkillActorBackBtn").onclick=renderExploreSkillActors;
  $("exploreSkillBackBtn").onclick=renderExploreSkillList;
  $("exploreSkillModal").addEventListener("click",e=>{ if(e.target===$("exploreSkillModal")) closeExploreSkillMenu(); });
  $("exploreItemBtn").onclick=openExploreItemMenu;
  $("exploreItemBackBtn").onclick=()=>{inventoryTab="items";renderInventory();};
  document.querySelectorAll("[data-inventory-tab]").forEach(btn=>btn.onclick=()=>{inventoryTab=btn.dataset.inventoryTab;renderInventory();});
  $("exploreItemCloseBtn").onclick=closeExploreItemMenu;
  $("exploreItemModal").addEventListener("click",e=>{ if(e.target===$("exploreItemModal")) closeExploreItemMenu(); });

  function updateRunHud(){
    const cur=byId(state.run.current);
    if(state.run.area==="cave"){
      const layerName=state.run.caveLayer===1?"第一層":"第二層";
      $("floorText").textContent=cur.layer===0?`${layerName} 入口`:cur.layer===6?`${layerName} 最奥`:`${layerName} ${cur.layer}F`;
    }else if(state.run.area==="caveSide"){
      $("floorText").textContent=cur.layer===0?"入口":cur.layer===CAVE_SIDE_GOAL_LAYER?"出口":`${cur.layer}F`;
    }else if(state.run.area==="yodyRegion"){
      if(cur.layer===0) $("floorText").textContent=state.run.entryMode==="fromYordy"?"港町側":"横道側";
      else if(cur.layer===YODY_GOAL_LAYER) $("floorText").textContent="出口";
      else $("floorText").textContent=`${cur.layer}/${YODY_NORMAL_LAYERS}`;
    }else if(state.run.area==="tilenoRegion"){
      const shortRoute=state.run.entryMode==="fromMountain";
      const normalLayers=shortRoute?TILENO_SHORT_NORMAL_LAYERS:TILENO_NORMAL_LAYERS;
      const goalLayer=shortRoute?TILENO_SHORT_GOAL_LAYER:TILENO_GOAL_LAYER;
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="tilenoWetland") $("floorText").textContent="湿原";
      else if(cur.layer===goalLayer) $("floorText").textContent="出口";
      else $("floorText").textContent=`${cur.layer}/${normalLayers}`;
    }else if(state.run.area==="tilenoWetland"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="tilenoToxicWetland") $("floorText").textContent="毒湿地";
      else $("floorText").textContent=`${cur.layer}/${TILENO_WETLAND_GOAL_LAYER}`;
    }else if(state.run.area==="tilenoToxicWetland"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="toxicGate") $("floorText").textContent="最深部";
      else if(cur.type==="toxicBoss") $("floorText").textContent="最奥";
      else $("floorText").textContent=`${cur.layer}/${TILENO_TOXIC_BOSS_LAYER}`;
    }else if(state.run.area==="zelrenoForest"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="forestBlockedPath") $("floorText").textContent="分岐";
      else if(cur.layer===ZELRENO_FOREST_GOAL_LAYER) $("floorText").textContent="出口";
      else $("floorText").textContent=`${cur.layer}/${ZELRENO_FOREST_GOAL_LAYER}`;
    }else if(state.run.area==="zelrenoForestDeep"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="forestDeepBoss") $("floorText").textContent="最奥";
      else $("floorText").textContent=`${cur.layer}/${ZELRENO_FOREST_DEEP_NORMAL_LAYERS}`;
    }else if(state.run.area==="granzelPlains"){
      const shortRoute=state.run.entryMode==="fromForest";
      const normalLayers=shortRoute?GRANZEL_PLAINS_SHORT_NORMAL_LAYERS:GRANZEL_PLAINS_NORMAL_LAYERS;
      const goalLayer=shortRoute?GRANZEL_PLAINS_SHORT_GOAL_LAYER:GRANZEL_PLAINS_GOAL_LAYER;
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="granzelTown") $("floorText").textContent="城下町";
      else if(cur.type==="iceCorridor") $("floorText").textContent="北出口";
      else if(cur.type==="runelCavern") $("floorText").textContent="南東出口";
      else if(cur.layer===goalLayer) $("floorText").textContent="出口";
      else $("floorText").textContent=`${cur.layer}/${normalLayers}`;
    }else if(state.run.area==="runelCavern"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="restiaBorder") $("floorText").textContent="分岐";
      else if(cur.type==="runelExit") $("floorText").textContent="出口";
      else $("floorText").textContent=`${cur.layer}/${RUNEL_CAVERN_NORMAL_LAYERS}`;
    }else if(state.run.area==="runelRuins"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.type==="runelRuinsBoss") $("floorText").textContent="最奥";
      else $("floorText").textContent=`${cur.layer}/${RUNEL_RUINS_NORMAL_LAYERS}`;
    }else if(state.run.area==="runelRegion"){
      if(state.run.entryMode==="fromWorld"){
        if(cur.layer===0) $("floorText").textContent="ルネルの街側";
        else if(cur.type==="fairyGrove") $("floorText").textContent="分岐";
        else if(cur.type==="runelRuins") $("floorText").textContent="城下町跡";
        else $("floorText").textContent=`${cur.layer}/${RUNEL_REGION_WORLD_NORMAL_LAYERS}`;
      }else{
        if(cur.layer===0) $("floorText").textContent="薫風亭側";
        else if(cur.type==="runelTown") $("floorText").textContent="ルネルの街";
        else $("floorText").textContent=`${cur.layer}/${RUNEL_REGION_NORMAL_LAYERS}`;
      }
    }else if(state.run.area==="footpath"){
      $("floorText").textContent=cur.layer===0?"入口":cur.layer===FOOTPATH_GOAL_LAYER?"最奥":`${cur.layer}F`;
    }else if(state.run.area==="yodyMountain"){
      if(cur.layer===0) $("floorText").textContent="入口";
      else if(cur.layer===YODY_MOUNTAIN_BOSS_LAYER) $("floorText").textContent="強敵";
      else if(cur.layer<YODY_MOUNTAIN_EXIT_LAYER) $("floorText").textContent=`${cur.layer}/18`;
      else $("floorText").textContent="出口";
    }else $("floorText").textContent=cur.layer===0 ? "入口" : cur.layer===6 ? "最奥" : `${cur.layer}F`;
    $("runGoldText").textContent=state.run.runGold;
    $("runExpText").textContent=state.run.runExp;
    renderExploreParty();
    updateHeader();
  }

  function moveTo(id){
    const reachable=reachableIds();
    if(!reachable.has(id)) return;
    const wagonRide=["granzelPlains","runelRegion"].includes(state.run?.area) && !!state.run.wagonRideActive;
    state.run.previous=state.run.current;
    state.run.current=id;
    state.run.visited.add(id);
    const node=byId(id);
    if(wagonRide) state.run.wagonRideActive=false;
    renderMap();
    updateRunHud();
    scrollMapToCurrent(false);
    const fixedGoal=["granzelTown","iceCorridor","runelCavern","runelTown","runelRuins","fairyGrove"].includes(node?.type);
    if(wagonRide && !fixedGoal){
      state.run.resolved.add(node.id);
      toast("荷馬車で一段先まで進んだ");
      return;
    }
    resolveNode(node);
  }

  function addRunGold(amount){ state.gold+=amount; if(state.run)state.run.runGold+=amount; updateHeader(); }
  function travelPartyMembers(){ return travelPartyIds().map(id=>roster[id]).filter(Boolean); }
  function applyPartyHpPercent(deltaRate,activeOnly=false){ let total=0;const ids=activeOnly?state.battleActive:travelPartyIds();ids.forEach(id=>{const c=roster[id],st=S(c),delta=Math.floor(st.hpMax*Math.abs(deltaRate));const before=st.hp;if(deltaRate>=0)st.hp=Math.min(st.hpMax,st.hp+delta);else st.hp=Math.max(0,st.hp-delta);if(st.hp<=0)clearStatesOnKo(c);total+=Math.abs(st.hp-before);});return total; }
  const INITIAL_WEAPON_IDS=["stone_claw","dagger","stone_axe","hinoki_staff","short_bow","whip","type_milesta"];
  const YODY_TIER_WEAPON_IDS=["bronze_knuckle","traveler_sword","bronze_axe","traveler_bow","bronze_whip","hunter"];
  const YODY_SHIELD_IDS=["wood_shield","stone_greatshield","buckler"];
  const YODY_BODY_IDS=["milesta_clothes","leather_armor","traveler_clothes","bronze_mail","mage_robe"];
  const TILENO_TIER_WEAPON_IDS=["bronze_knuckle","traveler_sword","bronze_axe","mage_staff","traveler_bow","bronze_whip","hunter"];
  const TILENO_BODY_IDS=["traveler_clothes","bronze_mail","mage_robe"];
  const BASIC_DRINK_IDS=["polishDrink","guardDrink","magicDrink","blockDrink","quickDrink"];
  const GRANZEL_TIER_EQUIP_IDS=["steel_claw","iron_sword","steel_axe","iron_bow","iron_rod","iron_whip","type_zel","iron_buckler","iron_greatshield","iron_mail"];
  const GRANZEL_TIER_WEAPON_IDS=["steel_claw","iron_sword","steel_axe","iron_bow","iron_rod","iron_whip","type_zel"];
  const RUNEL_TIER_EQUIP_IDS=["silver_knuckle","silver_sword","silver_axe","silver_bow","silver_rod","silver_whip","type_runel","silver_shield","runel_clothes","silver_mail","magical_cloth"];
  function grantPlainsChestReward(){
    const roll=Math.random()*100;
    if(roll<35){const g=5+rand(26);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<60){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
    if(roll<75){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<87){if(!returnFeatherUnlocked()){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<89){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
    if(roll<90.5){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
    if(roll<92){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<99.5){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";
  }
  function grantCaveChestReward(layer=1){
    const roll=Math.random()*100;
    if(layer===1){
      if(roll<32){const g=5+rand(31);addRunGold(g);return `${g}G を手に入れた！`;}
      if(roll<54){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
      if(roll<67){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
      if(roll<77){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
      if(roll<79){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
      if(roll<81){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
      if(roll<83){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
      if(roll<84.5){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
      if(roll<86){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
      if(roll<92.5){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
      if(roll<93){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
      const id=INITIAL_WEAPON_IDS[Math.min(6,Math.floor(roll-93))]; addEquipmentOwned(id,1); return `${equipmentCatalog[id].name} を手に入れた！`;
    }
    if(roll<30){const g=10+rand(31);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<48){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
    if(roll<59){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<67){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<70){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<74){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<76){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
    if(roll<77.5){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
    if(roll<79){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<85){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<85.5){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<92.5){const id=INITIAL_WEAPON_IDS[Math.min(6,Math.floor(roll-85.5))];addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<94.5){addItemCount("polishDrink",1);return "ポリッシュドリンク ×1 を手に入れた！";}
    if(roll<96.5){addItemCount("guardDrink",1);return "ガードドリンク ×1 を手に入れた！";}
    if(roll<98){addEquipmentOwned("paw_hand",1);return "肉球ハンド を手に入れた！";}
    addEquipmentOwned("ragged_robe",1);return "ボロボロローブ を手に入れた！";
  }
  function grantYodyRegionNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<26){const g=15+rand(36);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<41){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
    if(roll<50){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<57){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<60){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<64){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<71.5){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<73.5){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
    if(roll<75){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
    if(roll<76.5){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<82.5){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<83){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<88){const id=choose(INITIAL_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<92){const id=choose(YODY_TIER_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<96){const id=choose(YODY_SHIELD_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    const id=choose(YODY_BODY_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  const LIMITED_MAP_TREASURES={
    caveSide:[
      {key:"caveSide:leather_armor",kind:"equip",id:"leather_armor"},
      {key:"caveSide:gas_mask",kind:"equip",id:"gas_mask"}
    ],
    yodyRegion:[
      {key:"yodyRegion:magic_earrings",kind:"equip",id:"magic_earrings"}
    ],
    footpath:[
      {key:"footpath:lightning_rod",kind:"equip",id:"lightning_rod"}
    ],
    yodyMountain:[
      {key:"yodyMountain:life_seed",kind:"item",id:"lifeSeed"},
      {key:"yodyMountain:mage_robe",kind:"equip",id:"mage_robe"}
    ],
    tilenoRegion:[
      {key:"tilenoRegion:phoenix_feather",kind:"item",id:"phoenixTail"}
    ],
    tilenoWetland:[
      {key:"tilenoWetland:magic_condense_grass",kind:"item",id:"magicCondenseGrass"}
    ],
    tilenoToxicWetland:[
      {key:"tilenoToxicWetland:poison_gloves",kind:"equip",id:"poison_gloves"},
      {key:"tilenoToxicWetland:iron_whip",kind:"equip",id:"iron_whip"}
    ],
    zelrenoForest:[
      {key:"zelrenoForest:delicious_milk",kind:"item",id:"deliciousMilk"},
      {key:"zelrenoForest:magic_seed",kind:"item",id:"magicSeed"},
      {key:"zelrenoForest:training_sash",kind:"equip",id:"training_sash"}
    ],
    granzelPlains:[
      {key:"granzelPlains:growth_crystal",kind:"equip",id:"growth_crystal"}
    ],
    runelCavern:[
      {key:"runelCavern:void_membrane",kind:"equip",id:"void_membrane"},
      {key:"runelCavern:spirit_seed",kind:"item",id:"spiritSeed"}
    ],
    runelRegion:[
      {key:"runelRegion:clean_ball",kind:"item",id:"cleanBall"}
    ],
    runelRuins:[
      {key:"runelRuins:lightning_rod",kind:"equip",id:"lightning_rod"},
      {key:"runelRuins:phoenix_feather",kind:"item",id:"phoenixTail"}
    ]
  };
  function updateExploreTreasureCounter(){
    const counter=$("exploreTreasureCounter");
    if(!counter) return;
    const area=state.run?.area;
    const entries=area ? (LIMITED_MAP_TREASURES[area]||[]) : [];
    if(!entries.length){
      counter.hidden=true;
      return;
    }
    const found=entries.reduce((count,entry)=>count+(state.limitedMapTreasures?.[entry.key]?1:0),0);
    counter.textContent=`🪎 お宝 ${found}/${entries.length}`;
    counter.hidden=false;
  }

  function grantLimitedMapTreasure(area){
    if(!state.limitedMapTreasures || typeof state.limitedMapTreasures!=="object") state.limitedMapTreasures={};
    const remaining=(LIMITED_MAP_TREASURES[area]||[]).filter(entry=>!state.limitedMapTreasures[entry.key]);
    if(!remaining.length) return null;
    const entry=choose(remaining);
    state.limitedMapTreasures[entry.key]=true;
    updateExploreTreasureCounter();
    const data=entry.kind==="equip"?equipmentCatalog[entry.id]:ITEMS[entry.id];
    if(entry.kind==="equip") addEquipmentOwned(entry.id,1); else addItemCount(entry.id,1);
    return `✨ お宝！ ${data?.name||entry.id} を手に入れた！`;
  }
  function grantCaveSideChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.caveSide||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("caveSide");
      if(treasure) return treasure;
    }
    return grantCaveChestReward(2);
  }
  function grantYodyRegionChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.yodyRegion||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("yodyRegion");
      if(treasure) return treasure;
    }
    return grantYodyRegionNormalChestReward();
  }
  function grantFootpathChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.footpath||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("footpath");
      if(treasure) return treasure;
    }
    return grantYodyRegionNormalChestReward();
  }
  function grantYodyMountainNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<23){const g=15+rand(36);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<35){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
    if(roll<41){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<50){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<57){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<60){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<64){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<71.5){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<73.5){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
    if(roll<75){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
    if(roll<76.5){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<82.5){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<83){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<88){const id=choose(INITIAL_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<92){const id=choose(YODY_TIER_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<96){const id=choose(YODY_SHIELD_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    const id=choose(YODY_BODY_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantTilenoRegionNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<22.5){const g=25+rand(41);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<32.5){addItemCount("potion",1);return "ポーション ×1 を手に入れた！";}
    if(roll<41.5){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<49.5){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<55.5){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<59.5){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<64.5){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<70.5){addItemCount("panacea",1);return "万能薬 ×1 を手に入れた！";}
    if(roll<78.5){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<79.5){addEquipmentOwned("hunter_charm",1);return "狩人の御守りを手に入れた！";}
    if(roll<80.5){addEquipmentOwned("light_shoes",1);return "身軽なシューズを手に入れた！";}
    if(roll<81.5){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<83.5){addEquipmentOwned("magic_earrings",1);return "魔法のイヤリングを手に入れた！";}
    if(roll<89.5){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<90){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<95){const id=choose(TILENO_TIER_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<97){addEquipmentOwned("buckler",1);return "バックラーを手に入れた！";}
    const id=choose(TILENO_BODY_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantGranzelPlainsNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<28){const g=40+rand(51);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<40){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<48){addItemCount("panacea",1);return "万能薬 ×1 を手に入れた！";}
    if(roll<54){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<59){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<65){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<73){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<74){addItemCount("poisonGasBottle",1);return "毒ガス瓶 ×1 を手に入れた！";}
    if(roll<75){addItemCount("smokeBomb",1);return "煙幕玉 ×1 を手に入れた！";}
    if(roll<76){addItemCount("sealingCrystal",1);return "封印の水晶 ×1 を手に入れた！";}
    if(roll<77){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<78){addEquipmentOwned("magic_earrings",1);return "魔法のイヤリングを手に入れた！";}
    if(roll<79){addEquipmentOwned("gas_mask",1);return "防毒マスクを手に入れた！";}
    if(roll<80){addEquipmentOwned("night_vision_glasses",1);return "暗視グラスを手に入れた！";}
    if(roll<81){addEquipmentOwned("barrier_charm",1);return "結界の護符を手に入れた！";}
    if(roll<87){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<87.5){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<91.5){const id=choose(TILENO_TIER_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<93){addEquipmentOwned("buckler",1);return "バックラーを手に入れた！";}
    if(roll<95){const id=choose(TILENO_BODY_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    const id=choose(GRANZEL_TIER_EQUIP_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantRunelCavernNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<28){const g=50+rand(61);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<42){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<51){addItemCount("panacea",1);return "万能薬 ×1 を手に入れた！";}
    if(roll<57){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<63){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<70){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<78){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<79){addItemCount("poisonGasBottle",1);return "毒ガス瓶 ×1 を手に入れた！";}
    if(roll<80){addItemCount("smokeBomb",1);return "煙幕玉 ×1 を手に入れた！";}
    if(roll<81){addItemCount("sealingCrystal",1);return "封印の水晶 ×1 を手に入れた！";}
    if(roll<82){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<83){addEquipmentOwned("magic_earrings",1);return "魔法のイヤリングを手に入れた！";}
    if(roll<84){addEquipmentOwned("gas_mask",1);return "防毒マスクを手に入れた！";}
    if(roll<85){addEquipmentOwned("night_vision_glasses",1);return "暗視グラスを手に入れた！";}
    if(roll<86){addEquipmentOwned("barrier_charm",1);return "結界の護符を手に入れた！";}
    if(roll<92){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<92.5){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    const id=choose(GRANZEL_TIER_EQUIP_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantRunelCavernChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.runelCavern||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("runelCavern");
      if(treasure) return treasure;
    }
    return grantRunelCavernNormalChestReward();
  }
  function grantRunelRegionNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<30){const g=60+rand(61);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<44){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<53){addItemCount("panacea",1);return "万能薬 ×1 を手に入れた！";}
    if(roll<59){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<65){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<72){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<79){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<80){addItemCount("poisonGasBottle",1);return "毒ガス瓶 ×1 を手に入れた！";}
    if(roll<81){addItemCount("smokeBomb",1);return "煙幕玉 ×1 を手に入れた！";}
    if(roll<82){addItemCount("sealingCrystal",1);return "封印の水晶 ×1 を手に入れた！";}
    if(roll<83){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<84){addEquipmentOwned("magic_earrings",1);return "魔法のイヤリングを手に入れた！";}
    if(roll<85){addEquipmentOwned("gas_mask",1);return "防毒マスクを手に入れた！";}
    if(roll<86){addEquipmentOwned("night_vision_glasses",1);return "暗視グラスを手に入れた！";}
    if(roll<87){addEquipmentOwned("barrier_charm",1);return "結界の護符を手に入れた！";}
    if(roll<93){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<93.5){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<97){const id=choose(GRANZEL_TIER_EQUIP_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    const id=choose(RUNEL_TIER_EQUIP_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantRunelRegionChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.runelRegion||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("runelRegion");
      if(treasure) return treasure;
    }
    return grantRunelRegionNormalChestReward();
  }
  function grantRunelRuinsChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.runelRuins||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("runelRuins");
      if(treasure) return treasure;
    }
    return grantRunelRegionNormalChestReward();
  }
  function grantGranzelPlainsChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.granzelPlains||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("granzelPlains");
      if(treasure) return treasure;
    }
    return grantGranzelPlainsNormalChestReward();
  }
  function grantTilenoRegionChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.tilenoRegion||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("tilenoRegion");
      if(treasure) return treasure;
    }
    return grantTilenoRegionNormalChestReward();
  }
  function grantTilenoWetlandChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.tilenoWetland||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("tilenoWetland");
      if(treasure) return treasure;
    }
    return grantTilenoRegionNormalChestReward();
  }
  function grantTilenoToxicWetlandNormalChestReward(){
    const roll=Math.random()*100;
    if(roll<24){const g=40+rand(51);addRunGold(g);return `${g}G を手に入れた！`;}
    if(roll<36){addItemCount("highPotion",1);return "ハイポーション ×1 を手に入れた！";}
    if(roll<44){addItemCount("panacea",1);return "万能薬 ×1 を手に入れた！";}
    if(roll<50){addItemCount("returnFeather",1);return "帰還の羽 ×1 を手に入れた！";}
    if(roll<55){addItemCount("lifeStone",1);return "命の石 ×1 を手に入れた！";}
    if(roll<61){addItemCount("magicHerb",1);return "マジックハーブ ×1 を手に入れた！";}
    if(roll<69){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<75){addItemCount("antidote",1);return "毒消し草 ×1 を手に入れた！";}
    if(roll<78){addItemCount("poisonGasBottle",1);return "毒ガス瓶 ×1 を手に入れた！";}
    if(roll<79){addEquipmentOwned("fate_ring",1);return "運命の指輪を手に入れた！";}
    if(roll<80){addEquipmentOwned("magic_earrings",1);return "魔法のイヤリングを手に入れた！";}
    if(roll<83){addEquipmentOwned("gas_mask",1);return "防毒マスクを手に入れた！";}
    if(roll<89){const id=choose(NORMAL_SEED_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1 を手に入れた！`;}
    if(roll<89.5){addItemCount("allSeed",1);return "全能の種 ×1 を手に入れた！";}
    if(roll<92.5){const id=choose(TILENO_TIER_WEAPON_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    if(roll<93.5){addEquipmentOwned("buckler",1);return "バックラーを手に入れた！";}
    if(roll<95){const id=choose(TILENO_BODY_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;}
    const id=choose(GRANZEL_TIER_EQUIP_IDS);addEquipmentOwned(id,1);return `${equipmentCatalog[id].name} を手に入れた！`;
  }
  function grantTilenoToxicWetlandChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.tilenoToxicWetland||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("tilenoToxicWetland");
      if(treasure) return treasure;
    }
    return grantTilenoToxicWetlandNormalChestReward();
  }
  function grantZelrenoForestChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.zelrenoForest||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("zelrenoForest");
      if(treasure) return treasure;
    }
    return grantTilenoRegionNormalChestReward();
  }
  function grantYodyMountainChestReward({allowTreasure=true}={}){
    const remaining=(LIMITED_MAP_TREASURES.yodyMountain||[]).some(entry=>!state.limitedMapTreasures?.[entry.key]);
    if(allowTreasure && remaining && Math.random()<.30){
      const treasure=grantLimitedMapTreasure("yodyMountain");
      if(treasure) return treasure;
    }
    return grantYodyMountainNormalChestReward();
  }
  function grantChestReward({allowTreasure=true}={}){
    if(state.run?.area==="caveSide") return grantCaveSideChestReward({allowTreasure});
    if(state.run?.area==="yodyRegion") return grantYodyRegionChestReward({allowTreasure});
    if(state.run?.area==="footpath") return grantFootpathChestReward({allowTreasure});
    if(state.run?.area==="yodyMountain") return grantYodyMountainChestReward({allowTreasure});
    if(state.run?.area==="tilenoRegion") return grantTilenoRegionChestReward({allowTreasure});
    if(state.run?.area==="tilenoWetland") return grantTilenoWetlandChestReward({allowTreasure});
    if(state.run?.area==="tilenoToxicWetland") return grantTilenoToxicWetlandChestReward({allowTreasure});
    if(state.run?.area==="zelrenoForest" || state.run?.area==="zelrenoForestDeep") return grantZelrenoForestChestReward({allowTreasure});
    if(state.run?.area==="granzelPlains") return grantGranzelPlainsChestReward({allowTreasure});
    if(state.run?.area==="runelCavern") return grantRunelCavernChestReward({allowTreasure});
    if(state.run?.area==="runelRegion") return grantRunelRegionChestReward({allowTreasure});
    if(state.run?.area==="runelRuins") return grantRunelRuinsChestReward({allowTreasure});
    return state.run?.area==="cave"?grantCaveChestReward(state.run.caveLayer):grantPlainsChestReward();
  }
  function markDesertDogRestPolish(){
    if(!travelPartyIds().includes("desertDog")) return false;
    const c=roster.desertDog;
    if(!c || traitOf(c)?.effect?.type!=="nextBattlePolishFromHealNode") return false;
    c._desertDogPolishPending=true;
    return true;
  }

  function tryDiggingReward(){
    if(!travelPartyIds().includes("dog")) return null;
    const trait=characterProfiles.dog?.trait;
    if(trait?.id!=="digging" || Math.random()>=(Number(trait.chance)||0)) return null;
    return grantChestReward({allowTreasure:false});
  }

  function resolvePlainsEvent(){
    const heroName=roster.hero.name; const event=rand(7);
    if(event===0){ const g=8+rand(18);addRunGold(g);modal("？ 旅人の落とし物",`草むらに小さな革袋が落ちている。

${g}G を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return; }
    if(event===1){ const id=Math.random()<.60?"potion":"antidote";addItemCount(id,1);modal("？ 薬草の群生地",`道端に、薬に使えそうな薬草が生えている。

${ITEMS[id].name} ×1 を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return; }
    if(event===2){ const id=returnFeatherUnlocked()?"returnFeather":"potion"; addItemCount(id,1);modal("？ 壊れた荷車",`壊れた荷車のそばに包みが残されている。\n\n${ITEMS[id].name} ×1 を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return; }
    if(event===3){ modal("？ あやしいキノコ","見たことのない色鮮やかなキノコが生えている。\n食べてみますか？",[["はい",()=>{if(Math.random()<.50){const n=applyPartyHpPercent(.30);closeModal();updateRunHud();modal("🍄 あやしいキノコ",`不思議と力が湧いてきた。
同行メンバー全員のHPが30%回復した。`,[["進む",()=>{closeModal();updateRunHud();}]]);}else{applyPartyHpPercent(-.20);closeModal();updateRunHud();modal("🍄 あやしいキノコ","強烈な刺激が身体を駆け巡った！\n同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",()=>{closeModal();updateRunHud();}]]);}}],["いいえ",()=>{closeModal();modal("？ あやしいキノコ",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);return; }
    if(event===4){ modal("？ 困っている老人","道端で老人が荷物を散らかして困っている。",[["助ける",()=>{const r=Math.random();let reward;if(r<.70){const g=20+rand(21);addRunGold(g);reward=`${g}G を受け取った。`;}else if(r<.95){addItemCount("potion",1);reward="ポーション ×1 を受け取った。";}else{addEquipmentOwned("hunter_charm",1);reward="狩人の御守りを受け取った！";}closeModal();modal("？ 困っている老人",`「おお、助かったよ。ありがとうな」

${reward}`,[["進む",()=>{closeModal();updateRunHud();}]]);}],["先を急ぐ",()=>{closeModal();modal("？ 困っている老人",`${heroName}たちは先を急いだ。`,[["進む",closeModal]]);}]]);return; }
    if(event===5){ modal("？ 獣の痕跡","獣の痕跡のようなものを見つけた。",[["気にせず進む",()=>{closeModal();modal("⚔ 獣の痕跡","犬娘たちが襲いかかってきた！",[["戦う",()=>{closeModal();openBattle(true,"eventDogs");}]]);}],["急いで走り抜ける",()=>{applyPartyHpPercent(-.10,true);closeModal();updateRunHud();modal("？ 獣の痕跡",`${heroName}たちは急いでその場を走り抜けた。
バトルメンバー全員が最大HPの10%ダメージを受けた。`,[["進む",closeModal]]);}]]);return; }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);
  }

  function damageActivePercent(rate){
    let total=0;
    state.battleActive.forEach(id=>{const c=roster[id];if(!c)return;const st=S(c),d=Math.max(1,Math.floor(st.hpMax*rate)),before=st.hp;st.hp=Math.max(0,st.hp-d);if(st.hp<=0)clearStatesOnKo(c);total+=Math.max(0,before-st.hp);});
    return total;
  }
  function damageFrontPercent(rate){
    const id=state.battleActive[0],c=roster[id]; if(!c)return 0;
    const st=S(c),d=Math.max(1,Math.floor(st.hpMax*rate)),before=st.hp;st.hp=Math.max(0,st.hp-d);if(st.hp<=0)clearStatesOnKo(c);return Math.max(0,before-st.hp);
  }
  function recoverTravelMpFlat(amount){
    let total=0; travelPartyMembers().forEach(c=>{const st=S(c),before=st.mp;st.mp=Math.min(st.mpMax,st.mp+amount);total+=st.mp-before;});return total;
  }
  function rewardSlugGift(){
    const r=Math.random(); const id=r<.50?"potion":r<.90?"returnFeather":"lifeStone";
    addItemCount(id,1); return `${ITEMS[id].name} ×1 を手に入れた！`;
  }
  function resolveCaveEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      modal("？ 光る地面","地面が光っている。調べてみますか？",[["はい",()=>{const herb=Math.random()<.05;let reward;if(herb){addItemCount("magicHerb",1);reward="マジックハーブ ×1 を手に入れた！";}else{const g=10+rand(21);addRunGold(g);reward=`${g}G を手に入れた！`;}closeModal();modal("✨ 光る地面",reward,[["進む",()=>{closeModal();updateRunHud();}]]);}],["いいえ",()=>{closeModal();modal("？ 光る地面",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]]);return;
    }
    if(event===1){
      modal("？ 滴る雫","天井から、ほのかに光を放つ雫が滴っている。飲んでみますか？",[["はい",()=>{const n=recoverTravelMpFlat(5);closeModal();updateRunHud();modal("💧 滴る雫",`同行メンバー全員のMPが5回復した。
合計 MP +${n}`,[["進む",closeModal]]);}],["いいえ",()=>{closeModal();modal("？ 滴る雫",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]]);return;
    }
    if(event===2){
      modal("？ 置き去りのビン","中身の入ったビンが地面に転がっている。拾いますか？",[["はい",()=>{if(Math.random()<.70){const r=Math.random(),id=r<.70?"potion":r<.80?"highPotion":r<.90?"polishDrink":"guardDrink";addItemCount(id,1);closeModal();modal("🧪 置き去りのビン",`${ITEMS[id].name} ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}else{damageActivePercent(.10);closeModal();updateRunHud();modal("💥 置き去りのビン","ビンが突然爆発した！\nバトルメンバー全員が最大HPの10%ダメージを受けた。",[["進む",closeModal]]);}}],["いいえ",()=>{closeModal();modal("？ 置き去りのビン",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]]);return;
    }
    if(event===3){
      const id=state.battleActive[0],name=roster[id]?.name||heroName; damageFrontPercent(.30); updateRunHud();
      modal("🪨 落石",`落石だ！
${name}が最大HPの30%ダメージを受けた。`,[["進む",closeModal]]);return;
    }
    if(event===4){
      const hasAntidote=itemCount("antidote")>0;
      modal("？ ナメクジの集会","ナメクジ娘たちが集会している……。",[
        ["突っ切る",()=>{closeModal();modal("⚔ ナメクジの集会","ナメクジ娘たちが襲ってきた！",[["戦う",()=>{closeModal();openBattle(true,"caveSlugEvent");}]]);}],
        ["迂回する",()=>{closeModal();modal("？ ナメクジの集会",`${heroName}たちは迂回して進むことにした。`,[["進む",closeModal]]);}],
        [hasAntidote?"毒消し草を差し入れする":"毒消し草を差し入れする（所持なし）",()=>{if(!removeItemCount("antidote",1))return;const reward=rewardSlugGift();closeModal();updateRunHud();modal("🐌 ナメクジの集会",`ナメクジ娘たちからお礼をもらった！
${reward}`,[["進む",closeModal]]);},"",!hasAntidote]
      ]);return;
    }
    if(event===5){
      const fate=activeFateTotal();
      if(fate%2!==0){modal("？ 不思議な手招き","何者かがこちらに手招きしている……。\nしかし見失ってしまった……。",[["進む",closeModal]]);return;}
      const reward=grantChestReward(); updateRunHud(); modal("？ 不思議な手招き",`何者かを追った先で、宝箱を発見した！
${reward}`,[["進む",closeModal]]);return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);
  }

  function rerollForestDeepUnvisitedNodes(){
    const nodes=remainingModifiableNodes();
    const pool=["battle","chest","heal","event"];
    nodes.forEach(n=>n.type=choose(pool));
    renderMap();updateRunHud();
    return nodes.length;
  }

  function resolveZelrenoForestDeepEvent(){
    const heroName=roster.hero.name;
    const roll=rand(7);
    if(roll<5){
      modal("👻 ゴースト娘の視線","ゴースト娘が暗闇からこちらを見ている。",[
        ["近付く",()=>{closeModal();modal("👻 ゴースト娘の視線","ゴースト娘は襲いかかってきた！",[["戦う",()=>{closeModal();openRunBattle("zelrenoForestDeep",{formationIndex:5,special:"zelrenoGhostGaze"});}]]);}],
        ["立ち去る",()=>{closeModal();modal("？ ゴースト娘の視線",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);
      return;
    }
    if(roll===5){
      if(activeFateTotal()%2===0){
        modal("？ 不思議な手招き",`何者かがこちらに手招きしている……。

しかし見失ってしまった……。`,[["進む",closeModal]]);
      }else{
        const reward=grantChestReward();
        modal("🪎 不思議な手招き",`何者かがこちらに手招きしている……。

宝箱を発見した！

${reward}`,[["進む",()=>{closeModal();updateRunHud();}]]);
      }
      return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。
${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function startRunelRuinsBossBefore(){
    startTemporaryStoryEvent([
      {type:"system",text:"壊れた城下町の真ん中を、黒い鱗の魔物娘が我が物顔で練り歩いている……。"},
      {type:"dialogue",speaker:"黒蛇",portrait:VRITRA_IMG,text:"あら、人間？\nとっても美味しそうじゃない。"},
      talkDialogue("主人公",null,null,"……！"),
      {type:"dialogue",speaker:"黒蛇",portrait:VRITRA_IMG,text:"へぇ、あなた魔縁者なのね。\nこの世界に来てたくさん食べてきたけど……魔縁者は初めてよ。"},
      {type:"dialogue",speaker:"黒蛇",portrait:VRITRA_IMG,text:"魔界の『扉』が開いてラッキーだったわ。\nこうして、極上のご馳走が頂けるんですもの！"},
      {type:"end"}
    ],{returnToTownTalk:false,after:()=>openRunBattle("runelRuins",{formationIndex:6,special:"runelRuinsBoss",escapeDisabled:true})});
  }
  function startRunelRuinsBossAfter(){
    const heroName=roster.hero.name;
    startTemporaryStoryEvent([
      {type:"dialogue",speaker:"ヴリトラ",portrait:VRITRA_IMG,text:"そんな……！\nこの私が、人間ごときに……。"},
      {type:"dialogue",speaker:"ヴリトラ",portrait:VRITRA_IMG,text:"魔界に帰らないと……でも、『扉』が……。"},
      {type:"system",text:"ヴリトラはその場に倒れ込み、気絶した。"},
      talkDialogue("主人公",null,null,"…………"),
      {type:"narration",text:"…………"},
      {type:"system",text:`${heroName}は静まり返った周辺を、くまなく調べた。\nしかし、エリザが運び込まれた痕跡は見つからない。`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"system",text:"結局、手がかりは得られなかった。\nグランゼル城にいるマーガレットに一度報告するべきかもしれない。"},
      {type:"end"}
    ],{returnToTownTalk:false,after:()=>{
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags.runelRuinsBossDefeated=true;
      state.eventFlags.runelRuinsCleared=true;
      state.eventFlags.margaretRunelReportPending=true;
      state.currentTown="runel";
      state.selectedArea="runelTown";
      finishRun("ルネルの街へ帰還しました");
    }});
  }

  function startZelrenoForestDeepBossBefore(){
    if(state.eventFlags?.zelrenoForestDeepCleared) return;
    const heroName=roster.hero.name;
    const steps=[
      {type:"narration",text:"<ゼルレーノ森林地帯奥地>"},
      {type:"system",text:"最奥には、港町ヨーディーで薬草を欲しがっていた少年、ティレーノの女冒険家、そして一匹の魔物娘がいた。"},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"エディ！今助けてあげるからね！"},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"ちょっ、姉さん！一回落ち着いて……"},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`落ち着けるわけないでしょ！
さあ、悪しき魔物娘！覚悟しなさい！`},
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`はぁ……本っ当に話を聞かない人間ね。
いいわ。話を聞く気にさせてあげる。`},
      {type:"system",text:"魔物娘も臨戦体勢に入った。"},
      {type:"system",text:`女冒険家は、背後の${heroName}の存在に気付いた。`},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`あ！来てくれたのね！
さあ、協力してあの悪い魔物娘を倒すわよ！`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`え？ここは自分に任せてほしい？
な、何言ってるのよ！？`},
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`ふぅん、あなた……魔縁者？
面白そうじゃない。お手並み拝見と行こうかしら？`},
      talkDialogue("主人公",null,null,"……！"),
      {type:"system",text:"魔物娘は問答無用で襲いかかってきた！"},
      {type:"end"}
    ];
    startTemporaryStoryEvent(steps,{returnToTownTalk:false,after:()=>openRunBattle("zelrenoForestDeepBoss",{special:"zelrenoForestDeepBoss",escapeDisabled:true})});
  }

  function startZelrenoForestDeepBossAfter(){
    if(!state.eventFlags) state.eventFlags={};
    const heroName=roster.hero.name;
    const steps=[
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`……っ！
やるじゃない。私の負けよ。`},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"す、すごい……ほんとに倒しちゃった。"},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"だ、大丈夫ですか！？"},
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`ええ、大丈夫よ。
ほんの手合わせみたいなものだしね。`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:"私、昔は魔縁者と一緒に旅をしていたの。"},
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`でも、その人はとっくに死んじゃって。
それからはずっとこの森で暮らしてたから……
人間たちの世界がどうなってるのか、少し気になったのよ。`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:`……それで、たまたま出会った僕が、時々こうして会って、街のこととか話してるんです。`},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"え？じゃあ、攫われたわけじゃないの？"},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"違うよ。"},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"…………"},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`で、でもダメ！
事情は事情でも、子供がこんな所まで来たら危ないでしょ！お姉ちゃん心配したんだから！`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"姉さん……"},
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`まあ、それはそうよね。
ごめんなさい。今度からはもっと街の近くで会うことにするわ。それでいいかしら？`},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:"……それなら、まあ。"},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"魔物娘",portrait:IRON_OWL_IMG,text:`じゃあもう帰りなさい。
エディも。お姉さんに心配かけちゃダメよ。`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"は、はい！また今度……！"},
      {type:"system",text:"三人はその場を後にした。"},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"……ごめんね、姉さん。"},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`ほんとよ！
でも、エディが無事でよかったわ。`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:"……うん。"},
      {type:"system",text:`女冒険家は、くるりと${heroName}の方に向き直った。`},
      {type:"dialogue",speaker:"女冒険家",portrait:IMG.karen,text:`あなたもありがとうね！
私、ちょっと後先考えないところがあるから、助かったわ！`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:`あ、そうでした。今更ですが、こちらが僕の姉のカレンです。
前は、毒の魔物娘を倒しに行く途中で盛大に転んで怪我をしてしまって……。`},
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`ちょ、ちょっと！
そんなことまで言わなくていいの！`},
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`……こほん。
とにかく、怪我が早く治ったから、あなたにお礼したいの！`},
      talkDialogue("主人公",null,null,"……？"),
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`私があなたの旅について行くっていうのはどう！？
ちょっと後先考えないけど、頼りになるよ！`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:`姉さん……それは迷惑だよ。
ちょっとじゃないし。`},
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`エディは黙ってて。
ね、いいでしょ？はい、決まり！ついて行くからね！`},
      talkDialogue("主人公",null,null,"……！？"),
      {type:"system",text:"カレンが強引に仲間に加わった！",effects:[{type:"joinKaren"}]},
      {type:"system",text:"📌カレンは、他の仲間と同様にミレスタに待機させることができます。"},
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`ねえ、ところであなた、名前は？
……${heroName}っていうのね。なんで旅してるの？`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`えっ！？
エリザって、あのミレスタのエリザさん！？`},
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`私、実はあの人のファンなの！
凄腕の剣士！見る者を魅了するような美貌！はあ、憧れる！`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"カレン",portrait:IMG.karen,text:`エリザさんのためなら、私も頑張っちゃうからね！
よろしく、${heroName}！`},
      {type:"dialogue",speaker:"エディ",silhouette:NPC_BOY_IMG,silhouetteTone:"male",text:`……${heroName}さん、姉がご迷惑おかけします。
旅、頑張ってくださいね。`},
      {type:"end"}
    ];
    startTemporaryStoryEvent(steps,{returnToTownTalk:false,after:()=>{
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags.zelrenoForestDeepCleared=true;
      state.currentTown="tileno";
      state.selectedArea="tilenoTown";
      finishRun("ティレーノの街へ帰還しました");
    }});
  }

  function startTilenoToxicBossAfter(){
    if(!state.eventFlags) state.eventFlags={};
    const heroName=roster.hero.name;
    const steps=[
      {type:"dialogue",speaker:"毒の魔物娘",portrait:TENTACLE_IMG,text:"そ、そんな……この私がっ……！"},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"毒の魔物娘",portrait:TENTACLE_IMG,text:"ここらの冒険者なんて、大したことないって聞いてたのに……あの女……！"},
      {type:"system",text:"毒の魔物娘はヨロヨロと後退ると、湿原から逃げて行った。"},
      {type:"system",text:"ティレーノ湿原に巣食う毒の魔物娘を撃退した！"},
      travelingWithMonsterGirl()
        ? {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`素晴らしい……！\n魔縁者の力、私が見込んだとおりですわ。`}
        : {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`まさか、貴方お一人の力で倒してしまわれるとは……。\nま、まあいいでしょう。私が見込んだとおりの実力ですわ。`},
      talkDialogue("主人公",null,null,"……！"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`申し訳ございません。\n危険だとは分かっていましたが、どうしても魔縁者の力をこの目で見てみたかったのです。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`父は、あの魔物娘は魔縁者の手先だと言っていました。\n最後に『あの女』と言っていましたが、それが魔縁者……？`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`謎は残りましたが、ともかくこれで解決です。\n湿原も、時間はかかりますがいずれ元の姿を取り戻すことでしょう。`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ええ、分かっていますよ。\nエリザさんの件、ちゃんと調べましたわ。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:"……グランゼル城から、不審な『荷物』が運び出されました。"},
      talkDialogue("主人公",null,null,"……？"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`通常の輸送を装ってはいますが、王国軍が護衛として何人もついていました。\n戦争一歩手前だというのに……です。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`そして、私は私兵が確かに聞いたそうです。\n護衛が『エリザ』という名前を口にした、と。`},
      talkDialogue("主人公",null,null,"……！"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`この輸送に、エリザさんが関わっている可能性は高いと思われます。\nしかし……輸送先が問題です。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:"ルネル地方……グランゼル城から南東の方角にある、旧ルネルパリオ領。"},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`追跡した私兵によれば、『荷物』と護衛は、ルネルパリオ城下町跡で急に姿を消したとか。`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`城下町跡には、ルネルの黒蛇と呼ばれる、凶悪な魔物娘が出没します。\n魔界から来たとも噂される……非常に強力な種族です。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`ここを調べるとなれば、遭遇は免れないでしょう。\nそれでも……貴方は行くのですね？`},
      talkDialogue("主人公",null,null,"…………"),
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……そうですか。\n私にできることはここまで。貴方の無事を祈っております。`},
      {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:"無事に調査を終えたら、ぜひまたグランゼル城にいらしてくださいね。"},
      {type:"system",text:"マーガレットは柔らかく微笑んでお辞儀をすると、踵を返した。"}
    ];
    if(state.eventFlags?.yodyBoyQuestCompleted){
      steps.push(
        {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`……そういえば、ティレーノの街で、貴方を捜している姉弟を見かけましたわ。\nルネル地方に向かう前に、会いに行ってはどうでしょうか？`},
        {type:"dialogue",speaker:"マーガレット",portrait:MARGARET_IMG,text:`それでは、必ずまたお会いしましょう。\n幸運を祈りますわ。`},
        {type:"system",text:"マーガレットは優雅に去って行った。"}
      );
    }else{
      steps.push({type:"system",text:"マーガレットはそのまま優雅に去って行った。"});
    }
    steps.push(
      talkDialogue("主人公",null,null,"…………"),
      {type:"system",text:`${heroName}はティレーノの街へと帰還した。`},
      {type:"end"}
    );
    startTemporaryStoryEvent(steps,{returnToTownTalk:false,after:()=>{
      if(!state.eventFlags) state.eventFlags={};
      state.eventFlags.tilenoToxicBossDefeated=true;
      state.eventFlags.margaretPoisonQuestCompleted=true;
      state.eventFlags.runelStoryLeadKnown=true;
      state.eventFlags.tilenoToxicBossAfterStoryDone=true;
      state.currentTown="tileno";
      state.selectedArea="tilenoTown";
      finishRun("ティレーノの街へ帰還しました");
    }});
  }

  function openRunBattle(area,options={}){
    const trapped=!!state.run?.slugTrapActive;
    if(trapped) state.run.slugTrapActive=false;
    openBattle(true,area,{...options,escapeDisabled:!!options.escapeDisabled||trapped});
    if(trapped) setTimeout(()=>toast("粘液が足に絡み、この戦闘では逃走できない！"),80);
  }

  function resolveCaveSideEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      modal("？ 不安定な岩壁","ひび割れた岩壁の隙間に、何か光るものが見える。手を伸ばしますか？",[
        ["手を伸ばす",()=>{const r=Math.random();let result;if(r<.80){const g=30+rand(31);addRunGold(g);result=`${g}G を手に入れた！`;}else if(r<.90){addItemCount("magicHerb",1);result="マジックハーブ ×1 を手に入れた！";}else{const id=state.battleActive[0],name=roster[id]?.name||heroName;damageFrontPercent(.15);result=`岩が崩れてきた！\n${name}が最大HPの15%ダメージを受けた。`;}closeModal();updateRunHud();modal("🪨 不安定な岩壁",result,[["進む",closeModal]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 不安定な岩壁",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===1){
      if(state.run) state.run.slugTrapActive=true;
      modal("🐌 ナメクジトラップ","ネバネバの粘液を踏んでしまった！\n次の戦闘では逃走できない。",[["進む",closeModal]]);return;
    }
    if(event===2){
      modal("？ 置き去りのビン","中身の入ったビンが地面に転がっている。拾いますか？",[["はい",()=>{if(Math.random()<.70){const r=Math.random(),id=r<.70?"potion":r<.80?"highPotion":r<.90?"polishDrink":"guardDrink";addItemCount(id,1);closeModal();modal("🧪 置き去りのビン",`${ITEMS[id].name} ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}else{damageActivePercent(.10);closeModal();updateRunHud();modal("💥 置き去りのビン","ビンが突然爆発した！\nバトルメンバー全員が最大HPの10%ダメージを受けた。",[["進む",closeModal]]);}}],["いいえ",()=>{closeModal();modal("？ 置き去りのビン",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]]);return;
    }
    if(event===3){
      const id=state.battleActive[0],name=roster[id]?.name||heroName;damageFrontPercent(.30);updateRunHud();
      modal("🪨 落石",`落石だ！\n${name}が最大HPの30%ダメージを受けた。`,[["進む",closeModal]]);return;
    }
    if(event===4){
      modal("？ 蜘蛛の巣","蜘蛛の巣にアイテムが引っかかっている……。",[
        ["手を伸ばす",()=>{const reward=grantChestReward({allowTreasure:false});closeModal();updateRunHud();modal("🕸️ 蜘蛛の巣",`${heroName}たちは${reward.replace(" を手に入れた！","")} を入手した！\n\nアラクネたちが襲ってきた！`,[["戦う",()=>{closeModal();openRunBattle("caveSide",{formationIndex:4});}]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 蜘蛛の巣",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      const fate=activeFateTotal();
      if(fate%2!==0){modal("？ 不思議な手招き","何者かがこちらに手招きしている……。\nしかし見失ってしまった……。",[["進む",closeModal]]);return;}
      const reward=grantChestReward();updateRunHud();modal("？ 不思議な手招き",`何者かを追った先で、宝箱を発見した！\n${reward}`,[["進む",closeModal]]);return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);
  }

  function resolveYodyRegionEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      const g=25+rand(26);addRunGold(g);
      modal("？ 漂着した小箱",`草むらの向こうに、潮に濡れた小箱が転がっている。\n\n${g}G を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return;
    }
    if(event===1){
      const id=Math.random()<.60?"potion":"antidote";addItemCount(id,1);
      modal("？ 薬草の群生地",`道端に、薬に使えそうな薬草が生えている。\n\n${ITEMS[id].name} ×1 を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return;
    }
    if(event===2){
      if(itemCount("potion")<3){
        modal("？ 旅人との取引",`旅人はポーションを求めているようだ。しかし、${heroName}たちは力になれそうになかった。`,[["進む",closeModal]]);return;
      }
      modal("？ 旅人との取引",`旅人「なあ、あんた。ポーション3個ほどを譲ってくれないか？ お礼に要らなくなった武器をやるからさ」\n\n旅人との取引に応じますか？`,[
        ["はい（ポーション×3）",()=>{
          if(!removeItemCount("potion",3)){closeModal();return;}
          const id=Math.random()<.90?choose(INITIAL_WEAPON_IDS):choose(YODY_TIER_WEAPON_IDS);
          addEquipmentOwned(id,1);closeModal();updateRunHud();
          modal("🤝 旅人との取引",`「おお！ありがとよ！こいつがお礼の武器だ」\n\n${heroName}たちは${equipmentCatalog[id].name}を入手した！`,[["進む",closeModal]]);
        }],
        ["いいえ",()=>{closeModal();modal("？ 旅人との取引",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ あやしいキノコ","見たことのない色鮮やかなキノコが生えている。",[["はい",()=>{if(Math.random()<.50){applyPartyHpPercent(.30);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員のHPが30%回復した。",[["進む",closeModal]]);}else{applyPartyHpPercent(-.20);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);}}],["いいえ",()=>{closeModal();modal("？ あやしいキノコ",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);return;
    }
    if(event===4){
      modal("？ 心地良い潮風","心地良い潮風が吹いている。深呼吸をしますか？",[
        ["深呼吸する",()=>{const healed=applyPartyHpPercent(.20),lost=Math.min(20,Math.max(0,state.gold));state.gold-=lost;closeModal();updateRunHud();modal("🌊 心地良い潮風",`新鮮な空気で体力が回復した！\n同行メンバー全員のHPが20%回復した。\n\n……しかし、野鳥が襲ってきてお金を少し盗んでいった……。\n${lost}G を失った。`,[["進む",closeModal]]);}],
        ["先を急ぐ",()=>{closeModal();modal("？ 心地良い潮風",`${heroName}たちは先を急ぐことにした。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("？ きれいな花？","きれいな花が咲いている。",[
        ["触ってみる",()=>{closeModal();modal("🌺 きれいな花？","花は突然動き出した！\nなんと、その正体はアルラウネだった！\n\n※アルラウネの敵データは未実装のため、戦闘は現在保留されています。",[["進む",closeModal]]);}],
        ["匂いを嗅ぐ",()=>{applyPartyHpPercent(.10);let cured=0;travelPartyMembers().forEach(c=>{if(conditionsOf(c).poison){conditionsOf(c).poison=false;cured++;}});closeModal();updateRunHud();modal("🌸 きれいな花？",`とても癒される香りだった！\n同行メンバー全員のHPが10%回復した。${cured?"\n毒状態が解除された。":""}`,[["進む",closeModal]]);}],
        ["立ち去る",()=>{closeModal();modal("？ きれいな花？",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);
  }

  function changeLivingTravelHpPercent(rate){
    let total=0;
    travelPartyMembers().forEach(c=>{
      const st=S(c);if(st.hp<=0)return;
      const amount=Math.floor(st.hpMax*Math.abs(rate)),before=st.hp;
      st.hp=rate>=0?Math.min(st.hpMax,st.hp+amount):Math.max(0,st.hp-amount);
      if(st.hp<=0)clearStatesOnKo(c);
      total+=Math.abs(st.hp-before);
    });
    return total;
  }
  function changeLivingTravelMpPercent(rate){
    let total=0;
    travelPartyMembers().forEach(c=>{
      const st=S(c);if(st.hp<=0)return;
      const amount=Math.floor(st.mpMax*Math.abs(rate)),before=st.mp;
      st.mp=rate>=0?Math.min(st.mpMax,st.mp+amount):Math.max(0,st.mp-amount);
      total+=Math.abs(st.mp-before);
    });
    return total;
  }
  function changeLivingActiveHpPercent(rate){
    let total=0;
    state.battleActive.forEach(id=>{
      const c=roster[id]; if(!c)return; const st=S(c); if(st.hp<=0)return;
      const amount=Math.floor(st.hpMax*Math.abs(rate)),before=st.hp;
      st.hp=rate>=0?Math.min(st.hpMax,st.hp+amount):Math.max(0,st.hp-amount);
      if(st.hp<=0)clearStatesOnKo(c);
      total+=Math.abs(st.hp-before);
    });
    return total;
  }
  function reduceLivingActiveMp(flat){
    let total=0;
    state.battleActive.forEach(id=>{
      const c=roster[id];if(!c)return;const st=S(c);if(st.hp<=0)return;
      const before=st.mp;st.mp=Math.max(0,st.mp-Math.max(0,flat));total+=before-st.mp;
    });
    return total;
  }
  function resolveTilenoToxicWetlandEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=40+rand(51);addRunGold(g);modal("？ 冒険者の落とし物",`冒険者が逃げた際に落として行ったと思われる荷物が置いてある……。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("highPotion",1);modal("？ 冒険者の落とし物","冒険者が逃げた際に落として行ったと思われる荷物が置いてある……。\n\nハイポーション ×1 を手に入れた！",[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      let poisoned=0;
      state.battleActive.forEach(id=>{
        const c=roster[id]; if(!c || S(c).hp<=0) return;
        const rank=resistanceRankFor(c,"poison");
        if(traitOf(c)?.effect?.type==="poisonImmuneShockCertain") return;
        if(RESISTANCE_RANK_ORDER.indexOf(rank)<=RESISTANCE_RANK_ORDER.indexOf("C")){conditionsOf(c).poison=true;poisoned++;}
      });
      updateRunHud();
      modal("☠️ 毒ガス",poisoned?`うわっ！地面から毒ガスが噴き出した！\n\n毒耐性C以下のバトルメンバーが毒状態になった。`:`うわっ！地面から毒ガスが噴き出した！\n\nしかし、バトルメンバーは毒を防いだ。`,[["進む",closeModal]]);return;
    }
    if(event===2){
      modal("？ 毒沼のお宝","毒沼の中に何か光るものが見える……。手を突っ込んでみますか？",[
        ["はい",()=>{
          const hero=roster.hero;if(hero&&S(hero).hp>0)conditionsOf(hero).poison=true;
          closeModal();updateRunHud();
          if(Math.random()<.50){
            const r=Math.random();let reward;
            if(r<.50){addItemCount("highPotion",1);reward="ハイポーション ×1";}
            else if(r<.80){addItemCount("lifeStone",1);reward="命の石 ×1";}
            else if(r<.96){addEquipmentOwned("fate_ring",1);reward="運命の指輪";}
            else{addItemCount("changeCube",1);reward="チェンジキューブ ×1";}
            modal("✨ 毒沼のお宝",`${heroName}は毒に侵された！\n\n${heroName}は${reward}を入手した！`,[["進む",closeModal]]);
          }else modal("🪨 毒沼のお宝",`${heroName}は毒に侵された！\n\nただの石ころだった……。`,[["進む",closeModal]]);
        }],
        ["いいえ",()=>{closeModal();modal("？ 毒沼のお宝",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      const hasAntidote=itemCount("antidote")>0,hasFeather=itemCount("returnFeather")>0;
      modal("？ 倒れた冒険者",`冒険者が倒れている。\n\n「た、頼む……毒消し草か、帰還の羽を……。」`,[
        [hasAntidote?"毒消し草を渡す":"毒消し草を渡す（所持なし）",()=>{
          if(!removeItemCount("antidote",1))return;
          const g=100+rand(51);addRunGold(g);closeModal();updateRunHud();
          modal("冒険者",`「あ、ありがとう……助かった。これはお礼だ。俺はなんとかして帰るよ……。」\n\n${heroName}は${g}Gをもらった！`,[["進む",closeModal]]);
        },"",!hasAntidote],
        [hasFeather?"帰還の羽を渡す":"帰還の羽を渡す（所持なし）",()=>{
          if(!removeItemCount("returnFeather",1))return;
          const r=Math.random();let reward;
          if(r<.30){addItemCount("magicHerb",1);reward="マジックハーブ ×1";}
          else if(r<.50){addItemCount("poisonGasBottle",1);reward="毒ガス瓶 ×1";}
          else if(r<.70){addItemCount("smokeBomb",1);reward="煙幕玉 ×1";}
          else if(r<.90){addItemCount("sealingCrystal",1);reward="封印の水晶 ×1";}
          else{const id=choose(GRANZEL_TIER_WEAPON_IDS);addEquipmentOwned(id,1);reward=equipmentCatalog[id].name;}
          closeModal();updateRunHud();
          modal("冒険者",`「あ、ありがとう……これ、お礼……」\n冒険者は帰還の羽で飛び立った！\n${heroName}は${reward}をもらった！`,[["進む",closeModal]]);
        },"",!hasFeather],
        ["立ち去る",()=>{closeModal();modal("？ 倒れた冒険者",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("？ 美しいキノコ","毒沼の隅に美しいキノコが生えている。食べてみますか？",[
        ["はい",()=>{
          if(Math.random()<.50){
            changeLivingTravelHpPercent(.30);let cured=0;travelPartyMembers().forEach(c=>{if(S(c).hp>0&&conditionsOf(c).poison){conditionsOf(c).poison=false;cured++;}});
            closeModal();updateRunHud();modal("🍄 美しいキノコ",`同行メンバー全員のHPが30%回復した。\n毒状態が解除された。`,[["進む",closeModal]]);
          }else{
            changeLivingTravelHpPercent(-.20);closeModal();updateRunHud();modal("🍄 美しいキノコ","同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);
          }
        }],
        ["いいえ",()=>{closeModal();modal("？ 美しいキノコ",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      const hasAntidote=itemCount("antidote")>0;
      modal("？ 毒沼から覗く顔","毒沼の中からポイズンスライム娘が顔を覗かせている。",[
        ["挨拶する",()=>{
          const r=Math.random();let reward;
          if(r<.50){const g=50+rand(51);addRunGold(g);reward=`${g}G`;}
          else if(r<.96){addItemCount("panacea",1);reward="万能薬 ×1";}
          else{const ids=NORMAL_SEED_IDS.filter(id=>id!=="fateSeed");const id=choose(ids);addItemCount(id,1);reward=`${ITEMS[id].name} ×1`;}
          closeModal();updateRunHud();modal("☠️ 毒沼から覗く顔",`ポイズンスライム娘はびっくりして毒沼の中に姿を消した……。\n何か置いて行ったようだ。\n\n${heroName}は${reward}を入手した！`,[["進む",closeModal]]);
        }],
        [hasAntidote?"毒消し草を渡す":"毒消し草を渡す（所持なし）",()=>{
          if(!removeItemCount("antidote",1))return;closeModal();updateRunHud();
          modal("💢 毒沼から覗く顔","ポイズンスライム娘は怒って飛び出してきた！",[["戦う",()=>{closeModal();openRunBattle("tilenoToxicSlimeEvent");}]]);
        },"",!hasAntidote],
        ["立ち去る",()=>{closeModal();modal("？ 毒沼から覗く顔",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が毒沼に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function resolveZelrenoForestEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=30+rand(31);addRunGold(g);modal("？ 森の落とし物",`おや？木の根元に何か落ちている。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("panacea",1);modal("？ 森の落とし物",`おや？木の根元に何か落ちている。\n\n万能薬 ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      modal("🦉 狩人の視線","フクロウ娘の視線を感じる……。",[
        ["無視する",()=>{reduceLivingActiveMp(3);closeModal();updateRunHud();modal("🦉 狩人の視線",`精神的に疲れた……。\nバトルメンバー全員のMPが3減った。`,[["進む",closeModal]]);}],
        ["駆け抜ける",()=>{changeLivingActiveHpPercent(-.10);closeModal();updateRunHud();modal("🦉 狩人の視線",`全速力で駆け抜けて視線を振り切った！\nバトルメンバー全員が最大HPの10%ダメージを受けた。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===2){
      if(state.run) state.run.pendingForestSilence=true;
      modal("✨ 危険な鱗粉",`あやしい鱗粉を吸い込んでしまった！\n\n次の戦闘開始時、バトルメンバー全員が耐性を無視して封印状態になる。`,[["進む",closeModal]]);return;
    }
    if(event===3){
      modal("🧪 魔法の小瓶","「ご自由にどうぞ」と書かれた紙とともに、液体の入った小瓶が置かれている。",[
        ["飲む",()=>{const r=Math.random();if(r<.60){changeLivingTravelHpPercent(.30);closeModal();updateRunHud();modal("🧪 魔法の小瓶",`身体に力が満ちてきた！\n同行メンバー全員のHPが30%回復した。`,[["進む",closeModal]]);}else if(r<.80){changeLivingTravelMpPercent(.10);closeModal();updateRunHud();modal("🧪 魔法の小瓶",`魔力が湧いてきた！\n同行メンバー全員のMPが10%回復した。`,[["進む",closeModal]]);}else{changeLivingTravelHpPercent(-.20);closeModal();updateRunHud();modal("💥 魔法の小瓶",`小瓶は爆発した！\n同行メンバー全員が最大HPの20%ダメージを受けた。`,[["進む",closeModal]]);}}],
        ["立ち去る",()=>{closeModal();modal("？ 魔法の小瓶",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("🧙 魔女の宴","フォレストメイジたちが大釜を囲んで魔法を唱えている。",[
        ["近づく",()=>{closeModal();modal("🧙 魔女の宴","フォレストメイジたちは襲いかかってきた！",[["戦う",()=>{closeModal();openRunBattle("zelrenoWitchApproach");}]]);}],
        ["見守る",()=>{closeModal();modal("🫕 魔女の宴",`なんと大釜から魔物娘が湧き出てきた！\n\nスライム娘、ポイズンスライム娘、スライムベス娘、スライム娘が現れた！`,[["戦う",()=>{closeModal();openRunBattle("zelrenoWitchWatch");}]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 魔女の宴",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      if(activeFateTotal()%2===0){modal("？ 不思議な手招き",`何者かがこちらに手招きしている……。\n\nしかし見失ってしまった……。`,[["進む",closeModal]]);}
      else{const reward=grantChestReward();modal("🪎 不思議な手招き",`何者かの姿を追った先で……\n宝箱を発見した！\n\n${reward}`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function granzelTravelerReward(){
    const r=Math.random();
    if(r<.30){addItemCount("returnFeather",1);return "帰還の羽 ×1";}
    if(r<.60){addItemCount("lifeStone",1);return "命の石 ×1";}
    if(r<.70){addItemCount("magicHerb",1);return "マジックハーブ ×1";}
    if(r<.90){const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1`;}
    addItemCount("cleanBall",1);return "まっさらだま ×1";
  }
  function activeLivingHasIceAttackMagic(){
    return state.battleActive.some(id=>{
      const c=roster[id];
      return !!c && S(c).hp>0 && knownSkills(c).some(sk=>sk?.kind==="magic" && sk?.element==="ice");
    });
  }
  function resolveRunelCavernEvent(){
    const heroName=roster.hero.name;
    const event=weightedChoice([
      {type:0,weight:11},{type:1,weight:11},{type:2,weight:6},{type:3,weight:11},{type:4,weight:11},{type:5,weight:10},{type:6,weight:10}
    ]);
    if(event===0){
      modal("？ 光る地面","地面が光っている。調べてみますか？",[
        ["はい",()=>{let result;if(Math.random()<.95){const g=50+rand(61);addRunGold(g);result=`${g}G を手に入れた！`;}else{addItemCount("magicHerb",1);result="マジックハーブ ×1 を手に入れた！";}closeModal();updateRunHud();modal("✨ 光る地面",result,[["進む",closeModal]]);}],
        ["いいえ",()=>{closeModal();modal("？ 光る地面",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===1){
      modal("？ 武器の残骸","冒険者が捨てて行ったと思しき武器の残骸が散らばっている。まだ使える物もあるかもしれない。",[
        ["漁る",()=>{
          closeModal();
          if(Math.random()<.50){
            const ids=Math.random()<.80?TILENO_TIER_WEAPON_IDS:GRANZEL_TIER_WEAPON_IDS,id=choose(ids);
            addEquipmentOwned(id,1);updateRunHud();
            modal("⚔ 武器の残骸",`${heroName}は${equipmentCatalog[id].name}を入手した！`,[["進む",closeModal]]);
          }else{
            const c=roster.hero,st=S(c),damage=st.hp>0?Math.floor(st.hpMax*.05):0;
            if(damage>0){st.hp=Math.max(0,st.hp-damage);if(st.hp<=0)clearStatesOnKo(c);}
            updateRunHud();
            modal("🩸 武器の残骸","残骸の破片が手に刺さって痛い！使えそうな物は無かった……。",[["進む",closeModal]]);
          }
        }],
        ["立ち去る",()=>{closeModal();modal("？ 武器の残骸",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===2){
      const canTrade=itemCount("returnFeather")>0;
      modal("？ 迷子の冒険者？",`「なあ、道に迷って帰れなくなっちまって……帰還の羽をくれないか？こんな物しかあげられないが……」

冒険者は、ポーションを差し出している。`,[
        [canTrade?"交換する":"交換する（帰還の羽なし）",()=>{
          if(!removeItemCount("returnFeather",1))return;
          closeModal();updateRunHud();
          modal("？ 迷子の冒険者？",`「へへ、ありがとよ！じゃあな！」

冒険者は帰還の羽をひったくると、一目散にその足で逃げていった…。
ポーションは偽物の粗悪品だった。`,[["進む",closeModal]]);
        },null,!canTrade],
        ["立ち去る",()=>{closeModal();modal("？ 迷子の冒険者？",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      const id=state.battleActive[0],name=roster[id]?.name||heroName;damageFrontPercent(.30);updateRunHud();
      modal("🪨 落石",`落石だ！
${name}が最大HPの30%ダメージを受けた。`,[["進む",closeModal]]);return;
    }
    if(event===4){
      modal("？ 壺？","すごく大きな壺が置かれている。",[
        ["中を覗いてみる",()=>{closeModal();modal("🐙 壺？","なんと、中にはスキュラたちがぎっしり詰まっていた！",[["戦う",()=>{closeModal();openRunBattle("runelScyllaPot");}]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 壺？",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      if(activeFateTotal()%2===0){
        const reward=grantChestReward();updateRunHud();
        modal("？ 不思議な手招き",`何者かがこちらに手招きしている…。

追いかけた先で宝箱を発見した！
${reward}`,[["進む",closeModal]]);
      }else{
        modal("？ 不思議な手招き","何者かがこちらに手招きしている…。\n\nしかし見失ってしまった……。",[["進む",closeModal]]);
      }
      return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。
${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function damageHeroPercent(rate){
    const c=roster.hero,st=S(c);if(!c||!st)return 0;
    const d=Math.max(1,Math.floor(st.hpMax*rate)),before=st.hp;
    st.hp=Math.max(0,st.hp-d);if(st.hp<=0)clearStatesOnKo(c);
    return Math.max(0,before-st.hp);
  }
  function resolveRunelRuinsEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.10){addItemCount("highPotion",1);modal("？ 城下町跡の落とし物",`おや？建物のかげに何か落ちている。\n\nハイポーション ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{const g=70+rand(71);addRunGold(g);modal("？ 城下町跡の落とし物",`おや？建物のかげに何か落ちている。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      modal("？ 置き去りのビン","中身の入ったビンが地面に転がっている。拾いますか？",[
        ["はい",()=>{
          if(Math.random()<.70){const id=Math.random()<.70?"highPotion":choose(BASIC_DRINK_IDS);addItemCount(id,1);closeModal();modal("🧪 置き去りのビン",`${ITEMS[id].name} ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
          else{damageActivePercent(.10);closeModal();updateRunHud();modal("💥 置き去りのビン","ビンが突然爆発した！\nバトルメンバー全員が最大HPの10%ダメージを受けた。",[["進む",closeModal]]);}
        }],
        ["いいえ",()=>{closeModal();modal("？ 置き去りのビン",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===2){
      modal("？ 古代の呪い","土偶娘がこちらを見つめている……。",[
        ["見つめ返す",()=>{state.run.ruinsCursePending=true;closeModal();updateRunHud();modal("👁 古代の呪い",`${heroName}は呪われてしまった！`,[["進む",closeModal]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 古代の呪い",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      const payChoice=["代金80Gを置いて持って行く",()=>{state.gold-=80;addItemCount("panacea",1);changeLivingTravelHpPercent(.20);changeLivingTravelMpPercent(.20);closeModal();updateRunHud();modal("🏚️ 壊れた道具屋",`「ありがとう……。」\n${heroName}たちは万能薬を入手した！\n不思議な力でHPとMPが回復した！`,[["進む",closeModal]]);},null,state.gold<80];
      modal("？ 壊れた道具屋","壊れた道具屋のカウンターに、万能薬が置かれている。",[
        ["持って行く",()=>{addItemCount("panacea",1);closeModal();updateRunHud();modal("🏚️ 壊れた道具屋",`${heroName}たちは万能薬を入手した！`,[["進む",closeModal]]);}],
        payChoice,
        ["立ち去る",()=>{closeModal();modal("？ 壊れた道具屋",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("？ 古びた銃","古びた銃が転がっている。少し修理すれば使えそうだ。",[
        ["修理する",()=>{
          if(Math.random()<.70){const r=Math.random(),id=r<.45?"hunter":r<.85?"type_zel":"type_runel";addEquipmentOwned(id,1);closeModal();updateRunHud();modal("🔫 古びた銃",`${heroName}たちは${equipmentCatalog[id].name}を入手した！`,[["進む",closeModal]]);}
          else{damageHeroPercent(.20);closeModal();updateRunHud();modal("💥 古びた銃","古びた銃は爆発した！\n主人公が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);}
        }],
        ["立ち去る",()=>{closeModal();modal("？ 古びた銃",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("？ 妖狐のいたずら","道の真ん中に、もふもふの尻尾が生えた怪しすぎる命の石が落ちている……。",[
        ["拾ってみる",()=>{closeModal();modal("🦊 妖狐のいたずら","命の石は妖狐だった！",[["戦う",()=>{closeModal();openRunBattle("runelRuinsKitsuneTrick");}]]);}],
        ["立ち去る",()=>{closeModal();modal("？ 妖狐のいたずら",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠がぽつりと立っている。",[["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}], ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]]);
  }

  function resolveRunelRegionEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=60+rand(61);addRunGold(g);modal("？ ルネル地方の落とし物",`おや？草むらのかげに何か落ちている。

${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("highPotion",1);modal("？ ルネル地方の落とし物",`おや？草むらのかげに何か落ちている。

ハイポーション ×1 を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      const nodes=remainingModifiableNodes(),pool=["battle","chest","heal","event"];
      nodes.forEach(n=>n.type=choose(pool));renderMap();updateRunHud();
      modal("？ 入り組んだ地形",`地形が入り組んでいる……。
${heroName}たちは道に迷ってしまった。`,[["進む",closeModal]]);return;
    }
    if(event===2){
      const canSell=itemCount("lifeStone")>0;
      modal("？ 旅人の取引",`「なあ、あんた。命の石を250Gで売ってくれないか？どうしても入用なんだ。悪い話じゃないだろ？」`,[
        [canSell?"売る":"売る（命の石なし）",()=>{if(!removeItemCount("lifeStone",1))return;addRunGold(250);closeModal();updateRunHud();modal("💰 旅人の取引",`「おお、ありがとう！助かるぜ！」

${heroName}たちは命の石と引き換えに250G受け取った！`,[["進む",closeModal]]);},null,!canSell],
        ["立ち去る",()=>{closeModal();modal("？ 旅人の取引",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ 遺骨ときのこ","遺骨の近くに、見たことのないキノコが生えている。食べますか？",[
        ["はい",()=>{
          closeModal();
          if(Math.random()<.50){const healed=changeLivingTravelHpPercent(.70);updateRunHud();modal("🍄 遺骨ときのこ",`不思議な力が身体に満ちた！
同行メンバー全員のHPが70%回復した。`,[["進む",closeModal]]);}
          else{const c=roster.hero,st=S(c);st.hp=0;clearStatesOnKo(c);updateRunHud();modal("☠️ 遺骨ときのこ",`${heroName}はその場に倒れた！
${heroName}は戦闘不能になった。`,[["進む",closeModal]]);}
        }],
        ["いいえ",()=>{closeModal();modal("？ 遺骨ときのこ",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("🚚 旅は道連れ",`通りすがりの荷馬車が、少し先まで乗せてくれることになった！
乗りますか？`,[
        ["乗る",()=>{if(state.run)state.run.wagonRideActive=true;closeModal();renderMap();updateRunHud();toast("次の段階の好きなノードを選べます");}],
        ["断る",()=>{closeModal();modal("？ 旅は道連れ",`${heroName}たちは自分の足で歩くことにした。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("🎵 魔物娘の歌声","ポダルゲとマーメイドがきれいな歌声を披露している。",[
        ["拍手する",()=>{closeModal();modal("🎵 魔物娘の歌声","魔物娘たちはにこやかに手を振って立ち去った。",[["進む",closeModal]]);}],
        ["立ち去る",()=>{closeModal();modal("⚔ 魔物娘の歌声","魔物娘たちは怒って襲いかかってきた！",[["戦う",()=>{closeModal();openRunBattle("runelRegionSong");}]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。
${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function resolveGranzelPlainsEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=40+rand(51);addRunGold(g);modal("？ 大平原の落とし物",`おや？草むらのかげに何か落ちている。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("highPotion",1);modal("？ 大平原の落とし物","おや？草むらのかげに何か落ちている。\n\nハイポーション ×1 を手に入れた！",[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      changeLivingTravelHpPercent(.10);updateRunHud();
      modal("🌬️ 心地よい風","気持ちのいい風が吹いている……。\n\n同行メンバー全員のHPが10%回復した。",[["進む",closeModal]]);return;
    }
    if(event===2){
      if(itemCount("highPotion")<=0){
        modal("？ 行き倒れた旅人",`「た、助けてくれ……メイドデビルにやられて……もうお婿に行けない……。」\n\n旅人にしてあげられることはなさそうだ……。\n${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);return;
      }
      modal("？ 行き倒れた旅人",`「た、助けてくれ……メイドデビルにやられて……もうお婿に行けない……。」\n\nハイポーションを渡しますか？`,[
        ["はい",()=>{removeItemCount("highPotion",1);const reward=granzelTravelerReward();closeModal();updateRunHud();modal("🧳 行き倒れた旅人",`「ふぅ……。助かったよ、ありがとう。お礼にこれをあげるよ。君も気を付けろよ」\n\n${heroName}は${reward}をもらった！`,[["進む",closeModal]]);}],
        ["いいえ",()=>{closeModal();modal("？ 行き倒れた旅人",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ スライムの行列","スライム娘たちが一列に並んで歩いている。",[
        ["眺める",()=>{
          if(Math.random()<.50){changeLivingTravelHpPercent(.20);closeModal();updateRunHud();modal("💧 スライムの行列","可愛らしい光景に癒された！\n同行メンバー全員のHPが20%回復した。",[["進む",closeModal]]);return;}
          const r=Math.random(),idx=r<.30?0:r<.60?1:r<.90?2:3;
          closeModal();modal("⚔ スライムの行列","スライム娘たちはこちらに気付いて襲いかかってきた！",[["戦う",()=>{closeModal();openRunBattle("granzelSlimeParade",{formationIndex:idx});}]]);
        }],
        ["迂回する",()=>{closeModal();modal("？ スライムの行列",`${heroName}たちは迂回して進むことにした。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("🚚 旅は道連れ","通りすがりの荷馬車が、少し先まで乗せてくれることになった！\n乗りますか？",[
        ["乗る",()=>{if(state.run)state.run.wagonRideActive=true;closeModal();renderMap();updateRunHud();toast("次の段階の好きなノードを選べます");}],
        ["断る",()=>{closeModal();modal("？ 旅は道連れ",`${heroName}たちは自分の足で歩くことにした。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("🐍 ラミアのしっぽ","ん？ラミアの尻尾を踏んづけてしまった！",[["進む",()=>{
        const safe=activeLivingHasIceAttackMagic();closeModal();
        if(safe) modal("🐍 ラミアのしっぽ","ラミアはこちらを睨むと、不機嫌そうに去って行った……。",[["進む",closeModal]]);
        else modal("⚔ ラミアのしっぽ","ラミアは怒って襲いかかってきた！",[["戦う",()=>{closeModal();openRunBattle("granzelPlains",{formationIndex:1});}]]);
      }]]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function resolveTilenoRegionEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=30+rand(31);addRunGold(g);modal("？ 冒険者の落とし物",`おや？草むらのかげに何か落ちている。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("highPotion",1);modal("？ 冒険者の落とし物","おや？草むらのかげに何か落ちている。\n\nハイポーション ×1 を手に入れた！",[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      changeLivingTravelHpPercent(.10);updateRunHud();
      modal("🌬️ 心地よい風","気持ちのいい風が吹いている……。\n\n同行メンバー全員のHPが10%回復した。",[["進む",closeModal]]);return;
    }
    if(event===2){
      modal("？ 冒険者ギルド職員","冒険者ギルド職員です！そこのあなた！旅の準備は怠っていませんか？今なら命の石を120Gで販売中です！",[
        ["買う",()=>{
          if(state.gold<120){closeModal();modal("冒険者ギルド職員","しかしお金が足りなかった……。",[["進む",closeModal]]);return;}
          state.gold-=120;addItemCount("lifeStone",1);updateRunHud();closeModal();
          modal("冒険者ギルド職員",`「それではどうぞ！」\n${heroName}は命の石をもらった！`,[["進む",closeModal]]);
        }],
        ["買わない",()=>{closeModal();modal("冒険者ギルド職員",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ あやしいキノコ","見たことのない色鮮やかなキノコが生えている。",[
        ["はい",()=>{
          if(Math.random()<.50){changeLivingTravelHpPercent(.30);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員のHPが30%回復した。",[["進む",closeModal]]);}
          else{changeLivingTravelHpPercent(-.20);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);}
        }],
        ["いいえ",()=>{closeModal();modal("？ あやしいキノコ",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("？ 命の石","「そこのあんた。今なら命の石を100Gで売ってやるが……買うか？」",[
        ["買う",()=>{
          if(state.gold<100){closeModal();modal("？ 命の石","しかしお金が足りなかった……。",[["進む",closeModal]]);return;}
          state.gold-=100;updateRunHud();closeModal();
          modal("🪨 命の石",`「へへ、毎度。」\n${heroName}は命の石をもらった！\n\n……と思ったら、ただの石ころだった……。`,[["進む",closeModal]]);
        }],
        ["買わない",()=>{closeModal();modal("？ 命の石",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("？ 警戒するエルフ","エルフたちがこちらに警戒の視線を送っている。",[
        ["近づく",()=>{closeModal();modal("🏹 警戒するエルフ","エルフたちは戦闘体勢に入った！",[["戦う",()=>{closeModal();openRunBattle("tilenoElfEvent");}]]);}],
        ["走って立ち去る",()=>{
          const c=roster.hero,st=S(c),damage=st.hp>0?Math.floor(st.hpMax*.20):0;
          if(damage>0){st.hp=Math.max(0,st.hp-damage);if(st.hp<=0)clearStatesOnKo(c);}
          closeModal();updateRunHud();modal("🏹 警戒するエルフ",`エルフは背後から矢を放った！\n${heroName}は最大HPの20%ダメージを受けた。`,[["進む",closeModal]]);
        }],
        ["会釈して立ち去る",()=>{closeModal();modal("？ 警戒するエルフ",`エルフたちも会釈した。\n${heroName}たちはその場から立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function resolveTilenoWetlandEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      if(Math.random()<.90){const g=30+rand(31);addRunGold(g);modal("？ 冒険者の落とし物",`おや？草むらのかげに何か落ちている。\n\n${g}G を手に入れた！`,[["進む",()=>{closeModal();updateRunHud();}]]);}
      else{addItemCount("highPotion",1);modal("？ 冒険者の落とし物","おや？草むらのかげに何か落ちている。\n\nハイポーション ×1 を手に入れた！",[["進む",()=>{closeModal();updateRunHud();}]]);}
      return;
    }
    if(event===1){
      modal("🌿 湿原の薬草","湿地の水辺に、薬に使えそうな草が群生している。",[
        ["摘んでいく",()=>{
          const id=Math.random()<.85?"antidote":"magicHerb";
          addItemCount(id,1);closeModal();updateRunHud();
          modal("🌿 湿原の薬草",`${ITEMS[id].name} ×1 を手に入れた！`,[["進む",closeModal]]);
        }],
        ["そのまま進む",()=>{closeModal();modal("🌿 湿原の薬草",`${heroName}たちはそのまま先へ進んだ。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===2){
      modal("？ 冒険者ギルド職員","冒険者ギルド職員です！そこのあなた！旅の準備は怠っていませんか？今なら命の石を120Gで販売中です！",[
        ["買う",()=>{
          if(state.gold<120){closeModal();modal("冒険者ギルド職員","しかしお金が足りなかった……。",[["進む",closeModal]]);return;}
          state.gold-=120;addItemCount("lifeStone",1);updateRunHud();closeModal();
          modal("冒険者ギルド職員",`「それではどうぞ！」\n${heroName}は命の石をもらった！`,[["進む",closeModal]]);
        }],
        ["買わない",()=>{closeModal();modal("冒険者ギルド職員",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ あやしいキノコ","見たことのない色鮮やかなキノコが生えている。",[
        ["はい",()=>{
          if(Math.random()<.50){changeLivingTravelHpPercent(.30);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員のHPが30%回復した。",[["進む",closeModal]]);}
          else{changeLivingTravelHpPercent(-.20);closeModal();updateRunHud();modal("🍄 あやしいキノコ","同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);}
        }],
        ["いいえ",()=>{closeModal();modal("？ あやしいキノコ",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      modal("？ 命の石","「そこのあんた。今なら命の石を100Gで売ってやるが……買うか？」",[
        ["買う",()=>{
          if(state.gold<100){closeModal();modal("？ 命の石","しかしお金が足りなかった……。",[["進む",closeModal]]);return;}
          state.gold-=100;updateRunHud();closeModal();
          modal("🪨 命の石",`「へへ、毎度。」\n${heroName}は命の石をもらった！\n\n……と思ったら、ただの石ころだった……。`,[["進む",closeModal]]);
        }],
        ["買わない",()=>{closeModal();modal("？ 命の石",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===5){
      modal("？ 警戒するエルフ","エルフたちがこちらに警戒の視線を送っている。",[
        ["近づく",()=>{closeModal();modal("🏹 警戒するエルフ","エルフたちは戦闘体勢に入った！",[["戦う",()=>{closeModal();openRunBattle("tilenoElfEvent");}]]);}],
        ["走って立ち去る",()=>{
          const c=roster.hero,st=S(c),damage=st.hp>0?Math.floor(st.hpMax*.20):0;
          if(damage>0){st.hp=Math.max(0,st.hp-damage);if(st.hp<=0)clearStatesOnKo(c);}
          closeModal();updateRunHud();modal("🏹 警戒するエルフ",`エルフは背後から矢を放った！\n${heroName}は最大HPの20%ダメージを受けた。`,[["進む",closeModal]]);
        }],
        ["会釈して立ち去る",()=>{closeModal();modal("？ 警戒するエルフ",`エルフたちも会釈した。\n${heroName}たちはその場から立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function footpathLuckReward(){
    const r=Math.random();
    if(r<.30){addItemCount("returnFeather",1);return "帰還の羽 ×1";}
    if(r<.60){addItemCount("lifeStone",1);return "命の石 ×1";}
    if(r<.80){addItemCount("magicHerb",1);return "マジックハーブ ×1";}
    if(r<.95){addEquipmentOwned("fate_ring",1);return "運命の指輪";}
    const ids=["powerSeed","guardSeed","intellectSeed","spiritSeed","speedSeed","lifeSeed","magicSeed"];
    const id=choose(ids);addItemCount(id,1);return `${ITEMS[id].name} ×1`;
  }

  function resolveFootpathRabbitLuck(){
    const heroName=roster.hero.name;
    if(state.gold<50){
      modal("🐇 ウサギ娘の運試し","しかしお金が足りなかった……。",[["進む",closeModal]]);return;
    }
    state.gold-=50;updateHeader();
    modal("🐇 ウサギ娘の運試し","ウサギ娘はコインを投げ、どちらかの手の中に隠した。\nどちらを選びますか？",[
      ["右手",()=>resolveFootpathRabbitLuckChoice(heroName)],
      ["左手",()=>resolveFootpathRabbitLuckChoice(heroName)]
    ]);
  }

  function resolveFootpathRabbitLuckChoice(heroName){
    const successRate=Math.min(100,Math.max(0,activeFateTotal()/2));
    if(Math.random()*100<successRate){
      const reward=footpathLuckReward();closeModal();updateRunHud();
      modal("🎯 ウサギ娘の運試し",`当たり！\n${heroName}はウサギ娘から${reward}をもらった！`,[["進む",closeModal]]);
    }else{
      closeModal();modal("🐇 ウサギ娘の運試し","残念！\nウサギ娘は去っていった……。",[["進む",closeModal]]);
    }
  }

  function resolveFootpathEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      const r=Math.random();let result;
      if(r<.95){const g=25+rand(26);addRunGold(g);result=`${g}G を手に入れた！`;}
      else if(r<.98){addEquipmentOwned("wood_shield",1);result="木の盾を手に入れた！";}
      else{addEquipmentOwned("buckler",1);result="バックラーを手に入れた！";}
      modal("？ 小道の落とし物",`おや？道の真ん中に何か落ちている。\n\n${result}`,[["進む",()=>{closeModal();updateRunHud();}]]);return;
    }
    if(event===1){
      const id=Math.random()<.60?"potion":"antidote";addItemCount(id,1);
      modal("？ 薬草の群生地",`道端に、薬に使えそうな薬草が生えている。\n\n${ITEMS[id].name} ×1 を手に入れた。`,[["進む",()=>{closeModal();updateRunHud();}]]);return;
    }
    if(event===2){
      modal("？ ウサギ娘の運試し","ウサギ娘が運試しを持ちかけてきた！\n50G払って挑戦しますか？",[
        ["はい",()=>{closeModal();resolveFootpathRabbitLuck();}],
        ["いいえ",()=>{closeModal();modal("🐇 ウサギ娘の運試し",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===3){
      modal("？ 見慣れない木の実","道端の木に、見慣れない色鮮やかな実がなっている。\n食べてみますか？",[
        ["食べてみる",()=>{if(Math.random()<.50){applyPartyHpPercent(.30);closeModal();updateRunHud();modal("🍎 見慣れない木の実","甘くて元気が湧いてきた！\n同行メンバー全員のHPが30%回復した。",[["進む",closeModal]]);}else{applyPartyHpPercent(-.20);closeModal();updateRunHud();modal("🍎 見慣れない木の実","ものすごく渋い！\n同行メンバー全員が最大HPの20%ダメージを受けた。",[["進む",closeModal]]);}}],
        ["立ち去る",()=>{closeModal();modal("？ 見慣れない木の実",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===4){
      const id=state.battleActive[0],name=roster[id]?.name||heroName;damageFrontPercent(.25);updateRunHud();
      modal("🪤 獣用トラップ",`痛い！獣用トラップを踏んでしまった！\n${name}が最大HPの25%ダメージを受けた。`,[["進む",closeModal]]);return;
    }
    if(event===5){
      modal("？ きれいな花？","きれいな花が咲いている。",[
        ["触ってみる",()=>{closeModal();modal("🌺 きれいな花？","花は突然動き出した！\nなんと、その正体はアルラウネだった！",[["戦う",()=>{closeModal();openRunBattle("footpath",{formationIndex:0});}]]);}],
        ["匂いを嗅ぐ",()=>{applyPartyHpPercent(.10);let cured=0;travelPartyMembers().forEach(c=>{if(conditionsOf(c).poison){conditionsOf(c).poison=false;cured++;}});closeModal();updateRunHud();modal("🌸 きれいな花？",`とても癒される香りだった！\n同行メンバー全員のHPが10%回復した。${cured?"\n毒状態が解除された。":""}`,[["進む",closeModal]]);}],
        ["立ち去る",()=>{closeModal();modal("？ きれいな花？",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。 ",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function activeHasWindResistanceA(){
    return state.battleActive.some(id=>{
      const c=roster[id]; if(!c || S(c).hp<=0) return false;
      const rank=resistanceRankFor(c,"wind");
      return ["A","S"].includes(rank);
    });
  }
  function addMountainBattleNode(){
    if(!state.run || state.run.area!=="yodyMountain") return null;
    const currentLayer=byId(state.run.current)?.layer??-1;
    const eligible=state.run.nodes.filter(n=>
      n.layer>currentLayer && !state.run.visited.has(n.id) && ["chest","heal","event","shop"].includes(n.type)
    );
    if(!eligible.length) return null;
    const node=choose(eligible); node.type="battle";
    return node;
  }
  function damageRandomLivingActiveMp(amount=5){
    const living=state.battleActive.map(id=>roster[id]).filter(c=>c&&S(c).hp>0);
    if(!living.length) return null;
    const c=choose(living),st=S(c),lost=Math.min(Math.max(0,st.mp),amount);
    st.mp=Math.max(0,st.mp-amount);
    return {name:c.name,lost};
  }
  function mountainAbandonedCargoReward(){
    const r=Math.random();
    if(r<.40){addItemCount("potion",1);return "ポーション ×1";}
    if(r<.70){addItemCount("highPotion",1);return "ハイポーション ×1";}
    const id=choose(BASIC_DRINK_IDS);addItemCount(id,1);return `${ITEMS[id].name} ×1`;
  }
  function resolveYodyMountainEvent(){
    const heroName=roster.hero.name,event=rand(7);
    if(event===0){
      const r=Math.random();let result;
      if(r<.95){const g=25+rand(26);addRunGold(g);result=`${g}G を手に入れた！`;}
      else if(r<.98){addEquipmentOwned("wood_shield",1);result="木の盾を手に入れた！";}
      else{addEquipmentOwned("buckler",1);result="バックラーを手に入れた！";}
      modal("？ 山道の落とし物",`おや？道の真ん中に何か落ちている。\n\n${result}`,[["進む",()=>{closeModal();updateRunHud();}]]);return;
    }
    if(event===1){
      modal("？ 鉱石の露頭","岩肌に、何か光るものが見える。",[
        ["採ってみる",()=>{
          const r=Math.random();closeModal();
          if(r<.70){const g=1+rand(100);addRunGold(g);updateRunHud();modal("⛏️ 鉱石の露頭",`${g}G 分の鉱石を手に入れた！`,[["進む",closeModal]]);}
          else if(r<.75){addItemCount("lifeStone",1);updateRunHud();modal("⛏️ 鉱石の露頭","命の石 ×1 を手に入れた！",[["進む",closeModal]]);}
          else{modal("🪨 鉱石の露頭","眠っているゴーレム娘を起こしてしまった！",[["戦う",()=>{closeModal();openRunBattle("yodyMountain",{formationIndex:3});}]]);}
        }],
        ["立ち去る",()=>{closeModal();modal("？ 鉱石の露頭",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    if(event===2){
      const id=state.battleActive[0],name=roster[id]?.name||heroName;damageFrontPercent(.30);updateRunHud();
      modal("🪨 落石",`落石だ！\n${name}が最大HPの30%ダメージを受けた。`,[["進む",closeModal]]);return;
    }
    if(event===3){
      if(activeHasWindResistanceA()){
        modal("🌬️ 強風","強い風が吹きつけた！\n\n風に強い仲間のおかげで風から守られた！",[["進む",closeModal]]);
      }else{
        damageActivePercent(.15);updateRunHud();
        modal("🌬️ 強風","強い風が吹きつけた！\nバランスを崩して転倒してしまった！\n\nバトルメンバー全員が最大HPの15%ダメージを受けた。",[["進む",closeModal]]);
      }
      return;
    }
    if(event===4){
      const changed=addMountainBattleNode();renderMap();updateRunHud();
      modal("🪽 ハーピーの伝令",changed?"ハーピーに見つかった！\nハーピーはすぐさま飛び立ち、大声で仲間を呼んだ！\n\n未踏のノードが1つ戦闘ノードになった。":"ハーピーに見つかった！\nハーピーはすぐさま飛び立ち、大声で仲間を呼んだ！\n\nしかし、これ以上魔物娘が集まってくる気配はない……。",[["進む",closeModal]]);return;
    }
    if(event===5){
      modal("？ 放置された荷物","道の脇に、放置された荷物が転がっている。調べますか？",[
        ["はい",()=>{
          closeModal();
          if(Math.random()<.60){const reward=mountainAbandonedCargoReward();updateRunHud();modal("📦 放置された荷物",`${reward} を手に入れた！`,[["進む",closeModal]]);}
          else{const hit=damageRandomLivingActiveMp(5);updateRunHud();modal("😈 デーモンの罠",hit?`デーモンの罠だ！\n${hit.name}のMPが${hit.lost}減った。`:"デーモンの罠だ！\nしかしMPを失う仲間はいなかった。",[["進む",closeModal]]);}
        }],
        ["いいえ",()=>{closeModal();modal("？ 放置された荷物",`${heroName}たちはその場を立ち去った。`,[["進む",closeModal]]);}]
      ]);return;
    }
    modal("？ 古びた祠","小さな祠が草に埋もれている。",[
      ["祈る",()=>{const hit=Math.random()<.01;if(hit){const b=seedBonusOf(roster.hero);b.fate=(Number(b.fate)||0)+1;roster.hero.fate=(Number(roster.hero.fate)||0)+1;}closeModal();modal("⛩ 古びた祠",hit?`何かが変わった気がする。\n${heroName}の運命値が1上がった！`:"しかし何も起こらなかった。",[["進む",closeModal]]);}],
      ["立ち去る",()=>{closeModal();modal("？ 古びた祠",`${heroName}たちはそのまま立ち去った。`,[["進む",closeModal]]);}]
    ]);
  }

  function returnToPreviousNode(){
    if(!state.run?.previous)return; state.run.current=state.run.previous; state.run.previous=null; renderMap(); updateRunHud();
  }
  function resolveCaveSidepath(){
    if(state.eventFlags?.caveSidepathUnlocked){
      modal("🪨 崩れた岩壁","町の者たちによって岩壁が取り除かれ、横道が通れるようになっている。\n\n横道へ進みますか？",[
        ["横道へ進む",()=>{closeModal();enterCaveSidepath();}],
        ["戻る",()=>{closeModal();returnToPreviousNode();}]
      ]);
    }else{
      modal("🪨 崩れた岩壁","岩壁が崩れていて通れそうにない……。",[["戻る",()=>{closeModal();returnToPreviousNode();}]]);
    }
  }

  function resolveNode(node){
    const repeatableSpecial=node.type==="stairs" || node.type==="sidepath" || node.type==="mountainBoss" || node.type==="tilenoWetland" || node.type==="tilenoToxicWetland" || node.type==="toxicGate" || node.type==="toxicBoss" || node.type==="forestBlockedPath" || node.type==="forestDeepBoss" || node.type==="iceCorridor" || node.type==="runelCavern" || node.type==="restiaBorder" || node.type==="runelExit" || node.type==="runelTown" || node.type==="runelRuins" || node.type==="runelRuinsBoss" || node.type==="fairyGrove";
    if(state.run.resolved.has(node.id) && !repeatableSpecial) return;
    if(!repeatableSpecial) state.run.resolved.add(node.id);
    const cave=state.run.area==="cave",side=state.run.area==="caveSide",yody=state.run.area==="yodyRegion",footpath=state.run.area==="footpath",mountain=state.run.area==="yodyMountain",tileno=state.run.area==="tilenoRegion",wetland=state.run.area==="tilenoWetland",toxic=state.run.area==="tilenoToxicWetland",forest=state.run.area==="zelrenoForest",forestDeep=state.run.area==="zelrenoForestDeep",granzel=state.run.area==="granzelPlains",runel=state.run.area==="runelCavern",runelRegion=state.run.area==="runelRegion",runelRuins=state.run.area==="runelRuins",layer=state.run.caveLayer;
    switch(node.type){
      case "battle": {
        const recruitTutorialBattle=!cave && !side && !yody && !footpath && !mountain && !tileno && !wetland && !toxic && !forest && !forestDeep && !granzel && node.layer===1 && prologueStage()>=4 && !recruitTutorialDone();
        if(side) openRunBattle("caveSide");
        else if(yody) openRunBattle("yodyRegion");
        else if(footpath) openRunBattle("footpath");
        else if(mountain) openRunBattle("yodyMountain");
        else if(tileno) openRunBattle("tilenoRegion");
        else if(wetland) openRunBattle("tilenoWetland");
        else if(toxic) openRunBattle("tilenoToxicWetland");
        else if(forest) openRunBattle("zelrenoForest");
        else if(forestDeep) openRunBattle("zelrenoForestDeep");
        else if(granzel) openRunBattle("granzelPlains");
        else if(runel) openRunBattle("runelCavern");
        else if(runelRegion) openRunBattle("runelRegion");
        else if(runelRuins) openRunBattle("runelRuins");
        else if(recruitTutorialBattle) openRunBattle("plains",{formationIndex:0,special:"recruitTutorial",escapeDisabled:true});
        else if(!cave) openRunBattle("plains");
        else if(layer===1) openRunBattle("cave1");
        else openRunBattle(Math.random()<.05?"rare":"cave2");
        break;
      }
      case "chest": modal("🪎 宝箱",`宝箱を発見！
${grantChestReward()}` ,[["閉じる",()=>{closeModal();updateRunHud();}]]); break;
      case "mimicChest": modal("🪎 宝箱","宝箱はミミック娘だった！",[["戦う",()=>{closeModal();openRunBattle(runelRuins?"runelRuinsMimic":"runelCavern",runelRuins?{}:{formationIndex:5});}]]); break;
      case "heal": {
        markDesertDogRestPolish();
        const openRest=()=>modal("❤ 休息地点","ひと息つけそうな場所を見つけた。どうする？",[
          ["休息する（HP40%）",()=>{const r=recoverTravelParty(.40,0);closeModal();updateRunHud();modal("❤ 休息地点",`同行メンバー全員のHPを40%回復した。
合計 HP +${r.hpGain}`,[["出発する",closeModal]]);}],
          ["瞑想する（MP12%）",()=>{const r=recoverTravelParty(0,.12);closeModal();updateRunHud();modal("❤ 休息地点",`同行メンバー全員のMPを12%回復した。
合計 MP +${r.mpGain}`,[["出発する",closeModal]]);}],
          ["身を整える（HP20% / MP6%）",()=>{const r=recoverTravelParty(.20,.06);closeModal();updateRunHud();modal("❤ 休息地点",`同行メンバー全員のHPを20%、MPを6%回復した。
合計 HP +${r.hpGain} / MP +${r.mpGain}`,[["出発する",closeModal]]);}]
        ]);
        const diggingReward=tryDiggingReward();
        if(diggingReward){
          updateRunHud();
          modal("🐾 あなほり",`犬娘が何かを見つけた！
地面を掘り返すと……

${diggingReward}`,[["休息地点を見る",()=>{closeModal();openRest();}]]);
        }else openRest();
        break;
      }
      case "shop": openShop(side?"caveSide":yody?"yodyRegion":footpath?"footpath":mountain?"yodyMountain":tileno?"tilenoRegion":wetland?"tilenoWetland":toxic?"tilenoToxicWetland":forest?"zelrenoForest":forestDeep?"zelrenoForestDeep":granzel?"granzelPlains":runel?"runelCavern":runelRegion?"runelRegion":runelRuins?"runelRuins":cave?"cave":"plains"); break;
      case "event": side?resolveCaveSideEvent():yody?resolveYodyRegionEvent():footpath?resolveFootpathEvent():mountain?resolveYodyMountainEvent():tileno?resolveTilenoRegionEvent():wetland?resolveTilenoWetlandEvent():toxic?resolveTilenoToxicWetlandEvent():forest?resolveZelrenoForestEvent():forestDeep?resolveZelrenoForestDeepEvent():granzel?resolveGranzelPlainsEvent():runel?resolveRunelCavernEvent():runelRegion?resolveRunelRegionEvent():runelRuins?resolveRunelRuinsEvent():cave?resolveCaveEvent():resolvePlainsEvent(); break;
      case "empty": updateRunHud();toast("何も起こらなかった");break;
      case "salidPreview":
        modal("🏜️ サリード砂漠",`船を降りると、乾いた砂漠がどこまでも広がっている。

※サリード砂漠の探索内容は現在未実装です。`,[["港町ヨーディーへ戻る",()=>{closeModal();state.currentTown="yody";state.selectedArea="yodyTown";finishRun("港町ヨーディーへ戻りました");}]]);
        break;
      case "sidepath": resolveCaveSidepath(); break;
      case "stairs":
        modal("⬇ 小さな洞窟・第一層","さらに奥へ続く道がある。第二層へ進みますか？\nHP・MPなどの状態はそのまま引き継がれます。",[
          ["第二層へ進む",()=>{closeModal();enterCaveLayer(2);toast("小さな洞窟・第二層へ進んだ");}],
          ["まだ進まない",()=>{closeModal();returnToPreviousNode();}]
        ]);break;
      case "yodyPort": {
        const firstArrival=!state.eventFlags?.yodyPortReached;
        state.eventFlags.yodyPortReached=true;
        state.eventFlags.yodyRegionUnlocked=true;
        state.currentTown="yody";
        state.selectedArea="yodyTown";
        const arrivalText=firstArrival
          ? `ヨーディー地方を抜け、港町ヨーディーに到着した。\n\nこれで世界マップから「港町ヨーディー」と「ヨーディー地方」へ直接向かえるようになった。`
          : `ヨーディー地方を抜け、港町ヨーディーに到着した。`;
        modal("⚓ 港町ヨーディー",arrivalText,[["港町ヨーディーへ",()=>{closeModal();finishRun("港町ヨーディーに到着しました");}]]);
        break;
      }
      case "yodyMountain":
        if(!state.eventFlags) state.eventFlags={};
        state.eventFlags.yodyMountainUnlocked=true;
        modal("⛰️ ヨーディー山道","山脈を越え、ティレーノ地方へ続く山道が伸びている。\n\nヨーディー山道へ進みますか？",[
          ["ヨーディー山道へ進む",()=>{closeModal();enterYodyMountainFromYodyRegion();}],
          ["戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      case "mountainBoss": {
        if(state.eventFlags?.yodyMountainBossDefeated){
          state.run.mountainBossDefeated=true;
          state.run.resolved.add(node.id);
          renderMap();updateRunHud();toast("ポダルゲたちを倒した峠を通過した");
          break;
        }
        modal("👑 ヨーディー山道・峠","ひときわ強そうな魔物娘が、ハーピーたちを従えている。\nここを通るには、倒して行くしかなさそうだ。",[
          ["戦う",()=>{closeModal();openRunBattle("yodyMountainBoss",{special:"yodyMountainBoss",escapeDisabled:true});}],
          ["準備する",()=>{closeModal();renderMap();updateRunHud();}]
        ]);
        break;
      }
      case "tilenoExit":
        if(!state.eventFlags) state.eventFlags={};
        state.eventFlags.yodyMountainCleared=true;
        state.eventFlags.tilenoRegionReached=true;
        modal("★ ティレーノ地方","長い山道を越え、反対側の麓へたどり着いた。\nこの先にはティレーノ地方が広がっている。\n\nヨーディー山道を踏破した！",[
          ["ティレーノ地方へ進む",()=>{closeModal();enterTilenoRegionFromYodyMountain();}],
          ["港町ヨーディーへ戻る",()=>{closeModal();state.currentTown="yody";state.selectedArea="yodyMountain";finishRun("ヨーディー山道を踏破しました");}]
        ]);
        break;
      case "tilenoTown": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.tilenoTownReached;
        state.eventFlags.tilenoTownReached=true;
        state.eventFlags.tilenoRegionReached=true;
        const arrivalText=firstArrival
          ? `ティレーノ地方を抜け、ティレーノの街に到着した。

これで世界マップから「ティレーノの街」と「ティレーノ地方」へ直接向かえるようになった。`
          : `ティレーノ地方を抜け、ティレーノの街に到着した。`;
        modal("🏘️ ティレーノの街",arrivalText,[["ティレーノの街へ",()=>{closeModal();state.currentTown="tileno";state.selectedArea="tilenoTown";finishRun("ティレーノの街に到着しました");}]]);
        break;
      }
      case "tilenoWetland": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.tilenoWetlandReached;
        state.eventFlags.tilenoWetlandReached=true;
        const text=firstArrival
          ? "湿った風が漂う道の先に、広い湿原が見える。\n\nティレーノ湿原への道を発見した。\nこれで世界マップから直接向かえるようになった。"
          : "湿った風が漂う、ティレーノ湿原の入口にたどり着いた。";
        modal("🌾 ティレーノ湿原",text,[
          ["ティレーノ湿原へ進む",()=>{closeModal();enterTilenoWetlandFromTilenoRegion();}],
          ["戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "tilenoToxicWetland": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.tilenoToxicWetlandReached;
        state.eventFlags.tilenoToxicWetlandReached=true;
        const text=firstArrival
          ? "湿原のさらに奥から、鼻を刺すような毒気が漂ってくる。\n\nティレーノ毒湿地への道を発見した。\nこれで世界マップから直接向かえるようになった。"
          : "鼻を刺すような毒気が漂う、ティレーノ毒湿地の入口にたどり着いた。";
        modal("☠️ ティレーノ毒湿地",text,[
          ["ティレーノ毒湿地へ進む",()=>{closeModal();enterTilenoToxicWetlandFromWetland();}],
          ["湿原へ戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "toxicGate": {
        if(!state.eventFlags?.margaretPoisonQuestAccepted){
          startTemporaryStoryEvent([
            {type:"system",text:"数人の冒険者たちが遠くから一匹の魔物娘を見ている。"},
            {type:"dialogue",speaker:"冒険者",silhouette:NPC_YOUNGMAN_IMG,silhouetteTone:"male",text:`ん？君も毒の魔物娘を討伐しに来たのかい？\nそれだったら悪いな。そいつは俺たちの獲物だ。`},
            {type:"dialogue",speaker:"冒険者",silhouette:NPC_YOUNGMAN_IMG,silhouetteTone:"male",text:`これから俺たちで倒しにいくところだ。\nさ、君は毒に侵されないうちに帰るんだな。`},
            talkDialogue("主人公",null,null,"…………"),
            {type:"system",text:`冒険者たちは道を開ける気はないようだ。\nこれ以上ここにいても仕方ない。${roster.hero.name}はティレーノの街に戻ることにした。`},
            {type:"end"}
          ],{returnToTownTalk:false,after:()=>{state.currentTown="tileno";state.selectedArea="tilenoTown";finishRun("ティレーノの街へ戻りました");}});
          break;
        }
        const first=!state.eventFlags?.tilenoToxicWarningFeatherReceived;
        startTemporaryStoryEvent([
          {type:"system",text:"毒の魔物娘に挑んだ冒険者たちのものと思しき遺骨が転がっている……。\n地面には血で文字が書かれている。"},
          {type:"system",text:"つよすぎる　にげろ"},
          ...(first?[{type:"system",text:`${roster.hero.name}は帰還の羽を入手した！`,effects:[{type:"item",id:"returnFeather",amount:1},{type:"flag",key:"tilenoToxicWarningFeatherReceived",value:true}]}]:[]),
          {type:"end"}
        ],{returnToTownTalk:false,after:()=>{
          if(state.run?.area==="tilenoToxicWetland"){
            state.run.toxicGateCleared=true;
            state.run.resolved.add("TILENO_TOXIC_GATE");
            renderMap();updateRunHud();
          }
        }});
        break;
      }
      case "toxicBoss": {
        const bossWonInCurrentRun=state.run?.area==="tilenoToxicWetland" && !!state.run?.resolved?.has("TILENO_TOXIC_BOSS");
        if(state.eventFlags?.tilenoToxicBossDefeated || bossWonInCurrentRun){
          if(!state.eventFlags?.tilenoToxicBossAfterStoryDone){
            startTilenoToxicBossAfter();
            break;
          }
          modal("☠️ ティレーノ毒湿地・最奥",`毒の魔物娘はもういない。\n${roster.hero.name}はティレーノの街へと帰還した。`,[["ティレーノの街へ",()=>{closeModal();state.currentTown="tileno";state.selectedArea="tilenoTown";finishRun("ティレーノの街へ帰還しました");}]]);
          break;
        }
        startTemporaryStoryEvent([
          {type:"system",text:"毒沼の真ん中に一匹の魔物娘が佇んでいる。"},
          {type:"dialogue",speaker:"毒の魔物娘",portrait:TENTACLE_IMG,text:`あははっ！\nまた私の毒に溶かされたい人間？`},
          {type:"dialogue",speaker:"毒の魔物娘",portrait:TENTACLE_IMG,text:`何人来ようが同じよ！\nドロドロに溶かして、その肉を啜ってあげる！`},
          {type:"end"}
        ],{returnToTownTalk:false,after:()=>openRunBattle("tilenoToxicBoss",{special:"tilenoToxicBoss",escapeDisabled:true})});
        break;
      }
      case "zelrenoForest": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.zelrenoForestReached;
        state.eventFlags.zelrenoForestReached=true;
        const text=firstArrival
          ? `木々が密集し、深い森へ続く入口にたどり着いた。\n\nゼルレーノ森林地帯への道を発見した。\nこれで世界マップから直接向かえるようになった。`
          : `木々が密集する、ゼルレーノ森林地帯の入口にたどり着いた。`;
        modal("🌲 ゼルレーノ森林地帯",text,[
          ["ゼルレーノ森林地帯へ進む",()=>{closeModal();enterZelrenoForestFromTilenoRegion();}],
          ["ティレーノの街へ戻る",()=>{closeModal();state.currentTown="tileno";state.selectedArea="zelrenoForest";finishRun(firstArrival?"ゼルレーノ森林地帯への道を発見しました":"ティレーノの街へ戻りました");}]
        ]);
        break;
      }
      case "forestBlockedPath":
        if(state.eventFlags?.zelrenoForestDeepQuestStarted || state.eventFlags?.zelrenoForestDeepCleared){
          modal("🌳 倒木","倒木がどかされて、奥に進めるようになっている。",[
            ["奥地へ進む",()=>{closeModal();enterZelrenoForestDeepFromForest();}],
            ["戻る",()=>{closeModal();returnToPreviousNode();}]
          ]);
        }else{
          modal("🌳 倒木","倒木が邪魔でこの先には進めそうにない。",[["戻る",()=>{closeModal();returnToPreviousNode();}]]);
        }
        break;
      case "forestDeepBoss": {
        const bossWonInCurrentRun=state.run?.area==="zelrenoForestDeep" && !!state.run?.resolved?.has("ZELRENO_FOREST_DEEP_BOSS");
        if(state.eventFlags?.zelrenoForestDeepCleared){
          modal("🌲 ゼルレーノ森林地帯・奥地",`最奥にはもう誰もいない。`,[["戻る",()=>{closeModal();returnToPreviousNode();}]]);
          break;
        }
        if(bossWonInCurrentRun){
          startZelrenoForestDeepBossAfter();
          break;
        }
        startZelrenoForestDeepBossBefore();
        break;
      }
      case "granzelPlains": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.granzelPlainsReached;
        state.eventFlags.granzelPlainsReached=true;
        const text=firstArrival
          ? `長い森林地帯を抜けると、視界の先に広大な平原が広がっている。\n\nグランゼル大平原への道を発見した。`
          : `ゼルレーノ森林地帯を抜け、グランゼル大平原への入口にたどり着いた。`;
        modal("🌾 グランゼル大平原",text,[
          ["グランゼル大平原へ進む",()=>{closeModal();enterGranzelPlainsFromZelrenoForest();}],
          ["ティレーノの街へ戻る",()=>{closeModal();state.currentTown="tileno";state.selectedArea="zelrenoForest";finishRun(firstArrival?"グランゼル大平原への道を発見しました":"ティレーノの街へ戻りました");}]
        ]);
        break;
      }
      case "granzelTown": {
        if(!state.eventFlags) state.eventFlags={};
        state.eventFlags.granzelPlainsReached=true;
        state.eventFlags.granzelTownReached=true;
        state.currentTown="granzel";
        state.selectedArea="granzelTown";
        finishRun("グランゼル城下町に到着しました");
        break;
      }
      case "iceCorridor": {
        if(!state.eventFlags) state.eventFlags={};
        if(margaretIceMeetingPending()){
          startMargaretIceCorridorMeeting();
          break;
        }
        const firstArrival=!state.eventFlags.iceCorridorReached;
        state.eventFlags.iceCorridorReached=true;
        state.eventFlags.iceCorridorRouteUnlocked=true;
        const text=firstArrival
          ? "冷たい風が吹きつける道の先に、雪と氷に覆われた回廊の入口が見える。\n\n氷雪の回廊への道を発見した。\nこれで世界マップから入口へ直接向かえるようになった。"
          : "冷たい風が吹きつける、氷雪の回廊の入口にたどり着いた。";
        modal("❄️ 氷雪の回廊",text,[["大平原へ戻る",()=>{closeModal();returnToPreviousNode();}]]);
        break;
      }
      case "runelCavern": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.runelCavernReached;
        state.eventFlags.runelCavernReached=true;
        const text=firstArrival
          ? "岩肌がむき出しになった道の先に、大きな岩窟の入口が見える。\n\nルネル岩窟への道を発見した。\nこれで世界マップから直接向かえるようになった。"
          : "岩肌がむき出しになった、ルネル岩窟の入口にたどり着いた。";
        modal("🪨 ルネル岩窟",text,[
          ["ルネル岩窟へ進む",()=>{closeModal();enterRunelCavernFromGranzelPlains();}],
          ["大平原へ戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "restiaBorder":
        modal("🧭 レスティア国境への道","この道はルネル地方に続いていないようだ。\n本当に進みますか？",[
          ["進む",()=>{closeModal();modal("🧭 レスティア国境","岩窟の奥へ、レスティア国境方面へ続く道が伸びている。\n\n※レスティア国境方面は現在未実装です。",[["岩窟へ戻る",()=>{closeModal();returnToPreviousNode();}]]);}],
          ["戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      case "runelExit":
        modal("🍃 薫風亭","長い岩窟を抜けると、外の光が差し込んでいる。\nすぐ先には、旅人たちが休む小さな宿『薫風亭』が見える。",[
          ["薫風亭へ",()=>{closeModal();enterKunputeiFromRunelCavern();}],
          ["岩窟へ戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      case "runelTown": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.runelTownReached;
        state.eventFlags.runelRegionReached=true;
        state.eventFlags.runelTownReached=true;
        const arrivalText=firstArrival
          ? `長い道のりの先に、ルネルの街が見えてきた。

ルネルの街に到着した！
これで世界マップから「ルネルの街」へ直接向かえるようになった。`
          : `ルネル地方を抜け、ルネルの街に到着した。`;
        modal("🏘️ ルネルの街",arrivalText,[
          ["ルネルの街へ",()=>{closeModal();state.currentTown="runel";state.selectedArea="runelTown";finishRun("ルネルの街に到着しました");}],
          ["ルネル地方へ戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "fairyGrove": {
        if(!state.eventFlags) state.eventFlags={};
        state.eventFlags.fairyGroveDiscovered=true;
        modal("✨ 妖精郷への森",`${roster.hero.name}たちは森に足を踏み入れた。
しかし、いつの間にか入口に戻されていた……。`,[
          ["戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "runelRuins": {
        if(!state.eventFlags) state.eventFlags={};
        const firstArrival=!state.eventFlags.runelRuinsReached;
        state.eventFlags.runelRuinsReached=true;
        const text=firstArrival
          ? `ルネル地方の先に、崩れた建物が並ぶ広大な廃墟が見えてきた。

ルネルパリオ城下町跡への道を発見した。
これで世界マップから直接向かえるようになった。`
          : `ルネルパリオ城下町跡の入口にたどり着いた。`;
        modal("🏚️ ルネルパリオ城下町跡",text,[
          ["城下町跡へ進む",()=>{closeModal();enterRunelRuinsFromRunelRegion();}],
          ["ルネル地方へ戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      }
      case "runelRuinsBoss": {
        if(state.eventFlags?.runelRuinsCleared){
          modal("🏚️ 城下町跡・最奥","黒蛇の姿はもうない。周囲は静まり返っている。",[
            ["ルネルの街へ戻る",()=>{closeModal();state.currentTown="runel";state.selectedArea="runelTown";finishRun("ルネルの街へ帰還しました");}],
            ["戻る",()=>{closeModal();returnToPreviousNode();}]
          ]);
          break;
        }
        if(!state.eventFlags?.tilenoToxicBossDefeated){
          modal("🏚️ 城下町跡・最奥","ここには何も無いようだ。\nルネルの街に帰還することにした。",[
            ["ルネルの街へ戻る",()=>{closeModal();state.currentTown="runel";state.selectedArea="runelTown";finishRun("ルネルの街へ帰還しました");}]
          ]);
          break;
        }
        startRunelRuinsBossBefore();
        break;
      }
      case "yodyFootpath":
        if(!state.eventFlags) state.eventFlags={};
        state.eventFlags.yodyFootpathUnlocked=true;
        modal("🌲 麓の小道","山脈の麓から、木立の中へ続く小道が伸びている。\n\n麓の小道へ進みますか？",[
          ["麓の小道へ進む",()=>{closeModal();enterFootpathFromYodyRegion();}],
          ["戻る",()=>{closeModal();returnToPreviousNode();}]
        ]);
        break;
      case "healLeafGoal": {
        const already=!!state.eventFlags?.footpathHealLeafObtained;
        if(!already){
          if(!state.eventFlags) state.eventFlags={};
          state.eventFlags.footpathHealLeafObtained=true;
          addItemCount("healLeaf",1);
          modal("🍃 ヒールリーフ","小道の最奥に、傷によく効きそうな薬草が生えている。\n\nヒールリーフを手に入れた！",[["港町ヨーディーへ戻る",()=>{closeModal();state.currentTown="yody";state.selectedArea="footpath";finishRun("ヒールリーフを手に入れ、港町ヨーディーへ戻りました");}]]);
        }else{
          modal("🍃 麓の小道・最奥","以前ヒールリーフを採った場所だ。\nもう採れそうなヒールリーフは残っていない。",[["港町ヨーディーへ戻る",()=>{closeModal();state.currentTown="yody";state.selectedArea="footpath";finishRun("港町ヨーディーへ戻りました");}]]);
        }
        break;
      }
      case "goal":
        if(side){
          state.eventFlags.caveSidepathCleared=true;
          modal("★ 洞窟の横道・出口","長い横道を抜け、洞窟の外へ出た。\n先にはヨーディー方面へ続く土地が広がっている。",[
            ["ヨーディー地方へ進む",()=>{closeModal();enterYodyRegionFromSideCave();}],
            ["ミレスタへ帰還",()=>{closeModal();returnToMilestaFromExploration("洞窟の横道を踏破してミレスタへ帰還しました");}]
          ]);
        }else if(!cave && !footpath){
          if(prologueStage()===2){
            startStoryEvent("plainsPrologueEnd",{force:true});
          }else if(!state.caveUnlocked){
            state.caveUnlocked=true;
            if(prologueStage()>=4) state.prologueStage=Math.max(5,prologueStage());
            modal("📌 新マップ「小さな洞窟」が解放されました。","次回探索時は、ここから開始できます。\n\nこのまま洞窟へ進みますか？",[
              ["小さな洞窟へ進む",()=>{closeModal();enterCaveFromPlains();}],
              ["ミレスタへ帰還",()=>{closeModal();returnToMilestaFromExploration("エリアを踏破してミレスタへ帰還しました");}]
            ]);
          }else{
            modal("★ 平原の最奥","以前見つけた小さな洞窟の入口までたどり着いた。\nこのまま洞窟へ進みますか？",[
              ["小さな洞窟へ進む",()=>{closeModal();enterCaveFromPlains();}],
              ["ミレスタへ帰還",()=>{closeModal();returnToMilestaFromExploration("エリアを踏破してミレスタへ帰還しました");}]
            ]);
          }
        }else if(state.caveBossDefeated){
          modal("★ 小さな洞窟・最奥","魔界の尖兵がいた場所には、もう何もいない。\n洞窟の奥には静けさが戻っている。",[["ミレスタへ帰還",()=>{closeModal();returnToMilestaFromExploration("小さな洞窟からミレスタへ帰還しました");}]]);
        }else{
          modal("★ 小さな洞窟・最奥","この先から不穏な気配がする……。\n先に進みますか？",[
            ["進む",()=>{closeModal();startStoryEvent("caveBossIntro",{force:true});}],
            ["町に戻る",()=>{closeModal();returnToMilestaFromExploration("小さな洞窟の最奥からミレスタへ帰還しました");}]
          ]);
        }
        break;
    }
  }

  function finishRun(message=null){
    state.run=null;
    state.battleSpecial=null; state.battleEscapeDisabled=false;
    restorePartyFull();
    updateWorld();
    showTownScreen(state.currentTown);
    toast(message||`${townDisplayName(state.currentTown)}へ帰還しました`);
  }

  updateHeader();
  updateDevSkillTestButton();
  window.addEventListener("resize",()=>{
    if($("characterName") && $("characterName").offsetParent!==null) fitCharacterDetailName();
  });

  initialGameSnapshot={saveVersion:SAVE_SCHEMA_VERSION,appVersion:DEV_VERSION,savedAt:null,location:"ミレスタ",game:capturePersistentState()};
  refreshTitleContinue();
  showTitleScreen();
  initDebugTools();
})();
