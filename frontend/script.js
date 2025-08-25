document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://127.0.0.1:8000';

    // DOM Elements
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    const logoutBtn = document.getElementById('logoutBtn');
    const authForm = document.getElementById('authForm');
    const authUsernameInput = document.getElementById('authUsername');
    const authPasswordInput = document.getElementById('authPassword');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const authMessage = document.getElementById('authMessage');

    const balanceAmountSpan = document.getElementById('balanceAmount');
    const refreshBalanceBtn = document.getElementById('refreshBalanceBtn');
    const transferForm = document.getElementById('transferForm');
    const transferToUserInput = document.getElementById('transferToUser');
    const transferAmountInput = document.getElementById('transferAmount');
    const transferMessage = document.getElementById('transferMessage');
    const refreshTransactionsBtn = document.getElementById('refreshTransactionsBtn');
    const transactionListUl = document.getElementById('transactionList');

    let token = localStorage.getItem('token');

    // Helper function to show/hide sections
    const updateUI = () => {
        if (token) {
            authSection.style.display = 'none';
            appSection.style.display = 'flex';
            logoutBtn.style.display = 'block';
            fetchBalance();
            fetchTransactions();
        } else {
            authSection.style.display = 'block';
            appSection.style.display = 'none';
            logoutBtn.style.display = 'none';
            authMessage.textContent = '';
        }
    };

    // Helper function to display messages
    const displayMessage = (element, text, isSuccess) => {
        element.textContent = text;
        if (isSuccess) {
            element.style.backgroundColor = '#c8e6c9';
            element.style.color = '#2e7d32';
        } else {
            element.style.backgroundColor = '#ffe0b2';
            element.style.color = '#e65100';
        }
    };

    // API Calls
    const callApi = async (endpoint, method, body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        
        let url = `${BASE_URL}${endpoint}`;
        
        // Correctly handle token for all requests that require it
        if (token) {
            // Append token as a query parameter for GET and the transfer POST endpoint
            url = `${url}?token=${token}`;
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An unknown error occurred');
            }

            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.error('API Error:', error);
            return { error: error.message };
        }
    };

    const handleAuthResponse = (data) => {
        if (data.error) {
            displayMessage(authMessage, `Error: ${data.error}`, false);
        } else {
            displayMessage(authMessage, data.message || 'Login successful!', true);
            if (data.token) {
                token = data.token;
                localStorage.setItem('token', token);
                updateUI();
            }
        }
    };

    const fetchBalance = async () => {
        const data = await callApi('/balance', 'GET');
        if (data.error) {
            balanceAmountSpan.textContent = `Error: ${data.error}`;
        } else {
            balanceAmountSpan.textContent = `$${data.balance.toFixed(2)}`;
        }
    };

    const fetchTransactions = async () => {
        const data = await callApi('/transactions', 'GET');
        transactionListUl.innerHTML = '';
        if (data.error) {
            const li = document.createElement('li');
            li.textContent = `Error: ${data.error}`;
            transactionListUl.appendChild(li);
        } else {
            if (data.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No transactions found.';
                transactionListUl.appendChild(li);
            } else {
                data.forEach(tx => {
                    const li = document.createElement('li');
                    const amountSpan = document.createElement('span');
                    amountSpan.textContent = `$${tx.amount.toFixed(2)}`;

                    if (tx.type === 'debit') {
                        li.innerHTML = `<span>Sent to **${tx.to_user}**</span>`;
                        amountSpan.className = 'debit';
                    } else if (tx.type === 'credit') {
                        li.innerHTML = `<span>Received from **${tx.from_user}**</span>`;
                        amountSpan.className = 'credit';
                    }

                    li.appendChild(amountSpan);
                    transactionListUl.appendChild(li);
                });
            }
        }
    };

    // Event Handlers
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = authUsernameInput.value;
        const password = authPasswordInput.value;
        const data = await callApi('/login', 'POST', { username, password });
        handleAuthResponse(data);
    });

    registerBtn.addEventListener('click', async () => {
        const username = authUsernameInput.value;
        const password = authPasswordInput.value;
        if (!username || !password) {
            displayMessage(authMessage, 'Please enter both username and password.', false);
            return;
        }
        const data = await callApi('/register', 'POST', { username, password });
        handleAuthResponse(data);
    });

    logoutBtn.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('token');
        updateUI();
    });

    refreshBalanceBtn.addEventListener('click', fetchBalance);
    refreshTransactionsBtn.addEventListener('click', fetchTransactions);

    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const to_user = transferToUserInput.value;
        const amount = parseFloat(transferAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            displayMessage(transferMessage, 'Please enter a valid amount.', false);
            return;
        }

        const data = await callApi('/transfer', 'POST', { to_user, amount });
        if (data.error) {
            displayMessage(transferMessage, `Error: ${data.error}`, false);
        } else {
            displayMessage(transferMessage, 'Transfer successful!', true);
            transferForm.reset();
            fetchBalance();
            fetchTransactions();
        }
    });

    // Initial UI load
    updateUI();
});