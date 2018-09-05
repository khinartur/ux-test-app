export enum EUserTestStatus {
    not_passed = 'not_passed',
    in_progress = 'in_progress',
    passed = 'passed',
}

export interface IUser {
    github: string;
    name: string;
    surname: string;
    points: number;
    test_is_checked: boolean;
    test_status: EUserTestStatus;
    current_question: number;
}
