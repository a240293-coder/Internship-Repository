import "../app/globals.css";
import "./auth/Dashboard.css";
import "./auth/Auth.css";
import MainNavbar from '../components/shared/MainNavbar';
import Footer from '../components/Footer';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MainNavbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
