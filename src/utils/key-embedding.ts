export default function embedKey(dbData) {
    if (!dbData) return dbData;

    Object.entries(dbData).map((val) => {
        let oldObjValue = dbData[val[0]];
        dbData[val[0]] = {...oldObjValue, key: val[0]}
    });

    return dbData;
}
