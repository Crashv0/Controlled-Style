/** The style's id within the mod's namespace; saves store the selected style by it. */
export const STYLE_ID = 'controlledStyle';

const MELEE_SKILLS = ['melvorD:Attack', 'melvorD:Strength', 'melvorD:Defence'];

/**
 * The Controlled melee style: a small hidden level boost to each melee skill
 * and an even XP split between them.
 */
export const data: GameDataPackage = {
  $schema: 'https://melvoridle.com/assets/schema/gameData.json',
  data: {
    attackStyles: [
      {
        id: STYLE_ID,
        name: 'Controlled',
        modifiers: {
          flatHiddenSkillLevel: MELEE_SKILLS.map((skillID) => ({
            skillID,
            value: 2,
          })),
        },
        experienceGain: MELEE_SKILLS.map((skillID) => ({
          skillID,
          // A third of the 4 that each game style gives its one skill.
          ratio: 4 / 3,
        })),
        attackType: 'melee',
      },
    ],
  },
};
