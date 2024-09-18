import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/app/navbar";
import Head from "next/head";
import React from "react";
import {SpeedInsights} from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"

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
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="no">
        <Head>
            <meta charSet="utf-8"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#767676"/>
            <meta name="msapplication-TileColor" content="#ffc40d"/>
            <meta name="theme-color" content="#ffffff"/>
        </Head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Navbar/>
        {children}
        <SpeedInsights />
        <Analytics />
        </body>
        </html>
    );
}
