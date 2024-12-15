// Set up dimensions for the plot and canvas
const width = 800;
const height = 600;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

// Create an SVG element in the body of the HTML
const svg = d3.select("#finalChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "#f4f4f4");  // Background color for visibility

// Add the World Series logo image to the top-right corner
svg.append("image")
    .attr("x", width - 100)  // Position the image 120px from the right edge
    .attr("y", 20)  // Position the image 20px from the top edge
    .attr("width", 100)  // Adjust the width of the logo
    .attr("height", 100)  // Adjust the height of the logo
    .attr("xlink:href", "WSlogo.png");  // The path to the logo image

// Add a group to handle margins and apply zoom to this group
const zoomGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    
// Create scales for the axes
const xScale = d3.scaleLinear()
    .domain([-2, 2])  // Strike zone x-axis range
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([1, 4.0])  // Strike zone y-axis range
    .range([height, 0]);

// Create groups for axes
const xAxisGroup = zoomGroup.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "hidden");  // Add a class for hiding the x-axis

const yAxisGroup = zoomGroup.append("g")
    .attr("class", "hidden");  // Add a class for hiding the y-axis

// Add the x-axis and y-axis to the groups
xAxisGroup.call(d3.axisBottom(xScale));
yAxisGroup.call(d3.axisLeft(yScale));


// Define the dimensions of the home plate
    const homePlateWidth = 0.83;  // Home plate width to match strike zone width
    const homePlateDepth = 0.5;   // Depth of the home plate shape
    const plateY = .4;            // Y-coordinate for home plate, slightly below strike zone

    // Set a custom adjustment for each bottom corner if needed
    const adjustmentValueLeft = 0.1;   // Adjust this value as needed
    const adjustmentValueRight = 0.1; // Adjust this value as needed

    // Define the vertices with specific adjustments for the bottom corners only
    const homePlateVertices = [
        [xScale(-homePlateWidth), yScale(plateY - adjustmentValueLeft)], 
        [xScale(homePlateWidth), yScale(plateY - adjustmentValueRight)], 
        [xScale(homePlateWidth), yScale(plateY - homePlateDepth)],    
        [xScale(0), yScale(plateY - homePlateDepth * 1.5)],
        [xScale(-homePlateWidth), yScale(plateY - homePlateDepth)]//,    
        //
    ];

    // Draw the home plate using a polygon
    zoomGroup.append("polygon")
        .attr("points", homePlateVertices.map(d => d.join(",")).join(" "))
        .attr("fill", "white")    // Fill color for home plate
        .attr("stroke", "black")  // Outline color
        .attr("stroke-width", 2); // Outline thickness

// Load the pitch data from the CSV file
let pitchData = [];
d3.csv("filtered_pitch_data.csv").then(function(data) {
    console.log(data); // Check if data loads correctly

    // Store the pitch data for future filtering
    pitchData = data;

    // Convert is_strike to integers (0 or 1) if necessary
    data.forEach(d => d.is_strike = +d.is_strike);

    // Draw axes
    xAxisGroup.call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));

    // Create a group for the points
    const pointsGroup = zoomGroup.append("g");

    // Draw the points initially for all pitches (this will be updated when filtering)
    updatePitchVisualization(data);

    // Draw the strike zone rectangle
    zoomGroup.append("rect")
        .attr("x", xScale(-0.83))              // Left side x-coordinate
        .attr("y", yScale(3.5))                // Top side y-coordinate
        .attr("width", xScale(0.83) - xScale(-0.83))  // Width based on scale
        .attr("height", yScale(1.5) - yScale(3.5))    // Height based on scale
        .attr("fill", "none")                  // Transparent fill
        .attr("stroke", "black")               // Outline color
        .attr("stroke-width", 2);              // Thickness of the outline

    

// Initial setup: Add a placeholder batter image (or a default image)
let batterImage = zoomGroup.append("image")
    .attr("xlink:href", "batter.png")   // Path to the default batter image
    .attr("x", xScale(-5.5))             // Position X
    .attr("y", yScale(6))                // Position Y
    .attr("width", 1250)                 // Set width
    .attr("height", 1250)               // Set height
    .attr("opacity", 0.0)                           // Set opacity to 60% for a more faded look


