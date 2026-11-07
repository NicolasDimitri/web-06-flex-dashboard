const { test, expect } = require('@playwright/test');
const { ler, abrir, estilo, rects, overflowX, quemEstoura, perto, semComentarios, px } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

// Esvazia o conteúdo principal para testar o layout com "pouca coisa" na tela
const esvaziar = (page) => page.evaluate(() => { document.querySelector('.conteudo').innerHTML = ''; });

test('R1 – Base do HTML: doctype, lang pt-BR, charset UTF-8, <title> e viewport', async ({ page }) => {
  expect(ler(), 'Falta <!DOCTYPE html>').toMatch(/^\s*<!doctype html>/i);
  const info = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    charset: document.querySelector('head meta[charset]')?.getAttribute('charset') || '',
    title: document.title.trim(),
    viewport: document.querySelector('head meta[name="viewport"]')?.getAttribute('content') || '',
  }));
  expect(info.lang, 'Falta lang="pt-BR"').toBe('pt-BR');
  expect(info.charset.toLowerCase(), 'Falta <meta charset="UTF-8">').toBe('utf-8');
  expect(info.title.length, '<title> vazio').toBeGreaterThan(2);
  expect(info.viewport, 'Falta <meta name="viewport" content="width=device-width, initial-scale=1.0">').toMatch(/width=device-width/);
});

test('R2 – CSS em arquivo externo style.css (sem style="" e sem <style>)', async ({ page }) => {
  const href = await page.evaluate(() => document.querySelector('head link[rel="stylesheet"]')?.getAttribute('href'));
  expect(href, 'Falta <link rel="stylesheet" href="style.css"> no <head>').toBe('style.css');
  expect(ler('style.css').trim().length, 'O style.css está praticamente vazio').toBeGreaterThan(500);
  expect(ler(), 'Não use style="..." no HTML').not.toMatch(/\sstyle\s*=/i);
  expect(ler(), 'Não use <style> no HTML').not.toMatch(/<style/i);
});

test('R3 – Estrutura HTML do dashboard (veja o esqueleto no README)', async ({ page }) => {
  const s = await page.evaluate(() => {
    const q = (x) => document.querySelector(x);
    const itens = [...document.querySelectorAll('.menu > .item')];
    const lis = [...document.querySelectorAll('.atividades li')];
    return {
      base: !!q('body > .app > header.topo') && !!q('body > .app > .corpo') && !!q('body > .app > footer.rodape'),
      topo: !!q('.topo > .logo') && !!q('.topo > input.busca') && !!q('.topo > .usuario > .avatar') && !!q('.topo > .usuario > .nome'),
      corpo: !!q('.corpo > aside.menu') && !!q('.corpo > main.conteudo'),
      itens: itens.length,
      sairUltimo: itens.length > 0 && itens[itens.length - 1].classList.contains('sair'),
      sairQtd: document.querySelectorAll('.item.sair').length,
      kpis: document.querySelectorAll('.conteudo > .resumo > .kpi').length,
      kpisOk: [...document.querySelectorAll('.kpi')].every((k) => k.querySelector('.valor')),
      painel: !!q('.conteudo > .painel > .grafico') && !!q('.conteudo > .painel > .atividades'),
      lis: lis.length,
      lisOk: lis.every((li) => li.querySelector('.quem') && li.querySelector('.quando')),
    };
  });
  expect(s.base, 'Precisa de body > .app com <header class="topo">, <div class="corpo"> e <footer class="rodape">').toBe(true);
  expect(s.topo, 'O .topo precisa de .logo, <input class="busca"> e .usuario (com .avatar e .nome)').toBe(true);
  expect(s.corpo, 'O .corpo precisa de <aside class="menu"> e <main class="conteudo">').toBe(true);
  expect(s.itens, 'O .menu precisa de 5+ links com class="item"').toBeGreaterThanOrEqual(5);
  expect(s.sairQtd, 'Exatamente um .item deve ter também a class "sair"').toBe(1);
  expect(s.sairUltimo, 'O item .sair deve ser o último do menu').toBe(true);
  expect(s.kpis, 'O .resumo precisa de 4+ .kpi').toBeGreaterThanOrEqual(4);
  expect(s.kpisOk, 'Todo .kpi precisa de um elemento .valor').toBe(true);
  expect(s.painel, 'O .painel precisa de .grafico e .atividades').toBe(true);
  expect(s.lis, 'A lista de .atividades precisa de 4+ <li>').toBeGreaterThanOrEqual(4);
  expect(s.lisOk, 'Todo <li> das atividades precisa de .quem e .quando').toBe(true);
});

