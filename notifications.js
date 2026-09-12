/* KAKITSUMATA_NOTIFICATIONS_V90 */
(() => {
  if (window.__KKT_NOTIFICATIONS_V87_LOADED__) return;
  window.__KKT_NOTIFICATIONS_V87_LOADED__ = true;

  const pools = {
    first: [
      {name:'真島', icon:'🐍', text:'お、初めて見る顔やな'},
      {name:'桐生', icon:'🐉', text:'ここはどこだ？'},
      {name:'冴島', icon:'🐯', text:'飯いくで兄弟'}
    ],
    revisit: [
      {name:'真島', icon:'🐍', text:'また来たんか'},
      {name:'佐川', icon:'🦈', text:'そんな暇あるわけ？'},
      {name:'西田', icon:'🦅', text:'おやじぃ、またですかぁ～！？'}
    ],
    read: [
      {name:'真島', icon:'🐍', text:'読み終わったんか？'},
      {name:'桐生', icon:'🐉', text:'文字を読むのは、得意じゃねえ、'},
      {name:'冴島', icon:'🐯', text:'読書はええな'}
    ],
    late: [
      {name:'真島', icon:'🐍', text:'はよ寝ろや'},
      {name:'桐生', icon:'🐉', text:'こんな時間は、兄さんのスケベに限る'},
      {name:'佐川', icon:'🦈', text:'夜の相手もしてくれんの？'}
    ]
  };

  const replies = {
    '真島|お、初めて見る顔やな': [
      { choice:'初めまして！', reply:'ええ返事や！何事も挨拶からやからな！' },
      { choice:'組に入れてください！', reply:'ほおん、ええで。ほなまずは喧嘩の実力みせてみい！' },
      { choice:'忘れたのか、、！？', reply:'……、お前が別人のふりしろ言うたんやないか' }
    ],
    '桐生|ここはどこだ？': [
      { choice:'奇遇やな、桐生ちゃん！', reply:'な、兄さん！！またあんたの仕業か！' },
      { choice:'ﾋﾟｰｰｰしないと出られない部屋', reply:'なに、？ﾋﾟｰｰｰだと、、？' }
    ],
    '真島|読み終わったんか？': [
      { choice:'おう、またせてしもたな', reply:'ええからはよ帰ろ' },
      { choice:'え？ああ、まあな……', reply:'なんや、なに読んどったんや！ほれみせてみい！' },
      { choice:'悪いがまだ……', reply:'はあ～～！？いつまで待たせるねん！' }
    ]
  };

  const path = location.pathname.replace(/\\/g,'/');
  const isReader = /\/works\/[^/]+\.html$/i.test(path);
  const isListPage = /\/adult\.html$/i.test(path) || /\/index\.html$/i.test(path) || path.endsWith('/');
  const KEY_VISITED = 'kakitsumata-site-visited-v87';
  const KEY_LAST = 'kakitsumata-last-notification-v87';
  const KEY_READ = 'kakitsumata-read-complete-v87';

  // 通知は「たまに」だけ。初訪問は演出とぶつからないよう遅め。
  const GENERAL_CHANCE = 0.10;
  const FIRST_CHANCE = 0.08;

  function safeGet(storage,key){ try{return storage.getItem(key)}catch{return null} }
  function safeSet(storage,key,val){ try{storage.setItem(key,val)}catch{} }
  function safeRemove(storage,key){ try{storage.removeItem(key)}catch{} }
  function isLate(){ const h=new Date().getHours(); return h>=23 || h<5; }

  function pick(pool){
    const last=safeGet(localStorage,KEY_LAST)||'';
    let choices=pool.filter(x=>`${x.name}|${x.text}`!==last);
    if(!choices.length) choices=pool.slice();
    return choices[Math.floor(Math.random()*choices.length)];
  }
  function markLast(item){ safeSet(localStorage,KEY_LAST,`${item.name}|${item.text}`); }

  function ensureHost(){
    let host=document.querySelector('.kkt-notification-host');
    if(!host){
      host=document.createElement('div');
      host.className='kkt-notification-host';
      host.setAttribute('aria-live','polite');
      host.setAttribute('aria-atomic','true');
      document.body.appendChild(host);
    }
    return host;
  }

  function show(item,allowFollowup=true){
    const host=ensureHost();
    if(host.querySelector('.kkt-notification')) return;
    markLast(item);
    const card=document.createElement('div');
    card.className='kkt-notification';
    card.setAttribute('role','status');
    card.innerHTML=`<div class="kkt-notification-avatar" aria-hidden="true">${item.icon}</div><div class="kkt-notification-copy"><div class="kkt-notification-name">${item.name}</div><div class="kkt-notification-message"></div><div class="kkt-notification-choices" hidden></div></div><button type="button" class="kkt-notification-close" aria-label="通知を閉じる">×</button>`;
    card.querySelector('.kkt-notification-message').textContent=item.text;
    host.appendChild(card);

    const choiceList=replies[`${item.name}|${item.text}`]||null;
    const choicesEl=card.querySelector('.kkt-notification-choices');
    let conversationFinished=false;
    if(choiceList){
      card.classList.add('is-interactive');
      card.setAttribute('tabindex','0');
      card.setAttribute('role','button');
    }

    let closed=false;
    const dismiss=(fromClose=false)=>{
      if(closed)return;
      closed=true;
      card.classList.add('is-leaving');
      window.setTimeout(()=>card.remove(),340);
      if(fromClose && allowFollowup && Math.random()<0.35){
        window.setTimeout(()=>{ if(!isReader) show({ ...pick(pools.revisit), pool:pools.revisit },false); },420);
      }
    };
    card.querySelector('.kkt-notification-close').addEventListener('click',ev=>{ev.stopPropagation();dismiss(true);});

    function openChoices(){
      if(!choiceList || conversationFinished || closed)return;
      choicesEl.hidden=false;
      choicesEl.innerHTML='';
      choiceList.forEach(entry=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='kkt-notification-choice';
        btn.textContent=entry.choice;
        btn.addEventListener('click',ev=>{
          ev.stopPropagation();
          if(conversationFinished)return;
          conversationFinished=true;
          choicesEl.innerHTML='';
          const replyEl=document.createElement('div');
          replyEl.className='kkt-notification-reply';
          replyEl.textContent=entry.reply;
          choicesEl.appendChild(replyEl);
          window.setTimeout(()=>dismiss(false),5000);
        });
        choicesEl.appendChild(btn);
      });
    }
    if(choiceList){
      card.addEventListener('click',ev=>{ if(!ev.target.closest('.kkt-notification-close,.kkt-notification-choice')) openChoices(); });
    }
    window.setTimeout(()=>{ if(!conversationFinished) dismiss(false); },4300);
  }

  function withPool(item,pool){ item.pool=pool; return item; }
  function schedule(fn,minDelay,maxDelay){ const delay=Math.floor(minDelay+Math.random()*(maxDelay-minDelay+1)); window.setTimeout(fn,delay); }

  function showContextNotification(){
    if(!isListPage || isReader) return;
    if(window.__KKT_NOTIFICATION_SCHEDULED__) return;
    window.__KKT_NOTIFICATION_SCHEDULED__=true;

    const readDone=safeGet(sessionStorage,KEY_READ)==='1';
    if(readDone){
      safeRemove(sessionStorage,KEY_READ);
      if(Math.random()>GENERAL_CHANCE)return;
      schedule(()=>{if(!isReader)show(withPool(pick(pools.read),pools.read),true);},800,1200);
      return;
    }

    const seen=safeGet(localStorage,KEY_VISITED)==='1';
    safeSet(localStorage,KEY_VISITED,'1');
    if(!seen){
      if(Math.random()>FIRST_CHANCE)return;
      schedule(()=>{if(!isReader)show(withPool(pick(pools.first),pools.first),true);},1000,1500);
      return;
    }

    if(isLate()){
      if(Math.random()>GENERAL_CHANCE)return;
      schedule(()=>{if(!isReader)show(withPool(pick(pools.late),pools.late),true);},800,1200);
      return;
    }

    if(Math.random()>GENERAL_CHANCE)return;
    schedule(()=>{if(!isReader)show(withPool(pick(pools.revisit),pools.revisit),true);},800,1200);
  }

  function bindReaderReturn(){
    document.querySelectorAll('.reader-nav a[href*="index.html#novel"]').forEach(a=>a.addEventListener('click',()=>safeSet(sessionStorage,KEY_READ,'1')));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(isReader){ bindReaderReturn(); return; }
    if(isListPage){ showContextNotification(); }
  });
})();
