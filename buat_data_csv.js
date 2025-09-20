const fs = require('fs');
const path = require('path');

// Fungsi untuk mengubah daftar path menjadi data CSV
function convertPathsToCSV(inputFile, outputFile) {
  // Baca file input
  const data = fs.readFileSync(inputFile, 'utf8').split('\n');

  // Header CSV
  const csvData = ['nama,nik,photoPath'];

  // Proses setiap baris path
  data.forEach((line) => {
    if (line.trim() === '') return; // Lewati baris kosong
    const filePath = line.replace(/"/g, '').trim(); // Hapus tanda kutip
    const fileName = path.basename(filePath, path.extname(filePath)); // Ambil nama file tanpa ekstensi
    const matches = fileName.match(/(.*?)\s\((\d+)\)$/); // Cari nama dan NIK menggunakan regex

    if (matches) {
      const nama = matches[1].trim(); // Nama karyawan
      const nik = matches[2].trim(); // NIK karyawan
      csvData.push(`${nama},${nik},${filePath}`);
    }
  });

  // Tulis ke file CSV
  fs.writeFileSync(outputFile, csvData.join('\n'), 'utf8');
  console.log(`File CSV berhasil dibuat: ${outputFile}`);
}

// Jalankan fungsi dengan input dan output file
const inputFile = 'photo_paths.txt'; // File input
const outputFile = 'data.csv'; // File output
convertPathsToCSV(inputFile, outputFile);
