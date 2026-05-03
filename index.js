// ═══════════════════════════════════════════════════
//  星空背景脚本 v3 · 自动判断桌面 / 手机
//  设置 → 用户设置 → 自定义JS → 粘贴 → 保存 → 刷新
// ═══════════════════════════════════════════════════

(function () {
‘use strict’;

```
if (document.getElementById('celestial-canvas')) return;

const STARS = [
    { ra:5.242,  dec:-8.202,  mag:0.18,  name:"参宿四 Betelgeuse",  con:"Orion" },
    { ra:5.795,  dec:-9.670,  mag:0.12,  name:"参宿七 Rigel",        con:"Orion" },
    { ra:5.533,  dec:-0.299,  mag:2.23,  name:"参宿三 Mintaka",      con:"Orion" },
    { ra:5.603,  dec:-1.202,  mag:1.70,  name:"参宿二 Alnilam",      con:"Orion" },
    { ra:5.679,  dec:-1.943,  mag:2.05,  name:"参宿一 Alnitak",      con:"Orion" },
    { ra:5.418,  dec: 6.350,  mag:1.64,  name:"参宿五 Bellatrix",    con:"Orion" },
    { ra:5.920,  dec: 7.407,  mag:2.06,  name:"参宿六 Saiph",        con:"Orion" },
    { ra:11.062, dec:61.751,  mag:1.79,  name:"天璇 Merak",          con:"UMa" },
    { ra:11.030, dec:56.383,  mag:2.37,  name:"天枢 Dubhe",          con:"UMa" },
    { ra:12.257, dec:57.033,  mag:2.44,  name:"玉衡 Alioth",         con:"UMa" },
    { ra:12.900, dec:55.960,  mag:1.76,  name:"开阳 Mizar",          con:"UMa" },
    { ra:13.792, dec:49.314,  mag:1.85,  name:"摇光 Alkaid",         con:"UMa" },
    { ra:11.897, dec:53.695,  mag:2.40,  name:"天权 Megrez",         con:"UMa" },
    { ra:11.161, dec:44.499,  mag:2.44,  name:"天玑 Phecda",         con:"UMa" },
    { ra:16.490, dec:-26.432, mag:1.06,  name:"心宿二 Antares",      con:"Scorpius" },
    { ra:17.622, dec:-37.103, mag:1.87,  name:"尾宿八 Shaula",       con:"Scorpius" },
    { ra:16.006, dec:-22.622, mag:2.32,  name:"房宿一 Dschubba",     con:"Scorpius" },
    { ra:16.353, dec:-28.216, mag:2.62,  name:"心宿一 Acrab",        con:"Scorpius" },
    { ra:10.140, dec:11.967,  mag:1.36,  name:"轩辕十四 Regulus",    con:"Leo" },
    { ra:11.817, dec:14.572,  mag:2.14,  name:"五帝座一 Denebola",   con:"Leo" },
    { ra:10.333, dec:19.842,  mag:2.61,  name:"轩辕十二 Zosma",      con:"Leo" },
    { ra:10.122, dec:16.763,  mag:2.98,  name:"轩辕十一 Algieba",    con:"Leo" },
    { ra:0.945,  dec:60.717,  mag:2.24,  name:"王良一 Schedar",      con:"Cas" },
    { ra:0.153,  dec:59.150,  mag:2.28,  name:"策 Caph",             con:"Cas" },
    { ra:1.430,  dec:60.235,  mag:2.68,  name:"王良四 Gamma Cas",    con:"Cas" },
    { ra:1.906,  dec:60.680,  mag:2.66,  name:"阁道二 Ruchbah",      con:"Cas" },
    { ra:1.172,  dec:63.670,  mag:3.35,  name:"阁道一 Epsilon Cas",  con:"Cas" },
    { ra:20.690, dec:45.280,  mag:1.25,  name:"天津四 Deneb",        con:"Cygnus" },
    { ra:19.495, dec:27.960,  mag:2.46,  name:"辇道增七 Albireo",    con:"Cygnus" },
    { ra:20.370, dec:40.257,  mag:2.23,  name:"天津一 Sadr",         con:"Cygnus" },
    { ra:21.216, dec:30.227,  mag:2.87,  name:"天津九 Gienah",       con:"Cygnus" },
    { ra:18.615, dec:38.783,  mag:0.03,  name:"织女一 Vega",         con:"Lyra" },
    { ra:18.746, dec:37.605,  mag:3.52,  name:"织女二 Sheliak",      con:"Lyra" },
    { ra:18.834, dec:32.690,  mag:3.25,  name:"织女三 Sulafat",      con:"Lyra" },
    { ra:19.847, dec:8.868,   mag:0.77,  name:"牛郎星 Altair",       con:"Aquila" },
    { ra:19.771, dec:10.613,  mag:2.72,  name:"河鼓一 Tarazed",      con:"Aquila" },
    { ra:19.090, dec:13.863,  mag:3.43,  name:"河鼓三 Deneb Okab",   con:"Aquila" },
    { ra:4.599,  dec:16.509,  mag:0.87,  name:"毕宿五 Aldebaran",    con:"Taurus" },
    { ra:3.791,  dec:24.105,  mag:2.87,  name:"昴宿六 Alcyone",      con:"Taurus" },
    { ra:5.438,  dec:28.608,  mag:1.65,  name:"五车二 Elnath",       con:"Taurus" },
    { ra:7.755,  dec:28.026,  mag:1.14,  name:"北河三 Pollux",       con:"Gemini" },
    { ra:7.577,  dec:31.889,  mag:1.58,  name:"北河二 Castor",       con:"Gemini" },
    { ra:6.383,  dec:22.514,  mag:1.93,  name:"井宿三 Alhena",       con:"Gemini" },
    { ra:7.068,  dec:20.570,  mag:3.36,  name:"井宿五 Mebsuda",      con:"Gemini" },
    { ra:13.420, dec:-11.162, mag:0.97,  name:"角宿一 Spica",        con:"Virgo" },
    { ra:12.694, dec:-1.449,  mag:2.83,  name:"太微左垣五 Porrima",  con:"Virgo" },
    { ra:5.278,  dec:45.998,  mag:0.08,  name:"五车二 Capella",      con:"Auriga" },
    { ra:5.992,  dec:44.947,  mag:1.90,  name:"五车三 Menkalinan",   con:"Auriga" },
    { ra:14.261, dec:19.182,  mag:-0.05, name:"大角 Arcturus",       con:"Bootes" },
    { ra:6.752,  dec:-16.713, mag:-1.46, name:"天狼星 Sirius",       con:"CMa" },
    { ra:7.655,  dec:5.225,   mag:0.50,  name:"南河三 Procyon",      con:"CMi" },
    { ra:22.961, dec:-29.622, mag:1.16,  name:"北落师门 Fomalhaut",  con:"PsA" },
];

const LINES = {
    Orion:    [["参宿四 Betelgeuse","参宿五 Bellatrix"],["参宿五 Bellatrix","参宿三 Mintaka"],["参宿三 Mintaka","参宿二 Alnilam"],["参宿二 Alnilam","参宿一 Alnitak"],["参宿一 Alnitak","参宿七 Rigel"],["参宿七 Rigel","参宿六 Saiph"],["参宿六 Saiph","参宿一 Alnitak"],["参宿四 Betelgeuse","参宿三 Mintaka"]],
    UMa:      [["天枢 Dubhe","天璇 Merak"],["天璇 Merak","天玑 Phecda"],["天玑 Phecda","天权 Megrez"],["天权 Megrez","天枢 Dubhe"],["天权 Megrez","玉衡 Alioth"],["玉衡 Alioth","开阳 Mizar"],["开阳 Mizar","摇光 Alkaid"]],
    Scorpius: [["房宿一 Dschubba","心宿二 Antares"],["心宿一 Acrab","心宿二 Antares"],["心宿二 Antares","尾宿八 Shaula"]],
    Leo:      [["轩辕十四 Regulus","轩辕十一 Algieba"],["轩辕十一 Algieba","轩辕十二 Zosma"],["轩辕十二 Zosma","五帝座一 Denebola"]],
    Cas:      [["策 Caph","王良一 Schedar"],["王良一 Schedar","阁道一 Epsilon Cas"],["阁道一 Epsilon Cas","王良四 Gamma Cas"],["王良四 Gamma Cas","阁道二 Ruchbah"]],
    Cygnus:   [["天津四 Deneb","天津一 Sadr"],["天津一 Sadr","辇道增七 Albireo"],["天津一 Sadr","天津九 Gienah"]],
    Lyra:     [["织女一 Vega","织女二 Sheliak"],["织女二 Sheliak","织女三 Sulafat"],["织女三 Sulafat","织女一 Vega"]],
    Aquila:   [["河鼓三 Deneb Okab","牛郎星 Altair"],["牛郎星 Altair","河鼓一 Tarazed"]],
    Taurus:   [["毕宿五 Aldebaran","昴宿六 Alcyone"],["毕宿五 Aldebaran","五车二 Elnath"]],
    Gemini:   [["北河二 Castor","北河三 Pollux"],["北河三 Pollux","井宿三 Alhena"],["井宿三 Alhena","井宿五 Mebsuda"],["北河二 Castor","井宿五 Mebsuda"]],
    Auriga:   [["五车二 Capella","五车三 Menkalinan"]],
    Virgo:    [["角宿一 Spica","太微左垣五 Porrima"]],
};

const Rad = d => d*Math.PI/180;
const Deg = r => r*180/Math.PI;
const julianDate = d => d.getTime()/86400000+2440587.5;
function gmst(j) {
    const T=(j-2451545)/36525;
    return(((280.46061837+360.98564736629*(j-2451545)+T*T*0.000387933-T*T*T/38710000)%360)+360)%360;
}
function lst(j,lon){ return((gmst(j)+lon)%360+360)%360; }

function altAz(ra,dec,lstD,lat){
    const ha=Rad(((lstD-ra)%360+360)%360), d=Rad(dec), La=Rad(lat);
    const sa=Math.sin(d)*Math.sin(La)+Math.cos(d)*Math.cos(La)*Math.cos(ha);
    const alt=Math.asin(Math.max(-1,Math.min(1,sa)));
    const ca=(Math.sin(d)-Math.sin(alt)*Math.sin(La))/(Math.cos(alt)*Math.cos(La));
    let az=Math.acos(Math.max(-1,Math.min(1,ca)));
    if(Math.sin(ha)>0) az=2*Math.PI-az;
    return{alt:Deg(alt),az:Deg(az)};
}

function project(alt,az,W,H){
    const r=Math.cos(Rad(alt))/(1+Math.sin(Rad(alt)));
    const s=Math.min(W,H)*0.5;
    return{x:W/2+s*r*Math.sin(Rad(az)),y:H/2-s*r*Math.cos(Rad(az)),ok:alt>-8};
}

function init() {
    // ── 1. 黑色背景层
    const bgDiv = document.createElement('div');
    bgDiv.id = 'celestial-bg';
    Object.assign(bgDiv.style, {
        position:'fixed', inset:'0',
        background:'#060608',
        zIndex:'1',
        pointerEvents:'none',
    });
    document.body.insertBefore(bgDiv, document.body.firstChild);

    // ── 2. 星空 canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'celestial-canvas';
    Object.assign(canvas.style, {
        position:'fixed', top:'0', left:'0',
        width:'100%', height:'100%',
        zIndex:'2',
        pointerEvents: isMobile ? 'auto' : 'none', // 手机需要接收 touch
        display:'block',
    });
    document.body.insertBefore(canvas, bgDiv.nextSibling);
    const ctx = canvas.getContext('2d');

    // ── 3. 提升 ST 主要容器
    function liftST() {
        [
            '#page-wrapper','#sheld','#chat-wrapper',
            '#top-settings-holder','#send_form',
            '#shadow_popup','#dialogue_popup',
            '#floatingPrompt','#expression-holder',
        ].forEach(sel => {
            const el = document.querySelector(sel);
            if (!el) return;
            const pos = window.getComputedStyle(el).position;
            if (pos === 'static') el.style.position = 'relative';
            // 手机端需要更高的 zIndex 确保 UI 盖过 canvas
            el.style.zIndex = isMobile ? '20' : '10';
        });
        // 手机端：canvas 退到底层，不拦截触控
        if (isMobile) {
            canvas.style.zIndex = '2';
            canvas.style.pointerEvents = 'none';
        }
    }
    liftST();
    setTimeout(liftST, 800);

    // ── 4. 星名标签
    const hoverEl = document.createElement('div');
    hoverEl.id = 'celestial-hover';
    Object.assign(hoverEl.style, {
        position:'fixed', display:'none',
        color:'rgba(215,225,255,0.85)',
        fontFamily:'Courier New, monospace',
        fontSize: isMobile ? '12px' : '10px',
        letterSpacing:'3px',
        fontStyle:'italic', pointerEvents:'none',
        zIndex:'9999',
        textShadow:'0 0 8px rgba(180,200,255,0.6)',
        background:'rgba(4,4,10,0.72)',
        padding:'4px 10px', borderRadius:'2px',
        transition:'opacity 0.3s',
    });
    document.body.appendChild(hoverEl);

    // ── 5. 时间显示（手机端移到左下角，避开输入框）
    const timeEl = document.createElement('div');
    timeEl.id = 'celestial-time';
    Object.assign(timeEl.style, {
        position:'fixed',
        bottom: isMobile ? '72px' : '18px',
        right:'18px',
        color:'rgba(148,162,208,0.28)',
        fontFamily:'Courier New, monospace',
        fontSize:'9px', letterSpacing:'3px',
        fontStyle:'italic', pointerEvents:'none',
        zIndex:'9999', textAlign:'right',
        lineHeight:'1.9', userSelect:'none',
    });
    document.body.appendChild(timeEl);

    let W, H, bgStars=[], starPos=[], frame=0;
    let LAT=39.9, LON=116.4, locLabel='北京';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p=>{LAT=p.coords.latitude;LON=p.coords.longitude;locLabel=`${LAT.toFixed(1)}°N`;},
            ()=>{}
        );
    }

    function resize(){
        W=canvas.width=window.innerWidth;
        H=canvas.height=window.innerHeight;
        // 手机端减少微星数量，省电省性能
        const density = isMobile ? 6000 : 2000;
        bgStars=Array.from({length:Math.floor(W*H/density)},()=>({
            x:Math.random()*W, y:Math.random()*H,
            r:Math.random()*0.9+0.15,
            a:Math.random()*0.38+0.08,
            tw:Math.random()*Math.PI*2,
            spd:Math.random()*0.007+0.002,
        }));
    }

    const starR   = mag => Math.max(0.5,3.2-mag*0.50);
    const starAlp = mag => Math.max(0.20,Math.min(0.96,1.05-mag*0.12));

    function draw(){
        frame++;
        ctx.clearRect(0,0,W,H);

        const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.75);
        g.addColorStop(0,'rgba(10,10,25,0)');
        g.addColorStop(0.6,'rgba(4,4,12,0.18)');
        g.addColorStop(1,'rgba(2,2,8,0.50)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

        bgStars.forEach(s=>{
            const tw=Math.sin(s.tw+frame*s.spd)*0.12;
            ctx.beginPath();
            ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(215,222,255,${Math.max(0,s.a+tw)})`;
            ctx.fill();
        });

        const now=new Date();
        const lstD=lst(julianDate(now),LON);

        starPos=STARS.map(s=>{
            const pos=altAz(s.ra*15,s.dec,lstD,LAT);
            const px=project(pos.alt,pos.az,W,H);
            return{...s,...pos,...px};
        });

        const idx={};
        starPos.forEach(s=>{idx[s.name]=s;});

        Object.values(LINES).forEach(pairs=>{
            pairs.forEach(([a,b])=>{
                const A=idx[a],B=idx[b];
                if(!A||!B||!A.ok||!B.ok) return;
                const fade=Math.min(1,(Math.min(A.alt,B.alt)+5)/18);
                if(fade<=0) return;
                ctx.beginPath();
                ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y);
                ctx.strokeStyle=`rgba(185,208,255,${0.065*fade})`;
                ctx.lineWidth=0.5; ctx.stroke();
            });
        });

        starPos.forEach(s=>{
            if(!s.ok) return;
            const fade=Math.min(1,(s.alt+5)/20);
            if(fade<=0) return;
            // 手机端星点稍微大一点，更好看
            const r=starR(s.mag) * (isMobile ? 1.3 : 1.0);
            const alp=starAlp(s.mag)*fade;

            if(s.mag<2.5){
                const gr=r*5.5;
                const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,gr);
                glow.addColorStop(0,`rgba(215,230,255,${alp*0.32})`);
                glow.addColorStop(0.4,`rgba(195,215,255,${alp*0.12})`);
                glow.addColorStop(1,'rgba(0,0,0,0)');
                ctx.beginPath(); ctx.arc(s.x,s.y,gr,0,Math.PI*2);
                ctx.fillStyle=glow; ctx.fill();
            }

            ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
            ctx.fillStyle=`rgba(235,240,255,${alp})`; ctx.fill();
        });

        const p2=n=>String(n).padStart(2,'0');
        const lh=Math.floor(lstD/15), lm=Math.floor((lstD/15-lh)*60);
        timeEl.innerHTML=
            `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}<br>`+
            `${locLabel}<br>LST ${p2(lh)}h${p2(lm)}m`;

        requestAnimationFrame(draw);
    }

    // ── 桌面：鼠标悬停显示星名
    if (!isMobile) {
        document.addEventListener('mousemove', e=>{
            let best=null, minD=42;
            starPos.forEach(s=>{
                if(!s.ok) return;
                const d=Math.hypot(s.x-e.clientX, s.y-e.clientY);
                if(d<minD){minD=d;best=s;}
            });
            if(best){
                hoverEl.style.display='block';
                hoverEl.style.left=(best.x+14)+'px';
                hoverEl.style.top=(best.y-6)+'px';
                hoverEl.textContent=best.name;
            } else {
                hoverEl.style.display='none';
            }
        });
    }

    // ── 手机：点击显示星名，1.8秒后自动消失
    if (isMobile) {
        let hideTimer = null;
        document.addEventListener('touchstart', e=>{
            const touch = e.touches[0];
            // 如果点击的是 ST 的 UI 元素，不触发星名
            if (e.target !== canvas && e.target !== document.body) return;
            let best=null, minD=60; // 手机触控范围更大
            starPos.forEach(s=>{
                if(!s.ok) return;
                const d=Math.hypot(s.x-touch.clientX, s.y-touch.clientY);
                if(d<minD){minD=d;best=s;}
            });
            if(best){
                hoverEl.style.display='block';
                hoverEl.style.left=Math.min(touch.clientX+14, W-140)+'px';
                hoverEl.style.top=Math.max(touch.clientY-28, 10)+'px';
                hoverEl.textContent=best.name;
                clearTimeout(hideTimer);
                hideTimer=setTimeout(()=>{ hoverEl.style.display='none'; }, 1800);
            }
        }, { passive: true });
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
```

})();
