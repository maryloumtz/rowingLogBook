// Seuil d'avertissement visuel sur le dashboard (§4.1.2)
// Une sortie dépassant ce seuil est mise en évidence en rouge/amber
export const WARN_THRESHOLD_MS = 2.5 * 60 * 60 * 1000 // 2h30

// Pour info : le vrai seuil d'alerte (RG-08) est 3h, géré côté serveur uniquement
