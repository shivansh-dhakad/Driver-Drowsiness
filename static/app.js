/* ── Slider live-value badges ─────────────────────────────────────────────── */
const sliderMap = {
  age: { el: null, badge: null, decimals: 0 },
  blink_rate: { el: null, badge: null, decimals: 0 },
  eye_closure: { el: null, badge: null, decimals: 1 },
  yawning: { el: null, badge: null, decimals: 0 },
  heart_rate: { el: null, badge: null, decimals: 0 },
  head_tilt: { el: null, badge: null, decimals: 1 },
  steering: { el: null, badge: null, decimals: 2 },
  reaction: { el: null, badge: null, decimals: 2 },
  sleep: { el: null, badge: null, decimals: 1 },
};

Object.keys(sliderMap).forEach(key => {
  const s = document.getElementById(key);
  const b = document.getElementById(`${key}-val`);
  if (!s || !b) return;
  sliderMap[key].el = s;
  sliderMap[key].badge = b;

  const update = () => {
    const d = sliderMap[key].decimals;
    b.textContent = parseFloat(s.value).toFixed(d);
    const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
    s.style.background = `linear-gradient(90deg,
      rgba(59,130,246,0.6) ${pct}%,
      var(--surface2) ${pct}%)`;
  };

  s.addEventListener('input', update);
  update();
});

/* ── Gauge helpers ────────────────────────────────────────────────────────── */
const ARC_LEN = 251.2;

function setGauge(prob) {
  const fill = document.getElementById('gauge-fill');
  const needle = document.getElementById('gauge-needle');
  const pctLbl = document.getElementById('gauge-pct');

  const offset = ARC_LEN * (1 - prob);
  fill.style.strokeDashoffset = offset;

  const angle = -90 + prob * 180;
  needle.style.transform = `rotate(${angle}deg)`;

  if (prob < 0.40) fill.style.stroke = '#22c55e';
  else if (prob < 0.70) fill.style.stroke = '#f59e0b';
  else fill.style.stroke = '#ef4444';

  pctLbl.textContent = Math.round(prob * 100) + '%';
}

/* ── Probability bar ──────────────────────────────────────────────────────── */
function setProbBar(prob) {
  const fill = document.getElementById('prob-fill');
  const label = document.getElementById('prob-pct-label');
  fill.style.width = Math.min(prob * 100, 100) + '%';
  label.textContent = (prob * 100).toFixed(1) + '%';
}

/* ── Status badge ─────────────────────────────────────────────────────────── */
function setStatus(drowsy, prob) {
  const badge = document.getElementById('status-badge');
  const icon = document.getElementById('status-icon');
  const text = document.getElementById('status-text');

  badge.classList.remove('idle', 'alert', 'drowsy');

  if (prob < 0.40) {
    badge.classList.add('alert');   // low risk → alert (was incorrectly 'drowsy')
    icon.textContent = '🟢';
    text.textContent = 'Low risk';
  } else if (prob < 0.70) {
    badge.classList.add('alert');   // moderate → still alert class
    icon.textContent = '🟡';
    text.textContent = 'Moderate risk';
  } else {
    badge.classList.add('drowsy'); // high risk → drowsy (was incorrectly 'alert')
    icon.textContent = '🔴';
    text.textContent = 'High Risk';
  }
}

/* ── Prediction Reasons ───────────────────────────────────────────────────── */

