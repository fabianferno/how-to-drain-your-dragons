"use client";

import { useEffect, useRef, useState } from "react";
import FireDragon from "@/components/dragons/FireDragon";
import WaterDragon from "@/components/dragons/WaterDragon";
import AirDragon from "@/components/dragons/AirDragon";
import AetherDragon from "@/components/dragons/AetherDragon";
import EarthDragon from "@/components/dragons/EarthDragon";

export default function Home() {
    const gameRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameLoaded, setGameLoaded] = useState(false);
    const [gameError, setGameError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Set client flag to prevent SSR issues
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Only run on client side to avoid SSR issues
        if (isClient && canvasRef.current && !gameRef.current) {
            try {
                // Dynamic import to ensure Excalibur only loads on client
                import('../game/DragonBattleGame').then(({ DragonBattleGame }) => {
                    const game = new DragonBattleGame();
                    gameRef.current = game;

                    // Start the game
                    game.start().then(() => {
                        setGameLoaded(true);
                    }).catch((error) => {
                        console.error('Failed to start game:', error);
                        setGameError('Failed to start game. Please refresh the page.');
                    });
                }).catch((error) => {
                    console.error('Failed to load game module:', error);
                    setGameError('Failed to load game. Please refresh the page.');
                });

                return () => {
                    if (gameRef.current) {
                        gameRef.current.stop();
                    }
                };
            } catch (error) {
                console.error('Failed to initialize game:', error);
                setGameError('Failed to initialize game. Please refresh the page.');
            }
        }
    }, [isClient]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center">
            {/* Header Section */}
            <div className="text-center p-8 bg-black/20 backdrop-blur-lg rounded-3xl m-6 border border-white/10 shadow-2xl">
                <h1 className="font-cinzel-decorative text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl tracking-wider">
                    How to Drain Your Dragon
                </h1>
                <h2 className="font-cinzel text-lg md:text-2xl font-bold text-amber-300 mb-6 tracking-wide">
                    (Too)
                </h2>
                <p className="font-cormorant text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto font-medium">
                    A multiplayer dragon battle game with commit-reveal mechanics
                </p>
                <div className="flex flex-wrap justify-center gap-4 items-center">
                    <FireDragon direction="side-l" />
                    <WaterDragon direction="side-l" />
                    <AirDragon direction="side-l" />
                    <AetherDragon direction="side-l" />
                    <EarthDragon direction="side-l" />
                </div>
            </div>

            {/* Game Container */}
            <div className="relative my-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {!isClient ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="font-cinzel text-lg font-semibold tracking-wide">Initializing Dragon Battle Game...</p>
                        </div>
                    </div>
                ) : gameError ? (
                    <div className="p-8 bg-red-900/20 border-2 border-red-500/50 rounded-2xl text-center backdrop-blur-sm">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <p className="font-cormorant text-lg mb-4 font-medium">{gameError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="font-cinzel px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg tracking-wide"
                        >
                            Refresh Page
                        </button>
                    </div>
                ) : (
                    <>
                        <canvas
                            id="game-canvas"
                            ref={canvasRef}
                            width={1200}
                            height={800}
                            className="block border-2 border-white/20 rounded-2xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 max-w-full h-auto"
                        />
                        {!gameLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                                <div className="text-center p-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="font-cinzel text-lg font-semibold tracking-wide">Loading Dragon Battle Game...</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Instructions Section */}
            <div className="max-w-6xl mx-6 mb-8 p-8 bg-black/20 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent tracking-wide">
                    How to Play
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="text-3xl mb-4">🐉</div>
                        <h3 className="font-cinzel text-xl font-semibold mb-3 text-cyan-400 tracking-wide">1. Registration</h3>
                        <p className="font-cormorant text-gray-300 mb-4 leading-relaxed font-medium">Choose your name and select 3 dragons from different elements:</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                <span>🔥</span> <span className="font-cormorant font-medium">Fire - Strong against Air & Earth</span>
                            </li>
                            <li className="flex items-center gap-2 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <span>💧</span> <span className="font-cormorant font-medium">Water - Strong against Fire & Aether</span>
                            </li>
                            <li className="flex items-center gap-2 bg-gray-500/10 p-2 rounded-lg border border-gray-500/20">
                                <span>💨</span> <span className="font-cormorant font-medium">Air - Strong against Water & Earth</span>
                            </li>
                            <li className="flex items-center gap-2 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                <span>🌍</span> <span className="font-cormorant font-medium">Earth - Strong against Aether & Fire</span>
                            </li>
                            <li className="flex items-center gap-2 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                                <span>✨</span> <span className="font-cormorant font-medium">Aether - Strong against Air & Water</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="text-3xl mb-4">🏛️</div>
                        <h3 className="font-cinzel text-xl font-semibold mb-3 text-cyan-400 tracking-wide">2. Lobby & Challenges</h3>
                        <p className="font-cormorant text-gray-300 leading-relaxed font-medium">
                            Wait in the lobby and challenge other players to battles. Check the leaderboard to see top players!
                        </p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="text-3xl mb-4">⚔️</div>
                        <h3 className="font-cinzel text-xl font-semibold mb-3 text-cyan-400 tracking-wide">3. Battle System</h3>
                        <p className="font-cormorant text-gray-300 mb-4 leading-relaxed font-medium">Each battle consists of 2 duels:</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                                <span className="font-cinzel font-bold text-orange-400 text-xs tracking-wider">COMMIT:</span>
                                <span className="font-cormorant text-gray-300 font-medium">Secret dragon selection</span>
                            </li>
                            <li className="flex items-start gap-2 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                <span className="font-cinzel font-bold text-green-400 text-xs tracking-wider">REVEAL:</span>
                                <span className="font-cormorant text-gray-300 font-medium">Prove your commitment</span>
                            </li>
                            <li className="flex items-start gap-2 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <span className="font-cinzel font-bold text-blue-400 text-xs tracking-wider">RESOLVE:</span>
                                <span className="font-cormorant text-gray-300 font-medium">Winner by effectiveness</span>
                            </li>
                        </ul>
                        <p className="font-cormorant text-xs text-gray-400 mt-3 italic font-medium">
                            Losing dragons cannot be used in the next duel!
                        </p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="text-3xl mb-4">🏆</div>
                        <h3 className="font-cinzel text-xl font-semibold mb-3 text-cyan-400 tracking-wide">4. Victory</h3>
                        <p className="font-cormorant text-gray-300 leading-relaxed font-medium">
                            The player with the most dragons remaining wins the battle and gains points!
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-6 text-center text-gray-400">
                <p className="font-cormorant text-sm font-medium tracking-wide">
                    Built with ❤️ using Excalibur.js and Next.js for the ZK Hackathon
                </p>
            </div>
        </main>
    );
}
