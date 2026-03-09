// Real Pizza Aziz menu data — العملة: جنيه مصري (EGP)

const CATEGORIES = [
    { id: '6', name: 'البيتزا', icon: '🍕', image: null, description: 'بيتزا طازجة بأحجام مختلفة' },
    { id: '7', name: 'الفطير الشرقي', icon: '🥧', image: null, description: 'فطير شرقي بحشوات متنوعة' },
    { id: '8', name: 'الفطير الحلو', icon: '🍫', image: null, description: 'فطير حلو بنكهات لذيذة' },
    { id: '9', name: 'الحواوشي', icon: '🥟', image: null, description: 'حواوشي مصري أصلي' },
    { id: '1', name: 'كريب الجبن', icon: '🧀', image: null, description: 'كريب طازج بأنواع الجبن المختلفة' },
    { id: '2', name: 'كريب الفراخ', icon: '🍗', image: null, description: 'كريب محشي بأشهى أنواع الفراخ' },
    { id: '3', name: 'كريب اللحوم', icon: '🥩', image: null, description: 'كريب باللحوم الطازجة المشوية' },
    { id: '4', name: 'كريبات ميكس السوبر', icon: '🌯', image: null, description: 'كريبات ميكس بخلطات مميزة' },
    { id: '5', name: 'ميكسات', icon: '🔥', image: null, description: 'ميكسات جديدة بنكهات مبتكرة' },
    { id: '10', name: 'الإضافات', icon: '🍟', image: null, description: 'إضافات وأطباق جانبية' },
];

