const video = document.querySelector("#video");
const wordsContainer = document.getElementById("word-list");
const loader = document.getElementById("loader");
let words;
let path;

async function LoadVideo(){
  path = await eel.getpath()()
  video.src = "temp.mp4"
  let elements = document.querySelectorAll('.dis');
  for (let element of elements) {
    element.style.display = 'block';
  }
  video.load()
  video.style.display = "block"
  endTime=video.duration
}

async function setTranscripts() {
  
  loader.style.display = "block";
  words = await eel.transcribe()();
  loader.style.display = "none";
  
  // Clear any existing words
  wordsContainer.innerHTML = "";
  // Create an element for each word
  
  words.forEach(({ text, start, end }) => {
    const wordEl = document.createElement("span");
    wordEl.classList.add("word");
    wordEl.innerText = ' '+text+' ';
    wordEl.dataset.start = start;
    wordEl.dataset.end = end;
    wordEl.addEventListener("mouseover", function(e){
      if(e.buttons == 1 || e.buttons == 3){
        wordEl.classList.toggle("strike");
      }
    });
    wordEl.addEventListener("click", function(e){
        wordEl.classList.toggle("strike");
    });
    wordsContainer.appendChild(wordEl);
  });
}

function updateHighlight(time) {
  // Find the word that is being spoken at the current time
  const word = words.find(({ start, end }) => time >= start && time < end);
  if (word) {
    // Highlight the word
    const wordEl = wordsContainer.querySelector(
      `.word[data-start="${word.start}"][data-end="${word.end}"]`
    );
    wordEl.classList.add("highlighted");
  }
}

function ifStriked(time) {
  // Find the word that is being spoken at the current time
  const word = words.find(({ start, end }) => time >= start && time < end);
  if (word) {
    // Highlight the word
    const wordEl = wordsContainer.querySelector(
      `.word[data-start="${word.start}"][data-end="${word.end}"]`
    );
    return wordEl.classList.contains("strike")
  }else{
    return false
  }
}

function skipStrikethroughWords(time) {
  // Find the next word after the current time that is not strikethrough
  let nextTime = time;
  for (let i = 0; i < words.length; i++) {
    const { start, end } = words[i];
    if (time < start) {
      const wordEl = wordsContainer.querySelector(
        `.word[data-start="${start}"][data-end="${end}"]`
      );
      if (!wordEl.classList.contains("strike")) {
        nextTime = start;
        break;
      }
    }
  }
  return nextTime;
}

video.addEventListener("timeupdate", () => {
  // Remove the highlight from all words
  Array.from(wordsContainer.children).forEach(wordEl => {
    wordEl.classList.remove("highlighted");
  });
  // Highlight the current word
  updateHighlight(video.currentTime);
  if(ifStriked(video.currentTime)){
    video.currentTime = skipStrikethroughWords(video.currentTime);
  }
});


function getStrikethroughWords() {
  const strikethroughWords = [];
  const strikedWordEls = wordsContainer.querySelectorAll(".strike");
  strikedWordEls.forEach(wordEl => {
    const start = wordEl.dataset.start;
    const end = wordEl.dataset.end;
    strikethroughWords.push({ start, end });
  });
  return strikethroughWords;
}

async function downloadv(){
  loader.style.display = "block";
  times = getStrikethroughWords()
  await eel.saveVid(times,path)
  loader.style.display = "none";
}