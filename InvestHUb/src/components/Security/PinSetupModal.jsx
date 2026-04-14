import React, { useState, useEffect } from 'react';
import { ShieldCheck, Delete, X, ArrowLeft } from 'lucide-react';

const PinSetupModal = ({ isOpen, onClose, onFinish }) => {
    const [step, setStep] = useState('ENTER'); // ENTER, CONFIRM
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('ENTER');
            setPin('');
            setConfirmPin('');
            setError(false);
        }
    }, [isOpen]);

    const handleNumberClick = (num) => {
        setError(false);
        if (step === 'ENTER') {
            if (pin.length < 4) {
                const newVal = pin + num;
                setPin(newVal);
                if (newVal.length === 4) {
                    setTimeout(() => setStep('CONFIRM'), 300);
                }
            }
        } else {
            if (confirmPin.length < 4) {
                const newVal = confirmPin + num;
                setConfirmPin(newVal);
                if (newVal.length === 4) {
                    if (newVal === pin) {
                        onFinish(newVal);
                    } else {
                        setTimeout(() => {
                            setError(true);
                            setConfirmPin('');
                        }, 300);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        if (step === 'ENTER') {
            setPin(pin.slice(0, -1));
        } else {
            setConfirmPin(confirmPin.slice(0, -1));
        }
        setError(false);
    };

    if (!isOpen) return null;

    const currentDisplayVal = step === 'ENTER' ? pin : confirmPin;

    return (
        <div className="fixed inset-0 z-[10000] bg-[#0D1117] flex flex-col items-center justify-between py-16 px-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="w-full max-w-xs flex justify-between items-center mb-8">
                {step === 'CONFIRM' ? (
                    <button onClick={() => { setStep('ENTER'); setConfirmPin(''); }} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                ) : <div className="w-6" />}
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500"
                    style={{ backgroundColor: 'var(--accent-hex)' }}
                >
                    <ShieldCheck className="text-white" size={32} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">
                        {step === 'ENTER' ? 'Defina seu PIN' : 'Confirme seu PIN'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 'ENTER' ? 'Escolha um código de 4 dígitos' : 'Digite novamente para confirmar'}
                    </p>
                </div>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4">
                {[1, 2, 3, 4].map((dot) => (
                    <div 
                        key={dot}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            error ? 'border-red-500 bg-red-500/20' : 
                            currentDisplayVal.length >= dot ? 'bg-current border-current' : 'border-gray-700'
                        }`}
                        style={{ color: !error && currentDisplayVal.length >= dot ? 'var(--accent-hex)' : undefined }}
                    ></div>
                ))}
            </div>

            {error && (
                <p className="text-red-500 font-bold animate-shake text-sm">Os códigos não coincidem. Tente novamente.</p>
            )}

            {/* Keypad */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-6 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button 
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-gray-800 active:scale-90 transition-all bg-gray-900/40"
                    >
                        {num}
                    </button>
                ))}
                
                <div />

                <button 
                    onClick={() => handleNumberClick('0')}
                    className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-gray-800 active:scale-90 transition-all bg-gray-900/40"
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

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                    animation-iteration-count: 2;
                }
            `}</style>
        </div>
    );
};

export default PinSetupModal;
