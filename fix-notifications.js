const fs = require('fs');

function processFile(path, replacer) {
    if (fs.existsSync(path)) {
        let text = fs.readFileSync(path, 'utf8');
        text = replacer(text);
        fs.writeFileSync(path, text);
        console.log(`Processed ${path}`);
    } else {
        console.error(`File not found: ${path}`);
    }
}

// 1. page.tsx
processFile('./app/[lang]/(root)/notifications/page.tsx', (txt) => {
    txt = txt.replace(/bg-white\/5 backdrop-blur-sm rounded-2xl p-6 border border-white\/5/g, 'bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200/70 dark:border-white/10 shadow-xl dark:shadow-none transition-colors');
    txt = txt.replace(/text-\[var\(--glass-text\)\]/g, 'text-slate-900 dark:text-[var(--glass-text)]');
    txt = txt.replace(/text-\[var\(--glass-text-muted\)\]/g, 'text-slate-500 dark:text-[var(--glass-text-muted)]');
    return txt;
});

// 2. NotificationList.tsx
processFile('./components/Notification/NotificationList.tsx', (txt) => {
    txt = txt.replace(/text-\[var\(--glass-text-muted\)\]/g, 'text-slate-500 dark:text-[var(--glass-text-muted)]');
    return txt;
});

// 3. NotificationItem.tsx
processFile('./components/Notification/NotificationItem.tsx', (txt) => {
    // Background and border for unread
    txt = txt.replace(/bg-white\/5 hover:bg-white\/10 border-white\/5/g, 'bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none');

    // Background for read hover
    txt = txt.replace(/hover:bg-white\/5 opacity-70/g, 'hover:bg-slate-50 dark:hover:bg-white/5 opacity-70');

    // Text colors
    txt = txt.replace(/text-\[var\(--glass-text\)\]/g, 'text-slate-900 dark:text-[var(--glass-text)]');
    txt = txt.replace(/text-\[var\(--glass-text-muted\)\]/g, 'text-slate-500 dark:text-[var(--glass-text-muted)]');
    txt = txt.replace(/text-white mr-1/g, 'text-slate-900 dark:text-white mr-1');

    // Borders
    txt = txt.replace(/border-white\/10/g, 'border-slate-200 dark:border-white/10');
    txt = txt.replace(/border-gray-100/g, 'border-slate-100');

    // Avatar ring
    txt = txt.replace(/bg-gray-800/g, 'bg-slate-200 dark:bg-gray-800');

    return txt;
});
