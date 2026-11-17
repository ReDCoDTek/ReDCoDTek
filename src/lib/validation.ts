import { z } from "zod";

/** Validation serveur des réponses : rien n'est enregistré sans passer par ici. */
export const schemaReponses = z.object({
  revenuMensuel: z.number().int().min(500).max(30000),
  statut: z.enum(["micro-liberal", "micro-artisan", "societe", "autre"]),
  tauxCharges: z.number().min(0).max(70),
  fraisMensuels: z.number().int().min(0).max(20000),
  joursParSemaine: z.number().min(0.5).max(6).multipleOf(0.5),
  semainesOff: z.number().int().min(0).max(30),
  tarifActuel: z.number().int().min(1).max(5000),
});
