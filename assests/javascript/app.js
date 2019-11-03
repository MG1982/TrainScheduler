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

    // Uploads to the database if all data fields are filled
    if (
      trainName === "" ||
      destination === "" ||
      firstTrainTime === "" ||
      frequency === ""
    ) {
      alert("Fill in all data fields please");
    } else {
      database.ref().push(newTrain);
      $("form")[0].reset();
      $("#addTrainModal .close").click();
    }
  });
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
    newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
    newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
    newrow.append(
      $("<td class='text-center'>" + childSnapshot.val().frequency + "</td>")
    );
    newrow.append(
      $("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>")
    );
    newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
    newrow.append(
      $(
        "<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" +
          key +
          "'>X</button></td>"
      )
    );

    $("#add-train-row").append(newrow);
  });
  // Remove buton added to column with page refresh
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
    let current = moment().format("HH:mm A");
    $("#clock").html(current);
    setTimeout(currentTime, 1000);
  }
  currentTime();

  //Page reload to update train times every 60 seconds
  setInterval(function() {
    window.location.reload();
  }, 60000);
});
