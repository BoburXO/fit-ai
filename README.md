# FitAI — AI fitness va maktab sport platformasi (prototip)

Next.js (App Router) + TypeScript + Tailwind. Kamera orqali **MediaPipe Pose Landmarker** bilan squat, push-up va plank sanaladi; ballar, jamoa reytingi va challenge’lar saqlangan yozuvlardan hisoblanadi.

## Ishga tushirish

```bash
npm install
npm run dev          # http://localhost:3000
```

Tekshiruvlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Kamera `localhost` yoki HTTPS’da ishlaydi. Pose model va wasm fayllari birinchi mashqda internetdan yuklanadi (jsDelivr, storage.googleapis.com).

## Muhit o‘zgaruvchilari

Demo rejim uchun **hech narsa kerak emas**. PostgreSQL ulash uchun `.env.example` ga qarang (`DATABASE_URL`).

## Holat (halol hisobot)

Bu muhitda internet bo‘lmagani uchun `npm install`, `next build`, `eslint` va sahifalarni brauzerda ishga tushirish **bajarilmagan**.

Bajarilgan: pose/hisoblash, ball, challenge, reyting va holat mantig‘ining 38 ta testi o‘tdi. Ular Vitest o‘rniga vaqtinchalik Node test shim bilan yurgizildi va TypeScript strict rejimida tekshirildi. Mantiq `lib/exercises`, `lib/scoring`, `lib/challenges`, `lib/teams`, `lib/workouts`, `lib/storage/state.ts`, `lib/auth` ichida.

Tekshirilmagan: barcha React sahifalar, API route’lar, `lib/validation` (zod) va `tests/validation.test.ts`, kamera va MediaPipe integratsiyasi. Birinchi `npm run typecheck` da kichik xatolar chiqishi mumkin.

## Nima ishlaydi / nima prototip

- Haqiqiy: kamera → MediaPipe landmark’lar → burchaklar → holat mashinasi → takror/ushlash soni.
- Ball: faqat `lib/scoring/engine.ts` beradi (mashq 20, kunlik bonus 5, kuniga 5 mashq limiti). Mijoz ball yubormaydi. Dublikatga qarshi `key` kaliti bor.
- Demo/namuna yozuvlar `Demo` belgisi bilan ko‘rinadi, **ball bermaydi** va challenge’ga hisoblanmaydi.
- Sinfdoshlar (reytingdagi boshqa o‘quvchilar) deterministik **demo** ma’lumot.
- Autentifikatsiya: **demo rejim** (rolni foydalanuvchi o‘zi tanlaydi). Xavfsiz emas. API cookie faqat qat’iy demo identifikatorni tanlaydi.
- Anti-cheat: faqat chegara va ishonarlilik tekshiruvi. Kameradan kelganini isbotlay olmaydi.
- API: xotiradagi demo store (server qayta ishga tushsa tozalanadi). `prisma/schema.prisma` tayyor, lekin Prisma repozitoriysi ulanmagan.

## Qilinmagan

- Auth.js bilan haqiqiy ro‘yxatdan o‘tish/kirish, parol va sessiyalar.
- Prisma asosidagi repozitoriy va tranzaksiyalar (sxema va UNIQUE cheklovlar tayyor).
- Python FastAPI xizmati (ixtiyoriy edi).
- React Hook Form (oddiy controlled formalar ishlatilgan).
- Jamoa a’zolari ro‘yxati va jamoa faoliyati lentasi (faqat reyting jadvali).

## Tuzilma

`app/` sahifalar va API, `components/` UI, `lib/` mantiq (kamera/pose, ball, challenge, reyting, saqlash), `hooks/`, `prisma/`, `tests/`.
