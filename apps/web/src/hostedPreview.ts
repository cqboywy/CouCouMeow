type Sentence={id:string;english:string;chinese:string;is_featured:boolean};
type Vocab={id:string;word:string;phonetic:string;meaning:string};

const episode={
  id:'l1-001-dino-buddies-the-park',level:1,series_title:'Dino Buddies',episode_number:1,title:'The Park',chinese_title:'恐龙伙伴：公园奇遇',local_video_filename:'001_Dino Buddies 1_The Park.mp4',is_published:true,is_learned:false,
  story_summary:'Rex 在公园里想和其他恐龙交朋友，可大家因为他是霸王龙而害怕地跑开了。后来他发现，原来一只恐龙是尾巴卡在树里，才一直喊救命。',
  story_theme:'不要只凭外表判断别人。先认真听，再用善意帮助需要帮助的朋友。',
  sentences:[
    {id:'sentence-1',english:'One day Rex was in the park.',chinese:'一天，Rex 在公园里。',is_featured:true},
    {id:'sentence-2',english:'He saw other dinosaurs.',chinese:'他看到了其他恐龙。',is_featured:true},
    {id:'sentence-6',english:'They ran away.',chinese:'他们跑开了。',is_featured:true},
    {id:'sentence-8',english:"Don't eat me!",chinese:'别吃我！',is_featured:true},
  ] satisfies Sentence[],
  vocab:[
    {id:'vocab-park',word:'park',phonetic:'/pɑːk/',meaning:'公园'},
    {id:'vocab-dinosaur',word:'dinosaur',phonetic:'/ˈdaɪnəsɔː/',meaning:'恐龙'},
    {id:'vocab-other',word:'other',phonetic:'/ˈʌðə/',meaning:'其他的'},
    {id:'vocab-run-away',word:'run away',phonetic:'/rʌn əˈweɪ/',meaning:'跑开；逃走'},
    {id:'vocab-friend',word:'friend',phonetic:'/frend/',meaning:'朋友'},
    {id:'vocab-afraid',word:'afraid',phonetic:'/əˈfreɪd/',meaning:'害怕的'},
  ] satisfies Vocab[],
  knowledge:[{id:'knowledge-1',title:'主语 + was / were + 地点',explanation:'讲过去发生的故事时，用 was 或 were 表示某人当时在哪里。',examples:['I was in the library.','The cat was in the garden.']}],
  comprehension_questions:['Rex 在哪里遇到了其他恐龙？','为什么其他恐龙看到 Rex 后跑开了？'],
  retell_steps:['Rex 来到公园，想认识新朋友。','其他恐龙误会 Rex，害怕地跑开了。','Rex 发现一只恐龙需要帮助。'],
  past_tense_pairs:[{base:'see',past:'saw',meaning:'看见'},{base:'run',past:'ran',meaning:'跑'},{base:'say',past:'said',meaning:'说'}],
};

type PreviewListItem={id:string;level:number;series_title:string;episode_number:number;title:string;local_video_filename:string;is_published:boolean;is_learned:boolean};
const toListItem=({id,level,series_title,episode_number,title,local_video_filename,is_published,is_learned}:typeof episode):PreviewListItem=>({id,level,series_title,episode_number,title,local_video_filename,is_published,is_learned});
const episodeList:PreviewListItem[]=[toListItem(episode),{id:'l1-bat-and-friends-001-hunting-for-bugs',level:1,series_title:'Bat and Friends',episode_number:1,title:'Hunting for Bugs',local_video_filename:'001_Bat and Friends 1_Hunting for Bugs.mp4',is_published:true,is_learned:false},{id:'l1-bat-and-friends-002-lost-in-the-rain',level:1,series_title:'Bat and Friends',episode_number:2,title:'Lost in the Rain',local_video_filename:'002_Bat and Friends 2_Lost in the Rain.mp4',is_published:true,is_learned:false}];

export function hostedPreviewApi(path:string,init?:RequestInit):unknown{
  if(path==='/episodes')return {items:episodeList};
  if(path==='/stats')return {learned_episodes:1,total_words:4,practice_count:8,mistake_count:2};
  if(path===`/episodes/${episode.id}`)return episode;
  if(path===`/episodes/${episode.id}/learned`)return {...episode,is_learned:true};
  if(path==='/practice/dictation'){
    const body=JSON.parse(String(init?.body??'{}')) as {vocab_id?:string;answer?:string;answer_method?:'written'|'spoken'};
    const expected=episode.vocab.find(item=>item.id===body.vocab_id)?.word.toLowerCase();
    const correct=body.answer?.trim().toLowerCase()===expected;
    return {attempt_id:`preview-${body.vocab_id??'attempt'}`,is_correct:correct,message:correct?'太棒啦，这个单词被你抓住了！':'再听一遍，慢慢写也没关系。',similarity:correct?1:0,answer_method:body.answer_method??'written'};
  }
  throw new Error(`Hosted preview does not provide ${path}`);
}
