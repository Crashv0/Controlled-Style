import manifest from '../../manifest.json';
import { STYLE_ID } from './data';

const STYLE = `${manifest.namespace}:${STYLE_ID}`;

/** Controlled aims with the average of the three melee attack bonuses. */
export const controlledBonus = (stab: number, slash: number, block: number) =>
  (stab + slash + block) / 3;

export function patchAccuracy(ctx: Modding.ModContext) {
  ctx.patch(Player, 'getAccuracyValues').after(function (accuracy) {
    if (this.attackType !== 'melee' || this.attackStyles.melee?.id !== STYLE)
      return accuracy;
    // The game's switch has no case for this style, so its bonus holds only what
    // it adds for every melee style (e.g. accuracy per attack interval). Add to it,
    // and round down as the game does.
    const { equipmentStats: stats, modifiers } = this;
    const bonus = controlledBonus(
      stats.stabAttackBonus + modifiers.flatStabAttackBonus,
      stats.slashAttackBonus + modifiers.flatSlashAttackBonus,
      stats.blockAttackBonus + modifiers.flatBlockAttackBonus,
    );
    accuracy.bonus = Math.floor(accuracy.bonus + bonus);
    return accuracy;
  });
}
