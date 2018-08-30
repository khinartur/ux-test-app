import {database} from '../modules/firebase';

export function savePassedQuestion(userLogin, questionKey, passedQuestion, diff={}) {
    return database.ref('passed-questions/' + userLogin + '/' + questionKey).set({
        ...passedQuestion,
        ...diff,
    });
}

export function setPassedQuestions(userLogin, questions) {
    return database.ref('passed-questions/' + userLogin).set(questions);
}

export function getUser(login) {
    return database.ref(`/users/${login}`).once('value');
}

export function updateUser(user, diff) {
    return database.ref('users/' + user.github).set({
        ...user,
        ...diff,
    });
}

export function getQuestions() {
    return database.ref('/questions').once('value');
}

export function getPassedQuestions(userLogin) {
    return database.ref(`/passed-questions/${userLogin}`).once('value');
}
