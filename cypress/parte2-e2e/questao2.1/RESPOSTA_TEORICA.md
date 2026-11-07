## 2.1.a) Como você garantiria que cada execução de teste use um cupom válido diferente?
- Criaria um cupom antes de cada teste por uma API de preparação de dados do ambiente de testes. O código teria um identificador único associado à execução e ao caso, evitando compartilhamento entre testes paralelos.

Gerar um código aleatório não garante sua validade: o cupom precisa estar cadastrado, ativo, dentro da validade e aplicável aos produtos e ao cliente utilizados. Configuraria limite de uma utilização e usaria o código retornado pela API durante o checkout.

Cada teste criaria seu próprio cupom. Para validar a recusa por reutilização, consumiria esse cupom na preparação do próprio cenário, sem depender de uma execução anterior. Ao terminar, excluiria ou desativaria os dados criados.

No SauceDemo, essa estratégia permanece teórica: o site não oferece cupons. Os cenários correspondentes estão documentados com @skip e não representam cobertura executada.

## 2.1.b) Como você validaria a confirmação do pedido sem depender de email real?
- Validaria a confirmação diretamente no fluxo de compra. Em um sistema com backend acessível, aguardaria a resposta da criação do pedido, verificaria seu ID e consultaria o pedido para confirmar status, produtos, quantidades e valores. Na interface, conferiria se a confirmação corresponde ao mesmo pedido.

No site do SauceDemo, verificamos a URL de conclusão, a área de confirmação visível, os textos exatos de agradecimento e despacho e o carrinho vazio após finalizar. Essas verificações comprovam o comportamento demonstrativo da interface, sem afirmar criação de pedido em backend, cobrança ou envio real de email.