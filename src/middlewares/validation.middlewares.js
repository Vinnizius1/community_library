// Preciso receber um "schema" para validar os dados de entrada.
// O "schema" é uma estrutura que define as regras de validação para os dados que esperamos receber em uma requisição.
// Serão 2 arrow functions: a primeira recebe o "schema" e retorna a segunda,
// que é a função middleware propriamente dita, responsável por validar os dados da requisição.
const validate = (schema) => (req, res, next) => {
  try {
    /* O método "safeParse" do Zod tenta validar o req.body de acordo com o schema.
       Ao contrário do "parse", ele não lança um erro diretamente.
       Em vez disso, retorna um objeto com um boolean "success" e, em caso de falha,
       um array de erros detalhados.
    */
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Se a validação falhar, retornamos um status 400 (Bad Request) com os detalhes dos erros.
      return res.status(400).json({ error: result.error.errors });
    }
    /*
      Por isso, reatribuímos o resultado a `req.body`. Assim, o controller receberá
      apenas os dados validados e sanitizados.
    */
    req.body = result.data;
    next();
  } catch (e) {
    // Passamos qualquer erro inesperado (ex: erro de programação) para o middleware
    // de erro do Express, resultando em um 500 (Internal Server Error).
    next(e);
  }
};

export { validate };
