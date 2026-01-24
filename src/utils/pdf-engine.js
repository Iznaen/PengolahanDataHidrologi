export async function extractTextFromPDF(file, config) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            try
            {
                const typedarray = new Uint8Array(reader.result);
                
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let rawText = '';

                // Ambil teks dari setiap halaman
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    rawText += pageText + '\n';
                }

                let lowerText = rawText.toLowerCase();

                // pembersihan karakter dan spasi
                let cleaned = cleanText(lowerText);

                // pembersihan dengan keyword
                let contextCleaned = cleanKeywordContext(cleaned, config);

                let finalStructuredText = structureTextByKeyword(contextCleaned, config);

                resolve(finalStructuredText);
            }
            catch (error)
            {
                reject("Gagal membaca PDF: " + error.message);
            }
        };

        reader.onerror = () => reject("Gagal membaca file.");
        reader.readAsArrayBuffer(file);
    });
}

function cleanText(text) {
    if (!text) return "";

    return text
        .replace(/\r?\n|\r|\t/g, ' ') // Baris baru dan tab
        .replace(/\s+/g, ' ')         // Spasi berlebih
        .replace(/,/g, '.')           // Ganti , menjadi .
        .replace(/[·*:]/g, '')        // Hapus karakter ·*:
        .replace(/total/g, '')        // Hapus kata 'total'
        .replace(/terlarut/g, '')     // Hapus kata 'terlarut'
        .replace(/\([^)]*\)/g, '')    // Hapus kurung dan isinya, misal: (fe), (h2s)
        .replace(/\s+/g, ' ')         // Rapikan spasi lagi setelah penghapusan
        .trim();
}

/**
 * Fungsi untuk membersihkan karakter sampah (angka urut, titik, SNI) 
 * yang muncul tepat sebelum keyword parameter.
 */
function cleanKeywordContext(text, config) {
    let cleanedText = text;

    config.forEach(param => {
        param.keywords.forEach(key => {
            const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`[^a-z()\\s][^a-z()]*\\s(?=${escapedKey})`, 'g');
            
            cleanedText = cleanedText.replace(regex, ' ');
        });
    });

    const unitsAndTrash = [
        /mg\/l/g, 
        /pt-co unit/g, 
        /mpn\s?\/\s?100\s?ml/g, 
        /sni(\.\d+)?(\/\d+)?/g,
        /sni/g
    ];

    unitsAndTrash.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, ' ');
    });

    return cleanedText.replace(/\s+/g, ' ').trim();
}

/**
 * Fungsi untuk menyisipkan baris baru setiap kali menemukan keyword.
 * Strategi: Langsung potong sebelum huruf pertama keyword yang cocok.
 */
function structureTextByKeyword(text, config) {
    let structuredText = text;

    // Ambil semua keyword unik dari config
    const allKeywords = config.flatMap(item => item.keywords);

    // Urutkan berdasarkan panjang karakter (descending) 
    // agar keyword yang lebih panjang diproses duluan (mencegah salah potong)
    allKeywords.sort((a, b) => b.length - a.length);

    allKeywords.forEach(key => {
        // Escape karakter khusus regex jika ada di keyword
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Regex: Cari keyword tersebut
        // Kita gunakan 'g' untuk global
        const regex = new RegExp(`${escapedKey}`, 'g');
        
        // Tambahkan newline tepat sebelum keyword
        structuredText = structuredText.replace(regex, `\n${key}`);
    });

    return structuredText;
}