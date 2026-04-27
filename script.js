/* ================= NAVBAR ================= */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }
});

/* ================= CALCULATOR ================= */

function calculateBMR(w, h, a, g) {
  let base = 10 * w + 6.25 * h - 5 * a;
  return g === "male" ? base + 5 : base - 161;
}

function calculateBMI(w, h) {
  return w / ((h / 100) ** 2);
}

function initCalculator() {
  const form = document.getElementById("calcForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let w = +document.getElementById("weight").value;
    let h = +document.getElementById("height").value;
    let a = +document.getElementById("age").value;
    let g = document.querySelector("input[name='gender']:checked")?.value;
    let act = document.getElementById("activity").value;

    if (!w || !h || !a || !g || !act) {
      document.getElementById("errorMsg").innerText = "Fill all fields";
      return;
    }

    document.getElementById("errorMsg").innerText = "";

    let bmr = calculateBMR(w, h, a, g);

    let multi = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.725
    };

    let tdee = bmr * multi[act];

    let bmi = calculateBMI(w, h).toFixed(1);
    let bmiVal = parseFloat(bmi);

    let bmiClass = "ok";
    if (bmiVal < 18.5) bmiClass = "underweight";
    else if (bmiVal < 25) bmiClass = "healthyweight";
    else if (bmiVal < 30) bmiClass = "overweight";

    /* ===== IDEAL WEIGHT RANGE ===== */
    let hMeters = h / 100;
    let idealMin = Math.round(18.5 * hMeters * hMeters);
    let idealMax = Math.round(24.9 * hMeters * hMeters);

    let suggestionText = "";
    let suggestionIcon = "";
    let suggestionColor = "";

    if (bmiVal < 18.5) {
      let gain = idealMin - Math.round(w);
      suggestionText = `You should gain <strong>${gain} kg</strong> to reach a healthy weight.`;
      suggestionIcon = "⬆️";
      suggestionColor = "#f59e0b";
    } else if (bmiVal > 24.9) {
      let lose = Math.round(w) - idealMax;
      suggestionText = `You should lose <strong>${lose} kg</strong> to reach a healthy weight.`;
      suggestionIcon = "⬇️";
      suggestionColor = "#ef4444";
    } else {
      suggestionText = `Great! Your weight is in the <strong>healthy range</strong>. Keep it up!`;
      suggestionIcon = "✅";
      suggestionColor = "#10b981";
    }

    /* ===== RESULT UI ===== */
    document.getElementById("resultsPanel").innerHTML = `
      <div class="result-grid">

        <div class="result-card">
          <div class="result-label">BMR</div>
          <div class="result-value">${Math.round(bmr)} kcal</div>
        </div>

        <div class="result-card">
          <div class="result-label">Maintenance</div>
          <div class="result-value">${Math.round(tdee)} kcal</div>
        </div>

        <div class="result-card">
          <div class="result-label">Weight Loss</div>
          <div class="result-value">${Math.round(tdee - 500)} kcal</div>
        </div>

        <div class="result-card">
          <div class="result-label">Weight Gain</div>
          <div class="result-value">${Math.round(tdee + 500)} kcal</div>
        </div>

        <div class="result-card">
          <div class="result-label">BMI</div>
          <div class="result-value">${bmi}</div>
          <span class="bmi-badge ${bmiClass}">${bmiClass.toUpperCase()}</span>

          <div class="bmi-bar">
            <div class="bmi-fill ${bmiClass}" style="width:${bmiVal * 3}%"></div>
          </div>
        </div>

        <div class="result-card">
          <div class="result-label">Ideal Weight</div>
          <div class="result-value">${idealMin} – ${idealMax} kg</div>
        </div>

      </div>

      <!-- PIE CHART -->
      <div class="pie-box">
        <canvas id="bmiChart"></canvas>
        <p class="bmi-text">${bmi} BMI (${bmiClass.toUpperCase()})</p>
      </div>

      <!-- SUGGESTION BOX -->
      <div class="suggestion-box" style="border-left: 4px solid ${suggestionColor};">
        <span class="suggestion-icon">${suggestionIcon}</span>
        <p>${suggestionText}</p>
      </div>
    `;

    /* ===== PIE CHART ===== */
    const ctx = document.getElementById("bmiChart");

    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['BMI', 'Remaining'],
          datasets: [{
            data: [bmiVal, 40 - bmiVal],
            backgroundColor: ['#4caf50', '#e0e0e0'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

  });
}

/* ================= DIET ================= */

function initDiet() {
  const goalBoxes = document.querySelectorAll(".goal-box");
  const typeBtns = document.querySelectorAll(".type-btn");
  const generateBtn = document.getElementById("generateBtn");

  let selectedGoal = "";
  let selectedType = "";

  // GOAL SELECT
  goalBoxes.forEach(box => {
    box.addEventListener("click", () => {
      goalBoxes.forEach(b => b.classList.remove("active"));
      box.classList.add("active");
      selectedGoal = box.dataset.goal;
    });
  });

  // DIET TYPE SELECT
  typeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      typeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.dataset.type;
    });
  });

  // GENERATE PLAN
  generateBtn.addEventListener("click", () => {
    const resultDiv = document.getElementById("dietResults");

    if (!selectedGoal || !selectedType) {
      resultDiv.innerHTML = "<p style='color:red'>Please select goal & diet type</p>";
      return;
    }

const weight = parseFloat(document.getElementById("dietWeight").value);

if (!weight) {
  resultDiv.innerHTML = "Enter valid weight!";
  return;
}

let plan = getDietPlan(selectedGoal, selectedType, weight);
resultDiv.innerHTML = plan;
  });
}


/* ================= DIET DATA ================= */

