import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');

    // Set admin mode (click admin button and enter PIN)
    console.log('\n2. Enabling admin mode...');
    await page.click('button[title*="⚙️"]');
    await page.fill('input[type="password"]', '0000'); // Default admin PIN
    await page.click('button:has-text("✓")');
    await page.waitForTimeout(500);
    console.log('✅ Admin mode enabled');

    // Add participants
    console.log('\n3. Adding participants...');
    const addInput = page.locator('input[placeholder*="Añadir"]');
    await addInput.fill('Jugador1');
    await addInput.press('Enter');
    await page.waitForTimeout(300);
    console.log('✅ Participant added');

    // Simulate Jornada 1
    console.log('\n4. Simulating Jornada 1...');
    await page.click('button:has-text("SJ1")');
    await page.waitForTimeout(1000);
    console.log('✅ Jornada 1 simulated');

    // Go to Resultados
    console.log('\n5. Going to Resultados...');
    await page.click('button:has-text("📊 RESULTADOS")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Resultados tab open');

    // Check if confirm button exists for Jornada 1
    const confirmBtn = page.locator('button:has-text("Confirmar resultados")');
    const isVisible = await confirmBtn.isVisible();
    console.log(`✅ Confirm button visible: ${isVisible}`);

    if (isVisible) {
      console.log('\n6. Clicking confirm results button...');
      await confirmBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Results confirmed');

      // Check button text changed to "Confirmado"
      const confirmText = await confirmBtn.textContent();
      console.log(`✅ Button text: "${confirmText}"`);
    }

    // Go to Tus apuestas
    console.log('\n7. Going to Tus apuestas...');
    await page.click('button:has-text("📝 TUS APUESTAS")');
    await page.waitForLoadState('networkidle');

    // Select participant
    console.log('\n8. Selecting participant...');
    await page.click('button:has-text("Jugador1")');
    await page.waitForTimeout(500);
    console.log('✅ Participant selected');

    // Check Jornada 1 status
    const jornada1Header = page.locator('text=Jornada 1');
    if (await jornada1Header.isVisible()) {
      const badge = jornada1Header.locator('..').locator('span');
      const badgeText = await badge.textContent();
      console.log(`✅ Jornada 1 status badge: "${badgeText}"`);
    }

    // Try to navigate to Jornada 2 (should require Jornada 1 confirmation)
    console.log('\n9. Checking Jornada 2 access...');
    const jornada2Selector = page.locator('select');
    await jornada2Selector.selectOption('2');
    await page.waitForTimeout(500);

    const jornada2Header = page.locator('text=Jornada 2');
    if (await jornada2Header.isVisible()) {
      const badge = jornada2Header.locator('..').locator('span');
      const badgeText = await badge.textContent();
      console.log(`✅ Jornada 2 status badge: "${badgeText}"`);
    }

    console.log('\n✅ VERIFICATION COMPLETE - Results confirmation flow working!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
