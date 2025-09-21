// make_pdf.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const sizeOf = require('image-size');

// --- Konfigurasi ---
const IMAGES_DIR = path.resolve(__dirname, 'hasil'); // folder gambar
const OUTPUT_PDF = path.resolve(__dirname, 'badges_a4.pdf');
const COLS = 4;   // kolom per halaman
const ROWS = 4;   // baris per halaman
const MARGIN = 30; // margin page (dalam point)
const GAP = 12;   // jarak antar gambar (dalam point)
const FRAME_COLOR = '#000000'; // warna garis frame
const FRAME_WIDTH = 1;         // ketebalan garis
// ---------------------

if (!fs.existsSync(IMAGES_DIR)) {
  console.error('Folder gambar tidak ditemukan:', IMAGES_DIR);
  process.exit(1);
}

const files = fs.readdirSync(IMAGES_DIR)
  .filter(f => /\.(png|jpe?g)$/i.test(f))
  .map(f => path.join(IMAGES_DIR, f))
  .sort();

if (files.length === 0) {
  console.error('Tidak ada file gambar (.png/.jpg) di folder:', IMAGES_DIR);
  process.exit(1);
}

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(OUTPUT_PDF);
doc.pipe(writeStream);

const PAGE_WIDTH = doc.page.width;   // ~595.28
const PAGE_HEIGHT = doc.page.height; // ~841.89

const usableWidth = PAGE_WIDTH - MARGIN * 2;
const usableHeight = PAGE_HEIGHT - MARGIN * 2;
const cellWidth = (usableWidth - (COLS - 1) * GAP) / COLS;
const cellHeight = (usableHeight - (ROWS - 1) * GAP) / ROWS;

let index = 0;
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const posOnPage = index % (COLS * ROWS);

  if (posOnPage === 0 && index !== 0) {
    doc.addPage();
  }

  const col = posOnPage % COLS;
  const row = Math.floor(posOnPage / COLS);

  const cellX = MARGIN + col * (cellWidth + GAP);
  const cellY = MARGIN + row * (cellHeight + GAP);

  let dims;
  try {
    dims = sizeOf(file);
  } catch (err) {
    console.warn('Gagal membaca ukuran gambar, dilewati:', file, err.message);
    index++;
    continue;
  }

  const imgW = dims.width;
  const imgH = dims.height;
  const imgAspect = imgW / imgH;
  const cellAspect = cellWidth / cellHeight;

  let drawWidth, drawHeight;
  if (imgAspect > cellAspect) {
    drawWidth = cellWidth;
    drawHeight = cellWidth / imgAspect;
  } else {
    drawHeight = cellHeight;
    drawWidth = cellHeight * imgAspect;
  }

  const drawX = cellX + (cellWidth - drawWidth) / 2;
  const drawY = cellY + (cellHeight - drawHeight) / 2;

  try {
    // gambar image
    doc.image(file, drawX, drawY, { width: drawWidth, height: drawHeight });

    // gambar frame sesuai cell (agar rata semua)
    doc
      .lineWidth(FRAME_WIDTH)
      .strokeColor(FRAME_COLOR)
      .rect(cellX, cellY, cellWidth, cellHeight)
      .stroke();
  } catch (err) {
    console.warn('Gagal menambahkan gambar ke PDF:', file, err.message);
  }

  index++;
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF selesai dibuat dengan frame:', OUTPUT_PDF);
});
writeStream.on('error', (err) => {
  console.error('Error menulis PDF:', err);
});
