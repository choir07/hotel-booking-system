/**
 * prisma/seed-osm.ts
 *
 * Fetches real hotel/resort/guesthouse data from OpenStreetMap's Overpass API,
 * fabricates the fields OSM doesn't provide (rooms, pricing, amenities,
 * description), and inserts everything via Prisma.
 *
 * ⚠️ ADJUST FIELD NAMES: this assumes your schema looks roughly like:
 *   model Hotel { id, name, city, address, phone, website, stars, description,
 *                 image, latitude, longitude, rooms Room[] }
 *   model Room  { id, hotelId, type, price, capacity, amenities, image }
 * Rename anything below (search for "// ADJUST") to match your actual schema.
 *
 * Run with:
 *   npx tsx prisma/seed-osm.ts
 * or compile first if you don't have tsx:
 *   npx ts-node prisma/seed-osm.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------- 1. Fetch from Overpass ----------

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const OVERPASS_QUERY = `
[out:json][timeout:25];
area["ISO3166-1"="MY"][admin_level=2]->.searchArea;
(
  node["tourism"="hotel"](area.searchArea);
  node["tourism"="guest_house"](area.searchArea);
  node["tourism"="resort"](area.searchArea);
  way["tourism"="hotel"](area.searchArea);
);
out center 60;
`;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

async function fetchOsmHotels(): Promise<OverpassElement[]> {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OverpassResponse;
  return data.elements;
}

// ---------- 2. Fabrication helpers ----------
// Used only when OSM doesn't supply the field. Biased toward plausible
// ranges rather than pure uniform randomness, so the catalog doesn't look
// obviously fake.

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// Weighted star rating: mostly 3–4 stars, occasional 2 or 5.
function fabricateStars(): number {
  const weighted = [2, 3, 3, 3, 4, 4, 4, 5];
  return pick(weighted);
}

function fabricateRoomCount(stars: number): number {
  // Higher star rating → tends toward larger room counts.
  const base = stars >= 5 ? [150, 500] : stars === 4 ? [60, 250] : stars === 3 ? [30, 120] : [10, 60];
  return randomInt(base[0], base[1]);
}

const AMENITY_POOL = [
  'Free WiFi',
  'Swimming Pool',
  'Free Parking',
  'Air Conditioning',
  'Breakfast Included',
  'Fitness Center',
  'Airport Shuttle',
  'Restaurant',
  'Room Service',
  'Spa',
  'Business Center',
  'Pet Friendly',
  'Beach Access',
  'Bar/Lounge',
];

function fabricateAmenities(stars: number): string[] {
  // More stars → more amenities.
  const count = stars >= 5 ? randomInt(7, 10) : stars === 4 ? randomInt(5, 8) : stars === 3 ? randomInt(3, 6) : randomInt(2, 4);
  const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const ROOM_TYPES = [
  { type: 'Standard Room', basePrice: 120, capacity: 2 },
  { type: 'Deluxe Room', basePrice: 200, capacity: 2 },
  { type: 'Suite', basePrice: 380, capacity: 3 },
  { type: 'Family Room', basePrice: 320, capacity: 4 },
];

function fabricateRoomTypesForHotel(stars: number) {
  // Higher star rating → higher price multiplier, more room-type variety.
  const multiplier = stars >= 5 ? 2.2 : stars === 4 ? 1.5 : stars === 3 ? 1.0 : 0.7;
  const variety = stars >= 4 ? ROOM_TYPES : ROOM_TYPES.slice(0, 3); // budget places skip family suites
  return variety.map((rt) => ({
    type: rt.type, // ADJUST: Room.type
    price: Math.round(rt.basePrice * multiplier * (0.9 + Math.random() * 0.2)), // ADJUST: Room.price
    capacity: rt.capacity, // ADJUST: Room.capacity
    amenities: fabricateAmenities(stars), // ADJUST: Room.amenities (or move to Hotel-level only)
  }));
}

const DESCRIPTION_TEMPLATES = [
  (name: string, city: string) =>
    `${name} offers comfortable accommodations in ${city}, blending convenience with a warm welcome for both business and leisure travelers.`,
  (name: string, city: string) =>
    `Located in ${city}, ${name} provides a relaxing stay with easy access to local attractions and dining.`,
  (name: string, city: string) =>
    `${name} is a well-regarded stay in ${city}, known for its attentive service and inviting atmosphere.`,
];

function fabricateDescription(name: string, city: string): string {
  return pick(DESCRIPTION_TEMPLATES)(name, city);
}

// Rough fallback region lookup for entries with no addr:city — Malaysia's
// major lat/lon bands. Not precise, just avoids leaving "Unknown" everywhere.
function fallbackCityFromCoords(lat: number, lon: number): string {
  if (lat > 5.5 && lon < 101) return 'Langkawi area';
  if (lat > 5.5) return 'Kelantan/Terengganu coast';
  if (lat > 4 && lon > 102) return 'Pahang coast';
  if (lat > 3.5 && lat < 4.5 && lon < 102) return 'Perak';
  if (lat > 2.8 && lat < 3.5 && lon > 101.4 && lon < 101.9) return 'Kuala Lumpur/Selangor';
  if (lat < 2.5 && lon < 102.5) return 'Melaka/Johor';
  return 'Malaysia';
}

// ---------- 3. Transform OSM element → seed record ----------

function transformElement(el: OverpassElement) {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;

  if (!tags.name || lat === undefined || lon === undefined) return null; // skip unusable entries

  const stars = tags.stars ? parseInt(tags.stars, 10) : fabricateStars();
  const city = tags['addr:city'] || tags['is_in']?.split(',')[0]?.trim() || fallbackCityFromCoords(lat, lon);
  const addressParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean);
  const address = addressParts.length ? addressParts.join(' ') : null;

  return {
    name: tags.name, // ADJUST: Hotel.name
    city, // ADJUST: Hotel.city
    address, // ADJUST: Hotel.address (nullable)
    phone: tags.phone || null, // ADJUST: Hotel.phone
    website: tags.website || null, // ADJUST: Hotel.website
    stars, // ADJUST: Hotel.stars
    description: fabricateDescription(tags.name, city), // ADJUST: Hotel.description
    latitude: lat, // ADJUST: Hotel.latitude
    longitude: lon, // ADJUST: Hotel.longitude
    _roomCount: tags.rooms ? parseInt(tags.rooms, 10) : fabricateRoomCount(stars),
    _roomTypes: fabricateRoomTypesForHotel(stars),
  };
}

// ---------- 4. Seed ----------

async function main() {
  console.log('Fetching hotel data from Overpass API...');
  const elements = await fetchOsmHotels();
  console.log(`Fetched ${elements.length} raw elements.`);

  const transformed = elements
    .map(transformElement)
    .filter((h): h is NonNullable<ReturnType<typeof transformElement>> => h !== null);

  console.log(`Usable after filtering: ${transformed.length}`);

  for (const hotel of transformed) {
    const { _roomCount, _roomTypes, ...hotelData } = hotel;

    const created = await prisma.hotel.create({
      data: {
        ...hotelData,
        rooms: {
          create: _roomTypes.map((rt) => ({
            type: rt.type,
            price: rt.price,
            capacity: rt.capacity,
            amenities: rt.amenities, // ADJUST: if Room.amenities isn't a String[]/Json column, e.g. join(', ') for a String column
          })),
        }, // ADJUST: relation field name on Hotel if it's not called "rooms"
      },
    });

    console.log(`Seeded: ${created.name} (${_roomTypes.length} room types, ~${_roomCount} total rooms implied)`);
  }

  console.log(`\nDone. Seeded ${transformed.length} hotels.`);
  console.log('Attribution reminder: display "Hotel location data © OpenStreetMap contributors" somewhere in the app (ODbL requirement).');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
