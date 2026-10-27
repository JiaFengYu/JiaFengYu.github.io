import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assetPath } from '../../lib/site';

export const metadata = {
  title: "GIMPS | Jayden Yu",
  description: "Great Internet Mersenne Prime Search",
};

export default function GIMPSPage() {
  return (
    <article className="prose prose-lg dark:prose-invert mx-auto text-white max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">The Great Internet Mersenne Prime Search (GIMPS)</h1>
      
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/4 flex-shrink-0">
          <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-indigo-300 shadow-lg">
            <Image
              src={assetPath("/images/Marin_mersenne.jpg")}
              alt="Marin Mersenne"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-center">
              <p className="text-xs text-gray-200 m-0">Marin Mersenne</p>
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          <div className="bg-indigo-900 bg-opacity-40 p-6 rounded-lg border border-indigo-800">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4">What is GIMPS?</h2>
            <p className="text-gray-200">
              If you've ever built your own PC, especially if you've overclocked your CPU, chances are that you've probably 
              stress tested your CPU. One of the more common ways to do so is to use Prime95, which is a tool used in the Great Internet Mersenne Prime Search (GIMPS). <br />
              It's an entirely volunteers based collaborative project to search for Mersenne primes, which are prime numbers of the form 2<sup>p</sup>-1 where p is also prime, named after French mathematician Marin Mersenne.
              It just so happens that searching for these elusive primes is also a great way to test system stability. <br />
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-200 mb-4">Why Mersenne Primes Matter</h2>
        <p className="text-gray-200 mb-4">
            You might be wondering, what's the point of finding these really, <em>REALLY</em> large primes, and that's a perfectly valid question.
            In fact, that's a question that I've also asked myself as well. And honestly, other than it's important for math research and it's a convenient way to reuse outdated hardware,
            I don't really know. <br />
            Frankly speaking, I am nowhere near enough qualified to tell you why Mersenne Primes matter to mathematics research, but they do, and fortunately, there are very qualified people who can explain to you <a href="https://www.mersenne.org/why_join/">why GIMPS matters</a>.
        </p>
        
      </div>
      
      <section aria-labelledby="my-contributions" className="mb-12">
        <h2 id="my-contributions" className="text-2xl font-bold text-indigo-200 mb-4">My contributions</h2>
        <p className="text-gray-200 mb-6">I contribute under the username <strong>jiafengyu</strong>. Here’s a snapshot of my lifetime GIMPS statistics, including completed work, rankings, and contributed compute time.</p>
        <figure className="surface overflow-hidden">
          <a href={assetPath("/images/gimps-progress.png")} target="_blank" rel="noopener noreferrer" aria-label="Open full-size GIMPS lifetime statistics screenshot" className="block">
            <Image
              src={assetPath("/images/gimps-progress.png")}
              alt="GIMPS lifetime statistics snapshot: overall rank 3,048 of 45,933, with 20,006 GHz-days of contributed compute and 79 completed work units; charts show percentile rankings and CPU time by work type."
              width={2388}
              height={1256}
              sizes="(max-width: 768px) 100vw, 896px"
              className="w-full h-auto"
            />
          </a>
          <figcaption className="px-5 py-4 text-sm text-indigo-100 leading-relaxed">A snapshot of my GIMPS lifetime statistics. Rankings and totals reflect the time of capture. <a href={assetPath("/images/gimps-progress.png")} target="_blank" rel="noopener noreferrer" className="underline">View full-size image ↗</a></figcaption>
        </figure>
      </section>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-200 mb-4">Get Involved</h2>
        <p className="text-gray-200 mb-4">
          Whether you're just someone who hates to have old, unused hardware wasting at home (like me, and you should look into <a href="https://frame.work/ca/en">Framework computers</a> if you haven't) or you're a mathematics PhD looking for meaningful ways to contribute to 
          mathematics research, the beauty is that anyone and (almost) any computer can contribute to GIMPS! <br />
          So if you want to give your hardware a second life, here's how to get started:
        </p>
        <ol className="list-decimal pl-5 text-gray-200 space-y-2">
          <li>Visit the <a href="https://www.mersenne.org/" className="text-indigo-300 hover:text-white" target="_blank" rel="noopener noreferrer">official GIMPS website</a></li>
          <li>Download and install Prime95</li>
          <li>Create a free account to track your contributions (optional)</li>
          <li>Configure the software to use your preferred amount of system resources</li>
          <li>Start searching for primes and maybe earn a nice prize on the way!</li>
        </ol>
        <p>If you want to follow my progress, my GIMPS username is <b>jiafengyu</b>.</p>
      </div>
      
      <div className="text-center mt-12">
        <Link href="/projects/mersenne-cluster" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all">
          Learn About My Mersenne Cluster Project
        </Link>
      </div>
    </article>
  );
} 
