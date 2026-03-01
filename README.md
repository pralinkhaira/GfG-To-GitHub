# GfG-to-GitHub Sync Extension

A robust Chrome Extension that tracks your progress on GeeksForGeeks and automatically syncs your accepted problem solutions directly to a designated GitHub Repository.

Featuring a beautiful, revamped dark-mode interface and a minimal onboarding process, the extension perfectly blends in as a dedicated companion while you focus on problem-solving.

---

## 🚀 Features

- **Automated Sync**: Automatically pushes your successful GeeksForGeeks solutions directly to your linked GitHub repository.
- **Beautiful UI**: Completely revamped design featuring glassmorphism, glowing ambient accents, and a fluid dark/night mode toggle.
- **Dashboard Progression**: A built-in dashboard in the extension popup to track your total problems solved across different difficulty tiers (School, Basic, Easy, Medium, Hard).
- **Flexible Repository Setup**: Choose to create a new private repository automatically or link an existing one.
- **Flawless Formatting**: Creates organized folder structures and a beautiful `README.md` for every single problem solved alongside your code.

---

## 🛠️ How it Works

1. The extension uses Chrome's local storage and a connection to the GitHub REST API to securely authenticate you via an OAuth token.
2. It tracks the GeeksForGeeks execution DOM. When a successful "Problem Solved Successfully" flag is detected, it captures your current code and the problem's descriptive context.
3. The script formats the data and performs discrete `PUT` requests to the repository you linked, committing the newly solved code straight into your GitHub portfolio!

---

## ⚙️ Setting Up Locally (Developer Installation)

Follow these steps to install the extension manually and properly configure GitHub OAuth for local usage.

### 1. Configure the GitHub OAuth Application

To allow the extension to push code on your behalf, you need your own GitHub OAuth credentials:
1. Go to your GitHub account settings.
2. Navigate to **Developer settings** -> **OAuth Apps** -> **New OAuth App**.
3. Fill in the details:
   - **Application name**: `GfG to GitHub` (or a name of your choice)
   - **Homepage URL**: `https://github.com`
   - **Authorization callback URL**: `https://github.com/` (Make sure this matches the redirect utilized within the extension logic).
4. Click **Register application**.
5. Once registered, copy the **Client ID** and generate a new **Client Secret**.

### 2. Update the Extension Secrets

In the project folder, locate the file `scripts/secrets.js` and securely paste your newly generated credentials:

```javascript
/* scripts/secrets.js */
const OAuthClientID = 'YOUR_NEW_CLIENT_ID';
const OAuthClientSecret = 'YOUR_NEW_CLIENT_SECRET';
```

### 3. Load the Extension into Chrome

Deploy the local folder directly into your Chrome browser:
1. Open Google Chrome and enter `chrome://extensions/` in the URL bar.
2. Enable the **Developer Mode** toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left menu.
4. Select the `GfG-To-GitHub` project folder containing these files.
5. The extension should now be active! Pin it to your Chrome toolbar for easy access.

---

## 🧑‍💻 How to Use

1. **Authenticate**: Click on the newly pinned extension icon. Follow the prompt to "Authenticate" yourself with your GitHub account. 
2. **Authorize Application**: You will dynamically be redirected to an authorization page. Confirm the repository management permissions.
3. **Link your Repository**: The extension's setup page will open. Choose between "Create Private" or "Link Existing" and enter your desired repository name (e.g., `GeeksForGeeks-Solutions`), then click **Complete Setup**.
4. **Solve Problems**: Head over to the [GeeksForGeeks Explore](https://www.geeksforgeeks.org/explore) page and start coding! 
5. **Watch the Magic**: Whenever you successfully submit a correct solution, head directly to your GitHub repository to see the newly synced code and its elegantly formatted `README.md`.

## 📝 Important Note

If you downloaded the ZIP file just to use the extension, **you do not need to install Node.js or run any commands.** The fully compiled `tailwind.css` file is already included.

However, if you want to modify the physical styling, alter the responsive design, or add new UI elements using Tailwind utility classes, follow these steps:

1. Install the node modules locally to fetch the Tailwind CLI dependency:
   ```bash
   npm install
   ```
2. Make your targeted HTML attribute changes or update the `tailwind.config.js` palette.
3. Automatically rebuild the final production CSS file using:
   ```bash
   npx tailwindcss -i css/input.css -o css/tailwind.css
   ```
   *Note: If you are actively coding, just add the `--watch` flag at the end of the command to rebuild live as you type.*

---

## 📜 Update History

### Update V1 - 01/03/2026

- **Golden Link Color**: Updated the linked repository text to a golden hue for better readability in dark mode.
- **Streak Counter**: Added a new "Streak" metric alongside the "Total Solved" stats on both the popup and main index dashboards to track consecutive days of problem-solving.
- **Clean Interface**: Improved general UI layout and removed the fire emoji from the Streak titles for a cleaner, modern look.
- **Submission Badge Status**: Engineered a dynamic 🔥 badge that flashes on the extension toolbar icon precisely when a problem is successfully committed to GitHub.
- **Languages Used Tally**: Implemented a sophisticated dynamic language counting system that analyzes raw GitHub commits and accurately renders the total number of solutions matched securely by language extension on both dashboard views.

---

## 📝 Technologies Used

- **Client Code**: Vanilla JavaScript (ES6+), HTML5
- **Styling UI**: Tailwind CSS, Vanilla CSS, jQuery
- **Service Integration**: Chrome Manifest V3 APIs, GitHub REST API (v3)