// Function to filter pitches based on the team
function filterPitchesByTeam(teamCode) {
    console.log("filterPitchesByTeam function is defined");


        // Filter the pitch data by the selected team
        const filteredData = pitchData.filter(d => d.pitcher_team === teamCode);
    
        // Log the filtered data to check if it contains any pitches
        console.log(`Filtered data for ${teamCode}:`, filteredData);
    
        // Check if filteredData is empty and log a message if it is
        if (filteredData.length === 0) {
            console.log(`No data found for team: ${teamCode}`);
        }
    
        // Pass the filtered data to the visualization update function
        updatePitchVisualization(filteredData);
    }
    

    // Function to update the pitch visualization (draw the points)
    function updatePitchVisualization(data) {
        // Remove existing points
        pointsGroup.selectAll("circle").remove();

        // Redraw the points based on the filtered data
        pointsGroup.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => xScale(d.plate_x))
            .attr("cy", d => yScale(d.plate_z))
            .attr("r", 20)  // Radius of the point
            .attr("opacity", 0.4)  // Set opacity
            .attr("fill", d => d.is_strike === 1 ? "red" : "blue");
    }

    // Call the function to add buttons
    addTeamButtons();

    // Add the zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.2, 5])  // Adjusted for broader zoom-out and zoom-in
        .on("zoom", (event) => {
            // Apply transformations to the zoomGroup, points, and axes
            zoomGroup.attr("transform", event.transform);

            // Rescale axes dynamically
            const newXScale = event.transform.rescaleX(xScale);
            const newYScale = event.transform.rescaleY(yScale);
            xAxisGroup.call(d3.axisBottom(newXScale));
            yAxisGroup.call(d3.axisLeft(newYScale));
        });

    // Apply zoom to the SVG and set an initial centered zoom level
    const initialScale = 0.4;  // Initial zoom level
    const centerX = (width + margin.left + margin.right) / 3.25;
    const centerY = (height + margin.top + margin.bottom) / 3.25;

    svg.call(zoom)
       .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(initialScale));


       
// Add buttons to the top right corner
function addTeamButtons() {
    const buttonContainer = d3.select("#finalChart").append("div")
    .attr("id","buttonContainer")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")  // Adjust right margin
        .style("display", "flex")
        .style("flex-direction", "column")  // Stack buttons vertically
        .style("gap", "10px");  // Space between buttons


        
// Dodgers Button
buttonContainer.append("button")
    .text("Total Dodgers Pitches (Games 1-5)")
    .style("padding", "10px 30px")  // More horizontal padding for a longer button
    .style("background-color", "#005A9C")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "5px")
    .style("font-size", "16px")  // Adjust the font size to ensure it fits in the button
    .style("white-space", "nowrap")  // Prevent text from wrapping onto a new line
    .style("width", "auto")  // Let the width adjust automatically based on the text
    .style("min-width", "300px")  // Set a minimum width to prevent the button from being too small
    .style("cursor", "pointer")
    .on("click", () => {
        console.log("Dodgers button clicked");
        filterPitchesByTeam("LAD");  // "LAD" is the code for Dodgers
         // Change the batter image to the Dodgers image
         batterImage.attr("xlink:href", "YankeesBatter.png")  // Update image to Dodgers batter
         .attr("x", xScale(-5.7))             // Position X
         .attr("y", yScale(6.75))                // Position Y
         .attr("width", 1500)                 // Set width
         .attr("height", 1500)              // Set height
         .attr("opacity", 0.90);                            // Set opacity to 90% for a more faded look

        // Highlight strikes outside the strike zone and balls inside the strike zone to show inaccuracies
        d3.selectAll("circle")
            .each(function(d) {
                const isStrikeOutsideZone = d.call === "Strike" && !d.inZone;  // Red strikes outside the zone
                const isBallInsideZone = d.call === "Ball" && d.inZone;        // Blue balls inside the zone

                if (isStrikeOutsideZone) {
                    d3.select(this)
                        .attr("fill", "purple")  // Highlight in purple
                        .attr("stroke", "black")  // Optional: Add a stroke for clarity
                        .attr("stroke-width", 1.5);
                } else if (isBallInsideZone) {
                    d3.select(this)
                        .attr("fill", "orange")  // Highlight in orange
                        .attr("stroke", "black")  // Optional: Add a stroke for clarity
                        .attr("stroke-width", 1.5);
                } else {
                    d3.select(this)
                        .attr("opacity", 0.3);  // Dim other pitches for better contrast
                }
            });
    });


