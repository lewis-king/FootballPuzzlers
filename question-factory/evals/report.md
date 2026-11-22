# Fact-checker eval

2026-11-19 · models qwen3.8:27b, gemma4:31b · prompt efea974e8a258eba2082 · 211 cases

**False questions caught: 96%** (102). **True questions wrongly failed on facts: 61%** (109).

True originals also flagged as dated wording: 30; as not unique: 29 (informational: old present-tense records are dated by our rules).

## Pass / review / fail (fact cases)

PASS goes through, REVIEW goes to a person or back to the writer, FAIL is rejected. The number that matters most is false questions that PASS.

| | PASS | REVIEW | FAIL |
|---|---|---|---|
| true questions | 43 | 51 | 15 |
| false questions | 1 | 18 | 49 |

False questions that passed: G1 Rodri

| Category | Correct | Cases |
|---|---|---|
| fallen_record | 18 | 18 |
| generated_error | 1 | 2 |
| not_unique | 9 | 12 |
| out_of_date | 4 | 4 |
| perturbed_club | 6 | 6 |
| perturbed_number | 31 | 31 |
| perturbed_word | 15 | 15 |
| perturbed_year | 3 | 3 |
| true_original | 43 | 109 |
| wrong_when_written | 11 | 11 |

## Each model alone vs together (facts and true-question cases)

| Checker | Correct | Cases |
|---|---|---|
| qwen3.8:27b | 100 | 177 |
| gemma4:31b | 109 | 177 |

## Misses and false alarms

- **Q27 Alan Shearer** (not_unique): "I've missed the most Premier League penalties in history with 11"
  - failed claims: Alan Shearer has missed 11 Premier League penalties. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]; Alan Shearer holds the record for missing the most Premier League penalties in history. -> CONTRADICTED [qwen3.8: NOT_FOUND] [gemma4: CONTRADICTED]
- **Q29 Emile Heskey** (not_unique): 'I reached the 100 goal mark in the Premier League without scoring from the penalty spot.\nI played for 5 different Premier League teams but never won the league'
  - failed claims: Emile Heskey never won the league -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
- **Q171 Marcus Rashford** (not_unique): 'I was on the scoresheet in the 2nd leg of a game which saw our club, the first team in Champions League history to qualify after losing the home 1st leg by two goals'
  - failed claims: The club Marcus Rashford played for in that game was the first team in Champions League history to qualify after losing the home 1st leg by two goals. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **G1 Rodri** (generated_error, manager is not a team-mate): "I've played with the likes of Guardiola at City before moving to Barcelona."
  - others: Sergio Agüero, David Silva, Ferran Torres
- **Q1 Steven Gerrard** (true_original): 'I was the first player to have won more than 5 Player of the Month awards in the Premier League'
  - failed claims: Steven Gerrard is the first player to have won more than 5 Player of the Month awards in the Premier League. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q9 Sadio Mané** (true_original): "I've scored the fastest Premier League hat-trick.\nThe following year I was named in the PFA Premier League Team of the Year after scoring 13 league goals.\nI've represented my country at the African Cup of Nations."
  - failed claims: The year after scoring the fastest Premier League hat-trick, Sadio Mané was named in the PFA Premier League Team of the Year. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q17 Louis Saha** (true_original): 'I played for Alex Ferguson, won the Premier League and the Champions League. My teammates included Arteta, Mignolet, Shearer, Klose, Bale, Rodwell, Adebayor, Duff, Cahill, Drenthe. Who am I?'
  - failed claims: Cesc Fabregas was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Alan Shearer was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Gareth Bale was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Andy Rodwell was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Emmanuel Adebayor was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]; John Duff was a teammate of Louis Saha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Gary Ca
