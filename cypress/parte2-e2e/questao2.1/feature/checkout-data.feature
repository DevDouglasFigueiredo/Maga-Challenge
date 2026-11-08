# language: pt

@parte2 @CheckoutData
Funcionalidade: Identificação do cliente no checkout
  Como cliente com produtos no carrinho
  Quero informar meus dados para a compra
  Para revisar o pedido antes de concluí-lo

  Contexto: Cliente autenticado com produtos para comprar
    Dado que o cliente está autenticado
    E possui produtos no carrinho

  @E2E-04
  Cenário: Avançar para a revisão com dados válidos
    Quando informa nome, sobrenome e CEP válidos para a compra
    Então o resumo do pedido é apresentado com os produtos escolhidos, suas quantidades e os preços anunciados

  @E2E-05
  Esquema do Cenário: Impedir avanço sem informar <dadoObrigatorio>
    Quando tenta prosseguir sem informar "<dadoObrigatorio>" e com os demais dados válidos
    Então é informado de que "<dadoObrigatorio>" é obrigatório
    E permanece na identificação da compra

  Exemplos:
    | dadoObrigatorio |
    | nome            |
    | sobrenome       |
    | CEP             |
