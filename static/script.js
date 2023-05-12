var video = document.getElementById('videoCam');
var button = document.getElementById('startButton');
document.getElementById('confirmButton').style.visibility='hidden';

//loads face recognition models
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/static/models'),
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
            }
            video.onloadedmetadata = function() { 
                video.play(); 
                document.getElementById('status').innerHTML='Identifying face...'; //change status
                paused = false; //make sure face recognition is unpaused, if the webcam was previously stopped
            } 
        }) 
        .catch(function(err0r) { 
            console.log(err0r.name + ': ' + err0r.message); 
        }); 
    }    else {
        // stop video if "STOP" is pressed
        button.textContent = 'START';
        video.srcObject.getTracks().forEach(function(track){
            if (track.readyState == 'live') {
                    track.stop();
            }
        });
        //creates custom event for video stopped for addEventListener in start()
        var event = new Event('videoStopped');
        video.dispatchEvent(event);
        document.getElementById('status').innerHTML='Video stopped'; //change status
        console.log('video stopped');
    }
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
            video.addEventListener('videoStopped', async () => {
                paused = true; // pauses the face recognition function until video starts again when "START" is pressed
                console.log('face recognition has stopped'); 
            });

            if (!paused) { //only run normally if not paused
                studentRecognised = null;
                //to detect face and retrieve face landmarks and descriptors
                const liveDetections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(); 
                console.log(liveDetections);
                if (liveDetections != null) { //if one face is detected, try to recognise face
                    const bestMatch = faceMatcher.findBestMatch(liveDetections.descriptor);
                    var studentRecognised = bestMatch.toString();
                    console.log(studentRecognised);
                    var studentName = studentRecognised.split(' '+'(')[0]; //obtain name of student recognised
                    if (studentName != 'unknown') { //if student name is registered and not unknown
                        document.getElementById('confirmButton').style.visibility='visible';
                        document.getElementById('status').innerHTML='Student found'; //change status
                        displayStudentRecognised(studentName);
                        paused = true; // pauses the face recognition function until "confirm attendance" is pressed
                    }                    
                } else {
                    console.log('no faces or multiple faces detected :( please try again.')
                }
            }
        }
    , 4000);    //repeats face recognition function every 4 seconds until a face is detected
}

//if 'confirm attendance' is pressed, resume face recognition, and restore everything to that stage
function confirmAttendance() {
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
                const img = await faceapi.fetchImage(`/static/StudentImages/${label}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            console.log('successfully loaded student image descriptors :)');
            document.getElementById('status').innerHTML='Press START to begin';
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

var attendanceTable = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];
//display name and photo of student recognised and date and time the attendance was taken
function displayStudentRecognised(studentName){
    var today = new Date();
    var dateTime = today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes();
    document.getElementById('dateTime').innerHTML=dateTime;
    document.getElementById('studentName').innerHTML=studentName;
    document.getElementById('studentImg').style.visibility='visible';
    document.getElementById('studentImg').src=`/static/StudentImages/${studentName}.jpg`;

    //adds an entry of student's name and date and time of attendance to the list of new entries into the attendance table
    var row = attendanceTable.insertRow(0);
    var namecell = row.insertCell(0);
    var timecell = row.insertCell(1);
    namecell.innerHTML = studentName;
    timecell.innerHTML = dateTime;
}

//to open and close the popup window when "View Attendance Log" is clicked
const popupWindow = document.getElementById("popupWindowOverlay");
function viewLog(){
    popupWindow.style.display = 'flex';
}

function closeLog(){
    popupWindow.style.display = 'none';
}
