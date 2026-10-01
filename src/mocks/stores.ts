import type { Store } from '@/types/store';

/**
 * Static store directory. In the real system this would come from the
 * IoT server / backend store registry; here it is just seed data.
 */
export const MOCK_STORES: Store[] = [
  {
    id: 'store-001',
    name: '우리동네 코인세탁소',
    address: '서울시 광진구 자양동 845-1',
  },
  {
    id: 'store-002',
    name: '학교앞 빨래방',
    address: '서울시 광진구 자양동 846-3',
  },
  {
    id: 'store-003',
    name: '자양동 코인런드리',
    address: '서울시 광진구 자양동 850-2',
  },
  {
    id: 'store-004',
    name: '강변역 빨래방',
    address: '서울시 광진구 자양동 812-7',
  },
  {
    id: 'store-005',
    name: '뚝섬유원지 세탁소',
    address: '서울시 광진구 자양동 804-15',
  },
];

export function findMockStore(storeId: string): Store | undefined {
  return MOCK_STORES.find((store) => store.id === storeId);
}