const MENU_ITEMS = [
    // ===== 1. كريب الجبن =====
    {
        id: 'ch1', categoryId: '1', name: 'كريب بطاطس', description: 'كريب طازج محشي بطاطس بالجبن', price: 60, rating: 4.5, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة كريب', 'بطاطس', 'جبن'],
        reviews: [
            { id: 'r1', userName: 'أحمد محمود', rating: 5, comment: 'أطعم كريب جبن في السويس!', date: '2024-02-20' },
            { id: 'r2', userName: 'سارة سيد', rating: 4, comment: 'جميل جداً والخدمة سريعة', date: '2024-02-18' }
        ]
    },
    { id: 'ch2', categoryId: '1', name: 'كريب مشكل جبن', description: 'كريب بمزيج أنواع الجبن المختلفة', price: 60, rating: 4.6, reviews: 92, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'جبن شيدر', 'جبن موتزاريلا', 'جبن رومي'] },

    // ===== 2. كريب الفراخ =====
    { id: 'ck1', categoryId: '2', name: 'كريب بانيه', description: 'كريب محشي بانيه فراخ مقرمش', price: 80, rating: 4.7, reviews: 120, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'بانيه فراخ', 'خس', 'صوص'] },
    { id: 'ck2', categoryId: '2', name: 'كريب كرانشي', description: 'كريب بفراخ كرانشي مقرمشة', price: 90, rating: 4.8, reviews: 105, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'فراخ كرانشي', 'صوص خاص'] },
    { id: 'ck3', categoryId: '2', name: 'كريب زنجر', description: 'كريب بزنجر فراخ حار ومقرمش', price: 90, rating: 4.9, reviews: 150, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة كريب', 'زنجر فراخ', 'صوص حار', 'خضار'] },
    { id: 'ck4', categoryId: '2', name: 'كريب كوردن بلو', description: 'كريب بكوردن بلو فراخ بالجبن', price: 90, rating: 4.7, reviews: 88, image: null, isPopular: false, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'كوردن بلو', 'جبن'] },
    { id: 'ck5', categoryId: '2', name: 'كريب شيش طاووق', description: 'كريب بشيش طاووق متبل ومشوي', price: 90, rating: 4.8, reviews: 130, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'شيش طاووق', 'صوص ثومية', 'خضار'] },
    { id: 'ck6', categoryId: '2', name: 'كريب ميكس فراخ', description: 'كريب بخلطة ميكس فراخ مشكلة', price: 100, rating: 4.9, reviews: 140, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة كريب', 'ميكس فراخ', 'صوص خاص', 'خضار'] },

    // ===== 3. كريب اللحوم =====
    { id: 'cm1', categoryId: '3', name: 'كريب كفتة مشوية', description: 'كريب بكفتة لحم مشوية طازجة', price: 90, rating: 4.7, reviews: 95, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة كريب', 'كفتة مشوية', 'طحينة', 'خضار'] },
    { id: 'cm2', categoryId: '3', name: 'كريب تشيز برجر', description: 'كريب ببرجر لحم مع جبن شيدر ذايب', price: 95, rating: 4.8, reviews: 110, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة كريب', 'برجر لحم', 'جبن شيدر', 'صوص خاص'] },
    { id: 'cm3', categoryId: '3', name: 'كريب ميكس اللحوم', description: 'كريب بخلطة لحوم مشكلة مميزة', price: 100, rating: 4.9, reviews: 125, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة كريب', 'لحوم مشكلة', 'صوص خاص', 'خضار'] },

    // ===== 4. كريبات ميكس السوبر =====
    { id: 'cs1', categoryId: '4', name: 'عظميتو', description: 'صوص الباربكيو - شيش - كفتة - برجر فراخ', price: 90, rating: 4.8, reviews: 160, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['صوص الباربكيو', 'شيش', 'كفتة', 'برجر فراخ'] },
    { id: 'cs2', categoryId: '4', name: 'مكسيكانو', description: 'صوص الرانش - زنجر - هوت دوج - ببروني', price: 90, rating: 4.7, reviews: 135, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['صوص الرانش', 'زنجر', 'هوت دوج', 'ببروني'] },
    { id: 'cs3', categoryId: '4', name: 'ميكس جريل', description: 'صوص الباربكيو - شيش - كفتة - سجق - هوت دوج', price: 100, rating: 4.9, reviews: 170, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['صوص الباربكيو', 'شيش', 'كفتة', 'سجق', 'هوت دوج'] },
    { id: 'cs4', categoryId: '4', name: 'الشامل', description: 'صوص تشيلي - برجر لحمة - برجر فراخ - شيش - تركي', price: 100, rating: 4.8, reviews: 145, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['صوص تشيلي', 'برجر لحمة', 'برجر فراخ', 'شيش', 'تركي'] },
    { id: 'cs5', categoryId: '4', name: 'المزجانجي', description: 'صوص الباربكيو - برجر لحمة - استربس - كفتة', price: 100, rating: 4.7, reviews: 128, image: null, isPopular: false, isSpecial: false, sizes: null, extras: [], ingredients: ['صوص الباربكيو', 'برجر لحمة', 'استربس', 'كفتة'] },

    // ===== 5. ميكسات (جديد) =====
    { id: 'mx1', categoryId: '5', name: 'زنجر سموكي', description: 'زنجر - صوص حار - تركي مدخن - هالابينو - خضار', price: 110, rating: 4.9, reviews: 180, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['زنجر', 'صوص حار', 'تركي مدخن', 'هالابينو', 'خضار'] },
    { id: 'mx2', categoryId: '5', name: 'رانش تشيكن بيكون', description: 'دجاج شيش - هالابينو - ببروني - خضار', price: 110, rating: 4.8, reviews: 155, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['دجاج شيش', 'هالابينو', 'ببروني', 'خضار'] },
    { id: 'mx3', categoryId: '5', name: 'بابركا إيطالي', description: 'ببروني - هوت دوج - بسطرمة - هالابينو - صوص حار - خضار', price: 110, rating: 4.7, reviews: 142, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['ببروني', 'هوت دوج', 'بسطرمة', 'هالابينو', 'صوص حار', 'خضار'] },
    { id: 'mx4', categoryId: '5', name: 'تشيز لافر', description: 'جبنة جودة - جبنة شيدر - موتزريلا - رومي - كيري - خضار', price: 110, rating: 4.9, reviews: 165, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['جبنة جودة', 'جبنة شيدر', 'موتزريلا', 'رومي', 'كيري', 'خضار'] },

    // ===== 6. البيتزا =====
    // -- بيتزا الجبن
    { id: 'pz1', categoryId: '6', name: 'مارمريتا', description: 'بيتزا مارمريتا كلاسيك بالجبن والطماطم', price: 75, rating: 4.6, reviews: 200, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 75 }, { name: 'M', price: 100 }, { name: 'L', price: 125 }, { name: 'XL', price: 160 }], extras: [], ingredients: ['عجينة', 'صوص طماطم', 'جبن موتزاريلا'] },
    { id: 'pz2', categoryId: '6', name: 'خضروات', description: 'بيتزا بالخضروات الطازجة المشكلة', price: 80, rating: 4.5, reviews: 150, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 80 }, { name: 'M', price: 105 }, { name: 'L', price: 130 }, { name: 'XL', price: 160 }], extras: [], ingredients: ['عجينة', 'خضروات مشكلة', 'جبن'] },
    { id: 'pz3', categoryId: '6', name: 'بيتزا مشكل جبن', description: 'بيتزا بأنواع الجبن المختلفة', price: 85, rating: 4.7, reviews: 175, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 85 }, { name: 'M', price: 110 }, { name: 'L', price: 140 }, { name: 'XL', price: 180 }], extras: [], ingredients: ['عجينة', 'جبن شيدر', 'جبن موتزاريلا', 'جبن رومي'] },
    // -- بيتزا الفراخ
    { id: 'pz4', categoryId: '6', name: 'تشيكن باربكيو', description: 'بيتزا بصوص الباربكيو والفراخ المشوية', price: 95, rating: 4.8, reviews: 220, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 125 }, { name: 'L', price: 160 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['فراخ مشوية', 'صوص باربكيو', 'جبن', 'بصل'] },
    { id: 'pz5', categoryId: '6', name: 'تشيكن رانش', description: 'بيتزا بصوص الرانش وقطع الفراخ', price: 95, rating: 4.8, reviews: 210, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 125 }, { name: 'L', price: 160 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['فراخ', 'صوص رانش', 'جبن', 'خضار'] },
    { id: 'pz6', categoryId: '6', name: 'دجاج سوبريم', description: 'بيتزا سوبريم بالدجاج والخضار', price: 95, rating: 4.7, reviews: 180, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 140 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['دجاج', 'فلفل', 'زيتون', 'بصل', 'جبن'] },
    { id: 'pz7', categoryId: '6', name: 'فراخ سوبريم', description: 'بيتزا سوبريم محملة بالفراخ', price: 95, rating: 4.7, reviews: 160, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 140 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['فراخ', 'خضار مشكلة', 'جبن'] },
    { id: 'pz8', categoryId: '6', name: 'فراخ مدخنة', description: 'بيتزا بالفراخ المدخنة المميزة', price: 95, rating: 4.8, reviews: 140, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 140 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['فراخ مدخنة', 'جبن', 'صوص'] },
    { id: 'pz9', categoryId: '6', name: 'فراخ مشكلة', description: 'بيتزا بأنواع الفراخ المشكلة', price: 95, rating: 4.8, reviews: 155, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 140 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['فراخ مشكلة', 'جبن', 'صوص'] },
    // -- بيتزا اللحوم
    { id: 'pz10', categoryId: '6', name: 'سوبر سوبريم', description: 'بيتزا سوبر سوبريم باللحوم والخضار', price: 95, rating: 4.9, reviews: 250, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 150 }, { name: 'L', price: 195 }, { name: 'XL', price: 250 }], extras: [], ingredients: ['لحوم مشكلة', 'فلفل', 'زيتون', 'بصل', 'جبن'] },
    { id: 'pz11', categoryId: '6', name: 'ببروني', description: 'بيتزا ببروني كلاسيك', price: 95, rating: 4.8, reviews: 230, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 150 }, { name: 'L', price: 195 }, { name: 'XL', price: 250 }], extras: [], ingredients: ['ببروني', 'جبن موتزاريلا', 'صوص طماطم'] },
    { id: 'pz12', categoryId: '6', name: 'بيتزا كفتة مشوية', description: 'بيتزا بالكفتة المشوية الطازجة', price: 95, rating: 4.7, reviews: 145, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 140 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['كفتة مشوية', 'جبن', 'خضار'] },
    { id: 'pz13', categoryId: '6', name: 'بيتزا ميكس لحوم', description: 'بيتزا بخلطة اللحوم المشكلة', price: 95, rating: 4.8, reviews: 165, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 95 }, { name: 'M', price: 125 }, { name: 'L', price: 175 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['لحوم مشكلة', 'جبن', 'صوص'] },
    // -- بحريات
    { id: 'pz14', categoryId: '6', name: 'بيتزا جمبري', description: 'بيتزا بالجمبري الطازج', price: 115, rating: 4.9, reviews: 130, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 115 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['جمبري', 'جبن', 'صوص خاص'] },
    { id: 'pz15', categoryId: '6', name: 'بيتزا سي فود', description: 'بيتزا بفواكه البحر المشكلة', price: 115, rating: 4.8, reviews: 120, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 115 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['سي فود مشكل', 'جبن', 'صوص'] },
    { id: 'pz16', categoryId: '6', name: 'بيتزا سي رانش', description: 'بيتزا بفواكه البحر وصوص الرانش', price: 115, rating: 4.7, reviews: 110, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 115 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['سي فود', 'صوص رانش', 'جبن'] },

    // ===== 7. الفطير الشرقي =====
    // -- فطير الفراخ
    { id: 'ft1', categoryId: '7', name: 'فطير شيش طاووق', description: 'فطير شرقي بشيش طاووق متبل', price: 120, rating: 4.8, reviews: 140, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 120 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 230 }], extras: [], ingredients: ['عجينة فطير', 'شيش طاووق', 'صوص'] },
    { id: 'ft2', categoryId: '7', name: 'فطير تشيكن رانش', description: 'فطير بالفراخ وصوص الرانش', price: 130, rating: 4.7, reviews: 125, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 130 }, { name: 'M', price: 160 }, { name: 'L', price: 200 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['عجينة فطير', 'فراخ', 'صوص رانش'] },
    { id: 'ft3', categoryId: '7', name: 'فطير رومي مدخن', description: 'فطير بالرومي المدخن', price: 120, rating: 4.6, reviews: 100, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 120 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 230 }], extras: [], ingredients: ['عجينة فطير', 'رومي مدخن', 'جبن'] },
    { id: 'ft4', categoryId: '7', name: 'فطير مشكل فراخ', description: 'فطير بخلطة الفراخ المشكلة', price: 130, rating: 4.8, reviews: 135, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 130 }, { name: 'M', price: 160 }, { name: 'L', price: 200 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['عجينة فطير', 'فراخ مشكلة', 'صوص'] },
    // -- فطير الجبن
    { id: 'ft5', categoryId: '7', name: 'فطير رومي', description: 'فطير بالجبن الرومي', price: 100, rating: 4.5, reviews: 110, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 100 }, { name: 'M', price: 130 }, { name: 'L', price: 150 }, { name: 'XL', price: 190 }], extras: [], ingredients: ['عجينة فطير', 'جبن رومي'] },
    { id: 'ft6', categoryId: '7', name: 'فطير مشكل جبن', description: 'فطير بأنواع الجبن المشكلة', price: 110, rating: 4.6, reviews: 120, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 110 }, { name: 'M', price: 140 }, { name: 'L', price: 180 }, { name: 'XL', price: 210 }], extras: [], ingredients: ['عجينة فطير', 'جبن مشكل'] },
    // -- فطير اللحوم
    { id: 'ft7', categoryId: '7', name: 'فطير لحمة مفروم', description: 'فطير باللحمة المفرومة', price: 120, rating: 4.7, reviews: 115, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 120 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 230 }], extras: [], ingredients: ['عجينة فطير', 'لحمة مفرومة'] },
    { id: 'ft8', categoryId: '7', name: 'فطير سجق', description: 'فطير بالسجق الشرقي', price: 120, rating: 4.6, reviews: 105, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 120 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 230 }], extras: [], ingredients: ['عجينة فطير', 'سجق'] },
    { id: 'ft9', categoryId: '7', name: 'فطير بسطرمة', description: 'فطير بالبسطرمة المميزة', price: 120, rating: 4.7, reviews: 100, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 120 }, { name: 'M', price: 150 }, { name: 'L', price: 190 }, { name: 'XL', price: 230 }], extras: [], ingredients: ['عجينة فطير', 'بسطرمة'] },
    { id: 'ft10', categoryId: '7', name: 'فطير مشكل لحوم', description: 'فطير بخلطة اللحوم المشكلة', price: 130, rating: 4.8, reviews: 130, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 130 }, { name: 'M', price: 160 }, { name: 'L', price: 200 }, { name: 'XL', price: 240 }], extras: [], ingredients: ['عجينة فطير', 'لحوم مشكلة'] },
    // -- جديد
    { id: 'ft11', categoryId: '7', name: 'فطير سجق كبير', description: 'فطير كبير بالسجق - جديد!', price: 140, rating: 4.8, reviews: 90, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 140 }, { name: 'M', price: 170 }, { name: 'L', price: 210 }, { name: 'XL', price: 260 }], extras: [], ingredients: ['عجينة فطير', 'سجق كبير'] },
    { id: 'ft12', categoryId: '7', name: 'فطير بسطرمة كبير', description: 'فطير كبير بالبسطرمة - جديد!', price: 140, rating: 4.7, reviews: 85, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 140 }, { name: 'M', price: 170 }, { name: 'L', price: 210 }, { name: 'XL', price: 260 }], extras: [], ingredients: ['عجينة فطير', 'بسطرمة كبيرة'] },
    // -- بحريات فطير
    { id: 'ft13', categoryId: '7', name: 'فطير جمبري', description: 'فطير بالجمبري الطازج', price: 150, rating: 4.9, reviews: 95, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 150 }, { name: 'M', price: 180 }, { name: 'L', price: 220 }, { name: 'XL', price: 270 }], extras: [], ingredients: ['عجينة فطير', 'جمبري'] },
    { id: 'ft14', categoryId: '7', name: 'فطير سي فود', description: 'فطير بفواكه البحر المشكلة', price: 150, rating: 4.8, reviews: 88, image: null, isPopular: false, isSpecial: false, sizes: [{ name: 'S', price: 150 }, { name: 'M', price: 180 }, { name: 'L', price: 220 }, { name: 'XL', price: 270 }], extras: [], ingredients: ['عجينة فطير', 'سي فود مشكل'] },

    // ===== 8. الفطير الحلو =====
    { id: 'fs1', categoryId: '8', name: 'فطير مكسرات', description: 'فطير حلو بالمكسرات المشكلة', price: 90, rating: 4.7, reviews: 160, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 90 }, { name: 'M', price: 120 }, { name: 'L', price: 150 }], extras: [], ingredients: ['عجينة فطير', 'مكسرات مشكلة', 'عسل'] },
    { id: 'fs2', categoryId: '8', name: 'فطير نوتيلا', description: 'فطير حلو بالنوتيلا الشهية', price: 110, rating: 4.9, reviews: 200, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 110 }, { name: 'M', price: 135 }, { name: 'L', price: 170 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['عجينة فطير', 'نوتيلا'] },
    { id: 'fs3', categoryId: '8', name: 'فطير لوتس', description: 'فطير حلو بكريمة اللوتس', price: 110, rating: 4.8, reviews: 190, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 110 }, { name: 'M', price: 135 }, { name: 'L', price: 170 }, { name: 'XL', price: 200 }], extras: [], ingredients: ['عجينة فطير', 'كريمة لوتس'] },
    { id: 'fs4', categoryId: '8', name: 'فطيرة بالقشطة', description: 'فطير حلو بالقشطة البلدي', price: 115, rating: 4.7, reviews: 150, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 115 }, { name: 'M', price: 135 }, { name: 'L', price: 170 }, { name: 'XL', price: 210 }], extras: [], ingredients: ['عجينة فطير', 'قشطة بلدي'] },
    { id: 'fs5', categoryId: '8', name: 'الفصول الأربعة', description: 'فطير بأربع نكهات حلوة مختلفة', price: 115, rating: 4.8, reviews: 170, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 115 }, { name: 'M', price: 145 }, { name: 'L', price: 180 }, { name: 'XL', price: 220 }], extras: [], ingredients: ['عجينة فطير', 'نوتيلا', 'لوتس', 'قشطة', 'مكسرات'] },
    { id: 'fs6', categoryId: '8', name: 'فطير بيستاشيو', description: 'فطير حلو بكريمة الفستق - جديد!', price: 150, rating: 4.9, reviews: 120, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 150 }, { name: 'M', price: 180 }, { name: 'L', price: 230 }, { name: 'XL', price: 280 }], extras: [], ingredients: ['عجينة فطير', 'كريمة فستق'] },
    { id: 'fs7', categoryId: '8', name: 'فطير كندر', description: 'فطير حلو بشوكولاتة كندر - جديد!', price: 140, rating: 4.8, reviews: 110, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 140 }, { name: 'M', price: 170 }, { name: 'L', price: 220 }, { name: 'XL', price: 270 }], extras: [], ingredients: ['عجينة فطير', 'شوكولاتة كندر'] },

    // ===== 9. الحواوشي =====
    { id: 'hw1', categoryId: '9', name: 'حواوشي عادي', description: 'حواوشي مصري باللحمة المفرومة', price: 30, rating: 4.6, reviews: 180, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة', 'لحمة مفرومة', 'بهارات'] },
    { id: 'hw2', categoryId: '9', name: 'حواوشي سجق', description: 'حواوشي بالسجق الشرقي', price: 35, rating: 4.7, reviews: 140, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة', 'سجق', 'بهارات'] },
    { id: 'hw3', categoryId: '9', name: 'حواوشي مدخن', description: 'حواوشي باللحم المدخن', price: 45, rating: 4.7, reviews: 120, image: null, isPopular: false, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة', 'لحم مدخن'] },
    { id: 'hw4', categoryId: '9', name: 'حواوشي كفتة مشوية', description: 'حواوشي بالكفتة المشوية', price: 50, rating: 4.8, reviews: 130, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة', 'كفتة مشوية'] },
    { id: 'hw5', categoryId: '9', name: 'حواوشي بسطرمة', description: 'حواوشي بالبسطرمة المميزة', price: 50, rating: 4.7, reviews: 100, image: null, isPopular: false, isSpecial: false, sizes: null, extras: [], ingredients: ['عجينة', 'بسطرمة'] },
    { id: 'hw6', categoryId: '9', name: 'حواوشي مشكل لحوم', description: 'حواوشي بخلطة اللحوم المشكلة', price: 50, rating: 4.8, reviews: 150, image: null, isPopular: true, isSpecial: true, sizes: null, extras: [], ingredients: ['عجينة', 'لحوم مشكلة'] },
    // -- حواوشي إسكندراني
    { id: 'hw7', categoryId: '9', name: 'إسكندراتي عادي', description: 'حواوشي إسكندراني أصلي', price: 40, rating: 4.7, reviews: 160, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 40 }, { name: 'M', price: 65 }], extras: [], ingredients: ['عجينة إسكندراني', 'لحمة'] },
    { id: 'hw8', categoryId: '9', name: 'إسكندراتي موزاريلا', description: 'حواوشي إسكندراني بالموزاريلا', price: 50, rating: 4.8, reviews: 145, image: null, isPopular: true, isSpecial: false, sizes: [{ name: 'S', price: 50 }, { name: 'M', price: 75 }], extras: [], ingredients: ['عجينة إسكندراني', 'لحمة', 'موزاريلا'] },
    { id: 'hw9', categoryId: '9', name: 'سوبر إسكندراتي', description: 'حواوشي إسكندراني سوبر محمل', price: 70, rating: 4.9, reviews: 170, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 70 }, { name: 'M', price: 100 }], extras: [], ingredients: ['عجينة إسكندراني', 'لحمة', 'إضافات سوبر'] },
    { id: 'hw10', categoryId: '9', name: 'مشكل لحوم إسكندراتي', description: 'حواوشي إسكندراني بلحوم مشكلة', price: 80, rating: 4.8, reviews: 130, image: null, isPopular: true, isSpecial: true, sizes: [{ name: 'S', price: 80 }, { name: 'M', price: 115 }], extras: [], ingredients: ['عجينة إسكندراني', 'لحوم مشكلة'] },

    // ===== 10. الإضافات =====
    { id: 'ex1', categoryId: '10', name: 'باكيت بطاطس', description: 'بطاطس مقلية مقرمشة', price: 30, rating: 4.5, reviews: 200, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['بطاطس', 'ملح'] },
    { id: 'ex2', categoryId: '10', name: 'باكيت حلقات بصل', description: 'حلقات بصل مقلية ومقرمشة', price: 30, rating: 4.4, reviews: 150, image: null, isPopular: false, isSpecial: false, sizes: null, extras: [], ingredients: ['بصل', 'بقسماط'] },
    { id: 'ex3', categoryId: '10', name: 'باكيت موزاريلا ستيك', description: 'أصابع موزاريلا مقلية', price: 40, rating: 4.7, reviews: 170, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['جبن موزاريلا', 'بقسماط'] },
    { id: 'ex4', categoryId: '10', name: 'باكيت بطاطس بالصوص', description: 'بطاطس مقلية بصوص خاص', price: 40, rating: 4.6, reviews: 160, image: null, isPopular: true, isSpecial: false, sizes: null, extras: [], ingredients: ['بطاطس', 'صوص خاص'] },
];

