export type SundaneseCharacterCategory = "vowels" | "consonants" | "marks" | "digits" | "punctuation" | "historic";

type CharacterDefinition = {
    codePoint: number;
    name: string;
    reading: string;
    category: SundaneseCharacterCategory;
    combining?: boolean;
    note?: string;
};

const definitions: CharacterDefinition[] = [
    { codePoint: 0x1b83, name: "Aksara swara A", reading: "a", category: "vowels" },
    { codePoint: 0x1b84, name: "Aksara swara I", reading: "i", category: "vowels" },
    { codePoint: 0x1b85, name: "Aksara swara U", reading: "u", category: "vowels" },
    { codePoint: 0x1b86, name: "Aksara swara AE", reading: "é", category: "vowels" },
    { codePoint: 0x1b87, name: "Aksara swara O", reading: "o", category: "vowels" },
    { codePoint: 0x1b88, name: "Aksara swara E", reading: "e", category: "vowels" },
    { codePoint: 0x1b89, name: "Aksara swara EU", reading: "eu", category: "vowels" },

    { codePoint: 0x1b8a, name: "Aksara ngalagena Ka", reading: "ka", category: "consonants" },
    { codePoint: 0x1b8b, name: "Aksara ngalagena Qa", reading: "qa", category: "consonants", note: "Huruf tambahan" },
    { codePoint: 0x1b8c, name: "Aksara ngalagena Ga", reading: "ga", category: "consonants" },
    { codePoint: 0x1b8d, name: "Aksara ngalagena Nga", reading: "nga", category: "consonants" },
    { codePoint: 0x1b8e, name: "Aksara ngalagena Ca", reading: "ca", category: "consonants" },
    { codePoint: 0x1b8f, name: "Aksara ngalagena Ja", reading: "ja", category: "consonants" },
    { codePoint: 0x1b90, name: "Aksara ngalagena Za", reading: "za", category: "consonants", note: "Huruf tambahan" },
    { codePoint: 0x1b91, name: "Aksara ngalagena Nya", reading: "nya", category: "consonants" },
    { codePoint: 0x1b92, name: "Aksara ngalagena Ta", reading: "ta", category: "consonants" },
    { codePoint: 0x1b93, name: "Aksara ngalagena Da", reading: "da", category: "consonants" },
    { codePoint: 0x1b94, name: "Aksara ngalagena Na", reading: "na", category: "consonants" },
    { codePoint: 0x1b95, name: "Aksara ngalagena Pa", reading: "pa", category: "consonants" },
    { codePoint: 0x1b96, name: "Aksara ngalagena Fa", reading: "fa", category: "consonants", note: "Huruf tambahan" },
    { codePoint: 0x1b97, name: "Aksara ngalagena Va", reading: "va", category: "consonants", note: "Huruf tambahan" },
    { codePoint: 0x1b98, name: "Aksara ngalagena Ba", reading: "ba", category: "consonants" },
    { codePoint: 0x1b99, name: "Aksara ngalagena Ma", reading: "ma", category: "consonants" },
    { codePoint: 0x1b9a, name: "Aksara ngalagena Ya", reading: "ya", category: "consonants" },
    { codePoint: 0x1b9b, name: "Aksara ngalagena Ra", reading: "ra", category: "consonants" },
    { codePoint: 0x1b9c, name: "Aksara ngalagena La", reading: "la", category: "consonants" },
    { codePoint: 0x1b9d, name: "Aksara ngalagena Wa", reading: "wa", category: "consonants" },
    { codePoint: 0x1b9e, name: "Aksara ngalagena Sa", reading: "sa", category: "consonants" },
    { codePoint: 0x1b9f, name: "Aksara ngalagena Xa", reading: "xa", category: "consonants", note: "Huruf tambahan" },
    { codePoint: 0x1ba0, name: "Aksara ngalagena Ha", reading: "ha", category: "consonants" },

    { codePoint: 0x1b80, name: "Panyecek", reading: "-ng", category: "marks", combining: true },
    { codePoint: 0x1b81, name: "Panglayar", reading: "-r", category: "marks", combining: true },
    { codePoint: 0x1b82, name: "Pangwisad", reading: "-h", category: "marks", combining: true },
    { codePoint: 0x1ba1, name: "Pamingkal", reading: "-y", category: "marks", combining: true },
    { codePoint: 0x1ba2, name: "Panyakra", reading: "-r", category: "marks", combining: true },
    { codePoint: 0x1ba3, name: "Panyiku", reading: "-l", category: "marks", combining: true },
    { codePoint: 0x1ba4, name: "Panghulu", reading: "i", category: "marks", combining: true },
    { codePoint: 0x1ba5, name: "Panyuku", reading: "u", category: "marks", combining: true },
    { codePoint: 0x1ba6, name: "Panaelaeng", reading: "é", category: "marks", combining: true },
    { codePoint: 0x1ba7, name: "Panolong", reading: "o", category: "marks", combining: true },
    { codePoint: 0x1ba8, name: "Pamepet", reading: "e", category: "marks", combining: true },
    { codePoint: 0x1ba9, name: "Paneuleung", reading: "eu", category: "marks", combining: true },
    { codePoint: 0x1baa, name: "Pamaéh", reading: "Mematikan vokal bawaan", category: "marks", combining: true },
    { codePoint: 0x1bab, name: "Virama", reading: "Bentuk aksara lama", category: "marks", combining: true, note: "Dipakai pada ortografi lama" },
    { codePoint: 0x1bac, name: "Pasangan Ma", reading: "ma", category: "marks", combining: true },
    { codePoint: 0x1bad, name: "Pasangan Wa", reading: "wa", category: "marks", combining: true },

    { codePoint: 0x1bb0, name: "Angka nol", reading: "0", category: "digits" },
    { codePoint: 0x1bb1, name: "Angka hiji", reading: "1", category: "digits" },
    { codePoint: 0x1bb2, name: "Angka dua", reading: "2", category: "digits" },
    { codePoint: 0x1bb3, name: "Angka tilu", reading: "3", category: "digits" },
    { codePoint: 0x1bb4, name: "Angka opat", reading: "4", category: "digits" },
    { codePoint: 0x1bb5, name: "Angka lima", reading: "5", category: "digits" },
    { codePoint: 0x1bb6, name: "Angka genep", reading: "6", category: "digits" },
    { codePoint: 0x1bb7, name: "Angka tujuh", reading: "7", category: "digits" },
    { codePoint: 0x1bb8, name: "Angka dalapan", reading: "8", category: "digits" },
    { codePoint: 0x1bb9, name: "Angka salapan", reading: "9", category: "digits" },

    { codePoint: 0x1cc0, name: "Bindu surya", reading: "Matahari", category: "punctuation" },
    { codePoint: 0x1cc1, name: "Bindu panglong", reading: "Bulan sabit", category: "punctuation" },
    { codePoint: 0x1cc2, name: "Bindu purnama", reading: "Bulan purnama", category: "punctuation" },
    { codePoint: 0x1cc3, name: "Bindu cakra", reading: "Roda", category: "punctuation" },
    { codePoint: 0x1cc4, name: "Bindu leu satanga", reading: "Tanda baca", category: "punctuation" },
    { codePoint: 0x1cc5, name: "Bindu ka satanga", reading: "Tanda baca", category: "punctuation" },
    { codePoint: 0x1cc6, name: "Bindu da satanga", reading: "Tanda baca", category: "punctuation" },
    { codePoint: 0x1cc7, name: "Bindu ba satanga", reading: "Tanda baca", category: "punctuation" },
    { codePoint: 0x1bba, name: "Avagraha", reading: "Tanda penggandaan", category: "punctuation" },

    { codePoint: 0x1bae, name: "Aksara Kha", reading: "kha", category: "historic", note: "Tidak dipakai dalam ortografi Sunda modern" },
    { codePoint: 0x1baf, name: "Aksara Sya", reading: "sya", category: "historic", note: "Tidak dipakai dalam ortografi Sunda modern" },
    { codePoint: 0x1bbb, name: "Aksara Reu", reading: "vokal r", category: "historic" },
    { codePoint: 0x1bbc, name: "Aksara Leu", reading: "vokal l", category: "historic" },
    { codePoint: 0x1bbd, name: "Aksara Bha", reading: "aksara sajarah", category: "historic", note: "Nama Unicode historis; pernah salah diidentifikasi" },
    { codePoint: 0x1bbe, name: "Aksara final K", reading: "-k", category: "historic" },
    { codePoint: 0x1bbf, name: "Aksara final M", reading: "-m", category: "historic", note: "Untuk ejaan modern, gunakan aksara Ma + Pamaéh" },
];

export const sundaneseCharacters = definitions.map((definition) => {
    const value = String.fromCodePoint(definition.codePoint);

    return {
        ...definition,
        value,
        glyph: definition.combining ? `◌${value}` : value,
        code: `U+${definition.codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    };
});
