export interface Programme {
    Degree1: string;
    Degree2: string;
    Programme: string;
    Faculty: string;
    Description: string;

    FullTime: boolean;
    PartTime: boolean;
    Evening: boolean;
    
    CSECPasses: number;
    CSECMandatory: string;
    CSECAny1of: string;
    CSECAny2of: string;
    CSECAny3of: string;
    CSECAny4of: string;
    CSECAny5of: string;
    
    CAPEPasses: number;
    CAPEMandatory: string;
    CAPEAny1of: string;
    CAPEAny2of: string;
    CAPEAny3of: string;
    CAPEAny4of: string;
    CAPEAny5of: string;

    AlternativeQualifications: string;
    OtherRequirements: string;
}

export interface Requirements {
    type: string;
    Passes: number;
    Mandatory: string;
    Any1of: string;
    Any2of: string;
    Any3of: string;
    Any4of: string;
    Any5of: string;
}

