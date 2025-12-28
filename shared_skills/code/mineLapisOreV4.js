async function mineLapisOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Explore until a lapis ore block is found
  const lapisOreBlock = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName["lapis_ore"].id,
      maxDistance: 32
    });
  });

  // Step 2: Check if a lapis ore block was found
  if (lapisOreBlock) {
    bot.chat("Found lapis ore, preparing to mine it.");

    // Step 3: Mine the lapis ore block
    await mineBlock(bot, "lapis_ore", 1);
    bot.chat("Mined 1 lapis ore.");
  } else {
    bot.chat("Could not find any lapis ore nearby.");
  }
}