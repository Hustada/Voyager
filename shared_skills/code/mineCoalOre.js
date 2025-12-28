async function mineCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest coal ore block
  const coalOreBlock = bot.findBlock({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32
  });
  if (coalOreBlock) {
    bot.chat("Found coal ore, mining it now.");

    // Step 2: Mine the coal ore block
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Mined 1 coal ore.");
  } else {
    bot.chat("Could not find any coal ore nearby.");
  }
}