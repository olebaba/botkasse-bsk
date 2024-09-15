import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/app/navbar";
import Head from "next/head";
import React from "react";

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
            <meta lang="no-nb"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#767676"/>
            <meta name="msapplication-TileColor" content="#ffc40d"/>
            <meta name="theme-color" content="#ffffff"/>
            <meta property="og:title" content="Bækkelaget botkasse"/>
            <meta property="og:description" content="Oversikt over bøter for spillere i bsk innebandy sitt A-lag"/>
            <meta property="og:url" content="https://botkasse-bsk.vercel.app/"/>
            <meta property="og:image" content="https://www.bekkelagets.no/kunde/grafikk/bekkelagets-sk-logo.svg"/>
        </Head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Navbar/>
        {children}
        </body>
        </html>
    );
}
