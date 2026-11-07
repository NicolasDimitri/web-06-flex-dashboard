# Projeto 06 – Dashboard Flex (HTML + CSS) · Nível ⭐⭐⭐ Difícil

Um painel de controle completo: topo, menu lateral, cartões de indicadores, gráfico + lista de atividades e rodapé. Aqui você usa **Flexbox dentro de Flexbox** (um flex dentro do outro) e faz o layout se transformar para o celular.

Crie `index.html` e `style.css` aqui na raiz.

> 🧗 **Este desafio é grande de propósito.** Ninguém acerta tudo de primeira, e tudo bem. O robô mostra a tabela a cada commit, então o plano é: faça um pedacinho, dê `commit` + `push`, veja os ✅ aparecendo e siga em frente. Comece pelo HTML (R3), depois pelo esqueleto da tela (R5, R8, R9) e vá subindo.

**Estrutura HTML obrigatória**

```html
<body>
  <div class="app">
    <header class="topo">
      <div class="logo">Painel</div>
      <input class="busca" type="search" placeholder="Buscar...">
      <div class="usuario">
        <span class="avatar">N</span>
        <span class="nome">Seu nome</span>
      </div>
    </header>

    <div class="corpo">
      <aside class="menu">
        <a class="item" href="#">Início</a>
        <!-- 5 ou mais itens; o último tem as classes "item sair" -->
        <a class="item sair" href="#">Sair</a>
      </aside>

      <main class="conteudo">
        <section class="resumo">
          <article class="kpi"><h3>Pedidos</h3><p class="valor">128</p></article>
          <!-- 4 ou mais kpis -->
        </section>
        <section class="painel">
          <div class="grafico"><h2>Vendas</h2><p>Gráfico aqui</p></div>
          <div class="atividades">
            <h2>Atividades</h2>
            <ul>
              <li><span class="quem">Maria pagou</span><span class="quando">10:02</span></li>
              <!-- 4 ou mais itens -->
            </ul>
          </div>
        </section>
      </main>
    </div>

    <footer class="rodape">© 2026 Painel</footer>
  </div>
</body>
```

**Requisitos**

1. **R1** – Base do HTML: doctype, `lang="pt-BR"`, charset UTF-8, `<title>` e `<meta name="viewport" ...>`.
2. **R2** – CSS em `style.css`, ligado por `<link>`; sem `style=""` e sem `<style>`.
3. **R3** – A estrutura acima existe (5+ itens no menu, exatamente um `.sair` e ele é o último, 4+ `.kpi` com `.valor`, 4+ atividades com `.quem` e `.quando`).
4. **R4** – `body` com `margin: 0`; `box-sizing: border-box` em `.topo`, `.menu`, `.conteudo` e `.kpi`.
5. **R5** – `.app` é um flex em coluna que ocupa a tela toda: o `.corpo` cresce e o rodapé fica no fim da tela **mesmo com pouco conteúdo**.
6. **R6** – `.topo` em Flexbox com `align-items: center` e `gap`: o logo na esquerda, o usuário na direita e a **busca cresce** e ocupa o espaço do meio (300px ou mais em 1280px).
7. **R7** – O `.avatar` é um círculo de 40 a 64px, com a inicial **centralizada com Flexbox**; `.usuario` é um flex com `gap`, e o avatar fica alinhado ao centro vertical do nome.
8. **R8** – `.corpo` é um flex em linha: menu à esquerda e conteúdo à direita.
9. **R9** – `.menu` tem de 180 a 280px de largura, **não encolhe**, é um flex em coluna e vai até o rodapé (altura total), mesmo com pouco conteúdo.
10. **R10** – O item "Sair" fica no **fim do menu**, bem separado dos outros itens.
11. **R11** – `.conteudo` ocupa **todo o espaço restante** (menu + conteúdo somam a largura da tela) e empilha `.resumo` e `.painel` em coluna, com `gap` de 12px ou mais.
12. **R12** – Os KPIs: 4 cartões na mesma linha, com a mesma largura, preenchendo a linha. `.resumo` usa `flex-wrap: wrap` e `gap` de 12px ou mais.
13. **R13** – No `.painel`, o `.grafico` tem o **dobro da largura** de `.atividades` (proporção 2 : 1), os dois têm a mesma altura e existe `gap` entre eles.
14. **R14** – Lista de atividades sem bolinhas; cada `<li>` é um flex com o `.quem` na esquerda e o `.quando` na direita, centralizados na vertical.
15. **R15** – Celular (375px): existe `@media` e o `.corpo` vira **coluna**, com o menu **acima** do conteúdo, ocupando a largura toda e com os itens **em linha**.
16. **R16** – Celular (375px): os KPIs ficam **2 por linha**, o gráfico fica **acima** das atividades (empilhados, com a mesma largura) e **não** existe rolagem horizontal.

<details>
<summary>💡 Dicas (abra só se travar)</summary>

**Nível 1 – O mapa mental**
- Pense em camadas: o `.app` é uma **coluna** (topo, corpo, rodapé); o `.corpo` é uma **linha** (menu, conteúdo); o `.conteudo` é outra **coluna**; o `.resumo` e o `.painel` são **linhas** de novo.
- Em cada nível pergunte: "quem cresce, quem tem tamanho fixo e quem não pode encolher?".
- Proporção 2 : 1 não se faz com larguras fixas: pense em **quanto cada um cresce** do espaço livre.
- Para o celular, a ideia é só **trocar a direção** dos containers certos dentro do `@media`.

**Nível 2 – Nomes das ferramentas**
- Altura: `min-height: 100vh` no `.app` e `flex: 1` no `.corpo`.
- Menu que não encolhe: `flex-shrink: 0` (ou `flex: 0 0 220px`).
- "Sair" no fim: um container flex em coluna com `margin-top: auto` no último item.
- Proporção 2 : 1: `flex: 2 1 0` de um lado e `flex: 1 1 0` do outro.
- KPIs 2 por linha no celular: `flex-wrap: wrap` mais um `flex-basis` menor dentro do `@media`.
- 🪤 **Pegadinha clássica:** no celular a página ganhou rolagem horizontal e o culpado parece ser o topo? Elementos como `<input>` têm uma largura mínima própria. Pesquise por `min-width` em itens flex.
</details>

---

## Como entregar

1. Clone o repositório: `git clone https://github.com/NicolasDimitri/web-06-flex-dashboard.git` e entre na pasta.
2. Crie uma branch: `git switch -c meu-projeto`
3. Crie os arquivos pedidos aqui na raiz, ao lado deste README.
4. `git add .` → `git commit -m "mensagem"` → `git push -u origin meu-projeto`
5. No GitHub, clique em **Compare & pull request** → **Create pull request**.
6. A cada commit, o robô adiciona **um novo comentário** no PR com uma **tabela de requisitos** (✅ passou / ❌ não passou, com a dica do que falta) e a **porcentagem concluída**.
   Os comentários anteriores ficam como histórico do seu progresso. Corrija, faça novo commit + `git push` e uma nova tabela aparece.
7. Com tudo ✅, sua entrega está concluída. **O PR não será mesclado na `main`**: ele fica aberto só para a avaliação e para o instrutor revisar.

## Testar no seu computador (opcional)

```bash
npm install
npx playwright install --with-deps chromium   # só na primeira vez
npm test
```

> Não altere as pastas `tests/`, `scripts/` e `.github/`.
