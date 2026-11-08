## 4.1.a) Qual ferramenta você escolheria para automação mobile (Appium, Detox, Maestro, etc.) e por quê? Compare pelo menos 2 opções considerando o contexto descrito.
- Escolheria o Appium como ferramenta principal de automação mobile, mas também consideraria o Maestro para testes funcionais e fluxos mais simples.

O Maestro possui uma abordagem low-code, utilizando YAML para criar os testes, o que facilita a implementação, reduz a curva de aprendizado e permite uma configuração inicial mais rápida. É uma boa opção para validar jornadas do usuário, navegação e permissões de câmera, localização e notificações.

Já o Appium é mais robusto e flexível, permitindo desenvolver testes em diferentes linguagens, como Java, Python e JavaScript. Apesar de exigir uma configuração mais complexa, oferece maior possibilidade de integração com APIs, ferramentas externas e recursos nativos do Android e iOS.

Considerando as funcionalidades do aplicativo, principalmente geolocalização, armazenamento offline e sincronização, escolheria o Appium pela flexibilidade para criar cenários mais complexos, simular diferentes condições e validar a consistência dos dados.

## 4.1.b) Como você mockaria geolocalização, câmera e notificações push em testes automatizados? Descreva a abordagem para cada um.
- **Geolocalização:** Utilizaria a capacidade do Appium de simular coordenadas GPS, definindo diferentes localizações para testar funcionalidades dependentes da posição do usuário. Isso permitiria validar como o aplicativo se comporta em diferentes regiões e cenários de geolocalização.
- **Câmera:** Para testes que envolvem captura de fotos ou vídeos, utilizaria mocks de câmera fornecidos pelo Appium, permitindo simular a captura de imagens sem a necessidade de interação física com o dispositivo. Isso facilitaria a automação de fluxos que dependem da câmera, como upload de fotos ou leitura de QR codes.
- **Notificações push:** Faria um script de teste que envia uma request simulada para o serviço de notificações push, verificando se o aplicativo recebe e processa corretamente as notificações.

## 4.1.c) Qual estratégia você usaria para executar os mesmos testes em iOS e Android, minimizando duplicação de código?
- Para minimizar a duplicação de código, adotaria uma abordagem de abstração, criando uma camada de testes que encapsula as interações comuns entre iOS e Android. Utilizaria Page Objects para representar telas e componentes do aplicativo, permitindo que os testes chamem métodos genéricos que funcionam em ambas as plataformas. Alinharia com os desenvolvedores para garantir que os elementos e seletores sejam iguais ou compatíveis entre as plataformas, facilitando a manutenção e a execução dos testes em ambos os sistemas operacionais.

## 4.1.d) Descreva, em alto nível, como seria o setup de ambiente para rodar esses testes localmente e em CI/CD (passos principais, sem precisar executar).
- Ambiente local:

Inicialmente, configuraria o ambiente de desenvolvimento com Node.js, Appium e os drivers necessários: UiAutomator2 para Android e XCUITest para iOS.
Para Android, instalaria o Android Studio e o SDK, configurando emuladores para execução dos testes. Para iOS, utilizaria um Mac com Xcode e simuladores iOS, devido às dependências da plataforma Apple.
Também configuraria a linguagem e o framework de testes escolhidos, as variáveis de ambiente, os aplicativos de teste e os dispositivos disponíveis.
Após a configuração, executaria um teste simples para validar a comunicação entre o Appium, o dispositivo e o aplicativo.

- Ambiente CI/CD

Integraria os testes a uma ferramenta como GitHub Actions ou Jenkins, configurando pipelines para executar as automações de forma padronizada.
O pipeline seria responsável por preparar o ambiente, instalar as dependências, disponibilizar o aplicativo, iniciar os emuladores ou simuladores e executar os testes automatizados.
Para iOS, utilizaria runners macOS com Xcode. Para Android, utilizaria runners compatíveis com o Android SDK e a execução de emuladores.
Organizaria a execução em diferentes etapas, priorizando testes críticos a cada alteração e uma regressão mais completa em execuções programadas.
Também configuraria a geração de relatórios, logs, screenshots em caso de falhas e armazenamento dos resultados para análise.
Como estratégia de qualidade, manteria ambientes e massas de teste controlados, configurações versionadas e dados sensíveis protegidos por variáveis de ambiente ou gerenciadores de segredos.
Dessa forma, garantiria execuções reproduzíveis, rastreabilidade dos resultados e identificação antecipada de falhas nas duas plataformas.

## 4.1.e) Como você validaria sincronização de dados e comportamento offline sem depender de um backend real?
- Para validar a sincronização de dados e o comportamento offline sem depender de um backend real, utilizaria mocks para simular as respostas do servidor. Criaria um serviço local que imita o comportamento do backend, permitindo testar como o aplicativo lida com diferentes cenários de conectividade.