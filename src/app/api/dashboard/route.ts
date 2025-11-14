import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getDashboardSnapshot } from "@/server/data/dashboard";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDashboardSnapshot(session.user.id);

  return NextResponse.json({
    metrics: snapshot.metrics,
    activities: snapshot.activities.map((activity) => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
    })),
    velocity: snapshot.velocity,
  });
}

