import {storageRef} from '../modules/firebase';

export function uploadFile(key, file) {
    return storageRef.child(`${key}/${file.name}`).put(file);
}
