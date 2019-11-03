$(document).ready(function() {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDqJ97L2FPbbLYJ-gv6Lch3eHH0Lo2Y2Ss",
    authDomain: "train-scheduler-eed01.firebaseapp.com",
    databaseURL: "https://train-scheduler-eed01.firebaseio.com",
    projectId: "train-scheduler-eed01",
    storageBucket: "train-scheduler-eed01.appspot.com",
    messagingSenderId: "1039384227841",
    appId: "1:1039384227841:web:af48e1711f67b11e429000"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const database = firebase.database();

  let trainName = "";
  let destination = "";
  let firstTrainTime = "";
  let frequency = 0;

  // Button for adding Trains
  $("#add-train").on("click", function(event) {
    event.preventDefault();

    // html form inputs
    trainName = $("#train-name")
      .val()
      .trim();
    destination = $("#destination")
      .val()
      .trim();
    firstTrainTime = $("#first-train")
      .val()
      .trim();
    frequency = $("#frequency")
      .val()
      .trim();

    // Creates local object to hold new train data
    let newTrain = {
      trainName: trainName,
      destination: destination,
      firstTrainTime: firstTrainTime,
      frequency: frequency,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    };

    // Checks for correct time input and checks that all fields are not blank before uploading to the database
    time = $("#first-train").val();
    isValid = /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/.test(time);

    if (isValid === false) {
      alert("Incorrect time entry");
    }
    if (
      trainName === "" ||
      destination === "" ||
      firstTrainTime === "" ||
      frequency === ""
    ) {
      alert("Fill in all data fields please");
    } else {
      if (isValid === true) {
        database.ref().push(newTrain);
        $("form")[0].reset();
        $("#addTrainModal .close").click();
      }
    }
  });
  // Math for Next Arrival Time and Minutes Away
  database.ref().on("child_added", function(childSnapshot) {
    let startTimeConverted = moment(
      childSnapshot.val().firstTrainTime,
      "hh:mm"
    ).subtract(1, "years");
    let timeDiff = moment().diff(moment(startTimeConverted), "minutes");
    let timeRemain = timeDiff % childSnapshot.val().frequency;
    let minToArrival = childSnapshot.val().frequency - timeRemain;
    let nextTrain = moment().add(minToArrival, "minutes");
    let key = childSnapshot.key;

    // New row generator
    let newrow = $("<tr>");
    newrow.append(
      $("<td class='text-center'>" + childSnapshot.val().trainName + "</td>")
    );
    newrow.append(
      $("<td class='text-center'>" + childSnapshot.val().destination + "</td>")
    );
    newrow.append(
      $("<td class='text-center'>" + childSnapshot.val().frequency + "</td>")
    );
    newrow.append(
      $("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>")
    );
    newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
    newrow.append(
      $(
        "<td class='text-center'><button class='arrival btn btn-outline-danger btn-xs' data-key='" +
          key +
          "'>X</button></td>"
      )
    );
    // Add generated row to html
    $("#add-train-row").append(newrow);
  });

  // Remove button with page refresh after click
  $(document).on("click", ".arrival", function() {
    keyref = $(this).attr("data-key");
    database
      .ref()
      .child(keyref)
      .remove();
    window.location.reload();
  });

  // Current Time display on page
  function currentTime() {
    let current = moment().format("HH:mm:ss A");
    $("#clock").html("<i class='far fa-clock'></i>  " + current);
    setTimeout(currentTime, 1000);
  }
  function currentDate() {
    let date = moment().format("dddd MMMM Do YYYY ");
    $("#date").html("<h5>" + date + "</h5>");
  }

  // Calls live page clock function
  currentTime();
  currentDate();

  //Page reload to update train times every 60 seconds
  setInterval(function() {
    if ($(".modal").is(":visible")) {
    } else {
      window.location.reload();
    }
  }, 60000);
});
