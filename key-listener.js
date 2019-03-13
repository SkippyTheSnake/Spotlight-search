// Key listener
app.on("ready", () => {
  // On lose focus hide window
  mainWindow.on("blur", function(e, cmd) {
    mainWindow.hide();
    return;
  });

  // Register command
  globalShortcut.register("Ctrl+Space", () => {
    mainWindow.show();
  });
});

// Unregister all shortcuts on quit
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
