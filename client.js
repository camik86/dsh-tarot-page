window.__ModuleLoader__.load({
  id: "dsh-tarot-page",
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useRef, useCallback } = React;
    const h = React.createElement;
/*
 * Client half of @local/dsh-tarot.
 *
 * One page in the main column, addressed by the sidebar "tarot" icon. The page
 * owns the deck, spreads, animation, history and the in-page AI reading area.
 * The AI calls go to this plugin's own host routes, which forward to ctx.llm.
 * Nothing here registers tools, skills or commands for the model.
 */
const NS = 'dsh-tarot'
const PANEL_ID = 'tarot'
const STYLE_ID = 'dsh-tarot-style'
const SEEN_KEY = 'dsh-tarot:seen:v1'

const CARDS = {"major-00":{"zh":"愚者","en":"The Fool","element":"风","astro":"天王星","kw":["新开始","自由","冒险"],"up":"一次无包袱的出发，凭直觉迈步，可能性大于风险。","rev":"准备不足或逃避责任，冲动会让起点变成绕路。"},"major-01":{"zh":"魔术师","en":"The Magician","element":"风","astro":"水星","kw":["创造","意志","行动"],"up":"资源已在手，把想法落成行动，专注与沟通是关键。","rev":"空有想法或操纵信息，缺乏执行让机会溜走。"},"major-02":{"zh":"女祭司","en":"The High Priestess","element":"水","astro":"月亮","kw":["直觉","静观","潜意识"],"up":"答案在沉默与直觉里，先观察再判断，保留该保留的秘密。","rev":"忽视内心声音或信息不透明，容易陷入自我怀疑。"},"major-03":{"zh":"皇后","en":"The Empress","element":"土","astro":"金星","kw":["丰盛","滋养","创造"],"up":"温柔而丰沛的能量，适合滋养关系、作品与身体。","rev":"过度付出或停滞，先把自己照顾好。"},"major-04":{"zh":"皇帝","en":"The Emperor","element":"火","astro":"白羊座","kw":["秩序","权威","稳定"],"up":"建立规则与边界，用结构推进，负责到底。","rev":"控制过度或僵化，权威变成压迫。"},"major-05":{"zh":"教皇","en":"The Hierophant","element":"土","astro":"金牛座","kw":["传统","指引","学习"],"up":"向有经验的体系求教，按规矩与共识行事。","rev":"盲从教条或一味反叛，需分辨哪些规则值得守。"},"major-06":{"zh":"恋人","en":"The Lovers","element":"风","astro":"双子座","kw":["结合","选择","价值观"],"up":"重要的关系或抉择，忠于真实价值再做决定。","rev":"犹疑不决或价值冲突，关系里缺少坦诚。"},"major-07":{"zh":"战车","en":"The Chariot","element":"水","astro":"巨蟹座","kw":["推进","意志","胜利"],"up":"目标明确就全力推进，把情绪收进方向盘。","rev":"方向不明或用力过猛，容易失控。"},"major-08":{"zh":"力量","en":"Strength","element":"火","astro":"狮子座","kw":["勇气","耐心","柔韧"],"up":"以温柔驯服冲动，内在力量比强硬更有效。","rev":"自我怀疑或压抑愤怒，力量用错了地方。"},"major-09":{"zh":"隐者","en":"The Hermit","element":"土","astro":"处女座","kw":["内省","独处","求真"],"up":"暂离喧嚣，独自梳理，答案来自内在的光。","rev":"过度封闭或逃避人群，孤立不是答案。"},"major-10":{"zh":"命运之轮","en":"Wheel of Fortune","element":"火","astro":"木星","kw":["转机","周期","机遇"],"up":"局势正在转动，顺势而为，抓住周期里的窗口。","rev":"逆风或旧循环重演，需要主动改变节奏。"},"major-11":{"zh":"正义","en":"Justice","element":"风","astro":"天秤座","kw":["平衡","因果","抉择"],"up":"按事实与原则权衡，该承担的责任不回避。","rev":"偏颇或逃避后果，需要重新校准公平。"},"major-12":{"zh":"倒吊人","en":"The Hanged Man","element":"水","astro":"海王星","kw":["暂停","换位","牺牲"],"up":"主动暂停，换个角度，等待比硬推更有价值。","rev":"无谓拖延或白白牺牲，该结束僵局了。"},"major-13":{"zh":"死神","en":"Death","element":"水","astro":"天蝎座","kw":["结束","蜕变","断舍离"],"up":"旧阶段结束，清理与告别为新生腾出空间。","rev":"抗拒改变或拉长告别，拖得越久越痛。"},"major-14":{"zh":"节制","en":"Temperance","element":"火","astro":"射手座","kw":["调和","节奏","疗愈"],"up":"调配比例与节奏，慢慢来反而最稳。","rev":"失衡或走极端，需要找回中间值。"},"major-15":{"zh":"恶魔","en":"The Devil","element":"土","astro":"摩羯座","kw":["欲望","束缚","阴影"],"up":"看清让你上瘾的东西，承认它才有选择权。","rev":"正在松绑，识别并切断不健康的依赖。"},"major-16":{"zh":"塔","en":"The Tower","element":"火","astro":"火星","kw":["突变","崩塌","真相"],"up":"突然的冲击打破旧结构，先保人再收拾。","rev":"推迟的崩塌或余震，止损比补救重要。"},"major-17":{"zh":"星星","en":"The Star","element":"风","astro":"水瓶座","kw":["希望","疗愈","愿景"],"up":"风暴之后出现方向，保持信心，温柔地重建。","rev":"信心动摇或过度理想化，需要落地。"},"major-18":{"zh":"月亮","en":"The Moon","element":"水","astro":"双鱼座","kw":["迷雾","潜意识","不安"],"up":"信息不全，先别下结论，留意梦与直觉的线索。","rev":"迷雾渐散，但仍有未说出口的恐惧。"},"major-19":{"zh":"太阳","en":"The Sun","element":"火","astro":"太阳","kw":["成功","清晰","活力"],"up":"光明与坦诚，事情朝好的方向展开，享受当下。","rev":"成果延迟或过度乐观，仍要核对细节。"},"major-20":{"zh":"审判","en":"Judgement","element":"火","astro":"冥王星","kw":["觉醒","召唤","复盘"],"up":"一次诚实的复盘与召唤，回应它，旧账可以了结。","rev":"自我批判或错过召唤，先原谅再前进。"},"major-21":{"zh":"世界","en":"The World","element":"土","astro":"土星","kw":["完成","整合","圆满"],"up":"一个周期完成，整合经验，允许自己庆祝。","rev":"尾声未收或害怕结束，最后一步需要完成。"},"wands-01":{"zh":"权杖王牌","en":"Ace of Wands","element":"火","kw":["灵感","行动","机会"],"up":"新的热情与机会出现，先动手再谈完美。","rev":"动力不足或计划搁置，火苗需要氧气。"},"wands-02":{"zh":"权杖二","en":"Two of Wands","element":"火","kw":["规划","选择","远景"],"up":"世界在等你迈步，做决定并规划下一步。","rev":"犹豫或眼高手低，先迈出小的一步。"},"wands-03":{"zh":"权杖三","en":"Three of Wands","element":"火","kw":["扩展","合作","视野"],"up":"扩大舞台，合作与远征带来新机会。","rev":"计划延误或范围失控，收缩再出发。"},"wands-04":{"zh":"权杖四","en":"Four of Wands","element":"火","kw":["稳定","庆祝","安顿"],"up":"阶段性的安顿与庆祝，享受已拥有的。","rev":"根基不稳或过度求稳，值得挪一挪。"},"wands-05":{"zh":"权杖五","en":"Five of Wands","element":"火","kw":["竞争","摩擦","练习"],"up":"竞争与摩擦是练习，别把人当敌人。","rev":"内耗或回避冲突，先看自己的位置。"},"wands-06":{"zh":"权杖六","en":"Six of Wands","element":"火","kw":["胜利","认可","自信"],"up":"努力被看见，接受认可，也保持团队感。","rev":"认可延迟或骄傲，回到工艺本身。"},"wands-07":{"zh":"权杖七","en":"Seven of Wands","element":"火","kw":["防守","坚持","立场"],"up":"守住你的位置，坚持有道理的立场。","rev":"疲于应付或立场松动，该调整防线。"},"wands-08":{"zh":"权杖八","en":"Eight of Wands","element":"火","kw":["速度","消息","进展"],"up":"进展加速，消息与行动齐飞，保持通道畅通。","rev":"忙乱或延误，分清轻重缓急。"},"wands-09":{"zh":"权杖九","en":"Nine of Wands","element":"火","kw":["韧性","警惕","最后一段"],"up":"最后一步再撑一下，经验是你的护甲。","rev":"透支或固执，允许自己休息和求助。"},"wands-10":{"zh":"权杖十","en":"Ten of Wands","element":"火","kw":["负担","责任","收尾"],"up":"扛得太多，学会分配与放下，终点在望。","rev":"卸载或逃避责任，找到该扛的那一件。"},"wands-11":{"zh":"权杖侍从","en":"Page of Wands","element":"火","kw":["好奇","探索","尝试"],"up":"好奇与探索，适合试水新方向。","rev":"三分钟热度或方向未定，先小规模验证。"},"wands-12":{"zh":"权杖骑士","en":"Knight of Wands","element":"火","kw":["热情","行动","冒险"],"up":"带着热情快速行动，但先有方向。","rev":"冲动或不稳定，油门松一点。"},"wands-13":{"zh":"权杖王后","en":"Queen of Wands","element":"火","kw":["自信","魅力","领导"],"up":"自信与魅力，用温度带领别人。","rev":"自我怀疑或控制欲，先把光点回自己身上。"},"wands-14":{"zh":"权杖国王","en":"King of Wands","element":"火","kw":["远见","决断","事业"],"up":"远见与决断，把热情变成事业。","rev":"专断或空谈，回到可执行的目标。"},"cups-01":{"zh":"圣杯王牌","en":"Ace of Cups","element":"水","kw":["情感","爱","流动"],"up":"情感的新涌泉，真诚流动，允许被爱。","rev":"情感封闭或溢出，先把杯子端稳。"},"cups-02":{"zh":"圣杯二","en":"Two of Cups","element":"水","kw":["吸引","承诺","互惠"],"up":"互相吸引与承诺，关系走向对等。","rev":"关系失衡或误解，需要一次坦白。"},"cups-03":{"zh":"圣杯三","en":"Three of Cups","element":"水","kw":["友谊","庆祝","分享"],"up":"友谊与庆祝，共享喜悦让能量加倍。","rev":"社交过载或小圈子矛盾，留点独处。"},"cups-04":{"zh":"圣杯四","en":"Four of Cups","element":"水","kw":["倦怠","错失","内省"],"up":"倦怠时容易视而不见，看看眼前递来的杯子。","rev":"重新注意机会，或仍困在无感里。"},"cups-05":{"zh":"圣杯五","en":"Five of Cups","element":"水","kw":["失落","遗憾","悲伤"],"up":"失落需要被允许，但别只盯着倒掉的杯子。","rev":"走出阴影或仍困在过去，回头看看剩下的。"},"cups-06":{"zh":"圣杯六","en":"Six of Cups","element":"水","kw":["回忆","温柔","怀旧"],"up":"回忆与温柔，旧人旧事带来养分。","rev":"沉迷过去或终于放下，向前看。"},"cups-07":{"zh":"圣杯七","en":"Seven of Cups","element":"水","kw":["幻想","选择","迷雾"],"up":"选项多而虚，先分清想象与现实。","rev":"迷雾散开，或继续做梦。"},"cups-08":{"zh":"圣杯八","en":"Eight of Cups","element":"水","kw":["离开","寻找","意义"],"up":"离开已满足不了你的地方，去寻找更深的意义。","rev":"回头或不敢走，先承认不满意。"},"cups-09":{"zh":"圣杯九","en":"Nine of Cups","element":"水","kw":["满足","愿望","享受"],"up":"愿望成真，好好享受，也记得分享。","rev":"表面满足或贪多，问问真正想要什么。"},"cups-10":{"zh":"圣杯十","en":"Ten of Cups","element":"水","kw":["圆满","家庭","归属"],"up":"情感圆满，家庭与归属感是此刻的底色。","rev":"关系失衡或过度理想化，回到真实相处。"},"cups-11":{"zh":"圣杯侍从","en":"Page of Cups","element":"水","kw":["讯息","敏感","开放"],"up":"一条情感的讯息，保持敏感与开放。","rev":"情绪化或逃避，先把感受说清楚。"},"cups-12":{"zh":"圣杯骑士","en":"Knight of Cups","element":"水","kw":["浪漫","行动","心意"],"up":"跟随心意行动，浪漫可以很具体。","rev":"空口承诺或情绪冲动，先兑现一件小事。"},"cups-13":{"zh":"圣杯王后","en":"Queen of Cups","element":"水","kw":["共情","直觉","温柔"],"up":"共情与直觉，温柔是有力的力量。","rev":"情绪淹没或讨好，先照顾自己的边界。"},"cups-14":{"zh":"圣杯国王","en":"King of Cups","element":"水","kw":["成熟","包容","稳定"],"up":"情感成熟，稳定与包容能托住关系。","rev":"压抑情绪或冷漠，表达不是软弱。"},"swords-01":{"zh":"宝剑王牌","en":"Ace of Swords","element":"风","kw":["清晰","真相","决断"],"up":"清晰与真相，一刀切开纠缠，说重点。","rev":"混乱或言语伤人，先让情绪降温。"},"swords-02":{"zh":"宝剑二","en":"Two of Swords","element":"风","kw":["权衡","僵局","暂停"],"up":"权衡与僵局，先停下来再选择。","rev":"逃避决定或信息不足，补一块关键信息。"},"swords-03":{"zh":"宝剑三","en":"Three of Swords","element":"风","kw":["心痛","冲突","真相"],"up":"直面伤口，痛过之后才能清理。","rev":"修复或旧伤复发，别反复揭疤。"},"swords-04":{"zh":"宝剑四","en":"Four of Swords","element":"风","kw":["休息","恢复","暂停"],"up":"暂停战斗，恢复是战斗力的一部分。","rev":"无法休息或强行复工，先睡一觉。"},"swords-05":{"zh":"宝剑五","en":"Five of Swords","element":"风","kw":["争执","代价","输赢"],"up":"赢了也可能输，看看争执的代价。","rev":"和解或继续消耗，先放下这一局。"},"swords-06":{"zh":"宝剑六","en":"Six of Swords","element":"风","kw":["过渡","离开","平静"],"up":"往平静处走，过渡期需要耐心。","rev":"滞留或改变受阻，先处理拖住你的东西。"},"swords-07":{"zh":"宝剑七","en":"Seven of Swords","element":"风","kw":["策略","隐瞒","自欺"],"up":"策略可用，但别连自己一起骗。","rev":"真相浮现或放弃算计，坦白更省力。"},"swords-08":{"zh":"宝剑八","en":"Eight of Swords","element":"风","kw":["限制","自缚","视角"],"up":"限制多半来自想法，换个视角就能松绑。","rev":"正在松绑，或继续困在自设的墙里。"},"swords-09":{"zh":"宝剑九","en":"Nine of Swords","element":"风","kw":["焦虑","失眠","念头"],"up":"念头比事实可怕，把焦虑写下来会小一半。","rev":"走出焦虑，或仍在夜里反复。"},"swords-10":{"zh":"宝剑十","en":"Ten of Swords","element":"风","kw":["结束","触底","重启"],"up":"承认终点，触底之后才能重启。","rev":"缓慢恢复或拒绝结束，给自己时间。"},"swords-11":{"zh":"宝剑侍从","en":"Page of Swords","element":"风","kw":["好奇","观察","提问"],"up":"好奇观察，提问比结论更有用。","rev":"口无遮拦或轻信，先核实再转述。"},"swords-12":{"zh":"宝剑骑士","en":"Knight of Swords","element":"风","kw":["速度","直接","行动"],"up":"快速行动，直来直去，注意别伤到人。","rev":"鲁莽或争论，先降速再沟通。"},"swords-13":{"zh":"宝剑王后","en":"Queen of Swords","element":"风","kw":["理性","边界","清醒"],"up":"理性与边界，清醒地判断，不拖泥带水。","rev":"刻薄或过度防备，锋利要有温度。"},"swords-14":{"zh":"宝剑国王","en":"King of Swords","element":"风","kw":["逻辑","权威","决断"],"up":"逻辑与权威，做冷静而可解释的决定。","rev":"专断或冷酷，先听完再判。"},"pentacles-01":{"zh":"星币王牌","en":"Ace of Pentacles","element":"土","kw":["机会","落地","开始"],"up":"新的物质机会，脚踏实地开始积累。","rev":"机会流失或迟迟不行动，先做第一步。"},"pentacles-02":{"zh":"星币二","en":"Two of Pentacles","element":"土","kw":["平衡","灵活","多线"],"up":"平衡多条线，灵活调整节奏。","rev":"失衡或分身乏术，砍掉一件事。"},"pentacles-03":{"zh":"星币三","en":"Three of Pentacles","element":"土","kw":["协作","专业","打磨"],"up":"协作与专业，把作品打磨到标准。","rev":"配合不佳或标准模糊，先把验收说清。"},"pentacles-04":{"zh":"星币四","en":"Four of Pentacles","element":"土","kw":["稳定","占有","守成"],"up":"守住资源，稳定是下一步的基础。","rev":"松手或过度紧抓，安全感不必全靠控制。"},"pentacles-05":{"zh":"星币五","en":"Five of Pentacles","element":"土","kw":["匮乏","困境","求助"],"up":"困境中先求助，支持其实就在附近。","rev":"转机出现或继续硬撑，别逞强。"},"pentacles-06":{"zh":"星币六","en":"Six of Pentacles","element":"土","kw":["给予","接受","流动"],"up":"资源在流动，给予与接受都要有分寸。","rev":"施受失衡或依赖，把账算清楚。"},"pentacles-07":{"zh":"星币七","en":"Seven of Pentacles","element":"土","kw":["耐心","投入","长期"],"up":"长期投入需要耐心，先评估再继续种。","rev":"急于求成或方向不对，换一块地。"},"pentacles-08":{"zh":"星币八","en":"Eight of Pentacles","element":"土","kw":["精进","重复","技能"],"up":"精进与重复，把技能磨细就是护城河。","rev":"敷衍或陷入重复，给自己加点变化。"},"pentacles-09":{"zh":"星币九","en":"Nine of Pentacles","element":"土","kw":["自足","成果","独立"],"up":"享受独立与成果，你值得自己的空间。","rev":"过度依赖或挥霍，回到日常经营。"},"pentacles-10":{"zh":"星币十","en":"Ten of Pentacles","element":"土","kw":["富足","传承","长期"],"up":"长期积累与传承，结构比数字重要。","rev":"结构风险或只顾眼前，补上长期规划。"},"pentacles-11":{"zh":"星币侍从","en":"Page of Pentacles","element":"土","kw":["学习","尝试","起步"],"up":"踏实起步，学习是最快的捷径。","rev":"拖延或眼高手低，先完成一个小目标。"},"pentacles-12":{"zh":"星币骑士","en":"Knight of Pentacles","element":"土","kw":["稳进","可靠","执行"],"up":"稳步推进，可靠执行胜过一时热闹。","rev":"停滞或过于保守，给计划加个截止日。"},"pentacles-13":{"zh":"星币王后","en":"Queen of Pentacles","element":"土","kw":["务实","照顾","安稳"],"up":"务实与照顾，把日子过好就是能力。","rev":"过度操劳或物质焦虑，先照顾好自己。"},"pentacles-14":{"zh":"星币国王","en":"King of Pentacles","element":"土","kw":["事业","掌控","长期"],"up":"事业与掌控，长期经营带来复利。","rev":"固执或利益至上，留一点人情与弹性。"}};

const ZH = {
  panel: '塔罗',
  title: '塔罗牌',
  subtitle: '78 张公版 Rider-Waite-Smith 牌面 · 四种牌阵 · 页面内 AI 解读',
  single: '单张',
  three: '三张',
  relation: '关系',
  celtic: '凯尔特十字',
  draw: '洗牌抽牌',
  redraw: '重新抽牌',
  clear: '清空',
  history: '历史',
  settings: '设置',
  question: '你想问什么？',
  questionHint: '写下一个具体的问题，AI 会结合牌阵回答；也可以留空先抽牌。',
  askAi: 'AI 解读',
  stop: '停止',
  followUp: '继续追问',
  followUpHint: '就这次牌阵继续问 AI…',
  send: '发送',
  thinking: '正在解读…',
  aiEmpty: '抽完牌后点「AI 解读」，解读会出现在这里。',
  aiNoModel: '还没选择模型。去「设置」里选一个已配置的模型。',
  reversals: '启用逆位',
  lang: '界面语言',
  model: 'AI 模型',
  refreshModels: '刷新模型',
  close: '关闭',
  delete: '删除',
  reopen: '打开',
  emptyHistory: '还没有历史记录，抽一次牌试试。',
  positions: '位置',
  upright: '正位',
  reversed: '逆位',
  keywords: '关键词',
  meaning: '牌义',
  element: '元素',
  astro: '星象',
  allCards: '全部牌',
  readAt: '记录于',
  loadReading: '载入这次牌阵',
  warning: '塔罗用于自我反思，不是命运判决；请勿用于医疗、投资与法律决定。',
  noSpread: '选择牌阵',
  asked: '问题',
  cardsCount: '张牌',
  aiModel: '模型',
  source: '牌面：Rider-Waite-Smith（1909，公版）',
}

const EN = {
  panel: 'Tarot',
  title: 'Tarot',
  subtitle: '78 public-domain Rider-Waite-Smith cards · four spreads · in-page AI reading',
  single: 'Single',
  three: 'Three',
  relation: 'Relationship',
  celtic: 'Celtic cross',
  draw: 'Shuffle & draw',
  redraw: 'Redraw',
  clear: 'Clear',
  history: 'History',
  settings: 'Settings',
  question: 'What do you want to ask?',
  questionHint: 'Ask one specific question; the AI answers with the spread. You may also draw first.',
  askAi: 'AI reading',
  stop: 'Stop',
  followUp: 'Follow up',
  followUpHint: 'Ask the AI more about this spread…',
  send: 'Send',
  thinking: 'Reading…',
  aiEmpty: 'Draw the cards, then press AI reading. The answer appears here.',
  aiNoModel: 'No model selected yet. Pick one in Settings.',
  reversals: 'Enable reversals',
  lang: 'Language',
  model: 'AI model',
  refreshModels: 'Refresh models',
  close: 'Close',
  delete: 'Delete',
  reopen: 'Open',
  emptyHistory: 'No readings yet. Draw once to start.',
  positions: 'Positions',
  upright: 'Upright',
  reversed: 'Reversed',
  keywords: 'Keywords',
  meaning: 'Meaning',
  element: 'Element',
  astro: 'Astrology',
  allCards: 'All cards',
  readAt: 'Read at',
  loadReading: 'Load this spread',
  warning: 'Tarot is for reflection, not fate; do not use it for medical, investment or legal decisions.',
  noSpread: 'Pick a spread',
  asked: 'Question',
  cardsCount: 'cards',
  aiModel: 'Model',
  source: 'Artwork: Rider-Waite-Smith (1909, public domain)',
}

const SPREADS = [
  { id: 'single', zh: '单张', en: 'Single', positions: ['指引'] },
  { id: 'three', zh: '三张', en: 'Three', positions: ['过去', '现在', '未来'] },
  { id: 'relation', zh: '关系', en: 'Relationship', positions: ['我', '对方', '关系'] },
  {
    id: 'celtic',
    zh: '凯尔特十字',
    en: 'Celtic cross',
    positions: ['现状', '挑战', '根源', '过去', '目标', '近期', '自我', '环境', '希望与恐惧', '结果'],
  },
]

const ALL_IDS = Object.keys(CARDS)

function baseUrl(path) {
  try {
    return new URL(path, document.baseURI).href
  } catch {
    return path
  }
}

function cardImage(id) {
  return baseUrl(`plugins/dsh-tarot-page/assets/cards/${id}.webp`)
}

function apiUrl(path) {
  return baseUrl(`plugins/dsh-tarot-page/api/${path}`)
}

function randInt(max) {
  const list = new Uint32Array(1)
  crypto.getRandomValues(list)
  return list[0] % max
}

function shuffle(list) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1)
    const value = copy[i]
    copy[i] = copy[j]
    copy[j] = value
  }
  return copy
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage may be unavailable; the page still works
  }
}

