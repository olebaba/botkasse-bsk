import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/app/komponenter/navbar/navbar.tsx";
import React from "react";
import {SpeedInsights} from "@vercel/speed-insights/react";
import {Analytics} from "@vercel/analytics/react"
import manifest from "@/app/manifest.ts";

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

export const metadata: Metadata = {
    title: "Bækkelaget botkasse",
    description: "Oversikt over bøter for spillere i bsk sitt A-lag",
    openGraph: {
        title: "Bækkelaget botkasse",
        description: "Oversikt over bøter for spillere i bsk sitt A-lag",
        images: "https://5bxxn0af98q9ysmf.public.blob.vercel-storage.com/ikoner/bsk-logo-full-stor-icgelOv4C6VMPTJ76EXCsDVhOhWCXo",
        type: "website",
        url: "https://botkasse-bsk.vercel.app/",
        siteName: "Bækkelaget botkasse",
    },
    twitter: {
        site: "https://botkasse-bsk.vercel.app/",
        card: "summary_large_image",
        title: "Bækkelaget botkasse",
        images: ["https://5bxxn0af98q9ysmf.public.blob.vercel-storage.com/ikoner/bsk-logo-full-stor-icgelOv4C6VMPTJ76EXCsDVhOhWCXo"],
        description: "Oversikt over bøter for spillere i bsk sitt A-lag"
    },
    icons: [
        { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    ],
    manifest: JSON.stringify(manifest()),
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="no">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar/>
        {children}
        <SpeedInsights/>
        <Analytics/>
        </body>
        </html>
    );
}
