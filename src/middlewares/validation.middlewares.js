// Preciso receber um "schema" para validar os dados de entrada.
// O "schema" é uma estrutura que define as regras de validação para os dados que esperamos receber em uma requisição.
// Serão 2 arrow functions: a primeira recebe o "schema" e retorna a segunda,
// que é a função middleware propriamente dita, responsável por validar os dados da requisição.
const validate = (schema) => (req, res, next) => {
  try {
    // O método "parse" vem do Zod, uma biblioteca de validação de dados.
    // Ele tenta validar os dados de entrada (req.body) de acordo com as regras definidas no "schema".
    // Se os dados forem válidos, o método "parse" retorna os dados validados.
    schema.parse(req.body);
    next();
  } catch (e) {
    // Status 400 é erro do cliente, indicando que os dados enviados na requisição não estão corretos ou
    // não atendem aos critérios de validação definidos no "schema".
    // Em "e.errors" estão os detalhes dos erros de validação, que podem incluir mensagens específicas sobre o que deu errado.
    res.status(400).json({ error: e.errors });
  }
};

export { validate };
