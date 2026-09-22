import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { NotificationProvider } from "../context/NotificationContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Addior Mechanics Pro | Premium Automotive Service & Management Platform",
  description: "Enterprise car care platform. Smart service scheduling, guaranteed genuine OEM parts, certified master mechanics, and live transparent telemetry.",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
