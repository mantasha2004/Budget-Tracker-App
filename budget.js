// === Transaction Class ===
    class Transaction {
      constructor(title, amount, type) {
        this.id = Date.now();
        this.title = title;
        this.amount = Number(amount);
        this.type = type;
        this.timestamp = new Date().toLocaleString();
      }
    }

    // === Manager Class ===
    class TransactionManager {
      constructor() {
        this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
      }

      add(txn) {
        this.transactions.push(txn);
        this.save();
      }

      delete(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();
      }

      clear() {
        this.transactions = [];
        this.save();
      }

      save() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
      }

      getTotals() {
        let income = 0, expense = 0;
        this.transactions.forEach(t => {
          if (t.type === "Income") income += t.amount;
          else expense += t.amount;
        });
        return { income, expense, balance: income - expense };
      }
    }

    // === App Logic ===
    const manager = new TransactionManager();
    const txnForm = document.getElementById("txnForm");
    const titleInput = document.getElementById("title");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const txnTable = document.getElementById("txnTable");
    const totalIncomeEl = document.getElementById("totalIncome");
    const totalExpenseEl = document.getElementById("totalExpense");
    const netBalanceEl = document.getElementById("netBalance");
    const filterType = document.getElementById("filterType");
    const clearAllBtn = document.getElementById("clearAll");
    const themeToggle = document.getElementById("themeToggle");
    let pieChart, barChart;

    // Render Summary + List
    function render() {
      const { income, expense, balance } = manager.getTotals();
      totalIncomeEl.textContent = "₹" + income;
      totalExpenseEl.textContent = "₹" + expense;
      netBalanceEl.textContent = "₹" + balance;

      txnTable.innerHTML = "";
      let filtered = manager.transactions;
      if (filterType.value !== "All") {
        filtered = filtered.filter(t => t.type === filterType.value);
      }

      filtered.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.timestamp}</td>
          <td>${t.title}</td>
          <td>Rs${t.amount}</td>
          <td>${t.type}</td>
          <td><button onclick="deleteTxn(${t.id})">❌</button></td>
        `;
        txnTable.appendChild(row);
      });

      renderCharts(income, expense);
    }

    function renderCharts(income, expense) {
      // === Pie Chart ===
      if (pieChart) pieChart.destroy();
      const pieCtx = document.getElementById("pieChart").getContext("2d");
      pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: ["Income", "Expense"],
          datasets: [{
            data: [income, expense],
            backgroundColor: ["#28a745", "#dc3545"]
          }]
        }
      });

      // === Bar Chart (with %) ===
      if (barChart) barChart.destroy();
      const barCtx = document.getElementById("barChart").getContext("2d");
      const total = income + expense;
      const incomePct = total ? ((income / total) * 100).toFixed(2) : 0;
      const expensePct = total ? ((expense / total) * 100).toFixed(2) : 0;

      barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["Income", "Expense"],
          datasets: [{
            label: "Percentage (%)",
            data: [incomePct, expensePct],
            backgroundColor: ["#28a745", "#dc3545"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.raw + "%";
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + "%";
                }
              }
            }
          }
        }
      });
    }

    // Add Transaction
    txnForm.addEventListener("submit", e => {
      e.preventDefault();
      const txn = new Transaction(titleInput.value, amountInput.value, typeInput.value);
      manager.add(txn);
      txnForm.reset();
      render();
    });

    // Delete Transaction
    function deleteTxn(id) {
      manager.delete(id);
      render();
    }

    // Clear All
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Clear all transactions?")) {
        manager.clear();
        render();
      }
    });

    // Filter
    filterType.addEventListener("change", render);

    // === Dark Mode ===
    function applyTheme(isDark) {
      if (isDark) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
      } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "🌙 Dark Mode";
      }
      localStorage.setItem("darkMode", isDark);
    }

    themeToggle.addEventListener("click", () => {
      const isDark = !document.body.classList.contains("dark-mode");
      applyTheme(isDark);
    });

    // Load theme from storage
    const savedTheme = JSON.parse(localStorage.getItem("darkMode"));
    applyTheme(savedTheme);

    // Initial Render
    render();
 