// make_tray_pdf.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const IMAGES_DIR = path.resolve(__dirname, 'hasil'); 
const OUTPUT_PDF = path.resolve(__dirname, 'badges_tray.pdf');

// Konversi mm ke point
const MM_TO_PT = mm => (mm / 25.4) * 72;

// Ukuran A4
const PAGE_WIDTH = MM_TO_PT(210);
const PAGE_HEIGHT = MM_TO_PT(297);

// Ukuran slot kartu CR80 (landscape 86x54 mm)
const SLOT_WIDTH = MM_TO_PT(88);
const SLOT_HEIGHT = MM_TO_PT(56);

// Posisi slot tray (sesuaikan dengan tray printer kamu)
const SLOT_X = MM_TO_PT(30.3);
const SLOT_Y1 = MM_TO_PT(6);
const SLOT_Y2 = MM_TO_PT(68);

// Konfigurasi border
const BORDER_COLOR = 'black'; // bisa diganti 'red', 'blue', '#50b8b7'
const BORDER_WIDTH = 1;       // ketebalan garis border

// Baca file gambar
const files = fs.readdirSync(IMAGES_DIR)
  .filter(f => /\.(png|jpe?g)$/i.test(f))
  .map(f => path.join(IMAGES_DIR, f))
  .sort();

if (files.length === 0) {
  console.error('Tidak ada file gambar di folder:', IMAGES_DIR);
  process.exit(1);
}

const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 });
const writeStream = fs.createWriteStream(OUTPUT_PDF);
doc.pipe(writeStream);

for (let i = 0; i < files.length; i += 2) {
  if (i > 0) doc.addPage();

  // Slot 1
  if (files[i]) {
    doc.save();
    doc.translate(SLOT_X, SLOT_Y1);
    doc.rotate(90, { origin: [0, 0] });

    // Gambar kartu
    doc.image(files[i], 0, -SLOT_WIDTH, { width: SLOT_HEIGHT, height: SLOT_WIDTH });

    // Border
    doc.lineWidth(BORDER_WIDTH);
    doc.strokeColor(BORDER_COLOR);
    doc.rect(0, -SLOT_WIDTH, SLOT_HEIGHT, SLOT_WIDTH).stroke();

    doc.restore();
  }

  // Slot 2
  if (files[i + 1]) {
    doc.save();
    doc.translate(SLOT_X, SLOT_Y2);
    doc.rotate(90, { origin: [0, 0] });

    doc.image(files[i + 1], 0, -SLOT_WIDTH, { width: SLOT_HEIGHT, height: SLOT_WIDTH });

    doc.lineWidth(BORDER_WIDTH);
    doc.strokeColor(BORDER_COLOR);
    doc.rect(0, -SLOT_WIDTH, SLOT_HEIGHT, SLOT_WIDTH).stroke();

    doc.restore();
  }
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF tray dengan border selesai dibuat:', OUTPUT_PDF);
});
writeStream.on('error', (err) => {
  console.error('Error menulis PDF:', err);
});
