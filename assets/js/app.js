var modal = document.querySelector(".modal");
var closeBtn = document.querySelector(".close-btn");
var closeButton = document.querySelector(".close-button");
var modalText = document.querySelector(".modal-text");
var modalSubtext = document.querySelector(".modal-subtext");
var mymap= L.map('mapid').setView([43, -83], 12);
var address='';
var i = 0;
$(document).ready(function () {
    var searchInput = $('#searchInp');
    var searchButton = $('#searchBtn');
    var trailLength = '';
    var stars = '1';
    // var APIKEY = '200624582-ef03dfcbf90f2bd9243bdef3d1acb99b';
    $(".results").hide();
    $("#filterSearchBtn").on('click', function () {
        // ratingFilter()
        address=$('#city').text();
        trailLength = document.getElementById("lengthSlider");
        if ($('#rating5').is(':checked')) {
            stars = '5';
        }
        else if ($('#rating4').is(':checked')) {
            stars = '4';
        }
        else if ($('#rating3').is(':checked')) {
            stars = '3';
        }
        else if ($('#rating2').is(':checked')) {
            stars = '2';
        }
        else if ($('#rating1').is(':checked')) {
            stars = '1';
        }
        $('.searchResults').empty()
        resultCalc(trailLength.value, stars, address);
    });

    //code for popupmodal toggle
    function toggleModal() {
        modal.classList.toggle("show-modal");
    }

    //geolocation and hiking api    
    function searchResults(trailLength, stars) {
        $('.searchResults').empty()
        address = searchInput.val();
        if (address === '') {
            $('.searchResults').on("click", toggleModal());
            modalText.textContent = " Blank Search !!!";
            modalSubtext.textContent = 'Please Enter a valid city';
            closeButton.addEventListener("click", toggleModal);
            closeBtn.addEventListener("click", toggleModal);
            return;
        }
        $('#city').text(address);
        resultCalc(trailLength,stars,address)
    }

    function resultCalc(trailLength,stars,address){
        $(".searchBox").hide();
        $(".results").show();
        var geoCodeApi = {
            "async": true,
            "crossDomain": true,
            "url": `https://trailapi-trailapi.p.rapidapi.com/activity/?q-city_cont=${address}`,
            "method": "GET",
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "x-rapidapi-host": "trailapi-trailapi.p.rapidapi.com",
                "x-rapidapi-key": "ca362deadcmsh6037101ae9f25b9p1f7b00jsnf26c6a899984"
            }
        }
        $.ajax(geoCodeApi).done(function (response) {
            console.log(Object.values(response)[0].lat);
            console.log(Object.values(response)[0].lon);
            var LATITUDE = Object.values(response)[0].lat;
            var LONGITUDE = Object.values(response)[0].lon;
            var queryURL = `https://trailapi-trailapi.p.rapidapi.com/trails/explore/?lat=${LATITUDE}&lon=${LONGITUDE}`;
            var settings = {
                "url": queryURL,
                "method": "GET",
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "x-rapidapi-host": "trailapi-trailapi.p.rapidapi.com",
                    "x-rapidapi-key": "ca362deadcmsh6037101ae9f25b9p1f7b00jsnf26c6a899984"
                }
            }            
            $.ajax(settings).done(function (result) {
                var trails = result.data;
                console.log(result)
                // if no results are rendered - would form into a popup... Unless Poorva already did that
                 if (trails.length === 0) {
                    var errorText = $("<p style='color:red;text-align:center;padding:30px;font-size:18px;'>")
                    .text('City does not have any trails with your filter selection criteria. Please try again!');
                    $('.searchResults').append(errorText);
                }
                for (i = 0; i < trails.length; i++) {
                    var card = $("<div class='card horizontal myCard'>");
                    var cardimage = $('<div class="card-image">');
                    var cardStacked = $('<div class="card-stacked">');
                    var cardContent = $('<div class="card-content">');
                    var cardAction = $('<div class="card-action center">');

                    card.append(cardimage);
                    card.append(cardStacked);
                    cardStacked.append(cardContent);
                    cardStacked.append(cardAction);
                    cardAction.append($("<a>").text("SHOW IN MAP")
                        .addClass('cardLinks')
                        .attr('data-lat', trails[i].lat)
                        .attr('data-lon', trails[i].lon)
                        .attr('data-locale', trails[i].city)
                        .attr('data-name', trails[i].name));

                    var image = $("<img>");
                    image.attr("src", trails[i].thumbnail);
                    image.attr('alt', trails[i].name);
                    cardimage.append(image);

                    var name = $("<p class='name'>").text(trails[i].name);
                    var difficulty = $("<p>").text("Difficulty: " + trails[i].difficulty);
                    var location = $("<p>").text("Location: " + trails[i].city);
                    var length = $("<p>").text("Length: " + trails[i].length);
                    var rating = $("<p>").text("Rating: " + trails[i].rating);
                    cardContent.append(name);
                    cardContent.append(location);
                    cardContent.append(length);
                    cardContent.append(difficulty);
                    cardContent.append(rating);

                    $('.searchResults').append(card);
                }
                 //showing in map on card click
                 $('.cardLinks').click(function() {
                    var cityLat = ($(this).attr('data-lat'))
                    var cityLon = ($(this).attr('data-lon'))
                    var trailName = ($(this).attr('data-name'));
                    var locale = ($(this).attr('data-locale'));
                    var temp = '';

                    $.ajax({
                        url: 'https://api.openweathermap.org/data/2.5/forecast?q=' + 
                        locale + '&apikey=df520520403dc5e0455758f5b172bc5e&units=imperial',
                        method: 'GET',
                    })
                    .then(function(data){
                        temp += data.list[0].main.temp
                        console.log(temp)
                    var myRenderer = L.canvas({ padding: 0.5 });
                    var circleMarker = L.circleMarker([cityLat, cityLon], {
                        renderer: myRenderer,
                        color: '#3388ff'
                    }).addTo(mymap)
                    .bindPopup("<b>" + trailName + '<p>Current temp is: ' + temp + '\xB0F').openPopup();
                    mymap.panTo([cityLat, cityLon], 13);
                    })
                    //scroll to map on click
                    $('html, body').animate({
                        scrollTop: $("#mapid").offset().top
                    }, 500);                    
                })
            });

        });
    }

   // localstorage methods
    var searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || []

    function appendSearches() {
        $("#history").empty();
        for (i = 0; i < searchedCities.length; i++) {
            var li = $("<li>")
            li.addClass("center")
            li.attr("data-city", searchedCities[i].name)
            $("#history").prepend(li)
            li.click(function (e) {
                address=e.target.innerText;
                console.log(address)
                $('#city').text(address);
                $('.searchResults').empty()
                resultCalc('5','1',address)
                closeNav();
            });
            li.append(searchedCities[i].name);
        }
    }

    //code to trigget search action
    searchButton.click(function (e) {
        e.preventDefault();
        searchResults('5','1');
    //storing in localstorage
        var cityObj = {
            name: address
        }
        searchedCities.push(cityObj)
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities))
        if (searchedCities.length === 10) {
            searchedCities.shift();
        }
        appendSearches()
    });
    appendSearches()
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
