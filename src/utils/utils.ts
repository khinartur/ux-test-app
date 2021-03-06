import {AnyQuestionData, IQuestion, QuestionType} from '../interfaces/IQuestion';

export function embedKey(dbData) {
    if (!dbData) return dbData;

    Object.entries(dbData).map((val) => {
        let oldObjValue = dbData[val[0]];
        dbData[val[0]] = {...oldObjValue, key: val[0]};
    });

    return dbData;
}

export function ejectKey(data) {
    if (!data) return data;

    let result = {};
    data.map(v => {
        result[v.key] = v;
    });

    return result;
}

const map = {
    [QuestionType.choose_right]: 'Выбор ответа',
    [QuestionType.match_columns]: 'Сопоставление столбцов',
    [QuestionType.open_question]: 'Открытый вопрос',
};

export function getTypeName(question: IQuestion<AnyQuestionData>): string {
    return map[question.type];

    // switch(question.type) {
    //     case QuestionType.choose_right:
    //         return 'Выбор ответа';
    //     case QuestionType.match_columns:
    //         return 'Сопоставление столбцов';
    //     case QuestionType.open_question:
    //         return 'Открытый вопрос';
    // }
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
