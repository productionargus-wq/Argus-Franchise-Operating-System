import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const inst = await dbRepository.getInstallationById(params.id);
  if (!inst) return NextResponse.json({ error: "Installation not found" }, { status: 404 });
  return NextResponse.json(inst);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await dbRepository.updateInstallation(params.id, body);
    if (!updated) return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
