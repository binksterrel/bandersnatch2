document.addEventListener("DOMContentLoaded", function() {
  // Hide the game interface initially
  document.getElementById("game-interface").style.display = "none";

  // Handle user login
  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Login form submitted");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email && password) {
      alert("Connexion réussie !");
      // Hide the login screen
      document.getElementById("login").style.display = "none";
      // Show the game interface only after adventure creation
    } else {
      alert("Veuillez entrer un email et un mot de passe valides.");
    }
  });

  // Handle guest entry
  document.getElementById("guest-button").addEventListener("click", function () {
    console.log("'Jouer en tant qu'invité' button clicked");
    document.getElementById("login").style.display = "none"; // Hide the login screen
    // The game interface remains hidden until "Créer mon aventure"
    document.getElementById('create-adventure-interface').style.display = 'block'; // Show adventure creation
  });

  // Display the "About" section and scroll
  document.getElementById("about-link").addEventListener("click", function (e) {
    e.preventDefault();
    console.log("'À propos' link clicked");

    const aboutSection = document.getElementById("about");
    aboutSection.style.display = "block"; // Show the "About" section

    aboutSection.scrollIntoView({ behavior: "smooth" }); // Scroll to the "About" section
  });

  // Hide the "About" section
  document.getElementById("close-about").addEventListener("click", function () {
    console.log("'Fermer' button of the 'À propos' section clicked");
    document.getElementById("about").style.display = "none"; // Hide the "About" section
  });

  // Display the "Contact" section with scrolling to the section
  document.getElementById("contact-link").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent the default behavior of the link
    console.log("'Contact' link clicked");
    const contactSection = document.getElementById("contact");

    contactSection.style.display = "block"; // Show the "Contact" section

    // Scroll the page to the "Contact" section
    contactSection.scrollIntoView({ behavior: "smooth" });
  });

  // Close the "Contact" section
  document.getElementById("close-contact").addEventListener("click", function () {
    console.log("'Fermer' button of the 'Contact' section clicked");
    document.getElementById("contact").style.display = "none"; // Hide the "Contact" section
  });

  // Display the adventure creation interface and simulate loading
  document.getElementById("generate-story").addEventListener("click", function () {
    const theme = document.getElementById("story-theme").value;
    console.log("'Créer mon aventure' button clicked with theme:", theme);
    if (theme) {
      // Hide the game interface and show the loading screen
      document.getElementById("game-interface").style.display = "none";
      document.getElementById("loading-screen").style.display = "flex"; // Use flex for centering

      // Send an AJAX request to generate the story
      fetch("/generate_story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ theme: theme })
      })
      .then(response => response.json())
      .then(data => {
        // Hide the loading screen and show the game interface
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("game-interface").style.display = "block";
        document.getElementById("story-container").style.display = "block"; // Show the story container

        // Display the generated synopsis
        const storyText = document.getElementById("current-story");
        const storyContent = data.story;

        // Extract and format the choices
        const choicesMatch = storyContent.match(/Choix 1:(.*) Choix 2:(.*) Choix 3:(.*)/s);
        let formattedStory = storyContent;

        if (choicesMatch) {
          const choices = [
            choicesMatch[1].trim(),
            choicesMatch[2].trim(),
            choicesMatch[3].trim()
          ];

          // Replace the choices in the text with line breaks
          formattedStory = formattedStory.replace(/Choix 1:(.*) Choix 2:(.*) Choix 3:(.*)/s, `\n\nChoix 1: ${choices[0]}\n\nChoix 2: ${choices[1]}\n\nChoix 3: ${choices[2]}`);
        }

        storyText.innerHTML = formattedStory.replace(/\n/g, '<br>');

        // Create choice options
        const choicesContainer = document.getElementById("choices");
        choicesContainer.innerHTML = `
          <button onclick="chooseOption('${choices[0]}')">Choix 1</button>
          <button onclick="chooseOption('${choices[1]}')">Choix 2</button>
          <button onclick="chooseOption('${choices[2]}')">Choix 3</button>
        `;
      })
      .catch(error => {
        console.error("Error generating the story:", error);
        alert("Erreur lors de la génération de l'histoire. Veuillez réessayer.");
        // Hide the loading screen
        document.getElementById("loading-screen").style.display = "none";
      });
    } else {
      alert("Veuillez entrer un thème pour commencer.");
    }
  });

  // Handle user choices
  window.chooseOption = function(choice) {
    // Hide the choice buttons after making a choice
    document.getElementById("choices").style.display = "none";

    // Get the current story
    const currentStory = document.getElementById("current-story").innerHTML.replace(/<br>/g, '\n');

    // Move the current story to the previous story bubble
    document.getElementById("previous-story").innerHTML = currentStory.replace(/\n/g, '<br>');

    // Send an AJAX request to continue the story based on the choice
    fetch("/continue_story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ choice: choice, current_story: currentStory })
    })
    .then(response => response.json())
    .then(data => {
      // Display the continuation of the story
      const storyText = document.getElementById("current-story");
      const storyContent = data.story;

      // Extract and format the choices
      const choicesMatch = storyContent.match(/Choix 1:(.*) Choix 2:(.*) Choix 3:(.*)/s);
      let formattedStory = storyContent;

      if (choicesMatch) {
        const choices = [
          choicesMatch[1].trim(),
          choicesMatch[2].trim(),
          choicesMatch[3].trim()
        ];

        // Replace the choices in the text with line breaks
        formattedStory = formattedStory.replace(/Choix 1:(.*) Choix 2:(.*) Choix 3:(.*)/s, `\n\nChoix 1: ${choices[0]}\n\nChoix 2: ${choices[1]}\n\nChoix 3: ${choices[2]}`);
      }

      storyText.innerHTML = formattedStory.replace(/\n/g, '<br>');

      // Create choice options
      const choicesContainer = document.getElementById("choices");
      choicesContainer.innerHTML = `
        <button onclick="chooseOption('${choices[0]}')">Choix 1</button>
        <button onclick="chooseOption('${choices[1]}')">Choix 2</button>
        <button onclick="chooseOption('${choices[2]}')">Choix 3</button>
      `;
      // Show the choice buttons
      choicesContainer.style.display = "flex";
    })
    .catch(error => {
      console.error("Error generating the story continuation:", error);
      alert("Erreur lors de la génération de la suite de l'histoire. Veuillez réessayer.");
    });
  };
});
