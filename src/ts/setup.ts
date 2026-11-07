import manifest from '../../manifest.json';
import { patchAccuracy } from './accuracy';
import { data } from './data';
import { patchTooltip } from './tooltip';

export async function setup(ctx: Modding.ModContext) {
  console.log(`[CAS] Controlled Style v${manifest.version} loading...`);
  mod.api.mythCombatSimulator?.registerNamespace(manifest.namespace);
  await ctx.gameData.addPackage(data);
  patchTooltip(ctx);
  patchAccuracy(ctx);
}
