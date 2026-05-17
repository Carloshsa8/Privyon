export const styles = {
  container: "flex flex-col h-full bg-background text-on-surface font-body selection:bg-secondary-container relative overflow-hidden",
  
  // Header
  header: "bg-surface/80 backdrop-blur-md w-full border-b border-outline-variant/30 sticky top-0 z-50",
  headerContent: "flex justify-between items-center px-6 py-4 max-w-5xl mx-auto",
  headerTitle: "font-display text-[2rem] md:text-[3rem] text-on-surface",
  
  // Steps
  stepContainer: "flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-20",
  
  // Step 0: Question
  questionLabel: "font-body text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60 mb-4",
  question: "font-display text-[3.5rem] md:text-[6rem] text-center mb-16 tracking-tighter leading-none giant-number-shadow",
  choiceGroup: "flex flex-col gap-6 w-full max-w-[280px]",
  choiceButton: "w-full py-5 rounded-full border border-outline-variant/50 bg-transparent text-[0.7rem] font-bold tracking-[0.4em] uppercase transition-all duration-500 hover:bg-inverse-surface hover:text-surface hover:border-inverse-surface active:scale-[0.96]",
  
  // Step 1: Wheel Picker
  pickerLabel: "font-body text-[10px] font-bold uppercase tracking-[0.4em] text-secondary/60 mb-2",
  wheelWrapper: "relative w-full max-w-lg h-[400px] flex items-center justify-center overflow-hidden wheel-mask",
  wheelContent: "flex flex-col items-center select-none relative z-20",
  wheelItemInactive: "opacity-20 scale-75 transform perspective-[800px] transition-all duration-500",
  wheelItemActive: "relative py-4 flex items-center justify-center transform perspective-[1000px] scale-110",
  wheelNumber: "font-display text-[100px] md:text-[160px] text-on-surface giant-number-shadow tracking-tighter",
  wheelMonth: "font-display text-[60px] md:text-[100px] text-on-surface giant-number-shadow tracking-tighter",
  wheelVerticalRule: "absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-outline-variant/20 to-transparent z-10",
  
  // Bottom Action
  actionArea: "flex flex-col items-center gap-12 mt-8",
  fabButton: "w-20 h-20 bg-inverse-surface text-surface rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300",
  backButton: "flex items-center gap-3 px-8 py-3 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container transition-colors",
  
  // Result
  resultIcon: "w-24 h-24 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center mb-10 text-on-surface shadow-sm",
  resultStatus: "font-display text-[4rem] md:text-[6rem] mb-6 tracking-tighter giant-number-shadow",
  resultDetail: "font-body text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60 max-w-[240px] leading-relaxed",
  
  // Navigation Bar (Discreet)
  navBar: "fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30",
  navContent: "flex justify-around items-center px-4 py-3 w-full max-w-5xl mx-auto",
  navItem: "flex flex-col items-center justify-center p-2 text-on-surface-variant/60 hover:text-primary transition-all active:scale-95",
  navItemActive: "bg-secondary-container/50 text-on-secondary-container rounded-xl px-4 py-2"
};
