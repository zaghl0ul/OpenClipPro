// identical content moved from previous .js file
const fs = require('fs');
const path = require('path');
const https = require('https');

const VERSION = '0.12.6';
const FILES = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js'
];
const BASE_URL = `https://unpkg.com/@ffmpeg/core-mt@${VERSION}/dist/esm`;

const destDir = path.resolve(__dirname, '..', 'public', 'ffmpeg');
fs.mkdirSync(destDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  try {
    for (const filename of FILES) {
      const url = `${BASE_URL}/${filename}`;
      const dest = path.join(destDir, filename);
      console.log(`Downloading ${filename}...`);
      await download(url, dest);
    }
    console.log('✅ FFmpeg core files downloaded to public/ffmpeg');
  } catch (err) {
    console.error('❌ Failed to download FFmpeg core files:', err.message);
    process.exit(1);
  }
})(); 