# language: pt

# Questão 2.1 — revisão, conclusão e confirmação do pedido; apoio à questão 2.1.b.
# Alvo previsto de E2E-08 a E2E-10: SauceDemo público, sem simulação da suíte.
# O pagamento demonstrativo do site não comprova cobrança ou pedido em backend.
# Automação futura de E2E-10: login até conclusão, com dados dinâmicos e
# limpeza de cookies e localStorage após cada teste, inclusive em falhas.
# Implementação e resultados em PLANO_AUTOMACAO.md; aprovação é manual.
@parte2 @questao2_1 @pagamentoConfirmacao
Funcionalidade: Revisão e conclusão da compra
  Como cliente
  Quero revisar e concluir minha compra
  Para receber a confirmação do pedido

  Contexto: Cliente autenticado
    Dado que o cliente está autenticado

  # Automatizado; execução passou. Aguardando validação e aprovação do usuário.
  @E2E-08
  Cenário: Apresentar os valores corretos na revisão do pedido
    Dado que o cliente possui mais de um produto distinto no carrinho
    E informou dados válidos para a compra
    Quando revisa o pedido antes de concluí-lo
    Então o pedido apresenta os produtos escolhidos com suas quantidades e preços
    E o subtotal corresponde à soma dos valores dos produtos
    E o imposto corresponde à regra aplicada à compra
    E o total corresponde ao subtotal acrescido do imposto
    E o cartão previsto para a compra é identificado nas informações de pagamento
    E a modalidade de entrega gratuita prevista para a compra é apresentada

  # Planejado; aguardando implementação e validação.
  @skip @E2E-09
  Cenário: Cancelar a compra na revisão preservando o carrinho
    Dado que o cliente está revisando um pedido com produtos e dados válidos
    Quando cancela a compra durante a revisão do pedido
    Então retorna ao catálogo de produtos
    E não recebe confirmação de pedido
    E o carrinho preserva os produtos escolhidos

  # Planejado; aguardando implementação e validação.
  @skip @E2E-10
  Cenário: Confirmar a compra completa de dois produtos
    Dado que o cliente deseja comprar dois produtos distintos
    Quando realiza a compra desses produtos com dados válidos
    Então recebe a confirmação de que o pedido foi concluído
    E o carrinho fica vazio

  # Proposta documental: SauceDemo não oferece autorização ou recusa financeira.
  # Não implementado, simulado, executado ou aprovado; manter @skip neste alvo.
  @skip @PAG-01
  Cenário: Não confirmar o pedido quando o pagamento for recusado
    Dado que o cliente possui uma compra válida pronta para pagamento
    Quando a instituição financeira recusa o pagamento da compra
    Então o pedido não é confirmado
    E o cliente é informado da recusa e orientado a tentar o pagamento novamente
