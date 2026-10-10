import type { ExerciseId } from "./types";

export type Category = "full_body" | "strength" | "cardio" | "stretching" | "beginner";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export const CATEGORY_LABEL: Record<Category, string> = {
  full_body: "Butun tana",
  strength: "Kuch",
  cardio: "Kardio",
  stretching: "Cho‘zilish",
  beginner: "Boshlovchilar",
};

export interface LibraryExercise {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  difficulty: Difficulty;
  muscles: string;
  /** Suggested sets x reps, or hold in seconds. */
  reps?: number;
  holdSec?: number;
  durationMin: number;
  steps: string[];
  safety: string[];
  /** Set only for exercises the camera engine can count. */
  trackable?: ExerciseId;
}

export const EXERCISES: LibraryExercise[] = [
  {
    id: "squat", name: "Squat (cho‘qqayish)", trackable: "squat",
    description: "Oyoq va dumba mushaklarini kuchaytiradigan asosiy mashq.",
    categories: ["strength", "full_body", "beginner"], difficulty: "beginner", muscles: "Son, dumba, core",
    reps: 12, durationMin: 3,
    steps: ["Oyoqlarni yelka kengligida qo‘ying.", "Dumbani orqaga tortib, sekin pastga tushing.", "Tizzalar oyoq uchi yo‘nalishida bo‘lsin.", "Tovon bilan itarib, to‘liq tik turing."],
    safety: ["Orqani to‘g‘ri tuting.", "Tizzada og‘riq sezsangiz to‘xtang.", "Kameraga yon tomondan turing."],
  },
  {
    id: "pushup", name: "Push-up (yerdan itarilish)", trackable: "pushup",
    description: "Ko‘krak, yelka va qo‘l mushaklari uchun klassik mashq.",
    categories: ["strength", "full_body"], difficulty: "intermediate", muscles: "Ko‘krak, triseps, yelka",
    reps: 10, durationMin: 3,
    steps: ["Kaftlarni yelkadan sal kengroq qo‘ying.", "Tanani boshdan tovongacha to‘g‘ri chiziqda tuting.", "Tirsaklarni bukib pastga tushing.", "Qo‘llarni to‘liq yozib, yuqoriga itarilning."],
    safety: ["Belni bukmang.", "Qiyin bo‘lsa tizzadan boshlang.", "Kamera yon tomondan, butun tanani ko‘rsatsin."],
  },
  {
    id: "plank", name: "Plank (planka)", trackable: "plank",
    description: "Qorin va tana barqarorligini oshiradigan statik mashq.",
    categories: ["strength", "full_body", "beginner"], difficulty: "beginner", muscles: "Qorin, bel, yelka",
    holdSec: 30, durationMin: 2,
    steps: ["Tirsaklarni yelka ostiga qo‘ying.", "Tanani to‘g‘ri chiziqqa keltiring.", "Qorinni tarang tuting, nafas oling.", "Belgilangan vaqt davomida ushlab turing."],
    safety: ["Dumba ko‘tarilib ketmasin.", "Bel cho‘kib ketsa dam oling."],
  },
  {
    id: "jumping-jacks", name: "Jumping jacks (sakrab qo‘l-oyoq ochish)", categories: ["cardio", "full_body", "beginner"],
    description: "Yurak urishini oshiradigan oddiy kardio mashqi.", difficulty: "beginner", muscles: "Butun tana",
    reps: 30, durationMin: 3,
    steps: ["Oyoqlarni birlashtirib tik turing.", "Sakrab, oyoqlarni yoying va qo‘llarni boshdan yuqoriga ko‘taring.", "Boshlang‘ich holatga qayting."],
    safety: ["Yumshoq qo‘nib, tizzani biroz buking."],
  },
  {
    id: "lunge", name: "Lunge (qadam tashlab cho‘kish)", categories: ["strength", "full_body"],
    description: "Oyoq mushaklari va muvozanat uchun.", difficulty: "intermediate", muscles: "Son, dumba",
    reps: 10, durationMin: 4,
    steps: ["Oldinga katta qadam tashlang.", "Ikkala tizzani taxminan 90° gacha buking.", "Old oyoq bilan itarilib qayting.", "Oyoqlarni almashtiring."],
    safety: ["Old tizza oyoq uchidan oshmasin.", "Muvozanat yo‘qolsa devordan ushlang."],
  },
  {
    id: "high-knees", name: "High knees (tizzani baland ko‘tarish)", categories: ["cardio"],
    description: "Joyida yugurish ko‘rinishidagi kardio.", difficulty: "intermediate", muscles: "Son, qorin, yurak-qon tomir tizimi",
    holdSec: 30, durationMin: 2,
    steps: ["Tik turing.", "Tizzalarni navbat bilan belgacha ko‘taring.", "Qo‘llar bilan ritm tuting."],
    safety: ["Tez charchasangiz sekinlashtiring.", "Poldan sirpanmaydigan poyabzal kiying."],
  },
  {
    id: "glute-bridge", name: "Glute bridge (dumba ko‘prigi)", categories: ["strength", "beginner"],
    description: "Dumba va bel mushaklarini yumshoq kuchaytiradi.", difficulty: "beginner", muscles: "Dumba, son orqasi",
    reps: 12, durationMin: 3,
    steps: ["Orqangiz bilan yoting, tizzalarni buking.", "Dumbani yuqoriga ko‘taring.", "Yuqorida 1–2 soniya ushlang.", "Sekin tushing."],
    safety: ["Belni haddan tashqari egmang."],
  },
  {
    id: "mountain-climber", name: "Mountain climber (tog‘ chiqish)", categories: ["cardio", "full_body"],
    description: "Plank holatida tizzalarni navbat bilan ko‘krakka tortish.", difficulty: "advanced", muscles: "Qorin, yelka, oyoq",
    holdSec: 30, durationMin: 2,
    steps: ["Plank holatiga keling.", "Tizzani ko‘krakka tortib, almashtiring.", "Tana barqaror turishi kerak."],
    safety: ["Qo‘l bilak og‘risa to‘xtang.", "Tezlikni asta oshiring."],
  },
  {
    id: "hamstring-stretch", name: "Son orqasini cho‘zish", categories: ["stretching", "beginner"],
    description: "Mashqdan keyin son orqasi mushaklarini yumshatadi.", difficulty: "beginner", muscles: "Son orqasi",
    holdSec: 30, durationMin: 2,
    steps: ["O‘tirib, bir oyoqni oldinga uzating.", "Tanani sekin oldinga egiling.", "Og‘riqsiz chegarada ushlang.", "Oyoqni almashtiring."],
    safety: ["Silkitmang, tekis cho‘zing.", "Og‘riq bo‘lsa to‘xtating."],
  },
  {
    id: "child-pose", name: "Bola holati (child’s pose)", categories: ["stretching", "beginner"],
    description: "Bel va yelkani bo‘shashtiradigan tinch cho‘zilish.", difficulty: "beginner", muscles: "Bel, yelka",
    holdSec: 40, durationMin: 2,
    steps: ["Tizzalarda o‘tiring.", "Qo‘llarni oldinga uzatib, peshonani polga qo‘ying.", "Chuqur nafas oling."],
    safety: ["Tizza og‘risa yostiq qo‘ying."],
  },
];

export const byId = (id: string) => EXERCISES.find((e) => e.id === id);
