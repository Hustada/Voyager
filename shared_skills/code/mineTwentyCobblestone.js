async function mineTwentyCobblestone(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Equip the iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available.");
    return;
  }

  // Step 2: Locate the nearest stone blocks
  let stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName["stone"].id,
    maxDistance: 32,
    count: 20
  });

  // Step 3: If not enough stone blocks are found, explore until we find them
  if (stoneBlocks.length < 20) {
    bot.chat("Not enough stone nearby, exploring to find more.");
    stoneBlocks = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlocks({
        matching: mcData.blocksByName["stone"].id,
        maxDistance: 32,
        count: 20
      });
    });
  }

  // Step 4: Mine the stone blocks
  if (stoneBlocks.length >= 20) {
    bot.chat("Found enough stone, mining now.");
    await mineBlock(bot, "stone", 20);
    bot.chat("Mined 20 cobblestone.");
  } else {
    bot.chat("Could not find enough stone.");
  }
}