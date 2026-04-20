import re

DISEASE_KB = {
    "Apple___Apple_scab": {
        "cause": "Caused by the fungus Venturia inaequalis.",
        "symptoms": "Olive-green to brown velvety spots on leaves and fruit. Infected leaves may curl and drop early. Fruit shows dark, scabby lesions.",
        "treatment": "Apply fungicides (myclobutanil, captan, or mancozeb) at bud break and repeat every 7–10 days during wet weather. Remove and destroy fallen leaves.",
        "prevention": "Plant scab-resistant apple varieties. Rake and destroy fallen leaves in autumn. Ensure good air circulation by pruning.",
        "severity": "Moderate to High — can cause significant fruit loss in wet seasons.",
    },
    "Apple___Black_rot": {
        "cause": "Caused by the fungus Botryosphaeria obtusa.",
        "symptoms": "Circular brown lesions with purple margins on leaves ('frog-eye' spots). Fruit shows black, mummified rot. Cankers on branches.",
        "treatment": "Apply captan or thiophanate-methyl fungicides. Prune out infected branches 15 cm below visible cankers. Remove mummified fruit.",
        "prevention": "Remove dead wood and mummified fruit. Avoid wounding trees. Maintain tree vigor with proper fertilization.",
        "severity": "Moderate to High — can kill branches and destroy fruit.",
    },
    "Apple___Cedar_apple_rust": {
        "cause": "Caused by the fungus Gymnosporangium juniperi-virginianae, requiring both apple and cedar/juniper hosts.",
        "symptoms": "Bright orange-yellow spots on upper leaf surfaces in spring. Tube-like structures on leaf undersides. Fruit may show orange lesions.",
        "treatment": "Apply myclobutanil or propiconazole fungicides from pink bud stage through petal fall. Repeat every 7–10 days.",
        "prevention": "Remove nearby cedar/juniper trees if possible. Plant rust-resistant apple varieties. Apply preventive fungicide sprays.",
        "severity": "Moderate — rarely kills trees but reduces fruit quality and causes defoliation.",
    },
    "Apple___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy with vibrant green leaves and no visible lesions.",
        "treatment": "No treatment needed.",
        "prevention": "Continue regular monitoring, proper pruning, balanced fertilization, and preventive fungicide program.",
        "severity": "None",
    },
    "Blueberry___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Maintain soil pH 4.5–5.5, ensure good drainage, and monitor regularly for pests.",
        "severity": "None",
    },
    "Cherry___Powdery_mildew": {
        "cause": "Caused by the fungus Podosphaera clandestina.",
        "symptoms": "White powdery coating on young leaves, shoots, and fruit. Infected leaves may curl, distort, and drop prematurely.",
        "treatment": "Apply sulfur-based or potassium bicarbonate fungicides. Myclobutanil and trifloxystrobin are also effective. Remove heavily infected shoots.",
        "prevention": "Plant in full sun with good air circulation. Avoid excessive nitrogen fertilization. Use resistant varieties.",
        "severity": "Moderate — reduces fruit quality and weakens young trees.",
    },
    "Cherry___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Regular pruning for air circulation, balanced fertilization, and monitoring for pests and diseases.",
        "severity": "None",
    },
    "Corn___Cercospora_leaf_spot": {
        "cause": "Caused by the fungus Cercospora zeae-maydis (Gray Leaf Spot).",
        "symptoms": "Rectangular, tan to gray lesions with parallel edges running between leaf veins. Lesions may merge causing large blighted areas.",
        "treatment": "Apply strobilurin or triazole fungicides at early disease onset. Foliar sprays at tasseling stage are most effective.",
        "prevention": "Plant resistant hybrids. Practice crop rotation (avoid corn-on-corn). Reduce crop residue through tillage.",
        "severity": "Moderate to High — major yield loss in susceptible hybrids under humid conditions.",
    },
    "Corn___Common_rust": {
        "cause": "Caused by the fungus Puccinia sorghi.",
        "symptoms": "Small, circular to elongated, brick-red to brown pustules on both leaf surfaces. Pustules rupture releasing powdery rust-colored spores.",
        "treatment": "Apply triazole or strobilurin fungicides when rust is first detected, especially before tasseling.",
        "prevention": "Plant rust-resistant corn hybrids. Early planting can help avoid peak rust season.",
        "severity": "Moderate — severe infections in susceptible varieties can reduce yield significantly.",
    },
    "Corn___Northern_Leaf_Blight": {
        "cause": "Caused by the fungus Exserohilum turcicum.",
        "symptoms": "Long, elliptical, gray-green to tan lesions (3–15 cm) on leaves. Lesions have wavy margins and may show dark sporulation.",
        "treatment": "Apply propiconazole or azoxystrobin fungicides at early disease onset. Most effective when applied before tasseling.",
        "prevention": "Plant resistant hybrids. Rotate crops. Reduce surface residue to limit inoculum.",
        "severity": "Moderate to High — can cause 30–50% yield loss in severe cases.",
    },
    "Corn___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy with dark green leaves.",
        "treatment": "No treatment needed.",
        "prevention": "Maintain proper plant spacing, balanced fertilization, and scout regularly.",
        "severity": "None",
    },
    "Grape___Black_rot": {
        "cause": "Caused by the fungus Guignardia bidwellii.",
        "symptoms": "Circular tan spots with dark borders on leaves. Infected berries turn brown, then black and shriveled (mummified).",
        "treatment": "Apply myclobutanil, mancozeb, or captan fungicides from bud break through veraison. Remove mummified berries.",
        "prevention": "Remove all mummified fruit and infected canes. Ensure good canopy air circulation. Apply preventive sprays.",
        "severity": "High — can destroy entire berry crop in wet seasons.",
    },
    "Grape___Esca": {
        "cause": "Caused by a complex of wood-rotting fungi including Phaeomoniella chlamydospora and Phaeoacremonium species.",
        "symptoms": "Tiger-stripe pattern of yellow/red between leaf veins. Berries may show dark spots ('black measles'). Internal wood shows brown streaking.",
        "treatment": "No effective chemical cure. Remove and destroy infected wood. Protect pruning wounds with fungicide paste (thiophanate-methyl).",
        "prevention": "Prune during dry weather. Apply wound protectants immediately after pruning. Avoid large pruning wounds.",
        "severity": "High — chronic disease that can kill vines over several years.",
    },
    "Grape___Leaf_blight": {
        "cause": "Caused by the fungus Pseudocercospora vitis (Isariopsis Leaf Spot).",
        "symptoms": "Irregular dark brown spots on upper leaf surface. Spots may have yellow halos. Severe infection causes defoliation.",
        "treatment": "Apply copper-based fungicides or mancozeb. Remove and destroy infected leaves.",
        "prevention": "Ensure good air circulation in the canopy. Avoid overhead irrigation. Practice sanitation by removing fallen leaves.",
        "severity": "Moderate — primarily affects leaf health and can weaken vines.",
    },
    "Grape___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Regular canopy management, proper pruning, and preventive fungicide program during wet seasons.",
        "severity": "None",
    },
    "Orange___Haunglongbing": {
        "cause": "Caused by the bacterium Candidatus Liberibacter asiaticus, transmitted by the Asian citrus psyllid insect.",
        "symptoms": "Asymmetric yellowing of leaves (blotchy mottle). Fruit remains small, misshapen, and bitter. Shoots die back progressively.",
        "treatment": "No cure exists. Remove and destroy infected trees immediately to prevent spread. Control psyllid populations with systemic insecticides.",
        "prevention": "Use certified disease-free nursery stock. Control Asian citrus psyllid with insecticides. Quarantine new plant material.",
        "severity": "Critical — fatal to citrus trees, no recovery possible. Major threat to citrus industry.",
    },
    "Peach___Bacterial_spot": {
        "cause": "Caused by the bacterium Xanthomonas arboricola pv. pruni.",
        "symptoms": "Small, water-soaked spots on leaves that turn purple-brown with yellow halos. Spots may fall out leaving 'shot-hole' appearance. Fruit shows sunken dark spots.",
        "treatment": "Apply copper-based bactericides starting at bud swell. Oxytetracycline sprays during bloom. Repeat every 7–10 days in wet weather.",
        "prevention": "Plant resistant varieties. Avoid overhead irrigation. Prune for good air circulation. Avoid working in wet orchards.",
        "severity": "Moderate to High — can cause severe defoliation and fruit loss in susceptible varieties.",
    },
    "Peach___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Regular pruning, balanced fertilization, and preventive copper sprays in early spring.",
        "severity": "None",
    },
    "Pepper__bell___Bacterial_spot": {
        "cause": "Caused by the bacterium Xanthomonas campestris pv. vesicatoria.",
        "symptoms": "Small, water-soaked spots on leaves that turn brown with yellow halos. Spots may merge causing leaf blight. Fruit shows raised, scabby lesions.",
        "treatment": "Apply copper-based bactericides combined with mancozeb. Remove and destroy infected plant parts. Avoid overhead irrigation.",
        "prevention": "Use certified disease-free seeds. Practice crop rotation. Maintain proper plant spacing for air circulation.",
        "severity": "Moderate",
    },
    "Pepper__bell___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy with no visible symptoms.",
        "treatment": "No treatment needed.",
        "prevention": "Continue regular monitoring, proper watering, and balanced fertilization.",
        "severity": "None",
    },
    "Potato___Early_blight": {
        "cause": "Caused by the fungus Alternaria solani.",
        "symptoms": "Dark brown circular spots with concentric rings (target-board pattern) on older leaves. Yellow halo around spots. Lesions may coalesce causing large blighted areas.",
        "treatment": "Apply fungicides containing chlorothalonil or mancozeb every 7–10 days. Remove infected leaves promptly.",
        "prevention": "Rotate crops every 2–3 years. Avoid overhead watering. Ensure adequate potassium nutrition. Destroy crop debris after harvest.",
        "severity": "Moderate",
    },
    "Potato___Late_blight": {
        "cause": "Caused by the water mold Phytophthora infestans.",
        "symptoms": "Pale green to brown water-soaked lesions on leaves. White mold visible on leaf undersides in humid conditions. Tubers show reddish-brown internal rot.",
        "treatment": "Apply systemic fungicides (metalaxyl, cymoxanil) preventively. Destroy infected plants immediately to prevent spread. Do not harvest during active infection.",
        "prevention": "Plant resistant varieties. Avoid excessive nitrogen. Ensure good field drainage. Monitor weather forecasts for blight-favorable conditions.",
        "severity": "Very High — can destroy entire crop within days in cool, wet weather.",
    },
    "Potato___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Maintain regular scouting, balanced irrigation, and use certified seed potatoes.",
        "severity": "None",
    },
    "Raspberry___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Prune out old canes after harvest, ensure good drainage, and monitor for cane diseases.",
        "severity": "None",
    },
    "Soybean___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Practice crop rotation, use certified seed, and scout regularly for pests and diseases.",
        "severity": "None",
    },
    "Squash___Powdery_mildew": {
        "cause": "Caused by the fungi Podosphaera xanthii or Erysiphe cichoracearum.",
        "symptoms": "White powdery coating on upper and lower leaf surfaces. Infected leaves turn yellow, then brown and die. Reduces photosynthesis significantly.",
        "treatment": "Apply potassium bicarbonate, sulfur, or neem oil sprays. Myclobutanil and trifloxystrobin are effective fungicides. Remove heavily infected leaves.",
        "prevention": "Plant resistant varieties. Ensure good air circulation. Avoid overhead watering. Apply preventive neem oil sprays.",
        "severity": "Moderate — can significantly reduce yield if left untreated.",
    },
    "Strawberry___Leaf_scorch": {
        "cause": "Caused by the fungus Diplocarpon earlianum.",
        "symptoms": "Small, irregular purple to dark brown spots on upper leaf surface. Centers of spots turn gray-brown. Severe infection causes leaves to look scorched and die.",
        "treatment": "Apply captan or myclobutanil fungicides. Remove and destroy infected leaves. Renovate beds after harvest.",
        "prevention": "Plant in well-drained soil with good air circulation. Avoid overhead irrigation. Use disease-free transplants. Renovate beds annually.",
        "severity": "Moderate — can weaken plants and reduce yield over multiple seasons.",
    },
    "Strawberry___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy.",
        "treatment": "No treatment needed.",
        "prevention": "Maintain proper bed renovation, good drainage, and regular monitoring.",
        "severity": "None",
    },
    "Tomato___Bacterial_spot": {
        "cause": "Caused by Xanthomonas species bacteria.",
        "symptoms": "Small, dark, water-soaked spots on leaves, stems, and fruit. Spots have yellow margins. Fruit shows raised, scabby lesions.",
        "treatment": "Copper-based sprays combined with mancozeb. Remove heavily infected plants. Avoid working in wet fields.",
        "prevention": "Use resistant varieties. Avoid overhead irrigation. Sanitize tools regularly. Use disease-free transplants.",
        "severity": "Moderate to High",
    },
    "Tomato___Early_blight": {
        "cause": "Caused by Alternaria solani fungus.",
        "symptoms": "Brown spots with concentric rings on lower/older leaves. Yellowing around lesions. Stem lesions (collar rot) possible on seedlings.",
        "treatment": "Apply chlorothalonil or copper fungicides every 7–10 days. Remove infected lower leaves. Stake plants to improve air circulation.",
        "prevention": "Mulch around plants to prevent soil splash. Avoid wetting foliage. Rotate crops annually. Destroy crop debris.",
        "severity": "Moderate",
    },
    "Tomato___Late_blight": {
        "cause": "Caused by Phytophthora infestans.",
        "symptoms": "Greasy, dark brown lesions on leaves and stems. White sporulation on leaf undersides in humid conditions. Fruit shows firm brown rot.",
        "treatment": "Apply fungicides (chlorothalonil, mancozeb, or cymoxanil) preventively. Destroy infected plants immediately. Do not compost infected material.",
        "prevention": "Plant resistant varieties. Improve air circulation. Avoid overhead irrigation. Monitor weather for blight-favorable conditions.",
        "severity": "Very High — spreads rapidly in cool, wet weather and can destroy entire crop.",
    },
    "Tomato___Leaf_Mold": {
        "cause": "Caused by the fungus Passalora fulva (formerly Fulvia fulva).",
        "symptoms": "Pale green or yellow spots on upper leaf surface. Olive-green to brown velvety mold on lower surface. Infected leaves curl and drop.",
        "treatment": "Apply fungicides (mancozeb, chlorothalonil, or copper). Improve greenhouse ventilation. Remove infected leaves.",
        "prevention": "Reduce humidity below 85%. Space plants adequately. Use resistant varieties. Ensure good ventilation in greenhouses.",
        "severity": "Moderate — primarily a greenhouse problem in high humidity.",
    },
    "Tomato___Septoria_leaf_spot": {
        "cause": "Caused by the fungus Septoria lycopersici.",
        "symptoms": "Small circular spots with dark borders and light gray centers on lower leaves. Tiny black dots (pycnidia) visible in spot centers. Causes progressive defoliation from bottom up.",
        "treatment": "Apply fungicides containing chlorothalonil or copper every 7–10 days. Remove infected leaves. Stake plants for better air flow.",
        "prevention": "Avoid overhead watering. Mulch soil to prevent splash. Rotate crops for 2+ years. Destroy crop debris.",
        "severity": "Moderate — can cause severe defoliation reducing fruit quality.",
    },
    "Tomato___Spider_mites": {
        "cause": "Infestation by Tetranychus urticae (two-spotted spider mite) — a pest, not a fungal disease.",
        "symptoms": "Tiny yellow or white stippling on leaves. Fine webbing on undersides. Leaves turn bronze, dry out, and drop. Worst in hot, dry conditions.",
        "treatment": "Apply miticides (abamectin, bifenazate) or insecticidal soap. Spray water forcefully on leaf undersides. Introduce predatory mites (Phytoseiulus persimilis).",
        "prevention": "Maintain adequate irrigation — mites thrive in drought stress. Avoid dusty conditions. Monitor regularly, especially in hot weather.",
        "severity": "Moderate to High in hot, dry conditions — can cause rapid defoliation.",
    },
    "Tomato___Target_Spot": {
        "cause": "Caused by the fungus Corynespora cassiicola.",
        "symptoms": "Brown lesions with concentric rings (target pattern) on leaves, stems, and fruit. Lesions may have yellow halos. Causes defoliation in severe cases.",
        "treatment": "Apply fungicides (azoxystrobin, chlorothalonil, or mancozeb). Remove infected plant debris. Improve air circulation.",
        "prevention": "Improve air circulation. Avoid leaf wetness. Practice crop rotation. Destroy infected crop debris.",
        "severity": "Moderate",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "cause": "Caused by Tomato yellow leaf curl virus (TYLCV), transmitted by the silverleaf whitefly (Bemisia tabaci).",
        "symptoms": "Upward curling and yellowing of leaf margins. Stunted plant growth. Reduced fruit set. Flowers may drop. Plants infected early produce no fruit.",
        "treatment": "No cure once infected. Remove and destroy infected plants immediately. Control whitefly populations with imidacloprid or thiamethoxam insecticides.",
        "prevention": "Use TYLCV-resistant varieties. Install insect-proof nets (50-mesh). Apply reflective mulches to deter whiteflies. Use yellow sticky traps for monitoring.",
        "severity": "Very High — can cause total crop loss, especially in early-season infections.",
    },
    "Tomato___Tomato_mosaic_virus": {
        "cause": "Caused by Tomato mosaic virus (ToMV), spread by contact, contaminated tools, and infected seed.",
        "symptoms": "Mosaic pattern of light and dark green on leaves. Leaf distortion and curling. Stunted growth. Reduced fruit quality with internal browning.",
        "treatment": "No cure. Remove infected plants. Disinfect tools with 10% bleach or 70% alcohol solution. Wash hands thoroughly before handling plants.",
        "prevention": "Use virus-free certified seeds and resistant varieties. Wash hands before handling plants. Control aphid vectors. Avoid tobacco use near plants.",
        "severity": "High — can cause significant yield and quality losses.",
    },
    "Tomato___healthy": {
        "cause": "No disease detected.",
        "symptoms": "Plant appears healthy with vibrant green leaves.",
        "treatment": "No treatment needed.",
        "prevention": "Continue regular monitoring, proper watering, balanced fertilization, and preventive fungicide program.",
        "severity": "None",
    },
}

