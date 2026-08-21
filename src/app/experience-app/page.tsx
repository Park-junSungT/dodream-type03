import type { Metadata } from "next";
import { GuardianExperience } from "@/components/guardian/GuardianExperience";

export const metadata: Metadata = {
  title: "보호자 앱 체험",
  description:
    "두드림 보호자 앱을 미리 경험해 보세요. 실제 위치 데이터를 사용한 시뮬레이션 시연입니다.",
  // A prototype has no business in search results next to the product page.
  robots: { index: false, follow: true },
};

export default function ExperienceAppPage() {
  return <GuardianExperience />;
}