// Yankees Button 1C3E67
buttonContainer.append("button")
    .text("Total Yankees Pitches (Games 1-5)")
    .style("padding", "10px 30px")  // More horizontal padding for a longer button
    .style("background-color", "#1C3E67")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "5px")
    .style("font-size", "16px")  // Adjust the font size to ensure it fits in the button
    .style("white-space", "nowrap")  // Prevent text from wrapping onto a new line
    .style("width", "auto")  // Let the width adjust automatically based on the text
    .style("min-width", "300px")  // Set a minimum width to prevent the button from being too small
    .style("cursor", "pointer")
    .on("click", () => {
        console.log("Yankees button clicked");

        // Filter pitches for the Yankees team
        filterPitchesByTeam("NYY");

        // Update the batter image to the Dodgers image
        batterImage.attr("xlink:href", "DodgersBatter.png")  // Update image to Dodgers batter
            .attr("x", xScale(-5.7))             // Position X
            .attr("y", yScale(6.75))             // Position Y
            .attr("width", 1500)                 // Set width
            .attr("height", 1500)                // Set height
            .attr("opacity", 0.90);              // Set opacity to 60% for a more faded look

        // Highlight strikes outside the strike zone and balls inside the strike zone to show inaccuracies
        d3.selectAll("circle")
            .each(function(d) {
                const isStrikeOutsideZone = d.call === "Strike" && !d.inZone;  // Red strikes outside the zone
                const isBallInsideZone = d.call === "Ball" && d.inZone;        // Blue balls inside the zone

                if (isStrikeOutsideZone) {
                    d3.select(this)
                        .attr("fill", "purple")  // Highlight in purple
                        .attr("stroke", "black")  // Optional: Add a stroke for clarity
                        .attr("stroke-width", 1.5);
                } else if (isBallInsideZone) {
                    d3.select(this)
                        .attr("fill", "orange")  // Highlight in orange
                        .attr("stroke", "black")  // Optional: Add a stroke for clarity
                        .attr("stroke-width", 1.5);
                } else {
                    d3.select(this)
                        .attr("opacity", 0.3);  // Dim other pitches for better contrast
                }
            });
    });
}

// Create the dropdown container for selecting games
const dropdownContainer = document.createElement('div');
dropdownContainer.id = 'gameDropdownContainer';

// Create the select element
const dropdown = document.createElement('select');
dropdown.id = 'gameDropdown';

// Create the default option (Select Game)
const defaultOption = document.createElement('option');
defaultOption.value = '';  // Empty value for default
defaultOption.textContent = 'Select Game';
dropdown.appendChild(defaultOption);

// Create and append the options for Game 1 to Game 5
for (let i = 1; i <= 5; i++) {
    const option = document.createElement('option');
    option.value = `Game ${i}`;
    option.textContent = `Game ${i}`;
    dropdown.appendChild(option);
}

// Append the dropdown to the container
dropdownContainer.appendChild(dropdown);

// Append the container to the body of the document
document.body.appendChild(dropdownContainer);

// CSS styles to position the dropdown
const style = document.createElement('style');
style.textContent = `
    #gameDropdownContainer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }
    #gameDropdown {
        padding: 10px;
        font-size: 16px;
    }
`;
document.head.appendChild(style);

// Function to filter pitches based on the game number
function filterPitchesByGame(gameNum) {
    console.log("filterPitchesByGame function is defined");

    // Filter the pitch data by the selected game number
    const filteredData = pitchData.filter(d => d.game_num === gameNum);

    // Log the filtered data to check if it contains any pitches
    console.log(`Filtered data for ${gameNum}:`, filteredData);

    // Pass the filtered data to the visualization update function
    updatePitchVisualization(filteredData);
}

// Event listener for game selection from the dropdown
dropdown.addEventListener('change', function () {
    const selectedGame = dropdown.value;

    // If the selected value is not empty, filter by the selected game number
    if (selectedGame) {
        const gameNum = selectedGame.split(' ')[1];  // Extract game number (e.g., "1" from "Game 1")
        filterPitchesByGame(gameNum);
    }
});

// Function to update the pitch visualization (draw the points)
function updatePitchVisualization(data) {
    // Remove existing points
    pointsGroup.selectAll("circle").remove();

    // Redraw the points based on the filtered data
    pointsGroup.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.plate_x))
        .attr("cy", d => yScale(d.plate_z))
        .attr("r", 20)  // Radius of the point
        .attr("opacity", 0.4)  // Set opacity
        .attr("fill", d => d.is_strike === 1 ? "red" : "blue");
}

});