const SETTINGS_KEY = 'dsh-tarot:settings:v1'
const HISTORY_KEY = 'dsh-tarot:history:v1'
const DEFAULT_SETTINGS = { reversals: true, lang: 'zh', provider: '', model: '' }

async function readSse(resp, handlers) {
  if (!resp.ok) {
    let detail = resp.statusText
    try {
      const data = await resp.json()
      detail = data?.error ?? detail
    } catch {
      // keep status text
    }
    throw new Error(detail || `HTTP ${resp.status}`)
  }
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let index = buffer.indexOf('\n\n')
    while (index >= 0) {
      const frame = buffer.slice(0, index)
      buffer = buffer.slice(index + 2)
      const line = frame.split('\n').find((entry) => entry.startsWith('data: '))
      if (line) {
        let data
        try {
          data = JSON.parse(line.slice(6))
        } catch {
          data = undefined
        }
        if (data) {
          if (typeof data.t === 'string') handlers.delta(data.t)
          else if (typeof data.error === 'string') handlers.error(data.error)
          else if (data.done) handlers.done()
        }
      }
      index = buffer.indexOf('\n\n')
    }
  }
}

function markdownNodes(text) {
  const lines = String(text || '').split('\n')
  const nodes = []
  let list = null
  let key = 0
  const inline = (line) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return h('strong', { key: `b${i}` }, part.slice(2, -2))
      }
      return part
    })
  }
  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const heading = /^(#{2,4})\s+(.*)$/.exec(line)
    if (heading) {
      if (list) {
        nodes.push(h('ul', { key: `l${key++}` }, list))
        list = null
      }
      nodes.push(h('h4', { key: `h${key++}` }, inline(heading[2])))
    } else if (/^\s*(?:[-*]|\d+[.)])\s+/.test(line)) {
      if (!list) list = []
      list.push(h('li', { key: `i${key++}` }, inline(line.replace(/^\s*[-*]\s+/, ''))))
    } else if (line.trim() === '') {
      if (list) {
        nodes.push(h('ul', { key: `l${key++}` }, list))
        list = null
      }
    } else {
      if (list) {
        nodes.push(h('ul', { key: `l${key++}` }, list))
        list = null
      }
      nodes.push(h('p', { key: `p${key++}` }, inline(line)))
    }
  }
  if (list) nodes.push(h('ul', { key: `l${key++}` }, list))
  return nodes
}

