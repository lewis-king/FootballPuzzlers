import { ScrollView, Text } from 'react-native';

import { NavBar } from '../ui/NavBar';
import { Screen } from '../ui/Screen';
import { T } from '../ui/theme';

// Lewis's 2019 How to Play text, lightly updated for the new clue names.
const SECTIONS: [string, string][] = [
  ['The game', "You'll be given some facts about a footballer and have to work out who's being described."],
  ['Answering', "Type the player's name. The surname is enough, though the full name is accepted too. Capitals and accents don't matter, but the spelling does."],
  ['Clues', 'Stuck? Each question lets you pick two yes or no clues about the player. Choose wisely.'],
  ['Positions', "Four clues are positions: Goalkeeper, Defender, Midfielder and Forward. Wing-backs count as defenders and wingers as midfielders. A player can have more than one position, like Wayne Rooney or James Milner, who played in several over their careers."],
  ['English', "The English clue means born in England. It isn't about which country they played for or could have played for."],
  ['Retired', 'The Retired clue is about where the player is now, as of December 2026.'],
  ['Reveal a letter', 'Still stuck? Watch a short ad to reveal the first letter of the surname, then the next. Up to three per question.'],
];

export default function HowToPlay() {
  return (
    <Screen>
      <NavBar title="How to play" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
        {SECTIONS.map(([h, p]) => (
          <Text key={h} style={{ marginBottom: 20 }}>
            <Text style={T.headline}>{h}{'\n'}</Text>
            <Text style={T.body}>{p}</Text>
          </Text>
        ))}
      </ScrollView>
    </Screen>
  );
}
