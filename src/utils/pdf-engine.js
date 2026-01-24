export async function autoInputPDF(file, config)
{
    try
    {
        return await readPDF(file, config);
    }
    catch (error)
    {
        throw error;
    }
}

// -----------------------------------------------------------
// URUTAN FUNGSI:
// 1. autoInputPDF(file) akan diimport ke kualitas-air.js
// 2. autoInputPDF(file) butuh readPDF(file)
// 3. readPDF(file) butuh sanitizePDF(teks)
// -----------------------------------------------------------
async function readPDF(file, config)
{
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            try
            {
                const typedarray = new Uint8Array(reader.result);
                const rawText = await parsePDFContent(typedarray);
                const sanitized = sanitizePDF(rawText);
                const structured = structureByKeyword(sanitized, config);
                const cleaned = cleanRowEdges(structured);
                const finalData = extractValues(cleaned);
                
                resolve(finalData);
            }
            catch (error)
            {
                reject("Gagal memproses konten PDF: " + error.message);
            }
        };
        reader.onerror = () => reject("Gagal membaca file buffer.");
        reader.readAsArrayBuffer(file);
    });
}


// -----------------------------------------------------------
// Sanitasi teks pdf yang diekstrak dilakukan di sini
// Tugasnya: Memanggil semua fungsi yang berkaitan dengan
// tugas sanitasi teks pdf
// -----------------------------------------------------------
function sanitizePDF(text)
{
    if (!text) return "";

    let step_1 = removeSpecialChars(text);
    let step_2 = removeTotal(step_1);
    let step_3 = removeTerlarut(step_2);
    let step_4 = removeParentheses(step_3);
    let step_5 = collapseSpaces(step_4);
    let step_6 = convertCommaToDot(step_5);
    let step_7 = handleLessThan(step_6);

    return step_7;
}

// -----------------------------------------------------------
// Fungsi khusus untuk berinteraksi dengan library PDF.js
// Tugasnya: Membuka dokumen dan mengekstrak teks per halaman
// -----------------------------------------------------------
async function parsePDFContent(typedarray)
{
    // Inisialisasi PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++)
    {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText.toLowerCase();
}


// -----------------------------------------------------------
// Fungsi ini akan mengambil data dari tabel untuk dijadikan
// keyword lalu mencocokkannya dengan teks pdf lalu
// memasukkan baris baru (\n) di belakang keyword tersebut
// -----------------------------------------------------------
function structureByKeyword(text, config) 
{
    let structuredText = text;

    // 1. Buat regex pattern untuk mencari pola: "no parameter satuan hasil"
    const pattern = /(\d+)\s+([a-zA-Z& ]+)\s+(mg\/l|pt co unit|mpn \/ 100 ml)\s+([\d.,<]+)/gi;
    
    // 2. Ganti pola yang ditemukan dengan format yang lebih terstruktur
    structuredText = structuredText.replace(pattern, "\n$1 $2 $3 $4");

    return structuredText;
}


// -----------------------------------------------------------
// Fungsi-fungsi tahapan sanitasi teks
// -----------------------------------------------------------

function collapseSpaces(text) 
{
    // Menghilangkan spasi yang berlebih menjadi spasi tunggal
    return text.replace(/\s+/g, ' ').trim();
}

function removeSpecialChars(text) 
{
    // Menghilangkan karakter · * - :
    return text.replace(/[·*\-:]/g, ' '); 
}

function removeTotal(text) 
{
    // Menghapus kata 'total' secara global
    return text.replace(/total/g, '');
}

function removeTerlarut(text) 
{
    // Menghapus kata 'terlarut' secara global
    return text.replace(/terlarut/g, '');
}

function removeParentheses(text) 
{
    // Menghapus tanda kurung () dan semua karakter yang ada di dalamnya
    return text.replace(/\([^)]*\)/g, '');
}

function convertCommaToDot(text)
{
    return text.replace(/,/g, '.');
}

function handleLessThan(text) 
{
    // Tambahkan \s* untuk menangani spasi nol atau lebih antara < dan angka
    return text.replace(/<\s*([\d.]+)/g, (_, p1) => {
        const value = parseFloat(p1);
        
        if (isNaN(value)) return p1;

        // Turunkan nilai 1%
        const newValue = value * 0.99;
        
        // Kembalikan angka saja (simbol < dan spasi otomatis hilang)
        return newValue.toString();
    });
}

function fixSlashSpacing(text)
{
    // Mencari satu atau lebih spasi di sekitar / yang diikuti huruf/angka
    // \s+ : spasi satu atau lebih
    return text.replace(/\s+\/\s+(?=[a-zA-Z0-9])/g, '/');
}


/**
 * Membersihkan nomor urut di awal baris dan teks SNI di akhir baris
 */
function cleanRowEdges(text) 
{
    if (!text) return "";

    return text
        // 1. Menghapus nomor di awal baris (digit yang diikuti spasi)
        // ^\d+\s+ : Cari angka di awal baris (^) yang diikuti spasi
        .replace(/^\d+\s+/gm, '') 
        
        // 2. Menghapus 'sni' sampai akhir baris
        .replace(/sni.*/g, '');
}


/**
 * Mengekstrak nilai dari akhir baris dengan memindai karakter dari kanan ke kiri
 */
function extractValues(text) {
    const lines = text.split('\n');
    const results = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        let value = "";
        let foundDigit = false;

        // Iterasi dari karakter paling belakang ke depan
        for (let i = trimmedLine.length - 1; i >= 0; i--) {
            const char = trimmedLine[i];

            // Regex untuk mendeteksi karakter angka, koma, titik, atau simbol < / >
            const isDataChar = /[\d.,<>]/.test(char);

            if (isDataChar) {
                value = char + value; // Tambahkan karakter ke depan string value
                foundDigit = true;
            } else if (foundDigit && char === " ") {
                // Jika kita sudah mulai mengambil angka lalu ketemu spasi, 
                // berarti itu adalah batas akhir angka. BERHENTI.
                break;
            } else if (foundDigit && /[a-zA-Z]/.test(char)) {
                // Jika ketemu huruf saat sudah mengambil angka, berhenti.
                break;
            }
        }

        // Ambil sisa teks di sebelah kiri sebagai nama parameter mentah
        const parameterName = trimmedLine.replace(value, "").trim();

        if (value) {
            results.push({
                parameter: parameterName,
                value: value
            });
        }
    });

    return results;
}