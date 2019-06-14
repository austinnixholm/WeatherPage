<!-- Created by: Austin Nixholm  -->

const API_KEY = ""; // your API key goes here

/**
 * Executes when all elements in the document have successfully loaded.
 */
$(document).ready(function () {
    // Reset weather data elements for a cleaner
    resetWeatherElements();
    $('#submit').on('click', function () {
        execute();
    });
    $('#zipCode').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $('#submit').click();//Trigger button click event
        }
    });
});

/**
 * Executes the main ajax calls to retrieve weather data, based on the zipcode and unit of measurement
 * @returns {boolean}
 */
function execute() {
    // Hide weather elements until we successfully retrieve weather data for the zip
    if (!$('#currentConditions').is(':hidden'))
        $('#currentConditions').hide();
    if (!$('#fiveDayForecast').is(':hidden'))
        $('#fiveDayForecast').hide();

    // Validate the length of the inputted zipcode
    var zip = $('#zipCode').val();
    if (zip.length != 5) {
        $('#error').html("Zip code must be 5 characters long.")
        $('#error').show();
        return false;
    }
    // If the zip code is valid, hide our errors and retrieve the data
    $('#error').hide();
    // Retrieve current weather data for the zip, and alter elements
    $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/weather?zip=' + zip + ',us&APPID=' + API_KEY,
        success: function (currentWeatherData) {
            // Determine if the unit measurement selected is imperial
            var imperial = $('#unitSelection').val().toLowerCase() === 'imperial';
            // Retrieve data for zipcode from the API
            var city = currentWeatherData.name;
            var description = currentWeatherData.weather[0].description;
            var iconSource = 'http://openweathermap.org/img/w/' + currentWeatherData.weather[0].icon + '.png';

            // Get the kelvin temperature from weather data in API
            var kelvinTemperature = currentWeatherData.main.temp;
            // Convert kelvin temperature to the selected unit of measurement
            var temperature = imperial ? convertToFahrenheit(kelvinTemperature) + 'ºF' : convertToCelsius(kelvinTemperature) + 'ºC';
            // Format wind speed to a value with two decimal points. If metric, convert value to km/h
            var windSpeed = imperial ? currentWeatherData.wind.speed.toFixed(2) : mphToKmh(currentWeatherData.wind.speed);
            var humidity = currentWeatherData.main.humidity;

            // Set data for the elements.
            $('#currentCondition-title').text('Current Conditions in ' + city);
            $('#currentCondition-icon').attr('src', iconSource);
            $('#currentCondition-description').text(uppercaseFirstLetter(description));
            $('#currentCondition-temperature').text('Temperature: ' + temperature);
            $('#currentCondition-humidity').text('Humidity: ' + humidity + '%');
            $('#currentCondition-wind').text('Wind: ' + windSpeed + (imperial ? 'mph' : 'kmh'))
        },
        error: function () {
        }
    });
    //Retrieve the five day forecast weather data for the zip, and alter elements
    $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast?zip=' + zip + ',us&APPID=' + API_KEY,
        success: function (forecastData) {
            var lastDateFound = "";
            var daysCount = 1;
            var imperial = $('#unitSelection').val().toLowerCase() === 'imperial';

            // Forecast data list length is naturally 40, and we need 5 values. Separate dates are identified every 8 indexes.
            for (var i = 0; i < forecastData.list.length; i += 8) {
                // Get the date for this index of the forecast data
                var date = new Date(forecastData.list[i].dt_txt.substring(0, 10));
                // Is this date a duplicate? if so, skip it
                if (lastDateFound === date.toDateString()) continue;
                // Have we already set values for all 5 days? if so, break this loop
                if (daysCount > 5) break;

                // Determine element data based on the forecast data & unit of measurement selected
                var iconSource = 'http://openweathermap.org/img/w/' + forecastData.list[i].weather[0].icon + '.png';
                var high = imperial ? convertToFahrenheit(forecastData.list[i].main.temp_max) : convertToCelsius(forecastData.list[i].main.temp_max);
                var low = imperial ? convertToFahrenheit(forecastData.list[i].main.temp_min) : convertToCelsius(forecastData.list[i].main.temp_min);
                var description = forecastData.list[i].weather[0].description;
                lastDateFound = date.toDateString();

                // Set each forecast day element with the new data
                $('#date-d' + daysCount).text(lastDateFound);
                $('#img-d' + daysCount).attr('src', iconSource);
                $('#desc-d' + daysCount).text(uppercaseFirstLetter(description));
                $('#highLow-d' + daysCount).text('H ' + high + ' L ' + low);

                daysCount++;
            }
            // Finally, show the hidden weather data elements.
            $('#currentConditions').show();
            $('#fiveDayForecast').show();
        },
        error: function () {
            $('#error').html("Error: Couldn't find forecast data for zipcode.")
            $('#error').show();
        }
    });
}

/**
 * Resets text data from elements intended to load from weather data.
 */
function resetWeatherElements() {
    $('#currentCondition-title').text('');
    for (var i = 1; i <= 5; i++) {
        $('#date-d' + i).text('');
        $('#desc-d' + i).text('');
        $('#highLow-d' + i).text('');
    }
}

/**
 * Sets the first letter of a string to be uppercase.
 *
 * @param string the string to alter.
 * @returns {string}
 */
function uppercaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Converts miles per hour to kilometers per hour.
 *
 * @param mph the mph value to convert
 * @returns {string} of the converted value, with two fixed decimal points
 */
function mphToKmh(mph) {
    return (mph * 1.609).toFixed(2);
}

/**
 * Converts a Kelvin temperature value to Fahrenheit
 * Used when unit measurement selected is Imperial.
 *
 * @param kelvinValue the kelvin temperature to convert.
 * @returns {number} the converted value cast to an integer.
 */
function convertToFahrenheit(kelvinValue) {
    return parseInt((kelvinValue - 273.15) * 9 / 5 + 32);
}

/**
 * Converts a Kelvin temperature value to Celsius
 * Used when unit measurement selected is Metric.
 *
 * @param kelvinValue the kelvin temperature to convert.
 * @returns {number} the converted value cast to an integer.
 */
function convertToCelsius(kelvinValue) {
    return parseInt((kelvinValue - 273.15));
}