/* ==========================================================================
   app.js - Lógica do sistema (front-end puro, dados mockados)
   Clínica Geral - Gestão de Agendas Médicas
   ========================================================================== */

/* --------------------------------------------------------------------------
   DADOS MOCKADOS
   -------------------------------------------------------------------------- */

const MEDICOS = [
  { id: 1, nome: "Dr. Carlos Silva", especialidade: "Cardiologia" },
  { id: 2, nome: "Dra. Ana Souza", especialidade: "Pediatria" },
  { id: 3, nome: "Dr. Ricardo Lima", especialidade: "Clínica Geral" },
  { id: 4, nome: "Dra. Marina Costa", especialidade: "Check-up" },
];

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const DATAS = ["16/06", "17/06", "18/06", "19/06", "20/06"]; // semana atual (20/06 = hoje)
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const STATUS_INFO = {
  confirmado: { label: "Confirmado", classe: "status-confirmado", cor: "#1e9e57" },
  espera: { label: "Em espera", classe: "status-espera", cor: "#c79100" },
  cancelado: { label: "Cancelado", classe: "status-cancelado", cor: "#d23b3b" },
  atendimento: { label: "Em atendimento", classe: "status-atendimento", cor: "#1763c7" },
  finalizado: { label: "Finalizado", classe: "status-finalizado", cor: "#6b7280" },
};

