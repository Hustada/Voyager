async function mineCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the copper ore block nearby
  const copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName["copper_ore"].id,
    maxDistance: 32
  });
  if (copperOreBlock) {
    bot.chat("Found copper ore, preparing to mine it.");

    // Step 2: Equip a stone pickaxe
    const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
    if (stonePickaxe) {
      await bot.equip(stonePickaxe, "hand");
      bot.chat("Equipped stone pickaxe.");

      // Step 3: Mine the copper ore block
      await mineBlock(bot, "copper_ore", 1);
      bot.chat("Mined 1 copper ore.");
    } else {
      bot.chat("No stone pickaxe available.");
    }
  } else {
    bot.chat("Could not find any copper ore nearby.");
  }
}