test('R4 – Reset: body com margin 0 e box-sizing: border-box nos blocos principais', async ({ page }) => {
  const b = await estilo(page, 'body', ['marginTop', 'marginLeft']);
  expect(px(b.marginTop) + px(b.marginLeft), 'O body precisa de margin: 0').toBe(0);
  for (const sel of ['.topo', '.menu', '.conteudo', '.kpi']) {
    const e = await estilo(page, sel, ['boxSizing']);
    expect(e.boxSizing, `${sel} precisa de box-sizing: border-box (dica: * { box-sizing: border-box; })`).toBe('border-box');
  }
});

test('R5 – .app em coluna ocupando a tela toda: o rodapé fica embaixo mesmo com pouco conteúdo', async ({ page }) => {
  await esvaziar(page);
  const a = await estilo(page, '.app', ['display', 'flexDirection']);
  expect(a.display, '.app precisa de display: flex').toBe('flex');
  expect(a.flexDirection, '.app precisa de flex-direction: column').toBe('column');
  const c = await estilo(page, '.corpo', ['flexGrow']);
  expect(Number(c.flexGrow), '.corpo precisa crescer para ocupar o espaço que sobra (flex-grow: 1)').toBeGreaterThanOrEqual(1);
  const [f] = await rects(page, '.rodape');
  expect(perto(f.b, 800, 1), `Com pouco conteúdo o rodapé deve encostar no fim da tela (800px), mas termina em ${Math.round(f.b)}px. Dica: .app com min-height: 100vh`).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight), 'A página ficou mais alta que a tela').toBeLessThanOrEqual(801);
});

test('R6 – Topo em Flexbox: logo e usuário nas pontas, a busca CRESCE e ocupa o espaço do meio', async ({ page }) => {
  const t = await estilo(page, '.topo', ['display', 'alignItems', 'columnGap']);
  expect(t.display, '.topo precisa de display: flex').toBe('flex');
  expect(t.alignItems, '.topo precisa de align-items: center').toBe('center');
  expect(px(t.columnGap), 'Use gap (8px ou mais) no .topo').toBeGreaterThanOrEqual(8);
  const b = await estilo(page, '.busca', ['flexGrow']);
  expect(Number(b.flexGrow), 'A .busca precisa crescer (flex-grow: 1 / flex: 1)').toBeGreaterThanOrEqual(1);
  const [topo] = await rects(page, '.topo');
  const [logo] = await rects(page, '.logo');
  const [busca] = await rects(page, '.busca');
  const [user] = await rects(page, '.usuario');
  expect(logo.l - topo.l, 'O logo deve ficar à esquerda (até 60px de margem)').toBeLessThanOrEqual(60);
  expect(topo.r - user.r, 'O .usuario deve ficar à direita (até 60px de margem)').toBeLessThanOrEqual(60);
  expect(busca.w, 'A busca deveria ocupar o espaço livre do topo (300px ou mais em 1280px)').toBeGreaterThanOrEqual(300);
  expect(logo.r <= busca.l + 1 && busca.r <= user.l + 1, 'Ordem esperada no topo: logo, busca, usuário').toBe(true);
});

test('R7 – Avatar: círculo de 40 a 64px com a inicial centralizada (Flexbox) e alinhado ao nome', async ({ page }) => {
  const a = await estilo(page, '.avatar', ['display', 'justifyContent', 'alignItems', 'borderTopLeftRadius']);
  const [av] = await rects(page, '.avatar');
  expect(av.w, 'O avatar deve ter entre 40px e 64px').toBeGreaterThanOrEqual(40);
  expect(av.w, 'O avatar deve ter entre 40px e 64px').toBeLessThanOrEqual(64);
  expect(Math.abs(av.w - av.h), 'O avatar precisa ser quadrado').toBeLessThanOrEqual(1);
  expect(a.borderTopLeftRadius === '50%' || px(a.borderTopLeftRadius) >= av.w / 2 - 1, 'O avatar precisa ser um círculo').toBe(true);
  expect(a.display, 'O .avatar precisa ser flex (ou inline-flex) para centralizar a inicial').toMatch(/flex/);
  expect(a.justifyContent, 'Centralize a inicial na horizontal (justify-content: center)').toBe('center');
  expect(a.alignItems, 'Centralize a inicial na vertical (align-items: center)').toBe('center');
  const u = await estilo(page, '.usuario', ['display', 'alignItems', 'columnGap']);
  expect(u.display, '.usuario precisa de display: flex').toMatch(/flex/);
  expect(px(u.columnGap), 'Use gap (6px ou mais) em .usuario').toBeGreaterThanOrEqual(6);
  const [nome] = await rects(page, '.usuario .nome');
  expect(perto((av.t + av.b) / 2, (nome.t + nome.b) / 2, 3), 'Avatar e nome devem estar alinhados no centro vertical').toBe(true);
});

