# language: pt

@cart
Funcionalidade: Gerenciamento do carrinho
  Como cliente
  Quero escolher e remover produtos da minha compra
  Para concluir um pedido com os produtos desejados

  Contexto: Cliente autenticado
    Dado que o cliente está autenticado

  @E2E-01
  Cenário: Incluir um produto no carrinho
    Dado que o cliente possui um carrinho vazio
    Quando adiciona o produto "Sauce Labs Backpack" ao carrinho
    Então o carrinho contém somente o produto escolhido
    E apresenta uma unidade com o preço anunciado
    E a contagem do carrinho indica um item

  @E2E-02
  Cenário: Incluir dois produtos distintos no carrinho
    Dado que o cliente possui um carrinho vazio
    Quando adiciona os produtos "Sauce Labs Backpack" e "Sauce Labs Bike Light" ao carrinho
    Então o carrinho contém somente os dois produtos escolhidos
    E apresenta uma unidade de cada produto com os preços anunciados
    E a contagem do carrinho indica dois itens

  @E2E-03
  Cenário: Esvaziar o carrinho ao remover o último produto
    Dado que o cliente possui somente o produto "Sauce Labs Backpack" no carrinho
    Quando remove esse produto do carrinho
    Então o carrinho fica vazio
    E a contagem do carrinho deixa de indicar itens
