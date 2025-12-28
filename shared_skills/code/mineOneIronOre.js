async function mineOneIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest iron ore block
  const ironOreBlock = bot.findBlock({
    matching: mcData.blocksByName["iron_ore"].id,
    maxDistance: 32
  });

  // Step 2: Mine the iron ore block if found
  if (ironOreBlock) {
    bot.chat("Found iron ore, mining it now.");
    await mineBlock(bot, "iron_ore", 1);
    bot.chat("Mined 1 iron ore.");
  } else {
    bot.chat("Could not find any iron ore nearby.");
  }
}