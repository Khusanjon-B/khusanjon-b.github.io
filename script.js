// ==================== TERMINAL STATE ====================

let currentInput = "";
let commandHistory = [];
let historyIndex = -1;

const inputElement   = document.getElementById("terminal-input");
const outputElement  = document.getElementById("output");
const scrollArea     = document.getElementById("scrollArea");
let smallScreenWarned = false;


// ==================== COMMAND DEFINITIONS ====================

const commands = {
    help:       "learn what you can do",
    about:      "learn about me",
    projects:   "see my projects",
    "projects -v":   "see my projects with more details",
    activities: "see what I am up to",
    research:   "see my research",
    courses:    "see my relevant coursework",
    skills:     "see my skill breakdown",
    contact:    "contact me",
    clear:      "clear terminal",
    version:    "am I up to date?",
    cat:        "output file to terminal",
    ls:         "list files"
};

const commandHandlers = {
    help: handleHelp,
    about: handleAbout,
    projects: handleProjects,
    activities: handleActivities,
    research: handleResearch,
    courses:handleCourses,
    contact: handleContact,
    clear: handleClear,
    version: handleVersion,
    skills: handleSkills,
    ls: handlels,
    "cat about.txt": handleAbout,
    "cat projects.txt": handleProjects,
    "cat activities.txt": handleActivities,
    "cat research.txt": handleResearch,
    "cat contact.txt": handleContact,
    "cat version.txt": handleVersion,
    "projects -v": handleProjectsVerbose
};


// ==================== SKILL LISTS ====================

const skillsProf = [
    "C++ (OOP, templates, STL)",
    "Python (PyTorch, NumPy)",
    "Arduino/C",
    "ESP32 development",
    "HTML/CSS/JavaScript",
    "SolidWorks/Onshape",
    "LTspice",
    "3D printing",
    "Numerical simulations",
    "Analog/digital electronics",
    "Sensor integration (I2C/PWM)",
    "Git/GitHub",
    "Machine learning workflows",
    "Model deployment (GUI + PyTorch)",
    "Stepper/servo motor control"
];

const skillsInter = [
    "Bash scripting",
    "PlatformIO",
    "CMake/MinGW toolchains",
    "ROOT & NanoAOD analysis",
    "Inverse kinematics",
    "Circuit design & soldering",
    "Data structures and algorithms"
];

const skillsFam = [
    "SQL",
    "MATLAB",
    "WiFi networking on ESP32",
    "CMSSW/Coffea"
];


// ==================== WELCOME MESSAGES ====================

const welcomeMessages = [
    `I am <strong id="myName" style="font-size:20px"><a href="https://khusanjon-b.github.io/PortfolioWebsiteV1/">Khusanjon Bobokhojaev</a></strong>, this is my portfolio website`,
    `Type 'help' to begin.`,
    `_________________________________________________`,
    ``
];

function loadWelcome() {
    welcomeMessages.forEach(line => {
        const p = document.createElement("p");
        p.innerHTML = line;
        outputElement.appendChild(p);
    });

    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
}

loadWelcome();
checkScreenSizeWarning();


// ==================== CLICKABLE NAME ====================

document.addEventListener("DOMContentLoaded", () => {
    const nameElem = document.getElementById("myName");
    if (nameElem) {
        nameElem.addEventListener("click", () => {
            window.open("https://khusanjon-b.github.io/PortfolioWebsiteV1/", "_blank");
        });
    }
});

function checkScreenSizeWarning() {
    const width = window.innerWidth;

    if (width < 700 && !smallScreenWarned) {
        appendOutput("\n⚠️  Warning: Your screen is small — the terminal layout may look distorted.", 1);
        smallScreenWarned = true;
    }
}


