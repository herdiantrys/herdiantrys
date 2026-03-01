const fs = require('fs');
const path = './components/Settings/SettingsClient.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(/placeholder:slate-400 dark:text-gray-600/g, 'placeholder:text-slate-400 dark:placeholder-gray-500');

fs.writeFileSync(path, txt);
