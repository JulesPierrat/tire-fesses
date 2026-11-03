import { expect, test, type Page } from '@playwright/test';

/** L'agrandissement attendu pour chaque écran de playwright.config.ts. */
const ATTENDU: Record<string, number> = { ordinateur: 2, retina: 3, 'telephone-couche': 2 };

type P = [number, number];
// Du sommet à la station par le couloir noir (les points de la planche, en pixels du jeu).
const GRANDE_DESCENTE: P[] = [[453, 44], [484, 78], [510, 108], [540, 120], [525, 170], [495, 226], [500, 280], [470, 320], [430, 345], [390, 380], [360, 400], [330, 404]];
const STATION: P = [330, 404], SOMMET: P = [453, 44], EMPLACEMENT_CAFE: P = [225, 286];

/** Ouvre le jeu et relève les erreurs de la console et de la page. */
async function ouvrir(page: Page): Promise<string[]> {
  const erreurs: string[] = [];
  page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', e => erreurs.push(e.message));
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  return erreurs;
}

/** Un pixel du jeu, en points CSS de la page. */
const ou = (page: Page, [gx, gy]: P) => page.evaluate(([gx, gy]) => {
  const t = document.querySelector<HTMLCanvasElement>('#ecran')!, r = t.getBoundingClientRect(), v = t.width / r.width;
  const e = +t.dataset.echelle!, x = +t.dataset.x!, y = +t.dataset.y!;
  return { x: r.left + (x + gx * e) / v, y: r.top + (y + gy * e) / v };
}, [gx, gy] as const);

async function cliquer(page: Page, p: P) {
  const { x, y } = await ou(page, p);
  await page.mouse.click(x, y);
}

async function glisser(page: Page, chemin: P[]) {
  const depart = await ou(page, chemin[0]);
  await page.mouse.move(depart.x, depart.y);
  await page.mouse.down();
  for (const p of chemin.slice(1)) { const { x, y } = await ou(page, p); await page.mouse.move(x, y, { steps: 6 }); }
  await page.mouse.up();
}

const sauvegarde = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('tire-fesses/chocards') ?? 'null'));

