import "../app/globals.css";
import MainNavbar from '../components/shared/MainNavbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  // Always render the global Navbar to keep header consistent across pages
  return (
    <>
      <MainNavbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
