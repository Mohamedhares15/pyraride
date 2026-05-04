"use client";
import { use } from "react";
import Page from "@/pages/AcademyDetail";

type Params = { academyId: string };

export default function NextPage({ params }: { params: Promise<Params> }) {
  const p = use(params);
  return <Page academyId={p.academyId} />;
}
