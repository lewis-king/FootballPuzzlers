# Question audit: CL (Champions League pack), ids 152 to 211

Audited 2026-11-18. Primary source is the live English Wikipedia (raw page text fetched on this date), especially the "European Cup and UEFA Champions League records and statistics" page (marked as updated 4 November 2026), the all-time top scorers list and the 100+ appearances list, plus each player's article. Web searches were used for retirements and anything Wikipedia did not settle. Id 201 appears twice in `baseQuestions.json`; both are audited as Q201a (Beckham, first in file) and Q201b (Lucas Pérez). **The duplicate id needs fixing in the data file regardless of content.**

Shorthand used in Sources:
- RECORDS = https://en.wikipedia.org/wiki/European_Cup_and_UEFA_Champions_League_records_and_statistics
- TOPSCORERS = https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_top_scorers
- APPS = https://en.wikipedia.org/wiki/List_of_footballers_with_100_or_more_UEFA_Champions_League_appearances
- HATTRICKS = https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_hat-tricks

### Q152: Cristiano Ronaldo
- Verdict: KEEP
- Issues: none. Still all-time top scorer with 140 goals (Messi 129, Lewandowski 109; nobody active is close: Mbappé 74, Haaland 62). Still playing for Al-Nassr (retired from international football Nov 2026), so RET false is correct.
- Shelf life: RECORD (all-time top scorer; safe for many years)
- Sources: TOPSCORERS ; https://en.wikipedia.org/wiki/Cristiano_Ronaldo
- Confidence: high

### Q153: Cristiano Ronaldo
- Verdict: REWORD
- Issues: "Most assists" is source-dependent and no longer safe. Opta (used by Wikipedia) has Ryan Giggs top on 41, Ronaldo 40, Messi 39, Di María 38. UEFA's own list (which only counts from 2003-04 and uses looser criteria) has Ronaldo first on 42. A player who knows the Opta figure would answer Giggs. Also ungrammatical ("the most assists of any other player"). Same answer as Q152, so a different Ronaldo fact keeps the pair distinct.
- Proposed question: I've finished as the Champions League's top scorer in a record seven seasons, six of them in a row.
- Shelf life: RECORD (most seasons as top scorer, 7; next best is far behind)
- Sources: RECORDS (Assists table notes; "Top scorers by seasons": 7 seasons, 2007-08 and 2012-13 to 2017-18) ; https://theanalyst.com/eu/2023/10/who-has-the-most-champions-league-assists/
- Confidence: high

### Q154: Iker Casillas
- Verdict: REWORD
- Issues: (1) No longer the all-time appearance leader: Ronaldo has 183, Casillas 177. (2) "Most appearances by a goalkeeper" is not safe either: Manuel Neuer is on 164 and is playing in the 2026-27 competition. (3) RET is wrong: Casillas retired in August 2020 (last club Porto 2015-2020).
- Proposed question: I was 19 when I became the youngest goalkeeper to play in and win a Champions League final.\nI also played in a record 20 consecutive Champions League seasons.
- Proposed flags: RET false→true
- Shelf life: TIMELESS (youngest keeper to win a final) plus RECORD (20 consecutive seasons; hard to beat)
- Sources: APPS ; RECORDS (Goalkeeping: youngest goalkeeper to play in and win a final, 19y4d, 2000; Appearances, other records: 20 consecutive seasons 1999-2019) ; https://en.wikipedia.org/wiki/Iker_Casillas
- Confidence: high

### Q155: James Milner
- Verdict: REWORD
- Issues: (1) "Currently hold the record" is no longer safe. Milner's 9 assists in 2017-18 was reported as a record at the time and his Wikipedia article still says so, but the records page (Opta-based) now lists Luís Figo with 9 in 1999-2000 and Milner on 8, tied with Beckham, Mendieta, Neymar and Raphinha (2024-25). (2) RET is wrong: Milner retired on 1 June 2026, aged 40.
- Proposed question: I made nine assists in a single Champions League season on the way to the 2018 final.\nA year later I came off the bench as my club won the trophy.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/James_Milner ; RECORDS (Assists, single season) ; https://www.irishtimes.com/sport/soccer/2026/06/01/james-milner-premier-leagues-appearance-record-holder-retires-aged-40/
- Confidence: high (retirement, dispute); medium (exact 2019 final detail: Milner came on as a substitute in the 2019 final, from memory of the final line-up, consistent with his article)