test('R8 – .corpo em linha: menu lateral + conteúdo lado a lado', async ({ page }) => {
  const c = await estilo(page, '.corpo', ['display', 'flexDirection']);
  expect(c.display, '.corpo precisa de display: flex').toBe('flex');
  expect(c.flexDirection, '.corpo precisa estar em linha (flex-direction: row) no desktop').toBe('row');
  const [m] = await rects(page, '.menu');
  const [ct] = await rects(page, '.conteudo');
  expect(m.r <= ct.l + 1 && perto(m.t, ct.t, 1), 'O .menu deve ficar à esquerda do .conteudo, alinhados no topo').toBe(true);
});

test('R9 – Menu lateral: 180 a 280px, NÃO encolhe, em coluna e vai até o rodapé (altura total)', async ({ page }) => {
  await esvaziar(page);
  const m = await estilo(page, '.menu', ['display', 'flexDirection', 'flexShrink']);
  const [box] = await rects(page, '.menu');
  expect(box.w, 'A largura do .menu deve ficar entre 180px e 280px').toBeGreaterThanOrEqual(180);
  expect(box.w, 'A largura do .menu deve ficar entre 180px e 280px').toBeLessThanOrEqual(280);
  expect(m.flexShrink, 'O .menu não pode encolher quando a tela aperta (flex-shrink: 0)').toBe('0');
  expect(m.display, '.menu precisa de display: flex').toBe('flex');
  expect(m.flexDirection, '.menu precisa de flex-direction: column').toBe('column');
  const [rodape] = await rects(page, '.rodape');
  expect(perto(box.b, rodape.t, 1), 'O .menu deve esticar até o rodapé, mesmo com pouco conteúdo (altura total)').toBe(true);
});

test('R10 – O item "Sair" fica no FIM do menu, separado dos outros (margin-top: auto)', async ({ page }) => {
  const itens = await rects(page, '.menu > .item');
  const [menu] = await rects(page, '.menu');
  const sair = itens[itens.length - 1];
  const anterior = itens[itens.length - 2];
  expect(sair.b, 'O "Sair" deve ficar no final do menu (colado embaixo, até 40px de folga)').toBeGreaterThanOrEqual(menu.b - 40);
  expect(sair.t - anterior.b, 'Deve haver um grande espaço entre o último item e o "Sair" (dica: margin-top: auto)').toBeGreaterThanOrEqual(20);
});

test('R11 – .conteudo ocupa TODO o espaço restante e empilha as seções com gap', async ({ page }) => {
  const c = await estilo(page, '.conteudo', ['flexGrow', 'display', 'flexDirection']);
  expect(Number(c.flexGrow), '.conteudo precisa de flex-grow: 1').toBeGreaterThanOrEqual(1);
  expect(c.display, '.conteudo precisa de display: flex').toBe('flex');
  expect(c.flexDirection, '.conteudo precisa de flex-direction: column').toBe('column');
  const [m] = await rects(page, '.menu');
  const [ct] = await rects(page, '.conteudo');
  expect(perto(m.w + ct.w, 1280, 2), 'Menu + conteúdo devem somar a largura da tela (o .conteudo deve preencher o que sobra)').toBe(true);
  const [resumo] = await rects(page, '.resumo');
  const [painel] = await rects(page, '.painel');
  expect(painel.t - resumo.b, 'Use gap (12px ou mais) entre .resumo e .painel').toBeGreaterThanOrEqual(12);
});

test('R12 – KPIs: 4 cartões na mesma linha, mesma largura, preenchendo a linha (flex-wrap + gap)', async ({ page }) => {
  const r = await estilo(page, '.resumo', ['display', 'flexWrap', 'columnGap', 'paddingRight']);
  expect(r.display, '.resumo precisa de display: flex').toBe('flex');
  expect(r.flexWrap, '.resumo precisa de flex-wrap: wrap (vamos precisar dele no celular)').toBe('wrap');
  expect(px(r.columnGap), 'Use gap (12px ou mais) no .resumo').toBeGreaterThanOrEqual(12);
  const k = (await rects(page, '.kpi')).slice(0, 4);
  const [area] = await rects(page, '.resumo');
  expect(new Set(k.map((x) => Math.round(x.t))).size, 'Os 4 primeiros KPIs devem ficar na mesma linha').toBe(1);
  expect(Math.max(...k.map((x) => x.w)) - Math.min(...k.map((x) => x.w)), 'Os 4 KPIs devem ter a mesma largura').toBeLessThanOrEqual(2);
  expect(perto(k[3].r, area.r - px(r.paddingRight), 2), 'Os KPIs devem crescer e preencher a linha inteira').toBe(true);
});