DISEASE_KB_TE = {
    "Apple___Apple_scab": {
        "cause": "Venturia inaequalis అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకులు మరియు పండ్లపై ఆలివ్-పచ్చ నుండి గోధుమ రంగు మఖమల్ మచ్చలు. సోకిన ఆకులు ముడుచుకుని రాలిపోవచ్చు. పండ్లపై చీకటి, గరుకైన గాయాలు కనిపిస్తాయి.",
        "treatment": "మొగ్గ విచ్చుకునే సమయంలో శిలీంధ్రనాశకాలు (myclobutanil, captan లేదా mancozeb) వేయండి మరియు తడి వాతావరణంలో ప్రతి 7–10 రోజులకు పునరావృతం చేయండి. రాలిన ఆకులను తొలగించి నాశనం చేయండి.",
        "prevention": "స్కాబ్-నిరోధక యాపిల్ రకాలు నాటండి. శరదృతువులో రాలిన ఆకులను గుర్తించి నాశనం చేయండి. కత్తిరింపు ద్వారా మంచి గాలి ప్రసరణ నిర్ధారించండి.",
        "severity": "మధ్యస్థం నుండి అధికం — తడి సీజన్లలో గణనీయమైన పండ్ల నష్టం కలిగించవచ్చు.",
    },
    "Apple___Black_rot": {
        "cause": "Botryosphaeria obtusa అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై ఊదా అంచులతో వృత్తాకార గోధుమ గాయాలు ('కప్ప-కన్ను' మచ్చలు). పండ్లు నల్లగా, ముడుచుకుపోయి కుళ్ళిపోతాయి. కొమ్మలపై కాంకర్లు కనిపిస్తాయి.",
        "treatment": "Captan లేదా thiophanate-methyl శిలీంధ్రనాశకాలు వేయండి. కనిపించే కాంకర్ల కింద 15 సెం.మీ. వరకు సోకిన కొమ్మలు కత్తిరించండి. ముడుచుకుపోయిన పండ్లు తొలగించండి.",
        "prevention": "చనిపోయిన కలప మరియు ముడుచుకుపోయిన పండ్లు తొలగించండి. చెట్లకు గాయాలు కాకుండా జాగ్రత్తపడండి. సరైన ఎరువుతో చెట్టు శక్తిని నిర్వహించండి.",
        "severity": "మధ్యస్థం నుండి అధికం — కొమ్మలను చంపి పండ్లను నాశనం చేయవచ్చు.",
    },
    "Apple___Cedar_apple_rust": {
        "cause": "Gymnosporangium juniperi-virginianae అనే శిలీంధ్రం వల్ల వస్తుంది, యాపిల్ మరియు సీడార్/జునిపర్ రెండు అతిథులు అవసరం.",
        "symptoms": "వసంతకాలంలో ఆకుల పై భాగంలో ప్రకాశవంతమైన నారింజ-పసుపు మచ్చలు. ఆకుల అడుగు భాగంలో గొట్టం వంటి నిర్మాణాలు. పండ్లపై నారింజ గాయాలు కనిపించవచ్చు.",
        "treatment": "పింక్ మొగ్గ దశ నుండి రేకులు రాలే వరకు myclobutanil లేదా propiconazole శిలీంధ్రనాశకాలు వేయండి. ప్రతి 7–10 రోజులకు పునరావృతం చేయండి.",
        "prevention": "సాధ్యమైతే సమీపంలోని సీడార్/జునిపర్ చెట్లు తొలగించండి. తుప్పు-నిరోధక యాపిల్ రకాలు నాటండి. నివారణ శిలీంధ్రనాశక స్ప్రేలు వేయండి.",
        "severity": "మధ్యస్థం — చెట్లను చంపదు కానీ పండ్ల నాణ్యత తగ్గించి ఆకులు రాలిపోయేలా చేస్తుంది.",
    },
    "Apple___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ప్రకాశవంతమైన పచ్చని ఆకులతో ఆరోగ్యంగా కనిపిస్తోంది, ఎటువంటి గాయాలు లేవు.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా పర్యవేక్షించడం, సరైన కత్తిరింపు, సమతుల్య ఎరువు మరియు నివారణ శిలీంధ్రనాశక కార్యక్రమం కొనసాగించండి.",
        "severity": "లేదు",
    },
    "Blueberry___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "మట్టి pH 4.5–5.5 నిర్వహించండి, మంచి నీటి పారుదల నిర్ధారించండి మరియు తెగుళ్ళ కోసం క్రమం తప్పకుండా పర్యవేక్షించండి.",
        "severity": "లేదు",
    },
    "Cherry___Powdery_mildew": {
        "cause": "Podosphaera clandestina అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "లేత ఆకులు, చిగుళ్ళు మరియు పండ్లపై తెల్లని పొడి పూత. సోకిన ఆకులు ముడుచుకుని, వంకరగా మారి అకాలంగా రాలిపోవచ్చు.",
        "treatment": "సల్ఫర్-ఆధారిత లేదా పొటాషియం బైకార్బోనేట్ శిలీంధ్రనాశకాలు వేయండి. Myclobutanil మరియు trifloxystrobin కూడా ప్రభావవంతంగా ఉంటాయి. బాగా సోకిన చిగుళ్ళు తొలగించండి.",
        "prevention": "మంచి గాలి ప్రసరణతో పూర్తి సూర్యకాంతిలో నాటండి. అధిక నైట్రోజన్ ఎరువు వేయడం మానుకోండి. నిరోధక రకాలు వాడండి.",
        "severity": "మధ్యస్థం — పండ్ల నాణ్యత తగ్గించి లేత చెట్లను బలహీనపరుస్తుంది.",
    },
    "Cherry___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "గాలి ప్రసరణ కోసం క్రమం తప్పకుండా కత్తిరించడం, సమతుల్య ఎరువు మరియు తెగుళ్ళు మరియు వ్యాధుల కోసం పర్యవేక్షించడం.",
        "severity": "లేదు",
    },
    "Corn___Cercospora_leaf_spot": {
        "cause": "Cercospora zeae-maydis (గ్రే లీఫ్ స్పాట్) అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకు నరాల మధ్య సమాంతర అంచులతో దీర్ఘచతురస్రాకార, పసుపు-గోధుమ నుండి బూడిద రంగు గాయాలు. గాయాలు కలిసిపోయి పెద్ద నల్లబడిన ప్రాంతాలు ఏర్పడవచ్చు.",
        "treatment": "వ్యాధి ప్రారంభంలో strobilurin లేదా triazole శిలీంధ్రనాశకాలు వేయండి. టాసెలింగ్ దశలో ఆకు స్ప్రేలు అత్యంత ప్రభావవంతంగా ఉంటాయి.",
        "prevention": "నిరోధక హైబ్రిడ్లు నాటండి. పంట మార్పిడి పాటించండి (మొక్కజొన్న-మొక్కజొన్న మానుకోండి). దున్నడం ద్వారా పంట అవశేషాలు తగ్గించండి.",
        "severity": "మధ్యస్థం నుండి అధికం — తేమ పరిస్థితులలో అనుకూల హైబ్రిడ్లలో పెద్ద దిగుబడి నష్టం.",
    },
    "Corn___Common_rust": {
        "cause": "Puccinia sorghi అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకుల రెండు వైపులా చిన్న, వృత్తాకార నుండి పొడవైన, ఇటుక-ఎరుపు నుండి గోధుమ రంగు పుస్టుల్స్. పుస్టుల్స్ పగిలి పొడి తుప్పు రంగు బీజాంశాలు విడుదల చేస్తాయి.",
        "treatment": "తుప్పు మొదట గుర్తించినప్పుడు, ముఖ్యంగా టాసెలింగ్ ముందు triazole లేదా strobilurin శిలీంధ్రనాశకాలు వేయండి.",
        "prevention": "తుప్పు-నిరోధక మొక్కజొన్న హైబ్రిడ్లు నాటండి. తొందరగా నాటడం గరిష్ట తుప్పు సీజన్ నివారించడంలో సహాయపడుతుంది.",
        "severity": "మధ్యస్థం — అనుకూల రకాలలో తీవ్రమైన సంక్రమణలు దిగుబడిని గణనీయంగా తగ్గించవచ్చు.",
    },
    "Corn___Northern_Leaf_Blight": {
        "cause": "Exserohilum turcicum అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై పొడవైన, దీర్ఘవృత్తాకార, బూడిద-పచ్చ నుండి పసుపు రంగు గాయాలు (3–15 సెం.మీ.). గాయాలకు అలలాంటి అంచులు ఉంటాయి మరియు చీకటి బీజాంశాలు కనిపించవచ్చు.",
        "treatment": "వ్యాధి ప్రారంభంలో propiconazole లేదా azoxystrobin శిలీంధ్రనాశకాలు వేయండి. టాసెలింగ్ ముందు వేసినప్పుడు అత్యంత ప్రభావవంతంగా ఉంటుంది.",
        "prevention": "నిరోధక హైబ్రిడ్లు నాటండి. పంటలు మార్చండి. ఇనాక్యులమ్ తగ్గించడానికి ఉపరితల అవశేషాలు తగ్గించండి.",
        "severity": "మధ్యస్థం నుండి అధికం — తీవ్రమైన సందర్భాలలో 30–50% దిగుబడి నష్టం కలిగించవచ్చు.",
    },
    "Corn___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ముదురు పచ్చని ఆకులతో ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "సరైన మొక్కల అంతరం, సమతుల్య ఎరువు నిర్వహించండి మరియు క్రమం తప్పకుండా పర్యవేక్షించండి.",
        "severity": "లేదు",
    },
    "Grape___Black_rot": {
        "cause": "Guignardia bidwellii అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై చీకటి అంచులతో వృత్తాకార పసుపు మచ్చలు. సోకిన బెర్రీలు గోధుమ రంగుకు, తర్వాత నల్లగా మారి ముడుచుకుపోతాయి.",
        "treatment": "మొగ్గ విచ్చుకునే సమయం నుండి veraison వరకు myclobutanil, mancozeb లేదా captan శిలీంధ్రనాశకాలు వేయండి. ముడుచుకుపోయిన బెర్రీలు తొలగించండి.",
        "prevention": "ముడుచుకుపోయిన పండ్లు మరియు సోకిన కొమ్మలు తొలగించండి. మంచి గాలి ప్రసరణ నిర్ధారించండి. నివారణ స్ప్రేలు వేయండి.",
        "severity": "అధికం — తడి సీజన్లలో మొత్తం బెర్రీ పంటను నాశనం చేయవచ్చు.",
    },
    "Grape___Esca": {
        "cause": "Phaeomoniella chlamydospora మరియు Phaeoacremonium జాతులతో సహా కలప-కుళ్ళించే శిలీంధ్రాల సమూహం వల్ల వస్తుంది.",
        "symptoms": "ఆకు నరాల మధ్య పసుపు/ఎరుపు పట్టీల నమూనా. బెర్రీలపై చీకటి మచ్చలు ('నల్ల మశూచి'). లోపలి కలపలో గోధుమ రంగు చారలు.",
        "treatment": "ప్రభావవంతమైన రసాయన నివారణ లేదు. సోకిన కలపను తొలగించి నాశనం చేయండి. కత్తిరింపు గాయాలను శిలీంధ్రనాశక పేస్ట్ (thiophanate-methyl)తో రక్షించండి.",
        "prevention": "పొడి వాతావరణంలో కత్తిరించండి. కత్తిరింపు వెంటనే గాయ రక్షకాలు వేయండి. పెద్ద కత్తిరింపు గాయాలు నివారించండి.",
        "severity": "అధికం — అనేక సంవత్సరాలలో తీగలను చంపగల దీర్ఘకాలిక వ్యాధి.",
    },
    "Grape___Leaf_blight": {
        "cause": "Pseudocercospora vitis అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకు పై భాగంలో క్రమరహిత ముదురు గోధుమ మచ్చలు. మచ్చలకు పసుపు హాలోలు ఉండవచ్చు. తీవ్రమైన సంక్రమణ ఆకులు రాలిపోయేలా చేస్తుంది.",
        "treatment": "రాగి-ఆధారిత శిలీంధ్రనాశకాలు లేదా mancozeb వేయండి. సోకిన ఆకులు తొలగించి నాశనం చేయండి.",
        "prevention": "మేలిమి గాలి ప్రసరణ నిర్ధారించండి. పైన నుండి నీటిపారుదల నివారించండి. రాలిన ఆకులు తొలగించి పరిశుభ్రత పాటించండి.",
        "severity": "మధ్యస్థం — ప్రధానంగా ఆకు ఆరోగ్యాన్ని ప్రభావితం చేసి తీగలను బలహీనపరుస్తుంది.",
    },
    "Grape___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా మేలిమి నిర్వహణ, సరైన కత్తిరింపు మరియు తడి సీజన్లలో నివారణ శిలీంధ్రనాశక కార్యక్రమం.",
        "severity": "లేదు",
    },
    "Orange___Haunglongbing": {
        "cause": "ఆసియా సిట్రస్ సిల్లిడ్ కీటకం ద్వారా వ్యాపించే Candidatus Liberibacter asiaticus బాక్టీరియం వల్ల వస్తుంది.",
        "symptoms": "ఆకుల అసమాన పసుపు రంగు (మచ్చల నమూనా). పండ్లు చిన్నగా, వికృతంగా మరియు చేదుగా ఉంటాయి. చిగుళ్ళు క్రమంగా చనిపోతాయి.",
        "treatment": "నివారణ లేదు. వ్యాప్తి నివారించడానికి సోకిన చెట్లను వెంటనే తొలగించి నాశనం చేయండి. వ్యవస్థాగత కీటకనాశకాలతో సిల్లిడ్ జనాభాను నియంత్రించండి.",
        "prevention": "ధృవీకరించిన వ్యాధి-రహిత నర్సరీ మొక్కలు వాడండి. కీటకనాశకాలతో ఆసియా సిట్రస్ సిల్లిడ్ నియంత్రించండి. కొత్త మొక్కల పదార్థాన్ని నిర్బంధించండి.",
        "severity": "విమర్శాత్మకం — సిట్రస్ చెట్లకు ప్రాణాంతకం, కోలుకోవడం సాధ్యం కాదు. సిట్రస్ పరిశ్రమకు పెద్ద ముప్పు.",
    },
    "Peach___Bacterial_spot": {
        "cause": "Xanthomonas arboricola pv. pruni బాక్టీరియం వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై పసుపు హాలోలతో ఊదా-గోధుమ రంగుకు మారే నీటిలో నానిన చిన్న మచ్చలు. మచ్చలు రాలిపోయి 'షాట్-హోల్' రూపం ఏర్పడవచ్చు. పండ్లపై మునిగిన చీకటి మచ్చలు.",
        "treatment": "మొగ్గ వాపు సమయంలో రాగి-ఆధారిత బాక్టీరియానాశకాలు వేయడం ప్రారంభించండి. పూత సమయంలో Oxytetracycline స్ప్రేలు. తడి వాతావరణంలో ప్రతి 7–10 రోజులకు పునరావృతం చేయండి.",
        "prevention": "నిరోధక రకాలు నాటండి. పైన నుండి నీటిపారుదల నివారించండి. మంచి గాలి ప్రసరణ కోసం కత్తిరించండి. తడి తోటలలో పని చేయడం నివారించండి.",
        "severity": "మధ్యస్థం నుండి అధికం — అనుకూల రకాలలో తీవ్రమైన ఆకు రాలడం మరియు పండ్ల నష్టం కలిగించవచ్చు.",
    },
    "Peach___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా కత్తిరింపు, సమతుల్య ఎరువు మరియు వసంతకాలం ప్రారంభంలో నివారణ రాగి స్ప్రేలు.",
        "severity": "లేదు",
    },
    "Pepper__bell___Bacterial_spot": {
        "cause": "Xanthomonas campestris pv. vesicatoria బాక్టీరియం వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై పసుపు హాలోలతో గోధుమ రంగుకు మారే నీటిలో నానిన చిన్న మచ్చలు. మచ్చలు కలిసి ఆకు నల్లబడటానికి కారణమవుతాయి. పండ్లపై పెరిగిన, గరుకైన గాయాలు.",
        "treatment": "mancozebతో కలిపి రాగి-ఆధారిత బాక్టీరియానాశకాలు వేయండి. సోకిన మొక్కల భాగాలు తొలగించి నాశనం చేయండి. పైన నుండి నీటిపారుదల నివారించండి.",
        "prevention": "ధృవీకరించిన వ్యాధి-రహిత విత్తనాలు వాడండి. పంట మార్పిడి పాటించండి. గాలి ప్రసరణ కోసం సరైన మొక్కల అంతరం నిర్వహించండి.",
        "severity": "మధ్యస్థం",
    },
    "Pepper__bell___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఎటువంటి లక్షణాలు లేకుండా ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా పర్యవేక్షించడం, సరైన నీటిపారుదల మరియు సమతుల్య ఎరువు కొనసాగించండి.",
        "severity": "లేదు",
    },
    "Potato___Early_blight": {
        "cause": "Alternaria solani అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "పాత ఆకులపై కేంద్రీకృత వలయాలతో (లక్ష్య-బోర్డు నమూనా) ముదురు గోధుమ వృత్తాకార మచ్చలు. మచ్చల చుట్టూ పసుపు హాలో. గాయాలు కలిసి పెద్ద నల్లబడిన ప్రాంతాలు ఏర్పడవచ్చు.",
        "treatment": "ప్రతి 7–10 రోజులకు chlorothalonil లేదా mancozeb కలిగిన శిలీంధ్రనాశకాలు వేయండి. సోకిన ఆకులు వెంటనే తొలగించండి.",
        "prevention": "ప్రతి 2–3 సంవత్సరాలకు పంట మార్చండి. పైన నుండి నీరు పోయడం నివారించండి. తగినంత పొటాషియం పోషణ నిర్ధారించండి. పంట తర్వాత అవశేషాలు నాశనం చేయండి.",
        "severity": "మధ్యస్థం",
    },
    "Potato___Late_blight": {
        "cause": "Phytophthora infestans అనే నీటి అచ్చు వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై లేత పచ్చ నుండి గోధుమ రంగు నీటిలో నానిన గాయాలు. తేమ పరిస్థితులలో ఆకుల అడుగు భాగంలో తెల్లని అచ్చు కనిపిస్తుంది. దుంపలు ఎర్రటి-గోధుమ రంగు లోపలి కుళ్ళు చూపిస్తాయి.",
        "treatment": "వ్యవస్థాగత శిలీంధ్రనాశకాలు (metalaxyl, cymoxanil) నివారణగా వేయండి. వ్యాప్తి నివారించడానికి సోకిన మొక్కలను వెంటనే నాశనం చేయండి.",
        "prevention": "నిరోధక రకాలు నాటండి. అధిక నైట్రోజన్ నివారించండి. మంచి పొలం నీటి పారుదల నిర్ధారించండి.",
        "severity": "చాలా అధికం — చల్లని, తడి వాతావరణంలో రోజుల్లో మొత్తం పంటను నాశనం చేయవచ్చు.",
    },
    "Potato___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా పర్యవేక్షించడం, సమతుల్య నీటిపారుదల మరియు ధృవీకరించిన విత్తన బంగాళాదుంపలు వాడండి.",
        "severity": "లేదు",
    },
    "Raspberry___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "పంట తర్వాత పాత కొమ్మలు కత్తిరించండి, మంచి నీటి పారుదల నిర్ధారించండి.",
        "severity": "లేదు",
    },
    "Soybean___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "పంట మార్పిడి పాటించండి, ధృవీకరించిన విత్తనాలు వాడండి మరియు క్రమం తప్పకుండా పర్యవేక్షించండి.",
        "severity": "లేదు",
    },
    "Squash___Powdery_mildew": {
        "cause": "Podosphaera xanthii లేదా Erysiphe cichoracearum అనే శిలీంధ్రాల వల్ల వస్తుంది.",
        "symptoms": "ఆకుల పై మరియు అడుగు భాగాలపై తెల్లని పొడి పూత. సోకిన ఆకులు పసుపు రంగుకు, తర్వాత గోధుమ రంగుకు మారి చనిపోతాయి.",
        "treatment": "పొటాషియం బైకార్బోనేట్, సల్ఫర్ లేదా నీమ్ ఆయిల్ స్ప్రేలు వేయండి. Myclobutanil మరియు trifloxystrobin ప్రభావవంతమైన శిలీంధ్రనాశకాలు.",
        "prevention": "నిరోధక రకాలు నాటండి. మంచి గాలి ప్రసరణ నిర్ధారించండి. పైన నుండి నీరు పోయడం నివారించండి.",
        "severity": "మధ్యస్థం — చికిత్స చేయకపోతే దిగుబడిని గణనీయంగా తగ్గించవచ్చు.",
    },
    "Strawberry___Leaf_scorch": {
        "cause": "Diplocarpon earlianum అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకు పై భాగంలో చిన్న, క్రమరహిత ఊదా నుండి ముదురు గోధుమ మచ్చలు. మచ్చల మధ్యభాగాలు బూడిద-గోధుమ రంగుకు మారతాయి. తీవ్రమైన సంక్రమణ ఆకులు కాలిపోయినట్లు కనిపించేలా చేస్తుంది.",
        "treatment": "Captan లేదా myclobutanil శిలీంధ్రనాశకాలు వేయండి. సోకిన ఆకులు తొలగించి నాశనం చేయండి. పంట తర్వాత మడులు పునరుద్ధరించండి.",
        "prevention": "మంచి గాలి ప్రసరణతో బాగా నీటి పారుదల ఉన్న మట్టిలో నాటండి. పైన నుండి నీటిపారుదల నివారించండి.",
        "severity": "మధ్యస్థం — అనేక సీజన్లలో మొక్కలను బలహీనపరచి దిగుబడి తగ్గించవచ్చు.",
    },
    "Strawberry___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "సరైన మడి పునరుద్ధరణ, మంచి నీటి పారుదల మరియు క్రమం తప్పకుండా పర్యవేక్షించడం నిర్వహించండి.",
        "severity": "లేదు",
    },
    "Tomato___Bacterial_spot": {
        "cause": "Xanthomonas జాతుల బాక్టీరియా వల్ల వస్తుంది.",
        "symptoms": "ఆకులు, కాండాలు మరియు పండ్లపై చిన్న, చీకటి, నీటిలో నానిన మచ్చలు. మచ్చలకు పసుపు అంచులు ఉంటాయి. పండ్లపై పెరిగిన, గరుకైన గాయాలు.",
        "treatment": "mancozebతో కలిపి రాగి-ఆధారిత స్ప్రేలు. బాగా సోకిన మొక్కలు తొలగించండి. తడి పొలాలలో పని చేయడం నివారించండి.",
        "prevention": "నిరోధక రకాలు వాడండి. పైన నుండి నీటిపారుదల నివారించండి. పనిముట్లు క్రమం తప్పకుండా శుభ్రపరచండి.",
        "severity": "మధ్యస్థం నుండి అధికం",
    },
    "Tomato___Early_blight": {
        "cause": "Alternaria solani శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "దిగువ/పాత ఆకులపై కేంద్రీకృత వలయాలతో గోధుమ మచ్చలు. గాయాల చుట్టూ పసుపు రంగు. మొలకలపై కాండం గాయాలు సాధ్యం.",
        "treatment": "ప్రతి 7–10 రోజులకు chlorothalonil లేదా రాగి శిలీంధ్రనాశకాలు వేయండి. సోకిన దిగువ ఆకులు తొలగించండి.",
        "prevention": "మట్టి చిమ్మడం నివారించడానికి మొక్కల చుట్టూ మల్చ్ వేయండి. ఆకులు తడవకుండా జాగ్రత్తపడండి. పంటలు మార్చండి.",
        "severity": "మధ్యస్థం",
    },
    "Tomato___Late_blight": {
        "cause": "Phytophthora infestans వల్ల వస్తుంది.",
        "symptoms": "ఆకులు మరియు కాండాలపై జిడ్డుగా, ముదురు గోధుమ గాయాలు. తేమ పరిస్థితులలో ఆకుల అడుగు భాగంలో తెల్లని బీజాంశాలు. పండ్లపై గట్టి గోధుమ కుళ్ళు.",
        "treatment": "శిలీంధ్రనాశకాలు (chlorothalonil, mancozeb లేదా cymoxanil) నివారణగా వేయండి. సోకిన మొక్కలను వెంటనే నాశనం చేయండి.",
        "prevention": "నిరోధక రకాలు నాటండి. గాలి ప్రసరణ మెరుగుపరచండి. పైన నుండి నీటిపారుదల నివారించండి.",
        "severity": "చాలా అధికం — చల్లని, తడి వాతావరణంలో వేగంగా వ్యాపించి మొత్తం పంటను నాశనం చేయవచ్చు.",
    },
    "Tomato___Leaf_Mold": {
        "cause": "Passalora fulva అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకు పై భాగంలో లేత పచ్చ లేదా పసుపు మచ్చలు. అడుగు భాగంలో ఆలివ్-పచ్చ నుండి గోధుమ రంగు మఖమల్ అచ్చు. సోకిన ఆకులు ముడుచుకుని రాలిపోతాయి.",
        "treatment": "శిలీంధ్రనాశకాలు (mancozeb, chlorothalonil లేదా రాగి) వేయండి. గ్రీన్హౌస్ వెంటిలేషన్ మెరుగుపరచండి.",
        "prevention": "తేమను 85% కంటే తక్కువగా తగ్గించండి. మొక్కలకు తగినంత అంతరం ఇవ్వండి. నిరోధక రకాలు వాడండి.",
        "severity": "మధ్యస్థం — ప్రధానంగా అధిక తేమలో గ్రీన్హౌస్ సమస్య.",
    },
    "Tomato___Septoria_leaf_spot": {
        "cause": "Septoria lycopersici అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "దిగువ ఆకులపై చీకటి అంచులు మరియు లేత బూడిద మధ్యభాగాలతో చిన్న వృత్తాకార మచ్చలు. మచ్చల మధ్యభాగాలలో చిన్న నల్లని చుక్కలు కనిపిస్తాయి.",
        "treatment": "ప్రతి 7–10 రోజులకు chlorothalonil లేదా రాగి కలిగిన శిలీంధ్రనాశకాలు వేయండి. సోకిన ఆకులు తొలగించండి.",
        "prevention": "పైన నుండి నీరు పోయడం నివారించండి. మట్టి చిమ్మడం నివారించడానికి మల్చ్ వేయండి. 2+ సంవత్సరాలు పంటలు మార్చండి.",
        "severity": "మధ్యస్థం — పండ్ల నాణ్యత తగ్గించే తీవ్రమైన ఆకు రాలడానికి కారణమవుతుంది.",
    },
    "Tomato___Spider_mites": {
        "cause": "Tetranychus urticae (రెండు-మచ్చల సాలెపురుగు పురుగు) వల్ల వస్తుంది — శిలీంధ్ర వ్యాధి కాదు.",
        "symptoms": "ఆకులపై చిన్న పసుపు లేదా తెల్లని మచ్చలు. అడుగు భాగాలపై సన్నని సాలె గూళ్ళు. ఆకులు కాంస్య రంగుకు మారి ఎండిపోయి రాలిపోతాయి.",
        "treatment": "Miticides (abamectin, bifenazate) లేదా కీటకనాశక సబ్బు వేయండి. ఆకుల అడుగు భాగాలపై బలంగా నీరు స్ప్రే చేయండి.",
        "prevention": "తగినంత నీటిపారుదల నిర్వహించండి — పురుగులు కరువు ఒత్తిడిలో వృద్ధి చెందుతాయి. దుమ్ము పరిస్థితులు నివారించండి.",
        "severity": "వేడి, పొడి పరిస్థితులలో మధ్యస్థం నుండి అధికం.",
    },
    "Tomato___Target_Spot": {
        "cause": "Corynespora cassiicola అనే శిలీంధ్రం వల్ల వస్తుంది.",
        "symptoms": "ఆకులు, కాండాలు మరియు పండ్లపై కేంద్రీకృత వలయాలతో (లక్ష్య నమూనా) గోధుమ గాయాలు. గాయాలకు పసుపు హాలోలు ఉండవచ్చు.",
        "treatment": "శిలీంధ్రనాశకాలు (azoxystrobin, chlorothalonil లేదా mancozeb) వేయండి. సోకిన మొక్కల అవశేషాలు తొలగించండి.",
        "prevention": "గాలి ప్రసరణ మెరుగుపరచండి. ఆకు తడవడం నివారించండి. పంట మార్పిడి పాటించండి.",
        "severity": "మధ్యస్థం",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "cause": "silverleaf తెల్లదోమ (Bemisia tabaci) ద్వారా వ్యాపించే Tomato yellow leaf curl virus (TYLCV) వల్ల వస్తుంది.",
        "symptoms": "ఆకు అంచులు పైకి ముడుచుకుని పసుపు రంగుకు మారడం. మొక్క పెరుగుదల ఆగిపోవడం. పండ్ల సంఖ్య తగ్గడం. పూలు రాలిపోవడం.",
        "treatment": "సోకిన తర్వాత నివారణ లేదు. సోకిన మొక్కలను వెంటనే తొలగించి నాశనం చేయండి. imidacloprid లేదా thiamethoxam కీటకనాశకాలతో తెల్లదోమ జనాభాను నియంత్రించండి.",
        "prevention": "TYLCV-నిరోధక రకాలు వాడండి. కీటక-నిరోధక వలలు (50-మెష్) అమర్చండి. తెల్లదోమలను నిరుత్సాహపరచడానికి పరావర్తన మల్చ్లు వేయండి.",
        "severity": "చాలా అధికం — ముఖ్యంగా సీజన్ ప్రారంభంలో సోకినప్పుడు మొత్తం పంట నష్టం కలిగించవచ్చు.",
    },
    "Tomato___Tomato_mosaic_virus": {
        "cause": "సంపర్కం, కలుషితమైన పనిముట్లు మరియు సోకిన విత్తనాల ద్వారా వ్యాపించే Tomato mosaic virus (ToMV) వల్ల వస్తుంది.",
        "symptoms": "ఆకులపై లేత మరియు ముదురు పచ్చ రంగుల మొజాయిక్ నమూనా. ఆకు వికృతత మరియు ముడుచుకోవడం. పెరుగుదల ఆగిపోవడం. పండ్ల నాణ్యత తగ్గడం.",
        "treatment": "నివారణ లేదు. సోకిన మొక్కలు తొలగించండి. పనిముట్లను 10% బ్లీచ్ లేదా 70% ఆల్కహాల్ ద్రావణంతో శుభ్రపరచండి.",
        "prevention": "వైరస్-రహిత ధృవీకరించిన విత్తనాలు మరియు నిరోధక రకాలు వాడండి. మొక్కలను తాకే ముందు చేతులు కడుక్కోండి.",
        "severity": "అధికం — గణనీయమైన దిగుబడి మరియు నాణ్యత నష్టాలు కలిగించవచ్చు.",
    },
    "Tomato___healthy": {
        "cause": "వ్యాధి గుర్తించబడలేదు.",
        "symptoms": "మొక్క ప్రకాశవంతమైన పచ్చని ఆకులతో ఆరోగ్యంగా కనిపిస్తోంది.",
        "treatment": "చికిత్స అవసరం లేదు.",
        "prevention": "క్రమం తప్పకుండా పర్యవేక్షించడం, సరైన నీటిపారుదల, సమతుల్య ఎరువు మరియు నివారణ శిలీంధ్రనాశక కార్యక్రమం కొనసాగించండి.",
        "severity": "లేదు",
    },
}

