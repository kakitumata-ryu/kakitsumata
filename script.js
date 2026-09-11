const words=[
 {t:"親父が変だ。最近。",h:"works/kashima3.html",f:"serif"},
 {t:"なんややなくて。みてぇコレ",h:"works/kasa.html",f:"pop"},
 {t:"冷麺はまだ食べてはいけない。",h:"works/reimen.html",f:"serif"},
 {t:"見えない。",h:"works/kashima3.html",f:"brush"},
 {t:"たぶん、もう船は出る。",h:"works/kasa.html",f:"serif"},
 {t:"酒が足りねぇ",h:"works/kasa.html",f:"pop"},
 {t:"どうしてこうなった。",h:"works/reimen.html",f:"brush"}
];
const notes=[
 "眠い。なのに書いている。",
 "作品は増える。机は片付かない。",
 "今日は何も考えたくない。でも書く。",
 "昨日の自分に何を書いたのか聞きたい。",
 "たぶん大丈夫。たぶん。"
];
const sky=document.querySelector("#sky");
const note=document.querySelector("#todayText");
note.textContent=notes[new Date().getDate()%notes.length];

const fonts={
 serif:'"Noto Serif JP","Yu Mincho",serif',
 pop:'"Arial Black","Noto Serif JP",serif',
 brush:'"Yu Mincho","Hiragino Mincho ProN",serif'
};

function drop(){
 sky.innerHTML="";
 [...words].sort(()=>Math.random()-.5).forEach((w,i)=>{
   const a=document.createElement("a");
   a.className="word"; a.href=w.h; a.style.left=(5+Math.random()*88)+"%";
   a.style.setProperty("--duration",(8+Math.random()*7)+"s");
   a.style.setProperty("--delay",(i*.4+Math.random()*1.8)+"s");
   a.style.setProperty("--sway",(-65+Math.random()*130)+"px");
   a.style.setProperty("--rot",(-7+Math.random()*14)+"deg");
   a.style.setProperty("--y",(40+i*55)+"px");
   const s=document.createElement("span"); s.textContent=w.t; s.style.fontFamily=fonts[w.f];
   a.appendChild(s); sky.appendChild(a);
 });
}
drop();
document.querySelector("#again").addEventListener("click",drop);