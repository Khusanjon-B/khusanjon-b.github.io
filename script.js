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
    activities: "see what I am up to",
    research:   "see my research",
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
    "cat version.txt": handleVersion
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
    `I am <strong id="myName" style="font-size:20px">Khusanjon Bobokhojaev</strong>, this is my portfolio website`,
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
        } else {
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

}

function handleProjects() {
    appendOutput("Projects: (Coming Soon)");
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
    appendOutput("Jobs:\n\n");
    appendOutput(" - Physics Department Assistant - California Lutheran University\n\n");
    appendOutput(" - Math Center Tutor - California Lutheran University\n\n");
    appendOutput(" - Assistant Center Director - Mathnasium - Thousand Oaks, CA\n\n");
}

function handleResearch() {
    appendOutput("\nResearch:");
    appendOutput(" - I conduct research on supersymmetric top quark partner (stop) searches using CMS Run 2 data, specializing in dilepton final states (ee, μμ, eμ). I migrated legacy FWLite/MiniAOD workflows to NanoAOD + Coffea + Dask, implemented full event-selection pipelines, and performed systematic studies including JEC/MET corrections and b-tagging scale factors. I also developed BDT-based classifiers with ROOT/PyROOT to enhance SUSY signal discrimination and contributed to a displaced-stop study using CMSSW. My work has been presented at the CLU Undergraduate Research Symposium 2024/2025 and SCCUR 2025.\n\n")
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
    appendOutput("Terminal Portfolio v1.0 — last updated 11.22.2025");
}

window.addEventListener("resize", () => {
    checkScreenSizeWarning();
});