UNKNOWN_INFO = {
    "cause": "The image didn't match any of the 38 plant disease patterns the AI was trained on. This usually happens with non-leaf images, very blurry shots, or plants outside the supported list.",
    "symptoms": "No recognizable leaf features were detected. The AI needs a clear, well-lit photo of a single leaf to work accurately.",
    "treatment": "No action needed yet — try uploading a better photo first. Use natural daylight, hold the camera steady, and make sure the leaf fills most of the frame.",
    "prevention": "For the best results: shoot in natural light, focus on one leaf at a time, keep the diseased area clearly visible, and avoid shadows or blurry edges.",
    "severity": "Unknown — the AI couldn't make a confident assessment from this image.",
}

GENERAL_PLANT_TIPS = {
    "water": "💧 Water early morning at soil level. Deep, infrequent watering is better than frequent shallow watering. Use mulch to retain moisture and prevent soil splash onto leaves.",
    "fertilizer": "🌱 Use balanced NPK fertilizer. Potassium strengthens disease resistance. Avoid over-fertilizing with nitrogen as it makes plants more susceptible to diseases. Consider soil testing.",
    "organic": "🌿 Organic options: neem oil (broad-spectrum), garlic spray (antifungal), milk solution 1:10 with water (powdery mildew), baking soda spray, compost tea. Companion planting with marigolds also helps.",
    "timing": "⏰ Apply treatments early morning or evening to avoid leaf burn. Start preventive sprays before disease season. Treat at first sign of disease for best results.",
    "soil": "🪱 Healthy soil = healthy plants. Maintain proper pH, add organic matter, ensure good drainage, and practice crop rotation to break disease cycles.",
}


