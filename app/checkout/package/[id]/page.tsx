"use client";
import { use } from "react";
import Page from "@/pages/CheckoutPackage";

type Params = { id: string };

export default function NextPage({ params }: { params: Promise<Params> }) {
  const p = use(params);
  return <Page id={p.id} />;
}
