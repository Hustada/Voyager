async function mineThreeCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest coal ore block
  const coalOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32,
    count: 3
  });
  if (coalOreBlocks.length > 0) {
    bot.chat("Found coal ore, mining it now.");

    // Step 2: Mine the coal ore blocks
    await mineBlock(bot, "coal_ore", 3);
    bot.chat("Mined 3 coal ore.");
  } else {
    bot.chat("Could not find enough coal ore nearby.");
  }
}