import { NextResponse } from 'next/server';

import { simulateNetworkDelay } from '@/lib/network';
import type { GeocodeResponse } from '@/types/geocode';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function GET(request: Request) {
  await simulateNetworkDelay();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (query.length === 0) {
    return NextResponse.json({ message: '주소를 입력해주세요.' }, { status: 400 });
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'kr');
  url.searchParams.set('accept-language', 'ko');
  url.searchParams.set('q', query);

  let response: Response;
  try {
    // Nominatim (OpenStreetMap) - free, no API key required. Usage policy:
    // https://operations.osmfoundation.org/policies/nominatim/ - identify
    // the app via User-Agent and keep request volume light (this route is
    // only hit on an explicit search submit, never per keystroke).
    response = await fetch(url, {
      headers: { 'User-Agent': 'LaundON-mock-app/1.0 (educational project)' },
    });
  } catch {
    return NextResponse.json({ message: '주소 검색 서비스에 연결할 수 없습니다.' }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ message: '주소 검색에 실패했습니다.' }, { status: 502 });
  }

  const results = (await response.json()) as NominatimResult[];

  if (results.length === 0) {
    return NextResponse.json(
      { message: '주소를 찾을 수 없습니다. 조금 더 간단히 입력해보세요 (예: "구/동" 단위).' },
      { status: 404 },
    );
  }

  const [top] = results;

  return NextResponse.json<GeocodeResponse>({
    lat: Number(top.lat),
    lng: Number(top.lon),
    displayName: top.display_name,
  });
}
