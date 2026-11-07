# language: pt

# Questão 2.1 — inclusão de produtos no fluxo de checkout.
# Alvo previsto: SauceDemo público, sem simulação adicionada pela suíte.
# Cenários planejados; nenhum comportamento foi executado ou aprovado nesta etapa.
@parte2 @questao2_1 @carrinho
Funcionalidade: Gerenciamento do carrinho
  Como cliente
  Quero escolher e remover produtos da minha compra
  Para concluir um pedido com os produtos desejados

  Contexto: Cliente autenticado
    Dado que o cliente está autenticado

  # Planejado; aguardando implementação e validação.
  @skip @E2E-01
  Cenário: Incluir um produto no carrinho
    Dado que o cliente possui um carrinho vazio
    Quando adiciona um produto ao carrinho
    Então o carrinho contém somente o produto escolhido
    E apresenta uma unidade com o preço anunciado
    E a contagem do carrinho indica um item

  # Planejado; aguardando implementação e validação.
  @skip @E2E-02
  Cenário: Incluir dois produtos distintos no carrinho
    Dado que o cliente possui um carrinho vazio
    Quando adiciona dois produtos distintos ao carrinho
    Então o carrinho contém somente os dois produtos escolhidos
    E apresenta uma unidade de cada produto com os preços anunciados
    E a contagem do carrinho indica dois itens

  # Planejado; aguardando implementação e validação.
  @skip @E2E-03
  Cenário: Esvaziar o carrinho ao remover o último produto
    Dado que o cliente possui um único produto no carrinho
    Quando remove esse produto do carrinho
    Então o carrinho fica vazio
    E a contagem do carrinho deixa de indicar itens
