// ═══════════════════════════════════════════════════
//  星空背景脚本 v4 · SillyTavern 扩展
//
//  v4 更新：
//   · 星表重新校对（猎户、北斗、仙后等形状恢复正常），扩充到约 90 颗，含南天星
//   · 定位：第一次请求一次 → 失败则按用户自己的时区推测 → 也可在设置里手动填
//   · 方向修正：仰望星空时，北在上、东在左
//   · 新增：银河带、流星、星座名、方位
//   · 星星画法和 v3 一样（小点 + 亮星光晕），可调亮度，可调从纯白到偏黄的颜色
//   · 设置面板：扩展设置里的「✦ 星空背景」（找不到扩展面板时，左下角会出现 ✦ 按钮）
//   · 性能：星位 2 秒算一次、30fps、切到其他标签页自动暂停
//   · 鼠标划过星星显示名字（和 v3 一样）
//
//  策略不变：canvas 直接附加到 body，mix-blend-mode:screen 叠加，
//  不改任何 ST 元素的 position / z-index
// ═══════════════════════════════════════════════════

(function () {
    'use strict';
    if (document.getElementById('celestial-canvas')) return;

    /* ───────── 设置（存在各自浏览器里，每个用户独立） ───────── */
    const SKEY  = 'celestial-settings-v4';
    const LKEY  = 'celestial-location-v4';
    const ASKED = 'celestial-geo-asked-v4';
    const DEFAULTS = {
        brightness: 1, density: 1, milkyStrength: 1, zoom: 1.2,
        warmth: 0,   // 星星颜色：0 = 纯白（和 v3 一样），1 = 偏暖黄
        milkyWay: true, lines: true, meteors: true,
        names: false, compass: false, hover: true, clock: true,
    };
    const store = {
        get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    };
    const S = Object.assign({}, DEFAULTS, store.get(SKEY) || {});
    const saveSettings = () => store.set(SKEY, S);

    /* ───────── 星表 [赤经(时), 赤纬(度), 星等, 色指数B-V, 名字, 星座] ───────── */
    const STAR_DATA = [
        // 猎户座
        [5.9195,  7.407, 0.50,  1.85, '参宿四 Betelgeuse', 'Ori'],
        [5.2423, -8.202, 0.13, -0.03, '参宿七 Rigel', 'Ori'],
        [5.4189,  6.350, 1.64, -0.22, '参宿五 Bellatrix', 'Ori'],
        [5.5334, -0.299, 2.23, -0.22, '参宿三 Mintaka', 'Ori'],
        [5.6036, -1.202, 1.69, -0.18, '参宿二 Alnilam', 'Ori'],
        [5.6793, -1.943, 1.77, -0.21, '参宿一 Alnitak', 'Ori'],
        [5.7959, -9.670, 2.06, -0.17, '参宿六 Saiph', 'Ori'],
        [5.5856,  9.934, 3.39, -0.16, '觜宿一 Meissa', 'Ori'],
        // 大熊座（北斗七星）
        [11.0621, 61.751, 1.79,  1.07, '天枢 Dubhe', 'UMa'],
        [11.0307, 56.382, 2.37, -0.02, '天璇 Merak', 'UMa'],
        [11.8972, 53.695, 2.44,  0.04, '天玑 Phecda', 'UMa'],
        [12.2571, 57.033, 3.31,  0.08, '天权 Megrez', 'UMa'],
        [12.9005, 55.960, 1.77, -0.02, '玉衡 Alioth', 'UMa'],
        [13.3988, 54.925, 2.27,  0.02, '开阳 Mizar', 'UMa'],
        [13.7923, 49.313, 1.86, -0.19, '摇光 Alkaid', 'UMa'],
        // 小熊座
        [2.5303,  89.264, 1.98, 0.60, '勾陈一(北极星) Polaris', 'UMi'],
        [14.8451, 74.156, 2.08, 1.47, '北极二 Kochab', 'UMi'],
        // 仙后座
        [0.1529, 59.150, 2.27,  0.34, '王良一 Caph', 'Cas'],
        [0.6751, 56.537, 2.24,  1.17, '王良四 Schedar', 'Cas'],
        [0.9451, 60.717, 2.47, -0.15, '策 Navi', 'Cas'],
        [1.4303, 60.235, 2.68,  0.13, '阁道三 Ruchbah', 'Cas'],
        [1.9066, 63.670, 3.37, -0.15, '阁道二 Segin', 'Cas'],
        // 英仙座
        [3.4054, 49.861, 1.79,  0.48, '天船三 Mirfak', 'Per'],
        [3.1361, 40.956, 2.12, -0.05, '大陵五 Algol', 'Per'],
        // 飞马座 + 仙女座（秋季四边形）
        [23.0794, 15.205, 2.48, -0.04, '室宿一 Markab', 'Peg'],
        [23.0629, 28.083, 2.42,  1.67, '室宿二 Scheat', 'Peg'],
        [0.2206,  15.184, 2.83, -0.23, '壁宿一 Algenib', 'Peg'],
        [0.1398,  29.091, 2.06, -0.11, '壁宿二 Alpheratz', 'And'],
        [1.1622,  35.621, 2.05,  1.58, '奎宿九 Mirach', 'And'],
        [2.0650,  42.330, 2.10,  1.37, '天大将军一 Almach', 'And'],
        // 天鹅座
        [20.6905, 45.280, 1.25,  0.09, '天津四 Deneb', 'Cyg'],
        [20.3705, 40.257, 2.23,  0.68, '天津一 Sadr', 'Cyg'],
        [19.5120, 27.960, 3.08,  1.13, '辇道增七 Albireo', 'Cyg'],
        [20.7702, 33.970, 2.48,  1.03, '天津九 Gienah', 'Cyg'],
        [19.7496, 45.131, 2.87, -0.03, '天津二 Fawaris', 'Cyg'],
        // 天琴座
        [18.6156, 38.784, 0.03,  0.00, '织女一(织女星) Vega', 'Lyr'],
        [18.7462, 37.605, 4.36,  0.19, '织女三 ζ Lyr', 'Lyr'],
        [18.8347, 33.363, 3.52,  0.00, '渐台二 Sheliak', 'Lyr'],
        [18.9824, 32.690, 3.25, -0.05, '渐台三 Sulafat', 'Lyr'],
        [18.9084, 36.899, 4.30,  1.68, '天琴座δ δ Lyr', 'Lyr'],
        // 天鹰座
        [19.8464,  8.868, 0.77, 0.22, '河鼓二(牛郎星) Altair', 'Aql'],
        [19.7710, 10.613, 2.72, 1.52, '河鼓三 Tarazed', 'Aql'],
        [19.9219,  6.407, 3.71, 0.86, '河鼓一 Alshain', 'Aql'],
        [19.0902, 13.863, 2.99, 0.01, '吴越 Okab', 'Aql'],
        [19.4249,  3.115, 3.36, 0.32, '右旗三 δ Aql', 'Aql'],
        // 金牛座
        [4.5987, 16.509, 0.87,  1.54, '毕宿五 Aldebaran', 'Tau'],
        [5.4382, 28.608, 1.65, -0.13, '五车五 Elnath', 'Tau'],
        [3.7914, 24.105, 2.87, -0.09, '昴宿六 Alcyone', 'Tau'],
        [5.6274, 21.143, 3.00, -0.19, '天关 Tianguan', 'Tau'],
        [4.4769, 19.180, 3.53,  1.01, '毕宿一 Ain', 'Tau'],
        [4.3299, 15.628, 3.65,  0.98, '毕宿四 Prima Hyadum', 'Tau'],
        // 双子座
        [7.5767, 31.888, 1.58, 0.03, '北河二 Castor', 'Gem'],
        [7.7553, 28.026, 1.14, 1.00, '北河三 Pollux', 'Gem'],
        [6.7322, 25.131, 2.98, 1.40, '井宿五 Mebsuda', 'Gem'],
        [6.3827, 22.514, 2.87, 1.64, '井宿一 Tejat', 'Gem'],
        [7.3354, 21.982, 3.53, 0.34, '天樽二 Wasat', 'Gem'],
        [7.0685, 20.570, 3.79, 0.79, '井宿七 Mekbuda', 'Gem'],
        [6.6285, 16.399, 1.93, 0.00, '井宿三 Alhena', 'Gem'],
        // 御夫座
        [5.2782, 45.998, 0.08,  0.80, '五车二 Capella', 'Aur'],
        [5.9921, 44.948, 1.90,  0.08, '五车三 Menkalinan', 'Aur'],
        [5.9954, 37.213, 2.62, -0.08, '五车四 Mahasim', 'Aur'],
        [4.9499, 33.166, 2.69,  1.53, '五车一 Hassaleh', 'Aur'],
        // 狮子座
        [10.1395, 11.967, 1.36, -0.11, '轩辕十四 Regulus', 'Leo'],
        [10.1222, 16.763, 3.49, -0.03, '轩辕十三 η Leo', 'Leo'],
        [10.3329, 19.842, 2.01,  1.12, '轩辕十二 Algieba', 'Leo'],
        [10.2782, 23.417, 3.43,  0.31, '轩辕十一 Adhafera', 'Leo'],
        [9.7642,  23.774, 2.98,  0.81, '轩辕九 Ras Elased', 'Leo'],
        [11.2351, 20.524, 2.56,  0.12, '西上相 Zosma', 'Leo'],
        [11.2373, 15.430, 3.33, -0.01, '西次相 Chertan', 'Leo'],
        [11.8177, 14.572, 2.14,  0.09, '五帝座一 Denebola', 'Leo'],
        // 室女座
        [13.4199, -11.161, 0.97, -0.23, '角宿一 Spica', 'Vir'],
        [12.6943,  -1.449, 2.74,  0.36, '东上相 Porrima', 'Vir'],
        [12.9267,   3.397, 3.38,  1.58, '东次相 Minelauva', 'Vir'],
        [13.0363,  10.959, 2.83,  0.94, '东次将 Vindemiatrix', 'Vir'],
        // 牧夫座
        [14.2610, 19.182, -0.05, 1.23, '大角 Arcturus', 'Boo'],
        [14.7498, 27.074, 2.37,  0.97, '梗河一 Izar', 'Boo'],
        [15.2582, 33.315, 3.47,  0.95, '牧夫座δ Princeps', 'Boo'],
        [15.0324, 40.390, 3.50,  0.97, '牧夫座β Nekkar', 'Boo'],
        [14.5347, 38.308, 3.03,  0.19, '招摇 Seginus', 'Boo'],
        [13.9114, 18.398, 2.68,  0.58, '右摄提一 Muphrid', 'Boo'],
        // 天蝎座
        [16.4901, -26.432, 1.06,  1.83, '心宿二 Antares', 'Sco'],
        [16.0906, -19.806, 2.62, -0.07, '房宿四 Acrab', 'Sco'],
        [16.0056, -22.622, 2.29, -0.12, '房宿三 Dschubba', 'Sco'],
        [15.9809, -26.114, 2.89, -0.18, '房宿一 Fang', 'Sco'],
        [16.3531, -25.593, 2.89,  0.13, '心宿一 Alniyat', 'Sco'],
        [16.5981, -28.216, 2.82, -0.25, '心宿三 Paikauhale', 'Sco'],
        [16.8361, -34.293, 2.29,  1.15, '尾宿二 Larawag', 'Sco'],
        [17.6220, -42.998, 1.86,  0.40, '尾宿五 Sargas', 'Sco'],
        [17.5601, -37.104, 1.62, -0.22, '尾宿八 Shaula', 'Sco'],
        // 人马座（茶壶）
        [18.0968, -30.424, 2.99,  1.00, '箕宿一 Alnasl', 'Sgr'],
        [18.3499, -29.828, 2.70,  1.38, '箕宿二 Kaus Media', 'Sgr'],
        [18.4029, -34.385, 1.85, -0.03, '箕宿三 Kaus Australis', 'Sgr'],
        [18.4661, -25.422, 2.81,  1.04, '斗宿二 Kaus Borealis', 'Sgr'],
        [18.7609, -26.991, 3.17, -0.11, '斗宿三 φ Sgr', 'Sgr'],
        [18.9211, -26.297, 2.05, -0.13, '斗宿四 Nunki', 'Sgr'],
        [19.1157, -27.671, 3.32,  1.19, '斗宿五 τ Sgr', 'Sgr'],
        [19.0435, -29.880, 2.60,  0.08, '斗宿六 Ascella', 'Sgr'],
        // 大犬 / 小犬
        [6.7525, -16.716, -1.46,  0.00, '天狼星 Sirius', 'CMa'],
        [6.3783, -17.956,  1.98, -0.23, '军市一 Mirzam', 'CMa'],
        [6.9771, -28.972,  1.50, -0.21, '弧矢七 Adhara', 'CMa'],
        [7.1399, -26.393,  1.83,  0.68, '弧矢一 Wezen', 'CMa'],
        [7.4016, -29.303,  2.45, -0.08, '弧矢二 Aludra', 'CMa'],
        [7.6550,   5.225,  0.34,  0.42, '南河三 Procyon', 'CMi'],
        [7.4525,   8.289,  2.89, -0.09, '南河二 Gomeisa', 'CMi'],
        // 南天
        [12.4433, -63.099, 0.77, -0.24, '十字架二 Acrux', 'Cru'],
        [12.7953, -59.689, 1.25, -0.24, '十字架三 Mimosa', 'Cru'],
        [12.5194, -57.113, 1.59,  1.60, '十字架一 Gacrux', 'Cru'],
        [12.2524, -58.749, 2.79, -0.23, '十字架四 Imai', 'Cru'],
        [14.6600, -60.835, -0.27, 0.71, '南门二 Rigil Kentaurus', 'Cen'],
        [14.0637, -60.373,  0.61, -0.23, '马腹一 Hadar', 'Cen'],
        [6.3992,  -52.696, -0.74, 0.15, '老人星 Canopus', 'Car'],
        [1.6286,  -57.237,  0.46, -0.16, '水委一 Achernar', 'Eri'],
        [22.9608, -29.622,  1.16,  0.09, '北落师门 Fomalhaut', 'PsA'],
    ];
    // key = 名字里空格后面的英文部分，连线用它来找星
    const STARS = STAR_DATA.map(([ra, dec, mag, bv, name, con], i) =>
        ({ ra, dec, mag, bv, name, con, i, key: name.slice(name.indexOf(' ') + 1) }));

    const LINES = [
        // 猎户座
        ['Betelgeuse','Bellatrix'],['Bellatrix','Meissa'],['Meissa','Betelgeuse'],
        ['Betelgeuse','Alnitak'],['Bellatrix','Mintaka'],['Mintaka','Alnilam'],
        ['Alnilam','Alnitak'],['Mintaka','Rigel'],['Alnitak','Saiph'],
        // 北斗
        ['Dubhe','Merak'],['Merak','Phecda'],['Phecda','Megrez'],['Megrez','Dubhe'],
        ['Megrez','Alioth'],['Alioth','Mizar'],['Mizar','Alkaid'],
        // 仙后 W
        ['Caph','Schedar'],['Schedar','Navi'],['Navi','Ruchbah'],['Ruchbah','Segin'],
        // 英仙
        ['Mirfak','Algol'],
        // 飞马四边形 + 仙女
        ['Markab','Scheat'],['Scheat','Alpheratz'],['Alpheratz','Algenib'],['Algenib','Markab'],
        ['Alpheratz','Mirach'],['Mirach','Almach'],
        // 天鹅（北十字）
        ['Deneb','Sadr'],['Sadr','Albireo'],['Sadr','Gienah'],['Sadr','Fawaris'],
        // 天琴
        ['Vega','ζ Lyr'],['ζ Lyr','Sheliak'],['Sheliak','Sulafat'],['Sulafat','δ Lyr'],['δ Lyr','ζ Lyr'],
        // 天鹰
        ['Tarazed','Altair'],['Altair','Alshain'],['Altair','δ Aql'],['Tarazed','Okab'],
        // 金牛
        ['Prima Hyadum','Aldebaran'],['Aldebaran','Tianguan'],['Prima Hyadum','Ain'],['Ain','Elnath'],
        // 双子
        ['Castor','Pollux'],['Castor','Mebsuda'],['Mebsuda','Tejat'],
        ['Pollux','Wasat'],['Wasat','Mekbuda'],['Mekbuda','Alhena'],
        // 御夫（五边形，借用金牛的五车五）
        ['Capella','Menkalinan'],['Menkalinan','Mahasim'],['Mahasim','Elnath'],
        ['Elnath','Hassaleh'],['Hassaleh','Capella'],
        // 狮子（镰刀 + 身体）
        ['Regulus','η Leo'],['η Leo','Algieba'],['Algieba','Adhafera'],['Adhafera','Ras Elased'],
        ['Algieba','Zosma'],['Zosma','Denebola'],['Denebola','Chertan'],['Chertan','Regulus'],
        // 室女
        ['Spica','Porrima'],['Porrima','Minelauva'],['Minelauva','Vindemiatrix'],
        // 牧夫（风筝）
        ['Arcturus','Izar'],['Izar','Princeps'],['Princeps','Nekkar'],
        ['Nekkar','Seginus'],['Seginus','Arcturus'],['Arcturus','Muphrid'],
        // 天蝎
        ['Acrab','Dschubba'],['Dschubba','Fang'],['Dschubba','Alniyat'],['Alniyat','Antares'],
        ['Antares','Paikauhale'],['Paikauhale','Larawag'],['Larawag','Sargas'],['Sargas','Shaula'],
        // 人马茶壶
        ['Alnasl','Kaus Media'],['Kaus Media','Kaus Australis'],['Kaus Australis','Alnasl'],
        ['Kaus Media','Kaus Borealis'],['Kaus Borealis','φ Sgr'],['φ Sgr','Kaus Media'],
        ['φ Sgr','Nunki'],['Nunki','τ Sgr'],['τ Sgr','Ascella'],['Ascella','φ Sgr'],['Ascella','Kaus Australis'],
        // 大犬 / 小犬
        ['Sirius','Mirzam'],['Sirius','Wezen'],['Wezen','Adhara'],['Wezen','Aludra'],
        ['Procyon','Gomeisa'],
        // 南十字 / 半人马
        ['Acrux','Gacrux'],['Mimosa','Imai'],['Rigil Kentaurus','Hadar'],
    ];

    const CON_NAMES = {
        Ori:'猎户座', UMa:'大熊座', UMi:'小熊座', Cas:'仙后座', Per:'英仙座', Peg:'飞马座',
        And:'仙女座', Cyg:'天鹅座', Lyr:'天琴座', Aql:'天鹰座', Tau:'金牛座', Gem:'双子座',
        Aur:'御夫座', Leo:'狮子座', Vir:'室女座', Boo:'牧夫座', Sco:'天蝎座', Sgr:'人马座',
        CMa:'大犬座', CMi:'小犬座', Cru:'南十字座', Cen:'半人马座',
    };

    /* ───────── 天文计算 ───────── */
    const R = d => d * Math.PI / 180, D = r => r * 180 / Math.PI;
    const rand = (a, b) => a + Math.random() * (b - a);
    const jd = d => d.getTime() / 86400000 + 2440587.5;
    function gmst(j) {
        const T = (j - 2451545) / 36525;
        return (((280.46061837 + 360.98564736629 * (j - 2451545) + T*T*0.000387933 - T*T*T/38710000) % 360) + 360) % 360;
    }
    const lst = (j, lon) => ((gmst(j) + lon) % 360 + 360) % 360;
    function altAz(ra, dec, l, lat) {
        const ha = R(((l - ra) % 360 + 360) % 360), d = R(dec), La = R(lat);
        const sa = Math.sin(d)*Math.sin(La) + Math.cos(d)*Math.cos(La)*Math.cos(ha);
        const alt = Math.asin(Math.max(-1, Math.min(1, sa)));
        const ca = (Math.sin(d) - Math.sin(alt)*Math.sin(La)) / (Math.cos(alt)*Math.cos(La));
        let az = Math.acos(Math.max(-1, Math.min(1, ca)));
        if (Math.sin(ha) > 0) az = 2*Math.PI - az;
        return { alt: D(alt), az: D(az) };
    }
    // 银道坐标 → 赤道坐标（画银河用）
    function gal2eq(l, b) {
        const aG = R(192.85948), dG = R(27.12825), lN = R(122.93192);
        const L = R(l), B = R(b);
        const dec = Math.asin(Math.sin(B)*Math.sin(dG) + Math.cos(B)*Math.cos(dG)*Math.cos(lN - L));
        const y = Math.cos(B)*Math.sin(lN - L);
        const x = Math.sin(B)*Math.cos(dG) - Math.cos(B)*Math.sin(dG)*Math.cos(lN - L);
        return { ra: ((D(aG + Math.atan2(y, x)) % 360) + 360) % 360, dec: D(dec) };
    }

    /* ───────── 定位 ───────── */
    // 常见时区 → 代表城市坐标（定位失败时用，按「看的人自己的电脑时区」推测）
    const TZ = {
        'Asia/Shanghai':[31.2,121.5], 'Asia/Urumqi':[43.8,87.6], 'Asia/Taipei':[25.0,121.5],
        'Asia/Hong_Kong':[22.3,114.2], 'Asia/Macau':[22.2,113.5], 'Asia/Tokyo':[35.7,139.7],
        'Asia/Seoul':[37.6,127.0], 'Asia/Singapore':[1.3,103.8], 'Asia/Kuala_Lumpur':[3.1,101.7],
        'Asia/Bangkok':[13.8,100.5], 'Asia/Ho_Chi_Minh':[10.8,106.7], 'Asia/Manila':[14.6,121.0],
        'Asia/Jakarta':[-6.2,106.8], 'Asia/Kolkata':[28.6,77.2], 'Asia/Dubai':[25.2,55.3],
        'Europe/London':[51.5,-0.1], 'Europe/Dublin':[53.3,-6.3], 'Europe/Paris':[48.9,2.4],
        'Europe/Berlin':[52.5,13.4], 'Europe/Rome':[41.9,12.5], 'Europe/Madrid':[40.4,-3.7],
        'Europe/Amsterdam':[52.4,4.9], 'Europe/Moscow':[55.8,37.6],
        'America/New_York':[40.7,-74.0], 'America/Chicago':[41.9,-87.6], 'America/Denver':[39.7,-105.0],
        'America/Los_Angeles':[34.1,-118.2], 'America/Toronto':[43.7,-79.4], 'America/Vancouver':[49.3,-123.1],
        'America/Mexico_City':[19.4,-99.1], 'America/Sao_Paulo':[-23.5,-46.6],
        'America/Argentina/Buenos_Aires':[-34.6,-58.4], 'Australia/Sydney':[-33.9,151.2],
        'Australia/Melbourne':[-37.8,145.0], 'Australia/Perth':[-31.95,115.9],
        'Pacific/Auckland':[-36.8,174.8], 'Africa/Cairo':[30.0,31.2], 'Africa/Johannesburg':[-26.2,28.0],
    };
    function guessFromTZ() {
        let tz = '';
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
        if (TZ[tz]) return { lat: TZ[tz][0], lon: TZ[tz][1], src: 'tz' };
        // 表里没有：经度按时差估，纬度按大洲估
        const lon = -new Date().getTimezoneOffset() / 60 * 15;
        const byRegion = { Europe:48, Asia:30, Africa:5, America:35, Australia:-30, Pacific:-15, Atlantic:30, Indian:-10, Antarctica:-75 };
        let lat = byRegion[tz.split('/')[0]] ?? 35;
        if (/Argentina|Sao_Paulo|Santiago|Lima|Montevideo|Asuncion|La_Paz/.test(tz)) lat = -25;
        return { lat, lon, src: 'tz' };
    }
    const savedLoc = store.get(LKEY);
    let LOC = (savedLoc && (savedLoc.src === 'gps' || savedLoc.src === 'manual')) ? savedLoc : guessFromTZ();

    const fmtLoc = () => {
        const { lat, lon, src } = LOC;
        return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`
             + (src === 'tz' ? ' · 时区推测' : '');
    };

    // 只在第一次自动请求；之后要重新定位就去设置里点按钮
    function requestGPS(force, report) {
        const say = m => report && report(m);
        if (!navigator.geolocation) { say('这个浏览器不支持定位，请手动填坐标'); return; }
        if (!force && store.get(ASKED)) return;
        store.set(ASKED, 1);
        say('正在定位…');
        navigator.geolocation.getCurrentPosition(
            p => {
                // 只保留两位小数（约 1 公里），够看星空，也更保护隐私
                LOC = { lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2), src: 'gps' };
                store.set(LKEY, LOC);
                onLocChange();
                say('定位成功');
            },
            err => {
                if (!window.isSecureContext) say('当前不是 https 或 localhost，浏览器不允许定位，请手动填坐标');
                else if (err.code === 1) say('定位被拒绝了，可以手动填坐标');
                else say('定位失败：' + err.message);
            },
            { timeout: 15000, maximumAge: 86400000 }
        );
    }

    /* ───────── 星星颜色：在 v3 的冷白和暖黄之间调 ───────── */
    const WHITE = { core: [238, 242, 255], glowA: [220, 235, 255], glowB: [195, 215, 255] };
    const WARM  = { core: [255, 236, 200], glowA: [255, 225, 175], glowB: [250, 205, 150] };
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    let COL = WHITE;
    const buildColors = () => {
        const t = S.warmth;
        COL = { core: mix(WHITE.core, WARM.core, t), glowA: mix(WHITE.glowA, WARM.glowA, t), glowB: mix(WHITE.glowB, WARM.glowB, t) };
    };

    const mwSprite = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0,   'rgba(175,190,235,1)');
        g.addColorStop(0.5, 'rgba(160,175,225,0.35)');
        g.addColorStop(1,   'rgba(150,165,220,0)');
        x.fillStyle = g; x.fillRect(0, 0, 64, 64);
        return c;
    })();

    /* ───────── 银河：沿银道撒雾团，银心方向更亮更宽 ───────── */
    function gauss() {
        let u = 0, v = 0;
        while (!u) u = Math.random();
        while (!v) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    const MW = [];
    (function buildMilkyWay() {
        while (MW.length < 2200) {
            const l = Math.random() * 360, lw = l > 180 ? l - 360 : l;
            const core = Math.exp(-(lw * lw) / (2 * 40 * 40));
            if (Math.random() > 0.3 + 0.7 * core) continue;
            const sig = 3 + 6 * core;
            const b = gauss() * sig;
            let a = (0.45 + 0.55 * core) * (0.6 + 0.4 * Math.random());
            // 天鹅座到人马座之间的暗带（大裂缝）
            if (lw > 8 && lw < 70 && Math.abs(b - 0.5) < 2 + core) a *= 0.35;
            const { ra, dec } = gal2eq(l, b);
            MW.push({ ra, dec, a, size: rand(3, 7) });
        }
    })();

    /* ───────── 主体 ───────── */
    function init() {
        // 面板样式
        const style = document.createElement('style');
        style.textContent = `
            .cel-body{display:flex;flex-direction:column;gap:6px;padding:6px 2px}
            .cel-row{display:flex;align-items:center;gap:8px}
            .cel-name{width:5.5em;flex-shrink:0;opacity:.85}
            .cel-row input[type=range]{flex:1}
            .cel-val{width:3.4em;text-align:right;opacity:.7;font-size:.9em}
            .cel-checks{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-top:2px}
            .cel-checks label{display:flex;align-items:center;gap:6px;cursor:pointer}
            .cel-sec{margin-top:6px;padding-top:6px;border-top:1px solid rgba(128,128,128,.25);opacity:.9}
            .cel-row input[type=number]{width:7em}
            .cel-btn{cursor:pointer;padding:3px 10px;border:1px solid rgba(128,128,128,.4);border-radius:4px;font-size:.9em;user-select:none}
            .cel-btn:hover{background:rgba(128,128,128,.15)}
            .cel-hint{opacity:.55;font-size:.85em}
            #celestial-float{position:fixed;left:12px;bottom:12px;z-index:10000;width:28px;height:28px;border-radius:50%;
                background:rgba(10,12,28,.6);color:#cdd6ff;display:flex;align-items:center;justify-content:center;
                cursor:pointer;font-size:14px;border:1px solid rgba(180,195,240,.25)}
            #celestial-float-panel{position:fixed;left:12px;bottom:48px;z-index:10000;width:300px;max-width:calc(100vw - 24px);
                background:rgba(12,14,30,.92);color:#dfe5ff;border:1px solid rgba(180,195,240,.25);border-radius:8px;
                padding:10px 12px;display:none;font-size:13px}
        `;
        document.head.appendChild(style);

        // 主画布
        const canvas = document.createElement('canvas');
        canvas.id = 'celestial-canvas';
        Object.assign(canvas.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            zIndex: '0', pointerEvents: 'none', display: 'block', mixBlendMode: 'screen',
        });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // 离屏画布：银河、连线、星座名、方位（2 秒重画一次）
        const sky = document.createElement('canvas');
        const skyCtx = sky.getContext('2d');

        // 时间显示
        const timeEl = document.createElement('div');
        timeEl.id = 'celestial-time';
        Object.assign(timeEl.style, {
            position: 'fixed', bottom: '18px', right: '18px',
            color: 'rgba(180,195,240,0.30)', fontFamily: 'Courier New, monospace',
            fontSize: '9px', letterSpacing: '3px', fontStyle: 'italic', pointerEvents: 'none',
            zIndex: '9999', textAlign: 'right', lineHeight: '1.9', userSelect: 'none', mixBlendMode: 'screen',
        });
        document.body.appendChild(timeEl);

        // 星名标签
        const hoverEl = document.createElement('div');
        hoverEl.id = 'celestial-hover';
        Object.assign(hoverEl.style, {
            position: 'fixed', display: 'none', color: 'rgba(220,230,255,0.90)',
            fontFamily: 'Courier New, monospace', fontSize: '10px', letterSpacing: '3px',
            fontStyle: 'italic', pointerEvents: 'none', zIndex: '9999',
            textShadow: '0 0 8px rgba(180,200,255,0.7)', background: 'rgba(4,4,12,0.65)',
            padding: '2px 10px', borderRadius: '2px',
        });
        document.body.appendChild(hoverEl);

        let W = 0, H = 0, dpr = 1, bgStars = [], starPos = [], idx = {};
        let running = true, rafId = 0, lastDraw = 0, lastSky = 0;
        let meteors = [], nextMeteor = 0, panelRoot = null;

        const starR   = mag => Math.max(0.5, 3.2 - mag * 0.50);
        const starAlp = mag => Math.max(0.22, Math.min(0.96, 1.05 - mag * 0.12));
        const onScreen = (x, y) => x > -60 && x < W + 60 && y > -60 && y < H + 60;

        // 立体投影：天顶在屏幕中心，北在上、东在左（仰望视角）
        function proj(alt, az) {
            const r = Math.cos(R(alt)) / (1 + Math.sin(R(alt)));
            const s = Math.min(W, H) * 0.5 * S.zoom;
            return { x: W/2 - s*r*Math.sin(R(az)), y: H/2 - s*r*Math.cos(R(az)), r, s };
        }

        function rebuildBg() {
            const n = Math.floor(W * H / 1800 * S.density);
            bgStars = Array.from({ length: n }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                r: Math.random() * 0.9 + 0.15, a: Math.random() * 0.40 + 0.08,
                tw: Math.random() * Math.PI * 2, spd: rand(0.15, 0.55),
            }));
        }

        function resize() {
            W = window.innerWidth; H = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width  = sky.width  = Math.round(W * dpr);
            canvas.height = sky.height = Math.round(H * dpr);
            rebuildBg();
            computeSky();
        }

        function computeSky() {
            const l = lst(jd(new Date()), LOC.lon);
            skyCtx.setTransform(1, 0, 0, 1, 0, 0);
            skyCtx.clearRect(0, 0, sky.width, sky.height);
            skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // 星位
            starPos = STARS.map(s => {
                const p = altAz(s.ra * 15, s.dec, l, LOC.lat);
                const q = proj(p.alt, p.az);
                return { ...s, alt: p.alt, x: q.x, y: q.y, ok: p.alt > -8 && onScreen(q.x, q.y) };
            });
            idx = {};
            starPos.forEach(s => { idx[s.key] = s; });

            // 银河
            if (S.milkyWay) {
                skyCtx.globalCompositeOperation = 'lighter';
                for (const m of MW) {
                    const p = altAz(m.ra, m.dec, l, LOC.lat);
                    if (p.alt < -5) continue;
                    const q = proj(p.alt, p.az);
                    const size = m.size * q.s * Math.PI / 360 * (1 + q.r * q.r);
                    if (q.x < -size || q.y < -size || q.x > W + size || q.y > H + size) continue;
                    const fade = Math.min(1, (p.alt + 5) / 25);
                    skyCtx.globalAlpha = Math.min(1, m.a * 0.035 * S.milkyStrength * S.brightness * fade);
                    skyCtx.drawImage(mwSprite, q.x - size/2, q.y - size/2, size, size);
                }
                skyCtx.globalAlpha = 1;
                skyCtx.globalCompositeOperation = 'source-over';
            }

            // 星座连线
            if (S.lines) {
                skyCtx.lineWidth = 0.6;
                for (const [a, b] of LINES) {
                    const A = idx[a], B = idx[b];
                    if (!A || !B || !A.ok || !B.ok) continue;
                    const fade = Math.min(1, (Math.min(A.alt, B.alt) + 5) / 18);
                    if (fade <= 0) continue;
                    skyCtx.strokeStyle = `rgba(185,208,255,${Math.min(1, 0.10 * fade * S.brightness)})`;
                    skyCtx.beginPath(); skyCtx.moveTo(A.x, A.y); skyCtx.lineTo(B.x, B.y); skyCtx.stroke();
                }
            }

            // 星座名
            if (S.names) {
                const groups = {};
                starPos.forEach(s => { if (s.ok && s.alt > 3) (groups[s.con] = groups[s.con] || []).push(s); });
                skyCtx.font = 'italic 11px "Courier New", monospace';
                skyCtx.textAlign = 'center';
                skyCtx.fillStyle = `rgba(190,205,255,${Math.min(1, 0.28 * S.brightness)})`;
                for (const con in groups) {
                    const g = groups[con];
                    if (g.length < 2 || !CON_NAMES[con]) continue;
                    const x = g.reduce((a, s) => a + s.x, 0) / g.length;
                    const y = g.reduce((a, s) => a + s.y, 0) / g.length;
                    skyCtx.fillText(CON_NAMES[con], x, y + 18);
                }
            }

            // 方位 + 地平线
            if (S.compass) {
                const s = proj(0, 0).s;
                skyCtx.strokeStyle = `rgba(170,190,240,${Math.min(1, 0.08 * S.brightness)})`;
                skyCtx.lineWidth = 1;
                skyCtx.beginPath(); skyCtx.arc(W/2, H/2, s, 0, Math.PI * 2); skyCtx.stroke();
                skyCtx.font = '12px "Courier New", monospace';
                skyCtx.textAlign = 'center'; skyCtx.textBaseline = 'middle';
                skyCtx.fillStyle = `rgba(190,205,255,${Math.min(1, 0.35 * S.brightness)})`;
                [['北 N', 0], ['东 E', 90], ['南 S', 180], ['西 W', 270]].forEach(([t, az]) => {
                    const q = proj(0, az);
                    skyCtx.fillText(t, Math.max(30, Math.min(W - 30, q.x)), Math.max(16, Math.min(H - 16, q.y)));
                });
                skyCtx.textBaseline = 'alphabetic';
            }
        }

        function newMeteor(t) {
            const ang = rand(0.15, 0.85) * Math.PI;   // 斜向下
            const sp = rand(450, 850);
            return { t0: t, life: rand(600, 1200), x: rand(0.1, 0.9) * W, y: rand(0.02, 0.45) * H,
                     vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, len: rand(80, 170) };
        }
        function drawMeteors(t) {
            if (!nextMeteor) nextMeteor = t + rand(6000, 20000);
            if (t > nextMeteor) { meteors.push(newMeteor(t)); nextMeteor = t + rand(15000, 45000); }
            meteors = meteors.filter(m => t - m.t0 < m.life);
            ctx.lineWidth = 1.4; ctx.lineCap = 'round';
            for (const m of meteors) {
                const age = (t - m.t0) / 1000, p = (t - m.t0) / m.life;
                const hx = m.x + m.vx * age, hy = m.y + m.vy * age;
                const sp = Math.hypot(m.vx, m.vy), len = m.len * Math.min(1, p * 3);
                const tx = hx - m.vx / sp * len, ty = hy - m.vy / sp * len;
                const a = Math.min(1, Math.sin(Math.PI * p) * 0.85 * S.brightness);
                const g = ctx.createLinearGradient(hx, hy, tx, ty);
                g.addColorStop(0, `rgba(240,245,255,${a})`);
                g.addColorStop(1, 'rgba(200,215,255,0)');
                ctx.strokeStyle = g;
                ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
            }
        }

        function loop(t) {
            if (!running) return;
            rafId = requestAnimationFrame(loop);
            if (t - lastDraw < 33) return;          // 约 30fps
            lastDraw = t;
            if (t - lastSky > 2000) { computeSky(); lastSky = t; }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(sky, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const sec = t / 1000;

            // 背景微星（闪烁）
            ctx.fillStyle = 'rgb(215,222,255)';
            for (const s of bgStars) {
                const a = (s.a + Math.sin(s.tw + sec * s.spd) * 0.12) * S.brightness;
                if (a <= 0) continue;
                ctx.globalAlpha = Math.min(1, a);
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
            }

            ctx.globalAlpha = 1;

            // 星点（画法和 v3 一样：小圆点 + 亮星淡光晕）
            const [cr, cg, cb] = COL.core, [ar, ag, ab] = COL.glowA, [br, bg, bb] = COL.glowB;
            for (const s of starPos) {
                if (!s.ok) continue;
                const fade = Math.min(1, (s.alt + 5) / 20);
                if (fade <= 0) continue;
                const r = starR(s.mag);
                const alp = Math.min(1, starAlp(s.mag) * fade * S.brightness);

                if (s.mag < 2.5) {
                    const gr = r * 5.5;
                    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gr);
                    glow.addColorStop(0,   `rgba(${ar},${ag},${ab},${alp * 0.35})`);
                    glow.addColorStop(0.4, `rgba(${br},${bg},${bb},${alp * 0.12})`);
                    glow.addColorStop(1,   'rgba(0,0,0,0)');
                    ctx.beginPath(); ctx.arc(s.x, s.y, gr, 0, Math.PI * 2);
                    ctx.fillStyle = glow; ctx.fill();
                }
                ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${alp})`; ctx.fill();
            }

            if (S.meteors) drawMeteors(t);
        }

        function updateClock() {
            if (!S.clock) { timeEl.style.display = 'none'; return; }
            timeEl.style.display = 'block';
            const now = new Date();
            const l = lst(jd(now), LOC.lon);
            const p2 = n => String(n).padStart(2, '0');
            const lh = Math.floor(l / 15), lm = Math.floor((l / 15 - lh) * 60);
            timeEl.innerHTML =
                `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}<br>` +
                `${fmtLoc()}<br>LST ${p2(lh)}h${p2(lm)}m`;
        }

        function onLocChange() {
            computeSky(); lastSky = performance.now();
            updateClock();
            if (panelRoot) panelRoot.querySelector('.cel-loc').textContent = fmtLoc();
        }
        // 让外层的 requestGPS 能调用
        window.__celestialOnLocChange = onLocChange;

        function applySettings(k) {
            if (k === 'density' || k === 'all') rebuildBg();
            if (k === 'warmth'  || k === 'all') buildColors();
            if (!S.hover) hoverEl.style.display = 'none';
            updateClock();
            computeSky(); lastSky = performance.now();
        }

        /* ───────── 设置面板 ───────── */
        const SLIDERS = [
            ['brightness', '亮度', 0.3, 1.6, 0.05],
            ['warmth', '白 ↔ 黄', 0, 1, 0.05],
            ['density', '微星数量', 0, 2, 0.1],
            ['milkyStrength', '银河浓度', 0.2, 2, 0.1],
            ['zoom', '视野大小', 0.8, 2, 0.05],
        ];
        const CHECKS = [
            ['milkyWay', '银河'], ['lines', '星座连线'], ['meteors', '流星'],
            ['names', '星座名'], ['compass', '方位'], ['hover', '悬停显示星名'], ['clock', '右下角时间'],
        ];
        const fmtVal = (k, v) => (k === 'brightness' || k === 'warmth') ? Math.round(v * 100) + '%'
                                 : '×' + (+v).toFixed(2).replace(/\.?0+$/, '');

        function panelHTML() {
            return `<div class="cel-body">
                ${SLIDERS.map(([k, n, a, b, st]) =>
                    `<div class="cel-row"><span class="cel-name">${n}</span>
                     <input type="range" min="${a}" max="${b}" step="${st}" data-k="${k}"><span class="cel-val"></span></div>`).join('')}
                <div class="cel-checks">
                    ${CHECKS.map(([k, n]) => `<label><input type="checkbox" data-k="${k}">${n}</label>`).join('')}
                </div>
                <div class="cel-sec">位置：<span class="cel-loc"></span></div>
                <div class="cel-row">
                    <input type="number" step="0.1" class="text_pole cel-lat" placeholder="纬度">
                    <input type="number" step="0.1" class="text_pole cel-lon" placeholder="经度">
                </div>
                <div class="cel-hint">南纬、西经填负数。例：东京 35.7 / 139.7</div>
                <div class="cel-row">
                    <span class="cel-btn cel-save">保存坐标</span>
                    <span class="cel-btn cel-gps">重新获取定位</span>
                </div>
                <div class="cel-hint cel-status"></div>
                <div class="cel-row" style="margin-top:4px"><span class="cel-btn cel-reset">恢复默认设置</span></div>
            </div>`;
        }

        function refreshInputs(root) {
            root.querySelectorAll('[data-k]').forEach(el => {
                const k = el.dataset.k;
                if (el.type === 'checkbox') el.checked = !!S[k];
                else {
                    el.value = S[k];
                    const out = el.parentElement.querySelector('.cel-val');
                    if (out) out.textContent = fmtVal(k, S[k]);
                }
            });
            root.querySelector('.cel-loc').textContent = fmtLoc();
        }

        function bindPanel(root) {
            panelRoot = root;
            refreshInputs(root);
            const status = root.querySelector('.cel-status');
            const say = m => { status.textContent = m; };

            root.querySelectorAll('[data-k]').forEach(el => {
                const k = el.dataset.k;
                el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
                    S[k] = el.type === 'checkbox' ? el.checked : parseFloat(el.value);
                    const out = el.parentElement.querySelector('.cel-val');
                    if (out) out.textContent = fmtVal(k, S[k]);
                    saveSettings();
                    applySettings(k);
                });
            });

            root.querySelector('.cel-save').addEventListener('click', () => {
                const lat = parseFloat(root.querySelector('.cel-lat').value);
                const lon = parseFloat(root.querySelector('.cel-lon').value);
                if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
                    say('坐标格式不对：纬度 -90~90，经度 -180~180'); return;
                }
                LOC = { lat, lon, src: 'manual' };
                store.set(LKEY, LOC);
                onLocChange();
                say('已保存');
            });
            root.querySelector('.cel-gps').addEventListener('click', () => requestGPS(true, say));
            root.querySelector('.cel-reset').addEventListener('click', () => {
                Object.assign(S, DEFAULTS); saveSettings();
                refreshInputs(root); applySettings('all');
                say('已恢复默认');
            });
        }

        function mountFloating() {
            const btn = document.createElement('div');
            btn.id = 'celestial-float'; btn.textContent = '✦'; btn.title = '星空背景设置';
            const panel = document.createElement('div');
            panel.id = 'celestial-float-panel';
            panel.innerHTML = `<b>✦ 星空背景</b>${panelHTML()}`;
            btn.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            });
            document.body.appendChild(btn);
            document.body.appendChild(panel);
            bindPanel(panel);
        }

        function mountPanel() {
            const wrap = document.createElement('div');
            wrap.id = 'celestial-settings';
            wrap.innerHTML = `
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>✦ 星空背景</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div class="inline-drawer-content">${panelHTML()}</div>
                </div>`;
            let tries = 0;
            const timer = setInterval(() => {
                const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
                if (host) { clearInterval(timer); host.appendChild(wrap); bindPanel(wrap); }
                else if (++tries > 40) { clearInterval(timer); mountFloating(); }   // 20 秒找不到扩展面板
            }, 500);
        }

        /* ───────── 鼠标悬停显示星名（和 v3 一样） ───────── */
        document.addEventListener('mousemove', e => {
            if (!S.hover) return;
            let best = null, minD = 44;
            for (const s of starPos) {
                if (!s.ok) continue;
                const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
                if (d < minD) { minD = d; best = s; }
            }
            if (best) {
                hoverEl.style.display = 'block';
                hoverEl.style.left = (best.x + 14) + 'px';
                hoverEl.style.top  = (best.y - 6) + 'px';
                hoverEl.textContent = best.name;
            } else {
                hoverEl.style.display = 'none';
            }
        }, { passive: true });

        /* ───────── 切到后台暂停 ───────── */
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
            else if (!running) { running = true; lastSky = 0; rafId = requestAnimationFrame(loop); }
        });

        let resizeTimer = 0;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

        // 启动
        buildColors();
        resize();
        updateClock();
        setInterval(updateClock, 1000);
        rafId = requestAnimationFrame(loop);
        mountPanel();
        if (LOC.src === 'tz') requestGPS(false);
    }

    function onLocChange() {
        if (window.__celestialOnLocChange) window.__celestialOnLocChange();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