const MOCK_USER = {
    id: 'user_1',
    name: 'أحمد',
    email: 'ahmed@example.com',
    phone: '01063411691',
    address: 'الزرقا - خلف مركز الشرطة - امتداد شارع البحر',
};

const RESTAURANT_INFO = {
    name: 'بيتزا عزيز',
    nameEn: 'PIZZA AZIZ',
    phones: ['01063411691', '01558341691'],
    address: 'الزرقا - خلف مركز الشرطة - امتداد شارع البحر',
    tagline: 'خدمة التوصيل للمنازل',
    currency: 'ج.م',
};

const DELIVERY_ZONES = [
    { id: 'z_zarqa', name: 'داخل الزرقا', price: 10 },
    { id: 'z_gamal', name: 'الجمال', price: 45 },
    { id: 'z_nozl', name: 'النزل', price: 65 },
    { id: 'z_kafr_taqi', name: 'كفر تقي', price: 50 },
    { id: 'z_sharmsah', name: 'شرمساح', price: 45 },
    { id: 'z_zaatara', name: 'الزعاتره', price: 40 },
    { id: 'z_saro', name: 'السرو', price: 40 },
    { id: 'z_kashef', name: 'الكاشف', price: 50 },
    { id: 'z_saif', name: 'سيف الدين', price: 65 },
    { id: 'z_daqhala', name: 'دقهله', price: 60 },
    { id: 'z_karam', name: 'كرم ورزوق', price: 80 },
    { id: 'z_arbaeen', name: 'عزبه الاربعين', price: 80 },
    { id: 'z_barashia', name: 'البراشيه', price: 80 },
    { id: 'z_nasria', name: 'الناصريه', price: 90 },
    { id: 'z_shirbas', name: 'شرباص', price: 90 },
    { id: 'z_farag', name: 'عزبه فرج', price: 20 },
    { id: 'z_hamid', name: 'عزبه عبد الحميد', price: 25 },
    { id: 'z_emad', name: 'عزبه عماد', price: 30 },
    { id: 'z_kharedg', name: 'الخارج', price: 30 },
    { id: 'z_kholy', name: 'م الخولي', price: 20 },
    { id: 'z_hana', name: 'قصر الهنا', price: 25 },
    { id: 'z_beglat', name: 'البجلات', price: 60 },
    { id: 'z_samrida', name: 'عزبه سمريده', price: 35 },
    { id: 'z_baz', name: 'عزبه الباز', price: 40 },
    { id: 'z_ali_din', name: 'علي الدين', price: 65 },
    { id: 'z_galal', name: 'عزبه جلال', price: 80 },
];

