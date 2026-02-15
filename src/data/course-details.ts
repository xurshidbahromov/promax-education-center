
export interface ProgramDetail {
    titleKey: string;
    featuresKey: string; // Pipe " | " separated string
    priceKey?: string;
}

export interface CourseDetail {
    programs: ProgramDetail[];
}

export const courseDetails: Record<string, CourseDetail> = {
    math: {
        programs: []
    },
    english: {
        programs: []
    },

    chemistry: {
        programs: []
    },
    biology: { // Same content as chemistry essentially, based on the link
        programs: []
    },
    native: {
        programs: []
    },
    "cert.sat": {
        programs: []
    },
    physics: {
        programs: []
    },
    history: {
        programs: []
    },
    "cert.national": {
        programs: []
    }
};
