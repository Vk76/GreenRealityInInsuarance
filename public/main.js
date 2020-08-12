


function clearPrediction() {
    $('#img-predicted').html('');
    $('#weather-summary', '#status', '#prediction-text').text('');
    $('#card').css('display', 'none');
}

function updateProgressBar(status) {
    if (status == 'show') {
        $('#progress-bar').css('display', 'inline-block');
        $('#progress-bar').addClass('mdl-progress__indeterminate');
    } else if (status == 'hide') {
        $('#progress-bar').css('display', 'none');
    }
}

function displayPrediction(data) {
    $('#card').css('display', 'inline-block');
    $('#status').text('Got a prediction!');

    // This demo assumes only one label returned
    let cloudType = Object.keys(data)[0];
    let resultText = `${cloudType}: ${(data[cloudType] * 100).toFixed(2)}%\n`;
    $('#prediction-text').text(resultText);
}

function displayImage(file) {
    let img = document.createElement("img");
    img.file = file;
    $('#img-predicted').append(img); 

    let reader = new FileReader();
    reader.onload = (function(imgDiv) { return function(e) { imgDiv.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
}
 
$(document).ready(() => {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const db = firebase.firestore();

    $('#file-select').on('click', () => {
        $('#cloud-upload').trigger("click");
    });

    $('#cloud-upload').on('change', (e) => {
        let localFile = e.target.files[0];
        clearPrediction();
        updateProgressBar('show');

        // Upload the image to Firebase Storage
        $('#status').text('Uploading image...');
        let imgRef = storageRef.child(localFile.name);
        imgRef.put(localFile).then(() => {
            $('#status').text('Querying model...');
            db.collection("images")
                .doc(localFile.name)
                .onSnapshot(function(doc) {
                    if (doc.exists) {
                        let cloudData = doc.data();
                        updateProgressBar('hide');
                        if (cloudData.predictionErr) {
                            $('#status').text(`${cloudData.predictionErr} :(`);
                        } else {
                            displayPrediction(cloudData);
                            displayImage(localFile);
                        }
                    }
            });
        });
    });
});