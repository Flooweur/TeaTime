// Made by `npm run content:build` from content/'s YAML and Markdown: never by hand.
// `npm run content:check` fails when it's out of date. The app and the server both import it.
import type { ContentBundle } from "@teatime/core";

export const BUNDLE: ContentBundle = {
  "format": 3,
  "blends": [
    {
      "code": "001",
      "slug": "moroccan-mint",
      "name": "Moroccan mint tea",
      "mode": "safe",
      "family": "household",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "Morocco",
      "story": "Moroccan atay is Chinese green tea, fresh spearmint and sugar. Tea reached Morocco through European trade in the 17th and 18th centuries, then poured in during the 19th: when the Crimean War (1853–1856) cost British merchants their Slavic markets, they shipped it to Mogador (Essaouira) and Tangier. Gunpowder, first rolled in Zhejiang, is still the base, and Morocco is the largest market for China's high-grade gunpowder. Rinsing the leaves, breaking the sugar and pouring from high to raise a foam make it Morocco's gesture of hospitality.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "minty",
        "sweet"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Recette thé à la menthe",
          "author": "Fauchon",
          "url": "https://www.fauchon.com/blogs/news/recette-the-a-la-menthe-fauchon",
          "lang": "fr",
          "primary": true,
          "supports": [
            "recipe",
            "parameters",
            "story"
          ],
          "note": "A teapot-only method: rinse the leaves in hot water for 30 s and throw it away, steep 2–3 minutes in simmering water (beyond 3 minutes bitterness dominates), mint pushed under the water, sugar to taste, poured from high into a glass and back several times; nanah mint; filtered or low-mineral water."
        },
        {
          "title": "Moroccan mint tea",
          "author": "Hassan M'Souli, SBS Food (Feast magazine)",
          "url": "https://www.sbs.com.au/food/recipe/moroccan-mint-tea/xjy4j2jl7",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "A Casablanca-born chef's recipe: gunpowder rinsed in boiling water, one minute over the flame, one more with the mint, 165 g sugar for 8 serves, poured into a glass and back three times, then from high for froth."
        },
        {
          "title": "Moroccan Mint Tea",
          "author": "Nargisse Benkabbou, My Moroccan Food",
          "url": "https://www.mymoroccanfood.com/home/2015/4/27/moroccan-mint-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "A chef's own recipe: 1 heaped teaspoon of gunpowder, 500 ml boiling water, 3 tablespoons of caster sugar (about 36 g), 7 mint sprigs."
        },
        {
          "title": "Gunpowder Grade 1",
          "author": "Thés & Traditions",
          "url": "https://www.thes-traditions.com/en/green-tea/gunpowder-grade-1",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "12 to 15 g of pearls per litre, low-mineral water, 2 to 3 minutes; enjoy within 18 months."
        },
        {
          "title": "Thé vert à la menthe, l'incarnation d'un métissage culturel entre la Chine et le Maroc",
          "author": "Maroc.ma (MAP), 28 January 2026",
          "url": "https://maroc.ma/fr/actualites/vert-la-menthe-lincarnation-dun-metissage-culturel-entre-la-chine-et-le-maroc",
          "lang": "fr",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Tea introduced in the 17th and 18th centuries; after the Crimean War (1853–1856) the British East India Company shipped it to Mogador and Tangier; the ritual from rinsing the leaves and breaking the sugar to pouring from high."
        },
        {
          "title": "外销高档珠茶的品质控制技术要点 (Quality control of high-grade export gunpowder)",
          "author": "Liu Xiangji, China Tea Processing 2022 (4): 18–23",
          "url": "https://www.sciopen.com/local/article_pdf/10.15905/j.cnki.33-1157/ts.2022.04.010.pdf",
          "lang": "zh",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Gunpowder originated around Shaoxing, Zhejiang; Morocco is the largest market for China's high-grade gunpowder; grades from special 3505 down to 9375."
        }
      ],
      "ingredients": [
        {
          "id": "gunpowder-green",
          "qty": 7,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "fresh-spearmint",
          "qty": 7,
          "unit": "pieces",
          "optional": false,
          "role": "base"
        },
        {
          "id": "sugar",
          "qty": 36,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "filtered",
        "tempC": 90,
        "tempRange": {
          "min": 70,
          "max": 100
        },
        "ratioGPer100ml": 1.4,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": false,
        "infusionsS": [
          120
        ]
      },
      "steps": [
        {
          "text": "Put the tea in the teapot and pour in a little hot water, about 125 ml. After 30 seconds pour it away, keeping the leaves: this washes the tea.",
          "office": "Put the tea in the office teapot and pour in a little water from the kettle, about 125 ml. After 30 seconds pour it away, keeping the leaves.",
          "timerS": 30,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour 500 ml of water just off the boil (about 90 °C) over the leaves and put the lid on.",
          "office": "Set the kettle to 90 °C, pour 500 ml over the leaves and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Add the mint, pushing it right under the water so no leaf floats, and the sugar if you take it (3 tablespoons of caster sugar, or lumps of the same weight).",
          "office": "Add the mint, pushed right under the water, and the sugar if you packed it.",
          "timerS": 60,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour a glass and tip it back into the pot, three times, to mix. Then serve from high, lowering the pot at the end to raise a foam, and leave a few centimetres at the top of each glass.",
          "office": "Pour a mug and tip it back into the pot, three times, then pour into the two mugs from as high as you safely can, over the sink.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "002",
      "slug": "sencha",
      "name": "Sencha, brewed right",
      "mode": "safe",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-master",
      "origin": "Japan",
      "story": "Sencha as Japan drinks it is said to start in 1738 at Ujitawara, near Kyoto, where Nagatani Sōen is credited with rolling the steamed leaves before drying them: a green, fragrant tea where there had been a reddish one. Yamamotoyama, the Edo merchant, tells how its second Kahei bought his whole lot on the spot. The way to brew it is written down by Japan's farm ministry and its tea instructors: water cooled by pouring it through the cups, a short steep, and each cup poured in turn, down to the last drop.",
      "difficulty": 2,
      "seasons": [],
      "flavours": [
        "vegetal",
        "umami"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "茶の淹れ方マニュアル (How to brew tea)",
          "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
          "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-4.pdf",
          "lang": "ja",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "2–3 g per 100 ml cup; 70 °C for high-grade sencha, 90 °C for mid-grade; each pour between vessels takes off 5–10 °C; 90 s, then about half for the second infusion, slightly hotter; pour to the last drop; soft water under 100 mg/L."
        },
        {
          "title": "普通煎茶の淹れ方7ステップ (Seven steps to brew regular sencha)",
          "author": "Yamamotoyama",
          "url": "https://ec.yamamotoyama.co.jp/blogs/column/%e6%99%ae%e9%80%9a%e7%85%8e%e8%8c%b6%e3%81%ae%e6%b7%b9%e3%82%8c%e6%96%b95%e3%82%b9%e3%83%86%e3%83%83%e3%83%97-%e9%87%8d%e8%a6%81%e3%81%aa%e3%83%9d%e3%82%a4%e3%83%b3%e3%83%88%e3%81%af3%e3%81%a4%e3%81%a0%e3%81%91-%e6%89%8b%e8%bb%bd%e3%81%ab%e3%81%a7%e3%81%8d%e3%82%8b",
          "lang": "ja",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "150 ml at 70–75 °C and 3–4 g per person, 1.5–2 min; two transfers bring boiling water to 80–85 °C, the third to about 75 °C; pour to the last drop and leave the lid ajar."
        },
        {
          "title": "Standard Sencha Brew",
          "author": "Ippodo Tea",
          "url": "https://ippodotea.com/blogs/recipes-to-brew-japanese-tea/standard-sencha-brew",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "80 °C, 60 s; without a thermometer, pour boiling water into the cups, then from the cups into the pot; pour out every last drop."
        },
        {
          "title": "おいしいお茶の入れ方 (How to make good tea)",
          "author": "Shizuoka Prefecture, Tea Promotion Division",
          "url": "https://www.pref.shizuoka.jp/kensei/introduction/soshiki/1002123/1041029/chanomiyako/1040637/1027281.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Cool the water in the cups; high-grade sencha 70 °C, about 60 s (fukamushi 30 s); a second infusion takes a fraction of the time."
        },
        {
          "title": "京都府景観資産 24: 緑茶のふるさと・宇治田原湯屋谷 (Ujitawara Yuyadani, home of green tea)",
          "author": "Kyoto Prefecture",
          "url": "https://www.pref.kyoto.jp/keikan-sisan/sisan024k.html",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Birthplace of Nagatani Sōen, who is said to have developed the aosei sencha method: rolling the leaves before drying."
        },
        {
          "title": "山本山の歴史 (History)",
          "author": "Yamamotoyama",
          "url": "https://yamamotoyama.co.jp/about/",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The house's own account: in 1738 Nagatani Sōen's sencha reached Edo, and the second Yamamoto Kahei bought it all."
        }
      ],
      "ingredients": [
        {
          "id": "sencha",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [
        {
          "id": "thermometer",
          "optional": true
        }
      ],
      "brew": {
        "water": "soft-bottled",
        "tempC": 75,
        "tempRange": {
          "min": 70,
          "max": 80
        },
        "ratioGPer100ml": 2.5,
        "waterMl": 240,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          60,
          30
        ]
      },
      "steps": [
        {
          "text": "Boil the water. Pour 240 ml into the empty teapot to warm it, then from the teapot into the two cups: each pour takes off 5–10 °C.",
          "office": "Set the kettle to 80 °C. Pour about 120 ml into each mug: it warms them, and the water comes down to about 75 °C.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the warm teapot and pour the water from the cups over them: this third pour brings it to about 75 °C. Leave the pot still while it infuses. Then pour into the cups in turns, a little at a time, down to the last drop, and leave the lid ajar. The second infusion takes water a little hotter: two pours from the boil instead of three.",
          "office": "Put the leaves in the office teapot and pour the water from the mugs over them. Then pour into the two mugs in turns, down to the last drop. For the second infusion, pour straight from the kettle at 80 °C.",
          "infusions": true,
          "stage": "day"
        }
      ]
    },
    {
      "code": "003",
      "slug": "mizudashi",
      "name": "Mizudashi, cold-brew sencha",
      "mode": "safe",
      "family": "seasonal",
      "trust": "documented",
      "sourceType": "tea-master",
      "origin": "Japan",
      "story": "Mizudashi is tea brewed in cold water from the start. Cold water still draws out the amino acids that carry umami, Ito En's tasters say, while the bitter catechins come out mostly above about 80 °C, so the tea turns sweet and mild. Japan's farm ministry noted in 2017 that cold tea was growing in popularity, and gave a tea instructor's bottle method. JETRO's guide leaves it 8 to 10 hours in the fridge: started at bedtime, it is ready in the morning.",
      "difficulty": 1,
      "seasons": [
        "summer"
      ],
      "flavours": [
        "vegetal",
        "sweet"
      ],
      "caffeine": "low",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "evening",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Japanese Green Tea: How to serve (How to brew Mizudashi)",
          "author": "JETRO / JFOODO",
          "url": "https://japan-food.jetro.go.jp/greentea/business/serving/index.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "10–15 g in a 1-litre carafe of cold filtered water; mix once after several minutes; 8–10 hours in the fridge; stir, strain; keeps 2–3 days in the fridge."
        },
        {
          "title": "日本茶インストラクターに聞いた 緑茶のおいしい淹れ方 (A Japanese tea instructor's way to brew green tea)",
          "author": "MAFF, aff magazine, April 2017",
          "url": "https://www.maff.go.jp/j/pr/aff/1704/spe1_04.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "10–15 g of leaves in a bottle of about 1 litre, 4–6 hours in the fridge; cold tea growing in popularity; catechins and caffeine come out above 80 °C."
        },
        {
          "title": "How to Cold Brew Green Tea (and Why You Should Do It)",
          "author": "Sugimoto Tea",
          "url": "https://www.sugimotousa.com/blog/how-to-cold-brew-green-tea-and-why-you-should-do-it",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "Swirl or shake to stir up the leaves; you can leave it in the fridge even overnight; keeps up to three days; especially for summer."
        },
        {
          "title": "Ito En tea taster interview (水出し: cold brewing)",
          "author": "Ito En",
          "url": "https://shop.itoen.jp/kenkotai/interview_vol93",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Umami amino acids dissolve readily even in water; astringent catechins dissolve readily above 80 °C."
        }
      ],
      "ingredients": [
        {
          "id": "sencha",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "filtered",
        "tempC": 5,
        "ratioGPer100ml": 1.2,
        "waterMl": 500,
        "vessel": "jar",
        "preheat": false,
        "infusionsS": [
          32400
        ]
      },
      "steps": [
        {
          "text": "At bedtime, put the leaves in a clean jar and pour in 500 ml of cold filtered water. Close it and swirl, swirl again after a few minutes, then leave it in the fridge for the night: 8 to 10 hours.",
          "infusions": true,
          "stage": "evening"
        },
        {
          "text": "In the morning, stir, then strain through a tea strainer into a bottle.",
          "office": "Before leaving home, stir and strain into a bottle. Keep it in the office fridge.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour into glasses, cold. Drink it the same day; it keeps 2–3 days in the fridge.",
          "office": "Pour into two mugs, cold. Drink it the same day.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "004",
      "slug": "first-flush-darjeeling",
      "name": "First-flush Darjeeling",
      "mode": "safe",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "Darjeeling, India",
      "story": "First flush is Darjeeling's spring picking: the first shoots after the bushes' winter rest, plucked from late February or March into April. The leaves are only lightly oxidised, so tea houses brew them cooler and shorter than other black teas, and serve them without milk. The name is protected: in 2004 Darjeeling tea became the first product registered under India's Geographical Indications Act, from some 87 registered gardens in the hills of Darjeeling district.",
      "difficulty": 2,
      "seasons": [
        "spring",
        "summer"
      ],
      "flavours": [
        "floral",
        "fruity",
        "muscat"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Bien préparer son thé (table d'infusion)",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/blog/conseils-et-astuces/bien-preparer-son-the/",
          "lang": "fr",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "Spring Darjeeling: 85 °C, 3'30–3'45, 6 to 8 g for 30 cl; other Darjeeling harvests 90 °C, 4–5 min."
        },
        {
          "title": "Darjeeling 1st flush Phuguri FTGFOP 2026",
          "author": "Dammann Frères",
          "url": "https://www.dammann.fr/en/tea-from-india-darjeeling-1st-flush-phuguri-ftgfop-2026.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "85 °C, 3 to 3½ min; picked on 29 and 30 March."
        },
        {
          "title": "Tea appreciation: tasting the 2018 Darjeeling first flush",
          "author": "Rachel Tan, Michelin Guide (the TWG Tea method)",
          "url": "https://guide.michelin.com/en/article/features/tea-appreciation-tasting-the-2018-darjeeling-first-flush",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "Warm the pot; water at about 90–95 °C; exactly 3 minutes; first flush is the first growth after winter dormancy, late February to mid-April."
        },
        {
          "title": "The World's Best Tea: Darjeeling",
          "author": "Whittard of Chelsea",
          "url": "https://www.whittard.com/blogs/tea/the-worlds-best-tea-darjeeling",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "2–3 minutes, against 3–5 for black teas in general; drunk without milk."
        },
        {
          "title": "Darjeeling first flush",
          "author": "Max Falkowitz (Leafhopper)",
          "url": "https://leafhopper.substack.com/p/darjeeling-first-flush",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "90 °C is a good start, 3 g in a 150 ml pot; lightly oxidised leaves that oversteep easily."
        },
        {
          "title": "Geographical Indications in India: Case Study on Darjeeling Tea",
          "author": "Tarit Kumar Datta, IIM Calcutta (FAO–EC seminar)",
          "url": "https://www.fao.org/fileadmin/templates/olq/documents/Bangkok/11June/Datta%20Darjeeling%20tea.pdf",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Spring flush late February to mid-April; the first product registered under India's GI Act, in 2004; 87 gardens."
        },
        {
          "title": "How do I know when the water temperature is right?",
          "author": "DAVIDsTEA",
          "url": "https://help.davidstea.com/en-US/how-do-i-know-when-the-water-temperature-is-right-775458",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "Boiled water with the kettle lid open: about 1–3 minutes to fall to 95–90 °C."
        }
      ],
      "ingredients": [
        {
          "id": "darjeeling-first-flush",
          "qty": 10,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [
        {
          "id": "thermometer",
          "optional": true
        }
      ],
      "brew": {
        "water": "tap",
        "tempC": 90,
        "tempRange": {
          "min": 85,
          "max": 100
        },
        "ratioGPer100ml": 2,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          180
        ]
      },
      "steps": [
        {
          "text": "Boil fresh water, then leave the kettle open for about 2 minutes: it falls to about 90 °C. Meanwhile warm the teapot with a swirl of hot water and pour it away.",
          "office": "Set the kettle to 90 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot, pour the water and put the lid on. When the time is up, pour all of it into the cups so the leaves don't keep steeping. No milk.",
          "office": "Put the leaves in the teapot, pour the water and put the lid on. When the time is up, pour all of it into the two mugs. No milk.",
          "infusions": true,
          "stage": "day"
        }
      ]
    },
    {
      "code": "005",
      "slug": "earl-grey",
      "name": "Earl Grey, the classic",
      "mode": "safe",
      "family": "earl-grey",
      "trust": "legend",
      "sourceType": "tea-house",
      "origin": "England",
      "story": "Earl Grey is named after Charles, 2nd Earl Grey, Prime Minister from 1830 to 1834. How it began is a legend: Twinings tells of a Chinese mandarin's gift and says it has blended the tea since 1831; the Greys' Howick Hall says a mandarin made it to suit the lime in their water. Neither is proven. The paper trail is plainer: in 1824 a newspaper named oil of bergamot as a flavouring for tea, Charlton & Co sold a \"Grey mixture\" in 1867, and \"Earl Grey's Mixture\" first appears in a Charlton advert of 1884.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "citrus",
        "bergamot"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Thé des Lords",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/the-des-lords-471.html",
          "lang": "fr",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "6 g of leaves for 30 cl, 95 °C, 4 minutes; black tea from India and Africa with 2% bergamot flavouring."
        },
        {
          "title": "How to brew Earl Grey tea",
          "author": "Claire Carson, The Tea Makers of London",
          "url": "https://www.theteamakers.co.uk/blogs/how-to-brew-tea-hub/how-to-brew-earl-grey-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "3 to 4 g per 200 ml, 100 °C, 3 to 5 min; warm the teaware first; best without milk."
        },
        {
          "title": "Should you put milk in Earl Grey tea?",
          "author": "Stefanie Stolzel, The Tea Haus",
          "url": "https://theteahaus.com/teajournal1/post/should-you-put-milk-in-earl-grey-tea.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "In England mostly taken with sugar and lemon; water just below boiling, 3–5 minutes."
        },
        {
          "title": "History of Twinings",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/history-of-twinings",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Twinings' own claim, under its heading 'The Legend of Earl Grey': an envoy saves a mandarin, and in 1831 Grey asks Twinings to reproduce the tea."
        },
        {
          "title": "Earl Grey and the Grey family",
          "author": "Howick Hall Gardens",
          "url": "https://howickhallgardens.com/history-of-howick-hall-and-gardens/earl-grey-and-the-earl-grey-family/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The family's claim: a mandarin blended it for the water at Howick, with bergamot to offset the lime. No dates, no sources."
        },
        {
          "title": "Earl Grey Tea",
          "author": "Glyn Hughes, Foods of England",
          "url": "https://foodsofengland.info/earlgreytea.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Newspaper evidence: Lancaster Gazette 1824 (bergamot to flavour tea), John Bull 1867 (Charlton's 'Celebrated Grey Mixture'), Morning Post 1884 ('Earl Grey's Mixture'); the tea houses' claims appear only in the 20th century."
        },
        {
          "title": "Curious Questions: who was Earl Grey, and why are we drinking his tea?",
          "author": "Martin Fone, Country Life",
          "url": "https://www.countrylife.co.uk/food-drink/curious-questions-who-was-earl-grey-and-why-are-we-drinking-his-tea-212511",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Confirms the 1824, 1837, 1867 and 1884 newspapers, and finds no certain link between the family and the tea's invention."
        }
      ],
      "ingredients": [
        {
          "id": "earl-grey",
          "qty": 7.5,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "lemon",
          "qty": 2,
          "unit": "pieces",
          "optional": true,
          "role": "garnish"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 95,
        "tempRange": {
          "min": 85,
          "max": 100
        },
        "ratioGPer100ml": 1.5,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Boil fresh water. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 95 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot, pour the water and put the lid on.",
          "office": "Put the leaves in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the cups. A thin slice of lemon in each, or plain; a splash of milk softens it, though the classic is without.",
          "office": "Pour into the two mugs, with a lemon slice in each if you packed one.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "006",
      "slug": "russian-zavarka",
      "name": "Russian zavarka",
      "mode": "safe",
      "family": "household",
      "trust": "documented",
      "sourceType": "grandmother",
      "origin": "Russia",
      "story": "Tea first reached Russia in 1638, when the envoy Vasily Starkov brought it from Mongolia as a gift for the tsar; by the end of the 19th century it was most Russians' everyday drink. The Russian way was to brew it very strong in a small teapot, the zavarka, and dilute it in the glass with boiling water from the samovar, a pot of tea and a pot of hot water served as a pair. William Pokhlebkin, author of the classic Russian book on tea, called the habit a child of thrift, and lemon in tea a purely Russian invention of the 1880s and 1890s.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "malty",
        "citrus"
      ],
      "caffeine": "high",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Чай, его история, свойства и употребление (Tea: its history, properties and use), chapters 8, 12 and 13",
          "author": "William Pokhlebkin (В. В. Похлёбкин)",
          "url": "https://vkus.narod.ru/chai/chai_04.htm",
          "lang": "ru",
          "primary": true,
          "supports": [
            "recipe",
            "parameters",
            "story"
          ],
          "note": "Rinse the pot 3–4 times with boiling water; a teaspoon a glass plus one for the pot; water just at the boil, boiled once; fill the pot halfway, then top up; best steep for good black tea 3.5–4 minutes, never over 5 for leaf tea, 4 for small-leaf; drink within a quarter of an hour. He names Indian (C.T.C.) and Ceylon teas, and writes that diluting the brew with boiling water came from saving tea ('пара чаю'), and that lemon in tea is a Russian invention."
        },
        {
          "title": "Tea Time in Russia",
          "author": "Russian Life, 1 February 2000",
          "url": "https://russianlife.com/stories/online/tea-time-in-russia/",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "Zavarka is the dark, concentrated brew; a little is poured into each cup and topped up with hot water; a dark loose tea from India; sweetened with sugar, jam or honey, or a spoonful of jam with each sip."
        },
        {
          "title": "Чай в России (Tea in Russia)",
          "author": "Wikipedia (ru)",
          "url": "https://ru.wikipedia.org/wiki/%D0%A7%D0%B0%D0%B9_%D0%B2_%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D0%B8",
          "lang": "ru",
          "primary": false,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "Brewed very strong and diluted in the cup with boiling water from the samovar, strength to taste; served in pairs; lemon in thin slices on a saucer, sugar served separately, jam in small dishes, usually eaten alongside rather than stirred in; 1638."
        },
        {
          "title": "What is the water temperature for tea?",
          "author": "Fauchon",
          "url": "https://fauchon.com/en/blogs/news/what-is-the-water-temperature-for-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Black teas 4 minutes at 85–90 °C, broken leaves 2 to 3 minutes."
        }
      ],
      "ingredients": [
        {
          "id": "assam",
          "qty": 10,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "lemon",
          "qty": 2,
          "unit": "pieces",
          "optional": true,
          "role": "garnish"
        },
        {
          "id": "sugar",
          "qty": 8,
          "unit": "g",
          "optional": true,
          "role": "accent"
        },
        {
          "id": "jam",
          "qty": 30,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "tempRange": {
          "min": 85,
          "max": 100
        },
        "ratioGPer100ml": 4,
        "waterMl": 250,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Bring fresh water to the boil, once. Rinse the teapot three or four times with it and pour it away.",
          "office": "Boil the kettle. Rinse the office teapot two or three times with it and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put in the tea and pour 250 ml of water just come to the boil: the pot should be about half full. Put the lid on, and a clean cloth over the lid and spout if you have one.",
          "office": "Put in the tea, pour 250 ml from the kettle and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour the zavarka into the glasses, about half each, and top them up with hot water from the kettle: Russians set the strength to taste, so start half and half. Lemon slices on a saucer, sugar on the side, and jam in a small dish, eaten from a spoon between sips. Drink it within a quarter of an hour.",
          "office": "Pour about half a mug of zavarka each and top up with hot water from the kettle, to taste. A lemon slice, sugar or a spoonful of jam on the side, if you packed them.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "007",
      "slug": "masala-chai",
      "name": "Masala chai",
      "mode": "experimental",
      "family": "household",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "India",
      "story": "Tea in India began as an export crop: the Assam Tea Company, formed in 1839, sold Assam tea to Europe. Only from 1929, a Mumbai food historian says, was tea pushed to Indians themselves, with tea breaks in factories and tea sold at railway stations. Indians made it their own, boiling it with water, milk, sugar and spices such as cardamom, cinnamon, clove, ginger or black pepper; milk, a chef and author adds, also stretched costly leaves. India's Tea Board names the core today: Indian black tea with cardamom, ginger and cinnamon.",
      "difficulty": 2,
      "seasons": [],
      "flavours": [
        "spiced",
        "milky",
        "sweet"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "How to brew Assam CTC chai",
          "author": "Ankit Baid, Namhah Tea (Guwahati), 29 May 2026",
          "url": "https://namhah.com/how-to-brew-assam-ctc-chai/",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "For 2 cups: 2 heaped teaspoons of Assam CTC, 1 cup water, 1 cup full-fat milk, 2 green cardamom pods, about 1 cm of ginger, a small cinnamon stick, 2 cloves and 2 peppercorns (optional), sugar to taste. Spices in water before the tea, simmer 2 minutes; tea, boil 1–2 minutes; milk, back to the boil, simmer 2–3 minutes on low; sugar; strain. Pan uncovered, or it boils over. Use within 6 months of opening."
        },
        {
          "title": "Masala Chai",
          "author": "Chef Kunal Kapur",
          "url": "https://www.chefkunalkapur.com/recipe/masala-chai/",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "Serves 4: 4 teacups water to 2 of milk, tea leaves and sugar, a chai masala of cardamom, cloves, peppercorns and cinnamon; boil a minute after the tea, simmer a minute after the milk."
        },
        {
          "title": "Masala Chai",
          "author": "Chef Sanjeev Kapoor",
          "url": "https://www.sanjeevkapoor.com/Recipe/Masala-Chai.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "Green cardamom, cinnamon, fennel, peppercorns, cloves and crushed ginger; tea, ginger, sugar, masala and milk brought to the boil; 5–10 minutes in all."
        },
        {
          "title": "Masala Tea",
          "author": "Swasthi Shreekanth, Indian Healthy Recipes",
          "url": "https://www.indianhealthyrecipes.com/masala-tea-chai/",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "For 2: 4 cardamoms, 2 cloves, cinnamon (cassia or Ceylon), 2 peppercorns, ½ inch ginger; water to milk from 1:1 to 3:1; strong chai with Assam CTC; boiling too long turns it bitter."
        },
        {
          "title": "Chai is tea, tea is chai: India's love affair with the drink",
          "author": "Nupur Roopa, Al Jazeera, 13 March 2023",
          "url": "https://www.aljazeera.com/features/2023/3/13/chai-is-tea-tea-is-chai-indias-love-affair-with-the-drink-2",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The Assam Tea Company formed in 1839; from 1929 tea promoted to Indians, with factory tea breaks and railway stations (food historian Mohsina Mukadam); milk added to stretch expensive leaves (chef and author Sadaf Hussain)."
        },
        {
          "title": "Masala Tea",
          "author": "Tea Board of India",
          "url": "https://www.teaboard.gov.in/TEABOARDCSM/MTE=",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Indian black tea with cardamom, ginger and cinnamon."
        }
      ],
      "ingredients": [
        {
          "id": "assam",
          "qty": 8,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "whole-milk",
          "qty": 240,
          "unit": "ml",
          "optional": false,
          "role": "base"
        },
        {
          "id": "green-cardamom",
          "qty": 2,
          "unit": "pieces",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "fresh-ginger",
          "qty": 5,
          "unit": "g",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "cinnamon-stick",
          "qty": 1,
          "unit": "pieces",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "cloves",
          "qty": 2,
          "unit": "pieces",
          "optional": true,
          "role": "accent"
        },
        {
          "id": "black-peppercorns",
          "qty": 2,
          "unit": "pieces",
          "optional": true,
          "role": "accent"
        },
        {
          "id": "sugar",
          "qty": 12,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "ratioGPer100ml": 3.3,
        "waterMl": 240,
        "vessel": "saucepan",
        "preheat": false,
        "infusionsS": [
          120
        ]
      },
      "steps": [
        {
          "text": "Lightly crush the cardamom pods and grate the ginger (a 1 cm piece, about 5 g). Put them in a saucepan with the water, the cinnamon, and the cloves and peppercorns if you use them. Bring to the boil.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Simmer the spices in the water: they always go in before the tea.",
          "timerS": 120,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Add the tea (2 heaped teaspoons, about 8 g: weigh your spoon once) and boil.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Add the milk and bring it back to the boil, uncovered, watching it: milk rises fast.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Turn the heat down and simmer.",
          "timerS": 150,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Stir in the sugar (3 teaspoons for two cups, or to taste), then strain through a fine tea strainer into the cups.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "008",
      "slug": "hong-kong-milk-tea",
      "name": "Hong Kong milk tea",
      "mode": "experimental",
      "family": "household",
      "trust": "documented",
      "sourceType": "tea-master",
      "origin": "Hong Kong",
      "story": "Hong Kong came under British rule in 1842, and the English brought their tea: fine Ceylon tea with milk and sugar, still an elite habit in the early 1900s. It became truly local only after the Second World War, when street stalls and ice cafés fed a booming city: lower-grade leaves for strength, and a fine cotton strainer for a smoother cup. Stained by the tea, the white bag looks like a silk stocking, hence \"silk stocking milk tea\"; Lan Fong Yuen, a stall opened in Central in 1952, says dockworkers coined the name. In 2017 the technique joined Hong Kong's first list of intangible cultural heritage.",
      "difficulty": 3,
      "seasons": [],
      "flavours": [
        "strong",
        "milky",
        "smooth"
      ],
      "caffeine": "high",
      "scaling": {
        "kind": "per-cup",
        "serves": 1
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "港式奶茶做法｜师傅教6步骤加奶先？ (Hong Kong milk tea: a master's six steps)",
          "author": "HK01, with Master Tse Chung-tak (謝忠德), runner-up Hong Kong Milk Tea King",
          "url": "https://global.hk01.com/教煮/60387207/港式奶茶做法-师傅教6步骤加奶先-奶茶比例-1只匙羹代替撞茶",
          "lang": "zh",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "12 g black tea, 250 ml water brought to the boil then off; 1 minute on low heat, off, 6 minutes covered; the traditional way pulls the tea 4 times, or stir 6–8 turns in the bag; reheat to the boil; 60 ml evaporated milk in the cup first, tea to 90%: about 7 tea to 3 milk; usually Ceylon teas, coarse, medium and fine grades; a white cotton bag."
        },
        {
          "title": "The secret life of Hong Kong milk tea",
          "author": "Celia Hu, A Foodie World, with tea master Donald Tse",
          "url": "https://www.afoodieworld.com/celia-hu/2019-01-07-the-secret-life-of-hong-kong-milk-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Water around 98 °C; 70% tea, 30% evaporated milk; it shouldn't be poured too many times; white cotton bags; BOP, BOPF and dust; served hot in a thick cup."
        },
        {
          "title": "Hong Kong-style Milk Tea Making Technique",
          "author": "Intangible Cultural Heritage Office, Hong Kong",
          "url": "https://www.icho.hk/en_US/web/icho/representative_list_milk_tea.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Blending the leaves, boiling, pulling, keeping hot, and pulling into the milk; evolved over a century from English milk tea."
        },
        {
          "title": "Ingredients, Utensils and Brewing Process",
          "author": "Hong Kong Memory (Leisure and Cultural Services Department)",
          "url": "https://www.hkmemory.hk/en/collections-ichhk_ii-hong_kong_style_milk_tea_making_technique-ingredients_utensils_and_brewing_process.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "Black teas of several grades and brands, evaporated milk; boil several minutes, too long turns it bitter; pour through the strainer from high at least three times; reheat one to two minutes."
        },
        {
          "title": "The History of Hong Kong-style Milk Tea",
          "author": "Hong Kong Memory (Leisure and Cultural Services Department)",
          "url": "https://www.hkmemory.hk/en/collections-ichhk_ii-hong_kong_style_milk_tea_making_technique-history_hong_kong_style_milk_tea.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Fine Ceylon tea, milk and sugar under British rule from 1842; localised only after the Second World War; lower-grade leaves for strength, a fine cotton strainer for a smoother tea; the stained strainer looks like silk stockings."
        },
        {
          "title": "Hongkong Post special stamps on intangible cultural heritage",
          "author": "Hong Kong government press release, 10 July 2023",
          "url": "https://www.info.gov.hk/gia/general/202307/10/P2023070700453.htm",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Inscribed onto the first Representative List in 2017; the white cloth bag is stained with the colour of tea."
        },
        {
          "title": "蘭芳園 (Lan Fong Yuen)",
          "author": "Lin Yi-chun, Mirror Media, with the second-generation owner",
          "url": "https://www.mirrormedia.mg/story/20260827food002",
          "lang": "zh",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The house's own account: a 1940s stall where dockworkers ordered 'silk stocking milk tea'; opened as Lan Fong Yuen in Central in 1952; a blend of six black teas."
        }
      ],
      "ingredients": [
        {
          "id": "ceylon-black",
          "qty": 12,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "evaporated-milk",
          "qty": 60,
          "unit": "ml",
          "optional": false,
          "role": "base"
        },
        {
          "id": "sugar",
          "qty": 7.5,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [
        {
          "id": "tea-sock",
          "optional": false
        }
      ],
      "brew": {
        "water": "tap",
        "tempC": 98,
        "tempRange": {
          "min": 98,
          "max": 100
        },
        "ratioGPer100ml": 4.8,
        "waterMl": 250,
        "vessel": "saucepan",
        "preheat": true,
        "infusionsS": [
          360
        ]
      },
      "steps": [
        {
          "text": "Warm a thick cup with hot water. Bring 250 ml of water to the boil in a small saucepan, then turn off the heat.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the tea in the cotton sock and the sock in the pan, and set it on a low heat.",
          "timerS": 60,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Heat off, lid on: let it steep.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pull the tea four times: lift the sock over a second jug and pour the tea from high through it, then back into the pan. No more than four, or it turns harsh. Master Tse's home shortcut: stir the tea in the sock, clockwise, 6 to 8 turns.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Reheat to the first boil.",
          "timerS": 60,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour the evaporated milk into the cup first, then the tea up to nine-tenths: about 7 parts tea to 3 of milk. Sugar to taste, and drink it hot.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "009",
      "slug": "high-mountain-oolong",
      "name": "High-mountain oolong, gongfu style",
      "mode": "experimental",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-master",
      "origin": "Taiwan",
      "story": "Gaoshan cha, \"high-mountain tea\", is Taiwan's name for oolong grown above about 1,000 metres, on mountains such as Alishan, Lishan and Shan Lin Xi. It descends from Dong Ding, the first tea rolled into the tight balls now typical of Taiwan, and stays lightly oxidised: 12 to 15 % by Taiwan's Tea Research and Extension Station. Gongfu brewing, many short infusions from a small vessel shared among a few cups, is believed to date from around the 18th century. Tea Masters, a Taiwan-based house, brews these leaves with boiling water and gives the first infusion a full minute, so the rolled leaves can open.",
      "difficulty": 3,
      "seasons": [],
      "flavours": [
        "floral",
        "creamy",
        "sweet"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-session",
        "sessionMax": 3
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Li Shan Gao Shan Cha",
          "author": "Rishi Tea",
          "url": "https://www.rishi-tea.com/products/li-shan-gao-shan-cha",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "7 g per 150 ml gaiwan; water cooled to 200 °F (93 °C); don't rinse; first infusion 45–60 s, second 20–30 s, then repeat several times."
        },
        {
          "title": "How To Brew Oolong Tea",
          "author": "Eco-Cha (Taiwan)",
          "url": "https://eco-cha.com/pages/how-to-brew-oolong-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "8–10 g in a 150 ml pot; a rinse poured off at once; about 50 s for the first brew, 10–15 s more for each after, up to two minutes after the third; 5–8 brews."
        },
        {
          "title": "First brew of High Mountain Oolong",
          "author": "Tea Masters (Taiwan)",
          "url": "https://teamasters.blogspot.com/2014/10/first-brew-of-high-mountain-oolong.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Preheat well with boiling water; a single layer of leaves on the bottom; at least a minute for the first brew; bring the water back to the boil each time."
        },
        {
          "title": "Brewing Advice",
          "author": "Floating Leaves Tea",
          "url": "https://floatingleaves.com/blogs/explore/brewing-advice",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Boiling-hot water for a full extraction; warm all the teaware first; no rinse needed; for rolled oolongs the first infusion is longer than the second; 7 or 8 infusions."
        },
        {
          "title": "綠色餐飲研究－台灣生產茶葉之營養與最適沖泡水溫文獻回顧 (Nutrition and optimal brewing temperature of Taiwan teas: a review)",
          "author": "Lee Min-Hsien and Yeh Jim, Journal of Health Management 13(2), 2015",
          "url": "https://libap.nhu.edu.tw:8081/Ejournal/AD01130207.pdf",
          "lang": "zh",
          "primary": false,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "The best water for high-mountain tea is 95–100 °C; high-mountain tea is 12–15 % oxidised (citing the Tea Research and Extension Station, 2000); Alishan, Shan Lin Xi, Fushoushan, Lishan."
        },
        {
          "title": "The Oolong Spectrum",
          "author": "Floating Leaves Tea",
          "url": "https://floatingleaves.com/blogs/explore/the-oolong-spectrum",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Dong Ding was the precursor of high-mountain oolong, and the first rolled into Taiwan's characteristic balls."
        },
        {
          "title": "Gongfu tea",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Gongfu_tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Traditionally three cups; it is believed the gongfu approach began around the 18th century."
        }
      ],
      "ingredients": [
        {
          "id": "high-mountain-oolong",
          "qty": 7,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [
        {
          "id": "gaiwan",
          "optional": false
        }
      ],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "tempRange": {
          "min": 90,
          "max": 100
        },
        "ratioGPer100ml": 4.7,
        "waterMl": 150,
        "vessel": "gaiwan",
        "preheat": true,
        "infusionsS": [
          60,
          30,
          40,
          50,
          65,
          80,
          100,
          120
        ]
      },
      "steps": [
        {
          "text": "Bring fresh water to a full boil. Warm the gaiwan, a small jug and three small cups with it, then pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "The leaves are for a 150 ml gaiwan; for another size, keep the same strength: 5 g in a 100 ml gaiwan, 8 g in a 170 ml one. Put the leaves in the hot, empty gaiwan, put the lid on and smell them after a few seconds. A rinse is up to you: Taiwanese houses differ. If you rinse, fill the gaiwan and pour it away at once.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "For each infusion, bring the water back to the boil, fill the gaiwan to the rim and put the lid on. When the time is up, pour all of it into the jug, draining the gaiwan, and share it among the three cups. Stop when the taste fades.",
          "infusions": true,
          "stage": "day"
        }
      ]
    },
    {
      "code": "010",
      "slug": "tibetan-butter-tea",
      "name": "Tibetan butter tea (po cha)",
      "mode": "experimental",
      "family": "household",
      "trust": "attested",
      "sourceType": "grandmother",
      "origin": "Tibet",
      "story": "Traditionally, Tibetan tea is boiled: pieces crumbled from a brick simmer for hours into a dark brew, the chaku, which then goes into a tall wooden churn, the chandong, with butter and salt. Bricks for Tibet came mainly from Ya'an, in Sichuan, along the Tea Horse Road. Po cha is drunk through the day, for warmth at altitude, and served at Losar, the New Year. Its butter comes from the dri, the female yak; outside Tibet, Tibetan cooks use cow's butter, and a blender for the churn.",
      "difficulty": 3,
      "seasons": [],
      "flavours": [
        "savoury",
        "buttery",
        "salty"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 4
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Butter Tea: Recipe to Make Tibetan Tea, Po Cha",
          "author": "Lobsang Wangdu, YoWangdu",
          "url": "https://www.yowangdu.com/tibetan-food/butter-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "For two people, two cups each: four cups of water brought to the boil; two heaping tablespoons of loose tea, boiled a couple of minutes, or 5 to 10 minutes more for brick tea; a heaping quarter teaspoon of salt; a third to a half cup of milk; two tablespoons of butter; churn, blend or shake 2–3 minutes. Pu-erh bricks or plain pu-erh will do; traditionally the tea is boiled for hours and kept as chaku."
        },
        {
          "title": "Tibetan tea: the secret is butter and salt",
          "author": "Yasmin Noone, SBS Food, with Tsering Wangchuk (Wild Yak restaurant) and Tenzin Wangyal",
          "url": "https://www.sbs.com.au/food/article/tibetan-tea-the-secret-is-butter-and-salt/35s8cjvgi",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "A brick-tea concentrate, chaku, steeped for hours; a churn about half a person's height; butter from the dri, cow's butter abroad; drunk several times a day for warmth, and at Losar."
        },
        {
          "title": "Butter tea",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Butter_tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Pu-erh leaves boiled for half a day; churned in a dongmo; cow's butter and a blender increasingly used."
        },
        {
          "title": "Compressed tea",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Compressed_tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Tea bricks for Tibet were mainly produced around Ya'an, broken into small pieces and boiled."
        },
        {
          "title": "Tea Horse Road",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Tea_Horse_Road",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The road starts from Ya'an, the tea-producing area of Yazhou."
        }
      ],
      "ingredients": [
        {
          "id": "pu-erh",
          "qty": 10,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "whole-milk",
          "qty": 100,
          "unit": "ml",
          "optional": false,
          "role": "base"
        },
        {
          "id": "unsalted-butter",
          "qty": 28,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "salt",
          "qty": 2,
          "unit": "g",
          "optional": false,
          "role": "accent"
        }
      ],
      "gear": [
        {
          "id": "blender",
          "optional": true
        }
      ],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "ratioGPer100ml": 1.1,
        "waterMl": 950,
        "vessel": "saucepan",
        "preheat": false,
        "infusionsS": [
          600
        ]
      },
      "steps": [
        {
          "text": "Break about 10 g of tea from the brick into small pieces (or two heaping tablespoons of loose pu-erh). Bring 950 ml of water to the boil in a saucepan.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Add the tea and keep it at a low boil. Tibetans boil it for hours; ten minutes makes a good home brew.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Add the salt (a heaping quarter teaspoon), strain out the leaves, add the milk (a third to half a cup) and take the pan off the heat.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Churn it with the butter (two tablespoons): with a stick blender in a tall jug, or shaken hard in a big jar with the lid held down in a cloth. The longer it is churned, the better, Tibetans say.",
          "timerS": 180,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Serve at once, very hot.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "011",
      "slug": "lady-grey",
      "name": "Lady Grey",
      "mode": "safe",
      "family": "earl-grey",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "England",
      "story": "Lady Grey is Twinings' own blend and trademark: an Earl Grey with orange and lemon peel and only a hint of bergamot. Twinings says it created it in the early 1990s for the Nordic market, which found Earl Grey too strong; it went on sale in Norway in 1994 and in Britain in 1996. It is named after Mary Elizabeth Grey, wife of the 2nd Earl Grey. No tea house gives a home share of peel, so the peels here are an estimate, more than the blend's few percent: its citrus flavouring isn't in them.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "citrus",
        "bergamot"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Earl Grey Flavours from Twinings: Discover our Range",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/earl-grey-flavours-twinings-discover-our-range",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Created and trademarked by Twinings in the early 1990s for the Nordic market, which found Earl Grey too strong; first sold in Norway in 1994 and in Britain in 1996; Earl Grey with lemon and orange peel."
        },
        {
          "title": "Lady Grey Loose Tea Caddy 100g",
          "author": "Twinings",
          "url": "https://twinings.co.uk/products/lady-grey-loose-tea-caddy-100g",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters",
            "story"
          ],
          "note": "Black tea, orange peel 3%, lemon peel 2%, cornflowers, citrus flavouring; one heaped teaspoon per person, boiling water, 3–4 minutes; black, or with a slice of lemon or orange."
        },
        {
          "title": "All about Earl Grey",
          "author": "Twinings Australia",
          "url": "https://twinings.com.au/blogs/all-about-tea/all-about-earl-grey-1",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "A more delicate Earl Grey with a hint of bergamot; the lemon and orange peel give a soft citrus character."
        },
        {
          "title": "How to make a cup of tea perfectly",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/how-to-make-a-cup-of-tea-perfectly",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "About 1 teaspoon (2 g) of loose tea per person; freshly drawn water; warm the pot or cup first."
        },
        {
          "title": "Darling Grey loose tea",
          "author": "Whittard of Chelsea",
          "url": "https://www.whittard.com/products/darling-grey-loose-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "A comparable Earl Grey with orange and lemon peel 2% each; 1 teaspoon per 200 ml, 95–98 °C, 3–5 minutes."
        },
        {
          "title": "Lady Grey",
          "author": "Tregothnan",
          "url": "https://tregothnan.co.uk/blogs/time-for-tea/lady-grey",
          "lang": "en",
          "primary": false,
          "supports": [
            "story",
            "parameters"
          ],
          "note": "Created by Twinings in the 1990s with 3% orange peel; named for Mary Elizabeth Grey, wife of the 2nd Earl Grey; brewed below 90 °C, an outlier."
        },
        {
          "title": "Lady Grey (tea)",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Lady_Grey_(tea)",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The same dates; the name is a Twinings trademark."
        }
      ],
      "ingredients": [
        {
          "id": "earl-grey",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "dried-orange-peel",
          "qty": 1,
          "unit": "g",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "dried-lemon-peel",
          "qty": 0.5,
          "unit": "g",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "lemon",
          "qty": 2,
          "unit": "pieces",
          "optional": true,
          "role": "garnish"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 95,
        "tempRange": {
          "min": 90,
          "max": 100
        },
        "ratioGPer100ml": 1.2,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Boil fresh water. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 95 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves and both peels in the teapot, pour the water and put the lid on. The peels' weights are an estimate: taste, and adjust them next time.",
          "office": "Put the leaves and the peels in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the cups, plain or with a thin slice of lemon in each, as Twinings serves it.",
          "office": "Pour into the two mugs, with a lemon slice in each if you packed one.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "012",
      "slug": "earl-grey-lavender",
      "name": "Earl Grey with lavender",
      "mode": "safe",
      "family": "earl-grey",
      "trust": "attested",
      "sourceType": "tea-house",
      "origin": "Canada",
      "story": "TEALEAVES, a tea blender in British Columbia, says it first blended its Lavender Earl Grey in 1998 for the New York restaurant of chef Jean-Georges Vongerichten: black tea, bergamot oil and lavender from Provence. Rishi calls the pairing a French twist on an old European habit but cites nothing, so that part is a legend. Vancouver's Murchie's, and Twinings in its French Earl Grey, sell lavender versions too. No tea house gives its share of lavender: this one follows a seller's recipe, about one part lavender to six of tea by volume, and starts low, since lavender can overwhelm.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "floral",
        "bergamot"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Lavender Earl Grey",
          "author": "TEALEAVES",
          "url": "https://tealeaves.com/products/lavender-earl-grey-loose-leaf-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "story",
            "parameters"
          ],
          "note": "First blended in 1998 for chef Jean-Georges Vongerichten's New York restaurant; black tea, organic Provence lavender, rose petals, bergamot oil; 1 teaspoon per 240 ml, 99 °C, 2–3 minutes."
        },
        {
          "title": "Earl Grey Lavender",
          "author": "Rishi Tea",
          "url": "https://www.rishi-tea.com/products/organic-earl-grey-lavender-black-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters",
            "story"
          ],
          "note": "Black tea, Greek lavender, Calabrian bergamot oil; 9 g per 350 ml, 93 °C, 4 minutes; calls the pairing a French twist on an old European habit, unsourced."
        },
        {
          "title": "Lavender tea",
          "author": "Murchie's (Vancouver)",
          "url": "https://murchies.com/product/lavender-tea/",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Its version of Lavender Earl Grey: Ceylon and Keemun with lavender, cornflowers and a touch of bergamot; 1 level teaspoon (2.5 g) per 180–240 ml, 4–5 minutes."
        },
        {
          "title": "Recipe: Lavender Earl Grey Latte",
          "author": "Mountain Rose Herbs, 4 April 2016",
          "url": "https://blog.mountainroseherbs.com/lavender-earl-grey-latte-recipe",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "1 tablespoon of Earl Grey and ½ teaspoon of lavender flowers in 8 oz of hot water, covered; milk and honey; lavender can be overwhelming."
        },
        {
          "title": "All about Earl Grey",
          "author": "Twinings Australia",
          "url": "https://twinings.com.au/blogs/all-about-tea/all-about-earl-grey-1",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Twinings' French Earl Grey has notes of vanilla, rose petals and lavender."
        }
      ],
      "ingredients": [
        {
          "id": "earl-grey",
          "qty": 7.5,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "lavender",
          "qty": 0.4,
          "unit": "g",
          "optional": false,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 95,
        "tempRange": {
          "min": 93,
          "max": 99
        },
        "ratioGPer100ml": 1.5,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Boil fresh water. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 95 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves and the lavender in the teapot, pour the water and put the lid on. The lavender's weight, about half a teaspoon, is an estimate: weigh your spoon once, and add more next time if you like.",
          "office": "Put the leaves and the lavender in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the cups, plain or with a dash of milk.",
          "office": "Pour into the two mugs, with a dash of milk from the fridge if you like.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "013",
      "slug": "fresh-bergamot-earl-grey",
      "name": "Fresh-bergamot Earl Grey",
      "mode": "safe",
      "family": "earl-grey",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "Italy (Calabria)",
      "story": "Earl Grey's flavour is bergamot, a bitter citrus grown for its rind: about 80% of the world's crop comes from Calabria, almost all of it from the province of Reggio Calabria. The harvest starts with the cold at the end of November and ends around the end of February, and fresh fruit is sold, mostly to France, until about the end of December. A kilo of its oil takes some 200 kg of fruit. In season, the zest itself can scent the tea, as the Herb Society of America suggests: here a few strips of fresh peel with a plain Ceylon black tea. How many strips is an estimate.",
      "difficulty": 2,
      "seasons": [
        "winter"
      ],
      "flavours": [
        "citrus",
        "bergamot"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Bergamot Oil Italy",
          "author": "Givaudan",
          "url": "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/natural-ingredients/bergamot-oil-italy",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "The harvest begins with the cold days at the end of November and usually ends around the end of February; the fruit turns from green to yellow as it ripens."
        },
        {
          "title": "Bergamot Oil from Calabria",
          "author": "Stash Tea, 4 October 2019",
          "url": "https://www.stashtea.com/blogs/education/bergamot-oil-from-calabria",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "The fruit ripens between December and March; the oil is cold-pressed from the rind, about 200 kg of fruit for 1 kg of oil."
        },
        {
          "title": "Bergamot (Citrus bergamia, Risso): the effects of cultivar and harvest date",
          "author": "A. M. Giuffrè, Antioxidants 8(7):221, 2019",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6680538",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Grown almost only on the Ionian and Tyrrhenian coasts of the province of Reggio Calabria; the fruit ripens from October to March."
        },
        {
          "title": "What is bergamot",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/what-is-bergamot",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "80% of the world's bergamot comes from Calabria; it is grown for its skin; the fruit is bitter and inedible."
        },
        {
          "title": "Fresh Calabrian bergamot citrus headed to France",
          "author": "FreshPlaza, 19 October 2020",
          "url": "https://www.freshplaza.com/europe/article/9259381/fresh-calabrian-bergamot-citrus-headed-to-france/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "A Calabrian farm's season runs from late September or October to early February; fresh fruit is sold until the end of December, mostly to France."
        },
        {
          "title": "Recipes: Bergamot Orange",
          "author": "The Herb Society of America, 2020",
          "url": "https://herbsociety.org/file_download/inline/1f8aaba3-5ba6-4cac-a9fc-5a072b2b9e85",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "Zest a fresh bergamot and infuse the peel in tea for an Earl Grey flavour, dried or fresh; no quantities."
        },
        {
          "title": "ベルガモット (Bergamot)",
          "author": "Tomoko Sato with the aroma school kukka, Mynavi Agri, 14 March 2026",
          "url": "https://agri.mynavi.jp/2026_03_14_472491/",
          "lang": "ja",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "A homemade Earl Grey: 2 teaspoons of tea (about 5 g) with ½ teaspoon of dried bergamot peel for about 2 cups; the fresh fruit keeps 2–3 weeks in the fridge."
        },
        {
          "title": "Single Region Earl Grey",
          "author": "Dilmah",
          "url": "https://shop.dilmahtea.com.au/products/gourmet-earl-grey-125g-leaf-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "Dilmah's Earl Grey is pure Ceylon black tea with bergamot: the base chosen here."
        }
      ],
      "ingredients": [
        {
          "id": "ceylon-black",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "fresh-bergamot",
          "qty": 4,
          "unit": "pieces",
          "optional": false,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 95,
        "tempRange": {
          "min": 90,
          "max": 100
        },
        "ratioGPer100ml": 1.2,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Wash the bergamot and peel 4 thin strips of zest with a vegetable peeler, leaving the white pith behind. Boil fresh water, warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 95 °C; you peeled the strips and boxed them the evening before. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves and the strips in the teapot, pour the water and put the lid on.",
          "office": "Put the leaves and the strips in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the cups, and twist a used strip over each if you like.",
          "office": "Pour into the two mugs, and twist a used strip over each if you like.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "014",
      "slug": "genmaicha",
      "name": "Genmaicha",
      "mode": "safe",
      "family": "household",
      "trust": "attested",
      "sourceType": "tea-house",
      "origin": "Japan (Kyoto)",
      "story": "Genmaicha is Japanese green tea, sencha or bancha, mixed with roasted rice, often half and half. Hekisuien, a Kyoto tea house founded in 1867, says a former president, Horii Kishirō, created the blend in the Taishō era and sold it from 1923 as Hanayanagi; of the several stories, the house says, only his has a firm date. The older tale, households stretching costly tea with rice, is a legend that no source dates. Japan's farm ministry brews it like bancha, with boiling water for about 30 seconds, for its toasty aroma.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "toasty",
        "nutty"
      ],
      "caffeine": "low",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "The proper way to brew Nihoncha",
          "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
          "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-7.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "Bancha (genmaicha, houjicha): 2–3 g per 100 ml, boiling water, about 30 seconds; pour into each cup in turn, down to the last drop; a second infusion with boiling water, poured out at once; the leaves soak up about 4 times their weight; soft water."
        },
        {
          "title": "Basic Bancha (Hojicha, Genmaicha, etc.)",
          "author": "Ippodo Tea",
          "url": "https://global.ippodo-tea.co.jp/blogs/tea-recipe/basic-bancha-hojicha-genmaicha",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "10 g (genmaicha: 2 tablespoons) in 240 ml at 100 °C, boiling vigorously; serve 30 seconds after you start pouring."
        },
        {
          "title": "Hojicha (how to brew)",
          "author": "World Green Tea Association (O-CHA NET, Shizuoka)",
          "url": "https://www.o-cha.net/english/culture/Japanesetea-hojicha.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "3 g and about 130 ml per person, boiling water, about 30 seconds; warm the pot and cups first; bancha and genmaicha are brewed the same way."
        },
        {
          "title": "Brewing – Genmaicha",
          "author": "Hibiki-an (Ujitawara, Kyoto)",
          "url": "https://www.hibiki-an.com/contents.php/cnID/34",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "For 2 cups, 7–8 g in 200 ml at 80 °C for 1 minute: the cooler outlier."
        },
        {
          "title": "碧翆園 (Hekisuien)",
          "author": "Hekisuien (Jōyō, Kyoto)",
          "url": "https://ujicha.co.jp/",
          "lang": "ja",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "A former president, Horii Kishirō, created the tea-and-rice blend in the Taishō era; refused a patent as too simple, it was sold from 1923 under the trademark Hanayanagi; said to be the first genmaicha, the only theory with a clear date."
        },
        {
          "title": "The Story of Genmaicha",
          "author": "Chikiriya Tea House (Kyoto)",
          "url": "https://kyo-chikiriya.shop/blogs/chikiriya_blog_about_tea/the-story-of-genmaicha",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Three tales: households stretching costly tea with roasted rice (undated), a servant named Genmai (likely fictitious), a Kyoto merchant roasting leftover New Year mochi."
        },
        {
          "title": "玄米茶 (Genmaicha)",
          "author": "Wikipedia (ja)",
          "url": "https://ja.wikipedia.org/wiki/%E7%8E%84%E7%B1%B3%E8%8C%B6",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Tea and rice in about equal parts; several theories of its origin, including Kyoto houses that claim the Taishō era."
        },
        {
          "title": "カフェインの過剰摂取について (On excess caffeine)",
          "author": "MAFF, Food Safety Policy Division",
          "url": "https://www.maff.go.jp/j/syouan/seisaku/risk_analysis/priority/hazard_chem/caffeine.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "From Japan's food composition tables: genmaicha 10 mg of caffeine per 100 ml, sencha 20."
        }
      ],
      "ingredients": [
        {
          "id": "genmaicha",
          "qty": 12,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "soft-bottled",
        "tempC": 100,
        "tempRange": {
          "min": 80,
          "max": 100
        },
        "ratioGPer100ml": 2.2,
        "waterMl": 550,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          30
        ]
      },
      "steps": [
        {
          "text": "Bring fresh water to a full boil. Rinse the teapot and the two mugs with a splash of it and empty them.",
          "office": "Set the kettle to 100 °C. Rinse the teapot and the two mugs with a splash and empty them.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot and pour on all the water at a full boil: the time runs from the start of the pour. The water includes a little extra for what the leaves soak up.",
          "office": "Put the leaves in the teapot and pour straight from the kettle at 100 °C.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the two mugs in turns, a little at a time, down to the last drop. For a second pot, pour boiling water on the same leaves and pour it out at once.",
          "office": "Pour into the two mugs in turns, down to the last drop. For a second pot, refill from the kettle and pour it out at once.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "015",
      "slug": "hojicha",
      "name": "Hojicha",
      "mode": "safe",
      "family": "tea-master",
      "trust": "attested",
      "sourceType": "tea-house",
      "origin": "Japan (Kanazawa)",
      "story": "Hojicha is Japanese green tea, sencha or bancha, roasted over high heat until it turns brown: the roasting takes away the bitterness and leaves a toasty smell. Kyo Hayashiya, a tea house founded in Kanazawa in 1753, says its third master, Hayashiya Shinbei, roasted discarded sencha stems in 1902 into bōcha, \"stick tea\", and taught the method to the town's tea trade. The better-known story, Kyoto merchants roasting unsold tea in the 1920s, is a legend, only ever told \"as the story goes\". Like genmaicha, it takes boiling water and about 30 seconds.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "roasted",
        "toasty"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "The proper way to brew Nihoncha",
          "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
          "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-7.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "Bancha (genmaicha, houjicha): 2–3 g per 100 ml, boiling water, about 30 seconds; a second infusion with boiling water, poured out at once; soft water."
        },
        {
          "title": "Basic Bancha (Hojicha, Genmaicha, etc.)",
          "author": "Ippodo Tea",
          "url": "https://global.ippodo-tea.co.jp/blogs/tea-recipe/basic-bancha-hojicha-genmaicha",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "10 g (hojicha: 4 tablespoons, it is bulky) in 240 ml at 100 °C, boiling vigorously; serve 30 seconds after you start pouring."
        },
        {
          "title": "Hojicha (how to brew)",
          "author": "World Green Tea Association (O-CHA NET, Shizuoka)",
          "url": "https://www.o-cha.net/english/culture/Japanesetea-hojicha.html",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "3 g and about 130 ml per person, boiling water, about 30 seconds; warm the pot and cups first."
        },
        {
          "title": "歴史 (History)",
          "author": "Kyo Hayashiya (Kanazawa, founded 1753)",
          "url": "https://kyo-hayashiya.jp/history/",
          "lang": "ja",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "In 1902 the third Hayashiya Shinbei invented roasted stem tea, called bōcha for its shape, and taught it to the Kanazawa tea trade; said to be the origin of stem hojicha."
        },
        {
          "title": "ほうじ茶 (Hojicha)",
          "author": "Wikipedia (ja)",
          "url": "https://ja.wikipedia.org/wiki/%E3%81%BB%E3%81%86%E3%81%98%E8%8C%B6",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story",
            "parameters"
          ],
          "note": "Kanazawa 1902, citing the company; leaf hojicha said to date from 1920s Kyoto; 2–3 g per 100 ml, hot water, about 30 seconds; roasting lowers astringency."
        },
        {
          "title": "History of Hojicha",
          "author": "Moé Kishida, Yunomi, 2023",
          "url": "https://yunomi.life/blogs/ocha/history-of-hojicha-one-of-japans-favorite-tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "The 1920s Kyoto versions are told as 'the story goes'; no record names a tea as hojicha before then."
        },
        {
          "title": "特集1 緑茶 (Green tea, feature 1)",
          "author": "MAFF, aff magazine",
          "url": "https://www.maff.go.jp/j/pr/aff/1704/spe1_01.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Sencha or bancha roasted over high heat; a toasty aroma and a clean finish."
        },
        {
          "title": "カフェインの過剰摂取について (On excess caffeine)",
          "author": "MAFF, Food Safety Policy Division",
          "url": "https://www.maff.go.jp/j/syouan/seisaku/risk_analysis/priority/hazard_chem/caffeine.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "From Japan's food composition tables: hojicha 20 mg of caffeine per 100 ml, the same as sencha, though it is often called low in caffeine."
        }
      ],
      "ingredients": [
        {
          "id": "hojicha",
          "qty": 12,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "soft-bottled",
        "tempC": 100,
        "ratioGPer100ml": 2.2,
        "waterMl": 550,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          30
        ]
      },
      "steps": [
        {
          "text": "Bring fresh water to a full boil. Rinse the teapot and the two mugs with a splash of it and empty them.",
          "office": "Set the kettle to 100 °C. Rinse the teapot and the two mugs with a splash and empty them.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot and pour on all the water at a full boil: the time runs from the start of the pour. The water includes a little extra for what the leaves soak up.",
          "office": "Put the leaves in the teapot and pour straight from the kettle at 100 °C.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the two mugs in turns, a little at a time, down to the last drop. For a second pot, pour boiling water on the same leaves and pour it out at once.",
          "office": "Pour into the two mugs in turns, down to the last drop. For a second pot, refill from the kettle and pour it out at once.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "016",
      "slug": "keemun",
      "name": "Keemun",
      "mode": "safe",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "China (Qimen, Anhui)",
      "story": "Qimen County, in Anhui, made only green tea until the 1870s. Its first black tea dates from 1875, by Twinings and China's state news agency, or 1876, by the national heritage register. English writing credits Yu Ganchen, an official who had learned to make black tea in Fujian; Chinese sources name Hu Yuanlong; a tea magazine has both at work at the same time. Keemun won gold at the 1915 Panama-Pacific Exposition, its making has been national heritage since 2008, and Twinings calls it a key base of English Breakfast.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "malty",
        "cocoa",
        "floral"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Keemun",
          "author": "Twinings",
          "url": "https://twinings.co.uk/world-of-tea/keemun",
          "lang": "en",
          "primary": true,
          "supports": [
            "story",
            "parameters"
          ],
          "note": "First made in 1875; credits Yu Ganchen, who went to Fujian to learn black-tea making; freshly boiled water, never reboiled; pre-warm the pot; good with or without milk; a base of English Breakfast."
        },
        {
          "title": "Keemun brewing guide",
          "author": "TeaSpring",
          "url": "https://www.teaspring.com/Keemun.asp?section=brew",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "About 2 g per 150 ml, 95 °C, 1 minute for the first and second brews; rinse the pot and cup with hot water first; milk optional, 10–15 ml."
        },
        {
          "title": "祁门红茶制作技艺 (The craft of Keemun black tea)",
          "author": "China Intangible Cultural Heritage Network",
          "url": "https://www.ihchina.cn/project_details/14618.html",
          "lang": "zh",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "National heritage item Ⅷ-149, listed in 2008; first made in Guangxu 2, 1876; gold medal at the 1915 Panama-Pacific Exposition."
        },
        {
          "title": "中国故事｜祁门红茶香飘世界 (Keemun's aroma travels the world)",
          "author": "Xinhua, 13 April 2023",
          "url": "https://www.news.cn/politics/2023-04/13/c_1129519309.htm",
          "lang": "zh",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "1875; names Hu Yuanlong of Guixi as the founder; Qimen made only green tea before; 1915 gold medal; part of UNESCO's 2022 listing of China's tea-processing techniques."
        },
        {
          "title": "Qimen",
          "author": "Global Tea Hut, issue 66, July 2017",
          "url": "https://archive.globalteahut.org/article/922",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Yu Ganchen began making black tea in 1875 after a posting in Fujian; Hu Yuanlong made the same switch at the same time."
        },
        {
          "title": "Keemun",
          "author": "Les Jardins de Gaïa",
          "url": "https://www.jardinsdegaia.com/en/black-tea/99-keemun.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "2 g per 25 cl, 95 °C, 3–4 minutes; used for the Western ratio only, since this tea is grown in Hubei, not Qimen."
        }
      ],
      "ingredients": [
        {
          "id": "keemun",
          "qty": 5,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 95,
        "tempRange": {
          "min": 95,
          "max": 100
        },
        "ratioGPer100ml": 1,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          180
        ]
      },
      "steps": [
        {
          "text": "Boil fresh water, never reboiled. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 95 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot, pour the water and put the lid on.",
          "office": "Put the leaves in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the two cups. Taste it plain first; a splash of milk suits it too.",
          "office": "Pour into the two mugs, with a splash of milk from the fridge if you like.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "017",
      "slug": "royal-blend",
      "name": "Fortnum & Mason's Royal Blend",
      "mode": "safe",
      "family": "court",
      "trust": "attested",
      "sourceType": "tea-house",
      "origin": "England (London)",
      "story": "Fortnum & Mason says that in 1902 King Edward VII asked for the finest tea in the land, and that it searched abroad and made him Royal Blend: Assam from India, lifted by a Flowery Pekoe from Sri Lanka, for a smooth, honeyed cup. It is still the house's benchmark tea. Other accounts only retell its story, and no document was found. The house names the teas but not their shares: the 3 to 2 of Assam to Ceylon here is our own, the Assam as the body and the Ceylon the smaller part.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "malty",
        "honeyed"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Royal Blend, 125 g loose leaf caddy",
          "author": "Fortnum & Mason",
          "url": "https://eu.fortnumandmason.com/royal-blend-125g-loose-leaf-decorative-caddy",
          "lang": "en",
          "primary": true,
          "supports": [
            "story",
            "recipe",
            "parameters"
          ],
          "note": "First blended for King Edward in 1902; Assam with a Flowery Pekoe from Sri Lanka, which lifts the maltier Assam; no proportions; 1 rounded teaspoon (2 g), freshly boiled water, 3–5 minutes."
        },
        {
          "title": "Our history timeline",
          "author": "Fortnum & Mason",
          "url": "https://www.fortnumandmason.com/stories/our-history-timeline",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "1902: the king asked for the finest tea in the land; Fortnum's searched abroad and gave him the result, Assam and Flowery Pekoe, smooth and honey-like."
        },
        {
          "title": "Royal Blend 250 g, pack label",
          "author": "Fortnum & Mason Europe",
          "url": "https://eu.fortnumandmason.com/media/alergen-translations-pdf/2002657-Royal_Blend_250g.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Freshly drawn water heated to 100 °C, 1 teaspoon per person, 5 minutes; best with a splash of milk."
        },
        {
          "title": "Fortnum & Mason: how the queen's footman created London's legendary emporium",
          "author": "Afisha.London, 12 November 2025",
          "url": "https://afisha.london/en/2025/11/12/fortnum-mason-how-the-queen-s-footman-created-london-s-legendary-emporium/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Retells Fortnum & Mason's own account of 1902; cites nothing."
        },
        {
          "title": "Royal Blend",
          "author": "RateTea",
          "url": "https://ratetea.com/tea/fortnum-and-mason/royal-blend/6503/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Listing copy: first blended in the summer of 1902; low-grown Ceylon Flowery Pekoe with the maltier Assam."
        }
      ],
      "ingredients": [
        {
          "id": "assam",
          "qty": 3,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "ceylon-black",
          "qty": 2,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "ratioGPer100ml": 1,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          240
        ]
      },
      "steps": [
        {
          "text": "Boil freshly drawn water. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 100 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put both teas in the teapot, pour the water and put the lid on.",
          "office": "Put both teas in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the two cups, with a splash of milk, as the house serves it.",
          "office": "Pour into the two mugs, with a splash of milk from the fridge.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "018",
      "slug": "prince-of-wales",
      "name": "Twinings' Prince of Wales",
      "mode": "safe",
      "family": "court",
      "trust": "attested",
      "sourceType": "tea-house",
      "origin": "England (London)",
      "story": "Twinings says it first blended this tea in 1921 for the Prince of Wales, the future Edward VIII, who let it carry his title; other accounts call it his own blend, which he let Twinings sell. Twinings withdrew it from sale in Britain when he became king in 1936, and still sells it abroad. Old British tins named Keemun; today's packs say only China teas. So this is Keemun alone, lighter than #016: less leaf, boiling water and a short steep, for the soft, delicate cup Twinings describes.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "light",
        "nutty"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Prince of Wales Tea",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/prince-of-wales-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "story",
            "recipe"
          ],
          "note": "First created in 1921 for the then Prince of Wales, later Edward VIII, who let it carry his title; withdrawn from UK sale in 1936, still sold abroad; fine and delicate China teas; nutty, soft and delicate."
        },
        {
          "title": "How to make a cup of tea perfectly",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/news/how-to-make-a-cup-of-tea-perfectly",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Freshly drawn cold water; let boiled water rest 2–3 minutes before pouring; about 1 teaspoon (2 g) per person; warm the cup or pot."
        },
        {
          "title": "Twinings Prince of Wales, 20 bags (pack text)",
          "author": "Vitacost",
          "url": "https://www.vitacost.com/products/twinings-pure-black-tea-prince-of-wales-20-tea-bags-1-41-oz-40-g-34545",
          "lang": "en",
          "primary": false,
          "supports": [
            "story",
            "parameters"
          ],
          "note": "The pack: Stephen Twining's ancestors blended it for the Prince of Wales in 1921; light, velvety and mild; boiling water, 3–5 minutes."
        },
        {
          "title": "The Great British Cuppa: ten common tea blends and their fascinating histories",
          "author": "John Rabon, Anglotopia, 25 May 2018",
          "url": "https://anglotopia.net/british-history/british-empire/great-british-cuppa-ten-common-tea-blends-fascinating-histories/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story",
            "recipe"
          ],
          "note": "Edward let Twinings sell a version of his tea: high-grade Keemun with other Chinese black teas."
        },
        {
          "title": "Prince of Wales tea blend",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Prince_of_Wales_tea_blend",
          "lang": "en",
          "primary": false,
          "supports": [
            "story",
            "recipe"
          ],
          "note": "Old UK tins said 'finest Keemun black teas'; the current pack says pure China black tea; no set formula."
        }
      ],
      "ingredients": [
        {
          "id": "keemun",
          "qty": 4,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "tempRange": {
          "min": 95,
          "max": 100
        },
        "ratioGPer100ml": 0.8,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": true,
        "infusionsS": [
          180
        ]
      },
      "steps": [
        {
          "text": "Boil freshly drawn water. Warm the teapot with a swirl of it and pour it away.",
          "office": "Set the kettle to 100 °C. Warm the teapot with a swirl of hot water and pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the leaves in the teapot, pour the water and put the lid on.",
          "office": "Put the leaves in the teapot, pour the water and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour into the two cups. It is light enough to take plain; milk is up to you.",
          "office": "Pour into the two mugs; a splash of milk from the fridge if you like.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "019",
      "slug": "shogayu",
      "name": "Shōgayu: ginger, lemon and honey",
      "mode": "safe",
      "family": "chef",
      "trust": "documented",
      "sourceType": "chef",
      "origin": "Japan",
      "story": "Shōgayu, Japanese for \"ginger hot water\", is fresh ginger steeped in boiling water, drunk to keep warm through Japan's winters and, as people there believe, against colds. In 2009 a kampo doctor suggested it, with grated ginger juice, honey and starch, at the first shiver of a cold. Marc Matsumoto, a Tokyo food writer who began as a private chef, leaves out the starch and adds lemon: grated ginger steeped just 2 minutes, with lemon and honey stirred in to taste. BBC Good Food makes the same drink in the mug, with sliced ginger, for 3 minutes.",
      "difficulty": 1,
      "seasons": [
        "winter"
      ],
      "flavours": [
        "spicy",
        "citrus",
        "honeyed"
      ],
      "caffeine": "none",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Ginger Lemon Honey Tea (Shogayu)",
          "author": "Marc Matsumoto, No Recipes, updated 22 May 2025",
          "url": "https://norecipes.com/ginger-lemon-honey-tea-shogayu/",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "For 4 mugs: 30 g of ginger, washed, unpeeled, grated or finely chopped; about 3 cups of boiling water, 2 minutes; lemon (¼ per serving) and honey (optional) added after, to taste; shōgayu kept people warm in Japan's cold winters."
        },
        {
          "title": "About",
          "author": "Marc Matsumoto, No Recipes",
          "url": "https://norecipes.com/about/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "A Tokyo-based food writer and recipe developer, formerly a private chef; Ultimate Bento (Tuttle); NHK World's Bento Expo."
        },
        {
          "title": "Lemon & ginger tea",
          "author": "Miriam Nice, BBC Good Food (Middle East edition)",
          "url": "https://bbcgoodfoodme.com/recipes/lemon-ginger-tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "For 2 mugs: the juice of half a lemon and slices of the other half, 2 cm of ginger finely sliced, boiling water, 3 minutes; honey to taste, optional."
        },
        {
          "title": "木村容子の「季節の漢方手帖」 (Dr Kimura Yoko's seasonal kampo notebook)",
          "author": "Kimura Yoko, imidas (Shueisha), 4 December 2009",
          "url": "https://imidas.jp/kanpo/detail/F-51-001-09-12-G100.html",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "A kampo doctor suggests shōgayu, grated ginger juice with honey and potato starch, at the first chill of a cold, to warm the body from inside."
        },
        {
          "title": "Get stuck in: four healing honey recipes",
          "author": "Felicity Cloake, The Irish Times (from the Guardian), 7 September 2018",
          "url": "https://www.irishtimes.com/life-and-style/food-and-drink/get-stuck-in-four-healing-honey-recipes-1.3620402",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe"
          ],
          "note": "Ginger and a strip of lemon peel heated in water; honey and lemon juice stirred in after it cools a little."
        }
      ],
      "ingredients": [
        {
          "id": "fresh-ginger",
          "qty": 20,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "lemon",
          "qty": 4,
          "unit": "pieces",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "honey",
          "qty": 40,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "waterMl": 500,
        "vessel": "teapot",
        "preheat": false,
        "infusionsS": [
          120
        ]
      },
      "steps": [
        {
          "text": "Wash the ginger well and grate it, skin and all, or chop it finely. Put it in the teapot, and boil the water.",
          "office": "Put the ginger you grated and boxed the evening before in the teapot, and set the kettle to 100 °C.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour the boiling water over the ginger and put the lid on.",
          "office": "Pour from the kettle over the ginger and put the lid on.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Put 2 lemon slices and a spoonful of honey (about 20 g) in each mug. Pour the ginger water through a strainer onto them, then stir and press the slices.",
          "office": "Put 2 lemon slices and the honey in each mug, pour the ginger water slowly through the teapot's strainer, leaving the last of it and the ginger in the pot, then stir and press the slices.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "020",
      "slug": "london-fog",
      "name": "London Fog",
      "mode": "experimental",
      "family": "earl-grey",
      "trust": "legend",
      "sourceType": "tea-house",
      "origin": "Canada (Vancouver)",
      "story": "The London Fog, Earl Grey with steamed milk and vanilla, is said to come from Vancouver, though Twinings calls its creator unknown. The usual account, a legend, credits Mary Loria: pregnant in the 1990s and off coffee, she asked the Buckwheat Café for Earl Grey with steamed milk, sweetened with its vanilla sugar. She tells it herself, decades later, but doesn't know who named it, and grants that others may have had the same idea. There are rival claims, and Murchie's archives from the 1990s show no London Fog.",
      "difficulty": 2,
      "seasons": [],
      "flavours": [
        "creamy",
        "vanilla",
        "bergamot"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 1
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "London Fog",
          "author": "Twinings",
          "url": "https://twinings.co.uk/blogs/recipes/london-fog",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "1 Earl Grey bag in 100 ml of freshly boiled water, 2–3 minutes; vanilla syrup; topped with steamed milk; said to have originated in Vancouver, its creator unknown."
        },
        {
          "title": "London Fog Tea Latte",
          "author": "America's Test Kitchen",
          "url": "https://www.americastestkitchen.com/recipes/15570-london-fog-tea-latte",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "1½ teaspoons of Earl Grey and a cracked cardamom pod in ½ cup of water at 208 °F, covered, 5 minutes; ½ cup of milk with ¼–½ teaspoon of vanilla extract heated to 140–155 °F, about 5 minutes; whisked hard off the heat for 2 minutes."
        },
        {
          "title": "Earl Grey Lavender",
          "author": "Rishi Tea",
          "url": "https://www.rishi-tea.com/products/organic-earl-grey-lavender-black-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "For a London Fog: an extra-strong infusion, steamed milk and a touch of lavender honey."
        },
        {
          "title": "The London Fog's history is anything but clear",
          "author": "Jennifer Billock, Imbibe, 20 January 2026",
          "url": "https://imbibemagazine.com/history-of-the-london-fog-tea/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Mary Loria, interviewed: Earl Grey with steamed milk and the café's vanilla sugar at the Buckwheat Café, mid-1990s; others may have invented it too; a rival claim from Langley, Washington; Murchie's 1990s archives show no London Fog."
        },
        {
          "title": "What is a London Fog?",
          "author": "Liz Clayton, Sprudge, 13 March 2023",
          "url": "https://sprudge.com/what-is-a-london-fog-202286.html",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Loria, off coffee while pregnant, asked for Earl Grey with steamed milk and vanilla sugar; who named it is a mystery."
        },
        {
          "title": "London fog (drink)",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/London_fog_(drink)",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "1990s, Vancouver, Mary Loria."
        }
      ],
      "ingredients": [
        {
          "id": "earl-grey",
          "qty": 3,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "whole-milk",
          "qty": 120,
          "unit": "ml",
          "optional": false,
          "role": "base"
        },
        {
          "id": "vanilla-extract",
          "qty": 2,
          "unit": "ml",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "green-cardamom",
          "qty": 1,
          "unit": "pieces",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [
        {
          "id": "thermometer",
          "optional": true
        }
      ],
      "brew": {
        "water": "tap",
        "tempC": 98,
        "tempRange": {
          "min": 95,
          "max": 100
        },
        "ratioGPer100ml": 2.5,
        "waterMl": 120,
        "vessel": "mug",
        "preheat": false,
        "infusionsS": [
          300
        ]
      },
      "steps": [
        {
          "text": "Put the leaves in a small teapot, or in an infuser in a mug, with a cracked cardamom pod if you like. Pour the water just off the boil, cover, and steep: a strong brew, to stand up to the milk.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "While it steeps, heat the milk with the vanilla in a small saucepan over medium heat until it steams, about 5 minutes: 60–68 °C, well short of the boil.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Off the heat, whisk the milk hard until it foams.",
          "timerS": 120,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Strain the tea into your mug, or lift out the infuser, sweeten to taste if you like, pour the milk over the tea and spoon the foam on top.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "021",
      "slug": "turkish-cay",
      "name": "Turkish çay",
      "mode": "experimental",
      "family": "household",
      "trust": "documented",
      "sourceType": "chef",
      "origin": "Türkiye (Rize)",
      "story": "Türkiye grows its own tea because the state set out to: a 1924 law covered tea growing around Rize, on the eastern Black Sea, and the first leaf and the first dry tea came in 1938, by ÇAYKUR, the state tea company. At home it is brewed strong in a two-tier pot, the tea steeping on top of the water boiling below, and each glass is cut with hot water, dark (koyu) or light (açık). In 2022 UNESCO listed the culture of çay, shared with Azerbaijan, as a mark of hospitality.",
      "difficulty": 1,
      "seasons": [],
      "flavours": [
        "brisk",
        "clean"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Çaykur'un Tarihçesi (ÇAYKUR's history)",
          "author": "ÇAYKUR",
          "url": "https://www.caykur.gov.tr/Pages/Kurumsal/KurumHakkinda.aspx?ItemId=6",
          "lang": "tr",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Law No. 407 of 1924 covered tea, hazelnut and citrus growing in Rize and Borçka; seed from Batum from 1937; the first fresh leaf and the first dry tea in 1938."
        },
        {
          "title": "Turkish Tea (Çay)",
          "author": "Ayla Clulee, Cooking Gorgeous, 2024 (updated 2026)",
          "url": "https://cookingorgeous.com/blog/turkish-tea-cay/",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "A Cordon Bleu-trained chef: for 6, 3 tablespoons of loose black tea, about 500 ml of boiling water over the leaves, 10–15 minutes on low heat until the leaves sink; a third of a glass of tea, topped up with hot water; with a saucepan, set a heatproof teapot on it in place of its lid."
        },
        {
          "title": "Tips on How to Make Turkish Tea",
          "author": "Go Türkiye (Türkiye Tourism Promotion and Development Agency)",
          "url": "https://goturkiye.com/tips-on-how-to-make-turkish-tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "Boiling water on the leaves in the top pot; stack the pots, wait for the bottom to boil again, brew on the lowest heat 10–15 minutes; a quarter glass of tea topped up with boiling water; sugar on the side."
        },
        {
          "title": "Culture of Çay (tea), a symbol of identity, hospitality and social interaction",
          "author": "UNESCO Intangible Cultural Heritage",
          "url": "https://ich.unesco.org/en/RL/01685",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Inscribed in 2022 for Azerbaijan and Türkiye; mainly black tea, served hot in pear-shaped glasses; a mark of hospitality."
        },
        {
          "title": "Çay neden acı ve bulanık olur? (Why does tea turn bitter and cloudy?)",
          "author": "Erhan İmamoğlu, İşin Olsa, 29 October 2026",
          "url": "https://www.isinolsa.com/cay-neden-aci-ve-bulanik-olur-tavsan-kani-dem-icin-5-puf-noktasi/",
          "lang": "tr",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "Reports ÇAYKUR's Rize Turist label: 2 teaspoons of tea per glass, limescale-free water, 13–15 minutes; the brew must not boil."
        },
        {
          "title": "Tea in Turkey",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Tea_in_Turkey",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Water from the bottom pot dilutes each serving: koyu is dark, açık light."
        }
      ],
      "ingredients": [
        {
          "id": "rize-black-tea",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [],
      "brew": {
        "water": "filtered",
        "tempC": 100,
        "waterMl": 600,
        "vessel": "teapot",
        "preheat": false,
        "infusionsS": [
          720
        ]
      },
      "steps": [
        {
          "text": "Boil the water in a saucepan. Put the tea in a metal or heatproof teapot that sits steady on the pan.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Pour about a third of the boiling water over the leaves, set the teapot on the saucepan in place of its lid, and turn the heat to its lowest. Leave it until the leaves sink, never letting the top boil. If your teapot can't sit on the pan, put its own lid on and give it a few minutes longer.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Pour the tea into each glass or mug, a quarter to a third full, and top it up with boiling water from the saucepan: more tea for koyu, less for açık. Sugar on the side, if you like; try it plain first.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "022",
      "slug": "noon-chai",
      "name": "Kashmiri noon chai",
      "mode": "experimental",
      "family": "household",
      "trust": "documented",
      "sourceType": "grandmother",
      "origin": "Kashmir",
      "story": "Noon is Kashmiri for salt, and noon chai is the salty pink tea Kashmiris drink all winter, poured from a samovar with breads such as girda, and served at weddings and births. The pink is chemistry: long boiling draws out the tea's polyphenols, which change colour with pH; baking soda pushes them to a deep red, ice-cold water fixes it, and milk lightens it to pink. This method follows Maryam Jillani's family recipe, from her aunt, and a Kashmiri cook's in Gulf News. That it came along the Silk Road from Yarkand is a legend.",
      "difficulty": 3,
      "seasons": [
        "winter"
      ],
      "flavours": [
        "salty",
        "creamy"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-cup",
        "serves": 2
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Kashmiri chai (pink tea)",
          "author": "Maryam Jillani, from Pakistan: Recipes and Stories from Home Kitchens (Hardie Grant), on SBS Food, 9 May 2025",
          "url": "https://www.sbs.com.au/food/recipe/kashmiri-chai-pink-tea/lo7ialu2j",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "Her aunt's family method. For 6: 20 g of tea leaves, 4 cardamom pods and star anise in half of 960 ml of ice-cold water, reduced by half; ¼ teaspoon of baking soda, then aerated with a ladle 3 minutes; the rest of the ice water, 15 minutes more, until deep burgundy; with full-fat milk, salt; 1½ tablespoons of crushed pistachios on top, optional; drunk in winter and at weddings."
        },
        {
          "title": "Recipe for Kashmiri noon chai or pink tea",
          "author": "Syed Faiq, Gulf News, updated 9 February 2022",
          "url": "https://gulfnews.com/food/cooking-cuisines/recipe-for-kashmiri-noon-chai-or-pink-tea-1.1643711381882",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe"
          ],
          "note": "A Kashmiri cook's recipe for 2: Kashmiri or green tea, ¼ teaspoon of baking soda, reduced and topped up with water 2–3 times until deep red-brown, then 1 part concentrate to 3 of milk, with salt; no sugar."
        },
        {
          "title": "Cuisine: not a quick cuppa",
          "author": "Dr Mubashar Naqvi, Dawn, January 2018",
          "url": "https://www.dawn.com/news/1381323",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe",
            "story"
          ],
          "note": "For 2 cups: 2 cups of water, 2–3 teaspoons of green tea, 4 cardamoms, a pinch of baking soda, boiled about 20 minutes to half; 2 cups of cold water, 5–10 minutes more; milk; salt; nuts on top; noon means salt."
        },
        {
          "title": "Be in the pink this winter with Kashmiri noon chai",
          "author": "Nasir Yousufi, Village Square, 2023",
          "url": "https://villagesquare.in/?p=17390",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Drunk in winter, poured from a samovar, with breads such as girda; at births, weddings and visits to mourners; it probably came along the Silk Road."
        },
        {
          "title": "Kashmir's noon chai is a pink, salty delight",
          "author": "Anahita Ahluwalia, Homegrown, 10 February 2025",
          "url": "https://homegrown.co.in/homegrown-explore/kashmirs-noon-chai-is-a-pink-salty-delight-that-holds-centuries-of-heritage",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Gunpowder green tea; long boiling with soda raises the pH and turns it burgundy, like the indicator phenol red; cold water locks in the shade, milk makes it pink."
        },
        {
          "title": "Noon chai",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Noon_chai",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Gunpowder tea, traditionally boiled about an hour with soda; ice water, then aeration with a ladle; said to have come from Yarkand by the Silk Road."
        }
      ],
      "ingredients": [
        {
          "id": "gunpowder-green",
          "qty": 6,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "whole-milk",
          "qty": 300,
          "unit": "ml",
          "optional": false,
          "role": "base"
        },
        {
          "id": "baking-soda",
          "qty": 0.5,
          "unit": "g",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "green-cardamom",
          "qty": 2,
          "unit": "pieces",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "salt",
          "qty": 1,
          "unit": "g",
          "optional": false,
          "role": "accent"
        },
        {
          "id": "star-anise",
          "qty": 1,
          "unit": "pieces",
          "optional": true,
          "role": "accent"
        },
        {
          "id": "pistachios",
          "qty": 5,
          "unit": "g",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "waterMl": 600,
        "vessel": "saucepan",
        "preheat": false,
        "infusionsS": [
          1080
        ]
      },
      "steps": [
        {
          "text": "Put a third of the water in the fridge, or add a few ice cubes to it: it must be ice-cold later. Lightly crush the cardamom pods.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "In a saucepan, simmer the leaves, the cardamom and the star anise, if you use it, in the other two thirds of the water, cold, until it has reduced by half: a smaller pan reduces faster, so watch it.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Stir in the baking soda (a pinch). When it foams, ladle the tea up and pour it back from a height, again and again.",
          "timerS": 180,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Add the ice-cold water and keep simmering and ladling, until the tea turns a deep burgundy. Then strain it: about a third of the water you started with is left.",
          "timerS": 720,
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Heat the milk in the pan, stir in the concentrate, which turns it pink, and the salt, and bring it just to a simmer. Crush the pistachios roughly and scatter them on top, if you use them. The colour can fail: it still tastes right.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "023",
      "slug": "matcha-usucha",
      "name": "Matcha, thin (usucha)",
      "mode": "experimental",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "Japan (Uji)",
      "story": "Tea reached Japan from China by the Nara period, but powdered tea spread after the Zen monk Eisai came back from Song China in 1191 with seeds and the way to grow and prepare it. In 1211 he wrote the Kissa Yōjōki, Japan's first book on tea, which tells how matcha is made. Matcha is tencha, leaf from shaded gardens, stone-ground to a fine powder and whisked, so the whole leaf is drunk; whisking it gave rise to chanoyu, the way of tea, which took its present form with Sen no Rikyū in the 16th century. Usucha is the thin, frothy everyday bowl.",
      "difficulty": 3,
      "seasons": [],
      "flavours": [
        "vegetal",
        "creamy"
      ],
      "caffeine": "high",
      "scaling": {
        "kind": "per-cup",
        "serves": 1
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Basic Usucha (Matcha)",
          "author": "Ippodo Tea",
          "url": "https://global.ippodo-tea.co.jp/blogs/tea-recipe/basic-usucha-matcha",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "2 g (1 level teaspoon), sifted; 60 ml at 80 °C; whisk vigorously for 15 seconds."
        },
        {
          "title": "お茶のおいしい入れ方 抹茶 (How to make good matcha)",
          "author": "Kyoto Prefectural Tea Industry Research Institute",
          "url": "https://www.pref.kyoto.jp/chaken/irekata_maccha.html",
          "lang": "ja",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "Sift; warm the bowl and the whisk; about 2 g; 70 ml at 70–80 °C; a little water first to whisk out the lumps, then the rest; quick strokes from the wrist; a café au lait bowl and a level teaspoon will do."
        },
        {
          "title": "Enjoy making a bowl of tea!",
          "author": "Marukyu Koyamaen (Uji)",
          "url": "https://www.marukyu-koyamaen.co.jp/leaflet/enjoy_making_en.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "About 1.5 g sifted into a warm, dry bowl; 70 ml of water that has boiled: 75–85 °C in winter (poured into a cup once), 70–80 °C in summer (twice); whisk back and forth, no swirling, then slow at the surface and lift from the centre; soft water."
        },
        {
          "title": "Japanese Tea",
          "author": "Marukyu Koyamaen (Uji)",
          "url": "https://www.marukyu-koyamaen.co.jp/leaflet/about_tea_en.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Tea first came from China in the Nara period; in 1191 Eisai brought seeds and the knowledge to grow and prepare tea, and powdered tea spread; refined under Zen into chanoyu, perfected by Sen no Rikyū."
        },
        {
          "title": "喫茶養生記 (Kissa Yōjōki)",
          "author": "Wikipedia (ja)",
          "url": "https://ja.wikipedia.org/wiki/%E5%96%AB%E8%8C%B6%E9%A4%8A%E7%94%9F%E8%A8%98",
          "lang": "ja",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Written by Eisai in 1211, a fuller version often dated 1214; its first volume tells how matcha is made; Eisai brought seeds from Song China in 1191."
        },
        {
          "title": "Chanoyu (the art of preparing tea)",
          "author": "Japan Tourism Agency (MLIT)",
          "url": "https://www.mlit.go.jp/tagengo-db/common/001654470.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Powdered tea arrived in the 12th century, at first for health; the way of tea took shape in the 15th–16th centuries, with Sen Rikyū."
        },
        {
          "title": "The proper way to brew Nihoncha",
          "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
          "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-7.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Matcha is tencha from shaded gardens, stone-ground and whisked, so the whole leaf is drunk; this led to chanoyu."
        }
      ],
      "ingredients": [
        {
          "id": "matcha",
          "qty": 2,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [
        {
          "id": "chawan",
          "optional": false
        },
        {
          "id": "chasen",
          "optional": false
        },
        {
          "id": "thermometer",
          "optional": true
        }
      ],
      "brew": {
        "water": "soft-bottled",
        "tempC": 80,
        "tempRange": {
          "min": 70,
          "max": 85
        },
        "ratioGPer100ml": 2.9,
        "waterMl": 70,
        "vessel": "chawan",
        "preheat": true,
        "infusionsS": [
          15
        ]
      },
      "steps": [
        {
          "text": "Boil soft water. Pour a little into the chawan and dip the whisk's tines in it to warm and soften them; empty the bowl and dry it.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Sift the matcha through a fine tea strainer into the bowl: 2 g is a level teaspoon, or two chashaku scoops.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Cool the rest of the water to about 80 °C by pouring it into a cup once (twice in summer), and measure 70 ml. Add a splash to the matcha and whisk it into a smooth paste, then add the rest.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Whisk briskly back and forth from the wrist, the tines just off the bottom, never in circles, until a fine foam covers the tea. Slow down at the surface to burst the big bubbles, then lift the whisk from the centre.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Drink it straight away. Rinse the whisk in hot water, no soap, and leave it to dry tines up.",
          "infusions": false,
          "stage": "day"
        }
      ]
    },
    {
      "code": "024",
      "slug": "silver-needle",
      "name": "Silver needle",
      "mode": "experimental",
      "family": "tea-master",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "China (Fuding, Fujian)",
      "story": "Bai hao yin zhen, \"white-down silver needle\", is made only from the plump, unopened buds of the Fuding Dabai or Dahao bushes, picked in early spring, then simply withered and dried, never fried or rolled. Fuding's white tea has been a protected geographical indication since 2009 and its craft national heritage since 2011. A Qing-era book on Fujian already praises the \"green snow buds\" of Fuding's Taimu Mountain. Fuding says it first made silver needle in 1796; no document proves it, so that date is a legend.",
      "difficulty": 2,
      "seasons": [],
      "flavours": [
        "floral",
        "sweet",
        "hay"
      ],
      "caffeine": "medium",
      "scaling": {
        "kind": "per-session",
        "sessionMax": 3
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Yin Zhen bio (Grand Cru)",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/yin-zhen-2025-fr.html",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Buds only; teapot 6 g per 30 cl at 80 °C, 7 minutes; gong fu in successive infusions of 30–40 seconds; this lot is from Yunnan, not Fujian."
        },
        {
          "title": "Thé blanc",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/thes/the-blanc/",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "White teas at 70–80 °C, 2 g per cup, 5–10 minutes; low-mineral water; in a gaiwan, several infusions; Yin Zhen is from Fujian, buds only."
        },
        {
          "title": "Yin Zhen Silverneedle",
          "author": "Thés & Traditions",
          "url": "https://www.thes-traditions.com/en/rare-tea/yin-zhen-silverneedle",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "From Fuding; 12–15 g per litre, 70–80 °C, low-mineral water; first steep 1.5–2 minutes, each later one a little longer; a gaiwan, glass or porcelain pot."
        },
        {
          "title": "Bai Hao Yin Zhen brewing guide",
          "author": "TeaSpring",
          "url": "https://www.teaspring.com/Bai-Hao-Yin-Zhen.asp?section=brew",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "2 g per 150 ml at 85–90 °C; warm the cup and pot first; the first and second infusions 1 minute, later ones longer."
        },
        {
          "title": "What is Silver Needle White Tea?",
          "author": "Oriarm",
          "url": "https://www.oriarm.com/blog/post/silver-needle-tea-famous-white-tea",
          "lang": "en",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "3 g in 150 ml at about 85 °C, in a porcelain gaiwan; infusions of 45, 60, 90, 105, 140 and 180 seconds."
        },
        {
          "title": "Enjoy making a bowl of tea!",
          "author": "Marukyu Koyamaen (Uji)",
          "url": "https://www.marukyu-koyamaen.co.jp/leaflet/enjoy_making_en.pdf",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Water that has boiled, poured into a cup once, comes to 75–85 °C: the way to 80 °C without a thermometer."
        },
        {
          "title": "About Silver Needle",
          "author": "Seven Cups (Tucson)",
          "url": "https://sevencups.com/learn-about-tea/famous-chinese-tea/about-silver-needle/",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Only Fuding and Zhenghe make it, from buds only; Fuding claims it was invented in 1796; forgiving to brew."
        },
        {
          "title": "Technical specifications for registration of GI: Fuding Bai Cha",
          "author": "People's Government of Fuding City (EU GI register)",
          "url": "https://ec.europa.eu/geographical-indications-register/eambrosia-public-api/api/v1/attachments/65621",
          "lang": "en",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "Protected in China on 4 May 2009; native to Taimu Mountain; silver needle from the Fuding Dabai, Fuding Dahao and Gele cultivars, by withering and drying only."
        },
        {
          "title": "福鼎白茶制作技艺 (The craft of Fuding white tea)",
          "author": "China Intangible Cultural Heritage Network, from China Arts News, 6 January 2023",
          "url": "https://www.ihchina.cn/project_details/26422.html",
          "lang": "zh",
          "primary": true,
          "supports": [
            "story"
          ],
          "note": "On the national heritage list since 2011; Qing-dynasty growers bred Fuding Dabai and Dahao; silver needle is their plump buds, naturally withered, never fried or rolled."
        },
        {
          "title": "閩小記 (Min Xiao Ji)",
          "author": "Zhou Lianggong, on Wikisource",
          "url": "https://zh.wikisource.org/wiki/%E9%96%A9%E5%B0%8F%E8%A8%98",
          "lang": "zh",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Qing-era notes on Fujian; a poem praises Taimu's green snow buds; no date for silver needle."
        },
        {
          "title": "福鼎白茶主要品质成分冷泡浸出规律研究 (Cold-brew extraction of Fuding white tea)",
          "author": "Song Dongxiao, China Tea Processing 2025(3)",
          "url": "https://www.sciopen.com/local/article_pdf/10.15905/j.zgcyjg.2095-0306.2025.03.07.pdf",
          "lang": "zh",
          "primary": false,
          "supports": [
            "parameters"
          ],
          "note": "In a 5-minute boiling brew, silver needle gave 1.49% caffeine against white peony's 2.31%: whole buds extract more slowly."
        }
      ],
      "ingredients": [
        {
          "id": "silver-needle",
          "qty": 3,
          "unit": "g",
          "optional": false,
          "role": "base"
        }
      ],
      "gear": [
        {
          "id": "gaiwan",
          "optional": false
        },
        {
          "id": "thermometer",
          "optional": true
        }
      ],
      "brew": {
        "water": "soft-bottled",
        "tempC": 80,
        "tempRange": {
          "min": 70,
          "max": 90
        },
        "ratioGPer100ml": 2,
        "waterMl": 150,
        "vessel": "gaiwan",
        "preheat": true,
        "infusionsS": [
          45,
          60,
          90,
          105,
          140,
          180
        ]
      },
      "steps": [
        {
          "text": "Heat soft water to 80 °C: without a thermometer, bring it to the boil and pour it once into a jug. Warm the gaiwan and a cup with hot water, then pour it away.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Put the buds in the warm gaiwan. A 150 ml gaiwan takes 3 g; for another size keep the same strength, 2 g per 100 ml.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "For each infusion, fill the gaiwan with water at 80 °C (boiled, then poured once into the jug) and put the lid on. When the time is up, pour all of it into the cup, draining the gaiwan, and share it out. Stop when the taste fades.",
          "infusions": true,
          "stage": "day"
        }
      ]
    },
    {
      "code": "025",
      "slug": "teh-tarik",
      "name": "Teh tarik",
      "mode": "experimental",
      "family": "household",
      "trust": "documented",
      "sourceType": "tea-house",
      "origin": "Malaysia",
      "story": "Teh tarik is Malay for \"pulled tea\": strong tea and condensed milk poured from one vessel to another, the pouring hand raised high, to mix, cool and froth it. Its roots lie with the Indian Muslim immigrants who ran food stalls in Malaya, forebears of today's mamak stalls. The popular account, told as tradition, has post-war vendors using cheap tea dust, softened with condensed milk; Singapore claims the drink too. In 2024 UNESCO named it the drink of Malaysia's breakfast culture.",
      "difficulty": 2,
      "seasons": [],
      "flavours": [
        "sweet",
        "creamy",
        "strong"
      ],
      "caffeine": "high",
      "scaling": {
        "kind": "per-cup",
        "serves": 1
      },
      "prep": "none",
      "guides": [],
      "retired": false,
      "sources": [
        {
          "title": "Celebrate Merdeka with the perfect cup of teh tarik",
          "author": "BOH Plantations",
          "url": "https://bohtea.com/?p=26717",
          "lang": "en",
          "primary": true,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "For 4–5: about 30 g of strong black tea in 1000 ml of freshly boiled water, about 10 minutes, strained; per 200 ml cup, 3 tablespoons of evaporated milk and 2 of condensed milk; poured between two cups over the sink, 3 times or until frothy."
        },
        {
          "title": "Teh tarik: Malaysia's iconic art of 'pulled tea'",
          "author": "Kanyakumari Damodaran, Arab News, Kuala Lumpur, 31 January 2025",
          "url": "https://www.arabnews.pk/node/2588529",
          "lang": "en",
          "primary": true,
          "supports": [
            "story",
            "recipe"
          ],
          "note": "From the Mamak community, descendants of Indian Muslims; tea master Senthil Kumar alternates short and long pulls; too much condensed milk makes it too dense to froth."
        },
        {
          "title": "From tea hills to mamak stalls: Malaysia's story in every cup",
          "author": "Joseph Tek Choon Yee, The Star (Malaysia), 9 November 2026",
          "url": "https://www.thestar.com.my/business/insight/2026/11/09/from-tea-hills-to-mamak-stalls-malaysias-story-in-every-cup",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Roots with Indian Muslim immigrants who ran food stalls in Malaya; pouring between two vessels blends, cools and froths it."
        },
        {
          "title": "Breakfast culture in Malaysia: dining experience in a multi-ethnic society",
          "author": "UNESCO Intangible Cultural Heritage",
          "url": "https://ich.unesco.org/en/RL/breakfast-culture-in-malaysia-dining-experience-in-a-multi-ethnic-society-02113",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Inscribed in 2024; names teh tarik as the drink, beside nasi lemak and roti canai."
        },
        {
          "title": "Teh Tarik",
          "author": "Grace Teo, Nyonya Cooking",
          "url": "https://www.nyonyacooking.com/recipes/teh-tarik~BJSmOwiDMqZ7",
          "lang": "en",
          "primary": false,
          "supports": [
            "recipe",
            "parameters"
          ],
          "note": "3 teaspoons of Ceylon tea in 250 ml, 3 minutes; condensed milk; no more than 5 transfers or it goes cold; outside Malaysia, use Ceylon tea."
        },
        {
          "title": "Teh tarik",
          "author": "TheSmartLocal Malaysia, 3 March 2025",
          "url": "https://thesmartlocal.my/teh-tarik/",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Widely believed to date from just after the Second World War: stalls used cheap tea dust, with condensed milk to soften the bitterness."
        },
        {
          "title": "Teh tarik",
          "author": "Wikipedia",
          "url": "https://en.wikipedia.org/wiki/Teh_tarik",
          "lang": "en",
          "primary": false,
          "supports": [
            "story"
          ],
          "note": "Tea dust and condensed milk after the war; Singapore also claims it."
        }
      ],
      "ingredients": [
        {
          "id": "ceylon-black",
          "qty": 5,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "sweetened-condensed-milk",
          "qty": 40,
          "unit": "g",
          "optional": false,
          "role": "base"
        },
        {
          "id": "evaporated-milk",
          "qty": 45,
          "unit": "ml",
          "optional": true,
          "role": "accent"
        }
      ],
      "gear": [],
      "brew": {
        "water": "tap",
        "tempC": 100,
        "ratioGPer100ml": 2.8,
        "waterMl": 180,
        "vessel": "mug",
        "preheat": false,
        "infusionsS": [
          600
        ]
      },
      "steps": [
        {
          "text": "Steep the tea in 180 ml of just-boiled water, covered, until it is a deep red: BOH's long steep, made to stand up to the milk.",
          "infusions": true,
          "stage": "day"
        },
        {
          "text": "Put the condensed milk, and the evaporated milk if you use it, in a mug. Strain the tea onto it and stir.",
          "infusions": false,
          "stage": "day"
        },
        {
          "text": "Over the sink, pour it into a second, larger mug, raising the pouring hand as you go, then back again. Do it 3 to 5 times, mixing short and long pulls, until it froths: more and it goes cold. Drink it at once.",
          "infusions": false,
          "stage": "day"
        }
      ]
    }
  ],
  "ingredients": [
    {
      "id": "assam",
      "name": "Assam black tea",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "Airtight, away from light and smells.",
      "quality": "A strong Assam that takes milk. CTC (the small granules Indian chai is made with) is best for chai; a broken or whole leaf works too.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Assam Jungle, organic, full-bodied, good with milk.",
          "price": "€9.70 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/assam-jungle-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Assam supérieur GFOP, whole leaf; takes milk.",
          "price": "€9.10 / 100 g",
          "url": "https://www.dammann.fr/fr/assam-superieur-gfop.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "baking-soda",
      "name": "Baking soda",
      "category": "other",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 1095,
      "storage": "Closed, away from light, heat and damp.",
      "quality": "Food-grade sodium bicarbonate (bicarbonate alimentaire), from the baking aisle, not the cleaning kind.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Vahiné baking soda, food grade.",
          "price": "€1.90 / 250 g",
          "url": "https://courses.monoprix.fr/products/vahin%C3%A9-bicarbonate-de-soude-250g/MPX_3908204",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Food-grade baking soda in a resealable bag.",
          "price": "€2.15 / 400 g",
          "url": "https://www.auchan.fr/auchan-bicarbonate-alimentaire/pr-C1230355",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "black-peppercorns",
      "name": "Black peppercorns",
      "category": "spice",
      "unit": "pieces",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "Whole, in an airtight jar.",
      "quality": "Whole black peppercorns.",
      "shops": [
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Black peppercorns.",
          "price": "€2.58 / 100 g",
          "url": "https://www.auchan.fr/auchan-grains-de-poivre-noir/pr-C1228063",
          "checked": "2026-11-21"
        },
        {
          "shop": "bahadourian-lyon",
          "why": "Whole black pepper from Madagascar.",
          "price": "€4.95 / 100 g",
          "url": "https://www.bahadourian.com/poivres/poivre-noir-entier-de-madagascar-4119.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "ceylon-black",
      "name": "Ceylon black tea",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Airtight, away from light and smells.",
      "quality": "A strong Sri Lankan black tea in broken grades (BOP, BOPF), which brew dark and fast. Hong Kong's milk-tea blends mix coarse, medium and fine grades.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Ceylan Breakfast, organic, a strong Sri Lankan black tea.",
          "price": "€10.00 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/ceylan-breakfast-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Highgrown SOFA, FBOP1, a broken grade from Uva; check it is in stock.",
          "price": "€7.60 / 100 g",
          "url": "https://www.jardinsdegaia.com/en/black-tea/121-249-highgrown-sofa.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Ceylan O.P. Kenilworth: whole leaf, so slower to colour; for when the others are out.",
          "price": "€6.60 / 100 g",
          "url": "https://www.dammann.fr/fr/ceylan-op-kenilworth.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "cinnamon-stick",
      "name": "Cinnamon sticks",
      "category": "spice",
      "unit": "pieces",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "In an airtight jar.",
      "quality": "Short sticks of Ceylon cinnamon or cassia: chai takes either.",
      "shops": [
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Cinnamon sticks.",
          "price": "€2.75 / 10 g",
          "url": "https://www.auchan.fr/ducros-cannelle-en-batons/pr-C1240909",
          "checked": "2026-11-21"
        },
        {
          "shop": "bahadourian-lyon",
          "why": "Short quills, about 6 cm, from Indonesia (probably cassia).",
          "price": "€4.50 / 100 g",
          "url": "https://www.bahadourian.com/racines-gousses-ou-batons-de-3a-cannelle-vanille/cannelle-tuyaux-courts-116.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "cloves",
      "name": "Whole cloves",
      "category": "spice",
      "unit": "pieces",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "In an airtight jar.",
      "quality": "Whole cloves with their heads on.",
      "shops": [
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Whole cloves.",
          "price": "€1.17 / 23 g",
          "url": "https://www.auchan.fr/auchan-clous-de-girofle/pr-C1688408",
          "checked": "2026-11-21"
        },
        {
          "shop": "bahadourian-lyon",
          "why": "Whole cloves from Madagascar.",
          "price": "€4.50 / 100 g",
          "url": "https://www.bahadourian.com/racines-gousses-ou-batons-de-3a-cannelle-vanille/clous-de-girofle-entiers-3651.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "darjeeling-first-flush",
      "name": "First-flush Darjeeling",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "An opaque airtight tin in a cool, dark place, away from strong smells. Best in the months after its harvest.",
      "quality": "This year's first flush (the spring picking) from a named estate, grade FTGFOP1 or finer, with its harvest date on the pack.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Singbulli DJ 4, a 2026 first flush (\"primeur\").",
          "price": "€38.00 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/singbulli-dj-4.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Phuguri FTGFOP, 2026 first flush picked on 29–30 March.",
          "price": "€38 / 100 g",
          "url": "https://www.dammann.fr/en/tea-from-india-darjeeling-1st-flush-phuguri-ftgfop-2026.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Golden Spring FTGFOP1, 2026 first flush.",
          "price": "€21.70 / 60 g",
          "url": "https://www.jardinsdegaia.com/en/black-teas/1069-1407-golden-spring-ftgfop1-ff.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "dried-lemon-peel",
      "name": "Dried lemon peel",
      "category": "citrus",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Airtight, dry and dark; it keeps a long time, but its scent fades.",
      "quality": "Dried lemon peel, cut, with nothing added: not candied.",
      "shops": [
        {
          "shop": "ile-aux-epices",
          "why": "Dried lemon peel from Spain, no additives.",
          "price": "€2.90 / 50 g",
          "url": "https://ileauxepices.com/fruits-secs/397-ecorce-citron.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "soin-et-nature",
          "why": "Lemon peel, cut, from an herbalist's range.",
          "price": "€11.92 / 100 g",
          "url": "https://www.soin-et-nature.com/fr/5334-citron-ecorce-coupee-iphym-herboristerie-citrus-limonium.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "dried-orange-peel",
      "name": "Dried orange peel",
      "category": "citrus",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Airtight, dry and dark; it keeps a long time, but its scent fades.",
      "quality": "Dried sweet-orange peel, cut, with nothing added: not candied or semi-candied.",
      "shops": [
        {
          "shop": "ile-aux-epices",
          "why": "Dried orange peel from Spain, 100% peel.",
          "price": "€2.15 / 50 g",
          "url": "https://ileauxepices.com/fruits-secs/395-ecorce-orange.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "soin-et-nature",
          "why": "Sweet orange peel, cut, from an herbalist's range.",
          "price": "€10.40 / 100 g",
          "url": "https://www.soin-et-nature.com/fr/5203-oranger-doux-ecorce-coupee-iphym-herboristerie-citrus-aurantium-var-dulcis.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "earl-grey",
      "name": "Earl Grey tea",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "An opaque airtight tin, apart from other teas: its scent carries to them.",
      "quality": "Black tea scented with bergamot, the citrus grown mostly in Calabria.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Thé des Lords: black tea from India and Africa with bergamot.",
          "price": "€11.20 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/the-des-lords-471.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Organic black tea with bergamot essential oil.",
          "price": "€9.10 / 100 g",
          "url": "https://www.jardinsdegaia.com/en/black-tea/173-358-earl-grey.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "evaporated-milk",
      "name": "Evaporated milk, unsweetened",
      "category": "dairy",
      "unit": "ml",
      "perishable": false,
      "shelfLifeDays": 3,
      "storage": "Unopened, in the cupboard: set its opened date only when you open a tin. Once opened, in a closed container in the fridge for 3 days, or frozen.",
      "quality": "Unsweetened evaporated milk (lait concentré non sucré), whole if you can find it; never sweetened condensed milk.",
      "shops": [
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Régilait whole unsweetened evaporated milk.",
          "price": "€2.25 / 410 g",
          "url": "https://www.auchan.fr/regilait-lait-concentre-non-sucre-entier/pr-C1265830",
          "checked": "2026-11-21"
        },
        {
          "shop": "monoprix-lyon-republique",
          "why": "Régilait unsweetened evaporated milk, semi-skimmed.",
          "price": "€1.65 / 410 g",
          "url": "https://courses.monoprix.fr/products/r%C3%A9gilait-lait-concentr%C3%A9-non-sucr%C3%A9-demi-%C3%A9cr%C3%A9m%C3%A9-410g/MPX_3280989",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "fresh-bergamot",
      "name": "Fresh bergamot (in strips of zest)",
      "category": "citrus",
      "unit": "pieces",
      "perishable": true,
      "shelfLifeDays": 14,
      "storage": "Whole, in the fridge: 2–3 weeks. Peel the strips on the day, or the evening before for the office, in a closed box in the fridge.",
      "quality": "Citrus bergamia, the Calabrian fruit, organic or untreated since the peel goes in the tea; not the herb bee balm, also called bergamot. Counted in strips of zest about 1.5 × 5 cm: half a fruit gives about 4. In season from late November, and sold fresh in France mostly until the end of December.",
      "shops": [
        {
          "shop": "jurassic-fruit",
          "why": "Organic bergamots from Italy, about 5–7 fruits to 500 g; delivered from 2 December.",
          "price": "€4.90 / 500 g",
          "url": "https://www.jurassicfruit.com/fr/products/bergamote",
          "checked": "2026-11-21"
        },
        {
          "shop": "artigiano-in-fiera",
          "why": "La Spina Santa's organic Calabrian bergamots, in season November to February; unavailable when checked.",
          "price": "€15.21 / 5 kg",
          "url": "https://artigianoinfiera.fr/artigiani/52824-LA-SPINA-SANTA-SRL/prodotti/66381-Bergamote-fruits-frais-de-Calabre-paquet-de-5kg",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "fresh-ginger",
      "name": "Fresh ginger",
      "category": "spice",
      "unit": "g",
      "perishable": true,
      "shelfLifeDays": 21,
      "storage": "Unpeeled, in the fridge.",
      "quality": "A firm root with smooth, tight skin.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Fresh ginger root.",
          "price": "€2.20 / 200 g",
          "url": "https://courses.monoprix.fr/products/natoora-gingembre-200g/MPX_6574794",
          "checked": "2026-11-21"
        },
        {
          "shop": "monoprix-lyon-guillotiere",
          "why": "The same chain in La Guillotière; no other shop showed fresh ginger online.",
          "price": "€2.99 / 250 g",
          "url": "https://courses.monoprix.fr/products/gingembre-barquette-250g/MPX_6854648",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "fresh-spearmint",
      "name": "Fresh spearmint (sprigs)",
      "category": "herb",
      "unit": "pieces",
      "perishable": true,
      "shelfLifeDays": 7,
      "storage": "In a glass of water, or wrapped in plastic, in the fridge: up to a week.",
      "quality": "Nanah spearmint (menthe verte) if you can find it: firm stems and plenty of bright green leaves.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Fresh mint; not labelled spearmint or nanah.",
          "price": "€1.29 / 40 g",
          "url": "https://courses.monoprix.fr/products/natoora-menthe-fraiche-40g/MPX_4124216",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Spearmint (menthe verte), a small pack.",
          "price": "€1.95 / 11 g",
          "url": "https://www.auchan.fr/les-crudettes-menthe-verte/pr-C1567822",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "genmaicha",
      "name": "Genmaicha",
      "category": "tea",
      "unit": "g",
      "teaType": "green",
      "plainBrew": {
        "tempC": 100,
        "tempRange": {
          "min": 80,
          "max": 100
        },
        "ratioGPer100ml": 2.4,
        "waterMl": 250,
        "infusionsS": [
          30
        ],
        "office": {
          "tempC": 100,
          "method": "Set the kettle to 100 °C: the time runs from the start of the pour.",
          "infusionsS": [
            30
          ]
        },
        "notes": "6 g a cup, as in #014; Hibiki-an's 80 °C for a minute is the cooler outlier.",
        "sources": [
          {
            "title": "The proper way to brew Nihoncha",
            "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
            "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-7.pdf",
            "lang": "en",
            "primary": true,
            "supports": [
              "parameters"
            ],
            "note": "Bancha (genmaicha, houjicha): 2–3 g per 100 ml, boiling water, about 30 seconds."
          },
          {
            "title": "Basic Bancha (Hojicha, Genmaicha, etc.)",
            "author": "Ippodo Tea",
            "url": "https://global.ippodo-tea.co.jp/blogs/tea-recipe/basic-bancha-hojicha-genmaicha",
            "lang": "en",
            "primary": true,
            "supports": [
              "parameters"
            ],
            "note": "100 °C, boiling vigorously; serve 30 seconds after you start pouring."
          },
          {
            "title": "Brewing – Genmaicha",
            "author": "Hibiki-an (Ujitawara, Kyoto)",
            "url": "https://www.hibiki-an.com/contents.php/cnID/34",
            "lang": "en",
            "primary": false,
            "supports": [
              "parameters"
            ],
            "note": "7–8 g in 200 ml at 80 °C for 1 minute: the cooler outlier."
          }
        ]
      },
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "Airtight, cool and dark; once opened, use it soon, and keep it out of the fridge.",
      "quality": "Loose Japanese sencha or bancha with roasted rice, often half and half; golden-roasted rice gives more aroma than popped. Plain, not the matcha-dusted kind.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Genmaicha Yama, organic; the 100 g pouch is one of the page's options.",
          "price": "€12.90 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/genmaicha-yama-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Japanese green tea with roasted and puffed rice.",
          "price": "€16.00 / 100 g",
          "url": "https://www.dammann.fr/fr/the-du-japon-genmaicha.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Organic genmaicha from Kirishima, Kagoshima.",
          "price": "€17.40 / 100 g",
          "url": "https://www.jardinsdegaia.com/en/green-tea/139-genmaicha.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "green-cardamom",
      "name": "Green cardamom (pods)",
      "category": "spice",
      "unit": "pieces",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Whole, in an airtight jar; crush them just before use.",
      "quality": "Whole green pods, plump and green rather than pale.",
      "shops": [
        {
          "shop": "bahadourian-lyon",
          "why": "Whole green cardamom from Guatemala.",
          "price": "€7.95 / 50 g",
          "url": "https://www.bahadourian.com/racines-gousses-ou-batons-de-3a-cannelle-vanille/cardamome-verte-entiere-2485.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "ile-aux-epices",
          "why": "Green cardamom by the bag; check you are getting whole pods.",
          "price": "from €5.30 (bags of 50 to 250 g)",
          "url": "https://ileauxepices.com/epices/16-cardamome.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "gunpowder-green",
      "name": "Gunpowder green tea",
      "category": "tea",
      "unit": "g",
      "teaType": "green",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "In its tin or an opaque airtight box, away from light, damp and smells.",
      "quality": "Chinese gunpowder, ideally grade 3505, China's top export grade: round, tight, heavy, even pellets, with no stems or broken bits.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Organic Chinese gunpowder, loose.",
          "price": "€8.30 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/gunpowder-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Organic gunpowder from a Hubei cooperative.",
          "price": "€7.95 / 100 g",
          "url": "https://www.jardinsdegaia.com/en/green-tea/73-146-gunpowder.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "high-mountain-oolong",
      "name": "High-mountain oolong (gaoshan)",
      "category": "tea",
      "unit": "g",
      "teaType": "oolong",
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "Airtight with the air squeezed out, at 10–25 °C, not in the fridge.",
      "quality": "Taiwanese oolong grown above 1,000 m (Alishan, Lishan, Shan Lin Xi), rolled into balls and lightly oxidised, with its harvest and elevation stated.",
      "shops": [
        {
          "shop": "dammann-freres-lyon",
          "why": "High Mountain Jin Xuan, from Taiwan's Guantou mountains.",
          "price": "€47.20 / 100 g",
          "url": "https://www.dammann.fr/fr/high-mountain-jin-xuan.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "palais-des-thes-lyon",
          "why": "Jin Xuan from Nantou, Taiwan: a rolled Taiwanese oolong, though not sold as high-mountain.",
          "price": "€46.00 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/jin-xuan-100332.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "hojicha",
      "name": "Hojicha",
      "category": "tea",
      "unit": "g",
      "teaType": "green",
      "plainBrew": {
        "tempC": 100,
        "ratioGPer100ml": 2.4,
        "waterMl": 250,
        "infusionsS": [
          30
        ],
        "office": {
          "tempC": 100,
          "method": "Set the kettle to 100 °C: the time runs from the start of the pour.",
          "infusionsS": [
            30
          ]
        },
        "notes": "6 g a cup, as in #015.",
        "sources": [
          {
            "title": "The proper way to brew Nihoncha",
            "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
            "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-7.pdf",
            "lang": "en",
            "primary": true,
            "supports": [
              "parameters"
            ],
            "note": "Bancha (genmaicha, houjicha): 2–3 g per 100 ml, boiling water, about 30 seconds."
          },
          {
            "title": "Basic Bancha (Hojicha, Genmaicha, etc.)",
            "author": "Ippodo Tea",
            "url": "https://global.ippodo-tea.co.jp/blogs/tea-recipe/basic-bancha-hojicha-genmaicha",
            "lang": "en",
            "primary": true,
            "supports": [
              "parameters"
            ],
            "note": "100 °C, boiling vigorously; serve 30 seconds after you start pouring."
          },
          {
            "title": "Hojicha (how to brew)",
            "author": "World Green Tea Association (O-CHA NET, Shizuoka)",
            "url": "https://www.o-cha.net/english/culture/Japanesetea-hojicha.html",
            "lang": "en",
            "primary": true,
            "supports": [
              "parameters"
            ],
            "note": "3 g and about 130 ml per person, boiling water, about 30 seconds."
          }
        ]
      },
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "Airtight, cool and dark; once opened, use it soon, and keep it out of the fridge.",
      "quality": "Roasted Japanese bancha or sencha, brown rather than green: leaves, or stems only (kuki hojicha, Kaga bōcha). It is bulky: 12 g is about 5 tablespoons.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Bancha Hojicha, organic, roasted Japanese green tea.",
          "price": "€12.00 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/bancha-hojicha-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Houjicha, roasted, made from bancha.",
          "price": "€16.30 / 100 g",
          "url": "https://www.dammann.fr/fr/the-du-japon-houjicha.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Organic hojicha from Kirishima, Kagoshima.",
          "price": "€18.25 / 100 g",
          "url": "https://www.jardinsdegaia.com/en/green-tea/140-hojicha.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "honey",
      "name": "Honey",
      "category": "sweetener",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 3650,
      "storage": "Closed, at room temperature, away from sun and heat; not in the fridge, where it crystallises faster. Crystals aren't spoilage: warm the jar in water.",
      "quality": "A mild liquid flower honey, which stirs easily into a mug, with its country of harvest stated.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Famille Vacher flower honey from France.",
          "price": "€6.19 / 375 g",
          "url": "https://courses.monoprix.fr/products/famille-vacher-miel-de-fleurs-de-france-375g/MPX_5560109",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Liquid flower honey in a squeeze bottle, a blend from the Americas and Europe.",
          "price": "€4.13 / 500 g",
          "url": "https://www.auchan.fr/auchan-miel-de-fleurs-liquide-equilibre-et-fleuri-en-flacon-doseur/pr-C1262889",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "jam",
      "name": "Cherry or raspberry jam",
      "category": "sweetener",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 30,
      "storage": "In the fridge once opened.",
      "quality": "Cherry (griotte) or raspberry jam, or Russian varenye from an Eastern European grocer.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Morello cherry jam (confiture extra de cerises griottes).",
          "price": "€2.25 / 370 g",
          "url": "https://courses.monoprix.fr/products/monoprix-confiture-extra-de-cerises-griottes-370g/MPX_2549207",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Bonne Maman morello cherry jam.",
          "price": "€3.95 / 370 g",
          "url": "https://www.auchan.fr/bonne-maman-confiture-de-cerises-griottes/pr-C1274475",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "keemun",
      "name": "Keemun black tea",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Airtight, away from light and smells.",
      "quality": "Qimen gongfu black tea from Qimen County, Anhui: thin, tight, dark whole-leaf strands (Hao Ya, Mao Feng or F.O.P. grades). Avoid Keemun-style teas grown elsewhere, such as Hubei.",
      "shops": [
        {
          "shop": "dammann-freres-lyon",
          "why": "Grand Keemun F.O.P., China, a superior grade.",
          "price": "€11.70 / 100 g",
          "url": "https://www.dammann.fr/fr/grand-keemun-fop.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "teaspring",
          "why": "Keemun Hao Ya A from Qimen County, spring 2026, a top grade.",
          "price": "$10.50 / 25 g",
          "url": "https://www.teaspring.com/Keemun-Hao-Ya-A.asp",
          "checked": "2026-11-21"
        },
        {
          "shop": "ile-aux-epices",
          "why": "Keemun from China, the cheapest; the page doesn't name Qimen.",
          "price": "€6.50 / 100 g",
          "url": "https://ileauxepices.com/thes-noirs/157-the-noir-keemun.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "lavender",
      "name": "Dried culinary lavender",
      "category": "flower",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "Airtight, cool, dark and dry: the buds keep a strong scent for 2–3 years.",
      "quality": "True lavender, Lavandula angustifolia, whole dried buds sold for food or infusion; not ornamental lavender, and not lavandin.",
      "shops": [
        {
          "shop": "greenweez",
          "why": "Aromandise organic lavender flowers for eating, Lavandula angustifolia, sold for cooking and tea.",
          "price": "€4.90 / 40 g",
          "url": "https://www.greenweez.com/produit/fleurs-a-croquer-fleurs-de-lavande-40g/3FLOR0089",
          "checked": "2026-11-21"
        },
        {
          "shop": "soin-et-nature",
          "why": "Lavandula angustifolia flowers for infusion, from an herbalist's range.",
          "price": "€15.69 / 100 g",
          "url": "https://www.soin-et-nature.com/fr/540-lavande-fleur-paquet-de-250-g.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "lemon",
      "name": "Lemon (in slices)",
      "category": "citrus",
      "unit": "pieces",
      "perishable": true,
      "shelfLifeDays": 14,
      "storage": "Whole, in the fridge. Slice it on the day, or the evening before for the office, in a closed box.",
      "quality": "Counted in thin slices: a lemon gives about 8. Unwaxed (non traité après récolte) is best, since the slice goes in the cup; otherwise scrub it in hot water.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Seedless lemons; the page lists post-harvest treatments, so scrub them.",
          "price": "€3.49 / 500 g",
          "url": "https://courses.monoprix.fr/products/citron-jaune-sans-p%C3%A9pin-cat%C3%A9gorie-1-calibre-4-5-500g/MPX_3858876",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Lemons from Spain; treatment not stated.",
          "price": "€1.49 / 500 g",
          "url": "https://www.auchan.fr/citrons-jaunes/pr-C1350760",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "matcha",
      "name": "Matcha",
      "category": "tea",
      "unit": "g",
      "teaType": "green",
      "plain": false,
      "perishable": false,
      "shelfLifeDays": 45,
      "storage": "In its tin, closed, in the fridge once opened; let it come to room temperature before opening, or it takes in damp. Use it within about 45 days.",
      "quality": "Japanese matcha sold for drinking (ceremonial, or for usucha), bright green, in a small tin; not the culinary or baking grade.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Matcha Kokoro, organic, ceremonial grade, Kagoshima and Shizuoka; in the fridge once opened, within 45 days.",
          "price": "€36.00 / 30 g",
          "url": "https://www.palaisdesthes.com/fr/matcha-kokoro-30g.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Matcha Ashikubo, Shizuoka, kept cold in its tin. The page gives no size, but its price per kilo means 20 g.",
          "price": "€22.00 / 20 g",
          "url": "https://www.dammann.fr/fr/the-du-japon-matcha-ashikubo.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Matcha Tradition, organic, sold for drinking whisked.",
          "price": "€23.40 / 30 g",
          "url": "https://www.jardinsdegaia.com/en/matcha/475-matcha-tradition.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "pistachios",
      "name": "Shelled pistachios",
      "category": "other",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 180,
      "storage": "Airtight, cool and dark: their oil turns rancid in the warmth.",
      "quality": "Shelled, unsalted and unroasted, green inside. Crush them roughly just before you use them.",
      "shops": [
        {
          "shop": "bahadourian-lyon",
          "why": "Shelled pistachios from Iran or the USA, nothing added.",
          "price": "€11.90 / 200 g",
          "url": "https://www.bahadourian.com/les-fruits-secs-dacortiquas/pistaches-dacortiquaes-1368.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "monoprix-lyon-republique",
          "why": "Monoprix shelled pistachios, unroasted, nothing added.",
          "price": "€6.60 / 125 g",
          "url": "https://courses.monoprix.fr/products/monoprix-pistaches-d%C3%A9cortiqu%C3%A9es-non-grill%C3%A9es-125g/MPX_6618271",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "pu-erh",
      "name": "Pu-erh (dark tea)",
      "category": "tea",
      "unit": "g",
      "teaType": "dark",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "Dry and away from smells: damp ruins it.",
      "quality": "A ripe pu-erh, loose or a brick. The Tibetan tradition is brick tea from Ya'an, in Sichuan, when you can find it.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Pu Erh Impérial, a dark tea, loose.",
          "price": "€14.50 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/pu-erh-imperial-174.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Pu'er Harmonie, a brick from 2008: break pieces off it as Tibetans do.",
          "price": "€17.11 / 100 g brick",
          "url": "https://www.jardinsdegaia.com/en/dark-teas/537-pu-er-harmonie-brick.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "teaspring",
          "why": "Chun Jian Zang, Tibetan brick tea from Ya'an: the traditional one. Priced in US dollars, shipped from abroad.",
          "price": "$20.10 / 70 g brick",
          "url": "https://www.teaspring.com/70g-Chun-Jian-Zang.asp",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "rize-black-tea",
      "name": "Turkish black tea (Rize)",
      "category": "tea",
      "unit": "g",
      "teaType": "black",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Airtight, away from light and smells.",
      "quality": "Loose Turkish black tea from Rize on the Black Sea, such as ÇAYKUR Rize Turist; not tea bags. It is fine-cut and astringent, and a little makes a lot of brew.",
      "shops": [
        {
          "shop": "palamarket",
          "why": "ÇAYKUR Rize Turist; no Lyon shop lists it online.",
          "price": "€3.99 / 500 g",
          "url": "https://www.palamarket.fr/the-de-touriste-caykur-rize-g",
          "checked": "2026-11-21"
        },
        {
          "shop": "epicerie-saint-brieuc",
          "why": "ÇAYKUR Rize Turist; the page's description says 1 kg, its option 500 g.",
          "price": "€4.49 / 500 g",
          "url": "https://epicerie-saintbrieuc.fr/produit/the-caykur/",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "salt",
      "name": "Fine salt",
      "category": "other",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 3650,
      "storage": "Dry, closed.",
      "quality": "Fine sea salt.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Fine sea salt.",
          "price": "€0.59 / 500 g",
          "url": "https://courses.monoprix.fr/products/la-baleine-sel-de-mer-fin-iod%C3%A9-%C3%A9tui-carton-500g/MPX_2008425",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Fine sea salt.",
          "price": "€0.64 / 250 g",
          "url": "https://www.auchan.fr/la-baleine-sel-de-mer-fin-iode/pr-C1240922",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "sencha",
      "name": "Sencha",
      "category": "tea",
      "unit": "g",
      "teaType": "green",
      "perishable": false,
      "shelfLifeDays": 30,
      "storage": "Airtight, cool and dark, away from smells. At room temperature rather than in the fridge, where it takes on damp.",
      "quality": "An everyday futsu-mushi (regular-steamed) Japanese sencha from this year's spring picking. Buy small amounts: it is best within a month of opening.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Organic Japanese sencha, loose.",
          "price": "€10.50 / 100 g",
          "url": "https://www.palaisdesthes.com/fr/sencha-superieur-bio.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Sencha Fukuyu, a summer-harvest Japanese sencha.",
          "price": "€17.40 / 100 g",
          "url": "https://www.dammann.fr/fr/the-du-japon-sencha-fukuyu.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "silver-needle",
      "name": "Silver needle white tea",
      "category": "tea",
      "unit": "g",
      "teaType": "white",
      "perishable": false,
      "shelfLifeDays": 365,
      "storage": "Dry, in a clean airtight tin, away from strong smells.",
      "quality": "Bai Hao Yin Zhen from Fujian, ideally Fuding or Zhenghe: unopened spring buds only, plump and covered in silver-white down, with a harvest year. Not Yunnan's Yin Zhen, a different style.",
      "shops": [
        {
          "shop": "dammann-freres-lyon",
          "why": "Yin Zhen Pointes blanches, Fujian, Bai Hao cultivar.",
          "price": "€59.40 / 100 g",
          "url": "https://www.dammann.fr/fr/the-de-chine-yin-zhen-pointes-blanches.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "teaspring",
          "why": "Bai Hao Yin Zhen from Jianyang, Fujian, spring 2025.",
          "price": "$27.00 / 50 g",
          "url": "https://www.teaspring.com/Bai-Hao-Yin-Zhen.asp",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Organic silver needle from Fujian, 2025; the page shows both Add to cart and Notify me, so check it is in stock.",
          "price": "€34.10 / 50 g",
          "url": "https://www.jardinsdegaia.com/en/white-teas/933-silver-needle.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "star-anise",
      "name": "Star anise",
      "category": "spice",
      "unit": "pieces",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "Airtight, dry and dark: whole stars keep for years.",
      "quality": "Whole, unbroken stars.",
      "shops": [
        {
          "shop": "bahadourian-lyon",
          "why": "Whole star anise from Vietnam.",
          "price": "€5.95 / 100 g",
          "url": "https://www.bahadourian.com/racines-gousses-ou-batons-de-3a-cannelle-vanille/badiane-entiare-anis-etoila-108.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "monoprix-lyon-republique",
          "why": "Ducros star anise from Vietnam; the page doesn't say whole or ground.",
          "price": "€3.29 / 25 g",
          "url": "https://courses.monoprix.fr/products/ducros-badiane-anis-%C3%A9toil%C3%A9-25g/MPX_1805224",
          "checked": "2026-11-21"
        },
        {
          "shop": "ile-aux-epices",
          "why": "Whole star anise from China.",
          "price": "€2.80 / 25 g",
          "url": "https://ileauxepices.com/epices/12-badiane-anis-etoile.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "sugar",
      "name": "White sugar",
      "category": "sweetener",
      "unit": "g",
      "perishable": false,
      "shelfLifeDays": 730,
      "storage": "Dry, in a closed jar.",
      "quality": "White sugar: lumps for Moroccan tea, caster or granulated otherwise.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "White sugar lumps.",
          "price": "€1.89 / 1 kg",
          "url": "https://courses.monoprix.fr/products/monoprix-sucre-en-morceaux-1kg/MPX_6795124",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "White sugar, half lumps.",
          "price": "€2.08 / 1 kg",
          "url": "https://www.auchan.fr/auchan-sucre-blanc-en-demi-morceaux/pr-C1776157",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "sweetened-condensed-milk",
      "name": "Sweetened condensed milk",
      "category": "dairy",
      "unit": "g",
      "perishable": true,
      "shelfLifeDays": 21,
      "storage": "Unopened, in the cupboard: set its opened date only when you open it. Once opened, in the fridge: a tube keeps 3 weeks (Régilait), a can 3 days (Nestlé) to 2 weeks (Auchan), so go by its label.",
      "quality": "Sweetened condensed whole milk (lait concentré sucré), never unsweetened evaporated milk. A tube keeps longest once opened.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Régilait sweetened condensed whole milk, in a tube.",
          "price": "€1.99 / 300 g",
          "url": "https://courses.monoprix.fr/products/r%C3%A9gilait-lait-concentr%C3%A9-sucr%C3%A9-entier-tube-300g/MPX_1118535",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Sweetened condensed whole milk, in a can: 2 weeks in the fridge once opened.",
          "price": "€1.67 / 397 g",
          "url": "https://www.auchan.fr/auchan-lait-concentre-sucre/pr-C1274236",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "unsalted-butter",
      "name": "Unsalted butter",
      "category": "dairy",
      "unit": "g",
      "perishable": true,
      "shelfLifeDays": 30,
      "storage": "In the fridge, wrapped.",
      "quality": "Unsalted (doux) cow's butter. In Tibet it is butter from the dri, the female yak.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Président unsalted butter.",
          "price": "€3.15 / 250 g",
          "url": "https://courses.monoprix.fr/products/pr%C3%A9sident-beurre-gastronomique-doux-82-mg-plaquette-250g/MPX_2638867",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Unsalted butter.",
          "price": "€2.49 / 250 g",
          "url": "https://www.auchan.fr/auchan-beurre-doux-82-5-mg/pr-C1177952",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "vanilla-extract",
      "name": "Vanilla extract",
      "category": "spice",
      "unit": "ml",
      "perishable": false,
      "shelfLifeDays": 90,
      "storage": "Closed; Vahiné's extract goes in the fridge once opened, and is used within 3 months.",
      "quality": "A vanilla extract (extrait), from Bourbon or Madagascar vanilla, not a flavouring (arôme).",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Vahiné organic Bourbon vanilla extract.",
          "price": "€6.95 / 20 ml",
          "url": "https://courses.monoprix.fr/products/vahin%C3%A9-extrait-de-vanille-bourbon-bio-20ml/MPX_4124501",
          "checked": "2026-11-21"
        },
        {
          "shop": "bahadourian-lyon",
          "why": "Ste Lucie liquid vanilla extract, 150 g of pods per kilo.",
          "price": "€5.95 / 20 ml",
          "url": "https://www.bahadourian.com/racines-gousses-ou-batons-de-3a-cannelle-vanille/extrait-de-vanille-liquide-453.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "whole-milk",
      "name": "Whole milk",
      "category": "dairy",
      "unit": "ml",
      "perishable": true,
      "shelfLifeDays": 3,
      "storage": "In the fridge; a few days once opened. For an unopened UHT carton, set its opened date only when you open it.",
      "quality": "Full-fat milk (lait entier), fresh or UHT.",
      "shops": [
        {
          "shop": "monoprix-lyon-republique",
          "why": "Fresh whole milk.",
          "price": "€1.39 / 1 L",
          "url": "https://courses.monoprix.fr/products/monoprix-lait-frais-entier-1l/MPX_6601210",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Whole milk.",
          "price": "€1.10 / 1 L",
          "url": "https://www.auchan.fr/auchan-lait-entier/pr-C1176627",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    }
  ],
  "gear": [
    {
      "id": "blender",
      "name": "Stick blender",
      "quality": "A stick (immersion) blender with a tall beaker, to churn butter tea. Safer with hot tea than a jug blender, whose lid can blow off.",
      "shops": [
        {
          "shop": "boulanger-lyon-cordeliers",
          "why": "Moulinex Quickchef+ DD673810, 1000 W, sold by Boulanger.",
          "price": "€59.99",
          "url": "https://www.boulanger.com/ref/1206428",
          "checked": "2026-11-21"
        },
        {
          "shop": "auchan-lyon-felix-faure",
          "why": "Bosch MSM24500, sold by Auchan, in-store pickup.",
          "price": "€39.99 (Black Friday; €49.99 before)",
          "url": "https://www.auchan.fr/bosch-mixeur-plongeant-msm24500-blanc/pr-C1891492",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "chasen",
      "name": "Chasen (matcha whisk)",
      "quality": "Carved from a single piece of bamboo, 80–120 tines for usucha. Soak the tines in hot water before use; rinse without soap, and dry it tines up or on a holder, as it moulds if left damp. It lasts a year or two; replace it when tines break.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Bamboo chasen, 120 tines.",
          "price": "€26.00",
          "url": "https://www.palaisdesthes.com/fr/fouet-the-matcha.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "One-piece Chinese bamboo chasen, 5.8 × 11 cm.",
          "price": "€30.30",
          "url": "https://www.dammann.fr/fr/chasen-fouet-en-bambou-de-chine.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "Bamboo chasen, 120 tines, 100 mm high.",
          "price": "€13.20",
          "url": "https://www.jardinsdegaia.com/en/matcha-preparation/381-matcha-whisk.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "chawan",
      "name": "Chawan (matcha bowl)",
      "quality": "A wide stoneware bowl, about 11–12 cm across, with room to whisk in; lead-free glaze; washed by hand and dried well. A café au lait bowl will stand in.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Chawan Sensai, handmade Japanese stoneware with a pouring lip, 12.5 cm.",
          "price": "€35.00",
          "url": "https://www.palaisdesthes.com/fr/chawan-sensai-bol-matcha.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "dammann-freres-lyon",
          "why": "Sora, stoneware, 39 cl, 11 × 7 cm.",
          "price": "€32.30",
          "url": "https://www.dammann.fr/fr/sora-bol-a-the-matcha.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "gaiwan",
      "name": "Gaiwan",
      "quality": "Glazed white porcelain, with its lid and saucer, about 150 ml. A 100–170 ml one works too, with the leaves scaled to it: 5 g for 100 ml, 8 g for 170 ml.",
      "shops": [
        {
          "shop": "palais-des-thes-lyon",
          "why": "Blanc de Chine porcelain from Dehua; 100 ml, so take 5 g of leaves.",
          "price": "€28.00",
          "url": "https://www.palaisdesthes.com/fr/le-gaiwan-10cl.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "White Jingdezhen porcelain, 170 ml.",
          "price": "€29.00",
          "url": "https://www.jardinsdegaia.com/en/range-porcelain-china-jingdezhen/346-gaiwan.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "tea-sock",
      "name": "Cotton tea sock",
      "quality": "A white cotton filter bag on a ring, about 9 cm across, that fits over a jug: Hong Kong's \"silk stocking\". Never nylon.",
      "shops": [
        {
          "shop": "dammann-freres-lyon",
          "why": "A 100% cotton sock, 9 cm across, for 4 cups.",
          "price": "€3.00",
          "url": "https://www.dammann.fr/en/filtre-textile-4-tasses.html",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "A reusable 9 cm cotton filter.",
          "price": "€2.50",
          "url": "https://www.jardinsdegaia.com/en/filters-tea-timer-kettle/390-9-cm-cotton-filter.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    },
    {
      "id": "thermometer",
      "name": "Kitchen thermometer",
      "quality": "A probe that reads 0–100 °C. Always optional: every step says how to reach its temperature without one.",
      "shops": [
        {
          "shop": "ikea",
          "why": "FANTAST, a digital probe thermometer and timer.",
          "price": "€9.99",
          "url": "https://www.ikea.com/fr/fr/p/fantast-thermometre-minuteur-numerique-noir-20103016/",
          "checked": "2026-11-21"
        },
        {
          "shop": "jardins-de-gaia",
          "why": "A tea thermometer, −10 to 100 °C.",
          "price": "€15.90",
          "url": "https://www.jardinsdegaia.com/en/filters-tea-timer-kettle/297-plastic-thermometer.html",
          "checked": "2026-11-21"
        }
      ],
      "retired": false
    }
  ],
  "shops": [
    {
      "id": "artigiano-in-fiera",
      "name": "Artigiano in Fiera",
      "kind": "online",
      "url": "https://artigianoinfiera.fr",
      "notes": "A marketplace of Italian producers; seasonal products are often unavailable out of season."
    },
    {
      "id": "auchan-lyon-felix-faure",
      "name": "Auchan Supermarché Lyon Félix Faure",
      "kind": "lyon",
      "url": "https://www.auchan.fr/magasins/supermarche/auchan-supermarche-lyon-felix-faure/s-4982",
      "address": "87 avenue Félix Faure, 69003 Lyon",
      "notes": "Prices as auchan.fr shows them once this store is chosen; Click & Collect."
    },
    {
      "id": "bahadourian-lyon",
      "name": "Bahadourian",
      "kind": "lyon",
      "url": "https://www.bahadourian.com",
      "address": "Halles de Lyon Paul Bocuse, 102 cours Lafayette, 69003 Lyon",
      "notes": "Spices and oriental groceries. Also at 20 rue Villeroy, 69003, and online."
    },
    {
      "id": "boulanger-lyon-cordeliers",
      "name": "Boulanger Lyon Cordeliers",
      "kind": "lyon",
      "url": "https://www.boulanger.com",
      "address": "6 place des Cordeliers, 69002 Lyon",
      "notes": "Kitchen appliances; stock per store not checked."
    },
    {
      "id": "dammann-freres-lyon",
      "name": "Dammann Frères",
      "kind": "lyon",
      "url": "https://www.dammann.fr/fr/",
      "address": "5 rue Confort, 69002 Lyon",
      "notes": "Also at 82 avenue des Frères Lumière, 69008. Online pages offer to reserve for pickup in the shop."
    },
    {
      "id": "epicerie-saint-brieuc",
      "name": "Épicerie Saint-Brieuc",
      "kind": "online",
      "url": "https://epicerie-saintbrieuc.fr",
      "notes": "A Turkish grocery in Saint-Brieuc; ships across Europe by Mondial Relay."
    },
    {
      "id": "greenweez",
      "name": "Greenweez",
      "kind": "online",
      "url": "https://www.greenweez.com",
      "notes": "An organic marketplace; some products are sold by other shops through it."
    },
    {
      "id": "ikea",
      "name": "IKEA",
      "kind": "online",
      "url": "https://www.ikea.com/fr/fr/",
      "notes": "The nearest store is Grand Parilly, in Vénissieux, outside Lyon."
    },
    {
      "id": "ile-aux-epices",
      "name": "L'Île aux Épices",
      "kind": "online",
      "url": "https://ileauxepices.com",
      "notes": "Spices by the bag; ships to mainland France."
    },
    {
      "id": "jardins-de-gaia",
      "name": "Les Jardins de Gaïa",
      "kind": "online",
      "url": "https://www.jardinsdegaia.com/en/",
      "notes": "A French organic tea house; free delivery in France over €50."
    },
    {
      "id": "jurassic-fruit",
      "name": "Jurassic Fruit",
      "kind": "online",
      "url": "https://www.jurassicfruit.com",
      "notes": "Fresh fruit by post; standard delivery in France €9.90."
    },
    {
      "id": "monoprix-lyon-guillotiere",
      "name": "Monoprix Lyon Guillotière",
      "kind": "lyon",
      "url": "https://courses.monoprix.fr",
      "address": "305–307 rue Garibaldi, 69007 Lyon",
      "notes": "Prices as on Monoprix's online shop; in-store stock not checked."
    },
    {
      "id": "monoprix-lyon-republique",
      "name": "Monoprix Lyon République",
      "kind": "lyon",
      "url": "https://courses.monoprix.fr",
      "address": "27 rue de la République, 69002 Lyon",
      "notes": "Prices as on Monoprix's online shop; in-store stock not checked."
    },
    {
      "id": "palais-des-thes-lyon",
      "name": "Le Palais des Thés",
      "kind": "lyon",
      "url": "https://www.palaisdesthes.com/fr/",
      "address": "3 place Saint-Nizier, 69001 Lyon",
      "notes": "Also at Croix-Rousse (69004), La Part-Dieu (69003), avenue Maréchal de Saxe (69006) and avenue des Frères Lumière (69008). The same teas online; the search results show the pack sizes."
    },
    {
      "id": "palamarket",
      "name": "Palamarket",
      "kind": "online",
      "url": "https://www.palamarket.fr",
      "notes": "A Turkish and oriental grocery; its shop is in Andrézieux-Bouthéon, near Saint-Étienne."
    },
    {
      "id": "soin-et-nature",
      "name": "Soin et Nature",
      "kind": "online",
      "url": "https://www.soin-et-nature.com",
      "notes": "An online pharmacy and herbalist (Pharmacie de Mailloles, Perpignan)."
    },
    {
      "id": "teaspring",
      "name": "TeaSpring",
      "kind": "online",
      "url": "https://www.teaspring.com",
      "notes": "Chinese teas, priced in US dollars, shipped worldwide; customs may apply."
    }
  ],
  "teaTypes": [
    {
      "type": "white",
      "name": "White tea",
      "tempC": 80,
      "tempRange": {
        "min": 70,
        "max": 80
      },
      "ratioGPer100ml": 2,
      "waterMl": 250,
      "infusionsS": [
        420
      ],
      "office": {
        "tempC": 80,
        "method": "Set the kettle to 80 °C.",
        "infusionsS": [
          420
        ]
      },
      "notes": "A long Western steep: Palais des Thés gives white teas 5 to 10 minutes.",
      "sources": [
        {
          "title": "Thé blanc",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/thes/the-blanc/",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "White teas at 70–80 °C, 2 g per cup, 5–10 minutes; low-mineral water."
        },
        {
          "title": "Yin Zhen bio (Grand Cru)",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/yin-zhen-2025-fr.html",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "In a teapot, 6 g per 30 cl at 80 °C for 7 minutes."
        },
        {
          "title": "Yin Zhen Silverneedle",
          "author": "Thés & Traditions",
          "url": "https://www.thes-traditions.com/en/rare-tea/yin-zhen-silverneedle",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "12–15 g per litre, 70–80 °C, low-mineral water."
        }
      ]
    },
    {
      "type": "green",
      "name": "Green tea",
      "tempC": 75,
      "tempRange": {
        "min": 70,
        "max": 80
      },
      "ratioGPer100ml": 2,
      "waterMl": 250,
      "infusionsS": [
        120
      ],
      "office": {
        "tempC": 75,
        "method": "Set the kettle to 75 °C.",
        "infusionsS": [
          120
        ]
      },
      "notes": "For a Japanese green. Chinese greens such as gunpowder take hotter water, about 90 °C.",
      "sources": [
        {
          "title": "Quelle est la différence entre le thé vert et le thé noir ?",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/blog/les-couleurs-de-the/quelle-est-la-difference-entre-le-the-vert-et-le-the-noir/",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Green tea: 50 to 75 °C, 2 to 5 min; 3 to 4 g of tea for 20 cl of water."
        },
        {
          "title": "茶の淹れ方マニュアル (How to brew tea)",
          "author": "Ministry of Agriculture, Forestry and Fisheries of Japan (MAFF)",
          "url": "https://www.maff.go.jp/j/seisan/tokusan/cha/attach/pdf/tea_export-4.pdf",
          "lang": "ja",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Sencha 2–3 g per 100 ml, 70 °C high grade and 90 °C mid grade; pan-fired green tea takes somewhat hotter water."
        }
      ]
    },
    {
      "type": "oolong",
      "name": "Oolong",
      "tempC": 95,
      "tempRange": {
        "min": 85,
        "max": 100
      },
      "ratioGPer100ml": 2,
      "waterMl": 250,
      "infusionsS": [
        180,
        240,
        300
      ],
      "office": {
        "tempC": 95,
        "method": "Set the kettle to 95 °C (or 100 °C); refill the mug for each infusion.",
        "infusionsS": [
          180,
          240,
          300
        ]
      },
      "notes": "No rinse is needed for a mug brew.",
      "sources": [
        {
          "title": "La table d'infusion",
          "author": "Cha Yuan (Lyon)",
          "ref": "www.cha-yuan.com/la_table_d_infusion.php (the site answers over http only)",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Chinese and Formosa oolongs: 95 °C, 5 minutes in a teapot; exceptional oolongs 95 °C, 1 minute gongfu."
        },
        {
          "title": "Deep dive into Ali Shan",
          "author": "Jing Tea",
          "url": "https://jingtea.com/journal/deep-dive-into-ali-shan/",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "In a cup: 4 g per 250 ml, 90–95 °C, 3 minutes per infusion."
        },
        {
          "title": "台灣好茶沖沖沖 (Brewing Taiwan's teas)",
          "author": "Ministry of Agriculture, Taiwan, 8 October 2019",
          "url": "https://kmweb.moa.gov.tw/theme_data.php?theme=news&sub_theme=attention&id=50985",
          "lang": "zh",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "The standard method: 3 g in 150 cc of boiling water for about 5–6 minutes; rolled tea needs hotter water to open."
        }
      ]
    },
    {
      "type": "black",
      "name": "Black tea",
      "tempC": 95,
      "tempRange": {
        "min": 90,
        "max": 100
      },
      "ratioGPer100ml": 1.2,
      "waterMl": 250,
      "infusionsS": [
        240
      ],
      "office": {
        "tempC": 95,
        "method": "Set the kettle to 95 °C. Milk, if any, goes in after brewing.",
        "infusionsS": [
          240
        ]
      },
      "sources": [
        {
          "title": "Slow down to perfect tea pace: 7 expert tips for the ultimate brew",
          "author": "Dr Sharon Hall, UK Tea & Infusions Association, 30 May 2025",
          "url": "https://www.tea.co.uk/news/article/slow-down-to-perfect-tea-pace-7-expert-tips-for-the-ultimate-brew",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Black tea at 90–98 °C, 3–4 minutes; a rounded teaspoon of loose tea per cup; fresh water, never reboiled; milk after brewing."
        },
        {
          "title": "Bien préparer son thé (table d'infusion)",
          "author": "Palais des Thés",
          "url": "https://www.palaisdesthes.com/fr/blog/conseils-et-astuces/bien-preparer-son-the/",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Assam 90 °C, 3–4 minutes; Sri Lanka 90 °C, 3–5 minutes; 6 g for 30 cl."
        },
        {
          "title": "Perfect cup: loose tea",
          "author": "Twinings",
          "url": "https://twiningsusa.com/blogs/articles/perfect-cup-loose-tea",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "One teaspoon per 8 oz (about 237 ml); black teas take boiling water; 3–5 minutes."
        }
      ]
    },
    {
      "type": "dark",
      "name": "Dark tea (pu-erh)",
      "tempC": 100,
      "tempRange": {
        "min": 95,
        "max": 100
      },
      "ratioGPer100ml": 2,
      "waterMl": 250,
      "infusionsS": [
        240,
        300
      ],
      "office": {
        "tempC": 100,
        "method": "Boil the kettle. Pour a little over the leaves and throw it away after 10 seconds.",
        "infusionsS": [
          240,
          300
        ]
      },
      "notes": "A quick rinse first wakes the leaves; young raw (sheng) pu-erh takes cooler water, 85–90 °C.",
      "sources": [
        {
          "title": "Preparing Pu-erh",
          "author": "Thés & Traditions",
          "url": "https://thes-traditions.com/en/content/preparation-pu-erh",
          "lang": "en",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "1 g per 50 ml in a Western brew; rinse the leaves with a first 10-second infusion; ripe or aged pu-erh at 95–100 °C, young raw pu-erh 85–90 °C."
        },
        {
          "title": "La table d'infusion",
          "author": "Cha Yuan (Lyon)",
          "ref": "www.cha-yuan.com/la_table_d_infusion.php (the site answers over http only)",
          "lang": "fr",
          "primary": true,
          "supports": [
            "parameters"
          ],
          "note": "Pu-erh: 100 °C, 3 minutes."
        }
      ]
    }
  ],
  "guides": [],
  "hash": "424795b5b492c0edcd547f40dbab88ad70ada4a825f5a3c6de4fa7e9f6152319"
};