const COUPONS = [
    { code: 'AZIZ10', type: 'percentage', value: 10, description: 'خصم 10% على الطلب' },
    { code: 'WELCOME', type: 'flat', value: 20, description: 'خصم 20 ج.م للعملاء الجدد' },
    { code: 'SUPER50', type: 'percentage', value: 50, description: 'خصم 50% لفترة محدودة' },
];

const OWNER_INFO = {
    name: 'عزيز (Aziz)',
    role: 'صاحب المطعم والشيف العمومي',
    image: 'https://images.unsplash.com/photo-1583394238182-6f3ad3c21d65?auto=format&fit=crop&q=80', // Placeholder or local path if copied
    phone: '01063411691',
    bio: 'بدأت شغفي بالبيتزا منذ أكثر من ١٥ عاماً. في "بيتزا عزيز"، نؤمن بأن السر دائماً في جودة المكونات والوصفة الأصلية الممزوجة بالحب. نحن هنا لنقدم لكم أفضل مذاق في الزرقا.',
    socials: {
        facebook: 'pizzaaziz',
        instagram: 'pizza.aziz',
    }
};

const STORIES = [
    {
        id: 's1',
        title: 'عرض خاص',
        image: null,
        owner: 'عزيز',
        ownerImage: null,
        isSeen: false,
    },
    {
        id: 's2',
        title: 'خلف الكواليس',
        image: null,
        owner: 'عزيز',
        ownerImage: null,
        isSeen: false,
    },
    {
        id: 's3',
        title: 'وجبات جديدة',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80',
        owner: 'بيتزا عزيز',
        ownerImage: null,
        isSeen: false,
    },
];