- **Q19 James Milner** (true_original): "I scored my first Premier League goal at the age of 16.\nSome of the names I've been managed by are Allardyce, Rodgers, Mancini & O'Neill"
  - failed claims: Mick O'Neill managed James Milner. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q21 Sébastien Bassong** (true_original): "I have been relegated from the Premier League 4 times with 3 different clubs.\nI've played for my country (Cameroon) at a World Cup, have been managed by Harry Redknapp and have played in the same team as Defoe and Bale"
  - failed claims: Sébastien Bassong has been relegated from the Premier League 4 times. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]; Sébastien Bassong has been managed by Harry Redknapp. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Sébastien Bassong has played in the same team as Defoe and Bale. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q28 Mario Balotelli** (true_original): "I've represented my country at both the Euros and World Cup.\nI was Man of the Match in an FA Cup Final and also have won the Premier League and Champions League.\nI've played with Flamini, Kolo Touré, Coutinho & Aquilani"
  - failed claims: Mario Balotelli played with Aquilani. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q32 José Bosingwa** (true_original): "I've not won the Premier League but have won the Champions League with an English club having played in defence during the match.\nThe following season the team I played for was relegated"
  - failed claims: José Bosingwa has never won the Premier League. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]; José Bosingwa played in defence during the Champions League match he won with his English club. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]; The team José Bosingwa played for was relegated the season following the one in which he won the Champions League with that English club. -> NOT_FOUND [qwen3.8: NOT_FOUND (contradiction quote not in evidence)] [gemma4: NOT_FOUND]
  - others: Rio Ferdinand, Nemanja Vidić, Patrice Evra, Rafael da Silva, Jonny Evans
- **Q33 Gervinho** (true_original): "Some of the clubs I have played for include Roma, Arsenal and Lille.\nI'm an African Cup of Nations winner.\nPlayers I have played with include Podolski, Ashley Cole & Idrissa Gueye"
  - failed claims: Gervinho has played with Idrissa Gueye. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q34 Robbie Keane** (true_original): "I'm the all-time leading goalscorer for my country and I've scored a total of 3 hat-tricks in the Premier League.\nI've been managed by Glenn Hoddle & Rafael Benítez and have played in the same side as Cudicini & Ashley C"
  - failed claims: Robbie Keane has scored a total of 3 hat-tricks in the Premier League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Rafael Benítez managed Robbie Keane. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Robbie Keane played in the same side as Cudicini. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Robbie Keane played in the same side as Ashley Cole. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q35 Ricardo Quaresma** (true_original): "I've played for Chelsea and have been managed by the likes of Mourinho & Scolari. My teammates have included Demba Ba, Malouda, Pepe & Arnautović.\nI've won 3 different top flight European domestic leagues"
  - failed claims: Ricardo Quaresma was managed by Luiz Felipe Scolari. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Salomon Malouda was a teammate of Ricardo Quaresma. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Marko Arnautović was a teammate of Ricardo Quaresma. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Ricardo Quaresma won 3 different top flight European domestic leagues. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q36 Ole Gunnar Solskjær** (true_original): "I've scored more Premier League goals than Dennis Bergkamp.\nI've won the Premier League and FA Cup, but not the League Cup.\nI've scored a goal in the Champions League Final.\nSince retiring from playing, I have managed a "
  - failed claims: Ole Gunnar Solskjær has scored more Premier League goals than Dennis Bergkamp. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Ole Gunnar Solskjær did not win the League Cup. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
- **Q37 Andy Johnson** (true_original): "I've scored the most goals in a Premier League season for a relegated club, this also made me the highest scoring Englishman in the league that season.\nI've been managed by David Moyes & Steve McClaren"
  - failed claims: Andy Johnson scored the most goals in a Premier League season for a relegated club. -> CONTRADICTED [qwen3.8: NOT_FOUND] [gemma4: CONTRADICTED]
