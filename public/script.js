const video = document.querySelector("#video");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector(".drop-zone");
const dropdown = document.querySelector("#dropdown");


async function UploadVideo(e){
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if(e.target.files){
      url =  e.target.files[0]
    }else{
      url = e.dataTransfer.files[0]
    }
    video.src = URL.createObjectURL(url);
    video.load();
    video.style.display="block"
    dropZone.style.display = "none";
}

fileInput.addEventListener("change",UploadVideo);
dropZone.addEventListener("drop", UploadVideo);

eel.expose(getCurrentTime);
function getCurrentTime(){
  return video.currentTime
}


const createWordElement = (word) => {
    const element = document.createElement("span");
    element.classList.add("word");
    element.innerText = word.word;
    
    element.addEventListener("click", () => {
      element.classList.toggle("struck-through");
    });
  
    return element;
};


async function setTranscipts(){
    dict =  await eel.transcribe()()
    words = []
    dict.forEach(word => {
        words.push(createWordElement(word))
    });
}  


video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
  
    if (currentTime > previousTime) {
      while (
        currentWordIndex < words.length &&
        currentTime >= words[currentWordIndex].to
      ) {
        currentWordIndex++;
      }
    } else if (currentTime < previousTime) {
      while (currentWordIndex > 0 && currentTime < words[currentWordIndex - 1].to) {
        currentWordIndex--;
      }
    }
  
    const currentWord = wordContainer.querySelector(
      `span:nth-child(${currentWordIndex + 1})`
    );
  
    if (!currentWord.classList.contains("struck-through")) {
      Array.from(wordContainer.querySelectorAll(".highlighted")).forEach((element) => {
        element.classList.remove("highlighted");
      });
      currentWord.classList.add("highlighted");
    }
  
    previousTime = currentTime;
  });