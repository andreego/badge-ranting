const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const csv = require('csv-parser');

// Fungsi untuk membuat kartu karyawan
async function buatKartuKaryawan(data) {
  const { nama, nik, photoPath, backgroundPath } = data;

  // Muat gambar latar belakang
  const background = await loadImage(backgroundPath);
  const width = background.width;
  const height = background.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Gambar latar belakang
  ctx.drawImage(background, 0, 0, width, height);

  // Foto karyawan
  const photo = await loadImage(photoPath);
  const photoWidth = 241;
  const photoHeight = 297;
  const photoX = 156; // Posisi horizontal
  const photoY = 302; // Posisi vertikal
  ctx.drawImage(photo, photoX, photoY, photoWidth, photoHeight);

  // Nama karyawan
  ctx.font = '40px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  const textX = width / 2;
  const textY = 650;
  ctx.fillText(nama, textX, textY);

  // Tambahkan garis bawah pada nama
  const textWidth = ctx.measureText(nama).width;
  const underlineHeight = 4;
  const underlineOffset = 4;
  ctx.fillRect(textX - textWidth / 2, textY + underlineOffset, textWidth, underlineHeight);

  // NIK karyawan
  ctx.font = '35px Arial';
  ctx.fillText(`${nik}`, width / 2, 690);

  // Simpan kartu sebagai file PNG
  const outputPath = `./hasil/badge-${nik}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Badge berhasil dibuat: ${outputPath}`);
}

// Fungsi untuk membaca CSV dan memproses data
function prosesCSV(filePath, backgroundPath) {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      const karyawan = {
        nama: row.nama,
        nik: row.nik,
        photoPath: row.photoPath,
        backgroundPath: backgroundPath,
      };

      try {
        await buatKartuKaryawan(karyawan);
      } catch (error) {
        console.error(`Error membuat badge untuk ${karyawan.nama}:`, error);
      }
    })
    .on('end', () => {
      console.log('Proses CSV selesai.');
    });
}

// Path ke file CSV dan gambar latar belakang
const csvFilePath = './data.csv';
const backgroundPath = './background/background_bct.png';

// Jalankan proses
prosesCSV(csvFilePath, backgroundPath);
