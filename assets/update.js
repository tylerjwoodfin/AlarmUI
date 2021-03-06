var isGreetingMode = false;

/* Read Files */
function readFile(file, keepComments)
{
    var result = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText.replace(/\n/g, "<br>");
                result = allText;
            }
            else
            {
                result = "404";
            }
        }
    }
    rawFile.send(null);

    if((/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(file))
    {
        return `<a href="` + file + `" target="_new"><img src="` + file + `" class="blogImg"></a>`;
    }

    /* Parse variables */
    hours = new Date().getHours();
    timeOfDay = hours < 12 ? "morning" : hours < 18 ? "afternoon" : "evening"; 
    
    result = result.replace(/%time/g, timeOfDay);

    /* Remove comments */
    result = result.split("<br>");
    finalResult = "";

    for(i in result)
    {
        if((keepComments || result[i][0] != "#") && result[i] != '\r')
        {
            finalResult += result[i] + "<br>";
        }
    }

    while(finalResult.endsWith("<br>"))
    {
        finalResult = finalResult.slice(0,-4);
    }
    
    return finalResult;
}

/* Headline */
function getHeadline()
{
    headlines = readFile('assets/headlines.txt').split("<br>");
    selectedHeadline = Math.floor(Math.random() * Math.floor(headlines.length));

    document.getElementById("headline").innerText = headlines[selectedHeadline];

    // pre-load greeting
    greeting = readFile('secure/Greeting').split("<br>");
    greetingHeader = "";
    greetingSubHeader = "";

    for(i in greeting)
    {
        if(greetingHeader.length == 0)
        {
            greetingHeader = greeting[i];
        }
        else if(greetingSubHeader.length == 0)
        {
            greetingSubHeader = greeting[i];
        }
    }

    document.getElementById("greeting").innerText = greetingHeader;
    document.getElementById("greetingSub").innerText = greetingSubHeader;
}

/* Weather */
zipCode = readFile('secure/ZipCode');
apiKey = readFile('secure/WeatherAPI');
const updateWeather = async () => {

    // if you live outside the US, replace "zip=" in the line below with something else, then edit 
    // secure/ZipCode with the parameter you chose. See https://openweathermap.org/current for details.

    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?zip=' + zipCode + '&appid=' + apiKey);
    
    const weather = await response.json(); //extract JSON from the http response

    // get temperature
    if(!(typeof weather === 'undefined'))
    {
        temperature = Math.round((weather.main.temp - 273.15) * 9/5 + 32);
    
        // set temperature element
        document.getElementById("temperature").innerHTML = temperature + "°";
        document.getElementById("location").innerHTML = weather.name;
        document.getElementById("weatherIcon").src = "assets/weather/" + weather.weather[0].icon + ".svg";
    }
}

/* Clock */
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    strTime = hours + ':' + minutes + ' ' + ampm;
    document.getElementById("clock").innerHTML = `<em class="fa fa-clock-o"></em>` + strTime;
}

/* Get # of devices online */
function getDevicesCount()
{
    scan = readFile('secure/scan.txt', true);
    numberOfDevices = -1;

    if(scan.includes("addresses ("))
    {
        numberOfDevices = scan.split("addresses (")[1].split(" hosts")[0];
    }

    document.getElementById("deviceCount").innerHTML = `<em class="fa fa-cloud" aria-hidden="true"></em>` + numberOfDevices +` devices online`;
}

/* Get files from Dropbox */
function getDropboxFile(fileType)
{
    fileContents = "";

    $.ajax({
        url: 'assets/getDropbox.php?path=' + fileType,
        type: 'get',
        async: false,
        success: function(response) {
            filePointer = readFile('secure/' + fileType);   
            
            // filePointer == the contents of /var/www/html/secure/{fileType}. The contents should be the path on Dropbox to the file.
            // For example, filePointer = "TasksFile" -> /var/www/html/secureTasksFile contains "Notes/ToDo.txt", meaning Dropbox/Notes/Todo.txt

            fileContents = readFile('secure/cache/' + filePointer.split("/")[filePointer.split("/").length-1], true);

            fileContents = fileContents == "404" ? "I can't open " + fileType + ". Please set up Rclone and make sure /var/www/html/secure/" + fileType + " exists and points to " 
            + "your corresponding Dropbox file. See README.md for details." : fileContents;
         }
    });

    showChecklist(fileContents.split("<br>"));

}

/* Turn Raspberry Pi screen off */
function powerOff()
{
    $.ajax({
        url: 'assets/screenOff.php',
        type: 'get',
        async: false,
        success: function(response) {
            // ok
         }
    });

}

/* Show an array as a checklist */
function showChecklist(lineArray)
{
    console.log(lineArray);
}

/* Toggle Greeting Mode */
function toggleGreetingMode()
{
    isGreetingMode = !isGreetingMode;

    if(isGreetingMode)
    {
        document.getElementById("menuItems").style.display = "none";
        document.getElementById("hamburger").style.display = "none";
        document.getElementById("greeting").style.display = "";
        document.getElementById("greetingSub").style.display = "";
    }
    else
    {
        document.getElementById("menuItems").style.display = "";
        document.getElementById("greeting").style.display = "none";
        document.getElementById("greetingSub").style.display = "none";
        document.getElementById("hamburger").style.display = "";
    }
}

/* Execute */
$( document ).ready(function() {
    getHeadline();
    // updateWeather();
    getDevicesCount();

    // set update intervals
    // setInterval('updateWeather()', 300000); // update every 5 minutes
    setInterval('formatAMPM(new Date)', 1000);
    setInterval('getDevicesCount()', 60000);
    setInterval('getHeadline()', 600000);
});
