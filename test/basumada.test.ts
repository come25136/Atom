import { assert } from 'chai'

import * as moment from 'moment'

import { rawToObject } from '../libs/basumada'
import { createBusToBroadcastObject } from '../libs/util'

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
5142,,0,,15:33(15:32) 四御神車庫(東岡山),1618,34.69146,133.98182,始発=15:33 四御神車庫(東岡山),行先=高島団地・表町BC
1632,,1,,15:31(15:32) 新道赤磐市役所入口,1619,34.75335,134.02175,始発=15:21 桜が丘運動公園口,行先=下市・西　表町ＢＣ
1082,,0,,15:32(15:32) 兼基東,4111,34.67509,133.97583,始発=15:30 長岡団地,行先=岡山駅
//LAST
//系統番号,岡山駅の発時間,遅延,運行状態,計画時間（通過時間）停留所名,車両番号,緯度,経度,始発停留所情報,行先情報
`

describe('basumada', function() {
  this.timeout(10000)

  it('rawToObject & createBusToBroadcastObject', () =>
    rawToObject('unobus', testData, undefined, moment('2018-07-13'))
      .then(({ buses }) =>
        Promise.all(Object.values(buses).map(bus => createBusToBroadcastObject(bus)))
      )
      .then(buses =>
        assert.sameDeepMembers(buses, [
          {
            run: true,
            license_number: '1184',
            rollsign: '四御神 (県庁前 経由)',
            delay: 0,
            route_num: '1111',
            direction: 71.75366715525718,
            stations: ['2_02'],
            location: {
              latitude: 34.66489,
              lat: 34.66489,
              longitude: 133.91833,
              lon: 133.91833,
              lng: 133.91833,
              long: 133.91833
            },
            stops: {
              first: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
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
              passing: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
                },
                location: {
                  latitude: 34.664964,
                  lat: 34.664964,
                  longitude: 133.918558,
                  lon: 133.918558,
                  lng: 133.918558,
                  long: 133.918558
                },
                date: { schedule: '2018-07-13T15:35:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  'ja-Hira': 'おかやまえきまえ',
                  'ja-Kana': 'オカヤマエキマエ',
                  en: 'Okatama Ekimae Doremi'
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
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  'ja-Hira': 'おかやまえきまえ',
                  'ja-Kana': 'オカヤマエキマエ',
                  en: 'Okatama Ekimae Doremi'
                },
                location: {
                  latitude: 34.665691,
                  lat: 34.665691,
                  longitude: 133.921284,
                  lon: 133.921284,
                  lng: 133.921284,
                  long: 133.921284
                },
                date: { schedule: '2018-07-13T16:14:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1329',
            rollsign: '岡山後楽園 (県立美術館 経由)',
            delay: 1,
            route_num: '8001',
            direction: 34.917426313051806,
            stations: ['2_11', '2_08'],
            location: {
              latitude: 34.66588,
              lat: 34.66588,
              longitude: 133.93055,
              lon: 133.93055,
              lng: 133.93055,
              long: 133.93055
            },
            stops: {
              first: {
                id: '2_11',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
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
              passing: {
                id: '2_11',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
                },
                location: {
                  latitude: 34.6656276536051,
                  lat: 34.6656276536051,
                  longitude: 133.918707018287,
                  lon: 133.918707018287,
                  lng: 133.918707018287,
                  long: 133.918707018287
                },
                date: { schedule: '2018-07-13T15:22:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '3001_01',
                name: {
                  ja: '後楽園前',
                  'ja-Hira': 'こうらくえんまえ',
                  'ja-Kana': 'コウラクエンマエ',
                  en: undefined
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
                id: '3001_01',
                name: {
                  ja: '後楽園前',
                  'ja-Hira': 'こうらくえんまえ',
                  'ja-Kana': 'コウラクエンマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.669571,
                  lat: 34.669571,
                  longitude: 133.933682714286,
                  lon: 133.933682714286,
                  lng: 133.933682714286,
                  long: 133.933682714286
                },
                date: { schedule: '2018-07-13T15:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1341',
            rollsign: 'ネオ西9 (西・下市 経由)',
            delay: 6,
            route_num: '1631',
            direction: 104.65647581739347,
            stations: ['2_04'],
            location: {
              latitude: 34.75276,
              lat: 34.75276,
              longitude: 134.0052,
              lon: 134.0052,
              lng: 134.0052,
              long: 134.0052
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:25:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '574_04',
                name: {
                  ja: '山陽団地西7番',
                  'ja-Hira': 'さんようだんちにしななばん',
                  'ja-Kana': 'サンヨウダンチニシナナバン',
                  en: undefined
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
                id: '574_04',
                name: {
                  ja: '山陽団地西7番',
                  'ja-Hira': 'さんようだんちにしななばん',
                  'ja-Kana': 'サンヨウダンチニシナナバン',
                  en: undefined
                },
                location: {
                  latitude: 34.752609,
                  lat: 34.752609,
                  longitude: 134.005902714286,
                  lon: 134.005902714286,
                  lng: 134.005902714286,
                  long: 134.005902714286
                },
                date: { schedule: '2018-07-13T15:44:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1343',
            rollsign: '片上',
            delay: 3,
            route_num: '3101',
            direction: 59.316747503710985,
            stations: ['2_01'],
            location: {
              latitude: 34.6697,
              lat: 34.6697,
              longitude: 133.95301,
              lon: 133.95301,
              lng: 133.95301,
              long: 133.95301
            },
            stops: {
              first: {
                id: '2_01',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
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
              passing: {
                id: '2_01',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
                },
                location: {
                  latitude: 34.6650806666667,
                  lat: 34.6650806666667,
                  longitude: 133.918666571428,
                  lon: 133.918666571428,
                  lng: 133.918666571428,
                  long: 133.918666571428
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', pass: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '26_01',
                name: {
                  ja: '原尾島住宅前',
                  'ja-Hira': 'はらおじまじゅうたくまえ',
                  'ja-Kana': 'ハラオジマジュウタクマエ',
                  en: undefined
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
                id: '26_01',
                name: {
                  ja: '原尾島住宅前',
                  'ja-Hira': 'はらおじまじゅうたくまえ',
                  'ja-Kana': 'ハラオジマジュウタクマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.670595,
                  lat: 34.670595,
                  longitude: 133.954844,
                  lon: 133.954844,
                  lng: 133.954844,
                  long: 133.954844
                },
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1344',
            rollsign: '表町BC経由 岡山駅 (清水 経由)',
            delay: 5,
            route_num: '1112',
            direction: 265.38878598057113,
            stations: ['2_09'],
            location: {
              latitude: 34.66124,
              lat: 34.66124,
              longitude: 133.94119,
              lon: 133.94119,
              lng: 133.94119,
              long: 133.94119
            },
            stops: {
              first: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ',
                  en: undefined
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
              passing: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ',
                  en: undefined
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:25:00+09:00', pass: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '16_05',
                name: {
                  ja: '県庁前',
                  'ja-Hira': 'けんちょうまえ',
                  'ja-Kana': 'ケンチョウマエ',
                  en: undefined
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
                id: '16_05',
                name: {
                  ja: '県庁前',
                  'ja-Hira': 'けんちょうまえ',
                  'ja-Kana': 'ケンチョウマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.660805,
                  lat: 34.660805,
                  longitude: 133.934633,
                  lon: 133.934633,
                  lng: 133.934633,
                  long: 133.934633
                },
                date: { schedule: '2018-07-13T15:38:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1345',
            rollsign: '表町BC経由 岡山駅 (清水 経由)',
            delay: 1,
            route_num: '1112',
            direction: 279.10803184569966,
            stations: ['2_09'],
            location: {
              latitude: 34.69709,
              lat: 34.69709,
              longitude: 133.96785,
              lon: 133.96785,
              lng: 133.96785,
              long: 133.96785
            },
            stops: {
              first: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ',
                  en: undefined
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
              passing: {
                id: '248_05',
                name: {
                  ja: '四御神車庫',
                  'ja-Hira': 'しのごぜしゃこ',
                  'ja-Kana': 'シノゴゼシャコ',
                  en: undefined
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '222_05',
                name: {
                  ja: '浄土寺前',
                  'ja-Hira': 'じょうどじまえ',
                  'ja-Kana': 'ジョウドジマエ',
                  en: undefined
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
                id: '222_05',
                name: {
                  ja: '浄土寺前',
                  'ja-Hira': 'じょうどじまえ',
                  'ja-Kana': 'ジョウドジマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.697407,
                  lat: 34.697407,
                  longitude: 133.965445,
                  lon: 133.965445,
                  lng: 133.965445,
                  long: 133.965445
                },
                date: { schedule: '2018-07-13T15:58:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1352',
            rollsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 2,
            route_num: '1282',
            direction: 185.47935536714698,
            stations: [],
            location: {
              latitude: 34.68617,
              lat: 34.68617,
              longitude: 133.92861,
              lon: 133.92861,
              lng: 133.92861,
              long: 133.92861
            },
            stops: {
              first: {
                id: '778_05',
                name: { ja: '野間', 'ja-Hira': 'のま', 'ja-Kana': 'ノマ', en: undefined },
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
              passing: {
                id: '778_05',
                name: { ja: '野間', 'ja-Hira': 'のま', 'ja-Kana': 'ノマ', en: undefined },
                location: {
                  latitude: 34.790532,
                  lat: 34.790532,
                  longitude: 134.042157428571,
                  lon: 134.042157428571,
                  lng: 134.042157428571,
                  long: 134.042157428571
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', pass: '2018-07-13T15:29:00+09:00' }
              },
              next: {
                id: '320_05',
                name: {
                  ja: '法界院駅前',
                  'ja-Hira': 'ほうかいいんえきまえ',
                  'ja-Kana': 'ホウカイインエキマエ',
                  en: undefined
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
                id: '320_05',
                name: {
                  ja: '法界院駅前',
                  'ja-Hira': 'ほうかいいんえきまえ',
                  'ja-Kana': 'ホウカイインエキマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.685423,
                  lat: 34.685423,
                  longitude: 133.928522857143,
                  lon: 133.928522857143,
                  lng: 133.928522857143,
                  long: 133.928522857143
                },
                date: { schedule: '2018-07-13T15:46:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1353',
            rollsign: '林野駅 (新道河本 経由)',
            delay: 4,
            route_num: '1181',
            direction: 323.62939620890984,
            stations: ['2_04'],
            location: {
              latitude: 34.84142,
              lat: 34.84142,
              longitude: 134.0101,
              lon: 134.0101,
              lng: 134.0101,
              long: 134.0101
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '844_04',
                name: {
                  ja: '合田下',
                  'ja-Hira': 'あいだしも',
                  'ja-Kana': 'アイダシモ',
                  en: undefined
                },
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
                id: '844_04',
                name: {
                  ja: '合田下',
                  'ja-Hira': 'あいだしも',
                  'ja-Kana': 'アイダシモ',
                  en: undefined
                },
                location: {
                  latitude: 34.8458666666667,
                  lat: 34.8458666666667,
                  longitude: 134.006109761905,
                  lon: 134.006109761905,
                  lng: 134.006109761905,
                  long: 134.006109761905
                },
                date: { schedule: '2018-07-13T16:15:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1367',
            rollsign: '四御神 (県庁前 経由)',
            delay: 4,
            route_num: '1111',
            direction: 357.58060444755955,
            stations: ['2_02'],
            location: {
              latitude: 34.6919,
              lat: 34.6919,
              longitude: 133.96181,
              lon: 133.96181,
              lng: 133.96181,
              long: 133.96181
            },
            stops: {
              first: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
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
              passing: {
                id: '2_02',
                name: {
                  ja: '岡山駅',
                  'ja-Hira': 'おかやまえき',
                  'ja-Kana': 'オカヤマエキ',
                  en: 'Okayama Station'
                },
                location: {
                  latitude: 34.664964,
                  lat: 34.664964,
                  longitude: 133.918558,
                  lon: 133.918558,
                  lng: 133.918558,
                  long: 133.918558
                },
                date: { schedule: '2018-07-13T15:27:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '216_02',
                name: { ja: '賞田', 'ja-Hira': 'しょうだ', 'ja-Kana': 'ショウダ', en: undefined },
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
                id: '216_02',
                name: { ja: '賞田', 'ja-Hira': 'しょうだ', 'ja-Kana': 'ショウダ', en: undefined },
                location: {
                  latitude: 34.693846,
                  lat: 34.693846,
                  longitude: 133.96171,
                  lon: 133.96171,
                  lng: 133.96171,
                  long: 133.96171
                },
                date: { schedule: '2018-07-13T15:37:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1369',
            rollsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 4,
            route_num: '1622',
            direction: 229.38121190993903,
            stations: [],
            location: {
              latitude: 34.72851,
              lat: 34.72851,
              longitude: 133.98694,
              lon: 133.98694,
              lng: 133.98694,
              long: 133.98694
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
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
              passing: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T15:28:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '344_05',
                name: {
                  ja: '黒田団地',
                  'ja-Hira': 'くろだだんち',
                  'ja-Kana': 'クロダダンチ',
                  en: undefined
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
                id: '344_05',
                name: {
                  ja: '黒田団地',
                  'ja-Hira': 'くろだだんち',
                  'ja-Kana': 'クロダダンチ',
                  en: undefined
                },
                location: {
                  latitude: 34.727012,
                  lat: 34.727012,
                  longitude: 133.984814857143,
                  lon: 133.984814857143,
                  lng: 133.984814857143,
                  long: 133.984814857143
                },
                date: { schedule: '2018-07-13T16:03:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1371',
            rollsign: '東岡山 (岡山駅 経由)',
            delay: 7,
            route_num: '5141',
            direction: 1.6359302504662878,
            stations: ['2_02'],
            location: {
              latitude: 34.66821,
              lat: 34.66821,
              longitude: 133.92612,
              lon: 133.92612,
              lng: 133.92612,
              long: 133.92612
            },
            stops: {
              first: {
                id: '12_03',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_03',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661394,
                  lat: 34.661394,
                  longitude: 133.930167,
                  lon: 133.930167,
                  lng: 133.930167,
                  long: 133.930167
                },
                date: { schedule: '2018-07-13T15:24:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '9512_03',
                name: {
                  ja: '県民局入口（東岡山）',
                  'ja-Hira': 'けんみんきょくいりぐち',
                  'ja-Kana': 'ケンミンキョクイリグチ',
                  en: undefined
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
                id: '9512_03',
                name: {
                  ja: '県民局入口（東岡山）',
                  'ja-Hira': 'けんみんきょくいりぐち',
                  'ja-Kana': 'ケンミンキョクイリグチ',
                  en: undefined
                },
                location: {
                  latitude: 34.669691,
                  lat: 34.669691,
                  longitude: 133.926171428572,
                  lon: 133.926171428572,
                  lng: 133.926171428572,
                  long: 133.926171428572
                },
                date: { schedule: '2018-07-13T16:01:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1396',
            rollsign: '表町BC経由 岡山駅',
            delay: 10,
            route_num: '3102',
            direction: 254.09028763058356,
            stations: ['2_09'],
            location: {
              latitude: 34.7295,
              lat: 34.7295,
              longitude: 134.12304,
              lon: 134.12304,
              lng: 134.12304,
              long: 134.12304
            },
            stops: {
              first: {
                id: '126_05',
                name: { ja: '片上', 'ja-Hira': 'かたかみ', 'ja-Kana': 'カタカミ', en: undefined },
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
              passing: {
                id: '126_05',
                name: { ja: '片上', 'ja-Hira': 'かたかみ', 'ja-Kana': 'カタカミ', en: undefined },
                location: {
                  latitude: 34.742623,
                  lat: 34.742623,
                  longitude: 134.184238,
                  lon: 134.184238,
                  lng: 134.184238,
                  long: 134.184238
                },
                date: { schedule: '2018-07-13T15:21:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '104_05',
                name: {
                  ja: '香登駅前',
                  'ja-Hira': 'かがとえきまえ',
                  'ja-Kana': 'カガトエキマエ',
                  en: undefined
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
                id: '104_05',
                name: {
                  ja: '香登駅前',
                  'ja-Hira': 'かがとえきまえ',
                  'ja-Kana': 'カガトエキマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.728525,
                  lat: 34.728525,
                  longitude: 134.118878,
                  lon: 134.118878,
                  lng: 134.118878,
                  long: 134.118878
                },
                date: { schedule: '2018-07-13T16:28:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1486',
            rollsign: '瀬戸駅 (岡山駅 経由)',
            delay: 17,
            route_num: '1642',
            direction: 243.929197989586,
            stations: ['2_09'],
            location: {
              latitude: 34.67849,
              lat: 34.67849,
              longitude: 133.9845,
              lon: 133.9845,
              lng: 133.9845,
              long: 133.9845
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
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
              passing: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T15:15:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '44_05',
                name: { ja: '乙多見', 'ja-Hira': 'おたみ', 'ja-Kana': 'オタミ', en: undefined },
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
                id: '44_05',
                name: { ja: '乙多見', 'ja-Hira': 'おたみ', 'ja-Kana': 'オタミ', en: undefined },
                location: {
                  latitude: 34.677361,
                  lat: 34.677361,
                  longitude: 133.981694,
                  lon: 133.981694,
                  lng: 133.981694,
                  long: 133.981694
                },
                date: { schedule: '2018-07-13T15:42:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1525',
            rollsign: 'ネオ西9 (西・下市 経由)',
            delay: 0,
            route_num: '1631',
            direction: 240.68331380692808,
            stations: ['2_04'],
            location: {
              latitude: 34.6658,
              lat: 34.6658,
              longitude: 133.92959,
              lon: 133.92959,
              lng: 133.92959,
              long: 133.92959
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', pass: '2018-07-13T15:30:00+09:00' }
              },
              next: {
                id: '8_04',
                name: {
                  ja: '表町入口',
                  'ja-Hira': 'おもてちょういりぐち',
                  'ja-Kana': 'オモテチョウイリグチ',
                  en: undefined
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
                id: '8_04',
                name: {
                  ja: '表町入口',
                  'ja-Hira': 'おもてちょういりぐち',
                  'ja-Kana': 'オモテチョウイリグチ',
                  en: undefined
                },
                location: {
                  latitude: 34.6655109999999,
                  lat: 34.6655109999999,
                  longitude: 133.928964285714,
                  lon: 133.928964285714,
                  lng: 133.928964285714,
                  long: 133.928964285714
                },
                date: { schedule: '2018-07-13T16:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1585',
            rollsign: 'ネオ東6 (新道河本 経由)',
            delay: 3,
            route_num: '2011',
            direction: 91.12997463852832,
            stations: ['2_04'],
            location: {
              latitude: 34.66573,
              lat: 34.66573,
              longitude: 133.91888,
              lon: 133.91888,
              lng: 133.91888,
              long: 133.91888
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:29:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  'ja-Hira': 'おかやまえきまえ',
                  'ja-Kana': 'オカヤマエキマエ',
                  en: 'Okatama Ekimae Doremi'
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
                id: '4_02',
                name: {
                  ja: '岡山駅前・ドレミの街',
                  'ja-Hira': 'おかやまえきまえ',
                  'ja-Kana': 'オカヤマエキマエ',
                  en: 'Okatama Ekimae Doremi'
                },
                location: {
                  latitude: 34.665691,
                  lat: 34.665691,
                  longitude: 133.921284,
                  lon: 133.921284,
                  lng: 133.921284,
                  long: 133.921284
                },
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1613',
            rollsign: 'ネオ東6 (中・下市 経由)',
            delay: 1,
            route_num: '2021',
            direction: 109.585391134985,
            stations: ['2_04'],
            location: {
              latitude: 34.71792,
              lat: 34.71792,
              longitude: 133.97054,
              lon: 133.97054,
              lng: 133.97054,
              long: 133.97054
            },
            stops: {
              first: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
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
              passing: {
                id: '12_04',
                name: {
                  ja: '表町BC',
                  'ja-Hira': 'おもてちょうばすせんたー',
                  'ja-Kana': 'オモテチョウバスセンター',
                  en: undefined
                },
                location: {
                  latitude: 34.661395,
                  lat: 34.661395,
                  longitude: 133.930248,
                  lon: 133.930248,
                  lng: 133.930248,
                  long: 133.930248
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '338_04',
                name: { ja: '大原', 'ja-Hira': 'おおはら', 'ja-Kana': 'オオハラ', en: undefined },
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
                id: '338_04',
                name: { ja: '大原', 'ja-Hira': 'おおはら', 'ja-Kana': 'オオハラ', en: undefined },
                location: {
                  latitude: 34.716961,
                  lat: 34.716961,
                  longitude: 133.973819142857,
                  lon: 133.973819142857,
                  lng: 133.973819142857,
                  long: 133.973819142857
                },
                date: { schedule: '2018-07-13T16:05:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1616',
            rollsign: '瀬戸駅 (岡山駅 経由)',
            delay: 1,
            route_num: '1072',
            direction: 220.75407180544929,
            stations: ['2_09'],
            location: {
              latitude: 34.75641,
              lat: 34.75641,
              longitude: 134.02087,
              lon: 134.02087,
              lng: 134.02087,
              long: 134.02087
            },
            stops: {
              first: {
                id: '778_05',
                name: { ja: '野間', 'ja-Hira': 'のま', 'ja-Kana': 'ノマ', en: undefined },
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
              passing: {
                id: '778_05',
                name: { ja: '野間', 'ja-Hira': 'のま', 'ja-Kana': 'ノマ', en: undefined },
                location: {
                  latitude: 34.790532,
                  lat: 34.790532,
                  longitude: 134.042157428571,
                  lon: 134.042157428571,
                  lng: 134.042157428571,
                  long: 134.042157428571
                },
                date: { schedule: '2018-07-13T15:30:00+09:00', pass: '2018-07-13T15:31:00+09:00' }
              },
              next: {
                id: '742_05',
                name: {
                  ja: '赤磐市役所前',
                  'ja-Hira': 'あかいわしやくしょまえ',
                  'ja-Kana': 'アカイワシヤクショマエ',
                  en: undefined
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
                id: '742_05',
                name: {
                  ja: '赤磐市役所前',
                  'ja-Hira': 'あかいわしやくしょまえ',
                  'ja-Kana': 'アカイワシヤクショマエ',
                  en: undefined
                },
                location: {
                  latitude: 34.755531,
                  lat: 34.755531,
                  longitude: 134.019948,
                  lon: 134.019948,
                  lng: 134.019948,
                  long: 134.019948
                },
                date: { schedule: '2018-07-13T16:42:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1618',
            rollsign: '表町BC (高島団地・岡山駅前 経由)',
            delay: 0,
            route_num: '5142',
            direction: 348.29296585842576,
            stations: [],
            location: {
              latitude: 34.69146,
              lat: 34.69146,
              longitude: 133.98182,
              lon: 133.98182,
              lng: 133.98182,
              long: 133.98182
            },
            stops: {
              first: {
                id: '249_05',
                name: {
                  ja: '四御神車庫(東岡山)',
                  'ja-Hira': 'ひがしおかやま',
                  'ja-Kana': 'ヒガシオカヤマ',
                  en: undefined
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
              passing: {
                id: '249_05',
                name: {
                  ja: '四御神車庫(東岡山)',
                  'ja-Hira': 'ひがしおかやま',
                  'ja-Kana': 'ヒガシオカヤマ',
                  en: undefined
                },
                location: {
                  latitude: 34.691699,
                  lat: 34.691699,
                  longitude: 133.981635,
                  lon: 133.981635,
                  lng: 133.981635,
                  long: 133.981635
                },
                date: { schedule: '2018-07-13T15:33:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '664_05',
                name: {
                  ja: '四御神南(東岡山)',
                  'ja-Hira': 'しのごぜみなみ',
                  'ja-Kana': 'シノゴゼミナミ',
                  en: undefined
                },
                location: {
                  latitude: 34.69252,
                  lat: 34.69252,
                  longitude: 133.981552857143,
                  lon: 133.981552857143,
                  lng: 133.981552857143,
                  long: 133.981552857143
                },
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '664_05',
                name: {
                  ja: '四御神南(東岡山)',
                  'ja-Hira': 'しのごぜみなみ',
                  'ja-Kana': 'シノゴゼミナミ',
                  en: undefined
                },
                location: {
                  latitude: 34.69252,
                  lat: 34.69252,
                  longitude: 133.981552857143,
                  lon: 133.981552857143,
                  lng: 133.981552857143,
                  long: 133.981552857143
                },
                date: { schedule: '2018-07-13T16:09:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '1619',
            rollsign: '岡山駅前経由表町BC (下市・西 経由)',
            delay: 1,
            route_num: '1632',
            direction: 272.9081442404258,
            stations: [],
            location: {
              latitude: 34.75335,
              lat: 34.75335,
              longitude: 134.02175,
              lon: 134.02175,
              lng: 134.02175,
              long: 134.02175
            },
            stops: {
              first: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
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
              passing: {
                id: '792_05',
                name: {
                  ja: '桜が丘運動公園口',
                  'ja-Hira': 'さくらがおかうんどうこうえんぐち',
                  'ja-Kana': 'サクラガオカウンドウコウエングチ',
                  en: undefined
                },
                location: {
                  latitude: 34.7773193333333,
                  lat: 34.7773193333333,
                  longitude: 134.026143190477,
                  lon: 134.026143190477,
                  lng: 134.026143190477,
                  long: 134.026143190477
                },
                date: { schedule: '2018-07-13T15:31:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '2086_01',
                name: { ja: '下市', 'ja-Hira': 'しもいち', 'ja-Kana': 'シモイチ', en: undefined },
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
                id: '2086_01',
                name: { ja: '下市', 'ja-Hira': 'しもいち', 'ja-Kana': 'シモイチ', en: undefined },
                location: {
                  latitude: 34.753548,
                  lat: 34.753548,
                  longitude: 134.017006142858,
                  lon: 134.017006142858,
                  lng: 134.017006142858,
                  long: 134.017006142858
                },
                date: { schedule: '2018-07-13T16:21:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: '4111',
            rollsign: '表町BC経由 岡山駅',
            delay: 0,
            route_num: '1082',
            direction: 243.70108095449774,
            stations: ['2_09'],
            location: {
              latitude: 34.67509,
              lat: 34.67509,
              longitude: 133.97583,
              lon: 133.97583,
              lng: 133.97583,
              long: 133.97583
            },
            stops: {
              first: {
                id: '46_05',
                name: {
                  ja: '長岡団地',
                  'ja-Hira': 'ながおかだんち',
                  'ja-Kana': 'ナガオカダンチ',
                  en: undefined
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
              passing: {
                id: '46_05',
                name: {
                  ja: '長岡団地',
                  'ja-Hira': 'ながおかだんち',
                  'ja-Kana': 'ナガオカダンチ',
                  en: undefined
                },
                location: {
                  latitude: 34.678351,
                  lat: 34.678351,
                  longitude: 133.984256,
                  lon: 133.984256,
                  lng: 133.984256,
                  long: 133.984256
                },
                date: { schedule: '2018-07-13T15:32:00+09:00', pass: '2018-07-13T15:32:00+09:00' }
              },
              next: {
                id: '38_05',
                name: { ja: '兼基', 'ja-Hira': 'かねもと', 'ja-Kana': 'カネモト', en: undefined },
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
                id: '38_05',
                name: { ja: '兼基', 'ja-Hira': 'かねもと', 'ja-Kana': 'カネモト', en: undefined },
                location: {
                  latitude: 34.674193,
                  lat: 34.674193,
                  longitude: 133.973623,
                  lon: 133.973623,
                  lng: 133.973623,
                  long: 133.973623
                },
                date: { schedule: '2018-07-13T15:57:00+09:00' }
              }
            }
          }
        ])
      ))
})