// ==================== INPUT HANDLING ====================
let lastTabInput = "";
document.addEventListener("keydown", (event) => {
    const key = event.key;
        // TAB Autocomplete
    // TAB Autocomplete
    if (key === "Tab") {
        event.preventDefault();

        const partial = currentInput.trim();
        const allCmds = Object.keys(commands);

        // if user changed input after last tab → allow showing again
        const isSameAsLastTab = (partial === lastTabInput);

        // find matches
        const matches = allCmds.filter(cmd => cmd.startsWith(partial));

        // 1: autocomplete if exactly one
        if (matches.length === 1) {
            currentInput = matches[0];
            inputElement.textContent = currentInput;
            lastTabInput = currentInput;  
        }
        // 2: multiple matches → only show ONCE per input change
        else if (matches.length > 1) {

            const inputChangedSinceLastTab = (partial !== lastTabInput);

            // Special case: empty input → always show once
            if (partial === "" && !tabSuggestionsShown) {
                appendOutput("\nAvailable commands:");
                matches.forEach(m => appendOutput("  • " + m));
                tabSuggestionsShown = true;
                lastTabInput = partial;
                return;
            }

            // Normal autocomplete suggestion logic
            if (!tabSuggestionsShown || inputChangedSinceLastTab) {
                appendOutput("\nPossible commands:");
                matches.forEach(m => appendOutput("  • " + m));
                tabSuggestionsShown = true;
                lastTabInput = partial;
            }
        }


        return;
    }



    // Normal character input
    if (key.length === 1) {
        currentInput += key;
        inputElement.textContent = currentInput;
        lastTabInput = "";
    }

    // Backspace
    if (key === "Backspace") {
        currentInput = currentInput.slice(0, -1);
        inputElement.textContent = currentInput;
        lastTabInput = "";
    }

    // Enter (execute command)
    if (key === "Enter") {
        appendCommand(currentInput);

        const cmd = currentInput.trim().toLowerCase();

        if (commandHandlers[cmd]) {
            commandHandlers[cmd]();
        } else if (cmd === ""){
            
        }else {
            appendOutput(`Unknown command: ${cmd}`, 1);
            appendOutput(`Type 'help' to get list of commands.`);
        }

        commandHistory.push(currentInput);
        historyIndex = commandHistory.length;

        currentInput = "";
        inputElement.textContent = "";
        lastTabInput = "";
    }

    // ArrowUp (previous command)
    if (key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            currentInput = commandHistory[historyIndex];
            inputElement.textContent = currentInput;
        }
    }

    // ArrowDown (next command)
    if (key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            currentInput = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            currentInput = "";
        }
        inputElement.textContent = currentInput;
    }
});


// ==================== OUTPUT HELPERS ====================

function appendCommand(text) {
    const line = document.createElement("p");
    line.textContent = "khusanjon@portfolio:~$ " + text;
    outputElement.appendChild(line);

    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
}

function appendOutput(text, err = 0) {
    const line = document.createElement("p");

    if (err === 1) line.style.color = "red";
    if (err === 2) line.style.color = "#10a5b5";

    line.textContent = text;
    outputElement.appendChild(line);

    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
}

function appendHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    outputElement.appendChild(div);

    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
}


// ==================== FORMATTING HELPERS ====================

function appendHeader(title) {
    appendOutput("\n" + title);
    appendOutput("-".repeat(title.length));
}

function appendSkillList(arr) {
    arr.forEach(skill => appendOutput("  • " + skill));
}


// ==================== COMMAND HANDLERS ====================

function handleHelp() {
    appendOutput("\nAvailable commands:\n");

    for (let cmd in commands) {
        const spacing = cmd.padEnd(12, " ");
        appendOutput(`  ${spacing} ${commands[cmd]}`, 2);
    }

    appendOutput("");
}

function handlels() {
    appendOutput("about.txt projects.txt activities.txt research.txt", 2);
    appendOutput("skills.txt contact.txt version.txt", 2);
}

function handleSkills() {
    appendHeader("Proficient");
    appendSkillList(skillsProf);

    appendHeader("\nIntermediate");
    appendSkillList(skillsInter);

    appendHeader("\nFamiliar");
    appendSkillList(skillsFam);

    appendOutput("\n");
}

function handleAbout() {
    const aboutText = `
Name:            Khusanjon Bobokhojaev

School:          California Lutheran University

Year:            Junior

Field:           Double Major in Computer Science & Physics (Math Minor)

Who?:            Developer, researcher, engineer with a passion for building things that blend hardware, code, and curiosity.

Status:          Uzbek Muslim.
`;

    appendHTML(`
        <div class="about-header">
            <pre class="about-text">${aboutText}</pre>
            <img src="images/me.jpg" class="profilePic">
        </div>
    `);
    appendHTML("<iframe src='https://tryhackme.com/api/v2/badges/public-profile?userPublicId=6498859' style='border:none; width: 100%'></iframe>")

}

function handleProjects() {
    appendHTML("<strong>Projects:</strong>\n\n");
    appendHTML(" - <strong>Personal Website V2 and V1</strong> - <em>Nov 2025</em>\n\n");

    appendHTML(" - <strong>Newtonian Gravitation Simulation</strong> - <em>Aug 2025</em>\n\n");

    appendHTML(" - <strong>SCARA Dual Linkage Arm (Not Complete)</strong> - <em>Jul-Aug 2025</em> \n\n");

    appendHTML(" - <strong>Blynk IoT Remote Garage Door Opener</strong> - <em>Jul 2025</em>\n\n");

    appendHTML(" - <strong>MNIST Handwritten Digit Recognition</strong> - <em>Jul 2025</em>\n\n");

    appendHTML(" - <strong>OLED Sensor Display System</strong> - <em>Jun 2025</em>\n\n");

    appendHTML(" - <strong>Dual-Mode Distance Measuring Device</strong> - <em>Dec 2024</em>\n\n");

    appendHTML(" - <strong>Analog Musical Keyboard (Electronic Piano)</strong> - <em>Nov-Dec 2024</em>\n\n");

    appendHTML(" - <strong>Terms of Service Chrome Extension - Startup Weekend Project</strong> - <em>Oct 2024</em>\n\n");

    appendOutput(" - For more details do 'projects -v'")

}

