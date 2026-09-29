/**
 * MARKETLINK CUSTOMERS — DATA
 * Catalogue, farms, pickup hubs and small pure helpers.
 * Everything here is static seed data; user state lives in store.js.
 */
window.ML = window.ML || {};

(function (ML) {
    'use strict';

    const IMG = (p) => ((window.ML_CONFIG && window.ML_CONFIG.ASSET_BASE) || '../assets/images/') + p;
    const U = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w || 700}&q=70`;

    ML.CATEGORIES = [
        { id: 'greens',  name: 'Leafy Greens',       icon: 'bx-leaf',        blurb: 'Cut at dawn' },
        { id: 'tubers',  name: 'Roots & Tubers',     icon: 'bx-bowl-rice',   blurb: 'Dug on pickup day' },
        { id: 'peppers', name: 'Peppers & Tomatoes', icon: 'bxs-hot',        blurb: 'Vine-ripened' },
        { id: 'fruits',  name: 'Fruits',             icon: 'bx-lemon',       blurb: 'Tree-ripened' },
        { id: 'grains',  name: 'Grains & Beans',     icon: 'bx-package',     blurb: 'Sun-dried' },
        { id: 'dairy',   name: 'Eggs & Dairy',       icon: 'bx-cheese',         blurb: 'Free-range' }
    ];

    ML.FARMS = [
        {
            id: 'green-valley', name: 'Green Valley Farm', area: 'Epe, Lagos', lat: 6.5841, lng: 3.9830,
            rating: 4.9, reviews: 212, since: 2014, img: IMG('farms/green-valley.jpg'),
            about: 'Family-run fields on the Epe lagoon plain. Green Valley grows tomatoes, peppers and mangoes without synthetic pesticides and only harvests what has been reserved.',
            specialty: ['Tomatoes', 'Peppers', 'Mangoes']
        },
        {
            id: 'ibe-organic', name: 'Ibe Organic Crops', area: 'Ikorodu, Lagos', lat: 6.6194, lng: 3.5105,
            rating: 4.8, reviews: 168, since: 2017, img: IMG('farms/ibe-organic.jpg'),
            about: 'Greenhouse-and-field growers certified organic since 2019. Best known for leafy greens that go from bed to hub in under six hours.',
            specialty: ['Leafy greens', 'Carrots', 'Herbs']
        },
        {
            id: 'sunrise-agro', name: 'Sunrise Agro Farms', area: 'Ijebu-Ode, Ogun', lat: 6.8200, lng: 3.9200,
            rating: 4.7, reviews: 134, since: 2012, img: IMG('farms/sunrise-agro.jpg'),
            about: 'Mixed-crop farm on red loam soil. Sweet potatoes, African spinach and brown eggs from birds that actually roam.',
            specialty: ['Sweet potatoes', 'Spinach', 'Eggs']
        },
        {
            id: 'ogun-river', name: 'Ogun River Harvest', area: 'Abeokuta, Ogun', lat: 7.1475, lng: 3.3619,
            rating: 4.8, reviews: 97, since: 2016, img: IMG('farms/ogun-river.jpg'),
            about: 'River-valley farm cooperative growing yam, pineapples and honey beans across 40 smallholder plots.',
            specialty: ['Yam', 'Pineapple', 'Beans']
        },
        {
            id: 'badagry-coop', name: 'Badagry Harvest Co-op', area: 'Badagry, Lagos', lat: 6.4149, lng: 2.8876,
            rating: 4.6, reviews: 121, since: 2015, img: U('1560493676-04071c5f467b'),
            about: 'A 60-member cooperative on the coastal sand belt. Plum tomatoes, plantains and free-range eggs at fair, transparent prices.',
            specialty: ['Tomatoes', 'Bananas', 'Eggs']
        }
    ];

    /* day: 0 Sun … 6 Sat · start/end in 24h */
    ML.HUBS = [
        { id: 'yaba',     name: 'Yaba Community Hub',      short: 'Yaba Hub',    area: 'Herbert Macaulay Way, Yaba',        lat: 6.5095, lng: 3.3711, day: 6, start: 8,  end: 11, note: 'Covered pickup bay, cold boxes on site.' },
        { id: 'ikeja',    name: 'Ikeja City Mall Hub',     short: 'Ikeja Hub',   area: 'Obafemi Awolowo Way, Ikeja',        lat: 6.6141, lng: 3.3577, day: 6, start: 12, end: 15, note: 'Ground-floor car park, Gate B.' },
        { id: 'lekki',    name: 'Lekki Farmers Market',    short: 'Lekki Market',area: 'Admiralty Way, Lekki Phase 1',       lat: 6.4381, lng: 3.4700, day: 0, start: 9,  end: 11, note: 'Stall row 4, look for the green awning.' },
        { id: 'ikorodu',  name: 'Ikorodu Town Hub',        short: 'Ikorodu Hub', area: 'Lagos Road, Ikorodu',               lat: 6.6194, lng: 3.5105, day: 6, start: 9,  end: 12, note: 'Beside the town hall, free parking.' },
        { id: 'epe',      name: 'Farm-gate, Green Valley', short: 'Epe Farm-gate',area: 'Green Valley Farm, Epe',           lat: 6.5841, lng: 3.9830, day: 3, start: 16, end: 18, note: 'Pick your own crate straight from the field.' }
    ];

    const P = (o) => Object.assign({ stock: 30, rating: 4.7, reviews: 40, organic: false, tag: null, added: 30 }, o);

    ML.PRODUCTS = [
        P({ id: 'ugu-bundle', name: 'Fresh Ugu Leaves (Fluted Pumpkin)', cat: 'greens', farm: 'ibe-organic', price: 1200, unit: 'bundle', img: IMG('products/ugu-bundle.jpg'), stock: 40, rating: 4.9, reviews: 88, organic: true, tag: 'Still growing', added: 4,
            desc: 'Tender, deep-green ugu leaves with a soft bite and no bitterness. Cut on pickup morning so they arrive crisp, never wilted.',
            tip: 'Wash just before cooking. Wrap unwashed leaves in a damp cloth and they keep 3 days in the fridge.' }),
        P({ id: 'lettuce-heads', name: 'Green Lettuce Heads', cat: 'greens', farm: 'ibe-organic', price: 1500, unit: '3 heads', img: IMG('products/lettuce-heads.jpg'), stock: 24, rating: 4.7, reviews: 51, organic: true, added: 12,
            desc: 'Butter-soft greenhouse lettuce, grown in raised beds. Sweet enough for a plain salad, sturdy enough for burgers.',
            tip: 'Store heads unwashed in a container with a paper towel. Best within 4 days.' }),
        P({ id: 'efo-tete', name: 'Efo Tete (African Spinach)', cat: 'greens', farm: 'sunrise-agro', price: 900, unit: 'bundle', img: IMG('products/efo-tete.jpg'), stock: 5, rating: 4.8, reviews: 63, tag: 'Low stock', added: 20,
            desc: 'Classic amaranth greens for efo riro and soups. Harvested young so the stems are as tender as the leaves.',
            tip: 'Blanch and freeze in portions if you will not cook within two days.' }),

        P({ id: 'abuja-yam', name: 'Abuja Yam (Large Tuber)', cat: 'tubers', farm: 'ogun-river', price: 4500, unit: 'tuber', img: IMG('products/abuja-yam.jpg'), stock: 18, rating: 4.8, reviews: 74, added: 9,
            desc: 'Heavy, floury white yam that pounds smooth and fries golden. Each tuber is roughly 3 to 4 kg and dug the morning of pickup.',
            tip: 'Keep in a cool, dry place with airflow. Do not refrigerate whole tubers.' }),
        P({ id: 'sweet-potato', name: 'Sweet Potatoes (Orange Flesh)', cat: 'tubers', farm: 'sunrise-agro', price: 2800, unit: '5kg bag', img: IMG('products/sweet-potato.jpg'), stock: 22, rating: 4.7, reviews: 96, organic: true, added: 6,
            desc: 'Orange-fleshed sweet potatoes, naturally sugary and high in beta-carotene. Roast, mash or fry.',
            tip: 'Store in a dark cupboard, not the fridge. They sweeten after a few days of curing.' }),
        P({ id: 'carrots', name: 'Crunchy Carrots', cat: 'tubers', farm: 'ibe-organic', price: 1800, unit: 'kg', img: IMG('products/carrots.jpg'), stock: 35, rating: 4.6, reviews: 39, organic: true, added: 25,
            desc: 'Short, sweet carrots pulled with their tops still on. Snappy raw, silky when slow-cooked.',
            tip: 'Twist off the tops before storing. Wrapped in a damp cloth they stay crisp for two weeks.' }),

        P({ id: 'scotch-bonnet', name: 'Scotch Bonnet Peppers (Ata Rodo)', cat: 'peppers', farm: 'green-valley', price: 3500, unit: 'kg', img: IMG('products/scotch-bonnet.jpg'), stock: 20, rating: 4.9, reviews: 142, tag: 'Season peak', added: 3,
            desc: 'Fiery, fruity rodo at full colour. Grown on staked rows and hand-picked, so no bruised, split fruit.',
            tip: 'Freeze whole in a sealed bag. They blend straight from frozen.' }),
        P({ id: 'bell-pepper', name: 'Green Bell Peppers (Tatashe)', cat: 'peppers', farm: 'green-valley', price: 2200, unit: 'kg', img: IMG('products/bell-pepper.jpg'), stock: 28, rating: 4.6, reviews: 33, added: 18,
            desc: 'Thick-walled, glossy peppers. Mild and sweet, the base of a good stew.',
            tip: 'Keep in the crisper drawer, unwashed, up to 10 days.' }),
        P({ id: 'plum-tomato', name: 'Plum Tomatoes', cat: 'peppers', farm: 'badagry-coop', price: 4800, unit: 'crate', img: IMG('products/plum-tomato.jpg'), stock: 16, rating: 4.8, reviews: 118, tag: 'Still growing', added: 5,
            desc: 'Meaty, low-water plum tomatoes ripened on the vine. Ideal for stew base, sauces and jollof.',
            tip: 'Ripen at room temperature, refrigerate only once soft. Blend and freeze extras.' }),
        P({ id: 'roma-basket', name: 'Roma Tomatoes (Big Basket)', cat: 'peppers', farm: 'green-valley', price: 18000, unit: 'basket', img: IMG('products/roma-basket.jpg'), stock: 8, rating: 4.7, reviews: 57, added: 14,
            desc: 'A full market basket of Roma tomatoes for families, caterers and food sellers who buy in bulk.',
            tip: 'Sort on arrival and use the softest first. Split into two crates to avoid crushing.' }),

        P({ id: 'cabbage', name: 'Crisp Green Cabbage', cat: 'greens', farm: 'sunrise-agro', price: 1300, unit: 'head', img: IMG('products/cabbage.jpg'), stock: 34, rating: 4.5, reviews: 39, added: 5,
            desc: 'Dense, heavy heads with tight leaves. Good for coleslaw, stir-fries and long simmering stews.',
            tip: 'Keep the outer leaves on and wrap in a damp cloth in the fridge for up to two weeks.' }),
        P({ id: 'potatoes', name: 'Irish Potatoes', cat: 'tubers', farm: 'ibe-organic', price: 4200, unit: '5kg bag', img: IMG('products/potatoes.jpg'), stock: 22, rating: 4.6, reviews: 63, added: 9,
            desc: 'Firm, thin-skinned potatoes lifted the week you collect. Fry, roast or mash.',
            tip: 'Store in a dark, cool place and away from onions to stop sprouting.' }),

        P({ id: 'mango-dozen', name: 'Tree-Ripened Mangoes', cat: 'fruits', farm: 'green-valley', price: 2000, unit: 'dozen', img: IMG('products/mango-dozen.jpg'), stock: 30, rating: 4.9, reviews: 176, organic: true, tag: 'Season peak', added: 2,
            desc: 'Left on the tree until they drop their shoulders. Juicy, fibre-light and properly sweet.',
            tip: 'Ripen on the counter. Once soft, refrigerate and eat within 3 days.' }),
        P({ id: 'pineapple', name: 'Sweet Edo Pineapples', cat: 'fruits', farm: 'ogun-river', price: 1200, unit: 'fruit', img: IMG('products/pineapple.jpg'), stock: 45, rating: 4.7, reviews: 82, added: 8,
            desc: 'Low-acid, honey-sweet pineapples cut with a long stem so they last longer on the shelf.',
            tip: 'Turn upside down for a day to spread the sugar evenly before cutting.' }),
        P({ id: 'bananas', name: 'Sweet Bananas', cat: 'fruits', farm: 'badagry-coop', price: 1500, unit: 'bunch', img: IMG('products/bananas.jpg'), stock: 26, rating: 4.5, reviews: 44, added: 16,
            desc: 'Small, sweet bananas cut green and ripened in the hub. Great for smoothies and snacking.',
            tip: 'Separate the fingers to slow ripening. Freeze overripe ones for baking.' }),

        P({ id: 'honey-beans', name: 'Honey Beans (Oloyin)', cat: 'grains', farm: 'ogun-river', price: 6500, unit: '5kg bag', img: IMG('products/honey-beans.jpg'), stock: 20, rating: 4.8, reviews: 91, organic: true, added: 22,
            desc: 'Small, sweet brown beans that cook soft without soaking overnight. Sorted by hand to remove stones.',
            tip: 'Store airtight in a cool cupboard. Rinse twice and cook with a pinch of baking soda.' }),
        P({ id: 'ofada-rice', name: 'Ofada Rice (Unpolished)', cat: 'grains', farm: 'ogun-river', price: 7800, unit: '5kg bag', img: IMG('products/ofada-rice.jpg'), stock: 12, rating: 4.7, reviews: 69, added: 11,
            desc: 'Locally milled, unpolished rice with a nutty aroma. The proper partner to ayamase.',
            tip: 'Rinse well and cook with a little more water than white rice.' }),

        P({ id: 'eggs-crate', name: 'Free-Range Eggs', cat: 'dairy', farm: 'badagry-coop', price: 2500, unit: 'crate of 30', img: IMG('products/eggs-crate.jpg'), stock: 25, rating: 4.9, reviews: 203, organic: true, tag: 'Popular', added: 7,
            desc: 'Deep-yellow yolks from hens that roam. Collected every morning and packed the day you collect.',
            tip: 'Keep in the fridge, pointed end down. Fresh eggs sink; older ones float.' }),
        P({ id: 'brown-eggs', name: 'Brown Eggs (Dozen)', cat: 'dairy', farm: 'sunrise-agro', price: 1100, unit: 'dozen', img: IMG('products/brown-eggs.jpg'), stock: 3, rating: 4.6, reviews: 28, tag: 'Low stock', added: 1,
            desc: 'A smaller pack of brown-shell eggs for one or two. Same free-range flock, same morning collection.',
            tip: 'Best used within three weeks of collection.' })
    ];

    const REVIEW_POOL = [
        ['Chidinma A.', 'Arrived exactly as described. You can tell it was harvested that morning.'],
        ['Tunde B.', 'Better than the market. The quality is consistent every single week.'],
        ['Halima S.', 'Packed carefully and the farmer even added a little extra. Will reorder.'],
        ['Emeka O.', 'Fair price and very fresh. Pickup was fast and well organised.'],
        ['Folake R.', 'My whole family noticed the difference. This is what produce should taste like.'],
        ['Ifeanyi K.', 'Good, but sold out quickly the next week. Reserve early!']
    ];
    ML.seedReviews = function (p) {
        const i = ML.PRODUCTS.indexOf(p);
        return [0, 1, 2].map((k) => {
            const r = REVIEW_POOL[(i + k * 2) % REVIEW_POOL.length];
            return { name: r[0], text: r[1], stars: k === 2 ? 4 : 5, days: 3 + k * 5 + (i % 4), seed: true };
        });
    };

    ML.PROMOS = {
        FRESH10: { type: 'pct', value: 10, label: '10% off your basket' },
        HARVEST5: { type: 'flat', value: 500, label: '₦500 off' }
    };

    /* ---------- lookup helpers ---------- */
    ML.product = (id) => ML.PRODUCTS.find((p) => p.id === id);
    ML.farm = (id) => ML.FARMS.find((f) => f.id === id);
    ML.hub = (id) => ML.HUBS.find((h) => h.id === id);
    ML.category = (id) => ML.CATEGORIES.find((c) => c.id === id);

    /* ---------- tiny utils ---------- */
    ML.$ = (sel, root) => (root || document).querySelector(sel);
    ML.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    ML.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    ML.money = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');
    ML.pad = (n) => String(n).padStart(2, '0');

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ML.DAYS = DAYS;
    ML.MONTHS = MONTHS;
    ML.fmtDate = (d, withDay) => {
        d = new Date(d);
        return (withDay === false ? '' : DAYS[d.getDay()] + ', ') + MONTHS[d.getMonth()] + ' ' + d.getDate();
    };
    ML.fmtHour = (h) => {
        const ap = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 === 0 ? 12 : h % 12;
        return hh + ':00 ' + ap;
    };
    ML.windowLabel = (hub) => ML.fmtHour(hub.start) + ' – ' + ML.fmtHour(hub.end);
    ML.ago = (iso) => {
        const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
        if (s < 60) return 'Just now';
        const m = Math.round(s / 60);
        if (m < 60) return m + ' min ago';
        const h = Math.round(m / 60);
        if (h < 24) return h + ' hr ago';
        const d = Math.round(h / 24);
        if (d < 7) return d + (d === 1 ? ' day ago' : ' days ago');
        return ML.fmtDate(iso);
    };

    /**
     * Upcoming pickup slots for a hub. Farmers lock the harvest at 6 PM the
     * day before pickup, so only slots whose lock is still in the future count.
     */
    ML.nextSlots = function (hubId, count) {
        const hub = ML.hub(hubId) || ML.HUBS[0];
        const out = [];
        const now = new Date();
        for (let i = 0; i < 35 && out.length < (count || 2); i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hub.start, 0, 0);
            if (d.getDay() !== hub.day) continue;
            const lock = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 18, 0, 0);
            if (lock <= now) continue;
            out.push({
                iso: d.getFullYear() + '-' + ML.pad(d.getMonth() + 1) + '-' + ML.pad(d.getDate()),
                date: d, lock,
                label: ML.fmtDate(d),
                window: ML.windowLabel(hub),
                hub: hub.id
            });
        }
        return out;
    };

    ML.distanceKm = function (a, b) {
        const R = 6371, rad = (x) => (x * Math.PI) / 180;
        const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
        const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(s));
    };

    ML.stars = (n) => {
        let h = '';
        for (let i = 1; i <= 5; i++) h += `<i class='bx ${n >= i - 0.25 ? 'bxs-star' : n >= i - 0.75 ? 'bxs-star-half' : 'bx-star'}'></i>`;
        return h;
    };

    ML.initials = (name) => (String(name || 'M').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('') || 'M').toUpperCase();

    /* graceful fallback artwork if a remote photo fails (offline, blocked, deleted) */
    ML.fallbackImg = function (label) {
        const t = ML.esc(ML.initials(label || 'ML'));
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%2322C55E'/><stop offset='1' stop-color='%2384CC16'/></linearGradient></defs><rect width='400' height='300' fill='url(%23g)'/><circle cx='320' cy='60' r='90' fill='%23F59E0B' opacity='.25'/><path d='M200 210c-40-10-62-40-52-92 46 4 70 34 52 92z' fill='%23fff' opacity='.55'/><path d='M200 214c8-44 34-70 78-72-2 46-30 70-78 72z' fill='%23fff' opacity='.4'/><text x='200' y='262' text-anchor='middle' font-family='Georgia,serif' font-size='30' fill='%23fff' opacity='.9'>${t}</text></svg>`;
        return 'data:image/svg+xml;utf8,' + svg.replace(/#/g, '%23').replace(/%2523/g, '%23');
    };
})(window.ML);
