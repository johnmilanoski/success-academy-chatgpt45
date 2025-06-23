'use client'; // Required for AuthProvider and useAuth hook

// import type { Metadata } from "next"; // Keep for static metadata if needed elsewhere
import "./globals.css";
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
// import { useRouter } from "next/navigation"; // For programmatic navigation


// Note: 'metadata' export is for Server Components.
// For client components, you'd manage title/meta tags differently if needed dynamically.
// export const metadata: Metadata = {
// title: "Success Academy",
// description: "Online learning platform",
// };

function AuthAwareLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  // const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // The logout function in AuthContext already handles redirecting to /login
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <header className="p-4 bg-gray-800 text-white">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Success Academy</Link>
            <div>
              {isLoading ? (
                <p>Loading...</p>
              ) : user ? (
                <>
                  <span className="mr-4">Welcome, {user.name}</span>
                  <Link href="/dashboard" className="mr-4 hover:underline">Dashboard</Link>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
        <footer className="p-4 bg-gray-200 text-center">
          © {new Date().getFullYear()} Success Academy
        </footer>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AuthAwareLayout>{children}</AuthAwareLayout>
    </AuthProvider>
  );
}
