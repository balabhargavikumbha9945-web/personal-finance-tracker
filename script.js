const form = document.getElementById("transaction-form");

const message = document.getElementById("message");

// Set today's date automatically
document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

// Load transactions from Python backend
async function loadTransactions() {

    try {
        const response = await fetch("/transactions");
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load transactions");
        }

        // Update dashboard
        document.getElementById("income").innerText =
            "₹" + Number(data.income).toFixed(2);

        document.getElementById("expenses").innerText =
            "₹" + Number(data.expenses).toFixed(2);

        document.getElementById("balance").innerText =
            "₹" + Number(data.balance).toFixed(2);

        // Display transaction history
        const list = document.getElementById("transaction-list");

        list.innerHTML = "";

        if (data.transactions.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.innerText = "No transactions added yet.";

            row.appendChild(cell);
            list.appendChild(row);
            return;
        }

        data.transactions.forEach(transaction => {

            const row = document.createElement("tr");

            const values = [
                transaction.title,
                transaction.category,
                transaction.date,
                transaction.type,
                "₹" + Number(transaction.amount).toFixed(2)
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.innerText = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.innerText = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", () => {
                deleteTransaction(transaction.id);
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            list.appendChild(row);
        });

    } catch (error) {
        message.innerText = error.message;
    }
}

// Add new transaction
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const transaction = {
        title: document.getElementById("title").value.trim(),
        amount: document.getElementById("amount").value,
        category: document.getElementById("category").value,
        type: document.getElementById("type").value,
        date: document.getElementById("date").value
    };

    try {

        const response = await fetch("/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to add transaction");
        }

        message.innerText = data.message;
        message.style.color = "green";

        form.reset();

        document.getElementById("date").value =
            new Date().toISOString().split("T")[0];

        await loadTransactions();

    } catch (error) {
        message.innerText = error.message;
        message.style.color = "red";
    }
});

// Delete transaction
async function deleteTransaction(id) {

    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    try {

        const response = await fetch(`/delete/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to delete transaction");
        }

        message.innerText = data.message;
        message.style.color = "green";

        await loadTransactions();

    } catch (error) {
        message.innerText = error.message;
        message.style.color = "red";
    }
}

// Load data when website opens
loadTransactions();
