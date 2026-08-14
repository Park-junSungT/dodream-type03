import { ExperienceRoot } from "@/components/experience/ExperienceRoot";
import { Analytics } from "@vercel/analytics/next"

export default function Page() {
  return (
    <>
      <ExperienceRoot />
      <Analytics />
    </>
  )
}
