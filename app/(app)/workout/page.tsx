import { Suspense } from "react";
import { CoachStudio } from "@/components/workout/CoachStudio";
import { PageHeader, PageSkeleton } from "@/components/ui/primitives";

export const metadata = { title: "AI mashq — FitAI" };

export default function WorkoutPage() {
  return (
    <>
      <PageHeader title="AI mashq studiyasi" subtitle="Kamera orqali tana nuqtalari aniqlanadi, takrorlar va holat real vaqtda sanaladi." />
      <Suspense fallback={<PageSkeleton />}><CoachStudio /></Suspense>
    </>
  );
}
