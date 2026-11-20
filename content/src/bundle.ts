// Made by `npm run content:build` from content/'s YAML and Markdown: never by hand.
// `npm run content:check` fails when it's out of date. The app and the server both import it.
import type { ContentBundle } from "@teatime/core";

export const BUNDLE: ContentBundle = {
  "format": 2,
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
      "id": "teaspring",
      "name": "TeaSpring",
      "kind": "online",
      "url": "https://www.teaspring.com",
      "notes": "Chinese teas, priced in US dollars, shipped worldwide; customs may apply."
    }
  ],
  "teaTypes": [
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
        "method": "Set the kettle to 75 °C and pour straight onto the leaves.",
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
        "method": "Set the kettle to 95 °C (or 100 °C) and pour onto the leaves; refill the mug twice.",
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
        "method": "Boil the kettle. Pour a little over the leaves and throw it away after 10 seconds, then fill the mug.",
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
  "hash": "f8011c4646268ec1b6b5a6e45c126f33b0bd0e0e111fd3023c6a06cd77a6c03d"
};
