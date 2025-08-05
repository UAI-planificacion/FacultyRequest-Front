import { CostCenter } from "@/types/cost-center.model";

export const MOCK_COST_CENTERS: CostCenter[] = [
    {
        centro_costo: "CC101",
        NOMCGA: "Recursos Humanos",
        ARACGS: "Dirección General",
        SARCGS: "Recursos Humanos",
        sub_area: "Selección y Contratación",
        estado: "Activo",
        NombreCompuesto: "CC101 - Recursos Humanos"
    },
    {
        centro_costo: "CC205",
        NOMCGA: "Tecnología de la Información",
        ARACGS: "Soporte Técnico",
        SARCGS: "Infraestructura",
        sub_area: "Redes y Servidores",
        estado: "Activo",
        NombreCompuesto: "CC205 - Tecnología de la Información"
    },
    {
        centro_costo: "CC302",
        NOMCGA: "Finanzas y Contabilidad",
        ARACGS: "Gerencia Financiera",
        SARCGS: "Contabilidad",
        sub_area: "Cuentas por Pagar",
        estado: "Inactivo",
        NombreCompuesto: "CC302 - Finanzas y Contabilidad"
    },
    {
        centro_costo: "CC410",
        NOMCGA: "Marketing y Ventas",
        ARACGS: "Gerencia Comercial",
        SARCGS: "Ventas",
        sub_area: "Ventas Digitales",
        estado: "Activo",
        NombreCompuesto: "CC410 - Marketing y Ventas"
    },
];


export const mockFetchCostCenters = (): Promise<CostCenter[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_COST_CENTERS);
        }, 1000);
    });
};
