# Google Maps

O restante da aplicação acessa a feature pelo `index.ts`.

- `api/`: consultas ao Google Places, Geocoding e Routes; converte respostas do SDK em dados usados pela feature.
- `config/`: centro, zoom inicial e estilo do mapa.
- `model/`: tipos dos pontos, parâmetros da área de busca e cache em memória.
- `hooks/`: ciclo de vida React do mapa, dos pontos e da rota. `useGoogleMap` compõe os demais hooks.
- `ui/`: apresentação dos marcadores e da janela de informações dos pontos.

`shared/lib/google-maps/` contém o carregamento do SDK e o overlay HTML genérico, utilizados pelos diferentes serviços e marcadores. Debounce e distância geográfica também ficam em `shared/lib/`, sem dependência da feature.

O cache pertence à instância de `useBusStops`: mantém os pontos por ID, resultados por área/zoom e consultas em andamento. Falhas permitem nova tentativa. Uma busca concluída continua alimentando o cache mesmo se o usuário mover o mapa; camadas desmontadas não recebem atualizações. Recriar o mapa restaura os marcadores com os dados da mesma sessão. Desmontar a página descarta o cache.

A busca de endereços usa Place Autocomplete com um token por sessão: as consultas digitadas e a escolha são agrupadas até a seleção. Um local escolhido leva suas coordenadas para a rota; texto livre, como um CEP confirmado com Enter, passa pelo Geocoding.

Uma área consultada não representa um inventário completo dos pontos: Nearby Search retorna até 20 resultados por consulta. Alterar o zoom permite uma busca com outro nível de detalhe.

Verificações: `npx vitest run --config vitest.unit.config.mts` e `npm run build`.

O planejamento consulta a viagem completa e, quando há conexão na rua, amplia a busca pelos terminais identificados nos pontos de baldeação. Plataformas com nomes genéricos passam por uma busca de terminais próximos no Places. Para cada terminal, consulta o acesso com ônibus e recalcula o trecho seguinte após a chegada, incluindo caminhada e três minutos de margem. Só considera a conexão interna quando os pontos de desembarque e embarque identificam o mesmo terminal e estão próximos; uma caminhada da rodovia até o terminal continua sendo externa.

A seleção prioriza menos conexões externas antes de aplicar a margem de 15–30 minutos para reduzir caminhadas. Essa margem é calculada sobre a viagem mais rápida do grupo de conexões preferido; uma baldeação pela rua não elimina antecipadamente uma alternativa dentro do terminal. Um limite separado de uma hora adicional em relação à viagem mais rápida evita desvios extremos. Dentro do grupo preferido, considera menos caminhada, dando peso maior à caminhada entre ônibus. Não há preferência fixa por número de linha. A expansão limita-se a dois terminais e duas opções de acesso por terminal, e preserva as rotas completas se uma consulta adicional falhar. O valor da tarifa de um trecho isolado não é apresentado como tarifa total de uma viagem montada por trechos. O mapa mostra um único marcador de baldeação por troca.
