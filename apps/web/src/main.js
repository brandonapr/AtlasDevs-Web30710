import './styles.css';

document.querySelector('#app').innerHTML = `
  <main class="app-shell">
    <nav class="topbar" aria-label="Navegacion principal">
      <a class="brand" href="#">
        <span class="brand-mark">ED</span>
        <span>EDValleDigital</span>
      </a>
      <div class="nav-actions">
        <a href="#menu">Menu</a>
        <a href="#ordenes">Ordenes</a>
        <a href="#cocina">Cocina</a>
        <a href="#caja">Caja</a>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">MVP restaurante</p>
        <h1>Pedidos claros para comedor, caja y cocina.</h1>
        <p class="hero-copy">
          Una interfaz responsive para tomar ordenes, revisar estados y mantener al equipo alineado desde cualquier dispositivo.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#ordenes">Ver ordenes</a>
          <a class="button secondary" href="#menu">Gestionar menu</a>
        </div>
      </div>

      <aside class="status-panel" aria-label="Resumen del turno">
        <div>
          <span class="metric-value">18</span>
          <span class="metric-label">ordenes activas</span>
        </div>
        <div>
          <span class="metric-value">07</span>
          <span class="metric-label">en cocina</span>
        </div>
        <div>
          <span class="metric-value">04</span>
          <span class="metric-label">listas para cobrar</span>
        </div>
      </aside>
    </section>

    <section class="workspace" aria-label="Modulos del sistema">
      <article class="module-card" id="menu">
        <span class="card-tag">Menu</span>
        <h2>Catalogo de platos</h2>
        <p>Organiza productos, precios y disponibilidad para que el equipo venda sin friccion.</p>
      </article>

      <article class="module-card highlighted" id="ordenes">
        <span class="card-tag">Ordenes</span>
        <h2>Flujo de pedidos</h2>
        <p>Registra mesas, cantidades y observaciones con una vista comoda en pantallas pequenas.</p>
      </article>

      <article class="module-card" id="cocina">
        <span class="card-tag">Cocina</span>
        <h2>Estados en vivo</h2>
        <p>Prioriza preparaciones y reduce errores con tarjetas legibles desde tablets o monitores.</p>
      </article>

      <article class="module-card" id="caja">
        <span class="card-tag">Caja</span>
        <h2>Cobro rapido</h2>
        <p>Consulta consumos listos, calcula totales y prepara el cierre del turno con claridad.</p>
      </article>
    </section>
  </main>
`;
