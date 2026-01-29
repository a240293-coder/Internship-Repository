import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        {/* SEO Meta */}
        <meta
          name="description"
          content="Join LearnBetter's globally accredited Masters program in Cloud Computing and AI System Design. Get 100% job assurance, learn from industry experts, and secure high-paying roles at top tech companies."
        />

        {/* Favicons: use favicon.ico as primary, keep SVG fallback and apple-touch */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
