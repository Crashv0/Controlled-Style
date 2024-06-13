import ModData from '../data/data.json';
import manifest from '../../manifest.json';

export async function setup(ctx: Modding.ModContext) {
  console.log(`[CAS] Controlled Style v${manifest.version} loading...`);
  mod.api.mythCombatSimulator?.registerNamespace('controlledStyle');
  await ctx.gameData.addPackage(ModData);

  // fix controlled attack bonus tooltip
  ctx
    .patch(EquipmentTooltipElement, 'setItem')
    .after(function (o, item, showStats) {
      if (showStats) {
        item.equipmentStats.forEach((stat) => {
          if (stat.key.includes('controlledAttack')) {
            if (
              this.statContainer.lastChild &&
              this.statContainer.lastChild.textContent?.includes(
                'controlledAttack',
              )
            )
              this.statContainer.lastChild.remove();
            if (
              !this.statContainer.lastChild?.textContent?.includes(
                'Controlled Attack',
              )
            ) {
              let statValue = `${
                stat.value % 1 === 0
                  ? stat.value.toFixed(0)
                  : stat.value.toFixed(1)
              }`;
              if (stat.value > 0) statValue = '+' + statValue;
              this.statContainer.append(
                createElement('span', {
                  text: `${statValue} Controlled Attack Bonus`,
                  className: stat.value < 0 ? 'text-danger' : '',
                }),
              );
            }
          }
        });
      }
    });

  // all weapons and shields with attack bonuses
  const weaponsWithBonuses = game.items.weapons.allObjects.filter(
    (i) =>
      i.category === 'Combat' &&
      i.attackType === 'melee' &&
      i.validSlots.some((slot) => slot._localID === 'Weapon'),
  );
  const armorWithBonuses = game.items.equipment.allObjects.filter(
    (i) =>
      i.category === 'Combat' &&
      i.validSlots.some((slot) => slot._localID === 'Shield'),
  );
  const itemsWithBonuses = [...weaponsWithBonuses, ...armorWithBonuses];

  itemsWithBonuses.forEach((item) => {
    const controlledBonus = { key: 'controlledAttackBonus', value: 0 };
    item.equipmentStats.forEach((stat) => {
      if (
        ['stabAttackBonus', 'slashAttackBonus', 'blockAttackBonus'].some(
          (relStat) => stat.key.includes(relStat),
        )
      )
        controlledBonus.value += stat.value;
    });
    controlledBonus.value /= 3;
    item.equipmentStats.push(controlledBonus);
  });

  // add controlled style accuracy bonus
  ctx.patch(Player, 'getAccuracyValues').after(function (accuracy) {
    if (
      this.attackType === 'melee' &&
      this.attackStyles.melee?.id === 'controlledStyle:controlledStyle'
    ) {
      const stab =
        this.equipmentStats.stabAttackBonus +
        this.modifiers.flatStabAttackBonus;
      const slash =
        this.equipmentStats.slashAttackBonus +
        this.modifiers.flatSlashAttackBonus;
      const block =
        this.equipmentStats.blockAttackBonus +
        this.modifiers.flatBlockAttackBonus;
      accuracy.bonus = (stab + slash + block) / 3;
    }
    return accuracy;
  });
}
