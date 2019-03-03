import { assert } from 'chai'
import * as moment from 'moment'

import { rawToObject } from '../libs/basumada'
import { createBusToBroadcastVehicle } from '../libs/gtfs/util'

const testData = `
15:32:37\n
1111,15:35,0,,15:35(15:32) 岡山駅(Okayama sta.),1184,34.66489,133.91833,始発=15:35 岡山駅(Okayama sta.),行先=県庁前・四御神
8001,,1,,15:30(15:31) 県立美術館(Okayama Prefectural,1329,34.66588,133.93055,始発=15:15 岡山駅(Okayama sta.),行先=岡山駅
1631,,6,,15:25(15:31) 山陽団地西６番,1341,34.75276,134.00520,始発=14:40 表町BC,行先=西・下市　ネ西９
3101,,3,,15:27(15:30) 原東,1343,34.6697,133.95301,始発=15:10 岡山駅(Okayama sta.),行先=片上
1112,,5,,15:25(15:30) 朝日高前,1344,34.66124,133.94119,始発=15:05 四御神車庫,行先=岡山駅
1112,,1,,15:30(15:31) 公会堂前,1345,34.69709,133.96785,始発=15:25 四御神車庫,行先=清水・岡山駅
1282,,2,,15:27(15:29) 植物園口,1352,34.68617,133.92861,始発=14:48 野間,行先=表町BC
1181,,4,,15:27(15:31) 坂辺上,1353,34.84142,134.01010,始発=14:20 表町BC,行先=湯郷・林野駅
1111,,4,,15:27(15:31) 国府市場,1367,34.69190,133.96181,始発=15:00 岡山駅(Okayama sta.),行先=四御神
1622,,4,,15:28(15:32) 白鷺団地,1369,34.72851,133.98694,始発=15:05 桜が丘運動公園口,行先=表町BC
5141,,7,,15:24(15:31) 岡電柳川（東岡山）,1371,34.66821,133.92612,始発=15:15 表町BC,行先=高島団地・東岡山
3102,,10,,15:21(15:31) 香登東,1396,34.7295,134.12304,始発=15:11 片上,行先=岡山駅
1642,,17,,15:15(15:32) 長岡団地,1486,34.67849,133.98450,始発=14:25 桜が丘運動公園口,行先=岡山駅
1631,15:37,0,,15:30(15:30) 中銀本店西,1525,34.6658,133.92959,始発=15:30 表町BC,行先=西・下市　ネ西９
2011,15:29,3,,15:29(15:32) 岡山駅(Okayama sta.),1585,34.66573,133.91888,始発=15:22 表町BC,行先=新道河本・ネ東６
2021,,1,,15:30(15:31) 大原橋,1613,34.71792,133.97054,始発=15:00 表町BC,行先=中・下市　ネ東６
1072,,1,,15:30(15:31) 高屋（ネオ）,1616,34.75641,134.02087,始発=15:22 野間,行先=瀬戸駅・岡山駅
5142,,0,運休,,,,,始発=15:33 四御神車庫 (東岡山),行先=高島団地・表町BC
1632,,1,,15:31(15:32) 新道赤磐市役所入口,1619,34.75335,134.02175,始発=15:21 桜が丘運動公園口,行先=下市・西　表町ＢＣ
1082,,0,,15:32(15:32) 兼基東,4111,34.67509,133.97583,始発=15:30 長岡団地,行先=岡山駅
//LAST
//系統番号,岡山駅の発時間,遅延,運行状態,計画時間（通過時間）停留所名,車両番号,緯度,経度,始発停留所情報,行先情報
`

