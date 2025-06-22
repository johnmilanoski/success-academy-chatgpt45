#!/bin/bash

echo "🔧 Setting up folders and injecting starter code..."

BASE="app"

# ========== ROUTE FILES ==========

# Auth: Signup
mkdir -p $BASE/api/auth/signup
cat > $BASE/api/auth/signup/route.ts << 'EOF'
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO instructors (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [name, email, hash]
    );
    return NextResponse.json({ success: true, instructorId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
EOF

# Auth: Login
mkdir -p $BASE/api/auth/login
cat > $BASE/api/auth/login/route.ts << 'EOF'
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { serialize } from "cookie";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const result = await pool.query(`SELECT * FROM instructors WHERE email = $1`, [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", serialize("instructor_id", String(user.id), { path: "/", httpOnly: true }));
  return res;
}
EOF

# Auth: Logout
mkdir -p $BASE/api/auth/logout
cat > $BASE/api/auth/logout/route.ts << 'EOF'
// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", serialize("instructor_id", "", { path: "/", expires: new Date(0) }));
  return res;
}
EOF

# Upload Route
mkdir -p $BASE/api/upload/lesson
cat > $BASE/api/upload/lesson/route.ts << 'EOF'
// app/api/upload/lesson/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);

  return NextResponse.json({ success: true, filename });
}
EOF

# Student catalog route
mkdir -p $BASE/api/student/catalog
cat > $BASE/api/student/catalog/route.ts << 'EOF'
// app/api/student/catalog/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const result = await pool.query("SELECT * FROM courses WHERE published = true");
  return NextResponse.json({ courses: result.rows });
}
EOF

# ========== PAGE FILES ==========

# Login Page
mkdir -p $BASE/app/login
cat > $BASE/app/login/page.tsx << 'EOF'
// app/app/login/page.tsx
"use client";
export default function LoginPage() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {/* Form fields go here */}
    </div>
  );
}
EOF

# Signup Page
mkdir -p $BASE/app/signup
cat > $BASE/app/signup/page.tsx << 'EOF'
// app/app/signup/page.tsx
"use client";
export default function SignupPage() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {/* Form fields go here */}
    </div>
  );
}
EOF

# Dashboard (router logic comes later)
mkdir -p $BASE/app/dashboard
cat > $BASE/app/dashboard/page.tsx << 'EOF'
// app/app/dashboard/page.tsx
"use client";
export default function DashboardRedirect() {
  return <div>Redirecting...</div>;
}
EOF

# Student Catalog Page
mkdir -p $BASE/app/student/catalog
cat > $BASE/app/student/catalog/page.tsx << 'EOF'
// app/app/student/catalog/page.tsx
"use client";
export default function CourseCatalog() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Course Catalog</h1>
      {/* Course cards go here */}
    </div>
  );
}
EOF

echo "✅ All starter files created and populated with code."
