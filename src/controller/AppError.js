/**
 * Classe padronizada para erros de regra de negócio da aplicação.
 * Permite definir uma mensagem e um código de status HTTP (padrão 400).
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Define o nome da classe para facilitar a identificação no código
    this.name = "AppError";
  }
}
