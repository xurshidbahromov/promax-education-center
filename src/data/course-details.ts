
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
        programs: [
            {
                titleKey: "courses.math.program.cert.title",
                featuresKey: "courses.math.program.cert.features"
            },
            {
                titleKey: "courses.math.program.prep.title",
                featuresKey: "courses.math.program.prep.features"
            }
        ]
    },
    english: {
        programs: [
            {
                titleKey: "courses.english.program.main.title",
                featuresKey: "courses.english.program.main.features"
            }
        ]
    },

    chemistry: {
        programs: [
            {
                titleKey: "courses.chemistry.program.cert.title",
                featuresKey: "courses.chemistry.program.cert.features"
            },
            {
                titleKey: "courses.chemistry.program.prep.title",
                featuresKey: "courses.chemistry.program.prep.features"
            }
        ]
    },
    biology: { // Same content as chemistry essentially, based on the link
        programs: [
            {
                titleKey: "courses.biology.program.cert.title",
                featuresKey: "courses.biology.program.cert.features"
            },
            {
                titleKey: "courses.biology.program.prep.title",
                featuresKey: "courses.biology.program.prep.features"
            }
        ]
    },
    native: {
        programs: [
            {
                titleKey: "courses.native.program.cert.title",
                featuresKey: "courses.native.program.cert.features"
            },
            {
                titleKey: "courses.native.program.prep.title",
                featuresKey: "courses.native.program.prep.features"
            }
        ]
    },
    "cert.ielts": {
        programs: [
            {
                titleKey: "courses.cert.ielts.program.main.title",
                featuresKey: "courses.cert.ielts.program.main.features"
            }
        ]
    },
    physics: {
        programs: [
            {
                titleKey: "courses.physics.program.cert.title",
                featuresKey: "courses.physics.program.cert.features"
            },
            {
                titleKey: "courses.physics.program.prep.title",
                featuresKey: "courses.physics.program.prep.features"
            }
        ]
    },
    history: {
        programs: [
            {
                titleKey: "courses.history.program.cert.title",
                featuresKey: "courses.history.program.cert.features"
            },
            {
                titleKey: "courses.history.program.prep.title",
                featuresKey: "courses.history.program.prep.features"
            }
        ]
    },
    law: {
        programs: [
            {
                titleKey: "courses.law.program.prep.title",
                featuresKey: "courses.law.program.prep.features"
            }
        ]
    },
    russian: {
        programs: [
            {
                titleKey: "courses.russian.program.main.title",
                featuresKey: "courses.russian.program.main.features"
            }
        ]
    },
    korean: {
        programs: [
            {
                titleKey: "courses.korean.program.main.title",
                featuresKey: "courses.korean.program.main.features"
            }
        ]
    },
    "cert.cefr": {
        programs: [
            {
                titleKey: "courses.cert.cefr.program.main.title",
                featuresKey: "courses.cert.cefr.program.main.features"
            }
        ]
    },
    "cert.sat": {
        programs: [
            {
                titleKey: "courses.cert.sat.program.main.title",
                featuresKey: "courses.cert.sat.program.main.features"
                // priceKey: "courses.cert.sat.program.main.price" // user requested not to show price
            }
        ]
    },

    "cert.national": {
        programs: [
            {
                titleKey: "courses.cert.national.program.main.title",
                featuresKey: "courses.cert.national.program.main.features"
            }
        ]
    },
    "prep.inha": {
        programs: [
            {
                titleKey: "courses.prep.inha.program.main.title",
                featuresKey: "courses.prep.inha.program.main.features"
            }
        ]
    },
    "prep.west": {
        programs: [
            {
                titleKey: "courses.prep.west.program.main.title",
                featuresKey: "courses.prep.west.program.main.features"
            }
        ]
    },
    "prep.turin": {
        programs: [
            {
                titleKey: "courses.prep.turin.program.main.title",
                featuresKey: "courses.prep.turin.program.main.features"
            }
        ]
    },
    "prep.aut": {
        programs: [
            {
                titleKey: "courses.prep.aut.program.main.title",
                featuresKey: "courses.prep.aut.program.main.features"
            }
        ]
    }
};
