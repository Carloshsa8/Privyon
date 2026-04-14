import React, { useEffect, useState } from 'react';
import { LineChart } from 'lucide-react';
import { usePortfolioContext } from '../../context/PortfolioContext';
import { AppLogoIcon } from './AppLogo';

const SplashScreen = () => {
    const { settings, isAppReady, setIsAppReady } = usePortfolioContext();
    const [shouldFade, setShouldFade] = useState(false);

    useEffect(() => {
        // Fast opening: 1.5 seconds
        const timer = setTimeout(() => {
            setShouldFade(true);
            setTimeout(() => {
                setIsAppReady(true);
            }, 500); // Wait for fade animation
        }, 1500);

        return () => clearTimeout(timer);
    }, [setIsAppReady]);

    if (isAppReady) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D1117] transition-opacity duration-500 ease-in-out ${shouldFade ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative">
                {/* Pulsing Glow Background */}
                <div 
                    className="absolute inset-0 blur-3xl opacity-30 animate-pulse scale-150"
                    style={{ backgroundColor: 'var(--accent-hex)' }}
                ></div>
                
                {/* Logo Container */}
                <div 
                    className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-700"
                    style={{ backgroundColor: 'var(--accent-hex)' }}
                >
                    <AppLogoIcon size={48} className="text-white" />
                </div>
            </div>
            
            {/* App Name */}
            <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-1000">
                <h1 className="text-3xl font-extrabold tracking-tighter text-white">
                    Invest<span style={{ color: 'var(--accent-hex)' }}>Hub</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase mt-2 opacity-60">Sua Carteira Inteligente</p>
            </div>
            
            {/* Fast Loading Indicator */}
            <div className="absolute bottom-16 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full animate-progress"
                    style={{ backgroundColor: 'var(--accent-hex)' }}
                ></div>
            </div>

            <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 1.5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
