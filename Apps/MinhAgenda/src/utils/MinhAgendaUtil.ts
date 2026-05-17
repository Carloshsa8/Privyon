import { differenceInCalendarDays, startOfDay } from 'date-fns';

/**
 * Calcula se o usuário trabalha em uma determinada data com base no ciclo 12x36.
 * 
 * @param hoje Data de referência (hoje)
 * @param trabalhaHoje Booleano indicando se o usuário trabalha na data de referência
 * @param diaConsulta Data que se deseja consultar
 * @returns true se trabalha, false se folga
 */
export const trabalhaNoDiaMinhAgenda = (
  hoje: Date,
  trabalhaHoje: boolean,
  diaConsulta: Date
): boolean => {
  // differenceInCalendarDays calcula a diferença absoluta de dias no calendário,
  // o que é perfeito para ciclos 1/1 (trabalha/folga) independentemente do horário.
  const diffDays = differenceInCalendarDays(diaConsulta, hoje);

  // Se a diferença for par (0, 2, 4...), o status é o mesmo da semente (trabalhaHoje)
  // Se for ímpar (1, 3, 5...), o status é invertido.
  // Usamos o módulo 2. Math.abs garante que funcione para datas no passado (negativas).
  const isOpposite = Math.abs(diffDays) % 2 !== 0;

  return isOpposite ? !trabalhaHoje : trabalhaHoje;
};
