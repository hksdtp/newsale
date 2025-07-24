# 🎨 FIGMA FILE CREATION INSTRUCTIONS

Please follow these simple steps to create and setup your Figma file:

📱 STEP 1: Create Figma File

1. Go to https://figma.com
2. Click "Create new file" or press Ctrl+N
3. Rename file to: "Qatalog Login - UI Screens"

📷 STEP 2: Import Screenshots
Drag these screenshots into your Figma file:
• /Users/nih/web app/webapp/BLN/qatalog-login/screenshots/login-page.png
• /Users/nih/web app/webapp/BLN/qatalog-login/screenshots/password-page.png
• /Users/nih/web app/webapp/BLN/qatalog-login/screenshots/director-login-page.png

📐 STEP 3: Create Frames

1. Create 3 iPhone frames (375×812px)
2. Name them:
   - "Login Page"
   - "Password Page"
   - "Director Login Page"
3. Place each screenshot in its corresponding frame

🔗 STEP 4: Get File Key

1. Copy the Figma URL: figma.com/file/[FILE_KEY]/...
2. Extract the FILE_KEY part
3. Save it to: figma-file-key.txt in your project root

🚀 STEP 5: Start Sync Services
Once you have the file key, run these commands:

Terminal 1 (Code → Figma sync):
cd "/Users/nih/web app/webapp/BLN/qatalog-login"
node code-watcher.js

Terminal 2 (Figma → Code sync):
cd "/Users/nih/web app/webapp/BLN/qatalog-login"
node figma-watcher.js

✨ STEP 6: Test the Sync

1. Make a change to any React component
2. Check Figma for automatic updates
3. Make a change in Figma
4. Check your code for automatic updates

🎯 DESIGN TOKENS AVAILABLE:
• Colors: Primary blue, Gray scales
• Typography: Text sizes and weights
• Spacing: Margin and padding values
• Border radius: Rounded corners
• Shadows: Drop shadows

📊 SYNC FEATURES:
✅ Automatic screenshot generation
✅ Design token extraction from code
✅ Component mapping
✅ Two-way synchronization
✅ File change monitoring

💡 TROUBLESHOOTING:

- If sync doesn't work, check figma-file-key.txt exists
- Ensure FIGMA_TOKEN is valid in .env.local
- Check console output for error messages

🎉 Once setup, you can edit in either Figma or code and changes will sync automatically!
