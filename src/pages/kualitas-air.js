export function kualitasAirPage()
{
    const kualitasAirHTML = `
    <div>Kualitas Air</div>
    <button id="kaBtn" title="click to change">KA</button>
    `;

    return kualitasAirHTML;
}

export function kualitasAirEvents()
{
    const kaBtn = document.getElementById('kaBtn');
    kaBtn.addEventListener('click', () => {
        kaBtn.innerText = 'Kualitas Air';
    });
}