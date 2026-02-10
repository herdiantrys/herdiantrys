
import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await client.fetch(`*[_type == "user"]{_id, email, username, points}`);
    return NextResponse.json(users);
}