function getDietPlan(goal, type, weight){

  const plans = {

    veg: {
      loss: createPlan(
        "Fat Loss Plan",
        Math.round(weight * 22) + " kcal",
        Math.round(weight * 2) + " g",
        Math.round(weight * 2.5) + "g / " + Math.round(weight * 0.7) + "g",
      [
        ["Breakfast",["Moong dal chilla (2 pcs)","Low-fat curd","Green tea"]],
        ["Mid-Morning",["Apple/guava","Almonds"]],
        ["Lunch",["Roti (2 pcs)","Dal","Sabzi","Salad"]],
        ["Evening Snack",["Roasted chana","Herbal tea"]],
        ["Dinner",["Paneer bhurji","Roti","Veg/salad"]]
      ],
      Math.round(weight * 2) + " g"
      ),

      maintain: createPlan(
        "Maintenance Plan",
        Math.round(weight * 30) + " kcal",
        Math.round(weight * 1.6) + " g",
        Math.round(weight * 3.5) + "g / " + Math.round(weight * 1) + "g",
      [
        ["Breakfast",["Poha","Banana","Milk"]],
        ["Mid-Morning",["Fruit","Nuts"]],
        ["Lunch",["Roti","Dal","Paneer sabzi","Rice"]],
        ["Evening Snack",["Sprouts","Tea"]],
        ["Dinner",["Rajma","Roti","Salad"]]
      ],
      Math.round(weight * 1.6) + " g"
      ),

      gain: createPlan(
        "Weight Gain Plan",
        Math.round(weight * 40) + " kcal",
        Math.round(weight * 1.8) + " g",
        Math.round(weight * 4.5) + "g / " + Math.round(weight * 1.2) + "g",
      [
        ["Breakfast",["Paneer paratha","Milk","Banana"]],
        ["Mid-Morning",["Smoothie","Dates"]],
        ["Lunch",["Roti + ghee","Rajma","Rice","Paneer"]],
        ["Evening Snack",["Sandwich","Milk"]],
        ["Dinner",["Paneer/soya","Roti","Dal rice"]]
      ],
      Math.round(weight * 1.8) + " g"
      )
    },

    nonveg: {
      loss: createPlan(
        "Fat Loss Plan",
        Math.round(weight * 22) + " kcal",
        Math.round(weight * 2) + " g",
        Math.round(weight * 2.5) + "g / " + Math.round(weight * 0.7) + "g",
      [
        ["Breakfast",["Egg whites omelette","Toast","Black coffee"]],
        ["Mid-Morning",["Greek yogurt","Walnuts"]],
        ["Lunch",["Chicken breast","Brown rice","Dal","Salad"]],
        ["Evening Snack",["Egg whites","Green tea"]],
        ["Dinner",["Grilled chicken/fish","Veggies","Soup"]]
      ],
      Math.round(weight * 2) + " g"
      ),

      maintain: createPlan(
        "Maintenance Plan",
        Math.round(weight * 30) + " kcal",
        Math.round(weight * 1.6) + " g",
        Math.round(weight * 3.5) + "g / " + Math.round(weight * 1) + "g",
      [
        ["Breakfast",["Egg omelette","Toast","Milk"]],
        ["Mid-Morning",["Fruit","Nuts"]],
        ["Lunch",["Chicken curry","Roti/rice","Dal","Salad"]],
        ["Evening Snack",["Boiled egg","Peanut chaat"]],
        ["Dinner",["Chicken/fish","Roti","Veg"]]
      ],
      Math.round(weight * 1.6) + " g"
      ),

      gain: createPlan(
        "Weight Gain Plan",
        Math.round(weight * 40) + " kcal",
        Math.round(weight * 1.8) + " g",
        Math.round(weight * 4.5) + "g / " + Math.round(weight * 1.2) + "g",
      [
        ["Breakfast",["Eggs + toast","Milk","Banana"]],
        ["Mid-Morning",["Peanut toast","Milkshake"]],
        ["Lunch",["Chicken curry","Rice","Roti","Dal"]],
        ["Evening Snack",["Eggs","Protein shake"]],
        ["Dinner",["Chicken/fish","Roti + rice","Veg"]]
      ],
      Math.round(weight * 1.8) + " g"
      )
    }
  };

  return plans[type][goal];
}


/* ================= UI TEMPLATE ================= */

function createPlan(title, calories, protein, macros, meals, proteinTarget) {

  let mealsHTML = "";

  meals.forEach(meal => {
    mealsHTML += `
      <div class="meal-card">
        <h4>${meal[0]}</h4>
        <ul>
          ${meal[1].map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
  });

 return `
  <div class="plan-summary">
    <div>${title}</div>
    <div>${calories}</div>
    <div>${protein}</div>
    <div>${macros}</div>
  </div>

  <div class="meal-grid">
    ${mealsHTML}
  </div>

  <div class="protein-note">
    Daily protein target: ${proteinTarget}
    <br><br>
    💡 formula we are using to calculate your protein needs:
    <br>Fat loss → 2g × body weight
    <br>Maintain → 1.6g × body weight
    <br>Gain → 1.8g × body weight
  </div>
`;
}


/* INIT */
document.addEventListener("DOMContentLoaded", () => {

  // Diet page
  if (document.getElementById("generateBtn")) {
    initDiet();
  }

  // Calculator page
  if (document.getElementById("calcForm")) {
    initCalculator();
  }

  // Workout tabs
  const dayTabs = document.querySelectorAll(".day-tab");
  const workoutCards = document.querySelectorAll(".workout-card");

  if (dayTabs.length > 0) {
    dayTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        dayTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const selected = tab.dataset.day;

        workoutCards.forEach(card => {
          if (selected === "all" || card.dataset.day === selected) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

});