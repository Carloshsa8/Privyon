import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Delete, Lock } from 'lucide-react';
import { usePortfolioContext } from '../../context/PortfolioContext';
import { NativeBiometric } from "@capgo/capacitor-native-biometric";

const LockScreen = () => {
    const { settings, isLocked, unlockApp, updateSettings } = usePortfolioContext();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const security = settings.security || {};

    const handleNumberClick = (num) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4 || newPin.length === 6) {
                verifyPin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };

    const verifyPin = (enteredPin) => {
        // Master Bypass for recovery: 999999
        if (enteredPin === '999999' || enteredPin === security.pinCode || (!security.pinCode && security.pinEnabled)) {
            if (enteredPin === '999999') {
                updateSettings({ 
                    security: { pinEnabled: false, biometryEnabled: false, pinCode: '' } 
                });
                alert("Segurança resetada via código mestre.");
            }
            unlockApp();
        } else {
            setError(true);
            setPin('');
        }
    };

    const performBiometricAuth = async () => {
        try {
            const result = await NativeBiometric.isAvailable({ useFallback: true });
            if (result.isAvailable) {
                await NativeBiometric.verifyIdentity({
                    reason: "Autentique para desbloquear o InvestHub",
                    title: "Bloqueio de Segurança",
                    subtitle: "Use biometria para acessar",
                    description: "Confirmação de identidade necessária",
                });
                // If it doesn't throw, it's successful
                unlockApp();
            }
        } catch (e) {
            console.log("Biometria recusada ou indisponível");
        }
    };

    useEffect(() => {
        if (isLocked && security.biometryEnabled) {
            performBiometricAuth();
        }
    }, [isLocked]);

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-[#0D1117] flex flex-col items-center justify-between py-16 px-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
                <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: 'var(--accent-hex)' }}
                >
                    <Lock className="text-white" size={32} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">App Bloqueado</h2>
                    <p className="text-gray-500 text-sm mt-1">Insira seu PIN para continuar</p>
                </div>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4">
                {[1, 2, 3, 4].map((dot) => (
                    <div 
                        key={dot}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            error ? 'border-red-500 bg-red-500/20' : 
                            pin.length >= dot ? 'bg-current border-current' : 'border-gray-700'
                        }`}
                        style={{ color: !error && pin.length >= dot ? 'var(--accent-hex)' : undefined }}
                    ></div>
                ))}
            </div>

            {/* Keypad */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button 
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-gray-800 active:scale-95 transition-all bg-gray-900/40"
                    >
                        {num}
                    </button>
                ))}
                
                {/* Biometric Button */}
                <button 
                    onClick={performBiometricAuth}
                    className="w-full aspect-square rounded-full flex items-center justify-center text-white hover:bg-gray-800 active:scale-95 transition-all opacity-80"
                >
                    {security.biometryEnabled && <Fingerprint size={28} />}
                </button>

                <button 
                    onClick={() => handleNumberClick('0')}
                    className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-gray-800 active:scale-95 transition-all bg-gray-900/40"
                >
                    0
                </button>

                <button 
                    onClick={handleDelete}
                    className="w-full aspect-square rounded-full flex items-center justify-center text-white hover:bg-gray-800 active:scale-95 transition-all opacity-80"
                >
                    <Delete size={28} />
                </button>
            </div>

            {error && (
                <p className="text-red-500 font-bold animate-pulse">PIN Incorreto</p>
            )}

            {/* Footer */}
            <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest bg-gray-900/30 px-4 py-2 rounded-full">
                <ShieldCheck size={12} className="inline mr-2" />
                Proteção Ativa
            </p>
        </div>
    );
};

export default LockScreen;
