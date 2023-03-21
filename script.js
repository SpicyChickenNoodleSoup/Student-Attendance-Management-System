var video = document.getElementById('videoCam');
const button = document.getElementById('startButton');
document.getElementById('confirmButton').style.visibility='hidden';

//loads face recognition models
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start);

//starts user's webcam
function openCam(){
    // only play if "START" is pressed
    if (button.textContent == 'START'){
        // change words on start button
        button.textContent = 'STOP';
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia() not supported :(');
            return;
        } 
        navigator.mediaDevices.getUserMedia({video: true}) 
        .then(function(vidStream) {
            if ("srcObject" in video) { 
                video.srcObject = vidStream;
            } else { 
                video.src = window.URL.createObjectURL(vidStream); 
            }; 
            video.onloadedmetadata = function() { 
                video.play(); 
                document.getElementById('status').innerHTML='Identifying face...'; //change status
            }; 
        }) 
        .catch(function(err0r) { 
            console.log(err0r.name + ": " + err0r.message); 
        }); 
    }    else {
        // stop video if "STOP" is pressed
        button.textContent = 'START';
        video.srcObject.getTracks().forEach(function(track){
            if (track.readyState == 'live') {
                    track.stop();
            };
        });
        document.getElementById('status').innerHTML='Video stopped'; //change status
        console.log('video stopped')
    };
}

var studentRecognised;
var paused = false;

async function start() {
    console.log('successfully loaded models :)');
    const labeledFaceDescriptors = await loadStudentImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    video.addEventListener('play', async () => {loop});
    var loop = setInterval(
        async function faceRecognition(){
            if (!paused) {
                studentRecognised = null;
                //to detect face and retrieve face landmarks and descriptors
                const liveDetections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(); 
                console.log(liveDetections);
                if (liveDetections != null) { //if one face is detected, try to recognise face
                    const bestMatch = faceMatcher.findBestMatch(liveDetections.descriptor);
                    var studentRecognised = bestMatch.toString();
                    console.log(studentRecognised);
                    var studentName = studentRecognised.split(' '+'(')[0]; //obtain name of student recognised
                    if (studentName != "unknown") { //if student name is registered and not unknown
                        document.getElementById('confirmButton').style.visibility='visible';
                        document.getElementById('status').innerHTML='Student found'; //change status
                        displayStudentRecognised(studentName);
                        paused = true; // pauses the face recognition function until "confirm attendance" is pressed
                    }                    
                } else {
                    console.log('no faces or multiple faces detected :( please try again.')
                };
            }
        }
    , 6000);    //repeats face recognition function every 6 seconds until a face is detected
}
//if 'confirm attendance' is pressed, resume face recognition, and restore everything to that stage
function resumeInterval() {
    paused = false;
    document.getElementById('studentName').innerHTML='';
    document.getElementById('dateTime').innerHTML='';
    document.getElementById('confirmButton').style.visibility='hidden';
    document.getElementById('studentImg').style.visibility='hidden';
    if (button.textContent == 'STOP'){
        document.getElementById('status').innerHTML='Identifying face...';
    }
}

//process student images for face recognition
function loadStudentImages() {
    const labels =['Harry', 'Hermione', 'Ron'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`/StudentImages/${label}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            console.log('successfully loaded student image descriptors :)');
            document.getElementById('status').innerHTML="Press START to begin";
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    )
}
//display name and photo of student recognised and date and time the attendance was taken
function displayStudentRecognised(studentName){
    var today = new Date();
    var dateTime = today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes();
    document.getElementById('dateTime').innerHTML=dateTime;
    document.getElementById('studentName').innerHTML=studentName;
    document.getElementById('studentImg').style.visibility='visible';
    document.getElementById('studentImg').src=`/StudentImages/${studentName}.jpg`;
}