def get_disease_info(disease: str, lang: str = "en") -> dict:
    kb = DISEASE_KB_TE if lang == "te" else DISEASE_KB
    fallback_kb = DISEASE_KB  # always use English for keys not in Telugu KB
    # Exact match first
    key_match = None
    if disease in fallback_kb:
        key_match = disease
    else:
        dl = disease.lower()
        for key in fallback_kb:
            if key.lower() in dl or dl in key.lower():
                key_match = key
                break
    if key_match:
        data = kb.get(key_match) or fallback_kb[key_match]
        return {"disease": key_match, **data}
    dl = disease.lower()
    if "not a plant" in dl or "unrecognized" in dl:
        if lang == "te":
            return {
                "disease": disease,
                "cause": "చిత్రం మొక్క ఆకుగా గుర్తించబడలేదు.",
                "symptoms": "AI మోడల్ అప్లోడ్ చేసిన చిత్రంలో మొక్క ఆకును గుర్తించలేకపోయింది.",
                "treatment": "మొక్క ఆకు యొక్క స్పష్టమైన, దగ్గరి ఫోటో అప్లోడ్ చేయండి.",
                "prevention": "మంచి ఫలితాల కోసం: సహజ పగటి వెలుతురు వాడండి, కెమెరాను స్థిరంగా పట్టుకోండి, ఒక ఆకుపై దృష్టి పెట్టండి.",
                "severity": "తెలియదు",
            }
        return {
            "disease": disease,
            "cause": "The image was not recognized as a plant leaf.",
            "symptoms": "The AI model could not detect a plant leaf in the uploaded image.",
            "treatment": "Please upload a clear, close-up photo of a plant leaf. Ensure the leaf fills most of the frame with good lighting.",
            "prevention": "Tips for a good scan: use natural daylight, hold the camera steady, focus on a single leaf, and ensure the diseased area is clearly visible.",
            "severity": "N/A — not a plant disease detection result.",
        }
    if lang == "te":
        return {"disease": disease, "cause": "తెలిసిన మొక్కల వ్యాధి గుర్తించబడలేదు.", "symptoms": "చిత్రం AI మోడల్ శిక్షణ పొందిన 38 నమూనాలలో దేనికీ సరిపోలలేదు.", "treatment": "స్పష్టమైన, దగ్గరి ఆకు ఫోటో అప్లోడ్ చేయండి.", "prevention": "సహజ పగటి వెలుతురు వాడండి, ఆకు ఫ్రేమ్ నింపేలా చేయండి.", "severity": "తెలియదు"}
    return {"disease": disease, **UNKNOWN_INFO}


