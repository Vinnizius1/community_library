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

// Schema para validação de IDs numéricos - definido uma vez (fora da função) para performance.
// z.coerce.number() tenta converter a string (ex: "123") para número automaticamente.
const idSchema = z.coerce
  .number({
    invalid_type_error: "ID must be a valid number",
  })
  .int({ message: "ID must be an integer" })
  .positive({ message: "ID must be a positive integer" });

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

// Schema para validação de parâmetros de paginação (limit e offset)
// Por exemplo, em uma rota GET /users?limit=10&offset=20, queremos garantir que limit e offset sejam números válidos.
const paginationSchema = z.object({
  limit: z.coerce
    .number({
      invalid_type_error: "Limit must be a valid number",
    })
    .int({ message: "Limit must be an integer" })
    .min(1, { message: "Limit must be at least 1" })
    .max(1000, { message: "Limit cannot exceed 1000" }) // Limite defensivo
    .default(10), // Valor padrão se não for fornecido
  offset: z.coerce
    .number({
      invalid_type_error: "Offset must be a valid number",
    })
    .int({ message: "Offset must be an integer" })
    .min(0, { message: "Offset must be at least 0" })
    .default(0), // Valor padrão se não for fornecido
});

// Valida os parâmetros em "paginationSchema" e, se forem válidos, os atribui de volta a req.query para uso posterior no controller.
// Por exemplo, se os parâmetros forem inválidos, como limit=-5 ou offset=abc, o middleware retornará um 400 com os erros de validação detalhados.
const validatePagination = (req, res, next) => {
  try {
    const result = paginationSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }
    req.query = result.data; // Atribui os dados validados e tipados de volta para req.query
    next();
  } catch (e) {
    next(e);
  }
};

export { validate, validateNumericId, validatePagination };