function handleProjectsVerbose() {
    appendHTML("<strong>Projects:</strong>\n\n");
    appendHTML(" - <strong>Personal Website V2 and V1</strong> - <em>Nov 2025</em>\n\n");
        
        appendHTML("<li style='margin-left: 5%;'>Designed and developed a personal website using HTML, CSS, and JavaScript to showcase academic projects, research, and technical skills</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Created responsive and user-friendly pages, highlighting project descriptions, images, and links</li>\n")

    appendHTML(" - <strong>Newtonian Gravitation Simulation</strong> - <em>Aug 2025</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Developed an interactive simulation of Newtonian gravitation using C++ and Raylib, modeling the motion of celestial bodies under mutual gravitational forces</li>\n");
        appendHTML("<li style='margin-left: 5%;'>Implemented numerical integration techniques to update positions and velocities of bodies in real time</li>\n");
        appendHTML("<li style='margin-left: 5%;'>Enabled users to visualize orbital dynamics and experiment with initial conditions to explore gravitational interactions</li>\n")

    appendHTML(" - <strong>SCARA Dual Linkage Arm (Not Complete)</strong> - <em>Jul-Aug 2025</em> \n\n");

        appendHTML("<li style='margin-left: 5%;'>-- IN PROGRESS - CONTACT ME FOR MORE DETAILS--</li>\n")

    appendHTML(" - <strong>Blynk IoT Remote Garage Door Opener</strong> - <em>Jul 2025</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Designed and implemented a remote-controlled garage door system using ESP32 and Blynk IoT, enabling real-time control and status monitoring via smartphone</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Programmed microcontroller to interface with garage door button and sensors, ensuring reliable and secure operation</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Developed a user-friendly system with integrated feedback for enhanced safety and usability</li>\n")

    appendHTML(" - <strong>MNIST Handwritten Digit Recognition</strong> - <em>Jul 2025</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Built a Convolutional Neural Network (CNN) using PyTorch to classify handwritten digits from the MNIST dataset with high accuracy</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Deployed the trained model into a Python Pygame interface, enabling users to draw digits and see real-time predictions</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Added functionality to allow user-generated training data, allowing the model to learn from new handwritten digits</li>\n")

    appendHTML(" - <strong>OLED Sensor Display System</strong> - <em>Jun 2025</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Developed a real-time environmental and volume monitoring system using Arduino, SSD1306 OLED display, DHT11 sensor, and potentiometer</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Programmed the system to display date, time, temperature, humidity, and volume level in a compact, user-friendly interface</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Designed and iterated both hardware layout and software logic to optimize responsiveness and usability</li>\n")

    appendHTML(" - <strong>Dual-Mode Distance Measuring Device</strong> - <em>Dec 2024</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Built a distance measuring system using Arduino, an ultrasonic sensor, and a VL53L0X time-of-flight laser sensor, with readings displayed on an LCD screene</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Implemented switchable modes to toggle between the two sensors for flexible distance measurement</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Designed both hardware setup and software logic to ensure accurate, real-time measurements</li>\n")

    appendHTML(" - <strong>Analog Musical Keyboard (Electronic Piano)</strong> - <em>Nov-Dec 2024</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Designed and built a 5-key, 3-voice polyphonic analog keyboard using ICs, MOSFETs, logic gates, 555 timers, LF411 amplifiers, resistors, and capacitors</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Developed a logic system to detect multiple key presses and route signals to three oscillators for polyphonic sound output</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Simulated and tested the circuit using LTspice before hardware implementation, ensuring accurate tone generation and correct logic operation</li>\n")

    appendHTML(" - <strong>Terms of Service Chrome Extension - Startup Weekend Project</strong> - <em>Oct 2024</em>\n\n");

        appendHTML("<li style='margin-left: 5%;'>Designed and implemented a Chrome extension that scans Terms of Service (ToS) documents and automatically flags potentially concerning or uncommon clauses for users</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Collaborated with a multidisciplinary team to integrate NLP-based keyword detection and highlight terms related to data usage, third-party sharing, and arbitration</li>\n")
        appendHTML("<li style='margin-left: 5%;'>Led the front-end integration and user interface design to display flagged text directly within the browser</li>\n")

}

