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
                const cleanText = sanitizePDF(rawText);
                const finalResult = structureByKeyword(cleanText, config);
                resolve(finalResult);
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

    return step_5;
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

    // 1. Ambil semua keyword dari config
    const allKeywords = config.flatMap(item => item.keywords);
    console.log(allKeywords);

    // 2. Iterasi setiap keyword
    allKeywords.forEach(key => {
        // Escape karakter khusus regex
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        
        // Ganti keyword menjadi: newline + keyword
        structuredText = structuredText.replace(regex, `\n${key}`);
    });

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