TELUGU_RESPONSES = {
    "greeting": "నమస్కారం! 🌱 నేను మీ మొక్కల వైద్యుడు AI. ఈ సిస్టమ్ గుర్తించే 38 మొక్కల వ్యాధులపై నాకు వివరణాత్మక జ్ఞానం ఉంది. నేను మీకు ఎలా సహాయం చేయగలను?",
    "thanks": "మీకు స్వాగతం! 🌿 మొక్కల ఆరోగ్యం గురించి మరేదైనా అడగడానికి సంకోచించకండి.",
    "about": "నేను మీ మొక్కల వైద్యుడు AI! 🤖🌱 Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry మరియు Tomato అంతటా 38 మొక్కల వ్యాధులపై నాకు నిపుణ జ్ఞానం ఉంది. కారణాలు, లక్షణాలు, చికిత్సలు, నివారణ లేదా తీవ్రత గురించి అడగండి!",
    "organic": "🌿 సేంద్రీయ ఎంపికలు: నీమ్ ఆయిల్ (విస్తృత-స్పెక్ట్రమ్), వెల్లుల్లి స్ప్రే (యాంటీఫంగల్), పాలు 1:10 నీటితో (పౌడరీ మిల్డ్యూ), బేకింగ్ సోడా స్ప్రే, కంపోస్ట్ టీ. మేరిగోల్డ్‌లతో సహచర నాటడం కూడా సహాయపడుతుంది.",
    "water": "💧 ఉదయం మట్టి స్థాయిలో నీరు పోయండి. తరచుగా నీరు పోయడం కంటే లోతైన, అరుదైన నీరు పోయడం మంచిది. తేమను నిలుపుకోవడానికి మల్చ్ వాడండి.",
    "fertilizer": "🌱 సమతుల్య NPK ఎరువు వాడండి. పొటాషియం వ్యాధి నిరోధకతను బలపరుస్తుంది. నైట్రోజన్‌తో అధికంగా ఎరువు వేయడం మానుకోండి. మట్టి పరీక్ష పరిగణించండి.",
    "timing": "⏰ ఆకు కాలిపోవడం నివారించడానికి తెల్లవారుజామున లేదా సాయంత్రం చికిత్సలు వర్తించండి. వ్యాధి సీజన్ ముందు నివారణ స్ప్రేలు ప్రారంభించండి.",
    "soil": "🪱 ఆరోగ్యకరమైన మట్టి = ఆరోగ్యకరమైన మొక్కలు. సరైన pH నిర్వహించండి, సేంద్రీయ పదార్థం జోడించండి, మంచి నీటి పారుదల నిర్ధారించండి.",
    "cause": "**🦠 {name} కారణం:** {value}",
    "symptoms": "**🔍 {name} లక్షణాలు:** {value}",
    "treatment": "**💊 {name} చికిత్స:** {value}",
    "prevention": "**🛡️ {name} నివారణ:** {value}",
    "severity": "**⚠️ {name} తీవ్రత:** {value}",
    "plant_diseases": "**🌿 ఈ సిస్టమ్‌లో తెలిసిన {plant} వ్యాధులు:**",
}

