import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getDaysInMonth, setMonth, setYear, getDate, differenceInCalendarDays, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Check, Moon, Sun, Menu, HelpCircle, Calendar, Clock, Settings, X, Palette, Monitor, ChevronRight, Zap, Search } from 'lucide-react';
import { trabalhaNoDiaMinhAgenda } from '../utils/MinhAgendaUtil';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// --- Types ---
type ThemeType = 'AESTHETIC' | 'EDITORIAL';
type AppearanceMode = 'light' | 'dark';

// --- Sub-components ---

const MinhAgendaWheelPicker: React.FC<{
  items: (number | string)[],
  selected: number | string,
  onSelect: (val: any) => void,
  isMonth?: boolean,
  isYear?: boolean,
  onItemClick?: (val: any) => void
}> = ({ items, selected, onSelect, isMonth, isYear, onItemClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 100;
  const isInit = useRef(false);
  const isUserScrolling = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInit.current && isReady) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        if (navigator.vibrate) navigator.vibrate(5);
      });
    }
  }, [selected, isReady]);

  useEffect(() => {
    const index = items.indexOf(selected);
    if (index === -1) return;
    const targetY = index * itemHeight;

    const timers = [50, 150, 300, 500].map(delay => 
      setTimeout(() => {
        if (scrollRef.current && !isUserScrolling.current) {
          scrollRef.current.scrollTop = targetY;
          if (delay === 300) {
            setIsReady(true);
            isInit.current = true;
          }
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [selected, items]);

  useEffect(() => {
    if (isReady && scrollRef.current && !isUserScrolling.current) {
      const index = items.indexOf(selected);
      if (index !== -1) {
        scrollRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
      }
    }
  }, [selected, items, isReady]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isReady || !isInit.current) return;
    isUserScrolling.current = true;
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const offset = Math.abs(scrollTop - index * itemHeight);
    if (items[index] !== undefined && items[index] !== selected && offset < 15) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => { onSelect(items[index]); }, 30);
    }
    const timer = setTimeout(() => { isUserScrolling.current = false; }, 150);
    return () => clearTimeout(timer);
  };

  return (
    <div className={`relative w-full max-w-xl h-[300px] flex items-center justify-center overflow-hidden wheel-mask perspective-1000 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-x-0 h-[100px] top-[100px] pointer-events-none z-10">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-current to-transparent opacity-30" />
      </div>
      <div 
        ref={scrollRef} onScroll={handleScroll} 
        className={`w-full h-full overflow-y-auto no-scrollbar z-20 overscroll-contain py-[100px] ${isReady ? 'snap-y snap-mandatory' : ''}`}
        style={{ scrollBehavior: isReady ? 'smooth' : 'auto', scrollSnapStop: 'always' }}
      >
        {items.map((item, i) => {
          const isActive = selected === item;
          const selectedIndexInArray = items.indexOf(selected);
          const distance = Math.abs(i - selectedIndexInArray);
          const rotateX = (i - selectedIndexInArray) * 25; 
          const opacity = Math.max(0.1, 1 - distance * 0.35);
          const scale = Math.max(0.7, 1 - distance * 0.1);
          return (
            <div key={`${item}-${i}`} className={`h-[100px] flex items-center justify-center cursor-pointer preserve-3d ${isReady ? 'snap-center snap-always' : ''}`} onClick={() => { if (onItemClick) { onItemClick(item); } else { isUserScrolling.current = false; onSelect(item); } }}>
              <motion.span animate={{ rotateX, opacity, scale }} transition={{ type: "spring", stiffness: 150, damping: 25 }} className={`font-display text-center block w-full px-4 giant-number-shadow leading-none ${isActive ? `font-normal ${isMonth ? "text-[54px] md:text-[80px]" : isYear ? "text-[100px] md:text-[140px] tracking-tight" : "text-[120px] md:text-[160px] tracking-tighter"}` : `font-normal ${isMonth ? "text-[40px] md:text-[50px]" : "text-[70px] md:text-[90px]"}`}`}>{item}</motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MinhAgendaScreen: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('minhagenda-theme') as ThemeType) || 'EDITORIAL');
  const [appearance, setAppearance] = useState<AppearanceMode>(() => (localStorage.getItem('minhagenda-appearance') as AppearanceMode) || 'light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [trabalhaHoje, setTrabalhaHoje] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [pickerMode, setPickerMode] = useState<'day' | 'month' | 'year'>('day');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => format(setMonth(new Date(), i), 'MMMM', { locale: ptBR }));
  const currentYearToday = startOfToday().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearToday - 5 + i);
  const allYears = Array.from({ length: 201 }, (_, i) => 1900 + i);

  useEffect(() => { localStorage.setItem('minhagenda-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('minhagenda-appearance', appearance); }, [appearance]);
  useEffect(() => { setSelectedDate(startOfToday()); }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSettingsOpen(false); setIsYearModalOpen(false); setIsThemeMenuOpen(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDateChange = (newDate: Date) => {
    const maxDays = getDaysInMonth(newDate);
    let finalDate = new Date(newDate);
    if (finalDate.getDate() > maxDays) finalDate.setDate(maxDays);
    if (finalDate.getFullYear() < 1900) finalDate.setFullYear(1900);
    if (finalDate.getFullYear() > 2100) finalDate.setFullYear(2100);
    setSelectedDate(finalDate);
  };

  const checkStatus = () => (trabalhaHoje === null ? false : trabalhaNoDiaMinhAgenda(startOfToday(), trabalhaHoje, selectedDate));
  const reset = () => { setStep(0); setPickerMode('day'); setTrabalhaHoje(null); setSelectedDate(startOfToday()); };

  const dayScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  // Precision Alignment Sync for Aesthetic theme
  useEffect(() => {
    if (step === 1 && theme === 'AESTHETIC') {
      const syncPicker = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return;
        const activeItem = ref.current.querySelector('[data-active="true"]') as HTMLElement;
        if (activeItem) {
          const scrollContainer = ref.current;
          const targetX = activeItem.offsetLeft - scrollContainer.offsetWidth / 2 + activeItem.offsetWidth / 2;
          scrollContainer.scrollTo({ left: targetX, behavior: 'auto' });
        }
      };
      
      const performSync = () => {
        syncPicker(dayScrollRef);
        syncPicker(monthScrollRef);
        syncPicker(yearScrollRef);
      };

      performSync();
      const timers = [50, 150, 300, 500].map(delay => setTimeout(performSync, delay));
      return () => timers.forEach(clearTimeout);
    }
  }, [step, theme, selectedDate]);

  const renderAesthetic = () => (
    <div className={`flex-1 flex flex-col items-center justify-center font-aes-body ${appearance === 'dark' ? 'bg-[#1C1C16] text-[#F9F7F2]' : 'bg-[#F9F7F2] text-[#2C332C]'} px-0 relative overflow-hidden transition-colors duration-500`}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="aes0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center px-8">
            <h1 className="text-4xl md:text-7xl font-titillium font-light text-center mb-16 leading-tight tracking-tight">Trabalha hoje?</h1>
            <div className="flex flex-col gap-6 w-full max-w-[280px]">
              <button onClick={() => { setTrabalhaHoje(true); setStep(1); }} className={`w-full py-6 rounded-full border ${appearance === 'dark' ? 'border-white/10 hover:bg-[#F9F7F2] hover:text-[#1C1C16]' : 'border-[#2C332C]/10 hover:bg-[#2C332C] hover:text-[#F9F7F2]'} bg-transparent text-[0.7rem] font-bold tracking-[0.4em] uppercase transition-all duration-500`}>Sim</button>
              <button onClick={() => { setTrabalhaHoje(false); setStep(1); }} className={`w-full py-6 rounded-full border ${appearance === 'dark' ? 'border-white/10 hover:bg-[#F9F7F2] hover:text-[#1C1C16]' : 'border-[#2C332C]/10 hover:bg-[#2C332C] hover:text-[#F9F7F2]'} bg-transparent text-[0.7rem] font-bold tracking-[0.4em] uppercase transition-all duration-500`}>Não</button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="aes1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center w-full">
            <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-12">Escolha a data</span>
            <div className="flex flex-col items-center gap-12 w-full">
              <div ref={dayScrollRef} className="w-full overflow-x-auto no-scrollbar snap-x py-4 flex items-center gap-4 wheel-mask" style={{ paddingLeft: '50%', paddingRight: '50%' }}>
                {days.map(d => (
                  <button key={d} data-active={selectedDate.getDate() === d} onClick={() => { const nd = new Date(selectedDate); nd.setDate(d); handleDateChange(nd); }} className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full text-xl transition-all snap-center ${selectedDate.getDate() === d ? (appearance === 'dark' ? 'bg-[#F9F7F2] text-[#1C1C16]' : 'bg-[#2C332C] text-[#F9F7F2]') + ' font-bold scale-110 shadow-lg' : 'opacity-40'}`}>{d}</button>
                ))}
              </div>
              <div className="w-px h-12 bg-current opacity-10" />
              <div ref={monthScrollRef} className="w-full overflow-x-auto no-scrollbar snap-x py-4 flex items-center gap-10 wheel-mask" style={{ paddingLeft: '50%', paddingRight: '50%' }}>
                {months.map((m, i) => (
                  <button key={m} data-active={selectedDate.getMonth() === i} onClick={() => { const nd = new Date(selectedDate); nd.setMonth(i); handleDateChange(nd); }} className={`flex-shrink-0 text-[0.7rem] font-bold uppercase tracking-[0.3em] transition-all snap-center whitespace-nowrap ${selectedDate.getMonth() === i ? 'border-b-2 border-[#B6D7A8] pb-1' : 'opacity-40'}`}>{m}</button>
                ))}
              </div>
              <div ref={yearScrollRef} className="w-full overflow-x-auto no-scrollbar snap-x py-4 flex items-center gap-10 wheel-mask" style={{ paddingLeft: '50%', paddingRight: '50%' }}>
                {years.map(y => {
                  const isActive = selectedDate.getFullYear() === y;
                  return (
                    <button
                      key={y}
                      data-active={isActive}
                      onClick={() => {
                        if (isActive) {
                          setIsYearModalOpen(true);
                        } else {
                          const nd = new Date(selectedDate);
                          nd.setFullYear(y);
                          handleDateChange(nd);
                        }
                      }}
                      className={`flex-shrink-0 text-[0.8rem] font-bold tracking-tighter transition-all snap-center ${isActive ? 'scale-125 opacity-100' : 'opacity-20'}`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={() => setStep(2)} className={`mt-20 w-16 h-16 rounded-full ${appearance === 'dark' ? 'bg-[#F9F7F2] text-[#1C1C16]' : 'bg-[#2C332C] text-[#F9F7F2]'} flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all`}><Check size={28} /></button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="aes2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center px-8">
            <div className={`w-24 h-24 rounded-full ${appearance === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-[#2C332C]/10'} border flex items-center justify-center mb-10 shadow-sm`}>{checkStatus() ? <Clock size={32} /> : <Calendar size={32} />}</div>
            <h2 className="text-6xl font-aes-display mb-6">{checkStatus() ? 'Plantão' : 'Folga'}</h2>
            <p className="opacity-40 text-[10px] font-bold uppercase tracking-[0.3em] mb-16">{format(selectedDate, "dd 'DE' MMMM", { locale: ptBR })}</p>
            <button onClick={reset} className="mt-8 text-[0.6rem] font-bold uppercase tracking-[0.4em] text-[#B6D7A8] border-b border-[#B6D7A8] pb-1 hover:opacity-70 transition-opacity">Recomeçar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderEditorial = () => (
    <div className={`flex-1 flex flex-col items-center ${appearance === 'dark' ? 'bg-[#1c1c16] text-[#fdf9f0]' : 'bg-[#fdf9f0] text-[#1c1c16]'} font-body overflow-hidden relative transition-colors duration-500`}>
      <div className="paper-texture" />
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="sinc0" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-6">CONSULTA</span>
            <h1 className="font-titillium font-light text-[4rem] md:text-[6.5rem] text-center mb-20 tracking-tighter leading-[0.9] giant-number-shadow">Trabalha<br/>hoje?</h1>
            <div className="flex flex-col gap-6 w-full max-w-[300px]">
              <button onClick={() => { setTrabalhaHoje(true); setStep(1); }} className={`w-full py-6 rounded-full border ${appearance === 'dark' ? 'border-white/10 hover:bg-[#fdf9f0] hover:text-[#1c1c16]' : 'border-[#1c1c16]/10 hover:bg-[#1c1c16] hover:text-[#fdf9f0]'} bg-transparent text-[0.75rem] font-bold tracking-[0.5em] uppercase transition-all duration-500`}>Sim</button>
              <button onClick={() => { setTrabalhaHoje(false); setStep(1); }} className={`w-full py-6 rounded-full border ${appearance === 'dark' ? 'border-white/10 hover:bg-[#fdf9f0] hover:text-[#1c1c16]' : 'border-[#1c1c16]/10 hover:bg-[#1c1c16] hover:text-[#fdf9f0]'} bg-transparent text-[0.75rem] font-bold tracking-[0.5em] uppercase transition-all duration-500`}>Não</button>
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="sinc1" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-1 flex flex-col items-center justify-center px-gutter py-4 relative z-20 w-full">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-4">{pickerMode === 'day' ? 'DIA' : pickerMode === 'month' ? 'MÊS' : 'ANO'}</span>
            <div className="h-[1px] w-12 bg-current opacity-20 mb-8" />
            {pickerMode === 'day' && <MinhAgendaWheelPicker items={days} selected={selectedDate.getDate()} onSelect={(d) => { const nd = new Date(selectedDate); nd.setDate(d); handleDateChange(nd); }} />}
            {pickerMode === 'month' && <MinhAgendaWheelPicker isMonth items={months} selected={format(selectedDate, 'MMMM', { locale: ptBR })} onSelect={(m) => { const nd = new Date(selectedDate); nd.setMonth(months.indexOf(m)); handleDateChange(nd); }} />}
            {pickerMode === 'year' && <MinhAgendaWheelPicker isYear items={years} selected={selectedDate.getFullYear()} onSelect={(y) => { const nd = new Date(selectedDate); nd.setFullYear(y); handleDateChange(nd); }} onItemClick={() => setIsYearModalOpen(true)} />}
            <div className="flex flex-col items-center gap-12 mt-10">
              <button onClick={() => { if (pickerMode === 'day') setPickerMode('month'); else if (pickerMode === 'month') setPickerMode('year'); else setStep(2); }} className={`w-20 h-20 ${appearance === 'dark' ? 'bg-[#fdf9f0] text-[#1c1c16]' : 'bg-[#1c1c16] text-[#fdf9f0]'} rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all`}><Check size={36} /></button>
              <button onClick={() => { if (pickerMode === 'day') setStep(0); else setPickerMode(pickerMode === 'month' ? 'day' : 'month'); }} className="flex items-center gap-4 px-10 py-3 rounded-full border border-current opacity-20 hover:opacity-100 transition-all"><ArrowLeft size={14} /><span className="text-[10px] font-bold tracking-[0.3em]">VOLTAR</span></button>
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="sinc2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-20">
            <div className={`w-28 h-28 rounded-full ${appearance === 'dark' ? 'bg-white/5' : 'bg-white'} border border-current opacity-20 flex items-center justify-center mb-12 shadow-sm`}>{checkStatus() ? <Clock size={48} /> : <Calendar size={48} />}</div>
            <h2 className="font-display font-medium text-[4.5rem] md:text-[7.5rem] mb-6 tracking-tighter leading-none giant-number-shadow">{checkStatus() ? 'Plantão' : 'Folga'}</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40 text-center">{format(selectedDate, "dd 'DE' MMMM 'DE' yyyy", { locale: ptBR })}</p>
            <button onClick={reset} className="mt-24 px-10 py-4 rounded-full border border-current opacity-20 hover:opacity-100 text-[10px] font-bold tracking-[0.5em] uppercase transition-all">Recomeçar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden ${appearance === 'dark' ? 'dark text-[#F9F7F2]' : 'text-[#1c1c16]'} font-body`}>
      <header className={`w-full sticky top-0 z-[60] transition-colors duration-500 ${appearance === 'dark' ? 'bg-[#1c1c16]' : 'bg-[#fdf9f0]'}`}>
        <div className="flex justify-between items-center px-6 py-5 max-w-5xl mx-auto w-full">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-black/5 transition-colors"><Settings size={22} /></button>
          <h1 className={`text-[1.8rem] md:text-[2.2rem] font-titillium font-light text-center flex-1 tracking-tight`}>MinhAgenda</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-black/5 transition-colors">{appearance === 'light' ? <Moon size={22} /> : <Sun size={22} />}</button>
            <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className="p-2 rounded-full hover:bg-black/5 transition-colors"><Palette size={22} /></button>
          </div>
        </div>
      </header>
      {theme === 'AESTHETIC' ? renderAesthetic() : renderEditorial()}
      <AnimatePresence>
        {isThemeMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`fixed top-[82px] right-6 w-[220px] rounded-[30px] shadow-3xl z-[70] p-5 border ${appearance === 'dark' ? 'bg-[#2a2a22] border-white/10' : 'bg-white border-[#c7c7bf]/30'}`}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-4 px-2">Estilos</h3>
            <button onClick={() => { setTheme('AESTHETIC'); setIsThemeMenuOpen(false); }} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${theme === 'AESTHETIC' ? 'bg-[#B6D7A8]/20 text-[#7bb166]' : 'hover:bg-black/5 opacity-60'}`}><span className="text-xs font-bold uppercase tracking-wider">Minimalista</span>{theme === 'AESTHETIC' && <Check size={16} />}</button>
            <button onClick={() => { setTheme('EDITORIAL'); setIsThemeMenuOpen(false); }} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all mt-2 ${theme === 'EDITORIAL' ? 'bg-[#B6D7A8]/20 text-[#7bb166]' : 'hover:bg-black/5 opacity-60'}`}><span className="text-xs font-bold uppercase tracking-wider">Editorial</span>{theme === 'EDITORIAL' && <Check size={16} />}</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(isSettingsOpen || isYearModalOpen) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed inset-0 z-[100] ${appearance === 'dark' ? 'bg-[#1c1c16] text-[#F9F7F2]' : 'bg-[#fdf9f0] text-[#1c1c16]'} flex flex-col p-8 overflow-y-auto transition-colors font-body`}>
            <div className="flex justify-between items-center mb-16 max-w-5xl mx-auto w-full">
              <h2 className="text-xs font-black uppercase tracking-[0.5em]">{isYearModalOpen ? 'Escolher Ano' : 'Configurações'}</h2>
              <button onClick={() => { setIsSettingsOpen(false); setIsYearModalOpen(false); }} className="p-4 rounded-full hover:bg-black/5 transition-all"><X size={28} /></button>
            </div>
            <div className="max-w-2xl mx-auto w-full space-y-16">
              {isYearModalOpen ? (
                <section className="pb-12">
                  <div className="flex items-center gap-4 mb-10"><Calendar className="opacity-40" size={24} /><h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">SÉCULOS 1900 - 2100</h3></div>
                  <div className={`p-8 rounded-[50px] border ${appearance === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-[#c7c7bf]/30 shadow-xl'}`}>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3 h-[60vh] overflow-y-auto no-scrollbar pr-2 py-2">
                      {allYears.map(y => (
                        <button key={y} onClick={() => { const nd = new Date(selectedDate); nd.setFullYear(y); handleDateChange(nd); setIsYearModalOpen(false); if (trabalhaHoje !== null) setStep(2); }} className={`p-4 rounded-2xl text-sm font-bold transition-all ${selectedDate.getFullYear() === y ? 'bg-[#B6D7A8] text-white shadow-lg scale-110' : 'hover:bg-black/5 opacity-50'}`}>{y}</button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  <section>
                    <div className="flex items-center gap-4 mb-8"><Monitor className="opacity-40" size={24} /><h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">Aparência</h3></div>
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => setAppearance('light')} className={`p-8 rounded-[40px] border-2 transition-all flex flex-col gap-6 ${appearance === 'light' ? 'border-[#B6D7A8] bg-[#B6D7A8]/5' : (appearance === 'dark' ? 'border-white/5' : 'border-black/5') + ' opacity-40 hover:opacity-100'}`}><Sun size={36} /><div><p className="text-sm font-bold uppercase tracking-tight">Modo Claro</p><p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Brilhante</p></div></button>
                      <button onClick={() => setAppearance('dark')} className={`p-8 rounded-[40px] border-2 transition-all flex flex-col gap-6 ${appearance === 'dark' ? 'border-[#B6D7A8] bg-[#B6D7A8]/5' : (appearance === 'light' ? 'border-black/5' : 'border-white/5') + ' opacity-40 hover:opacity-100'}`}><Moon size={36} /><div><p className="text-sm font-bold uppercase tracking-tight">Modo Escuro</p><p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Noturno</p></div></button>
                    </div>
                  </section>
                  <section>
                    <div className="flex items-center gap-4 mb-8"><Search className="opacity-40" size={24} /><h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">Explorar Séculos</h3></div>
                    <button onClick={() => setIsYearModalOpen(true)} className={`w-full p-10 rounded-[40px] border border-dashed flex items-center justify-between ${appearance === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} transition-all`}><span className="text-xs font-bold uppercase tracking-widest opacity-60">Abrir Seletor Completo</span><ChevronRight size={20} className="opacity-40" /></button>
                  </section>
                </>
              )}
              <div className="pt-12 flex flex-col items-center gap-6">
                <div className="w-16 h-1 bg-[#B6D7A8]/30 rounded-full" /><p className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-20 text-center">MinhAgenda Premium v1.3</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinhAgendaScreen;
