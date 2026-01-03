import Head from 'next/head';
import Hero from '../components/Hero';
import ProgramStats from '../components/ProgramStats';
import Highlights from '../components/Highlights';
import Stats from '../components/Stats';
import ProgramValue from '../components/ProgramValue';
import Mentors from '../components/Mentors';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <>
      <Head>
        <title>LearnBetter - Masters in Computer Science: Cloud Computing & AI System Design</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        
        <Hero />
        <ProgramStats />
        <Highlights />
        <Stats />
        <ProgramValue />
        <Mentors />
        <Testimonials />
        
      </main>
    </>
  );
}
