import type { Metadata } from "next";
import localFont from "next/font/local";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestId = cookies().get("x-request-id")?.value;

  return (
        <html lang="en">
          <head>
            {requestId && <meta name="x-request-id" content={requestId} />}
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* Do not remove this component, we use it to notify the parent that the mini-app is ready */}
            <ReadyNotifier />
            <Providers>
      <FarcasterWrapper>
        {children}
      </FarcasterWrapper>
      </Providers>
            <ResponseLogger />
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "BasedStake: Multi-Tier Staking",
        description: "Engage with ERC-20 tokens through multi-tier staking on Base. Stake, earn rewards, and connect wallets easily. Includes Coinbase and Farcaster MiniApp integration for enhanced user experience.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_88939fec-1d2f-4859-95b4-230f2b45074d-07eJJB3BM2fizAcaR4TSvSPRz6dK9n","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"BasedStake: Multi-Tier Staking","url":"https://equal-tin-097.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
