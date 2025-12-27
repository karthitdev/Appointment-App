document.addEventListener('DOMContentLoaded', () => {

  
  let appointments = [];
  let editingId = null;
  let currentDate = new Date();

  
  function saveToStorage() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }

  function loadFromStorage() {
    const data = localStorage.getItem('appointments');
    if (data) {
      appointments = JSON.parse(data);
    }
  }

  
  const modal = document.getElementById('appointment-modal');
  const openModalBtn = document.getElementById('open-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');

  modal.hidden = true;

  openModalBtn.onclick = () => {
    editingId = null;
    modal.hidden = false;
  };

  function closeModal() {
    modal.hidden = true;
  }

  closeModalBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  
  const form = modal.querySelector('form');

  const patientInput = document.getElementById('patient-name');
  const doctorInput = document.getElementById('doctor-name');
  const hospitalInput = document.getElementById('hospital-name');
  const specialtyInput = document.getElementById('specialty');
  const dateInput = document.getElementById('appointment-date');
  const timeInput = document.getElementById('appointment-time');
  const reasonInput = document.getElementById('reason');

  
  const calendarGrid = document.querySelector('.calendar-grid');
  const currentDateEl = document.querySelector('.current-date');
  const prevBtn = document.querySelector('.calendar-nav button:first-child');
  const nextBtn = document.querySelector('.calendar-nav button:last-child');
  const todayBtn = document.querySelector('.calendar-actions .btn-secondary');

  
  const calendarView = document.getElementById('calendar-view');
  const dashboardView = document.getElementById('dashboard-view');

  const navCalendar = document.getElementById('nav-calendar');
  const navDashboard = document.getElementById('nav-dashboard');

  const filterPatient = document.getElementById('filter-patient');
  const filterDoctor = document.getElementById('filter-doctor');
  const filterFrom = document.getElementById('filter-from-date');
  const filterTo = document.getElementById('filter-to-date');
  const filterBtn = document.getElementById('filter-btn');

  const tableBody = document.getElementById('dashboard-table-body');

  
  function getMonthYear(date) {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayIndex(year, month) {
    return new Date(year, month, 1).getDay();
  }

  
  function renderCalendar() {
    calendarGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentDateEl.textContent = getMonthYear(currentDate);

    const startDay = getFirstDayIndex(year, month);
    const totalDays = getDaysInMonth(year, month);

    
    for (let i = 0; i < startDay; i++) {
      calendarGrid.appendChild(document.createElement('div'));
    }

    
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cell.dataset.date = dateStr;

      const num = document.createElement('div');
      num.className = 'day-number';
      num.textContent = day;
      cell.appendChild(num);

      appointments
        .filter(a => a.date === dateStr)
        .forEach(a => {
          const item = document.createElement('div');
          item.className = 'appointment-item';
          item.innerHTML = `
            <span>${a.patientName} • ${a.time}</span>
            <span>
              <button class="edit-btn">✏️</button>
              <button class="delete-btn">🗑️</button>
            </span>
          `;

          item.querySelector('.edit-btn').onclick = () => openEdit(a.id);
          item.querySelector('.delete-btn').onclick = () => deleteAppointment(a.id);

          cell.appendChild(item);
        });

      calendarGrid.appendChild(cell);
    }
  }

  
  prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };

  nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };

  todayBtn.onclick = () => {
    currentDate = new Date();
    renderCalendar();
  };

  
  form.onsubmit = (e) => {
    e.preventDefault();

    const data = {
      patientName: patientInput.value.trim(),
      doctorName: doctorInput.value.trim(),
      hospital: hospitalInput.value.trim(),
      specialty: specialtyInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      reason: reasonInput.value.trim()
    };

    if (editingId) {
      const index = appointments.findIndex(a => a.id === editingId);
      appointments[index] = { ...data, id: editingId };
      editingId = null;
    } else {
      appointments.push({ ...data, id: Date.now() });
    }

    saveToStorage();
    form.reset();
    closeModal();
    renderCalendar();
    if (!dashboardView.hidden) renderDashboard();
  };

  
  function openEdit(id) {
    const a = appointments.find(x => x.id === id);
    editingId = id;

    patientInput.value = a.patientName;
    doctorInput.value = a.doctorName;
    hospitalInput.value = a.hospital;
    specialtyInput.value = a.specialty;
    dateInput.value = a.date;
    timeInput.value = a.time;
    reasonInput.value = a.reason;

    modal.hidden = false;
  }

  function deleteAppointment(id) {
    if (!confirm('Delete this appointment?')) return;
    appointments = appointments.filter(a => a.id !== id);
    saveToStorage();
    renderCalendar();
    if (!dashboardView.hidden) renderDashboard();
  }

  
  function renderDashboard(list = appointments) {
    tableBody.innerHTML = '';

    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7">No appointments found</td></tr>`;
      return;
    }

    list.forEach(a => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${a.patientName}</td>
        <td>${a.doctorName}</td>
        <td>${a.hospital}</td>
        <td>${a.specialty}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>
          <button class="edit-btn">✏️</button>
          <button class="delete-btn">🗑️</button>
        </td>
      `;

      row.querySelector('.edit-btn').onclick = () => openEdit(a.id);
      row.querySelector('.delete-btn').onclick = () => deleteAppointment(a.id);

      tableBody.appendChild(row);
    });
  }

  
  filterBtn.onclick = () => {
    let filtered = [...appointments];

    if (filterPatient.value)
      filtered = filtered.filter(a =>
        a.patientName.toLowerCase().includes(filterPatient.value.toLowerCase())
      );

    if (filterDoctor.value)
      filtered = filtered.filter(a =>
        a.doctorName.toLowerCase().includes(filterDoctor.value.toLowerCase())
      );

    if (filterFrom.value)
      filtered = filtered.filter(a => a.date >= filterFrom.value);

    if (filterTo.value)
      filtered = filtered.filter(a => a.date <= filterTo.value);

    renderDashboard(filtered);
  };

  
  navCalendar.onclick = () => {
    navCalendar.classList.add('active');
    navDashboard.classList.remove('active');
    calendarView.hidden = false;
    dashboardView.hidden = true;
  };

  navDashboard.onclick = () => {
    navDashboard.classList.add('active');
    navCalendar.classList.remove('active');
    calendarView.hidden = true;
    dashboardView.hidden = false;
    renderDashboard();
  };

  
  loadFromStorage();
  renderCalendar();
});
