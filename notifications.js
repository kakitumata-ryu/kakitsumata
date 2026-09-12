/* KAKITSUMATA_NOTIFICATIONS_V83 */
(() => {
  const pools = {
    first: [
      {name:'真島', icon:'🐍', text:'お、初めて見る顔やな'},
      {name:'桐生', icon:'🐉', text:'ポケサーやろうぜ！'},
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

  const path = location.pathname.replace(/\\/g,'/');
  const isReader = /\/works\/[^/]+\.html$/i.test(path);
  const isListPage = /\/adult\.html$/i.test(path) || /\/index\.html$/i.test(path) || path.endsWith('/');
  const KEY_VISITED = 'kakitsumata-site-visited-v83';
  const KEY_LAST = 'kakitsumata-last-notification-v83';
  const KEY_READ = 'kakitsumata-read-complete-v83';

  // 通知は「たまに」だけ。初訪問は演出とぶつからないようかなり遅め。
  const GENERAL_CHANCE = 0.24;
  const FIRST_CHANCE = 0.18;

  function safeGet(storage,key){ try{return storage.getItem(key)}catch{return null} }
  function safeSet(storage,key,val){ try{storage.setItem(key,val)}catch{} }

  function isLate(){
    const h = new Date().getHours();
    return h >= 23 || h < 5;
  }

  function pick(pool){
    const last = safeGet(localStorage,KEY_LAST) || '';
    let choices = pool.filter(x => `${x.name}|${x.text}` !== last);
    if (!choices.length) choices = pool.slice();
    return choices[Math.floor(Math.random()*choices.length)];
  }

  function markLast(item){ safeSet(localStorage,KEY_LAST,`${item.name}|${item.text}`); }

  function ensureHost(){
    let host = document.querySelector('.kkt-notification-host');
    if(!host){
      host=document.createElement('div');
      host.className='kkt-notification-host';
      host.setAttribute('aria-live','polite');
      host.setAttribute('aria-atomic','true');
      document.body.appendChild(host);
    }
    return host;
  }

  let activeClose = null;
  function show(item, allowFollowup=true){
    const host=ensureHost();
    if(host.querySelector('.kkt-notification')) return;
    markLast(item);
    const card=document.createElement('div');
    card.className='kkt-notification';
    card.setAttribute('role','status');
    card.innerHTML=`
      <div class="kkt-notification-avatar" aria-hidden="true">${item.icon}</div>
      <div class="kkt-notification-copy">
        <div class="kkt-notification-name">${item.name}</div>
        <div class="kkt-notification-message"></div>
      </div>
      <button type="button" class="kkt-notification-close" aria-label="通知を閉じる">×</button>`;
    card.querySelector('.kkt-notification-message').textContent=item.text;
    host.appendChild(card);

    let closed=false;
    const dismiss=(fromClose=false)=>{
      if(closed) return;
      closed=true;
      card.classList.add('is-leaving');
      window.setTimeout(()=>card.remove(),340);
      if(fromClose && allowFollowup && Math.random()<0.35){
        window.setTimeout(()=>{
          if(!isReader) show(pick(item.pool || pools.revisit), false);
        },420);
      }
      activeClose=null;
    };
    card.querySelector('.kkt-notification-close').addEventListener('click',()=>dismiss(true));
    activeClose=()=>dismiss(false);
    window.setTimeout(()=>dismiss(false),4300);
  }

  function withPool(item,pool){ item.pool=pool; return item; }

  function schedule(fn, minDelay, maxDelay){
    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay + 1));
    window.setTimeout(fn, delay);
  }

  function showContextNotification(){
    if(!isListPage || isReader) return;

    const readDone=safeGet(sessionStorage,KEY_READ)==='1';
    if(readDone){
      sessionStorage.removeItem(KEY_READ);
      if(Math.random() > GENERAL_CHANCE) return;
      schedule(()=>{
        if(!isReader) show(withPool(pick(pools.read),pools.read),true);
      }, 3500, 7000);
      return;
    }

    const seen=safeGet(localStorage,KEY_VISITED)==='1';
    const pool=seen?pools.revisit:pools.first;
    safeSet(localStorage,KEY_VISITED,'1');

    // 深夜通知も「まれに」。
    if(isLate()){
      if(Math.random() > GENERAL_CHANCE) return;
      schedule(()=>{
        if(!isReader) show(withPool(pick(pools.late),pools.late),true);
      }, 4500, 8500);
      return;
    }

    // 初訪問は特に遅く、演出やページ読み込み直後と重ならないようにする。
    if(!seen){
      if(Math.random() > FIRST_CHANCE) return;
      schedule(()=>{
        if(!isReader) show(withPool(pick(pools.first),pools.first),true);
      }, 10000, 15000);
      return;
    }

    if(Math.random() > GENERAL_CHANCE) return;
    schedule(()=>{
      if(!isReader) show(withPool(pick(pool),pool),true);
    }, 4500, 8500);
  }

  function bindReaderReturn(){
    document.querySelectorAll('.reader-nav a[href*="index.html#novel"]').forEach(a=>{
      a.addEventListener('click',()=>{
        safeSet(sessionStorage,KEY_READ,'1');
      });
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(isReader){
      bindReaderReturn();
      return;
    }
    if(isListPage) showContextNotification();
  });
})();
