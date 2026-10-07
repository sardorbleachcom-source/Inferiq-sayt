const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD || '';
const DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DIR, 'content.json');
const PUB = path.join(__dirname, 'public');

const DEFAULT = {
  brand: 'Inferiq',
  title: 'Aqlli botlar va zamonaviy yechimlar',
  text: "Inferiq jamoasi Telegram botlar, sun'iy intellekt va veb-loyihalarni yaratadi.",
  stats: [
    { n: '10', label: 'Loyiha' },
    { n: '5', label: 'Bot' },
    { n: '24/7', label: "Qo'llab-quvvatlash" }
  ],
  services: [
    { icon: '🤖', title: 'Telegram botlar', text: 'Savdo, yuklab olish, narx kuzatuvchi botlar.' },
    { icon: '🧠', title: 'AI integratsiya', text: "Ovozli va matnli sun'iy intellekt funksiyalari." },
    { icon: '🌐', title: 'Veb-saytlar', text: 'Tez, telefonga mos, chiroyli sahifalar.' },
    { icon: '🚀', title: 'Joylashtirish', text: 'Railway va GitHub orqali avtomatik deploy.' }
  ],
  projects: [
    { title: 'Shadow AI', text: "Ovozli funksiyali sun'iy intellekt boti." },
    { title: 'MegaTools', text: "Ko'p funksiyali Telegram yordamchi bot." },
    { title: 'Crypto Price', text: 'Kriptovalyuta narxlarini tekshiruvchi bot.' },
    { title: 'Track Downloader', text: 'Musiqa topish va yuklab olish boti.' }
  ],
  team: [{ name: 'Sardor', role: 'Dasturchi (loyiha egasi)' }],
  contact: { text: "Loyiha g'oyangiz bormi? Yozing, birga amalga oshiramiz.", telegram: 'ESPT4' }
};

fs.mkdirSync(DIR, { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(DEFAULT, null, 2));

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain' };
const ok = (req) => PASS && req.headers['x-admin'] === PASS;
const deny = (res) => setTimeout(() => { res.writeHead(401); res.end('{"error":"parol"}'); }, 800);

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/content' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(FILE));
  }
  if (url === '/api/auth') {
    if (!ok(req)) return deny(res);
    res.writeHead(200); return res.end('{"ok":true}');
  }
  if (url === '/api/content' && req.method === 'POST') {
    if (!ok(req)) return deny(res);
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 200000) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
        res.writeHead(200); res.end('{"ok":true}');
      } catch (e) { res.writeHead(400); res.end('{"error":"xato"}'); }
    });
    return;
  }
  if (url === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('User-agent: *\nAllow: /\nDisallow: /admin\n');
  }

  const name = url === '/' ? 'index.html' : url === '/admin' ? 'admin.html' : url.slice(1);
  const file = path.resolve(PUB, name);
  if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('Sayt ishga tushdi: ' + PORT));
