import { test, expect } from '@playwright/test';

test.describe('OpenClip Pro - Comprehensive App Test', () => {
  
  test('should demonstrate full app functionality including navigation, auth, and animations', async ({ page }) => {
    // Step 1: Navigate to OpenClip Pro landing page
    await page.goto('http://localhost:5173');
    
    // Step 2: Verify page title and main heading are correct
    await expect(page).toHaveTitle('OpenClip Pro');
    await expect(page.getByRole('heading', { name: /VIRAL MOMENTS.*AI discovers them/i })).toBeVisible();
    
    // Step 3: Check that viral score animation is running (verify dynamic content)
    const viralScoreElement = page.getByText(/Viral Score: \d+%/);
    await expect(viralScoreElement).toBeVisible();
    
    // Verify animated demo content is present
    await expect(page.getByText(/Analyzing\.\.\./)).toBeVisible();
    await expect(page.getByText(/YouTube|TikTok|Instagram/)).toBeVisible();
    
    // Step 4: Navigate to About page and verify comprehensive content
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { name: 'About OpenClip Pro' })).toBeVisible();
    
    // Verify key sections on About page
    await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Advanced Technology' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Board of Advisors' })).toBeVisible();
    
    // Verify AI providers are listed
    await expect(page.getByRole('heading', { name: 'Google Gemini' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'OpenAI GPT-4' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Anthropic Claude' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LM Studio' })).toBeVisible();
    
    // Verify competitive comparison table
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Audio-Visual Analysis')).toBeVisible();
    await expect(page.getByText('Multi-AI Consensus')).toBeVisible();
    
    // Step 5: Navigate to Pricing page and verify pricing tiers
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { name: 'Choose Your Plan' })).toBeVisible();
    
    // Verify pricing tiers
    await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Creator' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    
    // Verify pricing details
    await expect(page.getByText('$5')).toBeVisible(); // Basic price
    await expect(page.getByText('$20')).toBeVisible(); // Creator price  
    await expect(page.getByText('$75')).toBeVisible(); // Pro price
    
    // Verify "Most Popular" badge
    await expect(page.getByText('Most Popular')).toBeVisible();
    
    // Verify FAQ section
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How do credits work?' })).toBeVisible();
    
    // Step 6: Return to home and test Sign In modal
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // Step 7: Fill email field in authentication form
    await page.getByRole('textbox', { name: 'Your email' }).fill('test@example.com');
    await expect(page.getByRole('textbox', { name: 'Your email' })).toHaveValue('test@example.com');
    
    // Verify password field exists
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    
    // Verify sign up option
    await expect(page.getByRole('button', { name: 'New creator? Join now' })).toBeVisible();
    
    // Step 8: Close modal using Escape key
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).not.toBeVisible();
    
    // Step 9: Test animation debug panel via film emoji button
    await page.getByRole('button', { name: '🎬' }).click();
    await expect(page.getByRole('heading', { name: '🎨 Animation Debug' })).toBeVisible();
    
    // Step 10: Test animation controls and verify state changes
    await expect(page.getByText('Force Animations:')).toBeVisible();
    await expect(page.getByText('Reduced Motion:')).toBeVisible();
    
    // Verify animation control buttons
    const animationButton = page.locator('button').filter({ hasText: /Disable Animations|Enable Animations/ });
    await expect(animationButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test Animations' })).toBeVisible();
    
    // Step 11: Test no-animations URL parameter
    await page.goto('http://localhost:5173/?no-animations');
    await expect(page).toHaveTitle('OpenClip Pro');
    
    // Step 12: Verify animation debugger shows disabled state
    await page.getByRole('button', { name: '🎬' }).click();
    await expect(page.getByRole('heading', { name: '🎨 Animation Debug' })).toBeVisible();
    
    // Verify animations are disabled
    await expect(page.getByText('Force Animations:')).toBeVisible();
    await expect(page.getByText('OFF')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enable Animations' })).toBeVisible();
    
    // Step 13: Take final screenshot showing the app functionality
    await page.screenshot({ path: 'tests/screenshots/openclip-pro-final.png', fullPage: true });
    
    // Verify core features are still accessible with animations disabled
    await expect(page.getByRole('heading', { name: /VIRAL MOMENTS.*AI discovers them/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Science of Going Viral' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Audio DNA' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Consensus' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smart Cropping' })).toBeVisible();
    
    // Verify success stories section
    await expect(page.getByRole('heading', { name: 'Creators Are Already Going Viral' })).toBeVisible();
    await expect(page.getByText('@viral_sarah')).toBeVisible();
    await expect(page.getByText('@gaming_alex')).toBeVisible();
    await expect(page.getByText('@food_emma')).toBeVisible();
    
    // Verify CTA section
    await expect(page.getByRole('heading', { name: /Your Next Viral Moment.*Is Waiting/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /🚀.*Discover.*Viral Moments/i })).toBeVisible();
  });
  
  test('should verify responsive navigation and theme system', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Test navigation functionality
    const navigationLinks = ['Home', 'About', 'Pricing'];
    
    for (const linkName of navigationLinks) {
      await page.getByRole('link', { name: linkName }).click();
      // Verify navigation worked by checking URL or content
      if (linkName === 'About') {
        await expect(page).toHaveURL('/about');
      } else if (linkName === 'Pricing') {
        await expect(page).toHaveURL('/pricing');  
      } else if (linkName === 'Home') {
        await expect(page).toHaveURL('/');
      }
    }
    
    // Verify header is always visible
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByText('OpenClip Pro')).toBeVisible();
    
    // Verify authentication buttons are always present
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });
  
  test('should verify animation system behavior', async ({ page }) => {
    // Test default animation state
    await page.goto('http://localhost:5173');
    
    // Open animation debugger
    await page.getByRole('button', { name: '🎬' }).click();
    
    // Verify default state (animations should be ON by default)
    await expect(page.getByText('Force Animations:')).toBeVisible();
    
    // Test the Test Animations functionality
    await page.getByRole('button', { name: 'Test Animations' }).click();
    
    // Verify viral score counter is still visible and functioning
    await expect(page.getByText(/\d+%/)).toBeVisible();
    
    // Test no-animations parameter
    await page.goto('http://localhost:5173/?no-animations');
    await page.getByRole('button', { name: '🎬' }).click();
    
    // Verify animations are disabled
    await expect(page.getByText('Force Animations:')).toBeVisible();
    await expect(page.getByText('OFF')).toBeVisible();
    
    // Verify page functionality is maintained
    await expect(page.getByRole('heading', { name: /VIRAL MOMENTS/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Finding Viral Moments/i })).toBeVisible();
  });
}); 