const CSS = `
.dsh-tarot-root{--tr-ink:#e9e6f2;--tr-dim:#a8a4bc;--tr-line:rgba(255,255,255,.12);
  height:100%;
  padding:calc(var(--dsh-frame-top-clearance,48px) + 8px) 24px 24px;
  box-sizing:border-box;
  overflow:auto;
  color:var(--tr-ink);
  background:
    radial-gradient(900px 500px at 15% -10%, rgba(120,86,255,.18), transparent 60%),
    radial-gradient(700px 400px at 95% 0%, rgba(201,162,39,.12), transparent 55%),
    #14121c;
  font-size:14px;
}
.dsh-tarot-top{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:14px}
.dsh-tarot-brand{display:flex;flex-direction:column;gap:2px;margin-right:8px}
.dsh-tarot-brand b{font-size:18px;letter-spacing:.16em}
.dsh-tarot-brand span{font-size:12px;color:var(--tr-dim)}
.dsh-tarot-tabs{display:flex;gap:6px;flex-wrap:wrap}
.dsh-tarot-tab{
  border:1px solid var(--tr-line);
  background:transparent;color:inherit;border-radius:999px;padding:6px 14px;cursor:pointer;font-size:13px
}
.dsh-tarot-tab.on{background:rgba(201,162,39,.16);border-color:rgba(201,162,39,.6);color:#f3d98a}
.dsh-tarot-actions{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}
.dsh-tarot-btn{
  border:1px solid var(--tr-line);
  background:rgba(255,255,255,.04);color:inherit;border-radius:10px;padding:7px 14px;cursor:pointer;font-size:13px
}
.dsh-tarot-btn:hover{background:rgba(255,255,255,.08)}
.dsh-tarot-btn.primary{background:linear-gradient(135deg,#7a5cff,#b48cff);border-color:transparent;color:#fff;font-weight:600}
.dsh-tarot-btn.gold{background:linear-gradient(135deg,#8a6d1f,#d7b24a);border-color:transparent;color:#1a1420;font-weight:600}
.dsh-tarot-btn:disabled{opacity:.45;cursor:default}
.dsh-tarot-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,420px);gap:18px;align-items:start}
@media (max-width:1180px){.dsh-tarot-body{grid-template-columns:1fr}}
.dsh-tarot-board{
  border:1px solid var(--tr-line);
  background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));
  border-radius:18px;padding:18px;min-height:420px;
}
.dsh-tarot-board-head{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;color:var(--tr-dim);font-size:12px}
.dsh-tarot-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(118px,1fr))}
.dsh-tarot-grid.celtic{grid-template-columns:repeat(5,minmax(96px,1fr))}
.dsh-tarot-slot{display:flex;flex-direction:column;gap:6px;align-items:center}
.dsh-tarot-pos{font-size:11px;color:var(--tr-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dsh-tarot-card{
  position:relative;width:100%;aspect-ratio:5/8;border-radius:10px;overflow:hidden;cursor:default;
  border:1px solid rgba(255,255,255,.14);background:#221c33;box-sizing:border-box
}
.dsh-tarot-card.drawn{cursor:pointer;box-shadow:0 10px 26px rgba(0,0,0,.45)}
.dsh-tarot-card img{width:100%;height:100%;object-fit:cover;display:block}
.dsh-tarot-card .back{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,.045) 0 6px, transparent 6px 12px),
    radial-gradient(circle at 50% 50%, #3a2d5e 0%, #191327 70%);
}
.dsh-tarot-card .back::after{
  content:'✦';font-size:26px;color:rgba(243,217,138,.8);text-shadow:0 0 12px rgba(243,217,138,.6)
}
.dsh-tarot-card.rev img{transform:rotate(180deg)}
.dsh-tarot-orient{
  position:absolute;left:6px;bottom:6px;font-size:10px;padding:1px 6px;border-radius:999px;
  background:rgba(0,0,0,.62);color:#f3d98a;letter-spacing:.08em
}
.dsh-tarot-shuffle .dsh-tarot-card{animation:dsh-tarot-shake .55s ease-in-out}
@keyframes dsh-tarot-shake{
  0%{transform:translateY(0) rotate(0)}
  25%{transform:translateY(-6px) rotate(-3deg)}
  50%{transform:translateY(0) rotate(3deg)}
  75%{transform:translateY(-3px) rotate(-1deg)}
  100%{transform:translateY(0) rotate(0)}
}
.dsh-tarot-deal .dsh-tarot-card{animation:dsh-tarot-flip .5s ease both}
@keyframes dsh-tarot-flip{
  from{opacity:0;transform:rotateY(90deg) translateY(8px)}
  to{opacity:1;transform:rotateY(0) translateY(0)}
}
.dsh-tarot-hint{color:var(--tr-dim);font-size:12px;line-height:1.7}
.dsh-tarot-side{display:flex;flex-direction:column;gap:14px;position:sticky;top:calc(var(--dsh-frame-top-clearance,48px) + 8px)}
.dsh-tarot-panel{
  border:1px solid var(--tr-line);
  background:rgba(255,255,255,.028);border-radius:16px;padding:14px
}
.dsh-tarot-label{display:block;font-size:12px;letter-spacing:.08em;color:var(--tr-dim);margin-bottom:6px}
.dsh-tarot-question{width:100%;box-sizing:border-box;resize:vertical;height:76px;min-height:76px;border-radius:10px;
  border:1px solid var(--tr-line);background:rgba(0,0,0,.22);
  color:inherit;padding:10px 12px;font:inherit;line-height:1.6;outline:none}
.dsh-tarot-question:focus{border-color:rgba(180,140,255,.65)}
.dsh-tarot-fileselect{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.dsh-tarot-select{
  flex:1;min-width:140px;border-radius:10px;border:1px solid var(--tr-line);
  background:rgba(0,0,0,.22);color:inherit;padding:7px 9px;font:inherit;font-size:12px
}
.dsh-tarot-reading{
  min-height:220px;max-height:46vh;overflow:auto;line-height:1.78;font-size:13.5px;
  color:var(--tr-ink);
  border-radius:10px;background:rgba(0,0,0,.2);padding:14px;border:1px solid rgba(255,255,255,.06)
}
.dsh-tarot-reading p{color:inherit;opacity:.94}
.dsh-tarot-reading h4{margin:12px 0 6px;font-size:13px;color:#f3d98a}
.dsh-tarot-reading p{margin:0 0 8px}
.dsh-tarot-reading ul{margin:0 0 8px;padding-left:18px}
.dsh-tarot-chat-line{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);font-size:12.5px;line-height:1.65}
.dsh-tarot-chat-line.me{background:rgba(122,92,255,.16)}
.dsh-tarot-row{display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap}
.dsh-tarot-row input{
  flex:1;min-width:120px;border-radius:10px;border:1px solid var(--tr-line);
  background:rgba(0,0,0,.22);color:inherit;padding:8px 10px;font:inherit;font-size:12.5px;outline:none
}
.dsh-tarot-meta{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:var(--tr-dim);margin-top:8px;flex-wrap:wrap}
.dsh-tarot-overlay{
  position:fixed;inset:0;z-index:60;background:rgba(6,4,12,.72);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;padding:28px
}
.dsh-tarot-modal{
  width:min(880px,100%);max-height:86vh;overflow:auto;border-radius:20px;padding:20px;
  background:#1b1727;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 80px rgba(0,0,0,.6)
}
.dsh-tarot-modal-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.dsh-tarot-modal-head b{font-size:16px}
.dsh-tarot-close{margin-left:auto}
.dsh-tarot-detail{display:grid;grid-template-columns:220px minmax(0,1fr);gap:18px}
@media (max-width:720px){.dsh-tarot-detail{grid-template-columns:1fr}}
.dsh-tarot-detail img{width:100%;border-radius:12px;border:1px solid rgba(255,255,255,.14)}
.dsh-tarot-kv{display:grid;grid-template-columns:64px minmax(0,1fr);gap:6px 10px;font-size:12.5px;line-height:1.65;margin:10px 0}
.dsh-tarot-kv dt{color:var(--tr-dim)}
.dsh-tarot-kv dd{margin:0}
.dsh-tarot-history-item{
  display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:12px;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);margin-bottom:8px
}
.dsh-tarot-history-item .when{font-size:11px;color:var(--tr-dim);white-space:nowrap}
.dsh-tarot-history-item .what{flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tarot-switch{display:flex;align-items:center;gap:10px;margin:10px 0;font-size:13px}
.dsh-tarot-switch input{width:16px;height:16px;accent-color:#b48cff}
.dsh-tarot-foot{margin-top:14px;font-size:11px;color:var(--tr-dim);line-height:1.7}
`