### Q156: Zlatan Ibrahimović
- Verdict: REWORD
- Issues: Facts hold. Red cards: 4, joint record with Edgar Davids and Sergio Ramos, so "as many times as anyone else" is true. Four assists in PSG's 4-0 win over Dinamo Zagreb (Nov 2012) confirmed by UEFA. Typo "sent of" (should be "sent off"). RET is wrong: retired June 2023 (last club Milan 2019-2023).
- Proposed question: I've been sent off as many times as anyone else in the Champions League.\nI've also made four assists in one Champions League game.
- Proposed flags: RET false→true
- Shelf life: RECORD (joint most red cards, 4; could be matched or passed)
- Sources: RECORDS (Disciplinary) ; https://www.uefa.com/uefachampionsleague/news/0203-0e9db5eef25a-259076c85bf8-1000--rampant-psg-hit-four-to-oust-dinamo ; https://en.wikipedia.org/wiki/Zlatan_Ibrahimovi%C4%87
- Confidence: high

### Q157: Moise Kean
- Verdict: KEEP
- Issues: none. First player born in the 2000s to play in the CL (Juventus v Sevilla, 22 Nov 2016). Still playing (on loan at Como in 2026-27). Note "2000s" means born 2000 or later; the first player born in the 21st century (2001+) was Han-Noah Massengo, which does not affect this answer.
- Shelf life: TIMELESS
- Sources: RECORDS (Trivia) ; https://en.wikipedia.org/wiki/Moise_Kean
- Confidence: high

