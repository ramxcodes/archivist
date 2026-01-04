"use client";

import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { Separator } from "@repo/ui/components/ui/separator";
import { useGetApiHealth } from "@/lib/api";

export default function Home() {
  const { data: apiHealth } = useGetApiHealth();
  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-7xl font-bold">Hello Ram</h1>
      <p className="text-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
      <Button variant={"secondary"}>
        <Link href="/calendar">Visit Calendar</Link>
      </Button>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">API Health</h2>
        <p className="text-lg">{apiHealth?.message || "No data"}</p>
      </div>
    </div>
  );
}
