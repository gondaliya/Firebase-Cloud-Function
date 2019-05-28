const functions = require('firebase-functions');

const admin = require('firebase-admin');

var serviceAccount = require("./service.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://motivational-line.firebaseio.com"
});

const db = admin.database();

exports.addImg = functions.storage.object().onFinalize((object) => {

    const ref = db.ref('/');
    const path = "https://firebasestorage.googleapis.com/v0/b/motivational-line.appspot.com/o/";
    const filePath = object.name; // File path in the bucket catagory/name.jpeg
    const catagory = filePath.substring(0, filePath.indexOf('/'));
    const fileName = filePath.substring(filePath.indexOf('/') + 1, filePath.length);
    const timeCreated = object.timeCreated
    const token = object.metadata.firebaseStorageDownloadTokens;
    const url = path + catagory + '%2' + 'F' + fileName + "?alt=media&token=" + token;
    let newImg = {
        date: timeCreated,
        url: url
    }
    ref.child(catagory).push(newImg);
    ref.child("all").push(newImg);

    return 0;
})

exports.removeImg = functions.storage.object().onDelete((object) => {
    const filePath = object.name; // File path in the bucket catagory/name.jpeg
    const catagory = filePath.substring(0, filePath.indexOf('/'));
    const timeCreated = object.timeCreated
    var catRef = db.ref(catagory);

    catRef.once("value", (data) => {
        var allData = data.val();
        for (var key in allData) {
            var val = allData[key];
            if (val.date === timeCreated) {
                catRef.child(key).remove();
            }
        }
    });

    db.ref('all').once("value", (data) => {
        var allData = data.val();
        for (var key in allData) {
            var val = allData[key];
            if (val.date === timeCreated) {
                db.ref('all').child(key).remove();
            }
        }

    });
    return 0;
});