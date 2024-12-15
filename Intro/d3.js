document.addEventListener('DOMContentLoaded', function () {
    // Logo and Introductory Modal Elements
    const introModal = document.getElementById('introModal');
    const getStartedButton = document.getElementById('getStartedButton');
    const mainContent = document.getElementById('mainContent');

    // Styling for the Logo Container
    const logoContainer = document.getElementById('logoContainer');
    if (logoContainer) {
        logoContainer.style.position = 'fixed';
        logoContainer.style.top = '5px';  // Adjusted to move higher on the page
        logoContainer.style.left = '20px';
        logoContainer.style.zIndex = '1100';
        logoContainer.style.paddingBottom = '20px'; // Added padding to ensure separation from other elements
    }

    // Styling for the Subtitle
    const subtitle = document.getElementById('subtitle');
    if (subtitle) {
        subtitle.style.fontSize = '1.5em';
        subtitle.style.marginTop = '0';
        subtitle.style.paddingTop = '5px'; // Added padding for additional space from the title
    }

    // Ensure Intro Modal is Displayed Initially
    if (introModal) {
        introModal.style.display = 'flex';
    }

    // Event Listener for "Get Started!" Button
    if (getStartedButton) {
        getStartedButton.addEventListener('click', function () {
            // Hide Intro Modal
            introModal.style.display = 'none';

            // Show Main Content
            if (mainContent) {
                mainContent.style.display = 'block';
            }
        });
    }

    // Styling for Introductory Modal
    if (introModal) {
        introModal.style.display = 'flex';
        introModal.style.justifyContent = 'center';
        introModal.style.alignItems = 'center';
        introModal.style.position = 'fixed';
        introModal.style.top = '0';
        introModal.style.left = '0';
        introModal.style.width = '100%';
        introModal.style.height = '100%';
        introModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        introModal.style.zIndex = '1000';
    }

    // Styling for Modal Content
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
        contentWrapper.style.textAlign = 'center';
        contentWrapper.style.backgroundColor = 'white';
        contentWrapper.style.padding = '20px';
        contentWrapper.style.borderRadius = '10px';
    }

    // Styling the Get Started Button
    if (getStartedButton) {
        getStartedButton.style.marginTop = '20px';
        getStartedButton.style.padding = '10px 20px';
        getStartedButton.style.fontSize = '16px';
        getStartedButton.style.cursor = 'pointer';
    }

    // Introductory Modal Image Sequence Logic
    window.onload = function () {
        const modal = document.getElementById("introModal");
        const introImage = document.getElementById("introImage");
        const introText = document.getElementById("introText");
        const getStartedButton = document.getElementById("getStartedButton");

        // List of image sources and their descriptions
        const images = ["images/1.png", "images/2.png", "images/3.png", "images/4.png", "images/5.png"];
        const descriptions = [
            "Welcome to In the Zone! This webtool will take a look at how we can visualize umpire’s judgements in baseball.",
            "In baseball, pitches that are thrown inside of the strike zone are called strikes, and pitches determined to be outside the zone are called balls.",
            "Three strikes means that the batter has struck out. Alternatively, four balls mean the batter can go to first base - this is called a walk.",
            "A standard strike zone is 17 inches wide and runs from below the batter's knees to their shoulders.",
            "It is the responsibility of the umpire in baseball to determine whether a pitch is a strike or a ball.",
        ];
        let currentImageIndex = 0;

        // Display the modal with the first image and its description
        modal.style.display = "flex";
        introText.textContent = descriptions[currentImageIndex];

        // Click event to proceed through images
        introImage.addEventListener("click", function () {
            currentImageIndex++;
            if (currentImageIndex < images.length) {
                // Update the image source
                introImage.src = images[currentImageIndex];

                // Update the text description
                introText.textContent = descriptions[currentImageIndex];

                // If this is the last image, show the "Get Started!" button
                if (currentImageIndex === images.length - 1) {
                    getStartedButton.classList.remove("hidden");
                }
            }
        });

        // Click event to close the modal and display the main content
        getStartedButton.addEventListener("click", function () {
            modal.style.display = "none"; // Hide the modal
            mainContent.style.display = "block"; // Show the main content
        });
    };

    // Set up dimensions for the plot and canvas
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    // Create an SVG element in the body of the HTML
    const svg = d3.select("#finalChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#f4f4f4");

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
        .attr("transform", `translate(0,${height})`);

    const yAxisGroup = zoomGroup.append("g");

    // Load the pitch data from the CSV file
    let pitchData = [];
    d3.csv("filtered_pitch_data.csv").then(function (data) {
        pitchData = data;
        data.forEach(d => d.is_strike = +d.is_strike);

        // Draw axes
        xAxisGroup.call(d3.axisBottom(xScale));
        yAxisGroup.call(d3.axisLeft(yScale));

        // Draw points
        const pointsGroup = zoomGroup.append("g");
        updatePitchVisualization(data);

        // Function to filter pitches based on team
        function filterPitchesByTeam(teamCode) {
            const filteredData = pitchData.filter(d => d.pitcher_team === teamCode);
            updatePitchVisualization(filteredData);
        }

        function updatePitchVisualization(data) {
            pointsGroup.selectAll("circle").remove();
            pointsGroup.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", d => xScale(d.plate_x))
                .attr("cy", d => yScale(d.plate_z))
                .attr("r", 20)
                .attr("opacity", 0.4)
                .attr("fill", d => d.is_strike === 1 ? "red" : "blue");
        }

        addTeamButtons();

        const zoom = d3.zoom()
            .scaleExtent([0.2, 5])
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform);
                const newXScale = event.transform.rescaleX(xScale);
                const newYScale = event.transform.rescaleY(yScale);
                xAxisGroup.call(d3.axisBottom(newXScale));
                yAxisGroup.call(d3.axisLeft(newYScale));
            });

        svg.call(zoom)
            .call(zoom.transform, d3.zoomIdentity.translate(width / 3.25, height / 3.25).scale(0.4));

        function addTeamButtons() {
            const buttonContainer = d3.select("#finalChart").append("div")
                .attr("id", "buttonContainer")
                .style("position", "absolute")
                .style("top", "10px")
                .style("right", "10px")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "10px");

            buttonContainer.append("button")
                .text("Dodgers Pitches")
                .on("click", () => filterPitchesByTeam("LAD"));

            buttonContainer.append("button")
                .text("Yankees Pitches")
                .on("click", () => filterPitchesByTeam("NYY"));
        }
    });
});
