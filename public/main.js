const video = document.querySelector("#video");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector(".drop-zone");
const dropdown = document.querySelector("#dropdown")

let startTime = 0
let endTime = 0

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
  endTime = video.duration;
}
video.addEventListener("ended", function() {
  video.currentTime = startTime;
  video.play();
});
video.addEventListener("timeupdate", function() {
  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
  }
});

video.addEventListener("timeupdate", function() {
  wl = wordList.querySelectorAll(".word")
  dl = document.querySelectorAll(".dualighted")
  for(let i=0; i<dl.length ;i++ ){
    const currentWord = dl[i];
    currentWord.classList.remove("dualighted")
  }
  for(let i=0; i<wl.length ;i++ ){
    const currentWord = wl[i];
    const currentWordKey = currentWord.getAttribute("data-word");
    if(words[currentWordKey].f<=video.currentTime && words[currentWordKey].t>=video.currentTime){
      currentWord.classList.add("dualighted");
      break;
    }
  }

});



fileInput.addEventListener("change",UploadVideo);
dropZone.addEventListener("drop", UploadVideo);

dropZone.addEventListener("dragover", function(e) {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", function(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
});

eel.expose(getCurrentTime);
function getCurrentTime(){
  return video.currentTime
}

eel.expose(getModelSize);
function getModelSize(){
  return dropdown.options[dropdown.selectedIndex].value;
}

eel.expose(getURL)
function getURL(){
  return video.src
}

async function setTranscipts(){
  dict =  await eel.transcribe()()
  words = dict
  let wordListHTML = "";
  for (const word in words) {
    wordListHTML += `<span class="word" data-word="${word}"> ${words[word].text} </span>`;
  }
  wordList.innerHTML = wordListHTML;
}
    

let words = {}
const wordList = document.querySelector("#word-list");


let lastSelectedWord = null;
wordList.addEventListener("click", function(event) {
  if (event.target.classList.contains("word")) {
    const word = event.target.getAttribute("data-word");
    if (event.shiftKey) {
      words[word].struckThrough = !words[word].struckThrough;
      event.target.classList.toggle("strike");
    } else if(event.ctrlKey){
      if (lastSelectedWord) {
        let startIndex = Array.prototype.indexOf.call(wordList.querySelectorAll(".word"), lastSelectedWord);
        let endIndex = Array.prototype.indexOf.call(wordList.querySelectorAll(".word"), event.target);
        
        if (startIndex > endIndex) {
          [startIndex, endIndex] = [endIndex, startIndex];
        }
        startTime = Number(words[wordList.querySelectorAll(".word")[startIndex].getAttribute("data-word")].f);
        endTime = Number(words[wordList.querySelectorAll(".word")[endIndex].getAttribute("data-word")].t);
        for (let i = startIndex; i <= endIndex; i++) {
          const currentWord = wordList.querySelectorAll(".word")[i];
          const currentWordKey = currentWord.getAttribute("data-word");
          words[currentWordKey].highlighted = true;
          currentWord.classList.add("highlighted");
        }
        lastSelectedWord = event.target;
      } else {
        for (const key in words) {
          words[key].highlighted = false;
        }
        
        const highlightedWords = document.querySelectorAll(".highlighted");
        highlightedWords.forEach(function(word) {
          word.classList.remove("highlighted");
        });
        words[word].highlighted = true;
        event.target.classList.add("highlighted");
        lastSelectedWord = event.target;
      }
    }else{
      for (const key in words) {
        words[key].highlighted = false;
      }
      
      const highlightedWords = document.querySelectorAll(".highlighted");
      highlightedWords.forEach(function(word) {
        word.classList.remove("highlighted");
      });
      words[word].highlighted = true;

      startTime = Number(words[word].f)
      endTime = Number(words[word].t)

      event.target.classList.add("highlighted");
      lastSelectedWord = event.target;
    }
  }
  video.currentTime = startTime
});

document.body.addEventListener("dblclick", function(event){
  for (const key in words) {
    words[key].highlighted = false;
  }
  const highlightedWords = document.querySelectorAll(".highlighted");
  highlightedWords.forEach(function(word) {
    word.classList.remove("highlighted");
  });
  lastSelectedWord = null
  startTime =0
  endTime = video.duration;
  video.currentTime = 0
  video.pause();
})

