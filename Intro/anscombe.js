window.onload = function () {
    const modal = document.getElementById("introModal");
    const introImage = document.getElementById("introImage");
    const introText = document.getElementById("introText");  // New element for text
    const getStartedButton = document.getElementById("getStartedButton");
    const mainContent = document.getElementById("mainContent");

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