TELUGU_KEYWORDS = {
    "greeting": ["నమస్కారం", "హలో", "హాయ్", "శుభోదయం", "శుభ సాయంత్రం"],
    "thanks": ["ధన్యవాదాలు", "థాంక్యూ", "అభినందనలు"],
    "about": ["మీరు ఏమి చేయగలరు", "మీకు ఏమి తెలుసు"],
    "organic": ["సేంద్రీయ", "సహజ", "నీమ్", "వెల్లుల్లి"],
    "water": ["నీరు", "నీటిపారుదల", "తేమ"],
    "fertilizer": ["ఎరువు", "పోషణ", "పోషకాలు"],
    "timing": ["సమయం", "ఉత్తమ సమయం"],
    "soil": ["మట్టి", "నేల", "కంపోస్ట్"],
    "cause": ["కారణం", "ఎందుకు", "కారణమేమిటి"],
    "symptoms": ["లక్షణాలు", "సంకేతాలు", "ఎలా కనిపిస్తుంది"],
    "treatment": ["చికిత్స", "నయం", "మందు", "స్ప్రే", "ఎలా చికిత్స"],
    "prevention": ["నివారణ", "నివారించడం", "ఆపడం", "రక్షణ"],
    "severity": ["తీవ్రత", "ప్రమాదం", "తీవ్రంగా", "నష్టం"],
    "report": ["నివేదిక", "సారాంశం", "వివరాలు", "పూర్తి", "అన్ని సమాచారం"],
}


