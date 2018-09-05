import {IUser} from '../interfaces/IUser';

export function updateUserModel(user: IUser) {
    if (!localStorage.getItem('user')) {
        return null;
    }

    localStorage.setItem('user', JSON.stringify(user));
    return user;
}
