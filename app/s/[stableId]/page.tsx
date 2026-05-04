"use client";
import { use } from "react";
import Page from "@/pages/StableDetail";

type Params = { stableId: string };

export default function NextPage({ params }: { params: Promise<Params> }) {
  const p = use(params);
  return <Page stableId={p.stableId} />;
}