def answer_question(disease: str, question: str, lang: str = "en") -> str:
    info = get_disease_info(disease, lang)
    q = question.lower()

    if lang == "te":
        return _answer_telugu(info, q)

    # Greetings (word boundary checks to avoid matching substrings like 'hi' in 'this')
    if any(re.search(rf'\b{w}\b', q) for w in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]):
        return "Hey there! 🌱 I'm your Plant Doctor AI. I can help you understand any disease your plant was diagnosed with — causes, symptoms, treatment steps, and how to prevent it from coming back. What would you like to know?"

    if any(re.search(rf'\b{w}\b', q) for w in ["thank", "thanks", "appreciate", "great", "awesome", "perfect"]):
        return "You're very welcome! 🌿 Feel free to ask me anything else about plant health."

    if any(w in q for w in ["how are you", "how do you do", "what can you do", "what do you know"]):
        return (
            "I'm your Plant Doctor AI! 🤖🌱 I know 38 plant diseases across Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, and Tomato. "
            "Ask me what's causing a disease, how to treat it, how to stop it from spreading, or how serious it is — I'll give you a straight answer."
        )

    # Specific disease info
    # General plant care (checked first to avoid keyword conflicts like "treat" in "organic treatment")
    if any(w in q for w in ["organic", "natural", "chemical-free", "neem", "garlic"]):
        return GENERAL_PLANT_TIPS["organic"]

    if any(w in q for w in ["water", "irrigation", "watering", "moisture"]):
        return GENERAL_PLANT_TIPS["water"]

    if any(w in q for w in ["fertilizer", "nutrition", "nutrient", "feed", "npk"]):
        return GENERAL_PLANT_TIPS["fertilizer"]

    if any(w in q for w in ["timing", "best time", "schedule"]):
        return GENERAL_PLANT_TIPS["timing"]

    if any(w in q for w in ["soil", "ph", "drainage", "compost"]):
        return GENERAL_PLANT_TIPS["soil"]

    if any(w in q for w in ["cause", "why", "reason", "responsible", "what causes", "pathogen", "organism"]):
        return f"**🦠 What's causing {_name(info)}:**\n{info['cause']}"

    if any(w in q for w in ["symptom", "sign", "look", "appear", "identify", "recognize", "how does it look", "what does"]):
        return f"**🔍 What to look for — {_name(info)}:**\n{info['symptoms']}"

    if any(w in q for w in ["treat", "cure", "fix", "medicine", "fungicide", "spray", "control", "remedy", "how to treat", "what to apply"]):
        return f"**💊 How to treat {_name(info)}:**\n{info['treatment']}"

    if any(w in q for w in ["prevent", "avoid", "stop", "protect", "prevention", "how to prevent"]):
        return f"**🛡️ How to prevent {_name(info)}:**\n{info['prevention']}"

    if any(w in q for w in ["severe", "danger", "serious", "bad", "risk", "how bad", "severity", "impact", "damage"]):
        return f"**⚠️ How serious is {_name(info)}?**\n{info['severity']}"

    if any(w in q for w in ["report", "summary", "detail", "full", "all info", "tell me everything", "about", "overview", "complete"]):
        return build_report(info)

    # Cross-disease questions
    if any(w in q for w in ["tomato", "potato", "apple", "corn", "grape", "pepper", "peach", "cherry", "orange", "strawberry", "squash", "blueberry", "raspberry", "soybean"]):
        plant = next((p for p in ["tomato", "potato", "apple", "corn", "grape", "pepper", "peach", "cherry", "orange", "strawberry", "squash", "blueberry", "raspberry", "soybean"] if p in q), None)
        if plant:
            diseases = [k.replace("___", " › ").replace("_", " ") for k in DISEASE_KB if plant.lower() in k.lower() and "healthy" not in k.lower()]
            if diseases:
                return f"**🌿 Known {plant.capitalize()} diseases in this system:**\n" + "\n".join(f"• {d}" for d in diseases)

    # Default: show full report for the detected disease
    return build_report(info)


