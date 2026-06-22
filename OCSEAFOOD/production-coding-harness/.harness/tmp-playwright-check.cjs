const { chromium } = require('C:\\Users\\thanh\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const messages = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => messages.push({ type: 'pageerror', text: err.message }));

  await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.harness/tmp-cart-empty.png', fullPage: false });
  const emptyVisible = await page.getByText('Giỏ Hàng Đang Trống').isVisible();

  await page.evaluate(() => {
    localStorage.setItem('ocseafood-cart', JSON.stringify({
      state: {
        items: [{ id: 2, name: 'Tôm Hùm', priceReference: 1200000, image: '/tom.jpg', unit: 'con', quantity: 1 }],
      },
      version: 0,
    }));
    localStorage.setItem('ocseafood-auth', JSON.stringify({
      state: {
        token: 'mock-token',
        user: { id: 7, email: 'testcustomer@example.com', name: 'Khách Hàng Vip', role: 'CUSTOMER' },
      },
      version: 0,
    }));
  });

  let checkoutPayload = null;
  let checkoutHeaders = null;
  await page.route('**/api/checkout', async (route) => {
    const request = route.request();
    checkoutPayload = JSON.parse(request.postData() || '{}');
    checkoutHeaders = request.headers();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 42,
        code: 'ORD-PLAYWRIGHT-01',
        fullName: checkoutPayload.fullName,
        email: checkoutPayload.email,
        phone: checkoutPayload.phone,
        province: checkoutPayload.province,
        district: checkoutPayload.district,
        ward: checkoutPayload.ward,
        streetAddress: checkoutPayload.streetAddress,
        totalFinal: 1200000,
      }),
    });
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: '.harness/tmp-cart-filled.png', fullPage: false });

  const nameInput = page.getByPlaceholder('Nguyễn Văn A');
  await nameInput.waitFor({ state: 'visible' });
  const prefilledName = await nameInput.inputValue();
  const emailValue = await page.getByPlaceholder('your@email.com').inputValue();

  await page.getByPlaceholder('0912345678').fill('0912345678');
  await page.locator('select').nth(0).selectOption('HCM');
  await page.locator('select').nth(1).selectOption('District 1');
  await page.locator('select').nth(2).selectOption('Ben Nghe');
  await page.getByPlaceholder('Số 12, Ngõ 345, Đường Lê Lợi').fill('10 Ben Nghe');
  await page.getByRole('button', { name: /XÁC NHẬN ĐẶT HÀNG/i }).click();
  await page.getByText('Đặt Hàng Thành Công!').waitFor({ state: 'visible', timeout: 10000 });
  await page.screenshot({ path: '.harness/tmp-cart-success.png', fullPage: false });

  const successVisible = await page.getByText('ORD-PLAYWRIGHT-01').isVisible();
  const addressVisible = await page.getByText(/10 Ben Nghe, Phường Bến Nghé, Quận 1, TP\. Hồ Chí Minh/).isVisible();
  const result = {
    emptyVisible,
    prefilledName,
    emailValue,
    successVisible,
    addressVisible,
    checkoutPayload,
    authorization: checkoutHeaders && checkoutHeaders.authorization,
    consoleMessages: messages,
    screenshots: [
      '.harness/tmp-cart-empty.png',
      '.harness/tmp-cart-filled.png',
      '.harness/tmp-cart-success.png',
    ],
  };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
