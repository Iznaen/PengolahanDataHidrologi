export function dashboardPage()
{
    const dashboardHTML = `
    <div>Dashboard</div>
    <button id="dbBtn" title="click to change">DB</button>
    `;

    return dashboardHTML;
}

export function dashboardEvents()
{
    const dbBtn = document.getElementById('dbBtn');
    dbBtn.addEventListener('click', () => {
        dbBtn.innerText = 'You clicked this button';
    });
}