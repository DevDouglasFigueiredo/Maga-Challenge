# language: pt

# Questão 2.1 — contexto de cupom de uso único e questão teórica 2.1.a.
# Limitação: SauceDemo não oferece aplicação ou consumo de cupons.
# Propostas documentais; não implementadas, simuladas, executadas ou aprovadas.
# @skip é herdado por todos os cenários desta funcionalidade.
@parte2 @questao2_1 @cupom @skip
Funcionalidade: Aplicação de cupom de desconto de uso único
  Como cliente com uma compra elegível
  Quero utilizar um cupom válido uma única vez
  Para obter o desconto previsto na oferta

  Contexto: Cliente autenticado
    Dado que o cliente está autenticado

  @CUP-01
  Cenário: Aplicar desconto de um cupom válido ainda não utilizado
    Dado que o cliente possui uma compra elegível para desconto
    E possui um cupom válido que ainda não foi utilizado
    Quando aplica o cupom à compra
    Então recebe o desconto previsto na oferta
    E o total da compra é recalculado considerando o desconto

  @CUP-02
  Cenário: Recusar cupom consumido em uma compra anterior
    Dado que o cliente possui uma compra elegível para desconto
    E o cupom já foi consumido em um pedido concluído
    Quando tenta aplicar esse cupom à nova compra
    Então é informado de que o cupom já foi utilizado
    E o total da compra permanece sem o desconto do cupom

  @CUP-03
  Cenário: Recusar código de cupom inexistente
    Dado que o cliente possui uma compra elegível para desconto
    Quando tenta aplicar um código de cupom inexistente
    Então é informado de que o cupom é inválido
    E os valores da compra permanecem inalterados
