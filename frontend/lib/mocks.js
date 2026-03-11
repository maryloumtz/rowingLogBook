// ─── Membres ────────────────────────────────────────────────────────────────

export const mockCurrentUser = {
  id: 'user-001',
  firstName: 'Marc',
  lastName: 'Dupont',
  email: 'marc.dupont@rowing.fr',
  role: 'ROWER',
  isActive: true,
}

export const mockMembers = [
  mockCurrentUser,
  {
    id: 'user-002',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@rowing.fr',
    role: 'ROWER',
    isActive: true,
  },
  {
    id: 'user-003',
    firstName: 'Lucas',
    lastName: 'Bernard',
    email: 'lucas.bernard@rowing.fr',
    role: 'ROWER',
    isActive: true,
  },
  {
    id: 'user-004',
    firstName: 'Julie',
    lastName: 'Leroy',
    email: 'julie.leroy@rowing.fr',
    role: 'ROWER',
    isActive: true,
  },
]

// ─── Bateaux ─────────────────────────────────────────────────────────────────
// La disponibilité n'est pas un champ direct du bateau.
// Le backend filtre via GET /api/boats?available=true :
//   disponible = isActive + condition != MAINTENANCE + aucune session IN_PROGRESS

// mockBoats contient TOUS les bateaux (pour le dashboard / affichage)
export const mockBoats = [
  {
    id: 'boat-001',
    name: 'L\'Albatros',
    type: 'double',
    capacity: 2,
    condition: 'GOOD',
    isActive: true,
  },
  {
    id: 'boat-002',
    name: 'Le Triton',
    type: 'skiff',
    capacity: 1,
    condition: 'WATCH',
    isActive: true,
  },
  {
    id: 'boat-003',
    name: 'La Sirène',
    type: 'quatre',
    capacity: 4,
    condition: 'GOOD',
    isActive: true,
    // indisponible : a une session IN_PROGRESS (session-002 ci-dessous)
  },
]

// mockAvailableBoats simule la réponse de GET /api/boats?available=true
export const mockAvailableBoats = mockBoats.filter(
  (b) => b.id !== 'boat-003' // boat-003 est pris par session-002
)

// ─── Sessions ────────────────────────────────────────────────────────────────

const now = new Date()

// Session 1 : démarrée il y a 1h10 — affichage NORMAL (< 2h30)
// responsable = mockCurrentUser (user-001)
const departure1 = new Date(now.getTime() - 70 * 60 * 1000) // -1h10

// Session 2 : démarrée il y a 3h — affichage AVERTISSEMENT (> 2h30)
// responsable = user-002
const departure2 = new Date(now.getTime() - 3 * 60 * 60 * 1000) // -3h

export const mockSessions = [
  {
    id: 'session-001',
    boatId: 'boat-001',
    responsibleId: 'user-001', // = mockCurrentUser
    departureTime: departure1.toISOString(),
    returnTime: null,
    plannedDistanceKm: 12.5,
    actualDistanceKm: null,
    route: 'Boucle de l\'île',
    preRemarks: null,
    postRemarks: null,
    status: 'IN_PROGRESS',
    crewMemberIds: ['user-001', 'user-003'],
  },
  {
    id: 'session-002',
    boatId: 'boat-003',
    responsibleId: 'user-002',
    departureTime: departure2.toISOString(),
    returnTime: null,
    plannedDistanceKm: 8.0,
    actualDistanceKm: null,
    route: null,
    preRemarks: 'Entraînement intensité 3',
    postRemarks: null,
    status: 'IN_PROGRESS',
    crewMemberIds: ['user-002', 'user-004'],
  },
]

// ─── Auth mock ───────────────────────────────────────────────────────────────
// JWT factice dont le payload contient sub = 'user-001'
// Payload : { sub: 'user-001', exp: 9999999999 }
export const mockToken =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ sub: 'user-001', exp: 9999999999 }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_') +
  '.mock-signature'