- **Q38 El Hadji Diouf** (true_original): "I've won the Scottish Premier League with Rangers and have been named African Player of the Year on multiple occasions.\nPele included me in his FIFA 100 - 'greatest living footballers'.\nI've played with Phil Jones & Carr"
  - failed claims: El Hadji Diouf played with Phil Jones and Carragher. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q39 Kevin Phillips** (true_original): "I've scored 30 goals or more in a Premier League season which earned me the Golden Boot and also the European Golden Shoe.\nI've been managed by Alex McLeish & Kevin Keegan and have played in the same team as Milan Baros "
  - failed claims: Djemba-Djemba played in the same team as Kevin Phillips. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q45 Bobby Zamora** (true_original): "I've scored a Premier League penalty with both feet.\nTeams I've played for include Spurs, QPR & West Ham.\nI played Sunday League football for Senrab FC alongside John Terry & Ledley King.\nI've won the Second & Third Divi"
  - failed claims: Bobby Zamora scored a Premier League penalty with his left foot. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Bobby Zamora scored a Premier League penalty with his right foot. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Bobby Zamora played Sunday League football for Senrab FC. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND (support quote not in evidence)]; Bobby Zamora won the Second Division Golden Boot. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **Q46 Yossi Benayoun** (true_original): "I've scored a hat-trick in the Premier League, FA Cup and Champions League.\nI've played on the same team as Walcott, Gerrard & Terry during my career."
  - failed claims: Yossi Benayoun played on the same team as Walcott during his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q50 George Boyd** (true_original): "I've been capped internationally for Scotland and have played for two relegated Premier League teams in the same season.\nI've played in all 4 professional domestic England leagues and have made the PFA Team of the Year i"
  - failed claims: George Boyd played for two relegated Premier League teams in the same season. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]; George Boyd has played in all 4 professional domestic England leagues. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]; George Boyd was promoted to the Premier League with two different clubs. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
- **Q51 Dirk Kuyt** (true_original): "I'm an attacking player who has played with the likes of Torres, Kalou, Alonso & Keane.\nAfter scoring a hat-trick in the last game of the season to secure my club their first league title in the 21st century I announced "
  - failed claims: Dirk Kuyt played with Xabi Alonso. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Dirk Kuyt played with Robbie Keane. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q54 Iago Aspas** (true_original): "I'm a striker who ended up taking more corners than having shots during my time in the Premier League.\nSome of the players I have played with include Nolito, Luis Suárez & Juan Mata.\nI've scored an International goal aga"
  - failed claims: During Iago Aspas's time in the Premier League, he took more corners than he had shots. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Iago Aspas played with Juan Mata. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND (support quote not in evidence)]
- **Q58 Damien Duff** (true_original): 'During my playing career (now retired), I have been managed by the likes of Souness, Mourinho, Ranieri & Allardyce.\nIn 2002 I made the UEFA Team of the Year which featured the likes of Ronaldo(9), Henry & Zidane'
  - failed claims: Sam Allardyce managed Damien Duff during his playing career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q59 Pascal Cygan** (true_original): "I'm a French player who was part of the invincibles Arsenal team which famously won the Premier League without being beaten.\nI did not get on the scoresheet during that season.\nFollowing my time at Arsenal, I moved to Sp"
  - failed claims: Pascal Cygan was part of the Arsenal team that won the Premier League without being beaten. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]; Pascal Cygan did not score any goals during the season in which Arsenal won the Premier League without being beaten. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q61 Fábio da Silva** (true_original): "I'm a Brazilian international who has won a Premier League medal.\nSome players I've played with include Bosingwa, Zaha, & Negredo and I've been managed by Harry Redknapp"
  - failed claims: Fábio da Silva is a Brazilian international. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Fábio da Silva has won a Premier League medal. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Fábio da Silva played with Bosingwa. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Fábio da Silva played with Zaha. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Fábio da Silva played with Negredo. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Fábio da Silva was managed by Harry Redknapp. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q62 Emmanuel Adebayor** (true_original): "I've scored hat-tricks against the same club in both matches of a Premier League season.\nI have a Champions League runners up medal with Monaco and a Copa del Rey winners medal with Real Madrid.\nI've played in the same t"
  - failed claims: Emmanuel Adebayor played in the same team as Zaha and Toure. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q64 Paulinho** (true_original): "I've won a Fifa Club World Cup beating Chelsea in the final.\nI've been managed by the likes of Pochettino & Valverde. Scolari has managed me for both club and country and I've won the Chinese domestic treble having also "
  - failed claims: Luiz Felipe Scolari managed Paulinho at club level. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]; Paulinho won the Chinese domestic treble. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
