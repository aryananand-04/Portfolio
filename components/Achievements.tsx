'use client';

import { useState } from 'react';
import Image from 'next/image';
import achievementsData from '@/data/gaming-achievements.json';

export default function Achievements() {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const copyToClipboard = (tag: string, game: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(game);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const getVerifyLink = (game: 'coc' | 'cr', tag: string) => {
    if (game === 'coc') {
      return `https://www.clashofstats.com/players/${encodeURIComponent(tag)}/summary`;
    } else {
      return `https://royaleapi.com/player/${encodeURIComponent(tag)}`;
    }
  };

  return (
    <section id="achievements" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Gaming Achievements</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Clash of Clans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Clash of Clans
              </h3>
              <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
                {achievementsData.coc.highestLeague}
              </span>
            </div>

            <div className="space-y-4">
              {/* Player Tag */}
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">Player Tag:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold">{achievementsData.coc.playerTag}</code>
                  <button
                    onClick={() => copyToClipboard(achievementsData.coc.playerTag, 'coc')}
                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                  >
                    {copiedTag === 'coc' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Ranking */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 text-center">
                <div className="text-sm opacity-90">Ranking</div>
                <div className="text-2xl font-bold">{achievementsData.coc.ranking}</div>
              </div>

              {/* Screenshots */}
              <div className="grid grid-cols-2 gap-2">
                {achievementsData.coc.screenshots.map((screenshot, idx) => (
                  <div key={idx} className="relative aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={screenshot}
                      alt={`CoC Achievement ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Verify Button */}
              <a
                href={getVerifyLink('coc', achievementsData.coc.playerTag)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
              >
                Verify Profile →
              </a>
            </div>
          </div>

          {/* Clash Royale */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Clash Royale
              </h3>
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold">
                {achievementsData.cr.highestLeague}
              </span>
            </div>

            <div className="space-y-4">
              {/* Player Tag */}
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">Player Tag:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold">{achievementsData.cr.playerTag}</code>
                  <button
                    onClick={() => copyToClipboard(achievementsData.cr.playerTag, 'cr')}
                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                  >
                    {copiedTag === 'cr' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Screenshots */}
              <div className="grid grid-cols-2 gap-2">
                {achievementsData.cr.screenshots.map((screenshot, idx) => (
                  <div key={idx} className="relative aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={screenshot}
                      alt={`CR Achievement ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Verify Button */}
              <a
                href={getVerifyLink('cr', achievementsData.cr.playerTag)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Verify Profile →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Click "Verify Profile" to view live stats on official tracker websites</p>
        </div>
      </div>
    </section>
  );
}
