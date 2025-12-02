'use client';

import { useState } from 'react';
import ChessChart from './charts/ChessChart';
import LichessChart from './charts/LichessChart';
import RatingCards from './charts/RatingCards';

type HobbyTab = 'chesscom' | 'lichess' | 'coc' | 'cr';

export default function Hobbies() {
  const [activeTab, setActiveTab] = useState<HobbyTab>('chesscom');

  const tabs = [
    { id: 'chesscom' as HobbyTab, label: 'Chess.com' },
    { id: 'lichess' as HobbyTab, label: 'Lichess' },
    { id: 'coc' as HobbyTab, label: 'Clash of Clans' },
    { id: 'cr' as HobbyTab, label: 'Clash Royale' },
  ];

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

          {activeTab === 'coc' && (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold mb-4">Clash of Clans</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon - tracking for Clash of Clans stats
              </p>
            </div>
          )}

          {activeTab === 'cr' && (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold mb-4">Clash Royale</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon - tracking for Clash Royale stats
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
