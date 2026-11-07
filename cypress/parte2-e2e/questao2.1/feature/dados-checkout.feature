# language: pt

# Questão 2.1 — dados do cliente e avanço no checkout.
# Alvo previsto: SauceDemo público, sem simulação adicionada pela suíte.
# Automação futura: gerar nome, sobrenome e CEP por execução.
# Cenários planejados; nenhum comportamento foi executado ou aprovado nesta etapa.
@parte2 @questao2_1 @dadosCheckout
Funcionalidade: Identificação do cliente no checkout
  Como cliente com produtos no carrinho
  Quero informar meus dados para a compra
  Para revisar o pedido antes de concluí-lo

  Contexto: Cliente autenticado com produtos para comprar
    Dado que o cliente está autenticado
    E possui produtos no carrinho

  # Planejado; aguardando implementação e validação.
  @skip @E2E-04
  Cenário: Avançar para a revisão com dados válidos
    Quando informa nome, sobrenome e CEP válidos para a compra
    Então o resumo do pedido é apresentado com os produtos escolhidos, suas quantidades e os preços anunciados

  # Planejado; aguardando implementação e validação.
  @skip
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