const ORDERS = [
    {
        id: 'ORD-55A12B',
        date: '2024-02-28',
        status: 'delivered',
        total: 285,
        items: [
            { id: 'pz1', name: 'بيتزا مارمريتا', quantity: 1, price: 100, size: 'M' },
            { id: 'pz4', name: 'تشيكن باربكيو', quantity: 1, price: 160, size: 'L' },
            { id: 'ex1', name: 'باكيت بطاطس', quantity: 1, price: 25 },
        ],
        address: 'الزرقا - شارع البحر',
    },
    {
        id: 'ORD-99X77Y',
        date: '2024-02-25',
        status: 'delivered',
        total: 120,
        items: [
            { id: 'ck1', name: 'كريب بانيه', quantity: 1, price: 80 },
            { id: 'ex3', name: 'أصابع موزاريلا', quantity: 1, price: 40 },
        ],
        address: 'الزرقا - بجوار المسجد الكبير',
    },
    {
        id: 'ORD-11Z33W',
        date: '2024-03-01',
        status: 'preparing',
        total: 95,
        items: [
            { id: 'hw9', name: 'سوبر إسكندراتي', quantity: 1, price: 70, size: 'S' },
            { id: 'ex1', name: 'باكيت بطاطس', quantity: 1, price: 25 },
        ],
        address: 'الزرقا - منطقة السوق',
    }
];

const NOTIFICATIONS = [
    {
        id: 'n1',
        title: 'تم استلام طلبك! 🍕',
        message: 'طلبك رقم ORD-11Z33W قيد التحضير الآن وسيكون لديك قريباً.',
        time: 'منذ ١٠ دقائق',
        isRead: false,
        type: 'order',
    },
    {
        id: 'n2',
        title: 'عرض محدود! 🔥',
        message: 'خصم ٣٠٪ على جميع أنواع البيتزا الحجم الكبير اليوم فقط.',
        time: 'منذ ساعتين',
        isRead: true,
        type: 'promo',
    },
    {
        id: 'n3',
        title: 'تقييم طلبك الأخير',
        message: 'كيف كانت تجربتك مع طلبك الأخير؟ أخبرنا برأيك لنحسن خدمتنا.',
        time: 'أمس',
        isRead: true,
        type: 'feedback',
    }
];

module.exports = { CATEGORIES, MENU_ITEMS, MOCK_USER, RESTAURANT_INFO, DELIVERY_ZONES, COUPONS, OWNER_INFO, STORIES, ORDERS, NOTIFICATIONS };
