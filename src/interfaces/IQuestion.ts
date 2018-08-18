export enum QuestionType {
    choose_right='choose_right',
    match_columns='match_columns',
    open_question='open_question',
}

export type AnyQuestionData = IChooseRightData | IMatchColumnsData | IOpenQuestionData;

export interface IQuestion<T extends AnyQuestionData> {
    key?: string;
    text: string;
    pictures?: string[];
    order: number;
    type: QuestionType;
    questionData: T;
    points: number;
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
    question: IQuestion<AnyQuestionData>;
}

export interface IQuestionProps<T extends AnyQuestionData>{
    question: IQuestion<T>;
    count?: number;
    order?: number;
    onSuccess?: any;
    onCancel?: any;
    onPass?: any;
    onSkip?: any;
    mode: string;
}

export type QuestionAnswer = IChooseAnswer | IMatchAnswer | string;

interface IPassMode {
    isAnswered: boolean;
    leftAnswers?: string[];
    rightAnswers?: string[];
    answer?: any;
}

export interface IQuestionState<T extends AnyQuestionData, P extends QuestionAnswer> {
    question: IQuestion<T>;
    addingAnswer?: P;
    passMode?: IPassMode;
    uploadedFiles?: File[];
    downloadedFiles?: string[];
}
