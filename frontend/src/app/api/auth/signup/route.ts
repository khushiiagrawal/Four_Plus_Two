import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authCookie, signUserJwt, type AppUser } from "@/lib/jwt";

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  employeeId: z.string().min(3),
  designation: z.string().min(2),
  department: z.string().min(2),
  region: z.string().min(2),
  password: z.string().min(8),
  invitationCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = Object.fromEntries(form.entries());
  const parse = SignupSchema.safeParse({
    name: payload.name,
    email: payload.email,
    employeeId: payload.employeeId,
    designation: payload.designation,
    department: payload.department,
    region: payload.region,
    password: payload.password,
    invitationCode: payload.invitationCode,
  });

  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  // Validate official domain or invitation code
  const isOfficial = /(@gov\.in|@nic\.in|@health\.in|@official\.in|@example\.gov)$/i.test(
    parse.data.email,
  );
  const hasInvite = !!parse.data.invitationCode && parse.data.invitationCode === "APPROVED-2025";
  if (!isOfficial && !hasInvite) {
    return NextResponse.json(
      { error: "Access restricted to legal/government authorities" },
      { status: 403 },
    );
  }

  // Photo ID file is optional in mock (would be uploaded to storage in real app)
  const user: AppUser = {
    id: "u-" + Math.random().toString(36).slice(2, 8),
    name: String(parse.data.name),
    email: String(parse.data.email),
    designation: String(parse.data.designation),
    department: String(parse.data.department),
    region: String(parse.data.region),
    role: "official",
  };

  const token = await signUserJwt(user);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(authCookie.name, token, authCookie.options);
  return res;
}


