async function checkItemsInSpecificChest(bot) {
  const chestPosition = new Vec3(-1007, 63, -195);
  await moveToChest(bot, chestPosition);
  const chestBlock = bot.blockAt(chestPosition);
  const chest = await bot.openContainer(chestBlock);
  bot.chat("Opened the chest at (-1007, 63, -195). Checking items...");
  // Assuming you want to log the items in the chest
  const items = chest.containerItems();
  items.forEach(item => {
    bot.chat(`Item: ${item.name}, Count: ${item.count}`);
  });
  await closeChest(bot, chestBlock);
  bot.chat("Checked items and closed the chest.");
}