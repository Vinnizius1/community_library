import { z } from "zod";

// Preciso receber um "schema" para validar os dados de entrada.
// O "schema" é uma estrutura que define as regras de validação para os dados que esperamos receber
// em uma requisição.
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

/**
 * Middleware para validar parâmetros de rota numéricos (IDs).
 * Valida que o parâmetro :id é um número inteiro positivo.
 * Retorna 400 Bad Request se o ID for inválido.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função para chamar o próximo middleware
 * @returns {void}
 */
const validateNumericId = (req, res, next) => {
  try {
    const { id } = req.params;

    // Define o schema para validar um ID numérico
    const idSchema = z
      .string()
      .refine((val) => !Number.isNaN(Number(val)), {
        message: "ID must be a valid number",
      })
      .refine((val) => Number(val) > 0, {
        message: "ID must be a positive integer",
      })
      .transform((val) => Number(val));

    const result = idSchema.safeParse(id);

    if (!result.success) {
      // Se a validação falhar, retornamos um status 400 (Bad Request)
      return res.status(400).json({ error: result.error.errors });
    }

    // Armazena o ID validado e convertido para número
    req.params.id = result.data;

    next();
  } catch (e) {
    // Passamos qualquer erro inesperado para o middleware de erro do Express
    next(e);
  }
};

export { validate, validateNumericId };