function injectStyles() {
  if (typeof document === 'undefined' || !document.head) return () => {}
  if (document.getElementById(STYLE_ID)) return () => {}
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
  return () => {
    if (style.parentNode) style.parentNode.removeChild(style)
  }
}

function TarotIcon(props) {
  const size = props && typeof props.size === 'number' ? props.size : 20
  const active = Boolean(props && props.active)
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      'aria-hidden': true,
      style: { opacity: active ? 1 : 0.78 },
    },
    h('rect', { x: 4.5, y: 2.5, width: 15, height: 19, rx: 2.6, stroke: 'currentColor', strokeWidth: 1.4 }),
    h('circle', { cx: 12, cy: 10.5, r: 3.1, stroke: 'currentColor', strokeWidth: 1.2 }),
    h('path', { d: 'M8 18h8', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
    h('path', { d: 'M12 3.6v2.1M12 15.3v2.4', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }),
  )
}

function useModels() {
  const [state, setState] = useState({ loading: true, error: '', providers: [], fallback: undefined })
  const load = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: '' }))
    fetch(apiUrl('models'))
      .then((resp) => (resp.ok ? resp.json() : resp.json().then((data) => Promise.reject(new Error(data?.error ?? resp.statusText)))))
      .then((data) => setState({ loading: false, error: '', providers: data.providers ?? [], fallback: data.default }))
      .catch((error) => setState({ loading: false, error: String(error?.message ?? error), providers: [], fallback: undefined }))
  }, [])
  useEffect(() => {
    load()
  }, [load])
  return { ...state, reload: load }
}

