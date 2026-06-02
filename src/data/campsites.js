// Seeded PRNG (mulberry32) for stable generated data
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAIROBI = { lat: -1.286, lng: 36.817 };
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

function genCommunity(id, access) {
  const rng = mulberry32(id * 7919 + 13);
  const base = access === 'good' ? 4.3 : access === 'moderate' ? 3.7 : 3.1;
  const clamp = v => Math.max(1, Math.min(5, v));
  const count = 2 + Math.floor(rng() * 4);
  const road      = clamp(base + (rng() - 0.5) * 1.2);
  const facilities = clamp((access === 'rough' ? 2.6 : 3.6) + (rng() - 0.5) * 1.4);
  const scenery   = clamp(4.2 + (rng() - 0.4) * 1.0);
  const safety    = clamp(3.9 + (rng() - 0.5) * 1.1);
  const overall   = (road + facilities + scenery + safety) / 4;
  return { count, road, facilities, scenery, safety, overall };
}

const rawCampsites = [
  { id: 1,  name: 'Olmoti Crater Camp',         region: 'Ngorongoro Area',          county: 'Narok',            lat: -1.7167, lng: 35.5833, elev: 2560, access: 'rough',    facilities: ['campfire','water_nearby'],               fee: 'KES 500–1000',          sources: ['Murmet4x4','GeoPointAdventuresKe'],    tags: ['crater','wildlife','remote'],                       photos: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80','https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'] },
  { id: 2,  name: 'Hells Gate Campsite',         region: 'Naivasha',                 county: 'Nakuru',           lat: -0.9167, lng: 36.3167, elev: 1900, access: 'good',     facilities: ['toilets','water','campfire'],             fee: 'KES 700 + park fees',    sources: ['96Lost','WANDERLYKE'],                 tags: ['national_park','gorge','wildlife','accessible'],     photos: ['https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&q=80','https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80'] },
  { id: 3,  name: 'Tafaria Castle Camp',          region: 'Nyahururu',                county: 'Laikipia',         lat: -0.2500, lng: 36.5667, elev: 2360, access: 'good',     facilities: ['toilets','water','showers','campfire','restaurant'], fee: 'KES 1000',       sources: ['96Lost','wondering_luminous'],          tags: ['highland','forest','comfortable'],                   photos: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80','https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=1200&q=80'] },
  { id: 4,  name: 'Lake Bogoria Camp',            region: 'Baringo',                  county: 'Baringo',          lat:  0.2333, lng: 36.1,    elev: 990,  access: 'moderate', facilities: ['toilets','campfire'],                     fee: 'KES 600 + park fees',    sources: ['Murmet4x4','GeoPointAdventuresKe'],    tags: ['lake','hot_springs','flamingos','semi-arid'],        photos: ['https://images.unsplash.com/photo-1567608285969-48e4bbe0d399?w=1200&q=80','https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200&q=80'] },
  { id: 5,  name: 'Ol Pejeta Bush Camp',          region: 'Laikipia Plateau',         county: 'Laikipia',         lat:  0.0333, lng: 36.9,    elev: 1820, access: 'moderate', facilities: ['toilets','water','campfire'],             fee: 'KES 1500 + conservancy fees', sources: ['GeoPointAdventuresKe','96Lost'],      tags: ['conservancy','rhino','savanna','wildlife'],          photos: ['https://images.unsplash.com/photo-1611348586755-53860f29e1e2?w=1200&q=80','https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80'] },
  { id: 6,  name: 'Chyulu Hills Campsite',        region: 'Amboseli–Tsavo Corridor',  county: 'Makueni',          lat: -2.65,   lng: 37.9,    elev: 1780, access: 'rough',    facilities: ['campfire','water_nearby'],               fee: 'KES 800 + park fees',    sources: ['wondering_luminous','WANDERLYKE'],     tags: ['volcanic','forest','kilimanjaro_view','remote'],     photos: ['https://images.unsplash.com/photo-1631662501849-89db7e42e5b8?w=1200&q=80','https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=1200&q=80'] },
  { id: 7,  name: 'Kakamega Forest Camp',         region: 'Kakamega',                 county: 'Kakamega',         lat:  0.2833, lng: 34.85,   elev: 1580, access: 'good',     facilities: ['toilets','water','campfire'],             fee: 'KES 600 + forest fees',  sources: ['WANDERLYKE','96Lost'],                 tags: ['rainforest','birdwatching','primates','lush'],       photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80','https://images.unsplash.com/photo-1518709779341-56cf33b4f17a?w=1200&q=80'] },
  { id: 8,  name: 'Samburu Reserve Camp',         region: 'Samburu',                  county: 'Samburu',          lat:  0.6,    lng: 37.5333, elev: 850,  access: 'moderate', facilities: ['toilets','water','campfire'],             fee: 'KES 700 + park fees',    sources: ['Murmet4x4','GeoPointAdventuresKe'],    tags: ['arid','wildlife','river','north_kenya'],             photos: ['https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=80','https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200&q=80'] },
  { id: 9,  name: 'Mt. Longonot Crater',          region: 'Naivasha',                 county: 'Nakuru',           lat: -0.9167, lng: 36.45,   elev: 2150, access: 'good',     facilities: ['toilets','campfire'],                     fee: 'KES 500 + park fees',    sources: ['96Lost','WANDERLYKE'],                 tags: ['volcano','rift_valley','hike','views'],              photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80','https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80'] },
  { id: 10, name: 'Ndoto Mountains Camp',         region: 'Marsabit',                 county: 'Marsabit',         lat:  1.95,   lng: 37.05,   elev: 1600, access: 'rough',    facilities: ['campfire'],                               fee: 'Donations to community', sources: ['Murmet4x4'],                           tags: ['remote','desert','community','north_kenya','advanced'], photos: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80','https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80'] },
  { id: 11, name: 'Lake Turkana — Loiyangalani',  region: 'Marsabit',                 county: 'Marsabit',         lat:  2.7667, lng: 36.7,    elev: 380,  access: 'rough',    facilities: ['water','toilets','campfire'],             fee: 'KES 500–800',            sources: ['Murmet4x4','96Lost'],                  tags: ['lake','remote','iconic_route','north_kenya','desert'], photos: ['https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=1200&q=80','https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1200&q=80'] },
  { id: 12, name: 'Maasai Mara Public Camp',      region: 'Masai Mara',               county: 'Narok',            lat: -1.5167, lng: 35.15,   elev: 1650, access: 'good',     facilities: ['toilets','water','campfire','showers'],   fee: 'KES 1000–1500',          sources: ['GeoPointAdventuresKe','wondering_luminous'], tags: ['savanna','migration','wildlife','accessible'],   photos: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200&q=80','https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'] },
  { id: 13, name: 'Karuru Falls Camp',            region: 'Aberdare Range',           county: 'Nyeri',            lat: -0.4833, lng: 36.7333, elev: 3000, access: 'moderate', facilities: ['toilets','water','campfire'],             fee: 'KES 700 + park fees',    sources: ['wondering_luminous','WANDERLYKE'],     tags: ['waterfall','highland','forest','wildlife'],          photos: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80','https://images.unsplash.com/photo-1467890947394-8171244e5410?w=1200&q=80'] },
  { id: 14, name: 'Watamu Beach Campsite',        region: 'Kilifi Coast',             county: 'Kilifi',           lat: -3.3667, lng: 40.0167, elev: 5,    access: 'good',     facilities: ['toilets','water','showers','campfire','restaurant'], fee: 'KES 1000–1500', sources: ['96Lost','WANDERLYKE'],               tags: ['beach','coast','ocean','snorkeling','accessible'],   photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80','https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80'] },
  { id: 15, name: 'Tsavo East Wild Camp',         region: 'Tsavo East',               county: 'Kitui',            lat: -2.9167, lng: 38.5,    elev: 320,  access: 'rough',    facilities: ['campfire','water_nearby'],               fee: 'KES 500 + park fees',    sources: ['Murmet4x4','GeoPointAdventuresKe'],    tags: ['arid','wildlife','river','remote','tsavo'],          photos: ['https://images.unsplash.com/photo-1504173010664-32509107de9f?w=1200&q=80','https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80'] },
  { id: 16, name: 'Mt. Kenya — Naro Moru Gate',   region: 'Mt. Kenya',                county: 'Nyeri',            lat: -0.1667, lng: 37.1,    elev: 2400, access: 'good',     facilities: ['toilets','water','showers','campfire'],   fee: 'KES 800 + park fees',    sources: ['96Lost','GeoPointAdventuresKe'],       tags: ['mountain','hiking','highland','iconic'],             photos: ['https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'] },
  { id: 17, name: 'Kerio Valley Viewpoint',       region: 'Elgeyo-Marakwet',          county: 'Elgeyo-Marakwet',  lat:  0.65,   lng: 35.5667, elev: 2380, access: 'good',     facilities: ['campfire','water_nearby','toilets'],      fee: 'KES 500',                sources: ['WANDERLYKE','Murmet4x4'],              tags: ['rift_valley','viewpoint','twisty_roads','highland'],  photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80','https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80'] },
  { id: 18, name: 'Arabuko-Sokoke Forest',        region: 'Malindi Coast',            county: 'Kilifi',           lat: -3.3167, lng: 39.9,    elev: 120,  access: 'good',     facilities: ['toilets','water','campfire'],             fee: 'KES 500 + forest fees',  sources: ['wondering_luminous'],                  tags: ['forest','coast','birdwatching','rare_species'],      photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80','https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&q=80'] },
  { id: 19, name: 'Nasolot Reserve',              region: 'West Pokot',               county: 'West Pokot',       lat:  1.7333, lng: 35.4167, elev: 1100, access: 'rough',    facilities: ['campfire','toilets'],                     fee: 'KES 600 + park fees',    sources: ['Murmet4x4'],                           tags: ['remote','arid','wildlife','undiscovered','north_kenya'], photos: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80','https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80'] },
  { id: 20, name: 'Fourteen Falls Camp',          region: 'Thika',                    county: 'Murang\'a',        lat: -1.0333, lng: 37.15,   elev: 1300, access: 'good',     facilities: ['toilets','water','campfire'],             fee: 'KES 300',                sources: ['96Lost','wondering_luminous'],          tags: ['waterfall','beginner_friendly','nairobi_day_trip','river'], photos: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80','https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&q=80'] },
];

// Full descriptions (separate for readability)
const descriptions = {
  1:  'Remote crater rim campsite with stunning views into Olmoti. Accessed via rough dirt tracks — excellent for ADV bikes. Minimal facilities, true wild camping experience.',
  2:  'Inside Hells Gate National Park. Ride through the gorge, camp under rocky cliffs. Zebras and giraffes wander past your tent. KWS-managed with basic facilities.',
  3:  'Quirky castle estate turned campsite in the highlands. Cool temperatures, forest walks, good road access from Nyahururu. Popular with moto tourers heading north.',
  4:  'Flamingo-filled alkaline lake. Hot springs bubble at the shoreline. Semi-arid terrain — grippy but slippery near the springs. Raw beauty, very few tourists.',
  5:  'Budget camping inside Ol Pejeta Conservancy. Home to the last northern white rhinos. Good murram tracks on the way in, beautiful savanna camping.',
  6:  'Volcanic hills covered in lush cloud forest with views of Kilimanjaro. Lava tubes nearby. The approach via Kibwezi is paved, but last stretch is loose volcanic rock.',
  7:  "Kenya's only tropical rainforest. Incredible birdwatching and primate sightings. Roads in are paved. Quiet KWS campsite inside the forest reserve.",
  8:  "Dry riverbed camp on the Ewaso Ng'iro river. Rare species like reticulated giraffe and Grevy's zebra. Sandy tracks require care on two wheels.",
  9:  'Hike and camp on the rim of an active volcano. Bike can be left at the ranger gate. Short but steep trail. Spectacular views of Rift Valley and Lake Naivasha.',
  10: 'True off-grid northern Kenya. The Ndotos are dramatic sandstone massifs in Samburu territory. Extremely remote — long sandy tracks. Epic reward for experienced ADV riders.',
  11: 'The Jade Sea. Loiyangalani has a basic guesthouse with camping. The ride north from Maralal through Loiyangalani is one of Kenya\'s most iconic moto routes.',
  12: 'Budget camping just outside the reserve boundary. Prime wildebeest migration territory. Good murram access via Narok. Stunning savanna sunsets.',
  13: 'Camp near one of Kenya\'s tallest waterfalls inside Aberdare NP. Cold, misty highland forest. Elephant and buffalo frequent the area. Approach road is steep murram.',
  14: 'Camp right on the Indian Ocean beach. Coral reefs for snorkeling, mangroves nearby. The coastal ride from Mombasa is smooth tarmac. Great end point for coast tours.',
  15: 'Rugged red-dust Tsavo. Self-sufficient wild camping near the Galana River. Red elephants, lions, and vast empty plains. Rocky jeep tracks challenge any bike.',
  16: 'Base camp for Mt. Kenya climbs. Leave the bike at Naro Moru and hike up. The tarmac ride from Nyeri is beautiful. Cold nights — bring good sleeping gear.',
  17: 'Perched on the edge of the Kerio Valley escarpment. The descent into the valley is one of Kenya\'s most thrilling riding roads — hairpins and switchbacks. Camp at the top.',
  18: "East Africa's largest coastal forest. Rare golden-rumped elephant shrews. Flat forest tracks suitable for any bike. Cool and shaded — a contrast to the hot coast.",
  19: 'Undiscovered gem in the hot, rocky north-west. Black rhinos, oryx, elephants. Very few visitors. Rough approach from Kapenguria — perfect for adventure riders seeking solitude.',
  20: 'Accessible day trip or overnight from Nairobi. Wide waterfall on the Athi River. Murram road from Thika is manageable. Good entry point campsite for new riders.',
};

export const campsites = rawCampsites.map(s => ({
  ...s,
  description: descriptions[s.id],
  distanceFromNairobi: haversineKm(NAIROBI, { lat: s.lat, lng: s.lng }),
  community: genCommunity(s.id, s.access),
}));

export const accessLabels = {
  good:     { label: 'Good Road',   short: 'GOOD', desc: 'Tarmac or well-maintained murram',           token: 'terrain' },
  moderate: { label: 'Moderate',    short: 'MOD',  desc: 'Rough murram or sandy tracks',               token: 'amber'   },
  rough:    { label: 'Rough / ADV', short: 'ADV',  desc: 'Technical off-road; ADV or enduro recommended', token: 'rust' },
};

export const facilityIcons = {
  toilets:      { label: 'Toilets'      },
  water:        { label: 'Water'        },
  water_nearby: { label: 'Water nearby' },
  showers:      { label: 'Showers'      },
  campfire:     { label: 'Campfire'     },
  restaurant:   { label: 'Food'         },
};

export const RATING_DIMS = [
  { key: 'road',       label: 'Road Access', hint: 'How rideable is the approach'    },
  { key: 'facilities', label: 'Facilities',  hint: 'Water, toilets, shelter'         },
  { key: 'scenery',    label: 'Scenery',     hint: 'The reward for getting there'    },
  { key: 'safety',     label: 'Safety',      hint: 'Security & wildlife exposure'    },
];

export const sourceLinks = {
  '96Lost':               'https://www.youtube.com/@96Lost',
  'Murmet4x4':            'https://www.youtube.com/@Murmet4x4',
  'WANDERLYKE':           'https://www.youtube.com/@WANDERLYKE',
  'GeoPointAdventuresKe': 'https://www.youtube.com/@GeoPointAdventuresKe',
  'wondering_luminous':   'https://www.youtube.com/@wondering_luminous',
};

export const round1 = v => Math.round(v * 10) / 10;
export { haversineKm, NAIROBI };
