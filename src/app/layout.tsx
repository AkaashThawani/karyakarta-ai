import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModalWrapper } from "@/components/auth/auth-modal-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KaryaKarta AI",
  description: "AI-powered intelligent assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthModalProvider>
              {children}
              <AuthModalWrapper />
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