- **Q69 Jordi Gómez** (true_original): "I'm a midfielder who has won the FA Cup.\nI've been at the same club at the same time as the likes of Ronaldhino, Vito Mannone, Eto'o, Defoe & Victor Moses.\nI've also scored a Premier League hat-trick"
  - failed claims: Jordi Gómez was at the same club as Ronaldhino, Vito Mannone, Eto'o, Defoe & Victor Moses at the same time. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Victor Wanyama, Nacer Chadli, Aaron Lennon, Benoît Assou-Ekotto, Paulo Gazzaniga, Kyle Walker, Mason Ledley, Christian Eriksen
- **Q74 Maxi Rodríguez** (true_original): 'I won the English League Cup during my time in the Premier League.\nPlayers I have played with include Joe Cole, Reyes, Doni & Forlán and I have a FIFA World Cup runners up medal to my name'
  - failed claims: Maxi Rodríguez played with Joe Cole. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Gabriel Heinze, Cristian Ansaldi, Robbie Keane
- **Q75 Mikael Forssell** (true_original): "Some of the teams I've played for include Leeds United, Crystal Palace, Birmingham City & Chelsea.\nI've played with Drogba, Sebastian Larsson & Cameron Jerome to name a few."
  - failed claims: Mikael Forssell played with Drogba. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Mikael Forssell played with Sebastian Larsson. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Mikael Forssell played with Cameron Jerome. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND (support quote not in evidence)]
- **Q76 Antonio Rüdiger** (true_original): "My teammates have included the likes of Ozil, Mustafi, Giroud & Gervinho.\nI've won the FA cup having been named Man of the Match in the final."
  - failed claims: Antonio Rüdiger's teammates have included Mesut Özil. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Antonio Rüdiger's teammates have included Shkodran Mustafi. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Antonio Rüdiger was named Man of the Match in the FA Cup final he won. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **Q78 Oscar** (true_original): "I've won the Premier League on more than one occasion.\nI've had André Villas-Boas & Rafael Benítez as managers and have played with the likes of Maicon & Pedro "
  - failed claims: Oscar played with Maicon as a teammate. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q80 Igor Bišćan** (true_original): "I've had 5 seasons in the Premier League managing to score 2 league goals.\nI've played with Owen & Davor Suker to name a couple.\n11 out of the 15 international games I played in ended in a draw."
  - failed claims: Igor Bišćan played with Davor Suker. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q81 Shay Given** (true_original): "I've made over 375 Premier League appearances but never managed to win the Premier League.\nDuring my career I've played with the likes of Sylvinho, Schmeichel and Crouch"
  - failed claims: Shay Given never won the Premier League. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]; Shay Given played with Sylvinho during his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Shay Given played with Schmeichel during his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Brad Friedel
- **Q82 Jérémie Aliadière** (true_original): "My greatest sporting achievement is winning the Premier League, a season in which I made 10 appearances but did not find the net.\nI've played with Huth, Cole and Sheringham"
  - failed claims: In the season Jérémie Aliadière won the Premier League, he did not find the net (scored 0 goals). -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Jérémie Aliadière played with Huth. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Jérémie Aliadière played with Cole. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Jérémie Aliadière played with Sheringham. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Sylvain Distin, Gaël Clichy
- **Q83 André Bikey** (true_original): "My teammates have included Woodgate, Steven Fletcher, Sammy Ameobi & Shane Long.\nI've played in the Premier League, Russian Premier League & Indian Super League during my career but have not won any of them"
  - failed claims: André Bikey's teammates included Woodgate. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; André Bikey's teammates included Steven Fletcher. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; André Bikey's teammates included Sammy Ameobi. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; André Bikey's teammates included Shane Long. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; André Bikey has not won the Premier League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; André Bikey has not won the Russian Premier League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: N
- **Q84 Denis Irwin** (true_original): "I've won the Premier League, FA Cup, League Cup & Champions League.\nMy final season in the Premier League ended in relegation.\nI have a higher penalty conversion percentage than Wayne Rooney"
  - failed claims: Denis Irwin has a higher penalty conversion percentage than Wayne Rooney. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Ryan Giggs, Paul Scholes
