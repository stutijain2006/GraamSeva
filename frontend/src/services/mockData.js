/**
 * Mock Data - Fallback when APIs are unavailable
 * All data structures match API response format.
 *
 * Language-independent data (prices, IDs, numeric values) is shared.
 * Language-dependent strings are organized into per-language maps.
 * Use getMock(lang, key) to retrieve the right data for a given language.
 */

// ---------------------------------------------------------------------------
// SCHEMES
// All scheme structural data is language-neutral (IDs, eligibility numbers).
// Only display strings (desc, benefits, documents, howToApply) are localized.
// ---------------------------------------------------------------------------

const SCHEME_STRINGS = {
  1: {
    hi: { desc: 'किसान सम्मान निधि योजना', benefits: ['हर 4 महीने में ₹2,000', 'सीधे बैंक में DBT ट्रांसफर', 'कोई बिचौलिया नहीं'], howToApply: ['CSC केंद्र पर जाएं', 'आधार + जमीन के कागज जमा करें', 'जिला कार्यालय द्वारा सत्यापन', 'पैसे बैंक में आएंगे'], documents: ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाता', 'मोबाइल नंबर'] },
    bho: { desc: 'किसान सम्मान निधि योजना', benefits: ['हर 4 महीना में ₹2,000', 'सीधे बैंक में DBT ट्रांसफर', 'कवनो बिचौलिया नइखे'], howToApply: ['CSC केंद्र पर जाईं', 'आधार + जमीन के कागज जमा करीं', 'जिला दफ्तर से सत्यापन', 'पइसा बैंक में आई'], documents: ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाता', 'मोबाइल नंबर'] },
    awa: { desc: 'किसान सम्मान निधि योजना', benefits: ['हर 4 महीना म ₹2,000', 'सीधे बैंक म DBT ट्रांसफर', 'कौनौ बिचौलिया नाहीं'], howToApply: ['CSC केंद्र पर जावौ', 'आधार + जमीन क कागज जमा करौ', 'जिला दफ्तर से सत्यापन', 'पइसा बैंक म आई'], documents: ['आधार कार्ड', 'जमीन क कागजात', 'बैंक खाता', 'मोबाइल नंबर'] },
    mr: { desc: 'किसान सन्मान निधी योजना', benefits: ['दर 4 महिन्यांनी ₹2,000', 'थेट बँकेत DBT हस्तांतरण', 'कोणताही मध्यस्थ नाही'], howToApply: ['CSC केंद्रावर जा', 'आधार + जमीन कागदपत्रे जमा करा', 'जिल्हा कार्यालयाकडून पडताळणी', 'पैसे बँकेत येतील'], documents: ['आधार कार्ड', 'जमीन कागदपत्रे', 'बँक खाते', 'मोबाइल नंबर'] },
    mai: { desc: 'किसान सम्मान निधि योजना', benefits: ['हर 4 माससँ ₹2,000', 'सीधे बैंकमे DBT ट्रांसफर', 'कोनो बिचौलिया नहि'], howToApply: ['CSC केंद्र पर जाउ', 'आधार + जमीनक कागज जमा करू', 'जिला कार्यालयसँ सत्यापन', 'पाइ बैंकमे आएत'], documents: ['आधार कार्ड', 'जमीनक कागजात', 'बैंक खाता', 'मोबाइल नंबर'] },
    or: { desc: 'କୃଷକ ସମ୍ମାନ ନିଧି ଯୋଜନା', benefits: ['ପ୍ରତି 4 ମାସରେ ₹2,000', 'ସିଧା ବ୍ୟାଙ୍କକୁ DBT ସ୍ଥାନାନ୍ତର', 'କୌଣସି ମଧ୍ୟସ୍ଥ ନାହିଁ'], howToApply: ['CSC କେନ୍ଦ୍ରକୁ ଯାଆନ୍ତୁ', 'ଆଧାର + ଜମି କାଗଜ ଦାଖଲ କରନ୍ତୁ', 'ଜିଲ୍ଲା କାର୍ଯ୍ୟାଳୟ ଦ୍ୱାରା ଯାଞ୍ଚ', 'ଟଙ୍କା ବ୍ୟାଙ୍କକୁ ଆସିବ'], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି କାଗଜପତ୍ର', 'ବ୍ୟାଙ୍କ ଖାତା', 'ମୋବାଇଲ ନମ୍ବର'] },
    en: { desc: 'Kisan Samman Nidhi Scheme', benefits: ['₹2,000 every 4 months', 'Direct DBT bank transfer', 'No middlemen'], howToApply: ['Visit CSC center', 'Submit Aadhaar + land records', 'Verification by district office', 'Money credited to bank'], documents: ['Aadhaar card', 'Land ownership papers', 'Bank account', 'Mobile number'] },
  },
  2: {
    hi: { desc: 'प्रधानमंत्री फसल बीमा योजना', benefits: ['फसल नुकसान पर बीमा कवर', 'कम प्रीमियम (1.5%–2%)', 'बाढ़, सूखा, कीटों से सुरक्षा', 'सीधे बैंक में दावा भुगतान'], howToApply: ['नजदीकी बैंक या CSC केंद्र जाएं', 'फसल विवरण दर्ज कराएं', 'छोटा बीमा प्रीमियम दें', 'जमीन और आधार दस्तावेज जमा करें', 'बीमा पुष्टि लें'], documents: ['आधार कार्ड', 'जमीन / पट्टा दस्तावेज', 'बैंक खाते की जानकारी', 'फसल बोआई घोषणा'] },
    bho: { desc: 'फसल बीमा योजना', benefits: ['फसल बर्बाद होले बीमा', 'कम प्रीमियम (1.5%–2%)', 'बाढ़, सूखा, कीड़ा से सुरक्षा', 'सीधे बैंक में भुगतान'], howToApply: ['नजदीकी बैंक या CSC केंद्र जाईं', 'फसल के बारे में बताईं', 'थोड़ा प्रीमियम दीं', 'जमीन आ आधार कागज दीं', 'बीमा पुष्टि लीं'], documents: ['आधार कार्ड', 'जमीन / पट्टा कागज', 'बैंक खाता', 'फसल बोआई घोषणा'] },
    awa: { desc: 'फसल बीमा योजना', benefits: ['फसल बर्बाद होने पर बीमा', 'कम प्रीमियम (1.5%–2%)', 'बाढ़, सूखा, कीड़ा से बचाव', 'सीधे बैंक म भुगतान'], howToApply: ['नजदीकी बैंक या CSC केंद्र जावौ', 'फसल क विवरण दर्ज करावौ', 'छोट प्रीमियम देव', 'जमीन आ आधार कागज जमा करौ', 'बीमा पुष्टि लेव'], documents: ['आधार कार्ड', 'जमीन / पट्टा कागज', 'बैंक खाता', 'फसल बोआई घोषणा'] },
    mr: { desc: 'प्रधानमंत्री पीक विमा योजना', benefits: ['पीक नुकसानीवर विमा संरक्षण', 'कमी प्रीमियम (1.5%–2%)', 'पूर, दुष्काळ, कीडींपासून संरक्षण', 'थेट बँकेत दावा भरपाई'], howToApply: ['जवळील बँक किंवा CSC केंद्रावर जा', 'पीक तपशील नोंदवा', 'छोटा विमा प्रीमियम भरा', 'जमीन आणि आधार कागदपत्रे जमा करा', 'विमा पुष्टी घ्या'], documents: ['आधार कार्ड', 'जमीन / भाडेपट्टा कागदपत्रे', 'बँक खाते तपशील', 'पीक पेरणी जाहीरनामा'] },
    mai: { desc: 'फसल बीमा योजना', benefits: ['फसल नष्ट होए पर बीमा', 'कम प्रीमियम (1.5%–2%)', 'बाढ़, सूखा, कीड़ासँ रक्षा', 'सीधे बैंकमे दावा'], howToApply: ['नजदीकी बैंक या CSC केंद्र जाउ', 'फसलक विवरण दर्ज करू', 'छोट प्रीमियम दिअ', 'जमीन आ आधार कागज जमा करू', 'बीमा पुष्टि लिअ'], documents: ['आधार कार्ड', 'जमीन / पट्टा कागज', 'बैंक खाता', 'फसल बोआई घोषणा'] },
    or: { desc: 'ପ୍ରଧାନମନ୍ତ୍ରୀ ଫସଲ ବୀମା ଯୋଜନା', benefits: ['ଫସଲ ନଷ୍ଟ ହେଲେ ବୀମା', 'କମ୍ ପ୍ରିମିୟମ (1.5%–2%)', 'ବନ୍ୟା, ଖରା, ପୋକରୁ ସୁରକ୍ଷା', 'ସିଧା ବ୍ୟାଙ୍କକୁ ଦାବି ଭୁଗତାନ'], howToApply: ['ନିକଟ ବ୍ୟାଙ୍କ ବା CSC କେନ୍ଦ୍ରକୁ ଯାଆନ୍ତୁ', 'ଫସଲ ବିବରଣ ଦାଖଲ କରନ୍ତୁ', 'ଛୋଟ ପ୍ରିମିୟମ ଦିଅନ୍ତୁ', 'ଜମି ଓ ଆଧାର କାଗଜ ଦାଖଲ କରନ୍ତୁ', 'ବୀମା ନିଶ୍ଚିତକରଣ ନିଅନ୍ତୁ'], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି / ଲିଜ୍ ଦଲିଲ', 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣ', 'ଫସଲ ବୁଣା ଘୋଷଣା'] },
    en: { desc: 'PM Crop Insurance Scheme', benefits: ['Insurance coverage against crop failure', 'Low premium (1.5%–2%)', 'Protection from floods, drought, pests', 'Direct claim settlement to bank account'], howToApply: ['Visit nearest bank or CSC center', 'Register your crop details', 'Pay small insurance premium', 'Submit land and Aadhaar documents', 'Receive insurance coverage confirmation'], documents: ['Aadhaar card', 'Land ownership / lease documents', 'Bank account details', 'Crop sowing declaration'] },
  },
  // ── id 3: Kisan Credit Card ────────────────────────────────────────────────
  3: {
    hi: { desc: 'किसान क्रेडिट कार्ड — फसल खेती और संबंधित गतिविधियों के लिए कार्यशील पूंजी ऋण', benefits: ['कम ब्याज दर पर फसल ऋण', 'समय पर भुगतान पर ब्याज छूट', 'डेयरी, मछली पालन, मुर्गीपालन के लिए भी', 'आसान नवीनीकरण'], howToApply: ['नजदीकी बैंक शाखा जाएं', 'जमीन विवरण के साथ KCC फॉर्म जमा करें', 'KYC और क्षेत्र सत्यापन', 'स्वीकृत क्रेडिट सीमा प्राप्त करें'], documents: ['आधार कार्ड', 'जमीन रिकॉर्ड / खेती का प्रमाण', 'बैंक KYC दस्तावेज', 'फोटो'] },
    bho: { desc: 'किसान क्रेडिट कार्ड — खेती आ उससे जुड़ल कामन खातिर कार्यशील पूंजी ऋण', benefits: ['कम ब्याज पर फसल ऋण', 'समय से भुगतान पर ब्याज छूट', 'डेयरी, मछली, मुर्गी के लिए भी', 'आसान नवीनीकरण'], howToApply: ['नजदीकी बैंक शाखा जाईं', 'जमीन के कागज के साथ KCC फॉर्म दीं', 'KYC आ खेत सत्यापन', 'स्वीकृत क्रेडिट सीमा मिली'], documents: ['आधार कार्ड', 'जमीन रिकॉर्ड / खेती प्रमाण', 'बैंक KYC कागज', 'फोटो'] },
    awa: { desc: 'किसान क्रेडिट कार्ड — खेती अउर उससे जुड़े काम खाति कार्यशील पूंजी ऋण', benefits: ['कम ब्याज म फसल ऋण', 'समय पर भुगतान पर ब्याज छूट', 'डेयरी, मछली, मुर्गी खाति भी', 'आसान नवीनीकरण'], howToApply: ['नजदीकी बैंक शाखा जावौ', 'जमीन क कागज के साथ KCC फॉर्म दावौ', 'KYC आ खेत सत्यापन', 'स्वीकृत क्रेडिट सीमा मिलि'], documents: ['आधार कार्ड', 'जमीन रिकॉर्ड / खेती क प्रमाण', 'बैंक KYC कागज', 'फोटो'] },
    mr: { desc: 'किसान क्रेडिट कार्ड — पीक लागवड आणि संलग्न उपक्रमांसाठी खेळते भांडवल कर्ज', benefits: ['कमी व्याजदरावर पीक कर्ज', 'वेळेवर परतफेडीवर व्याज सवलत', 'दुग्धव्यवसाय, मत्स्यपालन, कुक्कुटपालनासाठी', 'सुलभ नूतनीकरण'], howToApply: ['जवळच्या बँक शाखेत जा', 'जमीन तपशीलासह KCC फॉर्म जमा करा', 'KYC आणि क्षेत्र पडताळणी', 'मंजूर क्रेडिट मर्यादा मिळवा'], documents: ['आधार कार्ड', 'जमीन नोंद / लागवड पुरावा', 'बँक KYC कागदपत्रे', 'फोटो'] },
    mai: { desc: 'किसान क्रेडिट कार्ड — फसल खेती आ संबंधित कामक लेल कार्यशील पूंजी ऋण', benefits: ['कम ब्याज पर फसल ऋण', 'समय पर भुगतान पर ब्याज छूट', 'डेयरी, मत्स्य, मुर्गीक लेल', 'आसान नवीनीकरण'], howToApply: ['नजदीकी बैंक शाखा जाउ', 'जमीनक कागज के साथ KCC फॉर्म दिअ', 'KYC आ खेत सत्यापन', 'स्वीकृत क्रेडिट सीमा लिअ'], documents: ['आधार कार्ड', 'जमीन रिकॉर्ड / खेतीक प्रमाण', 'बैंक KYC कागज', 'फोटो'] },
    or: { desc: 'କିସାନ କ୍ରେଡିଟ କାର୍ଡ — ଫସଲ ଚାଷ ଓ ସଂଶ୍ଳିଷ୍ଟ କାର୍ଯ୍ୟ ପାଇଁ ଚଳଚ୍ଚଳ ପୁଞ୍ଜି ଋଣ', benefits: ['କମ ସୁଧ ହାରରେ ଫସଲ ଋଣ', 'ସଠିକ ସମୟରେ ଫେରଷ୍ଟ ଦେଲେ ସୁଧ ଛାଡ', 'ଦୁଗ୍ଧ, ମୀନ, କୁକ୍କୁଟ ଚାଷ ପାଇଁ', 'ସହଜ ନବୀକରଣ'], howToApply: ['ନିକଟ ବ୍ୟାଙ୍କ ଶାଖାକୁ ଯାଆନ୍ତୁ', 'ଜମି ବିବରଣ ସହ KCC ଫର୍ମ ଦାଖଲ କରନ୍ତୁ', 'KYC ଓ କ୍ଷେତ୍ର ଯାଞ୍ଚ', 'ଅନୁମୋଦିତ ଋଣ ସୀମା ପ୍ରାପ୍ତ କରନ୍ତୁ'], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି ରେକର୍ଡ / ଚାଷ ପ୍ରମାଣ', 'ବ୍ୟାଙ୍କ KYC କାଗଜ', 'ଫଟୋ'] },
    en: { desc: 'Kisan Credit Card — working capital credit for crop cultivation and allied activities', benefits: ['Low-interest crop credit', 'Interest subvention on timely repayment', 'Credit for dairy, fisheries, poultry', 'Simplified renewal'], howToApply: ['Visit nearest bank branch', 'Submit KCC form with land details', 'KYC and field verification', 'Receive sanctioned credit limit'], documents: ['Aadhaar card', 'Land record / cultivation proof', 'Bank KYC documents', 'Photograph'] },
  },
  // ── id 4: Soil Health Card ─────────────────────────────────────────────────
  4: {
    hi: { desc: 'मिट्टी स्वास्थ्य कार्ड योजना — उत्पादकता सुधार के लिए मिट्टी परीक्षण और पोषक तत्व सलाह', benefits: ['मुफ्त या सब्सिडी युक्त मिट्टी परीक्षण', 'संतुलित उर्वरक उपयोग', 'फसल उत्पादन में सुधार', 'खेती लागत में कमी'], howToApply: ['कृषि विस्तार अधिकारी से संपर्क करें', 'खेत से मिट्टी का नमूना जमा करें', 'प्रयोगशाला परीक्षण', 'मिट्टी स्वास्थ्य कार्ड रिपोर्ट लें'], documents: ['आधार कार्ड', 'जमीन का विवरण', 'मोबाइल नंबर'] },
    bho: { desc: 'माटी स्वास्थ्य कार्ड योजना — माटी जाँच आ खाद सलाह', benefits: ['मुफ्त या सस्ती माटी जाँच', 'संतुलित खाद इस्तेमाल', 'फसल उत्पादन में सुधार', 'खेती लागत कम'], howToApply: ['कृषि अधिकारी से बात करीं', 'खेत से माटी नमूना दीं', 'प्रयोगशाला जाँच', 'माटी स्वास्थ्य कार्ड रिपोर्ट लीं'], documents: ['आधार कार्ड', 'जमीन के विवरण', 'मोबाइल नंबर'] },
    awa: { desc: 'माटी स्वास्थ्य कार्ड योजना — माटी परीक्षण अउर पोषक तत्व सलाह', benefits: ['मुफ्त या सस्ती माटी परीक्षण', 'संतुलित खाद उपयोग', 'फसल उत्पादन म सुधार', 'खेती लागत म कमी'], howToApply: ['कृषि अधिकारी से मिलौ', 'खेत से माटी नमूना दावौ', 'प्रयोगशाला परीक्षण', 'माटी स्वास्थ्य कार्ड रिपोर्ट लेव'], documents: ['आधार कार्ड', 'जमीन क विवरण', 'मोबाइल नंबर'] },
    mr: { desc: 'माती आरोग्य कार्ड योजना — उत्पादकता सुधारण्यासाठी माती परीक्षण आणि पोषक सल्ला', benefits: ['मोफत किंवा अनुदानित माती परीक्षण', 'संतुलित खत वापर', 'पीक उत्पादनात सुधारणा', 'लागवड खर्च कमी'], howToApply: ['कृषी विस्तार अधिकाऱ्याशी संपर्क करा', 'शेतातून माती नमुना द्या', 'प्रयोगशाळा परीक्षण', 'माती आरोग्य कार्ड अहवाल घ्या'], documents: ['आधार कार्ड', 'जमीन तपशील', 'मोबाइल नंबर'] },
    mai: { desc: 'माटी स्वास्थ्य कार्ड योजना — उत्पादकता सुधार लेल माटी परीक्षण आ पोषक सलाह', benefits: ['मुफ्त या सस्ती माटी परीक्षण', 'संतुलित खाद उपयोग', 'फसल उत्पादनमे सुधार', 'खेती लागत कम'], howToApply: ['कृषि अधिकारीसँ सम्पर्क करू', 'खेतसँ माटी नमूना दिअ', 'प्रयोगशाला परीक्षण', 'माटी स्वास्थ्य कार्ड रिपोर्ट लिअ'], documents: ['आधार कार्ड', 'जमीनक विवरण', 'मोबाइल नंबर'] },
    or: { desc: 'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଯୋଜନା — ଉତ୍ପାଦନ ଉନ୍ନତି ପାଇଁ ମାଟି ପରୀକ୍ଷା ଓ ସାର ପରାମର୍ଶ', benefits: ['ମୁଫ୍ତ ବା ଅନୁଦାନ ଯୁକ୍ତ ମାଟି ପରୀକ୍ଷା', 'ସନ୍ତୁଳିତ ସାର ବ୍ୟବହାର', 'ଫସଲ ଉତ୍ପାଦନ ବୃଦ୍ଧି', 'ଚାଷ ଖର୍ଚ୍ଚ ହ୍ରାସ'], howToApply: ['କୃଷି ସଂସ୍ପ୍ରସାରଣ ଅଧିକାରୀଙ୍କୁ ଯୋଗାଯୋଗ କରନ୍ତୁ', 'ଜମିରୁ ମାଟି ନମୁନା ଦାଖଲ କରନ୍ତୁ', 'ପ୍ରୟୋଗଶାଳା ପରୀକ୍ଷା', 'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ରିପୋର୍ଟ ନିଅନ୍ତୁ'], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି ବିବରଣ', 'ମୋବାଇଲ ନମ୍ବର'] },
    en: { desc: 'Soil Health Card Scheme — soil testing and nutrient advisory to improve productivity', benefits: ['Free or subsidized soil testing', 'Balanced fertilizer usage', 'Improved crop yield', 'Reduced cultivation cost'], howToApply: ['Contact agriculture extension officer', 'Submit soil sample from field', 'Laboratory testing', 'Collect soil health card report'], documents: ['Aadhaar card', 'Land details', 'Mobile number'] },
  },
  // ── id 5: PM KUSUM ─────────────────────────────────────────────────────────
  5: {
    hi: { desc: 'PM KUSUM — किसानों के लिए सौर पंप और विकेंद्रीकृत सौर ऊर्जा', benefits: ['सौर पंप स्थापना पर सब्सिडी', 'सिंचाई बिजली लागत में कमी', 'दिन में विश्वसनीय बिजली', 'बिजली बिक्री से अतिरिक्त आय (जहाँ लागू)'], howToApply: ['राज्य नवीकरणीय ऊर्जा पोर्टल पर आवेदन करें', 'जरूरी दस्तावेज अपलोड करें', 'एजेंसी द्वारा साइट सत्यापन', 'सब्सिडी अनुमोदन और स्थापना'], documents: ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाते की जानकारी', 'बिजली कनेक्शन विवरण'] },
    bho: { desc: 'PM KUSUM — किसानन खातिर सोलर पंप आ सौर ऊर्जा', benefits: ['सोलर पंप पर सब्सिडी', 'सिंचाई बिजली खर्च कम', 'दिन में पक्का बिजली', 'बिजली बेचले से अतिरिक्त कमाई'], howToApply: ['राज्य सोलर पोर्टल पर आवेदन करीं', 'जरूरी कागज अपलोड करीं', 'एजेंसी से साइट सत्यापन', 'सब्सिडी मंजूरी आ स्थापना'], documents: ['आधार कार्ड', 'जमीन के कागज', 'बैंक खाता', 'बिजली कनेक्शन'] },
    awa: { desc: 'PM KUSUM — किसानन खाति सोलर पंप अउर सौर ऊर्जा', benefits: ['सोलर पंप पर सब्सिडी', 'सिंचाई बिजली खर्च म कमी', 'दिन म भरोसेमंद बिजली', 'बिजली बेचे से अतिरिक्त आय'], howToApply: ['राज्य सोलर पोर्टल पर आवेदन करौ', 'जरूरी कागज अपलोड करौ', 'एजेंसी से साइट सत्यापन', 'सब्सिडी मंजूरी आ स्थापना'], documents: ['आधार कार्ड', 'जमीन क कागज', 'बैंक खाता', 'बिजली कनेक्शन विवरण'] },
    mr: { desc: 'PM KUSUM — शेतकऱ्यांसाठी सौर पंप आणि विकेंद्रित सौर ऊर्जा', benefits: ['सौर पंप बसवण्यावर अनुदान', 'सिंचन वीज खर्च कमी', 'दिवसा विश्वासार्ह वीज', 'वीज विक्रीतून अतिरिक्त उत्पन्न (लागू असल्यास)'], howToApply: ['राज्य नवीकरणीय ऊर्जा पोर्टलवर अर्ज करा', 'आवश्यक कागदपत्रे अपलोड करा', 'एजन्सीद्वारे साइट पडताळणी', 'अनुदान मंजुरी आणि स्थापना'], documents: ['आधार कार्ड', 'जमीन कागदपत्रे', 'बँक खाते तपशील', 'वीज कनेक्शन तपशील'] },
    mai: { desc: 'PM KUSUM — किसानक लेल सोलर पंप आ विकेंद्रीकृत सौर ऊर्जा', benefits: ['सोलर पंप स्थापना पर सब्सिडी', 'सिंचाई बिजली लागत कम', 'दिनमे विश्वसनीय बिजली', 'बिजली बिक्रीसँ अतिरिक्त आय'], howToApply: ['राज्य सोलर पोर्टल पर आवेदन करू', 'जरूरी कागज अपलोड करू', 'एजेंसीसँ साइट सत्यापन', 'सब्सिडी मंजूरी आ स्थापना'], documents: ['आधार कार्ड', 'जमीनक कागज', 'बैंक खाता', 'बिजली कनेक्शन विवरण'] },
    or: { desc: 'PM KUSUM — ଚାଷୀଙ୍କ ପାଇଁ ସୌର ପଂପ ଓ ବିକେନ୍ଦ୍ରୀଭୂତ ସୌର ଶକ୍ତି', benefits: ['ସୌର ପଂପ ସ୍ଥାପନରେ ଅନୁଦାନ', 'ଜଳସେଚନ ବିଦ୍ୟୁତ ଖର୍ଚ୍ଚ ହ୍ରାସ', 'ଦିନ ସମୟରେ ନିର୍ଭରଯୋଗ୍ୟ ବିଦ୍ୟୁତ', 'ବିଦ୍ୟୁତ ବିକ୍ରିରୁ ଅତିରିକ୍ତ ଆୟ'], howToApply: ['ରାଜ୍ୟ ସୌର ଶକ୍ତି ପୋର୍ଟାଲରେ ଆବେଦନ କରନ୍ତୁ', 'ଆବଶ୍ୟକ କାଗଜ ଅପଲୋଡ କରନ୍ତୁ', 'ଏଜେନ୍ସି ଦ୍ୱାରା ସ୍ଥଳ ଯାଞ୍ଚ', 'ଅନୁଦାନ ଅନୁମୋଦନ ଓ ସ୍ଥାପନା'], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି କାଗଜ', 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣ', 'ବିଦ୍ୟୁତ ସଂଯୋଗ ବିବରଣ'] },
    en: { desc: 'PM KUSUM — solar pumps and decentralized solar power for farmers', benefits: ['Subsidy on solar pump installation', 'Lower irrigation power cost', 'Reliable daytime power', 'Additional income from power sale (where applicable)'], howToApply: ['Apply through state renewable portal', 'Upload required documents', 'Site verification by agency', 'Subsidy approval and installation'], documents: ['Aadhaar card', 'Land ownership papers', 'Bank account details', 'Electricity connection details'] },
  },
  // ── id 6: Delhi Kisan Registration ────────────────────────────────────────
  6: {
    hi: { desc: 'दिल्ली किसान पंजीकरण एवं सब्सिडी — दिल्ली में पंजीकृत किसानों के लिए राज्य सहायता', benefits: ['राज्य कृषि योजनाओं में प्राथमिकता', 'इनपुट सब्सिडी के अवसर', 'विभाग की सलाहकार सेवाएं'], howToApply: ['दिल्ली कृषि पोर्टल पर पंजीकरण करें', 'किसान प्रोफाइल और प्रमाण जमा करें', 'विभाग द्वारा सत्यापन', 'उपलब्ध राज्य लाभों के लिए आवेदन करें'], documents: ['आधार कार्ड', 'दिल्ली का पता प्रमाण', 'जमीन / खेती का प्रमाण', 'बैंक खाते की जानकारी'] },
    bho: { desc: 'दिल्ली किसान पंजीकरण — दिल्ली में किसानन खातिर राज्य सहायता', benefits: ['राज्य कृषि योजना में पहिला मौका', 'इनपुट सब्सिडी', 'विभाग से सलाह'], howToApply: ['दिल्ली कृषि पोर्टल पर पंजीकरण करीं', 'किसान प्रोफाइल आ प्रमाण दीं', 'विभाग से सत्यापन', 'राज्य लाभ खातिर आवेदन करीं'], documents: ['आधार कार्ड', 'दिल्ली का पता प्रमाण', 'जमीन / खेती प्रमाण', 'बैंक खाता'] },
    awa: { desc: 'दिल्ली किसान पंजीकरण — दिल्ली म किसानन खाति राज्य सहायता', benefits: ['राज्य कृषि योजना म प्राथमिकता', 'इनपुट सब्सिडी', 'विभाग से सलाह'], howToApply: ['दिल्ली कृषि पोर्टल पर पंजीकरण करौ', 'किसान प्रोफाइल आ प्रमाण दावौ', 'विभाग से सत्यापन', 'राज्य लाभ खाति आवेदन करौ'], documents: ['आधार कार्ड', 'दिल्ली क पता प्रमाण', 'जमीन / खेती क प्रमाण', 'बैंक खाता'] },
    mr: { desc: 'दिल्ली शेतकरी नोंदणी व अनुदान — दिल्लीतील नोंदणीकृत शेतकऱ्यांसाठी राज्य सहाय्य', benefits: ['राज्य कृषी योजनांना प्राधान्य', 'निविष्ठा अनुदान संधी', 'विभागाच्या सल्लागार सेवा'], howToApply: ['दिल्ली कृषी पोर्टलवर नोंदणी करा', 'शेतकरी प्रोफाइल आणि पुरावे सादर करा', 'विभागाची पडताळणी', 'उपलब्ध राज्य लाभांसाठी अर्ज करा'], documents: ['आधार कार्ड', 'दिल्ली पत्ता पुरावा', 'जमीन / लागवड पुरावा', 'बँक खाते तपशील'] },
    mai: { desc: 'दिल्ली किसान पंजीकरण — दिल्लीमे पंजीकृत किसानक लेल राज्य सहायता', benefits: ['राज्य कृषि योजनामे प्राथमिकता', 'इनपुट सब्सिडी', 'विभागसँ सलाह'], howToApply: ['दिल्ली कृषि पोर्टल पर पंजीकरण करू', 'किसान प्रोफाइल आ प्रमाण दिअ', 'विभागसँ सत्यापन', 'राज्य लाभक लेल आवेदन करू'], documents: ['आधार कार्ड', 'दिल्लीक पता प्रमाण', 'जमीन / खेतीक प्रमाण', 'बैंक खाता'] },
    or: { desc: 'ଦିଲ୍ଲୀ କୃଷକ ପଞ୍ଜୀକରଣ ଓ ଅନୁଦାନ — ଦିଲ୍ଲୀରେ ପଞ୍ଜୀଭୁକ୍ତ ଚାଷୀଙ୍କ ପାଇଁ ରାଜ୍ୟ ସହାୟତା', benefits: ['ରାଜ୍ୟ କୃଷି ଯୋଜନାରେ ଅଗ୍ରାଧିକାର', 'ଇନପୁଟ ଅନୁଦାନ ସୁଯୋଗ', 'ବିଭାଗ ପରାମର୍ଶ ସେବା'], howToApply: ['ଦିଲ୍ଲୀ କୃଷି ପୋର୍ଟାଲରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ', 'ଚାଷୀ ପ୍ରୋଫାଇଲ ଓ ପ୍ରମାଣ ଦାଖଲ କରନ୍ତୁ', 'ବିଭାଗ ଯାଞ୍ଚ', 'ଉପଲବ୍ଧ ରାଜ୍ୟ ସୁବିଧା ପାଇଁ ଆବେଦନ'], documents: ['ଆଧାର କାର୍ଡ', 'ଦିଲ୍ଲୀ ଠିକଣା ପ୍ରମାଣ', 'ଜମି / ଚାଷ ପ୍ରମାଣ', 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣ'] },
    en: { desc: 'Delhi Kisan Registration and Subsidy — state support for registered farmers in Delhi', benefits: ['Priority access to state agriculture schemes', 'Input subsidy opportunities', 'Department advisory services'], howToApply: ['Register at Delhi agriculture portal', 'Submit farmer profile and proof', 'Department validation', 'Apply to available state benefits'], documents: ['Aadhaar card', 'Address proof in Delhi', 'Land / cultivation proof', 'Bank account details'] },
  },
  // ── id 7: Mukhyamantri Kisan Samman Nidhi UP ──────────────────────────────
  7: {
    hi: { desc: 'मुख्यमंत्री किसान सम्मान निधि (UP) — उत्तर प्रदेश में किसानों के लिए राज्य स्तरीय अतिरिक्त सहायता', benefits: ['चुनिंदा श्रेणियों में अनुपूरक सहायता', 'राज्य पोर्टल पर ट्रैकिंग', 'जिला स्तरीय सुविधा'], howToApply: ['आधिकारिक UP योजना पोर्टल पर जाएं', 'किसान पंजीकरण पूरा करें', 'प्रमाण अपलोड करें और जमा करें', 'जिला कार्यालय द्वारा स्थिति ट्रैक करें'], documents: ['आधार कार्ड', 'UP निवास / पता प्रमाण', 'जमीन का विवरण', 'बैंक खाते की जानकारी'] },
    bho: { desc: 'मुख्यमंत्री किसान सम्मान निधि (UP) — UP में किसानन खातिर राज्य स्तरीय अतिरिक्त सहायता', benefits: ['चुनल श्रेणी में अनुपूरक सहायता', 'राज्य पोर्टल पर ट्रैकिंग', 'जिला स्तर सुविधा'], howToApply: ['UP योजना पोर्टल पर जाईं', 'किसान पंजीकरण पूरा करीं', 'प्रमाण अपलोड करीं', 'जिला दफ्तर से स्थिति जानीं'], documents: ['आधार कार्ड', 'UP निवास / पता प्रमाण', 'जमीन के विवरण', 'बैंक खाता'] },
    awa: { desc: 'मुख्यमंत्री किसान सम्मान निधि (UP) — UP म किसानन खाति अतिरिक्त राज्य सहायता', benefits: ['चुनल श्रेणी म अनुपूरक सहायता', 'राज्य पोर्टल पर ट्रैकिंग', 'जिला स्तर सुविधा'], howToApply: ['UP योजना पोर्टल पर जावौ', 'किसान पंजीकरण पूरा करौ', 'प्रमाण अपलोड करौ', 'जिला दफ्तर से स्थिति जानौ'], documents: ['आधार कार्ड', 'UP निवास / पता प्रमाण', 'जमीन क विवरण', 'बैंक खाता'] },
    mr: { desc: 'मुख्यमंत्री किसान सम्मान निधी (UP) — उत्तर प्रदेशातील शेतकऱ्यांसाठी राज्यस्तरीय अतिरिक्त सहाय्य', benefits: ['निवडक श्रेणींमध्ये पूरक सहाय्य', 'राज्य पोर्टलवर ट्रॅकिंग', 'जिल्हा स्तर सुविधा'], howToApply: ['अधिकृत UP योजना पोर्टलवर जा', 'शेतकरी नोंदणी पूर्ण करा', 'पुरावे अपलोड करा', 'जिल्हा कार्यालयाद्वारे स्थिती ट्रॅक करा'], documents: ['आधार कार्ड', 'UP अधिवास / पत्ता पुरावा', 'जमीन तपशील', 'बँक खाते तपशील'] },
    mai: { desc: 'मुख्यमंत्री किसान सम्मान निधि (UP) — UP म किसानक लेल राज्य स्तरीय अतिरिक्त सहायता', benefits: ['चुनिंदा श्रेणीमे अनुपूरक सहायता', 'राज्य पोर्टल पर ट्रैकिंग', 'जिला स्तर सुविधा'], howToApply: ['UP योजना पोर्टल पर जाउ', 'किसान पंजीकरण पूरा करू', 'प्रमाण अपलोड करू', 'जिला कार्यालयसँ स्थिति ट्रैक करू'], documents: ['आधार कार्ड', 'UP निवास / पता प्रमाण', 'जमीनक विवरण', 'बैंक खाता'] },
    or: { desc: 'ମୁଖ୍ୟମନ୍ତ୍ରୀ କିସାନ ସମ୍ମାନ ନିଧି (UP) — ଉତ୍ତର ପ୍ରଦେଶରେ ଚାଷୀଙ୍କ ପାଇଁ ରାଜ୍ୟ ସ୍ତରୀୟ ଅତିରିକ୍ତ ସହାୟତା', benefits: ['ଚୟନିତ ବର୍ଗରେ ଅନୁପୂରକ ସହାୟତା', 'ରାଜ୍ୟ ପୋର୍ଟାଲରେ ଟ୍ରାକିଂ', 'ଜିଲ୍ଲା ସ୍ତର ସୁବିଧା'], howToApply: ['ଅଧିକୃତ UP ଯୋଜନା ପୋର୍ଟାଲ ଯାଆନ୍ତୁ', 'ଚାଷୀ ପଞ୍ଜୀକରଣ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ', 'ପ୍ରମାଣ ଅପଲୋଡ କରନ୍ତୁ', 'ଜିଲ୍ଲା କାର୍ଯ୍ୟାଳୟ ଦ୍ୱାରା ସ୍ଥିତି ଟ୍ରାକ କରନ୍ତୁ'], documents: ['ଆଧାର କାର୍ଡ', 'UP ବାସ / ଠିକଣା ପ୍ରମାଣ', 'ଜମି ବିବରଣ', 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣ'] },
    en: { desc: 'Mukhyamantri Kisan Samman Nidhi (UP) — state-level top-up support for farmers in Uttar Pradesh', benefits: ['Supplementary support in selected categories', 'State portal tracking', 'District-level facilitation'], howToApply: ['Visit official UP scheme portal', 'Complete farmer registration', 'Upload proofs and submit', 'Track status via district office'], documents: ['Aadhaar card', 'UP domicile/address proof', 'Land details', 'Bank account details'] },
  },
  // ── id 8: Maharashtra Shetkari Karjmukti ──────────────────────────────────
  8: {
    hi: { desc: 'महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ति (महाराष्ट्र) — पात्र किसानों को कर्ज राहत', benefits: ['पात्र श्रेणियों के लिए कर्ज राहत', 'पोर्टल आधारित दावा और सत्यापन', 'जिला स्तरीय सहायता'], howToApply: ['राज्य पोर्टल पर पात्रता जांचें', 'ऋण और पहचान विवरण जमा करें', 'जिला प्राधिकरण द्वारा सत्यापन', 'स्वीकृत प्रक्रिया के अनुसार राहत जमा'], documents: ['आधार कार्ड', 'ऋण खाते की जानकारी', 'किसान पंजीकरण प्रमाण', 'बैंक और पहचान दस्तावेज'] },
    bho: { desc: 'महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ति (महाराष्ट्र) — पात्र किसानन खातिर कर्ज राहत', benefits: ['पात्र श्रेणी खातिर कर्ज राहत', 'पोर्टल से दावा आ सत्यापन', 'जिला स्तर सहायता'], howToApply: ['राज्य पोर्टल पर पात्रता जांचीं', 'ऋण आ पहचान विवरण दीं', 'जिला प्राधिकरण से सत्यापन', 'स्वीकृत प्रक्रिया से राहत'], documents: ['आधार कार्ड', 'ऋण खाता', 'किसान पंजीकरण प्रमाण', 'बैंक आ पहचान कागज'] },
    awa: { desc: 'महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ति (महाराष्ट्र) — पात्र किसानन खाति कर्ज राहत', benefits: ['पात्र श्रेणी खाति कर्ज राहत', 'पोर्टल से दावा आ सत्यापन', 'जिला स्तर सहायता'], howToApply: ['राज्य पोर्टल पर पात्रता जांचौ', 'ऋण आ पहचान विवरण दावौ', 'जिला प्राधिकरण से सत्यापन', 'स्वीकृत प्रक्रिया से राहत'], documents: ['आधार कार्ड', 'ऋण खाता', 'किसान पंजीकरण प्रमाण', 'बैंक आ पहचान कागज'] },
    mr: { desc: 'महात्मा जोतिराव फुले शेतकरी कर्जमुक्ती (महाराष्ट्र) — पात्र शेतकऱ्यांना कर्जमाफी सहाय्य', benefits: ['पात्र श्रेणींसाठी कर्जमाफी', 'पोर्टल आधारित दावा आणि पडताळणी', 'जिल्हा स्तर सहाय्य'], howToApply: ['राज्य पोर्टलवर पात्रता तपासा', 'कर्ज आणि ओळख तपशील सादर करा', 'जिल्हा प्राधिकरणाची पडताळणी', 'मंजूर प्रक्रियेनुसार मदत'], documents: ['आधार कार्ड', 'कर्ज खाते तपशील', 'शेतकरी नोंदणी पुरावा', 'बँक आणि ओळख कागदपत्रे'] },
    mai: { desc: 'महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ति (महाराष्ट्र) — पात्र किसानक लेल कर्ज राहत', benefits: ['पात्र श्रेणीक लेल कर्ज राहत', 'पोर्टल आधारित दावा आ सत्यापन', 'जिला स्तर सहायता'], howToApply: ['राज्य पोर्टल पर पात्रता जाँचू', 'ऋण आ पहचान विवरण दिअ', 'जिला प्राधिकरणसँ सत्यापन', 'स्वीकृत प्रक्रियासँ राहत'], documents: ['आधार कार्ड', 'ऋण खाता', 'किसान पंजीकरण प्रमाण', 'बैंक आ पहचान कागज'] },
    or: { desc: 'ମହାତ୍ମା ଜ୍ୟୋତିରାଓ ଫୁଲେ ଶେତକାରୀ କର୍ଜମୁକ୍ତି (ମହାରାଷ୍ଟ୍ର) — ଯୋଗ୍ୟ ଚାଷୀଙ୍କ ପାଇଁ ଋଣ ମୁକ୍ତି ସହାୟତା', benefits: ['ଯୋଗ୍ୟ ବର୍ଗ ପାଇଁ ଋଣ ମୁକ୍ତି', 'ପୋର୍ଟାଲ ଆଧାରିତ ଦାବି ଓ ଯାଞ୍ଚ', 'ଜିଲ୍ଲା ସ୍ତର ସହାୟତା'], howToApply: ['ରାଜ୍ୟ ପୋର୍ଟାଲରେ ଯୋଗ୍ୟତା ଯାଞ୍ଚ', 'ଋଣ ଓ ପରିଚୟ ବିବରଣ ଦାଖଲ', 'ଜିଲ୍ଲା ପ୍ରାଧିକରଣ ଯାଞ୍ଚ', 'ଅନୁମୋଦିତ ପ୍ରକ୍ରିୟା ଅନୁଯାୟୀ ରାହତ'], documents: ['ଆଧାର କାର୍ଡ', 'ଋଣ ଖାତା ବିବରଣ', 'ଚାଷୀ ପଞ୍ଜୀକରଣ ପ୍ରମାଣ', 'ବ୍ୟାଙ୍କ ଓ ପରିଚୟ କାଗଜ'] },
    en: { desc: 'Mahatma Jyotirao Phule Shetkari Karjmukti (Maharashtra) — debt relief support for eligible farmers', benefits: ['Debt relief for eligible categories', 'Portal-based claim and verification', 'District-level support'], howToApply: ['Check eligibility on state portal', 'Submit loan and identity details', 'Verification by district authority', 'Relief credited as per approved process'], documents: ['Aadhaar card', 'Loan account details', 'Farmer registration proof', 'Bank and identity documents'] },
  },
}

// Scheme structural data shared across all languages
const SCHEME_BASE = [
  {
    id: 1,
    name: 'PM-KISAN',
    icon: '🌾',
    details: '₹6,000 annual income support',
    governmentLevel: 'Central Government',
    states: ['ALL'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: '₹10 lakh/year', landRequired: '≤ 2 hectares' },
    authority: { ministry: 'Ministry of Agriculture', stateBody: 'State Agriculture Department', localBody: 'Gram Panchayat' },
  },
  {
    id: 2,
    name: 'PM Fasal Bima Yojana',
    icon: '🛡️',
    details: 'Crop insurance against natural disasters',
    governmentLevel: 'Central + State Government',
    states: ['ALL'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'No income limit', landRequired: 'Must own or cultivate farmland' },
    authority: { ministry: 'Ministry of Agriculture & Farmers Welfare', stateBody: 'State Agriculture Insurance Office', localBody: 'District Agriculture Officer' },
  },
  {
    id: 3,
    name: 'Kisan Credit Card (KCC)',
    icon: '💳',
    details: 'Working capital credit for crop cultivation and allied activities',
    governmentLevel: 'Central Government',
    states: ['ALL'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'As per bank norm', landRequired: 'Cultivator / tenant farmer / SHG / JLG' },
    authority: { ministry: 'Ministry of Agriculture', stateBody: 'State Level Bankers Committee', localBody: 'Scheduled Commercial Banks / RRBs' },
  },
  {
    id: 4,
    name: 'Soil Health Card Scheme',
    icon: '🧪',
    details: 'Soil testing and nutrient advisory to improve productivity',
    governmentLevel: 'Central + State Government',
    states: ['ALL'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'No income limit', landRequired: 'Farm plot details required' },
    authority: { ministry: 'Ministry of Agriculture & Farmers Welfare', stateBody: 'State Agriculture Department', localBody: 'Block Agriculture Office' },
  },
  {
    id: 5,
    name: 'PM KUSUM',
    icon: '☀️',
    details: 'Solar pumps and decentralized solar power for farmers',
    governmentLevel: 'Central + State Government',
    states: ['ALL'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'As per state guideline', landRequired: 'Land / irrigation requirement' },
    authority: { ministry: 'Ministry of New and Renewable Energy', stateBody: 'State Nodal Renewable Agency', localBody: 'DISCOM / District Office' },
  },
  {
    id: 6,
    name: 'Delhi Kisan Registration and Subsidy',
    icon: '🏙️',
    details: 'State support for registered farmers in Delhi',
    governmentLevel: 'Delhi Government',
    states: ['Delhi', 'NCT of Delhi'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'As per Delhi guideline', landRequired: 'Farmer registration in Delhi' },
    authority: { ministry: 'Department of Development, GNCTD', stateBody: 'Delhi Agriculture Department', localBody: 'District Agriculture Office' },
  },
  {
    id: 7,
    name: 'Mukhyamantri Kisan Samman Nidhi (UP)',
    icon: '🌱',
    details: 'State-level top-up support for farmers in Uttar Pradesh',
    governmentLevel: 'Uttar Pradesh Government',
    states: ['Uttar Pradesh', 'UP'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'As per UP guideline', landRequired: 'Registered farmer in Uttar Pradesh' },
    authority: { ministry: 'Government of Uttar Pradesh', stateBody: 'UP Agriculture Department', localBody: 'Tehsil / Block Office' },
  },
  {
    id: 8,
    name: 'Mahatma Jyotirao Phule Shetkari Karjmukti',
    icon: '🤝',
    details: 'Debt relief support program for eligible farmers in Maharashtra',
    governmentLevel: 'Maharashtra Government',
    states: ['Maharashtra'],
    eligibility: { gender: 'All', maritalStatus: 'All', incomeLimit: 'As per Maharashtra guideline', landRequired: 'Eligible farmer as per state criteria' },
    authority: { ministry: 'Government of Maharashtra', stateBody: 'Cooperation and Agriculture Department', localBody: 'District Cooperative Office' },
  },
]

// ---------------------------------------------------------------------------
// ELIGIBILITY
// ---------------------------------------------------------------------------

const ELIGIBILITY_STRINGS = {
  1: {
    hi: { title: 'PM-KISAN - किसान सम्मान निधि योजना', description: 'खेती में लगे सभी भारतीय किसानों के लिए आर्थिक सहायता योजना', requirements: [{ item: 'भारतीय नागरिक होना चाहिए', status: 'verified' }, { item: 'खेती योग्य जमीन होनी चाहिए', status: 'verified' }, { item: '2 हेक्टेयर तक की जमीन', status: 'verified' }, { item: 'आधार निर्भर बैंक खाता', status: 'pending' }], documents: ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाते की जानकारी', 'मोबाइल नंबर'], nextSteps: 'फॉर्म भरने के बाद 30 दिन में ₹2,000 खाते में आएंगे' },
    bho: { title: 'PM-KISAN - किसान सम्मान निधि योजना', description: 'खेती करे वाला सभी भारतीय किसानन खातिर आर्थिक सहायता', requirements: [{ item: 'भारतीय नागरिक होखे के चाही', status: 'verified' }, { item: 'खेती लायक जमीन होखे के चाही', status: 'verified' }, { item: '2 हेक्टेयर तक के जमीन', status: 'verified' }, { item: 'आधार से जुड़ल बैंक खाता', status: 'pending' }], documents: ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाता', 'मोबाइल नंबर'], nextSteps: 'फॉर्म भरला के बाद 30 दिन में ₹2,000 खाते में आई' },
    awa: { title: 'PM-KISAN - किसान सम्मान निधि योजना', description: 'खेती करे वाला सब किसानन खाति आर्थिक सहायता', requirements: [{ item: 'भारतीय नागरिक होनौ चाही', status: 'verified' }, { item: 'खेती लायक जमीन होनी चाही', status: 'verified' }, { item: '2 हेक्टेयर तक क जमीन', status: 'verified' }, { item: 'आधार से जुड़ल बैंक खाता', status: 'pending' }], documents: ['आधार कार्ड', 'जमीन क कागजात', 'बैंक खाता', 'मोबाइल नंबर'], nextSteps: 'फॉर्म भरे के बाद 30 दिन म ₹2,000 खाते म आईहैं' },
    mr: { title: 'PM-KISAN - किसान सन्मान निधी योजना', description: 'शेती करणाऱ्या सर्व भारतीय शेतकऱ्यांसाठी आर्थिक सहाय्य योजना', requirements: [{ item: 'भारतीय नागरिक असणे आवश्यक', status: 'verified' }, { item: 'शेतजमीन असणे आवश्यक', status: 'verified' }, { item: '2 हेक्टरपर्यंत जमीन', status: 'verified' }, { item: 'आधार लिंक बँक खाते', status: 'pending' }], documents: ['आधार कार्ड', 'जमीन कागदपत्रे', 'बँक खाते माहिती', 'मोबाइल नंबर'], nextSteps: 'फॉर्म भरल्यानंतर 30 दिवसांत ₹2,000 खात्यात येतील' },
    mai: { title: 'PM-KISAN - किसान सम्मान निधि योजना', description: 'खेती करैत सभ भारतीय किसानक लेल आर्थिक सहायता', requirements: [{ item: 'भारतीय नागरिक होएबाक चाही', status: 'verified' }, { item: 'खेती लायक जमीन होएबाक चाही', status: 'verified' }, { item: '2 हेक्टेयर धरि जमीन', status: 'verified' }, { item: 'आधार लिंक बैंक खाता', status: 'pending' }], documents: ['आधार कार्ड', 'जमीनक कागजात', 'बैंक खाता', 'मोबाइल नंबर'], nextSteps: 'फॉर्म भरलाक बाद 30 दिनमे ₹2,000 खातामे आएत' },
    or: { title: 'PM-KISAN - କୃଷକ ସମ୍ମାନ ନିଧି ଯୋଜନା', description: 'ଚାଷ କରୁଥିବା ସମସ୍ତ ଭାରତୀୟ କୃଷକଙ୍କ ପାଇଁ ଆର୍ଥିକ ସହାୟତା', requirements: [{ item: 'ଭାରତୀୟ ନାଗରିକ ହୋଇଥିବା ଆବଶ୍ୟକ', status: 'verified' }, { item: 'ଚାଷ ଜମି ଥିବା ଆବଶ୍ୟକ', status: 'verified' }, { item: '2 ହେକ୍ଟର ପର୍ଯ୍ୟନ୍ତ ଜମି', status: 'verified' }, { item: 'ଆଧାର ଲିଙ୍କ ବ୍ୟାଙ୍କ ଖାତା', status: 'pending' }], documents: ['ଆଧାର କାର୍ଡ', 'ଜମି କାଗଜପତ୍ର', 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣ', 'ମୋବାଇଲ ନମ୍ବର'], nextSteps: 'ଫର୍ମ ଭରିବା ପରେ 30 ଦିନ ମଧ୍ୟରେ ₹2,000 ଖାତାକୁ ଆସିବ' },
    en: { title: 'PM-KISAN - Kisan Samman Nidhi Scheme', description: 'Financial support scheme for all Indian farmers engaged in farming', requirements: [{ item: 'Must be an Indian citizen', status: 'verified' }, { item: 'Must own cultivable land', status: 'verified' }, { item: 'Land up to 2 hectares', status: 'verified' }, { item: 'Aadhaar-linked bank account', status: 'pending' }], documents: ['Aadhaar card', 'Land ownership papers', 'Bank account details', 'Mobile number'], nextSteps: 'After submitting the form, ₹2,000 will be credited within 30 days' },
  },
}

// ---------------------------------------------------------------------------
// APPLICATION RESPONSE — next steps are language-dependent
// ---------------------------------------------------------------------------

const APPLICATION_NEXT_STEPS = {
  hi: ['आपका आवेदन क्षेत्रीय कार्यालय को भेजा जाएगा', 'अधिकारी आपसे 3-5 दिनों में संपर्क करेंगे', 'मूल दस्तावेज़ ले जाकर ब्लॉक ऑफिस जाएँ', 'मंजूरी के बाद 7 दिन में पैसे खाते में आएंगे'],
  bho: ['रउआ के आवेदन क्षेत्रीय कार्यालय के भेजल जाई', 'अधिकारी रउआ से 3-5 दिन में संपर्क करीहन', 'मूल कागज ले के ब्लॉक ऑफिस जाईं', 'मंजूरी के बाद 7 दिन में पइसा खाते में आई'],
  awa: ['रउ के आवेदन क्षेत्रीय कार्यालय म भेजा जाई', 'अधिकारी रउ से 3-5 दिन म संपर्क करिहैं', 'मूल कागज लेक ब्लॉक ऑफिस जावौ', 'मंजूरी के बाद 7 दिन म पइसा खाते म आईहैं'],
  mr: ['तुमचा अर्ज प्रादेशिक कार्यालयाला पाठवला जाईल', 'अधिकारी 3-5 दिवसांत तुमच्याशी संपर्क करतील', 'मूळ कागदपत्रे घेऊन ब्लॉक ऑफिसला जा', 'मंजुरीनंतर 7 दिवसांत पैसे खात्यात येतील'],
  mai: ['अहाँक आवेदन क्षेत्रीय कार्यालयकेँ पठाओल जाएत', 'अधिकारी अहाँसँ 3-5 दिनमे संपर्क करताह', 'मूल कागज लए ब्लॉक ऑफिस जाउ', 'मंजूरीक बाद 7 दिनमे पाइ खातामे आएत'],
  or: ['ଆପଣଙ୍କ ଆବେଦନ ଆଞ୍ଚଳିକ କାର୍ଯ୍ୟାଳୟକୁ ପଠାଯିବ', 'ଅଧିକାରୀ 3-5 ଦିନ ମଧ୍ୟରେ ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବେ', 'ମୂଳ କାଗଜ ଧରି ବ୍ଲକ ଅଫିସ ଯାଆନ୍ତୁ', 'ଅନୁମୋଦନ ପରେ 7 ଦିନ ମଧ୍ୟରେ ଟଙ୍କା ଖାତାକୁ ଆସିବ'],
  en: ['Your application will be sent to the regional office', 'An officer will contact you within 3-5 days', 'Visit the block office with original documents', 'Money will be credited within 7 days of approval'],
}

// ---------------------------------------------------------------------------
// LATEST OFFERS
// ---------------------------------------------------------------------------

const LATEST_OFFERS_STRINGS = {
  hi: [
    { id: 101, title: 'नई PM-KISAN वृद्धि', desc: '₹2,000 से बढ़कर ₹3,000 प्रति किश्त', icon: '📢', badge: 'नया', date: '2 दिन पहले', type: 'update' },
    { id: 102, title: 'फसल बीमा विस्तार', desc: '10 और राज्यों में उपलब्ध', icon: '🛡️', badge: 'अपडेट', date: '5 दिन पहले', type: 'expansion' },
    { id: 103, title: 'डिजिटल साक्षरता योजना', desc: '₹500 की छात्रवृत्ति आवेदन के लिए खुली', icon: '💻', badge: 'नया', date: 'आज', type: 'new' },
    { id: 104, title: 'बेरोजगारी भत्ता संशोधन', desc: '₹500 से ₹750 किया गया', icon: '💰', badge: 'अपडेट', date: '1 दिन पहले', type: 'update' },
    { id: 105, title: 'महिला उद्यम योजना', desc: 'महिला किसानों के लिए ₹5 लाख तक ऋण', icon: '👩‍🌾', badge: 'नया', date: '3 दिन पहले', type: 'new' },
  ],
  bho: [
    { id: 101, title: 'PM-KISAN में बढ़ोतरी', desc: '₹2,000 से बढ़ के ₹3,000 प्रति किश्त', icon: '📢', badge: 'नया', date: '2 दिन पहिले', type: 'update' },
    { id: 102, title: 'फसल बीमा के विस्तार', desc: '10 अउर राज्यन में उपलब्ध', icon: '🛡️', badge: 'अपडेट', date: '5 दिन पहिले', type: 'expansion' },
    { id: 103, title: 'डिजिटल साक्षरता योजना', desc: '₹500 के छात्रवृत्ति खातिर आवेदन खुलल', icon: '💻', badge: 'नया', date: 'आज', type: 'new' },
    { id: 104, title: 'बेरोजगारी भत्ता बढ़ल', desc: '₹500 से ₹750 कइल गइल', icon: '💰', badge: 'अपडेट', date: '1 दिन पहिले', type: 'update' },
    { id: 105, title: 'महिला उद्यम योजना', desc: 'महिला किसानन खातिर ₹5 लाख तक ऋण', icon: '👩‍🌾', badge: 'नया', date: '3 दिन पहिले', type: 'new' },
  ],
  awa: [
    { id: 101, title: 'PM-KISAN म बढ़ोतरी', desc: '₹2,000 से बढ़क ₹3,000 प्रति किश्त', icon: '📢', badge: 'नया', date: '2 दिन पहिले', type: 'update' },
    { id: 102, title: 'फसल बीमा क विस्तार', desc: '10 अउर राज्यन म उपलब्ध', icon: '🛡️', badge: 'अपडेट', date: '5 दिन पहिले', type: 'expansion' },
    { id: 103, title: 'डिजिटल साक्षरता योजना', desc: '₹500 क छात्रवृत्ति खाति आवेदन खुलल', icon: '💻', badge: 'नया', date: 'आज', type: 'new' },
    { id: 104, title: 'बेरोजगारी भत्ता बढ़ाओ गयौ', desc: '₹500 से ₹750 कइल गयौ', icon: '💰', badge: 'अपडेट', date: '1 दिन पहिले', type: 'update' },
    { id: 105, title: 'महिला उद्यम योजना', desc: 'महिला किसानन खाति ₹5 लाख तक ऋण', icon: '👩‍🌾', badge: 'नया', date: '3 दिन पहिले', type: 'new' },
  ],
  mr: [
    { id: 101, title: 'PM-KISAN वाढ', desc: '₹2,000 वरून ₹3,000 प्रति हप्ता', icon: '📢', badge: 'नवीन', date: '2 दिवसांपूर्वी', type: 'update' },
    { id: 102, title: 'पीक विमा विस्तार', desc: '10 अधिक राज्यांत उपलब्ध', icon: '🛡️', badge: 'अपडेट', date: '5 दिवसांपूर्वी', type: 'expansion' },
    { id: 103, title: 'डिजिटल साक्षरता योजना', desc: '₹500 शिष्यवृत्तीसाठी अर्ज सुरू', icon: '💻', badge: 'नवीन', date: 'आज', type: 'new' },
    { id: 104, title: 'बेरोजगारी भत्ता सुधारणा', desc: '₹500 वरून ₹750 करण्यात आले', icon: '💰', badge: 'अपडेट', date: '1 दिवसापूर्वी', type: 'update' },
    { id: 105, title: 'महिला उद्यम योजना', desc: 'महिला शेतकऱ्यांसाठी ₹5 लाखापर्यंत कर्ज', icon: '👩‍🌾', badge: 'नवीन', date: '3 दिवसांपूर्वी', type: 'new' },
  ],
  mai: [
    { id: 101, title: 'PM-KISAN मे वृद्धि', desc: '₹2,000 सँ ₹3,000 प्रति किश्त', icon: '📢', badge: 'नव', date: '2 दिन पहिने', type: 'update' },
    { id: 102, title: 'फसल बीमाक विस्तार', desc: '10 और राज्यमे उपलब्ध', icon: '🛡️', badge: 'अपडेट', date: '5 दिन पहिने', type: 'expansion' },
    { id: 103, title: 'डिजिटल साक्षरता योजना', desc: '₹500 छात्रवृत्ति खातिर आवेदन खुजल', icon: '💻', badge: 'नव', date: 'आइ', type: 'new' },
    { id: 104, title: 'बेरोजगारी भत्ता संशोधन', desc: '₹500 सँ ₹750 कएल गेल', icon: '💰', badge: 'अपडेट', date: '1 दिन पहिने', type: 'update' },
    { id: 105, title: 'महिला उद्यम योजना', desc: 'महिला किसानक लेल ₹5 लाख धरि ऋण', icon: '👩‍🌾', badge: 'नव', date: '3 दिन पहिने', type: 'new' },
  ],
  or: [
    { id: 101, title: 'PM-KISAN ବୃଦ୍ଧି', desc: '₹2,000 ରୁ ₹3,000 ପ୍ରତି କିସ୍ତ', icon: '📢', badge: 'ନୂଆ', date: '2 ଦିନ ଆଗ', type: 'update' },
    { id: 102, title: 'ଫସଲ ବୀମା ବିସ୍ତାର', desc: '10 ଅଧିକ ରାଜ୍ୟରେ ଉପଲବ୍ଧ', icon: '🛡️', badge: 'ଅପଡେଟ', date: '5 ଦିନ ଆଗ', type: 'expansion' },
    { id: 103, title: 'ଡିଜିଟାଲ ସାକ୍ଷରତା ଯୋଜନା', desc: '₹500 ଛାତ୍ରବୃତ୍ତି ପାଇଁ ଆବେଦନ ଖୋଲା', icon: '💻', badge: 'ନୂଆ', date: 'ଆଜି', type: 'new' },
    { id: 104, title: 'ବେକାର ଭତ୍ତା ସଂଶୋଧନ', desc: '₹500 ରୁ ₹750 ସଂଶୋଧିତ', icon: '💰', badge: 'ଅପଡେଟ', date: '1 ଦିନ ଆଗ', type: 'update' },
    { id: 105, title: 'ମହିଳା ଉଦ୍ୟମ ଯୋଜନା', desc: 'ମହିଳା କୃଷକଙ୍କ ପାଇଁ ₹5 ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଋଣ', icon: '👩‍🌾', badge: 'ନୂଆ', date: '3 ଦିନ ଆଗ', type: 'new' },
  ],
  en: [
    { id: 101, title: 'New PM-KISAN Increase', desc: '₹2,000 raised to ₹3,000 per instalment', icon: '📢', badge: 'New', date: '2 days ago', type: 'update' },
    { id: 102, title: 'Crop Insurance Expanded', desc: 'Now available in 10 more states', icon: '🛡️', badge: 'Update', date: '5 days ago', type: 'expansion' },
    { id: 103, title: 'Digital Literacy Scheme', desc: '₹500 scholarship applications open', icon: '💻', badge: 'New', date: 'Today', type: 'new' },
    { id: 104, title: 'Unemployment Allowance Revised', desc: 'Raised from ₹500 to ₹750', icon: '💰', badge: 'Update', date: '1 day ago', type: 'update' },
    { id: 105, title: 'Women Enterprise Scheme', desc: 'Loans up to ₹5 lakh for women farmers', icon: '👩‍🌾', badge: 'New', date: '3 days ago', type: 'new' },
  ],
}

// ---------------------------------------------------------------------------
// LOAN OPTIONS
// ---------------------------------------------------------------------------

const LOAN_OPTIONS_STRINGS = {
  hi: [
    { id: 1, title: 'कृषि उपकरण लोन', detail: 'ट्रैक्टर, थ्रेशर और अन्य उपकरण के लिए', amount: '₹3-10 लाख', interest: '7-9%', tenure: '3-7 वर्ष', eligibility: 'खेती योग्य जमीन आवश्यक' },
    { id: 2, title: 'फसल लोन', detail: 'बीज, खाद, कीटनाशक के लिए अल्पकालिक ऋण', amount: '₹50,000-5 लाख', interest: '4-7%', tenure: '6-12 माह', eligibility: 'खेती का प्रमाण पत्र चाहिए' },
    { id: 3, title: 'पशुपालन लोन', detail: 'गाय, भैंस, मुर्गी पालन के लिए', amount: '₹1-5 लाख', interest: '8-10%', tenure: '3-5 वर्ष', eligibility: 'पशुपालन प्रशिक्षण या अनुभव' },
    { id: 4, title: 'भूमि विकास लोन', detail: 'सिंचाई, बोरवेल, तालाब खुदाई के लिए', amount: '₹2-8 लाख', interest: '9-11%', tenure: '5-10 वर्ष', eligibility: 'ज़मीन का स्वामित्व आवश्यक' },
    { id: 5, title: 'मुद्रा लोन', detail: 'छोटे व्यवसाय शुरू करने के लिए', amount: '₹50,000-10 लाख', interest: '8-12%', tenure: '3-5 वर्ष', eligibility: 'व्यवसाय योजना आवश्यक' },
  ],
  bho: [
    { id: 1, title: 'कृषि उपकरण लोन', detail: 'ट्रैक्टर, थ्रेशर आ अन्य उपकरण खातिर', amount: '₹3-10 लाख', interest: '7-9%', tenure: '3-7 साल', eligibility: 'खेती लायक जमीन चाही' },
    { id: 2, title: 'फसल लोन', detail: 'बीज, खाद, दवाई खातिर अल्पकालिक ऋण', amount: '₹50,000-5 लाख', interest: '4-7%', tenure: '6-12 महीना', eligibility: 'खेती के प्रमाण पत्र चाही' },
    { id: 3, title: 'पशुपालन लोन', detail: 'गाय, भैंस, मुर्गी पालन खातिर', amount: '₹1-5 लाख', interest: '8-10%', tenure: '3-5 साल', eligibility: 'पशुपालन के अनुभव चाही' },
    { id: 4, title: 'जमीन विकास लोन', detail: 'सिंचाई, बोरवेल, तालाब खुदाई खातिर', amount: '₹2-8 लाख', interest: '9-11%', tenure: '5-10 साल', eligibility: 'जमीन के मालिकाना जरूरी' },
    { id: 5, title: 'मुद्रा लोन', detail: 'छोट व्यापार शुरू करे खातिर', amount: '₹50,000-10 लाख', interest: '8-12%', tenure: '3-5 साल', eligibility: 'व्यापार योजना जरूरी' },
  ],
  awa: [
    { id: 1, title: 'कृषि उपकरण लोन', detail: 'ट्रैक्टर, थ्रेशर अउर अन्य उपकरण खाति', amount: '₹3-10 लाख', interest: '7-9%', tenure: '3-7 साल', eligibility: 'खेती लायक जमीन जरूरी' },
    { id: 2, title: 'फसल लोन', detail: 'बीज, खाद, दवाई खाति छोट ऋण', amount: '₹50,000-5 लाख', interest: '4-7%', tenure: '6-12 महीना', eligibility: 'खेती क प्रमाण पत्र जरूरी' },
    { id: 3, title: 'पशुपालन लोन', detail: 'गाय, भैंस, मुर्गी पालन खाति', amount: '₹1-5 लाख', interest: '8-10%', tenure: '3-5 साल', eligibility: 'पशुपालन अनुभव जरूरी' },
    { id: 4, title: 'जमीन विकास लोन', detail: 'सिंचाई, बोरवेल, तालाब खुदाई खाति', amount: '₹2-8 लाख', interest: '9-11%', tenure: '5-10 साल', eligibility: 'जमीन क मालिकाना जरूरी' },
    { id: 5, title: 'मुद्रा लोन', detail: 'छोट व्यापार शुरू करे खाति', amount: '₹50,000-10 लाख', interest: '8-12%', tenure: '3-5 साल', eligibility: 'व्यापार योजना जरूरी' },
  ],
  mr: [
    { id: 1, title: 'कृषी उपकरण कर्ज', detail: 'ट्रॅक्टर, थ्रेशर आणि इतर उपकरणांसाठी', amount: '₹3-10 लाख', interest: '7-9%', tenure: '3-7 वर्षे', eligibility: 'शेतजमीन असणे आवश्यक' },
    { id: 2, title: 'पीक कर्ज', detail: 'बी-बियाणे, खते, कीटकनाशकांसाठी अल्पकालीन कर्ज', amount: '₹50,000-5 लाख', interest: '4-7%', tenure: '6-12 महिने', eligibility: 'शेती प्रमाणपत्र आवश्यक' },
    { id: 3, title: 'पशुपालन कर्ज', detail: 'गाय, म्हैस, कोंबडी पालनासाठी', amount: '₹1-5 लाख', interest: '8-10%', tenure: '3-5 वर्षे', eligibility: 'पशुपालन प्रशिक्षण किंवा अनुभव' },
    { id: 4, title: 'जमीन विकास कर्ज', detail: 'सिंचन, बोअरवेल, तलाव खुदाईसाठी', amount: '₹2-8 लाख', interest: '9-11%', tenure: '5-10 वर्षे', eligibility: 'जमीन मालकी आवश्यक' },
    { id: 5, title: 'मुद्रा कर्ज', detail: 'छोटे व्यवसाय सुरू करण्यासाठी', amount: '₹50,000-10 लाख', interest: '8-12%', tenure: '3-5 वर्षे', eligibility: 'व्यवसाय योजना आवश्यक' },
  ],
  mai: [
    { id: 1, title: 'कृषि उपकरण ऋण', detail: 'ट्रैक्टर, थ्रेशर आ अन्य उपकरणक लेल', amount: '₹3-10 लाख', interest: '7-9%', tenure: '3-7 वर्ष', eligibility: 'खेती लायक जमीन आवश्यक' },
    { id: 2, title: 'फसल ऋण', detail: 'बीज, खाद, दवाईक लेल अल्पकालिक ऋण', amount: '₹50,000-5 लाख', interest: '4-7%', tenure: '6-12 माह', eligibility: 'खेतीक प्रमाण पत्र चाही' },
    { id: 3, title: 'पशुपालन ऋण', detail: 'गाय, भैंस, कुकुरक लेल', amount: '₹1-5 लाख', interest: '8-10%', tenure: '3-5 वर्ष', eligibility: 'पशुपालन अनुभव आवश्यक' },
    { id: 4, title: 'भूमि विकास ऋण', detail: 'सिंचाई, बोरवेल, पोखरि खुदाईक लेल', amount: '₹2-8 लाख', interest: '9-11%', tenure: '5-10 वर्ष', eligibility: 'जमीनक स्वामित्व आवश्यक' },
    { id: 5, title: 'मुद्रा ऋण', detail: 'छोट व्यापार शुरू करेक लेल', amount: '₹50,000-10 लाख', interest: '8-12%', tenure: '3-5 वर्ष', eligibility: 'व्यापार योजना आवश्यक' },
  ],
  or: [
    { id: 1, title: 'କୃଷି ଉପକରଣ ଋଣ', detail: 'ଟ୍ରାକ୍ଟର, ଥ୍ରେଶର ଓ ଅନ୍ୟ ଉପକରଣ ପାଇଁ', amount: '₹3-10 ଲକ୍ଷ', interest: '7-9%', tenure: '3-7 ବର୍ଷ', eligibility: 'ଚାଷ ଜମି ଆବଶ୍ୟକ' },
    { id: 2, title: 'ଫସଲ ଋଣ', detail: 'ବୀଜ, ସାର, କୀଟନାଶକ ପାଇଁ ଅଳ୍ପକାଳୀନ ଋଣ', amount: '₹50,000-5 ଲକ୍ଷ', interest: '4-7%', tenure: '6-12 ମାସ', eligibility: 'ଚାଷ ପ୍ରମାଣପତ୍ର ଆବଶ୍ୟକ' },
    { id: 3, title: 'ପଶୁପାଳନ ଋଣ', detail: 'ଗାଈ, ମଇଁଷି, କୁକୁଡ଼ା ପାଳନ ପାଇଁ', amount: '₹1-5 ଲକ୍ଷ', interest: '8-10%', tenure: '3-5 ବର୍ଷ', eligibility: 'ପଶୁପାଳନ ଅଭିଜ୍ଞତା ଆବଶ୍ୟକ' },
    { id: 4, title: 'ଜମି ଉନ୍ନୟନ ଋଣ', detail: 'ଜଳସେଚନ, ବୋରୱେଲ, ପୋଖରୀ ଖନନ ପାଇଁ', amount: '₹2-8 ଲକ୍ଷ', interest: '9-11%', tenure: '5-10 ବର୍ଷ', eligibility: 'ଜମି ମାଲିକାନା ଆବଶ୍ୟକ' },
    { id: 5, title: 'ମୁଦ୍ରା ଋଣ', detail: 'ଛୋଟ ବ୍ୟବସାୟ ଆରମ୍ଭ ପାଇଁ', amount: '₹50,000-10 ଲକ୍ଷ', interest: '8-12%', tenure: '3-5 ବର୍ଷ', eligibility: 'ବ୍ୟବସାୟ ଯୋଜନା ଆବଶ୍ୟକ' },
  ],
  en: [
    { id: 1, title: 'Farm Equipment Loan', detail: 'For tractors, threshers and other machinery', amount: '₹3-10 lakh', interest: '7-9%', tenure: '3-7 years', eligibility: 'Cultivable land required' },
    { id: 2, title: 'Crop Loan', detail: 'Short-term credit for seeds, fertilizers, pesticides', amount: '₹50,000-5 lakh', interest: '4-7%', tenure: '6-12 months', eligibility: 'Farming proof certificate required' },
    { id: 3, title: 'Dairy / Livestock Loan', detail: 'For cattle, buffalo, poultry farming', amount: '₹1-5 lakh', interest: '8-10%', tenure: '3-5 years', eligibility: 'Animal husbandry training or experience' },
    { id: 4, title: 'Land Development Loan', detail: 'For irrigation, borewells, pond excavation', amount: '₹2-8 lakh', interest: '9-11%', tenure: '5-10 years', eligibility: 'Land ownership required' },
    { id: 5, title: 'MUDRA Loan', detail: 'For starting small businesses', amount: '₹50,000-10 lakh', interest: '8-12%', tenure: '3-5 years', eligibility: 'Business plan required' },
  ],
}

// ---------------------------------------------------------------------------
// MANDI PRICES
// Mandi names and crop names are localized; prices/trends stay universal.
// ---------------------------------------------------------------------------

const MANDI_PRICE_DATA = [
  {
    id: 1,
    names: { hi: 'रामपुर मंडी', bho: 'रामपुर मंडी', awa: 'रामपुर मंडी', mr: 'रामपूर बाजार', mai: 'रामपुर मंडी', or: 'ରାମପୁର ମଣ୍ଡି', en: 'Rampur Market' },
    state: { hi: 'उत्तर प्रदेश', bho: 'उत्तर प्रदेश', awa: 'उत्तर प्रदेश', mr: 'उत्तर प्रदेश', mai: 'उत्तर प्रदेश', or: 'ଉତ୍ତର ପ୍ରଦେଶ', en: 'Uttar Pradesh' },
    crops: [
      { names: { hi: 'गेहूं', bho: 'गेहूं', awa: 'गेहूं', mr: 'गहू', mai: 'गहूम', or: 'ଗହମ', en: 'Wheat' }, price: '₹2,150', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+50', trend: 'up' },
      { names: { hi: 'धान', bho: 'धान', awa: 'धान', mr: 'भात', mai: 'धान', or: 'ଧାନ', en: 'Paddy' }, price: '₹1,930', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '-10', trend: 'down' },
      { names: { hi: 'मक्का', bho: 'मक्का', awa: 'मक्का', mr: 'मका', mai: 'मकई', or: 'ମକା', en: 'Maize' }, price: '₹1,700', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+20', trend: 'up' },
    ],
  },
  {
    id: 2,
    names: { hi: 'लखनऊ मंडी', bho: 'लखनऊ मंडी', awa: 'लखनऊ मंडी', mr: 'लखनौ बाजार', mai: 'लखनऊ मंडी', or: 'ଲକ୍ଷ୍ନୌ ମଣ୍ଡି', en: 'Lucknow Market' },
    state: { hi: 'उत्तर प्रदेश', bho: 'उत्तर प्रदेश', awa: 'उत्तर प्रदेश', mr: 'उत्तर प्रदेश', mai: 'उत्तर प्रदेश', or: 'ଉତ୍ତର ପ୍ରଦେଶ', en: 'Uttar Pradesh' },
    crops: [
      { names: { hi: 'गेहूं', bho: 'गेहूं', awa: 'गेहूं', mr: 'गहू', mai: 'गहूम', or: 'ଗହମ', en: 'Wheat' }, price: '₹2,180', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+30', trend: 'up' },
      { names: { hi: 'दलहन', bho: 'दलहन', awa: 'दलहन', mr: 'डाळ', mai: 'दालि', or: 'ଡାଲି', en: 'Pulses' }, price: '₹5,820', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+110', trend: 'up' },
      { names: { hi: 'चना', bho: 'चना', awa: 'चना', mr: 'हरभरा', mai: 'चना', or: 'ଚଣା', en: 'Gram' }, price: '₹5,100', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '-40', trend: 'down' },
    ],
  },
  {
    id: 3,
    names: { hi: 'सुल्तानपुर मंडी', bho: 'सुल्तानपुर मंडी', awa: 'सुल्तानपुर मंडी', mr: 'सुलतानपूर बाजार', mai: 'सुल्तानपुर मंडी', or: 'ସୁଲ୍ତାନପୁର ମଣ୍ଡି', en: 'Sultanpur Market' },
    state: { hi: 'उत्तर प्रदेश', bho: 'उत्तर प्रदेश', awa: 'उत्तर प्रदेश', mr: 'उत्तर प्रदेश', mai: 'उत्तर प्रदेश', or: 'ଉତ୍ତର ପ୍ରଦେଶ', en: 'Uttar Pradesh' },
    crops: [
      { names: { hi: 'धान', bho: 'धान', awa: 'धान', mr: 'भात', mai: 'धान', or: 'ଧାନ', en: 'Paddy' }, price: '₹1,950', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+15', trend: 'up' },
      { names: { hi: 'सरसों', bho: 'सरसों', awa: 'सरसों', mr: 'मोहरी', mai: 'सरिसब', or: 'ସୋରିଷ', en: 'Mustard' }, price: '₹5,400', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+70', trend: 'up' },
      { names: { hi: 'मक्का', bho: 'मक्का', awa: 'मक्का', mr: 'मका', mai: 'मकई', or: 'ମକା', en: 'Maize' }, price: '₹1,690', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '0', trend: 'stable' },
    ],
  },
  {
    id: 4,
    names: { hi: 'फैजाबाद मंडी', bho: 'फैजाबाद मंडी', awa: 'फैजाबाद मंडी', mr: 'फैजाबाद बाजार', mai: 'फैजाबाद मंडी', or: 'ଫୈଜାବାଦ ମଣ୍ଡି', en: 'Faizabad Market' },
    state: { hi: 'उत्तर प्रदेश', bho: 'उत्तर प्रदेश', awa: 'उत्तर प्रदेश', mr: 'उत्तर प्रदेश', mai: 'उत्तर प्रदेश', or: 'ଉତ୍ତର ପ୍ରଦେଶ', en: 'Uttar Pradesh' },
    crops: [
      { names: { hi: 'गेहूं', bho: 'गेहूं', awa: 'गेहूं', mr: 'गहू', mai: 'गहूम', or: 'ଗହମ', en: 'Wheat' }, price: '₹2,120', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '-20', trend: 'down' },
      { names: { hi: 'गन्ना', bho: 'गन्ना', awa: 'गन्ना', mr: 'ऊस', mai: 'ईख', or: 'ଆଖୁ', en: 'Sugarcane' }, price: '₹355', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+10', trend: 'up' },
      { names: { hi: 'दलहन', bho: 'दलहन', awa: 'दलहन', mr: 'डाळ', mai: 'दालि', or: 'ଡାଲି', en: 'Pulses' }, price: '₹5,760', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+60', trend: 'up' },
    ],
  },
  {
    id: 5,
    names: { hi: 'बस्ती मंडी', bho: 'बस्ती मंडी', awa: 'बस्ती मंडी', mr: 'बस्ती बाजार', mai: 'बस्ती मंडी', or: 'ବସ୍ତି ମଣ୍ଡି', en: 'Basti Market' },
    state: { hi: 'उत्तर प्रदेश', bho: 'उत्तर प्रदेश', awa: 'उत्तर प्रदेश', mr: 'उत्तर प्रदेश', mai: 'उत्तर प्रदेश', or: 'ଉତ୍ତର ପ୍ରଦେଶ', en: 'Uttar Pradesh' },
    crops: [
      { names: { hi: 'गन्ना', bho: 'गन्ना', awa: 'गन्ना', mr: 'ऊस', mai: 'ईख', or: 'ଆଖୁ', en: 'Sugarcane' }, price: '₹350', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+15', trend: 'up' },
      { names: { hi: 'धान', bho: 'धान', awa: 'धान', mr: 'भात', mai: 'धान', or: 'ଧାନ', en: 'Paddy' }, price: '₹1,920', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '-30', trend: 'down' },
      { names: { hi: 'चना', bho: 'चना', awa: 'चना', mr: 'हरभरा', mai: 'चना', or: 'ଚଣା', en: 'Gram' }, price: '₹5,050', unit: { hi: '/क्विंटल', bho: '/क्विंटल', awa: '/क्विंटल', mr: '/क्विंटल', mai: '/क्विंटल', or: '/କ୍ୱିଣ୍ଟାଲ', en: '/quintal' }, change: '+25', trend: 'up' },
    ],
  },
]

// ---------------------------------------------------------------------------
// MOCK TRANSCRIPTS — voice recognition demo text per language
// Keys now match appConfig.js language codes exactly
// ---------------------------------------------------------------------------

export const MOCK_TRANSCRIPTS = {
  hi: 'मुझे PM-KISAN योजना के बारे में जानकारी चाहिए',
  bho: 'हम फसल बीमा खातिर आवेदन करना चाहतानी',
  awa: 'मिट्टी स्वास्थ्य कार्ड योजना क जानकारी दियौ',
  mr: 'मला सरकारी योजनांची माहिती हवी',
  mai: 'हम MGNREGA रेजिस्ट्रेशनक बारेमे जानकारी चाहै छी',
  or: 'ମୁଁ MGNREGA ରେଜିଷ୍ଟ୍ରେସନ ସମ୍ପର୍କରେ ଜାଣିବାକୁ ଚାହୁଁ',
  en: 'I need information about government schemes',
}

// ---------------------------------------------------------------------------
// DASHBOARD STATS — static numerics; only relative time strings are localized
// ---------------------------------------------------------------------------

export const MOCK_DASHBOARD_STATS = {
  todaysCalls: 247,
  applicationsProcessed: 1340,
  amountUnlocked: '₹68,50,000',
  approvalRate: '87%',
  recentActivities: [
    { id: 1, name: 'राम कुमार', scheme: 'PM-KISAN', status: 'Approved', date: '2 घंटे पहले', amount: '₹2,000' },
    { id: 2, name: 'रीता देवी', scheme: 'Crop Insurance', status: 'Processing', date: '4 घंटे पहले', amount: '₹15,000' },
  ],
  languageBreakdown: [
    { lang: 'हिन्दी', calls: 1200, color: '#FF6B6B' },
    { lang: 'भोजपुरी', calls: 850, color: '#4ECDC4' },
    { lang: 'अवधी', calls: 650, color: '#45B7D1' },
    { lang: 'ओडिया', calls: 520, color: '#96CEB4' },
    { lang: 'मराठी', calls: 420, color: '#FFEAA7' },
  ],
}

// ---------------------------------------------------------------------------
// APPLICATION RESPONSE — referenceId is dynamic, nextSteps are localized
// ---------------------------------------------------------------------------

export const MOCK_APPLICATION_RESPONSE = {
  success: true,
  referenceId: 'GS-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
  status: 'submitted',
  timestamp: new Date().toISOString(),
  expectedApprovalTime: '7-15 days',
  // nextSteps are resolved at call-time via getMockApplicationResponse(lang)
  nextSteps: APPLICATION_NEXT_STEPS.hi,
}

// ---------------------------------------------------------------------------
// PUBLIC HELPERS
// All services should call these instead of importing raw constants directly.
// ---------------------------------------------------------------------------

/** Resolve lang to a supported key, falling back to 'hi' */
function resolveLang(lang) {
  const supported = ['hi', 'bho', 'awa', 'mr', 'mai', 'or', 'en']
  return supported.includes(lang) ? lang : 'hi'
}

function getAllMockSchemes(lang) {
  const l = resolveLang(lang)
  return SCHEME_BASE.map((scheme) => ({
    ...scheme,
    ...(SCHEME_STRINGS[scheme.id]?.[l] || SCHEME_STRINGS[scheme.id]?.hi || {}),
  }))
}

/** Get localized schemes list */
export function getMockSchemes(lang) {
  return getAllMockSchemes(lang)
}

/** Get localized scheme by ID */
export function getMockSchemeById(id, lang) {
  const allSchemes = getAllMockSchemes(lang)
  return allSchemes.find((s) => s.id === Number(id)) || allSchemes[0]
}
/** Get localized eligibility data for a scheme */
export function getMockEligibility(schemeId, lang) {
  const l = resolveLang(lang)
  const id = Number(schemeId)
  return ELIGIBILITY_STRINGS[id]?.[l] || ELIGIBILITY_STRINGS[id]?.hi || ELIGIBILITY_STRINGS[1].hi
}

/** Get localized mandi prices */
export function getMockMandiPrices(lang) {
  const l = resolveLang(lang)
  return MANDI_PRICE_DATA.map((mandi) => ({
    id: mandi.id,
    mandi: mandi.names[l] || mandi.names.hi,
    state: mandi.state[l] || mandi.state.hi,
    crops: mandi.crops.map((c) => ({
      crop: c.names[l] || c.names.hi,
      price: c.price + (c.unit[l] || c.unit.hi),
      change: c.change,
      trend: c.trend,
    })),
  }))
}

/** Get localized loan options */
export function getMockLoanOptions(lang) {
  const l = resolveLang(lang)
  return LOAN_OPTIONS_STRINGS[l] || LOAN_OPTIONS_STRINGS.hi
}

/** Get localized latest offers */
export function getMockLatestOffers(lang) {
  const l = resolveLang(lang)
  return LATEST_OFFERS_STRINGS[l] || LATEST_OFFERS_STRINGS.hi
}

/** Get application response with localized next steps */
export function getMockApplicationResponse(lang) {
  const l = resolveLang(lang)
  return {
    ...MOCK_APPLICATION_RESPONSE,
    nextSteps: APPLICATION_NEXT_STEPS[l] || APPLICATION_NEXT_STEPS.hi,
  }
}

// ---------------------------------------------------------------------------
// Legacy named exports — kept so existing imports don't break immediately.
// Services should migrate to the getMock* helpers above.
// ---------------------------------------------------------------------------

export const MOCK_SCHEMES = getMockSchemes('hi')
export const MOCK_ELIGIBILITY = { 1: getMockEligibility(1, 'hi') }
export const MOCK_LATEST_OFFERS = getMockLatestOffers('hi')
export const MOCK_MANDI_PRICES = getMockMandiPrices('hi')
export const MOCK_LOAN_OPTIONS = getMockLoanOptions('hi')

export default {
  MOCK_SCHEMES,
  MOCK_ELIGIBILITY,
  MOCK_DASHBOARD_STATS,
  MOCK_TRANSCRIPTS,
  MOCK_APPLICATION_RESPONSE,
  MOCK_LATEST_OFFERS,
  MOCK_MANDI_PRICES,
  MOCK_LOAN_OPTIONS,
  getMockSchemes,
  getMockSchemeById,
  getMockEligibility,
  getMockMandiPrices,
  getMockLoanOptions,
  getMockLatestOffers,
  getMockApplicationResponse,
}