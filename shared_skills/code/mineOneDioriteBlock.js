async function mineOneDioriteBlock(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest diorite block
  const dioriteBlock = bot.findBlock({
    matching: mcData.blocksByName["diorite"].id,
    maxDistance: 32
  });

  // Step 2: Check if a diorite block was found
  if (dioriteBlock) {
    bot.chat("Found diorite, preparing to mine it.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");
    } else {
      bot.chat("No iron pickaxe available.");
      return;
    }

    // Step 4: Mine the diorite block
    await mineBlock(bot, "diorite", 1);
    bot.chat("Mined 1 diorite block.");
  } else {
    bot.chat("Could not find any diorite nearby.");
  }
}