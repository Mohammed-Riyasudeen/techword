    let buses = [];
let selectedBus = null;
let selectedSeats = [];
const totalBuses = 30;
const seatsPerBus = 20;

function checkLogin() {
  const email = document.getElementById("loginId").value;
  const password = document.getElementById("loginPass").value;

  if (email === "user123@gmail.com" && password === "bus@123") {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    localStorage.setItem("loggedInUser", email);
  } else {
    document.getElementById("loginError").innerText = "Invalid ID or Password!";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  location.reload();
}

function searchBuses() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const date = document.getElementById("journeyDate").value;

  if (!from || !to || !date) {
    alert("Please fill all fields");
    return;
  }

  buses = [];
  for (let i = 1; i <= totalBuses; i++) {
    buses.push({
      id: i,
      name: `TN Express ${i}`,
      seatsAvailable: seatsPerBus,
      timing: `${7 + (i % 12)}:00 AM`,
      price: 200 + (i % 5) * 50,
      offers: i % 3 === 0 ? "20% off" : "No offer",
    });
  }

  renderBuses();
}

function renderBuses() {
  const busResults = document.getElementById("busResults");
  busResults.innerHTML = "<h2>Available Buses</h2>";
  let html = "";

  buses.forEach((bus, i) => {
    if (i % 10 === 0) html += `<div style="display:flex; justify-content:center; flex-wrap: wrap;">`;
    html += `
      <div style="margin: 10px; padding:10px; border:1px solid white; width:150px; background:#fff; color:#000; border-radius:10px;">
        <strong>${bus.name}</strong><br>
        ${bus.timing}<br>
        ₹${bus.price} <br>
        Seats: ${bus.seatsAvailable}<br>
        ${bus.offers}<br>
        <button onclick="selectBus(${bus.id})">Book Now</button>
      </div>
    `;
    if ((i + 1) % 10 === 0) html += `</div>`;
  });
  busResults.innerHTML += html;
}

function selectBus(id) {
  selectedBus = buses.find(b => b.id === id);
  selectedSeats = [];

  let seatHTML = "<h3>Select Your Seats</h3><div>";
  for (let i = 1; i <= seatsPerBus; i++) {
    const cls = "unbooked";
    seatHTML += `<div class="seat ${cls}" onclick="toggleSeat(${i})" id="seat${i}">${i}</div>`;
    if (i % 5 === 0) seatHTML += "<br/>";
  }
  seatHTML += "</div><br><button onclick='continuePayment()'>Continue to Payment</button>";

  document.getElementById("seatSelection").innerHTML = seatHTML;
  document.getElementById("paymentSection").innerHTML = "";
  document.getElementById("ticketPage").innerHTML = "";
  document.getElementById("qrCodeContainer").innerHTML = "";
}

function toggleSeat(num) {
  const seat = document.getElementById(`seat${num}`);
  if (seat.classList.contains("booked")) return;

  if (seat.classList.contains("unbooked")) {
    seat.classList.remove("unbooked");
    seat.classList.add("available");
    selectedSeats.push(num);
  } else if (seat.classList.contains("available")) {
    seat.classList.remove("available");
    seat.classList.add("unbooked");
    selectedSeats = selectedSeats.filter(s => s !== num);
  }
}

function continuePayment() {
  if (selectedSeats.length === 0) {
    alert("Please select at least one seat to continue.");
    return;
  }

  const boarding = `
    <select id="boardingPoint">
      <option>Ukkadam Bypass</option>
      <option>Ganthipuram</option>
      <option>Railway Station</option>
      <option>Peelamedu</option>
      <option>Singanallur</option>
      <option>Avanish Bypass</option>
      <option>Lakshmi Mills</option>
      <option>Omni Bus Stand</option>
      <option>Sitra</option>
      <option>Kuniyamuthur</option>
    </select>`;

  const dropping = `
    <select id="droppingPoint">
      <option>Koyambedu</option>
      <option>Guindy</option>
      <option>Tambaram</option>
      <option>Vadapalani</option>
      <option>Alandur</option>
      <option>Perungalathur</option>
      <option>T Nagar</option>
      <option>Central</option>
      <option>Velachery</option>
      <option>Thiruvanmiyur</option>
    </select>`;

  const paymentHTML = `
    <h3>Passenger Info</h3>
    Name: <input id="passengerName" /><br>
    Age: <input id="passengerAge" /><br>
    Gender: 
    <select id="passengerGender">
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select><br>
    Phone: <input id="phone" /><br><br>
    Boarding: ${boarding}<br>
    Dropping: ${dropping}<br><br>
    <strong>Total Amount: ₹${selectedSeats.length * selectedBus.price}</strong><br><br>
    <button onclick="payNow()">Pay Now</button>
  `;

  document.getElementById("paymentSection").innerHTML = paymentHTML;
}

function payNow() {
  const name = document.getElementById("passengerName").value;
  const phone = document.getElementById("phone").value;
  const age = document.getElementById("passengerAge").value;

  if (!name || !phone || !age) {
    alert("Please fill all passenger details");
    return;
  }

  const user = localStorage.getItem("loggedInUser");
  const ticket = {
    user,
    bus: selectedBus.name,
    seats: selectedSeats,
    name,
    phone,
    price: selectedSeats.length * selectedBus.price,
    date: new Date().toLocaleDateString(),
    time: selectedBus.timing,
    status: "Confirmed"
  };

  let bookings = JSON.parse(localStorage.getItem("bookingHistory")) || [];
  bookings.push(ticket);
  localStorage.setItem("bookingHistory", JSON.stringify(bookings));

  document.getElementById("ticketPage").innerHTML = `
    <h3>✅ Ticket Booked Successfully</h3>
    <p>Dear ${name}, your ticket has been booked on ${ticket.date}.</p>
    <p>Bus: ${ticket.bus} | Seats: ${ticket.seats.join(", ")}</p>
    <p>Total Paid: ₹${ticket.price}</p>
    <p>SMS sent to ${phone}</p>
    <p>Email sent to ${user}</p>
    <button onclick="window.print()">🖨 Print Ticket</button>
    <a href="#" onclick="downloadTicket()">⬇ Download Ticket</a>
  `;

  document.getElementById("seatSelection").innerHTML = "";
  document.getElementById("paymentSection").innerHTML = "";

  showQRCode(ticket.price);
}

function showQRCode(amount) {
  const qr = `
    <h3>Scan & Pay with any UPI App</h3>
    <div id="qrCode">
      <img src="https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=yourbus@upi&pn=YourBus&am=${amount}&cu=INR&size=200x200" alt="QR Code" />
      <p>UPI ID: yourbus@upi</p>
      <p>Amount: ₹${amount}</p>
    </div>
  `;
  document.getElementById("qrCodeContainer").innerHTML = qr;
}

function downloadTicket() {
  const ticketInfo = document.getElementById("ticketPage").innerText;
  const blob = new Blob([ticketInfo], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "yourbus_ticket.txt";
  a.click();
}

function viewHistory() {
  const user = localStorage.getItem("loggedInUser");
  let bookings = JSON.parse(localStorage.getItem("bookingHistory")) || [];
  const userBookings = bookings.filter(b => b.user === user);

  if (userBookings.length === 0) {
    alert("No bookings found");
    return;
  }

  let history = "<h3>Your Booking History</h3>";
  userBookings.forEach((b, i) => {
    history += `<p>#${i + 1} - Bus: ${b.bus}, Seats: ${b.seats.join(", ")}, Date: ${b.date}, ₹${b.price}</p>`;
  });
  document.getElementById("ticketPage").innerHTML = history;
}


