function buildReasons(payload, drowsy) {
  const reasons = [];

  const sleep = parseFloat(payload.sleep_hours);
  if (sleep < 4) {
    reasons.push({ label: 'Sleep', value: `${sleep}h`, message: 'Critically low sleep — major drowsiness risk.', severity: 'danger' });
  } else if (sleep < 6) {
    reasons.push({ label: 'Sleep', value: `${sleep}h`, message: 'Below-average sleep increases fatigue risk.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Sleep', value: `${sleep}h`, message: 'Adequate sleep — no fatigue concern here.', severity: 'ok' });
  }

  const reaction = parseFloat(payload.reaction_time);
  if (reaction > 1.5) {
    reasons.push({ label: 'Reaction Time', value: `${reaction.toFixed(2)}s`, message: 'Slow reaction time signals impaired alertness.', severity: 'danger' });
  } else if (reaction > 1.2) {
    reasons.push({ label: 'Reaction Time', value: `${reaction.toFixed(2)}s`, message: 'Slightly sluggish response — mild concern.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Reaction Time', value: `${reaction.toFixed(2)}s`, message: 'Fast reflexes — driver is alert.', severity: 'ok' });
  }

  const eyeClosure = parseFloat(payload.eye_closure_duration);
  if (eyeClosure > 45) {
    reasons.push({ label: 'Eye Closure', value: `${eyeClosure.toFixed(1)}ms`, message: 'Prolonged eye closure — strong drowsiness indicator.', severity: 'danger' });
  } else if (eyeClosure > 35) {
    reasons.push({ label: 'Eye Closure', value: `${eyeClosure.toFixed(1)}ms`, message: 'Eye closure slightly elevated.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Eye Closure', value: `${eyeClosure.toFixed(1)}ms`, message: 'Normal blink duration — eyes open and alert.', severity: 'ok' });
  }

  const steering = parseFloat(payload.steering_variation);
  if (steering > 1.2) {
    reasons.push({ label: 'Steering', value: steering.toFixed(2), message: 'Erratic steering detected — lane discipline poor.', severity: 'danger' });
  } else if (steering > 0.9) {
    reasons.push({ label: 'Steering', value: steering.toFixed(2), message: 'Some steering wobble present.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Steering', value: steering.toFixed(2), message: 'Smooth, controlled steering.', severity: 'ok' });
  }

  const yawning = parseInt(payload.yawning_count);
  if (yawning >= 5) {
    reasons.push({ label: 'Yawning', value: `${yawning}×`, message: 'Frequent yawning — clear sign of fatigue.', severity: 'danger' });
  } else if (yawning >= 3) {
    reasons.push({ label: 'Yawning', value: `${yawning}×`, message: 'Moderate yawning noted.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Yawning', value: `${yawning}×`, message: 'Minimal yawning — good sign.', severity: 'ok' });
  }

  const headTilt = parseFloat(payload.head_tilt_angle);
  if (headTilt > 18) {
    reasons.push({ label: 'Head Tilt', value: `${headTilt.toFixed(1)}°`, message: 'Significant head drop — nodding off.', severity: 'danger' });
  } else if (headTilt > 12) {
    reasons.push({ label: 'Head Tilt', value: `${headTilt.toFixed(1)}°`, message: 'Noticeable head tilt — mild concern.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Head Tilt', value: `${headTilt.toFixed(1)}°`, message: 'Head position is upright and normal.', severity: 'ok' });
  }

  const heartRate = parseFloat(payload.heart_rate);
  if (heartRate < 65) {
    reasons.push({ label: 'Heart Rate', value: `${heartRate} BPM`, message: 'Low heart rate may indicate drowsiness.', severity: 'warning' });
  } else {
    reasons.push({ label: 'Heart Rate', value: `${heartRate} BPM`, message: 'Heart rate within normal range.', severity: 'ok' });
  }

  // Sort: danger first, then warning, then ok — but keep at most 5
  const order = { danger: 0, warning: 1, ok: 2 };
  reasons.sort((a, b) => order[a.severity] - order[b.severity]);
  return reasons.slice(0, 5);
}

/* ── Render reasons box ───────────────────────────────────────────────────── */
function renderReasons(reasons, drowsy) {
  const box = document.getElementById('reasons-box');

  const iconMap = { danger: '🔴', warning: '🟡', ok: '🟢' };
  const headerText = drowsy
    ? '🔍 Why the model predicted <strong>Drowsy</strong>'
    : '🔍 Why the model predicted <strong>Alert</strong>';

  const items = reasons.map(r => `
    <li class="reason-item reason-${r.severity}">
      <span class="reason-icon">${iconMap[r.severity]}</span>
      <div class="reason-body">
        <span class="reason-label">${r.label} <span class="reason-value">${r.value}</span></span>
        <span class="reason-msg">${r.message}</span>
      </div>
    </li>
  `).join('');

  box.innerHTML = `
    <p class="reasons-title">${headerText}</p>
    <ul class="reasons-list">${items}</ul>
  `;
  box.classList.remove('hidden');
}

/* ── Form submit ──────────────────────────────────────────────────────────── */
document.getElementById('prediction-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('predict-btn');
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');

  btn.disabled = true;
  btnText.hidden = true;
  spinner.hidden = false;

  const gender = document.querySelector('input[name="gender"]:checked')?.value ?? 'Male';

  const payload = {
    age: sliderMap.age.el.value,
    gender,
    blink_rate: sliderMap.blink_rate.el.value,
    eye_closure_duration: sliderMap.eye_closure.el.value,
    yawning_count: sliderMap.yawning.el.value,
    heart_rate: sliderMap.heart_rate.el.value,
    head_tilt_angle: sliderMap.head_tilt.el.value,
    steering_variation: sliderMap.steering.el.value,
    reaction_time: sliderMap.reaction.el.value,
    sleep_hours: sliderMap.sleep.el.value,
  };

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.error) {
      alert('Server error: ' + data.error);
      return;
    }

    setGauge(data.probability);
    setProbBar(data.probability);
    setStatus(data.drowsy, data.probability);

    const reasons = buildReasons(payload, data.drowsy);
    renderReasons(reasons, data.drowsy);

    if (window.innerWidth < 900) {
      document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    alert('Failed to reach server. Is Flask running?\n' + err.message);
  } finally {
    btn.disabled = false;
    btnText.hidden = false;
    spinner.hidden = true;
  }
});