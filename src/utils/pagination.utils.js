/**
 * Sanitiza parâmetros de paginação de forma ultra-defensiva para uso em repositórios.
 * @param {any} limit - Valor bruto do limite.
 * @param {any} offset - Valor bruto do offset.
 * @returns {{ safeLimit: number, safeOffset: number }}
 */
export function sanitizePagination(limit, offset) {
  const safeLimit = Math.min(
    Math.max(1, Number.isInteger(limit) ? limit : 10),
    1000,
  );
  const safeOffset = Math.max(0, Number.isInteger(offset) ? offset : 0);
  return { safeLimit, safeOffset };
}