// dia: índice 0-4 (Seg-Sex) | hora: string HORARIOS
const CONSULTAS = [
  { id: 1, paciente: "João Pereira", medicoId: 1, dia: 0, hora: "08:00", duracao: "30 min", sala: "Sala 1", status: "confirmado" },
  { id: 2, paciente: "Maria Santos", medicoId: 2, dia: 0, hora: "09:00", duracao: "30 min", sala: "Sala 2", status: "finalizado" },
  { id: 3, paciente: "Pedro Alves", medicoId: 3, dia: 0, hora: "10:00", duracao: "45 min", sala: "Sala 3", status: "espera" },
  { id: 4, paciente: "Lucia Ferreira", medicoId: 1, dia: 1, hora: "08:00", duracao: "30 min", sala: "Sala 1", status: "confirmado" },
  { id: 5, paciente: "Carlos Mendes", medicoId: 4, dia: 1, hora: "11:00", duracao: "60 min", sala: "Sala 4", status: "cancelado" },
  { id: 6, paciente: "Ana Beatriz", medicoId: 2, dia: 2, hora: "09:00", duracao: "30 min", sala: "Sala 2", status: "confirmado" },
  { id: 7, paciente: "Roberto Dias", medicoId: 3, dia: 2, hora: "14:00", duracao: "45 min", sala: "Sala 3", status: "espera" },
  { id: 8, paciente: "Fernanda Rocha", medicoId: 1, dia: 3, hora: "10:00", duracao: "30 min", sala: "Sala 1", status: "confirmado" },
  { id: 9, paciente: "Marcos Vinícius", medicoId: 4, dia: 3, hora: "15:00", duracao: "60 min", sala: "Sala 4", status: "finalizado" },
  { id: 10, paciente: "Juliana Lima", medicoId: 2, dia: 4, hora: "08:00", duracao: "30 min", sala: "Sala 2", status: "atendimento" },
  { id: 11, paciente: "Paulo Henrique", medicoId: 3, dia: 4, hora: "09:00", duracao: "45 min", sala: "Sala 3", status: "confirmado" },
  { id: 12, paciente: "Beatriz Gomes", medicoId: 1, dia: 4, hora: "16:00", duracao: "30 min", sala: "Sala 1", status: "espera" },
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */

function getMedico(id) {
  return MEDICOS.find((m) => m.id === id) || { nome: "—", especialidade: "—" };
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/* --------------------------------------------------------------------------
   FILTROS (estado global aplicado à agenda) - requisito 4.6
   -------------------------------------------------------------------------- */

const filtros = { medico: "", especialidade: "", status: "", sala: "", busca: "" };

function consultasFiltradas() {
  return CONSULTAS.filter((c) => {
    const med = getMedico(c.medicoId);
    if (filtros.medico && c.medicoId !== Number(filtros.medico)) return false;
    if (filtros.especialidade && med.especialidade !== filtros.especialidade) return false;
    if (filtros.status && c.status !== filtros.status) return false;
    if (filtros.sala && c.sala !== filtros.sala) return false;
    if (filtros.busca) {
      const alvo = (c.paciente + " " + med.nome).toLowerCase();
      if (!alvo.includes(filtros.busca.toLowerCase())) return false;
    }
    return true;
  });
}

/* --------------------------------------------------------------------------
   RENDER DA AGENDA SEMANAL - requisito 4.4
   -------------------------------------------------------------------------- */

function renderAgenda() {
  const grid = document.getElementById("agendaGrid");
  if (!grid) return;

  const lista = consultasFiltradas();

  // Estado vazio: nenhum resultado para o filtro/busca atual
  const wrap = document.getElementById("agendaWrap");
  const vazio = document.getElementById("agendaVazio");
  if (vazio && wrap) {
    const semNada = lista.length === 0;
    vazio.style.display = semNada ? "block" : "none";
    wrap.style.display = semNada ? "none" : "block";
    if (semNada) return;
  }

  const hojeIdx = 4; // sexta (20/06) marcada como "hoje" no mock
  let html = '<div class="cabecalho">Hora</div>';

  DIAS.forEach((dia, i) => {
    const ehHoje = i === hojeIdx ? " hoje" : "";
    html += `<div class="cabecalho${ehHoje}">${dia}<small>${DATAS[i]}</small></div>`;
  });

  HORARIOS.forEach((hora) => {
    html += `<div class="hora-label">${hora}</div>`;
    DIAS.forEach((_, diaIdx) => {
      const noSlot = lista.filter((c) => c.dia === diaIdx && c.hora === hora);
      html += '<div class="celula">';
      noSlot.forEach((c) => {
        const med = getMedico(c.medicoId);
        const st = STATUS_INFO[c.status];
        html += `
          <div class="consulta-card ${st.classe}" onclick="abrirDetalhe(${c.id})" tabindex="0"
               role="button" aria-label="Consulta de ${escapeHtml(c.paciente)} às ${c.hora}">
            <div class="c-hora">${c.hora}</div>
            <div class="c-paciente">${escapeHtml(c.paciente)}</div>
            <div class="c-info">${escapeHtml(med.nome)} · ${c.sala}</div>
          </div>`;
      });
      html += "</div>";
    });
  });

  grid.innerHTML = html;
}

/* --------------------------------------------------------------------------
   DETALHE DA CONSULTA (modal) - requisito 8 (Modal)
   -------------------------------------------------------------------------- */

let consultaAtual = null; // id da consulta aberta no modal

function abrirDetalhe(id) {
  const c = CONSULTAS.find((x) => x.id === id);
  if (!c) return;
  consultaAtual = id;
  const med = getMedico(c.medicoId);
  const st = STATUS_INFO[c.status];

  document.getElementById("detPaciente").textContent = c.paciente;
  document.getElementById("detMedico").textContent = med.nome + " (" + med.especialidade + ")";
  document.getElementById("detHorario").textContent =
    DIAS[c.dia] + ", " + DATAS[c.dia] + " às " + c.hora;
  document.getElementById("detDuracao").textContent = c.duracao;
  document.getElementById("detSala").textContent = c.sala;
  const badge = document.getElementById("detStatus");
  badge.textContent = st.label;
  badge.className = "badge-status " + st.classe;

  new bootstrap.Modal(document.getElementById("modalDetalhe")).show();
}

// Confirmar/cancelar a consulta aberta no modal - atualiza tudo na hora
function mudarStatus(novoStatus) {
  const c = CONSULTAS.find((x) => x.id === consultaAtual);
  if (!c) return;
  c.status = novoStatus;

  const st = STATUS_INFO[novoStatus];
  const badge = document.getElementById("detStatus");
  badge.textContent = st.label;
  badge.className = "badge-status " + st.classe;

  // re-renderiza painéis afetados pelo novo status
  renderAgenda();
  renderTimeline();
  renderKPIs();
  renderGraficos();
}

/* --------------------------------------------------------------------------
   KPIs do Dashboard - requisito 4.3
   -------------------------------------------------------------------------- */

function renderKPIs() {
  const set = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };
  const hojeIdx = 4;
  const doDia = CONSULTAS.filter((c) => c.dia === hojeIdx);
  const pendentes = CONSULTAS.filter((c) => c.status === "espera").length;
  const aguardando = CONSULTAS.filter((c) => c.status === "espera" || c.status === "atendimento").length;
  const ativas = CONSULTAS.filter((c) => c.status !== "cancelado").length;
  const faturamento = ativas * 180; // R$180 por consulta (mock)
  const ocupacao = Math.round((ativas / (HORARIOS.length * DIAS.length)) * 100);

  set("kpiDia", doDia.length);
  set("kpiPendentes", pendentes);
  set("kpiAguardando", aguardando);
  set("kpiFaturamento", "R$ " + faturamento.toLocaleString("pt-BR"));
  set("kpiOcupacao", ocupacao + "%");
}

/* --------------------------------------------------------------------------
   GRÁFICOS (Chart.js) - requisito 4.3 (componentes visuais)
   -------------------------------------------------------------------------- */

let chartMedico = null;
let chartStatus = null;

function renderGraficos() {
  if (typeof Chart === "undefined") return;

  // Consultas por médico (barras) - ignora canceladas
  const ativas = CONSULTAS.filter((c) => c.status !== "cancelado");
  const porMedico = MEDICOS.map(
    (m) => ativas.filter((c) => c.medicoId === m.id).length
  );

  const canvasMed = document.getElementById("graficoMedico");
  if (canvasMed) {
    if (chartMedico) chartMedico.destroy();
    chartMedico = new Chart(canvasMed, {
      type: "bar",
      data: {
        labels: MEDICOS.map((m) => m.nome.replace("Dr. ", "").replace("Dra. ", "")),
        datasets: [
          {
            label: "Consultas",
            data: porMedico,
            backgroundColor: "#126b86",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  // Distribuição por status (rosca)
  const ordemStatus = ["confirmado", "espera", "atendimento", "finalizado", "cancelado"];
  const porStatus = ordemStatus.map(
    (s) => CONSULTAS.filter((c) => c.status === s).length
  );

  const canvasSt = document.getElementById("graficoStatus");
  if (canvasSt) {
    if (chartStatus) chartStatus.destroy();
    chartStatus = new Chart(canvasSt, {
      type: "doughnut",
      data: {
        labels: ordemStatus.map((s) => STATUS_INFO[s].label),
        datasets: [
          {
            data: porStatus,
            backgroundColor: ordemStatus.map((s) => STATUS_INFO[s].cor),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}

/* --------------------------------------------------------------------------
   BUSCA GLOBAL com debounce + autocomplete - requisito 4.7
   -------------------------------------------------------------------------- */

let debounceTimer;

function initBuscaGlobal() {
  const input = document.getElementById("buscaGlobal");
  const box = document.getElementById("searchResults");
  if (!input || !box) return;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const termo = input.value.trim().toLowerCase();
    debounceTimer = setTimeout(() => {
      if (!termo) {
        box.classList.remove("aberto");
        return;
      }
      const achados = CONSULTAS.filter((c) => {
        const med = getMedico(c.medicoId);
        return (c.paciente + " " + med.nome).toLowerCase().includes(termo);
      }).slice(0, 6);

      if (achados.length === 0) {
        box.innerHTML = '<div class="vazio">Nenhum resultado encontrado</div>';
      } else {
        box.innerHTML = achados
          .map((c) => {
            const med = getMedico(c.medicoId);
            return `<div class="item" onclick="abrirDetalhe(${c.id})">
                <strong>${escapeHtml(c.paciente)}</strong>
                <small>${escapeHtml(med.nome)} · ${DIAS[c.dia]} ${c.hora} · ${c.sala}</small>
              </div>`;
          })
          .join("");
      }
      box.classList.add("aberto");
    }, 250);
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !box.contains(e.target)) {
      box.classList.remove("aberto");
    }
  });
}

/* --------------------------------------------------------------------------
   TIMELINE OPERACIONAL - requisito 4.8
   -------------------------------------------------------------------------- */

function renderTimeline() {
  const ul = document.getElementById("timeline");
  if (!ul) return;
  const hojeIdx = 4;
  const horaAtual = "10:00"; // mock do "horário atual"
  const doDia = CONSULTAS.filter((c) => c.dia === hojeIdx).sort((a, b) =>
    a.hora.localeCompare(b.hora)
  );

  ul.innerHTML = doDia
    .map((c) => {
      const med = getMedico(c.medicoId);
      const agora = c.hora === horaAtual ? " agora" : "";
      return `<li class="${agora}">
          <div class="t-hora">${c.hora} ${agora ? "• agora" : ""}</div>
          <div class="t-desc">${escapeHtml(c.paciente)} — ${escapeHtml(med.nome)}</div>
        </li>`;
    })
    .join("");
}

/* --------------------------------------------------------------------------
   FILTROS: popular selects e ligar eventos - requisito 4.6
   -------------------------------------------------------------------------- */

function initFiltros() {
  const selMed = document.getElementById("filtroMedico");
  const selEsp = document.getElementById("filtroEspecialidade");
  const selSala = document.getElementById("filtroSala");

  if (selMed) {
    MEDICOS.forEach((m) => {
      selMed.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
    });
  }
  if (selEsp) {
    [...new Set(MEDICOS.map((m) => m.especialidade))].forEach((e) => {
      selEsp.innerHTML += `<option value="${e}">${e}</option>`;
    });
  }
  if (selSala) {
    [...new Set(CONSULTAS.map((c) => c.sala))].sort().forEach((s) => {
      selSala.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }

  // atualização dinâmica, sem reload
  const aplicar = () => {
    filtros.medico = selMed ? selMed.value : "";
    filtros.especialidade = selEsp ? selEsp.value : "";
    filtros.sala = selSala ? selSala.value : "";
    const selStatus = document.getElementById("filtroStatus");
    filtros.status = selStatus ? selStatus.value : "";
    renderAgenda();
  };

  ["filtroMedico", "filtroEspecialidade", "filtroStatus", "filtroSala"].forEach((idSel) => {
    const el = document.getElementById(idSel);
    if (el) el.addEventListener("change", aplicar);
  });
}

/* --------------------------------------------------------------------------
   TROCA DE VISÃO (diária/semanal/mensal) - requisito 4.4
   -------------------------------------------------------------------------- */

function initViewSwitch() {
  const botoes = document.querySelectorAll(".view-switch button");
  botoes.forEach((b) => {
    b.addEventListener("click", () => {
      botoes.forEach((x) => x.classList.remove("ativo"));
      b.classList.add("ativo");
      const aviso = document.getElementById("viewAviso");
      if (aviso) {
        const v = b.dataset.view;
        aviso.textContent =
          v === "semanal"
            ? ""
            : "Visão " + v + ' selecionada (demonstração usa a grade semanal).';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   SIDEBAR TOGGLE (mobile)
   -------------------------------------------------------------------------- */

function initSidebarToggle() {
  const btn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (btn && sidebar) {
    btn.addEventListener("click", () => sidebar.classList.toggle("aberta"));
  }
}

/* --------------------------------------------------------------------------
   INICIALIZAÇÃO DO DASHBOARD
   -------------------------------------------------------------------------- */

function initDashboard() {
  renderKPIs();
  renderGraficos();
  renderAgenda();
  renderTimeline();
  initFiltros();
  initViewSwitch();
  initBuscaGlobal();
  initSidebarToggle();
}
