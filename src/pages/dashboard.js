export function dashboardPage()
{
    const dashboard = document.getElementById('workDesk');
    let dashboardHTML = ``;

    dashboardHTML = `
    <div>Dashboard</div>
    <button id="dbBtn" title="click to change">DB</button>
    `;

    return dashboard.innerHTML = dashboardHTML;
}

export function dashboardEvents()
{
    const dbBtn = document.getElementById('dbBtn');
    dbBtn.addEventListener('click', () => {
        dbBtn.innerText = 'You clicked this button';
    });
}