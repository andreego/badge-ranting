const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

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
  const photoX =  156//(width - photoWidth) / 2; // Foto di tengah
  const photoY = 302; // Posisi vertikal foto
  ctx.drawImage(photo, photoX, photoY, photoWidth, photoHeight);


  
  // Nama karyawan
ctx.font = '40px Arial';
ctx.fillStyle = '#000';
ctx.textAlign = 'center';

// Posisi teks
const textX = width / 2; // Posisi horizontal teks (tengah)
const textY = 650; // Posisi vertikal teks

// Gambar teks
ctx.fillText(nama, textX, textY);

// Menambahkan garis bawah
const textWidth = ctx.measureText(nama).width; // Lebar teks
const underlineHeight = 4; // Ketebalan garis bawah
const underlineOffset = 4; // Jarak garis dari teks

ctx.fillRect(
  textX - textWidth / 2, // Posisi mulai dari kiri teks
  textY + underlineOffset, // Garis di bawah teks
  textWidth, // Panjang garis
  underlineHeight // Ketebalan garis
);

  // NIK karyawan
  ctx.font = '35px Arial';
  ctx.fillText(`${nik}`, width / 2, 690);

  // Simpan sebagai file PNG
  const outputPath = `./hasil/badge-${nik}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Badge berhasil dibuat: ${outputPath}`);
}

// Contoh data karyawan
const karyawan = {
  nama: 'Fida Rahman',
  nik: '12345678',
  photoPath: './photos/photo.jpg', // Path ke foto karyawan
  backgroundPath: './background/background_bct.png', // Path ke gambar latar belakang
};

// Buat badge karyawan
buatKartuKaryawan(karyawan).catch((err) => console.error('Error:', err));