- **Q86 Romelu Lukaku** (true_original): "I'm in the top 30 all-time Premier League goalscorers.\nI've played in the same team as Shane Long, Alexis Sánchez & Raul Meireles"
  - failed claims: Romelu Lukaku is in the top 30 all-time Premier League goalscorers. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Romelu Lukaku has played in the same team as Raul Meireles. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q87 Jeffrey Schlupp** (true_original): "I've won both the Championship and Premier League.\nI've played with the likes of Asamoah Gyan, Christian Benteke & Mamadou Sakho"
  - failed claims: Jeffrey Schlupp played with Asamoah Gyan. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Christian Benteke, Mamadou Sakho, Asamoah Gyan, Yohan Cabaye, None
- **Q88 Gabriel Obertan** (true_original): "I've played with Rooney, Evra and Ben Arfa.\nSome of the clubs I've played for include Man United and Anzhi, but I've never won a domestic league title"
  - failed claims: Gabriel Obertan has played with Patrice Evra. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Gabriel Obertan has never won a domestic league title. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: CONTRADICTED]
- **Q89 Antonio Valencia** (true_original): "I've made over 300 appearances for my Premier League club.\nDuring this time I've won the Premier League, FA Cup and League Cup.\nI've won the Europa League but never the Champions League"
  - failed claims: Antonio Valencia has never won the Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
  - others: Phil Jones, Michael Carrick, Gary Neville, Ryan Giggs
- **Q111 Michael Owen** (true_original): "A goal I've scored in a WC is still mentioned today.\nThe team it was against included Nelson Vivas"
  - failed claims: Michael Owen has scored a goal in a World Cup that is still mentioned today. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; The team Michael Owen scored against in the World Cup included Nelson Vivas. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q114 Gonzalo Higuaín** (true_original): "Some of the names I've been managed by include Pellegrini and Sarri.\nI've scored a hat-trick in a WC and have played in Serie A, Premier League and La Liga during my club career"
  - failed claims: Gonzalo Higuaín was managed by Manuel Pellegrini. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q115 Ryan Nelsen** (true_original): "I've captained a side which went unbeaten in a WC.\nPlayers I've played with during my career include Gareth Bale & Louis Saha"
  - failed claims: Ryan Nelsen played with Gareth Bale during his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q122 Filippo Inzaghi** (true_original): "I've scored over 300 goals for club and country combined.\nI've won the WC and have continued in the game as a manager.\nMy entire career has been spent in just the one country"
  - failed claims: Filippo Inzaghi has continued in the game as a manager. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND (support quote not in evidence)]
  - others: Ronaldo (Nazário), Zinedine Zidane
- **Q124 Toni Kroos** (true_original): "I've scored the fastest brace in a WC.\nYet I've only scored a total of 3 WC goals.\nMy brace was scored in the tournament we went on to win"
  - failed claims: Toni Kroos has only scored a total of 3 goals in World Cups. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: CONTRADICTED]
- **Q126 James Rodríguez** (true_original): "In a single WC I managed to score in every group match, the Round of 16 and the Quarter-finals.\nThat's 5 consecutive WC matches"
  - failed claims: James Rodríguez scored in the Quarter-finals at that same World Cup. -> NOT_FOUND [qwen3.8: SUPPORTED] [gemma4: CONTRADICTED]; James Rodríguez scored in 5 consecutive matches at a single World Cup. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q128 Esteban Cambiasso** (true_original): 'I converted arguably the best team goal in WC history, which involved 24 passes in the build up'
  - failed claims: Esteban Cambiasso scored a goal at the World Cup that is considered by some to be the best team goal in World Cup history. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q133 Sol Campbell** (true_original): "I'm one of only a few players to make the All-Star Team for a WC for my country, albeit for a tournament we got knocked out in the quarter-finals in.\nIt was a tournament I scored my only international senior goal in a ca"
  - failed claims: Sol Campbell is one of only a few players to make the All-Star Team for a World Cup for his country. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; The World Cup tournament in which Sol Campbell made the All-Star Team was one where his country was knocked out in the quarter-finals. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
  - others: Rio Ferdinand, Ashley Cole, Gareth Barry, Frank Lampard, Steven Gerrard, Wayne Rooney, John Terry, David Beckham
