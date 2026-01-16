
/**
 * A robust phonetic mapping for Tamil transliteration.
 * Based on common transliteration schemes like ITRANS or Azhagi.
 */

const vowels: Record<string, string> = {
  'a': 'அ', 'aa': 'ஆ', 'A': 'ஆ',
  'i': 'இ', 'ii': 'ஈ', 'I': 'ஈ',
  'u': 'உ', 'uu': 'ஊ', 'U': 'ஊ',
  'e': 'எ', 'ee': 'ஏ', 'E': 'ஏ',
  'ai': 'ஐ',
  'o': 'ஒ', 'oo': 'ஓ', 'O': 'ஓ',
  'au': 'ஔ'
};

const consonants: Record<string, string> = {
  'k': 'க்', 'ng': 'ங்', 'ch': 'ச்', 'nj': 'ஞ்',
  't': 'ட்', 'N': 'ண்', 'th': 'த்', 'n': 'ந்',
  'p': 'ப்', 'm': 'ம்', 'y': 'ய்', 'r': 'ர்',
  'l': 'ல்', 'v': 'வ்', 'zh': 'ழ்', 'L': 'ள்',
  'R': 'ற்', 'n2': 'ன்', 'j': 'ஜ்', 'sh': 'ஷ்',
  's': 'ஸ்', 'h': 'ஹ'
};

const vowelSigns: Record<string, string> = {
  'a': '', 'aa': 'ா', 'A': 'ா',
  'i': 'ி', 'ii': 'ீ', 'I': 'ீ',
  'u': 'ு', 'uu': 'ூ', 'U': 'ூ',
  'e': 'ெ', 'ee': 'ே', 'E': 'ே',
  'ai': 'ை',
  'o': 'ொ', 'oo': 'ோ', 'O': 'ோ',
  'au': 'ௌ'
};

/**
 * Transliterates a single phonetic word into Tamil.
 * Simple greedy matching implementation.
 */
export function transliterateWord(englishWord: string): string {
  if (!englishWord) return '';
  
  let result = '';
  let i = 0;
  
  while (i < englishWord.length) {
    let found = false;
    
    // Check for 3-character sequences (consonants/vowels)
    const three = englishWord.substring(i, i + 3);
    if (three === 'n2' || three === 'zh') {
      // handled below
    }

    // Check for 2-character sequences
    const two = englishWord.substring(i, i + 2);
    const char = englishWord[i];

    // Is it a consonant?
    const cKey = consonants[two] ? two : (consonants[char] ? char : null);
    
    if (cKey) {
      const base = consonants[cKey].substring(0, 1);
      i += cKey.length;
      
      // Look ahead for vowel sign
      let vKey = null;
      const vTwo = englishWord.substring(i, i + 2);
      const vOne = englishWord[i];
      
      if (vowelSigns[vTwo] !== undefined) vKey = vTwo;
      else if (vowelSigns[vOne] !== undefined) vKey = vOne;
      
      if (vKey !== null) {
        result += base + vowelSigns[vKey];
        i += vKey.length;
      } else {
        result += consonants[cKey];
      }
      found = true;
    } else {
      // Is it a standalone vowel?
      const vKey = vowels[two] ? two : (vowels[char] ? char : null);
      if (vKey) {
        result += vowels[vKey];
        i += vKey.length;
        found = true;
      }
    }

    if (!found) {
      result += char;
      i++;
    }
  }
  
  return result;
}

/**
 * Parses full text and transliterates word by word.
 */
export function transliterate(text: string): string {
  // We only want to transliterate the "active" typing part 
  // or use a regex to replace English words with Tamil.
  // For simplicity in this demo, we'll split by non-alphabetic chars
  return text.split(/(\s+)/).map(part => {
    if (/^[a-zA-Z0-9]+$/.test(part)) {
      return transliterateWord(part);
    }
    return part;
  }).join('');
}
