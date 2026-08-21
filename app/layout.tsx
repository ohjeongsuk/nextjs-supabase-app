import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Gather - 초대 링크 하나로 모든 것을 해결",
  description:
    "일회성 이벤트를 간편하게 관리하는 올인원 플랫폼. 제목, 날짜, 장소만 입력하면 즉시 이벤트를 만들고 초대 링크로 참여자를 모아보세요.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
      </body>
    </html>
  );
}