### Q158: Marcel Desailly
- Verdict: REWORD
- Issues: The answer is not unique as written. Dozens of players have won the CL in consecutive seasons (Real Madrid 2016-18, Milan 1989-90, Ajax/Bayern/Liverpool eras, etc.). What makes Desailly special is doing it with two different clubs (Marseille 1993, Milan 1994), and he was the first of four to do so (then Paulo Sousa, Piqué, Eto'o).
- Proposed question: I was the first player to win the Champions League in consecutive seasons with two different clubs.
- Shelf life: TIMELESS
- Sources: RECORDS (Players, other records: four players in consecutive seasons with two clubs) ; https://en.wikipedia.org/wiki/Marcel_Desailly
- Confidence: high

### Q159: Luiz Adriano
- Verdict: REWORD
- Issues: (1) "Only Lionel Messi has achieved the same feat" is false since 14 March 2023, when Erling Haaland scored five against RB Leipzig. (2) RET is wrong: Wikipedia now calls him a former footballer; his last club was Vitória (2024).
- Proposed question: I've scored 5 goals in a single Champions League game.\nLionel Messi did it before me, and only Erling Haaland has done it since.
- Proposed flags: RET false→true
- Shelf life: RECORD (another five-goal game would make "only Haaland since" wrong; reword again if it happens)
- Sources: RECORDS (Five goals in a match) ; HATTRICKS ; https://en.wikipedia.org/wiki/Luiz_Adriano
- Confidence: high (facts); medium (retirement date not stated, but article describes him as a former player)

### Q160: Jens Lehmann
- Verdict: KEEP
- Issues: none. Still the record: 9 consecutive clean sheets (Arsenal, Mar 2005 to May 2006) and 853 minutes without conceding. Retired; GK.
- Shelf life: RECORD (consecutive clean sheets)
- Sources: RECORDS (Goalkeeping)
- Confidence: high

### Q161: Sergio Ramos
- Verdict: KEEP
- Issues: none for the fact. Most yellow cards: 43 plus one second-yellow red. RET false left: Ramos left Monterrey at the end of 2025 and reports since are conflicting (Sevilla return, ownership bid); no retirement has been announced and Wikipedia still describes him as a professional footballer. Re-check before launch.
- Shelf life: RECORD (most yellow cards; very hard to beat)
- Sources: RECORDS (Disciplinary) ; https://en.wikipedia.org/wiki/Sergio_Ramos
- Confidence: high (record); low (current playing status)

### Q162: Carlos Martins
- Verdict: KEEP
- Issues: none. Martins assisted all four Benfica goals in the 4-3 win over Lyon on 2 Nov 2010. Retired (last club Belenenses 2015-16; article calls him a former footballer).
- Shelf life: TIMELESS
- Sources: https://www.foxsports.com/stories/soccer/benfica-repel-lyon-fightback ; https://www.worldfootball.net/report/champions-league-2010-2011-gruppe-b-sl-benfica-olympique-lyon/liveticker/ ; https://en.wikipedia.org/wiki/Carlos_Martins_(footballer)
- Confidence: high

### Q163: Francesco Totti
- Verdict: REWORD
- Issues: Record broken. Pepe became the oldest Champions League scorer on 7 Nov 2023 (40y254d) and extended it to 40y289d in Dec 2023. Totti's mark was 38y59d (v CSKA Moscow, 25 Nov 2014).
- Proposed question: I was the oldest goalscorer of the Champions League era until Pepe broke my record in 2023.\nI spent my whole career at one club.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Francesco_Totti ; https://en.wikipedia.org/wiki/Pepe_(footballer,_born_February_1983) ; RECORDS (Oldest goalscorer)
- Confidence: high

### Q164: Dietmar Hamann
- Verdict: REWORD
- Issues: Not unique. Arjen Robben also has an FA Cup (Chelsea 2007, came on in the final), Bundesliga titles, a Champions League (2013) and was a World Cup finalist (2010). Facts about Hamann are correct.
- Proposed question: I've won the FA Cup, Bundesliga and Champions League, and I've played in a World Cup final.\nI also scored the last goal at the old Wembley.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Dietmar_Hamann ; https://en.wikipedia.org/wiki/Arjen_Robben
- Confidence: high

### Q165: Mikaël Silvestre
- Verdict: KEEP
- Issues: none. CL winner with Man Utd in 2008 (his final season there), played for Inter, Arsenal and Man Utd. Retired 2014.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Mika%C3%ABl_Silvestre
- Confidence: high

### Q166: Diego Milito
- Verdict: KEEP
- Issues: none. Both goals in the 2010 final for treble-winning Inter. Retired 2016. Trailing newline in the question string should be trimmed.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Diego_Milito ; RECORDS
- Confidence: high

### Q167: Dejan Lovren
- Verdict: REWORD
- Issues: Not unique. Players who lost a CL final and a World Cup final in the same year include Rummenigge and Breitner (1982), Ballack, Ramelow, Schneider, Neuville and Butt (2002), Robben and van Bommel (2010), Lovren (2018) and Konaté (2022). Robben is also the answer to Q206 with the same fact. Adding the year makes it unique. RET false left: PAOK contract ran to summer 2026; an April 2026 report says he was not thinking of retiring, but his current club is unconfirmed.
- Proposed question: In 2018 I lost a Champions League final and a World Cup final.
- Shelf life: TIMELESS
- Sources: RECORDS (Combinations: runner-up of CL and WC/Euros in the same year) ; https://en.wikipedia.org/wiki/Dejan_Lovren ; https://www.tportal.hr/sport/clanak/dejan-lovren-poslao-jasnu-poruku-splitskom-hajduku-zelim-mu-20260424
- Confidence: high (fact); low (playing status)

### Q168: Sami Khedira
- Verdict: REWORD
- Issues: (1) Not unique: twelve players have won the CL and World Cup in the same year (Bayern/West Germany 1974, Karembeu 1998, Roberto Carlos 2002, Khedira 2014, Varane 2018, Fabián Ruiz 2026). (2) RET wrong: retired at the end of 2020-21 (Hertha).
- Proposed question: In 2014 I won the Champions League and the World Cup within two months of each other.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: RECORDS (Combinations of wins) ; https://en.wikipedia.org/wiki/Sami_Khedira
- Confidence: high

### Q169: Sergio Busquets
- Verdict: REWORD
- Issues: (1) Not unique. Barcelona's 2009 and 2015 trebles were shared by Messi, Xavi, Iniesta, Piqué, Pedro, Dani Alves and Busquets, all with 3+ CL wins. (2) RET wrong: retired after Inter Miami's MLS Cup win, 6 Dec 2025.
- Proposed question: I've won the Champions League three times and the treble twice.\nMy dad won the European Cup with the same club.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: RECORDS (Relatives: Carles and Sergio Busquets) ; https://en.wikipedia.org/wiki/Sergio_Busquets
- Confidence: high

### Q170: Alisson Becker
- Verdict: REWORD
- Issues: Not unique as written. The quarter-final comeback against Barcelona was Roma's in 2018 (lost 4-1, won 3-0), which every Roma player shared. Alisson is the one player who was also in Liverpool's 4-0 semi-final comeback against Barcelona in 2019, so the double comeback makes it unique.
- Proposed question: In back-to-back seasons I helped two different clubs overturn three-goal first-leg deficits against Barcelona.\nThe first came in a quarter-final, the second in a semi-final.
- Shelf life: TIMELESS
- Sources: RECORDS (Comebacks, two-leg knockout matches) ; https://en.wikipedia.org/wiki/Alisson_Becker
- Confidence: high

### Q171: Marcus Rashford
- Verdict: REWORD
- Issues: (1) Not unique: Romelu Lukaku scored twice in the same 3-1 second leg in Paris (Mar 2019), so "on the scoresheet" fits him too. (2) The "first" claim needs qualifying: Ajax did it in the European Cup in 1969; Man Utd are the first (and only) team in the Champions League era. Wording is also hard to follow.
- Proposed question: My stoppage-time penalty in Paris sent my club through after we'd lost the home first leg 2-0.\nNo other team in the Champions League era has done that.
- Shelf life: RECORD ("no other team" would break if repeated)
- Sources: RECORDS (Comebacks: "Only two teams have lost the first leg at home by two goals but still qualified") ; https://en.wikipedia.org/wiki/Marcus_Rashford
- Confidence: high

### Q172: Celestine Babayaro
- Verdict: REWORD
- Issues: Record broken. Babayaro (16y86d, Anderlecht v Steaua, Nov 1994) was the youngest player until Youssoufa Moukoko (16y18d, 8 Dec 2020); Max Dowman now holds it (15y308d, Nov 2025). Babayaro was also sent off on that debut, still cited as the youngest red card.
- Proposed question: I played in the Champions League at 16 for Anderlecht, a record for the youngest player that stood until 2020.\nI was sent off in that game, and I later played in the competition for Chelsea.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Celestine_Babayaro ; https://www.eurosport.com/football/champions-league/2020-2021/dortmund-s-youssoufa-moukoko-makes-history-as-he-becomes-youngest-player-to-play-in-champions-league_sto8024561/story.shtml ; RECORDS (Youngest player)
- Confidence: high

### Q173: Juan Mata
- Verdict: REWORD
- Issues: Not unique: Fernando Torres also won the CL with Chelsea and Euro 2012 with Spain. Mata's distinguishing detail: his corner set up Drogba's 88th-minute equaliser in the 2012 final. RET status uncertain: left Melbourne Victory (contract ended Sept 2026) and joined its ownership group; one thin report says he retired at 38, others say he ruled retirement out. RET false left pending confirmation.
- Proposed question: In 2012 I won the Champions League and the Euros.\nIn the Champions League final I took the corner for our late equaliser.
- Shelf life: TIMELESS
- Sources: RECORDS (Combinations: CL and Euros same year) ; https://en.wikipedia.org/wiki/Juan_Mata ; https://www.ysscores.com/en/news/14043411/juan-mata-announces-retirement-from-football-at-age-38
- Confidence: high (facts); low (RET)

### Q174: Jadon Sancho
- Verdict: KEEP
- Issues: none. First player born in the 2000s to score in the CL (Dortmund v Atlético, 24 Oct 2018). Still playing.
- Shelf life: TIMELESS
- Sources: RECORDS (Trivia) ; https://en.wikipedia.org/wiki/Jadon_Sancho
- Confidence: high

### Q175: Darren Fletcher
- Verdict: FIX-FLAGS
- Issues: Facts hold (CL winner 2008; teammates Chadli at West Brom, Crouch and Choupo-Moting at Stoke). RET wrong: last club Stoke (2017-19); now a coach (Man Utd U18 head coach, caretaker first-team coach Jan 2026).
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Darren_Fletcher
- Confidence: high

### Q176: Roy Makaay
- Verdict: KEEP
- Issues: none. Fastest goal still 10.12 seconds (Bayern v Real Madrid, 7 Mar 2007).
- Shelf life: RECORD (fastest goal)
- Sources: RECORDS (Fastest goals)
- Confidence: high

### Q177: Andrés Iniesta
- Verdict: FIX-FLAGS
- Issues: Facts hold (assisted in the 2009, 2011 and 2015 finals; only player to be man of the match in a CL, Euro and World Cup final). RET wrong: retired in 2024 (last club Emirates Club, 2023-24).
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Andr%C3%A9s_Iniesta
- Confidence: high

### Q178: Patrice Evra
- Verdict: KEEP
- Issues: none. Still the record: four finals lost (2004, 2009, 2011, 2015). Kepa and Lucas Hernandez have reached finals with three clubs but have not lost four.
- Shelf life: RECORD (most finals lost)
- Sources: RECORDS (Trivia)
- Confidence: high

### Q179: Ivan Rakitić
- Verdict: FIX-FLAGS
- Issues: Facts hold (Wikipedia: first player to win the CL a year after winning the Europa League with two clubs; man of the match in the 2014 EL final; CL team of the season 2014-15). RET wrong: retired (last club Hajduk Split 2024-25, now its technical director).
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Ivan_Rakiti%C4%87
- Confidence: high

### Q180: Neymar
- Verdict: KEEP
- Issues: none found. In 2014-15 he scored in both QF legs v PSG, both SF legs v Bayern, and the final. Checked later winners for the same pattern: Benzema 2022 did not score in the final; PSG 2025 and 2026 (Dembélé missed the 2026 QF first leg) do not match. Still playing (Santos).
- Shelf life: TIMELESS (could be matched in future, but unlikely)
- Sources: https://en.wikipedia.org/wiki/Neymar ; https://en.wikipedia.org/wiki/2025%E2%80%9326_UEFA_Champions_League_knockout_phase
- Confidence: medium (2014-15 goal-by-goal from memory consistent with articles; later seasons spot-checked, not every winner since 2015 exhaustively)

### Q181: Bafétimbi Gomis
- Verdict: REWORD
- Issues: (1) Record broken: Mohamed Salah's hat-trick v Rangers on 12 Oct 2022 took 6 min 12 s. Gomis's (Lyon v Dinamo Zagreb, Dec 2011, reported as 7 or 8 minutes) was the record until then. (2) RET wrong: Gomis retired on 10 Nov 2024.
- Proposed question: I held the record for the fastest hat-trick in Champions League history for over ten years.\nI scored it for Lyon in a 7-1 win over Dinamo Zagreb.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: RECORDS (Hat-tricks: fastest-ever) ; https://en.wikipedia.org/wiki/Baf%C3%A9timbi_Gomis ; https://guinnessworldrecords.com/world-records/101475-fastest-champions-league-hat-trick
- Confidence: high

### Q182: Álvaro Arbeloa
- Verdict: KEEP
- Issues: none. Lost 2007 with Liverpool (Pirlo and Alonso played) and won 2014 with Real Madrid (Ronaldo played). Retired 2017. Minor: Arbeloa was an unused substitute in the 2014 final, which the wording does not contradict.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/%C3%81lvaro_Arbeloa
- Confidence: medium (his 2014 final involvement from memory; the question does not depend on it)

### Q183: David Alaba
- Verdict: REWORD
- Issues: "Only managed to win the Champions League once" is false. Alaba has four: 2013 and 2020 with Bayern, 2022 and 2024 with Real Madrid. UEFA Team of the Year 2013, 2014, 2015 still true. Now at Udinese (2026), still playing.
- Proposed question: I've made the UEFA Team of the Year three times.\nI've won the Champions League twice with Bayern Munich and twice with Real Madrid.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/David_Alaba ; RECORDS
- Confidence: high

### Q184: Luka Modrić
- Verdict: KEEP
- Issues: none. Teammates by club overlap: Gallas and Pienaar (Spurs 2010-11), Morata and Di María (Real Madrid). Still playing (Milan).
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Luka_Modri%C4%87
- Confidence: medium (Pienaar joined Spurs in Jan 2011; his CL registration for the knockout rounds not separately confirmed)

### Q185: Pepe
- Verdict: REWORD
- Issues: Facts hold (CL with Porto, Real Madrid, Beşiktaş). Grammar: "Teams I've played with" should be "played for". RET wrong: retired 8 Aug 2024.
- Proposed question: Teams I've played for in the Champions League include Porto, Beşiktaş and Real Madrid.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Pepe_(footballer,_born_February_1983)
- Confidence: high

### Q186: N'Golo Kanté
- Verdict: KEEP
- Issues: none. First CL season was 2017-18 with Chelsea (Morata a teammate); named in the UEFA Team of the Year 2018. Still playing (Fenerbahçe, 2026).
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/N%27Golo_Kant%C3%A9
- Confidence: high

### Q187: Bernardo Silva
- Verdict: KEEP
- Issues: none. Mbappé, Bakayoko and Mendy at Monaco 2016-17; Agüero and Mendy at Man City. Now at Real Madrid (2026), still playing.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Bernardo_Silva
- Confidence: high

### Q188: Sami Hyypiä
- Verdict: REWORD
- Issues: Facts hold (CL 2005 and FA Cup 2006, both won on penalties; retired at Leverkusen in 2011). Typo: the club is Bayer Leverkusen, not "Bayern".
- Proposed question: I'm an FA Cup and Champions League winner, having won both on a penalty shootout in consecutive seasons.\nI finished my playing career at Bayer Leverkusen.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Sami_Hyypi%C3%A4
- Confidence: high

### Q189: Alberto Aquilani
- Verdict: FIX-FLAGS
- Issues: Facts hold. RET wrong: retired 28 June 2019.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Alberto_Aquilani
- Confidence: high

### Q190: Raheem Sterling
- Verdict: KEEP
- Issues: none. Sakho, Balotelli and Kolo Touré at Liverpool (2014-15 CL), Sagna and Yaya Touré at Man City. Not retired: free agent after his Feyenoord deal ended with 2025-26.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Raheem_Sterling
- Confidence: high (facts); medium (status)

### Q191: Thiago Motta
- Verdict: KEEP
- Issues: none. Won with Barcelona (2006) and Inter (2010), Eto'o in both squads. Retired 2018.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Thiago_Motta
- Confidence: high

### Q192: Oriol Romeu
- Verdict: KEEP
- Issues: none. CL 2012 and EL 2013 with Chelsea; Alves and Seydou Keita at Barcelona; Torres and Lukaku at Chelsea. Still playing (Avispa Fukuoka, July 2026).
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Oriol_Romeu
- Confidence: high

### Q193: Clarence Seedorf
- Verdict: REWORD
- Issues: Fact holds (still the only player to win with three clubs). Grammar: "One of those teams include". RET wrong: retired 14 Jan 2014.
- Proposed question: I was the first player to win the Champions League with three different clubs.\nOne of those clubs is Real Madrid.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: RECORDS (Players, other records) ; https://en.wikipedia.org/wiki/Clarence_Seedorf
- Confidence: high

### Q194: Maxwell
- Verdict: KEEP
- Issues: none found. StatMuse lists 94 Champions League appearances, consistent with "over 90". Retired 2017.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Maxwell_(footballer,_born_1981) ; https://www.statmuse.com/fc/player/maxwell-22405
- Confidence: medium (appearance total from one aggregator; not on UEFA or Wikipedia)

### Q195: Yannick Carrasco
- Verdict: KEEP
- Issues: none. Scored in the 2016 final; teammates Berbatov, Falcao, Martial (Monaco), Torres (Atlético). Still playing (Al-Shabab, extended to 2027).
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Yannick_Carrasco
- Confidence: high

### Q196: Fernando Morientes
- Verdict: KEEP
- Issues: none. Top scorer in 2003-04 with nine goals for Monaco. Retired.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Fernando_Morientes
- Confidence: high

### Q197: Mario Mandžukić
- Verdict: FIX-FLAGS
- Issues: Facts hold (opened the scoring in the 2013 final; joint top scorer at Euro 2012 with three goals; teammates Shaqiri and Kroos at Bayern, Raúl Jiménez at Atlético, Emre Can at Juventus). RET wrong: retired in 2021 after Milan.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Mario_Mand%C5%BEuki%C4%87
- Confidence: high (RET, final); medium (Euro 2012 joint top scorer is well known but not stated in his article)

### Q198: Wayne Rooney
- Verdict: REWORD
- Issues: (1) No longer England's top CL scorer. Harry Kane has 58 (and is still adding); Rooney has around 30. (2) RET wrong: retired January 2021.
- Proposed question: I scored a hat-trick on my Champions League debut, and I'm still the youngest player ever to do it.
- Proposed flags: RET false→true
- Shelf life: RECORD (youngest debut hat-trick, 18y340d, Man Utd v Fenerbahçe 2004)
- Sources: TOPSCORERS ; RECORDS (Hat-tricks) ; https://en.wikipedia.org/wiki/Wayne_Rooney
- Confidence: high

### Q199: Peter Crouch
- Verdict: KEEP
- Issues: none found. Liverpool: 9 goals in the competition proper (11 including the Maccabi Haifa and Toulouse qualifiers); Spurs 2010-11: 4 in the group and knockout stages after a qualifying hat-trick v Young Boys, total 13. Teammates Bale (Spurs), Mascherano (Liverpool), Sol Campbell (Portsmouth). Retired 2019.
- Shelf life: TIMELESS
- Sources: https://www.lfchistory.net/players/1133/goals-per-competition/3 ; https://en.wikipedia.org/wiki/Peter_Crouch
- Confidence: medium (Spurs split depends on whether qualifiers count; total 13 excludes them)

### Q200: Arda Turan
- Verdict: FIX-FLAGS
- Issues: Facts hold (hat-trick v Mönchengladbach, Dec 2016; joined Barcelona after their 2015 win; EL 2012 with Atlético). RET wrong: retired 2022 (last club Galatasaray).
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Arda_Turan
- Confidence: high

### Q201a: David Beckham
- Verdict: REWORD
- Issues: Facts hold (first British player to reach 100 CL games; listed as the world's highest-paid player). Typo "I Once". Duplicate id 201 must be renumbered in the data file.
- Proposed question: I've made over 100 Champions League appearances, and Real Madrid and PSG are two of the clubs that helped make that up.\nI was once the highest-paid player in the world.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/David_Beckham
- Confidence: high

### Q201b: Lucas Pérez
- Verdict: KEEP
- Issues: none for facts. Hat-trick in 39 minutes for Arsenal at Basel (6 Dec 2016); Wilshere at Arsenal; Zabaleta, Hernández, Nasri and Wilshere at West Ham. RET false left: he left Cádiz in June 2026 and has no club; no retirement announced. Duplicate id 201 must be renumbered.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Lucas_P%C3%A9rez ; https://www.elgoldigital.com/futbol/cadiz-cf/lucas-perez-no-continua-cadiz-cf-futuro-37-anos/
- Confidence: high (facts); low (RET)

### Q202: Ronaldinho
- Verdict: REWORD
- Issues: (1) "First to achieve it since the year 2000" is wrong as worded: Zidane completed the CL, World Cup and Ballon d'Or set in 2002 and Rivaldo in 2003, both before Ronaldinho (2006). Ronaldinho is the first to have won all three after 2000 (WC 2002, Ballon d'Or 2005, CL 2006). (2) RET is now wrong: Ronaldinho came out of retirement, signed for Serie C club Ravenna in June 2026 and played the first half against Forlì on 15 Nov 2026. This is likely a short-lived stunt, so consider re-checking near launch or dropping the RET clue for him.
- Proposed question: I've won the Champions League, the World Cup and the Ballon d'Or.\nI was the first player to win all three after the year 2000.
- Proposed flags: RET true→false (re-check before launch)
- Shelf life: TIMELESS (the RET flag is volatile)
- Sources: RECORDS (Combinations with Ballon d'Or) ; https://en.wikipedia.org/wiki/Ronaldinho ; https://www.wsls.com/news/weird-news/2026/06/24/ronaldinho-says-let-the-magic-begin-after-signing-with-italian-serie-c-club-ravenna-at-age-46/ ; https://www.thescore.com/news/3656152
- Confidence: high

### Q203: Alan (Alan Carvalho)
- Verdict: REPLACE
- Issues: (1) Alan never played in a Champions League group stage. Salzburg only reached the qualifiers, and his notable record is joint top scorer of the 2013-14 Europa League, not the Champions League. (2) "National teammate Paulinho" is wrong: Alan never played for Brazil's senior team; he later became a naturalised China international. (3) He has retired (Wikipedia calls him a former player; last club Qingdao West Coast, left Feb 2025). The question does not belong in the CL pack and is too obscure. The proposed replacement is a different player.
- Proposed question: (New answer: Erling Haaland, acceptable "Erling Haaland", "Haaland"; flags FWD true, others false, RET false, ENG false.) I scored a first-half hat-trick on my Champions League debut.\nI've also scored five goals in a single Champions League game.
- Proposed flags: whole new question (see above)
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Alan_(footballer,_born_1989) ; RECORDS (Hat-tricks: debut hat-tricks, Haaland the only first-half one; Five goals in a match)
- Confidence: high

### Q204: Xherdan Shaqiri
- Verdict: KEEP
- Issues: none. Part of Bayern's 2012-13 treble; Emre Can (Bayern and Liverpool), Xhaka (Switzerland), Salah (Liverpool). Still playing (Basel). Optional polish: "I was part of a treble-winning team, Champions League included."
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Xherdan_Shaqiri
- Confidence: high

### Q205: Gerard Piqué
- Verdict: REWORD
- Issues: (1) Not unique: Ramos (2016-18, 15 goals), Eto'o (2009/2010), Ronaldo, Benzema, Bale and others have won it in consecutive years and scored 10+. Piqué's unique angle is consecutive wins with two clubs (Man Utd 2008, Barcelona 2009) as a defender with 16 CL goals. (2) RET wrong: retired November 2022.
- Proposed question: I won the Champions League in consecutive seasons with two different clubs.\nI'm a defender, but I've scored more than 10 goals in the competition.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: RECORDS (consecutive wins with two clubs) ; https://en.wikipedia.org/wiki/Gerard_Piqu%C3%A9 ; https://www.statmuse.com/fc/player/gerard-piqu%C3%A9-2211
- Confidence: high

### Q206: Arjen Robben
- Verdict: REWORD
- Issues: (1) "Won the Champions League in my next final" is false: his next final after 2010 was 2012, lost to Chelsea; he won in 2013 and scored the winner. (2) RET wrong: retired again in 2021 after his Groningen comeback. Netherlands third at 2014 World Cup is correct.
- Proposed question: I lost a Champions League final and a World Cup final in the same year.\nI lost another Champions League final two years later, then scored the winner in the next one.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Arjen_Robben ; RECORDS (runner-up combinations)
- Confidence: high

### Q207: Vladimír Šmicer
- Verdict: KEEP
- Issues: none. Scored in the 2005 final; FA Cup 2001 with Liverpool; French title with Lens 1998. Retired 2009.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Vladim%C3%ADr_%C5%A0micer
- Confidence: high

### Q208: Claudio Bravo
- Verdict: REWORD
- Issues: (1) No longer second most capped for Chile: Alexis Sánchez 168, Gary Medel 161, Bravo 150 (and Arturo Vidal, still active, is on 147). (2) Not unique otherwise: Courtois is also a goalkeeper with the CL, Premier League and La Liga. (3) RET wrong: retired 2024 (last club Betis).
- Proposed question: I have a Champions League title to my name, and I captained my country to two Copa América wins.\nOther titles I've won include the Premier League and La Liga.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Chile_national_football_team ; https://en.wikipedia.org/wiki/Claudio_Bravo
- Confidence: high

### Q209: Ibrahim Afellay
- Verdict: FIX-FLAGS
- Issues: Facts hold (CL 2011 with Barcelona; 2010 World Cup runner-up; Greek title on loan at Olympiacos, Spanish and Dutch titles). RET wrong: retired 31 Jan 2021.
- Proposed flags: RET false→true
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Ibrahim_Afellay
- Confidence: high

### Q210: Robert Lewandowski
- Verdict: REWORD
- Issues: "I've never won the competition" is false since 23 Aug 2020 (Bayern beat PSG). He is third all-time on 109 goals and has been in the Squad of the Season four times. Still playing (Chicago Fire, 2026). The reword uses a timeless fact rather than his rank, which Mbappé or Haaland may overtake.
- Proposed question: I once scored four goals against Real Madrid in a Champions League semi-final, but lost the final that year.\nI finally won the competition seven years later with a different club.
- Shelf life: TIMELESS
- Sources: TOPSCORERS ; RECORDS (Four goals in a match: Dortmund 4-1 Real Madrid, 2012-13 SF) ; https://en.wikipedia.org/wiki/Robert_Lewandowski
- Confidence: high

### Q211: Park Ji-sung
- Verdict: KEEP
- Issues: none. Two Eredivisie titles with PSV plus four Premier League titles = 6; CL 2008; 2002 World Cup semi-final. Retired 2014.
- Shelf life: TIMELESS
- Sources: https://en.wikipedia.org/wiki/Park_Ji-sung
- Confidence: high

## Summary

| Verdict | Count |
|---|---|
| KEEP | 26 |
| FIX-FLAGS | 7 |
| REWORD | 27 |
| REPLACE | 1 |
| **Total** | **61** (ids 152-211, with 201 twice) |

RET flag changes proposed: 21 false→true (Casillas, Milner, Ibrahimović, Luiz Adriano, Khedira, Busquets, Fletcher, Iniesta, Rakitić, Gomis, Pepe, Aquilani, Seedorf, Mandžukić, Rooney, Arda Turan, Piqué, Robben, Bravo, Afellay, and Alan via REPLACE) and 1 true→false (Ronaldinho).

Data issues outside the text: duplicate id 201 (Beckham and Lucas Pérez); Q166 has a trailing newline.

### Could not verify or still uncertain
- Current playing status (RET) for Sergio Ramos (Q161), Dejan Lovren (Q167), Juan Mata (Q173), Lucas Pérez (Q201b): no retirement confirmed by a major outlet, all without a club or with unclear 2026-27 status. Left as RET false; re-check before launch.
- Ronaldinho (Q202): came out of retirement and played for Ravenna on 15 Nov 2026. Flag set to false, but this may reverse quickly.
- Milner single-season assists (Q155): sources disagree on whether his 9 was a record (UEFA-era reporting) or 8 behind Figo's 9 (Opta). The reword avoids the claim.
- Maxwell "over 90 CL appearances" (Q194) rests on one aggregator (StatMuse, 94).
- Crouch "13 CL goals" (Q199) depends on excluding qualifiers; the Spurs group/knockout split was reconstructed rather than read from one source.
- Neymar uniqueness (Q180) was spot-checked against 2015-2026 winners, not exhaustively for every winning squad.
- Luiz Adriano's exact retirement date (Q159) is not given; his article simply calls him a former player.
