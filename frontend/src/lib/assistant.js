import { getLocationLabel } from './location'

const PAGE_KEYWORDS = {
  schemes: ['scheme', 'yojna', 'subsidy', 'tractor', 'योजना', 'सब्सिडी', 'ट्रैक्टर', 'योजना', 'ट्रैक्टर', 'योजना', 'ट्रॅक्टर', 'योजना', 'ଯୋଜନା', 'ଟ୍ରାକ୍ଟର'],
  mandi: ['mandi', 'rate', 'price', 'gehu', 'wheat', 'grain', 'मंडी', 'भाव', 'गेहूं', 'मंडी', 'गेहूं', 'मंडी', 'गहूं', 'ମଣ୍ଡି', 'ଭାବ', 'ଗହମ'],
  loan: ['loan', 'credit', 'kcc', 'finance', 'लोन', 'ऋण', 'लोन', 'ऋण', 'कर्ज', 'ऋण', 'ଋଣ'],
  apply: ['apply', 'application', 'form', 'register', 'आवेदन', 'फॉर्म', 'आवेदन', 'अर्ज', 'आवेदन', 'ଆବେଦନ'],
}

export function formatTime(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function detectRedirect(query) {
  const lower = query.toLowerCase()
  return Object.keys(PAGE_KEYWORDS).find((page) =>
    PAGE_KEYWORDS[page].some((keyword) => lower.includes(keyword)),
  )
}

/**
 * Per-language copy map for the assistant.
 * Each language gets its own full copy block.
 * Location-dependent strings are functions that receive locationLabel.
 */
const ASSISTANT_COPY = {
  en: (loc) => ({
    redirectMsg: (p) => `Taking you to ${p}.`,
    topSuggestions: ['Show top options', 'Start voice mode', 'Open application form'],
    subsidy: 'For tractor support, subsidy usually ranges from 30% to 40%.',
    subsidySug: ['Check my eligibility', 'Open tractor schemes', 'Apply now'],
    subsidyCards: [
      { title: 'SMAM Support', detail: 'Up to 40% subsidy on equipment purchase' },
      { title: 'State Tractor Subsidy', detail: 'Fixed support up to Rs 1.5 lakh' },
    ],
    schemeTractor: 'You may be eligible for tractor subsidy and low-interest farm equipment loan.',
    schemeTractorSug: ['Apply now', 'Check loan eligibility', 'Open nearby services'],
    schemeTractorCards: [
      { title: 'SMAM Tractor Support', detail: 'Subsidy up to 40%' },
      { title: 'State Tractor Subsidy', detail: 'Support up to Rs 1.5 lakh' },
      { title: 'Kisan Credit Card Loan', detail: 'Up to Rs 3 lakh loan support' },
    ],
    schemeDefault: 'I can help with subsidy, crop insurance, PM-KISAN, and MGNREGA scheme guidance.',
    schemeDefaultSug: ['PM-KISAN details', 'Crop insurance help', 'Open application flow'],
    mandiWheat: loc ? `Latest nearby wheat rates around ${loc} are available below.` : 'Latest nearby wheat rates are available below.',
    mandiWheatSug: ['Show rice price', 'Check tomorrow trend', 'Open nearest mandi'],
    mandiDefault: loc ? `Tell me your crop name and I will show market rates around ${loc}.` : 'Tell me your crop name and I will show market rates around your area.',
    mandiDefaultSug: ['Wheat rate', 'Paddy rate', 'Maize rate'],
    loanTractor: 'Estimated tractor loan setup is prepared below.',
    loanTractorSug: ['Use KCC option', 'Compare NABARD loan', 'Move to apply form'],
    loanTractorCards: [
      { title: 'Recommended Amount', detail: 'Rs 4,00,000' },
      { title: 'Estimated Interest', detail: '6% per year (indicative)' },
      { title: 'Best Fit', detail: 'Kisan Credit Card + NABARD linked products' },
    ],
    loanDefault: 'Share loan purpose and amount. I will suggest the right option.',
    loanDefaultSug: ['Crop loan', 'Tractor loan', 'Irrigation loan'],
    applyText: 'You can submit details by typing, voice, or call mode.',
    applySug: ['Auto-fill via voice', 'Call support agent', 'Submit application'],
    general: loc ? `I can provide schemes, mandi prices, loans, and applications using your ${loc} location context.` : 'I can route you to schemes, mandi rates, loan estimate, and application support.',
    generalSug: ['Open schemes', 'Open mandi', 'Start application'],
  }),

  hi: (loc) => ({
    redirectMsg: (p) => `आपको ${p} पेज पर ले जा रहा हूँ।`,
    topSuggestions: ['मुख्य विकल्प दिखाएं', 'वॉइस मोड शुरू करें', 'आवेदन फॉर्म खोलें'],
    subsidy: 'ट्रैक्टर सहायता में सब्सिडी लगभग 30% से 40% तक हो सकती है।',
    subsidySug: ['मेरी पात्रता जांचें', 'ट्रैक्टर योजनाएं खोलें', 'अभी आवेदन करें'],
    subsidyCards: [
      { title: 'एसएमएएम सहायता', detail: 'उपकरण खरीद पर 40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर सब्सिडी', detail: 'राज्य के अनुसार ₹1.5 लाख तक सहायता' },
    ],
    schemeTractor: 'आप ट्रैक्टर सब्सिडी और कृषि उपकरण लोन के लिए पात्र हो सकते हैं।',
    schemeTractorSug: ['अभी आवेदन करें', 'लोन पात्रता जांचें', 'नजदीकी सेवा केंद्र देखें'],
    schemeTractorCards: [
      { title: 'ट्रैक्टर सब्सिडी सहायता', detail: '40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर योजना', detail: '₹1.5 लाख तक सहायता' },
      { title: 'किसान क्रेडिट कार्ड लोन', detail: '₹3 लाख तक लोन सहायता' },
    ],
    schemeDefault: 'मैं सब्सिडी, फसल बीमा, पीएम-किसान और मनरेगा में मार्गदर्शन दे सकता हूँ।',
    schemeDefaultSug: ['पीएम-किसान जानकारी', 'फसल बीमा सहायता', 'आवेदन प्रक्रिया खोलें'],
    mandiWheat: loc ? `${loc} के आसपास गेहूं के मंडी भाव नीचे उपलब्ध हैं।` : 'गेहूं के नजदीकी मंडी भाव नीचे उपलब्ध हैं।',
    mandiWheatSug: ['धान का भाव दिखाएं', 'कल का रुझान देखें', 'नजदीकी मंडी खोलें'],
    mandiDefault: loc ? `फसल का नाम बताइए, मैं ${loc} के आसपास के बाजार भाव दिखा दूंगा।` : 'फसल का नाम बताइए, मैं आपके आसपास के बाजार भाव दिखा दूंगा।',
    mandiDefaultSug: ['गेहूं का भाव', 'धान का भाव', 'मक्का का भाव'],
    loanTractor: 'ट्रैक्टर लोन का अनुमान नीचे तैयार है।',
    loanTractorSug: ['केसीसी विकल्प लें', 'नाबार्ड लोन तुलना', 'आवेदन फॉर्म पर जाएं'],
    loanTractorCards: [
      { title: 'अनुशंसित राशि', detail: '₹4,00,000' },
      { title: 'अनुमानित ब्याज', detail: '6% वार्षिक (संकेतक)' },
      { title: 'बेहतर विकल्प', detail: 'केसीसी + नाबार्ड लिंक्ड विकल्प' },
    ],
    loanDefault: 'लोन का उद्देश्य और राशि बताइए, मैं सही सरकारी विकल्प सुझाऊंगा।',
    loanDefaultSug: ['फसल लोन', 'ट्रैक्टर लोन', 'सिंचाई लोन'],
    applyText: 'आप टाइपिंग, वॉइस या कॉल मोड से आवेदन दे सकते हैं।',
    applySug: ['वॉइस से ऑटो-फिल', 'सपोर्ट एजेंट को कॉल', 'आवेदन जमा करें'],
    general: loc ? `मैं ${loc} के अनुसार योजनाएं, मंडी भाव, लोन अनुमान और आवेदन सहायता दे सकता हूँ।` : 'मैं आपको योजनाएं, मंडी भाव, लोन अनुमान और आवेदन सहायता तक पहुंचा सकता हूँ।',
    generalSug: ['योजनाएं खोलें', 'मंडी भाव देखें', 'आवेदन शुरू करें'],
  }),

  bho: (loc) => ({
    redirectMsg: (p) => `रउआ के ${p} पेज पर लइ जात बानी।`,
    topSuggestions: ['मुख्य विकल्प दिखाईं', 'वॉइस मोड शुरू करीं', 'आवेदन फॉर्म खोलीं'],
    subsidy: 'ट्रैक्टर सहायता में सब्सिडी लगभग 30% से 40% ले हो सकेला।',
    subsidySug: ['हमार पात्रता जांचीं', 'ट्रैक्टर योजना खोलीं', 'अभी आवेदन करीं'],
    subsidyCards: [
      { title: 'एसएमएएम सहायता', detail: 'उपकरण खरीद पर 40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर सब्सिडी', detail: '₹1.5 लाख तक सहायता' },
    ],
    schemeTractor: 'रउआ ट्रैक्टर सब्सिडी आ कृषि उपकरण लोन खातिर पात्र हो सकत बानी।',
    schemeTractorSug: ['अभी आवेदन करीं', 'लोन पात्रता जांचीं', 'नजदीकी सेवा केंद्र देखीं'],
    schemeTractorCards: [
      { title: 'ट्रैक्टर सब्सिडी', detail: '40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर योजना', detail: '₹1.5 लाख तक सहायता' },
      { title: 'किसान क्रेडिट कार्ड लोन', detail: '₹3 लाख तक लोन' },
    ],
    schemeDefault: 'हम सब्सिडी, फसल बीमा, पीएम-किसान आ मनरेगा में मार्गदर्शन दे सकतानी।',
    schemeDefaultSug: ['पीएम-किसान जानकारी', 'फसल बीमा सहायता', 'आवेदन प्रक्रिया खोलीं'],
    mandiWheat: loc ? `${loc} के आसपास गेहूं के मंडी भाव नीचे उपलब्ध बा।` : 'गेहूं के नजदीकी मंडी भाव नीचे उपलब्ध बा।',
    mandiWheatSug: ['धान के भाव दिखाईं', 'कल के रुझान देखीं', 'नजदीकी मंडी खोलीं'],
    mandiDefault: loc ? `फसल के नाम बताईं, हम ${loc} के आसपास के बाजार भाव दिखा दीहीं।` : 'फसल के नाम बताईं, हम आपके आसपास के बाजार भाव दिखा दीहीं।',
    mandiDefaultSug: ['गेहूं के भाव', 'धान के भाव', 'मक्का के भाव'],
    loanTractor: 'ट्रैक्टर लोन के अनुमान नीचे तइयार बा।',
    loanTractorSug: ['केसीसी विकल्प लीं', 'नाबार्ड लोन तुलना', 'आवेदन फॉर्म पर जाईं'],
    loanTractorCards: [
      { title: 'अनुशंसित राशि', detail: '₹4,00,000' },
      { title: 'अनुमानित ब्याज', detail: '6% सालाना (संकेतक)' },
      { title: 'बेहतर विकल्प', detail: 'केसीसी + नाबार्ड लिंक्ड विकल्प' },
    ],
    loanDefault: 'लोन के उद्देश्य आ राशि बताईं, हम सही सरकारी विकल्प सुझाईब।',
    loanDefaultSug: ['फसल लोन', 'ट्रैक्टर लोन', 'सिंचाई लोन'],
    applyText: 'रउआ टाइपिंग, वॉइस या कॉल मोड से आवेदन दे सकत बानी।',
    applySug: ['वॉइस से ऑटो-फिल', 'सपोर्ट एजेंट के कॉल करीं', 'आवेदन जमा करीं'],
    general: loc ? `हम ${loc} के अनुसार योजना, मंडी भाव, लोन अनुमान आ आवेदन सहायता दे सकतानी।` : 'हम रउआ के योजना, मंडी भाव, लोन अनुमान आ आवेदन सहायता तक पहुंचा सकतानी।',
    generalSug: ['योजना खोलीं', 'मंडी भाव देखीं', 'आवेदन शुरू करीं'],
  }),

  awa: (loc) => ({
    redirectMsg: (p) => `तुमका ${p} पेज पर लइ जात बानी।`,
    topSuggestions: ['मुख्य विकल्प दिखावौ', 'वॉइस मोड शुरू करौ', 'आवेदन फॉर्म खोलौ'],
    subsidy: 'ट्रैक्टर सहायता म सब्सिडी लगभग 30% से 40% तक हो सकत है।',
    subsidySug: ['हमार पात्रता जांचौ', 'ट्रैक्टर योजना खोलौ', 'अभी आवेदन करौ'],
    subsidyCards: [
      { title: 'एसएमएएम सहायता', detail: 'उपकरण खरीद पर 40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर सब्सिडी', detail: '₹1.5 लाख तक सहायता' },
    ],
    schemeTractor: 'तुम ट्रैक्टर सब्सिडी अउर कृषि उपकरण लोन खाति पात्र हो सकत हौ।',
    schemeTractorSug: ['अभी आवेदन करौ', 'लोन पात्रता जांचौ', 'नजदीकी सेवा केंद्र देखौ'],
    schemeTractorCards: [
      { title: 'ट्रैक्टर सब्सिडी', detail: '40% तक सब्सिडी' },
      { title: 'राज्य ट्रैक्टर योजना', detail: '₹1.5 लाख तक सहायता' },
      { title: 'किसान क्रेडिट कार्ड लोन', detail: '₹3 लाख तक लोन' },
    ],
    schemeDefault: 'मैं सब्सिडी, फसल बीमा, पीएम-किसान अउर मनरेगा म मार्गदर्शन दे सकित हौं।',
    schemeDefaultSug: ['पीएम-किसान जानकारी', 'फसल बीमा सहायता', 'आवेदन प्रक्रिया खोलौ'],
    mandiWheat: loc ? `${loc} के आसपास गेहूं क मंडी भाव नीचे उपलब्ध अहैं।` : 'गेहूं क नजदीकी मंडी भाव नीचे उपलब्ध अहैं।',
    mandiWheatSug: ['धान क भाव दिखावौ', 'कल क रुझान देखौ', 'नजदीकी मंडी खोलौ'],
    mandiDefault: loc ? `फसल क नाम बताओ, मैं ${loc} के आसपास के बाजार भाव दिखाई दूंगौ।` : 'फसल क नाम बताओ, मैं तुम्हारे आसपास क बाजार भाव दिखाई दूंगौ।',
    mandiDefaultSug: ['गेहूं क भाव', 'धान क भाव', 'मक्का क भाव'],
    loanTractor: 'ट्रैक्टर लोन क अनुमान नीचे तइयार अहै।',
    loanTractorSug: ['केसीसी विकल्प लेव', 'नाबार्ड लोन तुलना', 'आवेदन फॉर्म पर जावौ'],
    loanTractorCards: [
      { title: 'अनुशंसित राशि', detail: '₹4,00,000' },
      { title: 'अनुमानित ब्याज', detail: '6% सालाना (संकेतक)' },
      { title: 'बेहतर विकल्प', detail: 'केसीसी + नाबार्ड लिंक्ड विकल्प' },
    ],
    loanDefault: 'लोन क उद्देश्य अउर राशि बताओ, मैं सही सरकारी विकल्प सुझाऊंगौ।',
    loanDefaultSug: ['फसल लोन', 'ट्रैक्टर लोन', 'सिंचाई लोन'],
    applyText: 'तुम टाइपिंग, वॉइस या कॉल मोड से आवेदन दे सकत हौ।',
    applySug: ['वॉइस से ऑटो-फिल', 'सपोर्ट एजेंट के कॉल करौ', 'आवेदन जमा करौ'],
    general: loc ? `मैं ${loc} क अनुसार योजना, मंडी भाव, लोन अनुमान अउर आवेदन सहायता दे सकित हौं।` : 'मैं तुमका योजना, मंडी भाव, लोन अनुमान अउर आवेदन सहायता तक पहुंचा सकित हौं।',
    generalSug: ['योजना खोलौ', 'मंडी भाव देखौ', 'आवेदन शुरू करौ'],
  }),

  mr: (loc) => ({
    redirectMsg: (p) => `तुम्हाला ${p} पृष्ठावर नेत आहे.`,
    topSuggestions: ['मुख्य पर्याय दाखवा', 'व्हॉइस मोड सुरू करा', 'अर्ज फॉर्म उघडा'],
    subsidy: 'ट्रॅक्टर सहाय्यात अनुदान साधारणपणे 30% ते 40% असते.',
    subsidySug: ['माझी पात्रता तपासा', 'ट्रॅक्टर योजना उघडा', 'आता अर्ज करा'],
    subsidyCards: [
      { title: 'SMAM सहाय्य', detail: 'उपकरण खरेदीवर 40% पर्यंत अनुदान' },
      { title: 'राज्य ट्रॅक्टर अनुदान', detail: '₹1.5 लाखापर्यंत सहाय्य' },
    ],
    schemeTractor: 'तुम्ही ट्रॅक्टर अनुदान आणि कृषी उपकरण कर्जासाठी पात्र असू शकता.',
    schemeTractorSug: ['आता अर्ज करा', 'कर्ज पात्रता तपासा', 'जवळील सेवा केंद्र पाहा'],
    schemeTractorCards: [
      { title: 'ट्रॅक्टर अनुदान', detail: '40% पर्यंत अनुदान' },
      { title: 'राज्य ट्रॅक्टर योजना', detail: '₹1.5 लाखापर्यंत सहाय्य' },
      { title: 'किसान क्रेडिट कार्ड कर्ज', detail: '₹3 लाखापर्यंत कर्ज' },
    ],
    schemeDefault: 'मी अनुदान, पीक विमा, पीएम-किसान आणि मनरेगा योजनांमध्ये मार्गदर्शन करू शकतो.',
    schemeDefaultSug: ['पीएम-किसान माहिती', 'पीक विमा सहाय्य', 'अर्ज प्रक्रिया उघडा'],
    mandiWheat: loc ? `${loc} जवळील गव्हाचे बाजार भाव खाली उपलब्ध आहेत.` : 'गव्हाचे जवळील बाजार भाव खाली उपलब्ध आहेत.',
    mandiWheatSug: ['भाताचा भाव दाखवा', 'उद्याचा कल पाहा', 'जवळील बाजार उघडा'],
    mandiDefault: loc ? `पीकाचे नाव सांगा, मी ${loc} जवळील बाजार भाव दाखवीन.` : 'पीकाचे नाव सांगा, मी तुमच्या परिसरातील बाजार भाव दाखवीन.',
    mandiDefaultSug: ['गव्हाचा भाव', 'भाताचा भाव', 'मक्याचा भाव'],
    loanTractor: 'ट्रॅक्टर कर्जाचा अंदाज खाली तयार आहे.',
    loanTractorSug: ['KCC पर्याय घ्या', 'NABARD कर्ज तुलना', 'अर्ज फॉर्मवर जा'],
    loanTractorCards: [
      { title: 'शिफारस केलेली रक्कम', detail: '₹4,00,000' },
      { title: 'अंदाजित व्याज', detail: '6% वार्षिक (सांकेतिक)' },
      { title: 'सर्वोत्तम पर्याय', detail: 'KCC + NABARD लिंक्ड उत्पादने' },
    ],
    loanDefault: 'कर्जाचा उद्देश आणि रक्कम सांगा, मी योग्य सरकारी पर्याय सुचवीन.',
    loanDefaultSug: ['पीक कर्ज', 'ट्रॅक्टर कर्ज', 'सिंचन कर्ज'],
    applyText: 'तुम्ही टायपिंग, व्हॉइस किंवा कॉल मोडने अर्ज करू शकता.',
    applySug: ['व्हॉइसने ऑटो-फिल', 'सपोर्ट एजंटला कॉल', 'अर्ज सादर करा'],
    general: loc ? `मी ${loc} नुसार योजना, बाजार भाव, कर्ज अंदाज आणि अर्ज सहाय्य देऊ शकतो.` : 'मी तुम्हाला योजना, बाजार भाव, कर्ज अंदाज आणि अर्ज सहाय्यापर्यंत पोहोचवू शकतो.',
    generalSug: ['योजना उघडा', 'बाजार भाव पाहा', 'अर्ज सुरू करा'],
  }),

  mai: (loc) => ({
    redirectMsg: (p) => `अहाँकेँ ${p} पेज पर लइ जाइत छी।`,
    topSuggestions: ['मुख्य विकल्प देखाबू', 'वॉइस मोड शुरू करू', 'आवेदन फॉर्म खोलू'],
    subsidy: 'ट्रैक्टर सहायतामे सब्सिडी लगभग 30% सँ 40% धरि भऽ सकैत अछि।',
    subsidySug: ['हमर पात्रता जांचू', 'ट्रैक्टर योजना खोलू', 'अखने आवेदन करू'],
    subsidyCards: [
      { title: 'एसएमएएम सहायता', detail: 'उपकरण खरीद पर 40% धरि सब्सिडी' },
      { title: 'राज्य ट्रैक्टर सब्सिडी', detail: '₹1.5 लाख धरि सहायता' },
    ],
    schemeTractor: 'अहाँ ट्रैक्टर सब्सिडी आ कृषि उपकरण ऋणक लेल पात्र भऽ सकैत छी।',
    schemeTractorSug: ['अखने आवेदन करू', 'ऋण पात्रता जांचू', 'नजदीकी सेवा केंद्र देखू'],
    schemeTractorCards: [
      { title: 'ट्रैक्टर सब्सिडी', detail: '40% धरि सब्सिडी' },
      { title: 'राज्य ट्रैक्टर योजना', detail: '₹1.5 लाख धरि सहायता' },
      { title: 'किसान क्रेडिट कार्ड ऋण', detail: '₹3 लाख धरि ऋण' },
    ],
    schemeDefault: 'हम सब्सिडी, फसल बीमा, पीएम-किसान आ मनरेगामे मार्गदर्शन दऽ सकैत छी।',
    schemeDefaultSug: ['पीएम-किसान जानकारी', 'फसल बीमा सहायता', 'आवेदन प्रक्रिया खोलू'],
    mandiWheat: loc ? `${loc}क आसपास गहूमक मंडी भाव नीचाँ उपलब्ध अछि।` : 'गहूमक नजदीकी मंडी भाव नीचाँ उपलब्ध अछि।',
    mandiWheatSug: ['धानक भाव देखाबू', 'काल्हिक रुझान देखू', 'नजदीकी मंडी खोलू'],
    mandiDefault: loc ? `फसलक नाम बताउ, हम ${loc}क आसपासक बाजार भाव देखाएब।` : 'फसलक नाम बताउ, हम अहाँक आसपासक बाजार भाव देखाएब।',
    mandiDefaultSug: ['गहूमक भाव', 'धानक भाव', 'मकैक भाव'],
    loanTractor: 'ट्रैक्टर ऋणक अनुमान नीचाँ तैयार अछि।',
    loanTractorSug: ['केसीसी विकल्प लिअ', 'नाबार्ड ऋण तुलना', 'आवेदन फॉर्म पर जाउ'],
    loanTractorCards: [
      { title: 'अनुशंसित राशि', detail: '₹4,00,000' },
      { title: 'अनुमानित ब्याज', detail: '6% वार्षिक (संकेतक)' },
      { title: 'बेहतर विकल्प', detail: 'केसीसी + नाबार्ड लिंक्ड विकल्प' },
    ],
    loanDefault: 'ऋणक उद्देश्य आ राशि बताउ, हम सही सरकारी विकल्प सुझाएब।',
    loanDefaultSug: ['फसल ऋण', 'ट्रैक्टर ऋण', 'सिंचाई ऋण'],
    applyText: 'अहाँ टाइपिंग, वॉइस या कॉल मोडसँ आवेदन दऽ सकैत छी।',
    applySug: ['वॉइससँ ऑटो-फिल', 'सपोर्ट एजेंटकेँ कॉल', 'आवेदन जमा करू'],
    general: loc ? `हम ${loc}क अनुसार योजना, मंडी भाव, ऋण अनुमान आ आवेदन सहायता दऽ सकैत छी।` : 'हम अहाँकेँ योजना, मंडी भाव, ऋण अनुमान आ आवेदन सहायतातक पहुंचा सकैत छी।',
    generalSug: ['योजना खोलू', 'मंडी भाव देखू', 'आवेदन शुरू करू'],
  }),

  or: (loc) => ({
    redirectMsg: (p) => `ଆପଣଙ୍କୁ ${p} ପୃଷ୍ଠାକୁ ନେଉଛୁ।`,
    topSuggestions: ['ମୁଖ୍ୟ ବିକଳ୍ପ ଦେଖାନ୍ତୁ', 'ଭଏସ ମୋଡ ଆରମ୍ଭ କରନ୍ତୁ', 'ଆବେଦନ ଫର୍ମ ଖୋଲନ୍ତୁ'],
    subsidy: 'ଟ୍ରାକ୍ଟର ସହାୟତାରେ ଅନୁଦାନ ପ୍ରାୟ 30% ରୁ 40% ପର୍ଯ୍ୟନ୍ତ ହୋଇପାରେ।',
    subsidySug: ['ମୋ ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ', 'ଟ୍ରାକ୍ଟର ଯୋଜନା ଖୋଲନ୍ତୁ', 'ବର୍ତ୍ତମାନ ଆବେଦନ କରନ୍ତୁ'],
    subsidyCards: [
      { title: 'SMAM ସହାୟତା', detail: 'ଉପକରଣ କ୍ରୟରେ 40% ପର୍ଯ୍ୟନ୍ତ ଅନୁଦାନ' },
      { title: 'ରାଜ୍ୟ ଟ୍ରାକ୍ଟର ଅନୁଦାନ', detail: '₹1.5 ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ସହାୟତା' },
    ],
    schemeTractor: 'ଆପଣ ଟ୍ରାକ୍ଟର ଅନୁଦାନ ଏବଂ କୃଷି ଉପକରଣ ଋଣ ପାଇଁ ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି।',
    schemeTractorSug: ['ବର୍ତ୍ତମାନ ଆବେଦନ କରନ୍ତୁ', 'ଋଣ ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ', 'ନିକଟ ସେବା କେନ୍ଦ୍ର ଦେଖନ୍ତୁ'],
    schemeTractorCards: [
      { title: 'ଟ୍ରାକ୍ଟର ଅନୁଦାନ', detail: '40% ପର୍ଯ୍ୟନ୍ତ ଅନୁଦାନ' },
      { title: 'ରାଜ୍ୟ ଟ୍ରାକ୍ଟର ଯୋଜନା', detail: '₹1.5 ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ସହାୟତା' },
      { title: 'କିସାନ କ୍ରେଡିଟ କାର୍ଡ ଋଣ', detail: '₹3 ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଋଣ' },
    ],
    schemeDefault: 'ମୁଁ ଅନୁଦାନ, ଫସଲ ବୀମା, ପିଏମ-କିସାନ ଏବଂ ମନରେଗାରେ ମାର୍ଗଦର୍ଶନ ଦେଇ ପାରିବି।',
    schemeDefaultSug: ['ପିଏମ-କିସାନ ସୂଚନା', 'ଫସଲ ବୀମା ସହାୟତା', 'ଆବେଦନ ପ୍ରକ୍ରିୟା ଖୋଲନ୍ତୁ'],
    mandiWheat: loc ? `${loc} ନିକଟ ଗହମ ମଣ୍ଡି ଭାବ ନିମ୍ନରେ ଉପଲବ୍ଧ।` : 'ଗହମ ନିକଟ ମଣ୍ଡି ଭାବ ନିମ୍ନରେ ଉପଲବ୍ଧ।',
    mandiWheatSug: ['ଧାନ ଭାବ ଦେଖାନ୍ତୁ', 'ଆସନ୍ତାକାଲ ରୁଝାନ ଦେଖନ୍ତୁ', 'ନିକଟ ମଣ୍ଡି ଖୋଲନ୍ତୁ'],
    mandiDefault: loc ? `ଫସଲ ନାମ ବୁଝାନ୍ତୁ, ମୁଁ ${loc} ନିକଟ ବଜାର ଭାବ ଦେଖାଇବି।` : 'ଫସଲ ନାମ ବୁଝାନ୍ତୁ, ମୁଁ ଆପଣ ନିକଟ ବଜାର ଭାବ ଦେଖାଇବି।',
    mandiDefaultSug: ['ଗହମ ଭାବ', 'ଧାନ ଭାବ', 'ମକା ଭାବ'],
    loanTractor: 'ଟ୍ରାକ୍ଟର ଋଣ ଅନୁମାନ ନିମ୍ନରେ ପ୍ରସ୍ତୁତ।',
    loanTractorSug: ['KCC ବିକଳ୍ପ ନିଅନ୍ତୁ', 'NABARD ଋଣ ତୁଳନା', 'ଆବେଦନ ଫର୍ମକୁ ଯାଆନ୍ତୁ'],
    loanTractorCards: [
      { title: 'ସୁପାରିଶ ରାଶି', detail: '₹4,00,000' },
      { title: 'ଅନୁମାନ ସୁଧ', detail: '6% ବାର୍ଷିକ (ସଙ୍କେତ)' },
      { title: 'ସର୍ବୋତ୍ତମ ବିକଳ୍ପ', detail: 'KCC + NABARD ଲିଙ୍କ୍ଡ ଉତ୍ପାଦ' },
    ],
    loanDefault: 'ଋଣ ଉଦ୍ଦେଶ୍ୟ ଓ ରାଶି ଜଣାନ୍ତୁ, ମୁଁ ସଠିକ ସରକାରୀ ବିକଳ୍ପ ସୁଝାଇବି।',
    loanDefaultSug: ['ଫସଲ ଋଣ', 'ଟ୍ରାକ୍ଟର ଋଣ', 'ଜଳସେଚନ ଋଣ'],
    applyText: 'ଆପଣ ଟାଇପିଂ, ଭଏସ ବା କଲ ମୋଡ ଦ୍ୱାରା ଆବେଦନ ଦେଇ ପାରିବେ।',
    applySug: ['ଭଏସ ଦ୍ୱାରା ଅଟୋ-ଫିଲ', 'ସପୋର୍ଟ ଏଜେଣ୍ଟଙ୍କୁ କଲ', 'ଆବେଦନ ଦାଖଲ କରନ୍ତୁ'],
    general: loc ? `ମୁଁ ${loc} ଅନୁଯାୟୀ ଯୋଜନା, ମଣ୍ଡି ଭାବ, ଋଣ ଅନୁମାନ ଓ ଆବେଦନ ସହାୟତା ଦେଇ ପାରିବି।` : 'ମୁଁ ଆପଣଙ୍କୁ ଯୋଜନା, ମଣ୍ଡି ଭାବ, ଋଣ ଅନୁମାନ ଓ ଆବେଦନ ସହାୟତାରେ ଦିଗ ଦେଖାଇ ପାରିବି।',
    generalSug: ['ଯୋଜନା ଖୋଲନ୍ତୁ', 'ମଣ୍ଡି ଭାବ ଦେଖନ୍ତୁ', 'ଆବେଦନ ଆରମ୍ଭ କରନ୍ତୁ'],
  }),
}

/** Resolve copy for a given language, falling back to Hindi then English */
function getCopy(lang, locationLabel) {
  const builder = ASSISTANT_COPY[lang] || ASSISTANT_COPY['hi']
  return builder(locationLabel)
}

export function createAssistantReply({ query, page, memoryIntent, lang, pageLabels, cards, location }) {
  const lower = query.toLowerCase()
  const redirect = detectRedirect(query)
  const locationLabel = getLocationLabel(location)
  const copy = getCopy(lang, locationLabel)

  if (redirect && redirect !== page) {
    return {
      response: copy.redirectMsg(pageLabels[redirect] || redirect),
      suggestions: copy.topSuggestions,
      redirect,
      cards: [],
      intent: redirect,
    }
  }

  if ((lower.includes('kitni subsidy') || lower.includes('how much subsidy')) && memoryIntent === 'tractor') {
    return {
      response: copy.subsidy,
      suggestions: copy.subsidySug,
      cards: copy.subsidyCards,
      intent: 'tractor',
    }
  }

  if (page === 'schemes') {
    if (lower.includes('tractor') || lower.includes('ट्रैक्टर') || lower.includes('ट्रॅक्टर') || lower.includes('ଟ୍ରାକ୍ଟର')) {
      return {
        response: copy.schemeTractor,
        suggestions: copy.schemeTractorSug,
        cards: copy.schemeTractorCards,
        intent: 'tractor',
      }
    }
    return { response: copy.schemeDefault, suggestions: copy.schemeDefaultSug, cards: cards.schemes, intent: 'scheme_general' }
  }

  if (page === 'mandi') {
    if (lower.includes('gehu') || lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('गहूं') || lower.includes('गहूम') || lower.includes('ଗହମ')) {
      return { response: copy.mandiWheat, suggestions: copy.mandiWheatSug, cards: cards.mandi, intent: 'wheat_rate' }
    }
    return { response: copy.mandiDefault, suggestions: copy.mandiDefaultSug, cards: cards.mandi, intent: 'mandi_general' }
  }

  if (page === 'loan') {
    if (lower.includes('tractor') || lower.includes('ट्रैक्टर') || lower.includes('ट्रॅक्टर') || lower.includes('ଟ୍ରାକ୍ଟର')) {
      return {
        response: copy.loanTractor,
        suggestions: copy.loanTractorSug,
        cards: copy.loanTractorCards,
        intent: 'tractor',
      }
    }
    return { response: copy.loanDefault, suggestions: copy.loanDefaultSug, cards: [], intent: 'loan_general' }
  }

  if (page === 'apply') {
    return { response: copy.applyText, suggestions: copy.applySug, cards: [], intent: memoryIntent || 'apply' }
  }

  return { response: copy.general, suggestions: copy.generalSug, cards: [], intent: memoryIntent || 'general' }
}