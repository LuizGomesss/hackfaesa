import { Button, Icon, IconButton, Text, TransitPill } from "@/shared/ui";

const steps = [
  {
    icon: "walk" as const,
    tone: "blue",
    title: "Ponto 1",
    meta: "Embarque",
    time: "10:45",
  },
  {
    icon: "bus" as const,
    tone: "blue",
    title: "Terminal Central",
    meta: "Chegada",
    time: "10:51",
    line: "L12",
  },
  {
    icon: "bus" as const,
    tone: "green",
    title: "Terminal Leste",
    meta: "Chegada",
    time: "11:28",
    line: "L28",
  },
  {
    icon: "walk" as const,
    tone: "orange",
    title: "Ponto 2",
    meta: "Embarque",
    time: "—",
  },
  {
    icon: "pin" as const,
    tone: "red",
    title: "Destino",
    meta: "Chegada",
    time: "11:33",
  },
];

export async function MapaPage() {
  return (
    <main className="trip-shell">
      <section className="trip-card" aria-label="Planejamento da viagem">
        <div className="route-editor">
          <div className="route-line" aria-hidden="true">
            <span className="route-dot route-dot--blue" />
            <span />
            <span className="route-dot route-dot--green" />
          </div>
          <div className="route-field route-field--origin">
            <Text>Origem</Text>
            <strong>Ponto 1 – Av. Central, 100</strong>
          </div>
          <div className="route-field">
            <Text>Destino</Text>
            <strong>Destino – Universidade GV</strong>
          </div>
          <IconButton label="Inverter origem e destino" className="swap-button">
            <Icon name="swap" size={29} />
          </IconButton>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <Icon name="clock" size={35} />
            <div>
              <Text>Tempo estimado</Text>
              <strong>48 min</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--muted">
              <Icon name="swap-horizontal" size={30} />
            </span>
            <div>
              <Text>Trocas</Text>
              <strong>2</strong>
            </div>
          </div>
          <div className="stat-card stat-card--lines">
            <Icon name="bus" size={35} />
            <div>
              <Text>Linhas</Text>
              <span className="pill-row">
                <TransitPill>L12</TransitPill>
                <TransitPill tone="green">L28</TransitPill>
              </span>
            </div>
          </div>
        </div>
        <div
          className="map-placeholder"
          role="img"
          aria-label="Área reservada para integração do mapa"
        >
          <div className="map-placeholder__content">
            <div className="map-placeholder__icon">
              <Icon name="crosshair" size={32} />
            </div>
            <Text as="h2">Mapa da rota</Text>
            <Text>Disponível em breve via integração de mapas.</Text>
          </div>
          <IconButton label="Centralizar mapa" className="map-control">
            <Icon name="crosshair" size={26} />
          </IconButton>
        </div>
        <section className="route-steps">
          <div className="grabber" />
          <Text as="h2">Passo a passo da sua rota</Text>
          <div className="steps-list">
            {steps.map((step, index) => (
              <div className="step-wrapper" key={step.title}>
                <div className={`step step--${step.tone}`}>
                  <div className="step-icon">
                    <Icon name={step.icon} size={28} />
                  </div>
                  <Text as="h3">{step.title}</Text>
                  <Text>{step.meta}</Text>
                  <strong>{step.time}</strong>
                  {step.line && (
                    <TransitPill
                      tone={step.tone === "green" ? "green" : "blue"}
                    >
                      {step.line}
                    </TransitPill>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <span className="step-arrow">→</span>
                )}
              </div>
            ))}
          </div>
          <Button className="start-button">
            <Icon name="navigation" size={25} />
            Iniciar navegação
          </Button>
        </section>
      </section>
    </main>
  );
}
