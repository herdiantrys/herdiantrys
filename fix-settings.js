const fs = require('fs');
const path = './components/Settings/SettingsClient.tsx';
let txt = fs.readFileSync(path, 'utf8');

// Header
txt = txt.replace(/text-foreground mb-2 drop-shadow-sm/g, 'text-slate-900 dark:text-white mb-2 drop-shadow-sm');
txt = txt.replace(/text-muted-foreground font-medium/g, 'text-slate-500 dark:text-gray-400 font-medium');

// Tabs
txt = txt.replace(/bg-black\/20 dark:bg-white\/5/g, 'bg-slate-100/50 dark:bg-white/5');
txt = txt.replace(/border-white\/10 mb-8 overflow-x-auto/g, 'border-slate-200/50 dark:border-white/10 mb-8 overflow-x-auto shadow-sm');
txt = txt.replace(/text-foreground"/g, 'text-slate-900 dark:text-white text-shadow-sm"');
txt = txt.replace(/text-muted-foreground hover:text-foreground/g, 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200');
txt = txt.replace(/bg-white\/10 dark:bg-white\/10 rounded-xl shadow-\[0_0_20px_rgba\(255,255,255,0\.05\)\] border border-white\/10/g, 'bg-white dark:bg-white/10 rounded-xl shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-200/50 dark:border-white/10 -z-10');

// Fix: add z-10 to the button text span so it sits above the background
txt = txt.replace(/<span className="relative z-10 uppercase tracking-widest text-\[10px\]">/g, '<span className="relative uppercase tracking-widest text-[10px]">');
txt = txt.replace(/relative font-bold text-sm whitespace-nowrap \$\{/, 'relative z-10 font-bold text-sm whitespace-nowrap ${');

// Cards
txt = txt.replace(/glass-liquid p-8 rounded-\[2\.5rem\] border border-white\/20 dark:border-white\/10 shadow-2xl/g, 'bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-2xl');

// Card Titles
txt = txt.replace(/text-xl font-black tracking-tight/g, 'text-xl font-black tracking-tight text-slate-900 dark:text-white');
txt = txt.replace(/text-sm text-muted-foreground/g, 'text-sm text-slate-500 dark:text-gray-400');

// Inputs
txt = txt.replace(/bg-black\/10 dark:bg-white\/5 border border-white\/10 rounded-2xl/g, 'bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl');
txt = txt.replace(/text-muted-foreground\/30/g, 'slate-400 dark:text-gray-600');
txt = txt.replace(/text-muted-foreground ml-1/g, 'text-slate-500 dark:text-gray-400 ml-1');
txt = txt.replace(/text-\[10px\] text-muted-foreground\/60 font-bold mt-1 ml-1/g, 'text-[10px] text-slate-400 dark:text-gray-500 font-bold mt-1 ml-1');
txt = txt.replace(/text-muted-foreground/g, 'text-slate-500 dark:text-gray-400');
txt = txt.replace(/text-sm font-bold opacity-50/g, 'text-sm font-bold text-slate-900 dark:text-white opacity-50');

// Buttons
txt = txt.replace(/bg-foreground text-background/g, 'bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20');

// Profile background
txt = txt.replace(/bg-teal-500\/5 blur-\[100px\] -z-10/g, 'bg-teal-500/20 dark:bg-teal-500/5 blur-[100px] -z-10');
txt = txt.replace(/bg-teal-500\/10 rounded-2xl text-teal-400/g, 'bg-teal-100 dark:bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400');

// Account background
txt = txt.replace(/bg-blue-500\/5 blur-\[100px\] -z-10/g, 'bg-blue-500/20 dark:bg-blue-500/5 blur-[100px] -z-10');
txt = txt.replace(/bg-blue-500\/10 rounded-2xl text-blue-400/g, 'bg-blue-100 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400');

// Interface background
txt = txt.replace(/bg-purple-500\/5 blur-\[100px\] -z-10/g, 'bg-purple-500/20 dark:bg-purple-500/5 blur-[100px] -z-10');
txt = txt.replace(/bg-purple-500\/10 rounded-2xl text-purple-400/g, 'bg-purple-100 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400');

// Notification background
txt = txt.replace(/bg-amber-500\/5 blur-\[100px\] -z-10/g, 'bg-amber-500/20 dark:bg-amber-500/5 blur-[100px] -z-10');
txt = txt.replace(/bg-amber-500\/10 rounded-2xl text-amber-400/g, 'bg-amber-100 dark:bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400');

// Interface options (Language buttons)
txt = txt.replace(/bg-black\/10 dark:bg-white\/5 border-white\/10 hover:border-white\/20/g, 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20');
txt = txt.replace(/bg-white\/10"/g, 'bg-slate-200 dark:bg-white/10"');

// Notifications toggles
txt = txt.replace(/bg-black\/5 dark:bg-white\/5 rounded-\[2rem\] border border-white\/5 cursor-pointer hover:border-white\/20/g, 'bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/10 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 shadow-sm');
txt = txt.replace(/bg-white\/5 rounded-2xl group-hover:bg-amber-400\/10/g, 'bg-slate-200 dark:bg-white/5 rounded-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-400/10 group-hover:text-amber-600');
txt = txt.replace(/bg-zinc-700"/g, 'bg-slate-300 dark:bg-zinc-700"');

// Input text
txt = txt.replace(/text-sm font-bold focus:outline-none/g, 'text-slate-900 dark:text-white text-sm font-bold focus:outline-none');

fs.writeFileSync(path, txt);
