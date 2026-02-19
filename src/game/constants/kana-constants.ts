/**
 * Shared constants for kana categorization
 * Used for difficulty progression, spawning, and reference display
 */

// Difficulty progression - unlock complex kana gradually
export const BASIC_KANA_IDS = ['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n']
export const DAKUTEN_KANA_IDS = ['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','di','du','de','do','ba','bi','bu','be','bo','pa','pi','pu','pe','po']
export const YOON_KANA_IDS = ['kya','kyu','kyo','sha','shu','sho','cha','chu','cho','nya','nyu','nyo','hya','hyu','hyo','mya','myu','myo','rya','ryu','ryo','gya','gyu','gyo','ja','ju','jo','bya','byu','byo','pya','pyu','pyo']

// Gojuon table structure - traditional layout (right-to-left, top-to-bottom)
// Order reversed to display right-to-left: ん わ ら や ま は な た さ か あ
export const GOJUON_COLUMNS = [
	['n'],                                     // ん (rightmost in traditional chart)
	['wa','wo'],                              // わを
	['ra','ri','ru','re','ro'],               // らりるれろ
	['ya','yu','yo'],                         // やゆよ (only 3 characters)
	['ma','mi','mu','me','mo'],               // まみむめも
	['ha','hi','fu','he','ho'],               // はひふへほ
	['na','ni','nu','ne','no'],               // なにぬねの
	['ta','chi','tsu','te','to'],             // たちつてと
	['sa','shi','su','se','so'],              // さしすせそ
	['ka','ki','ku','ke','ko'],               // かきくけこ
	['a','i','u','e','o']                     // あいうえお (leftmost in traditional chart)
]

// Dakuten & Handakuten table structure - right-to-left, top-to-bottom
export const DAKUTEN_COLUMNS = [
	['pa','pi','pu','pe','po'],               // ぱぴぷぺぽ
	['ba','bi','bu','be','bo'],               // ばびぶべぼ
	['da','di','du','de','do'],               // だぢづでど
	['za','ji','zu','ze','zo'],               // ざじずぜぞ
	['ga','gi','gu','ge','go']                // がぎぐげご
]

// Valid characters that can appear in any romaji transcription.
// Derived from all romaji strings across both hiragana and katakana data.
// Letters not present (l, q, v, x) are never needed and are excluded intentionally.
export const VALID_ROMAJI_CHARS: ReadonlySet<string> = new Set('abcdefghijkmnoprstuwyz')

// Yoon table structure - right-to-left, organized by vowel ending (kyo, kyu, kya)
export const YOON_COLUMNS = [
	['kyo','sho','cho','nyo','hyo','myo','ryo','gyo','jo','byo','pyo'],    // きょ しょ ちょ...
	['kyu','shu','chu','nyu','hyu','myu','ryu','gyu','ju','byu','pyu'],    // きゅ しゅ ちゅ...
	['kya','sha','cha','nya','hya','mya','rya','gya','ja','bya','pya']     // きゃ しゃ ちゃ...
]

