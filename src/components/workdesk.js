// ------------------------------------------------------------
// workdesk.js DISPLAY CONTENT AND HANDLE EVENTS WITHIN WORKDESK
// ------------------------------------------------------------


// display and handle events from ./pages/*.js to sidebar.js
// @param {function} renderPage() : accepts HTML strings
// @param {function} handlePageEvents() : is an event handler
// for the page e.g: handle button clicks.
export function initPage(renderPage, handlePageEvents)
{
    // 1. get workdesk element/tag from index.html
    let workDesk = document.getElementById('workDesk');
    
    // 2. reset the previous content from workdesk
    workDesk.innerHTML = ``;

    // 3. render the HTML strings from the new page here
    const newPage = renderPage();
    
    // 4. pass the new page to display inside workdesk
    workDesk.innerHTML = newPage;

    // 5. handle events from the new page here e.g (buttons)
    if (handlePageEvents && typeof handlePageEvents === 'function')
    {
        handlePageEvents();
    }
    else
    {
        console.log("page events are not detected");
    }
}