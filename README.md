# Carden
![Demo](https://media.giphy.com/media/ixBAW98ih0qOo2kf4u/giphy.gif)
<br>

Flashcards with spaced repetition and gamification 🌱

Carden is a Chrome Extension that helps you turn the content you consume into long-term knowledge. Create flashcards in context, view in-depth stats, collect points and level up, and much more.

[Get it now](https://chrome.google.com/webstore/detail/screenity-screen-recorder/kbbdabhdfibnancpjfhlkhafgdilcnji)

Made by [Anne-Laure Le Cunff](https://twitter.com/anthilemoon) & [Alyssa X](https://alyssax.com)

## Table of contents
- [Features](#features)
- [Self-hosting Carden](#self-hosting-carden)
- [Libraries used](#libraries-used)

## Features
🔬 Practice using spaced repetition based on the evidence-based [SM2 algorithm](https://en.wikipedia.org/wiki/SuperMemo)<br>
✏️ Create flashcards in context whenever you read something interesting<br>
🗄️ Organize your flashcards into decks<br>
🏆 Collect points and level up as you practice and grow your knowledge<br>
🧩 Cross-compatible with apps like Anki, Quizlet, Brainscape, and more<br>
📦 Import and export flashcards as .txt and .csv files<br>
📊 View and download in-depth stats<br>
...and much more!

## Self-hosting Carden
You can run Screenity locally without having to install it from the Chrome Store. Here's how:

1. Download the code. In the web version of GitHub, you can do that by clicking the green "Code" button, and then "Download ZIP".
2. Note that there's a [server](https://github.com/alyssaxuu/carden/tree/master/server) folder for the back-end. You will need to setup a server with a MySQL database.
3. Add the appropriate credentials in [config.php](https://github.com/alyssaxuu/carden/tree/master/server/config.php) to access your database.
4. Modify the access-control-allow-origin in all PHP files to allow requests from the extension (with its unique ID).
5. Replace the POST URLs throughout the javascript files in the [chrome-extension](https://github.com/alyssaxuu/carden/tree/master/chrome-extension) folder.
6. Go to chrome://extensions/ in your browser, and [enable developer mode](https://developer.chrome.com/docs/extensions/mv2/faq/#:~:text=You%20can%20start%20by%20turning,a%20packaged%20extension%2C%20and%20more.).
7. Drag the [chrome-extension](https://github.com/alyssaxuu/carden/tree/master/chrome-extension) folder (make sure it's a folder and not a ZIP file, so unzip first), or click on the "Load unpacked" button and locate the folder.
4. That's it, you will now be able to use Carden locally. Make sure you pin it on the toolbar by clicking the "puzzle" icon in the toolbar and pinning Carden.

## Libraries used
- [jQuery](https://jquery.com/) - for better event handling and DOM manipulation
- [jQuery Nice Select](https://hernansartorio.com/jquery-nice-select/) - for better, more stylish dropdowns
- [Chart.js](https://www.chartjs.org/) - for rendering the chart for the stats
- [ExtensionPay](https://extensionpay.com/home) - for handling the yearly subscription
- [Twemoji](https://twemoji.twitter.com/) - for the cool emojis throughout the extension ✨

#
 Feel free to reach out to me through email at hi@alyssax.com or [on Twitter](https://twitter.com/alyssaxuu) if you have any questions or feedback! Hope you find this useful 💜
