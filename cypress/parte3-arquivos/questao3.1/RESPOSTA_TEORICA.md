## 3.1.a) Como validaria que todas as 1000 linhas foram processadas corretamente?

Validaria não apenas o sucesso do upload, mas também se os 1.000 registros foram realmente processados e gravados corretamente.

Utilizaria um CSV com 1.000 registros conhecidos e identificadores únicos. Após o envio, acompanharia o status da importação até sua conclusão, considerando falhas e tempo limite.

Em seguida, verificaria se todos os registros foram importados, sem rejeições, duplicidades ou ausências. Compararia os dados gravados (nome, email, idade e cidade) com o arquivo original, sem depender da ordem dos registros.

Também validaria os relacionamentos, quando existentes, e removeria os dados de teste ao final.

O principal é garantir a integridade dos 1.000 registros, pois apenas conferir a quantidade não comprova que a importação ocorreu corretamente.

**Limite da implementação entregue:** os cenários CSV-01 a CSV-03 geram 10, 100 e 1.000 registros, conferem cabeçalho, quantidade, conteúdo e emails distintos antes do envio e verificam HTTP 200, confirmação e nome do arquivo recebido. O site oferece upload, sem resultado de importação ou consulta dos registros processados. Portanto, essa automação não comprova o processamento das 1.000 linhas.

## 3.1.b) Como testaria cenários de erro (arquivo corrompido, dados inválidos)?

Testaria arquivos CSV com diferentes tipos de erros, como arquivos vazios, corrompidos, campos obrigatórios ausentes, emails inválidos, idades negativas, registros duplicados e relacionamentos inexistentes.

Verificaria se o sistema identifica corretamente cada erro, apresenta mensagens claras e impede a gravação de dados inconsistentes.

O próprio sistema também poderia realizar uma validação prévia, verificando a estrutura e os dados do arquivo antes de permitir o envio, evitando que arquivos corrompidos ou inválidos avancem para a importação. Essa validação também deveria ocorrer no backend, garantindo a segurança mesmo quando o envio não fosse feito pela interface.

Também testaria os limites de tamanho, a importação parcial ou a rejeição completa do arquivo, conforme as regras de negócio.

No projeto desenvolvido, os testes CSV-04, CSV-05 e CSV-06 verificam arquivos vazios, corrompidos e com dados inválidos. Entretanto, como o site utilizado apenas confirma o recebimento dos arquivos, não é possível validar o processamento ou a rejeição dos registros. Para isso, seria necessário testar um sistema com importação real.