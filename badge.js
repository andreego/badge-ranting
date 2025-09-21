const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const csv = require('csv-parser');

// Fungsi untuk membuat kartu karyawan
async function buatKartuKaryawan(data) {
  const { nama, nik, photoPath, backgroundPath } = data;

  // Muat gambar latar belakang
  const background = await loadImage(backgroundPath);
    // Faktor perbesaran (misal 2x lipat)
  const scaleFactor = 2;
  const width = background.width * scaleFactor;
  const height = background.height * scaleFactor;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Gambar latar belakang
  ctx.drawImage(background, 0, 0, width, height);

  // Foto karyawan
  const photo = await loadImage(photoPath);

  // tinggi fix
  const photoHeight = 1200;

  // hitung lebar berdasarkan rasio asli
  const aspectRatio = photo.width / photo.height;
  const photoWidth = photoHeight * aspectRatio;

  const photoX = width - photoWidth - 0;  // padding 100 px dari kanan
  const photoY = height - photoHeight - 0; // padding 100 px dari bawah

  ctx.drawImage(photo, photoX, photoY, photoWidth, photoHeight);



  // Nama karyawan
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#4dc2c6ff';
  ctx.textAlign = 'left';

  const paddingNama = 1000;
  const textXNama = width - paddingNama;
  const textYNama = 400;
  ctx.fillText(nama, textXNama, textYNama);

  // NIK karyawan
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#4dc2c6ff';
  ctx.textAlign = 'left';

  const paddingNik = 1000;
  const textXNik = width - paddingNik;
  const textYNik = 450;
  ctx.fillText(`${nik}`, textXNik, textYNik);


  // Simpan kartu sebagai file PNG
  const outputPath = `./hasil/${nama} (${nik}).png`;
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
const backgroundPath = './background/Journey-bg.png';

// Jalankan proses
prosesCSV(csvFilePath, backgroundPath);
