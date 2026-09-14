// Generator Alamat Email Acak: Nama Orang Random + 2 Digit Angka

const personNames = [
  // Nama Populer Indonesia
  'agus', 'budi', 'citra', 'dimas', 'eko', 'fajar', 'gilang', 'hadi', 'indah',
  'joko', 'kiki', 'lina', 'maya', 'nanda', 'putra', 'rani', 'siti', 'udin',
  'vina', 'zaki', 'ahmad', 'rizky', 'bayu', 'dika', 'yudi', 'ryan', 'anton',
  'wulan', 'fitri', 'aulia', 'hendra', 'reza', 'aditya', 'ilham', 'wahyu',
  'raden', 'maulana', 'pratama', 'wijaya', 'saputra', 'nur', 'doni', 'bagus',
  'rendy', 'arif', 'tiara', 'anisa', 'tari', 'rizal', 'surya', 'angga',
  'firmansyah', 'hidayat', 'syahputra', 'gunawan', 'setiawan', 'pranata',
  'dewi', 'lestari', 'kusuma', 'anggun', 'mita', 'ratna', 'shinta', 'dian',
  'nadia', 'novi', 'putri', 'bella', 'kartika', 'cahya', 'farhan', 'haikal',
  'fadhil', 'faiz', 'alwan', 'aldy', 'alif', 'faizal', 'syahrul',

  // Nama Populer Global / Internasional
  'alex', 'chris', 'david', 'john', 'mike', 'sarah', 'anna', 'emma', 'jane',
  'tom', 'sam', 'jack', 'luke', 'james', 'robert', 'daniel', 'michael',
  'william', 'jessica', 'amanda', 'chloe', 'megan', 'brian', 'kevin', 'eric',
  'oliver', 'sophia', 'lucas', 'noah', 'liam', 'ethan', 'mason', 'logan',
  'hannah', 'clara', 'olivia', 'mia', 'charlotte', 'amelia', 'harper',
  'evelyn', 'abigail', 'emily', 'elizabeth', 'sofia', 'avery', 'ella',
  'scarlett', 'grace', 'victor', 'oscar', 'arthur', 'felix', 'leo', 'henry',
  'benjamin', 'adam', 'nathan', 'justin', 'jason', 'matthew', 'andrew',
  'joshua', 'brandon', 'samuel'
];

export function generateRandomPrefix(): string {
  // Pilih nama orang acak
  const randomName = personNames[Math.floor(Math.random() * personNames.length)];
  // Hasilkan 2 digit angka acak (10 - 99)
  const twoDigits = Math.floor(Math.random() * 90) + 10;

  return `${randomName}${twoDigits}`;
}

