export interface Period {
    id          : string;
    name        : string;
    startDate   : string | null;
    endDate     : string | null;
    openingDate : string | null;
    closingDate : string | null;
    status      : string;
    createdAt   : string;
    updatedAt   : string;
}
