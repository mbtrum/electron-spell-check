const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require('path')

//
// Functions
//

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            spellcheck: true
        }
    })

    win.loadFile('index.html')

    return win
}

//
// Events (main processing)
//

app.whenReady().then(() => {

    const mainWindow = createWindow();

    mainWindow.webContents.once('dom-ready', () => {
    })

    // Spell Check context Menu
    mainWindow.webContents.on('context-menu', (event, params) => {
        const menu = new Menu()
        
        // Add each spelling suggestion
        for (const suggestion of params.dictionarySuggestions) {
            menu.append(new MenuItem({
                label: suggestion,
                click: () => mainWindow.webContents.replaceMisspelling(suggestion)
            }))
        }

        // Allow users to add the misspelled word to the dictionary
        if (params.misspelledWord) {
            menu.append(
                new MenuItem({
                    label: 'Add to dictionary',
                    click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
                })
            )
        }

        if (params.dictionarySuggestions.length > 0) {
            menu.popup()
        }        
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

