// Figma Plugin Script - Run in Figma console
// This script creates frames and imports your screenshots

const screenshots = [
  { name: 'Login Page', file: 'login-page.png', width: 375, height: 812 },
  { name: 'Password Page', file: 'password-page.png', width: 375, height: 812 },
  { name: 'Director Login Page', file: 'director-login-page.png', width: 375, height: 812 },
];

// Create frames
screenshots.forEach((screen, index) => {
  const frame = figma.createFrame();
  frame.name = screen.name;
  frame.resize(screen.width, screen.height);
  frame.x = index * (screen.width + 50);
  frame.y = 0;

  // Add to current page
  figma.currentPage.appendChild(frame);

  console.log(`Created frame: ${screen.name}`);
});

figma.notify('Frames created! Now import your screenshots manually.');