function flattenModels(providers) {
  const list = []
  for (const provider of providers ?? []) {
    for (const model of provider.models ?? []) list.push({ provider: provider.id, providerName: provider.name, model: model.id, modelName: model.name })
  }
  return list
}

function TarotPage(props) {
  const t = typeof props.t === 'function' ? props.t : (key) => ZH[key] ?? key
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...loadJson(SETTINGS_KEY, {}) }))
  const [spreadId, setSpreadId] = useState(() => loadJson(SEEN_KEY, {})?.spreadId ?? 'three')
  const [cards, setCards] = useState([])
  const [phase, setPhase] = useState('idle')
  const [question, setQuestion] = useState('')
  const [ai, setAi] = useState({ status: 'idle', text: '', error: '' })
  const [chat, setChat] = useState([])
  const [chatDraft, setChatDraft] = useState('')
  const [busyChat, setBusyChat] = useState(false)
  const [detail, setDetail] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [history, setHistory] = useState(() => loadJson(HISTORY_KEY, []))
  const [now, setNow] = useState(() => Date.now())
  const abortRef = useRef(null)
  const [readingId, setReadingId] = useState(null)
  const models = useModels()

  const spread = SPREADS.find((entry) => entry.id === spreadId) ?? SPREADS[1]
  const flat = flattenModels(models.providers)
  const currentModel = flat.find((entry) => entry.provider === settings.provider && entry.model === settings.model)
    ?? (settings.provider && settings.model ? { provider: settings.provider, model: settings.model, providerName: settings.provider, modelName: settings.model } : undefined)
    ?? (models.fallback && flat.find((entry) => entry.provider === models.fallback.provider && entry.model === models.fallback.model))

  useEffect(() => {
    saveJson(SETTINGS_KEY, settings)
  }, [settings])

  useEffect(() => {
    saveJson(SEEN_KEY, { spreadId })
  }, [spreadId])

  useEffect(() => {
    if (models.loading) return
    if (settings.provider && settings.model) return
    const fallback = models.fallback
    if (fallback && fallback.provider && fallback.model) {
      setSettings((prev) => (prev.provider && prev.model ? prev : { ...prev, provider: fallback.provider, model: fallback.model }))
      return
    }
    const first = flat[0]
    if (first) setSettings((prev) => (prev.provider && prev.model ? prev : { ...prev, provider: first.provider, model: first.model }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models.loading, models.fallback, flat.length])

  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort()
  }, [])

  const setLang = (lang) => setSettings((prev) => ({ ...prev, lang }))

  const lang = settings.lang === 'en' ? 'en' : 'zh'

  const label = (key) => {
    const dict = lang === 'en' ? EN : ZH
    return dict[key] ?? key
  }

  const draw = () => {
    if (phase === 'shuffling') return
    abortAi()
    const positions = spread.positions
    setPhase('shuffling')
    setCards([])
    setDetail(null)
    setAi({ status: 'idle', text: '', error: '' })
    setChat([])
    const pool = shuffle(ALL_IDS).slice(0, Math.min(positions.length, ALL_IDS.length))
    window.setTimeout(() => {
      const next = pool.map((id, index) => {
        const upright = !settings.reversals || randInt(100) >= 35
        return { id, position: positions[index] ?? String(index + 1), orientation: upright ? 'up' : 'rev' }
      })
      setCards(next)
      setPhase('dealt')
      const id = `r-${Date.now()}`
      setReadingId(id)
      const entry = { id, at: Date.now(), spreadId: spread.id, spreadZh: lang === 'en' ? spread.en : spread.zh, question, cards: next, aiText: '', chat: [] }
      setHistory((prev) => {
        const list = [entry, ...prev].slice(0, 40)
        saveJson(HISTORY_KEY, list)
        return list
      })
    }, 620)
  }

  const abortAi = () => {
    if (abortRef.current) {
      try { abortRef.current.abort() } catch { /* ignore */ }
      abortRef.current = null
    }
  }

  const stopAi = () => {
    abortAi()
    setAi((prev) => ({ ...prev, status: prev.status === 'streaming' ? 'stopped' : prev.status }))
  }

  const payload = () => ({
    provider: currentModel?.provider ?? settings.provider,
    model: currentModel?.model ?? settings.model,
    question,
    spread: { id: spread.id, zh: lang === 'en' ? spread.en : spread.zh, positions: spread.positions },
    cards: cards.map((card) => {
      const data = CARDS[card.id]
      return {
        id: card.id,
        zh: data.zh,
        en: data.en,
        position: card.position,
        orientation: card.orientation,
        kw: data.kw,
        up: data.up,
        rev: data.rev,
      }
    }),
    lang,
  })

  const interpret = async () => {
    if (cards.length === 0) return
    if (!currentModel) {
      setAi({ status: 'error', text: '', error: label('aiNoModel') })
      return
    }
    abortAi()
    const controller = new AbortController()
    abortRef.current = controller
    setAi({ status: 'streaming', text: '', error: '' })
    let text = ''
    try {
      const resp = await fetch(apiUrl('interpret'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload()),
        signal: controller.signal,
      })
      await readSse(resp, {
        delta(delta) {
          text += delta
          setAi({ status: 'streaming', text, error: '' })
        },
        error(message) {
          setAi({ status: 'error', text, error: message })
        },
        done() {
          setAi({ status: 'done', text, error: '' })
          persistAi(text, [])
        },
      })
    } catch (error) {
      if (controller.signal.aborted) {
        setAi({ status: 'stopped', text, error: '' })
        persistAi(text, [])
        return
      }
      setAi({ status: 'error', text, error: String(error?.message ?? error) })
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  const persistAi = (text, chatLines) => {
    if (!text) return
    setHistory((prev) => {
      const list = prev.slice()
      const index = list.findIndex((entry) => entry.id === readingId)
      if (index >= 0) {
        list[index] = { ...list[index], aiText: text, chat: chatLines, question }
      }
      saveJson(HISTORY_KEY, list)
      return list
    })
  }

  const sendChat = async () => {
    const message = chatDraft.trim()
    if (!message || busyChat) return
    if (!currentModel) {
      setChat((prev) => [...prev, { role: 'note', text: label('aiNoModel') }])
      return
    }
    const historyForCall = chat.slice()
    setChatDraft('')
    setBusyChat(true)
    setChat([...historyForCall, { role: 'user', text: message }, { role: 'assistant', text: '' }])
    const controller = new AbortController()
    abortRef.current = controller
    let text = ''
    try {
      const resp = await fetch(apiUrl('chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload(), reading: ai.text, history: historyForCall, message }),
        signal: controller.signal,
      })
      await readSse(resp, {
        delta(delta) {
          text += delta
          setChat([...historyForCall, { role: 'user', text: message }, { role: 'assistant', text }])
        },
        error(error) {
          text = text || `(${error})`
          setChat([...historyForCall, { role: 'user', text: message }, { role: 'assistant', text }])
        },
        done() {
          const lines = [...historyForCall, { role: 'user', text: message }, { role: 'assistant', text }]
          setChat(lines)
          if (ai.text) persistAi(ai.text, lines)
        },
      })
    } catch (error) {
      if (!controller.signal.aborted) {
        setChat([...historyForCall, { role: 'user', text: message }, { role: 'assistant', text: `(${String(error?.message ?? error)})` }])
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setBusyChat(false)
    }
  }

  const loadHistoryEntry = (entry) => {
    abortAi()
    setReadingId(entry.id ?? null)
    setSpreadId(entry.spreadId ?? 'three')
    setCards(entry.cards ?? [])
    setQuestion(entry.question ?? '')
    setAi({ status: entry.aiText ? 'done' : 'idle', text: entry.aiText ?? '', error: '' })
    setChat(Array.isArray(entry.chat) ? entry.chat : [])
    setPhase(entry.cards?.length ? 'dealt' : 'idle')
    setShowHistory(false)
  }

  const removeHistoryEntry = (id) => {
    setHistory((prev) => {
      const list = prev.filter((entry) => entry.id !== id)
      saveJson(HISTORY_KEY, list)
      return list
    })
  }

  const fmtTime = (value) => {
    try {
      return new Date(value).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const drawnData = cards.map((card) => ({ ...card, data: CARDS[card.id] }))
  const done = phase === 'dealt' && cards.length > 0

  return h('div', { className: 'dsh-tarot-root', 'data-dsh-tarot': '' },
    h('div', { className: 'dsh-tarot-top' },
      h('div', { className: 'dsh-tarot-brand' },
        h('b', null, lang === 'en' ? 'TAROT' : '塔 罗'),
        h('span', null, label('subtitle')),
      ),
      h('div', { className: 'dsh-tarot-tabs' }, SPREADS.map((entry) => h('button', {
        key: entry.id,
        type: 'button',
        className: `dsh-tarot-tab${entry.id === spreadId ? ' on' : ''}`,
        onClick: () => setSpreadId(entry.id),
      }, lang === 'en' ? entry.en : entry.zh))),
      h('div', { className: 'dsh-tarot-actions' },
        h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: () => setShowHistory(true) }, `${label('history')}${history.length ? ` (${history.length})` : ''}`),
        h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: () => setShowSettings(true) }, label('settings')),
        done ? h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: draw }, label('redraw')) : null,
        h('button', { type: 'button', className: `dsh-tarot-btn ${done ? '' : 'gold'}`, onClick: draw, disabled: phase === 'shuffling' }, label('draw')),
      ),
    ),
    h('div', { className: 'dsh-tarot-body' },
      h('section', { className: `dsh-tarot-board${phase === 'shuffling' ? ' dsh-tarot-shuffle' : ''}${phase === 'dealt' ? ' dsh-tarot-deal' : ''}` },
        h('div', { className: 'dsh-tarot-board-head' },
          h('span', null, `${lang === 'en' ? spread.en : spread.zh} · ${cards.length}/${spread.positions.length} ${label('cardsCount')}`),
          h('span', { style: { marginLeft: 'auto' } }, label('source')),
        ),
        h('div', { className: `dsh-tarot-grid${spread.id === 'celtic' ? ' celtic' : ''}` },
          spread.positions.map((position, index) => {
            const card = drawnData[index]
            return h('div', { className: 'dsh-tarot-slot', key: `${spread.id}-${index}` },
              h('div', { className: 'dsh-tarot-pos' }, position),
              h('div', {
                className: `dsh-tarot-card${card ? ' drawn' : ''}${card && card.orientation === 'rev' ? ' rev' : ''}`,
                onClick: card ? () => setDetail(card) : undefined,
                role: card ? 'button' : undefined,
                title: card ? card.data.zh : undefined,
              },
                card ? h('img', { src: cardImage(card.id), alt: card.data.zh, loading: 'lazy' }) : h('div', { className: 'back' }),
                card ? h('span', { className: 'dsh-tarot-orient' }, label(card.orientation === 'rev' ? 'reversed' : 'upright')) : null,
              ),
            )
          }),
        ),
        h('div', { className: 'dsh-tarot-hint', style: { marginTop: '14px' } },
          phase === 'idle' ? label('aiEmpty') : null,
          phase === 'dealt' ? label('warning') : null,
        ),
      ),
      h('aside', { className: 'dsh-tarot-side' },
        h('div', { className: 'dsh-tarot-panel' },
          h('label', { className: 'dsh-tarot-label', htmlFor: 'dsh-tarot-q' }, label('question')),
          h('textarea', {
            id: 'dsh-tarot-q',
            className: 'dsh-tarot-question',
            value: question,
            placeholder: label('questionHint'),
            onChange: (event) => setQuestion(event.target.value),
          }),
          h('div', { className: 'dsh-tarot-fileselect' },
            h('select', {
              className: 'dsh-tarot-select',
              value: currentModel ? `${currentModel.provider}::${currentModel.model}` : '',
              onChange: (event) => {
                const value = event.target.value
                const [provider, model] = value.split('::')
                setSettings((prev) => ({ ...prev, provider, model }))
              },
            },
              h('option', { value: '' }, models.loading ? '…' : label('aiNoModel')),
              (models.providers ?? []).map((provider) => h('optgroup', { key: provider.id, label: provider.name },
                (provider.models ?? []).map((model) => h('option', { key: `${provider.id}::${model.id}`, value: `${provider.id}::${model.id}` }, model.name)),
              )),
            ),
          ),
          h('div', { className: 'dsh-tarot-row' },
            h('button', {
              type: 'button',
              className: 'dsh-tarot-btn primary',
              onClick: ai.status === 'streaming' ? stopAi : interpret,
              disabled: !done,
            }, ai.status === 'streaming' ? label('stop') : label('askAi')),
            h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: models.reload }, label('refreshModels')),
          ),
          models.error ? h('div', { className: 'dsh-tarot-hint', style: { color: '#ff9c9c' } }, models.error) : null,
          h('div', { className: 'dsh-tarot-meta' },
            h('span', null, `${label('aiModel')}: ${currentModel ? `${currentModel.providerName} / ${currentModel.modelName}` : '—'}`),
            h('span', null, models.loading ? '…' : `${flat.length} models`),
          ),
        ),
        h('div', { className: 'dsh-tarot-panel' },
          h('div', { className: 'dsh-tarot-label' }, ai.status === 'streaming' ? label('thinking') : label('askAi')),
          h('div', { className: 'dsh-tarot-reading' },
            ai.text ? markdownNodes(ai.text) : h('div', { className: 'dsh-tarot-hint' }, label('aiEmpty')),
            ai.error ? h('div', { className: 'dsh-tarot-hint', style: { color: '#ff9c9c' } }, ai.error) : null,
            chat.map((line, index) => h('div', { key: `chat-${index}`, className: `dsh-tarot-chat-line${line.role === 'user' ? ' me' : ''}` },
              h('div', { style: { opacity: 0.7, fontSize: '11px', marginBottom: '2px' } }, line.role === 'user' ? (lang === 'en' ? 'You' : '你') : (lang === 'en' ? 'AI' : 'AI')),
              line.role === 'user' ? line.text : markdownNodes(line.text),
            )),
          ),
          h('div', { className: 'dsh-tarot-row' },
            h('input', {
              value: chatDraft,
              placeholder: label('followUpHint'),
              onChange: (event) => setChatDraft(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendChat()
                }
              },
            }),
            h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: sendChat, disabled: busyChat || !ai.text }, busyChat ? '…' : label('send')),
          ),
        ),
        h('div', { className: 'dsh-tarot-foot' }, label('warning')),
      ),
    ),

    detail ? h('div', { className: 'dsh-tarot-overlay', onClick: () => setDetail(null) },
      h('div', { className: 'dsh-tarot-modal', onClick: (event) => event.stopPropagation() },
        h('div', { className: 'dsh-tarot-modal-head' },
          h('b', null, `${detail.data.zh} · ${detail.data.en}`),
          h('span', { className: 'dsh-tarot-hint' }, detail.position),
          h('button', { type: 'button', className: 'dsh-tarot-btn dsh-tarot-close', onClick: () => setDetail(null) }, label('close')),
        ),
        h('div', { className: 'dsh-tarot-detail' },
          h('img', { src: cardImage(detail.id), alt: detail.data.zh }),
          h('div', null,
            h('dl', { className: 'dsh-tarot-kv' },
              h('dt', null, label('element')), h('dd', null, detail.data.element ?? '—'),
              detail.data.astro ? h('dt', null, label('astro')) : null,
              detail.data.astro ? h('dd', null, detail.data.astro) : null,
              h('dt', null, label('keywords')), h('dd', null, (detail.data.kw ?? []).join('、')),
              h('dt', null, label('positions')), h('dd', null, `${detail.position} · ${label(detail.orientation === 'rev' ? 'reversed' : 'upright')}`),
            ),
            h('div', { style: { fontSize: '13px', lineHeight: 1.75 } },
              h('p', { style: { margin: '0 0 8px' } }, h('strong', null, `${label('meaning')}（${label(detail.orientation === 'rev' ? 'reversed' : 'upright')}）：`), detail.orientation === 'rev' ? detail.data.rev : detail.data.up),
              h('p', { style: { margin: 0, opacity: 0.75 } }, `${label('upright')}：${detail.data.up}`),
              h('p', { style: { margin: '6px 0 0', opacity: 0.75 } }, `${label('reversed')}：${detail.data.rev}`),
            ),
          ),
        ),
      ),
    ) : null,

    showHistory ? h('div', { className: 'dsh-tarot-overlay', onClick: () => setShowHistory(false) },
      h('div', { className: 'dsh-tarot-modal', onClick: (event) => event.stopPropagation() },
        h('div', { className: 'dsh-tarot-modal-head' },
          h('b', null, label('history')),
          h('button', { type: 'button', className: 'dsh-tarot-btn dsh-tarot-close', onClick: () => setShowHistory(false) }, label('close')),
        ),
        history.length === 0 ? h('div', { className: 'dsh-tarot-hint' }, label('emptyHistory')) : null,
        history.map((entry) => h('div', { className: 'dsh-tarot-history-item', key: entry.id },
          h('span', { className: 'when' }, fmtTime(entry.at)),
          h('span', { className: 'what' }, `${entry.spreadZh ?? entry.spreadId} · ${entry.question || '—'} · ${(entry.cards ?? []).length} ${label('cardsCount')}`),
          h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: () => loadHistoryEntry(entry) }, label('loadReading')),
          h('button', { type: 'button', className: 'dsh-tarot-btn', onClick: () => removeHistoryEntry(entry.id) }, label('delete')),
        )),
      ),
    ) : null,

    showSettings ? h('div', { className: 'dsh-tarot-overlay', onClick: () => setShowSettings(false) },
      h('div', { className: 'dsh-tarot-modal', onClick: (event) => event.stopPropagation() },
        h('div', { className: 'dsh-tarot-modal-head' },
          h('b', null, label('settings')),
          h('button', { type: 'button', className: 'dsh-tarot-btn dsh-tarot-close', onClick: () => setShowSettings(false) }, label('close')),
        ),
        h('label', { className: 'dsh-tarot-switch' },
          h('input', {
            type: 'checkbox',
            checked: settings.reversals,
            onChange: (event) => setSettings((prev) => ({ ...prev, reversals: event.target.checked })),
          }),
          h('span', null, label('reversals')),
        ),
        h('div', { className: 'dsh-tarot-switch' },
          h('span', null, label('lang')),
          h('button', { type: 'button', className: `dsh-tarot-tab${lang === 'zh' ? ' on' : ''}`, onClick: () => setLang('zh') }, '中文'),
          h('button', { type: 'button', className: `dsh-tarot-tab${lang === 'en' ? ' on' : ''}`, onClick: () => setLang('en') }, 'English'),
        ),
        h('div', { className: 'dsh-tarot-hint', style: { marginTop: '12px' } }, `${label('aiModel')}: ${currentModel ? `${currentModel.providerName} / ${currentModel.modelName}` : '—'}`),
        h('div', { className: 'dsh-tarot-foot' }, label('warning')),
      ),
    ) : null,
  )
}

const inject = ['slots', 'locale']

function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'dsh-tarot: 词典')
  ctx.effect(() => injectStyles(), 'dsh-tarot: 页面样式')
  const t = ctx.locale.bind(NS)

  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
    inject: () => ({ localeFace: ctx.locale }),
  }, TarotPage)), 'dsh-tarot: 塔罗主面板')

  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 24,
    locale: NS,
    label: () => t('panel'),
  }, TarotIcon)), 'dsh-tarot: 侧栏图标')
}

return { inject, apply }

  },
});
