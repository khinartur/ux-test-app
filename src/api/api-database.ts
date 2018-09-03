import {database} from '../modules/firebase';
import {IUser} from '../interfaces/IUser';

export function savePassedQuestion(userLogin, questionKey, passedQuestion, diff={}) {
    return database.ref('passed-questions/' + userLogin + '/' + questionKey).set({
        ...passedQuestion,
        ...diff,
    });
}

export function setPassedQuestions(userLogin, questions) {
    return database.ref('passed-questions/' + userLogin).set(questions);
}

export function saveQuestion(question, key) {
    return database.ref('questions/' + key).set(question);
}

export function setQuestionOrder(order, key) {
    return database.ref('questions-order/' + order).set(key);
}

export function getQuestionsOrder() {
    return database.ref('questions-order/').once('value');
}

export function setQuestionsOrder(ordersMap) {
    return database.ref('questions-order/').set(ordersMap);
}

export function getUser(login) {
    return database.ref(`/users/${login}`).once('value');
}

export function createUser(user: IUser) {
    return database.ref('users/' + user.github).set(user);
}

export function deleteUser(login) {
    return database.ref('users/' + login).remove();
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

export function setQuestions(questions) {
    return database.ref('questions/').set(questions);
}

export function getPassedQuestions(userLogin) {
    return database.ref(`/passed-questions/${userLogin}`).once('value');
}

export function getNextQuestionKey() {
    return database.ref().child('/questions').push().key;
}

export function updateDatabase(updates) {
    return database.ref().update(updates);
}

export function getUsersList() {
    return database.ref('/users').once('value');
}
