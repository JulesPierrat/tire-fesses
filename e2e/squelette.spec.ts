import { expect, test, type Page } from '@playwright/test';

/** L'agrandissement attendu pour chaque écran de playwright.config.ts. */
const ATTENDU: Record<string, number> = { ordinateur: 2, retina: 3, 'telephone-couche': 2 };

/** Ouvre le jeu et relève les erreurs de la console et de la page. */
async function ouvrir(page: Page): Promise<string[]> {
  const erreurs: string[] = [];
  page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', e => erreurs.push(e.message));
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  return erreurs;
}

/**
 * Sur une capture en vrais pixels, prise telle que l'écran l'affiche : le bord haut de la
 * carte, puis, sur la ligne des points de grille à y = 384 (16 cases), la largeur de chaque
 * point et l'écart entre deux points, en vrais pixels.
 */
async function pointsDeGrille(page: Page, e: number) {
  const capture = (await page.screenshot()).toString('base64');
  return page.evaluate(async ([capture, e]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${capture}`;
    await img.decode();
    const toile = document.createElement('canvas');
    toile.width = img.width;
    toile.height = img.height;
    const g = toile.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, 0, 0);
    const rgb = (x: number, y: number) => [...g.getImageData(x, y, 1, 1).data.slice(0, 3)].map(v => v.toString(16).padStart(2, '0')).join('');

    // Le bord haut : la première ligne qui n'est plus la bande d'encre, au milieu de l'écran.
    const milieu = Math.floor(img.width / 2);
    let haut = 0;
    while (haut < img.height && rgb(milieu, haut) === '1c2440') haut++;

    const ligne = g.getImageData(0, haut + 384 * (e as number), img.width, 1).data;
    const debuts: number[] = [], largeurs: number[] = [];
    let n = 0;
    for (let x = 0; x <= img.width; x++) {
      const i = x * 4;
      const ombre = x < img.width && ligne[i] === 0xbc && ligne[i + 1] === 0xd1 && ligne[i + 2] === 0xe5; // neige-2
      if (ombre) { if (n === 0) debuts.push(x); n++; }
      else if (n) { largeurs.push(n); n = 0; }
    }
    return { haut, largeurs, ecarts: debuts.slice(1).map((d, k) => d - debuts[k]!) };
  }, [capture, e] as const);
}

test('chaque pixel du jeu fait exactement e × e vrais pixels', async ({ page }, info) => {
  test.skip(info.project.name === 'telephone-debout');
  const erreurs = await ouvrir(page);
  const e = ATTENDU[info.project.name]!;
  await expect(page.locator('#agrandi')).toHaveText(`×${e}`);

  const grille = await pointsDeGrille(page, e);
  expect(grille.largeurs).toEqual(Array(30).fill(e));
  expect(grille.ecarts).toEqual(Array(29).fill(24 * e));

  await expect(page.locator('#tourne')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(await page.evaluate(() => document.fonts.check('700 24px "Pixelify Sans"'))).toBe(true);

  await page.screenshot({ path: info.outputPath('jour.png') });
  expect(erreurs).toEqual([]);
});

test('la nuit change la palette de la carte et de l’interface', async ({ page }, info) => {
  test.skip(info.project.name !== 'ordinateur');
  const erreurs = await ouvrir(page);
  // La première case de la palette, à (264, 168) en pixels du jeu, agrandie ×2.
  const premiereCase = () => page.evaluate(() => {
    const t = document.querySelector<HTMLCanvasElement>('#ecran')!;
    const x = Math.floor((t.width - 1440) / 2) + 264 * 2, y = Math.floor((t.height - 900) / 2) + 168 * 2;
    return [...t.getContext('2d')!.getImageData(x, y, 1, 1).data.slice(0, 3)];
  });

  expect(await premiereCase()).toEqual([0xff, 0xff, 0xff]);  // neige-0, le jour
  await page.getByRole('button', { name: 'Nuit' }).click();
  expect(await premiereCase()).toEqual([0xa7, 0xb0, 0xe0]);  // neige-0, la nuit
  await expect(page.getByRole('button', { name: 'Nuit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bandeau')).toHaveCSS('background-color', 'rgb(167, 176, 224)');

  await page.screenshot({ path: info.outputPath('nuit.png') });
  expect(erreurs).toEqual([]);
});

test('un téléphone tenu debout demande d’être tourné', async ({ page }, info) => {
  test.skip(info.project.name !== 'telephone-debout');
  const erreurs = await ouvrir(page);

  await expect(page.locator('#tourne')).toBeVisible();
  await expect(page.locator('#tourne')).toHaveText('Tournez votre téléphone pour jouer.');
  await expect(page.locator('#jeu')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  await page.screenshot({ path: info.outputPath('debout.png') });
  expect(erreurs).toEqual([]);
});