def _answer_telugu(info: dict, q: str) -> str:
    name = _name(info)

    if any(w in q for w in TELUGU_KEYWORDS["greeting"] + ["hello", "hi", "hey"]):
        return TELUGU_RESPONSES["greeting"]

    if any(w in q for w in TELUGU_KEYWORDS["thanks"] + ["thank", "thanks"]):
        return TELUGU_RESPONSES["thanks"]

    if any(w in q for w in TELUGU_KEYWORDS["about"] + ["what can you do", "what do you know"]):
        return TELUGU_RESPONSES["about"]

    if any(w in q for w in TELUGU_KEYWORDS["organic"] + ["organic", "neem", "garlic"]):
        return TELUGU_RESPONSES["organic"]

    if any(w in q for w in TELUGU_KEYWORDS["water"] + ["water", "irrigation"]):
        return TELUGU_RESPONSES["water"]

    if any(w in q for w in TELUGU_KEYWORDS["fertilizer"] + ["fertilizer", "npk"]):
        return TELUGU_RESPONSES["fertilizer"]

    if any(w in q for w in TELUGU_KEYWORDS["timing"] + ["timing", "schedule"]):
        return TELUGU_RESPONSES["timing"]

    if any(w in q for w in TELUGU_KEYWORDS["soil"] + ["soil", "compost"]):
        return TELUGU_RESPONSES["soil"]

    if any(w in q for w in TELUGU_KEYWORDS["cause"] + ["cause", "why", "reason"]):
        return TELUGU_RESPONSES["cause"].format(name=name, value=info["cause"])

    if any(w in q for w in TELUGU_KEYWORDS["symptoms"] + ["symptom", "sign", "look"]):
        return TELUGU_RESPONSES["symptoms"].format(name=name, value=info["symptoms"])

    if any(w in q for w in TELUGU_KEYWORDS["treatment"] + ["treat", "cure", "spray", "fungicide"]):
        return TELUGU_RESPONSES["treatment"].format(name=name, value=info["treatment"])

    if any(w in q for w in TELUGU_KEYWORDS["prevention"] + ["prevent", "avoid", "stop"]):
        return TELUGU_RESPONSES["prevention"].format(name=name, value=info["prevention"])

    if any(w in q for w in TELUGU_KEYWORDS["severity"] + ["severe", "danger", "risk"]):
        return TELUGU_RESPONSES["severity"].format(name=name, value=info["severity"])

    if any(w in q for w in TELUGU_KEYWORDS["report"] + ["report", "summary", "full", "about"]):
        return build_report_telugu(info)

    return build_report_telugu(info)


def _name(info: dict) -> str:
    return info["disease"].replace("___", " › ").replace("_", " ")


def build_report(info: dict) -> str:
    name = _name(info)
    sev = info["severity"]
    is_healthy = sev.lower() == "none"
    sev_icon = "🔴" if any(w in sev.lower() for w in ["high", "critical", "very"]) else ("🟡" if "moderate" in sev.lower() else ("🟢" if is_healthy else "⚪"))

    if is_healthy:
        return (
            f"## 🌿 {name}\n\n"
            f"Your plant looks healthy — no signs of disease were detected. Great job keeping it in good shape!\n\n"
            f"**What to keep doing:**\n{info['prevention']}\n\n"
            f"Keep monitoring regularly, especially after rain or temperature changes. Early detection always makes a difference."
        )

    return (
        f"## 🌿 {name}\n\n"
        f"Here's what the AI found and what you can do about it.\n\n"
        f"**{sev_icon} How serious is this?**\n{sev}\n\n"
        f"**🦠 What's causing it?**\n{info['cause']}\n\n"
        f"**🔍 What to look for:**\n{info['symptoms']}\n\n"
        f"**💊 What you should do:**\n{info['treatment']}\n\n"
        f"**🛡️ How to prevent it next time:**\n{info['prevention']}\n\n"
        f"Don't panic — most plant diseases are manageable when caught early. If symptoms are spreading fast, consider consulting a local agronomist."
    )


def build_report_telugu(info: dict) -> str:
    name = _name(info)
    sev = info["severity"]
    is_healthy = sev.lower() == "none" or "లేదు" in sev
    sev_icon = "🔴" if any(w in sev.lower() for w in ["high", "critical", "very", "అధికం", "విమర్శాత్మకం"]) else ("🟡" if "moderate" in sev.lower() or "మధ్యస్థం" in sev else ("🟢" if is_healthy else "⚪"))

    if is_healthy:
        return (
            f"## 🌿 {name}\n\n"
            f"మీ మొక్క ఆరోగ్యంగా ఉంది — వ్యాధి సంకేతాలు ఏవీ కనుగొనబడలేదు. చాలా బాగుంది!\n\n"
            f"**కొనసాగించవలసినవి:**\n{info['prevention']}\n\n"
            f"వర్షం లేదా ఉష్ణోగ్రత మార్పుల తర్వాత క్రమం తప్పకుండా పర్యవేక్షించండి."
        )

    return (
        f"## 🌿 {name}\n\n"
        f"AI కనుగొన్నది మరియు మీరు ఏమి చేయవచ్చో ఇక్కడ ఉంది.\n\n"
        f"**{sev_icon} ఇది ఎంత తీవ్రంగా ఉంది?**\n{sev}\n\n"
        f"**🦠 కారణం ఏమిటి?**\n{info['cause']}\n\n"
        f"**🔍 ఏమి చూడాలి:**\n{info['symptoms']}\n\n"
        f"**💊 మీరు ఏమి చేయాలి:**\n{info['treatment']}\n\n"
        f"**🛡️ తదుపరిసారి ఎలా నివారించాలి:**\n{info['prevention']}\n\n"
        f"ఆందోళన పడకండి — చాలా మొక్కల వ్యాధులు తొందరగా గుర్తిస్తే నిర్వహించవచ్చు."
    )
