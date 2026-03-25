import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate a secure Magic Link using the Admin API
    // This bypasses the password requirement securely
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (error || !data.properties.hashed_token) {
      console.error("[Face Login Error]", error);
      return NextResponse.json({ error: "Failed to generate login bypass link" }, { status: 500 });
    }

    // Return the hashed PKCE token, which the client can verify directly to create a session locally
    return NextResponse.json({ hashed_token: data.properties.hashed_token });

  } catch (error) {
    console.error("[Face Login Route Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
