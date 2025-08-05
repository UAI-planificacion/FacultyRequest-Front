import { LovVal, Skill, Space } from "@/types/space.model";


// Mocks para los diferentes niveles de Skill
const MOCK_SKILLS: Skill[] = [
    { id: "skill-001", floor: "1", min: 20, max: 40 },
    { id: "skill-002", floor: "2", min: 30, max: 60 },
    { id: "skill-003", floor: "3", min: 50, max: 80 },
    { id: "skill-004", floor: "4", min: 15, max: 35 },
];

// Mocks para los diferentes LovVal (valores de lista)
const MOCK_LOVVALS: LovVal[] = [
    {
        id: "lovval-A",
        description: "sala1001-B",
        active: true,
        skill: MOCK_SKILLS[0],
    },
    {
        id: "lovval-B",
        description: "sala2002-C",
        active: true,
        skill: MOCK_SKILLS[1],
    },
    {
        id: "lovval-C",
        description: "sala3003-A",
        active: false,
        skill: MOCK_SKILLS[2],
    },
    {
        id: "lovval-D",
        description: "oficina15-D",
        active: true,
        skill: MOCK_SKILLS[0],
    },
    {
        id: "lovval-E",
        description: "auditorio500",
        active: true,
        skill: MOCK_SKILLS[3],
    },
];

// Mock principal para el tipo Space
export const MOCK_SPACES: Space[] = [
    {
        id: "space-uuid-1",
        description: "spaces",
        lov_vals: [
            MOCK_LOVVALS[0],
            MOCK_LOVVALS[1]
        ],
    },
    {
        id: "space-uuid-2",
        description: "meeting rooms",
        lov_vals: [
            MOCK_LOVVALS[2],
            MOCK_LOVVALS[3]
        ],
    },
    {
        id: "space-uuid-3",
        description: "large venues",
        lov_vals: [
            MOCK_LOVVALS[4]
        ],
    },
];


export const mockFetchSpaces = (): Promise<Space[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_SPACES);
        }, 1000);
    });
};
