# language: pt

@parte1 @questao1_1 @api2
Funcionalidade: Autenticação com token
  Como consumidor da API
  Quero utilizar o token obtido no login e reconhecer sua expiração
  Para consultar dados e tratar a perda de autenticação

  @reqres @API-07
  Cenário: Consultar dados após autenticação válida
    Dado que possuo credenciais válidas no ReqRes
    Quando realizo login e consulto um usuário
    Então recebo os dados do usuário solicitado

  @autenticacao @API-08
  Cenário: Tratar o erro de autenticação após a expiração do token
    Dado que possuo um token com validade simulada de 2 minutos
    E esse prazo de validade já foi atingido
    Quando tento realizar uma consulta utilizando esse token
    Então a consulta é recusada por expiração da autenticação
    E o erro informa que o token expirou
    E o token expirado é descartado
    E sou informado de que preciso me autenticar novamente
