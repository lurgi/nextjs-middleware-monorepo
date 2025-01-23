import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next Test App",
  description: "Next.js 테스트 애플리케이션",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