function handleActivities() {
    appendOutput("\nActivities:\n\n");
    appendOutput(" - Recently presented at Southern California Conferences for Undergraduate Research (SCCUR)\n\n");
    appendOutput(" - Recently participated in SoCal ICPC - working on getting better through practice on CodeForces\n\n");
    appendHTML(`   - My solutions can be found in my Github: <a href="https://github.com/Khusanjon-B">github.com/Khusanjon-B</a>\n\n`);
    appendOutput(" - Working on Double Link SCARA Arm Robot\n\n");
    appendOutput(" - Physics Club VP\n\n");
    appendOutput(" - Math Club VP\n\n")
    appendOutput(" - Society of Physics Students (SPS) Member\n\n")
    appendOutput(" - Sigma Pi Sigma Honors Society\n\n")
    appendOutput("Jobs:\n\n");
    appendOutput(" - Physics Department Assistant - California Lutheran University\n\n");
    appendOutput(" - Math Center Tutor - California Lutheran University\n\n");
    appendOutput(" - Assistant Center Director - Mathnasium - Thousand Oaks, CA\n\n");
    appendHTML(" - Click here for my resume --> <strong><a href='https://khusanjon-b.github.io/PortfolioWebsiteV1/resume.html'>RESUME</a></strong>");
}

function handleResearch() {
    appendOutput("\nResearch:");
    appendOutput(" - I conduct research on supersymmetric top quark partner (stop) searches using CMS Run 2 data, specializing in dilepton final states (ee, μμ, eμ). I migrated legacy FWLite/MiniAOD workflows to NanoAOD + Coffea + Dask, implemented full event-selection pipelines, and performed systematic studies including JEC/MET corrections and b-tagging scale factors. I also developed BDT-based classifiers with ROOT/PyROOT to enhance SUSY signal discrimination and contributed to a displaced-stop study using CMSSW. My work has been presented at the CLU Undergraduate Research Symposium 2024/2025 and SCCUR 2025.\n\n");
}
function handleCourses() {
    appendOutput("\nRelevant Coursework:\n");
        appendHTML("<strong>Computer Science & Software Engineering</strong>\n\n");
        appendHTML(" - Advanced Computer Programming with Python (CSC225) - <em>completed</em>\n\n");
        appendHTML(" - Object-Oriented Design & Analysis (CSC315) - <em>completed</em>");
        appendHTML(" - Competition Problem Solving (CSC435) - <em>completed</em>\n\n");
        appendHTML(" - Data Communications & Networks (CSC350) - <em>in progress</em>");
        appendHTML(" - Database Management Systems (CSC410) - <em>in progress</em>\n\n");
    
    appendHTML("<strong>Physics & Engineering</strong>\n\n");
        appendHTML(" - Statistical Physics & Thermodynamics (PHYS315) - <em>completed</em>");
        appendHTML(" - Geometrical and Physical Optics (PHYS425) - <em>completed</em>");
        appendHTML(" - Applied Electronics (PHYS309) - <em>completed</em>");
        appendHTML(" - 3D Engineering Design (PHYS2ST) - <em>completed</em>\n\n");
        appendHTML(" - Modern Physics (PHYS303) - <em>completed</em>");
        appendHTML(" - Classical Mechanics (PHYS410) - <em>completed</em>\n\n");
        appendHTML(" - Quantum Physics (PHYS430) - <em>in progress</em>");
        appendHTML(" - Advanced Experimental Physics (PHYS340) - <em>in progress</em>");
        appendHTML(" - Physical Modeling with MATLAB (PHYS310) - <em>in progress</em>\n\n");

    appendHTML("<strong>Math & Data Science</strong>\n");
        appendHTML(" - Discrete Mathematics (MATH241) - <em>completed</em>");
        appendHTML(" - Calculus I, II, III (MATH251, MATH252, M25C) - <em>completed</em>");
        appendHTML(" - Differential Equations (MATH265) - <em>completed</em>");
        appendHTML(" - Machine Learning (DATA440) - <em>completed</em>");
}

function handleContact() {
    appendOutput("\nContact:");
    appendOutput("- Phone:    818 921 2163");
    appendHTML(`- Email:    <a href="mailto:kbobokhojaev@callutheran.edu">kbobokhojaev@callutheran.edu</a>`);
    appendHTML(`- LinkedIn: <a href="https://www.linkedin.com/in/khusanjon-bo/" target="_blank">linkedin.com/in/khusanjon-bo</a>`);

}

function handleClear() {
    outputElement.innerHTML = "";
    loadWelcome();
}

function handleVersion() {
    appendHTML("<strong>Current == Terminal Portfolio v1.2 — last updated 11.23.2025</strong>");
    appendOutput("Terminal Portfolio v1.1 — last updated 11.23.2025");
    appendOutput("Terminal Portfolio v1.0 — last updated 11.22.2025");
}

window.addEventListener("resize", () => {
    checkScreenSizeWarning();
});