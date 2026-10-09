import { randomBytes, scryptSync } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function passwordFields(password: string) {
  const passwordSalt = randomBytes(16).toString('hex');
  return { passwordSalt, passwordHash: hashPassword(password, passwordSalt) };
}

const WASHER_PROGRAMS = [
  { name: '표준', durationMinutes: 35, price: 4000 },
  { name: '대형/이불', durationMinutes: 50, price: 6000 },
];

const DRYER_PROGRAMS = [
  { name: '표준', durationMinutes: 40, price: 1000 },
  { name: '강력건조', durationMinutes: 55, price: 1500 },
];

interface MachineSeed {
  machineNumber: number;
  type: 'WASHER' | 'DRYER';
  status: 'AVAILABLE' | 'RUNNING' | 'COMPLETED' | 'MAINTENANCE';
  elapsedMinutesAtSeed: number;
}

interface LaundromatSeed {
  name: string;
  address: string;
  machines: MachineSeed[];
}

const LAUNDROMATS: LaundromatSeed[] = [
  {
    name: '우리동네 코인세탁소',
    address: '서울시 광진구 자양동 845-1',
    machines: [
      { machineNumber: 1, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 17 },
      { machineNumber: 3, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 3 },
      { machineNumber: 4, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 5, type: 'WASHER', status: 'COMPLETED', elapsedMinutesAtSeed: 0 },
      { machineNumber: 1, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 28 },
      { machineNumber: 2, type: 'DRYER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 3, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 15 },
      { machineNumber: 4, type: 'DRYER', status: 'MAINTENANCE', elapsedMinutesAtSeed: 0 },
    ],
  },
  {
    name: '학교앞 빨래방',
    address: '서울시 광진구 자양동 846-3',
    machines: [
      { machineNumber: 1, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 5 },
      { machineNumber: 2, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 3, type: 'WASHER', status: 'MAINTENANCE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 1, type: 'DRYER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 32 },
    ],
  },
  {
    name: '자양동 코인런드리',
    address: '서울시 광진구 자양동 850-2',
    machines: [
      { machineNumber: 1, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 9 },
      { machineNumber: 3, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 4, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 30 },
      { machineNumber: 1, type: 'DRYER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 20 },
      { machineNumber: 3, type: 'DRYER', status: 'MAINTENANCE', elapsedMinutesAtSeed: 0 },
    ],
  },
  {
    name: '강변역 빨래방',
    address: '서울시 광진구 자양동 812-7',
    machines: [
      { machineNumber: 1, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 2 },
      { machineNumber: 2, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 3, type: 'WASHER', status: 'COMPLETED', elapsedMinutesAtSeed: 0 },
      { machineNumber: 1, type: 'DRYER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 11 },
    ],
  },
  {
    name: '뚝섬유원지 세탁소',
    address: '서울시 광진구 자양동 804-15',
    machines: [
      { machineNumber: 1, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 2, type: 'WASHER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 3, type: 'WASHER', status: 'RUNNING', elapsedMinutesAtSeed: 24 },
      { machineNumber: 1, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 5 },
      { machineNumber: 2, type: 'DRYER', status: 'AVAILABLE', elapsedMinutesAtSeed: 0 },
      { machineNumber: 3, type: 'DRYER', status: 'RUNNING', elapsedMinutesAtSeed: 35 },
    ],
  },
];

const FAQS = [
  { question: '세탁소는 몇 시까지 운영하나요?', answer: '대부분 24시간 무인으로 운영됩니다. 각 세탁소 상세 화면에서 영업 상태를 확인하세요.', category: '이용안내' },
  { question: '결제는 어떻게 하나요?', answer: '기기 옆 카드/간편결제 단말기로 결제합니다. 현금은 받지 않는 지점이 많습니다.', category: '이용안내' },
  { question: '세탁물을 두고 왔어요. 환불받을 수 있나요?', answer: '세탁이 시작된 이후에는 원칙적으로 환불이 불가합니다. 기기 고장 등 명백한 하자가 있는 경우에만 고객센터로 문의해주세요.', category: '환불정책' },
];

const DOCUMENTS = [
  {
    title: '세탁기 사용 설명서',
    category: '기기 사용법',
    content:
      '세탁기 사용 순서: 1) 세탁물을 기기 용량의 80% 이하로 넣습니다. 2) 세제는 전용 세제함에 넣습니다 (가루세제/액체세제 겸용). 3) 원하는 코스(표준/대형·이불)를 선택하고 결제합니다. 4) 세탁이 끝나면 즉시 세탁물을 수거해주세요. 다음 이용자를 위해 기기 문을 열어두면 좋습니다.',
  },
  {
    title: '건조기 사용 설명서',
    category: '기기 사용법',
    content:
      '건조기 사용 순서: 1) 세탁이 끝난 옷을 엉킨 부분 없이 펴서 넣습니다. 2) 건조할 옷의 소재에 따라 표준 또는 강력건조 코스를 선택합니다. 3) 섬유유연제 시트를 함께 넣으면 정전기를 줄일 수 있습니다. 4) 과도한 양을 한 번에 넣으면 건조 효율이 떨어지니 2회로 나누는 것을 권장합니다.',
  },
  {
    title: '세탁 코스 설명',
    category: '코스 안내',
    content:
      '표준 코스(세탁 35분/건조 40분)는 일반적인 의류에 적합합니다. 대형·이불 코스(세탁 50분)는 이불, 패딩처럼 부피가 크고 헹굼이 많이 필요한 세탁물에 적합하며 수용량이 더 큽니다. 강력건조 코스(건조 55분)는 두꺼운 소재나 수분이 많이 남은 세탁물에 적합합니다.',
  },
  {
    title: '의류 소재별 세탁 방법',
    category: '세탁 지식',
    content:
      '면/합성섬유는 표준 코스로 세탁 및 건조가 가능합니다. 울(모) 소재, 실크, 레이온 등 섬세한 소재는 고온 세탁과 건조 시 수축되거나 손상될 수 있어 무인 세탁기/건조기 사용을 피하고 손세탁 또는 드라이클리닝을 권장합니다. 패딩, 이불류는 대형 코스를 사용하고 건조 시에는 완전히 마를 때까지 충분히 돌려야 냄새와 곰팡이를 방지할 수 있습니다.',
  },
  {
    title: '세탁 금지 소재 및 주의사항',
    category: '세탁 지식',
    content:
      '다음 소재/제품은 무인 세탁기 사용을 피해주세요: 가죽/스웨이드 제품, 금속 장식이나 지퍼가 많은 제품(기기 손상 위험), 방수 코팅 제품(코팅 손상), 심하게 오염되어 기름기가 많은 작업복(다른 세탁물 오염). 운동복과 일반 수건은 함께 세탁해도 무방하지만, 색이 진한 신상품 의류는 첫 세탁 시 단독 세탁을 권장합니다.',
  },
  {
    title: '세제 사용 방법',
    category: '세탁 지식',
    content:
      '표준 세탁 1회 기준 가루세제는 계량컵 1컵, 액체세제는 뚜껑 1회분이 적당합니다. 세제를 과다 투입하면 헹굼이 불완전해 피부 자극을 유발할 수 있습니다. 섬유유연제는 세제와 별도 칸에 넣어야 하며, 알레르기가 있는 경우 무향 제품을 권장합니다.',
  },
  {
    title: '세탁소 이용 안내',
    category: '이용안내',
    content:
      '대부분의 지점은 24시간 무인으로 운영됩니다. 기기 옆 결제 단말기에서 카드 또는 간편결제로 요금을 결제한 뒤 코스를 선택해 시작합니다. 세탁/건조가 끝나면 바로 세탁물을 수거해 다음 이용자가 기다리지 않도록 해주세요.',
  },
  {
    title: '환불 및 고장 신고 정책',
    category: '환불정책',
    content:
      '세탁/건조가 정상적으로 시작된 이후에는 단순 변심으로 환불이 불가합니다. 기기 고장으로 세탁이 중단되거나 세탁물이 손상된 경우에는 즉시 현장의 고객센터 연락처로 신고해주시면 확인 후 환불 또는 보상 절차를 안내합니다.',
  },
  {
    title: '이용 요금 안내',
    category: '이용안내',
    content:
      '세탁기 표준 코스는 4,000원, 대형·이불 코스는 6,000원입니다. 건조기 표준 코스는 1,000원, 강력건조 코스는 1,500원입니다. 지점별로 요금이 다를 수 있으니 세탁소 상세 화면의 기기 정보를 확인해주세요.',
  },
];

async function main() {
  console.log('Seeding admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@laundon.app' },
    update: {},
    create: {
      email: 'admin@laundon.app',
      name: '관리자',
      role: 'ADMIN',
      ...passwordFields('Admin1234!'),
    },
  });

  for (const laundromatSeed of LAUNDROMATS) {
    console.log(`Seeding laundromat: ${laundromatSeed.name}`);

    const laundromat = await prisma.laundromat.upsert({
      where: { id: `seed-${laundromatSeed.name}` },
      update: { name: laundromatSeed.name, address: laundromatSeed.address },
      create: { id: `seed-${laundromatSeed.name}`, name: laundromatSeed.name, address: laundromatSeed.address },
    });

    const programsByType: Record<'WASHER' | 'DRYER', { id: string; durationMinutes: number; price: number }[]> = {
      WASHER: [],
      DRYER: [],
    };

    for (const [type, defs] of [
      ['WASHER', WASHER_PROGRAMS],
      ['DRYER', DRYER_PROGRAMS],
    ] as const) {
      for (const def of defs) {
        const program = await prisma.laundryProgram.upsert({
          where: { id: `${laundromat.id}-${type}-${def.name}` },
          update: { durationMinutes: def.durationMinutes, price: def.price },
          create: {
            id: `${laundromat.id}-${type}-${def.name}`,
            laundromatId: laundromat.id,
            machineType: type,
            name: def.name,
            durationMinutes: def.durationMinutes,
            price: def.price,
          },
        });
        programsByType[type].push(program);
      }
    }

    const now = Date.now();

    for (const machineSeed of laundromatSeed.machines) {
      const defaultProgram = programsByType[machineSeed.type][0];
      const isRunning = machineSeed.status === 'RUNNING';
      const startedAt = isRunning ? new Date(now - machineSeed.elapsedMinutesAtSeed * 60 * 1000) : null;
      const totalSeconds = isRunning ? defaultProgram.durationMinutes * 60 : null;
      const estimatedEndAt =
        isRunning && startedAt && totalSeconds ? new Date(startedAt.getTime() + totalSeconds * 1000) : null;

      await prisma.machine.upsert({
        where: {
          laundromatId_type_machineNumber: {
            laundromatId: laundromat.id,
            type: machineSeed.type,
            machineNumber: machineSeed.machineNumber,
          },
        },
        update: {
          status: machineSeed.status,
          programId: isRunning ? defaultProgram.id : null,
          price: defaultProgram.price,
          startedAt,
          estimatedEndAt,
          totalSeconds,
        },
        create: {
          laundromatId: laundromat.id,
          type: machineSeed.type,
          machineNumber: machineSeed.machineNumber,
          status: machineSeed.status,
          programId: isRunning ? defaultProgram.id : null,
          price: defaultProgram.price,
          startedAt,
          estimatedEndAt,
          totalSeconds,
        },
      });
    }
  }

  console.log('Seeding FAQs...');
  for (const faq of FAQS) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) await prisma.fAQ.create({ data: faq });
  }

  console.log('Seeding knowledge documents...');
  for (const doc of DOCUMENTS) {
    const existing = await prisma.document.findFirst({ where: { title: doc.title } });
    if (!existing) await prisma.document.create({ data: doc });
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
