import { expect, test } from '@playwright/test';

// Os sites dos clientes são externos: no e2e respondemos com uma página local
// para o teste ser determinístico e não depender da rede.
const STUB = '<!doctype html><title>stub</title><h1>Site do cliente</h1>';

test.beforeEach(async ({ page }) => {
  await page.route(/\.vercel\.app\//, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: STUB }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto('/');
});

test('mostra o hero, a constelação e a entrada da página', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Leonel');
  await expect(page.locator('#sky')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('h1')).toHaveCSS('opacity', '1');
});

test('troca o skeleton pelos 16 projetos', async ({ page }) => {
  await expect(page.locator('#catalog .sk-row')).toHaveCount(0);
  await expect(page.locator('#catalog li')).toHaveCount(16);
  await expect(page.locator('#catalog')).not.toHaveAttribute('aria-busy', 'true');
});

test('abre a prévia com skeleton e progresso, carrega o site e fecha com Esc', async ({ page }) => {
  await page.getByRole('button', { name: /Oficina Guará/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-state', 'open');
  await expect(dialog.getByRole('heading', { name: 'Oficina Guará' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Abrir site' })).toHaveAttribute('href', 'https://oficina-guara.vercel.app');
  await expect(page.locator('.frame')).toHaveAttribute('data-state', 'ready');
  await expect(page.frameLocator('.frame iframe').getByRole('heading', { name: 'Site do cliente' })).toBeVisible();
  await expect(page.locator('.progress i')).toHaveCSS('transform', /matrix\(1, 0, 0, 1/);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('.frame iframe')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Oficina Guará/ })).toBeFocused();
});

test('o painel fechado não bloqueia cliques na página', async ({ page }) => {
  await page.getByRole('button', { name: /ABLF/ }).click();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.locator('#filters button[data-cat="saude"]').click();
  await expect(page.locator('#catalog li:not([hidden])')).toHaveCount(2);
});

test('filtra por categoria e volta para todos', async ({ page }) => {
  const saude = page.locator('#filters button[data-cat="saude"]');
  await saude.click();
  await expect(saude).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#catalog li:not([hidden])')).toHaveCount(2);
  await page.getByRole('button', { name: 'Todos' }).click();
  await expect(page.locator('#catalog li:not([hidden])')).toHaveCount(16);
});

test('clicar em uma estrela do céu abre a prévia', async ({ page, isMobile }) => {
  test.skip(isMobile, 'o céu responde a mouse; no celular o caminho é o catálogo');
  const box = await page.locator('#sky').boundingBox();
  // procura uma estrela varrendo o céu até a dica aparecer
  let found = false;
  for (let y = 0.12; y < 0.7 && !found; y += 0.02) {
    for (let x = 0.3; x < 0.95 && !found; x += 0.01) {
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
      found = await page.locator('#tip.on').isVisible();
    }
  }
  expect(found).toBe(true);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('as seções entram ao rolar (lazy reveal)', async ({ page }) => {
  const contato = page.locator('#contato [data-reveal]');
  await contato.scrollIntoViewIfNeeded();
  await expect(contato).toHaveAttribute('data-reveal', 'in');
  await expect(contato).toHaveCSS('opacity', '1');
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('título e seções continuam visíveis', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCSS('opacity', '1');
    await expect(page.locator('#contato [data-reveal]')).toHaveCSS('opacity', '1');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('sem movimento: elementos aparecem sem transform nem blur', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCSS('transform', 'none');
    await expect(page.locator('h1')).toHaveCSS('filter', 'none');
    await expect(page.locator('#projetos [data-reveal]')).toHaveAttribute('data-reveal', 'in');
    await page.getByRole('button', { name: /Monumental/ }).click();
    await expect(page.locator('.viewer')).toHaveCSS('transform', 'none');
  });
});
