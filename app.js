var fs = require("fs");
const { shell } = require("electron");
var executables;

const RESULTS_LIST = document.getElementById("results_list");
const SEARCH_INPUT = document.getElementById("search_input");
// Add directories to this list to index more folders
const FILE_PATHS = [
  "C:/Users/maddo/AppData/Roaming/Microsoft/Windows/Start Menu/"
];

$(document).ready(function() {
  /* Consume the event if the up and down arrow keys are pressed */
  $(document).on("keydown keyup", "#search_input", function(event) {
    if (event.which == 38 || event.which == 40) {
      event.preventDefault();
    }
  });
});

function searchInputEdit(target, e) {
  /* Event handler when the search input is edited
   * target: The element that called the function
   * e: The event object passed from the element */
  if (target.value === "") {
    // If the search field is blank remove any results
    remove_children(RESULTS_LIST);
  } else if (e.code === "Enter") {
    launch_selected();
  } else if (e.code === "ArrowUp") {
    moveUpResultsList();
  } else if (e.code === "ArrowDown") {
    moveDownResultsList();
  } else {
    // Prepare and display results
    remove_children(RESULTS_LIST);
    results = getResults(target.value);
    displayResults(results);
  }
}

document.onvisibilitychange = function() {
  /* When the search is made visible
   * Search input is reset and files are scanned */
  SEARCH_INPUT.value = "";
  scanFilePaths();
};

function displayResults(results) {
  /* Creates the elements and displays the results
   * results: A list of [name, path] pairs to display  */
  for (i = 0; i < Math.min(4, results.length); i++) {
    path = results[i][1];
    result = results[i][0];

    // Create result container
    var container = document.createElement("a");
    container.setAttribute("path", path);
    container.classList = "list-group-item list-group-item-action d-flex";

    // Make the first result hightlighted
    if (i == 0) {
      container.classList.add("active");
    }

    // Add the result name as innerText
    var resultText = document.createElement("h5");
    resultText.innerText = result;

    RESULTS_LIST.appendChild(container);
    container.appendChild(resultText);
  }
}

function moveUpResultsList() {
  /* Moves the selection up one on the results */
  var nodes = RESULTS_LIST.childNodes;
  for (i = 0; i < nodes.length; i++) {
    // Don't move the selection if it's already at the top
    if (
      nodes[i].classList.contains("active") &&
      nodes[i] !== RESULTS_LIST.firstChild
    ) {
      // Move the active class down one
      nodes[i].classList.remove("active");
      nodes[i - 1].classList.add("active");
      return;
    }
  }
}

function moveDownResultsList() {
  /* Moves the selection down one on the results */
  var nodes = RESULTS_LIST.childNodes;
  for (i = 0; i < nodes.length; i++) {
    // Don't move the selection if it's already at the bottom
    if (
      nodes[i].classList.contains("active") &&
      nodes[i] !== RESULTS_LIST.lastChild
    ) {
      // Move the active class up one
      nodes[i].classList.remove("active");
      nodes[i + 1].classList.add("active");
      return;
    }
  }
}

function launch_selected() {
  /* Launches the selected program in results */
  // Get the selected element
  selected = document.getElementsByClassName("active")[0];
  shell.openItem(selected.getAttribute("path"));

  // Reset the search
  remove_children(results_list);
  SEARCH_INPUT.value = "";
}

function getResults(search) {
  /* Gets matching results using given search from executables
   * search: The search term to use */
  var results = [];
  // Get a list of file names by stripping the path and the file extension
  var fileNames = executables.map(path =>
    path
      .split("/")
      .slice(-1)[0]
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
  );

  // Populate results array
  for (i = 0; i < fileNames.length; i++) {
    paths = executables.filter(x => x.includes(search));
    if (fileNames[i].includes(search)) {
      // Add both the file name and the path to the results
      results.push([fileNames[i], executables[i]]);
    }
  }
  return results;
}

function getFiles(path) {
  /* Recursively gets all files in a directory and sub directories */
  var allFiles = [];
  var files = fs.readdirSync(path);

  files.forEach(function(file) {
    file = path + "/" + file;
    var stats = fs.statSync(file);
    // Add files to allFiles and recurse through the directories
    if (stats.isDirectory()) {
      allFiles = allFiles.concat(getFiles(file));
    } else {
      allFiles.push(file);
    }
  });

  return allFiles;
}

function scanFilePaths() {
  /* Finds all executable files in filepaths */
  executables = [];
  FILE_PATHS.forEach(function(filePath) {
    executables = executables.concat(getFiles(filePath));
  });
}

function remove_children(ele) {
  /* Remove all child elements from a passed element
   * ele: The element to remove all children from */
  while (ele.firstChild) {
    ele.removeChild(ele.firstChild);
  }
}