test('chaque pixel du jeu fait exactement e × e vrais pixels', async ({ page }, info) => {
  test.skip(info.project.name === 'telephone-debout');
  const erreurs = await ouvrir(page);
  const e = ATTENDU[info.project.name]!;
  await expect(page.locator('#ecran')).toHaveAttribute('data-echelle', String(e));

  // Ce que l'écran affiche (la capture) est exactement ce que le jeu a dessiné (la toile),
  // pixel pour pixel, sur un coin de la carte où rien ne bouge.
  const capture = (await page.screenshot()).toString('base64');
  const ecarts = await page.evaluate(async ([capture, e]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${capture}`;
    await img.decode();
    const t = document.querySelector<HTMLCanvasElement>('#ecran')!;
    if (img.width !== t.width || img.height !== t.height) return -1;
    const copie = document.createElement('canvas');
    copie.width = img.width;
    copie.height = img.height;
    const g = copie.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, 0, 0);
    const x = +t.dataset.x! + 600 * e, y = +t.dataset.y! + 360 * e, l = 100 * e, h = 70 * e;
    const vu = g.getImageData(x, y, l, h).data, dessine = t.getContext('2d')!.getImageData(x, y, l, h).data;
    let n = 0;
    for (let i = 0; i < vu.length; i += 4) if (vu[i] !== dessine[i] || vu[i + 1] !== dessine[i + 1] || vu[i + 2] !== dessine[i + 2]) n++;
    return n;
  }, [capture, e] as const);
  expect(ecarts).toBe(0);

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(await page.evaluate(() => document.fonts.check('700 24px "Pixelify Sans"'))).toBe(true);
  await page.screenshot({ path: info.outputPath('carte.png') });
  expect(erreurs).toEqual([]);
});

test.describe('à la souris', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'ordinateur'); });

  test('une piste tracée du sommet à la station prend sa couleur et reste après rechargement', async ({ page }, info) => {
    const erreurs = await ouvrir(page);
    await glisser(page, GRANDE_DESCENTE);
    await expect(page.locator('#message-titre')).toHaveText('Piste noire tracée');
    await expect(page.locator('#message-texte')).toHaveText(/^Pente la plus forte\u00a0: 6\d\u00a0%, sur 3\u00a0km\.$/);
    expect((await sauvegarde(page)).pistes).toHaveLength(1);
    await page.screenshot({ path: info.outputPath('piste.png') });

    await page.reload();
    await expect(page.locator('#ecran')).toHaveAttribute('data-echelle', '2');
    await cliquer(page, GRANDE_DESCENTE[6]);
    await expect(page.locator('#message-titre')).toHaveText('Piste noire');
    await page.getByRole('button', { name: 'Démolir' }).click();
    await expect(page.locator('#message-texte')).toHaveText('Piste démolie.');
    expect((await sauvegarde(page)).pistes).toHaveLength(0);
    expect(erreurs).toEqual([]);
  });

  test('une piste qui remonte est refusée', async ({ page }) => {
    await ouvrir(page);
    await glisser(page, [...GRANDE_DESCENTE].reverse());
    await expect(page.locator('#message-titre')).toHaveText('Pas de piste');
    await expect(page.locator('#message-texte')).toContainText('une piste ne remonte jamais de plus de 10\u00a0m');
  });

  test('de la station au sommet, seule la télécabine est assez longue', async ({ page }, info) => {
    const erreurs = await ouvrir(page);
    await cliquer(page, STATION);
    await expect(page.locator('#message-titre')).toHaveText('Station des Chocards');
    await cliquer(page, SOMMET);
    await expect(page.locator('#message-titre')).toHaveText('Quelle remontée\u00a0?');
    await expect(page.getByRole('button', { name: /Téléski/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Télésiège/ })).toBeDisabled();
    await page.screenshot({ path: info.outputPath('remontee.png') });
    await page.getByRole('button', { name: /Télécabine/ }).click();
    await expect(page.locator('#message-texte')).toHaveText('Télécabine posée.');
    expect((await sauvegarde(page)).remontees).toEqual([expect.objectContaining({ type: 'telecabine', bas: 'station', haut: 'sommet' })]);
    expect(erreurs).toEqual([]);
  });

  test('un lieu s’ouvre sur un emplacement libre', async ({ page }) => {
    await ouvrir(page);
    await cliquer(page, EMPLACEMENT_CAFE);
    await expect(page.locator('#message-titre')).toHaveText('Emplacement libre');
    await expect(page.locator('#recommencer')).toBeHidden();
    await page.getByRole('button', { name: 'Café' }).click();
    await expect(page.locator('#message-texte')).toHaveText('Lieu ouvert\u00a0: Café. Reliez-le au domaine par une piste ou une remontée.');
    expect((await sauvegarde(page)).noeuds).toEqual([expect.objectContaining({ type: 'cafe', emplacement: 'e2' })]);
  });

  test('la nuit change la palette de la carte et du panneau', async ({ page }, info) => {
    const erreurs = await ouvrir(page);
    const pixel = () => page.evaluate(() => {
      const t = document.querySelector<HTMLCanvasElement>('#ecran')!;
      return [...t.getContext('2d')!.getImageData(+t.dataset.x! + 2 * 700, +t.dataset.y! + 2 * 445, 1, 1).data.slice(0, 3)];
    });
    await expect(page.locator('#ecran')).toHaveAttribute('data-echelle', '2');
    const jour = await pixel();
    await page.getByRole('button', { name: 'Nuit' }).click();
    await expect(page.getByRole('button', { name: 'Nuit' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#panneau')).toHaveCSS('background-color', 'rgb(167, 176, 224)');
    await expect.poll(pixel).not.toEqual(jour);
    await page.screenshot({ path: info.outputPath('nuit.png') });
    expect(erreurs).toEqual([]);
  });

  test('une sauvegarde abîmée est oubliée, et la carte recommence', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('tire-fesses/chocards', '{"version":1,"carte":"chocards","pistes":[{"de":"nulle-part"}]}'));
    const erreurs = await ouvrir(page);
    await expect(page.locator('#message-titre')).toHaveText('Partie perdue');
    expect(erreurs).toEqual([]);
  });
});

test('au doigt, sur un téléphone couché : le panneau ne cache rien, on pose une remontée', async ({ page }, info) => {
  test.skip(info.project.name !== 'telephone-couche');
  const erreurs = await ouvrir(page);
  await expect(page.locator('#ecran')).toHaveAttribute('data-echelle', '2');
  const droite = await page.locator('#panneau').evaluate(p => p.getBoundingClientRect().right);
  for (const n of [STATION, SOMMET, [294, 145], [495, 226], [225, 286], [150, 355], [588, 295]] as P[])
    expect((await ou(page, [n[0] - 19, n[1]])).x).toBeGreaterThan(droite);

  const station = await ou(page, STATION), cafe = await ou(page, EMPLACEMENT_CAFE);
  await page.touchscreen.tap(cafe.x, cafe.y);
  await page.getByRole('button', { name: 'Café' }).tap();
  await page.touchscreen.tap(station.x, station.y);
  await page.touchscreen.tap(cafe.x, cafe.y);
  await expect(page.locator('#message-titre')).toHaveText('Quelle remontée\u00a0?');
  await page.getByRole('button', { name: /Téléski/ }).tap();
  await expect(page.locator('#message-texte')).toHaveText('Téléski posé.');
  await page.screenshot({ path: info.outputPath('telephone.png') });
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