- **Q142 Jung-hwan Ahn** (true_original): 'I was the highest goalscorer for my country in a WC campaign that included us making the Semi-finals.\nMy goals were scored against the USA and Italy, the latter sending the opposition out of the competition'
  - failed claims: Jung-hwan Ahn was the highest goalscorer for his country in a World Cup campaign. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; The goal Jung-hwan Ahn scored against Italy sent the opposition out of the competition. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **Q150 Oliver Kahn** (true_original): "I once said 'I have all due respect for Ronaldo, Ronaldinho and Rivaldo, who are fantastic players, but they still have to beat me'"
  - failed claims: Oliver Kahn stated that he has all due respect for Ronaldo, Ronaldinho, and Rivaldo. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Oliver Kahn described Ronaldo, Ronaldinho, and Rivaldo as fantastic players in his statement. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Oliver Kahn stated that Ronaldo, Ronaldinho, and Rivaldo still have to beat him. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q161 Sergio Ramos** (true_original): "I've been shown more yellow cards than any other player in the history of the Champions League"
  - failed claims: Sergio Ramos has been shown more yellow cards than any other player in the history of the Champions League -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **Q162 Carlos Martins** (true_original): "I've made 4 assists in a single Champions League game.\nThe opposition in that game was Lyon"
  - failed claims: Carlos Martins has made 4 assists in a single Champions League game. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; The opposition in the Champions League game where Carlos Martins made 4 assists was Lyon. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q177 Andrés Iniesta** (true_original): "I'm the first player to have assisted a goal in 3 different Champions League finals.\nI'm also the only player to have won Man of the Match in a Champions League, Euros and World Cup final"
  - failed claims: Andrés Iniesta is the first player to have assisted a goal in 3 different Champions League finals. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q179 Ivan Rakitić** (true_original): 'I made history by becoming the first player to win the Champions League a year after winning the Europa League.\nI was Man of the Match in the Europa League final and made Team of the Season in the Champions League winnin'
  - failed claims: Ivan Rakitić became the first player to win the UEFA Champions League a year after winning the UEFA Europa League. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: CONTRADICTED]
- **Q180 Neymar** (true_original): "I've won the Champions League having scored a goal in both Quarter-final and Semi-final legs as well as scoring in the Final"
  - failed claims: In that specific Champions League campaign, Neymar scored a goal in both legs of the Quarter-final stage. -> NOT_FOUND [qwen3.8: CONTRADICTED] [gemma4: SUPPORTED]
- **Q182 Álvaro Arbeloa** (true_original): "I've won and lost a Champions League final.\nSome of the players that featured in those finals include Pirlo, Ronaldo & Alonso"
  - failed claims: Andrea Pirlo featured in one of the UEFA Champions League finals that Álvaro Arbeloa won or lost. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Xabi Alonso featured in one of the UEFA Champions League finals that Álvaro Arbeloa won or lost. -> CONTRADICTED [qwen3.8: NOT_FOUND] [gemma4: CONTRADICTED]
  - others: Gareth Bale, Sergio Ramos, Iker Casillas, Xabi Alonso, Peppe Reina
- **Q184 Luka Modrić** (true_original): "Teammates I've played with in the Champions League include Gallas, Morata, Pienaar & Di Maria"
  - failed claims: Luka Modrić played with William Gallas as a teammate in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Luka Modrić played with Steven Pienaar as a teammate in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q186 N'Golo Kanté** (true_original): 'I made the UEFA Team of the Year in what was my first season playing in the Champions League.\nA teammate during that season was Álvaro Morata'
  - failed claims: The season in which N'Golo Kanté made the UEFA Team of the Year was his first season playing in the Champions League. -> CONTRADICTED [qwen3.8: CONTRADICTED] [gemma4: NOT_FOUND]
- **Q187 Bernardo Silva** (true_original): "Players I've played with in the Champions League include Sergio Aguero, Kylian Mbappé, Tiemoué Bakayoko & Benjamin Mendy"
  - failed claims: Bernardo Silva has played with Kylian Mbappé in the Champions League -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Bernardo Silva has played with Benjamin Mendy in the Champions League -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: David Silva, João Cancelo
