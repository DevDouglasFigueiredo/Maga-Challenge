# language: pt

@parte1 @questao1_1 @api1
Funcionalidade: Respeitar os limites de consulta da API do GitHub
  Como consumidor de dados públicos de usuários
  Quero reconhecer a cota disponível e seu esgotamento
  Para realizar consultas respeitando os limites do serviço

  @API-01
  Cenário: Informar limite de 60 consultas por hora sem autenticação
    Dado que existe cota disponível para consultas públicas sem autenticação
    Quando consulto o usuário público "github"
    Então recebo os dados do usuário solicitado
    E sou informado do limite de 60 consultas por hora
    E sou informado da quantidade restante e do momento de renovação da cota
    E a quantidade restante está dentro do limite permitido

  @API-02
  Cenário: Informar limite de 5000 consultas por hora com autenticação
    Dado que possuo autenticação válida no GitHub com cota padrão de 5000 consultas por hora
    E existe cota disponível para consultas autenticadas
    Quando consulto o usuário público "github" com minha autenticação
    Então recebo os dados do usuário solicitado
    E sou informado do limite de 5000 consultas por hora
    E sou informado da quantidade restante e do momento de renovação da cota
    E a quantidade restante está dentro do limite permitido

  @API-03
  Cenário: Reconhecer o esgotamento da cota como causa da recusa de acesso
    Dado que a cota de consultas da janela atual está esgotada
    Quando consulto o usuário público "github"
    Então a consulta é recusada por esgotamento da cota
    E sou informado de que não restam consultas nessa janela
    E identifico que o limite de consultas foi atingido
