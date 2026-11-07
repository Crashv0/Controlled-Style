import { controlledBonus } from './accuracy';

const LABEL = 'Controlled Attack Bonus';
const TAG = 'data-controlled-style';
const MELEE_ATTACK_STATS = [
  'stabAttackBonus',
  'slashAttackBonus',
  'blockAttackBonus',
] as const;

/** Formats like the game's stats: whole numbers plain, otherwise one decimal, "+" when positive. */
function formatBonus(value: number) {
  const text = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return value > 0 ? `+${text}` : text;
}

/**
 * Adds a "Controlled Attack Bonus" line to the equipment tooltip of any item
 * with a stab, slash or block bonus, worked out from those stats each time the
 * tooltip is drawn, so item data stays as the game defines it. `setItem`
 * returns early without redrawing when shown the same item again, so the line
 * is tagged and replaced rather than appended twice.
 */
export function patchTooltip(ctx: Modding.ModContext) {
  ctx
    .patch(EquipmentTooltipElement, 'setItem')
    .after(function (_returned, item, showStats) {
      if (!showStats) return;
      this.statContainer.querySelector(`[${TAG}]`)?.remove();
      const [stab, slash, block] = MELEE_ATTACK_STATS.map((key) =>
        item.equipmentStats.reduce(
          (sum, stat) => (stat.key === key ? sum + stat.value : sum),
          0,
        ),
      );
      if (stab === 0 && slash === 0 && block === 0) return;
      const bonus = controlledBonus(stab, slash, block);
      this.statContainer.append(
        createElement('span', {
          text: `${formatBonus(bonus)} ${LABEL}`,
          className: bonus < 0 ? 'text-danger' : '',
          attributes: [[TAG, '']],
        }),
      );
    });
}
