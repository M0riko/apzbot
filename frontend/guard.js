let allBookings = [];

async function loadBookings() {
  try {
    const res = await fetch('/api/guard/bookings');
    const data = await res.json();
    if (data.ok) {
      allBookings = data.bookings;
      renderBookings(allBookings);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

function renderBookings(bookings) {
  const body = document.getElementById('bookings-body');
  if (bookings.length === 0) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">Активних бронювань на сьогодні немає</td></tr>';
    return;
  }

  body.innerHTML = bookings.map(b => `
    <tr>
      <td><span class="date-badge">${b.date}</span></td>
      <td style="font-weight:600;">${b.time_slot}</td>
      <td>${b.machine_name}</td>
      <td style="font-weight:500;">${b.full_name || '—'}</td>
      <td style="color:#64748b;">${b.username ? '@' + b.username : 'ID: ' + b.user_id}</td>
    </tr>
  `).join('');
}

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allBookings.filter(b => 
    (b.full_name || '').toLowerCase().includes(q) || 
    (b.username || '').toLowerCase().includes(q) ||
    String(b.user_id).includes(q)
  );
  renderBookings(filtered);
});

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('uk-UA');
}

setInterval(updateClock, 1000);
setInterval(loadBookings, 60000); // Auto refresh every minute
loadBookings();
updateClock();
