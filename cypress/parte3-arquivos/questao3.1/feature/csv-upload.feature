# language: pt
@parte3 @csvUpload
Funcionalidade: Envio de arquivos CSV
  Como usuário do sistema
  Quero enviar arquivos CSV para o sistema
  Para que o sistema processe os dados contidos no arquivo

  @csvValido
  Esquema do Cenário: Confirmar upload de CSV válido com <registros> registros — <caso>
    Dado que possuo um arquivo CSV válido com <registros> registros
    Quando há o upload do arquivo
    Então recebo confirmação identificando que o arquivo foi enviado

    @CSV-01
    Exemplos:
      | caso   | registros |
      | CSV-01 | 10        |

    @CSV-02
    Exemplos:
      | caso   | registros |
      | CSV-02 | 100       |

    @CSV-03
    Exemplos:
      | caso   | registros |
      | CSV-03 | 1000      |

  @csvInvalido
  Esquema do Cenário: Confirmar recebimento de CSV <condicao> sem validar conteúdo — <caso>
    Dado que possuo um arquivo CSV <condicao>
    Quando há o upload do arquivo
    Então recebo confirmação identificando que o arquivo foi enviado

    @CSV-04
    Exemplos:
      | caso   | condicao              |
      | CSV-04 | vazio                 |

    @CSV-05
    Exemplos:
      | caso   | condicao              |
      | CSV-05 | com formato incorreto |

    @CSV-06
    Exemplos:
      | caso   | condicao              |
      | CSV-06 | com dados malformados |
