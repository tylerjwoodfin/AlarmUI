/* Read Files */
function readFile(file)
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
    
    return result;
}

/* Greeting */
function getGreeting()
{
    greetings = readFile('assets/greetings.txt').split("<br>");
    selectedGreeting = Math.floor(Math.random() * Math.floor(greetings.length));

    document.getElementById("greeting").innerText = greetings[selectedGreeting];
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
    scan = readFile('secure/scan.txt');
    numberOfDevices = 0;

    if(scan.includes("addresses ("))
    {
        numberOfDevices = scan.split("addresses (")[1].split(" hosts")[0];
    }

    document.getElementById("deviceCount").innerHTML = `<em class="fa fa-cloud" aria-hidden="true"></em>` + numberOfDevices +` devices online`;
}

/* Dropbox */
function dropbox()
{
    // Get File
    $.ajax({
        url: 'dropbox.php',
        type: 'get',
        async: false,
        success: function(response) {
            alert(readFile('secure/Tasks.txt'));
         }
    });

}

/* Execute */
$( document ).ready(function() {
    getGreeting();
    // updateWeather();
    getDevicesCount();
    dropbox();

    // set update intervals
    // setInterval('updateWeather()', 300000); // update every 5 minutes
    setInterval('formatAMPM(new Date)', 1000);
    setInterval('getDevicesCount()', 60000);
    setInterval('getGreeting()', 600000);
});
