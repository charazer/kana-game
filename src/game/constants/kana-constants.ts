// Difficulty tiers
export const BASIC_KANA_IDS = ['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n']
export const DAKUTEN_KANA_IDS = ['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','di','du','de','do','ba','bi','bu','be','bo','pa','pi','pu','pe','po']
export const YOON_KANA_IDS = ['kya','kyu','kyo','sha','shu','sho','cha','chu','cho','nya','nyu','nyo','hya','hyu','hyo','mya','myu','myo','rya','ryu','ryo','gya','gyu','gyo','ja','ju','jo','bya','byu','byo','pya','pyu','pyo']

// Gojūon table (right-to-left, traditional order)
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

// Dakuten & Handakuten table
export const DAKUTEN_COLUMNS = [
	['pa','pi','pu','pe','po'],               // ぱぴぷぺぽ
	['ba','bi','bu','be','bo'],               // ばびぶべぼ
	['da','di','du','de','do'],               // だぢづでど
	['za','ji','zu','ze','zo'],               // ざじずぜぞ
	['ga','gi','gu','ge','go']                // がぎぐげご
]

// Valid romaji characters (excludes l, q, v, x — unused in any transcription)
export const VALID_ROMAJI_CHARS: ReadonlySet<string> = new Set('abcdefghijkmnoprstuwyz')

// Yōon table (right-to-left, by vowel ending)
export const YOON_COLUMNS = [
	['kyo','sho','cho','nyo','hyo','myo','ryo','gyo','jo','byo','pyo'],    // きょ しょ ちょ...
	['kyu','shu','chu','nyu','hyu','myu','ryu','gyu','ju','byu','pyu'],    // きゅ しゅ ちゅ...
	['kya','sha','cha','nya','hya','mya','rya','gya','ja','bya','pya']     // きゃ しゃ ちゃ...
]

