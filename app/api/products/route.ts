import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET() {
  const products = dbRepository.getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = dbRepository.createProduct(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
