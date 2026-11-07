# language: pt

# Questão 1.1 — API-01 automatizado, aguardando validação do usuário.
# API-02 e API-03 permanecem planejados, sem implementação.
# @integracao: chamadas reais ao serviço público indicado no desafio.
# @simulado: serviço controlado para validar regras e tratamento pelo cliente.
# Cada cenário estabelece seu próprio estado, sem depender de execuções anteriores.
#
# API 1 — GitHub: rate limiting.
# Requisito 1 (headers sem e com autenticação): API-01 e API-02.
# Requisito 2 (limite atingido com status 403): API-03.
#
# Critérios técnicos para futura implementação:
# - API-01 e API-02: GET https://api.github.com/users/github; status 200
#   e identidade github. Validar os três headers nas duas modalidades:
#   X-RateLimit-Limit, X-RateLimit-Remaining e X-RateLimit-Reset.
# - API-01: sem autenticação, limite = 60 e saldo inteiro entre 0 e 59.
# - API-02: com token pessoal GitHub de cota padrão de 5.000/h, fornecido
#   pelo ambiente; limite = 5000 e saldo inteiro entre 0 e 4999.
#   Não incluir o token no arquivo nem nos logs de execução.
# - Nas duas consultas, reset deve representar epoch UTC em segundos,
#   coerente com a janela de uma hora e o horário do servidor.
#   Não presumir saldo inicialmente completo nem decremento exato entre chamadas.
#   Cota já esgotada é limitação ambiental, não aprovação do caso feliz.
# - API-03: simular status 403, X-RateLimit-Remaining = 0 e mensagem de
#   limite atingido. Validar que a recusa é identificada como esgotamento da cota.
#   Nunca esgotar a cota pública para produzir esse cenário.
#
# Referência: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

@parte1 @questao1_1 @api1
Funcionalidade: Respeitar os limites de consulta da API do GitHub
  Como consumidor de dados públicos de usuários
  Quero reconhecer a cota disponível e seu esgotamento
  Para realizar consultas respeitando os limites do serviço

  @integracao @github @API-01 @only
  Cenário: Informar limite de 60 consultas por hora sem autenticação
    Dado que existe cota disponível para consultas públicas sem autenticação
    Quando consulto o usuário público "github"
    Então recebo os dados do usuário solicitado
    E sou informado do limite de 60 consultas por hora
    E sou informado da quantidade restante e do momento de renovação da cota
    E a quantidade restante está dentro do limite permitido

  @integracao @github @API-02
  Cenário: Informar limite de 5000 consultas por hora com autenticação
    Dado que possuo autenticação válida no GitHub com cota padrão de 5000 consultas por hora
    E existe cota disponível para consultas autenticadas
    Quando consulto o usuário público "github" com minha autenticação
    Então recebo os dados do usuário solicitado
    E sou informado do limite de 5000 consultas por hora
    E sou informado da quantidade restante e do momento de renovação da cota
    E a quantidade restante está dentro do limite permitido

  @simulado @rate_limit @API-03
  Cenário: Reconhecer o esgotamento da cota como causa da recusa de acesso
    Dado que a cota de consultas da janela atual está esgotada
    Quando consulto o usuário público "github"
    Então a consulta é recusada por esgotamento da cota
    E sou informado de que não restam consultas nessa janela
    E identifico que o limite de consultas foi atingido
