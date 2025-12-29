async function mineOneIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Explore until an iron ore block is found
  const ironOreBlock = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName["iron_ore"].id,
      maxDistance: 32
    });
  });

  // Step 2: Check if an iron ore block was found
  if (ironOreBlock) {
    bot.chat("Found iron ore, preparing to mine it.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");
    } else {
      bot.chat("No iron pickaxe available.");
      return;
    }

    // Step 4: Mine the iron ore block
    await mineBlock(bot, "iron_ore", 1);
    bot.chat("Mined 1 iron ore.");
  } else {
    bot.chat("Could not find any iron ore nearby.");
  }
}