'use client';

import { useState } from 'react';
import ChessChart from './charts/ChessChart';
import LichessChart from './charts/LichessChart';
import RatingCards from './charts/RatingCards';
import AchievementsSlider from './AchievementsSlider';
import achievementsData from '@/data/gaming-achievements.json';

type HobbyTab = 'chesscom' | 'lichess' | 'gaming';

export default function Hobbies() {
  const [activeTab, setActiveTab] = useState<HobbyTab>('chesscom');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const tabs = [
    { id: 'chesscom' as HobbyTab, label: 'Chess.com' },
    { id: 'lichess' as HobbyTab, label: 'Lichess' },
    { id: 'gaming' as HobbyTab, label: 'Gaming Achievements' },
  ];

  const copyToClipboard = (text: string, game: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(game);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <section id="hobbies" className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Hobbies</h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'chesscom' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Chess.com Rating Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Current ratings across different time controls
              </p>
              <RatingCards platform="chess.com" />
              <h4 className="text-xl font-semibold mb-4 text-center mt-8">30-Day Rating History</h4>
              <ChessChart />
            </div>
          )}

          {activeTab === 'lichess' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Lichess Rating Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Current ratings across different time controls
              </p>
              <RatingCards platform="lichess" />
              <h4 className="text-xl font-semibold mb-4 text-center mt-8">30-Day Rating History</h4>
              <LichessChart />
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Clash of Clans */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    Clash of Clans
                  </h3>
                  <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                    {achievementsData.coc.highestLeague}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Player Tag */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Player Tag</div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-sm">{achievementsData.coc.playerTag}</code>
                      <button
                        onClick={() => copyToClipboard(achievementsData.coc.playerTag, 'coc')}
                        className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      >
                        {copiedTag === 'coc' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
                    <div className="text-xs opacity-90 mb-2">Achievements</div>
                    <ul className="space-y-1 text-sm">
                      {achievementsData.coc.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Verify Button */}
                  <a
                    href={achievementsData.coc.verifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    Open Profile →
                  </a>
                </div>
              </div>

              {/* Clash Royale */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Clash Royale
                  </h3>
                  <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold">
                    {achievementsData.cr.highestLeague}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Player Tag */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Player Tag</div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-sm">{achievementsData.cr.playerTag}</code>
                      <button
                        onClick={() => copyToClipboard(achievementsData.cr.playerTag, 'cr')}
                        className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      >
                        {copiedTag === 'cr' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4">
                    <div className="text-xs opacity-90 mb-2">Achievements</div>
                    <ul className="space-y-1 text-sm">
                      {achievementsData.cr.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Verify Button */}
                  <a
                    href={achievementsData.cr.verifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    Add as Friend →
                  </a>
                </div>
              </div>

              {/* PUBG */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    PUBG Mobile
                  </h3>
                  <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-semibold">
                    {achievementsData.pubg.highestTier}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Player ID */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Player ID</div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-sm">{achievementsData.pubg.playerId}</code>
                      <button
                        onClick={() => copyToClipboard(achievementsData.pubg.playerId, 'pubg')}
                        className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      >
                        {copiedTag === 'pubg' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4">
                    <div className="text-xs opacity-90 mb-2">Achievements</div>
                    <ul className="space-y-1 text-sm">
                      {achievementsData.pubg.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="mt-8">
              <AchievementsSlider
                images={[
                  ...achievementsData.coc.screenshots,
                  ...achievementsData.cr.screenshots,
                  ...achievementsData.pubg.screenshots,
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
