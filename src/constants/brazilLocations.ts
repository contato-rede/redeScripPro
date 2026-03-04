// Dados de UF e Cidades do Brasil
// Fonte: IBGE - Organizado por estado para fácil manutenção

export interface Estado {
  uf: string;
  nome: string;
  cidades: string[];
}

// Lista de estados com suas cidades principais (top 50 por estado para otimizar)
export const ESTADOS_BRASIL: Estado[] = [
  {
    uf: 'AC',
    nome: 'Acre',
    cidades: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Senador Guiomard', 'Plácido de Castro', 'Xapuri', 'Mâncio Lima', 'Porto Walter', 'Epitaciolândia', 'Marechal Thaumaturgo', 'Jordão', 'Assis Brasil']
  },
  {
    uf: 'AL',
    nome: 'Alagoas',
    cidades: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'União dos Palmares', 'Penedo', 'São Miguel dos Campos', 'Coruripe', 'Marechal Deodoro', 'Santana do Ipanema', 'Delmiro Gouveia', 'Pilar', 'Satuba', 'Atalaia', 'Girau do Ponciano', 'São Luís do Quitunde', 'Igaci', 'Teotônio Vilela', 'Campo Alegre', 'Batalha', 'São José da Laje', 'Maragogi', 'Porto Calvo', 'Joaquim Gomes', 'Messias', 'Coité do Nóia', 'Cajueiro', 'Junqueiro', 'Traipu', 'Limoeiro de Anadia', 'Anadia', 'Taquarana', 'Olho d\'Água das Flores', 'Maribondo', 'São Sebastião', 'Flexeiras', 'São Brás', 'Belém', 'Carneiros', 'Minador do Negrão', 'Jacaré dos Homens', 'Jundiá', 'Major Isidoro', 'Colônia Leopoldina', 'Novo Lino', 'Ouro Branco', 'Maravilha', 'Monteirópolis', 'Barra de Santo Antônio', 'São Miguel dos Milagres']
  },
  {
    uf: 'AP',
    nome: 'Amapá',
    cidades: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Tartarugalzinho', 'Vitória do Jari', 'Calçoene', 'Amapá', 'Ferreira Gomes', 'Cutias', 'Serra do Navio', 'Pedra Branca do Amapari', 'Itaubal']
  },
  {
    uf: 'AM',
    nome: 'Amazonas',
    cidades: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Tefé', 'Maués', 'Manicoré', 'Humaitá', 'Lábrea', 'São Gabriel da Cachoeira', 'Eirunepé', 'Barcelos', 'Boca do Acre', 'Autazes', 'Careiro', 'Iranduba', 'Novo Airão', 'Presidente Figueiredo', 'Rio Preto da Eva', 'Silves', 'Anamã', 'Beruri', 'Borba', 'Codajás', 'Envira', 'Ipixuna', 'Itapiranga', 'Japurá', 'Juruá', 'Jutaí', 'Novo Aripuanã', 'Santa Isabel do Rio Negro', 'Santo Antônio do Içá', 'São Paulo de Olivença', 'Amaturá', 'Anori', 'Apuí', 'Atalaia do Norte', 'Barreirinha', 'Benjamin Constant', 'Canutama', 'Carauari', 'Fonte Boa', 'Guajará', 'Itamarati', 'Nhamundá', 'Pauini', 'Uarini']
  },
  {
    uf: 'BA',
    nome: 'Bahia',
    cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Barreiras', 'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Eunápolis', 'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi', 'Jacobina', 'Serrinha', 'Senhor do Bonfim', 'Dias d\'Ávila', 'Bom Jesus da Lapa', 'São Francisco do Conde', 'Itapetinga', 'Catu', 'Brumado', 'Cruz das Almas', 'Irecê', 'Euclides da Cunha', 'Cachoeira', 'Itaberaí', 'Casa Nova', 'Bom Despacho', 'Santo Estêvão', 'Tucano', 'Itamaraju', 'Ribeira do Pombal', 'Santo Amaro', 'São Gonçalo dos Campos', 'Ipiaú', 'Nova Viçosa', 'Santa Maria da Vitória', 'Barra', 'Ituberá', 'Itanhém', 'Pojuca', 'São Sebastião do Passé']
  },
  {
    uf: 'CE',
    nome: 'Ceará',
    cidades: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Aquiraz', 'Quixadá', 'Canindé', 'Russas', 'Tianguá', 'Aracati', 'Pacatuba', 'Crateús', 'Cascavel', 'Limoeiro do Norte', 'Juazeiro do Norte', 'Camocim', 'Baturité', 'Trairi', 'Beberibe', 'Eusébio', 'Horizonte', 'Marco', 'São Gonçalo do Amarante', 'Pacajus', 'Várzea Alegre', 'Quixeramobim', 'Icó', 'Acaraú', 'Morada Nova', 'Tauá', 'Paracuru', 'Paraipaba', 'São Benedito', 'Brejo Santo', 'Jaguaribe', 'Jaguaruana', 'Santa Quitéria', 'Santana do Acaraú', 'Santana do Cariri', 'Mauriti', 'Campos Sales', 'Barbalha', 'Acopiara', 'Mombaça', 'Nova Russas']
  },
  {
    uf: 'DF',
    nome: 'Distrito Federal',
    cidades: ['Brasília', 'Ceilândia', 'Taguatinga', 'Plano Piloto', 'Samambaia', 'São Sebastião', 'Gama', 'Guará', 'Recanto das Emas', 'Santa Maria', 'Sobradinho', 'Planaltina', 'Brazlândia', 'Núcleo Bandeirante', 'Paranoá', 'Riacho Fundo', 'Lago Norte', 'Lago Sul', 'Candangolândia', 'Cruzeiro', 'Jardim Botânico', 'Itapoã', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'Vicente Pires', 'Sobradinho II', 'Riacho Fundo II']
  },
  {
    uf: 'ES',
    nome: 'Espírito Santo',
    cidades: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz', 'Viana', 'Nova Venécia', 'Barra de São Francisco', 'Santa Maria de Jetibá', 'Castelo', 'Marataízes', 'Cachoeiro de Itapemirim', 'Afonso Cláudio', 'Domingos Martins', 'Alegre', 'Mimoso do Sul', 'Santa Teresa', 'Santa Leopoldina', 'Anchieta', 'Piúma', 'Iconha', 'Itapemirim', 'Venda Nova do Imigrante', 'Guaci', 'Iúna', 'Itarana', 'João Neiva', 'Conceição da Barra', 'Fundão', 'Ibiraçu', 'Jaguaré', 'São Gabriel da Palha', 'Ecoporanga', 'Pancas', 'Boa Esperança', 'Atilio Vivacqua', 'Mantenópolis', 'Mucurici', 'Presidente Kennedy', 'Pedro Canário', 'Dores do Rio Preto', 'Água Doce do Norte', 'Águia Branca', 'Alto Rio Novo', 'Apiacá', 'Laranja da Terra']
  },
  {
    uf: 'GO',
    nome: 'Goiás',
    cidades: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama', 'Itumbiara', 'Catalão', 'Jataí', 'Santo Antônio do Descoberto', 'Planaltina', 'Cidade Ocidental', 'Senador Canedo', 'Goianésia', 'Cristalina', 'Inhumas', 'Jaraguá', 'Quirinópolis', 'Anicuns', 'Goianira', 'Morrinhos', 'Itaberaí', 'Mineiros', 'Goiás', 'Pires do Rio', 'Porangatu', 'Uruaçu', 'Niquelândia', 'Ipameri', 'Ceres', 'Posse', 'Goianápolis', 'Bela Vista de Goiás', 'Hidrolândia', 'Palmeiras de Goiás', 'Santa Helena de Goiás', 'São Luís de Montes Belos', 'Aragarças', 'Iporá', 'São Miguel do Araguaia', 'Campos Belos', 'Cavalcante', 'Alto Paraíso de Goiás', 'São João d\'Aliança', 'Pirenópolis', 'Cocalzinho de Goiás']
  },
  {
    uf: 'MA',
    nome: 'Maranhão',
    cidades: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Luzia', 'Chapadinha', 'Santa Inês', 'Barreirinhas', 'Pinheiro', 'São João dos Patos', 'Coroatá', 'Carutapera', 'Barão de Grajaú', 'Grajaú', 'Viana', 'Barra do Corda', 'Buriticupu', 'Itapecuru Mirim', 'Presidente Dutra', 'Rosário', 'São Mateus do Maranhão', 'Amarante do Maranhão', 'Pedreiras', 'Cururupu', 'Turiaçu', 'Tutóia', 'Zé Doca', 'Santana do Maranhão', 'Afonso Cunha', 'Aldeias Altas', 'Anajatuba', 'Anapurus', 'Apicum-Açu', 'Araguanã', 'Araioses', 'Arame', 'Arari', 'Axixá', 'Bacabeira', 'Bacuri', 'Bacurituba', 'Belágua', 'Benedito Leite', 'Bequimão']
  },
  {
    uf: 'MT',
    nome: 'Mato Grosso',
    cidades: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Cáceres', 'Lucas do Rio Verde', 'Primavera do Leste', 'São José do Rio Claro', 'Barra do Garças', 'Alta Floresta', 'Nova Mutum', 'Campo Verde', 'Pontes e Lacerda', 'Guarantã do Norte', 'Juína', 'Diamantino', 'Juara', 'Aripuanã', 'Colíder', 'Cuiabá', 'Barra do Bugres', 'Sapezal', 'Nobres', 'Nortelândia', 'Poconé', 'Rosário Oeste', 'Chapada dos Guimarães', 'Jaciara', 'Juscimeira', 'Pedra Preta', 'Porto dos Gaúchos', 'Comodoro', 'Campo Novo do Parecis', 'Serra Nova Dourada', 'Canarana', 'Querência', 'Água Boa', 'Campinápolis', 'Nova Ubiratã', 'Sorriso', 'Tapurah', 'Itanhangá', 'Peixoto de Azevedo', 'Matupá', 'Nova Monte Verde', 'Paranatinga', 'Alta Floresta', 'Cotriguaçu']
  },
  {
    uf: 'MS',
    nome: 'Mato Grosso do Sul',
    cidades: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia', 'Naviraí', 'Nova Andradina', 'Aquidauana', 'Maracaju', 'Paranaíba', 'Amambai', 'Rio Brilhante', 'Coxim', 'São Gabriel do Oeste', 'Ladário', 'Fátima do Sul', 'Iguatemi', 'Caarapó', 'Jardim', 'Douradina', 'Chapadão do Sul', 'Bataguassu', 'Costa Rica', 'Anastácio', 'Belo Vista', 'Bonito', 'Nioaque', 'Aquidauana', 'Bela Vista', 'Anaurilândia', 'Angélica', 'Antônio João', 'Aparecida do Taboado', 'Aral Moreira', 'Bandeirantes', 'Batayporã', 'Bodoquena', 'Brasilândia', 'Camapuã', 'Caracol', 'Cassilândia', 'Corguinho', 'Coronel Sapucaia', 'Deodápolis', 'Dois Irmãos do Buriti', 'Eldorado', 'Figueirão', 'Gloria de Dourados', 'Guia Lopes da Laguna']
  },
  {
    uf: 'MG',
    nome: 'Minas Gerais',
    cidades: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité', 'Ipatinga', 'Sabará', 'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni', 'Barbacena', 'São João del Rei', 'Araguari', 'Varginha', 'Itabira', 'Lavras', 'Itajubá', 'Passos', 'Araxá', 'Ubá', 'Muriaé', 'Nova Lima', 'Pará de Minas', 'Caratinga', 'Nova Serrana', 'Manhuaçu', 'Conselheiro Lafaiete', 'Timóteo', 'Viçosa', 'Ouro Preto', 'Curvelo', 'Itaúna', 'Formiga', 'Cataguases', 'Três Corações', 'São Sebastião do Paraíso', 'João Monlevade', 'Bom Despacho', 'Ponte Nova', 'Pedro Leopoldo']
  },
  {
    uf: 'PA',
    nome: 'Pará',
    cidades: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança', 'São Félix do Xingu', 'Barcarena', 'Altamira', 'Tucuruí', 'Paragominas', 'Tailândia', 'Breves', 'Itaituba', 'Moju', 'Novo Repartimento', 'Oriximiná', 'Santana do Araguaia', 'Capanema', 'Tomé-Açu', 'Igarapé-Miri', 'Viseu', 'Curuçá', 'Salinópolis', 'Ourém', 'Concórdia do Pará', 'Santa Izabel do Pará', 'Colares', 'Muaná', 'Bujaru', 'Afuá', 'Portel', 'Medicilândia', 'Ulianópolis', 'Rondon do Pará', 'Pacajá', 'Almeirim', 'Anapu', 'Augusto Corrêa', 'Bagre', 'Baião', 'Benevides', 'Bonito', 'Cachoeira do Arari', 'Chaves', 'Curionópolis']
  },
  {
    uf: 'PB',
    nome: 'Paraíba',
    cidades: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Sapé', 'Mamanguape', 'Queimadas', 'Esperança', 'Monteiro', 'Pombal', 'Catolé do Rocha', 'Pedras de Fogo', 'Itabaiana', 'Conde', 'Alagoa Grande', 'Rio Tinto', 'Areia', 'Solânea', 'Alhandra', 'Remígio', 'Araruna', 'Pilões', 'Bananeiras', 'São Bento', 'Mari', 'São João do Rio do Peixe', 'Cuité', 'Princesa Isabel', 'Serra Branca', 'Alagoinha', 'Juazeirinho', 'Itaporanga', 'Cacimba de Dentro', 'Ingá', 'Borborema', 'Cajazeiras', 'Dona Inês', 'Damião', 'Frei Martinho', 'Gurinhém', 'Ibiara', 'Imaculada', 'Jericó', 'Junco do Seridó', 'Lagoa']
  },
  {
    uf: 'PR',
    nome: 'Paraná',
    cidades: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Campo Largo', 'Pinhais', 'Arapongas', 'Almirante Tamandaré', 'Umuarama', 'Pato Branco', 'Cambé', 'Fazenda Rio Grande', 'Sarandi', 'Paranavaí', 'Francisco Beltrão', 'Piraquara', 'Telêmaco Borba', 'Rolândia', 'Cianorte', 'Irati', 'União da Vitória', 'Maringá', 'Londrina', 'Cascavel', 'Foz do Iguaçu', 'Maringá', 'Ponta Grossa', 'São José dos Pinhais', 'Cascavel', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Campo Largo', 'Pinhais', 'Arapongas', 'Almirante Tamandaré', 'Umuarama']
  },
  {
    uf: 'PE',
    nome: 'Pernambuco',
    cidades: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'Igarassu', 'São Lourenço da Mata', 'Abreu e Lima', 'Santa Cruz do Capibaribe', 'Ipojuca', 'Serra Talhada', 'Araripina', 'Gravatá', 'Carpina', 'Goiana', 'Belo Jardim', 'Arcoverde', 'Ouricuri', 'Escada', 'Pesqueira', 'Surubim', 'Timbaúba', 'Moreno', 'São Bento do Una', 'Bom Conselho', 'Bezerros', 'Limoeiro', 'Ribeirão', 'Águas Belas', 'Palmares', 'Afogados da Ingazeira', 'Agrestina', 'Aliança', 'Altinho', 'Barreiros', 'Bom Jardim', 'Brejão', 'Buíque', 'Cachoeirinha', 'Caetés', 'Calumbi', 'Camocim de São Félix', 'Canhotinho', 'Capoeiras', 'Carnaíba']
  },
  {
    uf: 'PI',
    nome: 'Piauí',
    cidades: ['Teresina', 'Parnaíba', 'Picos', 'São Raimundo Nonato', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior', 'Altos', 'José de Freitas', 'Esperantina', 'Pedro II', 'Oeiras', 'União', 'Batalha', 'Bom Jesus', 'Valença do Piauí', 'Canto do Buriti', 'Miguel Alves', 'Simões', 'Amarante', 'Agricolândia', 'Água Branca', 'Alagoinha do Piauí', 'Alegrete do Piauí', 'Alto Longá', 'Alvorada do Gurguéia', 'Anísio de Abreu', 'Antônio Almeida', 'Aroazes', 'Arraial', 'Assunção do Piauí', 'Avelino Lopes', 'Baixa Grande do Ribeiro', 'Barra d\'Alcântara', 'Barreiras do Piauí', 'Bela Vista do Piauí', 'Belém do Piauí', 'Beneditinos', 'Bertolínia', 'Betânia do Piauí', 'Boa Hora', 'Bocaina', 'Buriti dos Lopes', 'Buriti dos Montes', 'Cabeceiras do Piauí', 'Cajazeiras do Piauí', 'Cajueiro da Praia', 'Caldeirão Grande do Piauí', 'Campinas do Piauí']
  },
  {
    uf: 'RJ',
    nome: 'Rio de Janeiro',
    cidades: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Magé', 'Macaé', 'Itaboraí', 'Cabo Frio', 'Angra dos Reis', 'Nova Friburgo', 'Barra Mansa', 'Teresópolis', 'Mesquita', 'Nilópolis', 'Queimados', 'Maricá', 'Rio das Ostras', 'Resende', 'Araruama', 'Itaguaí', 'Japeri', 'São Pedro da Aldeia', 'Barra do Piraí', 'Seropédica', 'Saquarema', 'Três Rios', 'Valença', 'Guapimirim', 'Rio Bonito', 'Cachoeiras de Macacu', 'Paracambi', 'Mangaratiba', 'Paraty', 'Piraí', 'Bom Jesus do Itabapoana', 'Bom Jardim', 'Areal', 'Armação dos Búzios', 'Arraial do Cabo', 'Cantagalo', 'Cardoso Moreira', 'Carmo', 'Casimiro de Abreu', 'Conceição de Macabu']
  },
  {
    uf: 'RN',
    nome: 'Rio Grande do Norte',
    cidades: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Açu', 'Currais Novos', 'São José de Mipibu', 'Santa Cruz', 'Nova Cruz', 'Apodi', 'João Câmara', 'Touros', 'Canguaretama', 'Extremoz', 'Pau dos Ferros', 'Areia Branca', 'Baraúna', 'Ipanguaçu', 'Nísia Floresta', 'São Miguel', 'Goianinha', 'Monte Alegre', 'Caiçara do Rio do Vento', 'Taipu', 'São Paulo do Potengi', 'Jardim de Piranhas', 'Jucurutu', 'Lajes', 'Serra de São Bento', 'Tibau do Sul', 'Baía Formosa', 'Brejinho', 'Carnaubais', 'Doutor Severiano', 'Encanto', 'Francisco Dantas', 'Galinhos', 'Grossos', 'Guamaré', 'Ielmo Marinho', 'Itajá', 'Jandaira', 'Japi', 'Jardim do Seridó', 'José da Penha', 'Lagoa d\'Anta', 'Lagoa de Pedras']
  },
  {
    uf: 'RS',
    nome: 'Rio Grande do Sul',
    cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Bagé', 'Cachoeirinha', 'Santa Cruz do Sul', 'Guaíba', 'Bento Gonçalves', 'Erechim', 'Ijuí', 'Esteio', 'Santana do Livramento', 'Camaquã', 'Tramandaí', 'Rio Pardo', 'Cachoeira do Sul', 'Pelotas', 'Santa Rosa', 'Santiago', 'Capão da Canoa', 'Lajeado', 'Carazinho', 'Taquara', 'Canela', 'Gramado', 'Vacaria', 'Farroupilha', 'Montenegro', 'Osório', 'Torres', 'São Borja', 'Santo Ângelo', 'Alegrete', 'Uruguaiana', 'Quaraí', 'Rosário do Sul', 'Jaguarão', 'Sant\'Ana do Livramento', 'São Gabriel']
  },
  {
    uf: 'RO',
    nome: 'Rondônia',
    cidades: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Pimenta Bueno', 'Espigão d\'Oeste', 'Machadinho d\'Oeste', 'Buritis', 'Nova Mamoré', 'São Miguel do Guaporé', 'Candeias do Jamari', 'Alto Alegre dos Parecis', 'Cujubim', 'Monte Negro', 'Seringueiras', 'Campo Novo de Rondônia', 'Alta Floresta d\'Oeste', 'Costa Marques', 'Presidente Médici', 'Nova Brasilândia d\'Oeste', 'São Francisco do Guaporé', 'Colorado do Oeste', 'Cerejeiras', 'Corumbiara', 'Ministro Andreazza', 'Urupá', 'Vale do Anari', 'Vale do Paraíso', 'Teixeirópolis', 'Theobroma', 'Santa Luzia d\'Oeste', 'Novo Horizonte do Oeste', 'Mirante da Serra', 'Marechal Thaumaturgo', 'Itapuã do Oeste', 'Governador Jorge Teixeira', 'Chupinguaia', 'Castanheiras', 'Cabixi', 'Brasiléia', 'Boa Vista do Buricá', 'Alto Paraíso', 'São Felipe d\'Oeste', 'Primavera de Rondônia', 'Parecis']
  },
  {
    uf: 'RR',
    nome: 'Roraima',
    cidades: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Cantá', 'Pacaraima', 'Amajari', 'Iracema', 'São João da Baliza', 'Caroebe', 'São Luiz', 'Uiramutã', 'Normandia', 'Bonfim']
  },
  {
    uf: 'SC',
    nome: 'Santa Catarina',
    cidades: ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Jaraguá do Sul', 'Palhoça', 'Lages', 'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul', 'Navegantes', 'Concórdia', 'Rio do Sul', 'Araranguá', 'Gaspar', 'Biguaçu', 'Mafra', 'Canoinhas', 'Itapema', 'São Francisco do Sul', 'Xanxerê', 'Caçador', 'Videira', 'Indaial', 'Curitibanos', 'Laguna', 'Camboriú', 'Timóteo', 'Orleans', 'Porto União', 'Joacaba', 'São Joaquim', 'Timbó', 'Rio Negrinho', 'Sombrio', 'Imbituba', 'Tijucas', 'Garopaba', 'Penha', 'Barra Velha', 'Campo Alegre', 'Apiúna', 'Ascurra', 'Atalanta', 'Aurora', 'Balneário Barra do Sul']
  },
  {
    uf: 'SP',
    nome: 'São Paulo',
    cidades: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'São José dos Campos', 'Santo André', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá', 'São José do Rio Preto', 'Mogi das Cruzes', 'Santos', 'Diadema', 'Jundiaí', 'Piracicaba', 'Carapicuíba', 'Bauru', 'Itaquaquecetuba', 'São Vicente', 'Franca', 'Guarujá', 'Taubaté', 'Limeira', 'Suzano', 'Sumaré', 'Barueri', 'Embu das Artes', 'Marília', 'São Carlos', 'Presidente Prudente', 'Americana', 'Indaiatuba', 'Rio Claro', 'Hortolândia', 'Itapevi', 'Mogi Guaçu', 'Praia Grande', 'Mongaguá', 'São Caetano do Sul', 'Taboão da Serra', 'Cotia', 'Ferraz de Vasconcelos', 'Itapecerica da Serra', 'Francisco Morato', 'Jaú', 'Araraquara', 'Atibaia', 'Sertãozinho', 'Cubatão']
  },
  {
    uf: 'SE',
    nome: 'Sergipe',
    cidades: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Itaporanga d\'Ajuda', 'Nossa Senhora da Glória', 'Propriá', 'Barra dos Coqueiros', 'Laranjeiras', 'Canindé de São Francisco', 'Poço Verde', 'Boquim', 'Umbaúba', 'Cristinápolis', 'Riachão do Dantas', 'Nossa Senhora das Dores', 'Areia Branca', 'Capela', 'Nossa Senhora Aparecida', 'Campo do Brito', 'Japoatã', 'Malhada dos Bois', 'Maruim', 'Muribeca', 'Neópolis', 'Pacatuba', 'Pedra Mole', 'Pedrinhas', 'Pinhão', 'Pirambu', 'Santa Luzia do Itanhy', 'Santana do São Francisco', 'Santo Amaro das Brotas', 'São Domingos', 'São Francisco', 'São Miguel do Aleixo', 'Telha', 'Tomar do Geru', 'Carmópolis', 'Feira Nova', 'Frei Paulo', 'Gararu', 'General Maynard', 'Gracho Cardoso', 'Ilha das Flores', 'Indiaroba']
  },
  {
    uf: 'TO',
    nome: 'Tocantins',
    cidades: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Araguatins', 'Dianópolis', 'Miracema do Tocantins', 'Formoso do Araguaia', 'Augustinópolis', 'Xambioá', 'Taguatinga', 'Wanderlândia', 'Pedro Afonso', 'Miranorte', 'Babaçulândia', 'Lagoa da Confusão', 'Nova Olinda', 'São Miguel do Tocantins', 'São Sebastião do Tocantins', 'Pium', 'Mosquito', 'Dueré', 'Couto Magalhães', 'Cristalândia', 'Chapada de Areia', 'Carrasco Bonito', 'Cariri do Tocantins', 'Campos Lindos', 'Carmolândia', 'Caseara', 'Centenário', 'Chapada da Natividade', 'Cocalândia', 'Cocalinho', 'Colméia', 'Combinado', 'Conceição do Tocantins', 'Couto de Magalhães', 'Darcinópolis', 'Divinópolis do Tocantins', 'Dois Irmãos do Tocantins', 'Fátima', 'Figueirópolis', 'Filadélfia', 'Goianorte', 'Goiatins']
  }
];

