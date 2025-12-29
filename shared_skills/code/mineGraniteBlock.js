async function mineGraniteBlock(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the granite block nearby
  const graniteBlock = bot.findBlock({
    matching: mcData.blocksByName["granite"].id,
    maxDistance: 32
  });

  // Step 2: Check if a granite block was found
  if (graniteBlock) {
    bot.chat("Found granite block, preparing to mine it.");

    // Step 3: Mine the granite block
    await mineBlock(bot, "granite", 1);
    bot.chat("Mined 1 granite block.");
  } else {
    bot.chat("Could not find any granite block nearby.");
  }
}