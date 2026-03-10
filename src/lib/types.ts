export type RoscoWordType = "STARTS_WITH" | "INCLUDES";

export interface RoscoGenerateItem {
    letter: string;
    word: string;
    definition: string;
    type?: RoscoWordType;
}

export interface WordItem extends RoscoGenerateItem {
    status: "unanswered" | "correct" | "incorrect" | "passed";
}
