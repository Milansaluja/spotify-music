// a gloabal variable...
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Add leading zeros if necessary
    minutes = String(minutes).padStart(2, '0');
    remainingSeconds = String(remainingSeconds).padStart(2, '0');

    return minutes + ':' + remainingSeconds;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)
    // by doing a.text() we cannot get what we actually want,i think because it is a part of librabry,so we create one div here and insert response inside it.
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div); //now we will get <li> elements which consist <a> tags of songs.
    let as = div.getElementsByTagName("a");
    // console.log(as) // we get our songs in a tag .
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.replaceAll("%20", " ").split(`/${folder}/`)[1]);
        }
    }
    // console.log(songs) //now we get our songs in a clear format inside an array[].

    //show all the songs in the playlist.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <i class="fa fa-music" aria-hidden="true"></i>
    <div class="info">
        <div> ${song}</div>
        <div>Mr.Milan</div>
    </div>
    <div class="playnow">
        <span>Play Now</span>
        <i class="fa fa-play-circle" aria-hidden="true"></i>
    </div> </li>`;

    }

    //Attach an event Listener to each song.
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML);
            // playMusic(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML)
            //or.........
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        });
    });

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)  //.forEach(async e => {
    // console.log(array)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            // console.log(folder)

            //get the metadeta of the folder.
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <i class="fa fa-play" aria-hidden="true"></i>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="img">
            <h3>${response.title}</h3>
            <p>${response.description} </p>
            </div>
            `
        }
    }

    //load the playlist whenever card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            // console.log(item,item.target,item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            let changeColor = document.querySelector(".nav").getElementsByTagName("p")[0];
            changeColor.style.color = "yellow";

            setTimeout(() => {
                let changeColor = document.querySelector(".nav").getElementsByTagName("p")[0];
                changeColor.style.color = "white";
            }, 1000)
        })
    });
}

async function main() {

    //get the list of all songs.
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //display all the albums on the page.
    displayAlbums()


    //All about event Listeners..................................❤

    //Attach an event listener to play,next and previous(song-buttons)...

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg"; // Set the path to your pause icon
        } else {
            currentSong.pause();
            play.src = "images/play.svg"; // Set the path to your play icon
        }
    });

    //listen for timeupdate event.
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add a event listener to seekbar...............
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX)
        let percentValue = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percentValue + "%";
        currentSong.currentTime = ((currentSong.duration) * percentValue) / 100
    });

    //add an event listener for an hamburger.
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    });

    //add an event listener for an cross.
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    });

    // add an event listener to previous and next buttons.

    previous.addEventListener("click", () => {
        console.log(currentSong)
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    });

    next.addEventListener("click", () => {
        console.log(currentSong.src)
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {

            playMusic(songs[index + 1])
        }
    });

    // add an event to volume..
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100")
        // console.log(e,e.target,e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    });

    // making it slient on event listener......

    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e) => {
        // console.log(e.target)
        console.log("changing", e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "volume-off.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("volume-off.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    });


}
main();
