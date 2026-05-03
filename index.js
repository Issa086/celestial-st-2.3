// 星空背景 v4 · SillyTavern 扩展
(function () {
    'use strict';
    if (document.getElementById('celestial-canvas')) return;

    const STARS = [
        {ra:5.242,dec:-8.202,mag:0.18,name:"参宿四 Betelgeuse"},{ra:5.795,dec:-9.670,mag:0.12,name:"参宿七 Rigel"},
        {ra:5.533,dec:-0.299,mag:2.23,name:"参宿三 Mintaka"},{ra:5.603,dec:-1.202,mag:1.70,name:"参宿二 Alnilam"},
        {ra:5.679,dec:-1.943,mag:2.05,name:"参宿一 Alnitak"},{ra:5.418,dec:6.350,mag:1.64,name:"参宿五 Bellatrix"},
        {ra:5.920,dec:7.407,mag:2.06,name:"参宿六 Saiph"},
        {ra:11.062,dec:61.751,mag:1.79,name:"天璇 Merak"},{ra:11.030,dec:56.383,mag:2.37,name:"天枢 Dubhe"},
        {ra:12.257,dec:57.033,mag:2.44,name:"玉衡 Alioth"},{ra:12.900,dec:55.960,mag:1.76,name:"开阳 Mizar"},
        {ra:13.792,dec:49.314,mag:1.85,name:"摇光 Alkaid"},{ra:11.897,dec:53.695,mag:2.40,name:"天权 Megrez"},
        {ra:11.161,dec:44.499,mag:2.44,name:"天玑 Phecda"},
        {ra:16.490,dec:-26.432,mag:1.06,name:"心宿二 Antares"},{ra:17.622,dec:-37.103,mag:1.87,name:"尾宿八 Shaula"},
        {ra:16.006,dec:-22.622,mag:2.32,name:"房宿一 Dschubba"},{ra:16.353,dec:-28.216,mag:2.62,name:"心宿一 Acrab"},
        {ra:10.140,dec:11.967,mag:1.36,name:"轩辕十四 Regulus"},{ra:11.817,dec:14.572,mag:2.14,name:"五帝座一 Denebola"},
        {ra:10.333,dec:19.842,mag:2.61,name:"轩辕十二 Zosma"},{ra:10.122,dec:16.763,mag:2.98,name:"轩辕十一 Algieba"},
        {ra:0.945,dec:60.717,mag:2.24,name:"王良一 Schedar"},{ra:0.153,dec:59.150,mag:2.28,name:"策 Caph"},
        {ra:1.430,dec:60.235,mag:2.68,name:"王良四 Gamma Cas"},{ra:1.906,dec:60.680,mag:2.66,name:"阁道二 Ruchbah"},
        {ra:20.690,dec:45.280,mag:1.25,name:"天津四 Deneb"},{ra:19.495,dec:27.960,mag:2.46,name:"辇道增七 Albireo"},
        {ra:20.370,dec:40.257,mag:2.23,name:"天津一 Sadr"},{ra:21.216,dec:30.227,mag:2.87,name:"天津九 Gienah"},
        {ra:18.615,dec:38.783,mag:0.03,name:"织女一 Vega"},{ra:18.746,dec:37.605,mag:3.52,name:"织女二 Sheliak"},
        {ra:18.834,dec:32.690,mag:3.25,name:"织女三 Sulafat"},
        {ra:19.847,dec:8.868,mag:0.77,name:"牛郎星 Altair"},{ra:19.771,dec:10.613,mag:2.72,name:"河鼓一 Tarazed"},
        {ra:19.090,dec:13.863,mag:3.43,name:"河鼓三 Deneb Okab"},
        {ra:4.599,dec:16.509,mag:0.87,name:"毕宿五 Aldebaran"},{ra:3.791,dec:24.105,mag:2.87,name:"昴宿六 Alcyone"},
        {ra:5.438,dec:28.608,mag:1.65,name:"五车二 Elnath"},
        {ra:7.755,dec:28.026,mag:1.14,name:"北河三 Pollux"},{ra:7.577,dec:31.889,mag:1.58,name:"北河二 Castor"},
        {ra:6.383,dec:22.514,mag:1.93,name:"井宿三 Alhena"},{ra:7.068,dec:20.570,mag:3.36,name:"井宿五 Mebsuda"},
        {ra:13.420,dec:-11.162,mag:0.97,name:"角宿一 Spica"},{ra:12.694,dec:-1.449,mag:2.83,name:"太微左垣五 Porrima"},
        {ra:5.278,dec:45.998,mag:0.08,name:"五车二 Capella"},{ra:5.992,dec:44.947,mag:1.90,name:"五车三 Menkalinan"},
        {ra:14.261,dec:19.182,mag:-0.05,name:"大角 Arcturus"},
        {ra:6.752,dec:-16.713,mag:-1.46,name:"天狼星 Sirius"},{ra:7.655,dec:5.225,mag:0.50,name:"南河三 Procyon"},
        {ra:22.961,dec:-29.622,mag:1.16,name:"北落师门 Fomalhaut"},
    ];

    const LINES = {
        Orion:[["参宿四 Betelgeuse","参宿五 Bellatrix"],["参宿五 Bellatrix","参宿三 Mintaka"],["参宿三 Mintaka","参宿二 Alnilam"],["参宿二 Alnilam","参宿一 Alnitak"],["参宿一 Alnitak","参宿七 Rigel"],["参宿七 Rigel","参宿六 Saiph"],["参宿六 Saiph","参宿一 Alnitak"],["参宿四 Betelgeuse","参宿三 Mintaka"]],
        UMa:[["天枢 Dubhe","天璇 Merak"],["天璇 Merak","天玑 Phecda"],["天玑 Phecda","天权 Megrez"],["天权 Megrez","天枢 Dubhe"],["天权 Megrez","玉衡 Alioth"],["玉衡 Alioth","开阳 Mizar"],["开阳 Mizar","摇光 Alkaid"]],
        Scorpius:[["房宿一 Dschubba","心宿二 Antares"],["心宿一 Acrab","心宿二 Antares"],["心宿二 Antares","尾宿八 Shaula"]],
        Leo:[["轩辕十四 Regulus","轩辕十一 Algieba"],["轩辕十一 Algieba","轩辕十二 Zosma"],["轩辕十二 Zosma","五帝座一 Denebola"]],
        Cas:[["策 Caph","王良一 Schedar"],["王良一 Schedar","阁道一 Epsilon Cas"],["阁道一 Epsilon Cas","王良四 Gamma Cas"],["王良四 Gamma Cas","阁道二 Ruchbah"]],
        Cygnus:[["天津四 Deneb","天津一 Sadr"],["天津一 Sadr","辇道增七 Albireo"],["天津一 Sadr","天津九 Gienah"]],
        Lyra:[["织女一 Vega","织女二 Sheliak"],["织女二 Sheliak","织女三 Sulafat"],["织女三 Sulafat","织女一 Vega"]],
        Aquila:[["河鼓三 Deneb Okab","牛郎星 Altair"],["牛郎星 Altair","河鼓一 Tarazed"]],
        Taurus:[["毕宿五 Aldebaran","昴宿六 Alcyone"],["毕宿五 Aldebaran","五车二 Elnath"]],
        Gemini:[["北河二 Castor","北河三 Pollux"],["北河三 Pollux","井宿三 Alhena"],["井宿三 Alhena","井宿五 Mebsuda"],["北河二 Castor","井宿五 Mebsuda"]],
        Auriga:[["五车二 Capella","五车三 Menkalinan"]],
        Virgo:[["角宿一 Spica","太微左垣五 Porrima"]],
    };

    const R=d=>d*Math.PI/180, D=r=>r*180/Math.PI;
    const jd=d=>d.getTime()/86400000+2440587.5;
    function gmst(j){const T=(j-2451545)/36525;return(((280.46061837+360.98564736629*(j-2451545)+T*T*0.000387933-T*T*T/38710000)%360)+360)%360;}
    function lst(j,lon){return((gmst(j)+lon)%360+360)%360;}
    function altAz(ra,dec,l,lat){
        const ha=R(((l-ra)%360+360)%360),d=R(dec),La=R(lat);
        const sa=Math.sin(d)*Math.sin(La)+Math.cos(d)*Math.cos(La)*Math.cos(ha);
        const alt=Math.asin(Math.max(-1,Math.min(1,sa)));
        const ca=(Math.sin(d)-Math.sin(alt)*Math.sin(La))/(Math.cos(alt)*Math.cos(La));
        let az=Math.acos(Math.max(-1,Math.min(1,ca)));
        if(Math.sin(ha)>0)az=2*Math.PI-az;
        return{alt:D(alt),az:D(az)};
    }
    function proj(alt,az,W,H){
        const r=Math.cos(R(alt))/(1+Math.sin(R(alt))),s=Math.min(W,H)*0.5;
        return{x:W/2+s*r*Math.sin(R(az)),y:H/2-s*r*Math.cos(R(az)),ok:alt>-8};
    }

    function init() {
        // ── 用 <style> 标签注入 CSS，避免 !important 冲突
        const style = document.createElement('style');
        style.textContent = `
            #celestial-canvas {
                position: fixed !important;
                top: 0 !important; left: 0 !important;
                width: 100% !important; height: 100% !important;
                z-index: 9 !important;
                pointer-events: none !important;
                display: block !important;
            }
            #celestial-time {
                position: fixed !important;
                bottom: 18px !important; right: 18px !important;
                color: rgba(180,195,240,0.35) !important;
                font-family: 'Courier New', monospace !important;
                font-size: 9px !important; letter-spacing: 3px !important;
                font-style: italic !important; pointer-events: none !important;
                z-index: 9999 !important; text-align: right !important;
                line-height: 1.9 !important; user-select: none !important;
            }
            #celestial-hover {
                position: fixed !important;
                color: rgba(220,232,255,0.92) !important;
                font-family: 'Courier New', monospace !important;
                font-size: 10px !important; letter-spacing: 3px !important;
                font-style: italic !important; pointer-events: none !important;
                z-index: 99999 !important;
                text-shadow: 0 0 8px rgba(180,200,255,0.7) !important;
                background: rgba(4,4,12,0.70) !important;
                padding: 2px 10px !important; border-radius: 2px !important;
            }
            /* ST 主界面在 canvas 之上 */
            #top-settings-holder { z-index: 10 !important; }
            #send_form           { z-index: 10 !important; }
            #sheld               { z-index: 10 !important; position: relative !important; }
        `;
        document.head.appendChild(style);

        const canvas = document.createElement('canvas');
        canvas.id = 'celestial-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const timeEl = document.createElement('div');
        timeEl.id = 'celestial-time';
        document.body.appendChild(timeEl);

        const hoverEl = document.createElement('div');
        hoverEl.id = 'celestial-hover';
        hoverEl.style.display = 'none';
        document.body.appendChild(hoverEl);

        let W, H, bgStars=[], starPos=[], frame=0;
        let LAT=39.9, LON=116.4, loc='...';

        // 先用 IP 定位（不需要用户授权，自动生效）
        fetch('https://ipapi.co/json/')
            .then(r=>r.json())
            .then(d=>{
                LAT=d.latitude; LON=d.longitude;
                loc=d.city||`${LAT.toFixed(1)}°N`;
            })
            .catch(()=>{
                // IP 定位失败再试浏览器 GPS
                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(
                        p=>{LAT=p.coords.latitude;LON=p.coords.longitude;loc=`${LAT.toFixed(1)}°N`;},
                        ()=>{ loc='?' }
                    );
                }
            });

        function resize(){
            W=canvas.width=window.innerWidth;
            H=canvas.height=window.innerHeight;
            bgStars=Array.from({length:Math.floor(W*H/1800)},()=>({
                x:Math.random()*W, y:Math.random()*H,
                r:Math.random()*0.9+0.15,
                a:Math.random()*0.55+0.15,
                tw:Math.random()*Math.PI*2,
                spd:Math.random()*0.007+0.002,
            }));
        }

        const starR   = mag => Math.max(0.8, 4.0-mag*0.55);
        const starAlp = mag => Math.max(0.45, Math.min(1.0, 1.2-mag*0.10));

        function draw(){
            frame++;
            ctx.clearRect(0,0,W,H);

            // 深空背景
            const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.8);
            g.addColorStop(0,'rgba(8,8,22,1)');
            g.addColorStop(0.6,'rgba(4,4,14,1)');
            g.addColorStop(1,'rgba(2,2,8,1)');
            ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

            // 背景微星
            bgStars.forEach(s=>{
                const tw=Math.sin(s.tw+frame*s.spd)*0.13;
                ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
                ctx.fillStyle=`rgba(215,222,255,${Math.max(0,s.a+tw)})`; ctx.fill();
            });

            const now=new Date(), l=lst(jd(now),LON);
            starPos=STARS.map(s=>{
                const p=altAz(s.ra*15,s.dec,l,LAT);
                return{...s,...p,...proj(p.alt,p.az,W,H)};
            });

            const idx={};
            starPos.forEach(s=>{idx[s.name]=s;});

            // 星座连线
            Object.values(LINES).forEach(pairs=>{
                pairs.forEach(([a,b])=>{
                    const A=idx[a],B=idx[b];
                    if(!A||!B||!A.ok||!B.ok) return;
                    const fade=Math.min(1,(Math.min(A.alt,B.alt)+5)/18);
                    if(fade<=0) return;
                    ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y);
                    ctx.strokeStyle=`rgba(185,208,255,${0.08*fade})`;
                    ctx.lineWidth=0.6; ctx.stroke();
                });
            });

            // 星点
            starPos.forEach(s=>{
                if(!s.ok) return;
                const fade=Math.min(1,(s.alt+5)/20); if(fade<=0) return;
                const r=starR(s.mag), alp=starAlp(s.mag)*fade;
                if(s.mag<2.5){
                    const gr=r*5.5;
                    const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,gr);
                    glow.addColorStop(0,`rgba(220,235,255,${alp*0.40})`);
                    glow.addColorStop(0.4,`rgba(195,215,255,${alp*0.15})`);
                    glow.addColorStop(1,'rgba(0,0,0,0)');
                    ctx.beginPath(); ctx.arc(s.x,s.y,gr,0,Math.PI*2);
                    ctx.fillStyle=glow; ctx.fill();
                }
                ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
                ctx.fillStyle=`rgba(240,244,255,${alp})`; ctx.fill();
            });

            // 时间
            const p2=n=>String(n).padStart(2,'0');
            const lh=Math.floor(l/15), lm=Math.floor((l/15-lh)*60);
            timeEl.innerHTML=`${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}<br>${loc}<br>LST ${p2(lh)}h${p2(lm)}m`;

            requestAnimationFrame(draw);
        }

        document.addEventListener('mousemove',e=>{
            let best=null,minD=44;
            starPos.forEach(s=>{
                if(!s.ok) return;
                const d=Math.hypot(s.x-e.clientX,s.y-e.clientY);
                if(d<minD){minD=d;best=s;}
            });
            if(best){
                hoverEl.style.display='block';
                hoverEl.style.left=(best.x+14)+'px';
                hoverEl.style.top=(best.y-6)+'px';
                hoverEl.textContent=best.name;
            } else hoverEl.style.display='none';
        });

        window.addEventListener('resize',resize);
        resize(); draw();
    }

    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',init);
    } else {
        init();
    }
})();
