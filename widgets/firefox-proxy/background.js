browser.runtime.onInstalled.addListener(() => {
  restoreSelectedProxy().catch(console.error);
});

browser.runtime.onStartup.addListener(() => {
  restoreSelectedProxy().catch(console.error);
});

restoreSelectedProxy().catch(console.error);