- **Q189 Alberto Aquilani** (true_original): "Some of the teams I've represented in the Champions League include Liverpool, Roma & Milan.\nI've never won the Champions League"
  - failed claims: Alberto Aquilani represented Roma in the Champions League -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Alberto Aquilani has never won the Champions League -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND]
  - others: Daniel Osvaldo, Pep Belevich
- **Q190 Raheem Sterling** (true_original): "Players I've played with in the Champions League include Sakho, Balotelli, Sagna & both Touré brothers"
  - failed claims: Raheem Sterling played with Mamadou Sakho in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Raheem Sterling played with Mario Balotelli in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Raheem Sterling played with Bacary Sagna in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Raheem Sterling played with Yaya Touré and Kolo Touré together in the UEFA Champions League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Bacary Sagna, Gaël Clancy/Other City squad members
- **Q191 Thiago Motta** (true_original): "I've won the Champions League with more than one club.\nSamuel Eto'o was a teammate I played with during both of those successful campaigns"
  - failed claims: Thiago Motta has won the UEFA Champions League with more than one club. -> NOT_FOUND [qwen3.8: NOT_FOUND (support quote not in evidence)] [gemma4: NOT_FOUND (support quote not in evidence)]; Samuel Eto'o was a teammate of Thiago Motta during both of those successful campaigns. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Maxwell
- **Q192 Oriol Romeu** (true_original): "I'm a Champions League and Europa League winner.\nPlayers I've played with in the past include Alves, Torres, Keita & Lukaku"
  - failed claims: Oriol Romeu won the UEFA Europa League. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Oriol Romeu played with Dani Alves at some point in his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Oriol Romeu played with Naby Keita at some point in his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Oriol Romeu played with Romelu Lukaku at some point in his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Sergio Busquets, Jordi Alba, Cesc Fabregas
- **Q194 Maxwell** (true_original): "I'm a South American player who has played over 90 Champions League games.\nThe teams I achieved this with include Inter, PSG, Ajax & Barcelona"
  - failed claims: Maxwell has played over 90 Champions League games. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Inter was one of the teams with which Maxwell achieved playing over 90 Champions League games. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; PSG was one of the teams with which Maxwell achieved playing over 90 Champions League games. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Ajax was one of the teams with which Maxwell achieved playing over 90 Champions League games. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Barcelona was one of the teams with which Maxwe
- **Q197 Mario Mandžukić** (true_original): "I've opened the scoring in a Champions League final and I've also been a top scorer in a Euros.\nSome of the players I've played with include Shaqiri, Jiménez, Can & Kroos"
  - failed claims: Héctor Jiménez is one of the players Mario Mandžukić has played with. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q199 Peter Crouch** (true_original): "I've scored 13 Champions League goals in my career.\nTeammates I've played with over the years include Bale, Mascherano & Sol Campbell"
  - failed claims: Peter Crouch has scored 13 Champions League goals in his career. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Xavi Mascherano was a teammate of Peter Crouch at some point during their careers. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]; Sol Campbell was a teammate of Peter Crouch at some point during their careers. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
- **Q204 Xherdan Shaqiri** (true_original): "I'm part of a treble winning team which includes winning the Champions League.\nPlayers I have played with include Can, Xhaka & Salah"
  - failed claims: Xherdan Shaqiri played with Can. -> CONTRADICTED [qwen3.8: NOT_FOUND] [gemma4: CONTRADICTED]
  - others: Emre Can, Granit Xhaka, Mohamed Salah
- **Q211 Park Ji-sung** (true_original): "I've won 6 domestic top-flight titles, but my greatest team achievement quite possibly is winning the Champions League.\nThe furthest I have got with my country in a FIFA World Cup is the Semi-finals"
  - failed claims: Park Ji-sung has won 6 domestic top-flight titles. -> NOT_FOUND [qwen3.8: NOT_FOUND (contradiction quote not in evidence)] [gemma4: NOT_FOUND (support quote not in evidence)]; The furthest Park Ji-sung has got with his country in a FIFA World Cup is the Semi-finals. -> NOT_FOUND [qwen3.8: NOT_FOUND] [gemma4: NOT_FOUND]
  - others: Cristiano Ronaldo, Wayne Rooney, Patrice Evra, Rio Ferdinand
