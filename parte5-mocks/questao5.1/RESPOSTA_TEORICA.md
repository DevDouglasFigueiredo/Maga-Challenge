
## 5.1.a) Como você testaria essas integrações sem afetar os ambientes reais dos marketplaces?
- Para testar as integrações com os marketplaces sem afetar os ambientes reais, utilizaria mocks e simulações das APIs dos marketplaces. Alinharia com o time de desenvolvimento para criar endpoints simulados que replicam o comportamento esperado das APIs, permitindo validar as requisições e respostas sem enviar dados reais.

## 5.1.b) Como implementaria uma estratégia de mock para simular respostas? Qual(is) ferramenta(s) você usaria (MSW, JSON Server, WireMock, etc.) e por quê?
- Implementaria uma estratégia de mock utilizando o MSW para interceptar as requisições HTTP feitas pelo sistema e retornar respostas simuladas. O MSW é uma ferramenta moderna que permite criar mocks de forma declarativa, utilizando handlers para definir os endpoints e as respostas desejadas. Ele funciona tanto em ambiente de desenvolvimento quanto em testes automatizados, garantindo consistência entre os cenários.

## 5.1.c) Descreva como você simularia, em nível de mock, os seguintes cenários: erro 500, timeout e rate limiting (429). O que cada um desses testes deve validar no seu sistema?
- Para simular os cenários de erro 500, timeout e rate limiting (429), configuraria handlers específicos no MSW para cada caso:
- **Erro 500:** Criaria um handler que retorna uma resposta com status 500 e uma mensagem de erro. O teste deve validar se o sistema trata corretamente a falha, exibindo uma mensagem de erro apropriada ao usuário e registrando o incidente para análise.
- **Timeout:** Configuraria um handler que simula um atraso na resposta, excedendo o tempo limite configurado no sistema. O teste deve validar se o sistema detecta o timeout, cancela a requisição e informa o usuário sobre a falha de comunicação.
- **Rate limiting (429):** Criaria um handler que retorna uma resposta com status 429 e uma mensagem indicando que o limite de requisições foi atingido. O teste deve validar se o sistema implementa uma estratégia de retry ou backoff, aguardando antes de tentar novamente, e se informa o usuário sobre a necessidade de reduzir a frequência de requisições.

## 5.1.d) Como você validaria que o payload enviado/recebido está no formato esperado (schema validation)? Onde essa validação entraria no seu pipeline de testes?
- Utilizaria teste de contrato, para garantir que os payloads enviados e recebidos estejam de acordo com os contratos das APIs do Mercado Livre e da Amazon.
Validaria campos obrigatórios, tipos de dados, formatos, estruturas e valores permitidos. Também criaria testes negativos com campos ausentes, tipos incorretos e valores inválidos, verificando o tratamento dos erros.
No pipeline CI/CD, incluiria essas validações nos testes automatizados de API e de contrato, executados a cada pull request ou alteração relevante, utilizando mocks para evitar dependência dos marketplaces.
Também realizaria testes de integração em ambientes sandbox ou homologação, quando disponíveis, para verificar a compatibilidade com as APIs externas.