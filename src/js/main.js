// create scenemanager
// attach listeners to dom elements (eg windowresize)
// start render loop
// import {Timer} from '.libs/Timer';

let data = loadData();
let canvas = document.getElementById("canvas");
let sceneManager = new SceneManager(canvas, data);


let animationRequest;

function loadData() {
    let request = new XMLHttpRequest();
    request.open("GET", "data.json", false);
    request.send(null);
    let data = JSON.parse(request.responseText);

    return data;
}

bindEventListeners();
checkInitialStates();

render();

function render() {
    animationRequest = requestAnimationFrame(render);
    sceneManager.update();
}

function checkInitialStates() {
    resizeCanvas();
    validateInputLinkLines();
    sceneManager.setAnimationSpeed(document.getElementById("animationSpeedSlider").value);
}

function bindEventListeners() { 
    window.onresize = resizeCanvas;

    const pausePlayButton = document.querySelector("#pausePlayButton");
    pausePlayButton.addEventListener("click", pausePlay, false);

    const moveCameraButton = document.getElementById("moveCameraToTopView");
    moveCameraButton.addEventListener("click", moveCameraToTopView, false);

    const resetButton = document.getElementById("resetAnimation");
    resetButton.addEventListener("click", reset, false);
    
    // ??? Not attaching the event listener works better than attaching it, but deleting the handler
    // changes the output ???
    // document.addEventListener("visibilitychange", handleVisibilityChange, false);

    const toggleLinkLinesMenuButton = document.getElementById("openDrawLinkLinesMenu");
    toggleLinkLinesMenuButton.addEventListener("click", toggleMenuAnimation, false);

    const linkLinesCheckboxes = document.querySelectorAll('#linkLine-checkboxes input');
    linkLinesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', limitSelectedCheckboxes, false);
        checkbox.addEventListener('change', validateInputLinkLines, false);
    });

    const hideShowButton = document.querySelector("#hideShowButton");
    hideShowButton.addEventListener("click", hideShowTrajectories, false);

    const toggleLoopFigureMenuButton = document.getElementById("openDrawLoopFigureMenu");
    toggleLoopFigureMenuButton.addEventListener("click", toggleMenuAnimation, false);

    const animationSpeedSlider = document.getElementById("animationSpeedSlider");
    animationSpeedSlider.oninput = function() {
        sceneManager.setAnimationSpeed(this.value);
    }

    // Draw Buttons
    const drawLinkLinesButton = document.getElementById("drawLinkLinesButton");
    drawLinkLinesButton.addEventListener('click', drawLinkLines, false);
}

function resizeCanvas() {
    canvas.style.width = '100% - 260px';
    canvas.style.height = '100%';
    // canvas.style.float = 'right';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    sceneManager.onWindowResize();
}

// *** Event Handlers ***

function handleVisibilityChange(e) {
    if (document.hidden) {
        // Pause animation
        cancelAnimationFrame(animationRequest);
    } else {
        // Resume animation
        sceneManager.timeController.timer.reset();
        animationRequest = requestAnimationFrame(render);
    }
}

function pausePlay(e) {
    let text = this.querySelector("#pausePlay").textContent;

    let pauseSVG = document.querySelector("#pause-icon");
    let playSVG = document.querySelector("#play-icon");

    if (text == "Pause Animation") {
        sceneManager.animationPaused = true;

        this.querySelector("#pausePlay").innerHTML = "Play Animation";

        // Switch visibility
        show(playSVG);
        hide(pauseSVG);
    } else {
        sceneManager.timeController.timer.reset();
        this.querySelector("#pausePlay").innerHTML = "Pause Animation";
        sceneManager.animationPaused = false;

        // Switch visibility
        show(pauseSVG);
        hide(playSVG);
    } 
}

function hideShowTrajectories(e) {
    let text = this.querySelector("#hideShow").textContent;

    let eyesSlashSVG = document.querySelector("#eyes-slash-icon");
    let eyesSVG = document.querySelector("#eyes-icon");

    if (text == "Hide Trajectories") {
        sceneManager.hideTrajectories();

        this.querySelector("#hideShow").innerHTML = "Show Trajectories";

        // Switch visbility 
        show(eyesSVG);
        hide(eyesSlashSVG);
    } else {
        sceneManager.showTrajectories();

        this.querySelector("#hideShow").innerHTML = "Hide Trajectories";

        // Switch visbility 
        hide(eyesSVG);
        show(eyesSlashSVG);
    } 
}

function show(icon) {
    icon.classList.remove("hidden");
    icon.classList.add("visible");
}

function hide(icon) {
    icon.classList.remove("visible");
    icon.classList.add("hidden");
}

function moveCameraToTopView(e) {
    let inclinations = [data.planets.gj876b.i, data.planets.gj876c.i, data.planets.gj876d.i, data.planets.gj876e.i];

    let i = (inclinations.reduce((acc, value) => acc + value)) / inclinations.length; // Mean inclination
    let distance = 1;

    sceneManager.travelController.setTravelPath(sceneManager.camera, i, distance);
}

function reset() {
    sceneManager.resetScene();
}

function toggleMenuAnimation(e) {
    const menuContentNode = this.nextElementSibling;
    if (menuContentNode.classList.contains('show-menu-content')) {
        menuContentNode.classList.remove('show-menu-content');
        this.classList.remove('active');    
    } else {
        if (document.querySelectorAll('.show-menu-content').length != 0) {
            document.querySelectorAll('.show-menu-content')[0].classList.remove('show-menu-content');
            document.querySelectorAll('.active')[0].classList.remove('active');
        }
        menuContentNode.classList.add('show-menu-content');
        this.classList.add('active');
    }
}

function limitSelectedCheckboxes(e) {
    const limit = 2;
    const linkLineCheckboxes = document.querySelectorAll('#linkLine-checkboxes input:checked');
    if (linkLineCheckboxes.length > limit) {
        this.checked = false;
    }
}

function setAnimationSpeed(speed) {
    sceneManager.setAnimationSpeed(speed);
}

function validateInputLinkLines() {
    const checkedBoxes = document.querySelectorAll('#linkLine-checkboxes input:checked');
    const drawButton = document.querySelector("#drawLinkLinesButton");
    if (checkedBoxes.length == 2) {
        drawButton.classList.remove("grayed-out");
    } else if (!drawButton.classList.contains("grayed-out")) {
        drawButton.classList.add("grayed-out");
    }
}

function drawLinkLines(e) {
    const checkedBoxes = document.querySelectorAll('#linkLine-checkboxes input:checked');
    if (checkedBoxes.length == 2) {
        moveCameraToTopView();
        sceneManager.resetScene();
        sceneManager.hideTrajectories();

        document.querySelector("#hideShow").innerHTML = "Show Trajectories";
        const eyesSlashSVG = document.querySelector("#eyes-slash-icon");
        hide(eyesSlashSVG);
        const eyesSVG = document.querySelector("#eyes-icon");
        show(eyesSVG);

        const checkboxes = document.querySelectorAll('#linkLine-checkboxes input');
        let checkedPlanets = [];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                // Get associated planet of checked box
                switch (checkboxes[i].id) {
                    case "ll-b":
                        checkedPlanets.push("gj876b");
                        break;
                    case "ll-c":
                        checkedPlanets.push("gj876c");
                        break;
                    case "ll-d":
                        checkedPlanets.push("gj876d");
                        break;
                    case "ll-e":
                        checkedPlanets.push("gj876e");
                        break;
                    default:
                        break;
                }
            }
        }
        sceneManager.linkLinesController.prepareDrawing(checkedPlanets);    
    }
}