test('R13 – Painel: o gráfico tem o DOBRO da largura das atividades (flex-grow 2 : 1) e a mesma altura', async ({ page }) => {
  const p = await estilo(page, '.painel', ['display', 'columnGap']);
  expect(p.display, '.painel precisa de display: flex').toBe('flex');
  expect(px(p.columnGap), 'Use gap (12px ou mais) no .painel').toBeGreaterThanOrEqual(12);
  const [g] = await rects(page, '.grafico');
  const [a] = await rects(page, '.atividades');
  const razao = g.w / a.w;
  expect(razao, `O .grafico deve ter ~2x a largura de .atividades (proporção 2:1). Hoje a proporção é ${razao.toFixed(2)}:1. Dica: flex: 2 1 0 e flex: 1 1 0`).toBeGreaterThanOrEqual(1.8);
  expect(razao, `O .grafico deve ter ~2x a largura de .atividades (proporção 2:1). Hoje a proporção é ${razao.toFixed(2)}:1`).toBeLessThanOrEqual(2.2);
  expect(perto(g.h, a.h, 1), 'Os dois blocos do painel devem ter a mesma altura').toBe(true);
  expect(a.l - g.r, 'Deve haver espaço (gap) entre o gráfico e as atividades').toBeGreaterThanOrEqual(12);
});

test('R14 – Lista de atividades: cada <li> com nome na esquerda e horário na direita, sem bolinhas', async ({ page }) => {
  const u = await estilo(page, '.atividades ul', ['listStyleType']);
  expect(u.listStyleType, 'Tire as bolinhas da lista (list-style: none)').toBe('none');
  const li0 = await estilo(page, '.atividades li', ['display', 'justifyContent', 'alignItems']);
  expect(li0.display, 'Cada <li> precisa de display: flex').toBe('flex');
  expect(li0.justifyContent, 'Cada <li> precisa de justify-content: space-between').toBe('space-between');
  expect(li0.alignItems, 'Cada <li> precisa de align-items: center').toBe('center');
  const lis = await rects(page, '.atividades li');
  const quem = await rects(page, '.atividades .quem');
  const quando = await rects(page, '.atividades .quando');
  lis.forEach((li, i) => {
    expect(quem[i].l - li.l, 'O .quem deve ficar na esquerda do <li>').toBeLessThanOrEqual(24);
    expect(li.r - quando[i].r, 'O .quando deve ficar na direita do <li>').toBeLessThanOrEqual(24);
  });
});

test('R15 – Celular (375px): existe @media e o layout vira COLUNA, com o menu em linha no topo', async ({ page }) => {
  expect(semComentarios(ler('style.css')), 'Falta uma regra @media (max-width: ...) no CSS').toMatch(/@media[^{]*\(\s*(max|min)-width/);
  await abrir(page, 375);
  const c = await estilo(page, '.corpo', ['flexDirection']);
  expect(c.flexDirection, 'Em 375px o .corpo deve virar coluna (flex-direction: column)').toBe('column');
  const [m] = await rects(page, '.menu');
  const [ct] = await rects(page, '.conteudo');
  expect(m.b <= ct.t + 1, 'Em 375px o menu deve ficar ACIMA do conteúdo').toBe(true);
  expect(m.w, 'Em 375px o menu deve ocupar a largura toda da tela').toBeGreaterThanOrEqual(373);
  const mm = await estilo(page, '.menu', ['flexDirection']);
  expect(mm.flexDirection, 'Em 375px o menu deve virar uma linha (flex-direction: row)').toBe('row');
  const it = await rects(page, '.menu > .item');
  expect(perto(it[0].t, it[1].t, 2), 'Em 375px os itens do menu devem ficar lado a lado').toBe(true);
});

test('R16 – Celular (375px): KPIs 2 por linha, painel empilhado e sem rolagem horizontal', async ({ page }) => {
  await abrir(page, 375);
  const k = await rects(page, '.kpi');
  expect(perto(k[0].t, k[1].t, 1), 'Em 375px os 2 primeiros KPIs devem ficar lado a lado (dica: flex-basis menor)').toBe(true);
  expect(k[2].t, 'Em 375px o 3º KPI deve ir para a linha de baixo (2 por linha)').toBeGreaterThan(k[0].t + 20);
  const [g] = await rects(page, '.grafico');
  const [a] = await rects(page, '.atividades');
  expect(a.t, 'Em 375px as atividades devem ficar ABAIXO do gráfico').toBeGreaterThanOrEqual(g.b - 1);
  expect(perto(g.l, a.l, 1) && perto(g.w, a.w, 2), 'Em 375px gráfico e atividades devem ter a mesma largura, um embaixo do outro').toBe(true);
  const sobra = await overflowX(page);
  const culpados = await quemEstoura(page);
  expect(sobra, `Há rolagem horizontal em 375px (${sobra}px a mais). Passam da tela: ${culpados.join(', ') || 'veja no navegador'}. Dica: alguns elementos (como <input>) têm uma largura mínima própria; procure por min-width`).toBeLessThanOrEqual(0);
});
