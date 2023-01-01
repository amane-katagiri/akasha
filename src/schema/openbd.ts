import { z } from "zod";

export const schema = z
  .object({
    onix: z
      .object({
        ProductIdentifier: z
          .object({
            ProductIDType: z
              .string()
              .regex(new RegExp("^15$"))
              .describe("IDの種類[ISBN固定]")
              .optional(),
            IDValue: z
              .string()
              .regex(new RegExp("([0-9]+)"))
              .describe("ISBN（13桁）")
              .optional(),
          })
          .strict()
          .describe("識別情報(ISBN)")
          .optional(),
        RecordReference: z.string().describe("ISBN（13桁）").optional(),
        PublishingDetail: z
          .object({
            PublishingStatus: z
              .string()
              .regex(new RegExp("^08$"))
              .describe("長期品切情報:長期品切れの場合、08:Inactiveを記入")
              .optional(),
            PublishingDate: z
              .array(
                z
                  .object({
                    PublishingDateRole: z
                      .string()
                      .regex(new RegExp("^([0-9]{2})$"))
                      .describe("発売日の種類")
                      .optional(),
                    Date: z.string().describe("発売日").optional(),
                  })
                  .strict()
              )
              .describe("商品の出版に関する日付情報")
              .optional(),
            Imprint: z
              .object({
                ImprintName: z
                  .string()
                  .describe("「発行元出版社」名")
                  .optional(),
                ImprintIdentifier: z
                  .array(
                    z
                      .object({
                        IDValue: z.string().describe("ID").optional(),
                        ImprintIDType: z
                          .string()
                          .describe("IDタイプ")
                          .optional(),
                      })
                      .strict()
                  )
                  .describe("「発行元出版社」コード")
                  .optional(),
              })
              .strict()
              .describe("「発行元出版社」に関する情報")
              .optional(),
            Publisher: z
              .object({
                PublishingRole: z
                  .string()
                  .describe("Publisher 【出版社】 に固定")
                  .optional(),
                PublisherName: z
                  .string()
                  .describe("「発売元出版社」名")
                  .optional(),
                PublisherIdentifier: z
                  .array(
                    z
                      .object({
                        IDValue: z.string().describe("ID").optional(),
                        PublisherIDType: z
                          .string()
                          .describe("IDタイプ")
                          .optional(),
                      })
                      .strict()
                  )
                  .describe("「発売元出版社」コード")
                  .optional(),
              })
              .strict()
              .describe(
                "「発行元出版社」と異なる場合、「発売元出版社」についての情報"
              )
              .optional(),
          })
          .strict()
          .describe("出版社に関する情報")
          .optional(),
        NotificationType: z
          .string()
          .regex(new RegExp("^03$|^02$"))
          .describe("削除フラグ")
          .optional(),
        ProductSupply: z
          .object({
            MarketPublishingDetail: z
              .object({
                MarketPublishingStatus: z
                  .string()
                  .describe("00:Unspecifiedを記入する")
                  .optional(),
                MarketPublishingStatusNote: z
                  .string()
                  .describe("取次会社取り扱いと配本の有無について")
                  .optional(),
                PublisherRepresentative: z
                  .array(
                    z
                      .object({
                        AgentRole: z
                          .string()
                          .describe("08扱い社に固定")
                          .optional(),
                        AgentName: z.string().describe("扱い社名").optional(),
                        AgentIdentifier: z
                          .array(
                            z
                              .object({
                                AgentIDType: z
                                  .string()
                                  .describe("01:独自コードに固定")
                                  .optional(),
                                IDTypeName: z
                                  .string()
                                  .describe("コードの名前")
                                  .optional(),
                                IDValue: z
                                  .string()
                                  .describe("コード")
                                  .optional(),
                              })
                              .strict()
                          )
                          .describe("扱い社コード")
                          .optional(),
                      })
                      .strict()
                  )
                  .describe("扱い社")
                  .optional(),
              })
              .strict()
              .describe("扱い社に関する情報")
              .optional(),
            SupplyDetail: z
              .object({
                ReturnsConditions: z
                  .object({
                    ReturnsCodeType: z
                      .string()
                      .describe("「ONIX返品条件コード」 に固定")
                      .optional(),
                    ReturnsCode: z.string().describe("条件コード").optional(),
                  })
                  .strict()
                  .describe("返品条件について")
                  .optional(),
                ProductAvailability: z
                  .string()
                  .regex(new RegExp("^99$"))
                  .describe("「近刊情報センター」では、99に固定")
                  .optional(),
                Price: z
                  .array(
                    z
                      .object({
                        PriceType: z.string().describe("価格タイプ").optional(),
                        PriceAmount: z.string().describe("価格").optional(),
                        CurrencyCode: z.string().describe("通貨").optional(),
                        PriceDate: z
                          .array(
                            z
                              .object({
                                PriceDateRole: z
                                  .string()
                                  .describe("価格の種類")
                                  .optional(),
                                Date: z.string().describe("日付").optional(),
                                Price: z.string().describe("価格").optional(),
                              })
                              .strict()
                          )
                          .describe("特価期限")
                          .optional(),
                      })
                      .strict()
                  )
                  .describe("価格（単価）について")
                  .optional(),
              })
              .strict()
              .describe(
                "商品のアベイラビリテイ（入手可能性）や価格、その他の供給状況"
              )
              .optional(),
          })
          .strict()
          .describe("市場における商品の出版状況、供給等")
          .optional(),
        DescriptiveDetail: z
          .object({
            EditionType: z
              .string()
              .regex(new RegExp("^NED$"))
              .describe("版表示 NED: 新版（New Edition）に固定する。")
              .optional(),
            EditionStatement: z
              .string()
              .describe("版表示 版表示を文字列で記入する。")
              .optional(),
            Language: z
              .array(
                z
                  .object({
                    LanguageCode: z.string().describe("価格の種類").optional(),
                    LanguageRole: z
                      .string()
                      .regex(new RegExp("^01$"))
                      .describe("言語コード")
                      .optional(),
                    CountryCode: z.string().describe("国コード").optional(),
                  })
                  .strict()
              )
              .describe("表記に利用する言語")
              .optional(),
            TitleDetail: z
              .object({
                TitleType: z
                  .string()
                  .regex(new RegExp("^01$"))
                  .describe("タイトルの種類[01に固定]")
                  .optional(),
                TitleElement: z
                  .object({
                    TitleElementLevel: z
                      .string()
                      .regex(new RegExp("^01$"))
                      .describe("タイトルのレベル[01に固定]")
                      .optional(),
                    TitleText: z
                      .object({
                        collationkey: z
                          .string()
                          .describe("読み仮名")
                          .optional(),
                        content: z.string().describe("書名").optional(),
                      })
                      .strict()
                      .describe("書名")
                      .optional(),
                    Subtitle: z
                      .object({
                        collationkey: z
                          .string()
                          .describe("読み仮名")
                          .optional(),
                        content: z.string().describe("書名").optional(),
                      })
                      .strict()
                      .describe("サブタイトル")
                      .optional(),
                    PartNumber: z
                      .string()
                      .describe(
                        "シリーズ巻次:<TitleElementLevel>毎に該当する巻次があれば、文字列として記入する"
                      )
                      .optional(),
                  })
                  .strict()
                  .describe("タイトルの要素")
                  .optional(),
              })
              .strict()
              .describe("商品の「書名」を設定")
              .optional(),
            ProductForm: z.string().describe("判型").optional(),
            ProductFormDetail: z
              .string()
              .describe("判型の詳細コード")
              .optional(),
            Collection: z
              .object({
                CollectionType: z
                  .string()
                  .regex(new RegExp("^10$"))
                  .describe("種類コード[10に固定]")
                  .optional(),
                CollectionSequence: z
                  .object({
                    CollectionSequenceType: z
                      .string()
                      .regex(new RegExp("^03$|^01$"))
                      .describe("配本回数コード[01:完結フラグ,03:配本回数]")
                      .optional(),
                    CollectionSequenceTypeName: z
                      .string()
                      .describe(
                        "コードが完結フラグの場合、完結フラグと記入する"
                      )
                      .optional(),
                    CollectionSequenceNumber: z
                      .string()
                      .describe("配本回数")
                      .optional(),
                  })
                  .strict()
                  .describe(
                    "「配本回数」について（複数に変更されたため互換性のために維持→CollectionSequenceArrayを参照してください）"
                  )
                  .optional(),
                CollectionSequenceArray: z
                  .array(
                    z
                      .object({
                        CollectionSequenceType: z
                          .string()
                          .regex(new RegExp("^03$|^01$"))
                          .describe("配本回数コード[01:完結フラグ,03:配本回数]")
                          .optional(),
                        CollectionSequenceTypeName: z
                          .string()
                          .describe(
                            "コードが完結フラグの場合、完結フラグと記入する"
                          )
                          .optional(),
                        CollectionSequenceNumber: z
                          .string()
                          .describe("配本回数")
                          .optional(),
                      })
                      .strict()
                  )
                  .describe("「配本回数」について")
                  .optional(),
                TitleDetail: z
                  .object({
                    TitleType: z
                      .string()
                      .regex(new RegExp("^01$"))
                      .describe("タイトルの種類[01に固定]")
                      .optional(),
                    TitleElement: z
                      .array(
                        z
                          .object({
                            TitleElementLevel: z
                              .string()
                              .regex(new RegExp("^01$|^02$|^03$"))
                              .describe("シリーズの種類")
                              .optional(),
                            TitleText: z
                              .object({
                                collationkey: z
                                  .string()
                                  .describe("読み仮名")
                                  .optional(),
                                content: z
                                  .string()
                                  .describe("タイトル")
                                  .optional(),
                              })
                              .strict()
                              .describe("シリーズ名")
                              .optional(),
                            PartNumber: z
                              .string()
                              .describe("シリーズの巻次")
                              .optional(),
                          })
                          .strict()
                      )
                      .describe("シリーズ・レーベルの名前")
                      .optional(),
                  })
                  .strict()
                  .describe("シリーズタイトル")
                  .optional(),
              })
              .strict()
              .describe("シリーズに関する情報")
              .optional(),
            Extent: z
              .array(
                z
                  .object({
                    ExtentType: z
                      .string()
                      .describe("数値の種類[11はページ数]")
                      .optional(),
                    ExtentUnit: z
                      .string()
                      .describe("単位[03ページに固定]")
                      .optional(),
                    ExtentValue: z.string().describe("値").optional(),
                  })
                  .strict()
              )
              .describe("商品に関連する（数値的）範囲、程度など")
              .optional(),
            Measure: z
              .array(
                z
                  .object({
                    MeasureType: z
                      .string()
                      .describe("数値の種類[01縦/02横]")
                      .optional(),
                    MeasureUnitCode: z
                      .string()
                      .describe("単位[mmに固定]")
                      .optional(),
                    Measurement: z.string().describe("値").optional(),
                  })
                  .strict()
              )
              .describe("タテ・ヨコの実寸")
              .optional(),
            Contributor: z
              .array(
                z
                  .object({
                    ContributorRole: z
                      .array(z.string())
                      .describe("著者区分")
                      .optional(),
                    SequenceNumber: z.string().describe("表示順序").optional(),
                    PersonName: z
                      .object({
                        collationkey: z
                          .string()
                          .describe("読み仮名")
                          .optional(),
                        content: z.string().describe("タイトル").optional(),
                      })
                      .strict()
                      .describe("著者名")
                      .optional(),
                    BiographicalNote: z
                      .string()
                      .describe("著者略歴")
                      .optional(),
                  })
                  .strict()
              )
              .describe("商品の著者情報")
              .optional(),
            ProductComposition: z
              .string()
              .describe("セット商品分売可否")
              .optional(),
            Audience: z
              .array(
                z
                  .object({
                    AudienceCodeType: z
                      .string()
                      .describe("読者コード種類")
                      .optional(),
                    AudienceCodeValue: z
                      .string()
                      .describe("読者コード")
                      .optional(),
                  })
                  .strict()
              )
              .describe("商品の対象読者を示す方法")
              .optional(),
            Subject: z
              .array(
                z
                  .object({
                    SubjectSchemeIdentifier: z
                      .string()
                      .describe("カテゴリ")
                      .optional(),
                    SubjectCode: z
                      .string()
                      .describe(
                        "78 or 79 の場合に、「Cコード」または「ジャンルコード」"
                      )
                      .optional(),
                    MainSubject: z
                      .string()
                      .describe("メーンとなるSubjectのカテゴリ")
                      .optional(),
                    SubjectHeadingText: z
                      .string()
                      .describe("キーワード")
                      .optional(),
                    SubjectSchemeVersion: z
                      .string()
                      .describe("NDC分類の場合、使用した分類の版（テキスト）")
                      .optional(),
                    sourcename: z
                      .string()
                      .describe("コードを付与したもの。NDL/JPO/出版社など")
                      .optional(),
                  })
                  .strict()
              )
              .describe("商品の主題、テーマ、カテゴリなど")
              .optional(),
            ProductPart: z
              .array(
                z
                  .object({
                    NumberOfItemsOfThisForm: z
                      .string()
                      .describe("付録の数量[1に固定]")
                      .optional(),
                    ProductForm: z
                      .string()
                      .describe("付録コード[00に固定]")
                      .optional(),
                    ProductFormDescription: z
                      .string()
                      .describe("付録の内容")
                      .optional(),
                  })
                  .strict()
              )
              .describe("付録の有無")
              .optional(),
          })
          .strict()
          .describe("商品に関する情報")
          .optional(),
        RelatedMaterial: z
          .array(
            z
              .object({
                RelatedProduct: z
                  .object({
                    ProductRelationCode: z
                      .string()
                      .describe("コード 03：Replacesに固定する")
                      .optional(),
                    ProductIdentifier: z
                      .object({
                        ProductIDType: z
                          .string()
                          .regex(new RegExp("^15$"))
                          .describe("IDの種類[ISBN固定]")
                          .optional(),
                        IDValue: z
                          .string()
                          .regex(new RegExp("([0-9]+)"))
                          .describe("ISBN（13桁）")
                          .optional(),
                      })
                      .strict()
                      .optional(),
                  })
                  .strict()
                  .describe(
                    "旧版の商品が存在する場合にその商品のISBNを設定する。"
                  )
                  .optional(),
              })
              .strict()
          )
          .describe("旧版商品ISBN")
          .optional(),
        CollateralDetail: z
          .object({
            SupportingResource: z
              .array(
                z
                  .object({
                    ResourceContentType: z
                      .string()
                      .regex(new RegExp("^01$|^07$"))
                      .describe("種類[01書影07商品イメージ]")
                      .optional(),
                    ResourceMode: z
                      .string()
                      .describe("[03静止画に固定]")
                      .optional(),
                    ContentAudience: z
                      .string()
                      .describe("[01に固定]")
                      .optional(),
                    ResourceVersion: z
                      .array(
                        z
                          .object({
                            ResourceLink: z
                              .string()
                              .regex(
                                new RegExp("^https:\\/\\/cover.openbd.jp\\/")
                              )
                              .describe("フルURI")
                              .optional(),
                            ResourceForm: z
                              .string()
                              .describe("[02に固定]")
                              .optional(),
                            ResourceVersionFeature: z
                              .array(z.any())
                              .describe("ファイル名とファイル形式")
                              .optional(),
                          })
                          .strict()
                      )
                      .describe("補助リソースのバージョン")
                      .optional(),
                  })
                  .strict()
              )
              .describe(
                "ONIXデータを補助する販促情報や追加情報などのデジタルデータ"
              )
              .optional(),
            TextContent: z
              .array(
                z
                  .object({
                    Text: z.string().describe("テキスト").optional(),
                    TextType: z
                      .string()
                      .regex(new RegExp("^02$|^03$|^04$|^23$"))
                      .describe("種類コード")
                      .optional(),
                    ContentAudience: z
                      .string()
                      .describe("意図されている読者")
                      .optional(),
                  })
                  .strict()
              )
              .describe("内容紹介")
              .optional(),
          })
          .strict()
          .describe("商品の付帯項目")
          .optional(),
      })
      .strict()
      .optional(),
    hanmoto: z
      .object({
        datekoukai: z.string().describe("公開日").optional(),
        datemodified: z.string().describe("最終更新日"),
        datecreated: z.string().describe("最終作成日").optional(),
        dateshuppan: z.string().describe("出版日").optional(),
        dokushakakikomipagesuu: z
          .number()
          .describe("読者書き込みページ数")
          .optional(),
        kubunhanbai: z.boolean().describe("販売区分").optional(),
        toji: z.string().describe("本の綴じ方").optional(),
        zaiko: z.number().describe("在庫ステータス").optional(),
        han: z.string().describe("版").optional(),
        genrecodetrc: z.number().describe("TRC用ジャンルコード").optional(),
        genrecodetrcjidou: z
          .number()
          .describe("TRC用児童ジャンルコード")
          .optional(),
        bikoutrc: z.string().describe("TRC用備考").optional(),
        ndccode: z.string().describe("NDC(日本十進分類法)").optional(),
        kaisetsu105w: z.string().describe("105文字程度の解説").optional(),
        hanmotokarahitokoto: z.string().describe("版元からひとこと").optional(),
        kankoukeitai: z.string().describe("刊行形態").optional(),
        lanove: z.boolean().describe("ラノベフラグ").optional(),
        maegakinado: z.string().describe("まえがきなど").optional(),
        hastameshiyomi: z.boolean().describe("試し読みフラグ").optional(),
        datezeppan: z.string().describe("絶版日").optional(),
        jushoujouhou: z.string().describe("受賞情報").optional(),
        datejuuhanyotei: z.string().describe("重版予定日").optional(),
        genshomei: z.string().describe("原書名").optional(),
        kanrensho: z.string().describe("関連書").optional(),
        tsuiki: z.string().describe("追記").optional(),
        obinaiyou: z.string().describe("帯の内容").optional(),
        rubynoumu: z.boolean().describe("ルビの有無").optional(),
        furokusonota: z.string().describe("付録その他").optional(),
        furoku: z.number().describe("付録コード").optional(),
        zasshicode: z.string().describe("雑誌コード").optional(),
        ruishokyougousho: z.string().describe("類書・競合書").optional(),
        sonotatokkijikou: z.string().describe("その他の特記事項").optional(),
        gatsugougousuu: z.string().describe("月号・号数").optional(),
        dokushakakikomi: z.string().describe("読者書き込み").optional(),
        kanrenshoisbn: z.string().describe("関連書ISBN").optional(),
        bessoushiryou: z.string().describe("別称資料?").optional(),
        jyuhan: z
          .array(
            z
              .object({
                date: z.string().describe("重版日"),
                ctime: z.string().describe("更新日時").optional(),
                suri: z.number().describe("刷数").optional(),
                comment: z.string().describe("コメント").optional(),
              })
              .strict()
          )
          .describe("重版情報")
          .optional(),
        author: z
          .array(
            z
              .object({
                dokujikubun: z.string().describe("独自区分"),
                listseq: z.number().describe("リストの番号"),
              })
              .strict()
          )
          .describe("著者補足情報")
          .optional(),
        reviews: z
          .array(
            z
              .object({
                han: z.string().describe("版").optional(),
                appearance: z.string().describe("書評掲載日").optional(),
                post_user: z.string().describe("投稿ユーザー").optional(),
                kubun_id: z.number().describe("区分ID").optional(),
                source: z.string().describe("情報源").optional(),
                choyukan: z.string().describe("朝刊・夕刊").optional(),
                source_id: z.number().describe("情報源ID").optional(),
                reviewer: z.string().describe("評者").optional(),
                gou: z.string().describe("号").optional(),
                link: z.string().describe("リンク").optional(),
              })
              .strict()
          )
          .describe("書評情報")
          .optional(),
        hanmotoinfo: z
          .object({
            name: z.string().describe("名前").optional(),
            yomi: z.string().describe("よみ").optional(),
            url: z.string().describe("URL").optional(),
            twitter: z.string().describe("Twitterアドレス").optional(),
            facebook: z.string().describe("Facebookアドレス").optional(),
            eigyoudaihyousha: z.string().describe("営業代表者").optional(),
            toritsugisonota: z.string().describe("不明").optional(),
            toritsugitorikyo: z.string().describe("不明").optional(),
            phoneshoten: z.string().describe("不明").optional(),
            facsimileshoten: z.string().describe("不明").optional(),
            ordersitejisha: z.string().describe("不明").optional(),
            emailshoten: z.string().describe("不明").optional(),
            ordersitesonota: z.string().describe("不明").optional(),
            ordersite: z.string().describe("不明").optional(),
            henpin: z.string().describe("不明").optional(),
            chokutori: z.string().describe("不明").optional(),
            jiyuukinyuu: z.string().describe("不明").optional(),
          })
          .strict()
          .describe("版元情報")
          .optional(),
        hatsubai: z.string().describe("発売元").optional(),
        hatsubaiyomi: z.string().describe("発売元よみ").optional(),
        bikoujpo: z.string().describe("不明").optional(),
        storelink: z.string().describe("不明").optional(),
      })
      .strict()
      .describe("版元独自書誌")
      .optional(),
    summary: z
      .object({
        isbn: z.string().describe("ISBN"),
        title: z.string().describe("書名"),
        volume: z.string().describe("巻号"),
        series: z.string().describe("シリーズ名"),
        author: z.string().describe("著者名"),
        publisher: z.string().describe("出版者"),
        pubdate: z.string().describe("出版年月"),
        cover: z.string().describe("書影URL"),
      })
      .strict()
      .describe("書誌の概要")
      .optional(),
  })
  .strict();
