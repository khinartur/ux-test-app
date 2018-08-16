export enum QuestionType {
    choose_right='choose_right',
    match_columns='match_columns',
    open_question='open_question',
}

export type AnyQuestion = IChooseRightData | IMatchColumnsData | IOpenQuestionData;

export interface IQuestion<T extends AnyQuestion> {
    key?: string;
    text: string;
    order: number;
    type: QuestionType;
    questionData: T;
}

export interface IChooseRightData {
    answers: IChooseAnswer[];
}

export interface IChooseAnswer {
    text: string;
    isRight: boolean;
    isAnswered: boolean;
}

export interface IMatchColumnsData {
    answers: IMatchAnswer[];
}

export interface IMatchAnswer {
    left: string;
    right: string;
    user_answer: string;
}

export interface IOpenQuestionData {
    answer: string;
}

export interface IPassedQuestion {
    user_login: string;
    question: IQuestion<AnyQuestion>;
}
