
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------- 1. Fetch from Overpass ----------

// (Overpass endpoints defined below, with mirror fallback)

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

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchOsmHotels(): Promise<OverpassElement[]> {
  let lastError: unknown;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'User-Agent': 'hotelbook-seed-script/1.0 (portfolio project; local dev)',
        },
        body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      });

      if (!res.ok) {
        throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as OverpassResponse;
      return data.elements;
    } catch (err) {
      console.warn(`Overpass endpoint ${url} failed, trying next if available...`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }
  throw lastError;
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

function fabricateRating(stars: number): number {
  // Rough correlation: higher stars → higher guest rating, with noise.
  const base = 2.8 + stars * 0.5;
  const noisy = base + (Math.random() * 0.8 - 0.4);
  return Math.round(Math.min(5, Math.max(1, noisy)) * 10) / 10;
}

function fabricateImageUrl(): string {
  const seed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/hotel${seed}/800/600`;
}

// Matches enum RoomType in schema.prisma: STANDARD | DELUXE | SUITE | DOUBLE | SINGLE
const ROOM_TYPES: { type: 'STANDARD' | 'DELUXE' | 'SUITE' | 'DOUBLE' | 'SINGLE'; basePrice: number; capacity: number }[] = [
  { type: 'STANDARD', basePrice: 120, capacity: 2 },
  { type: 'DELUXE', basePrice: 200, capacity: 2 },
  { type: 'SUITE', basePrice: 380, capacity: 3 },
  { type: 'DOUBLE', basePrice: 160, capacity: 2 },
];

function fabricateRoomImageUrl(): string {
  const seed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/room${seed}/800/600`;
}

function fabricateRoomsForHotel(stars: number) {
  const multiplier = stars >= 5 ? 2.2 : stars === 4 ? 1.5 : stars === 3 ? 1.0 : 0.7;
  const variety = stars >= 4 ? ROOM_TYPES : ROOM_TYPES.slice(0, 3); // budget places skip the pricier Suite tier
  return variety.map((rt, i) => ({
    roomNumber: `${100 + i * 10 + randomInt(1, 9)}`,
    type: rt.type,
    pricePerNight: Math.round(rt.basePrice * multiplier * (0.9 + Math.random() * 0.2)),
    capacity: rt.capacity,
    amenities: fabricateAmenities(stars),
    images: [fabricateRoomImageUrl()],
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
  const address = addressParts.length ? addressParts.join(' ') : 'Address not listed'; // ADJUST: Hotel.address is required/non-nullable per schema

  return {
    name: tags.name, // ADJUST: Hotel.name
    city, // ADJUST: Hotel.city
    country: 'Malaysia', // ADJUST: Hotel.country (required field per your schema)
    address, // ADJUST: Hotel.address (required, non-nullable)
    // Note: no "stars" field on Hotel — used internally only, not persisted
    rating: fabricateRating(stars), // ADJUST: Hotel.rating (Float)
    image: fabricateImageUrl(), // ADJUST: Hotel.image (String)
    amenities: fabricateAmenities(stars), // ADJUST: Hotel.amenities is on Hotel, not Room, per your schema
    description: fabricateDescription(tags.name, city), // ADJUST: Hotel.description
    // Note: no latitude/longitude fields on Hotel — coords used only for
    // the fallbackCityFromCoords() lookup above, not persisted.
    _roomCount: tags.rooms ? parseInt(tags.rooms, 10) : fabricateRoomCount(stars),
    _roomTypes: fabricateRoomsForHotel(stars),
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
            roomNumber: rt.roomNumber,
            type: rt.type,
            pricePerNight: rt.pricePerNight,
            capacity: rt.capacity,
            amenities: rt.amenities,
            images: rt.images,
          })),
        },
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