// Funções auxiliares

/**
 * Retorna a lista de todas as UFs
 */
export const getUFs = (): string[] => {
  return ESTADOS_BRASIL.map(estado => estado.uf);
};

/**
 * Retorna a lista de todas as cidades de uma UF específica
 */
export const getCidadesByUF = (uf: string): string[] => {
  const estado = ESTADOS_BRASIL.find(e => e.uf === uf.toUpperCase());
  return estado ? estado.cidades : [];
};

/**
 * Retorna o nome completo do estado pela UF
 */
export const getEstadoNomeByUF = (uf: string): string => {
  const estado = ESTADOS_BRASIL.find(e => e.uf === uf.toUpperCase());
  return estado ? estado.nome : '';
};

/**
 * Verifica se uma UF é válida
 */
export const isValidUF = (uf: string): boolean => {
  return ESTADOS_BRASIL.some(e => e.uf === uf.toUpperCase());
};

/**
 * Verifica se uma cidade é válida para uma UF específica
 */
export const isValidCidadeForUF = (cidade: string, uf: string): boolean => {
  const cidades = getCidadesByUF(uf);
  return cidades.some(c => c.toLowerCase() === cidade.toLowerCase());
};

/**
 * Busca cidades por nome (autocomplete)
 */
export const searchCidades = (searchTerm: string, uf?: string): string[] => {
  const term = searchTerm.toLowerCase();
  
  if (uf) {
    const cidades = getCidadesByUF(uf);
    return cidades.filter(c => c.toLowerCase().includes(term));
  }
  
  // Busca em todos os estados
  const allCidades: string[] = [];
  ESTADOS_BRASIL.forEach(estado => {
    estado.cidades.forEach(cidade => {
      if (cidade.toLowerCase().includes(term)) {
        allCidades.push(cidade);
      }
    });
  });
  return allCidades.slice(0, 20); // Limita a 20 resultados
};

/**
 * Valida se UF e cidade são válidas juntas
 */
export const validateUFCidade = (uf: string, cidade: string): { valid: boolean; error?: string } => {
  if (!uf || !cidade) {
    return { valid: false, error: 'UF e cidade são obrigatórios' };
  }

  if (!isValidUF(uf)) {
    return { valid: false, error: `UF "${uf}" não é válida` };
  }

  if (!isValidCidadeForUF(cidade, uf)) {
    return { valid: false, error: `Cidade "${cidade}" não encontrada para a UF ${uf}` };
  }

  return { valid: true };
};

export default ESTADOS_BRASIL;
