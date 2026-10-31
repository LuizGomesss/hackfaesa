# Google Maps

O restante da aplicação acessa a feature pelo `index.ts`.

- `api/`: consultas ao Google Places, Geocoding e Routes; converte respostas do SDK em dados usados pela feature.
- `config/`: centro, zoom inicial e estilo do mapa.
- `model/`: tipos dos pontos, parâmetros da área de busca e cache em memória.
- `hooks/`: ciclo de vida React do mapa, dos pontos e da rota. `useGoogleMap` compõe os demais hooks.
- `ui/`: apresentação dos marcadores e da janela de informações dos pontos.

`shared/lib/google-maps/` contém o carregamento do SDK e o overlay HTML genérico, utilizados pelos diferentes serviços e marcadores. Debounce e distância geográfica também ficam em `shared/lib/`, sem dependência da feature.

O cache pertence à instância de `useBusStops`: mantém os pontos por ID, resultados por área/zoom e consultas em andamento. Falhas permitem nova tentativa. Uma busca concluída continua alimentando o cache mesmo se o usuário mover o mapa; camadas desmontadas não recebem atualizações. Recriar o mapa restaura os marcadores com os dados da mesma sessão. Desmontar a página descarta o cache.

Uma área consultada não representa um inventário completo dos pontos: Nearby Search retorna até 20 resultados por consulta. Alterar o zoom permite uma busca com outro nível de detalhe.

Verificações: `npx vitest run --config vitest.unit.config.mts` e `npm run build`.
