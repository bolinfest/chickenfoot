
sidebarWindow.addEventListener("keydown", shortcutHandler, true);

// Handle keyboard shortcuts
function shortcutHandler(/*Event*/ event) {
  if (event.ctrlKey) {
    // If a function below opens a dialog box (like openFile), then Firefox ends
    // up receiving and handling the key event too -- resulting in *two* open file dialogs.
    // Prevent this by deferring the call with setTimeout.
    switch (event.keyCode) {
      case 78: // Ctrl-N
        setTimeout(newFile, 0);
        event.stopPropagation();
        event.preventDefault();
        break;
      case 79: // Ctrl-O
        setTimeout(openFile, 0);
        event.stopPropagation();
        event.preventDefault();
        break;
      case 83: // Ctrl-S
        setTimeout(saveSelectedBuffer, 0);
        event.stopPropagation();
        event.preventDefault();
        break;
      case 87: // Ctrl-W
        setTimeout(closeSelectedBuffer, 0);
        event.stopPropagation();
        event.preventDefault();
        break;
    }
  }
}