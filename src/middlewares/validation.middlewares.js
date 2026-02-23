import { ZodError } from "zod";

// Preciso receber um "schema" para validar os dados de entrada.
// O "schema" é uma estrutura que define as regras de validação para os dados que esperamos receber em uma requisição.
// Serão 2 arrow functions: a primeira recebe o "schema" e retorna a segunda,
// que é a função middleware propriamente dita, responsável por validar os dados da requisição.
const validate = (schema) => (req, res, next) => {
  try {
    /*
      O método "parse" do Zod faz duas coisas:
      1. VALIDA se o `req.body` corresponde ao `schema`. Se não, ele lança um erro.
      2. TRANSFORMA e LIMPA os dados, retornando um objeto limpo (ex: remove campos extras).
      
      Por isso, reatribuímos o resultado a `req.body`. Assim, o controller receberá
      apenas os dados validados e sanitizados.
    */
    req.body = schema.parse(req.body);
    next();
  } catch (e) {
    // Verificamos se o erro é uma instância do ZodError.
    // Isso garante que estamos tratando apenas erros de validação do cliente.
    if (e instanceof ZodError) {
      // Se for um erro do Zod, retornamos um status 400 (Bad Request) com os detalhes dos erros.
      return res.status(400).json({ error: e.errors });
    }
    // Se for qualquer outro tipo de erro (ex: erro de programação),
    // passamos para o próximo middleware de erro do Express, que resultará em um 500 (Internal Server Error).
    next(e);
  }
};

export { validate };