describe('basumada', function() {
  this.timeout(10000)

  it('rawToObject & createBusToBroadcastObject', async () =>
    rawToObject('unobus', testData, undefined, moment('2018-07-13'))
      .then(async ({ buses }) =>
        Promise.all(Object.values(buses).map(async bus => createBusToBroadcastVehicle(bus)))
      )
      .then(buses =>  assert.sameDeepMembers(buses, [
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1184' },
            headsign: '四御神 (県庁前 経由)',
            delay: 0,
            route: { id: '1111' },
            bearing: 210.36471646707898,
            stations: ['2_02'],
            location: {
              latitude: 34.66480716774686,
              lat: 34.66480716774686,
              longitude: 133.91844628716126,
              lon: 133.91844628716126,
              lng: 133.91844628716126,
              long: 133.91844628716126
            },
            stops: {
              first: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.664964,
                  lat: 34.664964,
                  longitude: 133.918558,
                  lon: 133.918558,
                  lng: 133.918558,
                  long: 133.918558
                },
                date: { schedule: '2018-07-13T15:35:00+09:00' }
              },
              passed: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.664964,
                  lat: 34.664964,
                  longitude: 133.918558,
                  lon: 133.918558,
                  lng: 133.918558,
                  long: 133.918558
                },
                date: { schedule: '2018-07-13T15:35:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  en: 'Okatama Ekimae Doremi',
                  'ja-Hira': 'おかやまえきまえ・どれみのまち',
                  'ja-Kana': 'オカヤマエキマエ・ドレミノマチ'
                },
                location: {
                  latitude: 34.665691,
                  lat: 34.665691,
                  longitude: 133.921284,
                  lon: 133.921284,
                  lng: 133.921284,
                  long: 133.921284
                },
                date: { schedule: '2018-07-13T15:36:00+09:00' }
              },
              last: {
                id: '248_09',
                name: {
                  ja: '四御神車庫',
                  en: null,
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ'
                },
                location: {
                  latitude: 34.6916050539048,
                  lat: 34.6916050539048,
                  longitude: 133.981699347496,
                  lon: 133.981699347496,
                  lng: 133.981699347496,
                  long: 133.981699347496
                },
                date: { schedule: '2018-07-13T16:14:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1329' },
            headsign: '岡山後楽園 (Korakuen) (県立美術館 経由)',
            delay: 60,
            route: { id: '8001' },
            bearing: 0.4432853787410522,
            stations: ['2_11', '2_08'],
            location: {
              latitude: 34.66588053608918,
              lat: 34.66588053608918,
              longitude: 133.93049301107337,
              lon: 133.93049301107337,
              lng: 133.93049301107337,
              long: 133.93049301107337
            },
            stops: {
              first: {
                id: '2_11',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6656276536051,
                  lat: 34.6656276536051,
                  longitude: 133.918707018287,
                  lon: 133.918707018287,
                  lng: 133.918707018287,
                  long: 133.918707018287
                },
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              passed: {
                id: '3002_01',
                name: {
                  ja: '県立美術館',
                  en: 'Okayama Prefectural Museum',
                  'ja-Hira': 'けんりつびじゅつかん',
                  'ja-Kana': 'ケンリツビジュツカン'
                },
                location: {
                  latitude: 34.668252,
                  lat: 34.668252,
                  longitude: 133.930363142857,
                  lon: 133.930363142857,
                  lng: 133.930363142857,
                  long: 133.930363142857
                },
                date: { schedule: '2018-07-13T15:18:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '3001_01',
                name: {
                  ja: '後楽園前',
                  en: null,
                  'ja-Hira': 'こうらくえんまえ',
                  'ja-Kana': 'コウラクエンマエ'
                },
                location: {
                  latitude: 34.669571,
                  lat: 34.669571,
                  longitude: 133.933682714286,
                  lon: 133.933682714286,
                  lng: 133.933682714286,
                  long: 133.933682714286
                },
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              last: {
                id: '2_08',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6646734308299,
                  lat: 34.6646734308299,
                  longitude: 133.918171658514,
                  lon: 133.918171658514,
                  lng: 133.918171658514,
                  long: 133.918171658514
                },
                date: { schedule: '2018-07-13T15:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1341' },
            headsign: 'ネオ西9 (西 ・下市 経由)',
            delay: 360,
            route: { id: '1631' },
            bearing: 101.53457301407468,
            stations: ['2_04'],
            location: {
              latitude: 34.752796163720475,
              lat: 34.752796163720475,
              longitude: 134.00520606381298,
              lon: 134.00520606381298,
              lng: 134.00520606381298,
              long: 134.00520606381298
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T14:40:00+09:00' }
              },
              passed: {
                id: '572_04',
                name: {
                  ja: '山陽団地西6番',
                  en: null,
                  'ja-Hira': 'さんようだんちにしろくばん',
                  'ja-Kana': 'サンヨウダンチニシロクバン'
                },
                location: {
                  latitude: 34.752571,
                  lat: 34.752571,
                  longitude: 134.003650571429,
                  lon: 134.003650571429,
                  lng: 134.003650571429,
                  long: 134.003650571429
                },
                date: { schedule: '2018-07-13T15:25:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '574_04',
                name: {
                  ja: '山陽団地西7番',
                  en: null,
                  'ja-Hira': 'さんようだんちにしななばん',
                  'ja-Kana': 'サンヨウダンチニシナナバン'
                },
                location: {
                  latitude: 34.752609,
                  lat: 34.752609,
                  longitude: 134.005902714286,
                  lon: 134.005902714286,
                  lng: 134.005902714286,
                  long: 134.005902714286
                },
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              last: {
                id: '792_09',
                name: {
                  ja: '桜が丘運動公園口',
                  en: null,
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ'
                },
                location: {
                  latitude: 34.7773762151704,
                  lat: 34.7773762151704,
                  longitude: 134.026609440422,
                  lon: 134.026609440422,
                  lng: 134.026609440422,
                  long: 134.026609440422
                },
                date: { schedule: '2018-07-13T15:44:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1343' },
            headsign: '片上',
            delay: 180,
            route: { id: '3101' },
            bearing: 65.55904503539841,
            stations: ['2_01'],
            location: {
              latitude: 34.66971988608916,
              lat: 34.66971988608916,
              longitude: 133.9530025668562,
              lon: 133.9530025668562,
              lng: 133.9530025668562,
              long: 133.9530025668562
            },
            stops: {
              first: {
                id: '2_01',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6650806666667,
                  lat: 34.6650806666667,
                  longitude: 133.918666571428,
                  lon: 133.918666571428,
                  lng: 133.918666571428,
                  long: 133.918666571428
                },
                date: { schedule: '2018-07-13T15:10:00+09:00' }
              },
              passed: {
                id: '24_01',
                name: { ja: '原東', en: null, 'ja-Hira': 'はらひがし', 'ja-Kana': 'ハラヒガシ' },
                location: {
                  latitude: 34.669042,
                  lat: 34.669042,
                  longitude: 133.951189,
                  lon: 133.951189,
                  lng: 133.951189,
                  long: 133.951189
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', passed: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '26_01',
                name: {
                  ja: '原尾島住宅前',
                  en: null,
                  'ja-Hira': 'はらおじまじゅうたくまえ',
                  'ja-Kana': 'ハラオジマジュウタクマエ'
                },
                location: {
                  latitude: 34.670595,
                  lat: 34.670595,
                  longitude: 133.954844,
                  lon: 133.954844,
                  lng: 133.954844,
                  long: 133.954844
                },
                date: { schedule: '2018-07-13T15:29:00+09:00' }
              },
              last: {
                id: '126_09',
                name: { ja: '片上', en: null, 'ja-Hira': 'かたかみ', 'ja-Kana': 'カタカミ' },
                location: {
                  latitude: 34.7426328535725,
                  lat: 34.7426328535725,
                  longitude: 134.184183155234,
                  lon: 134.184183155234,
                  lng: 134.184183155234,
                  long: 134.184183155234
                },
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1344' },
            headsign: '表町BC経由岡山駅 (清水 経由)',
            delay: 300,
            route: { id: '1112' },
            bearing: 239.1747603496483,
            stations: ['2_09'],
            location: {
              latitude: 34.66129897583801,
              lat: 34.66129897583801,
              longitude: 133.9411610536755,
              lon: 133.9411610536755,
              lng: 133.9411610536755,
              long: 133.9411610536755
            },
            stops: {
              first: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  en: null,
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ'
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:05:00+09:00' }
              },
              passed: {
                id: '18_05',
                name: {
                  ja: '朝日高前',
                  en: null,
                  'ja-Hira': 'あさひこうまえ',
                  'ja-Kana': 'アサヒコウマエ'
                },
                location: {
                  latitude: 34.661685,
                  lat: 34.661685,
                  longitude: 133.942083,
                  lon: 133.942083,
                  lng: 133.942083,
                  long: 133.942083
                },
                date: { schedule: '2018-07-13T15:25:00+09:00', passed: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '16_05',
                name: {
                  ja: '県庁前',
                  en: null,
                  'ja-Hira': 'けんちょうまえ',
                  'ja-Kana': 'ケンチョウマエ'
                },
                location: {
                  latitude: 34.660805,
                  lat: 34.660805,
                  longitude: 133.934633,
                  lon: 133.934633,
                  lng: 133.934633,
                  long: 133.934633
                },
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T15:38:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1345' },
            headsign: '表町BC経由岡山駅 (清水 経由)',
            delay: 60,
            route: { id: '1112' },
            bearing: 257.2068693966304,
            stations: ['2_09'],
            location: {
              latitude: 34.69706030677168,
              lat: 34.69706030677168,
              longitude: 133.96785554341653,
              lon: 133.96785554341653,
              lng: 133.96785554341653,
              long: 133.96785554341653
            },
            stops: {
              first: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  en: null,
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ'
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              passed: {
                id: '224_05',
                name: {
                  ja: '公会堂前',
                  en: null,
                  'ja-Hira': 'こうかいどうまえ',
                  'ja-Kana': 'コウカイドウマエ'
                },
                location: {
                  latitude: 34.697168,
                  lat: 34.697168,
                  longitude: 133.96858,
                  lon: 133.96858,
                  lng: 133.96858,
                  long: 133.96858
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '222_05',
                name: {
                  ja: '浄土寺前',
                  en: null,
                  'ja-Hira': 'じょうどじまえ',
                  'ja-Kana': 'ジョウドジマエ'
                },
                location: {
                  latitude: 34.697407,
                  lat: 34.697407,
                  longitude: 133.965445,
                  lon: 133.965445,
                  lng: 133.965445,
                  long: 133.965445
                },
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T15:58:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1352' },
            headsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 120,
            route: { id: '1282' },
            bearing: 209.8721097879395,
            stations: [],
            location: {
              latitude: 34.686153979695725,
              lat: 34.686153979695725,
              longitude: 133.92863293473187,
              lon: 133.92863293473187,
              lng: 133.92863293473187,
              long: 133.92863293473187
            },
            stops: {
              first: {
                id: '778_05',
                name: { ja: '野間', en: null, 'ja-Hira': 'のま', 'ja-Kana': 'ノマ' },
                location: {
                  latitude: 34.790532,
                  lat: 34.790532,
                  longitude: 134.042157428571,
                  lon: 134.042157428571,
                  lng: 134.042157428571,
                  long: 134.042157428571
                },
                date: { schedule: '2018-07-13T14:48:00+09:00' }
              },
              passed: {
                id: '322_05',
                name: {
                  ja: '植物園口',
                  en: null,
                  'ja-Hira': 'しょくぶつえんぐち',
                  'ja-Kana': 'ショクブツエングチ'
                },
                location: {
                  latitude: 34.688663,
                  lat: 34.688663,
                  longitude: 133.931680857143,
                  lon: 133.931680857143,
                  lng: 133.931680857143,
                  long: 133.931680857143
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', passed: '2018-07-13T15:29:00+09:00' }
              },
              next: {
                id: '320_05',
                name: {
                  ja: '法界院駅前',
                  en: null,
                  'ja-Hira': 'ほうかいいんえきまえ',
                  'ja-Kana': 'ホウカイインエキマエ'
                },
                location: {
                  latitude: 34.685423,
                  lat: 34.685423,
                  longitude: 133.928522857143,
                  lon: 133.928522857143,
                  lng: 133.928522857143,
                  long: 133.928522857143
                },
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '12_06',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.6617175685716,
                  lat: 34.6617175685716,
                  longitude: 133.930157669197,
                  lon: 133.930157669197,
                  lng: 133.930157669197,
                  long: 133.930157669197
                },
                date: { schedule: '2018-07-13T15:46:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1353' },
            headsign: '林野駅 (新道河本 経由)',
            delay: 240,
            route: { id: '1181' },
            bearing: 341.5872055201315,
            stations: ['2_04'],
            location: {
              latitude: 34.84139893136038,
              lat: 34.84139893136038,
              longitude: 134.01004805770208,
              lon: 134.01004805770208,
              lng: 134.01004805770208,
              long: 134.01004805770208
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T14:20:00+09:00' }
              },
              passed: {
                id: '842_04',
                name: {
                  ja: '坂辺上',
                  en: null,
                  'ja-Hira': 'さかなべかみ',
                  'ja-Kana': 'サカナベカミ'
                },
                location: {
                  latitude: 34.841211,
                  lat: 34.841211,
                  longitude: 134.010124285714,
                  lon: 134.010124285714,
                  lng: 134.010124285714,
                  long: 134.010124285714
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '844_04',
                name: { ja: '合田下', en: null, 'ja-Hira': 'あいだしも', 'ja-Kana': 'アイダシモ' },
                location: {
                  latitude: 34.8458666666667,
                  lat: 34.8458666666667,
                  longitude: 134.006109761905,
                  lon: 134.006109761905,
                  lng: 134.006109761905,
                  long: 134.006109761905
                },
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '936_09',
                name: {
                  ja: '林野駅前',
                  en: null,
                  'ja-Hira': 'はやしのえきまえ',
                  'ja-Kana': 'ハヤシノエキマエ'
                },
                location: {
                  latitude: 35.0125776046498,
                  lat: 35.0125776046498,
                  longitude: 134.150834083557,
                  lon: 134.150834083557,
                  lng: 134.150834083557,
                  long: 134.150834083557
                },
                date: { schedule: '2018-07-13T16:15:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1367' },
            headsign: '四御神 (県庁前 経由)',
            delay: 240,
            route: { id: '1111' },
            bearing: 358.26522358938996,
            stations: ['2_02'],
            location: {
              latitude: 34.691899775936605,
              lat: 34.691899775936605,
              longitude: 133.9618039171745,
              lon: 133.9618039171745,
              lng: 133.9618039171745,
              long: 133.9618039171745
            },
            stops: {
              first: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.664964,
                  lat: 34.664964,
                  longitude: 133.918558,
                  lon: 133.918558,
                  lng: 133.918558,
                  long: 133.918558
                },
                date: { schedule: '2018-07-13T15:00:00+09:00' }
              },
              passed: {
                id: '214_02',
                name: {
                  ja: '国府市場',
                  en: null,
                  'ja-Hira': 'こくふいちば',
                  'ja-Kana': 'コクフイチバ'
                },
                location: {
                  latitude: 34.691619,
                  lat: 34.691619,
                  longitude: 133.961582428571,
                  lon: 133.961582428571,
                  lng: 133.961582428571,
                  long: 133.961582428571
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '216_02',
                name: { ja: '賞田', en: null, 'ja-Hira': 'しょうだ', 'ja-Kana': 'ショウダ' },
                location: {
                  latitude: 34.693846,
                  lat: 34.693846,
                  longitude: 133.96171,
                  lon: 133.96171,
                  lng: 133.96171,
                  long: 133.96171
                },
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '248_09',
                name: {
                  ja: '四御神車庫',
                  en: null,
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ'
                },
                location: {
                  latitude: 34.6916050539048,
                  lat: 34.6916050539048,
                  longitude: 133.981699347496,
                  lon: 133.981699347496,
                  lng: 133.981699347496,
                  long: 133.981699347496
                },
                date: { schedule: '2018-07-13T15:37:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1369' },
            headsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 240,
            route: { id: '1622' },
            bearing: 228.52523361002716,
            stations: [],
            location: {
              latitude: 34.728543381473685,
              lat: 34.728543381473685,
              longitude: 133.98691574909486,
              lon: 133.98691574909486,
              lng: 133.98691574909486,
              long: 133.98691574909486
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  en: null,
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ'
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T15:05:00+09:00' }
              },
              passed: {
                id: '552_05',
                name: {
                  ja: '白鷺団地',
                  en: null,
                  'ja-Hira': 'しらさぎだんち',
                  'ja-Kana': 'シラサギダンチ'
                },
                location: {
                  latitude: 34.728679,
                  lat: 34.728679,
                  longitude: 133.987102428571,
                  lon: 133.987102428571,
                  lng: 133.987102428571,
                  long: 133.987102428571
                },
                date: { schedule: '2018-07-13T15:28:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '344_05',
                name: {
                  ja: '黒田団地',
                  en: null,
                  'ja-Hira': 'くろだだんち',
                  'ja-Kana': 'クロダダンチ'
                },
                location: {
                  latitude: 34.727012,
                  lat: 34.727012,
                  longitude: 133.984814857143,
                  lon: 133.984814857143,
                  lng: 133.984814857143,
                  long: 133.984814857143
                },
                date: { schedule: '2018-07-13T15:29:00+09:00' }
              },
              last: {
                id: '12_06',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.6617175685716,
                  lat: 34.6617175685716,
                  longitude: 133.930157669197,
                  lon: 133.930157669197,
                  lng: 133.930157669197,
                  long: 133.930157669197
                },
                date: { schedule: '2018-07-13T16:03:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1371' },
            headsign: '東岡山 (岡山駅 経由)',
            delay: 420,
            route: { id: '5141' },
            bearing: 0.49705102561767944,
            stations: ['2_02'],
            location: {
              latitude: 34.66820962234587,
              lat: 34.66820962234587,
              longitude: 133.92615580270075,
              lon: 133.92615580270075,
              lng: 133.92615580270075,
              long: 133.92615580270075
            },
            stops: {
              first: {
                id: '12_03',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661394,
                  lat: 34.661394,
                  longitude: 133.930167,
                  lon: 133.930167,
                  lng: 133.930167,
                  long: 133.930167
                },
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              passed: {
                id: '9513_03',
                name: {
                  ja: '岡電柳川 (東岡山)',
                  en: null,
                  'ja-Hira': 'おかでんやながわひがし',
                  'ja-Kana': 'オカデンヤナガワヒガシ'
                },
                location: {
                  latitude: 34.666874,
                  lat: 34.666874,
                  longitude: 133.926141714286,
                  lon: 133.926141714286,
                  lng: 133.926141714286,
                  long: 133.926141714286
                },
                date: { schedule: '2018-07-13T15:24:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '9512_03',
                name: {
                  ja: '県民局入口 (東岡山)',
                  en: null,
                  'ja-Hira': 'けんみんきょくいりぐち',
                  'ja-Kana': 'ケンミンキョクイリグチ'
                },
                location: {
                  latitude: 34.669691,
                  lat: 34.669691,
                  longitude: 133.926171428572,
                  lon: 133.926171428572,
                  lng: 133.926171428572,
                  long: 133.926171428572
                },
                date: { schedule: '2018-07-13T15:26:00+09:00' }
              },
              last: {
                id: '249_09',
                name: {
                  ja: '四御神車庫 (東岡山)',
                  en: null,
                  'ja-Hira': 'ひがしおかやま',
                  'ja-Kana': 'ヒガシオカヤマ'
                },
                location: {
                  latitude: 34.6916468215537,
                  lat: 34.6916468215537,
                  longitude: 133.981649901728,
                  lon: 133.981649901728,
                  lng: 133.981649901728,
                  long: 133.981649901728
                },
                date: { schedule: '2018-07-13T16:01:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1396' },
            headsign: '表町BC経由岡山駅',
            delay: 600,
            route: { id: '3102' },
            bearing: 253.801431299028,
            stations: ['2_09'],
            location: {
              latitude: 34.729517665773585,
              lat: 34.729517665773585,
              longitude: 134.12303578231675,
              lon: 134.12303578231675,
              lng: 134.12303578231675,
              long: 134.12303578231675
            },
            stops: {
              first: {
                id: '126_05',
                name: { ja: '片上', en: null, 'ja-Hira': 'かたかみ', 'ja-Kana': 'カタカミ' },
                location: {
                  latitude: 34.742623,
                  lat: 34.742623,
                  longitude: 134.184238,
                  lon: 134.184238,
                  lng: 134.184238,
                  long: 134.184238
                },
                date: { schedule: '2018-07-13T15:11:00+09:00' }
              },
              passed: {
                id: '106_05',
                name: {
                  ja: '香登東',
                  en: null,
                  'ja-Hira': 'かがとひがし',
                  'ja-Kana': 'カガトヒガシ'
                },
                location: {
                  latitude: 34.729874,
                  lat: 34.729874,
                  longitude: 134.124728,
                  lon: 134.124728,
                  lng: 134.124728,
                  long: 134.124728
                },
                date: { schedule: '2018-07-13T15:21:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '104_05',
                name: {
                  ja: '香登駅前',
                  en: null,
                  'ja-Hira': 'かがとえきまえ',
                  'ja-Kana': 'カガトエキマエ'
                },
                location: {
                  latitude: 34.728525,
                  lat: 34.728525,
                  longitude: 134.118878,
                  lon: 134.118878,
                  lng: 134.118878,
                  long: 134.118878
                },
                date: { schedule: '2018-07-13T15:24:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T16:28:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1486' },
            headsign: '瀬戸駅 (岡山駅 経由)',
            delay: 1020,
            route: { id: '1642' },
            bearing: 240.99212981760328,
            stations: ['2_09'],
            location: {
              latitude: 34.67850519393584,
              lat: 34.67850519393584,
              longitude: 133.98449307174633,
              lon: 133.98449307174633,
              lng: 133.98449307174633,
              long: 133.98449307174633
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  en: null,
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ'
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T14:25:00+09:00' }
              },
              passed: {
                id: '46_05',
                name: {
                  ja: '長岡団地',
                  en: null,
                  'ja-Hira': 'ながおかだんち',
                  'ja-Kana': 'ナガオカダンチ'
                },
                location: {
                  latitude: 34.678351,
                  lat: 34.678351,
                  longitude: 133.984256,
                  lon: 133.984256,
                  lng: 133.984256,
                  long: 133.984256
                },
                date: { schedule: '2018-07-13T15:15:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '44_05',
                name: { ja: '乙多見', en: null, 'ja-Hira': 'おたみ', 'ja-Kana': 'オタミ' },
                location: {
                  latitude: 34.677361,
                  lat: 34.677361,
                  longitude: 133.981694,
                  lon: 133.981694,
                  lng: 133.981694,
                  long: 133.981694
                },
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T15:42:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1525' },
            headsign: 'ネオ西9 (西 ・下市 経由)',
            delay: 0,
            route: { id: '1631' },
            bearing: 269.62737469505873,
            stations: ['2_04'],
            location: {
              latitude: 34.66551435521171,
              lat: 34.66551435521171,
              longitude: 133.92959152795635,
              lon: 133.92959152795635,
              lng: 133.92959152795635,
              long: 133.92959152795635
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              passed: {
                id: '10_04',
                name: {
                  ja: '中銀本店西',
                  en: null,
                  'ja-Hira': 'ちゅうぎんほんてんにし',
                  'ja-Kana': 'チュウギンホンテンニシ'
                },
                location: {
                  latitude: 34.662629,
                  lat: 34.662629,
                  longitude: 133.930365142857,
                  lon: 133.930365142857,
                  lng: 133.930365142857,
                  long: 133.930365142857
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', passed: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '8_04',
                name: {
                  ja: '表町入口',
                  en: null,
                  'ja-Hira': 'おもてちょういりぐち',
                  'ja-Kana': 'オモテチョウイリグチ'
                },
                location: {
                  latitude: 34.6655109999999,
                  lat: 34.6655109999999,
                  longitude: 133.928964285714,
                  lon: 133.928964285714,
                  lng: 133.928964285714,
                  long: 133.928964285714
                },
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '792_09',
                name: {
                  ja: '桜が丘運動公園口',
                  en: null,
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ'
                },
                location: {
                  latitude: 34.7773762151704,
                  lat: 34.7773762151704,
                  longitude: 134.026609440422,
                  lon: 134.026609440422,
                  lng: 134.026609440422,
                  long: 134.026609440422
                },
                date: { schedule: '2018-07-13T16:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1585' },
            headsign: 'ネオ東6 (新道河本 経由)',
            delay: 180,
            route: { id: '2011' },
            bearing: 88.72346034170414,
            stations: ['2_04'],
            location: {
              latitude: 34.66564696773881,
              lat: 34.66564696773881,
              longitude: 133.91888152180286,
              lon: 133.91888152180286,
              lng: 133.91888152180286,
              long: 133.91888152180286
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:22:00+09:00' }
              },
              passed: {
                id: '2_04',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.665102,
                  lat: 34.665102,
                  longitude: 133.918658,
                  lon: 133.918658,
                  lng: 133.918658,
                  long: 133.918658
                },
                date: { schedule: '2018-07-13T15:29:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  en: 'Okatama Ekimae Doremi',
                  'ja-Hira': 'おかやまえきまえ・どれみのまち',
                  'ja-Kana': 'オカヤマエキマエ・ドレミノマチ'
                },
                location: {
                  latitude: 34.665691,
                  lat: 34.665691,
                  longitude: 133.921284,
                  lon: 133.921284,
                  lng: 133.921284,
                  long: 133.921284
                },
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              last: {
                id: '778_09',
                name: { ja: '野間', en: null, 'ja-Hira': 'のま', 'ja-Kana': 'ノマ' },
                location: {
                  latitude: 34.7911139020656,
                  lat: 34.7911139020656,
                  longitude: 134.042564034462,
                  lon: 134.042564034462,
                  lng: 134.042564034462,
                  long: 134.042564034462
                },
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1613' },
            headsign: 'ネオ東6 (中 ・下市 経由)',
            delay: 60,
            route: { id: '2021' },
            bearing: 115.48760579641896,
            stations: ['2_04'],
            location: {
              latitude: 34.717931398200186,
              lat: 34.717931398200186,
              longitude: 133.97054446626967,
              lon: 133.97054446626967,
              lng: 133.97054446626967,
              long: 133.97054446626967
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:00:00+09:00' }
              },
              passed: {
                id: '336_04',
                name: {
                  ja: '大原橋',
                  en: null,
                  'ja-Hira': 'おおはらばし',
                  'ja-Kana': 'オオハラバシ'
                },
                location: {
                  latitude: 34.717013,
                  lat: 34.717013,
                  longitude: 133.967315714286,
                  lon: 133.967315714286,
                  lng: 133.967315714286,
                  long: 133.967315714286
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '338_04',
                name: { ja: '大原', en: null, 'ja-Hira': 'おおはら', 'ja-Kana': 'オオハラ' },
                location: {
                  latitude: 34.716961,
                  lat: 34.716961,
                  longitude: 133.973819142857,
                  lon: 133.973819142857,
                  lng: 133.973819142857,
                  long: 133.973819142857
                },
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '778_09',
                name: { ja: '野間', en: null, 'ja-Hira': 'のま', 'ja-Kana': 'ノマ' },
                location: {
                  latitude: 34.7911139020656,
                  lat: 34.7911139020656,
                  longitude: 134.042564034462,
                  lon: 134.042564034462,
                  lng: 134.042564034462,
                  long: 134.042564034462
                },
                date: { schedule: '2018-07-13T16:05:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1616' },
            headsign: '瀬戸駅 (岡山駅 経由)',
            delay: 60,
            route: { id: '1072' },
            bearing: 220.8302644497344,
            stations: ['2_09'],
            location: {
              latitude: 34.756443431304035,
              lat: 34.756443431304035,
              longitude: 134.02083821356203,
              lon: 134.02083821356203,
              lng: 134.02083821356203,
              long: 134.02083821356203
            },
            stops: {
              first: {
                id: '778_05',
                name: { ja: '野間', en: null, 'ja-Hira': 'のま', 'ja-Kana': 'ノマ' },
                location: {
                  latitude: 34.790532,
                  lat: 34.790532,
                  longitude: 134.042157428571,
                  lon: 134.042157428571,
                  lng: 134.042157428571,
                  long: 134.042157428571
                },
                date: { schedule: '2018-07-13T15:22:00+09:00' }
              },
              passed: {
                id: '744_05',
                name: { ja: '高屋 (ネオ)', en: null, 'ja-Hira': 'たかや', 'ja-Kana': 'タカヤ' },
                location: {
                  latitude: 34.757754,
                  lat: 34.757754,
                  longitude: 134.022489,
                  lon: 134.022489,
                  lng: 134.022489,
                  long: 134.022489
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', passed: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '742_05',
                name: {
                  ja: '赤磐市役所前',
                  en: null,
                  'ja-Hira': 'あかいわしやくしょまえ',
                  'ja-Kana': 'アカイワシヤクショマエ'
                },
                location: {
                  latitude: 34.755531,
                  lat: 34.755531,
                  longitude: 134.019948,
                  lon: 134.019948,
                  lng: 134.019948,
                  long: 134.019948
                },
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T16:42:00+09:00' }
              }
            }
          },
          {
            run: false,
            route: { id: '5142' },
            stations: [],
            stops: {
              first: {
                id: '249_05',
                name: {
                  ja: '四御神車庫 (東岡山)',
                  en: null,
                  'ja-Hira': 'ひがしおかやま',
                  'ja-Kana': 'ヒガシオカヤマ'
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '12_09',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.6616275685716,
                  lat: 34.6616275685716,
                  longitude: 133.930306240626,
                  lon: 133.930306240626,
                  lng: 133.930306240626,
                  long: 133.930306240626
                },
                date: { schedule: '2018-07-13T16:09:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '1619' },
            headsign: '岡山駅前経由表町BC (下市・西 経由)',
            delay: 60,
            route: { id: '1632' },
            bearing: 215.49073042307566,
            stations: [],
            location: {
              latitude: 34.753411605467896,
              lat: 34.753411605467896,
              longitude: 134.0216790148934,
              lon: 134.0216790148934,
              lng: 134.0216790148934,
              long: 134.0216790148934
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  en: null,
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ'
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T15:21:00+09:00' }
              },
              passed: {
                id: '954_05',
                name: {
                  ja: '新道赤磐市役所入口',
                  en: null,
                  'ja-Hira': 'しんどうあかいわしやくしょいりぐち',
                  'ja-Kana': 'シンドウアカイワシヤクショイリグチ'
                },
                location: {
                  latitude: 34.753392,
                  lat: 34.753392,
                  longitude: 134.021662,
                  lon: 134.021662,
                  lng: 134.021662,
                  long: 134.021662
                },
                date: { schedule: '2018-07-13T15:31:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '2086_01',
                name: { ja: '下市', en: null, 'ja-Hira': 'しもいち', 'ja-Kana': 'シモイチ' },
                location: {
                  latitude: 34.753548,
                  lat: 34.753548,
                  longitude: 134.017006142858,
                  lon: 134.017006142858,
                  lng: 134.017006142858,
                  long: 134.017006142858
                },
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '12_06',
                name: {
                  ja: '表町BC',
                  en: null,
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター'
                },
                location: {
                  latitude: 34.6617175685716,
                  lat: 34.6617175685716,
                  longitude: 133.930157669197,
                  lon: 133.930157669197,
                  lng: 133.930157669197,
                  long: 133.930157669197
                },
                date: { schedule: '2018-07-13T16:21:00+09:00' }
              }
            }
          },
          {
            run: true,
            descriptors: { id: null, label: null, license_plate: '4111' },
            headsign: '表町BC経由岡山駅',
            delay: 0,
            route: { id: '1082' },
            bearing: 255.12266137064182,
            stations: ['2_09'],
            location: {
              latitude: 34.67509044239998,
              lat: 34.67509044239998,
              longitude: 133.97582990334746,
              lon: 133.97582990334746,
              lng: 133.97582990334746,
              long: 133.97582990334746
            },
            stops: {
              first: {
                id: '46_05',
                name: {
                  ja: '長岡団地',
                  en: null,
                  'ja-Hira': 'ながおかだんち',
                  'ja-Kana': 'ナガオカダンチ'
                },
                location: {
                  latitude: 34.678351,
                  lat: 34.678351,
                  longitude: 133.984256,
                  lon: 133.984256,
                  lng: 133.984256,
                  long: 133.984256
                },
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              passed: {
                id: '40_05',
                name: {
                  ja: '兼基東',
                  en: null,
                  'ja-Hira': 'かねもとひがし',
                  'ja-Kana': 'カネモトヒガシ'
                },
                location: {
                  latitude: 34.675111,
                  lat: 34.675111,
                  longitude: 133.975924,
                  lon: 133.975924,
                  lng: 133.975924,
                  long: 133.975924
                },
                date: { schedule: '2018-07-13T15:32:00+09:00', passed: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '38_05',
                name: { ja: '兼基', en: null, 'ja-Hira': 'かねもと', 'ja-Kana': 'カネモト' },
                location: {
                  latitude: 34.674193,
                  lat: 34.674193,
                  longitude: 133.973623,
                  lon: 133.973623,
                  lng: 133.973623,
                  long: 133.973623
                },
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '2_09',
                name: {
                  ja: '岡山駅',
                  en: 'Okayama Station',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ'
                },
                location: {
                  latitude: 34.6651411659917,
                  lat: 34.6651411659917,
                  longitude: 133.918716997157,
                  lon: 133.918716997157,
                  lng: 133.918716997157,
                  long: 133.918716997157
                },
                date: { schedule: '2018-07-13T15:57:00+09:00' }
              }
            }
          }
        ])
      ))
})
