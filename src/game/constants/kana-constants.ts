// Difficulty tiers
export const BASIC_KANA_IDS = ['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n']
export const DAKUTEN_KANA_IDS = ['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','di','du','de','do','ba','bi','bu','be','bo','pa','pi','pu','pe','po']
export const YOON_KANA_IDS = ['kya','kyu','kyo','sha','shu','sho','cha','chu','cho','nya','nyu','nyo','hya','hyu','hyo','mya','myu','myo','rya','ryu','ryo','gya','gyu','gyo','ja','ju','jo','bya','byu','byo','pya','pyu','pyo']

// Valid romaji characters (excludes l, q, v, x — unused in any transcription)
export const VALID_ROMAJI_CHARS: ReadonlySet<string> = new Set('abcdefghijkmnoprstuwyz')

